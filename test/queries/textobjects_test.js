const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor } = require("./helper");

test("textobjects: an external function declaration has no @function.around", () => {
  const caps = captures("textobjects", "function_declaration.xq");
  assert.ok(!textsFor(caps, "function.around").some((t) => t.includes("copySign")));
});

test("textobjects: a braced function declaration selects around/inside", () => {
  const caps = captures("textobjects", "function_declaration.xq");
  assert.ok(textsFor(caps, "function.around").some((t) => t.startsWith("declare function local:summary")));
  assert.ok(textsFor(caps, "function.inside").some((t) => t.startsWith("for $d in fn:distinct-values")));
});

test("textobjects: groups adjacent line comments and captures block comments", () => {
  const caps = captures("textobjects", "comments.xq");
  const comments = textsFor(caps, "comment.around");
  assert.ok(comments.includes("(: before query body :)"));
  assert.ok(comments.includes("(: after query body :)"));
});
