// GAIA: Isolate browser storage and synchronize only the explicitly supported host protocol.
import { setGaiaThemeTokens, validateThemeTokens } from './theme-tokens';

export interface GaiaInitMessage {
  type: 'gaia-it-tools:init'
  v: 1
  storage: Record<string, string>
  dark: boolean
  path?: string
  tokens?: unknown
};

export interface GaiaThemeMessage { type: 'gaia-it-tools:theme'; v: 1; dark: boolean; tokens?: unknown };
export interface GaiaNavigateMessage { type: 'gaia-it-tools:navigate'; v: 1; path: string };
export type GaiaIncomingMessage = GaiaInitMessage | GaiaThemeMessage | GaiaNavigateMessage;

type StorageOperation =
  | { type: 'gaia-it-tools:storage'; v: 1; op: 'set'; key: string; value: string }
  | { type: 'gaia-it-tools:storage'; v: 1; op: 'remove'; key: string }
  | { type: 'gaia-it-tools:storage'; v: 1; op: 'clear' };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function isValidNavigatePath(path: unknown): path is string {
  return typeof path === 'string' && /^\/[a-z0-9-]*$/.test(path);
}

export function validateGaiaMessage(value: unknown): GaiaIncomingMessage | undefined {
  if (!isPlainObject(value) || value.v !== 1 || typeof value.type !== 'string') {
    return undefined;
  }

  if (value.type === 'gaia-it-tools:init') {
    if (!isPlainObject(value.storage) || typeof value.dark !== 'boolean') {
      return undefined;
    }
    if (!Object.values(value.storage).every(item => typeof item === 'string')) {
      return undefined;
    }
    if (value.path !== undefined && !isValidNavigatePath(value.path)) {
      return undefined;
    }
    const tokens = validateThemeTokens(value.tokens) ? { tokens: value.tokens } : {};
    return { ...value, ...tokens } as unknown as GaiaInitMessage;
  }
  if (value.type === 'gaia-it-tools:theme' && typeof value.dark === 'boolean') {
    const tokens = validateThemeTokens(value.tokens) ? { tokens: value.tokens } : {};
    return { type: value.type, v: 1, dark: value.dark, ...tokens };
  }
  if (value.type === 'gaia-it-tools:navigate' && isValidNavigatePath(value.path)) {
    return value as unknown as GaiaNavigateMessage;
  }
  return undefined;
}

export function validateParentMessage(
  source: MessageEventSource | null,
  parent: Window,
  value: unknown,
): GaiaIncomingMessage | undefined {
  return source === parent ? validateGaiaMessage(value) : undefined;
}

export function createMemoryStorage(
  initial: Record<string, string> = {},
  onMutation: (operation: StorageOperation) => void = () => undefined,
): Storage {
  const values = new Map<string, string>(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
  return {
    get length() { return values.size; },
    key(index: number) { return [...values.keys()][index] ?? null; },
    getItem(key: string) { return values.get(String(key)) ?? null; },
    setItem(key: string, value: string) {
      const stringKey = String(key);
      const stringValue = String(value);
      values.set(stringKey, stringValue);
      onMutation({ type: 'gaia-it-tools:storage', v: 1, op: 'set', key: stringKey, value: stringValue });
    },
    removeItem(key: string) {
      const stringKey = String(key);
      values.delete(stringKey);
      onMutation({ type: 'gaia-it-tools:storage', v: 1, op: 'remove', key: stringKey });
    },
    clear() {
      values.clear();
      onMutation({ type: 'gaia-it-tools:storage', v: 1, op: 'clear' });
    },
  } as Storage;
}

let initialPath: string | undefined;
let navigationHandler: ((path: string) => void) | undefined;

export function createGaiaThemeSync() {
  let pendingTheme: boolean | undefined;
  let handler: ((dark: boolean) => void) | undefined;

  return {
    setTheme(dark: boolean) {
      pendingTheme = dark;
      handler?.(dark);
    },
    setHandler(nextHandler: (dark: boolean) => void) {
      handler = nextHandler;
      if (pendingTheme !== undefined) {
        handler(pendingTheme);
      }
    },
  };
}

const themeSync = createGaiaThemeSync();

export function getGaiaInitialPath(): string | undefined {
  return initialPath;
}

export function setGaiaNavigationHandler(handler: (path: string) => void): void {
  navigationHandler = handler;
}

export function setGaiaThemeHandler(handler: (dark: boolean) => void): void {
  themeSync.setHandler(handler);
}

function seedInitialTheme(dark: boolean): void {
  const storage = window.localStorage;
  // VueUse useDark stores its explicit modes as "dark" and "light".
  storage.setItem('vueuse-color-scheme', dark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', dark);
}

function queueTheme(dark: boolean): void {
  themeSync.setTheme(dark);
}

export function installGaiaBridge(): Promise<void> {
  return new Promise((resolve) => {
    let initialized = false;
    let finished = false;
    let timer: ReturnType<typeof setTimeout>;
    let complete: () => void = () => undefined;

    const notifyParent = (message: StorageOperation) => window.parent.postMessage(message, '*');

    const installStorage = (seed: Record<string, string>) => {
      const localStorageShim = createMemoryStorage(seed, notifyParent);
      const sessionStorageShim = createMemoryStorage();
      Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageShim });
      Object.defineProperty(window, 'sessionStorage', { configurable: true, value: sessionStorageShim });
    };

    const onOngoingMessage = (event: MessageEvent<unknown>) => {
      const message = validateParentMessage(event.source, window.parent, event.data);
      if (!message) {
        return;
      }
      if (message.type === 'gaia-it-tools:theme') {
        queueTheme(message.dark);
        if (message.tokens) {
          setGaiaThemeTokens(message.tokens);
        }
      }
      if (message.type === 'gaia-it-tools:navigate') {
        navigationHandler?.(message.path);
      }
    };

    const onMessage = (event: MessageEvent<unknown>) => {
      const message = validateParentMessage(event.source, window.parent, event.data);
      if (!message || message.type !== 'gaia-it-tools:init' || initialized) {
        return;
      }
      initialized = true;
      initialPath = message.path;
      installStorage(message.storage);
      themeSync.setTheme(message.dark);
      if (message.tokens) {
        setGaiaThemeTokens(message.tokens);
      }
      seedInitialTheme(message.dark);
      complete();
    };

    complete = () => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      window.addEventListener('message', onOngoingMessage);
      resolve();
    };

    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'gaia-it-tools:ready', v: 1 }, '*');
    timer = setTimeout(() => {
      if (!initialized) {
        installStorage({});
      }
      complete();
    }, 1500);
  });
}
