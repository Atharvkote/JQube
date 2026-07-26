'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchContext } from 'fumadocs-ui/provider';
import { Search, Sparkles, Monitor, ArrowUpRight } from 'lucide-react';

export function Navbar() {
  const { setOpenSearch } = useSearchContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#dc143c]/20 bg-[#08090f]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 md:px-6">

        {/* Left Side: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white hover:opacity-90 transition-opacity">
            <Image
              src="/JQube.png"
              alt="JQube Logo"
              width={26}
              height={26}
              className="object-contain"
            />
            <span className="text-base tracking-tight font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              JQube
            </span>
          </Link>
        </div>

        {/* Middle Side: Search Capsule & Ask AI */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-auto justify-center">
          <button
            onClick={() => setOpenSearch(true)}
            className="flex items-center gap-2.5 bg-[#0e1012] hover:bg-[#15171c] border border-[#1e2025] hover:border-gray-600 rounded-full px-4 py-1.5 w-72 transition-all text-sm text-gray-400 text-left focus:outline-none focus:ring-1 focus:ring-[#dc143c]/30"
          >
            <Search className="h-4 w-4 text-gray-500" />
            <span className="flex-1 text-xs text-gray-500">Search docs</span>
            <span className="text-[10px] font-mono bg-[#1c1e22] border border-[#2e3137] px-1.5 py-0.5 rounded text-gray-400">/</span>
          </button>

        </div>

        {/* Right Side: Navigation & Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/docs"
            className="hidden sm:inline-flex text-xs font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Docs
          </Link>
          <Link
            href="/blog"
            className="hidden sm:inline-flex text-xs font-medium text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Blog
          </Link>

          <div className="h-4 w-px bg-[#1e2025] hidden sm:block" />

          {/* Premium "Edit" button matching screen */}
          <Link
            href="https://github.com/jqube"
            target="_blank"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#dc143c] hover:bg-[#ff4d6d] text-white transition-all shadow-md shadow-[#dc143c]/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Edit</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>

          {/* Device Switched Icon */}
          <button
            aria-label="Viewport Mode"
            className="p-1.5 rounded-lg border border-[#1e2025] hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
