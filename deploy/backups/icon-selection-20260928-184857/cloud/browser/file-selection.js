/*
 * Shared multi-file selection for the WebWindows file surfaces.
 *
 * Both file controls (the cloud resource browser and the on-device "此设备"
 * panel) render a grid of items and previously supported exactly one selected
 * item at a time, with no marquee and no dragging. A normal desktop supports:
 *
 *   - click                 select one
 *   - Ctrl/Cmd + click      toggle one item in the selection
 *   - Shift + click         extend the selection from the anchor
 *   - Ctrl/Cmd + A          select everything
 *   - Escape                clear the selection
 *   - drag on empty space  rubber-band marquee selection
 *   - drag on an item       move the whole current selection
 *
 * Design notes that matter for correctness:
 *
 * - The marquee is driven by pointer events, not mouse events, so touch and
 *   pen produce the same behaviour as a mouse.
 * - A drag that starts on an item is a *move* of the current selection and must
 *   not also paint a marquee. A drag that starts on empty space paints a
 *   marquee. Distinguishing them by `event.target` is what keeps "drag a file
 *   onto a folder" and "lasso some files" from fighting each other.
 * - The marquee rectangle is positioned in the *container's* client space, not
 *   the page's, so it stays correct inside the scrolling panel.
 * - Selection is additive across the additive modifier only: plain drag always
 *   *replaces* the selection, matching desktop behaviour.
 *
 * The module is dependency-free and exposes a factory so each surface can bind
 * its own item selector, anchor rules and drag payload without duplicating any
 * of this logic.
 */
