import React from 'react';
import logo from '../../assets/logo.png';

export const Spinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-t-blue-500 border-r-transparent border-slate-700 ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-xl animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-slate-800 rounded-lg"></div>
        <div className="w-12 h-4 bg-slate-800 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 bg-slate-800 rounded"></div>
        <div className="w-32 h-6 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-slate-900/40 border border-slate-850 rounded-xl overflow-hidden animate-pulse">
      <div className="flex px-6 py-4 bg-slate-900 border-b border-slate-800">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="flex-1 h-4 bg-slate-800 rounded mx-2"></div>
        ))}
      </div>
      <div className="divide-y divide-slate-800/60">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex px-6 py-4 items-center">
            {[...Array(cols)].map((_, j) => (
              <div key={j} className="flex-1 h-3.5 bg-slate-800/80 rounded mx-2"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Loader = ({ fullPage = false, message = 'Loading JQube Platform...' }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="relative flex flex-col items-center justify-center mb-4">
          <img
            src={logo}
            alt="JQube Logo"
            className="w-44 h-auto object-contain animate-pulse select-none drop-shadow-xl mb-4"
          />
          <div className="w-10 h-10 border-3 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <img
        src={logo}
        alt="JQube Logo"
        className="w-32 h-auto object-contain animate-pulse select-none drop-shadow-md"
      />
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
};

export default Loader;
