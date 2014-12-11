/********************************************************************/
/* Fichero:     iePollyfills.js                                     */
/* Autor:       David Gracia Larrodé   dagrala@gmail.com            */
/* Descripción: Script con funciones que hacen posible la           */
/*              compatibilidad con Internet Explorer 9, 10 y 11     */
/********************************************************************/

/* En caso de no exitir el objeto console se crea uno con métodos vacíos
   par que no bloqueen la ejecución. */
(function() {
  if (!window.console) {
    window.console = {};
  }
  // métodos Chrome, FF, IE y Safari para el objeto console
  var m = [
    "log", "info", "warn", "error", "debug", "trace", "dir", "group",
    "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
    "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
  ];
  var noop = function() {};
  // se definen métodos como funciones vacías para evitar errores
  for (var i = 0; i < m.length; i++) {
    if (!window.console[m[i]]) {
      window.console[m[i]] = noop;
    }    
  } 
})();

/* Crea un objeto CustomEvent para hacerlo compatible en Internet Explorer*/
(function () {
  function CustomEvent (event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
   };
  CustomEvent.prototype = window.CustomEvent.prototype;
  window.CustomEvent = CustomEvent;
})();
