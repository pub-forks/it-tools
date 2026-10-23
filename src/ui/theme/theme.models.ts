import { useStyleStore } from '@/stores/style.store';
import { gaiaThemeTokens, getGaiaThemeColorStates } from '@/gaia/theme-tokens';

export { defineThemes };

// GAIA: Shared key mapping keeps every existing c-* theme aligned to host tokens.
export function resolveThemeTokens<Theme>(theme: Theme, tokens: NonNullable<typeof gaiaThemeTokens.value>): Theme {
  const { neutralHover, neutralPressed, brandHover, brandPressed, brandRing, warning } = getGaiaThemeColorStates(tokens);
  function resolve(value: unknown, path = ''): unknown {
    if (Array.isArray(value)) {
      return value.map((item, index) => resolve(item, `${path}.${index}`));
    }
    if (!value || typeof value !== 'object') {
      return value;
    }
    const isRootForm = path === '' && Object.prototype.hasOwnProperty.call(value, 'focus');
    const isRootCard = path === '' && Object.prototype.hasOwnProperty.call(value, 'borderColor') && !isRootForm;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => {
      const current = `${path}.${key}`;
      if (typeof child === 'string') {
        if (key === 'background') {
          return [key, tokens.background];
        }
        if (key === 'backgroundColor') {
          if (child === 'transparent') {
            return [key, 'transparent'];
          }
          if (current.includes('.error.')) {
            return [key, `${tokens.destructive.slice(0, 7)}1a`];
          }
          if (current.includes('.warning.')) {
            return [key, `${warning}1a`];
          }
          if (current.includes('.focus.')) {
            return [key, tokens.background];
          }
          if (current.includes('.basic.primary.')) {
            if (current.includes('.hover.')) {
              return [key, brandHover];
            }
            if (current.includes('.pressed.')) {
              return [key, brandPressed];
            }
            return [key, tokens.brand];
          }
          if (current.includes('.text.primary.')) {
            return [key, `${tokens.brand.slice(0, 7)}1a`];
          }
          if (current.includes('.basic.default.')) {
            if (current.includes('.hover.')) {
              return [key, tokens.accent];
            }
            if (current.includes('.pressed.')) {
              return [key, neutralPressed];
            }
          }
          if (current.includes('.option.hover.')) {
            return [key, tokens.accent];
          }
          if (isRootCard) {
            return [key, tokens.card];
          }
          if (isRootForm) {
            return [key, tokens.background];
          }
          return [key, tokens.muted];
        }
        if (key === 'borderColor') {
          if (current.includes('.error.')) {
            return [key, tokens.destructive];
          }
          if (current.includes('.warning.')) {
            return [key, warning];
          }
          return [key, tokens.border];
        }
        if (key === 'hoverBorderColor') {
          return [key, neutralHover];
        }
        if (key === 'focusBorderColor') {
          return [key, tokens.brand];
        }
        if (key === 'focusBoxShadow') {
          return [key, brandRing];
        }
        if (key === 'baseColor' || key === 'textColor') {
          if (current.includes('.error.')) {
            return [key, tokens.destructive];
          }
          if (current.includes('.warning.')) {
            return [key, warning];
          }
          if (current.includes('.text.primary.')) {
            return [key, tokens.brand];
          }
          if (current.includes('.option.active.')) {
            return [key, tokens.brand];
          }
          if (!current.includes('.basic.') && (current.includes('.default.') || current.includes('.outline.'))) {
            return [key, tokens.brand];
          }
          return [key, current.includes('.primary.') ? tokens.brandForeground : tokens.foreground];
        }
        if (key === 'mutedColor') {
          return [key, tokens.mutedForeground];
        }
        if (key === 'color' && (current.includes('.primary') || current.includes('.outline.'))) {
          return [key, tokens.brand];
        }
        if (key === 'colorHover') {
          return [key, current.includes('.primary') ? brandHover : tokens.accent];
        }
        if (key === 'hoverBackground') {
          return [key, current.includes('.primary.') ? brandHover : tokens.accent];
        }
        if (key === 'colorPressed') {
          return [key, current.includes('.primary') ? brandPressed : neutralPressed];
        }
        if (key === 'pressedBackground') {
          return [key, current.includes('.primary.') ? brandPressed : neutralPressed];
        }
        if (key === 'colorFaded') {
          return [key, `${tokens.brand.slice(0, 7)}1a`];
        }
      }
      return [key, resolve(child, current)];
    }));
  }
  return resolve(theme) as Theme;
}

function defineThemes<Theme>(themes: { light: Theme; dark: Theme }) {
  return {
    themes,
    useTheme() {
      const styleStore = useStyleStore();
      return computed(() => {
        const theme = themes[styleStore.isDarkTheme ? 'dark' : 'light'];
        return gaiaThemeTokens.value ? resolveThemeTokens(theme, gaiaThemeTokens.value) : theme;
      });
    },
  };
}
