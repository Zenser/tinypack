class IdentifierName {
  static checkIsIdentifierName(token: string) {
    for (let i = 0; i < token.length; i++) {
      if (i === 0 && this.checkIsIdentifierStart(token[i])) {
        continue;
      }
      if (
        i < token.length - 1 &&
        (this.checkIsIdentifierStart(token[i]) ||
          this.checkIsIdentifierPart(token[i]))
      ) {
        continue;
      }
      if (i === token.length - 1 && this.checkIsIdentifierPart(token[i])) {
        continue;
      }
      return false;
    }
    return true;
  }

  static checkIsIdentifierStart(char: string) {
    const code = char.charCodeAt(0);
    if (char === '$' || char === '_') {
      return true;
    } else if (code >= 0x0041 && code <= 0x005a) {
      return true;
    } else if (code >= 0x0061 && code <= 0x007a) {
      return true;
    } else if (code >= 0x00c0 && code <= 0x3134a) {
      return true;
    }
    return false;
  }

  static checkIsIdentifierPart(char: string) {
    const code = char.charCodeAt(0);
    if (char === '$' || code === 0x200d || code === 0x202f) {
      return true;
    } else if (code >= 0x0041 && code <= 0x005a) {
      return true;
    } else if (code >= 0x0061 && code <= 0x007a) {
      return true;
    } else if (code >= 0x00c0 && code <= 0x3134a) {
      return true;
    }
    return false;
  }
}

export class ImportDeclaration {
  importsList: { as: string; binding: string }[] = [];
  nameSpaceImport: string = '';
  fromClause = '';

  static parse(tokens: string[], index: number) {
    const id = new ImportDeclaration();
    let i = index + 1;

    const throwUnExpectToken = () => {
      throw new Error(`unexcept token: ${tokens[i]}`);
    };
    const walkNamedImports = () => {
      if (
        tokens[i] === 'as' &&
        IdentifierName.checkIsIdentifierName(tokens[i + 1])
      ) {
        id.importsList.slice(-1)[0].as = tokens[++i];
      } else if (IdentifierName.checkIsIdentifierName(tokens[i])) {
        id.importsList.push({ binding: tokens[i], as: tokens[i] });
      }
      // next
      i++;
      if (tokens[i] === ',') {
        i++;
        walkNamedImports();
      } else if (tokens[i] === '}') {
        i++;
        walkFromClause();
      } else {
        throwUnExpectToken();
      }
    };

    const waklNameSpaceImport = () => {
      i += 2;
      id.nameSpaceImport = tokens[i];
      i++;
      walkFromClause();
    };

    const walkFromClause = () => {
      if (tokens[i] === 'from') {
        id.fromClause = tokens[i + 1];
        i += 2;
      } else {
        throwUnExpectToken();
      }
    };

    const walkImportedDefaultBinding = () => {
      id.importsList.push({ binding: 'default', as: tokens[i] });
      i++;
      if (tokens[i] === ',') {
        i++;
        if (tokens[i] === '{') {
          i++;
          walkNamedImports();
        } else if (tokens[i] === '*') {
          waklNameSpaceImport();
        } else {
          throwUnExpectToken();
        }
      } else {
        walkFromClause();
      }
    };

    const startWalk = () => {
      const token = tokens[i];
      if (token === '{') {
        i++;
        walkNamedImports();
      } else if (token === '*') {
        waklNameSpaceImport();
      } else if (token[0] === `"` || token[0] === `'`) {
        id.fromClause = token;
      } else if (IdentifierName.checkIsIdentifierName(token)) {
        walkImportedDefaultBinding();
      } else {
        throwUnExpectToken();
      }
    };

    startWalk();

    return {
      ast: id,
      length: i - index,
    };
  }
}

export default class Parser {
  content: string;
  tokens: string[] = [];
  cursor = 0;
  ast: ImportDeclaration[] = [];

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

  parseLexical() {
    while (this.isCursorValid) {
      if (Parser.whiteSpaceSet.has(this.currentChar)) {
        this.lexicalWalkWhiteSpace();
      } else if (Parser.lineTerminatorSet.has(this.currentChar)) {
        this.lexicalWalkLineTerminator();
      } else if (Parser.operatorCharSet.has(this.currentChar)) {
        this.lexicalWalkOperator();
      } else {
        this.lexicalWalkIdentifier();
      }
    }
    return this;
  }

  parseGrammar() {
    let i = 0;
    const { tokens } = this;
    while (i < tokens.length) {
      const token = tokens[i];
      if (token === 'import') {
        i += this.grammarWalk(i);
      } else {
        i++;
      }
    }
    return this;
  }

  private get isCursorValid() {
    return this.cursor >= 0 && this.cursor < this.content.length;
  }

  private get currentChar() {
    return this.content[this.cursor];
  }

  grammarWalk(index: number) {
    const { ast, length } = ImportDeclaration.parse(this.tokens, index);
    this.ast.push(ast);
    return length;
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
