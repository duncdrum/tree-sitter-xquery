const fs = require("node:fs");
const path = require("node:path");

const Parser = require("tree-sitter");
const { Query } = require("tree-sitter");

const XQuery = require("../..");
const root = path.join(__dirname, "..", "..");

const parser = new Parser();
parser.setLanguage(XQuery);

// Query predicates real editors (Zed) support that plain node-tree-sitter's
// Query constructor rejects outright as "Unknown query predicate" - it has
// no extensibility hook for custom predicates, and construction fails for
// the *whole* query source, not just the offending pattern. Stripping them
// is a test-only compatibility shim so the rest of a file (and the shape of
// the stripped pattern itself) can still be exercised here; the shipped
// queries/*.scm files keep the real predicate for the editors that do
// understand it. See the comment on textobjects.scm's #not-has-parent?
// pattern for why one exists.
const UNSUPPORTED_PREDICATES = [/\(#not-has-parent\?[^)]*\)/g, /\(#has-parent\?[^)]*\)/g];

function stripUnsupportedPredicates(source) {
  return UNSUPPORTED_PREDICATES.reduce((s, re) => s.replace(re, ""), source);
}

function rawSource(queryName) {
  return fs.readFileSync(path.join(root, "queries", `${queryName}.scm`), "utf8");
}

function parseFixture(specFile) {
  const source = fs.readFileSync(path.join(root, "examples", "spec", specFile), "utf8");
  return parser.parse(source);
}

// Vendor-specific test-annotation fixtures (XQSuite, BaseX Unit Module)
// don't belong in examples/spec (W3C conformance examples) or examples/qt3
// (the QT3 test suite) - both are vendor-neutral by design. Source strings
// passed directly here are how those get tested instead.
function parseSource(source) {
  return parser.parse(source);
}

function buildQuery(queryName, { stripPredicates = false } = {}) {
  const source = stripPredicates ? stripUnsupportedPredicates(rawSource(queryName)) : rawSource(queryName);
  return new Query(XQuery, source);
}

// Runs queries/<queryName>.scm against a parsed tree, returning every
// capture as a plain {name, text} pair. Query files can (and here,
// deliberately do) match the same node more than once via separate
// patterns - e.g. a generic bracket-pair rule and a construct-specific rule
// both matching an `if_expr` - so callers should assert with `.some(...)`
// rather than on exact capture counts.
function capturesOf(tree, queryName, opts) {
  const query = buildQuery(queryName, opts);
  return query.captures(tree.rootNode).map((c) => ({ name: c.name, text: c.node.text }));
}

function captures(queryName, specFile, opts) {
  return capturesOf(parseFixture(specFile), queryName, opts);
}

function capturesFromSource(queryName, source, opts) {
  return capturesOf(parseSource(source), queryName, opts);
}

function textsFor(caps, name) {
  return caps.filter((c) => c.name === name).map((c) => c.text);
}

// Like captures(), but grouped by match instead of flattened - needed when
// a test cares which captures (or #set! properties, e.g. runnables.scm's
// `tag`) co-occurred in the same pattern, not just that they exist
// somewhere in the file's overall capture list.
function matchesOf(tree, queryName, opts) {
  const query = buildQuery(queryName, opts);
  return query.matches(tree.rootNode).map((m) => ({
    pattern: m.pattern,
    captures: m.captures.map((c) => ({ name: c.name, text: c.node.text, type: c.node.type })),
    setProperties: m.setProperties,
  }));
}

function matches(queryName, specFile, opts) {
  return matchesOf(parseFixture(specFile), queryName, opts);
}

function matchesFromSource(queryName, source, opts) {
  return matchesOf(parseSource(source), queryName, opts);
}

module.exports = { captures, capturesFromSource, textsFor, matches, matchesFromSource, rawSource };
