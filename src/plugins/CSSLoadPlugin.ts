import postcss from 'postcss';
import Module from '../Module';
import BasePlugin from './BasePlugin';

export default class CSSLoadPlugin extends BasePlugin {
  parse(node: Module, next: Function) {
    if (/\.css$/.test(node.path)) {
      node.content = this.fs.readFileSync(node.path).toString();
      const cssRoot = postcss.parse(node.content, { from: node.path });

      node.deps = [];
      cssRoot.walkAtRules('import', (atRule) => {
        const cmPath = atRule.params.slice(1, -1);
        node.deps.push(this.createChildModule(node, cmPath));
      });
    }
    next();
  }
}
