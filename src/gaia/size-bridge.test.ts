import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSizeReporter } from './size-bridge';

describe('createSizeReporter', () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it('rounds, clamps, throttles, and deduplicates integer pixel sizes', () => {
    vi.useFakeTimers();
    const post = vi.fn();
    const report = createSizeReporter(post);
    report(20.4);
    report(20.1);
    vi.runOnlyPendingTimers();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenLastCalledWith(20);
    report(200001);
    vi.runOnlyPendingTimers();
    expect(post).toHaveBeenLastCalledWith(200000);
  });
});
