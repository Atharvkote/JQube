'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Terminal } from 'lucide-react';

export function SidebarNavTabs() {
  const pathname = usePathname();
  
  // Custom matching for Home vs API Reference routes
  const isApiActive = pathname.includes('/api-reference') || pathname.includes('/cli') || pathname.includes('/sdk');
  const isHomeActive = !isApiActive && pathname.startsWith('/docs');

  return (
    <div className="grid grid-cols-2 gap-1.5 mb-4 p-1 bg-[#090a0f] border border-[#1e2025] rounded-xl">
      <Link
        href="/docs"
        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
          isHomeActive
            ? 'bg-[#dc143c]/10 text-[#ff4d6d] border border-[#dc143c]/20 shadow-sm shadow-[#dc143c]/5'
            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
      >
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      <Link
        href="/docs/api-reference"
        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
          isApiActive
            ? 'bg-[#dc143c]/10 text-[#ff4d6d] border border-[#dc143c]/20 shadow-sm shadow-[#dc143c]/5'
            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
      >
        <Terminal className="h-3.5 w-3.5" />
        <span>API Reference</span>
      </Link>
    </div>
  );
}
