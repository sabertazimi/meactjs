module.exports = (babel) => {
    const t = babel.types;

    return {
        visitor: {
            MemberExpression(path, state) {
                if (path.node.object.name === 'React' && path.node.property.name === 'createElement') {
                    path.replaceWith(t.identifier('createElement'));
                }
            }
        }
    }
}; 