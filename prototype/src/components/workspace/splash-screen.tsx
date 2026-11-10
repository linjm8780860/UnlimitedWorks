'use client';

import { useEffect, useRef, useState } from 'react';

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let firstVisit = true;
    try {
      firstVisit = window.localStorage.getItem('uw-next-splash-shown') !== '1';
    } catch {
      firstVisit = true;
    }
    if (!firstVisit) return;
    setVisible(true);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = 2;
      void video.play().catch(() => undefined);
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.localStorage.setItem('uw-next-splash-shown', '1');
      } catch {
        // The splash still dismisses if persistence is unavailable.
      }
    }, 3600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-black"
      onClick={() => {
        setVisible(false);
        try {
          window.localStorage.setItem('uw-next-splash-shown', '1');
        } catch {
          // Ignore storage failures.
        }
      }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        autoPlay
        className="h-auto w-full object-contain"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)',
        }}
        src="/splash/UW_开场动画.mp4"
      />
      <div className="absolute bottom-6 right-7 text-[10px] text-white/35">点击跳过</div>
    </div>
  );
}

