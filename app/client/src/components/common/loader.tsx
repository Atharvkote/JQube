// JQube — Loader Components (TSX)

import { ShieldCheck } from 'lucide-react';

interface LoaderProps {
  fullPage?: boolean;
  message?: string;
}

export function Loader({ fullPage = false, message }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-[#0F1117] border-t-[#FF3B3B] animate-spin" />
        <ShieldCheck className="w-5 h-5 text-[#FF3B3B] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      {message && (
        <p className="text-xs text-[#A1A1AA] font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-[#09090B] flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-[#151922] rounded-xl" />
      <div className="h-4 w-96 bg-[#0F1117] rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-44 bg-[#151922] border border-[#FF3B3B]/15 rounded-2xl"
          />
        ))}
      </div>
      <div className="h-80 bg-[#151922] border border-[#FF3B3B]/15 rounded-2xl" />
    </div>
  );
}

export default Loader;
