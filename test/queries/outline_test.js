const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor } = require("./helper");

test("outline: names every function declaration, including external ones", () => {
  const names = textsFor(captures("outline", "function_declaration.xq"), "name");
  assert.deepStrictEqual(names, ["copySign", "summary", "depth"]);
});

test("outline: captures a function's %annotation separately from its @item", () => {
  const caps = captures("outline", "function_declaration.xq");
  const annotations = textsFor(caps, "annotation");
  assert.ok(annotations.some((a) => a.includes('java:method("java.lang.StrictMath.copySign")')));
  // The annotation text must not also show up as part of the @item's name.
  assert.ok(!textsFor(caps, "name").some((n) => n.includes("java:method")));
});

test("outline: names module-level variable declarations, prefixed and unprefixed", () => {
  const names = textsFor(captures("outline", "variable_declaration.xq"), "name");
  assert.ok(names.includes("x"), "unprefixed $x");
  assert.ok(names.includes("username"), "prefixed $sasl:username");
  assert.ok(names.includes("time"), "%eg:volatile-annotated $time");
});

test("outline: module declaration names the namespace prefix", () => {
  const names = textsFor(captures("outline", "module_declaration.xq"), "name");
  assert.strictEqual(names[0], "gis");
});

test("outline: module import names the namespace prefix", () => {
  const names = textsFor(captures("outline", "module_import.xq"), "name");
  assert.strictEqual(names[0], "geo");
});

test("outline: namespace declaration names the prefix", () => {
  const names = textsFor(captures("outline", "namespace_declaration.xq"), "name");
  assert.strictEqual(names[0], "foo");
});
