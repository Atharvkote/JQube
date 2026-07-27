import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import ScanTerminal from '../../components/common/ScanTerminal';
import { Search, Filter, RefreshCw, Zap, Folder } from 'lucide-react';

const Repositories = () => {
  const { repositories, triggerScan } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeRepoName, setActiveRepoName] = useState('payment-gateway');

  // Find unique languages for filtering
  const languages = ['All', ...new Set(repositories.map(r => r.language))];

  // Filter repositories
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          repo.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = langFilter === 'All' || repo.language === langFilter;
    return matchesSearch && matchesLang;
  });

  const handleScanClick = (repo) => {
    setActiveRepoName(repo.name);
    setTerminalOpen(true);
    triggerScan(repo.id);
  };

  return (
    <div className="space-y-6">
      
      {/* Live Terminal Overlay Modal */}
      <ScanTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        repoName={activeRepoName}
      />

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide mr-auto">Connected Codebases</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search repository..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Language Filter */}
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-500">
              <Filter className="w-3.5 h-3.5" />
            </span>
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Repositories Card Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No repositories found matching your search.
          </div>
        ) : (
          filteredRepos.map((repo) => {
            return (
              <div
                key={repo.id}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-6 hover:border-slate-800 transition-all"
              >
                {/* Repo Meta */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-850 rounded-lg text-slate-400">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide truncate max-w-[160px]">
                          {repo.name}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {repo.branch}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      repo.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                      repo.status === 'Critical' ? 'bg-red-500/10 text-red-500 animate-pulse' :
                      repo.status === 'Safe' ? 'bg-blue-500/10 text-blue-400' :
                      repo.status === 'Scanning' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' :
                      'bg-slate-550/10 text-slate-400'
                    }`}>
                      {repo.status}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-450 hover:text-slate-200 truncate font-medium">
                    {repo.url}
                  </p>
                </div>

                {/* Vulnerability Severity Badges */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-b border-slate-800/60 py-3">
                  {[
                    { label: 'Crit', count: repo.vulnerabilities.critical, color: 'bg-red-500/10 text-red-500' },
                    { label: 'High', count: repo.vulnerabilities.high, color: 'bg-orange-500/10 text-orange-400' },
                    { label: 'Med', count: repo.vulnerabilities.medium, color: 'bg-amber-500/10 text-amber-400' },
                    { label: 'Low', count: repo.vulnerabilities.low, color: 'bg-blue-500/10 text-blue-400' }
                  ].map((vulnBadge, index) => (
                    <div key={index} className={`p-1.5 rounded-lg text-center ${vulnBadge.color}`}>
                      <div className="text-[9px] font-bold uppercase opacity-80">{vulnBadge.label}</div>
                      <div className="text-xs font-bold mt-0.5">{vulnBadge.count}</div>
                    </div>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] text-slate-550 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Language: <strong>{repo.language}</strong></span>
                  </div>
                  <button
                    onClick={() => handleScanClick(repo)}
                    disabled={repo.status === 'Scanning'}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                      repo.status === 'Scanning'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/15'
                    }`}
                  >
                    {repo.status === 'Scanning' ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Run Scan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Repositories;
