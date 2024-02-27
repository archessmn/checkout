// ==UserScript==
// @name         Checkout Injector
// @version      0.0.4
// @namespace    http://tampermonkey.net/
// @description  try to take over the world!
// @author       archessmn
// @homepage     ${env.PUBLIC_URL}
// @updateURL    ${env.PUBLIC_URL}/api/userscript.js
// @downloadURL  ${env.PUBLIC_URL}/api/userscript.js
// @match        https://checkin.york.ac.uk/selfregistration
// @icon         https://www.google.com/s2/favicons?sz=64&domain=york.ac.uk
// @grant        none
// @run-at       document-end
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js
// ==/UserScript==

(function () {
  document.head.appendChild(
    ((s) => {
      s.rel = "stylesheet";
      s.href = "https://checkout.theshrine.net/extension.css";
      return s;
    })(document.createElement("link")),
  );
  document.head.appendChild(
    ((s) => {
      s.type = "text/javascript";
      s.src = "https://checkout.theshrine.net/api/extension.js";
      return s;
    })(document.createElement("script")),
  );
})();
