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
    }
    next();
  }
}
