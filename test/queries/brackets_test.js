const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor } = require("./helper");

test("brackets: matches direct element start/end tags as a pair", () => {
  const caps = captures("brackets", "node_constructors.xq");
  assert.ok(textsFor(caps, "open").includes("<title>"));
  assert.ok(textsFor(caps, "close").includes("</title>"));
});

test("brackets: matches parens, brackets and braces generically", () => {
  const caps = captures("brackets", "maps_and_arrays.xq");
  const opens = textsFor(caps, "open");
  const closes = textsFor(caps, "close");
  assert.ok(opens.includes('"'));
  assert.ok(closes.includes('"'));
});

test("brackets: matches the Q{...} braced URI literal delimiters", () => {
  const caps = captures("brackets", "wildcards.xq");
  assert.ok(textsFor(caps, "open").includes("Q{"));
  assert.ok(textsFor(caps, "close").includes("}"));
});

test("brackets: matches ``[ ]`` string constructor and `{ }` interpolation delimiters", () => {
  const caps = captures("brackets", "string_constructors.xq");
  assert.ok(textsFor(caps, "open").includes("``["));
  assert.ok(textsFor(caps, "close").includes("]``"));
  assert.ok(textsFor(caps, "open").includes("`{"));
  assert.ok(textsFor(caps, "close").includes("}`"));
});
