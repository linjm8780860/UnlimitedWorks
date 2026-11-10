'use client';

import { Switch } from '@/components/ui/switch';
import { SettingsRow } from '@/features/settings/components/settings-controls';
import { useSkillsStore } from '@/features/skills/skills-store';

export function SkillsSettings() {
  const skills = useSkillsStore((state) => state.skills);
  const updateSkill = useSkillsStore((state) => state.updateSkill);
  return (
    <>
      <SettingsRow
        title="技能"
        description="控制 Agent 的领域行为和评估规则"
        control={
          <button type="button" className="SettingsAction">
            安装
          </button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="SettingsAction">
          全选 (共 {skills.length} 项)
        </button>
        <button type="button" className="SettingsAction">
          重置
        </button>
        <button type="button" className="SettingsAction">
          导出
        </button>
      </div>
      {skills.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center text-xs text-zinc-500 dark:border-white/10">
          暂无技能
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-white/10 dark:border-white/10">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-3 px-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium">{skill.name}</div>
                <div className="mt-0.5 truncate text-[10px] text-zinc-500">
                  {skill.description}
                </div>
              </div>
              <Switch
                checked={skill.enabled}
                onChange={(enabled) => updateSkill(skill.id, { enabled })}
                label={`启用技能 ${skill.name}`}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
