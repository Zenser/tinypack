import ImportDeclaration from './ImportDeclaration';
import RequireCallExpression from './RequireCallExpression';
import UnResolvedToken from './UnResolvedToken';

export class Program {
  body: Array<UnResolvedToken | ImportDeclaration | RequireCallExpression> = [];
}

export default class Parser {
  content: string;
  tokens: string[] = [];
  cursor = 0;
  ast = new Program();

  static whiteSpaceSet = new Set([
    '\u0009',
    '\u000B',
    '\u000C',
    '\u0020',
    '\u00A0',
    '\uFEFF',
  ]);
  static punctuatorsSet = new Set(
    '{ ( ) [ ] . ... ; , < > <= >= == != === !== + - * % ** ++ -- << >> >>> & | ^ ! ~ && || ?? ? : = += -= *= %= **= <<= >>= >>>= &= |= ^= &&= ||= ??= =>'.split(
      ' ',
    ),
  );
  static lineTerminatorSet = new Set(['\u000A', '\u000D', '\u2028', '\u2029']);
  static stringLiteralsSet = new Set([`'`, `"`]);

  static operatorCharSet = new Set(
    Array.from(Parser.punctuatorsSet).reduce<string[]>(
      (r, v) => [...r, ...v.split('')],
      [],
    ),
  );

  constructor(content: string) {
    this.content = content;
  }

  parse() {
    this.parseLexical().parseGrammar();
    return this;
  }

  /**
   * 词法解析
   */
  parseLexical() {
    while (this.isCursorValid) {
      if (Parser.whiteSpaceSet.has(this.currentChar)) {
        this.lexicalWalkWhiteSpace();
      } else if (Parser.lineTerminatorSet.has(this.currentChar)) {
        this.lexicalWalkLineTerminator();
      } else if (Parser.operatorCharSet.has(this.currentChar)) {
        this.lexicalWalkOperator();
      } else if (Parser.stringLiteralsSet.has(this.currentChar)) {
        this.lexicalWalkStringLiterals();
      } else {
        this.lexicalWalkIdentifier();
      }
    }
    return this;
  }

  /**
   * 阉割版语法解析
   */
  parseGrammar(i = 0) {
    const { tokens } = this;
    while (i < tokens.length) {
      const token = tokens[i];
      if (token === 'import') {
        i += this.grammarWalkImport(i);
      } else if (token === 'require') {
        i += this.grammarWalkRequire(i);
      } else {
        const urt = new UnResolvedToken();
        urt.token = token;
        this.ast.body.push(urt);
        i++;
      }
    }
    return this;
  }

  grammarWalkImport(index: number) {
    const { ast, length } = ImportDeclaration.parse(this.tokens, index);
    this.ast.body.push(ast);
    return length;
  }

  grammarWalkRequire(index: number) {
    const { ast, length } = RequireCallExpression.parse(this.tokens, index);
    this.ast.body.push(ast);
    return length;
  }

  private get isCursorValid() {
    return this.cursor >= 0 && this.cursor < this.content.length;
  }

  private get currentChar() {
    return this.content[this.cursor];
  }

  private lexicalWalkWhiteSpace() {
    while (this.isCursorValid && Parser.whiteSpaceSet.has(this.currentChar)) {
      this.cursor++;
    }
  }

  private lexicalWalkLineTerminator() {
    while (
      this.isCursorValid &&
      Parser.lineTerminatorSet.has(this.currentChar)
    ) {
      this.cursor++;
    }
    this.tokens.push('\n');
  }

  private lexicalWalkOperator() {
    let token = '';
    while (this.isCursorValid && Parser.operatorCharSet.has(this.currentChar)) {
      const willToken = token + this.currentChar;
      if (
        Array.from(Parser.punctuatorsSet).find((operator) =>
          operator.startsWith(willToken),
        )
      ) {
        token = willToken;
        this.cursor++;
      } else {
        break;
      }
    }
    this.tokens.push(token);
  }

  private lexicalWalkStringLiterals() {
    const startTag = this.currentChar;
    let token = this.currentChar;
    this.cursor++;
    while (this.isCursorValid && this.currentChar !== startTag) {
      if (Parser.lineTerminatorSet.has(this.currentChar)) {
        throw new Error(`unexpected line termiator: ${this.currentChar}`);
      }
      token += this.currentChar;
      this.cursor++;
    }
    token += this.currentChar;
    this.cursor++;
    this.tokens.push(token);
  }

  private lexicalWalkIdentifier() {
    let token = '';
    while (
      this.isCursorValid &&
      !Parser.lineTerminatorSet.has(this.currentChar) &&
      !Parser.whiteSpaceSet.has(this.currentChar) &&
      !Parser.operatorCharSet.has(this.currentChar)
    ) {
      token += this.currentChar;
      this.cursor++;
    }
    this.tokens.push(token);
  }
}
