// GAIA: Validated, reactive theme values received from the opaque-origin host.
import { ref } from 'vue';

export const colorTokenKeys = [
  'background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground', 'muted', 'mutedForeground',
  'border', 'input', 'primary', 'primaryForeground', 'accent', 'accentForeground', 'destructive',
  'destructiveForeground', 'ring', 'brand', 'brandForeground',
] as const;

export type GaiaThemeTokens = Record<typeof colorTokenKeys[number], string> & { radius: number };
export const gaiaThemeTokens = ref<GaiaThemeTokens | undefined>();

export function validateThemeTokens(value: unknown): value is GaiaThemeTokens {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const tokens = value as Record<string, unknown>;
  if (Object.keys(tokens).length !== colorTokenKeys.length + 1 || !Object.prototype.hasOwnProperty.call(tokens, 'radius')) {
    return false;
  }
  return colorTokenKeys.every(key => typeof tokens[key] === 'string' && /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/.test(tokens[key] as string))
    && typeof tokens.radius === 'number' && Number.isFinite(tokens.radius) && tokens.radius >= 0 && tokens.radius <= 32;
}

export function setGaiaThemeTokens(value: unknown): void {
  gaiaThemeTokens.value = validateThemeTokens(value) ? value : undefined;
  if (!gaiaThemeTokens.value) {
    return;
  }
  const root = document.documentElement;
  for (const key of colorTokenKeys) {
    root.style.setProperty(`--gaia-${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`, gaiaThemeTokens.value[key]);
  }
  root.style.setProperty('--gaia-radius', `${gaiaThemeTokens.value.radius}px`);
  root.style.setProperty('--font-sans', '"Fira Sans", sans-serif');
  root.style.fontFamily = '"Fira Sans", sans-serif';
}

export function mixThemeColor(color: string, targetColor: string, amount: number): string {
  const hex = color.slice(1, 7);
  const targetHex = targetColor.slice(1, 7);
  const channels = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16);
    const target = Number.parseInt(targetHex.slice(offset, offset + 2), 16);
    return Math.round(channel + (target - channel) * amount).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

function isDark(color: string): boolean {
  const hex = color.slice(1, 7);
  const [red = 0, green = 0, blue = 0] = [0, 2, 4].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16));
  return (red * 299 + green * 587 + blue * 114) / 1000 < 128;
}

export function getGaiaThemeColorStates(tokens: GaiaThemeTokens) {
  const dark = isDark(tokens.background);
  return {
    neutralHover: mixThemeColor(tokens.border, tokens.foreground, 0.2),
    neutralPressed: mixThemeColor(tokens.accent, dark ? tokens.background : tokens.foreground, 0.12),
    brandHover: mixThemeColor(tokens.brand, dark ? '#ffffff' : '#000000', dark ? 0.12 : 0.1),
    brandPressed: mixThemeColor(tokens.brand, dark ? '#ffffff' : '#000000', dark ? 0.2 : 0.18),
    brandRing: `0 0 0 3px ${tokens.brand.slice(0, 7)}40`,
    warning: '#f59e0b',
  };
}

