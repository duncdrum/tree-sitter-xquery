fn main() {
    let mut parser = tree_sitter::Parser::new();
    parser
        .set_language(&tree_sitter_xquery::language())
        .expect("failed to load xquery grammar");
    let tree = parser.parse("1 + 1", None).expect("failed to parse");
    println!("ok: {}", tree.root_node().to_sexp());
}
