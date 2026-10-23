import { describe, expect, it } from 'vitest';
import { type GaiaThemeTokens, createNaiveThemeOverrides, getGaiaThemeColorStates, validateThemeTokens } from './theme-tokens';
import { resolveThemeTokens } from '@/ui/theme/theme.models';

const tokens: GaiaThemeTokens = {
  background: '#101010',
  foreground: '#f0f0f0',
  card: '#202020',
  cardForeground: '#eeeeee',
  popover: '#202020',
  popoverForeground: '#eeeeee',
  muted: '#303030',
  mutedForeground: '#aaaaaa',
  border: '#444444',
  input: '#202020',
  primary: '#bb5500',
  primaryForeground: '#ffffff',
  accent: '#333333',
  accentForeground: '#ffffff',
  destructive: '#cc2222',
  destructiveForeground: '#ffffff',
  ring: '#ff8800',
  brand: '#ff8800',
  brandForeground: '#111111',
  radius: 8,
};

describe('Gaia theme tokens', () => {
  it('accepts valid tokens and rejects invalid hex, missing keys, and radius bounds', () => {
    expect(validateThemeTokens(tokens)).toBe(true);
    expect(validateThemeTokens({ ...tokens, background: '#ABCDEF' })).toBe(false);
    const { ring: _ring, ...missing } = tokens;
    expect(validateThemeTokens(missing)).toBe(false);
    expect(validateThemeTokens({ ...tokens, radius: 33 })).toBe(false);
  });

  it('maps Gaia brand, surfaces, typography, and radius to Naive UI', () => {
    const overrides = createNaiveThemeOverrides(tokens);
    const states = getGaiaThemeColorStates(tokens);
    expect(overrides.common.primaryColor).toBe(tokens.brand);
    expect(overrides.common.bodyColor).toBe(tokens.background);
    expect(overrides.common.cardColor).toBe(tokens.card);
    expect(overrides.common.borderRadius).toBe('8px');
    expect(overrides.common.fontFamily).toContain('Fira Sans');
    expect(overrides.Input.color).toBe(tokens.background);
    expect(overrides.Input.border).toBe(`1px solid ${tokens.border}`);
    expect(overrides.Input.borderHover).toBe(`1px solid ${states.neutralHover}`);
    expect(overrides.Input.borderFocus).toBe(`1px solid ${tokens.brand}`);
    expect(overrides.Input.boxShadowFocus).toBe(states.brandRing);
    expect(overrides.Card.borderColor).toBe(tokens.border);
    expect(overrides.Input.groupLabelColor).toBe(tokens.muted);
    expect(overrides.Input.border).not.toContain(tokens.brand);
    expect(overrides.Input.groupLabelColor).not.toBe(tokens.brand);
    expect(overrides.Button.color).toBe(tokens.muted);
    expect(overrides.Button.colorPressed).not.toBe(tokens.primary);
    expect(overrides.Button.colorPrimary).toBe(tokens.brand);
    expect(overrides.Button.textColorPrimary).toBe(tokens.brandForeground);
    expect(overrides.Tag.colorPrimary).toBe(tokens.muted);
    expect(overrides.Tag.textColorPrimary).toBe(tokens.foreground);
    expect(overrides.DataTable.borderColor).toBe(tokens.border);
  });

  it('maps c-* form/card borders, state colors, labels, and buttons centrally', () => {
    const form = resolveThemeTokens({
      backgroundColor: '#fff',
      borderColor: '#ddd',
      hoverBorderColor: '#eee',
      focusBorderColor: '#18a058',
      focusBoxShadow: 'old',
      focus: { backgroundColor: '#fff' },
      text: { baseColor: '#111', mutedColor: '#555' },
    }, tokens);
    expect(form.backgroundColor).toBe(tokens.background);
    expect(form.borderColor).toBe(tokens.border);
    expect(form.hoverBorderColor).toBe(getGaiaThemeColorStates(tokens).neutralHover);
    expect(form.focusBorderColor).toBe(tokens.brand);
    expect(form.focusBoxShadow).toBe(getGaiaThemeColorStates(tokens).brandRing);
    expect(form.text).toEqual({ baseColor: tokens.foreground, mutedColor: tokens.mutedForeground });

    const card = resolveThemeTokens({ backgroundColor: '#fff', borderColor: '#ddd' }, tokens);
    expect(card).toEqual({ backgroundColor: tokens.card, borderColor: tokens.border });

    const button = resolveThemeTokens({
      basic: {
        default: { textColor: '#111', backgroundColor: '#ddd', hover: { backgroundColor: '#eee' }, pressed: { backgroundColor: '#ccc' } },
        primary: { textColor: '#fff', backgroundColor: '#eee', hover: { backgroundColor: '#ddd' }, pressed: { backgroundColor: '#ccc' } },
      },
    }, tokens);
    expect(button.basic.default.backgroundColor).toBe(tokens.muted);
    expect(button.basic.default.textColor).toBe(tokens.foreground);
    expect(button.basic.default.hover.backgroundColor).toBe(tokens.accent);
    expect(button.basic.default.pressed.backgroundColor).not.toBe(tokens.primary);
    expect(button.basic.primary.backgroundColor).toBe(tokens.brand);
    expect(button.basic.primary.textColor).toBe(tokens.brandForeground);
  });
});
