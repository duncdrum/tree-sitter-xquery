; outline.scm — code outline / symbol panel
;
; Follows Zed's outline query captures:
;   @item        — a node shown as an entry in the outline
;   @name        — the text used as the entry's label
;   @context     — keywords/punctuation shown alongside the name
;   @annotation  — %-annotations rendered above the declaration they attach to
;
; Same ncname/prefixed+local field split as tags.scm - _allowed_qnames tags
; an unprefixed name with `ncname`, a prefixed one with `prefixed`+`local` -
; never both on the same node, so a pair of patterns covers both spellings
; without ambiguity or duplicate matches.

(annotation) @annotation

; declare [%annotation] function prefix:localname(...) { ... }
(function_declaration
  "declare" @context
  "function" @context
  local: (identifier) @name
  "(" @context
  ")" @context) @item

(function_declaration
  "declare" @context
  "function" @context
  ncname: (identifier) @name
  "(" @context
  ")" @context) @item

; declare [%annotation] variable $name [as type] := expr
(variable_declaration
  "declare" @context
  "variable" @context
  (variable
    local: (identifier) @name)) @item

(variable_declaration
  "declare" @context
  "variable" @context
  (variable
    ncname: (identifier) @name)) @item

; module namespace prefix = "uri";
(module_declaration
  "module" @context
  "namespace" @context
  .
  (identifier) @name) @item

; import module namespace prefix = "uri" at "path";
(module_import
  "import" @context
  "module" @context
  "namespace" @context
  .
  (identifier) @name) @item

; declare namespace prefix = "uri";
(namespace_declaration
  "declare" @context
  "namespace" @context
  .
  (identifier) @name) @item
