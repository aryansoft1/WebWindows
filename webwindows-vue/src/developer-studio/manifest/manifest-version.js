export const LEGACY_MANIFEST_VERSION = 1;
export const CURRENT_MANIFEST_VERSION = 2;
export const CURRENT_SDK_API_VERSION = "1";

export function selectManifestVersion(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return null;
  if (!Object.prototype.hasOwnProperty.call(manifest, "manifestVersion")) return LEGACY_MANIFEST_VERSION;
  return manifest.manifestVersion === CURRENT_MANIFEST_VERSION ? CURRENT_MANIFEST_VERSION : null;
}

export function migrateManifestV1ToV2(manifest, options = {}) {
  if (selectManifestVersion(manifest) !== LEGACY_MANIFEST_VERSION) {
    throw new Error("Only a legacy Manifest v1 can be migrated to v2.");
  }
  const permissions = options.permissions || [];
  if (!Array.isArray(permissions) || permissions.some((permission) => typeof permission !== "string")) {
    throw new TypeError("Migration permissions must be an explicit string array.");
  }
  return {
    ...structuredClone(manifest),
    manifestVersion: CURRENT_MANIFEST_VERSION,
    sdk: { apiVersion: CURRENT_SDK_API_VERSION },
    permissions: [...permissions]
  };
}
