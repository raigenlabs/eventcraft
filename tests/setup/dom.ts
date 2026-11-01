import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
  url: "http://localhost:3000",
  pretendToBeVisual: true,
});

const { window } = dom;

const propsToDefine = [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "Node",
  "DocumentFragment",
  "customElements",
  "Event",
  "CustomEvent",
  "KeyboardEvent",
  "MouseEvent",
  "FocusEvent",
  "InputEvent",
  "MutationObserver",
] as const;

for (const prop of propsToDefine) {
  if (prop in window) {
    Object.defineProperty(globalThis, prop, {
      value: (window as unknown as Record<string, unknown>)[prop],
      configurable: true,
      writable: true,
    });
  }
}

if (!("navigator" in globalThis) || !globalThis.navigator) {
  Object.defineProperty(globalThis, "navigator", {
    value: window.navigator,
    configurable: true,
    writable: true,
  });
}

Object.defineProperty(globalThis, "requestAnimationFrame", {
  value: (cb: FrameRequestCallback): number => setTimeout(() => cb(Date.now()), 0) as unknown as number,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, "cancelAnimationFrame", {
  value: (id: number): void => clearTimeout(id),
  configurable: true,
  writable: true,
});

// Provide a mock localStorage
const storageMap = new Map<string, string>();
const localStorageMock: Storage = {
  getItem: (key: string): string | null => storageMap.get(key) ?? null,
  setItem: (key: string, value: string): void => {
    storageMap.set(key, String(value));
  },
  removeItem: (key: string): void => {
    storageMap.delete(key);
  },
  clear: (): void => {
    storageMap.clear();
  },
  get length(): number {
    return storageMap.size;
  },
  key: (index: number): string | null => Array.from(storageMap.keys())[index] ?? null,
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
  writable: true,
});
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
  writable: true,
});
