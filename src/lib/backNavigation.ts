// The visible layer handles Back first, independent of React effect order.
export function createBackNavigation() {
  const layers: { priority: number; run: () => void }[] = [];
  return {
    register(run: () => void, priority: number) {
      const layer = { run, priority };
      layers.push(layer);
      return () => { const i = layers.indexOf(layer); if (i >= 0) layers.splice(i, 1); };
    },
    back() {
      const layer = layers.reduce<(typeof layers)[number] | undefined>((top, entry) =>
        !top || entry.priority >= top.priority ? entry : top, undefined);
      if (!layer) return false;
      layer.run();
      return true;
    },
  };
}
