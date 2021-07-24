import { readFileSync } from 'fs';
import ModuleParser from './ModuleParser';
import { JSLoadPlugin } from './plugins';

describe('module parse', () => {
  test('easy parse', () => {
    const mockFileMap = {
      '/path/entry.js': `import a from './a.js';`,
      '/path/a.js': `import b from './inner/b.js';`,
      '/path/inner/b.js': `console.log(b);`,
    };
    const jsLoadPlugin = new JSLoadPlugin();
    const mp = new ModuleParser({
      entry: '/path/entry.js',
      workspace: '/path',
      plugins: [jsLoadPlugin],
    });
    jsLoadPlugin.inject({
      fs: {
        readFileSync: (k) => mockFileMap[k],
      },
    });
    mp.parseDependencyGraph();
    console.log(mp.root.deps);
  });

  test('mode module parse', () => {
    const mockFileMap = {
      '/path/entry.js': `import a from './a.js';`,
      '/path/a.js': `import b from 'react-is';`,
    };
    const jsLoadPlugin = new JSLoadPlugin();
    const mp = new ModuleParser({
      entry: '/path/entry.js',
      workspace: '/path',
      plugins: [jsLoadPlugin],
    });
    jsLoadPlugin.inject({
      fs: {
        readFileSync: (k) => mockFileMap[k] || readFileSync(k),
      },
    });
    mp.parseDependencyGraph();
    console.log(mp.root.deps[0].deps);
  });
});
