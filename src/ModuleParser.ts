import * as fs from 'fs';
import * as path from 'path';
import Module from './Module';
import { BasePlugin } from './plugins';

export default class ModuleParser {
  root: Module;
  workspace: string;
  fs: Pick<typeof fs, 'readFileSync' | 'writeFileSync'> = fs;
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
    return this;
  }

  bundle() {
    let source = '{';
    source += this.generateSource(this.root, []).join('\n');
    source += '}';
    let tpl = this.fs
      .readFileSync(this.path.resolve(__dirname, './Runtime.js'))
      .toString();
    tpl = tpl
      .replace('ROOT_PATH_HOLDER', `'${this.root.path}'`)
      .replace('SOURCE_MOD_HOLDER', source);
    this.fs.writeFileSync(
      this.path.resolve(this.workspace, './bundle.js'),
      tpl,
    );
  }

  private generateSource(mod: Module, output: string[]) {
    output.push(`'${mod.path}': 
    function(require, module, exports) { ${mod.targetContent} },
    `);
    mod.deps.forEach((i) => this.generateSource(i, output));
    return output;
  }
}
