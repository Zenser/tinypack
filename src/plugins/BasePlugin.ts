import * as fs from 'fs';
import * as path from 'path';
import Module from '../Module';
import { Resolver } from '../Parser';

export default class BasePlugin<Context extends Module = Module> {
  fs: Pick<typeof fs, 'readFileSync'> = fs;
  path: Pick<typeof path, 'resolve'> = path;

  inject(deps: Partial<Pick<BasePlugin, 'fs' | 'path'>>) {
    Object.assign(this, deps);
  }

  parse(context: Context, next: () => any) {}

  createChildModule(node: Context, importPath: string) {
    const childModule = new Module();
    childModule.path = Resolver.resolve(node.path, importPath);
    return childModule;
  }
}
