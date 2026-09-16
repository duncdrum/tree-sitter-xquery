const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor, rawSource } = require("./helper");

test("highlights: window start/end keywords match when previous/next are omitted", () => {
  // examples/spec/FLWOR_expressions.xq uses the spec's common form:
  //   start at $s when … / only end at $e when …
  // previous/next are optional in the grammar; requiring them as a
  // consecutive token sequence (or concatenating "at""previous") drops
  // highlighting on every real-world window clause.
  const caps = captures("highlights", "FLWOR_expressions.xq");
  const start = textsFor(caps, "keyword.window_start_condition");
  const end = textsFor(caps, "keyword.window_end_condition");
  assert.ok(start.includes("start"), `start keywords: ${start.join(",")}`);
  assert.ok(start.includes("at"), `start keywords: ${start.join(",")}`);
  assert.ok(start.includes("when"), `start keywords: ${start.join(",")}`);
  assert.ok(end.includes("only"), `end keywords: ${end.join(",")}`);
  assert.ok(end.includes("end"), `end keywords: ${end.join(",")}`);
  assert.ok(end.includes("when"), `end keywords: ${end.join(",")}`);
});

test("highlights: module import capture is include.module_import, not a trailing-dot name", () => {
  const caps = captures("highlights", "module_import.xq");
  const names = [...new Set(caps.map((c) => c.name))];
  assert.ok(
    !names.some((n) => n.endsWith(".")),
    `trailing-dot captures: ${names.filter((n) => n.endsWith(".")).join(",")}`
  );
  assert.ok(names.includes("include.module_import"), `captures: ${names.join(",")}`);
});

test("highlights: window_start_condition does not concatenate at/previous into one token", () => {
  assert.doesNotMatch(rawSource("highlights"), /"at""previous"/);
});
