export {};

declare global {
  namespace WebWindowsPublicAPI {
    type Unsubscribe = () => void;
    type AdapterId = "browser" | "android" | "windows" | string;
    type PermissionState = "granted" | "prompt" | "denied" | "revoked" | "unknown" | "unsupported";
    type StorageEntryKind = "file" | "directory" | "unknown";

    interface Capability {
      supported: boolean;
      source: string;
      scope?: string;
    }

    interface DeviceRuntimeCapabilities {
      battery: boolean;
      network: boolean;
      display: boolean;
      audio: boolean;
      storage: boolean;
      power: boolean;
      updater: boolean;
    }

    interface DeviceRuntimeInfo {
      runtimeName: "Browser Runtime" | "Dreama Runtime";
      runtimeVersion: string | null;
      bridgeVersion: string | null;
      platform: "browser" | "android" | "windows";
      platformVersion: string | null;
      engine: "browser" | "android-webview" | "webview2" | "unknown";
      engineVersion: string | null;
      deviceClass: "phone" | "tablet" | "desktop" | "laptop" | "unknown";
      native: boolean;
      trusted: boolean;
      capabilities: Readonly<DeviceRuntimeCapabilities>;
    }

    interface DeviceRuntimeError {
      code: string;
      message: string;
      platform: string;
      method: string;
      details: unknown;
    }

    interface DeviceSystemInfo {
      supported: true;
      host: AdapterId;
      platform: string;
      mobile: boolean;
    }

    interface NetworkState {
      supported: true;
      online: boolean;
      connected: boolean;
      internetAvailable: boolean | null;
      transport: "wifi" | "cellular" | "ethernet" | "vpn" | "other" | "unknown" | "none";
      kind: "wifi" | "cellular" | "ethernet" | "offline" | "unknown";
      effectiveType: string | null;
      downlink: number | null;
      rtt: number | null;
      saveData: boolean | null;
      source: string;
    }

    interface BatteryState {
      supported: boolean;
      present: boolean | null;
      level: number | null;
      charging: boolean | null;
      connected: boolean | null;
      source: string;
    }

    interface BrightnessState {
      supported: boolean;
      value: number | null;
      scope: "native" | "visual";
      source: string;
      systemDefault?: boolean;
      reason?: string;
    }

    interface ScreenInfo {
      supported: boolean;
      width: number | null;
      height: number | null;
      pixelRatio: number | null;
      source: string;
    }

    interface VolumeState {
      supported: boolean;
      value: number | null;
      scope: "native" | "page";
      source: string;
      reason?: string;
    }

    interface StorageState {
      supported: boolean;
      usage: number | null;
      quota: number | null;
      source: string;
    }

    interface PowerState {
      supported: boolean;
      source: "ac" | "battery" | "unknown";
      acConnected: boolean | null;
      batteryPresent: boolean | null;
    }

    interface StoragePermission {
      state: PermissionState;
      readable: boolean;
      writable: boolean;
      persisted: boolean;
      revoked: boolean;
    }

    interface StorageVolume {
      id: string;
      name: string;
      kind: "directory";
      permission: StoragePermission;
      source: string;
    }

    interface UnsupportedStorageVolume {
      supported: false;
      source: "unsupported";
      reason: string;
    }

    interface StorageMetadata {
      supported: true;
      name: string;
      kind: StorageEntryKind;
      size: number | null;
      type: string | null;
      lastModified: number | null;
      readable: boolean;
      writable: boolean;
      path: string[];
      source: string;
    }

    interface OpenedStorageFile {
      metadata: StorageMetadata;
      data: ArrayBuffer;
    }

    interface PickDirectoryOptions {
      writable?: boolean;
      replaceVolumeId?: string | null;
    }

    interface DeviceCapabilityMap {
      system: { info: Capability };
      runtime: { info: Capability };
      network: { status: Capability; details: Capability };
      battery: { status: Capability };
      display: { brightness: Capability; screen: Capability };
      audio: { volume: Capability };
      storage: {
        estimate?: Capability;
        directoryPicker?: Capability;
        persistentHandles?: Capability;
        read?: Capability;
        write?: Capability;
      };
      power: { source: Capability };
    }

    interface DeviceSystemAPI {
      isSupported(): true;
      getCapabilities(): { info: Capability };
      getInfo(): DeviceSystemInfo;
    }

    interface DeviceRuntimeAPI {
      isSupported(): true;
      getCapabilities(): { info: Capability };
      getInfo(): DeviceRuntimeInfo;
      getLastError(): DeviceRuntimeError | null;
      refresh(): Promise<DeviceRuntimeInfo>;
    }

    interface DeviceNetworkAPI {
      isSupported(): true;
      getCapabilities(): { status: Capability; details: Capability };
      getState(): NetworkState;
      refresh(): NetworkState;
    }

    interface DeviceBatteryAPI {
      isSupported(): boolean;
      getCapabilities(): { status: Capability };
      getState(): BatteryState;
      refresh(): Promise<BatteryState>;
    }

    interface DeviceDisplayAPI {
      isSupported(): true;
      getCapabilities(): { brightness: Capability; screen: Capability };
      getBrightness(): Promise<BrightnessState>;
      refresh(): Promise<BrightnessState>;
      setBrightness(value: number): Promise<BrightnessState>;
      getInfo(): ScreenInfo;
    }

    interface DeviceAudioAPI {
      isSupported(): true;
      getCapabilities(): { volume: Capability };
      getVolume(): VolumeState;
      refresh(): Promise<VolumeState>;
      setVolume(value: number): Promise<VolumeState>;
    }

    interface DeviceStorageAPI {
      isSupported(): boolean;
      getCapabilities(): DeviceCapabilityMap["storage"];
      getState(): StorageState;
      refresh(): Promise<StorageState>;
      listVolumes(): Promise<StorageVolume[]>;
      pickDirectory(options?: PickDirectoryOptions): Promise<StorageVolume | UnsupportedStorageVolume>;
      requestPermission(volumeId: string, mode?: "read" | "readwrite"): Promise<StoragePermission>;
      listDirectory(volumeId: string, path?: string | string[]): Promise<StorageMetadata[]>;
      openFile(volumeId: string, path: string | string[]): Promise<OpenedStorageFile>;
      getMetadata(volumeId: string, path?: string | string[]): Promise<StorageMetadata>;
    }

    interface DevicePowerAPI {
      isSupported(): boolean;
      getCapabilities(): { source: Capability };
      getState(): PowerState;
    }

    interface DeviceAPI {
      readonly version: 1;
      readonly system: DeviceSystemAPI;
      readonly runtime: DeviceRuntimeAPI;
      readonly network: DeviceNetworkAPI;
      readonly battery: DeviceBatteryAPI;
      readonly display: DeviceDisplayAPI;
      readonly audio: DeviceAudioAPI;
      readonly storage: DeviceStorageAPI;
      readonly power: DevicePowerAPI;
      getAdapter(): AdapterId;
      getCapabilities(): DeviceCapabilityMap;
      on(type: string, callback: (detail: unknown) => void): Unsubscribe;
      ready(): Promise<DeviceAPI>;
    }

    interface CloudFileType {
      name?: string;
      extensions: string[];
    }

    interface CloudFileDialogOptions {
      title?: string;
      fileTypes?: CloudFileType[];
      extensions?: string[];
      accept?: string;
      multiple?: boolean;
      purpose?: string;
      location?: "public" | "private";
      suggestedName?: string;
      overwrite?: boolean;
    }

    interface CloudResource {
      name: string;
      path: string;
      nodeId: string;
      scope: "public" | "private";
      size?: number;
      mimeType?: string;
      readUrl?: string;
      editorDataUrl?: string;
      saveEndpoint?: string;
      writeUrl?: string;
      overwrite?: boolean;
    }

    interface CloudFileDialogAPI {
      open(options: CloudFileDialogOptions & { multiple: true }): Promise<CloudResource[] | null>;
      open(options: CloudFileDialogOptions & { multiple?: false }): Promise<CloudResource | null>;
      save(options: CloudFileDialogOptions): Promise<CloudResource | null>;
      write(resource: CloudResource, content: BlobPart | Blob, options?: { overwrite?: boolean }): Promise<CloudResource>;
      read(resource: CloudResource): Promise<Blob>;
      saveBlob(options: CloudFileDialogOptions, content: BlobPart | Blob): Promise<CloudResource | null>;
    }

    interface SystemDialogAlertOptions {
      title?: string;
      confirmLabel?: string;
    }

    interface SystemDialogConfirmOptions extends SystemDialogAlertOptions {
      cancelLabel?: string;
    }

    interface SystemDialogAPI {
      alert(message: string, options?: SystemDialogAlertOptions): Promise<void>;
      confirm(message: string, options?: SystemDialogConfirmOptions): Promise<boolean>;
    }

    interface WebWindowsNamespace {
      readonly device: DeviceAPI;
      readonly fileDialog: CloudFileDialogAPI;
      readonly dialog: SystemDialogAPI;
    }
  }

  interface Window {
    WebWindows: WebWindowsPublicAPI.WebWindowsNamespace;
  }

  var WebWindows: WebWindowsPublicAPI.WebWindowsNamespace;
}
