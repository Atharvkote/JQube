import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

const ErrorPage = ({
  code = '404',
  title = 'Page Not Found',
  description = 'The module or resource you are looking for has been moved, scanned, or deleted.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mb-6">
        <AlertOctagon className="w-12 h-12" />
      </div>
      <h1 className="text-6xl font-extrabold text-white tracking-tight">{code}</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">{title}</h2>
      <p className="text-sm text-slate-450 mt-2 max-w-md leading-relaxed">
        {description}
      </p>
      <div className="mt-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
