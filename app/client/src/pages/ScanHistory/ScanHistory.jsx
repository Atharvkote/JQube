import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Search, History, Clock, FileWarning, Zap, RefreshCw, HelpCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination';

const ScanHistory = () => {
  const { scanHistory, triggerScan, repositories } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter scan history
  const filteredHistory = scanHistory.filter(scan => {
    const matchesSearch = scan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scan.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scan.trigger.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide mr-auto">Repository Scan History</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
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
            <option value="Completed">Completed</option>
            <option value="Scanning">Scanning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* History table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Scan ID</th>
                <th className="py-4 px-4">Repository</th>
                <th className="py-4 px-4">Execution Trigger</th>
                <th className="py-4 px-4">Scan Duration</th>
                <th className="py-4 px-4 text-center">Issues Detected</th>
                <th className="py-4 px-6 text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-550 font-medium">
                    No scan logs found in execution history.
                  </td>
                </tr>
              ) : (
                currentItems.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/10 transition-colors">
                    
                    {/* Scan ID */}
                    <td className="py-4 px-6 font-semibold text-slate-400 font-mono">
                      {scan.id}
                    </td>

                    {/* Repository name */}
                    <td className="py-4 px-4 font-bold text-slate-200">
                      {scan.repository}
                    </td>

                    {/* Trigger details */}
                    <td className="py-4 px-4 text-slate-400 max-w-[200px] truncate">
                      <div>{scan.trigger}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{scan.time}</div>
                    </td>

                    {/* Scan Duration */}
                    <td className="py-4 px-4">
                      {scan.duration === 'Scanning...' ? (
                        <span className="text-slate-500 font-mono">Calculating...</span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-550 shrink-0" />
                          <span>{scan.duration}</span>
                        </div>
                      )}
                    </td>

                    {/* Issues detected count */}
                    <td className="py-4 px-4 text-center font-bold">
                      {scan.status === 'Scanning' ? (
                        <span className="text-blue-400">Scanning...</span>
                      ) : (
                        <span className={scan.totalIssues > 5 ? 'text-red-500 font-extrabold' : 'text-slate-200'}>
                          {scan.totalIssues}
                        </span>
                      )}
                    </td>

                    {/* Execution status badge */}
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                        scan.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                        scan.status === 'Scanning' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {scan.status === 'Scanning' ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${scan.status === 'Completed' ? 'bg-green-500' : 'bg-red-500'}`} />
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

      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
};

export default ScanHistory;
