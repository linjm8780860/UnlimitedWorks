'use client';

import { useCanvasTransientStore } from '../canvas-transient-store';

export function CanvasAlignmentGuides() {
  const guides = useCanvasTransientStore((state) => state.guides);
  return (
    <>
      {guides.x !== undefined && (
        <div
          className="pointer-events-none absolute bottom-0 top-0 z-[240] w-px bg-blue-500"
          style={{ left: guides.x }}
        />
      )}
      {guides.y !== undefined && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-[240] h-px bg-blue-500"
          style={{ top: guides.y }}
        />
      )}
    </>
  );
}
