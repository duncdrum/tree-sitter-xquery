fn main() {
    let mut parser = tree_sitter::Parser::new();
    parser
        .set_language(&tree_sitter_xquery::language())
        .expect("failed to load xquery grammar");
    let tree = parser.parse("1 + 1", None).expect("failed to parse");
    println!("ok: {}", tree.root_node().to_sexp());

    // Exercises the external scanner (issue #3): a backtick run directly
    // abutting an interpolation boundary, the case that broke a pure-regex
    // attempt at this rule.
    let scanner_tree = parser
        .parse("``[a``{$x}`]``", None)
        .expect("failed to parse string constructor");
    assert!(!scanner_tree.root_node().has_error(), "scanner case has ERROR/MISSING nodes");
    println!("ok: {}", scanner_tree.root_node().to_sexp());

    // A lone "-" in a direct comment used to produce ERROR (see #3).
    let comment_tree = parser
        .parse("<a><!-- a-b --></a>", None)
        .expect("failed to parse direct comment");
    assert!(!comment_tree.root_node().has_error(), "lone-dash comment has ERROR/MISSING nodes");
    println!("ok: {}", comment_tree.root_node().to_sexp());

    // Reserved words (spec A.3) are only restricted as an unprefixed
    // function-call name (see #4) - everywhere else, including prefixed
    // calls, they're ordinary identifiers.
    let reserved_call_tree = parser.parse("if(1)", None).expect("failed to parse");
    assert!(reserved_call_tree.root_node().has_error(), "if(1) should be rejected as a function call");
    let prefixed_call_tree = parser.parse("fn:if(1)", None).expect("failed to parse");
    assert!(!prefixed_call_tree.root_node().has_error(), "fn:if(1) should parse fine, prefixed calls aren't restricted");
    println!("ok: reserved word restriction scoped correctly");
}
