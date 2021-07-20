import ImportDeclaration from './ImportDeclaration';
import Parser from './Parser';
import UnResolvedToken from './UnResolvedToken';

describe('Parser', () => {
  test('lexical: ImportDeclaration', () => {
    const parser = new Parser(`import a from "a";`);
    expect(parser.parseLexical().tokens).toEqual([
      'import',
      'a',
      'from',
      `"a"`,
      ';',
    ]);
  });

  test('lexical: AssignmentExpression', () => {
    const parser = new Parser(`const b=a* 2 +'2'`);
    expect(parser.parseLexical().tokens).toEqual([
      'const',
      'b',
      '=',
      'a',
      '*',
      '2',
      '+',
      `'2'`,
    ]);
  });

  test('lexical: IfStatement', () => {
    const parser = new Parser(`if (a=== 1 || a >= 5){}`);
    expect(parser.parseLexical().tokens).toEqual([
      'if',
      '(',
      'a',
      '===',
      '1',
      '||',
      'a',
      '>=',
      '5',
      ')',
      '{',
      '}',
    ]);
  });

  test('ast: single', () => {
    const parser = new Parser(`import a from "../a"`);
    const id = new ImportDeclaration();
    id.importsList = [{ binding: 'default', as: 'a' }];
    id.fromClause = '../a';
    expect(parser.parse().ast.body).toEqual([id]);
  });

  test('ast: multi', () => {
    const parser = new Parser(`
      import a from "a";
      import b, { bE } from "b";
    `);
    const ida = new ImportDeclaration();
    const idb = new ImportDeclaration();
    ida.importsList = [{ binding: 'default', as: 'a' }];
    ida.fromClause = `a`;
    idb.importsList = [
      { binding: 'default', as: 'b' },
      { binding: 'bE', as: 'bE' },
    ];
    idb.fromClause = `b`;
    expect(parser.parse().ast.body).toEqual([
      UnResolvedToken.create('\n'),
      ida,
      UnResolvedToken.create(';'),
      UnResolvedToken.create('\n'),
      idb,
      UnResolvedToken.create(';'),
      UnResolvedToken.create('\n'),
    ]);
  });
});
