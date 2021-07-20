export default class IdentifierName {
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
