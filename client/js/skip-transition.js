var prefix = (function () {
  var styles = window.getComputedStyle(document.documentElement, ''),
      pre = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
      )[1];
  return {
    dom: pre == 'ms' ? pre.toUpperCase() : pre,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };

})();

var requestFrame = (function(){
  var raf = window.requestAnimationFrame ||
    window[prefix.lowercase + 'RequestAnimationFrame'] ||
    function(fn){ return window.setTimeout(fn, 20); };
  return function(fn){
    return raf.call(window, fn);
  };
})();

var skipTransition = function(element, fn, bind){
  var prop = prefix.js + 'TransitionProperty';
  element.style[prop] = element.style.transitionProperty = 'none';
  var callback;
  if (fn) callback = fn.call(bind);
  requestFrame(function(){
    requestFrame(function(){
      element.style[prop] = element.style.transitionProperty = '';
      if (callback) requestFrame(callback);
    });
  });
};