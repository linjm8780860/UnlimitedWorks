'use client';

import { Network, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { generalProvider, modelCatalog } from '@/lib/catalog';
import { useSettingsStore } from '@/features/settings/settings-store';
import { useShellStore } from '@/features/app-shell/shell-store';
export function ApiSettings() {
  const settings = useSettingsStore();
  const updateSettings = settings.updateSettings;
  const pushToast = useShellStore((state) => state.pushToast);
  const [apiTab, setApiTab] = useState('标准 API');
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [modelDraft, setModelDraft] = useState({ modelName: '', url: '', key: '' });
  const groupedModels = useMemo(() => {
    const grouped = new Map<string, typeof modelCatalog>();
    modelCatalog.forEach((model) => {
      const provider = generalProvider(model.provider);
      grouped.set(provider, [...(grouped.get(provider) ?? []), model]);
    });
    return Array.from(grouped.entries());
  }, []);
  return (
    <div className="space-y-5 px-6 py-4">
      <div className="flex flex-wrap gap-1 rounded-lg bg-black/[.04] p-1 dark:bg-white/[.05]">
        {['标准 API', 'RH 工作流 API', 'ComfyUI API（需要 Pro）', 'ByteDance API'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setApiTab(item)}
            className={`h-8 rounded-md px-2.5 text-[11px] ${
              apiTab === item
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-white/10 dark:text-white'
                : 'text-zinc-500'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <div className="text-sm font-semibold">全局 API 密钥</div>
        <p className="mt-1 text-[10px] text-zinc-500">
          点击右侧下拉按钮切换 Key，每个 Base URL 独立存储
        </p>
        <label className="mt-3 flex items-center gap-2">
          <span className="w-28 text-xs text-zinc-500">API Key</span>
          <input
            type="password"
            aria-label="全局 API Key"
            value={settings.globalApiKey}
            onChange={(event) => updateSettings({ globalApiKey: event.target.value })}
            placeholder="sk-..."
            className="h-8 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 font-mono text-xs outline-none dark:border-white/10"
          />
        </label>
        <label className="mt-3 flex items-center gap-2">
          <span className="w-28 text-xs text-zinc-500">全局 Base URL</span>
          <input
            aria-label="全局 Base URL"
            value={settings.globalBaseUrl}
            onChange={(event) => updateSettings({ globalBaseUrl: event.target.value })}
            className="h-8 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2 text-xs font-mono outline-none dark:border-white/10"
          />
        </label>
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Cloudinary 图床</div>
          <button type="button" className="SettingsAction">
            测试
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {['Cloud Name', 'API Key', 'API Secret'].map((label) => (
            <label key={label}>
              <span className="mb-1 block text-[10px] text-zinc-500">{label}</span>
              <input
                aria-label={label}
                type={label === 'API Secret' ? 'password' : 'text'}
                value={
                  label === 'Cloud Name'
                    ? settings.cloudinaryCloudName
                    : label === 'API Key'
                      ? settings.cloudinaryApiKey
                      : settings.cloudinaryApiSecret
                }
                onChange={(event) =>
                  updateSettings(
                    label === 'Cloud Name'
                      ? { cloudinaryCloudName: event.target.value }
                      : label === 'API Key'
                        ? { cloudinaryApiKey: event.target.value }
                        : { cloudinaryApiSecret: event.target.value },
                  )
                }
                className="h-8 w-full rounded-lg border border-zinc-200 bg-transparent px-2 text-xs outline-none dark:border-white/10"
              />
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">API 配置列表</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              updateSettings({
                modelOverrides: {},
                globalBaseUrl: 'https://ai.comfly.org',
              });
              pushToast('API 模型配置已恢复默认。', 'success');
            }}
            className="SettingsAction"
          >
            <RotateCcw size={13} />
            恢复默认
          </button>
          <button
            type="button"
            onClick={() => pushToast('已提交 API 连通性检查。', 'success', 'Ping 全部')}
            className="SettingsAction"
          >
            <Network size={13} />
            Ping 全部
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {groupedModels.map(([provider, models]) => (
          <section key={provider}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                {provider}
              </span>
              <span className="text-[10px] text-zinc-400">{models.length} models</span>
            </div>
            <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-white/[.07] dark:border-white/10">
              {models.map((model) => {
                const override = settings.modelOverrides[model.id];
                const editing = editingModel === model.id;
                return (
                  <div key={model.id} className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{model.displayName}</div>
                        <div className="mt-0.5 truncate text-[10px] text-zinc-400">
                          {override?.modelName || model.modelName}
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500">{provider}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (editing) {
                            setEditingModel(null);
                          } else {
                            setEditingModel(model.id);
                            setModelDraft({
                              modelName: override?.modelName ?? model.modelName,
                              url: override?.url ?? model.url ?? '',
                              key: override?.key ?? '',
                            });
                          }
                        }}
                        className="text-[10px] text-violet-500"
                      >
                        {editing ? '收起' : '编辑'}
                      </button>
                    </div>
                    {editing && (
                      <div className="mt-2 grid grid-cols-[1.1fr_1.3fr_1fr_auto] gap-1.5 rounded-lg bg-black/[.03] p-2 dark:bg-white/[.04]">
                        <input
                          aria-label={`${model.displayName} model name`}
                          value={modelDraft.modelName}
                          onChange={(event) =>
                            setModelDraft((current) => ({
                              ...current,
                              modelName: event.target.value,
                            }))
                          }
                          placeholder="Model name"
                          className="h-7 rounded-md border border-zinc-200 bg-white px-1.5 text-[10px] dark:border-white/10 dark:bg-[#1b1b1d]"
                        />
                        <input
                          aria-label={`${model.displayName} URL`}
                          value={modelDraft.url}
                          onChange={(event) =>
                            setModelDraft((current) => ({ ...current, url: event.target.value }))
                          }
                          placeholder="Base URL override"
                          className="h-7 rounded-md border border-zinc-200 bg-white px-1.5 text-[10px] dark:border-white/10 dark:bg-[#1b1b1d]"
                        />
                        <input
                          aria-label={`${model.displayName} API key`}
                          type="password"
                          value={modelDraft.key}
                          onChange={(event) =>
                            setModelDraft((current) => ({ ...current, key: event.target.value }))
                          }
                          placeholder="Key override"
                          className="h-7 rounded-md border border-zinc-200 bg-white px-1.5 text-[10px] dark:border-white/10 dark:bg-[#1b1b1d]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateSettings({
                              modelOverrides: {
                                ...settings.modelOverrides,
                                [model.id]: modelDraft,
                              },
                            });
                            setEditingModel(null);
                            pushToast('模型配置已保存。', 'success');
                          }}
                          className="h-7 rounded-md bg-zinc-900 px-2 text-[10px] text-white dark:bg-white dark:text-zinc-900"
                        >
                          保存
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}