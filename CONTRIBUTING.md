Thank you for contributing
==========================

## Project Setup

The project consists of

 - `grammar.js`   the tree-sitter grammar for XQuery
 - `src/scanner.c`   external scanner for direct element/string-constructor mode switching
 - `test/corpus/`   tree-sitter's own corpus tests
 - `queries/`   `highlights.scm`, `outline.scm`, `indents.scm`, `brackets.scm`, `injections.scm`, `runnables.scm`, `tags.scm`, `textobjects.scm`
 - `examples/`   XQuery example files, used by `make parse`, `make test`, `make query` and `make hl`
 - `docs/`   the wasm playground, deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`
 - `_config/`   symlinked to `$HOME/.tree-sitter`, tree-sitter CLI's own config
 - `Makefile`   tree-sitter shortcut commands, parameterised by `.env`

The top-level `make` just invokes `tree-sitter generate`.

To change which files `make parse`, `make test`, `make query` and `make hl` act
on, edit `.env`: `TEST_SECTION` selects the corpus section under test, `EXAMPLE`
selects the example file.

## XQuery tree-sitter grammar

Useful background reading:

- [writing the grammar](http://tree-sitter.github.io/tree-sitter/creating-parsers#writing-the-grammar)
- [grammar development guide](https://github.com/github/semantic/blob/master/docs/grammar-development-guide.md)

## XQuery tree-sitter queries

Capture queries are written as S-expressions. `highlights.scm`, `outline.scm`,
`indents.scm`, `brackets.scm`, `injections.scm`, `runnables.scm`, `tags.scm` and
`textobjects.scm` are all in place; expect gaps and rough edges rather than
complete coverage, especially around error recovery on incomplete input (see
issue #23).

Beyond looking at how other grammars structure their queries, these are useful:

 * [pattern matching with queries](https://tree-sitter.github.io/tree-sitter/using-parsers#pattern-matching-with-queries)
 * [syntax highlighting queries](https://tree-sitter.github.io/tree-sitter/syntax-highlighting#queries)
 * [emacs syntax highlighting query guide](https://emacs-tree-sitter.github.io/syntax-highlighting/queries/)
 * [neovim treesitter contributing](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md)
 * [neovim treesitter text](https://github.com/nvim-treesitter/nvim-treesitter/blob/master/doc/nvim-treesitter.txt)

A query only captures if it resolves to a valid node in the grammar. CI checks
this on every push (the `grammar` job in `.github/workflows/ci.yml` runs every
`queries/*.scm` file against the whole spec corpus), but you can check locally
with the same command:

```sh
npx tree-sitter query -q queries/highlights.scm examples/spec/*.xq
```

`npm run test:queries` goes further and asserts on the actual captures against
fixtures in `test/queries/`.

## Known limitations/issues

### comments

Errors if `:` or `)` appears right before the closing comment delimiter:

```xquery

(: OK! (: xquery allows embedded comments :) :)
(:~
:  ok with doc-style comments
:
:)
(: but this will error ::)
```

There is no lookahead in tree-sitter grammars, so this may not be resolvable
without a C lexer, which is what other tree-sitter grammars fall back to for
similar cases.

### extra node in direct constructors

A stray node can appear inside direct element constructors under some inputs.
Not yet root-caused. If you hit this, please open an issue with a minimal
repro — the external scanner in `src/scanner.c` handles the mode-switching
here and is the most likely place the fix would land.

### regex edge cases

Not yet catalogued. If you find one, open an issue with the offending pattern.
