// JQube — Scan History Page (TSX)

import { useState } from 'react';
import { useApp } from '@/hooks';
import { Search, Clock, RefreshCw } from 'lucide-react';
import Pagination from '@/components/common/pagination';

export default function ScanHistory() {
  const { scanHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredHistory = scanHistory.filter((scan) => {
    const matchesSearch =
      scan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.trigger.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide mr-auto">
          Repository Scan History
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#71717A]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search scan details..."
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
            <option value="Completed">Completed</option>
            <option value="Scanning">Scanning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* History table */}
      <div className="bg-[#151922] border border-[#FF3B3B]/15 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F1117] border-b border-[#FF3B3B]/15 text-[#71717A] font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Scan ID</th>
                <th className="py-4 px-4">Repository</th>
                <th className="py-4 px-4">Execution Trigger</th>
                <th className="py-4 px-4">Scan Duration</th>
                <th className="py-4 px-4 text-center">Issues Detected</th>
                <th className="py-4 px-6 text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FF3B3B]/10">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-[#71717A] font-medium"
                  >
                    No scan logs found in execution history.
                  </td>
                </tr>
              ) : (
                currentItems.map((scan) => (
                  <tr
                    key={scan.id}
                    className="hover:bg-[#FF3B3B]/5 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-[#A1A1AA] font-mono">
                      {scan.id}
                    </td>

                    <td className="py-4 px-4 font-bold text-white">
                      {scan.repository}
                    </td>

                    <td className="py-4 px-4 text-[#A1A1AA] max-w-[200px] truncate">
                      <div>{scan.trigger}</div>
                      <div className="text-[10px] text-[#71717A] mt-0.5">
                        {scan.time}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {scan.duration === 'Scanning...' ? (
                        <span className="text-[#71717A] font-mono">
                          Calculating...
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#A1A1AA] font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                          <span>{scan.duration}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-bold">
                      {scan.status === 'Scanning' ? (
                        <span className="text-[#FF3B3B]">Scanning...</span>
                      ) : (
                        <span
                          className={
                            scan.totalIssues > 5
                              ? 'text-[#FF3B3B] font-extrabold'
                              : 'text-white'
                          }
                        >
                          {scan.totalIssues}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg ${scan.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : scan.status === 'Scanning'
                            ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border border-[#FF3B3B]/20 animate-pulse'
                            : 'bg-[#FF3B3B]/15 text-[#FF3B3B]'
                          }`}
                      >
                        {scan.status === 'Scanning' ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${scan.status === 'Completed'
                              ? 'bg-emerald-400'
                              : 'bg-[#FF3B3B]'
                              }`}
                          />
                        )}
                        {scan.status}
                      </span>
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
