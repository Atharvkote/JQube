'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSearchContext } from 'fumadocs-ui/provider';
import {
  BookOpen,
  Code2,
  Github,
  ChevronDown,
  Search,
  Menu,
  X,
  Home,
  Terminal,
  Box,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function CustomNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [docsDropdownOpen, setDocsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchContext = useSearchContext();
  const setOpenSearch = searchContext?.setOpenSearch;

  // Handle closing dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDocsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsOpen(false);
    setDocsDropdownOpen(false);
  }, [pathname]);

  const docsCategories = [
    {
      title: 'Main',
      items: [
        { name: 'Home', desc: 'Return to JQube landing page', href: '/', icon: Home },
        { name: 'Docs', desc: 'Explore all documentation guides', href: '/docs', icon: BookOpen },
        { name: 'Dashboard', desc: 'Vulnerability scan reports panel', href: '/docs/getting-started', icon: Layers },
      ],
    },
    {
      title: 'CLI & SDKs',
      items: [
        { name: 'Fern CLI', desc: 'Developer tool commands reference', href: '/docs/getting-started', icon: Terminal },
        { name: 'CLI Generator', desc: 'Scan runner and parser compiler', href: '/docs/architecture', icon: Cpu },
        { name: 'SDKs', desc: 'Multi-language client libraries', href: '/docs/backend', icon: Box },
      ],
    },
    {
      title: 'APIs & Protocols',
      items: [
        { name: 'OpenAPI', desc: 'OpenAPI description definitions', href: '/docs/api-reference', icon: Code2 },
        { name: 'AsyncAPI', desc: 'Event-driven API message specifications', href: '/docs/api-reference', icon: Code2 },
        { name: 'OpenRPC', desc: 'JSON-RPC description format', href: '/docs/api-reference', icon: Code2 },
        { name: 'gRPC', desc: 'gRPC service architecture protocols', href: '/docs/api-reference', icon: Code2 },
      ],
    },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#dc143c]/20 bg-[#08090f]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-14">
        {/* Left: Brand/Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/JQube.png"
              alt="JQube Logo"
              width={100}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1.5">
            {/* Docs Dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDocsDropdownOpen(true)}
              onMouseLeave={() => setDocsDropdownOpen(false)}
            >
              <button
                onClick={() => setDocsDropdownOpen(!docsDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 text-[13.5px] font-bold rounded-lg hover:text-white hover:bg-zinc-900 transition-colors ${pathname.startsWith('/docs')
                    ? 'text-[#ff4d6d]'
                    : 'text-zinc-400'
                  }`}
              >
                Docs
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${docsDropdownOpen ? 'rotate-185' : ''}`} />
              </button>

              {/* Megamenu Panel */}
              {docsDropdownOpen && (
                <div className="absolute left-0 mt-0.5 w-[760px] rounded-xl border border-[#ff4d6d]/15 bg-[#0a0a0c]/98 backdrop-blur-md shadow-2xl p-6 transition-all duration-300 z-50">
                  <div className="grid grid-cols-3 gap-6">
                    {docsCategories.map((category) => (
                      <div key={category.title} className="flex flex-col gap-3">
                        <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-1">
                          {category.title}
                        </h4>
                        <div className="flex flex-col gap-1.5">
                          {category.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#ff4d6d]/5 border border-transparent hover:border-[#ff4d6d]/10 transition-all group"
                              >
                                <div className="p-1.5 rounded bg-zinc-900 text-zinc-400 group-hover:text-[#ff4d6d] group-hover:bg-[#ff4d6d]/10 transition-colors mt-0.5">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11.5px] font-bold text-zinc-200 group-hover:text-white transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors mt-0.5 leading-snug">
                                    {item.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown Footer Link */}
                  <div className="mt-5 pt-4 border-t border-zinc-900 flex justify-between items-center text-[10.5px] text-zinc-500">
                    <span>Need help integrating Semgrep?</span>
                    <Link
                      href="/docs/getting-started"
                      className="flex items-center gap-1 text-[#ff4d6d] hover:text-white font-semibold transition-colors group"
                    >
                      Quick Start Guide
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* API Link */}
            <Link
              href="/docs/api-reference"
              className={`px-3 py-1.5 text-[13.5px] font-bold rounded-lg hover:text-white hover:bg-zinc-900 transition-colors ${pathname === '/docs/api-reference'
                  ? 'text-[#ff4d6d]'
                  : 'text-zinc-400'
                }`}
            >
              API Reference
            </Link>

            {/* Blog Link */}
            <Link
              href="/blog"
              className={`px-3 py-1.5 text-[13.5px] font-bold rounded-lg hover:text-white hover:bg-zinc-900 transition-colors ${pathname.startsWith('/blog')
                  ? 'text-[#ff4d6d]'
                  : 'text-zinc-400'
                }`}
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Right: Search bar trigger & GitHub link */}
        <div className="flex items-center gap-3">
          {/* Custom Search trigger bar */}
          {setOpenSearch && (
            <button
              onClick={() => setOpenSearch(true)}
              className="flex items-center gap-2.5 h-8 px-3 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-[11.5px] text-zinc-400 hover:text-zinc-200 transition-all w-32 sm:w-44 lg:w-56 cursor-pointer select-none"
            >
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              <span className="flex-1 text-left">Search docs...</span>
              <kbd className="hidden lg:inline-flex h-4 items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1 font-mono text-[9px] font-medium text-zinc-600">
                /
              </kbd>
            </button>
          )}

          {/* Github Link */}
          <Link
            href="https://github.com/jqube"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <Github className="w-4 h-4" />
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors md:hidden"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu Drawer */}
      {isOpen && (
        <div className="border-t border-[#ffffff]/10 bg-[#070709] px-6 py-4 flex flex-col gap-4 md:hidden">
          <div className="flex flex-col gap-1.5">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Navigation
            </div>
            <Link
              href="/"
              className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/docs"
              className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-[#ff4d6d]/10 transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/docs/api-reference"
              className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            >
              API Reference
            </Link>
            <Link
              href="/blog"
              className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
