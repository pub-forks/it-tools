<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { NGlobalStyle, NMessageProvider, NNotificationProvider, darkTheme } from 'naive-ui';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import { layouts } from './layouts';
import { useStyleStore } from './stores/style.store';
import { createNaiveThemeOverrides, gaiaThemeTokens } from './gaia/theme-tokens';
import GaiaEmbedLayout from './gaia/embed.layout.vue';

const route = useRoute();
// GAIA: Non-tool routes bypass the upstream shell in embedded builds.
const isGaiaEmbed = import.meta.env.VITE_GAIA_EMBED === '1';
const layout = computed(() => isGaiaEmbed ? (route?.meta?.isTool ? layouts.toolLayout : GaiaEmbedLayout) : (route?.meta?.layout ?? layouts.base));
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));
// GAIA: Prefer validated host tokens while retaining upstream themes without a token message.
const activeThemeOverrides = computed(() => gaiaThemeTokens.value ? createNaiveThemeOverrides(gaiaThemeTokens.value) : themeOverrides.value);

const { locale } = useI18n();

syncRef(
  locale,
  useStorage('locale', locale),
);
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="activeThemeOverrides">
    <NGlobalStyle />
    <NMessageProvider placement="bottom">
      <NNotificationProvider placement="bottom-right">
        <component :is="layout">
          <RouterView />
        </component>
      </NNotificationProvider>
    </NMessageProvider>
  </n-config-provider>
</template>

<style>
body {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* GAIA: Keep embedded tools transparent so Gaia owns the visible page surface. */
html.gaia-embed, html.gaia-embed body, html.gaia-embed #app, html.gaia-embed .n-config-provider, html.gaia-embed .n-layout {
  background: transparent !important;
}
html.gaia-embed, html.gaia-embed body, html.gaia-embed #app, html.gaia-embed .n-config-provider {
  height: auto !important;
  min-height: 0 !important;
}

* {
  box-sizing: border-box;
}
</style>
