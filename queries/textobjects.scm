; textobjects.scm — structural text objects (e.g. vim's `daf`/`dif`, `dac`/`dic`)
;
; @function.around / @function.inside select a whole function vs. just its
; body; @comment.around groups adjacent comments into one object. XQuery has
; no class-like construct, so no @class.* captures are defined here.

(comment)+ @comment.around

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
