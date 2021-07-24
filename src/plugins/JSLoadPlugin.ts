import Module from '../Module';
import Parser, { ImportDeclaration, RequireCallExpression } from '../Parser';
import BasePlugin from './BasePlugin';

export default class JSLoadPlugin extends BasePlugin {
  parse(node: Module, next: Function) {
    if (/\.js$/.test(node.path)) {
      node.content = this.fs.readFileSync(node.path).toString();

      const parser = new Parser(node.content).parse();
      const ids = parser.ast.body.filter(
        (d) =>
          d instanceof ImportDeclaration || d instanceof RequireCallExpression,
      ) as ImportDeclaration[];

      node.deps = ids.map((id) => {
        return this.createChildModule(node, id.fromClause);
      });

      node.targetContent = this.generateTargetContent(parser);
    }
    next();
  }

  generateTargetContent(parser: Parser) {
    return parser.ast.body
      .map((item) => {
        if (item instanceof ImportDeclaration) {
          let statements = [];
          if (item.nameSpaceImport) {
            statements.push(
              `const ${item.nameSpaceImport} = require('${item.fromClause}');`,
            );
          }
          item.importsList.forEach((i) => {
            statements.push(
              `const ${i.as} = require('${item.fromClause}').${i.binding};`,
            );
          });
          return statements.join('\n');
        } else if (item instanceof RequireCallExpression) {
          return `require('${item.fromClause}')`;
        } else {
          return item.token;
        }
      })
      .join(' ');
  }
}
