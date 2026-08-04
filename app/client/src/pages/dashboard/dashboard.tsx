// JQube — Enterprise Security Dashboard (TSX)

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertOctagon,
  FolderGit2,
  CheckCircle2,
  XCircle,
  Activity,
  ShieldCheck,
  RefreshCw,
  Download,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart2,
  LucideIcon,
} from 'lucide-react';

import SeverityPieChart from '@/components/charts/SeverityPieChart';
import RepositoryBarChart from '@/components/charts/RepositoryBarChart';
import WeeklyScanChart from '@/components/charts/WeeklyScanChart';

import {
  fetchDashboardSummary,
  fetchSeverityData,
  fetchRepositoryMetrics,
  fetchWeeklyScans,
  fetchRecentScans,
  exportDashboardReport,
} from '@/services/api';

import { generateDashboardPDF } from '@/utils/pdfExporter';
import type { DashboardSummary, RecentScan, SeverityChartItem, RepositoryChartItem, WeeklyScanDataItem, TimeRange } from '@/types';

interface MetricCardData {
  id: string;
  name: string;
  value: number | string;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconBg: string;
}

const TIME_RANGE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Custom Range', value: 'custom' },
];

const EXPORT_OPTIONS = [
  { label: 'Export PDF Report', format: 'pdf', icon: FileText },
  { label: 'Export CSV Report', format: 'csv', icon: FileSpreadsheet },
  { label: 'Export Excel Sheet', format: 'xlsx', icon: FileSpreadsheet },
  { label: 'Vulnerability Summary', format: 'summary', icon: ShieldAlert },
  { label: 'Weekly Scan Log', format: 'scan-log', icon: Activity },
];

function useCountUp(target: number, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || typeof target !== 'number') {
      setValue(target);
      return;
    }
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, enabled]);
  return value;
}

