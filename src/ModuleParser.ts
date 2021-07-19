import fs from 'fs';
import path from 'path';
import Module from './Module';
import Parser, { ImportDeclaration } from './Parser';

export default class ModuleParser {
  root: Module;
  workspace: string;
  fs: Pick<typeof fs, 'readFileSync'> = fs;
  path: Pick<typeof path, 'resolve'> = path;

  constructor({ entry, workspace }: { entry: string; workspace: string }) {
    this.root = new Module();
    this.root.path = entry;
    this.workspace = workspace;
  }

  compile() {}

  inject(deps: Partial<Pick<ModuleParser, 'fs' | 'path'>>) {
    Object.assign(this, deps);
  }

  parseDependencyGraph(node: Module = this.root) {
    node.content = this.fs.readFileSync(node.path).toString();

    const parser = new Parser(node.content).parse();
    const ids = parser.ast.body.filter(
      (d) => d instanceof ImportDeclaration,
    ) as ImportDeclaration[];

    node.deps = ids.map((id) => {
      const childModule = new Module();
      const isRelativePath = ['.', '/'].includes(id.fromClause[0]);
      if (isRelativePath) {
        childModule.path = this.path.resolve(
          path.dirname(node.path),
          id.fromClause,
        );
      } else {
        childModule.path = require.resolve(id.fromClause);
      }
      this.parseDependencyGraph(childModule);
      return childModule;
    });
    return node;
  }
}
