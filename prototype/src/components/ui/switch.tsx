'use client';

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative box-border h-5 w-9 flex-none rounded-full border-0 p-0.5 transition-colors disabled:cursor-default disabled:opacity-50 ${
        checked ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-white/20'
      } ${className}`}
    >
      <span
        className={`block h-4 w-4 rounded-full bg-white transition-transform duration-[120ms] ease-out dark:bg-zinc-900 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

