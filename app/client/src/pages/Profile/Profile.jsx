import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { User, Mail, ShieldCheck, Folder, Github, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';

const Profile = () => {
  const { user, repositories, stats } = useContext(AppContext);

  return (
    <div className="space-y-6">
      
      {/* Profile Header banner */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -z-10" />

        {/* Avatar */}
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="w-24 h-24 rounded-full border-2 border-slate-700 object-cover shadow-2xl ring-4 ring-slate-900"
        />

        {/* User Info Details */}
        <div className="text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white flex flex-col sm:flex-row items-center gap-2">
              <span>{user.username}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 text-[10px] font-bold mt-1 sm:mt-0">
                <Github className="w-3 h-3 text-blue-400" />
                <span>GitHub Verified</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-550" />
              <span>{user.email}</span>
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-xl">Role: Developer</span>
            <span className="px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-xl">Project: B.Tech Capstone</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Repos Synced', value: user.repoCount, icon: Folder, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Scans Performed', value: user.scansCount, icon: ShieldCheck, color: 'text-indigo-500 bg-indigo-500/10' },
          { label: 'Open Issues', value: stats.critical + stats.high, icon: ShieldAlert, color: 'text-red-500 bg-red-500/10' },
          { label: 'Resolutions Applied', value: 15, icon: Cpu, color: 'text-green-500 bg-green-500/10' },
        ].map((metric, idx) => (
          <div key={idx} className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{metric.label}</p>
              <p className="text-xl font-extrabold text-white">{metric.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${metric.color} shrink-0`}>
              <metric.icon className="w-4.5 h-4.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Connected Repos list */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-3">Authorized Repositories</h3>
        
        <div className="divide-y divide-slate-800/60">
          {repositories.map((repo) => (
            <div key={repo.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 shrink-0">
                  <Folder className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{repo.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{repo.branch}</p>
                </div>
              </div>
              
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>GitHub Repo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Profile;
