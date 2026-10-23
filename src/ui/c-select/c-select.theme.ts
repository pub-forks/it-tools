import { defineThemes } from '../theme/theme.models';
import { appThemes } from '../theme/themes';

const sizes = {
  small: {
    height: '28px',
    fontSize: '12px',
  },
  medium: {
    height: '34px',
    fontSize: '14px',
  },
  large: {
    height: '40px',
    fontSize: '16px',
  },
};

export const { useTheme } = defineThemes({
  dark: {
    sizes,

    backgroundColor: '#333333',
    borderColor: '#333333',
    // GAIA: Shared resolver replaces these state colors only in embedded builds.
    hoverBorderColor: '#444444',
    focusBorderColor: '#1ea54c',
    focusBoxShadow: '0 0 0 3px #1ea54c40',
    dropdownShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: '#444444',
      },
      active: {
        textColor: appThemes.dark.primary.color,
      },
    },

    focus: {
      backgroundColor: '#1ea54c1a',
    },
  },
  light: {
    sizes,

    backgroundColor: '#ffffff',
    borderColor: '#e0e0e69e',
    // GAIA: Shared resolver replaces these state colors only in embedded builds.
    hoverBorderColor: '#d0d0d0',
    focusBorderColor: '#18a058',
    focusBoxShadow: '0 0 0 3px #18a05840',
    dropdownShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',

    option: {
      hover: {
        backgroundColor: '#eee',
      },
      active: {
        textColor: appThemes.light.primary.color,
      },
    },

    focus: {
      backgroundColor: '#ffffff',
    },
  },
});
