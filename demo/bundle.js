
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

      webRequire('src/index.js');
    })({'src/index.js': 
    function(require, module, exports) { require('src/index.css') ; 
 require('src/child-1.js') ; 
 document . querySelector ( '#app' ) . innerHTML = 'Hello tinypack' },
    
'src/index.css': 
    function(require, module, exports) { 
      const style = document.createElement('style');
      style.innerText = `body {
    background-color: blue;
    color: red;
    font-size: 20px;
}`;
      document.head.appendChild(style);
     },
    
'src/child-1.js': 
    function(require, module, exports) { document . body . insertAdjacentHTML ( 'beforeend' , 'I am child-1' ) },
    });
    