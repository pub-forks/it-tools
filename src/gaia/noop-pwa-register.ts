// GAIA: Vite resolves virtual:pwa-register to this stub in embedded builds without the PWA plugin.
export function registerSW(): () => Promise<void> {
  return () => Promise.resolve();
}
