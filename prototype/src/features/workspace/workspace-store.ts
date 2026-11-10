'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId } from '@/lib/id';
import type { Project, Workspace } from '@/lib/types';
import { migrateLegacyWorkspaceStore } from '@/features/shared/legacy-migration';

migrateLegacyWorkspaceStore();

type WorkspaceState = {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  projects: Project[];
  setSelectedWorkspaceId: (id: string | null) => void;
  addWorkspace: (name: string, path: string) => Workspace;
  removeWorkspace: (id: string) => void;
  addProject: (name: string, path?: string) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaces: [],
      selectedWorkspaceId: null,
      projects: [],
      setSelectedWorkspaceId: (selectedWorkspaceId) => set({ selectedWorkspaceId }),
      addWorkspace: (name, path) => {
        const workspace: Workspace = {
          id: createId('workspace'),
          name,
          path,
          createdAt: Date.now(),
        };
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          selectedWorkspaceId: workspace.id,
        }));
        return workspace;
      },
      removeWorkspace: (id) =>
        set((state) => ({
          workspaces: state.workspaces.filter((item) => item.id !== id),
          selectedWorkspaceId:
            state.selectedWorkspaceId === id ? null : state.selectedWorkspaceId,
        })),
      addProject: (name, path = '') => {
        const now = Date.now();
        const project: Project = {
          id: createId('project'),
          name,
          path: path || `~/UnlimitedWorks/${name}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return project;
      },
      updateProject: (id, patch) =>
        set((state) => ({
          projects: state.projects.map((item) =>
            item.id === id ? { ...item, ...patch, updatedAt: Date.now() } : item,
          ),
        })),
      removeProject: (id) =>
        set((state) => ({ projects: state.projects.filter((item) => item.id !== id) })),
    }),
    {
      name: 'uw-next-workspace-domain',
      version: 2,
      partialize: (state) => ({
        workspaces: state.workspaces,
        selectedWorkspaceId: state.selectedWorkspaceId,
        projects: state.projects,
      }),
    },
  ),
);

