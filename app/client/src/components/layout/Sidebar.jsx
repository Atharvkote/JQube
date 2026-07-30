import React, { useState, useContext } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContext';
import logo from '../../assets/logo.png';
import {
  LayoutDashboard,
  FolderGit2,
  ShieldAlert,
  Bot,
  GitPullRequest,
  History,
  Webhook,
  GitBranch,
  Bell,
  FileText,
  User,
  Settings,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Layers,
  AlertTriangle
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const context = useContext(AppContext);
  const location = useLocation();
  const unreadCount = context?.notifications?.filter((n) => !n.read).length || 0;
  const logout = context?.logout || (() => console.log('Logout clicked'));

  // Track expanded accordion submenus
  const [openSubmenus, setOpenSubmenus] = useState({
    vulnerabilities: location.pathname.startsWith('/vulnerabilities'),
    remediation: location.pathname.startsWith('/ai-remediation')
  });

  const toggleSubmenu = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuSections = [
    {
      title: 'Navigation',
      items: [
        { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { id: 'git-integration', name: 'Git Integration', path: '/git-integration', icon: GitBranch },
        { id: 'repositories', name: 'Repositories', path: '/repositories', icon: FolderGit2 },
      ]
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
            { name: 'All Vulnerabilities', path: '/vulnerabilities', icon: Layers },
            { name: 'Critical Findings', path: '/vulnerabilities?severity=Critical', icon: AlertTriangle }
          ]
        },
        {
          id: 'ai-remediation',
          name: 'AI Remediation',
          path: '/ai-remediation',
          icon: Bot,
          subItems: [
            { name: 'Patch Generator', path: '/ai-remediation', icon: Sparkles },
            { name: 'Remediation History', path: '/remediation-history', icon: History }
          ]
        },
        { id: 'pull-requests', name: 'Pull Requests', path: '/pull-requests', icon: GitPullRequest },
      ]
    },
    {
      title: 'Logs & Reports',
      items: [
        { id: 'webhook-logs', name: 'Webhook Logs', path: '/webhook-logs', icon: Webhook },
        { id: 'scan-history', name: 'Scan History', path: '/scan-history', icon: History },
        { id: 'reports', name: 'Reports', path: '/reports', icon: FileText },
        { id: 'notifications', name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
      ]
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', name: 'Profile', path: '/profile', icon: User },
        { id: 'settings', name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
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
            className="fixed inset-0 z-40 bg-[#09090B]/80 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Desktop & Mobile Sidebar Container with JQube Dark Styling */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0F1117] text-[#A1A1AA] border-r border-[#FF3B3B]/15 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out lg:static ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed && !isMobileOpen ? 'lg:w-20' : 'lg:w-64'}`}
        aria-label="Main Navigation"
      >
        {/* Branding Header */}
        <div className="flex items-center justify-between h-[64px] px-4 border-b border-[#FF3B3B]/15 shrink-0">
          <Link
            to="/dashboard"
            onClick={handleCloseMobile}
            className="flex items-center gap-2 min-w-0 py-1"
          >
            <img
              src={logo}
              alt="JQube Logo"
              className={`${
                isCollapsed && !isMobileOpen ? 'h-8 max-w-full' : 'h-10'
              } w-auto object-contain cursor-pointer select-none drop-shadow transition-all duration-200`}
            />
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#FF3B3B]/10 focus:outline-none transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={handleCloseMobile}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#FF3B3B]/10 lg:hidden focus:outline-none"
            aria-label="Close Mobile Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const hasSubitems = item.subItems && item.subItems.length > 0;
                const isSubmenuOpen = openSubmenus[item.id];
                const isParentActive =
                  location.pathname === item.path ||
                  (hasSubitems && item.subItems.some((sub) => location.pathname === sub.path));

                return (
                  <div key={item.id} className="relative group">
                    {/* Standard Link or Accordion Trigger */}
                    {hasSubitems ? (
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none ${
                          isParentActive
                            ? 'bg-[#FF3B3B]/12 text-[#FF3B3B] border-l-2 border-[#FF3B3B] font-semibold'
                            : 'text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/8 border-l-2 border-transparent'
                        }`}
                        aria-expanded={isSubmenuOpen}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <item.icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${isParentActive ? 'text-[#FF3B3B]' : 'text-[#71717A]'}`} />
                          {(!isCollapsed || isMobileOpen) && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="text-[#71717A]">
                            {isSubmenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={handleCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none ${
                            isActive
                              ? 'bg-[#FF3B3B]/12 text-[#FF3B3B] border-l-2 border-[#FF3B3B] font-semibold shadow-sm'
                              : 'text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/8 border-l-2 border-transparent'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <item.icon className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
                          {(!isCollapsed || isMobileOpen) && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </div>
                        {(!isCollapsed || isMobileOpen) && item.badge !== undefined && item.badge > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-[#FF3B3B] rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    )}

                    {/* Collapsed Tooltip on Hover */}
                    {isCollapsed && !isMobileOpen && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#151922] text-white text-xs font-medium rounded-lg shadow-xl border border-[#FF3B3B]/20 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                        {item.name}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-[#FF3B3B] text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Nested Submenu Items */}
                    {hasSubitems && (!isCollapsed || isMobileOpen) && (
                      <AnimatePresence>
                        {isSubmenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-9 pr-2 py-1 space-y-1 overflow-hidden"
                          >
                            {item.subItems.map((sub) => (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                onClick={handleCloseMobile}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                                    isActive
                                      ? 'text-[#FF3B3B] bg-[#FF3B3B]/10 font-semibold'
                                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/8'
                                  }`
                                }
                              >
                                <sub.icon className="w-3.5 h-3.5" />
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
        <div className="p-3 border-t border-[#FF3B3B]/15 shrink-0">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#151922] border border-[#FF3B3B]/15">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">System Active</span>
                  <span className="text-[10px] text-[#71717A] truncate">v2.4.0 • Enterprise</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-[#71717A] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 rounded-lg transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="flex justify-center items-center w-full py-2.5 text-[#71717A] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/10 rounded-xl transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
