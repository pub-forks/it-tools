import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#333333',
    borderColor: '#333333',
    // GAIA: Shared resolver replaces these state colors only in embedded builds.
    hoverBorderColor: '#444444',
    focusBorderColor: '#1ea54c',
    focusBoxShadow: '0 0 0 3px #1ea54c40',

    focus: {
      backgroundColor: '#1ea54c1a',
    },
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e69e',
    // GAIA: Shared resolver replaces these state colors only in embedded builds.
    hoverBorderColor: '#d0d0d0',
    focusBorderColor: '#18a058',
    focusBoxShadow: '0 0 0 3px #18a05840',

    focus: {
      backgroundColor: '#ffffff',
    },
  },
});
