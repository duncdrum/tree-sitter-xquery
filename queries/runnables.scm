; runnables.scm — inline gutter run indicators (Zed has no test explorer;
; this plus a tasks.json template is the whole discovery/run path)
;
; @run marks the function name the run button attaches to; #set! tag names
; the framework so a tasks.json template can match on it and invoke the
; right thing (eXist's /api/test endpoint vs. BaseX's TEST command).
;
; XQuery's %EQName(args)? annotation syntax is standard (XQuery 3.0+,
; already in grammar.js) and vendor-neutral - outline.scm already shows any
; annotation generically. What's vendor-specific is the *vocabulary*: two
; real, separately-maintained XQuery engines each define their own
; incompatible test-annotation namespace on top of that one mechanism -
; eXist-db's XQSuite (http://exist-db.org/xquery/xqsuite, prefix `test`)
; and BaseX's Unit Module (http://basex.org/modules/unit, prefix `unit`).
; Zed's own bundled grammars set the precedent for handling exactly this:
; Python's runnables.scm recognizes stdlib unittest *and* pytest as
; separate, separately-tagged patterns rather than picking one; Go does the
; same for stdlib testing vs. testify/suite. This file follows that.
;
; Matches each framework's own documented "this is a test" marker, not
; every annotation in its namespace - XQSuite's docs: a function is picked
; up by the test runner once it has *any* test:assert* annotation (not
; test:setUp/tearDown/pending/args/config alone, which are hooks/modifiers,
; not independently runnable - same reasoning Python's own pattern uses to
; leave setUp/tearDown unmarked). BaseX's docs name unit:test as the sole
; marker; unit:before/after/before-module/after-module/ignore are hooks.
;
; Known limitation: the annotation prefix (`test`/`unit`) is a file-local
; alias for a namespace URI, and a tree-sitter query can't resolve a
; rebound prefix (`declare namespace x = ".../xqsuite"; %x:assertEquals`
; wouldn't match) - the same class of limitation as version/vendor-profile
; resolution elsewhere in this project, deferred to the semantic layer.
; This matches the conventional prefixes essentially all real-world code
; uses, the same tradeoff Python's own identifier-text matching accepts.

((function_declaration
  (annotation
    prefixed: (identifier) @_annotation_prefix
    local: (identifier) @_annotation_local)
  (#eq? @_annotation_prefix "test")
  (#match? @_annotation_local "^assert")
  local: (identifier) @run)
  (#set! tag xquery-xqsuite-test))

((function_declaration
  (annotation
    prefixed: (identifier) @_annotation_prefix
    local: (identifier) @_annotation_local)
  (#eq? @_annotation_prefix "test")
  (#match? @_annotation_local "^assert")
  ncname: (identifier) @run)
  (#set! tag xquery-xqsuite-test))

((function_declaration
  (annotation
    prefixed: (identifier) @_annotation_prefix
    local: (identifier) @_annotation_local)
  (#eq? @_annotation_prefix "unit")
  (#eq? @_annotation_local "test")
  local: (identifier) @run)
  (#set! tag xquery-basex-unit-test))

((function_declaration
  (annotation
    prefixed: (identifier) @_annotation_prefix
    local: (identifier) @_annotation_local)
  (#eq? @_annotation_prefix "unit")
  (#eq? @_annotation_local "test")
  ncname: (identifier) @run)
  (#set! tag xquery-basex-unit-test))
