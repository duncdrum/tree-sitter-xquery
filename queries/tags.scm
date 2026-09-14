; tags.scm — symbol definitions for code navigation
;
; Follows the tree-sitter tags spec:
; https://tree-sitter.github.io/tree-sitter/code-navigation-systems
;
; Captures:
;   @name                  — the identifier node that IS the symbol name
;   @definition.function   — a function declaration
;   @definition.variable   — a module-level variable declaration
;   @definition.module     — a library module declaration
;   @definition.namespace  — a namespace import
;   @reference.call        — a function call site

; ---------------------------------------------------------------------------
; Function declarations
;
; declare [private] [%annotation] function prefix:localname(...) { ... }
;
; _allowed_qnames tags its own children with fields: `ncname` for an
; unprefixed name, or `prefixed`+`local` for a prefixed one — never both on
; the same node, so matching on the field alone (rather than position)
; unambiguously selects the right case with no duplicate matches.
; ---------------------------------------------------------------------------
(function_declaration
  "function"
  local: (identifier) @name)
@definition.function

(function_declaration
  "function"
  ncname: (identifier) @name)
@definition.function

; ---------------------------------------------------------------------------
; Module-level variable declarations
;
; declare [private] [%annotation] variable $name [as type] := expr
;
; The variable node wraps "$" + identifier, same ncname/prefixed/local
; field split as function names above.
; ---------------------------------------------------------------------------
(variable_declaration
  (variable
    local: (identifier) @name))
@definition.variable

(variable_declaration
  (variable
    ncname: (identifier) @name))
@definition.variable

; ---------------------------------------------------------------------------
; Library module declaration
;
; module namespace prefix = "uri";
; ---------------------------------------------------------------------------
(module_declaration
  "namespace"
  .
  (identifier) @name)
@definition.module

; ---------------------------------------------------------------------------
; Module imports
;
; import module namespace prefix = "uri" at "path";
; ---------------------------------------------------------------------------
(module_import
  "namespace"
  .
  (identifier) @name)
@definition.namespace

; ---------------------------------------------------------------------------
; Function call references
;
; prefix:localname(args) — capture the local name only
; ---------------------------------------------------------------------------
(function_call
  local: (identifier) @name)
@reference.call

(function_call
  ncname: (identifier) @name)
@reference.call
