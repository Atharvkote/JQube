import CustomNavBar from '@/components/CustomNavBar';
import type { ReactNode } from 'react';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <CustomNavBar />
      <main className="flex-1 bg-[#050507]">{children}</main>
    </div>
  );
}
