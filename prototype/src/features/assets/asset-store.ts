'use client';

import { create } from 'zustand';
import type { AssetItem } from '@/lib/types';
import {
  deleteAsset,
  importLegacyAssets,
  listAssets,
  putAsset,
} from './asset-repository';

type AssetState = {
  assets: AssetItem[];
  hydrated: boolean;
  persistenceError: string | null;
  hydrateAssets: () => Promise<void>;
  addAsset: (asset: AssetItem) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
};

let hydrationPromise: Promise<void> | null = null;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  hydrated: false,
  persistenceError: null,
  hydrateAssets: async () => {
    if (get().hydrated) return;
    if (hydrationPromise) return hydrationPromise;
    hydrationPromise = (async () => {
      try {
        const existing = await listAssets();
        const assets = existing.length ? existing : await importLegacyAssets();
        set({ assets, hydrated: true, persistenceError: null });
      } catch (error) {
        set({ persistenceError: errorMessage(error), hydrated: true });
        throw error;
      } finally {
        hydrationPromise = null;
      }
    })();
    return hydrationPromise;
  },
  addAsset: async (asset) => {
    const previous = get().assets.find((item) => item.id === asset.id);
    set((state) => ({
      assets: [asset, ...state.assets.filter((item) => item.id !== asset.id)],
      persistenceError: null,
    }));
    try {
      await putAsset(asset);
    } catch (error) {
      set((state) => ({
        assets: previous
          ? state.assets.map((item) => (item.id === asset.id ? previous : item))
          : state.assets.filter((item) => item.id !== asset.id),
        persistenceError: errorMessage(error),
      }));
      throw error;
    }
  },
  removeAsset: async (id) => {
    const current = get().assets;
    const index = current.findIndex((item) => item.id === id);
    const previous = current[index];
    if (!previous) return;
    set({ assets: current.filter((item) => item.id !== id), persistenceError: null });
    try {
      await deleteAsset(id);
    } catch (error) {
      set((state) => {
        if (state.assets.some((item) => item.id === id)) return state;
        const assets = [...state.assets];
        assets.splice(Math.min(index, assets.length), 0, previous);
        return { assets, persistenceError: errorMessage(error) };
      });
      throw error;
    }
  },
}));
