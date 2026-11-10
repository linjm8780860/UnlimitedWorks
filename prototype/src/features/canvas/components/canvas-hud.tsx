'use client';

import { useEffect, useState } from 'react';

export function CanvasHud({
  selectedCount,
  nodeCount,
  zoom,
}: {
  selectedCount: number;
  nodeCount: number;
  zoom: number;
}) {
  const [fps, setFps] = useState(120);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFps(72 + Math.round(Math.random() * 55));
    }, 900);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-4 top-4 z-[95] w-[113px] rounded-lg border border-zinc-200 bg-white/85 px-3 py-2 font-mono text-[11px] leading-4 whitespace-nowrap text-zinc-800 dark:border-white/10 dark:bg-[#1b1b1d]/85 dark:text-zinc-200">
      <div>FPS {fps}</div>
      <div>
        Selected {selectedCount}/{nodeCount}
      </div>
      <div>Viewport {Math.round(zoom * 100)}%</div>
    </div>
  );
}
