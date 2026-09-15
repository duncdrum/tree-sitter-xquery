; indents.scm — auto-indent hints
;
; @indent marks a node whose interior lines (excluding its own first line)
; get one more indent level. @end narrows an @indent range so it stops at
; the start of the captured node, instead of running to the end of the
; outer node - used here so a bracket's own indent doesn't extend past its
; closing delimiter into whatever follows.
;
; Many grammar rules inline a bracket pair as a direct child rather than
; wrapping it in its own node (arg_list, the sequence-type `*_test` rules,
; enclosed_expr, predicate, map/array constructors, the parenthesized parts
; of if/switch/typeswitch...). The wildcard patterns below match any of
; those by shape rather than listing every node type by name.

(_
  "("
  ")" @end) @indent

(_
  "["
  "]" @end) @indent

(_
  "{"
  "}" @end) @indent

; `{ expr }` interpolation inside a string constructor - `{`/`}` are
; distinct tokens from the enclosed_expr `{`/`}` matched above.
(interpolation
  "`{"
  "}`" @end) @indent

; ``[ ... ]`` string constructor delimiters, for one that wraps a line.
(string_constructor
  "``["
  "]``" @end) @indent

; Direct element constructors: indent between the opening and closing tag,
; the same way a JSX element does - <foo> ... </foo>
(direct_element
  (start_tag) @start
  (end_tag)? @end) @indent

; FLWOR clauses are siblings at the same level - `for`, `let`, `where` and
; `return` line up together, so each clause indents only its own value's
; continuation lines. Marking the whole flwor_expr instead would indent
; every following sibling clause too.
(for_clause) @indent

(let_clause) @indent

(tumbling_window_clause) @indent

(sliding_window_clause) @indent

(where_clause) @indent

(group_by_clause) @indent

(order_by_clause) @indent

(count_clause) @indent

(return_clause) @indent

; Conditionals and branching constructs have no braces of their own, so a
; flat single indent level covers the whole then/else, satisfies, or case
; body.
(if_expr) @indent

(quantified_expr) @indent

(switch_clause) @indent

(typeswitch_case_clause) @indent
