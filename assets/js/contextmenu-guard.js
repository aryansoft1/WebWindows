(function installWebWindowsContextMenuGuard(global) {
  'use strict';

  const INSTALL_FLAG = '__webWindowsContextMenuGuardInstalled';

  function installFrame(frame) {
    if (!frame || frame.dataset.wwContextMenuGuard === '1') return;
    frame.dataset.wwContextMenuGuard = '1';

    const installIntoFrame = () => {
      try {
        install(frame.contentDocument);
      } catch (_) {
        // Cross-origin iframe documents cannot be controlled by the parent page.
      }
    };

    frame.addEventListener('load', installIntoFrame);
    installIntoFrame();
  }

  function install(doc) {
    if (!doc || doc[INSTALL_FLAG]) return false;

    Object.defineProperty(doc, INSTALL_FLAG, {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false,
    });
    doc.documentElement.dataset.wwContextMenuGuard = '1';

    // Only cancel the browser default. Existing custom context-menu handlers
    // still receive the event and can display their own menus.
    doc.addEventListener(
      'contextmenu',
      (event) => {
        if (event.cancelable) event.preventDefault();
      },
      { capture: true, passive: false }
    );

    doc.querySelectorAll('iframe').forEach(installFrame);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // node may belong to a child-frame realm, so avoid instanceof Element.
          if (!node || node.nodeType !== 1) return;
          if (node.matches('iframe')) installFrame(node);
          node.querySelectorAll?.('iframe').forEach(installFrame);
        });
      });
    });

    observer.observe(doc.documentElement, { childList: true, subtree: true });
    return true;
  }

  global.WebWindowsContextMenuGuard = Object.freeze({
    install,
    installFrame,
  });

  install(document);
})(window);

