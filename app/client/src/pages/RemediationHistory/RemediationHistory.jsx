import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import {
  History,
  Code2,
  ExternalLink,
  CheckCircle2,
  GitPullRequest,
  Search,
  Filter,
  Eye,
  X
} from 'lucide-react';

const RemediationHistory = () => {
  const { remediationHistory } = useContext(AppContext);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filteredHistory = remediationHistory.filter((item) => {
    const matchesSearch =
      item.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.language.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'All' || item.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <History className="w-7 h-7 text-blue-500" /> Remediation History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical audit log of all AI-generated security patches and automated fixes.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search history by repo or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

      </div>

      {/* Remediation History Table */}
      <div className="p-6 bg-slate-900/60 border border-slate-850 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-2">Date / Time</th>
                <th className="pb-3 px-2">Project</th>
                <th className="pb-3 px-2">Language</th>
                <th className="pb-3 px-2">Severity</th>
                <th className="pb-3 px-2">Summary</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 pr-2 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {item.createdAt}
                  </td>
                  <td className="py-4 px-2 font-medium text-white">
                    {item.projectId}
                  </td>
                  <td className="py-4 px-2 text-slate-300 font-mono">
                    {item.language}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      item.severity === 'Critical' ? 'bg-red-500/10 text-red-400' :
                      item.severity === 'High' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-slate-300 max-w-xs truncate">
                    {item.summary}
                  </td>
                  <td className="py-4 px-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" /> {item.status || 'Remediated'}
                    </span>
                  </td>
                  <td className="py-4 pl-2 text-right">
                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-medium text-xs rounded-xl border border-slate-700/80 transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" /> View Patch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for View Details */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-500" /> Remediation Details ({selectedRecord.projectId})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedRecord.summary}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-red-400 block mb-1">Original Vulnerable Code:</span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-slate-300 overflow-x-auto">
                  <code>{selectedRecord.originalCode}</code>
                </pre>
              </div>

              <div>
                <span className="font-bold text-green-400 block mb-1">AI Remediation Fix:</span>
                <pre className="p-3 bg-slate-950 border border-green-500/30 rounded-xl font-mono text-green-300 overflow-x-auto">
                  <code>{selectedRecord.fixedCode}</code>
                </pre>
              </div>
            </div>

            {selectedRecord.pullRequestUrl && (
              <div className="pt-2 flex justify-end">
                <a
                  href={selectedRecord.pullRequestUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2"
                >
                  <GitPullRequest className="w-4 h-4" /> Open GitHub PR
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default RemediationHistory;
