import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Search, GitPullRequest, ExternalLink, ArrowRight, GitBranch, FolderGit, HelpCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const PullRequests = () => {
  const { pullRequests } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter pull requests
  const filteredPrs = pullRequests.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pr.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pr.number.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredPrs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide mr-auto font-sans">Automated Remediation Pull Requests</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search PR title, repository..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-60 pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-350 focus:outline-none focus:border-blue-500"
            />
          </div>

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
            <option value="Merged">Merged</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Pull Requests list table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">PR ID</th>
                <th className="py-4 px-4">Repository</th>
                <th className="py-4 px-4">Pull Request Details</th>
                <th className="py-4 px-4">Remediation Target Branch</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-550 font-medium">
                    No pull requests created yet.
                  </td>
                </tr>
              ) : (
                currentItems.map((pr) => (
                  <tr key={pr.id} className="hover:bg-slate-800/10 transition-colors">
                    
                    {/* PR Number */}
                    <td className="py-4 px-6 font-semibold text-slate-400 font-mono">
                      {pr.number}
                    </td>

                    {/* Repository info */}
                    <td className="py-4 px-4 font-bold text-slate-200">
                      <div className="flex items-center gap-1.5 max-w-[120px] truncate">
                        <FolderGit className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{pr.repository}</span>
                      </div>
                    </td>

                    {/* PR Title and created date */}
                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="font-semibold text-white truncate">{pr.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Created on {pr.createdDate}</div>
                    </td>

                    {/* Branch */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-350 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg w-max max-w-[200px]">
                        <GitBranch className="w-3.5 h-3.5 text-slate-550 shrink-0" />
                        <span className="truncate font-mono text-[10px]">{pr.branch}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                        pr.status === 'Merged' ? 'bg-green-500/10 text-green-500' :
                        pr.status === 'Open' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          pr.status === 'Merged' ? 'bg-green-500' :
                          pr.status === 'Open' ? 'bg-blue-500' :
                          'bg-slate-500'
                        }`} />
                        {pr.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <a
                        href={pr.prUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700/60 transition-all"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
};

export default PullRequests;
