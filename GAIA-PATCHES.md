# Gaia patches

| file | change | why |
|---|---|---|
| `src/main.ts` | Bootstrap the embedded storage bridge before dynamically importing the application entry point. | Prevent imports from accessing browser storage before the opaque-origin shim exists. |
| `index.html` | Prefix local public asset links with Vite's `BASE_URL`. | Make icons and metadata assets resolve below `/api/it-tools/app/` in the hosted build. |
| `vite.config.ts` | Omit VitePWA and alias its virtual registration module and the analytics plugin in embedded builds. | Keep service-worker and Plausible code out of the embedded distribution while preserving normal builds. |
| `src/components/NavbarButtons.vue` | Hide the GitHub navbar link in embedded builds. | Remove upstream promotion from the embedded frame. |
| `src/layouts/base.layout.vue` | Hide external project footer links and the support button in embedded builds. | Keep the embedded chrome focused on the tools. |
| `src/pages/Home.page.vue` | Hide the configured follow/sponsor banner and render an empty container in embedded builds. | Gaia provides its own native home view without upstream promotions. |
| `src/app-main.ts` | Load embed-only fonts and start the catalog and natural-height bridge after app setup. | Expose the native integration protocol without affecting standalone builds. |
| `src/App.vue` | Use validated Gaia Naive UI overrides, bypass the upstream shell on non-tool routes, and make the embedded surface transparent and content-sized. | Match the parent theme and allow the host page to own scrolling. |
| `src/layouts/tool.layout.vue` | Render only the tool body with a 16px inset in embedded builds. | Remove the fork's tool header and shell while retaining tool body wrapping. |
| `src/pages/404.page.vue` | Replace embedded 404 chrome with a short plain message. | Avoid rendering an upstream layout in the frame. |
| `src/ui/theme/theme.models.ts` | Resolve shared `c-*` theme keys from validated Gaia tokens at runtime. | Restyle existing custom components centrally. |
| `src/ui/c-input-text/c-input-text.theme.ts` | Add resolvable hover-border, focus-border, and focus-ring state keys for embedded inputs. | Keep input focus brand-led while resting and hover borders stay neutral. |
| `src/ui/c-select/c-select.theme.ts` | Add resolvable hover-border, focus-border, and focus-ring state keys for embedded selects. | Match the input focus and neutral-border treatment. |
| `src/ui/c-input-text/c-input-text.vue` | Apply muted labels and resolved neutral hover/brand focus styles only in embed mode. | Remove orange borders at rest without changing standalone styling. |
| `src/ui/c-select/c-select.vue` | Keep embed select hover neutral and apply brand border/ring while open. | Avoid the upstream primary-color hover utility in Gaia. |
| `src/ui/c-table/c-table.vue` | Apply Gaia neutral table header, surface, text, and border tokens only in embed mode. | Align tool tables with Gaia surfaces while preserving standalone styles. |
