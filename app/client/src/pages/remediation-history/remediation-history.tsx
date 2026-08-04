// JQube — Remediation History Page (TSX)

import { useState } from 'react';
import { useApp } from '@/hooks';
import {
  History as HistoryIcon,
  Code2,
  CheckCircle2,
  GitPullRequest,
  Search,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import type { RemediationHistoryItem } from '@/types';

export default function RemediationHistory() {
  const { remediationHistory } = useApp();
  const [selectedRecord, setSelectedRecord] =
    useState<RemediationHistoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filteredHistory = remediationHistory.filter((item) => {
    const matchesSearch =
      item.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.language.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'All' ||
      item.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-[#FF3B3B]" /> Remediation History
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 leading-[1.7]">
            Historical audit log of all AI-generated security patches and automated fixes.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search history by repo or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF3B3B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#71717A]" />
          <span className="text-xs text-[#A1A1AA] font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0F1117] border border-[#FF3B3B]/15 text-xs text-white px-3 py-2 rounded-xl focus:outline-none"
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
      <div className="p-6 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#FF3B3B]/15 text-[#71717A] font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-2">Date / Time</th>
                <th className="pb-3 px-2">Project</th>
                <th className="pb-3 px-2">Language</th>
                <th className="pb-3 px-2">Severity</th>
                <th className="pb-3 px-2">Summary</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FF3B3B]/10">
              {filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FF3B3B]/5 transition-colors"
                >
                  <td className="py-4 pr-2 font-mono text-[#A1A1AA] text-[11px] whitespace-nowrap">
                    {item.createdAt}
                  </td>
                  <td className="py-4 px-2 font-medium text-white">
                    {item.projectId}
                  </td>
                  <td className="py-4 px-2 text-[#A1A1AA] font-mono">
                    {item.language}
                  </td>
                  <td className="py-4 px-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.severity === 'Critical'
                          ? 'bg-[#FF3B3B]/15 text-[#FF3B3B]'
                          : item.severity === 'High'
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-[#A1A1AA] max-w-xs truncate">
                    {item.summary}
                  </td>
                  <td className="py-4 px-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3" />{' '}
                      {item.status || 'Remediated'}
                    </span>
                  </td>
                  <td className="py-4 pl-2 text-right">
                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="px-3 py-1.5 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-[#A1A1AA] hover:text-white font-medium text-xs rounded-xl border border-[#FF3B3B]/15 transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#FF3B3B]" /> View Patch
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/80 backdrop-blur-sm">
          <div className="bg-[#151922] border border-[#FF3B3B]/20 rounded-xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#FF3B3B]/15 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#FF3B3B]" /> Remediation Details ({selectedRecord.projectId})
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {selectedRecord.summary}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-[#71717A] hover:text-white bg-[#0F1117]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[#FF3B3B] block mb-1">
                  Original Vulnerable Code:
                </span>
                <pre className="p-3 bg-[#09090B] border border-[#FF3B3B]/15 rounded-xl font-mono text-[#A1A1AA] overflow-x-auto">
                  <code>{selectedRecord.originalCode}</code>
                </pre>
              </div>

              <div>
                <span className="font-bold text-emerald-400 block mb-1">
                  AI Remediation Fix:
                </span>
                <pre className="p-3 bg-[#09090B] border border-emerald-500/30 rounded-xl font-mono text-emerald-300 overflow-x-auto">
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
                  className="px-4 py-2 bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-[#FF3B3B]/20"
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
}
