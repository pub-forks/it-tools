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
