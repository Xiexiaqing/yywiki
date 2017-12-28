/**
 * 代码升级自动转换程序
 * 自动由外链转换成npm方式
 *
 */

'use strict';

module.exports = function(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const MODULE_NAMES = {
    'utils/isomorphic/withStyles': '@repoch/with-styles',
    'isomorphic-style-loader/lib/withstyles': '@repoch/with-styles',
    'utils/imageURLBuilder': '@repoch/format/image',
    'lib/createContainer': '@repoch/framework/lib/createContainer',
    'utils/io/ajax': '@repoch/ajax',
    'utils/ua/fromWeibo': '@repoch/ua-detector/is-weibo',
    'utils/io/jumpPage': '@repoch/jump-page',
    'utils/dom/util/iframe': '@repoch/dom-helper/util/iframe',
    'utils/qs/jsonToQuery': '@repoch/format/json-to-query',
    'utils/logger': '@repoch/logger',
    'utils/dom/dom/getSize': '@repoch/dom-helper/dom/get-size',
    'utils/dom/dom/position': '@repoch/dom-helper/dom/position',
    'utils/fix/doubleTapScrollUp': '@repoch/mobile-fix/double-tap-scrollup',
    'utils/fix/disableSwipeBack': '@repoch/mobile-fix/disable-swipe-back',
    'utils/raf': '@repoch/dom-helper/raf/index',
    'utils/ua/detect': '@repoch/ua-detector/detect',
    'utils/url/isSameOrigin': '@repoch/is-same-origin',
    'utils/dom/dom/addClass': '@repoch/dom-helper/dom/add-class',
    'utils/dom/dom/removeClass': '@repoch/dom-helper/dom/remove-class',
    'utils/dom/dom/position': '@repoch/dom-helper/dom/position',
    'utils/dom/dom/scrollPos': '@repoch/dom-helper/dom/scroll-pos',
    'utils/dom/util/transition': '@repoch/dom-helper/util/transition',
    'utils/format/dateFormat': '@repoch/format/date',
    'utils/react-router/lib/browserHistory': '@repoch/react-router/lib/browserHistory',
    'utils/storage/store': '@repoch/storage/session-storage',
    'utils/dom/util/windowScroll': '@repoch/dom-helper/util/window-scroll',
    'utils/weiboJSBridge/pickImage': '@repoch/weibo-jsbridge/pick-image',
    'utils/react-router/lib/Link': '@repoch/react-router/lib/Link',

    'components/ValidForm/ValidForm': '@repoch/valid-form',
    'components/ValidForm/rules': '@repoch/valid-form/rules',
    'components/DatePicker/DatePicker': '@repoch/date-picker',
    'components/Confirm/Confirm': '@repoch/confirm',
    'components/UploadMobile/UploadMobile': '@repoch/mobile-upload',
    'components/ScrollSelect/ScrollSelect': '@repoch/select',
    'components/UploadPic/UploadPic': '@repoch/upload',
    'components/Modal/Modal': '@repoch/modal',
    'components/Cal/Cal': '@repoch/calendar',
    'components/RichEditor/getEditor': '@repoch/simditor',
    'components/Toast/Toast': '@repoch/toast',
    'components/Cropper/Cropper': '@repoch/cropper',
    'components/LazyLoad/LazyLoad': '@repoch/lazyload',
    'components/NewSlider/NewSlider': '@repoch/slider-n',
    'components/ListView/ListView': '@repoch/listview',
    'components/Popup/Popup': '@repoch/popup',
    'utils/equal': '@repoch/equal'
  };

  // Program uses ES import syntax
  function useImportSyntax(j, root) {
    return root
      .find(j.ImportDeclaration)
      .length > 0;
  }

  // Program uses var keywords
  function useVar(j, root) {
    return root
      .find(j.VariableDeclaration, {kind: 'const'})
      .length === 0;
  }

  if (useImportSyntax(j, root)) {
    let imports = root.find(j.ImportDeclaration);
    let newImports = [];
    imports
      .forEach(path => {
        const name = path.value.source.value.toLowerCase();
        let replaceName = Object.keys(MODULE_NAMES).find(moduleName => name === moduleName.toLowerCase());
        if (replaceName) {
          const importStatement = j.importDeclaration(
            path.value.specifiers,
            j.literal(MODULE_NAMES[replaceName])
          );
          j(path).replaceWith(importStatement);
        } else if (name === 'utils/qs/encodehtml') {
          path.value.specifiers.forEach((specifier, idx) => {
            const importStatement = j.importDeclaration(
              [j.importDefaultSpecifier(j.identifier(specifier.local.name))],
              j.literal(specifier.local.name.indexOf('encodeHTML') > -1 ? '@repoch/format/encodeHTML' : '@repoch/format/decodeHTML')
            );
            if (idx > 0) {
              newImports.push({
                path: path,
                import: importStatement
              })
            } else {
              j(path).replaceWith(importStatement);
            }
          })
        }
      });

      if (newImports.length > 0) {
        newImports.forEach(importObject => {
          importObject.path.insertBefore(importObject.import)
        });
      }
      return imports.toSource({ quote: 'single' });
  }

  return root
    .find(j.CallExpression, {callee: {name: 'require'}})
    .forEach(path => {
      const name = path.node.arguments[0].value.toLowerCase();
      let replaceName = Object.keys(MODULE_NAMES).find(moduleName => name === moduleName.toLowerCase());
      if (replaceName) {
        const requireStatement = useVar(j, root)
          ? j.template.statement([`var withStyles = require('${MODULE_NAMES[moduleName]}');\n`])
          : j.template.statement([`const withStyles = require('${MODULE_NAMES[moduleName]}');\n`]);
        j(path.parent.parent).replaceWith(requireStatement);
      }
    }).toSource({ quote: 'single' });
};
