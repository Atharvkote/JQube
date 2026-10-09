// JQube — Manage Qube Page
// Displays all imported Qubes with Edit Info and Remove actions.

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { SiVultr } from "react-icons/si";
import {
  Package,
  Search,
  Globe,
  Lock,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Calendar,
  GitBranch,
  Terminal,
  X,
  Save,
  Inbox,
  Clock,
  ShieldCheck,
  Activity,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { FaEdit, FaGithub, FaTrash } from 'react-icons/fa';
import { qubeService } from '@/services/qube-service';
import Folder from '@/components/ui/folder';
import type { Qube, UpdateQubeDTO, QubeVisibility } from '@/types';

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  Active: {
    label: 'Active',
    dotClass: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  },
  Importing: {
    label: 'Importing',
    dotClass: 'bg-[#FF3B3B] animate-ping',
    badgeClass: 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/25 animate-pulse',
  },
  Error: {
    label: 'Error',
    dotClass: 'bg-red-400',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/25',
  },
  Inactive: {
    label: 'Inactive',
    dotClass: 'bg-zinc-500',
    badgeClass: 'bg-zinc-800/60 text-zinc-500 border-zinc-700/40',
  },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#181C24]/80 backdrop-blur-md p-4
                 hover:border-[#FF3B3B]/25 hover:shadow-[0_0_24px_rgba(255,59,59,0.07)] transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF3B3B]/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-[#FF3B3B] shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xl font-black text-white">{value}</p>
          <p className="text-[11px] text-[#8E939E] font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps {
  qube: Qube;
  onSave: (data: UpdateQubeDTO) => Promise<void>;
  onClose: () => void;
}

function EditModal({ qube, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<UpdateQubeDTO>({
    qubeName: qube.qubeName,
    description: qube.description,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.qubeName.trim()) {
      setError('Qube name cannot be empty.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#07080B]/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md"
      >
        {/* Decorative offset border */}
        <div className="absolute -top-2.5 -right-2.5 bottom-2.5 left-2.5 border border-[#FF3B3B]/35 rounded-3xl pointer-events-none -z-10 shadow-[0_0_35px_rgba(255,59,59,0.15)]" />

        <div className="bg-[#121620] border border-[#FF3B3B]/25 rounded-3xl p-6 shadow-[0_0_50px_-10px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#FF3B3B]/8 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-[#FF3B3B]">
                <Pencil className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Edit Qube Info</h3>
                <p className="text-[11px] text-[#8E939E]">{qube.fullName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-xl flex items-start gap-2 text-xs text-[#FF6666] font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF3B3B]" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA] mb-1.5">
                Qube Name
              </label>
              <input
                type="text"
                value={form.qubeName}
                onChange={(e) => setForm({ ...form, qubeName: e.target.value })}
                placeholder="my-project"
                className="w-full px-3.5 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white
                           placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA] mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this Qube…"
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white
                           placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0A0D13] border border-[#FF3B3B]/20 text-[#A1A1AA]
                           hover:text-white hover:border-[#FF3B3B]/40 text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000]
                           hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider
                           transition-all shadow-md shadow-[#FF3B3B]/20 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Remove Confirm Modal ─────────────────────────────────────────────────────
interface RemoveModalProps {
  qube: Qube;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

function RemoveModal({ qube, onConfirm, onClose }: RemoveModalProps) {
  const [removing, setRemoving] = useState(false);

  const handleConfirm = async () => {
    setRemoving(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!removing ? onClose : undefined}
        className="absolute inset-0 bg-[#07080B]/80 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-sm"
      >
        <div className="absolute -top-2.5 -right-2.5 bottom-2.5 left-2.5 border border-red-700/40 rounded-3xl pointer-events-none -z-10 shadow-[0_0_35px_rgba(255,59,59,0.12)]" />

        <div className="bg-[#121620] border border-red-700/30 rounded-3xl p-6 shadow-[0_0_50px_-10px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-red-600/8 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Remove Qube</h3>
                <p className="text-[11px] text-[#8E939E]">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={removing}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/5 border border-red-500/15">
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Are you sure you want to remove{' '}
              <span className="font-bold text-white">"{qube.qubeName}"</span>?{' '}
              This will only unlink it from JQube.{' '}
              <span className="text-emerald-400 font-semibold">
                Your GitHub repository will not be deleted.
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={removing}
              className="flex-1 py-2.5 rounded-xl bg-[#0A0D13] border border-white/10 text-[#A1A1AA]
                         hover:text-white hover:border-white/20 text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={removing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                         bg-gradient-to-r from-red-600 to-red-700 hover:brightness-110
                         text-white font-bold text-xs uppercase tracking-wider
                         transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              {removing ? (
                <div className="w-3.5 h-3.5 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Qube
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Qube Card ────────────────────────────────────────────────────────────────
interface QubeCardProps {
  qube: Qube;
  onEdit: (qube: Qube) => void;
  onRemove: (qube: Qube) => void;
  onScan: (qube: Qube) => void;
  index: number;
  githubProfile?: any;
  viewMode?: 'list' | 'grid';
}

function QubeCard({ qube, onEdit, onRemove, onScan, index, githubProfile, viewMode = 'list' }: QubeCardProps) {
  const status = STATUS_CONFIG[qube.status] ?? STATUS_CONFIG.Inactive;
  const langColor = LANG_COLORS[qube.language ?? ''] ?? '#71717A';

  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05, duration: 0.35 }}
        className="flex flex-col items-center justify-center p-6 pt-10 border border-white/[0.05] bg-[#121620]/40 hover:bg-[#181C24]/80 transition-all rounded-3xl group"
      >
        <Folder
          color={langColor === '#71717A' ? '#FF3B3B' : langColor}
          size={1.6}
          className="mb-8 z-10"
          items={[
            <div key="item-1" className="w-full h-full p-1.5 flex flex-col items-center justify-center gap-1.5 bg-[#07090D]/50 text-[#FF3B3B] hover:text-white hover:bg-[#FF3B3B]/20 cursor-pointer transition-all" onClick={(e) => { e.stopPropagation(); onEdit(qube); }}>
              <FaEdit className="w-4 h-4" />
              <span className="text-[7px] font-black tracking-widest uppercase">Edit</span>
            </div>,
            <div key="item-3" className="w-full h-full p-1.5 flex flex-col items-center justify-center gap-1.5 bg-[#07090D] shadow-inner text-red-500 hover:text-white hover:bg-red-500/20 cursor-pointer transition-all" onClick={(e) => { e.stopPropagation(); onRemove(qube); }}>
              <FaTrash className="w-4 h-4" />
              <span className="text-[7px] font-black tracking-widest uppercase">Delete</span>
            </div>,
            <div key="item-2" className="w-full h-full p-1.5 flex flex-col items-center justify-center gap-1.5 bg-[#07090D]/50 text-[#3B82F6] hover:text-white hover:bg-[#3B82F6]/20 cursor-pointer transition-all" onClick={(e) => { e.stopPropagation(); onScan(qube); }}>
              <SiVultr className="w-4 h-4" />
              <span className="text-[7px] font-black tracking-widest uppercase">Scan</span>
            </div>,

          ]}
        />
        {/* Repo Details Below Folder */}
        <div className="w-full z-0 mt-4 relative flex flex-col items-center">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[15px] font-black text-white truncate max-w-[140px] text-center tracking-tight">{qube.qubeName}</h3>
            {qube.visibility === 'private' ? (
              <span className="p-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 shadow-sm shadow-amber-500/10">
                <Lock className="w-3 h-3 text-amber-500 shrink-0" />
              </span>
            ) : (
              <span className="p-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 shadow-sm shadow-blue-500/10">
                <Globe className="w-3 h-3 text-blue-500 shrink-0" />
              </span>
            )}
          </div>

          <p className="text-[10px] text-[#71717A] font-mono mb-3">{qube.repoOwner}</p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-white font-bold w-full">
            <span className="flex items-center gap-1.5 bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-[#FF3B3B] px-2 py-1 rounded-md">
              <GitBranch className="w-3 h-3" /> <span className="truncate max-w-[80px]">{qube.defaultBranch}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-md text-[#A1A1AA]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }}></span>
              {qube.language || 'Code'}
            </span>
          </div>

          <a href={qube.githubUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#FF3B3B]/20 to-red-900/10 border border-[#FF3B3B]/30 hover:bg-[#FF3B3B]/10 hover:border-[#FF3B3B]/60 transition-all duration-300 text-[11px] font-black tracking-widest uppercase text-white group w-full">
            <span className="text-[#FF3B3B] font-mono text-sm tracking-tighter group-hover:animate-pulse">{'>_'}</span>
            <span className="[text-shadow:1px_0px_0px_rgba(255,59,59,0.5)]">View Code</span>
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-white/[0.05] bg-[#121620]/60 hover:bg-[#181C24]/80 transition-all rounded-xl mb-2 group hover:border-[#FF3B3B]/30 gap-4 sm:gap-0"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="p-1 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 shrink-0">
          {githubProfile?.avatarUrl ? (
            <img src={githubProfile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-md" />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center">
              <FaGithub className="w-5 h-5 text-[#FF3B3B]" />
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-white truncate">{qube.qubeName}</h3>
            {qube.qubeName !== qube.repoName && (
              <span className="text-[10px] text-[#71717A] shrink-0 font-mono">({qube.repoName})</span>
            )}
            <span className="text-[10px] text-[#71717A] shrink-0">•</span>
            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${status.badgeClass}`}>
              <span className={`w-1 h-1 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>
            {/* Visibility badge */}
            {qube.visibility === 'private' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20">
                <Lock className="w-2.5 h-2.5" />
                PRIVATE
              </span>
            )}
            {/* Last updated */}
            <span className="text-[10px] text-[#71717A] shrink-0 ml-1">
              Updated {formatRelativeDate(qube.updatedAt)}
            </span>
          </div>

          {qube.description && (
            <p className="text-[11px] text-[#8E939E] truncate max-w-xl">
              {qube.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2">
            {qube.language && (
              <span className="flex items-center gap-1.5 text-[10px] text-[#71717A] font-medium">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: langColor }} />
                {qube.language}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[10px] text-[#71717A]">
              <GitBranch className="w-3 h-3" />
              {qube.defaultBranch}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#71717A] font-mono">
              {qube.repoOwner}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 sm:ml-4 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
        {qube.githubUrl && (
          <a
            href={qube.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A0D13] border border-white/10 text-[#A1A1AA] hover:text-white hover:border-[#FF3B3B]/50 hover:bg-[#FF3B3B]/10 transition-all"
          >
            <FaGithub className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => onScan(qube)}
          title="Scan Qube"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A0D13] border border-white/10 text-[#3B82F6] hover:text-white hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/10 transition-all"
        >
          <SiVultr className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onEdit(qube)}
          title="Edit Qube Info"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A0D13] border border-white/10 text-[#A1A1AA] hover:text-white hover:border-[#FF3B3B]/50 hover:bg-[#FF3B3B]/10 transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRemove(qube)}
          title="Remove Qube"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A0D13] border border-white/10 text-[#A1A1AA] hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ManageQube() {
  const navigate = useNavigate();

  const { githubProfile } = useApp();
  const [qubes, setQubes] = useState<Qube[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [repoStats, setRepoStats] = useState({ public: 0, private: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<QubeVisibility | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [editingQube, setEditingQube] = useState<Qube | null>(null);
  const [removingQube, setRemovingQube] = useState<Qube | null>(null);

  // Load qubes on mount
  useEffect(() => {
    loadQubes();
  }, []);

  const loadQubes = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await qubeService.getAllQubes();
      setQubes(data);
      qubeService.getGithubRepositories().then(({ stats }) => {
        setRepoStats(stats);
      }).catch(console.error);
    } catch {
      setFetchError('Failed to load Qubes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered list
  const filteredQubes = useMemo(() => {
    let result = qubes;
    if (visibilityFilter !== 'all') {
      result = result.filter((q) => q.visibility === visibilityFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (qube) =>
          qube.qubeName.toLowerCase().includes(q) ||
          qube.repoOwner.toLowerCase().includes(q) ||
          qube.description.toLowerCase().includes(q) ||
          qube.fullName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [qubes, searchQuery, visibilityFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: qubes.length,
    public: qubes.filter((q) => q.visibility === 'public').length,
    private: qubes.filter((q) => q.visibility === 'private').length,
    active: qubes.filter((q) => q.status === 'Active').length,
  }), [qubes]);

  // Handlers
  const handleSaveEdit = async (data: UpdateQubeDTO) => {
    if (!editingQube) return;
    const updated = await qubeService.updateQube(editingQube.id, data);
    setQubes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    toast.success(`Qube "${updated.qubeName}" updated successfully.`);
  };

  const handleRemove = async () => {
    if (!removingQube) return;
    await qubeService.removeQube(removingQube.id);
    setQubes((prev) => prev.filter((q) => q.id !== removingQube.id));
    toast.success(`Qube "${removingQube.qubeName}" removed successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* ─── Modals ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingQube && (
          <EditModal
            key="edit"
            qube={editingQube}
            onSave={handleSaveEdit}
            onClose={() => setEditingQube(null)}
          />
        )}
        {removingQube && (
          <RemoveModal
            key="remove"
            qube={removingQube}
            onConfirm={handleRemove}
            onClose={() => setRemovingQube(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/25 text-[#FF3B3B] shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-black text-white tracking-tight">Manage Qube</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/25 text-[#FF3B3B] text-[10px] font-bold">
                <Terminal className="w-3 h-3" />
                {qubes.length} Qubes
              </span>
            </div>
            <p className="text-xs text-[#8E939E] max-w-lg">
              Manage all your imported repositories and Qubes from one place.
            </p>
          </div>
        </div>

        {/* CREATE QUBE Button */}
        <div className="shrink-0">
          <Link to="/qube/create">
            <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#FF3B3B]/30 bg-black/40 hover:bg-[#FF3B3B]/10 hover:border-[#FF3B3B]/60 transition-all duration-300 group">
              <span className="text-[#FF3B3B] font-mono font-bold text-sm tracking-tighter group-hover:animate-pulse">{'>_'}</span>
              <span className="text-white font-black text-[11px] tracking-widest uppercase [text-shadow:1px_0px_0px_rgba(255,59,59,0.5),-1px_0px_0px_rgba(0,255,255,0.5)]">
                Create Qube
              </span>
            </button>
          </Link>
        </div>
      </motion.div>

      {/* ─── Stats Row ───────────────────────────────────────────────────────── */}
      {!loading && !fetchError && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={FaGithub} label="Total Repos" value={repoStats.public + repoStats.private} delay={0} />
          <StatCard icon={Globe} label="Public Repos" value={repoStats.public} delay={0.05} />
          <StatCard icon={Lock} label="Private Repos" value={repoStats.private} delay={0.1} />
          <StatCard icon={Activity} label="Active Qubes" value={stats.active} delay={0.15} />
        </div>
      )}

      {/* ─── Filters ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Qubes by name, owner or description…"
            className="w-full pl-10 pr-4 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white
                       placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
          />
        </div>

        {/* Visibility filter */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0D13] rounded-xl border border-[#FF3B3B]/15">
          {(['all', 'public', 'private'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisibilityFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${visibilityFilter === v
                ? 'bg-gradient-to-r from-[#FF3B3B] to-[#C40000] text-white shadow-sm shadow-[#FF3B3B]/25'
                : 'text-[#8E939E] hover:text-white'
                }`}
            >
              {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0D13] rounded-xl border border-[#FF3B3B]/15 ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list'
              ? 'bg-gradient-to-r from-[#FF3B3B] to-[#C40000] text-white shadow-sm shadow-[#FF3B3B]/25'
              : 'text-[#8E939E] hover:text-white'
              }`}
            title="List View"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid'
              ? 'bg-gradient-to-r from-[#FF3B3B] to-[#C40000] text-white shadow-sm shadow-[#FF3B3B]/25'
              : 'text-[#8E939E] hover:text-white'
              }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={loadQubes}
          disabled={loading}
          title="Refresh"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121620]/80 border border-[#FF3B3B]/20
                     text-[#A1A1AA] hover:text-white hover:border-[#FF3B3B]/40 transition-all text-xs font-medium
                     disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* ─── Content Area ────────────────────────────────────────────────────── */}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-[#181C24]/80 border border-white/[0.05] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Fetch error */}
      {!loading && fetchError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-14 text-center"
        >
          <div className="p-3 rounded-2xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/25">
            <AlertCircle className="w-8 h-8 text-[#FF3B3B]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Failed to Load Qubes</p>
            <p className="text-xs text-[#8E939E] mt-1">{fetchError}</p>
          </div>
          <button
            onClick={loadQubes}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/25
                       text-[#FF3B3B] text-xs font-bold hover:bg-[#FF3B3B]/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </motion.div>
      )}

      {/* Empty state — no qubes at all */}
      {!loading && !fetchError && qubes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-5 py-16 text-center"
        >
          <div className="p-4 rounded-2xl bg-[#121620] border border-[#FF3B3B]/15">
            <Inbox className="w-10 h-10 text-[#71717A]" />
          </div>
          <div>
            <p className="text-base font-black text-white">No Qubes Yet</p>
            <p className="text-xs text-[#8E939E] mt-1 max-w-xs mx-auto">
              You haven't imported any repositories yet. Use{' '}
              <span className="text-white font-semibold">Create Qube</span>{' '}
              from the sidebar to import your first repository.
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty search / filter results */}
      {!loading && !fetchError && qubes.length > 0 && filteredQubes.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-10 text-center"
        >
          <Search className="w-7 h-7 text-[#71717A]" />
          <div>
            <p className="text-sm font-bold text-white">No matches found</p>
            <p className="text-xs text-[#8E939E] mt-1">Try adjusting your search or filter.</p>
          </div>
        </motion.div>
      )}

      {/* Qube list */}
      {!loading && !fetchError && filteredQubes.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#71717A] font-medium">
              {filteredQubes.length} Qube{filteredQubes.length === 1 ? '' : 's'}
              {(searchQuery || visibilityFilter !== 'all') && ' (filtered)'}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF3B3B]" />
              All Qubes are scanned for vulnerabilities
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
            <AnimatePresence>
              {filteredQubes.map((qube, i) => (
                <QubeCard
                  key={qube.id}
                  qube={qube}
                  index={i}
                  onEdit={setEditingQube}
                  onRemove={setRemovingQube}
                  onScan={(q) => navigate(`/manage-qube/${q.id}/scan`, { state: { qube: q } })}
                  githubProfile={githubProfile}
                  viewMode={viewMode}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
