'use client';

import { ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function SettingsRow({
  title,
  description,
  detail,
  control,
}: {
  title: string;
  description: string;
  detail?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-zinc-100 pb-4 last:border-b-0 dark:border-white/[.07]">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{title}</div>
        <div className="mt-1 text-[10px] leading-4 text-zinc-500">{description}</div>
        {detail && detail !== description && (
          <div className="mt-0.5 text-[10px] leading-4 text-zinc-500">{detail}</div>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function SettingsToggle({
  title,
  description,
  checked,
  onChange,
  boxed = true,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  boxed?: boolean;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{title}</div>
        <div className="mt-1 text-[10px] leading-4 text-zinc-500">{description}</div>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
  return boxed ? (
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">{content}</div>
  ) : (
    content
  );
}

export function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex rounded-lg bg-black/[.04] p-0.5 dark:bg-white/[.06]">
      {options.map(([option, label]) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`h-7 rounded-md px-2.5 text-[10px] transition-colors ${
            value === option
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-white/15 dark:text-white'
              : 'text-zinc-500'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SliderSetting({
  title,
  description,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  compact = false,
}: {
  title: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'mt-3' : 'rounded-xl border border-zinc-200 p-3 dark:border-white/10'}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{title}</div>
          <div className="mt-1 text-[10px] leading-4 text-zinc-500">{description}</div>
        </div>
        <span className="rounded-md bg-black/[.04] px-2 py-1 font-mono text-[10px] text-zinc-500 dark:bg-white/[.06]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-violet-500"
      />
    </div>
  );
}

export function SelectLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="min-w-0 flex-1 text-xs text-zinc-500">{label}</span>
      <button
        type="button"
        className="inline-flex h-8 min-w-[158px] items-center justify-between gap-2 rounded-lg border border-zinc-200 px-2.5 text-[11px] text-zinc-600 dark:border-white/10 dark:text-zinc-300"
      >
        {value}
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

