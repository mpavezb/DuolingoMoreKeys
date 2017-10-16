// ==UserScript==
// @name        More Duolingo keyboard hotkeys
// @description Makes all Duolingo exercises accessible with the keyboard
// @namespace   thecybershadow.net
// @include     https://www.duolingo.com/*
// @version     1
// @grant       none
// @run-at      document-start
// ==/UserScript==

(function () {
  // Configuration
  var keys = '1234567890abcdefghijklmnopqrstuvwxyz';

  // React/Duolingo obfuscated class names
  var classNameButton = 'iNLw3';
  var classNameDisabled = 'MJuj8';

  // React reimplements console.log, so save a
  // private reference to the original on load
  var realConsole = console;
  var realConsoleLog = console.log;
  function log(s) {
    realConsoleLog.call(realConsole, s);
  }

  // Styling for the hotkey bubbles
  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }

  document.addEventListener("DOMContentLoaded", function(event) {
    addGlobalStyle(
      '.key-hint { '+
      '  position: absolute;'+
      '  margin-left: -25px;'+
      '  margin-top: -20px;'+

    //'  color: #777;'+
    //'  background-color: #fff;'+
    //'  border: 2px solid #dadada; '+
      '  color: white;'+
      '  background-color: #aaa;'+
      '  border: 1.5px solid #aaa;'+

      '  width: 20px;'+
      '  height: 20px;'+
      '  font-size: 12px;'+
      '  font-weight: 700;'+
      '  border-radius: 12px;'+
      '  padding: 2px;'+
      '}' +
      '' +
      '.'+classNameDisabled+' .key-hint {' +
      '  display: none;' +
      '}'
    );
  });

  // Current key->button mapping
  var currentButtons = {};

  function checkDom() {
    try {
      var buttons = document.getElementsByClassName(classNameButton);
      //log('Found ' + buttons.length + ' buttons');

      if (!document.querySelector('div.key-hint')) {
        // New exercise

        currentButtons = {};

        var bi = 0;
        for (var i = 0; i < buttons.length; i++) {
          var b = buttons[i];
          if (b.classList.contains(classNameDisabled))
            continue; // shouldn't happen with a fresh layout, but the script may have just been loaded

          var key = keys[bi];
          currentButtons[key] = b;
          var div = b.querySelector('div.key-hint');
          if (!div) {
            div = document.createElement('div');
            div.classList.add('key-hint');
            b.insertBefore(div, b.firstChild);
          }
          div.textContent = key;
          bi++;
        }
      } else {
        // Update layout for the same exercise

        // Keep the same keys for used words
        // (when translating sentences to the target language).
        // Since Duolingo recreates the HTML nodes, we have to infer
        // what their initially assigned hotkey was by the node's text.
        var usedWords = {};

        for (var i = 0; i < buttons.length; i++) {
          var b = buttons[i];
          if (b.classList.contains(classNameDisabled) && b.querySelector('div.key-hint')) {
            var text = b.childNodes[1].textContent;
            var key = b.childNodes[0].textContent;
            usedWords[text] = key;
          }
        }

        for (var i = 0; i < buttons.length; i++) {
          var b = buttons[i];
          if (b.classList.contains(classNameDisabled))
            continue;

          var div = b.querySelector('div.key-hint');
          if (!div) {
            var text = b.textContent;
            if (text in usedWords) {
              var key = usedWords[text];
              div = document.createElement('div');
              div.classList.add('key-hint');
              b.insertBefore(div, b.firstChild);
              div.textContent = key;
              currentButtons[key] = b;
            }
          } else {
            var key = b.childNodes[0].textContent;
            currentButtons[key] = b;
          }
        }
      }
    }
    catch (e) {
      log(e);
    }
  }

  // Key event handler
  document.addEventListener('keydown', function(event) {
    try {
      var c = event.key.toLowerCase();
      if (c in currentButtons) {
        //log('Dispatching!');
        currentButtons[c].click();
        checkDom();
        return false;
      }
    }
    catch (e) {
      log(e);
    }
    return true;
  });

  setInterval(checkDom, 100);
  log('"More Duolingo keyboard hotkeys" loaded');
}) ();