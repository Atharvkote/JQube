import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContext';
import logo from '../../assets/logo.png';
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
  Github
} from 'lucide-react';

const Navbar = ({ isMobileOpen, setIsMobileOpen, isCollapsed, setIsCollapsed }) => {
  const context = useContext(AppContext);
  const location = useLocation();

  const user = context?.user || {
    username: 'Security Operator',
    email: 'admin@jqube.io',
    role: 'Security Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  const notifications = context?.notifications || [];
  const logout = context?.logout || (() => console.log('Logout clicked'));
  const markNotificationAsRead = context?.markNotificationAsRead || (() => {});

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut focus for search (⌘K or /)
  useEffect(() => {
    const handleKeyDown = (e) => {
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
    <header className="sticky top-0 z-[100] flex items-center justify-between h-[64px] px-4 sm:px-6 lg:px-8 bg-[#09090B] border-b border-[#FF3B3B]/15 text-white transition-colors">
      {/* Left Section: Mobile Toggle, JQube Logo & Nav items */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/10 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#FF3B3B]/40"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* JQube Logo */}
        <Link to="/dashboard" className="flex items-center shrink-0">
          <img
            src={logo}
            alt="JQube Logo"
            className="h-8 sm:h-9 w-auto object-contain select-none drop-shadow"
          />
        </Link>


      </div>

      {/* Center: Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#71717A]">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="navbar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs, rules, vulnerabilities..."
            className="w-full pl-9 pr-12 py-1.5 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF3B3B] focus:ring-2 focus:ring-[#FF3B3B]/20 transition-all duration-200"
            aria-label="Search documentation"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#A1A1AA] bg-[#0F1117] border border-[#FF3B3B]/15 rounded">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section: GitHub Link, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* GitHub Icon Link */}
        <a
          href="https://github.com/atharvkote/jqube"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF3B3B]/40"
          title="View GitHub Repository"
          aria-label="View GitHub Repository"
        >
          <Github className="w-5 h-5" />
        </a>

        {/* Notifications Drawer Toggle */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotificationsMenu((prev) => !prev);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/10 relative transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF3B3B]/40"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={showNotificationsMenu}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF3B3B] rounded-full ring-2 ring-[#09090B] animate-pulse" />
            )}
          </button>

          {/* Animated Notification Panel */}
          <AnimatePresence>
            {showNotificationsMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F1117] border border-[#FF3B3B]/20 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl"
              >
                <div className="px-4 py-3 border-b border-[#FF3B3B]/15 flex justify-between items-center bg-[#09090B]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Alerts & Notifications</span>
                    {unreadNotifications.length > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#FF3B3B] rounded-full">
                        {unreadNotifications.length} New
                      </span>
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotificationsMenu(false)}
                    className="text-xs font-semibold text-[#FF3B3B] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#FF3B3B]/10 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#71717A] text-xs">
                      No security notifications at this time
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 hover:bg-[#FF3B3B]/5 transition-colors flex gap-3 ${
                          !notif.read ? 'bg-[#FF3B3B]/10' : ''
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                            notif.type === 'critical'
                              ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {notif.type === 'critical' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                            <span className="text-[10px] text-[#71717A] whitespace-nowrap">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-[#A1A1AA] mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationAsRead(notif.id)}
                              className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#FF3B3B] hover:underline"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Mark read
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
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#FF3B3B]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF3B3B]/40"
            aria-label="User Menu"
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
          >
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-[#FF3B3B]/30 hover:ring-[#FF3B3B] transition-all"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">{user.username}</span>
              <span className="text-[10px] font-medium text-[#A1A1AA]">{user.role || 'Security Lead'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#A1A1AA] hidden sm:block" />
          </button>

          {/* Animated Profile Dropdown Panel */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-60 bg-[#0F1117] border border-[#FF3B3B]/20 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl"
              >
                <div className="px-4 py-3 border-b border-[#FF3B3B]/15 bg-[#09090B]">
                  <p className="text-xs font-bold text-white">{user.username}</p>
                  <p className="text-[11px] text-[#A1A1AA] truncate mt-0.5">{user.email || 'admin@jqube.io'}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded-full">
                    {user.role || 'Security Operator'}
                  </span>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white rounded-xl hover:bg-[#FF3B3B]/10 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#A1A1AA]" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white rounded-xl hover:bg-[#FF3B3B]/10 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-[#A1A1AA]" />
                    <span>System Settings</span>
                  </Link>
                </div>

                <div className="p-1.5 border-t border-[#FF3B3B]/15">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-[#FF3B3B] rounded-xl hover:bg-[#FF3B3B]/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-[#FF3B3B]" />
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
};

export default Navbar;
