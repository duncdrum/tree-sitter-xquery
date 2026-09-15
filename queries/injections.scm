; injections.scm — embed a different grammar's parse over part of this tree
;
; XQuery's direct element constructors, attribute values, and enclosed
; expressions are already native grammar.js rules (direct_element,
; direct_attribute, enclosed_expr -> $._expr) parsed by this same grammar,
; not opaque foreign text - so there is nothing to inject there. Injection
; is for genuinely separate, foreign microsyntax; the one real case in this
; grammar is comment content, matching the convention every other Zed
; grammar uses for its own comment node (rust, python, js, ...): highlight
; TODO/FIXME-style markup inside a comment via Zed's bundled "comment"
; pseudo-grammar. This grammar has two distinct comment node types -
; XQuery-style `(: ... :)` and XML-style `<!-- ... -->` inside direct
; element constructors - both get the same treatment.
;
; `comment` nests (`comment: repeat1(choice($.comment, ...))` in
; grammar.js, for `(: outer (: nested :) :)`), so without the
; #not-has-parent? guard a nested comment would also match on its own as a
; second, overlapping @injection.content - same shape of bug already fixed
; in textobjects.scm's comment pattern, for the same reason. direct_comment
; doesn't nest, so it needs no such guard.
((comment) @injection.content
  (#not-has-parent? @injection.content comment)
  (#set! injection.language "comment"))

((direct_comment) @injection.content
  (#set! injection.language "comment"))
