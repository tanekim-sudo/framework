import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-700',
    error: 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700',
    warning: 'bg-amber-500 dark:bg-amber-600 border-amber-600 dark:border-amber-700',
    info: 'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-700',
  };

  const Icon = icons[toast.type];
  const colorClass = colors[toast.type];

  return (
    <div className="glass-panel p-4 rounded-xl shadow-xl border-2 min-w-[300px] max-w-md animate-slide-up flex items-start gap-3">
      <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastComponent;

