'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { builtInSkills } from '@/lib/catalog';
import { createId } from '@/lib/id';
import type { Skill } from '@/lib/types';
import { migrateLegacySkillsStore } from '@/features/shared/legacy-migration';

migrateLegacySkillsStore();

type SkillsState = {
  skills: Skill[];
  addSkill: (skill: Omit<Skill, 'id' | 'createdAt'>) => Skill;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  restoreBuiltInSkills: () => void;
};

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set) => ({
      skills: [],
      addSkill: (skill) => {
        const next = { ...skill, id: createId('skill'), createdAt: Date.now() };
        set((state) => ({ skills: [...state.skills, next] }));
        return next;
      },
      updateSkill: (id, patch) =>
        set((state) => ({
          skills: state.skills.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        })),
      removeSkill: (id) =>
        set((state) => ({ skills: state.skills.filter((item) => item.id !== id) })),
      restoreBuiltInSkills: () =>
        set((state) => {
          const existingIds = new Set(state.skills.map((item) => item.id));
          const restored = builtInSkills
            .filter((item) => !existingIds.has(item.id))
            .map((item) => ({
              ...item,
              source: 'built-in' as const,
              enabled: true,
              slash: true,
              createdAt: Date.now(),
            }));
          return { skills: [...state.skills, ...restored] };
        }),
    }),
    {
      name: 'uw-next-skills-domain',
      version: 2,
      partialize: (state) => ({ skills: state.skills }),
    },
  ),
);

