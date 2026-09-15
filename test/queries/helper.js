const fs = require("node:fs");
const path = require("node:path");

const Parser = require("tree-sitter");
const { Query } = require("tree-sitter");

const XQuery = require("../..");
const root = path.join(__dirname, "..", "..");

const parser = new Parser();
parser.setLanguage(XQuery);

// Runs queries/<queryName>.scm against examples/spec/<specFile>, returning
// every capture as a plain {name, text} pair. Query files can (and here,
// deliberately do) match the same node more than once via separate
// patterns - e.g. a generic bracket-pair rule and a construct-specific rule
// both matching an `if_expr` - so callers should assert with `.some(...)`
// rather than on exact capture counts.
function captures(queryName, specFile) {
  const source = fs.readFileSync(path.join(root, "examples", "spec", specFile), "utf8");
  const tree = parser.parse(source);
  const query = new Query(XQuery, fs.readFileSync(path.join(root, "queries", `${queryName}.scm`), "utf8"));
  return query.captures(tree.rootNode).map((c) => ({ name: c.name, text: c.node.text }));
}

function textsFor(caps, name) {
  return caps.filter((c) => c.name === name).map((c) => c.text);
}

module.exports = { captures, textsFor };
