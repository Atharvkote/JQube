'use client';

import { Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';

export default function CustomCallout({
  title,
  children,
  type = 'info',
  icon,
}: {
  title?: ReactNode;
  children: ReactNode;
  type?: 'info' | 'warn' | 'error' | 'success' | 'warning';
  icon?: ReactNode;
}) {
  let DefaultIcon = Info;
  if (type === 'warn' || type === 'warning') DefaultIcon = AlertTriangle;
  else if (type === 'error') DefaultIcon = XCircle;
  else if (type === 'success') DefaultIcon = CheckCircle2;

  return (
    <div className="my-6 flex items-start gap-3 rounded-xl border border-[#dc143c]/30 bg-[#dc143c]/10 p-4 text-sm shadow-[0_0_20px_rgba(220,20,60,0.08)] transition-colors hover:border-[#ff4d6d]/50">
      <div className="mt-0.5 shrink-0 text-[#ff4d6d]">
        {icon ?? <DefaultIcon className="h-5 w-5" />}
      </div>
      <div className="flex-1 w-full min-w-0 flex flex-col gap-1 text-zinc-300">
        {title && <div className="font-semibold text-white">{title}</div>}
        <div className="leading-relaxed [&>p]:m-0 [&_a]:text-[#ff4d6d] [&_a]:font-medium hover:[&_a]:text-[#ff4d6d]/80 [&_a]:underline-offset-2 [&_a]:transition-colors">
          {children}
        </div>
      </div>
    </div>
  );
}
