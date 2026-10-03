import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(
  new URL("../assets/js/file-types.js", import.meta.url),
  "utf8"
);

function makeHost() {
  const store = new Map();
  const listeners = new Map();
  const windowObject = {
    WebWindows: {},
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k)
    },
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    dispatchEvent() {}
  };
  const context = vm.createContext({
    window: windowObject,
    localStorage: windowObject.localStorage,
    CustomEvent: class {
      constructor(type, init) { this.type = type; this.detail = init?.detail; }
    },
    console, Object, Array, String, JSON, Map, Promise, Error, RegExp, URLSearchParams
  });
  vm.runInContext(source, context, { filename: "file-types.js" });
  return windowObject.WebWindows.fileTypes;
}

// extension normalization
{
  const ft = makeHost();
  assert.equal(ft.normalizeExtension("JPG"), ".jpg");
  assert.equal(ft.normalizeExtension(".Jpg"), ".jpg");
  assert.equal(ft.extensionOf("photo.JPG"), ".jpg");
  assert.equal(ft.extensionOf("README"), "");
}

// Case 1: photo.JPG -> jpeg type
{
  const ft = makeHost();
  const r = ft.resolve({ name: "photo.JPG" });
  assert.equal(r.id, "webwindows.image.jpeg");
  assert.equal(r.extension, ".jpg");
  assert.equal(r.mime, "image/jpeg");
}

// MIME resolution
{
  const ft = makeHost();
  assert.equal(ft.resolve({ name: "data.bin", mimeType: "image/png" }).id, "webwindows.image.png");
}

// Case 2: no-extension files never error
{
  const ft = makeHost();
  for (const name of ["README", "LICENSE", "Dockerfile", "Makefile"]) {
    const r = ft.resolve({ name });
    assert.ok(r.id, name);
    assert.equal(r.extension, "", name);
  }
}

// Case 3: unknown
{
  const ft = makeHost();
  const r = ft.resolve({ name: "something.xyz123" });
  assert.equal(r.id, "webwindows.file.unknown");
  assert.equal(JSON.stringify([...r.handlers]), "[]");
  assert.equal(r.defaultHandler, null);
}

// Case 4: multiple handlers + open-with menu
{
  const ft = makeHost();
  const handlers = ft.getHandlers("webwindows.image.jpeg");
  assert.ok(handlers.includes("webwindows.photos"));
  assert.ok(handlers.includes("webwindows.paint"));
  const menu = ft.getOpenWithMenu({ name: "a.jpg" });
  assert.equal(menu.typeId, "webwindows.image.jpeg");
  assert.equal(JSON.stringify([...menu.handlers]), JSON.stringify([...handlers]));
}

// Case 5: user override persists (system default untouched)
{
  const ft = makeHost();
  const before = ft.get("webwindows.image.jpeg");
  assert.equal(before.defaultHandler, "webwindows.photos");
  ft.setDefaultHandler("webwindows.image.jpeg", "webwindows.paint");
  assert.equal(ft.resolve({ name: "a.jpg" }).defaultHandler, "webwindows.paint");
  assert.equal(ft.get("webwindows.image.jpeg").systemDefaultHandler, "webwindows.photos");
  assert.equal(ft.get("webwindows.image.jpeg").userOverride, "webwindows.paint");
}

// Case 6 + 7: install/uninstall third-party association, files untouched
{
  const ft = makeHost();
  assert.equal(ft.resolve({ name: "doc.test" }).id, "webwindows.file.unknown");
  ft.installAppAssociations("com.example.test", [
    { type: "com.example.test", extensions: [".test"], mimeTypes: ["application/x-example"], actions: ["open"] }
  ]);
  assert.equal(ft.resolve({ name: "doc.test" }).id, "com.example.test");
  assert.equal(JSON.stringify([...ft.getHandlers("com.example.test")]), '["com.example.test"]');
  const removed = ft.uninstallAppAssociations("com.example.test");
  assert.ok(removed.includes("com.example.test"));
  const after = ft.resolve({ name: "doc.test" });
  assert.equal(after.id, "com.example.test"); // type shell retained
  assert.equal(JSON.stringify([...after.handlers]), "[]"); // but no handler left
  assert.equal(after.defaultHandler, null);
}

// conflicting extension appends, never steals default
{
  const ft = makeHost();
  ft.installAppAssociations("com.a.app", [{ type: "com.a.type", extensions: [".foo"], actions: ["open"] }]);
  // second app claims same ext under its own type id via register overlay path:
  ft.register({ id: "webwindows.text.plain", extensions: [], mimeTypes: [], handlers: ["com.b.app"] });
  const handlers = ft.getHandlers("webwindows.text.plain");
  assert.ok(handlers.includes("com.b.app"));
  assert.equal(ft.getDefaultHandler("webwindows.text.plain"), "webwindows.system.file-preview");
}

