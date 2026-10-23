// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
  createGaiaThemeSync,
  createMemoryStorage,
  isValidNavigatePath,
  validateGaiaMessage,
  validateParentMessage,
} from './storage-bridge';

describe('Gaia message validation', () => {
  const init = { type: 'gaia-it-tools:init', v: 1, storage: { locale: 'en' }, dark: false } as const;

  it('ignores messages from a source other than the parent', () => {
    expect(validateParentMessage({} as MessageEventSource, window, init)).toBeUndefined();
    expect(validateParentMessage(window, window, init)).toEqual(init);
  });

  it('ignores unknown types and invalid shapes', () => {
    expect(validateGaiaMessage({ type: 'gaia-it-tools:unknown', v: 1 })).toBeUndefined();
    expect(validateGaiaMessage({ ...init, storage: { locale: 1 } })).toBeUndefined();
    expect(validateGaiaMessage({ ...init, dark: 'false' })).toBeUndefined();
    expect(validateGaiaMessage({ ...init, path: '/bad/path' })).toBeUndefined();
    expect(validateGaiaMessage(Object.assign(Object.create({ inherited: true }), init))).toBeUndefined();
  });
});

describe('in-memory Storage', () => {
  it('implements Storage reads, coercion, ordering, deletion and clear while posting mutations', () => {
    const post = vi.fn();
    const storage = createMemoryStorage({ first: 'one' }, post);
    expect(storage.length).toBe(1);
    expect(storage.key(0)).toBe('first');
    expect(storage.key(1)).toBeNull();
    expect(storage.getItem('missing')).toBeNull();

    storage.setItem('second', 2 as unknown as string);
    expect(storage.getItem('second')).toBe('2');
    storage.removeItem('first');
    storage.clear();
    expect(storage.length).toBe(0);
    expect(post.mock.calls).toEqual([
      [{ type: 'gaia-it-tools:storage', v: 1, op: 'set', key: 'second', value: '2' }],
      [{ type: 'gaia-it-tools:storage', v: 1, op: 'remove', key: 'first' }],
      [{ type: 'gaia-it-tools:storage', v: 1, op: 'clear' }],
    ]);
  });
});

describe('navigate path validation', () => {
  it.each(['/', '/about', '/base64-string-converter', '/abc123-tool'])('accepts %s', (path) => {
    expect(isValidNavigatePath(path)).toBe(true);
  });

  it.each(['about', '/About', '/foo/bar', '/foo?query=1', '/foo#hash', '/foo_bar'])('rejects unsafe route %s', (path) => {
    expect(isValidNavigatePath(path)).toBe(false);
  });
});

describe('Gaia theme synchronization', () => {
  it('applies the latest theme received before handler registration', () => {
    const sync = createGaiaThemeSync();
    const applyTheme = vi.fn();

    sync.setTheme(true);
    expect(applyTheme).not.toHaveBeenCalled();

    sync.setHandler(applyTheme);
    expect(applyTheme).toHaveBeenCalledWith(true);

    sync.setTheme(false);
    expect(applyTheme).toHaveBeenLastCalledWith(false);
  });
});

const validTokens = {
  background: '#000000',
  foreground: '#ffffff',
  card: '#111111',
  cardForeground: '#ffffff',
  popover: '#111111',
  popoverForeground: '#ffffff',
  muted: '#222222',
  mutedForeground: '#aaaaaa',
  border: '#333333',
  input: '#111111',
  primary: '#ff8800',
  primaryForeground: '#ffffff',
  accent: '#222222',
  accentForeground: '#ffffff',
  destructive: '#cc0000',
  destructiveForeground: '#ffffff',
  ring: '#ff8800',
  brand: '#ff8800',
  brandForeground: '#000000',
  radius: 8,
};

describe('Gaia token protocol validation', () => {
  it('accepts valid tokens and ignores the whole tokens object if any field is invalid', () => {
    expect(validateGaiaMessage({ type: 'gaia-it-tools:init', v: 1, storage: {}, dark: false, tokens: validTokens })).toMatchObject({ tokens: validTokens });
    const invalid = validateGaiaMessage({ type: 'gaia-it-tools:theme', v: 1, dark: true, tokens: { ...validTokens, radius: 33 } });
    expect(invalid).toMatchObject({ dark: true });
    expect(invalid?.type === 'gaia-it-tools:theme' ? invalid.tokens : undefined).toBeUndefined();
  });
});
