export default class Module {
  path: string = '';
  content: string = '';
  targetContent: string = '';
  deps: Module[] = [];
}
