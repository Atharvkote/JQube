// JQube — Create Qube Page
// Multi-step flow: GitHub connected check → repository browser → import → success

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackagePlus,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Package,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { FaGithub, FaTerminal } from 'react-icons/fa';
import { useApp } from '@/hooks/useApp';
import { qubeService } from '@/services/qube-service';
import type { GithubRepo } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'select' | 'importing' | 'success';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Repo List Item ───────────────────────────────────────────────────────────
interface RepoListItemProps {
  repo: GithubRepo;
  onImport: (repo: GithubRepo) => void;
  importing: boolean;
  githubProfile: any;
}



function RepoListItem({ repo, onImport, importing, githubProfile }: RepoListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3.5 border border-white/[0.05] bg-[#121620]/60 hover:bg-[#181C24]/80 transition-all rounded-xl mb-2 group hover:border-[#FF3B3B]/30"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="p-1 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 shrink-0">
          <img src={githubProfile?.avatarUrl} alt={githubProfile?.name} className="w-7 h-7 rounded-md text-white/80" />
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white truncate">{repo.name}</h3>
            <span className="text-[10px] text-[#71717A] shrink-0">• {formatRelativeDate(repo.updated_at)}</span>
            {repo.visibility === 'private' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20">
                <Lock className="w-2.5 h-2.5" />
                PRIVATE
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-[11px] text-[#8E939E] truncate max-w-sm mt-0.5">
              {repo.description}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 ml-4">
        <button
          onClick={() => onImport(repo)}
          disabled={importing}
          className="flex items-center gap-2 px-5 py-1 rounded-lg cursor-pointer bg-gradient-to-r from-[#FF3B3B]/20 to-red-900/10 border border-[#FF3B3B]/30  hover:bg-[#FF3B3B]/10 hover:border-[#FF3B3B]/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <span className="text-[#FF3B3B] font-mono text-sm tracking-tighter group-hover:animate-pulse">{'>_'}</span>
          <span className="text-white font-semibold  uppercase font-black text-[11px] tracking-widest ">
            Create Qube
          </span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateQube() {
  const navigate = useNavigate();
  const { githubProfile, user } = useApp();

  const [step, setStep] = useState<Step>('select');
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedRepoName, setImportedRepoName] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [repoStats, setRepoStats] = useState({ public: 0, private: 0 });

  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery]);

  useEffect(() => {
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setLoadingRepos(true);
    setRepoError(null);
    try {
      const { repos: data, stats } = await qubeService.getGithubRepositories();
      setRepos(data);
      setRepoStats(stats);
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
    toast.info(`Creating Qube for ${repo.full_name}...`);
    try {
      await qubeService.importRepository(repo);
      setImportedRepoName(repo.name);
      setStep('success');
      toast.success(`Qube "${repo.name}" created successfully!`);
    } catch {
      setImporting(false);
      setStep('select');
      const errMsg = 'Failed to create Qube. Please try again.';
      toast.error(errMsg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pt-4">

      {/* ─── Step: Select ────────────────────────────────────────────────── */}
      {step === 'select' && (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-[600px]">

          {/* Left Column: Repo List */}
          <div className="w-full lg:w-[60%] flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Import Git Repository</h2>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center px-4 py-1 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-white text-sm w-full sm:w-48 shrink-0">
                <img src={githubProfile?.avatarUrl} alt={user?.name} className="w-6 h-6 rounded-md mr-2 text-white/80" />
                <span className="truncate font-semibold">{user?.username || 'Select Account'}</span>
              </div>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-sm text-white
                             placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
                />
              </div>
              <button
                onClick={loadRepos}
                disabled={loadingRepos}
                className="px-4 py-2.5 rounded-xl bg-[#121620] border border-[#FF3B3B]/20 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRepos ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex-1 border border-[#FF3B3B]/15 rounded-2xl bg-[#07090D] p-3 overflow-y-auto custom-scrollbar relative">
              {loadingRepos && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#07090D]/80 backdrop-blur-sm z-10 rounded-2xl">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-t-[#FF3B3B] border-r-transparent border-b-[#FF3B3B]/30 border-l-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs text-[#8E939E]">Loading repositories...</p>
                  </div>
                </div>
              )}

              {!loadingRepos && repoError && (
                <div className="flex flex-col items-center gap-3 py-20">
                  <AlertCircle className="w-8 h-8 text-[#FF3B3B]" />
                  <p className="text-sm font-semibold text-white">{repoError}</p>
                </div>
              )}

              {!loadingRepos && !repoError && filteredRepos.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-20 text-center">
                  <p className="text-sm font-semibold text-white">No repositories found</p>
                  <p className="text-xs text-[#71717A]">Try adjusting your search query.</p>
                </div>
              )}

              {!loadingRepos && !repoError && (
                <>
                  {filteredRepos.slice(0, visibleCount).map((repo, i) => (
                    <RepoListItem key={repo.id} repo={repo} onImport={handleImport} importing={importing} githubProfile={githubProfile} />
                  ))}

                  {filteredRepos.length > visibleCount && (
                    <div className="flex justify-center mt-6 mb-4">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="px-6 py-2.5 cursor-pointer w-full rounded-full bg-[#121620] bg-gradient-to-r from-[#FF3B3B]/20 to-red-900/10 rounded-lg border border-[#FF3B3B]/30 border border-[#FF3B3B]/30 text-[#A1A1AA] hover:text-white hover:border-[#FF3B3B]/60 hover:bg-[#FF3B3B]/10 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#FF3B3B]/5"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Information & Gradient Box */}
          <div className="hidden lg:flex w-[40%] flex-col relative overflow-hidden rounded-3xl border border-[#FF3B3B]/20 bg-[#0A0D13]">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF3B3B]/10 via-transparent to-transparent pointer-events-none" />

            {/* Giant GitHub Logo spanning over it */}
            <FaGithub className="absolute -right-24 -bottom-24 w-[500px] h-[500px] text-white/[0.03] pointer-events-none rotate-12 drop-shadow-2xl" />

            <div className="relative z-10 p-10 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-white mb-6 flex justify-center tracking-tight   rounded-lg flex tracking-wide uppercase items-center gap-2"><span className='px-2 py-1 bg-gradient-to-r from-[#FF3B3B]/20 to-red-900/10 border  border-[#FF3B3B]/30  rounded-lg'><FaTerminal /></span> Build your secure Qube</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[#121620]/80 border border-white/5 backdrop-blur-md">
                  <p className="text-[#8E939E] text-[10px] uppercase font-bold tracking-wider mb-0.5">Public Repos</p>
                  <p className="text-2xl text-white font-black">{repoStats.public}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#121620]/80 border border-white/5 backdrop-blur-md">
                  <p className="text-[#8E939E] text-[10px] uppercase font-bold tracking-wider mb-0.5">Private Repos</p>
                  <p className="text-2xl text-white font-black">{repoStats.private}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#121620]/80 border border-white/5 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#FF3B3B]" />
                    All Repositories Imported
                  </h3>
                  <p className="text-[12px] text-[#8E939E] leading-relaxed">
                    Your public and private GitHub repositories are securely listed. Select any project to instantly initialize a JQube environment.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#121620]/80 border border-white/5 backdrop-blur-md">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <PackagePlus className="w-4 h-4 text-[#FF3B3B]" />
                    Automated Security Analysis
                  </h3>
                  <p className="text-[12px] text-[#8E939E] leading-relaxed">
                    Upon creating a Qube, we instantly perform deep SAST scanning on your codebase to identify vulnerabilities and suggest AI-driven patches.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── Step: Importing ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === 'importing' && (
          <motion.div
            key="importing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[600px]"
          >
            <div className="bg-[#121620]/95 border border-[#FF3B3B]/25 p-12 rounded-3xl shadow-2xl relative overflow-hidden text-center max-w-md w-full">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF3B3B]/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-[#FF3B3B]/20 flex items-center justify-center">
                  <div className="w-10 h-10 border-2 border-t-[#FF3B3B] border-r-transparent border-b-[#FF3B3B]/30 border-l-transparent rounded-full animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <PackagePlus className="w-5 h-5 text-[#FF3B3B]" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">Creating Qube...</h3>
              <p className="text-sm text-[#8E939E] mt-2">Linking repository and initializing security sandbox.</p>
            </div>
          </motion.div>
        )}

        {/* ─── Step: Success ───────────────────────────────────────────────────── */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center min-h-[600px]"
          >
            <div className="bg-[#121620]/95 border border-[#FF3B3B]/25 p-10 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden max-w-lg w-full text-center">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF3B3B]/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="inline-flex p-4 bg-[#FF3B3B]/10 rounded-full border border-[#FF3B3B]/25 text-[#FF3B3B] mb-6"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-3">Qube Created Successfully!</h2>
              <p className="text-sm text-[#8E939E] leading-relaxed mb-8">
                <span className="text-white font-semibold">"{importedRepoName}"</span> has been imported. JQube is now scanning it for vulnerabilities and enabling automated AI remediation workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => navigate('/manage-qube')}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000] hover:brightness-110 text-white font-bold text-sm transition-all shadow-lg shadow-[#FF3B3B]/25"
                >
                  Manage Qubes
                </button>
                <button
                  onClick={() => {
                    setStep('select');
                    setImporting(false);
                    loadRepos();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0A0D13] border border-[#FF3B3B]/25 hover:border-[#FF3B3B]/50 text-white font-bold text-sm transition-all"
                >
                  Import Another
                </button>
              </div>
              <p className="text-xs text-[#71717A] mt-6 flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF3B3B]" />
                Initial scan is running in the background.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
