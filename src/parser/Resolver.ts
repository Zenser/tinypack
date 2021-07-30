import * as path from 'path';

export default class Resolver {
  static resolve(modulePath: string, childModuleFromClause: string) {
    const isRelativePath = ['.', '/'].includes(childModuleFromClause[0]);
    if (isRelativePath) {
      return path.resolve(path.dirname(modulePath), childModuleFromClause);
    } else {
      return require.resolve(childModuleFromClause, { paths: [process.cwd()] });
    }
  }

  static resolveKeyPath(modulePath: string, childModuleFromClause?: string) {
    if (childModuleFromClause) {
      const absolutePath = Resolver.resolve(modulePath, childModuleFromClause);
      return path.relative(process.cwd(), absolutePath);
    } else {
      return path.relative(process.cwd(), modulePath);
    }
  }
}
