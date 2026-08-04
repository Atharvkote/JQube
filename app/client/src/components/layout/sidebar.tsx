// JQube — Sidebar Component (TSX)

import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks';
import {
  LayoutDashboard,
  FolderGit2,
  ShieldAlert,
  Bot,
  GitPullRequest,
  History,
  Webhook,
  Bell,
  FileText,
  User,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  Sparkles,
  Layers,
  AlertTriangle,
  LucideIcon,
  PanelLeft,
  Search,
  Command,
} from 'lucide-react';
import { GitBranch } from 'lucide-react';
import { Input } from '../ui/input';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

interface SubMenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
  subItems?: SubMenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const context = useApp();
  const location = useLocation();
  const unreadCount = context?.notifications?.filter((n) => !n.read).length || 0;
  const logout = context?.logout;
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        document.getElementById('navbar-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    vulnerabilities: location.pathname.startsWith('/vulnerabilities'),
    remediation: location.pathname.startsWith('/ai-remediation'),
  });



  const toggleSubmenu = (key: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Navigation',
      items: [
        { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { id: 'git-integration', name: 'Git Integration', path: '/git-integration', icon: GitBranch },
        { id: 'repositories', name: 'Repositories', path: '/repositories', icon: FolderGit2 },
      ],
    },
    {
      title: 'Security & Fixes',
      items: [
        {
          id: 'vulnerabilities',
          name: 'Vulnerabilities',
          path: '/vulnerabilities',
          icon: ShieldAlert,
          subItems: [
            { name: 'All Findings', path: '/vulnerabilities', icon: Layers },
            { name: 'Critical', path: '/vulnerabilities?severity=Critical', icon: AlertTriangle },
          ],
        },
        {
          id: 'ai-remediation',
          name: 'AI Remediation',
          path: '/ai-remediation',
          icon: Bot,
          subItems: [
            { name: 'Patch Gen', path: '/ai-remediation', icon: Sparkles },
            { name: 'History', path: '/remediation-history', icon: History },
          ],
        },
        { id: 'pull-requests', name: 'Pull Requests', path: '/pull-requests', icon: GitPullRequest },
      ],
    },
    {
      title: 'Logs & Reports',
      items: [
        { id: 'webhook-logs', name: 'Webhook Logs', path: '/webhook-logs', icon: Webhook },
        { id: 'scan-history', name: 'Scan History', path: '/scan-history', icon: History },
        { id: 'reports', name: 'Reports', path: '/reports', icon: FileText },
        { id: 'notifications', name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', name: 'Profile', path: '/profile', icon: User },
        { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const handleCloseMobile = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseMobile}
            className="fixed inset-0 z-40 bg-[#07080B]/80 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Desktop & Mobile Sidebar Container */}
      <aside
        className={`fixed  top-0 bottom-0 left-0 z-50 flex flex-col bg-[#07080B] text-[#A1A1AA] border-r border-[#FF3B3B]/10 shadow-2xl backdrop-blur-md transition-all duration-200 ease-in-out lg:static ${isMobileOpen ? 'translate-x-0 w-52' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed && !isMobileOpen ? 'lg:w-14' : 'lg:w-52'}`}
        aria-label="Main Navigation"
      >
        {/* Subtle decorative scanline grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#FF3B3B_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.015] pointer-events-none -z-10" />

        {/* Branding Header / Collapse toggle */}
        <div className={`flex md:hidden items-center ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'} h-[52px] px-3.5 border-b border-[#FF3B3B]/10 shrink-0`}>
          {/* Mobile Close Button */}
          <button
            onClick={handleCloseMobile}
            className="p-1 rounded-md text-[#71717A] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/5 lg:hidden focus:outline-none"
            aria-label="Close Mobile Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-2 py-3 space-y-2 overflow-y-auto custom-scrollbar">
          {/* Desktop Collapse Toggle */}
          <div className='flex justify-between items-center'>
            <div className={` ${isCollapsed ? 'hidden' : 'block'} max-w-md`}>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#71717A]">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  id="navbar-search-input"
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-12 py-1.5 h-7 bg-[#07080B] border border-[#FF3B3B]/15 rounded-md text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF3B3B] focus:ring-2 focus:ring-[#FF3B3B]/20 transition-all duration-200"
                  aria-label="Search documentation"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#A1A1AA] bg-[#0F1117] border border-[#FF3B3B]/15 rounded">
                    <Command className="w-2.5 h-2.5" />M
                  </kbd>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden lg:flex p-1 rounded-md text-[#71717A] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/5 transition-colors focus:outline-none"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <PanelLeft className='w-5 h-5 cursor-e-resize' />
            </button>
          </div>
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-2.5 pt-1.5 pb-0.5 text-[8.5px] font-black uppercase tracking-[0.15em] text-[#a3a3a8]">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const hasSubitems = Boolean(item.subItems && item.subItems.length > 0);
                const isSubmenuOpen = Boolean(openSubmenus[item.id]);
                const isParentActive =
                  location.pathname === item.path ||
                  (hasSubitems && item.subItems?.some((sub) => location.pathname === sub.path));

                return (
                  <div key={item.id} className="relative group">
                    {hasSubitems ? (
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none ${isParentActive
                          ? 'bg-[#FF3B3B]/8 text-[#FF3B3B] '
                          : 'text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/5 border-l-2 border-transparent'
                          }`}
                        aria-expanded={isSubmenuOpen}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isParentActive ? 'text-[#FF3B3B]' : 'text-[#71717A]'
                              }`}
                          />
                          {(!isCollapsed || isMobileOpen) && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="text-[#71717A]">
                            {isSubmenuOpen ? (
                              <ChevronDown className="w-3 h-3" />
                            ) : (
                              <ChevronRight className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={handleCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none ${isActive
                            ? 'bg-[#FF3B3B]/8 text-[#FF3B3B] '
                            : 'text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/5 border-l-2 border-transparent'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                          {(!isCollapsed || isMobileOpen) && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                        {(!isCollapsed || isMobileOpen) &&
                          item.badge !== undefined &&
                          item.badge > 0 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#FF3B3B] rounded-md shadow-sm">
                              {item.badge}
                            </span>
                          )}
                      </NavLink>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-[#09090B] border border-[#FF3B3B]/15 text-white text-[10px] font-bold rounded shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50">
                        {item.name}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-1.5 px-1 py-0.5 text-[8px] bg-[#FF3B3B] text-white rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Submenu Items */}
                    {hasSubitems && (!isCollapsed || isMobileOpen) && item.subItems && (
                      <AnimatePresence>
                        {isSubmenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-7 pr-1 py-0.5 space-y-0.5 overflow-hidden"
                          >
                            {item.subItems.map((sub) => (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                onClick={handleCloseMobile}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${isActive
                                    ? 'text-[#FF3B3B] bg-[#FF3B3B]/5 font-semibold'
                                    : 'text-[#8E8E93] hover:text-white hover:bg-[#FF3B3B]/3'
                                  }`
                                }
                              >
                                <sub.icon className="w-3 h-3 text-[#71717A]" />
                                <span>{sub.name}</span>
                              </NavLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="p-2 border-t border-[#FF3B3B]/10 shrink-0">
          {!isCollapsed || isMobileOpen ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#09090B]/50 border border-[#FF3B3B]/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-white truncate leading-tight">
                    Active
                  </span>
                  <span className="text-[8px] text-[#71717A] truncate">
                    v2.4.0 • SEC_OPS
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1 text-[#71717A] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 rounded transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="flex justify-center items-center w-full py-1.5 text-[#71717A] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 rounded-lg transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
