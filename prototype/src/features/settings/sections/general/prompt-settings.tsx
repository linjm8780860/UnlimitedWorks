'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Segmented } from '@/features/settings/components/settings-controls';

const promptCommands = [
  ['/多机位九宫格', 'Generate 9 angles composition'],
  ['/电影级光影校正', 'Cinematic lighting correction'],
  ['/角色三视图生成', 'Character turnaround sheet'],
  ['/画面推演 - 3秒后', 'Predict 3 seconds later'],
  ['/画面推演 - 5秒前', 'Infer 5 seconds before'],
];

export function PromptSettings() {
  const [promptType, setPromptType] = useState('Image');
  return (
    <>
      <div className="flex gap-1 rounded-xl bg-black/[.04] p-1 dark:bg-white/[.05]">
        {['Image', 'Text', 'Audio', 'Video'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPromptType(item)}
            className={`h-8 flex-1 rounded-lg text-xs ${
              promptType === item
                ? 'bg-white font-medium text-zinc-900 shadow-sm dark:bg-white/10 dark:text-white'
                : 'text-zinc-500'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div>
        <h3 className="text-sm font-semibold">{promptType} Slash Commands</h3>
        <p className="mt-1 text-xs text-zinc-500">
          节点内编辑会和这里双向全局同步，排序也会全局生效。
        </p>
      </div>
      <button type="button" className="SettingsAction">
        <Sparkles size={14} />
        新建 Prompt
      </button>
      <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-white/10 dark:border-white/10">
        {promptCommands.map(([command, description]) => (
          <div key={command} className="flex items-center gap-3 px-3 py-3">
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-xs text-zinc-800 dark:text-zinc-200">
                {command}
              </span>
              <span className="mt-1 block text-[10px] text-zinc-500">
                {description}
              </span>
            </span>
            <button type="button" className="text-[10px] text-violet-500">
              编辑
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="SettingsAction">
          恢复应用默认
        </button>
        <button type="button" className="SettingsAction">
          保存并全局同步
        </button>
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <div className="text-xs font-medium">导入 / 导出</div>
        <div className="mt-2 flex gap-2">
          <button type="button" className="SettingsAction">
            导出 uw_prompts.json
          </button>
          <button type="button" className="SettingsAction">
            导入 JSON
          </button>
        </div>
        <div className="mt-3 flex gap-1">
          <Segmented
            value="Append"
            options={[
              ['Append', 'Append'],
              ['Overwrite', 'Overwrite'],
            ]}
            onChange={() => undefined}
          />
        </div>
        <p className="mt-2 text-[10px] leading-4 text-zinc-500">
          Append 会保留现有顺序并追加新项，Overwrite 会以导入文件为准完全替换当前全局库。
        </p>
      </div>
    </>
  );
}
