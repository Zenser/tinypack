import CSSLoadPlugin, { CSSModule } from './CSSLoadPlugin';

describe('CSSLoadPlugin', () => {
  test('should work', () => {
    const mockFileMap = {
      '/path/a.css': `@import './b.css';
      .a {
        color: #000;
      }
      `,
      '/path/b.css': '',
    };
    const plugin = new CSSLoadPlugin();
    plugin.inject({
      fs: {
        readFileSync: (k) => mockFileMap[k],
      },
    });

    const node = new CSSModule();
    node.path = '/path/a.css';
    plugin.parse(node, () => {
      // console.log(node);
    });
  });
});
