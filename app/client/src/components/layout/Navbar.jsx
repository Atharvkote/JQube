import React, { useContext, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Bell, Search, Menu, User, LogOut, Settings as SettingsIcon, AlertCircle, Shield } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, notifications, logout, markNotificationAsRead } = useContext(AppContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const location = useLocation();

  // Get current page title dynamically
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/repositories')) return 'Repositories';
    if (path.startsWith('/vulnerabilities')) return 'Vulnerabilities';
    if (path.startsWith('/ai-remediation')) return 'AI Remediation';
    if (path.startsWith('/pull-requests')) return 'Pull Requests';
    if (path.startsWith('/scan-history')) return 'Scan History';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/settings')) return 'Settings';
    return 'J-QUBE';
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Left side: Hamburger menu & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white tracking-wide">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: Search, Notifications, Profile Dropdowns */}
      <div className="flex items-center gap-4">
        {/* Search Bar - hidden on mobile */}
        <div className="relative hidden md:block w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search CVE, repositories..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationsMenu(!showNotificationsMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-350">Recent Alerts</span>
                <Link to="/notifications" className="text-xs font-semibold text-blue-400 hover:underline" onClick={() => setShowNotificationsMenu(false)}>
                  View All
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                {unreadNotifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No new notifications
                  </div>
                ) : (
                  unreadNotifications.slice(0, 4).map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-slate-800/40 transition-colors flex gap-2">
                      <div className={`mt-0.5 p-1 rounded-md ${notif.type === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'}`}>
                        {notif.type === 'critical' ? <AlertCircle className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">{notif.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-slate-500">{notif.time}</span>
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="text-[10px] text-blue-400 hover:underline"
                          >
                            Mark read
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotificationsMenu(false);
            }}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover ring-2 ring-transparent hover:ring-blue-500 transition-all"
            />
          </button>

          {/* Profile Dropdown Panel */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60">
                <p className="text-sm font-semibold text-slate-200">{user.username}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-350 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-350 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </Link>
              </div>
              <div className="p-1.5 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
