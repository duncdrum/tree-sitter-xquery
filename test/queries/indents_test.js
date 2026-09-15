const assert = require("node:assert");
const { test } = require("node:test");

const { captures, textsFor } = require("./helper");

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

test("indents: an if_expr indents its whole then/else body as one flat level", () => {
  const indents = textsFor(captures("indents", "conditional_expressions.xq"), "indent");
  assert.ok(indents.some((t) => t === "if ($widget1/unit-cost < $widget2/unit-cost)\n then $widget1\n else $widget2"));
});
