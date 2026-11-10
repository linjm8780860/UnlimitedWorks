'use client';

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useShellStore } from '@/features/app-shell/shell-store';

export function ToastStack() {
  const toasts = useShellStore((state) => state.toasts);
  const dismissToast = useShellStore((state) => state.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[260] flex w-[340px] max-w-[calc(100vw-32px)] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon =
          toast.tone === 'success' ? CheckCircle2 : toast.tone === 'error' ? AlertCircle : Info;
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-zinc-700 shadow-xl dark:bg-[#1d1d1f] dark:text-zinc-200 ${
              toast.tone === 'error'
                ? 'border-rose-500/25'
                : toast.tone === 'success'
                  ? 'border-emerald-500/25'
                  : 'border-zinc-200 dark:border-white/10'
            }`}
          >
            <Icon
              size={17}
              className={`mt-0.5 shrink-0 ${
                toast.tone === 'error'
                  ? 'text-rose-500'
                  : toast.tone === 'success'
                    ? 'text-emerald-500'
                    : 'text-zinc-400'
              }`}
            />
            <div className="min-w-0 flex-1">
              {toast.title && <div className="mb-0.5 text-xs font-semibold">{toast.title}</div>}
              <div className="text-xs leading-5">{toast.message}</div>
            </div>
            <button
              type="button"
              aria-label="关闭提示"
              onClick={() => dismissToast(toast.id)}
              className="grid size-6 shrink-0 place-items-center rounded-md text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

