import { createBatterySdkBootstrap } from "../../shared/battery-sdk-bootstrap.js";
import { PREVIEW_SDK_INIT_PROTOCOL } from "./preview-protocol.js";

export function createPreviewSdkBootstrap({ sessionId, snapshotId }, launch) {
  return createBatterySdkBootstrap({ sessionId, snapshotId }, launch, PREVIEW_SDK_INIT_PROTOCOL);
}
