// GAIA: Report natural body height without creating a nested viewport scrollbar.
export function createSizeReporter(post: (height: number) => void) {
  let previous: number | undefined;
  let frame = 0;
  return (rawHeight: number) => {
    const height = Math.max(0, Math.min(200000, Math.round(rawHeight)));
    if (height === previous) {
      return;
    }
    previous = height;
    if (frame) {
      cancelAnimationFrame(frame);
    }
    frame = requestAnimationFrame(() => {
      frame = 0;
      post(height);
    });
  };
}

export function observeToolContent(post: (message: { type: 'gaia-it-tools:size'; v: 1; height: number }) => void): () => void {
  const report = createSizeReporter(height => post({ type: 'gaia-it-tools:size', v: 1, height }));
  let resizeObserver: ResizeObserver | undefined;
  let observed: Element | undefined;
  const attach = () => {
    const target = document.querySelector('.gaia-tool-content');
    if (target === observed) {
      return;
    }
    resizeObserver?.disconnect();
    observed = target ?? undefined;
    if (observed) {
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          report(entry.target.getBoundingClientRect().height);
        }
      });
      resizeObserver.observe(observed);
    }
  };
  const mutation = new MutationObserver(attach);
  mutation.observe(document.getElementById('app') ?? document.documentElement, { childList: true, subtree: true });
  attach();
  return () => {
    mutation.disconnect();
    resizeObserver?.disconnect();
  };
}
