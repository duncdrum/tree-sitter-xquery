SHELL=/bin/bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules
MAKEFLAGS += --silent

# default: generate
default: format generate parse hl
	echo ' => done'

# default: generate tree-sitter grammar
generate: src/grammar.json ## generate tree-sitter files

.PHONY: help
help: ## show this help
	@cat $(MAKEFILE_LIST) |
	grep -oP '^[a-zA-Z_-]+:.*?## .*$$' |
	sort |
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: clean
clean: ## remove tree-sitter generated artifacts
	rm -fr node_modules
	rm -fr build
	rm -f log.html
	rm -f tree-sitter-xquery.wasm
	rm -fr bin

src/grammar.json: grammar.js
	echo '==========================================='
	npm run generate
	echo '==========================================='

.PHONY: watch-grammar
watch-grammar: ## if changes in grammar.js then generate
	while true;
	do $(MAKE) || true;
	inotifywait -qre close_write ./  &>/dev/null;
	done

.PHONY: buildr
buildr: ## build wasm then open web ui
	npm run build

tree-sitter-xquery.wasm: buildr
	npm run build-wasm

.PHONY: docs
docs: tree-sitter-xquery.wasm ## refresh the local playground copy (CI deploys docs/ to GitHub Pages on push to main)
	mkdir -p docs
	cp -v $< docs/
	cp -v node_modules/web-tree-sitter/tree-sitter.wasm docs/
	cp -v node_modules/web-tree-sitter/tree-sitter.js docs/
	cp -v node_modules/web-tree-sitter/tree-sitter-web.d.ts docs/

.PHONY: docs-clean
docs-clean:
	rm -f tree-sitter-xquery.wasm

.PHONY: test
test: ## test specific section nominated in .env
	npm test -- -i '$(TEST_SECTION)'

.PHONY: test-all
test-all: ## test everything in the test dir
	npm test

.PHONY: tags
tags:  ##  test out a tags query file nominated in .env
	echo 'examples/spec/$(EXAMPLE).xq'
	echo
	npm run tags -- examples/example.xquery
	echo

.PHONY: parse
parse:  ## parse a specific example nominated in .env
	echo 'examples/spec/$(EXAMPLE).xq'
	echo
	npm run parse -- examples/spec/$(EXAMPLE).xq
	echo

.PHONY: parse-all
parse-all: parse-spec parse-qt3 ## parse all examples


.PHONY: parse-graph
parse-graph:  ## parse with the debug graph, writes log.html
	npm run parse -- examples/spec/$(EXAMPLE).xq -D || true
	echo 'open log.html in a browser to inspect the debug graph'

.PHONY: parse-spec
parse-spec:  ## parse all spec examples
	npm run parse -- -q examples/spec/*

.PHONY: parse-qt3
parse-qt3:  ## parse all app examples
	npm run parse -- -q examples/qt3/app/Demos/*
	npm run parse -- -q examples/qt3/app/walmsley/*
	npm run parse -- -q examples/qt3/app/XMark/*

.PHONY: hl
hl: ## highlight query specific example nominated in .env
	npm run highlight -- examples/spec/$(EXAMPLE).xq

.PHONY: web
web: ## open the tree-sitter playground (local dev server)
	npm run web

.PHONY: install
install: ## install dependencies
	npm install

.PHONY: format
format:  grammar.js
	#prettier --list-different grammar.js
	./node_modules/.bin/prettier  --write --no-config --no-editorconfig --single-quote --print-width 180  grammar.js
