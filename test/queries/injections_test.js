const assert = require("node:assert");
const { test } = require("node:test");

const { captures, capturesFromSource, matchesFromSource, textsFor, rawSource } = require("./helper");

// injections.scm's comment pattern uses Zed's #not-has-parent? predicate,
// which plain node-tree-sitter's Query constructor rejects as unrecognized
// (see helper.js). stripPredicates lets the rest of the pattern still run
// here; the predicate's actual filtering behavior can only be verified in
// a predicate-aware consumer (Zed itself) - the two tests at the bottom of
// this file cover what we can check locally instead.
const OPTS = { stripPredicates: true };

test("injections: every comment is injected with the 'comment' pseudo-language", () => {
  const caps = captures("injections", "comments.xq", OPTS);
  const content = textsFor(caps, "injection.content");
  assert.ok(content.includes("(: before query body :)"));
  assert.ok(content.includes("(: after query body :)"));
  assert.ok(content.some((t) => t.startsWith("(:~")), "doc-style comment should be injected too");
});

test("injections: direct element constructors are not injected - they're native grammar, not foreign text", () => {
  // direct_element/direct_attribute/enclosed_expr are first-class grammar.js
  // rules parsed by this same grammar, unlike e.g. HTML's <script>/<style>
  // raw_text. There is nothing here for injections.scm to embed a foreign
  // grammar into, so it must produce zero captures against this fixture.
  const caps = captures("injections", "node_constructors.xq", OPTS);
  assert.deepStrictEqual(caps, []);
});

test("injections: an XML-style direct_comment is injected too, not just XQuery-style (: :)", () => {
  const caps = capturesFromSource("injections", "<a><!-- TODO fix this --></a>", OPTS);
  assert.deepStrictEqual(textsFor(caps, "injection.content"), ["<!-- TODO fix this -->"]);
});

test("injections.scm ships the #not-has-parent? guard against nested comments", () => {
  // Pinned directly in the source, since we can't exercise the predicate's
  // filtering through node-tree-sitter: this is what stops a nested
  // `(: (: ... :) :)` comment from also matching as its own, smaller,
  // overlapping @injection.content.
  assert.match(rawSource("injections"), /#not-has-parent\?\s+@injection\.content\s+comment/);
});

test("injections: without the predicate, a nested comment matches twice - the guard it ships with is load-bearing, not decorative", () => {
  const nestedCommentMatches = matchesFromSource(
    "injections",
    "(: outer (: nested :) still outer :)\n1",
    OPTS
  ).filter((m) => m.captures.some((c) => c.name === "injection.content" && c.text.includes("nested")));
  assert.strictEqual(nestedCommentMatches.length, 2, "expected both the outer and the nested inner comment to match once the predicate is stripped");
});
