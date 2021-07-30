import * as path from 'path';
import ModuleParser from './ModuleParser';
import { CSSLoadPlugin, JSLoadPlugin } from './plugins';

console.log('root', path.resolve(process.cwd(), process.argv[2]));

new ModuleParser({
  entry: path.resolve(process.cwd(), process.argv[2]),
  workspace: process.cwd(),
  plugins: [new JSLoadPlugin(), new CSSLoadPlugin()],
}).parseDependencyGraph().bundle();
