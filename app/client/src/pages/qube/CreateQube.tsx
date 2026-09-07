// JQube — Create Qube Page
// Multi-step flow: GitHub connected check → repository browser → import → success

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackagePlus,
  Search,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Star,
  GitFork,
  GitBranch,
  Calendar,
  ChevronRight,
  Package,
  Terminal,
  ExternalLink,
  Inbox,
  Clock,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { FaGithub } from 'react-icons/fa';
import { useApp } from '@/hooks/useApp';
import { qubeService } from '@/services/qube-service';
import type { GithubRepo } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'select' | 'importing' | 'success';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Java: '#007396',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Ruby: '#CC342D',
  PHP: '#777BB4',
  'C#': '#239120',
  'C++': '#00599C',
  HCL: '#6B3FA0',
  Shell: '#89E051',
};

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Repo Card ────────────────────────────────────────────────────────────────
interface RepoCardProps {
  repo: GithubRepo;
  onImport: (repo: GithubRepo) => void;
  importing: boolean;
}

function RepoCard({ repo, onImport, importing }: RepoCardProps) {
  const langColor = LANG_COLORS[repo.language ?? ''] ?? '#71717A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#181C24]/80 backdrop-blur-md p-4
                 hover:border-[#FF3B3B]/30 hover:shadow-[0_0_24px_rgba(255,59,59,0.08)] transition-all duration-300"
    >
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF3B3B]/5 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-3">
        {/* Left: repo info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 shrink-0 mt-0.5">
            <FaGithub className="w-4 h-4 text-[#FF3B3B]" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Name + visibility */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white truncate">{repo.name}</h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${repo.visibility === 'private'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  }`}
              >
                {repo.visibility === 'private' ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : (
                  <Globe className="w-2.5 h-2.5" />
                )}
                {repo.visibility === 'private' ? 'Private' : 'Public'}
              </span>
            </div>

            {/* Owner */}
            <p className="text-[11px] text-[#71717A] font-mono">{repo.owner}</p>

            {/* Description */}
            {repo.description && (
              <p className="text-[11px] text-[#8E939E] leading-relaxed line-clamp-2">
                {repo.description}
              </p>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap pt-0.5">
              {repo.language && (
                <span className="flex items-center gap-1.5 text-[10px] text-[#8E939E]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: langColor }}
                  />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px] text-[#8E939E]">
                <Star className="w-3 h-3" />
                {repo.stargazers_count}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#8E939E]">
                <GitFork className="w-3 h-3" />
                {repo.forks_count}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#8E939E]">
                <GitBranch className="w-3 h-3" />
                {repo.default_branch}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#8E939E]">
                <Clock className="w-3 h-3" />
                {formatRelativeDate(repo.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Import button */}
        <div className="shrink-0">
          <button
            onClick={() => onImport(repo)}
            disabled={importing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000]
                       hover:brightness-110 text-white font-bold text-[11px] uppercase tracking-wider
                       transition-all duration-200 shadow-md shadow-[#FF3B3B]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            Import
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateQube() {
  const navigate = useNavigate();
  const { isGithubConnected, githubProfile } = useApp();

  const [step, setStep] = useState<Step>('select');
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedRepoName, setImportedRepoName] = useState('');

  // Load repositories on mount
  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoadingRepos(true);
    setRepoError(null);
    try {
      const data = await qubeService.getGithubRepositories();
      setRepos(data);
    } catch {
      setRepoError('Failed to load GitHub repositories. Please try again.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const q = searchQuery.toLowerCase();
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q)
    );
  }, [repos, searchQuery]);

  const handleImport = async (repo: GithubRepo) => {
    setImporting(true);
    setStep('importing');
    toast.info(`Importing ${repo.full_name}...`);
    try {
      await qubeService.importRepository(repo);
      setImportedRepoName(repo.name);
      setStep('success');
      toast.success(`Qube "${repo.name}" created successfully!`);
    } catch {
      setImporting(false);
      setStep('select');
      const errMsg = 'Failed to import repository. Please try again.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/25 text-[#FF3B3B] shrink-0">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-white tracking-tight">Create Qube</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/25 text-[#FF3B3B] text-[10px] font-bold">
                <Terminal className="w-3 h-3" />
                Import Repository
              </span>
            </div>
            <p className="text-xs text-[#8E939E] max-w-lg">
              Create a Qube by importing a GitHub repository. Once imported, JQube will scan it for
              vulnerabilities and enable automated AI remediation.
            </p>
          </div>
        </div>


      </motion.div>

      {/* ─── Breadcrumb / Step indicator ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 text-[11px] font-medium text-[#71717A]"
      >
        <span className={step !== 'success' ? 'text-[#FF3B3B] font-bold' : ''}>
          Select Repository
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className={step === 'success' ? 'text-[#FF3B3B] font-bold' : ''}>
          Qube Created
        </span>
      </motion.div>

      {/* ─── GitHub Connection Banner ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5"
      >
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <FaGithub className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-400">GitHub Connected</p>
          <p className="text-[11px] text-[#8E939E] truncate">
            {githubProfile?.login
              ? `Signed in as @${githubProfile.login}`
              : 'GitHub account linked successfully'}
          </p>
        </div>
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      </motion.div>

      {/* ─── Step: Success ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Decorative offset border */}
            <div className="absolute -top-3 -right-3 bottom-3 left-3 border border-[#FF3B3B]/35 bg-transparent rounded-3xl pointer-events-none -z-10 shadow-[0_0_35px_rgba(255,59,59,0.15)]" />

            <div className="bg-[#121620]/95 border border-[#FF3B3B]/25 p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF3B3B]/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                  className="inline-flex p-4 bg-[#FF3B3B]/10 rounded-2xl border border-[#FF3B3B]/25 text-[#FF3B3B]"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                {/* Text */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Qube Created Successfully!
                  </h2>
                  <p className="text-sm text-[#8E939E] leading-relaxed">
                    <span className="text-white font-semibold">"{importedRepoName}"</span> has been
                    imported as a Qube. JQube will now scan it for vulnerabilities and enable
                    automated AI remediation workflows.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => navigate('/manage-qube')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                               bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000]
                               hover:brightness-110 text-white font-black text-xs uppercase tracking-wider
                               transition-all duration-200 shadow-lg shadow-[#FF3B3B]/25"
                  >
                    <Package className="w-4 h-4" />
                    <span>Manage Qubes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setStep('select');
                      setImporting(false);
                      loadRepos();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                               bg-[#0A0D13] border border-[#FF3B3B]/25 hover:border-[#FF3B3B]/50
                               text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    <PackagePlus className="w-4 h-4" />
                    Import Another
                  </button>
                </div>

                {/* Footer note */}
                <p className="text-[11px] text-[#71717A] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF3B3B]" />
                  The vulnerability scan will begin automatically within minutes.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step: Importing ─────────────────────────────────────────────── */}
        {step === 'importing' && (
          <motion.div
            key="importing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute -top-3 -right-3 bottom-3 left-3 border border-[#FF3B3B]/35 bg-transparent rounded-3xl pointer-events-none -z-10 shadow-[0_0_35px_rgba(255,59,59,0.15)]" />
            <div className="bg-[#121620]/95 border border-[#FF3B3B]/25 p-10 rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF3B3B]/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-[#FF3B3B]/20 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-t-[#FF3B3B] border-r-transparent border-b-[#FF3B3B]/30 border-l-transparent rounded-full animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PackagePlus className="w-5 h-5 text-[#FF3B3B]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Importing Repository…
                  </h3>
                  <p className="text-xs text-[#8E939E] mt-1.5">
                    Linking your repository to JQube workspace. Please wait.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Step: Select ────────────────────────────────────────────────── */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Search + Refresh bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repositories by name, owner or description…"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white
                             placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
                />
              </div>
              <button
                onClick={loadRepos}
                disabled={loadingRepos}
                title="Refresh repositories"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121620]/80 border border-[#FF3B3B]/20
                           text-[#A1A1AA] hover:text-white hover:border-[#FF3B3B]/40 transition-all text-xs font-medium
                           disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRepos ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Loading state */}
            {loadingRepos && (
              <div className="grid sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-[#181C24]/80 border border-white/[0.05] animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Error state */}
            {!loadingRepos && repoError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-12 text-center"
              >
                <div className="p-3 rounded-2xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/25">
                  <AlertCircle className="w-8 h-8 text-[#FF3B3B]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Failed to Load Repositories</p>
                  <p className="text-xs text-[#8E939E] mt-1">{repoError}</p>
                </div>
                <button
                  onClick={loadRepos}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/25
                             text-[#FF3B3B] text-xs font-bold hover:bg-[#FF3B3B]/20 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </motion.div>
            )}

            {/* Empty state — no repos at all */}
            {!loadingRepos && !repoError && repos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-12 text-center"
              >
                <div className="p-3 rounded-2xl bg-[#121620] border border-[#FF3B3B]/15">
                  <Inbox className="w-8 h-8 text-[#71717A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">All Repositories Imported</p>
                  <p className="text-xs text-[#8E939E] mt-1">
                    All your GitHub repositories have been imported as Qubes.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/manage-qube')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/25
                             text-[#FF3B3B] text-xs font-bold hover:bg-[#FF3B3B]/20 transition-all"
                >
                  <Package className="w-3.5 h-3.5" />
                  View Manage Qubes
                </button>
              </motion.div>
            )}

            {/* Empty search results */}
            {!loadingRepos && !repoError && repos.length > 0 && filteredRepos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-10 text-center"
              >
                <Search className="w-7 h-7 text-[#71717A]" />
                <div>
                  <p className="text-sm font-bold text-white">No matches found</p>
                  <p className="text-xs text-[#8E939E] mt-1">
                    Try a different search term.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Repository list */}
            {!loadingRepos && !repoError && filteredRepos.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#71717A] font-medium">
                    {filteredRepos.length} repositor{filteredRepos.length === 1 ? 'y' : 'ies'} available
                  </p>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-[#FF3B3B] hover:underline font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open GitHub
                  </a>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {filteredRepos.map((repo, i) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <RepoCard repo={repo} onImport={handleImport} importing={importing} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
