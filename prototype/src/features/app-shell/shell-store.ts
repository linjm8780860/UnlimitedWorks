'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId } from '@/lib/id';
import type { Theme, ToastMessage } from '@/lib/types';
import { migrateLegacyShellStore } from '@/features/shared/legacy-migration';

migrateLegacyShellStore();

type ShellState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  settingsOpen: boolean;
  workspaceDialogOpen: boolean;
  toasts: ToastMessage[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  openSettings: () => void;
  closeSettings: () => void;
  openWorkspaceDialog: () => void;
  closeWorkspaceDialog: () => void;
  pushToast: (message: string, tone?: ToastMessage['tone'], title?: string) => void;
  dismissToast: (id: string) => void;
};

export const useShellStore = create<ShellState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      sidebarWidth: 168,
      settingsOpen: false,
      workspaceDialogOpen: false,
      toasts: [],
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setSidebarWidth: (sidebarWidth) =>
        set({ sidebarWidth: Math.max(160, Math.min(280, sidebarWidth)) }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      openWorkspaceDialog: () => set({ workspaceDialogOpen: true }),
      closeWorkspaceDialog: () => set({ workspaceDialogOpen: false }),
      pushToast: (message, tone = 'default', title) => {
        const toast: ToastMessage = { id: createId('toast'), message, tone, title };
        set((state) => ({ toasts: [...state.toasts, toast] }));
        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            set((state) => ({
              toasts: state.toasts.filter((item) => item.id !== toast.id),
            }));
          }, 4200);
        }
      },
      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
    }),
    {
      name: 'uw-next-shell',
      version: 2,
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
      }),
    },
  ),
);

