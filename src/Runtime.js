/**
 * 运行时函数，最终直接跑在浏览器侧
 */
(function (sourceModMap) {
  const loadedModMap = {};
  const webRequire = (keyPath) => {
    if (!(keyPath in loadedModMap)) {
      loadedModMap[keyPath] = {
        exports: {},
      };
      sourceModMap[keyPath](
        webRequire,
        loadedModMap[keyPath],
        loadedModMap[keyPath].exports,
      );
    }
    return loadedModMap[keyPath];
  };

  webRequire(ROOT_PATH_HOLDER);
})(SOURCE_MOD_HOLDER);