export function createNaiveThemeOverrides(tokens: GaiaThemeTokens) {
  const brand = tokens.brand;
  const { neutralHover, neutralPressed, brandHover, brandPressed, brandRing } = getGaiaThemeColorStates(tokens);
  const radius = `${tokens.radius}px`;
  return {
    common: {
      primaryColor: brand,
      primaryColorHover: brandHover,
      primaryColorPressed: brandPressed,
      primaryColorSuppl: brandHover,
      actionColor: brand,
      bodyColor: tokens.background,
      cardColor: tokens.card,
      modalColor: tokens.popover,
      popoverColor: tokens.popover,
      tableColor: tokens.card,
      textColorBase: tokens.foreground,
      textColor1: tokens.foreground,
      textColor2: tokens.mutedForeground,
      textColor3: tokens.mutedForeground,
      borderColor: tokens.border,
      dividerColor: tokens.border,
      inputColor: tokens.background,
      borderRadius: radius,
      fontFamily: '"Fira Sans", sans-serif',
      fontFamilyMono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    Layout: { color: tokens.background, siderColor: tokens.background },
    Card: { color: tokens.card, borderColor: tokens.border, actionColor: tokens.muted },
    Input: {
      color: tokens.background,
      colorFocus: tokens.background,
      border: `1px solid ${tokens.border}`,
      borderHover: `1px solid ${neutralHover}`,
      borderFocus: `1px solid ${brand}`,
      boxShadowFocus: brandRing,
      groupLabelColor: tokens.muted,
      groupLabelTextColor: tokens.foreground,
      groupLabelBorder: `1px solid ${tokens.border}`,
    },
    Select: {
      peers: {
        InternalSelection: {
          color: tokens.background,
          colorActive: tokens.background,
          border: `1px solid ${tokens.border}`,
          borderHover: `1px solid ${neutralHover}`,
          borderActive: `1px solid ${brand}`,
          borderFocus: `1px solid ${brand}`,
          boxShadowHover: 'none',
          boxShadowActive: brandRing,
          boxShadowFocus: brandRing,
        },
      },
    },
    Table: {
      tdColor: tokens.card,
      thColor: tokens.muted,
      borderColor: tokens.border,
      thTextColor: tokens.foreground,
      tdTextColor: tokens.foreground,
    },
    DataTable: {
      tdColor: tokens.card,
      tdColorHover: tokens.accent,
      thColor: tokens.muted,
      thTextColor: tokens.foreground,
      tdTextColor: tokens.foreground,
      borderColor: tokens.border,
      actionDividerColor: tokens.border,
    },
    Tag: {
      color: tokens.muted,
      colorBordered: tokens.muted,
      textColor: tokens.foreground,
      border: `1px solid ${tokens.border}`,
      colorCheckable: tokens.muted,
      colorHoverCheckable: tokens.accent,
      colorPressedCheckable: tokens.muted,
      colorChecked: tokens.muted,
      colorCheckedHover: tokens.accent,
      colorCheckedPressed: tokens.muted,
      textColorCheckable: tokens.foreground,
      textColorHoverCheckable: tokens.foreground,
      textColorPressedCheckable: tokens.foreground,
      textColorChecked: tokens.foreground,
      colorPrimary: tokens.muted,
      colorBorderedPrimary: tokens.muted,
      textColorPrimary: tokens.foreground,
      borderPrimary: `1px solid ${tokens.border}`,
      colorInfo: tokens.muted,
      colorBorderedInfo: tokens.muted,
      textColorInfo: tokens.foreground,
      borderInfo: `1px solid ${tokens.border}`,
      colorSuccess: tokens.muted,
      colorBorderedSuccess: tokens.muted,
      textColorSuccess: tokens.foreground,
      borderSuccess: `1px solid ${tokens.border}`,
      colorWarning: tokens.muted,
      colorBorderedWarning: tokens.muted,
      textColorWarning: tokens.foreground,
      borderWarning: `1px solid ${tokens.border}`,
      colorError: tokens.muted,
      colorBorderedError: tokens.muted,
      textColorError: tokens.foreground,
      borderError: `1px solid ${tokens.border}`,
    },
    Radio: { colorActive: brand, buttonColorActive: tokens.muted, buttonBorderColorActive: tokens.border },
    Checkbox: { colorChecked: brand, borderChecked: brand, boxShadowFocus: brandRing },
    Switch: { railColorActive: brand, boxShadowFocus: brandRing },
    Slider: { fillColor: brand, fillColorHover: brandHover },
    Button: {
      borderRadius: radius,
      color: tokens.muted,
      colorHover: tokens.accent,
      colorPressed: neutralPressed,
      colorSecondary: tokens.muted,
      colorSecondaryHover: tokens.accent,
      colorSecondaryPressed: neutralPressed,
      colorTertiary: tokens.muted,
      colorTertiaryHover: tokens.accent,
      colorTertiaryPressed: neutralPressed,
      colorFocus: tokens.muted,
      textColor: tokens.foreground,
      textColorHover: tokens.foreground,
      textColorPressed: tokens.foreground,
      border: `1px solid ${tokens.border}`,
      borderHover: `1px solid ${neutralHover}`,
      borderPressed: `1px solid ${tokens.border}`,
      borderFocus: `1px solid ${brand}`,
      textColorPrimary: tokens.brandForeground,
      colorPrimary: brand,
      colorHoverPrimary: brandHover,
      colorPressedPrimary: brandPressed,
      borderPrimary: `1px solid ${brand}`,
      borderHoverPrimary: `1px solid ${brandHover}`,
      borderPressedPrimary: `1px solid ${brandPressed}`,
    },
  };
}
