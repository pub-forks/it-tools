# Gaia patches

| file | change | why |
|---|---|---|
| `src/main.ts` | Bootstrap the embedded storage bridge before dynamically importing the application entry point. | Prevent imports from accessing browser storage before the opaque-origin shim exists. |
| `index.html` | Prefix local public asset links with Vite's `BASE_URL`. | Make icons and metadata assets resolve below `/apps/it-tools/` in the hosted build. |
| `vite.config.ts` | Omit VitePWA and alias its virtual registration module and the analytics plugin in embedded builds. | Keep service-worker and Plausible code out of the embedded distribution while preserving normal builds. |
| `src/components/NavbarButtons.vue` | Hide the GitHub navbar link in embedded builds. | Remove upstream promotion from the embedded frame. |
| `src/layouts/base.layout.vue` | Hide external project footer links and the support button in embedded builds. | Keep the embedded chrome focused on the tools. |
| `src/pages/Home.page.vue` | Hide the configured follow/sponsor banner in embedded builds. | Avoid promotional links in the frame. |
