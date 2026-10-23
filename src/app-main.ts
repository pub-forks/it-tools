import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@vueuse/head';

import { registerSW } from 'virtual:pwa-register';
import shadow from 'vue-shadow-dom';
import { plausible } from './plugins/plausible.plugin';

import 'virtual:uno.css';

import { naive } from './plugins/naive.plugin';

import App from './App.vue';
import router from './router';
import { i18nPlugin } from './plugins/i18n.plugin';
import { useStyleStore } from './stores/style.store';

// GAIA: Embedded builds omit PWA registration and analytics even if upstream flags are enabled.
const isGaiaEmbed = import.meta.env.VITE_GAIA_EMBED === '1';
if (!isGaiaEmbed) {
  registerSW();
}

const app = createApp(App);

app.use(createPinia());
app.use(createHead());
app.use(i18nPlugin);
app.use(router);
app.use(naive);
// GAIA: Embedded builds alias plausible to a no-op stub that still provides the tracker.
app.use(plausible);
app.use(shadow);

if (isGaiaEmbed) {
  import('./gaia/storage-bridge').then(({ getGaiaInitialPath, isValidNavigatePath, setGaiaNavigationHandler, setGaiaThemeHandler }) => {
    // GAIA: Update VueUse's reactive theme ref so the page class and Naive UI theme stay synchronized.
    setGaiaThemeHandler((dark) => {
      useStyleStore().isDarkTheme = dark;
    });
    const navigate = (path: string) => {
      const resolved = router.resolve(path);
      if (isValidNavigatePath(path) && resolved.matched.length > 0 && resolved.name !== 'NotFound') {
        void router.push(path);
      }
    };
    const postRoute = (path: string) => window.parent.postMessage({ type: 'gaia-it-tools:route', v: 1, path }, '*');
    setGaiaNavigationHandler(navigate);
    router.afterEach((route, _previous, failure) => {
      if (!failure) {
        postRoute(route.path);
      }
    });
    void router.isReady().then(() => {
      postRoute(router.currentRoute.value.path);
      const path = getGaiaInitialPath();
      if (path) {
        navigate(path);
      }
    });
  });
}

app.mount('#app');
