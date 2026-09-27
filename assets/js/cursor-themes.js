(function (global) {
    'use strict';

    const storageKey = 'webwindows.cursor.theme';
    const themeNames = Object.freeze({
        dreama: 'Dreama', classic: 'Classic', soft: 'Soft',
        'dark-pro': 'Dark Pro', mono: 'Mono'
    });
    const states = Object.freeze([
        'default', 'pointer', 'text', 'wait', 'progress', 'move',
        'not-allowed', 'crosshair', 'help', 'ew-resize', 'ns-resize',
        'nwse-resize', 'nesw-resize'
    ]);
    const hotspot = {
        default: [4, 2], pointer: [10, 5], text: [16, 16], wait: [16, 16],
        progress: [4, 2], move: [16, 16], 'not-allowed': [16, 16],
        crosshair: [16, 16], help: [16, 16], 'ew-resize': [16, 16],
        'ns-resize': [16, 16], 'nwse-resize': [16, 16], 'nesw-resize': [16, 16]
    };
    const aliases = {
        'n-resize': 'ns-resize', 's-resize': 'ns-resize',
        'e-resize': 'ew-resize', 'w-resize': 'ew-resize',
        'nw-resize': 'nwse-resize', 'se-resize': 'nwse-resize',
        'ne-resize': 'nesw-resize', 'sw-resize': 'nesw-resize',
        'col-resize': 'ew-resize', 'row-resize': 'ns-resize',
        grab: 'move', grabbing: 'move'
    };
    const themes = Object.freeze(Object.fromEntries(Object.entries(themeNames).map(([id, name]) => [id, Object.freeze({ id, name })])));
    let currentTheme = 'dreama';

    function getCursor(state, themeId = currentTheme) {
        const id = themes[themeId] ? themeId : 'dreama';
        const resolved = aliases[state] || state;
        if (!states.includes(resolved)) return null;
        const [x, y] = hotspot[resolved];
        return `url("/assets/cursors/${id}/${resolved}.svg") ${x} ${y}, ${resolved}`;
    }

    function rules() {
        const selectors = {
            default: 'html, body, .desktop, .taskbar, #start-menu, .window, .window-content, [data-cursor-state="default"]',
            pointer: 'button:not(:disabled), a[href], select:not(:disabled), .icon, .taskbar-app, .start-button, .start-menu li, .context-menu-item, [role="button"]:not([aria-disabled="true"]), [style*="cursor: pointer"], [style*="cursor:pointer"]',
            text: 'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]',
            move: '.window-header, .window-header .title, [draggable="true"], .weather-widget, [style*="cursor: move"], [style*="cursor:move"], [data-cursor-state="move"]',
            'not-allowed': ':disabled, [aria-disabled="true"], [data-cursor-state="not-allowed"]',
            wait: '[aria-busy="true"], [data-cursor-state="wait"]',
            progress: '[data-cursor-state="progress"]',
            crosshair: '[data-cursor-state="crosshair"]',
            help: '[data-cursor-state="help"]',
            'ew-resize': '.resizer.e, .resizer.w, [data-resize-dir="e"], [data-resize-dir="w"], [style*="cursor: e-resize"], [style*="cursor: w-resize"], [style*="cursor: col-resize"], [data-cursor-state="ew-resize"]',
            'ns-resize': '.resizer.n, .resizer.s, [data-resize-dir="n"], [data-resize-dir="s"], [style*="cursor: n-resize"], [style*="cursor: s-resize"], [style*="cursor: row-resize"], [data-cursor-state="ns-resize"]',
            'nwse-resize': '.resizer.nw, .resizer.se, .ww-resizer, [data-resize-dir="nw"], [data-resize-dir="se"], [style*="cursor: nw-resize"], [style*="cursor: se-resize"], [style*="cursor: nwse-resize"], [data-cursor-state="nwse-resize"]',
            'nesw-resize': '.resizer.ne, .resizer.sw, [data-resize-dir="ne"], [data-resize-dir="sw"], [style*="cursor: ne-resize"], [style*="cursor: sw-resize"], [style*="cursor: nesw-resize"], [data-cursor-state="nesw-resize"]'
        };
        return Object.entries(selectors).map(([state, selector]) => `${selector} { cursor: ${getCursor(state)} !important; }`).join('\n');
    }

    function applyToDocument(doc) {
        if (!doc?.head) return;
        let style = doc.getElementById('ww-cursor-theme-style');
        if (!style) {
            style = doc.createElement('style');
            style.id = 'ww-cursor-theme-style';
            doc.head.appendChild(style);
        }
        style.textContent = rules();
        doc.documentElement.dataset.wwCursorTheme = currentTheme;
    }

    function applyToFrames() {
        document.querySelectorAll('iframe').forEach((frame) => {
            try { applyToDocument(frame.contentDocument); } catch (_) { /* Cross-origin frames retain their own cursor. */ }
        });
    }

    function setTheme(themeId) {
        if (!themes[themeId]) return false;
        currentTheme = themeId;
        try { global.localStorage.setItem(storageKey, themeId); } catch (_) {}
        applyToDocument(document);
        applyToFrames();
        global.dispatchEvent(new CustomEvent('webwindows:cursor-theme-changed', { detail: { themeId } }));
        return true;
    }

    try {
        const saved = global.localStorage.getItem(storageKey);
        if (themes[saved]) currentTheme = saved;
    } catch (_) {}

    const manager = Object.freeze({
        themes, states, get currentTheme() { return currentTheme; }, setTheme, getCursor
    });
    global.WebWindows = global.WebWindows || {};
    global.WebWindows.cursor = manager;
    applyToDocument(document);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyToFrames();
            const observer = new MutationObserver((records) => {
                if (records.some((record) => Array.from(record.addedNodes).some((node) =>
                    node.nodeType === 1 && (node.tagName === 'IFRAME' || node.querySelector?.('iframe'))
                ))) applyToFrames();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            document.addEventListener('load', (event) => {
                if (event.target?.tagName === 'IFRAME') applyToFrames();
            }, true);
        }, { once: true });
    }
    global.addEventListener('storage', (event) => {
        if (event.key === storageKey && themes[event.newValue]) {
            currentTheme = event.newValue;
            applyToDocument(document);
            applyToFrames();
        }
    });
})(window);
