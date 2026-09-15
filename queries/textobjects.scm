; textobjects.scm — structural text objects (e.g. vim's `daf`/`dif`, `dac`/`dic`)
;
; @function.around / @function.inside select a whole function vs. just its
; body; @comment.around groups adjacent comments into one object. XQuery has
; no class-like construct, so no @class.* captures are defined here.

; XQuery comments nest - `comment: seq('(:', repeat1(choice($.comment, ...)),
; ':)')` in grammar.js makes a nested `(: ... :)` a direct child `comment`
; node of its enclosing one. Without the #not-has-parent? guard, a bare
; `(comment)+ @comment.around` matches both the whole outer comment AND,
; separately, each nested inner comment as its own smaller object - so
; selecting "around" a nested comment would grab only the inner fragment
; instead of the single comment the user actually sees. #not-has-parent? is
; a Zed query predicate (see e.g. tsx/textobjects.scm upstream), not part of
; core tree-sitter - generic tree-sitter tooling outside Zed (plain
; node-tree-sitter, nvim-treesitter, etc.) doesn't recognize the predicate
; name, so it won't filter on it.
((comment)+ @comment.around
  (#not-has-parent? @comment.around comment))

; declare function prefix:localname(...) { ... }
(function_declaration
  body: (enclosed_expr
    "{"
    (_)* @function.inside
    "}")) @function.around

; function($params) { ... } / function($params) as type { ... }
(inline_function_expr
  body: (enclosed_expr
    "{"
    (_)* @function.inside
    "}")) @function.around
