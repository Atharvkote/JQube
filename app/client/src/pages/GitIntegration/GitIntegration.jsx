import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { connectGitHubRepo, disconnectRepo } from '../../services/api';
import {
  FolderGit2,
  Key,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  GitBranch,
  RefreshCw,
  Zap,
  Lock
} from 'lucide-react';

const GitIntegration = () => {
  const { gitRepositories, connectGitRepo, disconnectGitRepo } = useContext(AppContext);
  const [provider, setProvider] = useState('github');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [personalAccessToken, setPersonalAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!owner || !repo || !personalAccessToken) {
      setMessage({ text: 'Please fill in Owner, Repository, and Personal Access Token', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const result = await connectGitHubRepo({
        provider,
        owner,
        repo,
        branch,
        personalAccessToken
      });

      connectGitRepo(result);
      setMessage({ text: `Successfully connected ${owner}/${repo} with encrypted token!`, type: 'success' });
      setOwner('');
      setRepo('');
      setPersonalAccessToken('');
    } catch (err) {
      setMessage({ text: 'Failed to connect repository. Check credentials.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (id) => {
    await disconnectRepo(id);
    disconnectGitRepo(id);
    setMessage({ text: 'Repository disconnected successfully', type: 'info' });
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <FolderGit2 className="w-7 h-7 text-blue-500" /> Git Integration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect your GitHub and GitLab repositories with encrypted PAT tokens for automated AST scans and PR creation.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
          'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="hover:opacity-80">✕</button>
        </div>
      )}

      {/* Main Grid: Connection Form & Connected Repositories */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Form: Connect Repository */}
        <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-blue-500" />
            <span>Connect Repository</span>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            
            {/* Provider Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Git Provider</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('github')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    provider === 'github'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderGit2 className="w-4 h-4" /> GitHub
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('gitlab')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    provider === 'gitlab'
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <GitBranch className="w-4 h-4" /> GitLab
                </button>
              </div>
            </div>

            {/* Owner & Repo */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Repository Owner / Organization</label>
              <input
                type="text"
                placeholder="e.g. atharvkote"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Repository Name</label>
              <input
                type="text"
                placeholder="e.g. payment-gateway"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Default Branch</label>
              <input
                type="text"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* PAT Token */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                <span>Personal Access Token</span>
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> AES-256 Encrypted
                </span>
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={personalAccessToken}
                onChange={(e) => setPersonalAccessToken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Connecting...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Connect Repository
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Table: Connected Repositories */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-white tracking-wide">Connected Repositories</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                {gitRepositories.length} Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pr-2">Repository</th>
                    <th className="pb-3 px-2">Provider</th>
                    <th className="pb-3 px-2">Branch</th>
                    <th className="pb-3 px-2">Webhook</th>
                    <th className="pb-3 pl-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gitRepositories.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 pr-2 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="w-4 h-4 text-blue-400" />
                          <span>{item.owner}/{item.repo}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          item.provider === 'github' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {item.provider}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-mono text-slate-300">
                        <span className="flex items-center gap-1 text-[11px]">
                          <GitBranch className="w-3 h-3 text-slate-500" /> {item.branch}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> {item.webhookStatus || 'Active'}
                        </span>
                      </td>
                      <td className="py-4 pl-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://${item.provider}.com/${item.owner}/${item.repo}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                            title="Open Repository"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDisconnect(item.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/30 transition-colors"
                            title="Disconnect Repository"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default GitIntegration;
