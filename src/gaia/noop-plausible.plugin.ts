// GAIA: Embedded builds alias the analytics plugin to this stub. It still
// provides a no-op 'plausible' instance, because useTracker() injects one.
import type { App } from 'vue';

export const plausible = {
  install: (app: App) => {
    app.provide('plausible', { trackEvent: () => undefined, enableAutoPageviews: () => () => undefined });
  },
};
