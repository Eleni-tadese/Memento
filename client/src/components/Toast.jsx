import React from 'react';
import { useToast } from '../context/ToastContext';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '💜',
};

const STYLES = {
  success: 'bg-green-900 border-l-4 border-green-400',
  error: 'bg-red-900 border-l-4 border-red-400',
  warning: 'bg-yellow-900 border-l-4 border-yellow-400',
  info: 'bg-deep-light border-l-4 border-gold',
};

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-80 text-cream px-4 py-3 rounded-lg shadow-xl flex items-start gap-3 animate-slide-in-right border border-gold/20 ${STYLES[toast.type] || STYLES.info}`}
          role="alert"
        >
          <span className="text-lg shrink-0">{ICONS[toast.type] || ICONS.info}</span>
          <p className="flex-1 text-sm leading-snug pt-0.5">{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white text-sm shrink-0 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
