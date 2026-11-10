'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/lib/types';
import { migrateLegacySettingsStore } from '@/features/shared/legacy-migration';

migrateLegacySettingsStore();

export const defaultSettings: AppSettings = {
  markdownRendering: true,
  promptCharCount: true,
  imageOverwriteMode: 'overwrite',
  assetCardMode: 'grouped',
  assetFill: false,
  assetGroupByDate: true,
  groupModelsByVendor: true,
  settingsSize: 'default',
  includeSecrets: false,
  floatingAgentPanel: true,
  connectionStyle: 'bezier',
  showMiniMap: true,
  namedRouteGhosts: true,
  autoFocusVideoAnalysis: true,
  spacePan: true,
  duplicateInheritsContainer: true,
  islandScales: true,
  islandVisibility: 'hover',
  wheelMode: 'zoom',
  zoomSensitivity: 1,
  focusPadding: 100,
  islandButtonCount: 5,
  persistIslandModes: true,
  performanceMode: 'off',
  showPerformanceHud: true,
  autoSave: true,
  idleSaveSeconds: 30,
  saveIntervalMinutes: 3,
  panoramaThumbnail: false,
  viewportPadding: 50,
  viewportNodeLimit: 220,
  viewportLargeImageLimit: 48,
  showReferenceMemory: true,
  autoCompressLargeImages: true,
  compressionPixelThreshold: 16,
  compressionMaxEdge: 4096,
  compressionQuality: 92,
  maxUndoSteps: 42,
  referenceTotalLimitMb: 30,
  referencePerImageLimitMb: 30,
  localCacheLimitMb: 150,
  imageExportMode: 'original',
  redundancyBackup: false,
  maxBackups: 10,
  proxyMode: 'system',
  autoLink: true,
  defaultSubagentModel: 'DeepSeek Flash',
  defaultImageModel: 'GPT Image 2',
  defaultVideoModel: 'Seedance 1.5 Pro',
  agentFocusNewNodes: true,
  showMultiInlineAiPrompts: true,
  localRepaint: true,
  localRepaintFeather: 12,
  localRepaintAutoFill: true,
  markedImageSendMode: 'both',
  referenceWatermark: false,
  referenceAutoDescribe: false,
  multimodalImageRecognition: 'onDemand',
  promptLighting: 'weak',
  defaultModel: 'DEEPSEEK FLASH',
  promptMode: 'default',
  mcpServerEnabled: false,
  automationPollingEnabled: true,
  globalBaseUrl: 'https://ai.comfly.org',
  globalApiKey: '',
  cloudinaryCloudName: '',
  cloudinaryApiKey: '',
  cloudinaryApiSecret: '',
  modelOverrides: {},
};

type SettingsState = AppSettings & {
  updateSettings: (patch: Partial<AppSettings>) => void;
  replaceSettings: (settings: Partial<AppSettings>) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (patch) => set(patch),
      replaceSettings: (settings) =>
        set((state) => ({
          ...state,
          ...defaultSettings,
          ...settings,
          modelOverrides: {
            ...defaultSettings.modelOverrides,
            ...(settings.modelOverrides ?? {}),
          },
        })),
    }),
    {
      name: 'uw-next-settings-domain',
      version: 2,
      migrate: (persisted) => ({
        ...defaultSettings,
        ...(persisted as Partial<AppSettings>),
        modelOverrides: {
          ...defaultSettings.modelOverrides,
          ...((persisted as Partial<AppSettings>)?.modelOverrides ?? {}),
        },
      }),
      partialize: (state) => {
        const settings = { ...state } as Partial<SettingsState>;
        delete settings.updateSettings;
        delete settings.replaceSettings;
        return settings as AppSettings;
      },
    },
  ),
);

