// JQube — Repositories Page — Premium Enterprise Redesign

import { useState, useMemo } from 'react';
import { useApp } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import ScanTerminal from '@/components/common/scan-terminal';
import {
  Search,
  Filter,
  RefreshCw,
  Zap,
  FolderGit2,
  GitBranch,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Info,
  CheckCircle2,
  Activity,
  BarChart3,
  Globe,
  Lock,
  Layers,
  ChevronDown,
  LayoutGrid,
  List,
  Terminal,
  Sparkles,
} from 'lucide-react';
import type { Repository } from '@/types';

// ─── Reusable Status Config ───────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  Active:   { label: 'Active',    dot: 'bg-emerald-400',              badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
  Safe:     { label: 'Safe',      dot: 'bg-blue-400',                 badge: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
  Scanning: { label: 'Scanning',  dot: 'bg-[#FF3B3B] animate-ping',  badge: 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/25 animate-pulse' },
  Critical: { label: 'Critical',  dot: 'bg-red-400 animate-pulse',   badge: 'bg-red-500/10 text-red-400 border-red-500/25' },
  Inactive: { label: 'Inactive',  dot: 'bg-zinc-500',                badge: 'bg-zinc-800/60 text-zinc-500 border-zinc-700/40' },
};

// ─── Language color dots ─────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3776AB',
  Java: '#007396', Go: '#00ADD8', Rust: '#DEA584', Ruby: '#CC342D',
  PHP: '#777BB4', 'C#': '#239120', 'C++': '#00599C',
};

