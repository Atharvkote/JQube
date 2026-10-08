'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Sparkles, FileText, Hash, AlignLeft, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'page' | 'heading' | 'text';
  content: string;
  url: string;
}

interface GroupedResults {
  pageTitle: string;
  pageUrl: string;
  items: SearchResult[];
}

interface CustomSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CustomSearchDialog({ open, onOpenChange }: CustomSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounced API search fetch
  useEffect(() => {
    if (!open) return;

    // Focus search input when open
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query, open]);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Grouped search results helper
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: GroupedResults } = {};

    results.forEach((item) => {
      // Find the page URL (strip hashes)
      const pageUrl = item.url.split('#')[0];
      let pageTitle = 'Documentation';

      // Infer page title from url or fallback
      if (pageUrl === '/docs') pageTitle = 'Introduction';
      else if (pageUrl.startsWith('/docs/')) {
        const segment = pageUrl.substring(6);
        pageTitle = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }

      if (!groups[pageUrl]) {
        groups[pageUrl] = {
          pageTitle,
          pageUrl,
          items: [],
        };
      }
      groups[pageUrl].items.push(item);
    });

    return Object.values(groups);
  }, [results]);

  // Flattened results for keyboard navigation index map
  const flatResultsList = useMemo(() => {
    const list: SearchResult[] = [];
    groupedResults.forEach((group) => {
      // Optional: could include group header, but we just navigate items
      group.items.forEach((item) => {
        list.push(item);
      });
    });
    return list;
  }, [groupedResults]);

  // Handle selected item preview content
  const selectedItem = flatResultsList[selectedIndex] || null;

  // Selected item parent page name
  const selectedItemBreadcrumbs = useMemo(() => {
    if (!selectedItem) return 'Docs';
    const pageUrl = selectedItem.url.split('#')[0];
    if (pageUrl === '/docs') return 'Docs > Introduction';
    const pathSegments = pageUrl.replace('/docs/', '').split('/');
    return ['Docs', ...pathSegments.map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))].join(' > ');
  }, [selectedItem]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatResultsList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResultsList.length);
      scrollIntoView((selectedIndex + 1) % flatResultsList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResultsList.length) % flatResultsList.length);
      scrollIntoView((selectedIndex - 1 + flatResultsList.length) % flatResultsList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedItem) {
        handleNavigate(selectedItem.url);
      }
    }
  };

  const scrollIntoView = (index: number) => {
    setTimeout(() => {
      const listEl = listRef.current;
      if (!listEl) return;
      const activeEl = listEl.querySelector(`[data-index="${index}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }, 10);
  };

  const handleNavigate = (url: string) => {
    router.push(url);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay with premium blur */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#030303]/75 backdrop-blur-md transition-opacity duration-300" />

        {/* Dialog Panel centered */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <Dialog.Content
            className="flex flex-col w-full max-w-4xl h-[600px] bg-[#0c0c0e] border border-[#ff4d6d]/15 shadow-[0_0_50px_rgba(220,20,60,0.12)] rounded-xl overflow-hidden focus:outline-none transition-all duration-300"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input and Controls Header */}
            <div className="flex flex-col border-b border-[#ffffff]/10 px-6 py-4 bg-[#0e0e11]">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-[#ff4d6d]/80" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documentation, components, or API reference..."
                  className="flex-1 bg-transparent text-[15px] text-white placeholder-zinc-500 focus:outline-none py-1"
                />
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
                  Esc
                </kbd>
                <Dialog.Close className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>

              {/* Filter pills & Ask AI button */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-full transition-all">
                    Product <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-full transition-all">
                    Content type <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-full transition-all">
                    HTTP method <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </div>

                {/* Ask AI button with animated gradient/glow */}
                <button
                  onClick={() => alert('JQube AI Search is currently analyzing repository indexes...')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#dc143c] to-[#ff4d6d] hover:opacity-90 rounded-full shadow-[0_0_15px_rgba(220,20,60,0.4)] hover:shadow-[0_0_20px_rgba(220,20,60,0.6)] transition-all duration-300 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-200 group-hover:animate-pulse" />
                  Ask AI
                </button>
              </div>
            </div>

            {/* Split panels - Main Content Container */}
            <div className="flex flex-1 overflow-hidden min-h-0">
              {/* Left results panel */}
              <div
                ref={listRef}
                className="w-full md:w-[60%] flex flex-col overflow-y-auto px-6 py-4 border-r border-[#ffffff]/10"
              >
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  {query ? 'Search Results' : 'Quick Navigation'}
                </div>

                {isLoading && (
                  <div className="flex flex-col gap-3 py-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex flex-col gap-2 animate-pulse">
                        <div className="h-4 bg-zinc-900 rounded w-1/3"></div>
                        <div className="h-9 bg-zinc-900/50 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && results.length === 0 && query && (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
                    <p className="text-sm text-zinc-400">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-zinc-600 mt-1">Try typing another query or keyword.</p>
                  </div>
                )}

                {!isLoading && results.length === 0 && !query && (
                  <div className="flex flex-col gap-4">
                    {/* Recent or Quick links */}
                    <div
                      onClick={() => handleNavigate('/docs')}
                      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900/50 bg-zinc-950/20 hover:bg-[#ff4d6d]/5 hover:border-[#ff4d6d]/20 transition-all cursor-pointer group"
                    >
                      <div className="p-2 rounded bg-zinc-900 text-zinc-400 group-hover:text-[#ff4d6d] group-hover:bg-[#ff4d6d]/10 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-zinc-200">Welcome to JQube</h4>
                        <p className="text-[11px] text-zinc-500">Read the introduction and system design core goals</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#ff4d6d] transition-colors" />
                    </div>

                    <div
                      onClick={() => handleNavigate('/docs/architecture')}
                      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900/50 bg-zinc-950/20 hover:bg-[#ff4d6d]/5 hover:border-[#ff4d6d]/20 transition-all cursor-pointer group"
                    >
                      <div className="p-2 rounded bg-zinc-900 text-zinc-400 group-hover:text-[#ff4d6d] group-hover:bg-[#ff4d6d]/10 transition-colors">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-zinc-200">System Architecture</h4>
                        <p className="text-[11px] text-zinc-500">Deep dive into frontend and Spring Boot backend diagrams</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#ff4d6d] transition-colors" />
                    </div>

                    <div
                      onClick={() => handleNavigate('/docs/getting-started')}
                      className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900/50 bg-zinc-950/20 hover:bg-[#ff4d6d]/5 hover:border-[#ff4d6d]/20 transition-all cursor-pointer group"
                    >
                      <div className="p-2 rounded bg-zinc-900 text-zinc-400 group-hover:text-[#ff4d6d] group-hover:bg-[#ff4d6d]/10 transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-zinc-200">Getting Started Guide</h4>
                        <p className="text-[11px] text-zinc-500">Setting up scans and security rules step-by-step</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#ff4d6d] transition-colors" />
                    </div>
                  </div>
                )}

                {!isLoading && groupedResults.length > 0 && (
                  <div className="flex flex-col gap-6">
                    {groupedResults.map((group) => (
                      <div key={group.pageUrl} className="flex flex-col gap-1.5">
                        {/* Group header */}
                        <div className="text-[10px] font-bold text-[#ff4d6d] tracking-wider uppercase opacity-85 px-2 mb-1">
                          {group.pageTitle}
                        </div>

                        {/* Group items */}
                        <div className="flex flex-col gap-1">
                          {group.items.map((item) => {
                            // Find absolute index in flat list
                            const flatIndex = flatResultsList.findIndex(x => x.id === item.id);
                            const isSelected = flatIndex === selectedIndex;

                            return (
                              <div
                                key={item.id}
                                data-index={flatIndex}
                                onClick={() => handleNavigate(item.url)}
                                onMouseEnter={() => setSelectedIndex(flatIndex)}
                                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${isSelected
                                    ? 'bg-[#ff4d6d]/8 border-[#ff4d6d]/30 shadow-[0_2px_12px_rgba(220,20,60,0.06)]'
                                    : 'bg-transparent border-transparent hover:bg-zinc-900/40'
                                  }`}
                              >
                                <div className={`p-1.5 rounded-md mt-0.5 transition-colors ${isSelected
                                    ? 'bg-[#ff4d6d]/15 text-[#ff4d6d]'
                                    : 'bg-zinc-900 text-zinc-400'
                                  }`}>
                                  {item.type === 'page' && <FileText className="w-3.5 h-3.5" />}
                                  {item.type === 'heading' && <Hash className="w-3.5 h-3.5" />}
                                  {item.type === 'text' && <AlignLeft className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                                    {item.content}
                                  </div>
                                  {item.type !== 'page' && (
                                    <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                                      {item.url.includes('#') ? `#${item.url.split('#')[1]}` : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right preview panel */}
              <div className="hidden md:flex md:w-[40%] flex-col bg-[#08080a] p-6 justify-between overflow-y-auto">
                {selectedItem ? (
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div className="flex flex-col gap-4">
                      {/* Breadcrumbs */}
                      <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        {selectedItemBreadcrumbs}
                      </div>

                      {/* Heading / Title */}
                      <h3 className="text-[15px] font-bold text-white tracking-tight leading-snug">
                        {selectedItem.content}
                      </h3>

                      {/* Content block excerpt */}
                      <div className="text-[11.5px] text-zinc-400 leading-relaxed border-l-2 border-[#ff4d6d]/30 pl-3.5 py-1 bg-zinc-900/10">
                        {selectedItem.type === 'text' ? (
                          selectedItem.content
                        ) : (
                          `Navigate to this section to read details about the system configuration, technical architecture documentation, and scan orchestration flows.`
                        )}
                      </div>

                      {/* Tags/Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 text-[9px] font-semibold tracking-wider text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded uppercase">
                          {selectedItem.type}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-semibold tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded uppercase">
                          JQube Core
                        </span>
                      </div>
                    </div>

                    {/* Nav Button */}
                    <button
                      onClick={() => handleNavigate(selectedItem.url)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 px-4 rounded-lg bg-zinc-900 hover:bg-[#ff4d6d]/15 text-[11px] font-semibold text-[#ff4d6d] hover:text-white border border-[#ff4d6d]/30 hover:border-[#ff4d6d]/60 transition-all duration-300"
                    >
                      Read Section
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <FileText className="w-8 h-8 text-zinc-700 mb-2.5" />
                    <p className="text-xs font-semibold text-zinc-400">No selection</p>
                    <p className="text-[10px] text-zinc-600 mt-1 max-w-[180px]">
                      Search and hover or navigate to preview document contents.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
