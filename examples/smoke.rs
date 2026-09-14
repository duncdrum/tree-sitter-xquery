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

    // The corpus test for this (test/corpus/constructors.txt) runs in a
    // non-blocking CI job, so assert it here too: a lone "-" in a direct
    // comment used to produce ERROR (see #3).
    let comment_tree = parser
        .parse("<a><!-- a-b --></a>", None)
        .expect("failed to parse direct comment");
    assert!(!comment_tree.root_node().has_error(), "lone-dash comment has ERROR/MISSING nodes");
    println!("ok: {}", comment_tree.root_node().to_sexp());
}
