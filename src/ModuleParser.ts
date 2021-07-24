import fs from 'fs';
import path from 'path';
import Module from './Module';
import { BasePlugin } from './plugins';

export default class ModuleParser {
  root: Module;
  workspace: string;
  fs: Pick<typeof fs, 'readFileSync'> = fs;
  path: Pick<typeof path, 'resolve'> = path;
  plugins: BasePlugin[];

  constructor({
    entry,
    workspace,
    plugins,
  }: {
    entry: string;
    workspace: string;
    plugins: BasePlugin[];
  }) {
    this.root = new Module();
    this.root.path = entry;
    this.workspace = workspace;
    this.plugins = plugins;
  }

  compile() {}

  inject(deps: Partial<Pick<ModuleParser, 'fs' | 'path'>>) {
    Object.assign(this, deps);
  }

  parseDependencyGraph(node: Module = this.root) {
    this.plugins.forEach((plugin) => {
      plugin.parse(node, () => {
        /**
         * 递归子依赖
         */
        node.deps.map((childModule) => {
          this.parseDependencyGraph(childModule);
        });
      });
    });
    return node;
  }
}
