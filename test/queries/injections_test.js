const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor } = require("./helper");

test("injections: every comment is injected with the 'comment' pseudo-language", () => {
  const caps = captures("injections", "comments.xq");
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
  const caps = captures("injections", "node_constructors.xq");
  assert.deepStrictEqual(caps, []);
});
