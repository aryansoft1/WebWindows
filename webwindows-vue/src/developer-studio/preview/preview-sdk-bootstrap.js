import { createBatterySdkBootstrap } from "../../shared/battery-sdk-bootstrap.js";
import { createComposedSdkBootstrap } from "./composed-sandbox-bootstrap.js";
import { PREVIEW_SDK_INIT_PROTOCOL } from "./preview-protocol.js";

export function createPreviewSdkBootstrap({ sessionId, snapshotId }, launch) {
  const identity = { sessionId, snapshotId };
  /* the composed bootstrap takes over whenever the ai audit pilot facade is present: battery
   * behavior is mirrored verbatim there because one frozen WebWindows definition must own
   * both namespaces. */
  if (launch?.ai?.facadeEnabled) {
    return createComposedSdkBootstrap(identity, launch, PREVIEW_SDK_INIT_PROTOCOL);
  }
  return createBatterySdkBootstrap(identity, launch, PREVIEW_SDK_INIT_PROTOCOL);
}
