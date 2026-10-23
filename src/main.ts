// GAIA: Install the opaque-origin storage shim before evaluating any app module.
const isGaiaEmbed = import.meta.env.VITE_GAIA_EMBED === '1';

if (isGaiaEmbed) {
  document.documentElement.classList.add('gaia-embed');
  import('./gaia/storage-bridge').then(({ installGaiaBridge }) =>
    installGaiaBridge().then(() => import('./app-main')),
  );
}
else {
  import('./app-main');
}