// upgrade sync adds/removes per-app handlers only
{
  const ft = makeHost();
  ft.installAppAssociations("com.up.app", [{ type: "com.up.type", extensions: [".foo"], actions: ["open"] }]);
  ft.installAppAssociations("com.other.app", [{ type: "com.up.type", extensions: [".foo"], actions: ["open"] }]);
  ft.syncAppUpgrade("com.up.app", [{ type: "com.up.type", extensions: [".foo", ".bar"], actions: ["open"] }]);
  assert.equal(ft.resolve({ name: "x.bar" }).id, "com.up.type");
  ft.syncAppUpgrade("com.up.app", [{ type: "com.up.type", extensions: [".bar"], actions: ["open"] }]);
  // .foo no longer claimed by com.up.app alone; other app handler intact
  assert.ok(ft.getHandlers("com.up.type").includes("com.other.app"));
}

// Case 8: ww packages recognized, not plain zip
{
  const ft = makeHost();
  assert.equal(ft.resolve({ name: "Theme.wwtheme" }).id, "webwindows.package.theme");
  assert.equal(ft.resolve({ name: "Lang.wwpkg" }).id, "webwindows.package.system");
  const r = ft.resolve({ name: "Weather.wwapp" });
  assert.equal(r.id, "webwindows.package.application");
  assert.equal(r.mime, "application/vnd.webwindows.app");
  assert.notEqual(r.id, "webwindows.archive.zip");
}

// Case 9: invalid wwapp manifest rejected
{
  const ft = makeHost();
  assert.equal(ft.validateAppPackageManifest({}).ok, false);
  assert.equal(ft.validateAppPackageManifest({ format: "webwindows.app", formatVersion: 1, id: "com.example.app", name: "Example", version: "1.0.0", entry: "index.html", fileAssociations: [] }).ok, true);
  const bad = ft.validateWwAppStructure(["manifest.json"], { format: "webwindows.app", formatVersion: 1, id: "com.example.app", name: "E", version: "1.0.0", entry: "index.html" });
  assert.equal(bad.ok, false); // missing entry file
  const good = ft.validateWwAppStructure(["manifest.json", "index.html"], { format: "webwindows.app", formatVersion: 1, id: "com.example.app", name: "E", version: "1.0.0", entry: "index.html" });
  assert.equal(good.ok, true);
  // system package must not grant system-grade permissions in v1
  assert.equal(ft.validateSystemPackageManifest({ format: "webwindows.package", formatVersion: 1, id: "com.example.sys", name: "S", version: "1.0.0", entry: "index.html", permissions: ["system"] }).ok, false);
}

// .wwtheme / .wwpkg manifest validation
{
  const ft = makeHost();
  assert.equal(ft.validateThemePackageManifest({ format: "webwindows.theme", formatVersion: 1, id: "com.example.theme", name: "T", version: "1.0.0", entry: "theme.json" }).ok, true);
  assert.equal(ft.validateSystemPackageManifest({ format: "webwindows.package", formatVersion: 1, id: "com.example.sys", name: "S", version: "1.0.0", entry: "index.html", permissions: [] }).ok, true);
}

// register validation rejects bad default + bad association
{
  const ft = makeHost();
  assert.throws(() => ft.register({ id: "bad", extensions: [], handlers: [] }));
  assert.throws(() => ft.register({ id: "com.example.x", extensions: [], handlers: ["a"], defaultHandler: "b" }));
  assert.throws(() => ft.installAppAssociations("com.example.x", [{ type: "com.example.x", extensions: [], mimeTypes: [] }]));
  assert.throws(() => ft.setDefaultHandler("webwindows.image.jpeg", "com.ghost.app"));
}

// file-dialog compatibility: types + mime wildcards expand to extensions
{
  const ft = makeHost();
  const accept = ft.toAccept({ types: ["webwindows.image.jpeg", "webwindows.image.png"] });
  assert.ok(accept.includes(".jpg") && accept.includes(".png"));
  const wild = ft.toAccept({ mimeTypes: ["image/*"] });
  assert.ok(wild.includes(".jpg") && wild.includes(".png"));
  assert.equal(ft.matchesFilter({ name: "a.jpg" }, { mimeTypes: ["image/*"] }), true);
  assert.equal(ft.matchesFilter({ name: "a.jpg" }, { extensions: [".png"] }), false);
}

// icons: type -> category fallback, never a per-manager switch
{
  const ft = makeHost();
  assert.equal(ft.getIcon({ name: "a.jpg" }), "system:image");
  assert.equal(ft.getIcon({ name: "x.xyz123" }), "system:file");
  assert.equal(ft.categoryIcon("audio"), "system:audio");
}

console.log("file-types smoke test passed");
