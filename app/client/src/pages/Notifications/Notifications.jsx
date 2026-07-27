import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Bell, CheckCheck, Trash2, AlertCircle, ShieldAlert, GitPullRequest, Info, CheckCircle2 } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

const Notifications = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications
  } = useContext(AppContext);

  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'scan':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'pr':
        return <GitPullRequest className="w-5 h-5 text-blue-400" />;
      case 'warning':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/15';
      case 'scan':
        return 'bg-green-500/10 border-green-500/15';
      case 'pr':
        return 'bg-blue-500/10 border-blue-500/15';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/15';
      default:
        return 'bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">Threat &amp; Activity Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time alerts for code analysis results and automated patching actions.</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-350 hover:text-white transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-blue-500" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearNotifications}
              className="px-3.5 py-2 bg-red-950/20 border border-red-900/30 hover:border-red-500/30 hover:bg-red-900/10 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear logs</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Clean Inbox"
            description="You have no notifications or security alerts at this time. All systems green."
          />
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all ${getBg(notif.type)} ${
                notif.read ? 'opacity-65' : 'shadow-lg shadow-black/25'
              }`}
            >
              <div className="flex gap-3.5">
                {/* Icon wrapper */}
                <div className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl shrink-0">
                  {getIcon(notif.type)}
                </div>
                
                {/* Text Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-wide">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold pt-1">
                    {notif.time}
                  </p>
                </div>
              </div>

              {/* Action read triggers */}
              {!notif.read && (
                <button
                  onClick={() => markNotificationAsRead(notif.id)}
                  className="px-2.5 py-1 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-[10.5px] font-semibold text-blue-400 hover:text-blue-300 rounded-lg shrink-0 transition-colors"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notifications;
