// src/types/window.d.ts
export {} // 让本文件成为模块

declare global {
  interface Window {
    refreshDesktop?: () => void;
    openWindow?: (
      id: string,
      title: string,
      url: string,
      icon?: string,
      singleton?: boolean
    ) => void;

    minimizeWindow?: (win?: HTMLElement | any) => void;
    maximizeWindow?: (win?: HTMLElement | any) => void;
    restoreWindow?:  (win?: HTMLElement | any) => void;
    closeWindow?:    (win?: HTMLElement | any) => void;

    WebWindowsDeviceOperations?: {
      getCapabilities: () => Record<'shutdown' | 'restart' | 'sleep' | 'lock' | 'reloadSession', {
        available: boolean;
        level: 'native' | 'session';
        label: string;
      }>;
      shutdown: () => Promise<unknown>;
      restart: () => Promise<unknown>;
      sleep: () => Promise<unknown>;
      lock: () => Promise<unknown>;
      reloadSession: () => Promise<unknown>;
    };

    WebWindows?: {
      device?: {
        version: 1;
        getAdapter: () => 'browser' | 'android' | 'linux' | 'windows' | string;
        getCapabilities: () => Record<string, Record<string, {
          supported: boolean;
          source: string;
        }>>;
        ready: () => Promise<unknown>;
        system: { isSupported: () => boolean; getCapabilities: () => object; getInfo: () => object };
        network: { isSupported: () => boolean; getCapabilities: () => object; getState: () => object; refresh: () => object };
        battery: { isSupported: () => boolean; getCapabilities: () => object; getState: () => object; refresh: () => Promise<object> };
        display: { isSupported: () => boolean; getCapabilities: () => object; getInfo: () => object; getBrightness: () => Promise<object>; refresh: () => Promise<object>; setBrightness: (value: number) => Promise<object> };
        audio: { isSupported: () => boolean; getCapabilities: () => object; getVolume: () => object; refresh: () => Promise<object>; setVolume: (value: number) => Promise<object> };
          storage: { isSupported: () => boolean; getCapabilities: () => object; getState: () => object; refresh: () => Promise<object>; listVolumes: () => Promise<object[]>; pickDirectory: (options?: { writable?: boolean; replaceVolumeId?: string | null }) => Promise<object>; requestPermission: (volumeId: string, mode?: "read" | "readwrite") => Promise<object>; listDirectory: (volumeId: string, path?: string | string[]) => Promise<object[]>; openFile: (volumeId: string, path: string | string[]) => Promise<{ metadata: object; data: ArrayBuffer }>; getMetadata: (volumeId: string, path?: string | string[]) => Promise<object> };
        storage: { isSupported: () => boolean; getCapabilities: () => object; getState: () => object; refresh: () => Promise<object> };
        power: { isSupported: () => boolean; getCapabilities: () => object; getState: () => object };
      };
      [key: string]: unknown;
    };

    zIndex?: number;
  }
}
