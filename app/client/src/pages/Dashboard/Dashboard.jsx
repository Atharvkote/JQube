import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import SeverityPieChart from '../../components/charts/SeverityPieChart';
import WeeklyScanChart from '../../components/charts/WeeklyScanChart';
import RepositoryBarChart from '../../components/charts/RepositoryBarChart';
import {
  ShieldAlert,
  FolderGit2,
  Scan,
  AlertOctagon,
  ArrowRight,
  Bot,
  GitPullRequest,
  Webhook,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const {
    stats,
    vulnerabilities,
    scanHistory,
    triggerScan,
    repositories,
    gitRepositories,
    remediationHistory,
    webhookLogs,
    pullRequests
  } = useContext(AppContext);

  // Filter open vulnerabilities
  const openVulnerabilities = vulnerabilities.filter(v => v.status === 'Open');
  const recentVulnerabilities = openVulnerabilities.slice(0, 4);
  const recentRemediations = remediationHistory.slice(0, 4);

  const integrationCards = [
    { name: 'Repositories Connected', value: gitRepositories.length, icon: FolderGit2, color: 'text-blue-500 bg-blue-500/10', link: '/git-integration' },
    { name: 'AI Fixes Generated', value: remediationHistory.length, icon: Bot, color: 'text-indigo-500 bg-indigo-500/10', link: '/remediation-history' },
    { name: 'Pull Requests Created', value: pullRequests.length, icon: GitPullRequest, color: 'text-purple-500 bg-purple-500/10', link: '/pull-requests' },
    { name: 'Webhook Events', value: webhookLogs.length, icon: Webhook, color: 'text-emerald-500 bg-emerald-500/10', link: '/webhook-logs' },
  ];

  const statCards = [
    { name: 'Critical Issues', value: stats.critical, icon: AlertOctagon, color: 'text-red-500 bg-red-500/10', critical: true },
    { name: 'High Issues', value: stats.high, icon: ShieldAlert, color: 'text-orange-500 bg-orange-500/10' },
    { name: 'Medium Issues', value: stats.medium, icon: ShieldAlert, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Low Issues', value: stats.low, icon: ShieldAlert, color: 'text-blue-400 bg-blue-400/10' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/15 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            Secure Code Hub <ShieldCheck className="w-5 h-5 text-blue-500" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Continuous vulnerability scanning and automated AI-powered remediation is operational. Click quick scan on any repository to run security checks.
          </p>
        </div>
        <div className="flex gap-2">
          {repositories.slice(0, 2).map((repo) => (
            <button
              key={repo.id}
              onClick={() => triggerScan(repo.id)}
              disabled={repo.status === 'Scanning'}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500/30 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              <span>Scan {repo.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Integration Metrics (Requested 4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {integrationCards.map((card, idx) => (
          <Link
            key={idx}
            to={card.link}
            className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-3 hover:border-blue-500/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {card.name}
              </p>
              <p className="text-2xl font-extrabold text-white mt-1">
                {card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Vulnerability Severity Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-900/40 border border-slate-850/80 rounded-2xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{stat.name}</span>
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Severity Pie Chart */}
        <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Vulnerability Severity</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Distribution of unresolved issues</p>
          </div>
          <div className="my-4">
            <SeverityPieChart data={stats} />
          </div>
        </div>

        {/* Weekly Scan Trend */}
        <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Scan Frequency</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Total commits scanned this week</p>
          </div>
          <div className="my-4">
            <WeeklyScanChart />
          </div>
        </div>

        {/* Repository Bar Chart */}
        <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-850 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Repository Comparison</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Vulnerabilities vs Resolved patches</p>
          </div>
          <div className="my-4">
            <RepositoryBarChart />
          </div>
        </div>

      </div>

      {/* Tables Row: Recent Vulnerabilities & Recent AI Remediations */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Recent Open Vulnerabilities */}
        <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-2xl">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Recent Vulnerabilities</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Latest high priority issues awaiting patch</p>
            </div>
            <Link
              to="/vulnerabilities"
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-2">Severity</th>
                  <th className="pb-3 px-2">Details</th>
                  <th className="pb-3 px-2">Repository</th>
                  <th className="pb-3 pl-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentVulnerabilities.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-slate-800/10">
                    <td className="py-3.5 pr-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        vuln.severity === 'Critical' ? 'bg-red-500/10 text-red-500' :
                        vuln.severity === 'High' ? 'bg-orange-500/10 text-orange-400' :
                        vuln.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {vuln.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-medium text-slate-200">
                      <div className="truncate max-w-[150px]">{vuln.cwe.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {vuln.fileName}:{vuln.lineNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-slate-400 truncate max-w-[100px]">{vuln.repository}</td>
                    <td className="py-3.5 pl-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/ai-remediation/${vuln.id}`}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold text-[11px] rounded border border-blue-500/30 flex items-center gap-1"
                        >
                          <Bot className="w-3 h-3" /> Fix
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent AI Remediations (Requested Section) */}
        <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-2xl">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Recent Remediations</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Automated AI patches applied</p>
            </div>
            <Link
              to="/remediation-history"
              className="text-xs text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 group"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-2">Project</th>
                  <th className="pb-3 px-2">Language</th>
                  <th className="pb-3 px-2">Summary</th>
                  <th className="pb-3 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentRemediations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/10">
                    <td className="py-3.5 pr-2 font-medium text-white">{item.projectId}</td>
                    <td className="py-3.5 px-2 font-mono text-slate-400">{item.language}</td>
                    <td className="py-3.5 px-2 text-slate-300 truncate max-w-[160px]">{item.summary}</td>
                    <td className="py-3.5 pl-2 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/10 text-green-400 rounded border border-green-500/20">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
