import { ProductionBatteryBroker, PRODUCTION_SDK_INIT_PROTOCOL } from "./production-battery-broker.js";
import { createBatterySdkBootstrap } from "../shared/battery-sdk-bootstrap.js";

export { ProductionBatteryBroker, PRODUCTION_SDK_INIT_PROTOCOL };
export function createProductionSdkBootstrap(binding, launch) {
  return createBatterySdkBootstrap(binding, launch, PRODUCTION_SDK_INIT_PROTOCOL);
}
