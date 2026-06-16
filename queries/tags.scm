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
; In the AST the function name is two consecutive named identifier children:
; the namespace prefix and the local name, separated by an anonymous ":".
; We match the second identifier (local name) as @name so tools display
; "get-suggestions" rather than "au:get-suggestions".
; ---------------------------------------------------------------------------
(function_declaration
  "function"
  (identifier)         ; namespace prefix
  ":"
  (identifier) @name)  ; local name
@definition.function

; Unprefixed function declaration (no namespace prefix)
(function_declaration
  "function"
  .
  (identifier) @name)
@definition.function

; ---------------------------------------------------------------------------
; Module-level variable declarations
;
; declare [private] [%annotation] variable $name [as type] := expr
;
; The variable node wraps "$" + identifier.
; ---------------------------------------------------------------------------
(variable_declaration
  (variable
    "$"
    (identifier) @name))
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
  (identifier)       ; namespace prefix
  ":"
  (identifier) @name)
@reference.call

; Unprefixed function call
(function_call
  .
  (identifier) @name)
@reference.call
