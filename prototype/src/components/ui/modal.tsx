'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-2xl',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/45 px-4 py-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl dark:border-white/10 dark:bg-[#151515] dark:text-zinc-100 ${width} ${className}`}
      >
        {(title || showCloseButton) && (
          <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200/70 px-5 py-4 dark:border-white/10">
            {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
            {showCloseButton && (
              <button
                type="button"
                aria-label="关闭"
                onClick={onClose}
                className="ml-auto grid size-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </section>
    </div>
  );
}