// ─── Stat Card ───────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="group relative"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#181C24]/80 backdrop-blur-md p-4
                   hover:border-[#FF3B3B]/25 hover:shadow-[0_0_30px_rgba(255,59,59,0.08)] transition-all duration-300 cursor-default"
      >
        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B3B]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2 rounded-xl border ${accent ?? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/20 text-[#FF3B3B]'}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-[#52525B] uppercase tracking-widest pt-0.5">
            {label}
          </span>
        </div>

        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
        {sub && (
          <p className="text-[10px] text-[#71717A] mt-1 font-medium">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Vulnerability Chip ───────────────────────────────────────────────────
function VulnChip({
  label,
  count,
  icon: Icon,
  chipClass,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  chipClass: string;
}) {
  return (
    <div
      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:scale-[1.04] cursor-default select-none ${chipClass}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{count}</span>
      <span className="opacity-60">{label}</span>
    </div>
  );
}

// ─── Repository Card ────────────────────────────────────────────────────
function RepoCard({
  repo,
  index,
  onScan,
  view,
}: {
  repo: Repository;
  index: number;
  onScan: (repo: Repository) => void;
  view: 'grid' | 'list';
}) {
  const status = STATUS_CONFIG[repo.status] ?? STATUS_CONFIG.Inactive;
  const langColor = LANG_COLORS[repo.language] ?? '#A1A1AA';
  const totalVulns =
    repo.vulnerabilities.critical +
    repo.vulnerabilities.high +
    repo.vulnerabilities.medium +
    repo.vulnerabilities.low;

  const isGrid = view === 'grid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.38, ease: 'easeOut' }}
      className="group"
    >
      <div
        className={`relative overflow-hidden rounded-[18px] border border-white/[0.07] bg-[#181C24]/90 backdrop-blur-md
                   hover:border-[#FF3B3B]/30 hover:shadow-[0_2px_32px_rgba(255,59,59,0.18),0_0_0_1px_rgba(255,59,59,0.1)]
                   transition-all duration-300
                   ${isGrid ? 'flex flex-col h-full p-5' : 'flex flex-row items-center gap-5 px-5 py-4'}`}
      >
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#FF3B3B]/[0.04] via-transparent to-transparent" />

        {/* ── Icon + Name row ── */}
        <div className={`flex items-center gap-3 ${isGrid ? 'mb-3' : 'shrink-0 w-56'}`}>
          <div className="relative shrink-0">
            <div className="p-2.5 bg-[#FF3B3B]/10 rounded-xl border border-[#FF3B3B]/20 text-[#FF3B3B] group-hover:bg-[#FF3B3B]/15 transition-colors">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white tracking-wide truncate leading-tight">
              {repo.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <GitBranch className="w-2.5 h-2.5 text-[#52525B]" />
              <span className="text-[10px] text-[#71717A] font-mono">{repo.branch}</span>
            </div>
          </div>
        </div>

        {/* ── URL ── */}
        {isGrid ? (
          <p className="text-[10.5px] text-[#52525B] font-mono truncate mb-4 group-hover:text-[#71717A] transition-colors">
            {repo.url}
          </p>
        ) : (
          <p className="hidden lg:block text-[10.5px] text-[#52525B] font-mono truncate flex-1 group-hover:text-[#71717A] transition-colors">
            {repo.url}
          </p>
        )}

        {/* ── Badges row ── */}
        <div className={`flex items-center gap-2 flex-wrap ${isGrid ? 'mb-4' : 'shrink-0'}`}>
          {/* Status */}
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${status.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>

          {/* Language */}
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-[9px] font-bold uppercase tracking-wider"
            style={{ color: langColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: langColor }} />
            {repo.language}
          </span>
        </div>

        {/* ── Vulnerability Chips ── */}
        <div className={`flex items-center gap-1.5 flex-wrap ${isGrid ? 'mb-5' : 'shrink-0'}`}>
          <VulnChip
            label="Crit"
            count={repo.vulnerabilities.critical}
            icon={ShieldX}
            chipClass="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
          />
          <VulnChip
            label="High"
            count={repo.vulnerabilities.high}
            icon={AlertTriangle}
            chipClass="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/15"
          />
          <VulnChip
            label="Med"
            count={repo.vulnerabilities.medium}
            icon={ShieldAlert}
            chipClass="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15"
          />
          <VulnChip
            label="Low"
            count={repo.vulnerabilities.low}
            icon={Info}
            chipClass="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/15"
          />
        </div>

        {/* ── Footer: total + scan button ── */}
        <div className={`flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06] ${isGrid ? 'mt-auto' : 'shrink-0'}`}>
          <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] font-mono">
            <Shield className="w-3 h-3" />
            <span>
              <strong className={`${totalVulns > 0 ? 'text-[#A1A1AA]' : 'text-emerald-400'}`}>
                {totalVulns}
              </strong>
              {' '}issue{totalVulns !== 1 ? 's' : ''}
            </span>
          </div>

          <button
            onClick={() => onScan(repo)}
            disabled={repo.status === 'Scanning'}
            className={`group/btn relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 overflow-hidden
              ${repo.status === 'Scanning'
                ? 'bg-[#FF3B3B]/5 text-[#FF3B3B]/50 border border-[#FF3B3B]/15 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000] hover:brightness-110 text-white shadow-lg shadow-[#FF3B3B]/20 hover:shadow-[#FF3B3B]/35 hover:-translate-y-px active:translate-y-0 cursor-pointer'
              }`}
          >
            {repo.status === 'Scanning' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Scanning…</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Run Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Repositories() {
  const { repositories, triggerScan } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeRepoName, setActiveRepoName] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const languages = useMemo(
    () => ['All', ...Array.from(new Set(repositories.map((r) => r.language)))],
    [repositories],
  );
  const statuses = ['All', 'Active', 'Safe', 'Critical', 'Scanning', 'Inactive'];

  const filteredRepos = useMemo(
    () =>
      repositories.filter((repo) => {
        const q = searchTerm.toLowerCase();
        const matchSearch = repo.name.toLowerCase().includes(q) || repo.url.toLowerCase().includes(q);
        const matchLang = langFilter === 'All' || repo.language === langFilter;
        const matchStatus = statusFilter === 'All' || repo.status === statusFilter;
        return matchSearch && matchLang && matchStatus;
      }),
    [repositories, searchTerm, langFilter, statusFilter],
  );

  const handleScanClick = (repo: Repository) => {
    setActiveRepoName(repo.name);
    setTerminalOpen(true);
    triggerScan(repo.id);
  };

  // ── Derived stats ──
  const totalVulns = repositories.reduce(
    (acc, r) =>
      acc + r.vulnerabilities.critical + r.vulnerabilities.high + r.vulnerabilities.medium + r.vulnerabilities.low,
    0,
  );
  const criticalCount = repositories.filter((r) => r.status === 'Critical').length;
  const scanningCount = repositories.filter((r) => r.status === 'Scanning').length;
  const healthyCount = repositories.filter((r) => r.status === 'Active' || r.status === 'Safe').length;
  const healthScore = repositories.length
    ? Math.round(((repositories.length - criticalCount) / repositories.length) * 100)
    : 100;

  return (
    <div className="space-y-8">
      <ScanTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        repoName={activeRepoName}
      />

      {/* ══════════════════════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-[#FF3B3B]/20 to-red-900/10 border border-[#FF3B3B]/30 text-[10px] font-black uppercase tracking-widest text-[#FF3B3B] mb-3">
            <Terminal className="w-3 h-3" />
            <span className="text-white/70">Security Platform</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white leading-none flex items-center gap-3">
            <div className="p-2.5 bg-[#FF3B3B]/10 rounded-xl border border-[#FF3B3B]/20 text-[#FF3B3B]">
              <FolderGit2 className="w-6 h-6" />
            </div>
            Repositories
          </h1>
          <p className="text-xs text-[#71717A] mt-2 font-medium max-w-sm">
            {repositories.length} connected codebases · Continuous vulnerability scanning enabled
          </p>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#52525B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search repositories…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-52 pl-9 pr-4 py-2 rounded-xl bg-[#181C24]/80 border border-white/[0.07] text-xs text-white placeholder-[#52525B]
                         focus:outline-none focus:border-[#FF3B3B]/40 focus:ring-1 focus:ring-[#FF3B3B]/20 transition-all backdrop-blur-md"
            />
          </div>

          {/* Language filter */}
          <div className="relative flex items-center">
            <Filter className="w-3 h-3 text-[#52525B] absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-[#52525B] absolute right-2.5 pointer-events-none" />
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="pl-8 pr-8 py-2 rounded-xl bg-[#181C24]/80 border border-white/[0.07] text-xs text-white appearance-none cursor-pointer
                         focus:outline-none focus:border-[#FF3B3B]/40 transition-all backdrop-blur-md"
            >
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative flex items-center">
            <Activity className="w-3 h-3 text-[#52525B] absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-[#52525B] absolute right-2.5 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-2 rounded-xl bg-[#181C24]/80 border border-white/[0.07] text-xs text-white appearance-none cursor-pointer
                         focus:outline-none focus:border-[#FF3B3B]/40 transition-all backdrop-blur-md"
            >
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-[#181C24]/80 border border-white/[0.07] rounded-xl p-0.5 backdrop-blur-md">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition-all ${view === 'grid' ? 'bg-[#FF3B3B]/15 text-[#FF3B3B]' : 'text-[#52525B] hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-[#FF3B3B]/15 text-[#FF3B3B]' : 'text-[#52525B] hover:text-white'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scan All */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000]
                            hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all duration-200
                            shadow-lg shadow-[#FF3B3B]/25 hover:shadow-[#FF3B3B]/40 hover:-translate-y-px active:translate-y-0">
            <Sparkles className="w-3.5 h-3.5" />
            Scan All
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          STAT CARDS
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={Layers}
          label="Total Repos"
          value={repositories.length}
          sub="Connected"
          delay={0}
        />
        <StatCard
          icon={ShieldCheck}
          label="Healthy"
          value={healthyCount}
          sub="Active & Safe"
          accent="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          delay={0.05}
        />
        <StatCard
          icon={Activity}
          label="Scanning"
          value={scanningCount}
          sub="In progress"
          accent="bg-[#FF3B3B]/10 border-[#FF3B3B]/20 text-[#FF3B3B]"
          delay={0.1}
        />
        <StatCard
          icon={ShieldX}
          label="Critical"
          value={criticalCount}
          sub="Need attention"
          accent="bg-red-500/10 border-red-500/20 text-red-400"
          delay={0.15}
        />
        <StatCard
          icon={BarChart3}
          label="Vulnerabilities"
          value={totalVulns}
          sub="Across all repos"
          accent="bg-orange-500/10 border-orange-500/20 text-orange-400"
          delay={0.2}
        />
        <StatCard
          icon={Globe}
          label="Health Score"
          value={`${healthScore}%`}
          sub="Security rating"
          accent="bg-blue-500/10 border-blue-500/20 text-blue-400"
          delay={0.25}
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          REPO GRID / LIST
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {filteredRepos.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#181C24]/80 backdrop-blur-md py-20 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B3B]/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="inline-flex p-4 bg-[#FF3B3B]/10 rounded-2xl border border-[#FF3B3B]/20 mb-5 text-[#FF3B3B]">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-white">No repositories found</h3>
            <p className="text-xs text-[#71717A] mt-2 font-medium">
              Try adjusting your search query, language, or status filter.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              view === 'grid'
                ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-3'
            }
          >
            {filteredRepos.map((repo, i) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                index={i}
                onScan={handleScanClick}
                view={view}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          FOOTER INFO BAR
      ══════════════════════════════════════════════════════ */}
      {filteredRepos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#52525B] pt-4 border-t border-white/[0.05] font-medium gap-2"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#FF3B3B]" />
            Showing {filteredRepos.length} of {repositories.length} repositor{repositories.length === 1 ? 'y' : 'ies'}
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#FF3B3B]" />
            AI-powered vulnerability scanning · JQube DevSecOps Platform
          </span>
        </motion.div>
      )}
    </div>
  );
}
