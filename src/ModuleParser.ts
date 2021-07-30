import * as fs from 'fs';
import * as path from 'path';
import Module from './Module';
import { Resolver } from './parser';
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
    const next = (i) => {
      if (i < this.plugins.length) {
        this.plugins[i].parse(node, next.bind(null, i + 1));
      }
    };
    next(0);
    /**
     * 递归子依赖
     */
    node.deps.map((childModule) => {
      this.parseDependencyGraph(childModule);
    });
    return this;
  }

  bundle() {
    let source = '{';
    source += this.generateSource(this.root, []).join('\n');
    source += '}';
    this.fs.writeFileSync(
      this.path.resolve(this.workspace, './bundle.js'),
      this.generateRuntimeJs(
        `'${Resolver.resolveKeyPath(this.root.path)}'`,
        source,
      ),
    );
  }

  private generateSource(mod: Module, output: string[]) {
    output.push(`'${Resolver.resolveKeyPath(mod.path)}': 
    function(require, module, exports) { ${mod.targetContent} },
    `);
    mod.deps.forEach((i) => this.generateSource(i, output));
    return output;
  }

  private generateRuntimeJs(
    ROOT_PATH_HOLDER: string,
    SOURCE_MOD_HOLDER: string,
  ) {
    return `
    /**
     * 运行时函数，最终直接跑在浏览器侧
     */
    (function (sourceModMap) {
      const loadedModMap = {};
      const webRequire = (keyPath) => {
        if (!(keyPath in loadedModMap)) {
          loadedModMap[keyPath] = {
            exports: {},
          };
          sourceModMap[keyPath](
            webRequire,
            loadedModMap[keyPath],
            loadedModMap[keyPath].exports,
          );
        }
        return loadedModMap[keyPath];
      };

      webRequire(${ROOT_PATH_HOLDER});
    })(${SOURCE_MOD_HOLDER});
    `;
  }
}
