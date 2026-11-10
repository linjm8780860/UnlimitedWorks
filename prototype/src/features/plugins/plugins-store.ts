'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Plugin } from '@/lib/types';
import { migrateLegacyPluginsStore } from '@/features/shared/legacy-migration';

migrateLegacyPluginsStore();

type PluginsState = {
  plugins: Plugin[];
  installPlugin: (plugin: Omit<Plugin, 'installedAt'>) => void;
  updatePlugin: (id: string, patch: Partial<Plugin>) => void;
  removePlugin: (id: string) => void;
};

export const usePluginsStore = create<PluginsState>()(
  persist(
    (set) => ({
      plugins: [],
      installPlugin: (plugin) =>
        set((state) => ({
          plugins: [
            ...state.plugins.filter((item) => item.id !== plugin.id),
            { ...plugin, installedAt: Date.now() },
          ],
        })),
      updatePlugin: (id, patch) =>
        set((state) => ({
          plugins: state.plugins.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        })),
      removePlugin: (id) =>
        set((state) => ({ plugins: state.plugins.filter((item) => item.id !== id) })),
    }),
    {
      name: 'uw-next-plugins-domain',
      version: 2,
      partialize: (state) => ({ plugins: state.plugins }),
    },
  ),
);

