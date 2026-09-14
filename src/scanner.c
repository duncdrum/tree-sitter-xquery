#include "tree_sitter/parser.h"
#include <stdbool.h>

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

// Consume characters as content, but only commit them (via mark_end) once
// we've confirmed they're not the start of the terminator. On seeing the
// terminator's first character we speculatively advance to check the rest;
// if it doesn't complete the terminator, mark_end catches up to include the
// speculative characters as content too. If it does, mark_end is left at
// the last confirmed position, so those characters are excluded and the
// terminator itself is left for the grammar's literal token to match.

// Scans string_constructor_chars: stops before "`{" (interpolation start)
// or "]``" (constructor end).
static bool scan_string_constructor_chars(TSLexer *lexer) {
  bool has_content = false;
  for (;;) {
    if (lexer->lookahead == 0) break;
    if (lexer->lookahead == '`') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '{') break; // genuine "`{" ahead, stop before it
      has_content = true;
      lexer->mark_end(lexer);
      continue;
    }
    if (lexer->lookahead == ']') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '`') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == '`') break; // genuine "]``" ahead, stop before it
        has_content = true;
        lexer->mark_end(lexer);
        continue;
      }
      has_content = true;
      lexer->mark_end(lexer);
      continue;
    }
    lexer->advance(lexer, false);
    has_content = true;
    lexer->mark_end(lexer);
  }
  if (!has_content) return false;
  lexer->result_symbol = STRING_CONSTRUCTOR_CHARS;
  return true;
}

// Scans direct PI content: stops before "?>".
static bool scan_pi_content(TSLexer *lexer) {
  bool has_content = false;
  for (;;) {
    if (lexer->lookahead == 0) break;
    if (lexer->lookahead == '?') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '>') break; // genuine "?>" ahead, stop before it
      has_content = true;
      lexer->mark_end(lexer);
      continue;
    }
    lexer->advance(lexer, false);
    has_content = true;
    lexer->mark_end(lexer);
  }
  if (!has_content) return false;
  lexer->result_symbol = PI_CONTENT;
  return true;
}

// Scans direct XML comment content: stops before "-->". Fixes the
// pre-existing bug where a lone "-" (e.g. "a-b") produced an ERROR because
// the old regex's alternatives all required a non-"-" first character.
static bool scan_direct_comment_content(TSLexer *lexer) {
  bool has_content = false;
  for (;;) {
    if (lexer->lookahead == 0) break;
    if (lexer->lookahead == '-') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '-') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == '>') break; // genuine "-->" ahead, stop before it
        has_content = true;
        lexer->mark_end(lexer);
        continue;
      }
      has_content = true;
      lexer->mark_end(lexer);
      continue;
    }
    lexer->advance(lexer, false);
    has_content = true;
    lexer->mark_end(lexer);
  }
  if (!has_content) return false;
  lexer->result_symbol = DIRECT_COMMENT_CONTENT;
  return true;
}

bool tree_sitter_xquery_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  if (valid_symbols[STRING_CONSTRUCTOR_CHARS] && scan_string_constructor_chars(lexer)) return true;
  if (valid_symbols[PI_CONTENT] && scan_pi_content(lexer)) return true;
  if (valid_symbols[DIRECT_COMMENT_CONTENT] && scan_direct_comment_content(lexer)) return true;
  return false;
}
