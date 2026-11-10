'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { SettingsDialog } from '@/components/settings/settings-dialog';
import { AutomationRuntime } from '@/components/automations/automation-runtime';
import { GlobalToolIslands } from './global-tool-islands';
import { ToastStack } from '@/components/ui/toast-stack';
import { Sidebar } from './sidebar';
import { SplashScreen } from './splash-screen';
import { Titlebar } from './titlebar';
import { useShellStore } from '@/features/app-shell/shell-store';
import { useAssetStore } from '@/features/assets/asset-store';

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useShellStore((state) => state.theme);
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed);
  const sidebarWidth = useShellStore((state) => state.sidebarWidth);
  const setSidebarCollapsed = useShellStore((state) => state.setSidebarCollapsed);
  const pushToast = useShellStore((state) => state.pushToast);
  const hydrateAssets = useAssetStore((state) => state.hydrateAssets);
  const assetPersistenceError = useAssetStore((state) => state.persistenceError);
  const reportedAssetErrorRef = useRef<string | null>(null);
  const contentLeft = sidebarCollapsed ? 48 : sidebarWidth;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const collapseForMobile = () => {
      if (media.matches) setSidebarCollapsed(true);
    };
    collapseForMobile();
    media.addEventListener('change', collapseForMobile);
    return () => media.removeEventListener('change', collapseForMobile);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    void hydrateAssets().catch(() => undefined);
  }, [hydrateAssets]);

  useEffect(() => {
    if (
      !assetPersistenceError ||
      reportedAssetErrorRef.current === assetPersistenceError
    ) {
      return;
    }
    reportedAssetErrorRef.current = assetPersistenceError;
    pushToast(assetPersistenceError, 'error', '资产持久化失败');
  }, [assetPersistenceError, pushToast]);

  return (
    <div
      className={`uw-workspace w-screen h-screen overflow-hidden ${
        theme === 'dark' ? 'dark text-zinc-100' : 'text-zinc-900'
      }`}
      data-theme={theme}
      style={{
        backgroundColor: theme === 'dark' ? '#09090b' : '#f9fafb',
        ['--uw-sidebar-width' as string]: `${contentLeft}px`,
      }}
    >
      <Titlebar />
      <Sidebar />
      <GlobalToolIslands />
      <SplashScreen />
      <div
        className="uw-workspace-content"
        style={{
          position: 'absolute',
          left: contentLeft,
          right: 0,
          top: 32,
          bottom: 0,
        }}
      >
        {children}
      </div>
      <SettingsDialog />
      <AutomationRuntime />
      <ToastStack />
    </div>
  );
}

