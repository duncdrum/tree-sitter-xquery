; brackets.scm — matching bracket pairs, for highlighting and navigation
;
; @open / @close mark one delimiter pair. `#set! rainbow.exclude` opts a
; pair out of rainbow-bracket colorization (quotes and tag delimiters read
; worse rainbow-colored than plain brackets do).
;
; Patterns with no named parent node match by shape, the same way
; highlights.scm and indents.scm do: many rules inline their delimiters as
; direct children rather than wrapping them in a dedicated node, and the
; same literal token (e.g. a plain `"`) is reused across multiple rules
; (string_literal and attribute_value both use it), so matching on the
; token pair alone covers every one of those rules at once.

("(" @open
  ")" @close)

("[" @open
  "]" @close)

("{" @open
  "}" @close)

(("\"" @open
  "\"" @close)
  (#set! rainbow.exclude))

(("'" @open
  "'" @close)
  (#set! rainbow.exclude))

; Q{uri}local - the braced URI literal used by uri_qualified_name
(("Q{" @open
  "}" @close)
  (#set! rainbow.exclude))

; `{ expr }` interpolation inside a string constructor
(("`{" @open
  "}`" @close)
  (#set! rainbow.exclude))

; ``[ ... ]`` string constructor delimiters
(("``[" @open
  "]``" @close)
  (#set! rainbow.exclude))

; Direct element constructors: <foo attr="val"> ... </foo>
((direct_element
  (start_tag) @open
  (end_tag) @close)
  (#set! newline.only)
  (#set! rainbow.exclude))
