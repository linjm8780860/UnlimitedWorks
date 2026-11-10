'use client';

import { useRef, type ReactNode } from 'react';
import { useOutsidePointer } from '@/lib/hooks';

export function Popover({
  open,
  onClose,
  trigger,
  children,
  align = 'left',
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsidePointer(ref, onClose, open);

  return (
    <div ref={ref} className="relative min-w-0">
      {trigger}
      {open && (
        <div
          className={`absolute top-full z-[210] mt-2 min-w-[220px] overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 text-zinc-800 shadow-2xl dark:border-white/10 dark:bg-[#1b1b1d] dark:text-zinc-200 ${
            align === 'right'
              ? 'right-0'
              : align === 'center'
                ? 'left-1/2 -translate-x-1/2'
                : 'left-0'
          } ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  icon,
  title,
  description,
  selected,
  trailing,
  onClick,
  disabled,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors disabled:opacity-45 ${
        selected
          ? 'bg-zinc-100 text-zinc-950 dark:bg-white/10 dark:text-white'
          : 'text-zinc-600 hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/[.07] dark:hover:text-white'
      }`}
    >
      {icon && <span className="mt-0.5 shrink-0 text-zinc-400">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{title}</span>
          {trailing}
        </span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-4 text-zinc-500">{description}</span>
        )}
      </span>
    </button>
  );
}

