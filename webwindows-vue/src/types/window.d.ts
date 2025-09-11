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

    doPower?: (action: 'sleep' | 'restart' | 'shutdown') => void;

    zIndex?: number;
  }
}
