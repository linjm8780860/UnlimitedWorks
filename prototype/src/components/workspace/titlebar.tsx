'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useShellStore } from '@/features/app-shell/shell-store';

export function Titlebar() {
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useShellStore((state) => state.setSidebarCollapsed);
  return (
    <header
      data-testid="window-titlebar"
      className="fixed inset-x-0 top-0 z-[160] flex h-8 select-none items-center border-b border-white/[.06] bg-[#111111] text-zinc-300 dark:border-white/[.06] dark:bg-[#111111] dark:text-zinc-300 light:border-zinc-200 light:bg-white light:text-zinc-700"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex h-full shrink-0 items-center gap-1.5 pl-2.5 pr-1 text-[11px]">
        <img
          src="/logo_dark.ico"
          alt="UW Logo"
          className="pointer-events-none h-5 w-5 object-contain"
          draggable={false}
        />
        <span className="pointer-events-none font-medium">Unlimited Works</span>
      </div>
      <button
        type="button"
        aria-label={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        title={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        aria-expanded={!sidebarCollapsed}
        aria-controls="workspace-sidebar"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="flex h-8 w-10 items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 hover:bg-black/5 dark:hover:bg-white/10"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>
      <div
        className="h-full min-w-0 flex-1"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
    </header>
  );
}

