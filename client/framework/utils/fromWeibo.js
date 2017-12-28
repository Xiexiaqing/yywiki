'use strict';

module.exports = function() {
  return /_weibo_/ig.test(window.navigator.userAgent);
};
