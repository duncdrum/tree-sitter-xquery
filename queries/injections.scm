; injections.scm — embed a different grammar's parse over part of this tree
;
; XQuery's direct element constructors, attribute values, and enclosed
; expressions are already native grammar.js rules (direct_element,
; direct_attribute, enclosed_expr -> $._expr) parsed by this same grammar,
; not opaque foreign text - so there is nothing to inject there. Injection
; is for genuinely separate, foreign microsyntax; the one real case in this
; grammar is comment content, matching the convention every other Zed
; grammar uses for its own comment node (rust, python, js, ...): highlight
; TODO/FIXME-style markup inside `(: ... :)` via Zed's bundled "comment"
; pseudo-grammar.
((comment) @injection.content
  (#set! injection.language "comment"))
