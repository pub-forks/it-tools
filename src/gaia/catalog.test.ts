import { describe, expect, it } from 'vitest';
import { buildCatalog } from './catalog';

const item = (i: number) => ({ path: `/tool-${i}`, name: `Tool ${i}`, description: 'Description', category: 'Data', keywords: ['tool'], isNew: false, icon: { name: 'EyeOff' } });

describe('buildCatalog', () => {
  it('keeps the registry within 300 entries and omits invalid values', () => {
    const catalog = buildCatalog(Array.from({ length: 301 }, (_, i) => item(i)));
    expect(catalog).toHaveLength(300);
    expect(catalog[0]?.icon).toBe('EyeOff');
    expect(buildCatalog([{ ...item(1), path: '/Invalid' }])).toEqual([]);
  });

  it('enforces text and keyword caps and omits invalid icon names', () => {
    expect(buildCatalog([{ ...item(1), name: 'x'.repeat(81) }])).toEqual([]);
    expect(buildCatalog([{ ...item(1), keywords: ['x'.repeat(41)] }])).toEqual([]);
    expect(buildCatalog([{ ...item(1), icon: { name: 'icon-name' } }])[0]).not.toHaveProperty('icon');
  });
});