const MetricCard = React.memo(
  ({
    card,
    index,
    isLoading,
  }: {
    card: MetricCardData;
    index: number;
    isLoading: boolean;
  }) => {
    const numericValue =
      typeof card.value === 'number' ? card.value : parseInt(card.value, 10);
    const isNumeric = !isNaN(numericValue);
    const displayValue = useCountUp(
      isNumeric ? numericValue : 0,
      1200,
      !isLoading && isNumeric
    );

    if (isLoading) {
      return (
        <div className="h-[120px] p-5 bg-[#121620]/40 border border-[#FF3B3B]/10 rounded-2xl animate-pulse flex flex-col justify-between backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-[#0F1117]/60 rounded-lg" />
            <div className="w-9 h-9 bg-[#0F1117]/60 rounded-xl" />
          </div>
          <div className="h-8 w-20 bg-[#0F1117]/60 rounded-lg" />
        </div>
      );
    }

    return (
      <div className="relative group">
        {/* Decorative Offset Red Glow Box behind card */}
        <div className="absolute -top-1 -right-1 bottom-1 left-1 border border-[#FF3B3B]/15 bg-transparent rounded-2xl pointer-events-none -z-10 transition-all duration-300 group-hover:top-0 group-hover:right-0 group-hover:bottom-0 group-hover:left-0 group-hover:border-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04 }}
          whileHover={{ boxShadow: '0 0 28px rgba(255,59,59,0.18)' }}
          className="relative h-[120px] p-5 bg-[#121620]/60 border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/40 rounded-2xl shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default backdrop-blur-md"
          aria-label={card.name}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B3B]/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

          <div className="flex items-center justify-between gap-2 relative z-10">
            <span className="text-[10px] font-bold text-[#A1A1AA] truncate leading-tight uppercase tracking-wider font-mono">
              {card.name}
            </span>
            <div className={`p-2 rounded-xl border shrink-0 ${card.iconBg}`}>
              <card.icon className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 relative z-10">
            <span className="text-3xl font-black text-white tracking-tight leading-none font-mono">
              {isNumeric ? displayValue : card.value}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold font-mono uppercase mb-0.5 ${card.isPositive ? 'text-emerald-400' : 'text-[#FF3B3B]'
                }`}
            >
              {card.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {card.trend}
            </span>
          </div>
        </motion.div>
      </div>
    );
  }
);

export default function Dashboard() {
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLDivElement>(null);

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [dropdownAbove, setDropdownAbove] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [severityData, setSeverityData] = useState<SeverityChartItem[]>([]);
  const [repositoryData, setRepositoryData] = useState<RepositoryChartItem[]>([]);
  const [weeklyScanData, setWeeklyScanData] = useState<WeeklyScanDataItem[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showExportMenu &&
        exportBtnRef.current &&
        !exportBtnRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  useEffect(() => {
    if (showExportMenu && exportBtnRef.current) {
      const rect = exportBtnRef.current.getBoundingClientRect();
      const dropdownHeight = 240;
      const dropdownWidth = 224;
      const spaceBelow = window.innerHeight - rect.bottom;
      const above = spaceBelow < dropdownHeight;
      setDropdownAbove(above);

      const rightEdge = window.innerWidth - rect.right;
      setDropdownStyle({
        position: 'fixed',
        zIndex: 99999,
        width: dropdownWidth,
        top: above ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
        right: Math.max(rightEdge, 8),
      });
    }
  }, [showExportMenu]);

  const loadDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    setIsError(false);
    try {
      const [summaryRes, severityRes, repoRes, weeklyRes, scansRes] =
        await Promise.all([
          fetchDashboardSummary(timeRange),
          fetchSeverityData(timeRange),
          fetchRepositoryMetrics(timeRange),
          fetchWeeklyScans(timeRange),
          fetchRecentScans(timeRange),
        ]);

      setSummaryData(summaryRes);
      setSeverityData(severityRes);
      setRepositoryData(repoRes);
      setWeeklyScanData(weeklyRes);
      setRecentScans(scansRes || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setIsError(true);
      setToastMessage({
        type: 'error',
        title: 'Data Fetch Failed',
        message: 'Could not refresh dashboard data. Please retry.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    setIsLoading(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleExport = useCallback(
    async (option: { label: string; format: string }) => {
      setShowExportMenu(false);
      setIsExporting(true);
      try {
        if (option.format === 'pdf') {
          await generateDashboardPDF(dashboardRef.current, { timeRange });
        } else {
          await exportDashboardReport(option.format as any, { timeRange });
        }
        setToastMessage({
          type: 'success',
          title: 'Export Successful',
          message: `${option.label} has been downloaded.`,
        });
      } catch {
        setToastMessage({
          type: 'error',
          title: 'Export Failed',
          message: 'Something went wrong during export. Please try again.',
        });
      } finally {
        setIsExporting(false);
      }
    },
    [timeRange]
  );

  const filteredScans = useMemo(() => {
    return recentScans.filter((scan) => {
      const matchesSearch =
        !debouncedSearch ||
        scan.repository?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        scan.id?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        scan.cveId?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || scan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [recentScans, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredScans.length / itemsPerPage) || 1;
  const paginatedScans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredScans.slice(start, start + itemsPerPage);
  }, [filteredScans, currentPage]);

  const metricCards: MetricCardData[] = useMemo(() => {
    if (!summaryData) return [];
    return [
      {
        id: 'total',
        name: 'Total Vulnerabilities',
        value: summaryData.totalVulnerabilities,
        trend: summaryData.trends?.total || '+12.4%',
        isPositive: false,
        icon: ShieldAlert,
        iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      },
      {
        id: 'critical',
        name: 'Critical Issues',
        value: summaryData.critical,
        trend: summaryData.trends?.critical || '-15.0%',
        isPositive: true,
        icon: AlertOctagon,
        iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      },
      {
        id: 'high',
        name: 'High Severity',
        value: summaryData.high,
        trend: summaryData.trends?.high || '+4.2%',
        isPositive: false,
        icon: ShieldAlert,
        iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      },
      {
        id: 'repos',
        name: 'Connected Repos',
        value: summaryData.connectedRepositories,
        trend: 'Active',
        isPositive: true,
        icon: FolderGit2,
        iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      },
      {
        id: 'success',
        name: 'Successful Scans',
        value: summaryData.successfulScans,
        trend: '96.8%',
        isPositive: true,
        icon: CheckCircle2,
        iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      },
      {
        id: 'failed',
        name: 'Failed Scans',
        value: summaryData.failedScans,
        trend: '3.2%',
        isPositive: false,
        icon: XCircle,
        iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      },
      {
        id: 'risk',
        name: 'Avg Risk Score',
        value: `${summaryData.avgRiskScore}/100`,
        trend: 'Medium',
        isPositive: true,
        icon: Activity,
        iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      },
      {
        id: 'health',
        name: 'Security Health',
        value: `${summaryData.securityHealth}%`,
        trend: summaryData.trends?.health || '+2.1%',
        isPositive: true,
        icon: ShieldCheck,
        iconBg: 'bg-green-500/10 text-green-400 border-green-500/20',
      },
    ];
  }, [summaryData]);

  return (
    <div ref={dashboardRef} className="space-y-6 relative overflow-hidden p-1 min-h-screen">
      {/* Background Animated Gradient Mesh Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FF3B3B]/10 rounded-full blur-[140px] pointer-events-none animate-pulse -z-10" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse -z-10"
        style={{ animationDelay: '3s' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF3B3B]/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Futuristic Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#FF3B3B_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none -z-10" />

      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 min-w-[280px] ${toastMessage.type === 'error'
              ? 'bg-[#121620]/95 border-[#FF3B3B]/40 text-white'
              : 'bg-[#121620]/95 border-emerald-500/40 text-white'
              }`}
          >
            <CheckCircle2
              className={`w-5 h-5 shrink-0 ${toastMessage.type === 'error'
                ? 'text-[#FF3B3B]'
                : 'text-emerald-400'
                }`}
            />
            <div>
              <p className="text-xs font-bold">{toastMessage.title}</p>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                {toastMessage.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 group">
        {/* Decorative Offset Red Glow Box behind header */}
        <div className="absolute -top-1 -right-1 bottom-1 left-1 border border-[#FF3B3B]/15 bg-transparent rounded-2xl pointer-events-none transition-all duration-300 group-hover:top-0 group-hover:right-0 group-hover:bottom-0 group-hover:left-0 group-hover:border-transparent" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 px-6 py-5 bg-[#121620]/60 border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/30 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-300">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white leading-none">
                Enterprise Security{' '}
                <span className="bg-gradient-to-r from-[#FF3B3B] via-[#FF6666] to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                  Dashboard
                </span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/25 rounded-full uppercase tracking-widest font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
                Live Feed
              </span>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
              Continuous automated vulnerability scanning, threat intelligence &amp; SAST analytics.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-[#71717A] font-mono uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#FF3B3B]" />
              <span>
                Last Updated:{' '}
                <strong className="text-[#A1A1AA] font-bold">
                  {lastUpdated}
                </strong>
              </span>
            </div>
          </div>

          {/* Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadDashboardData}
              disabled={isRefreshing}
              className="h-[38px] px-3 bg-[#0F1117] hover:bg-[#FF3B3B]/10 border border-[#FF3B3B]/15 text-[#A1A1AA] hover:text-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#FF3B3B]/40 disabled:opacity-50 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider"
              title="Refresh Dashboard Data"
              aria-label="Refresh"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF3B3B]' : ''
                  }`}
              />
              <span className="hidden sm:block">Refresh</span>
            </button>

            <div className="flex items-center bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl p-1 gap-0.5 font-mono">
              {TIME_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value as TimeRange)}
                  className={`h-[30px] px-2.5 sm:px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${timeRange === option.value
                    ? 'bg-[#FF3B3B] text-white shadow-md'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/10'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="relative" ref={exportBtnRef}>
              <button
                onClick={() => setShowExportMenu((prev) => !prev)}
                disabled={isExporting}
                className="h-[38px] px-4 bg-[#FF3B3B] hover:bg-[#FF3B3B]/85 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF3B3B]/20 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FF3B3B]/50 disabled:opacity-50 font-mono"
                aria-haspopup="true"
                aria-expanded={showExportMenu}
              >
                {isExporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isExporting ? 'Generating...' : 'Export'}</span>
              </button>
            </div>

            {showExportMenu &&
              createPortal(
                <AnimatePresence>
                  <motion.div
                    key="export-menu"
                    initial={{
                      opacity: 0,
                      scale: 0.95,
                      y: dropdownAbove ? 6 : -6,
                    }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                      y: dropdownAbove ? 6 : -6,
                    }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={dropdownStyle}
                    className="bg-[#121620]/95 backdrop-blur-xl border border-[#FF3B3B]/20 rounded-2xl shadow-2xl p-1.5 space-y-0.5"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold text-[#71717A] uppercase tracking-wider border-b border-[#FF3B3B]/15 mb-1 font-mono">
                      Select Export Format
                    </div>
                    {EXPORT_OPTIONS.map((exp) => (
                      <button
                        key={exp.format}
                        onClick={() => handleExport(exp)}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[10px] font-bold text-[#A1A1AA] rounded-xl hover:bg-[#FF3B3B]/10 hover:text-white transition-colors text-left font-mono uppercase tracking-wide"
                      >
                        <exp.icon className="w-4 h-4 text-[#FF3B3B] shrink-0" />
                        <span>{exp.label}</span>
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>,
                document.body
              )}
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, idx) => (
            <MetricCard
              key={idx}
              card={{
                id: `skeleton-${idx}`,
                name: '',
                value: 0,
                trend: '',
                isPositive: true,
                icon: BarChart2,
                iconBg: '',
              }}
              index={idx}
              isLoading
            />
          ))
          : metricCards.map((card, idx) => (
            <MetricCard
              key={card.id}
              card={card}
              index={idx}
              isLoading={false}
            />
          ))}
      </div>

      {/* Charts Row */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SeverityPieChart
          severityData={severityData}
          isLoading={isLoading}
          isError={isError}
          onRetry={loadDashboardData}
          title="Vulnerability Severity"
          description={`Distribution for ${timeRange} range`}
        />

        <RepositoryBarChart
          repositoryData={repositoryData}
          isLoading={isLoading}
          isError={isError}
          onRetry={loadDashboardData}
          title="Repository Comparison"
          description="Total vs Resolved findings per repository"
        />

        <WeeklyScanChart
          weeklyScanData={weeklyScanData}
          isLoading={isLoading}
          isError={isError}
          onRetry={loadDashboardData}
          title="Scan Volume Trends"
          description="Automated security pipeline executions"
        />
      </div>

      {/* Activity Table */}
      <div className="relative z-10 group">
        {/* Decorative Offset Red Glow Box behind table card */}
        <div className="absolute -top-1 -right-1 bottom-1 left-1 border border-[#FF3B3B]/15 bg-transparent rounded-2xl pointer-events-none transition-all duration-300 group-hover:top-0 group-hover:right-0 group-hover:bottom-0 group-hover:left-0 group-hover:border-transparent" />

        <div className="relative p-6 bg-[#121620]/60 border border-[#FF3B3B]/15 hover:border-[#FF3B3B]/30 rounded-2xl shadow-xl space-y-5 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Recent Security Scans &amp; Events
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Live audit trail of code scans, CVE findings, and pipeline executions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Repo, CVE, Scan ID..."
                  className="w-full pl-9 pr-4 py-2 bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF3B3B] focus:ring-2 focus:ring-[#FF3B3B]/20 transition-all font-mono"
                  aria-label="Search scans"
                />
              </div>

              <div className="flex items-center bg-[#0F1117] border border-[#FF3B3B]/15 rounded-xl p-1 gap-0.5 font-mono">
                {['All', 'Completed', 'Scanning', 'Failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${statusFilter === status
                      ? 'bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-[#FF3B3B]/8'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar rounded-xl">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="text-[#71717A] font-bold uppercase tracking-wider border-b border-[#FF3B3B]/15 font-mono text-[10px]">
                  <th className="pb-3 pr-4 pl-1">Scan ID</th>
                  <th className="pb-3 px-4">Repository</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Severity</th>
                  <th className="pb-3 px-4">CVE / CWE</th>
                  <th className="pb-3 px-4">Timestamp</th>
                  <th className="pb-3 pl-4 pr-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FF3B3B]/8">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 pr-4 pl-1">
                        <div className="h-3 w-16 bg-[#0F1117] rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-28 bg-[#0F1117] rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-20 bg-[#0F1117] rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-16 bg-[#0F1117] rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-24 bg-[#0F1117] rounded" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-3 w-20 bg-[#0F1117] rounded" />
                      </td>
                      <td className="py-3.5 pl-4 pr-1 text-right">
                        <div className="h-3 w-12 bg-[#0F1117] rounded ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedScans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#71717A]">
                        <Search className="w-8 h-8 opacity-40" />
                        <p className="text-sm font-medium">
                          No scan records match your filter criteria.
                        </p>
                        <p className="text-xs opacity-70">
                          Try adjusting your search or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedScans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="hover:bg-[#FF3B3B]/5 transition-colors group"
                    >
                      <td className="py-3.5 pr-4 pl-1 font-mono font-semibold text-[#A1A1AA] group-hover:text-white transition-colors">
                        {scan.id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {scan.repository}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border font-mono uppercase tracking-wider ${scan.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : scan.status === 'Scanning'
                              ? 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20 animate-pulse'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {scan.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg font-mono uppercase tracking-wider ${scan.severity === 'Critical'
                            ? 'bg-[#FF3B3B]/15 text-[#FF3B3B]'
                            : scan.severity === 'High'
                              ? 'bg-orange-500/10 text-orange-400'
                              : scan.severity === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}
                        >
                          {scan.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#A1A1AA]">
                        {scan.cveId || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-[#71717A] text-[11px] font-mono whitespace-nowrap">
                        {scan.timestamp}
                      </td>
                      <td className="py-3.5 pl-4 pr-1 text-right">
                        <button
                          onClick={() => navigate('/scan-history')}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF3B3B] hover:text-white hover:underline transition-colors focus:outline-none focus:ring-1 focus:ring-[#FF3B3B] rounded font-mono uppercase tracking-wider"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredScans.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#FF3B3B]/10 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
              <span>
                Showing{' '}
                <strong className="text-white">
                  {(currentPage - 1) * itemsPerPage + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-white">
                  {Math.min(currentPage * itemsPerPage, filteredScans.length)}
                </strong>{' '}
                of <strong className="text-white">{filteredScans.length}</strong>{' '}
                events
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-xl bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-white disabled:opacity-40 transition-colors border border-[#FF3B3B]/15"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-xl bg-[#0F1117] hover:bg-[#FF3B3B]/10 text-white disabled:opacity-40 transition-colors border border-[#FF3B3B]/15"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
