'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId } from '@/lib/id';
import type { Automation } from '@/lib/types';
import { migrateLegacyAutomationsStore } from '@/features/shared/legacy-migration';

migrateLegacyAutomationsStore();

type AutomationsState = {
  automations: Automation[];
  checkRequestId: number;
  addAutomation: (automation: Omit<Automation, 'id' | 'createdAt'>) => Automation;
  updateAutomation: (id: string, patch: Partial<Automation>) => void;
  removeAutomation: (id: string) => void;
  requestCheck: () => void;
};

export const useAutomationsStore = create<AutomationsState>()(
  persist(
    (set) => ({
      automations: [],
      checkRequestId: 0,
      addAutomation: (automation) => {
        const next = { ...automation, id: createId('automation'), createdAt: Date.now() };
        set((state) => ({ automations: [next, ...state.automations] }));
        return next;
      },
      updateAutomation: (id, patch) =>
        set((state) => ({
          automations: state.automations.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        })),
      removeAutomation: (id) =>
        set((state) => ({
          automations: state.automations.filter((item) => item.id !== id),
        })),
      requestCheck: () =>
        set((state) => ({ checkRequestId: state.checkRequestId + 1 })),
    }),
    {
      name: 'uw-next-automations-domain',
      version: 2,
      partialize: (state) => ({ automations: state.automations }),
    },
  ),
);

