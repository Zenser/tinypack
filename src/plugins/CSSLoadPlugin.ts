import postcss, { Root } from 'postcss';
import Module from '../Module';
import BasePlugin from './BasePlugin';

export class CSSModule extends Module {
  cssRoot: Root;
}

export default class CSSLoadPlugin extends BasePlugin {
  parse(node: CSSModule, next: Function) {
    if (/\.css$/.test(node.path)) {
      node.content = this.fs.readFileSync(node.path).toString();
      const cssRoot = postcss.parse(node.content, { from: node.path });

      node.deps = [];
      node.cssRoot = cssRoot;
      cssRoot.walkAtRules('import', (atRule) => {
        const cmPath = atRule.params.slice(1, -1);
        const childModule = this.createChildModule(node, cmPath);
        node.deps.push(childModule);
        atRule.remove();
      });

      this.generateTargetContent(node);
    }
    next();
  }

  generateTargetContent(node: CSSModule) {
    let targetContent = '';
    node.deps.forEach((childModule) => {
      targetContent += `require('${childModule.path}');\n`;
    });
    targetContent += `
      const style = document.createElement('style');
      style.innerText = \`${node.cssRoot.toResult().css}\`;
      document.head.appendChild(style);
    `;
    node.targetContent = targetContent;
  }
}
