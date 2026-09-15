const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor, matches, rawSource } = require("./helper");

// textobjects.scm's nested-comment pattern uses Zed's #not-has-parent?
// predicate, which plain node-tree-sitter's Query constructor rejects as
// unrecognized (see helper.js). stripPredicates lets the rest of the file's
// patterns still run here; the predicate's actual filtering behavior can
// only be verified in a predicate-aware consumer (Zed itself) - the two
// tests at the bottom of this file cover what we can check locally instead.
const OPTS = { stripPredicates: true };

test("textobjects: an external function declaration has no @function.around", () => {
  const caps = captures("textobjects", "function_declaration.xq", OPTS);
  assert.ok(!textsFor(caps, "function.around").some((t) => t.includes("copySign")));
});

test("textobjects: a braced function declaration selects around/inside", () => {
  const caps = captures("textobjects", "function_declaration.xq", OPTS);
  assert.ok(textsFor(caps, "function.around").some((t) => t.startsWith("declare function local:summary")));
  assert.ok(textsFor(caps, "function.inside").some((t) => t.startsWith("for $d in fn:distinct-values")));
});

test("textobjects: groups adjacent line comments and captures block comments", () => {
  const caps = captures("textobjects", "comments.xq", OPTS);
  const comments = textsFor(caps, "comment.around");
  assert.ok(comments.includes("(: before query body :)"));
  assert.ok(comments.includes("(: after query body :)"));
});

test("textobjects.scm ships the #not-has-parent? guard against nested comments", () => {
  // Pinned directly in the source, since we can't exercise the predicate's
  // filtering through node-tree-sitter: this is what stops a nested
  // `(: (: ... :) :)` comment from also matching as its own, smaller
  // @comment.around.
  assert.match(rawSource("textobjects"), /#not-has-parent\?\s+@comment\.around\s+comment/);
});

test("textobjects: without the predicate, a nested comment matches twice - the guard it ships with is load-bearing, not decorative", () => {
  const nestedCommentMatches = matches("textobjects", "comments.xq", OPTS).filter((m) =>
    m.captures.some((c) => c.name === "comment.around" && c.text.includes("xquery allows embed comments"))
  );
  assert.strictEqual(nestedCommentMatches.length, 2, "expected both the outer and the nested inner comment to match once the predicate is stripped");
});
