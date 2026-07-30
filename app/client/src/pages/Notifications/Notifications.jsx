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
        return <AlertCircle className="w-5 h-5 text-[#FF3B3B]" />;
      case 'scan':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'pr':
        return <GitPullRequest className="w-5 h-5 text-[#FF3B3B]" />;
      case 'warning':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-[#71717A]" />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-[#FF3B3B]/10 border-[#FF3B3B]/20';
      case 'scan':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'pr':
        return 'bg-[#FF3B3B]/10 border-[#FF3B3B]/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      default:
        return 'bg-[#151922] border-[#FF3B3B]/15';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">Threat &amp; Activity Log</h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5 leading-[1.7]">Real-time alerts for code analysis results and automated patching actions.</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 bg-[#0F1117] border border-[#FF3B3B]/15 hover:bg-[#FF3B3B]/10 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-[#FF3B3B]" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearNotifications}
              className="px-3.5 py-2 bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 hover:bg-[#FF3B3B]/20 rounded-xl text-xs font-semibold text-[#FF3B3B] transition-all flex items-center gap-1.5"
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
              className={`p-5 rounded-xl border flex items-start justify-between gap-4 transition-all ${getBg(notif.type)} ${
                notif.read ? 'opacity-65' : 'shadow-lg shadow-black/25'
              }`}
            >
              <div className="flex gap-3.5">
                {/* Icon wrapper */}
                <div className="p-2.5 bg-[#09090B] border border-[#FF3B3B]/15 rounded-xl shrink-0">
                  {getIcon(notif.type)}
                </div>
                
                {/* Text Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-wide">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-[1.7] font-medium">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-[#71717A] font-semibold pt-1">
                    {notif.time}
                  </p>
                </div>
              </div>

              {/* Action read triggers */}
              {!notif.read && (
                <button
                  onClick={() => markNotificationAsRead(notif.id)}
                  className="px-2.5 py-1 bg-[#0F1117] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 text-[10.5px] font-semibold text-[#FF3B3B] rounded-lg shrink-0 transition-colors"
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
