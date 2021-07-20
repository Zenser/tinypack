export default class UnResolvedToken {
  token = '';

  static create(token: string) {
    const urt = new UnResolvedToken();
    urt.token = token;
    return urt;
  }
}
