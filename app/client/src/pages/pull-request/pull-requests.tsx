// JQube — Pull Requests Page (TSX)

import { useState } from 'react';
import { useApp } from '@/hooks';
import { Search, ExternalLink, GitBranch, FolderGit } from 'lucide-react';
import Pagination from '@/components/common/pagination';

export default function PullRequests() {
  const { pullRequests } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPrs = pullRequests.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.number.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPrs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrs.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide mr-auto font-sans">
          Automated Remediation Pull Requests
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#71717A]">
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
              className="w-full sm:w-60 pl-9 pr-4 py-2 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF3B3B]"
            />
          </div>

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
            <option value="Merged">Merged</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Pull Requests List Table */}
      <div className="bg-[#151922] border border-[#FF3B3B]/15 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F1117] border-b border-[#FF3B3B]/15 text-[#71717A] font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">PR ID</th>
                <th className="py-4 px-4">Repository</th>
                <th className="py-4 px-4">Pull Request Details</th>
                <th className="py-4 px-4">Remediation Target Branch</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FF3B3B]/10">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-[#71717A] font-medium"
                  >
                    No pull requests created yet.
                  </td>
                </tr>
              ) : (
                currentItems.map((pr) => (
                  <tr
                    key={pr.id}
                    className="hover:bg-[#FF3B3B]/5 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-[#A1A1AA] font-mono">
                      {pr.number}
                    </td>

                    <td className="py-4 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5 max-w-[120px] truncate">
                        <FolderGit className="w-4 h-4 text-[#FF3B3B] shrink-0" />
                        <span>{pr.repository}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="font-semibold text-white truncate">
                        {pr.title}
                      </div>
                      <div className="text-[10px] text-[#71717A] mt-0.5">
                        Created on {pr.createdDate}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-white bg-[#0F1117] border border-[#FF3B3B]/15 px-2.5 py-1 rounded-lg w-max max-w-[200px]">
                        <GitBranch className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        <span className="truncate font-mono text-[10px]">
                          {pr.branch}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg ${pr.status === 'Merged'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : pr.status === 'Open'
                            ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] animate-pulse border border-[#FF3B3B]/20'
                            : 'bg-[#0F1117] text-[#71717A]'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${pr.status === 'Merged'
                            ? 'bg-emerald-400'
                            : pr.status === 'Open'
                              ? 'bg-[#FF3B3B]'
                              : 'bg-[#71717A]'
                            }`}
                        />
                        {pr.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <a
                        href={pr.prUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-xs font-semibold text-[#A1A1AA] hover:text-white rounded-lg border border-[#FF3B3B]/15 transition-all"
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
