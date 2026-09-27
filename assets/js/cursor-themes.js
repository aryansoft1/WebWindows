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
        link: 'pointer',
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
    const observedRoots = new WeakSet();
    const liveRoots = new Set();
    const frameLimitations = new Set();

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

    const tokenStates = Object.freeze({
        default: 'default', link: 'pointer', pointer: 'pointer', text: 'text',
        wait: 'wait', progress: 'progress', move: 'move', grab: 'grab',
        grabbing: 'grabbing', 'not-allowed': 'not-allowed', crosshair: 'crosshair',
        help: 'help', 'n-resize': 'n-resize', 's-resize': 's-resize',
        'e-resize': 'e-resize', 'w-resize': 'w-resize', 'ne-resize': 'ne-resize',
        'nw-resize': 'nw-resize', 'se-resize': 'se-resize', 'sw-resize': 'sw-resize',
        'ew-resize': 'ew-resize', 'ns-resize': 'ns-resize',
        'nwse-resize': 'nwse-resize', 'nesw-resize': 'nesw-resize'
    });

    function rules(shadow = false) {
        const tokens = Object.entries(tokenStates).map(([token, state]) =>
            `--ww-cursor-${token}: ${getCursor(state)};`
        ).join('\n');
        const root = shadow ? ':host' : ':root';
        const base = shadow ? ':host, :host *' : 'html, body, body *';
        const prefix = shadow ? ':host ' : 'body ';
        // One ID of specificity keeps later third-party !important rules from undoing the contract.
        const lock = ':not(#ww-cursor-manager-specificity)';
        const semantic = [
            ['move', '.window-header, .window-header *, .ww-titlebar, .ww-titlebar *, .weather-widget, .weather-widget *, [draggable="true"], [draggable="true"] *'],
            ['link', 'a[href], a[href] *, button:not(:disabled), button:not(:disabled) *, select:not(:disabled), input:is([type="button"], [type="submit"], [type="reset"], [type="image"], [type="checkbox"], [type="radio"], [type="range"], [type="file"], [type="color"]):not(:disabled), label[for], summary, [role="button"], [role="button"] *, [role="checkbox"], [role="switch"], [role="tab"], .button, .button *, .icon, .icon *, .taskbar-app, .taskbar-item, .vw-task, .start-button, .start-menu li, .context-menu-item'],
            ['text', 'input:not([type]), input:is([type="text"], [type="search"], [type="email"], [type="url"], [type="tel"], [type="password"], [type="number"]), textarea, [contenteditable="true"], [contenteditable="true"] *'],
            ['grab', '[draggable="true"]:not(:active)'],
            ['grabbing', '[draggable="true"]:active'],
            ['not-allowed', ':disabled, [aria-disabled="true"], [aria-disabled="true"] *'],
            ['wait', '[aria-busy="true"], [aria-busy="true"] *']
        ];
        const semanticRules = semantic.map(([state, selectors]) =>
            `${prefix}:is(${selectors})${lock} { cursor: var(--ww-cursor-${state}) !important; }`
        ).join('\n');
        const resizeRules = Object.entries({
            n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
            ne: 'ne-resize', nw: 'nw-resize', se: 'se-resize', sw: 'sw-resize'
        }).map(([direction, state]) =>
            `${prefix}.resizer.${direction}${lock}, ${prefix}[data-resize-dir="${direction}"]${lock} { cursor: var(--ww-cursor-${state}) !important; }`
        ).join('\n');
        const explicitRules = Object.keys(tokenStates).map((state) =>
            `${prefix}[data-ww-cursor="${state}"]${lock} { cursor: var(--ww-cursor-${state}) !important; }`
        ).join('\n');
        return `${root} { ${tokens} }\n${base} { cursor: var(--ww-cursor-default) !important; }\n${shadow ? `:host *${lock}` : `html body *${lock}`} { cursor: var(--ww-cursor-state, var(--ww-cursor-default)) !important; }\n${semanticRules}\n${resizeRules}\n${prefix}.ww-resizer${lock} { cursor: var(--ww-cursor-se-resize) !important; }\n${explicitRules}\niframe[data-ww-cursor-loading] { pointer-events: none !important; }\n::-webkit-scrollbar, ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { cursor: var(--ww-cursor-default) !important; }\n::-webkit-scrollbar-thumb { cursor: var(--ww-cursor-move) !important; }`;
    }

    function applyToDocument(doc) {
        if (!doc?.head) return;
        let style = doc.getElementById('ww-cursor-theme-style');
        if (!style) {
            style = doc.createElement('style');
            style.id = 'ww-cursor-theme-style';
            doc.head.appendChild(style);
        }
        if (style.parentNode !== doc.head) doc.head.appendChild(style);
        const css = rules();
        if (style.textContent !== css) style.textContent = css;
        doc.documentElement.dataset.wwCursorTheme = currentTheme;
    }

    function applyToShadow(root) {
        if (!root) return;
        liveRoots.add(root);
        let style = root.querySelector('style[data-ww-cursor-manager]');
        if (!style) {
            style = root.ownerDocument.createElement('style');
            style.dataset.wwCursorManager = '';
            root.appendChild(style);
        }
        const css = rules(true);
        if (style.textContent !== css) style.textContent = css;
        if (!observedRoots.has(root)) {
            observedRoots.add(root);
            new MutationObserver((records) => {
                for (const record of records) {
                    if (record.type === 'attributes') normalizeInlineCursor(record.target);
                    else for (const node of record.addedNodes) discover(node);
                }
                if (!root.querySelector('style[data-ww-cursor-manager]')) applyToShadow(root);
            }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        }
        discover(root);
    }

    function normalizeInlineCursor(element) {
        const value = element.style?.getPropertyValue('cursor').trim();
        if (!value) return;
        element.style.removeProperty('cursor');
        if (element.hasAttribute('data-ww-cursor') || element.matches('a[href], button, input, textarea, select, [contenteditable], [role], [aria-busy], [aria-disabled], :disabled')) return;
        const token = value.match(/^var\(--ww-cursor-([a-z-]+)(?:,|\))/);
        const state = token ? token[1] : value === 'pointer' ? 'link' : value;
        if (tokenStates[state]) element.dataset.wwCursor = state;
    }

    function discover(node) {
        if (!node || !node.querySelectorAll) return;
        const elements = node.nodeType === 1 ? [node, ...node.querySelectorAll('*')] : node.querySelectorAll('*');
        for (const element of elements) {
            normalizeInlineCursor(element);
            if (element.shadowRoot) applyToShadow(element.shadowRoot);
            if (element.tagName === 'IFRAME') applyToFrame(element);
        }
    }

    function applyToFrame(frame) {
        if (!observedFrames.has(frame)) {
            observedFrames.add(frame);
            frame.addEventListener('load', () => applyToFrame(frame));
        }
        try {
            const child = frame.contentDocument;
            if (!child) {
                frame.removeAttribute('data-ww-cursor-loading');
                frameLimitations.add(frame);
                return;
            }
            const destination = frame.getAttribute('src')?.trim();
            // A new iframe exposes an initial about:blank document before navigation.
            // Styling it starts cursor-image requests that navigation immediately aborts.
            if (child.URL === 'about:blank' && (frame.hasAttribute('srcdoc') ||
                (destination && destination !== 'about:blank'))) {
                frame.setAttribute('data-ww-cursor-loading', '');
                return;
            }
            applyToDocument(child);
            observeDocument(child);
            discover(child);
            frameLimitations.delete(frame);
            if (frame.hasAttribute('data-ww-cursor-loading')) {
                const image = new child.defaultView.Image();
                image.src = getAsset('default', currentTheme, 'png');
                const ready = typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve();
                ready.then(() => {
                    try {
                        if (frame.contentDocument === child) frame.removeAttribute('data-ww-cursor-loading');
                    } catch (_) { frame.removeAttribute('data-ww-cursor-loading'); }
                });
            }
        } catch (_) {
            frame.removeAttribute('data-ww-cursor-loading');
            frameLimitations.add(frame);
        }
    }

    function applyToFrames(doc = document) {
        discover(doc);
    }

    function observeDocument(doc) {
        if (!doc.body || observedDocuments.has(doc)) return;
        observedDocuments.add(doc);
        doc.addEventListener('load', (event) => {
            if (event.target?.tagName === 'IFRAME') applyToFrame(event.target);
        }, true);
        const realm = doc.defaultView;
        if (realm?.Element?.prototype && !realm.Element.prototype.__wwCursorWrapped) {
            const original = realm.Element.prototype.attachShadow;
            if (original) {
                realm.Element.prototype.attachShadow = function (options) {
                    const root = original.call(this, options);
                    applyToShadow(root);
                    return root;
                };
                Object.defineProperty(realm.Element.prototype, '__wwCursorWrapped', { value: true });
            }
        }
        new MutationObserver((records) => {
            for (const record of records) {
                if (record.type === 'attributes') normalizeInlineCursor(record.target);
                else for (const node of record.addedNodes) discover(node);
            }
        }).observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        const headObserver = new MutationObserver(() => {
            const style = doc.getElementById('ww-cursor-theme-style');
            if (!style || style.parentNode !== doc.head) applyToDocument(doc);
        });
        headObserver.observe(doc.head, { childList: true });
    }

    function setTheme(themeId) {
        if (!themes[themeId]) return false;
        currentTheme = themeId;
        try { global.localStorage.setItem(storageKey, themeId); } catch (_) {}
        applyToDocument(document);
        applyToFrames();
        for (const root of liveRoots) {
            if (root.host.isConnected) applyToShadow(root);
            else liveRoots.delete(root);
        }
        global.dispatchEvent(new CustomEvent('webwindows:cursor-theme-changed', { detail: { themeId } }));
        return true;
    }

    try {
        const saved = global.localStorage.getItem(storageKey);
        if (themes[saved]) currentTheme = saved;
    } catch (_) {}

    const manager = Object.freeze({
        themes, states, tokenStates, get currentTheme() { return currentTheme; },
        get crossOriginFrameCount() { return frameLimitations.size; },
        setTheme, getCursor, getAsset
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
            for (const root of liveRoots) {
                if (root.host.isConnected) applyToShadow(root);
                else liveRoots.delete(root);
            }
        }
    });
})(window);
