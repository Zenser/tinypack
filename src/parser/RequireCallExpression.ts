export default class RequireCallExpression {
  fromClause: string;

  static parse(tokens: string[], index: number) {
    const rce = new RequireCallExpression();
    let i = index + 1;
    if (tokens[i++] === '(' && [`'`, `"`].includes(tokens[i][0])) {
    } else {
      throw new Error(`unexpect token: ${tokens[i]}`);
    }
    rce.fromClause = tokens[i].slice(1, -1);
    i++;
    if (tokens[i] === ')') {
      return {
        ast: rce,
        length: ++i - index,
      };
    } else {
      throw new Error(`unexpect token: ${tokens[i]}`);
    }
  }
}
