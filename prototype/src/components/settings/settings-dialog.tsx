'use client';

import {
  CircleHelp,
  FileText,
  Gauge,
  Globe2,
  KeyRound,
  LayoutGrid,
  Palette,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useShellStore } from '@/features/app-shell/shell-store';
import { useSettingsStore } from '@/features/settings/settings-store';
import { ApiSettings } from '@/features/settings/sections/api-settings';
import { GeneralSettings } from '@/features/settings/sections/general-settings';
import {
  AboutSettings,
  LogSettings,
  PerformanceSettings,
  ProSettings,
  ProxySettings,
} from '@/features/settings/sections/system-settings';

type SettingsTab =
  | '通用'
  | 'UW Harness'
  | '资产库'
  | 'API 配置'
  | '代理设置'
  | '性能'
  | '日志'
  | 'UW Pro'
  | '关于';

const settingsTabs: Array<{
  id: SettingsTab;
  icon: typeof Palette;
}> = [
  { id: '通用', icon: Palette },
  { id: 'UW Harness', icon: Sparkles },
  { id: '资产库', icon: LayoutGrid },
  { id: 'API 配置', icon: KeyRound },
  { id: '代理设置', icon: Globe2 },
  { id: '性能', icon: Gauge },
  { id: '日志', icon: FileText },
  { id: 'UW Pro', icon: Wrench },
  { id: '关于', icon: CircleHelp },
];

const widthBySize = {
  compact: 'w-[680px]',
  default: 'w-[800px]',
  wide: 'w-[960px]',
} as const;

export function SettingsDialog() {
  const settingsOpen = useShellStore((state) => state.settingsOpen);
  const closeSettings = useShellStore((state) => state.closeSettings);
  const [tab, setTab] = useState<SettingsTab>('通用');
  const settingsSize = useSettingsStore((state) => state.settingsSize);

  if (!settingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[225] flex items-center justify-center bg-black/30 px-3 py-3 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeSettings();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="设置"
        className={`VOzbGW_panel uw-settings-panel flex h-[min(780px,calc(100vh-24px))] max-w-[calc(100vw-24px)] ${widthBySize[settingsSize]} overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#151515] dark:text-zinc-100`}
      >
        <nav className="VOzbGW_nav flex w-[188px] shrink-0 flex-col gap-[18px] border-r border-zinc-200/70 px-3 pb-4 pt-[22px] dark:border-white/10">
          <div className="VOzbGW_navTitle px-3 text-xs font-semibold text-zinc-500">设置</div>
          <div className="VOzbGW_navList flex flex-col gap-1">
            {settingsTabs.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-left text-[13px] transition-colors ${
                    tab === item.id
                      ? 'bg-black/[.06] font-medium text-zinc-950 dark:bg-white/[.09] dark:text-white'
                      : 'text-zinc-500 hover:bg-black/[.04] hover:text-zinc-900 dark:hover:bg-white/[.05] dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon size={15} />
                  <span className="min-w-0 flex-1 truncate">{item.id}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={closeSettings}
            className="mt-auto flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] text-zinc-500 hover:bg-black/[.04] dark:hover:bg-white/[.05]"
          >
            <X size={15} />
            关闭
          </button>
        </nav>
        <div className="VOzbGW_content flex min-w-0 flex-1 flex-col">
          <header className="VOzbGW_header flex shrink-0 items-center gap-2 border-b border-zinc-200/60 px-4 pb-2 pt-5 dark:border-white/10">
            <h2 className="text-base font-semibold">{tab}</h2>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === '通用' && <GeneralSettings />}
            {tab === 'UW Harness' && <HarnessSettings />}
            {tab === '资产库' && <AssetLibrarySettings />}
            {tab === 'API 配置' && <ApiSettings />}
            {tab === '代理设置' && <ProxySettings />}
            {tab === '性能' && <PerformanceSettings />}
            {tab === '日志' && <LogSettings />}
            {tab === 'UW Pro' && <ProSettings />}
            {tab === '关于' && <AboutSettings />}
          </div>
        </div>
      </section>
    </div>
  );
}

function HarnessSettings() {
  return (
    <div className="space-y-5 px-6 py-5">
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">通用设置</div>
            <div className="mt-1 text-xs text-zinc-500">Agent 预设</div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-500">
            已就绪
          </span>
        </div>
        <div className="mt-4 text-[26px] font-bold tracking-[.18em] text-zinc-300 dark:text-zinc-600">
          UW
          <span className="ml-2 text-[10px] tracking-[.35em]">HARNESS</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          UW 会话 Agent 工作台，支持目标、计划、任务、工具调用与画布协作。
        </p>
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          连接插件服务后可配置语言、外观和工作视图。
        </p>
      </div>
    </div>
  );
}

function AssetLibrarySettings() {
  return (
    <div className="px-6 py-5">
      <h3 className="text-sm font-semibold">资产库</h3>
      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[.06] p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={15} className="text-amber-500" />
          资产库（Pro）
        </div>
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          资产库仅 Pro 等级及以上可用。请先激活或升级后使用。
        </p>
        <button
          type="button"
          className="mt-3 h-8 rounded-lg bg-amber-500 px-3 text-xs font-medium text-white"
        >
          前往 UW Pro
        </button>
      </div>
    </div>
  );
}


