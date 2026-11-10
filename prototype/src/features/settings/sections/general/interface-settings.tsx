'use client';

import { ChevronRight, Download, Palette, Upload } from 'lucide-react';
import { useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { useShellStore } from '@/features/app-shell/shell-store';
import {
  Segmented,
  SettingsRow,
  SettingsToggle,
} from '@/features/settings/components/settings-controls';
import { useSettingsStore } from '@/features/settings/settings-store';
import type { AppSettings } from '@/lib/types';

export function InterfaceSettings() {
  const theme = useShellStore((state) => state.theme);
  const setTheme = useShellStore((state) => state.setTheme);
  const pushToast = useShellStore((state) => state.pushToast);
  const settings = useSettingsStore();
  const updateSettings = settings.updateSettings;
  const importRef = useRef<HTMLInputElement>(null);

  const exportConfig = () => {
    const exportValue = {
      ...settings,
      globalApiKey: settings.includeSecrets ? settings.globalApiKey : '',
      cloudinaryApiSecret: settings.includeSecrets ? settings.cloudinaryApiSecret : '',
      modelOverrides: Object.fromEntries(
        Object.entries(settings.modelOverrides).map(([id, value]) => [
          id,
          { ...value, key: settings.includeSecrets ? value.key : '' },
        ]),
      ),
      theme,
    };
    const blob = new Blob([JSON.stringify(exportValue, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = 'unlimited-works-config.json';
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast('配置已导出。', 'success');
  };

  return (
    <>
      <SettingsRow
        title={`主题 · ${theme === 'dark' ? '黑度 默认' : '白度 默认'}`}
        description="UW Agent 悬浮页面"
        detail="默认在右侧上下铺满；开启后可拖动面板并调整高度"
        control={
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs dark:border-white/10"
          >
            <Palette size={14} />
            {theme === 'dark' ? '暗色' : '亮色'}
            <ChevronRight size={12} />
          </button>
        }
      />
      <SettingsRow
        title="UW Agent 悬浮页面"
        description="默认在右侧上下铺满；开启后可拖动面板并调整高度"
        control={
          <Switch
            checked={settings.floatingAgentPanel}
            onChange={(floatingAgentPanel) => updateSettings({ floatingAgentPanel })}
            label="UW Agent 悬浮页面"
          />
        }
      />
      <SettingsRow
        title="启用 Markdown 渲染"
        description="在文本节点中启用 Markdown 格式渲染"
        control={
          <Switch
            checked={settings.markdownRendering}
            onChange={(markdownRendering) => updateSettings({ markdownRendering })}
            label="启用 Markdown 渲染"
          />
        }
      />
      <SettingsRow
        title="启用提示词字符统计"
        description="悬停提示词输入区域时，在右下角显示字符数"
        control={
          <Switch
            checked={settings.promptCharCount}
            onChange={(promptCharCount) => updateSettings({ promptCharCount })}
            label="启用提示词字符统计"
          />
        }
      />
      <SettingsRow
        title="生图覆盖模式"
        description="控制 ImageGenNode 再次生成时如何处理已有图片"
        control={
          <Segmented
            value={settings.imageOverwriteMode}
            options={[
              ['overwrite', '覆盖'],
              ['append', 'Slots'],
            ]}
            onChange={(imageOverwriteMode) =>
              updateSettings({
                imageOverwriteMode:
                  imageOverwriteMode as AppSettings['imageOverwriteMode'],
              })
            }
          />
        }
      />
      <SettingsRow
        title="资产卡片显示模式"
        description="切换分组标签页或聚合资产视图"
        control={
          <Segmented
            value={settings.assetCardMode}
            options={[
              ['grouped', '分组'],
              ['aggregate', '聚合'],
            ]}
            onChange={(assetCardMode) =>
              updateSettings({
                assetCardMode: assetCardMode as AppSettings['assetCardMode'],
              })
            }
          />
        }
      />
      <SettingsToggle
        title="资产面板图片铺满显示"
        description="关闭时按原始比例显示，开启时拉伸铺满格子"
        checked={settings.assetFill}
        onChange={(assetFill) => updateSettings({ assetFill })}
      />
      <SettingsToggle
        title="资产面板按日期分组"
        description="按生成日期对资产进行分组显示"
        checked={settings.assetGroupByDate}
        onChange={(assetGroupByDate) => updateSettings({ assetGroupByDate })}
      />
      <SettingsToggle
        title="模型下拉按厂商分组"
        description="在图片生成节点的模型选择器中按厂商分组显示模型"
        checked={settings.groupModelsByVendor}
        onChange={(groupModelsByVendor) => updateSettings({ groupModelsByVendor })}
      />
      <SettingsRow
        title="设置窗口大小"
        description="调整设置面板的显示尺寸"
        control={
          <Segmented
            value={settings.settingsSize}
            options={[
              ['compact', '紧凑'],
              ['default', '默认'],
              ['wide', '宽敞'],
            ]}
            onChange={(settingsSize) =>
              updateSettings({
                settingsSize: settingsSize as AppSettings['settingsSize'],
              })
            }
          />
        }
      />
      <SettingsToggle
        title="包含 API 密钥等敏感信息"
        description="关闭时导出文件不含密钥，更安全"
        checked={settings.includeSecrets}
        onChange={(includeSecrets) => updateSettings({ includeSecrets })}
      />
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={exportConfig} className="SettingsAction">
          <Download size={14} />
          导出配置
        </button>
        <button
          type="button"
          onClick={() => importRef.current?.click()}
          className="SettingsAction"
        >
          <Upload size={14} />
          导入配置
        </button>
        <input
          ref={importRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              const parsed = JSON.parse(await file.text()) as Partial<AppSettings> & {
                theme?: 'dark' | 'light';
              };
              const { theme: importedTheme, ...patch } = parsed;
              updateSettings(patch as Partial<AppSettings>);
              if (importedTheme === 'dark' || importedTheme === 'light') {
                setTheme(importedTheme);
              }
              pushToast('配置已导入并应用。', 'success');
            } catch (error) {
              pushToast(
                error instanceof Error ? error.message : '配置文件格式无效',
                'error',
                '导入失败',
              );
            }
            event.target.value = '';
          }}
        />
      </div>
    </>
  );
}