(function (global) {
  "use strict";

  const DRAG_MIME = "application/x-webwindows-files";
  const MARQUEE_CLASS = "selection-marquee";

  function toRect(a, b) {
    return {
      left: Math.min(a.x, b.x),
      top: Math.min(a.y, b.y),
      width: Math.abs(a.x - b.x),
      height: Math.abs(a.y - b.y),
    };
  }

  function intersects(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  function createFileSelection(options) {
    const container = options.container;
    const itemSelector = options.itemSelector || ".file-item";
    // Optional predicate: an item may opt out of being selectable.
    const isSelectable = options.isSelectable || (() => true);
    // Called with the current selection whenever it changes.
    const onChange = options.onChange || (() => {});
    // Builds the payload for a drag. Return null to refuse the drag.
    const buildPayload = options.buildPayload || (() => null);
    // Optional drop target wiring: isTarget(el) / onDrop(target, payload).
    const isDropTarget = options.isDropTarget || (() => false);
    const onDrop = options.onDrop || (() => {});

    let selection = new Set();
    let anchor = null;
    let marquee = null;
    let dragAdditive = false;

    function items() {
      return Array.from(container.querySelectorAll(itemSelector));
    }

    function paint() {
      items().forEach((item) => {
        item.classList.toggle("selected", selection.has(item));
        item.setAttribute("aria-selected", selection.has(item) ? "true" : "false");
      });
      onChange(Array.from(selection));
    }

    function setSelection(next, anchorItem) {
      selection = new Set(next);
      anchor = anchorItem === undefined ? null : anchorItem;
      paint();
    }

    function clear() {
      selection = new Set();
      anchor = null;
      paint();
    }

    function selectOnly(item) {
      setSelection([item], item);
    }

    function toggle(item) {
      const next = new Set(selection);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      // Keep the anchor on a still-selected item so Shift keeps extending from
      // somewhere visible; otherwise move it to the toggled item.
      setSelection(next, next.has(anchor) ? anchor : item);
    }

    function extendTo(item) {
      const all = items();
      const from = anchor && all.includes(anchor) ? anchor : item;
      const next = new Set();
      const start = all.indexOf(from);
      const end = all.indexOf(item);
      if (start < 0 || end < 0) {
        selectOnly(item);
        return;
      }
      const [lo, hi] = start < end ? [start, end] : [end, start];
      for (let index = lo; index <= hi; index += 1) {
        const candidate = all[index];
        if (isSelectable(candidate)) next.add(candidate);
      }
      setSelection(next, from);
    }

    function ensureMarquee() {
      if (marquee) return marquee;
      const node = document.createElement("div");
      node.className = MARQUEE_CLASS;
      node.setAttribute("aria-hidden", "true");
      container.appendChild(node);
      marquee = node;
      return node;
    }

    function removeMarquee() {
      if (!marquee) return;
      marquee.remove();
      marquee = null;
    }

    function itemAt(x, y) {
      const node = document.elementFromPoint(x, y);
      if (!node || !container.contains(node)) return null;
      const item = node.closest(itemSelector);
      return item && container.contains(item) && isSelectable(item) ? item : null;
    }

    function selectInRect(rect, additive) {
      const box = container.getBoundingClientRect();
      const next = additive ? new Set(selection) : new Set();
      let anchorItem = anchor;
      items().forEach((item) => {
        if (!isSelectable(item)) return;
        const itemRect = item.getBoundingClientRect();
        const relative = {
          left: itemRect.left - box.left + container.scrollLeft,
          top: itemRect.top - box.top + container.scrollTop,
          right: itemRect.right - box.left + container.scrollLeft,
          bottom: itemRect.bottom - box.top + container.scrollTop,
        };
        if (intersects(relative, rect)) {
          next.add(item);
          if (!anchorItem) anchorItem = item;
        }
      });
      setSelection(next, anchorItem);
    }

    function beginMarquee(event) {
      const box = container.getBoundingClientRect();
      const start = {
        x: event.clientX - box.left + container.scrollLeft,
        y: event.clientY - box.top + container.scrollTop,
      };
      const node = ensureMarquee();
      let moved = false;

      function move(moveEvent) {
        const current = {
          x: moveEvent.clientX - box.left + container.scrollLeft,
          y: moveEvent.clientY - box.top + container.scrollTop,
        };
        const rect = toRect(start, current);
        // A couple of pixels of jitter must not clear an existing selection.
        if (!moved && rect.width < 3 && rect.height < 3) return;
        moved = true;
        node.style.left = `${rect.left}px`;
        node.style.top = `${rect.top}px`;
        node.style.width = `${rect.width}px`;
        node.style.height = `${rect.height}px`;
        selectInRect(rect, dragAdditive);
      }

      function end() {
        container.removeEventListener("pointermove", move);
        container.removeEventListener("pointerup", end);
        container.removeEventListener("pointercancel", end);
        document.removeEventListener("keydown", onEscapeDuringDrag, true);
        removeMarquee();
        // A click that never moved is a click on empty space: clear, unless the
        // additive modifier asked us to keep what was already selected.
        if (!moved && !dragAdditive) clear();
      }

      function onEscapeDuringDrag(keyEvent) {
        if (keyEvent.key !== "Escape") return;
        removeMarquee();
        clear();
      }

      container.addEventListener("pointermove", move);
      container.addEventListener("pointerup", end);
      container.addEventListener("pointercancel", end);
      document.addEventListener("keydown", onEscapeDuringDrag, true);
    }

    function onPointerDown(event) {
      // Left button only. `event.button` is 0 for touch/pen by specification.
      if (event.button !== 0) return;
      const item = event.target.closest(itemSelector);
      if (!item || !container.contains(item) || !isSelectable(item)) {
        // Empty space: start a marquee. The additive modifier is read at
        // gesture start, matching how desktop lassoes behave.
        dragAdditive = event.ctrlKey || event.metaKey;
        if (event.target.closest("button, a, input, select, textarea")) {
          // Let real controls keep their own clicks; only lasso bare canvas.
          if (event.target.closest("[data-selection-surface]")) {
            beginMarquee(event);
          }
          return;
        }
        beginMarquee(event);
        return;
      }

      const additive = event.ctrlKey || event.metaKey;
      if (additive) {
        toggle(item);
        return;
      }
      if (event.shiftKey) {
        extendTo(item);
        return;
      }
      if (!selection.has(item)) selectOnly(item);
      // Already selected: keep the multi-selection so a drag moves all of it.
      anchor = item;
    }

    function onDoubleClick(event) {
      const item = event.target.closest(itemSelector);
      if (!item || !container.contains(item)) return;
      // A double click must never leave a partial multi-selection behind.
      selectOnly(item);
    }

    function onDragStart(event) {
      const item = event.target.closest(itemSelector);
      if (!item || !container.contains(item) || !isSelectable(item)) return;
      if (!selection.has(item)) selectOnly(item);
      const payload = buildPayload(Array.from(selection), item);
      if (!payload) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.effectAllowed = "copyMove";
      try {
        event.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
        event.dataTransfer.setData("text/plain", payload.label || "");
      } catch (error) {
        // A payload that will not serialize must not start a broken drag.
        event.preventDefault();
      }
    }

    function onDragOver(event) {
      if (!event.dataTransfer || !Array.from(event.dataTransfer.types || []).includes(DRAG_MIME)) return;
      const target = event.target.closest("[data-drop-target]");
      if (!target || !isDropTarget(target)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      target.classList.add("drop-target");
    }

    function onDragLeave(event) {
      const target = event.target.closest("[data-drop-target]");
      if (target) target.classList.remove("drop-target");
    }

    function onDropEvent(event) {
      const target = event.target.closest("[data-drop-target]");
      if (target) target.classList.remove("drop-target");
      if (!target || !isDropTarget(target)) return;
      const raw = event.dataTransfer?.getData(DRAG_MIME);
      if (!raw) return;
      event.preventDefault();
      let payload = null;
      try {
        payload = JSON.parse(raw);
      } catch (error) {
        return;
      }
      onDrop(target, payload, event);
    }

    function onKeyDown(event) {
      if (event.key === "Escape" && selection.size) {
        clear();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && (event.key === "a" || event.key === "A")) {
        event.preventDefault();
        setSelection(items().filter(isSelectable), anchor);
      }
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("dblclick", onDoubleClick);
    container.addEventListener("dragstart", onDragStart);
    container.addEventListener("dragover", onDragOver);
    container.addEventListener("dragleave", onDragLeave);
    container.addEventListener("drop", onDropEvent);
    document.addEventListener("keydown", onKeyDown);

    return {
      get selection() { return Array.from(selection); },
      clear,
      selectOnly,
      setSelection,
      isSelected: (item) => selection.has(item),
      destroy() {
        container.removeEventListener("pointerdown", onPointerDown);
        container.removeEventListener("dblclick", onDoubleClick);
        container.removeEventListener("dragstart", onDragStart);
        container.removeEventListener("dragover", onDragOver);
        container.removeEventListener("dragleave", onDragLeave);
        container.removeEventListener("drop", onDropEvent);
        document.removeEventListener("keydown", onKeyDown);
        removeMarquee();
      },
    };
  }

  const api = { create: createFileSelection, DRAG_MIME, MARQUEE_CLASS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.WebWindowsFileSelection = api;
})(typeof window !== "undefined" ? window : globalThis);
