import React from 'react';
import { ToastMessage, ToastVariant, useUiStore } from '@/store/uiStore';

const VARIANT_STYLES: Record<ToastVariant, string> = {
  [ToastVariant.Success]: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100',
  [ToastVariant.Info]: 'border-yellow-500/60 bg-yellow-500/15 text-yellow-100',
  [ToastVariant.Warning]: 'border-red-500/60 bg-red-500/15 text-red-100',
};

/**
 * Floating stack of toast notifications that fades items out after a short lifetime.
 */
const ToastViewport: React.FC = () => {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  React.useEffect(() => {
    if (toasts.length === 0) {
      return;
    }
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismissToast(toast.id);
      }, 4000),
    );
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismissToast]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
      <div className="flex w-full max-w-md flex-col gap-3">
        {toasts.map((toast: ToastMessage) => (
          <div
            key={toast.id}
            className={`steampunk-glass steampunk-border overflow-hidden rounded-md border-l-4 p-4 shadow-lg transition-all ${VARIANT_STYLES[toast.variant]}`}
            role="status"
            aria-live="assertive"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-cinzel text-sm uppercase tracking-widest text-white/80">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm text-white/80">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-xs uppercase tracking-wider text-yellow-200/80 hover:text-yellow-100"
              >
                Schließen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastViewport;
