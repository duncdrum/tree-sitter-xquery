const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor, rawSource } = require("./helper");

// First segment of every capture Zed's default themes actually style.
// Dotted suffixes (keyword.import, variable.parameter) fall back to these.
const ZED_THEME_ROOTS = new Set([
  "attribute",
  "boolean",
  "comment",
  "constant",
  "constructor",
  "embedded",
  "emphasis",
  "enum",
  "function",
  "hint",
  "keyword",
  "label",
  "link_text",
  "link_uri",
  "number",
  "operator",
  "predictive",
  "preproc",
  "primary",
  "property",
  "punctuation",
  "string",
  "tag",
  "text",
  "title",
  "type",
  "variable",
  "variant"
]);

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

test("highlights: window_start_condition does not concatenate at/previous into one token", () => {
  assert.doesNotMatch(rawSource("highlights"), /"at""previous"/);
});

test("highlights: module import keywords use keyword.import, not @include", () => {
  const caps = captures("highlights", "module_import.xq");
  const names = [...new Set(caps.map((c) => c.name))];
  assert.ok(!names.some((n) => n.startsWith("include") || n.startsWith("define")));
  assert.ok(names.includes("keyword.import"), `captures: ${names.join(",")}`);
  assert.ok(textsFor(caps, "keyword.import").includes("import"));
  assert.ok(textsFor(caps, "keyword.import").includes("module"));
});

test("highlights: prolog declare/xquery tokens are keywords", () => {
  const version = textsFor(captures("highlights", "version_declaration.xq"), "keyword");
  assert.ok(version.includes("xquery"), `version keywords: ${version.join(",")}`);

  const fn = textsFor(captures("highlights", "function_declaration.xq"), "keyword");
  assert.ok(fn.includes("declare"), `function keywords: ${fn.join(",")}`);
  assert.ok(fn.includes("function"), `function keywords: ${fn.join(",")}`);
});

test("highlights: live captures use Zed theme roots only", () => {
  const live = [];
  for (const line of rawSource("highlights").split("\n")) {
    if (line.trim().startsWith(";")) continue;
    for (const m of line.matchAll(/@([A-Za-z][A-Za-z0-9._]*)/g)) {
      live.push(m[1]);
    }
  }
  const unknown = [...new Set(live.filter((n) => !ZED_THEME_ROOTS.has(n.split(".")[0])))];
  assert.deepStrictEqual(unknown, [], `non-Zed capture roots: ${unknown.join(",")}`);
});
