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
    const inlineImages = global.WebWindowsCursorImages || {};
    const pendingFrames = new Set();
    let mousePoint = null;
    let navigationPointer = null;
    let mouseTarget = null;
    const managedDocuments = new Set();
    const pointerDocuments = new WeakSet();
    const watchingFrames = new WeakSet();

    function bindPointerDocument(doc) {
        if (pointerDocuments.has(doc)) return;
        pointerDocuments.add(doc);
        const track = (event) => {
            if (event.pointerType !== 'mouse') {
                if (event.type === 'pointerdown') { mousePoint = null; updateNavigationPointer(); }
                return;
            }
            let x = event.clientX, y = event.clientY, realm = doc.defaultView;
            while (realm && realm !== global) {
                const frame = realm.frameElement;
                if (!frame) return;
                const rect = frame.getBoundingClientRect();
                x = rect.left + (x + frame.clientLeft) * rect.width / frame.offsetWidth;
                y = rect.top + (y + frame.clientTop) * rect.height / frame.offsetHeight;
                realm = realm.parent;
            }
            mousePoint = { x, y };
            mouseTarget = event.target;
            if (pendingFrames.size) updateNavigationPointer();
        };
        doc.addEventListener('pointermove', track, { passive: true });
        doc.addEventListener('pointerdown', track, { passive: true });
        doc.addEventListener('pointerout', (event) => {
            if (event.pointerType === 'mouse' && !event.relatedTarget && doc === document) {
                mousePoint = null;
                updateNavigationPointer();
            }
        }, { passive: true });
    }

    function updateNavigationPointer() {
        for (const frame of pendingFrames) if (!frame.isConnected) pendingFrames.delete(frame);
        const active = pendingFrames.size && mousePoint;
        for (const doc of managedDocuments) {
            if (doc !== document && !doc.defaultView?.frameElement?.isConnected) { managedDocuments.delete(doc); continue; }
            doc.documentElement.toggleAttribute('data-ww-cursor-navigation', Boolean(active));
        }
        if (!pendingFrames.size || !mousePoint || !document.body) {
            document.documentElement.removeAttribute('data-ww-cursor-navigation');
            navigationPointer?.remove();
            navigationPointer = null;
            return;
        }
        const target = mouseTarget?.isConnected ? mouseTarget : document.elementFromPoint(mousePoint.x, mousePoint.y);
        const computed = target ? target.ownerDocument.defaultView.getComputedStyle(target) : null;
        const interactionState = computed?.getPropertyValue('--ww-cursor-state').match(/\/assets\/cursors\/[^/]+\/([a-z-]+)\.png/);
        const state = interactionState?.[1] || computed?.getPropertyValue('--ww-cursor-render-state').trim() || 'default';
        const resolved = aliases[state] || state;
        if (!navigationPointer?.isConnected) {
            navigationPointer = document.createElement('img');
            navigationPointer.id = 'ww-navigation-pointer';
            navigationPointer.alt = '';
            navigationPointer.setAttribute('aria-hidden', 'true');
            navigationPointer.style.cssText = 'position:fixed;left:0;top:0;width:32px;height:32px;pointer-events:none!important;z-index:2147483647;';
            document.body.appendChild(navigationPointer);
        }
        const pixels = inlineImages[currentTheme]?.[resolved];
        const source = pixels ? `data:image/png;base64,${pixels}` : getAsset(resolved, currentTheme, 'png');
        if (navigationPointer.getAttribute('src') !== source) navigationPointer.src = source;
        navigationPointer.dataset.wwCursorState = resolved;
        const [x, y] = hotspot[resolved] || hotspot.default;
        navigationPointer.style.transform = `translate(${mousePoint.x - x}px, ${mousePoint.y - y}px)`;
        document.documentElement.setAttribute('data-ww-cursor-navigation', '');
    }

    function finishFrameNavigation(frame) {
        frame.removeAttribute('data-ww-cursor-loading');
        pendingFrames.delete(frame);
        updateNavigationPointer();
    }

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
        const inline = inlineImages[themeId]?.[resolved];
        const embedded = inline ? `url("data:image/png;base64,${inline}") ${x} ${y}, ` : '';
        return `${embedded}url("${png}") ${x} ${y}, url("${getAsset(resolved, themeId)}") ${x} ${y}, ${resolved}`;
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
            ['link', 'a[href], a[href] *, button:not(:disabled), button:not(:disabled) *, select:not(:disabled), select option:not(:disabled), input:is([type="button"], [type="submit"], [type="reset"], [type="image"], [type="checkbox"], [type="radio"], [type="range"], [type="file"], [type="color"]):not(:disabled), label[for], summary, [role="button"], [role="button"] *, [role="checkbox"], [role="switch"], [role="tab"], .button, .button *, .icon, .icon *, .taskbar-app, .taskbar-item, .vw-task, .start-button, .start-menu li, .context-menu-item'],
            ['text', 'input:not([type]), input:is([type="text"], [type="search"], [type="email"], [type="url"], [type="tel"], [type="password"], [type="number"]), textarea, [contenteditable="true"], [contenteditable="true"] *'],
            ['grab', '[draggable="true"]:not(:active)'],
            ['grabbing', '[draggable="true"]:active'],
            ['not-allowed', ':disabled, [aria-disabled="true"], [aria-disabled="true"] *'],
            ['wait', '[aria-busy="true"], [aria-busy="true"] *']
        ];
        const semanticRules = semantic.map(([state, selectors]) =>
            `${prefix}:is(${selectors})${lock} { --ww-cursor-render-state: ${state}; cursor: var(--ww-cursor-${state}) !important; }`
        ).join('\n');
        const resizeRules = Object.entries({
            n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
            ne: 'ne-resize', nw: 'nw-resize', se: 'se-resize', sw: 'sw-resize'
        }).map(([direction, state]) =>
            `${prefix}.resizer.${direction}${lock}, ${prefix}[data-resize-dir="${direction}"]${lock} { --ww-cursor-render-state: ${state}; cursor: var(--ww-cursor-${state}) !important; }`
        ).join('\n');
        const explicitRules = Object.keys(tokenStates).map((state) =>
            `${prefix}[data-ww-cursor="${state}"]${lock} { --ww-cursor-render-state: ${state}; cursor: var(--ww-cursor-${state}) !important; }`
        ).join('\n');
        const navigationRule = shadow ? '' : 'html[data-ww-cursor-navigation]:not(#ww-nav-a):not(#ww-nav-b), html[data-ww-cursor-navigation] body:not(#ww-nav-a):not(#ww-nav-b), html[data-ww-cursor-navigation] body *:not(#ww-nav-a):not(#ww-nav-b) { cursor: none !important; }';
        return `${root} { ${tokens} }\n${base} { --ww-cursor-render-state: default; cursor: var(--ww-cursor-default) !important; }\n${shadow ? `:host *${lock}` : `html body *${lock}`} { cursor: var(--ww-cursor-state, var(--ww-cursor-default)) !important; }\n${semanticRules}\n${resizeRules}\n${prefix}.ww-resizer${lock} { --ww-cursor-render-state: se-resize; cursor: var(--ww-cursor-se-resize) !important; }\n${explicitRules}\niframe[data-ww-cursor-loading] { visibility: hidden !important; pointer-events: none !important; }\n::-webkit-scrollbar, ::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { cursor: var(--ww-cursor-default) !important; }\n::-webkit-scrollbar-thumb { cursor: var(--ww-cursor-move) !important; }\n${navigationRule}`;
    }

    function applyToDocument(doc) {
        if (!doc?.head) return;
        managedDocuments.add(doc);
        bindPointerDocument(doc);
        doc.documentElement.toggleAttribute('data-ww-cursor-navigation', Boolean(pendingFrames.size && mousePoint));
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

    function watchFrameDocument(frame) {
        if (watchingFrames.has(frame)) return;
        watchingFrames.add(frame);
        const started = Date.now();
        const check = () => {
            if (!frame.isConnected || !pendingFrames.has(frame) || Date.now() - started > 10000) { watchingFrames.delete(frame); return; }
            const doc = frame.contentDocument;
            // Cross-origin documents cannot be prepared early; their load event ends navigation.
            if (!doc) { watchingFrames.delete(frame); return; }
            if (doc?.URL !== 'about:blank' && doc?.body) {
                watchingFrames.delete(frame);
                applyToFrame(frame);
                return;
            }
            global.setTimeout(check, 50);
        };
        global.setTimeout(check, 0);
    }

    function applyToFrame(frame, loaded = false) {
        if (!observedFrames.has(frame)) {
            observedFrames.add(frame);
            frame.addEventListener('load', () => applyToFrame(frame, true));
        }
        try {
            const child = frame.contentDocument;
            if (!child) {
                if (loaded) finishFrameNavigation(frame);
                frameLimitations.add(frame);
                return;
            }
            const destination = frame.getAttribute('src')?.trim();
            // A new iframe exposes an initial about:blank document before navigation.
            // Styling it starts cursor-image requests that navigation immediately aborts.
            if (child.URL === 'about:blank' && (frame.hasAttribute('srcdoc') ||
                (destination && destination !== 'about:blank'))) {
                frame.setAttribute('data-ww-cursor-loading', '');
                pendingFrames.add(frame);
                updateNavigationPointer();
                watchFrameDocument(frame);
                return;
            }
            applyToDocument(child);
            observeDocument(child);
            discover(child);
            frameLimitations.delete(frame);
            if (pendingFrames.has(frame) && child.body) {
                const image = new child.defaultView.Image();
                const inline = inlineImages[currentTheme]?.default;
                image.src = inline ? `data:image/png;base64,${inline}` : getAsset('default', currentTheme, 'png');
                const ready = typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve();
                ready.then(() => {
                    try {
                        if (frame.contentDocument === child) {
                            frame.removeAttribute('data-ww-cursor-loading');
                            if (loaded || child.readyState === 'complete') finishFrameNavigation(frame);
                        }
                    } catch (_) { finishFrameNavigation(frame); }
                });
            }
        } catch (_) {
            if (loaded) finishFrameNavigation(frame);
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
            if (event.target?.tagName === 'IFRAME') applyToFrame(event.target, true);
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
            if (records.some((record) => record.removedNodes.length)) updateNavigationPointer();
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
        updateNavigationPointer();
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
            updateNavigationPointer();
            for (const root of liveRoots) {
                if (root.host.isConnected) applyToShadow(root);
                else liveRoots.delete(root);
            }
        }
    });
})(window);
