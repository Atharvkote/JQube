// JQube — Webhook Event Logs (Enterprise Security Monitoring Panel)

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import {
  Webhook,
  Radio,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  Copy,
  ExternalLink,
  MoreVertical,
  GitBranch,
  GitCommit,
  FolderGit2,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Code2,
  Maximize2,
  Eye,
  RotateCcw,
  Sparkles,
  BarChart3,
  Server,
  Play,
  Pause,
} from 'lucide-react';
import type { WebhookLog, GitProvider } from '@/types';

// Custom SVG GitHub Icon
function GitHubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// Custom SVG GitLab Icon
function GitLabIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.5 2a.43.43 0 0 1 .4.28l2.25 6.9h7.7l2.25-6.9a.43.43 0 0 1 .4-.28.42.42 0 0 1 .79.14l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z" />
    </svg>
  );
}

type ChartTimeRange = '1H' | '6H' | '24H' | '7D';

interface FilterState {
  search: string;
  provider: 'all' | GitProvider;
  eventType: string;
  status: string;
  timeRange: 'all' | '15m' | '1h' | 'today';
}

interface EnrichedLog extends WebhookLog {
  durationMs: number;
  author: string;
  ipAddress: string;
  signatureVerified: boolean;
  sizeBytes: number;
  errorReason?: string;
}

