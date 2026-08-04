// JQube — Navbar Component (TSX)

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks';
import logo from '@/assets/logo.png';
import {
  Bell,
  Search,
  Menu,
  User,
  LogOut,
  Settings as SettingsIcon,
  AlertCircle,
  Shield,
  CheckCircle2,
  ChevronDown,
  Command,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { SiGoogledocs } from 'react-icons/si';

interface NavbarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Navbar({
  setIsMobileOpen,
}: NavbarProps) {
  const context = useApp();

  const user = context.user || {
    username: 'Security Operator',
    email: 'admin@jqube.io',
    role: 'Security Lead',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  const githubProfile = context.githubProfile;
  const notifications = context?.notifications || [];
  const logout = context?.logout;
  const markNotificationAsRead = context?.markNotificationAsRead || (() => { });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom tooltips state
  const [showGitTooltip, setShowGitTooltip] = useState(false);
  const [showDocsTooltip, setShowDocsTooltip] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotificationsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('navbar-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between h-[56px] px-4 sm:px-5 lg:px-6 bg-[#07080B]/90 border-b border-[#FF3B3B]/10 text-white backdrop-blur-md transition-colors shadow-[0_1px_10px_rgba(255,59,59,0.02)]">
      {/* Left Section: Mobile Toggle, JQube Logo */}
      <div className="flex items-center gap-3.5">
        {setIsMobileOpen && (
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#FF3B3B] hover:bg-[#FF3B3B]/5 lg:hidden focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        )}

        <Link to="/dashboard" className="flex items-center shrink-0">
          <img
            src={logo}
            alt="JQube Logo"
            className="h-7 sm:h-7.5 w-auto object-contain select-none drop-shadow-[0_0_8px_rgba(255,59,59,0.2)] hover:scale-[1.02] transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Center: Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-[#71717A]">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            id="navbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search console..."
            className="w-full pl-8.5 pr-10.5 py-1.5 bg-[#09090B]/60 border border-[#FF3B3B]/20 rounded-lg text-[13px] text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF3B3B]/50 focus:ring-1 focus:ring-[#FF3B3B]/20 transition-all duration-200"
            aria-label="Search"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <kbd className="hidden sm:inline-flex font-bold items-center gap-0.5 px-1 py-0.5 text-[12px] font-mono text-[#A1A1AA] bg-[#07080B] border border-[#FF3B3B]/10 rounded">
              <Command className="w-2 h-2" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* GitHub Link with custom tooltip */}
        <div className="relative">
          <a
            href="https://github.com/atharvkote/jqube"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/5 transition-colors focus:outline-none flex items-center justify-center"
            onMouseEnter={() => setShowGitTooltip(true)}
            onMouseLeave={() => setShowGitTooltip(false)}
          >
            <FaGithub className="w-4 h-4" />
          </a>
          <AnimatePresence>
            {showGitTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 bg-[#09090B] border border-[#FF3B3B]/15 text-white text-[10px] font-bold rounded shadow-xl whitespace-nowrap z-50"
              >
                Star us on GitHub
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Documentation Link with custom tooltip */}
        <div className="relative">
          <a
            href="https://jqube.readme.io/reference/intro"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/5 transition-colors focus:outline-none flex items-center justify-center"
            onMouseEnter={() => setShowDocsTooltip(true)}
            onMouseLeave={() => setShowDocsTooltip(false)}
          >
            <SiGoogledocs className="w-4 h-4" />
          </a>
          <AnimatePresence>
            {showDocsTooltip && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 bg-[#09090B] border border-[#FF3B3B]/15 text-white text-[10px] font-bold rounded shadow-xl whitespace-nowrap z-50"
              >
                JQube Documentation
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotificationsMenu((prev) => !prev);
              setShowProfileMenu(false);
            }}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/5 relative transition-colors focus:outline-none"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={showNotificationsMenu}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF3B3B] rounded-full ring-1 ring-[#07080B] animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotificationsMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-80 bg-[#09090B] border border-[#FF3B3B]/15 rounded-xl shadow-2xl overflow-hidden z-[100] backdrop-blur-md"
              >
                <div className="px-3 py-2 border-b border-[#FF3B3B]/10 flex justify-between items-center bg-[#07080B]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                      Alerts
                    </span>
                    {unreadNotifications.length > 0 && (
                      <span className="px-1.5 py-0.2 text-[8px] font-black text-white bg-[#FF3B3B] rounded-full">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotificationsMenu(false)}
                    className="text-[10px] font-bold text-[#FF3B3B] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#FF3B3B]/5 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[#71717A] text-[11px]">
                      No security notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 hover:bg-[#FF3B3B]/3 transition-colors flex gap-2.5 ${!notif.read ? 'bg-[#FF3B3B]/5' : ''
                          }`}
                      >
                        <div
                          className={`mt-0.5 p-1 rounded-md shrink-0 h-fit ${notif.type === 'critical'
                            ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/15'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                            }`}
                        >
                          {notif.type === 'critical' ? (
                            <AlertCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Shield className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] font-bold text-white truncate">
                              {notif.title}
                            </p>
                            <span className="text-[9px] text-[#71717A] whitespace-nowrap">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#A1A1AA] mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationAsRead(notif.id)}
                              className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold text-[#FF3B3B] hover:underline"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" /> Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Menu Trigger */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotificationsMenu(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#FF3B3B]/5 transition-colors focus:outline-none"
            aria-label="User Menu"
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
          >
            <img
              src={githubProfile?.avatarUrl || user.avatarUrl}
              alt={user.username}
              className="w-7 h-7 rounded object-cover ring-1 ring-[#FF3B3B]/30 hover:ring-[#FF3B3B] transition-all"
            />
            <div className="hidden sm:flex cursor-pointer flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {user.username}
              </span>
              <span className="text-[9.5px] font-medium text-[#71717A] truncate max-w-[100px]">
                {user.email}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A] hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 mt-1.5 w-52 bg-[#09090B] border border-[#FF3B3B]/15 rounded-xl shadow-2xl overflow-hidden z-[100] backdrop-blur-md"
              >
                <div className="px-3.5 py-2.5 border-b border-[#FF3B3B]/10 bg-[#07080B]">
                  <p className="text-[11px] font-bold text-white leading-tight">
                    {user.username}
                  </p>
                  <p className="text-[9px] text-[#71717A] truncate mt-0.5">
                    {user.email || 'admin@jqube.io'}
                  </p>
                  <span className="inline-block mt-1.5 px-1.5 py-0.2 text-[8px] font-bold text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded">
                    {user.role || 'Security Operator'}
                  </span>
                </div>

                <div className="p-1 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#FF3B3B]/5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#71717A]" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-white rounded-lg hover:bg-[#FF3B3B]/5 transition-colors"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-[#71717A]" />
                    <span>System Settings</span>
                  </Link>
                </div>

                <div className="p-1 border-t border-[#FF3B3B]/10">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (logout) logout();
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-semibold text-[#FF3B3B] rounded-lg hover:bg-[#FF3B3B]/5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#FF3B3B]" />
                    <span>Logout Session</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}