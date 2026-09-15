const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor, matches } = require("./helper");

test("indents: a for_clause indents on its own, not the whole flwor_expr", () => {
  const indents = textsFor(captures("indents", "FLWOR_expressions.xq"), "indent");
  assert.ok(indents.includes("for $y allowing empty at $j in ($x to 3)"));
  // A flwor_expr as a whole must never be its own @indent range, or every
  // sibling clause (let/where/return) would stair-step instead of lining up.
  assert.ok(!indents.includes("for $y allowing empty at $j in ($x to 3)\nreturn ()"));
});

test("indents: a return_clause indents its own value", () => {
  const indents = textsFor(captures("indents", "FLWOR_expressions.xq"), "indent");
  assert.ok(indents.includes("return ()"));
});

test("indents: a window clause indents across its start/end conditions", () => {
  const indents = textsFor(captures("indents", "FLWOR_expressions.xq"), "indent");
  assert.ok(
    indents.some((t) => t.startsWith("for tumbling window") && t.includes("start at $s") && t.includes("only end at"))
  );
});

test("indents: a direct element constructor indents between its tags", () => {
  const indents = textsFor(captures("indents", "FLWOR_expressions.xq"), "indent");
  assert.ok(indents.includes("<window>{ $w }</window>"));
});

test("indents: an if_expr's condition and then/else body are disjoint indent ranges", () => {
  // if_expr's condition is `seq('(', expr, ')')` inlined with no wrapping
  // node, so "(" and ")" are direct children of if_expr itself - the same
  // shape the generic bracket-pair rule matches. Without the `")" @start`
  // anchor on the dedicated if_expr rule, both rules would independently
  // @indent the *entire* if_expr from "if" onward, double-counting every
  // line inside a multi-line condition. Assert the two matches instead
  // carry complementary boundaries (one ending at ")", one starting there),
  // not two identical whole-node ranges.
  const ifMatches = matches("indents", "conditional_expressions.xq").filter((m) =>
    m.captures.some((c) => c.name === "indent" && c.type === "if_expr")
  );
  const byPattern = new Map();
  for (const m of ifMatches) {
    const names = m.captures.map((c) => c.name).sort();
    byPattern.set(m.pattern, names.join(","));
  }
  const rangeKinds = [...byPattern.values()];
  assert.ok(rangeKinds.includes("end,indent"), "generic paren rule should bound the condition with @end");
  assert.ok(rangeKinds.includes("indent,start"), "if_expr rule should start after the condition with @start");
  assert.notStrictEqual(
    rangeKinds.length,
    1,
    "the condition-bounded and body-bounded ranges must be two distinct patterns, not one duplicated bare @indent"
  );
});

test("indents: switch/typeswitch case clauses indent their own return value", () => {
  const switchIndents = textsFor(captures("indents", "switch_expression.xq"), "indent");
  assert.ok(switchIndents.some((t) => t === 'case "Cow" return "Moo"'));

  const typeswitchIndents = textsFor(captures("indents", "expressions_on_sequence_types.xq"), "indent");
  assert.ok(typeswitchIndents.some((t) => t.startsWith("case $a as element(*, USAddress)") && t.includes("return $a/state")));
});

test("indents: a quantified_expr indents its satisfies clause with the binding", () => {
  const indents = textsFor(captures("indents", "quantified_expressions.xq"), "indent");
  assert.ok(indents.some((t) => t.startsWith("every $part in /parts/part satisfies")));
});

test("indents: `{ expr }` interpolation and ``[ ]`` string constructor delimiters indent", () => {
  const indents = textsFor(captures("indents", "string_constructors.xq"), "indent");
  assert.ok(
    indents.some((t) => t.startsWith("`{") && t.endsWith("}`")),
    "interpolation should produce its own @indent range"
  );
  assert.ok(
    indents.some((t) => t.startsWith("``[") && t.endsWith("]``")),
    "string_constructor should produce its own @indent range"
  );
});
