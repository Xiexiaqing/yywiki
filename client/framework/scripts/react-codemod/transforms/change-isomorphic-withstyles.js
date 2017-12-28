/**
 * 为withStyles 更换依赖。
 * 由原来的isomorphic-style-loader/lib/withstyles变成utils/isomorphic-style-loader/lib/withstyles
 *
 */

'use strict';

module.exports = function(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const MODULE_NAME = options['module-name'] || 'utils/isomorphic/withStyles';

  // Program uses ES import syntax
  function useImportSyntax(j, root) {
    return root
      .find(j.ImportDeclaration)
      .length > 0;
  }

  // Program uses var keywords
  function useVar(j, root) {
    return root
      .find(j.VariableDeclaration, {kind: 'const'})
      .length === 0;
  }

  if (useImportSyntax(j, root)) {
    return root
      .find(j.ImportDeclaration)
      .forEach(path => {
        const name = path.value.source.value.toLowerCase();
        if (name === 'isomorphic-style-loader/lib/withstyles') {
          const importStatement = j.importDeclaration(
            [j.importDefaultSpecifier(j.identifier(path.value.specifiers[0].local.name))],
            j.literal(MODULE_NAME)
          );
          j(path).replaceWith(importStatement);
        }
      }).toSource({ quote: 'single' });
  }

  return root
    .find(j.CallExpression, {callee: {name: 'require'}})
    .forEach(path => {
      const name = path.node.arguments[0].value.toLowerCase();
      if (name === 'isomorphic-style-loader/lib/withstyles') {
        const requireStatement = useVar(j, root)
          ? j.template.statement([`var withStyles = require('${MODULE_NAME}');\n`])
          : j.template.statement([`const withStyles = require('${MODULE_NAME}');\n`]);
        j(path.parent.parent).replaceWith(requireStatement);
      }
    }).toSource({ quote: 'single' });
};
