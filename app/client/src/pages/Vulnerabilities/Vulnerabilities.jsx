import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Search, Filter, Cpu, ArrowRight, ShieldAlert, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination'; // Wait, let's create Pagination.jsx or build it inline if simpler. Let's build a clean pagination component.

const Vulnerabilities = () => {
  const { vulnerabilities } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter vulnerabilities
  const filteredVulns = vulnerabilities.filter(vuln => {
    const matchesSearch = vuln.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vuln.cve.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vuln.cwe.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vuln.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vuln.repository.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || vuln.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || vuln.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredVulns.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVulns.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide mr-auto">Detected Vulnerabilities</h2>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] md:w-60 md:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
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
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8 relative"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8 relative"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Remediated">Remediated</option>
          </select>
        </div>
      </div>

      {/* Main Vulnerability List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-800/60">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 font-medium">
                    No vulnerabilities found matching specified criteria.
                  </td>
                </tr>
              ) : (
                currentItems.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-slate-800/10 transition-colors">
                    
                    {/* Severity Badge */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                        vuln.severity === 'Critical' ? 'bg-red-500/10 text-red-500' :
                        vuln.severity === 'High' ? 'bg-orange-500/10 text-orange-400' :
                        vuln.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {vuln.severity}
                      </span>
                    </td>

                    {/* Repository Name */}
                    <td className="py-4 px-4 font-bold text-white max-w-[120px] truncate">
                      {vuln.repository}
                    </td>

                    {/* File Path */}
                    <td className="py-4 px-4 font-medium text-slate-300 max-w-[180px] truncate">
                      <div>{vuln.fileName}</div>
                      <div className="text-[10px] text-slate-550 font-mono mt-0.5">Line {vuln.lineNumber}</div>
                    </td>

                    {/* CVE */}
                    <td className="py-4 px-4 font-semibold text-slate-350 font-mono">
                      {vuln.cve === 'N/A' ? <span className="text-slate-500">N/A</span> : vuln.cve}
                    </td>

                    {/* CWE Description */}
                    <td className="py-4 px-4 text-slate-400 max-w-[140px] truncate">
                      {vuln.cwe}
                    </td>

                    {/* CVSS Value */}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                        vuln.cvss >= 9.0 ? 'text-red-500' :
                        vuln.cvss >= 7.0 ? 'text-orange-400' :
                        vuln.cvss >= 4.0 ? 'text-amber-400' :
                        'text-blue-450'
                      }`}>
                        {vuln.cvss}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                        vuln.status === 'Open' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vuln.status === 'Open' ? 'bg-red-500' : 'bg-green-500'}`} />
                        {vuln.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/vulnerabilities/${vuln.id}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 hover:text-white rounded-lg border border-slate-750/80 transition-all"
                        >
                          Details
                        </Link>
                        {vuln.status === 'Open' && (
                          <Link
                            to={`/ai-remediation/${vuln.id}`}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/10"
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-250'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Vulnerabilities;
