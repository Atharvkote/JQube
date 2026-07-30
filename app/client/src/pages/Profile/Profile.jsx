import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Mail, ShieldCheck, Folder, Github, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';

const Profile = () => {
  const { user, repositories, stats } = useContext(AppContext);

  return (
    <div className="space-y-6">
      
      {/* Profile Header banner */}
      <div className="bg-[#151922] border border-[#FF3B3B]/15 p-8 rounded-xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B3B]/10 rounded-full blur-2xl -z-10" />

        {/* Avatar */}
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="w-24 h-24 rounded-full border-2 border-[#FF3B3B]/30 object-cover shadow-2xl ring-4 ring-[#09090B]"
        />

        {/* User Info Details */}
        <div className="text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white flex flex-col sm:flex-row items-center gap-2">
              <span>{user.username}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-[#FF3B3B] text-[10px] font-bold mt-1 sm:mt-0">
                <Github className="w-3 h-3 text-[#FF3B3B]" />
                <span>GitHub Verified</span>
              </span>
            </h2>
            <p className="text-xs text-[#A1A1AA] flex items-center justify-center md:justify-start gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5 text-[#71717A]" />
              <span>{user.email}</span>
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
            <span className="px-3 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl">Role: Developer</span>
            <span className="px-3 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl">Project: B.Tech Capstone</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Repos Synced', value: user.repoCount, icon: Folder, color: 'text-[#FF3B3B] bg-[#FF3B3B]/10' },
          { label: 'Scans Performed', value: user.scansCount, icon: ShieldCheck, color: 'text-[#FF3B3B] bg-[#FF3B3B]/10' },
          { label: 'Open Issues', value: stats.critical + stats.high, icon: ShieldAlert, color: 'text-[#FF3B3B] bg-[#FF3B3B]/10' },
          { label: 'Resolutions Applied', value: 15, icon: Cpu, color: 'text-emerald-400 bg-emerald-500/10' },
        ].map((metric, idx) => (
          <div key={idx} className="p-5 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <p className="text-[10px] text-[#71717A] uppercase tracking-wider font-bold">{metric.label}</p>
              <p className="text-xl font-extrabold text-white">{metric.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${metric.color} shrink-0`}>
              <metric.icon className="w-4.5 h-4.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Connected Repos list */}
      <div className="bg-[#151922] border border-[#FF3B3B]/15 p-6 rounded-xl space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white tracking-wide border-b border-[#FF3B3B]/15 pb-3">Authorized Repositories</h3>
        
        <div className="divide-y divide-[#FF3B3B]/10">
          {repositories.map((repo) => (
            <div key={repo.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-lg text-[#FF3B3B] shrink-0">
                  <Folder className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{repo.name}</h4>
                  <p className="text-[10px] text-[#71717A] mt-0.5 font-mono">{repo.branch}</p>
                </div>
              </div>
              
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#FF3B3B] hover:underline font-semibold flex items-center gap-1"
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
