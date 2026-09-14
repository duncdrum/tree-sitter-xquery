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
}
