import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  build: {
    outDir:resolve(currentDirectory, "../dist-production-broker"), emptyOutDir:true, sourcemap:false, target:"es2022",
    lib: {
      entry:resolve(currentDirectory, "src/production-broker/entry.js"),
      name:"WebWindowsProductionBatteryBrokerV1", formats:["iife"], fileName:() => "production-battery-broker.global.js"
    }
  }
});
