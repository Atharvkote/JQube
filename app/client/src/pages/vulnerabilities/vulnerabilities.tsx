// JQube — Detected Vulnerabilities Page (TSX)

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/hooks';
import { Search, Cpu } from 'lucide-react';

export default function Vulnerabilities() {
  const { vulnerabilities } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredVulns = vulnerabilities.filter((vuln) => {
    const matchesSearch =
      vuln.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.cve.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.cwe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.repository.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === 'All' || vuln.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'All' || vuln.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVulns.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVulns.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide mr-auto">
          Detected Vulnerabilities
        </h2>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px] md:w-60 md:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#71717A]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search CVE, CWE, file, repository..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF3B3B]"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF3B3B] appearance-none cursor-pointer pr-8 relative"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF3B3B] appearance-none cursor-pointer pr-8 relative"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Remediated">Remediated</option>
          </select>
        </div>
      </div>

      {/* Main Vulnerability List Table */}
      <div className="bg-[#151922] border border-[#FF3B3B]/15 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F1117] border-b border-[#FF3B3B]/15 text-[#71717A] font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Severity</th>
                <th className="py-4 px-4">Repository</th>
                <th className="py-4 px-4">File Location</th>
                <th className="py-4 px-4">CVE</th>
                <th className="py-4 px-4">CWE</th>
                <th className="py-4 px-4 text-center">CVSS Score</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FF3B3B]/10">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-[#71717A] font-medium"
                  >
                    No vulnerabilities found matching specified criteria.
                  </td>
                </tr>
              ) : (
                currentItems.map((vuln) => (
                  <tr
                    key={vuln.id}
                    className="hover:bg-[#FF3B3B]/5 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${vuln.severity === 'Critical'
                            ? 'bg-[#FF3B3B]/15 text-[#FF3B3B]'
                            : vuln.severity === 'High'
                              ? 'bg-orange-500/10 text-orange-400'
                              : vuln.severity === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-blue-500/10 text-blue-400'
                          }`}
                      >
                        {vuln.severity}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-white max-w-[120px] truncate">
                      {vuln.repository}
                    </td>

                    <td className="py-4 px-4 font-medium text-[#A1A1AA] max-w-[180px] truncate">
                      <div>{vuln.fileName}</div>
                      <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                        Line {vuln.lineNumber}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-[#A1A1AA] font-mono">
                      {vuln.cve === 'N/A' ? (
                        <span className="text-[#71717A]">N/A</span>
                      ) : (
                        vuln.cve
                      )}
                    </td>

                    <td className="py-4 px-4 text-[#A1A1AA] max-w-[140px] truncate">
                      {vuln.cwe}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${vuln.cvss >= 9.0
                            ? 'text-[#FF3B3B]'
                            : vuln.cvss >= 7.0
                              ? 'text-orange-400'
                              : vuln.cvss >= 4.0
                                ? 'text-amber-400'
                                : 'text-blue-400'
                          }`}
                      >
                        {vuln.cvss}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg ${vuln.status === 'Open'
                            ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                            : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${vuln.status === 'Open'
                              ? 'bg-[#FF3B3B]'
                              : 'bg-emerald-400'
                            }`}
                        />
                        {vuln.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/vulnerabilities/${vuln.id}`}
                          className="px-3 py-1.5 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-xs font-medium text-[#A1A1AA] hover:text-white rounded-lg border border-[#FF3B3B]/15 transition-all"
                        >
                          Details
                        </Link>
                        {vuln.status === 'Open' && (
                          <Link
                            to={`/ai-remediation/${vuln.id}`}
                            className="p-1.5 bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white rounded-lg transition-colors shadow-lg shadow-[#FF3B3B]/20"
                            title="Remediate with AI"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end pt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${currentPage === i + 1
                    ? 'bg-[#FF3B3B] text-white shadow-md shadow-[#FF3B3B]/20'
                    : 'bg-[#0F1117] border border-[#FF3B3B]/15 text-[#A1A1AA] hover:text-white'
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
