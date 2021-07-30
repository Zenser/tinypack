import Module from '../Module';
import Parser, {
  ImportDeclaration,
  RequireCallExpression,
  Resolver,
} from '../Parser';
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

      node.targetContent = this.generateTargetContent(parser, node);
    }
    next();
  }

  generateTargetContent(parser: Parser, node: Module) {
    return parser.ast.body
      .map((item) => {
        if (item instanceof ImportDeclaration) {
          const modKey = Resolver.resolveKeyPath(node.path, item.fromClause);
          let statements = [];
          if (item.nameSpaceImport) {
            statements.push(
              `const ${item.nameSpaceImport} = require('${modKey}');`,
            );
          }
          if (item.importsList.length) {
            item.importsList.forEach((i) => {
              statements.push(
                `const ${i.as} = require('${modKey}').${i.binding};`,
              );
            });
          } else {
            statements.push(`require('${modKey}')`);
          }
          return statements.join('\n');
        } else if (item instanceof RequireCallExpression) {
          const modKey = Resolver.resolve(node.path, item.fromClause);
          return `require('${modKey}')`;
        } else {
          return item.token;
        }
      })
      .join(' ');
  }
}
