import React from 'react';
import { Database, FileQuestion, Filter } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No records found',
  description = 'Try adjusting your search terms or filters.',
  actionButton
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/80 text-slate-400 mb-4 ring-4 ring-slate-850/50">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-450 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionButton && (
        <div className="mt-1">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
