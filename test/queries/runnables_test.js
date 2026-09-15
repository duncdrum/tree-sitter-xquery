const assert = require("node:assert");
const { test } = require("node:test");

const { capturesFromSource, matchesFromSource, textsFor } = require("./helper");

// XQSuite (eXist-db): http://exist-db.org/xquery/xqsuite, conventionally
// bound to the `test` prefix. A function is picked up by the test runner
// once it has *any* test:assert* annotation (per eXist's docs) -
// test:setUp/test:pending are hooks/modifiers, not independently runnable.
const XQSUITE_SRC = `
xquery version "3.1";
module namespace t = "http://example.com/tests";
declare namespace test = "http://exist-db.org/xquery/xqsuite";

declare
  %test:args("2", "3")
  %test:assertEquals(5)
function t:add-two-numbers($a as xs:integer, $b as xs:integer) as xs:integer {
    $a + $b
};

declare
  %test:setUp
function t:setup() {
    ()
};

declare
  %test:pending("not ready")
function t:not-a-real-assertion() {
    ()
};
`;

// BaseX Unit Module: http://basex.org/modules/unit, conventionally bound to
// the `unit` prefix. unit:test is the sole documented test marker;
// unit:before/after/before-module/after-module/ignore are hooks.
const BASEX_SRC = `
module namespace t = "http://example.com/tests";
declare namespace unit = "http://basex.org/modules/unit";

declare
  %unit:test
function t:addition() {
  unit:assert-equals(1 + 1, 2)
};

declare
  %unit:before
function t:setup() {
  ()
};
`;

test("runnables: XQSuite - a %test:assertEquals function is tagged xquery-xqsuite-test", () => {
  const matches = matchesFromSource("runnables", XQSUITE_SRC);
  const tagged = matches.filter((m) => m.setProperties && m.setProperties.tag === "xquery-xqsuite-test");
  const runNames = tagged.flatMap((m) => textsFor(m.captures, "run"));
  assert.deepStrictEqual(runNames, ["add-two-numbers"]);
});

test("runnables: XQSuite - test:setUp and test:pending alone are not runnable", () => {
  const caps = capturesFromSource("runnables", XQSUITE_SRC);
  const runNames = textsFor(caps, "run");
  assert.ok(!runNames.includes("setup"));
  assert.ok(!runNames.includes("not-a-real-assertion"));
});

test("runnables: BaseX Unit - a %unit:test function is tagged xquery-basex-unit-test", () => {
  const matches = matchesFromSource("runnables", BASEX_SRC);
  const tagged = matches.filter((m) => m.setProperties && m.setProperties.tag === "xquery-basex-unit-test");
  const runNames = tagged.flatMap((m) => textsFor(m.captures, "run"));
  assert.deepStrictEqual(runNames, ["addition"]);
});

test("runnables: BaseX Unit - unit:before alone is not runnable", () => {
  const caps = capturesFromSource("runnables", BASEX_SRC);
  assert.ok(!textsFor(caps, "run").includes("setup"));
});

test("runnables: a plain, unannotated function is not runnable", () => {
  const caps = capturesFromSource("runnables", "declare function local:helper() { 1 };");
  assert.deepStrictEqual(textsFor(caps, "run"), []);
});
