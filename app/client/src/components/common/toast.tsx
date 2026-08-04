// JQube — Toast Component (TSX)

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { ToastType } from '@/types';
import { splitToastMessage } from '@/utils/toastHelper';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isError = type === 'error' || type === 'warning';
  const { title, description } = splitToastMessage(message);

  return (
    <div
      className={`fixed top-20 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 min-w-[280px] ${isError
          ? 'bg-[#151922] border-[#FF3B3B]/40 text-white'
          : 'bg-[#151922] border-emerald-500/40 text-white'
        }`}
      role="alert"
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-[#FF3B3B] shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        {description ? (
          <>
            <p className="text-xs font-bold text-white">{title}</p>
            <p className="text-[11px] text-[#A1A1AA] mt-0.5 whitespace-normal break-words">
              {description}
            </p>
          </>
        ) : (
          <p className="text-xs font-medium text-white">{title}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 text-[#71717A] hover:text-white transition-colors"
        aria-label="Close toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

