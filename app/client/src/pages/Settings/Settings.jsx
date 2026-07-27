import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import CICDGenerator from '../../components/common/CICDGenerator';
import { Settings as SettingsIcon, Bell, Shield, Cpu, Volume2, LogOut, Check } from 'lucide-react';
import Toast from '../../components/common/Toast';

const Settings = () => {
  const { settings, setSettings, logout } = useContext(AppContext);
  const [showToast, setShowToast] = React.useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setShowToast(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title */}
      <div>
        <h2 className="text-base font-bold text-white tracking-wide">Platform Configurations</h2>
        <p className="text-xs text-slate-500 mt-0.5">Control J-QUBE vulnerability scanners, CI/CD integrations, webhook alerts, and session preferences.</p>
      </div>

      {/* CI/CD Generator Section */}
      <CICDGenerator />

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left config settings list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Automated Remediation config */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu className="w-4.5 h-4.5 text-blue-500" />
              <span>Remediation Engine Configurations</span>
            </h3>

            <div className="space-y-5">
              
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-200">Continuous Integration Scans</h4>
                  <p className="text-[10px] text-slate-500 max-w-md leading-relaxed">Runs scans automatically on GitHub webhooks (Push and Pull Requests).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRemediation}
                    onChange={() => handleToggle('autoRemediation')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                </label>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-200">Auto-Apply Secure PR Patches</h4>
                  <p className="text-[10px] text-slate-500 max-w-md leading-relaxed">Open secure pull requests immediately when AI determines confidence score &gt; 90%.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                </label>
              </div>

            </div>
          </div>

          {/* Webhook Alerts config */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-4.5 h-4.5 text-blue-500" />
              <span>Channel Integration alerts</span>
            </h3>

            <div className="space-y-5">
              
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-200">Slack Webhook Alerts</h4>
                  <p className="text-[10px] text-slate-500 max-w-md leading-relaxed">Send warnings immediately to Slack channel upon critical severity findings.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.slackAlerts}
                    onChange={() => handleToggle('slackAlerts')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white" />
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* Right side Profile Quick Actions and Logout */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase border-b border-slate-800 pb-3">Session management</h3>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Disconnect from verified GitHub credentials. This will lock workspace access until logging in again.
            </p>
            
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-red-500/30 hover:border-red-500 bg-red-950/15 hover:bg-red-900/20 text-red-400 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out of session</span>
            </button>
          </div>
        </div>

      </div>

      {showToast && (
        <Toast
          message="Configurations updated successfully."
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

    </div>
  );
};

export default Settings;