export default function WebhookLogs() {
  const { webhookLogs: rawLogs } = useApp();

  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [selectedLog, setSelectedLog] = useState<EnrichedLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'failed' | 'insights'>('all');
  const [chartTimeRange, setChartTimeRange] = useState<ChartTimeRange>('24H');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    provider: 'all',
    eventType: 'all',
    status: 'all',
    timeRange: 'all',
  });
  const [showFilterBar, setShowFilterBar] = useState(false);

  const initialLogs: EnrichedLog[] = useMemo(() => {
    const defaultList: EnrichedLog[] = [
      {
        id: 'wh-1092',
        receivedAt: '09:44:58',
        provider: 'github',
        eventType: 'push',
        repository: 'payment-gateway',
        branch: 'develop',
        commitHash: 'a1b2c3d',
        status: 'SCANNED',
        durationMs: 184,
        author: 'alex-security',
        ipAddress: '140.82.112.4',
        signatureVerified: true,
        sizeBytes: 4096,
        payload: JSON.stringify(
          {
            ref: 'refs/heads/develop',
            before: '611f192b15d2a9d70104886675276e5d263907c0',
            after: 'a1b2c3d4e5f67890123456789abcdef012345678',
            repository: {
              id: 5829104,
              name: 'payment-gateway',
              full_name: 'jq-enterprise/payment-gateway',
              private: true,
            },
            pusher: { name: 'alex-security', email: 'alex@jqube.io' },
            commits: [
              {
                id: 'a1b2c3d',
                message: 'fix(auth): sanitize OAuth callback parameters and enforce HMAC validation',
                timestamp: '2026-07-30T09:44:50Z',
                author: { name: 'Alex Rivera', username: 'alex-security' },
              },
            ],
          },
          null,
          2
        ),
      },
      {
        id: 'wh-1091',
        receivedAt: '09:43:12',
        provider: 'gitlab',
        eventType: 'pull_request',
        repository: 'e-commerce-api',
        branch: 'feat/stripe-v2',
        commitHash: '9f8e7d6',
        status: 'SCANNED',
        durationMs: 210,
        author: 'sarah-dev',
        ipAddress: '35.185.44.20',
        signatureVerified: true,
        sizeBytes: 8192,
        payload: JSON.stringify(
          {
            object_kind: 'merge_request',
            project: { name: 'e-commerce-api', web_url: 'https://gitlab.com/jqube/e-commerce-api' },
            object_attributes: {
              id: 9942,
              title: 'Upgrade Stripe API client to v2026',
              state: 'opened',
              target_branch: 'main',
              source_branch: 'feat/stripe-v2',
            },
          },
          null,
          2
        ),
      },
      {
        id: 'wh-1090',
        receivedAt: '09:40:05',
        provider: 'github',
        eventType: 'workflow',
        repository: 'jqube-dashboard',
        branch: 'main',
        commitHash: '4a5b6c7',
        status: 'PROCESSING',
        durationMs: 142,
        author: 'github-actions[bot]',
        ipAddress: '140.82.113.12',
        signatureVerified: true,
        sizeBytes: 2048,
        payload: JSON.stringify({ workflow: 'security-scan.yml', action: 'completed', status: 'success' }, null, 2),
      },
      {
        id: 'wh-1089',
        receivedAt: '09:38:22',
        provider: 'github',
        eventType: 'push',
        repository: 'user-management',
        branch: 'bugfix/jwt-expiry',
        commitHash: '7c8d9e0',
        status: 'SCANNED',
        durationMs: 165,
        author: 'michael-sec',
        ipAddress: '140.82.114.9',
        signatureVerified: true,
        sizeBytes: 3410,
        payload: JSON.stringify({ ref: 'refs/heads/bugfix/jwt-expiry', repository: { name: 'user-management' } }, null, 2),
      },
      {
        id: 'wh-1088',
        receivedAt: '09:32:40',
        provider: 'github',
        eventType: 'push',
        repository: 'payment-gateway',
        branch: 'main',
        commitHash: '3f2e1d0',
        status: 'FAILED',
        errorReason: 'Signature validation failed: Invalid X-Hub-Signature-256',
        durationMs: 45,
        author: 'unknown-agent',
        ipAddress: '198.51.100.42',
        signatureVerified: false,
        sizeBytes: 1024,
        payload: JSON.stringify({ error: 'HMAC_SHA256_MISMATCH', timestamp: '2026-07-30T09:32:40Z' }, null, 2),
      },
      {
        id: 'wh-1087',
        receivedAt: '09:28:15',
        provider: 'gitlab',
        eventType: 'merge',
        repository: 'e-commerce-api',
        branch: 'main',
        commitHash: '1b2c3d4',
        status: 'SCANNED',
        durationMs: 198,
        author: 'devops-bot',
        ipAddress: '35.185.44.22',
        signatureVerified: true,
        sizeBytes: 5120,
        payload: JSON.stringify({ event: 'merge_request_merged', target: 'main' }, null, 2),
      },
      {
        id: 'wh-1086',
        receivedAt: '09:21:03',
        provider: 'github',
        eventType: 'release',
        repository: 'jqube-dashboard',
        branch: 'v2.4.0',
        commitHash: 'e9f8a7b',
        status: 'SCANNED',
        durationMs: 230,
        author: 'release-bot',
        ipAddress: '140.82.112.9',
        signatureVerified: true,
        sizeBytes: 6144,
        payload: JSON.stringify({ release: { tag_name: 'v2.4.0', name: 'Security Patch v2.4.0' } }, null, 2),
      },
      {
        id: 'wh-1085',
        receivedAt: '09:15:44',
        provider: 'github',
        eventType: 'delete',
        repository: 'user-management',
        branch: 'temp-fix',
        commitHash: '8b7a6c5',
        status: 'SCANNED',
        durationMs: 120,
        author: 'admin-lead',
        ipAddress: '140.82.115.3',
        signatureVerified: true,
        sizeBytes: 1536,
        payload: JSON.stringify({ ref: 'refs/heads/temp-fix', ref_type: 'branch', deleted: true }, null, 2),
      },
    ];

    if (!rawLogs || rawLogs.length === 0) return defaultList;

    return rawLogs.map((log, index) => ({
      ...log,
      durationMs: 150 + (index * 17) % 90,
      author: 'git-developer',
      ipAddress: log.provider === 'github' ? '140.82.112.4' : '35.185.44.20',
      signatureVerified: log.status !== 'FAILED',
      sizeBytes: 3000 + (index * 420) % 5000,
      errorReason: log.status === 'FAILED' ? 'Webhook HMAC signature validation failed' : undefined,
    }));
  }, [rawLogs]);

  const [logs, setLogs] = useState<EnrichedLog[]>(initialLogs);

  useEffect(() => {
    if (!isLiveSimulating) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const providers: GitProvider[] = ['github', 'gitlab'];
      const events = ['push', 'pull_request', 'workflow', 'merge'];
      const repos = ['payment-gateway', 'e-commerce-api', 'jqube-dashboard', 'user-management'];
      const branches = ['main', 'develop', 'feat/security-fix', 'patch-v1'];

      const randomProvider = providers[Math.floor(Math.random() * providers.length)];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const randomRepo = repos[Math.floor(Math.random() * repos.length)];
      const randomBranch = branches[Math.floor(Math.random() * branches.length)];
      const randomHash = Math.random().toString(36).substring(2, 9);
      const newId = `wh-${Math.floor(1000 + Math.random() * 9000)}`;

      const newLog: EnrichedLog = {
        id: newId,
        receivedAt: timeStr,
        provider: randomProvider,
        eventType: randomEvent,
        repository: randomRepo,
        branch: randomBranch,
        commitHash: randomHash,
        status: 'SCANNED',
        durationMs: Math.floor(140 + Math.random() * 80),
        author: 'dev-sec-bot',
        ipAddress: randomProvider === 'github' ? '140.82.112.8' : '35.185.44.29',
        signatureVerified: true,
        sizeBytes: Math.floor(2000 + Math.random() * 4000),
        payload: JSON.stringify(
          {
            event: randomEvent,
            repository: randomRepo,
            ref: `refs/heads/${randomBranch}`,
            commit: randomHash,
            timestamp: now.toISOString(),
            status: 'scanned_and_verified',
          },
          null,
          2
        ),
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      setHighlightedRowId(newId);

      setTimeout(() => {
        setHighlightedRowId(null);
      }, 2000);
    }, 12000);

    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('webhook-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchSearch =
          log.repository.toLowerCase().includes(query) ||
          log.commitHash.toLowerCase().includes(query) ||
          log.eventType.toLowerCase().includes(query) ||
          log.branch.toLowerCase().includes(query) ||
          log.author.toLowerCase().includes(query) ||
          log.id.toLowerCase().includes(query);

        if (!matchSearch) return false;
      }

      if (filters.provider !== 'all' && log.provider !== filters.provider) return false;
      if (filters.eventType !== 'all' && log.eventType.toLowerCase() !== filters.eventType.toLowerCase()) return false;
      if (filters.status !== 'all' && log.status.toLowerCase() !== filters.status.toLowerCase()) return false;

      return true;
    });
  }, [logs, filters]);

  const failedLogs = useMemo(() => logs.filter((l) => l.status === 'FAILED'), [logs]);

  const chartData = useMemo(() => {
    return [
      { time: '00:00', events: 45, success: 44, failed: 1 },
      { time: '04:00', events: 28, success: 28, failed: 0 },
      { time: '08:00', events: 142, success: 140, failed: 2 },
      { time: '12:00', events: 310, success: 304, failed: 6 },
      { time: '16:00', events: 480, success: 475, failed: 5 },
      { time: '20:00', events: 279, success: 276, failed: 3 },
    ];
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleManualRefresh = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Syncing real-time webhook endpoints...',
        success: 'Webhook logs synced successfully!',
        error: 'Failed to refresh webhook logs',
      }
    );
  };

  const handleExport = (format: 'JSON' | 'CSV') => {
    const content = format === 'JSON' ? JSON.stringify(logs, null, 2) : 'id,receivedAt,provider,eventType,repository,status\n' + logs.map(l => `${l.id},${l.receivedAt},${l.provider},${l.eventType},${l.repository},${l.status}`).join('\n');
    const blob = new Blob([content], { type: format === 'JSON' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jqube-webhook-logs-${Date.now()}.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Exported ${logs.length} webhook logs as ${format}`);
  };

  const handleOpenDrawer = (log: EnrichedLog) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
    setOpenDropdownId(null);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      provider: 'all',
      eventType: 'all',
      status: 'all',
      timeRange: 'all',
    });
    toast.info('Filters cleared');
  };

  const renderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'SCANNED' || s === 'SUCCESS' || s === 'SUCCESSFUL') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Scanned
        </span>
      );
    }
    if (s === 'SCANNING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          <RotateCcw className="w-3 h-3 animate-spin text-amber-400" />
          Scanning...
        </span>
      );
    }
    if (s === 'FAILED' || s === 'ERROR') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Failed
        </span>
      );
    }
    if (s === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Pending
      </span>
    );
  };

  const renderEventTypeBadge = (type: string) => {
    const t = type.toLowerCase();
    let style = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
    if (t === 'push') style = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
    else if (t === 'pull_request') style = 'bg-blue-950/60 text-blue-300 border-blue-800/40';
    else if (t === 'merge') style = 'bg-purple-950/60 text-purple-300 border-purple-800/40';
    else if (t === 'release') style = 'bg-amber-950/60 text-amber-300 border-amber-800/40';
    else if (t === 'delete') style = 'bg-red-950/60 text-red-400 border-red-800/50';
    else if (t === 'workflow') style = 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${style}`}>
        {t}
      </span>
    );
  };

  const renderProviderBadge = (provider: GitProvider) => {
    if (provider === 'github') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-[#181D26] text-white border border-[#FF3B3B]/20 shadow-[0_0_12px_rgba(255,45,45,0.08)]">
          <GitHubIcon className="w-3.5 h-3.5 text-[#FF2D2D]" />
          GITHUB
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase bg-[#1B1417] text-orange-400 border border-orange-500/25">
        <GitLabIcon className="w-3.5 h-3.5 text-orange-400" />
        GITLAB
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100 font-sans min-h-screen">
      {/* 2. PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0D1017] p-5 rounded-2xl border border-white/[0.07] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E11D2E]/20 to-red-900/10 border border-[#E11D2E]/30 text-[#FF2D2D] shadow-[0_0_15px_rgba(225,29,46,0.25)]">
              <Webhook className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                  Webhook Event Logs
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Monitor, investigate and analyze incoming GitHub and GitLab webhook events in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsLiveSimulating(!isLiveSimulating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-2 ${isLiveSimulating
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
              }`}
          >
            {isLiveSimulating ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>Auto Refresh</span>
            <span className={`w-2 h-2 rounded-full ${isLiveSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          </button>

          <button
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-2 ${showFilterBar || filters.provider !== 'all' || filters.eventType !== 'all' || filters.status !== 'all'
                ? 'bg-[#E11D2E]/15 text-[#FF2D2D] border-[#E11D2E]/30'
                : 'bg-[#151922] text-slate-300 border-white/[0.08] hover:border-white/20 hover:text-white'
              }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => handleExport('JSON')}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#151922] text-slate-300 border border-white/[0.08] hover:border-white/20 hover:text-white transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={handleManualRefresh}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#E11D2E] text-white border border-red-500/50 hover:bg-[#FF2D2D] transition-all shadow-[0_0_15px_rgba(225,29,46,0.3)] flex items-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 3. TOP SECURITY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#12161D] border border-white/[0.07] hover:border-[#FF2D2D]/30 transition-all shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Events Today</span>
            <Activity className="w-4 h-4 text-[#FF2D2D]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-white">1,284</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 12.4%
            </span>
          </div>
          <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-[#FF2D2D] w-[75%]" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12161D] border border-white/[0.07] hover:border-emerald-500/30 transition-all shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-white">98.7%</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +1.2%
            </span>
          </div>
          <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[98.7%]" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12161D] border border-white/[0.07] hover:border-red-500/30 transition-all shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Failed Events</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-white">17</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> 8.4%
            </span>
          </div>
          <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-[15%]" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12161D] border border-white/[0.07] hover:border-blue-500/30 transition-all shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Avg Response</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-white">184 ms</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> 14 ms
            </span>
          </div>
          <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[45%]" />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-xl bg-[#12161D] border border-white/[0.07] hover:border-[#FF2D2D]/30 transition-all shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">Active Listeners</span>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-mono text-white">2</span>
            <span className="text-[10px] font-mono text-slate-400">GitHub + GitLab</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold rounded">
              Healthy
            </span>
            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-mono font-bold rounded">
              SSL Verified
            </span>
          </div>
        </div>
      </div>

      {/* 4. WEBHOOK LISTENER CARD */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#12161D] via-[#151A23] to-[#12161D] border border-[#FF2D2D]/20 shadow-[0_0_25px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono font-extrabold tracking-wider text-emerald-400 uppercase">
                  ● WEBHOOK LISTENER ACTIVE
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  HEALTHY
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <GitHubIcon className="w-3.5 h-3.5 text-slate-400" />
                  <code className="font-mono text-[11px] text-slate-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                    /api/webhooks/github
                  </code>
                </span>
                <span className="flex items-center gap-1.5">
                  <GitLabIcon className="w-3.5 h-3.5 text-orange-400" />
                  <code className="font-mono text-[11px] text-slate-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                    /api/webhooks/gitlab
                  </code>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t lg:border-t-0 border-white/[0.07] pt-3 lg:pt-0">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Last Event</span>
                <span className="font-bold text-white">8 seconds ago</span>
              </div>
              <div className="h-7 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Events/sec</span>
                <span className="font-bold text-emerald-400">3.2</span>
              </div>
              <div className="h-7 w-px bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Response</span>
                <span className="font-bold text-blue-400">184ms</span>
              </div>
            </div>

            <div className="flex items-center gap-1 h-6">
              {[40, 70, 30, 90, 50, 80, 45, 95, 60, 30, 85].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-[#FF2D2D] rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDuration: `${0.6 + (i % 5) * 0.2}s`,
                  }}
                />
              ))}
            </div>

            <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-extrabold rounded-xl border border-emerald-500/30 flex items-center gap-2 shadow-[0_0_12px_rgba(34,197,94,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LISTENING
            </span>
          </div>
        </div>
      </div>

      {/* 14. EVENT STATISTICS & PROVIDER HEALTH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12161D] border border-white/[0.07] shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-extrabold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF2D2D]" /> Event Activity Stream
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time volume metrics of processed vs failed payloads
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#090C12] p-1 rounded-lg border border-white/5 self-start">
              {(['1H', '6H', '24H', '7D'] as ChartTimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setChartTimeRange(range)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded ${chartTimeRange === range
                      ? 'bg-[#E11D2E] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF2D2D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF2D2D" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1017',
                    borderColor: 'rgba(255,45,45,0.2)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area type="monotone" dataKey="events" stroke="#FF2D2D" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                <Area type="monotone" dataKey="success" stroke="#22C55E" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSuccess)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-white/[0.05] text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D2D]" /> Total Events
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Successful
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Failed
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/[0.07] shadow-xl">
            <h3 className="text-xs font-extrabold font-mono text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" /> Provider Health Status
            </h3>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <GitHubIcon className="w-4 h-4 text-white" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">GitHub</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">824 events today</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-emerald-400 block font-bold">● Connected</span>
                  <span className="text-[10px] text-slate-400">172ms response</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <GitLabIcon className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">GitLab</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">460 events today</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-emerald-400 block font-bold">● Connected</span>
                  <span className="text-[10px] text-slate-400">194ms response</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12161D] border border-white/[0.07] shadow-xl">
            <h3 className="text-xs font-extrabold font-mono text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#FF2D2D]" /> Top Active Repositories
            </h3>
            <div className="space-y-2 text-xs font-mono">
              {[
                { name: 'payment-gateway', count: 342, pct: 85 },
                { name: 'e-commerce-api', count: 284, pct: 70 },
                { name: 'jqube-dashboard', count: 192, pct: 48 },
                { name: 'user-management', count: 154, pct: 38 },
              ].map((repo) => (
                <div key={repo.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 truncate">{repo.name}</span>
                    <span className="text-slate-400 font-bold">{repo.count} ev</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-[#FF2D2D] rounded-full"
                      style={{ width: `${repo.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 12. FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-[#12161D] border border-white/[0.07] shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="webhook-search-input"
              type="text"
              placeholder="Search events, repositories, commits..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-14 py-2 rounded-xl bg-[#090C12] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2D2D] focus:ring-1 focus:ring-[#FF2D2D] transition-all font-mono"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center gap-1.5 bg-[#090C12] p-1 rounded-xl border border-white/5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${activeTab === 'all' ? 'bg-[#E11D2E] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
            >
              All Events ({filteredLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('failed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${activeTab === 'failed' ? 'bg-red-900/60 text-red-200 border border-red-500/40' : 'text-slate-400 hover:text-white'
                }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Failed ({failedLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${activeTab === 'insights' ? 'bg-blue-900/60 text-blue-200 border border-blue-500/40' : 'text-slate-400 hover:text-white'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Insights
            </button>
          </div>
        </div>

        {(showFilterBar || filters.provider !== 'all' || filters.eventType !== 'all' || filters.status !== 'all') && (
          <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Provider</label>
              <select
                value={filters.provider}
                onChange={(e) => setFilters((prev) => ({ ...prev, provider: e.target.value as any }))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#090C12] border border-white/10 text-slate-200 focus:outline-none focus:border-[#FF2D2D]"
              >
                <option value="all">All Providers</option>
                <option value="github">GitHub</option>
                <option value="gitlab">GitLab</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters((prev) => ({ ...prev, eventType: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#090C12] border border-white/10 text-slate-200 focus:outline-none focus:border-[#FF2D2D]"
              >
                <option value="all">All Event Types</option>
                <option value="push">Push</option>
                <option value="pull_request">Pull Request</option>
                <option value="merge">Merge</option>
                <option value="release">Release</option>
                <option value="delete">Delete</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#090C12] border border-white/10 text-slate-200 focus:outline-none focus:border-[#FF2D2D]"
              >
                <option value="all">All Statuses</option>
                <option value="scanned">Scanned</option>
                <option value="scanning">Scanning</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 font-bold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECURITY INSIGHTS TAB VIEW */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#12161D] border border-emerald-500/30 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="text-xs font-mono font-bold uppercase">Signatures Verified</h4>
            </div>
            <p className="text-xs text-slate-300">
              100% of active GitHub HMAC signatures matched secrets configured in your vault.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#12161D] border border-emerald-500/30 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-xs font-mono font-bold uppercase">High Delivery Rate</h4>
            </div>
            <p className="text-xs text-slate-300">
              98.7% events processed without retry or timeout over the last 24-hour cycle.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#12161D] border border-amber-500/30 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-xs font-mono font-bold uppercase">Activity Spike</h4>
            </div>
            <p className="text-xs text-slate-300">
              3 repositories generated +42% higher event volume during current sprint deployment window.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#12161D] border border-blue-500/30 shadow-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Zap className="w-5 h-5" />
              <h4 className="text-xs font-mono font-bold uppercase">Fast Response</h4>
            </div>
            <p className="text-xs text-slate-300">
              Mean execution latency is 184ms, comfortably below the 500ms security SLA threshold.
            </p>
          </div>
        </div>
      )}

      {/* 5 & 6. LIVE EVENT STREAM & TABLE */}
      {activeTab !== 'insights' && (
        <div className="p-5 rounded-2xl bg-[#12161D] border border-white/[0.07] shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                  LIVE EVENT STREAM
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">
                  12 events received in last minute
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Showing {filteredLogs.length} events</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                  <Webhook className="w-8 h-8 text-slate-400" />
                </div>
                <div className="max-w-sm mx-auto space-y-1">
                  <h3 className="text-sm font-bold text-white font-mono">No webhook events found</h3>
                  <p className="text-xs text-slate-400">
                    Connect GitHub or GitLab to start receiving real-time security events.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-[#E11D2E] text-white text-xs font-mono font-bold rounded-xl hover:bg-[#FF2D2D] transition-all"
                >
                  Configure Webhooks
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-3 font-bold">Time</th>
                    <th className="pb-3 px-3 font-bold">Provider</th>
                    <th className="pb-3 px-3 font-bold">Event</th>
                    <th className="pb-3 px-3 font-bold">Repository</th>
                    <th className="pb-3 px-3 font-bold">Branch / Commit</th>
                    <th className="pb-3 px-3 font-bold">Status</th>
                    <th className="pb-3 px-3 font-bold">Duration</th>
                    <th className="pb-3 pl-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  <AnimatePresence>
                    {filteredLogs.map((log) => {
                      const isHighlighted = highlightedRowId === log.id;
                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`group transition-colors ${isHighlighted
                              ? 'bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent'
                              : 'hover:bg-white/[0.03]'
                            }`}
                        >
                          <td className="py-3.5 pr-3 text-slate-400 font-mono text-[11px]">
                            {log.receivedAt}
                          </td>

                          <td className="py-3.5 px-3">{renderProviderBadge(log.provider)}</td>

                          <td className="py-3.5 px-3">{renderEventTypeBadge(log.eventType)}</td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 text-white font-semibold">
                              <FolderGit2 className="w-3.5 h-3.5 text-[#FF2D2D] shrink-0" />
                              <span className="truncate max-w-[140px]">{log.repository}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-400">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[11px] text-slate-300">
                                <GitBranch className="w-3 h-3 text-slate-500" />
                                {log.branch}
                              </span>
                              <span className="text-slate-600">|</span>
                              <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                <GitCommit className="w-3 h-3 text-slate-500" />
                                {log.commitHash}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">{renderStatusBadge(log.status)}</td>

                          <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                            {log.durationMs}ms
                          </td>

                          <td className="py-3.5 pl-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenDrawer(log)}
                                className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#0B0E14] text-slate-300 border border-[#FF2D2D]/30 hover:border-[#FF2D2D] hover:text-white hover:shadow-[0_0_12px_rgba(255,45,45,0.25)] transition-all flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#FF2D2D]" />
                                Payload
                              </button>

                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdownId(openDropdownId === log.id ? null : log.id)}
                                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {openDropdownId === log.id && (
                                  <div className="absolute right-0 top-full mt-1 w-44 bg-[#0D1017] border border-white/10 rounded-xl shadow-2xl z-40 p-1 font-mono text-xs text-left">
                                    <button
                                      onClick={() => handleOpenDrawer(log)}
                                      className="w-full px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-200 flex items-center gap-2"
                                    >
                                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                                      View Details
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleCopy(log.commitHash, 'Commit Hash');
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-200 flex items-center gap-2"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                                      Copy Commit
                                    </button>
                                    <button
                                      onClick={() => {
                                        toast.info(`Resending webhook payload for ${log.id}...`);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-200 flex items-center gap-2"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                      Retry Delivery
                                    </button>
                                    <a
                                      href={`https://github.com/jq-enterprise/${log.repository}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => setOpenDropdownId(null)}
                                      className="w-full px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-200 flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                                      Open Repo
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 18. FAILED WEBHOOK ERROR MONITORING PANEL */}
      {failedLogs.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#171113] border border-red-500/30 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider">
                FAILED WEBHOOK DELIVERIES MONITORING ({failedLogs.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Requires SOC Attention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {failedLogs.map((fail) => (
              <div
                key={fail.id}
                className="p-3.5 rounded-xl bg-[#0F0B0C] border border-red-500/20 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{fail.repository}</span>
                    <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      {fail.eventType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{fail.errorReason}</p>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Time: {fail.receivedAt}</span>
                </div>
                <button
                  onClick={() => {
                    toast.success(`Retry triggered for ${fail.id}`);
                  }}
                  className="px-3 py-1 bg-red-950/80 text-red-200 hover:bg-red-900 border border-red-700/50 rounded-lg text-xs font-bold transition-all shrink-0 ml-3"
                >
                  Investigate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. EVENT DETAILS RIGHT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && selectedLog && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-2xl bg-[#0D1017] border-l border-[#FF2D2D]/30 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E11D2E]/20 to-red-950/30 border border-[#E11D2E]/40 text-[#FF2D2D]">
                      <Webhook className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold font-mono text-white">
                        EVENT DETAILS ({selectedLog.id})
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        {renderProviderBadge(selectedLog.provider)}
                        {renderEventTypeBadge(selectedLog.eventType)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#12161D] border border-white/10 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Repository</span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#FF2D2D]" />
                      {selectedLog.repository}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Timestamp</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedLog.receivedAt}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                    <div className="mt-0.5">{renderStatusBadge(selectedLog.status)}</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Branch</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedLog.branch}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Commit</span>
                    <span className="font-mono text-slate-300 mt-0.5 block">{selectedLog.commitHash}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Duration</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedLog.durationMs}ms</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Author</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{selectedLog.author}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">IP Address</span>
                    <span className="font-mono text-slate-300 mt-0.5 block">{selectedLog.ipAddress}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Signature HMAC</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${selectedLog.signatureVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedLog.signatureVerified ? '✓ VERIFIED' : '✗ FAILED'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#FF2D2D]" /> PAYLOAD BODY
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(selectedLog.payload, 'Payload JSON')}
                        className="px-2.5 py-1 text-[11px] font-mono bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 transition-all flex items-center gap-1.5"
                      >
                        <Copy className="w-3 h-3 text-[#FF2D2D]" />
                        {copiedField === 'Payload JSON' ? 'Copied!' : 'Copy JSON'}
                      </button>
                      <button
                        onClick={() => setIsPayloadExpanded(!isPayloadExpanded)}
                        className="px-2.5 py-1 text-[11px] font-mono bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 transition-all flex items-center gap-1.5"
                      >
                        <Maximize2 className="w-3 h-3" />
                        {isPayloadExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <pre
                      className={`p-4 rounded-xl bg-[#080B10] border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto ${isPayloadExpanded ? 'max-h-[600px]' : 'max-h-[320px]'
                        }`}
                    >
                      <code>{selectedLog.payload}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success(`Retrying webhook ${selectedLog.id}...`)}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold"
                  >
                    Retry Event
                  </button>
                  <a
                    href={`https://github.com/jq-enterprise/${selectedLog.repository}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#E11D2E] text-white hover:bg-[#FF2D2D] font-bold shadow-[0_0_15px_rgba(225,29,46,0.3)]"
                  >
                    Open Repository
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}