'use client';

import { useState, type ComponentType } from 'react';
import { CanvasSettings } from './general/canvas-settings';
import { GenerationSettings } from './general/generation-settings';
import { InterfaceSettings } from './general/interface-settings';
import { PromptSettings } from './general/prompt-settings';
import { ShortcutSettings } from './general/shortcut-settings';
import { SkillsSettings } from './general/skills-settings';

type GeneralTab = '界面' | '画布' | '快捷键' | '提示词' | '生成' | '技能';

const TAB_IDS: GeneralTab[] = ['界面', '画布', '快捷键', '提示词', '生成', '技能'];

const TAB_CONTENT: Record<GeneralTab, ComponentType> = {
  界面: InterfaceSettings,
  画布: CanvasSettings,
  快捷键: ShortcutSettings,
  提示词: PromptSettings,
  生成: GenerationSettings,
  技能: SkillsSettings,
};

export function GeneralSettings() {
  const [subtab, setSubtab] = useState<GeneralTab>('界面');
  const ActiveSection = TAB_CONTENT[subtab];

  return (
    <div>
      <div className="flex gap-5 border-b border-zinc-200/60 px-6 dark:border-white/10">
        {TAB_IDS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSubtab(tab)}
            className={`-mb-px h-10 border-b-2 text-xs transition-colors ${
              subtab === tab
                ? 'border-zinc-900 font-medium text-zinc-950 dark:border-white dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="VOzbGW_options space-y-5 px-6 pb-6 pt-4">
        <ActiveSection />
      </div>
    </div>
  );
}
