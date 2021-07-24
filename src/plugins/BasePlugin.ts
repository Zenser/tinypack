import fs from 'fs';
import path from 'path';
import Module from '../Module';

export default class BasePlugin<Context extends Module = Module> {
  fs: Pick<typeof fs, 'readFileSync'> = fs;
  path: Pick<typeof path, 'resolve'> = path;

  inject(deps: Partial<Pick<BasePlugin, 'fs' | 'path'>>) {
    Object.assign(this, deps);
  }

  parse(context: Context, next: () => any) {}

  createChildModule(node: Context, importPath: string) {
    const childModule = new Module();
    const isRelativePath = ['.', '/'].includes(importPath[0]);
    if (isRelativePath) {
      childModule.path = this.path.resolve(path.dirname(node.path), importPath);
    } else {
      childModule.path = require.resolve(importPath);
    }
    return childModule;
  }
}
