import React, { useEffect } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({
  message,
  type = 'info', // success, warning, error, info
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      bg: 'bg-green-500/10 border-green-500/30 text-green-400',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: ShieldAlert
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      icon: Info
    }
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <div className="fixed bottom-5 right-5 z-55 max-w-sm w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
          className={`flex items-start gap-3 p-4 rounded-xl border ${current.bg} shadow-xl backdrop-blur-md`}
        >
          <Icon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs font-semibold leading-relaxed">
            {message}
          </div>
          <button
            onClick={onClose}
            className="p-0.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Toast;
