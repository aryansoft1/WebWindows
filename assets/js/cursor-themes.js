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
    const observedDocuments = new WeakSet();
    const observedFrames = new WeakSet();

    function getAsset(state, themeId = currentTheme, format = 'svg') {
        const id = themes[themeId] ? themeId : 'dreama';
        const resolved = aliases[state] || state;
        return states.includes(resolved) ? `/assets/cursors/${id}/${resolved}.${format === 'png' ? 'png' : 'svg'}` : null;
    }

    function getCursor(state, themeId = currentTheme) {
        const resolved = aliases[state] || state;
        const png = getAsset(resolved, themeId, 'png');
        if (!png) return null;
        const [x, y] = hotspot[resolved];
        return `url("${png}") ${x} ${y}, url("${getAsset(resolved, themeId)}") ${x} ${y}, ${resolved}`;
    }

    function rules() {
        const selectors = {
            default: 'html, body, .desktop, .taskbar, #start-menu, .window, .window-content, .window-iframe, iframe, .vw-taskbar, .battery-indicator, #taskbar-datetime, [data-cursor-state="default"], [style*="cursor: default"], [style*="cursor:default"]',
            pointer: 'button:not(:disabled), .window-header .button, a[href], select:not(:disabled), input:is([type="button"], [type="submit"], [type="reset"], [type="image"], [type="checkbox"], [type="radio"], [type="range"], [type="file"], [type="color"]):not(:disabled), label[for], summary, .icon, .taskbar-app, .taskbar-item, .vw-task, .start-button, .start-menu li, .context-menu-item, [role="button"]:not([aria-disabled="true"]), [role="checkbox"]:not([aria-disabled="true"]), [role="switch"]:not([aria-disabled="true"]), [role="tab"]:not([aria-disabled="true"]), [style*="cursor: pointer"], [style*="cursor:pointer"]',
            text: 'input:not([type]), input:is([type="text"], [type="search"], [type="email"], [type="url"], [type="tel"], [type="password"], [type="number"]), textarea, [contenteditable="true"], [style*="cursor: text"]',
            move: '.window-header, .window-header .title, [draggable="true"], .weather-widget, [style*="cursor: move"], [style*="cursor:move"], [style*="cursor: grab"], [style*="cursor: grabbing"], [data-cursor-state="move"]',
            'not-allowed': ':disabled, [aria-disabled="true"], [style*="cursor: not-allowed"], [data-cursor-state="not-allowed"]',
            wait: '[aria-busy="true"], [style*="cursor: wait"], [data-cursor-state="wait"]',
            progress: '[style*="cursor: progress"], [data-cursor-state="progress"]',
            crosshair: '[style*="cursor: crosshair"], [data-cursor-state="crosshair"]',
            help: '[style*="cursor: help"], [data-cursor-state="help"]',
            'ew-resize': '.resizer.e, .resizer.w, [data-resize-dir="e"], [data-resize-dir="w"], [style*="cursor: e-resize"], [style*="cursor: w-resize"], [style*="cursor: col-resize"], [data-cursor-state="ew-resize"]',
            'ns-resize': '.resizer.n, .resizer.s, [data-resize-dir="n"], [data-resize-dir="s"], [style*="cursor: n-resize"], [style*="cursor: s-resize"], [style*="cursor: row-resize"], [data-cursor-state="ns-resize"]',
            'nwse-resize': '.resizer.nw, .resizer.se, .ww-resizer, [data-resize-dir="nw"], [data-resize-dir="se"], [style*="cursor: nw-resize"], [style*="cursor: se-resize"], [style*="cursor: nwse-resize"], [data-cursor-state="nwse-resize"]',
            'nesw-resize': '.resizer.ne, .resizer.sw, [data-resize-dir="ne"], [data-resize-dir="sw"], [style*="cursor: ne-resize"], [style*="cursor: sw-resize"], [style*="cursor: nesw-resize"], [data-cursor-state="nesw-resize"]'
        };
        const semanticRules = Object.entries(selectors).map(([state, selector]) => `${selector} { cursor: ${getCursor(state)} !important; }`).join('\n');
        const scrollbarRules = `::-webkit-scrollbar, ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { cursor: ${getCursor('default')} !important; }\n::-webkit-scrollbar-thumb { cursor: ${getCursor('move')} !important; }`;
        return `${semanticRules}\n${scrollbarRules}`;
    }

    function applyToDocument(doc) {
        if (!doc?.head) return;
        let style = doc.getElementById('ww-cursor-theme-style');
        if (!style) {
            style = doc.createElement('style');
            style.id = 'ww-cursor-theme-style';
            doc.head.appendChild(style);
        }
        if (doc.head.lastElementChild !== style) doc.head.appendChild(style);
        const css = rules();
        if (style.textContent !== css) style.textContent = css;
        doc.documentElement.dataset.wwCursorTheme = currentTheme;
    }

    function applyToFrames(doc = document) {
        doc.querySelectorAll('iframe').forEach((frame) => {
            if (!observedFrames.has(frame)) {
                observedFrames.add(frame);
                frame.addEventListener('load', () => applyToFrames(doc));
            }
            try {
                const child = frame.contentDocument;
                if (!child) return;
                applyToDocument(child);
                observeDocument(child);
                applyToFrames(child);
            } catch (_) { /* Cross-origin frames retain their own cursor. */ }
        });
    }

    function observeDocument(doc) {
        if (!doc.body || observedDocuments.has(doc)) return;
        observedDocuments.add(doc);
        const observer = new MutationObserver((records) => {
            if (records.some((record) => Array.from(record.addedNodes).some((node) =>
                node.nodeType === 1 && (node.tagName === 'IFRAME' || node.querySelector?.('iframe'))
            ))) applyToFrames(doc);
        });
        observer.observe(doc.body, { childList: true, subtree: true });
        const headObserver = new MutationObserver((records) => {
            const style = doc.getElementById('ww-cursor-theme-style');
            if (!style) { applyToDocument(doc); return; }
            if (style !== doc.head.lastElementChild && records.some((record) =>
                Array.from(record.addedNodes).some((node) => node.nodeType === 1 && ['LINK', 'STYLE'].includes(node.tagName))
            )) doc.head.appendChild(style);
        });
        headObserver.observe(doc.head, { childList: true });
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
        themes, states, get currentTheme() { return currentTheme; }, setTheme, getCursor, getAsset
    });
    global.WebWindows = global.WebWindows || {};
    global.WebWindows.cursor = manager;
    applyToDocument(document);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observeDocument(document);
            applyToFrames(document);
        }, { once: true });
    } else {
        observeDocument(document);
        applyToFrames(document);
    }
    global.addEventListener('storage', (event) => {
        if (event.key === storageKey && themes[event.newValue]) {
            currentTheme = event.newValue;
            applyToDocument(document);
            applyToFrames();
        }
    });
})(window);
