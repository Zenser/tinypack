import IdentifierName from './IdentifierName';

export default class ImportDeclaration {
  importsList: { as: string; binding: string }[] = [];
  nameSpaceImport: string = '';
  fromClause = '';

  static parse(tokens: string[], index: number) {
    const id = new ImportDeclaration();
    let i = index + 1;

    const throwUnExpectToken = () => {
      throw new Error(`unexpected token: ${tokens[i]}`);
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
        id.fromClause = tokens[i + 1].slice(1, -1);
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
        i++;
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
