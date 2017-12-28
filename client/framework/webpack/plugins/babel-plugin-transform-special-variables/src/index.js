export default function({ types: t }) {
    return {
        visitor: {
            MemberExpression(path, state) {
                Object.keys(state.opts).map(function(specialWord) {
                    if (path.get("object").matchesPattern(specialWord)) {
                        let key = path.toComputedKey();
                        if (t.isStringLiteral(key)) {
                            path.replaceWith(t.valueToNode(state.opts[specialWord][key.value]));
                        }
                    }
                })
            }
        }
    };
}
