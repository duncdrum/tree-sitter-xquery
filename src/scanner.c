#include "tree_sitter/parser.h"
#include <stdbool.h>
#include <stddef.h>

// Terminator-boundary scanning for the three places grammar.js could not
// reliably express "text up to but not including a multi-character
// terminator" as a regex alternation without eating into the terminator
// itself when a candidate char run directly abuts it. See issue #3.
//
// None of these need cross-call state: which token is legal at the current
// parser position (valid_symbols) already tells us which mode we're in, and
// nesting is handled by the grammar's own recursive rules, not by us.

enum TokenType {
  STRING_CONSTRUCTOR_CHARS,
  PI_CONTENT,
  DIRECT_COMMENT_CONTENT,
};

void *tree_sitter_xquery_external_scanner_create(void) { return NULL; }
void tree_sitter_xquery_external_scanner_destroy(void *payload) {}
unsigned tree_sitter_xquery_external_scanner_serialize(void *payload, char *buffer) { return 0; }
void tree_sitter_xquery_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}

// Consumes characters as content up to (not including) the first
// occurrence of any terminator in `terminators` (a NULL-terminated array of
// 2-or-3-character NUL-terminated strings, one per lead character -- no two
// terminators here share a lead character, so matching on the lead alone is
// unambiguous).
//
// Characters are only committed (via mark_end) once confirmed not to be the
// start of a terminator: on seeing a terminator's lead character we
// speculatively advance to check the rest. If it doesn't complete the
// terminator, mark_end catches up to include the speculative characters as
// content too. If it does, mark_end is left at the last confirmed position,
// so those characters are excluded and the terminator itself is left for
// the grammar's literal token to match.
static bool scan_until(TSLexer *lexer, const char *const *terminators, enum TokenType token) {
  bool has_content = false;
  for (;;) {
    if (lexer->lookahead == 0) break;

    const char *term = NULL;
    for (int i = 0; terminators[i]; i++) {
      if (lexer->lookahead == (int32_t)(unsigned char)terminators[i][0]) {
        term = terminators[i];
        break;
      }
    }

    if (term == NULL) {
      lexer->advance(lexer, false);
      has_content = true;
      lexer->mark_end(lexer);
      continue;
    }

    lexer->advance(lexer, false); // past term[0], speculatively
    size_t i = 1;
    while (term[i] != '\0' && lexer->lookahead == (int32_t)(unsigned char)term[i]) {
      lexer->advance(lexer, false);
      i++;
    }
    if (term[i] == '\0') break; // full terminator matched, stop before it

    has_content = true;
    lexer->mark_end(lexer);
  }
  if (!has_content) return false;
  lexer->result_symbol = token;
  return true;
}

// string_constructor_chars stops before "`{" (interpolation start) or "]``"
// (constructor end).
static const char *const STRING_CONSTRUCTOR_TERMINATORS[] = {"`{", "]``", NULL};

// PI content stops before "?>".
static const char *const PI_TERMINATORS[] = {"?>", NULL};

// Direct XML comment content stops before "-->". This fixes a pre-existing
// bug where a lone "-" (e.g. "a-b") produced an ERROR, because the old
// regex's alternatives all required a non-"-" first character.
static const char *const DIRECT_COMMENT_TERMINATORS[] = {"-->", NULL};

bool tree_sitter_xquery_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  if (valid_symbols[STRING_CONSTRUCTOR_CHARS] &&
      scan_until(lexer, STRING_CONSTRUCTOR_TERMINATORS, STRING_CONSTRUCTOR_CHARS)) {
    return true;
  }
  if (valid_symbols[PI_CONTENT] && scan_until(lexer, PI_TERMINATORS, PI_CONTENT)) {
    return true;
  }
  if (valid_symbols[DIRECT_COMMENT_CONTENT] &&
      scan_until(lexer, DIRECT_COMMENT_TERMINATORS, DIRECT_COMMENT_CONTENT)) {
    return true;
  }
  return false;
}
