import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon,
    Shield,
    Mail,
    Activity,
    Terminal,
    ExternalLink,
    MapPin,
    Building,
    Calendar,
    Unlink,
    GitBranch,
    ArrowLeft,
    ChevronRight,
    RefreshCw,
    CheckCircle2
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function UserProfile() {
    const navigate = useNavigate();
    const {
        user,
        isGithubConnected,
        githubProfile,
        disconnectGithub,
        connectGithub,
        loading
    } = useApp();

    const [disconnectConfirm, setDisconnectConfirm] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // Default fallback user if context is empty (offline mode)
    const currentUser = user || {
        name: 'Security Operator',
        username: 'sec_ops_lead',
        email: 'admin@jqube.io',
        role: 'Security Lead'
    };


    const handleDisconnect = async () => {
        if (!disconnectConfirm) {
            setDisconnectConfirm(true);
            toast.warning('Click Disconnect again to confirm unlinking GitHub.');
            return;
        }

        setDisconnecting(true);
        try {
            if (disconnectGithub) {
                await disconnectGithub();
                setLogs(prev => [...prev, `[sys] GitHub authentication token revoked.`]);
            }
            setDisconnectConfirm(false);
        } catch (err: any) {
            toast.error('Failed to disconnect GitHub', {
                description: err?.message || 'Please try again.'
            });
        } finally {
            setDisconnecting(false);
        }
    };

    const handleConnect = async () => {
        navigate('/connect-github');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-[#07080B] text-white p-4 sm:p-6 lg:p-8 relative overflow-x-hidden select-none selection:bg-[#FF3B3B] selection:text-white">
            {/* Glow graphics */}
            <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] bg-[#FF3B3B]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] bg-[#FF3B3B]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(#FF3B3B_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none -z-10" />

            {/* Header bar */}
            <header className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8 z-20 relative">
                <div className="flex items-center gap-3" onClick={() => navigate('/dashboard')}>
                    <img
                        src={logo}
                        alt="JQube Logo"
                        className="h-9 w-auto object-contain cursor-pointer drop-shadow-[0_0_8px_rgba(255,59,59,0.3)] transition-transform hover:scale-105"
                    />
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-xs text-[#A1A1AA] hover:text-white transition-colors bg-[#121620]/80 px-4 py-2 rounded-xl border border-[#FF3B3B]/20 backdrop-blur-md flex items-center gap-1.5 font-medium shadow-lg hover:border-[#FF3B3B]/50"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Dashboard</span>
                </button>
            </header>

            <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
                {/* Page Title */}
                <div className="lg:col-span-12 mb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-xs font-semibold backdrop-blur-md mb-3 shadow-[0_0_15px_rgba(255,59,59,0.1)]">
                        <Shield className="w-4 h-4 animate-pulse" />
                        <span>OPERATOR MANAGEMENT CONSOLE</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Security Operator Profile</h1>
                    <p className="text-sm text-[#A1A1AA] mt-1">Manage system operator roles, permissions, and linked third-party integrations.</p>
                </div>

                {/* Column 1: JQube Profile */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="lg:col-span-5 flex flex-col gap-6"
                >
                    <div className="bg-[#121620]/75 backdrop-blur-md border border-[#FF3B3B]/15 rounded-2xl p-6 relative overflow-hidden group shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B3B]/5 rounded-bl-full pointer-events-none -z-10 group-hover:bg-[#FF3B3B]/10 transition-colors" />

                        <h2 className="text-sm font-bold tracking-widest text-[#FF3B3B] uppercase mb-6 flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            <span>Operator Identity</span>
                        </h2>

                        <div className="flex flex-col items-center text-center pb-6 border-b border-[#FF3B3B]/10">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#FF3B3B] to-[#FF8A3B] p-0.5 shadow-2xl">
                                    <div className="w-full h-full rounded-2xl bg-[#0F1115] flex items-center justify-center overflow-hidden">
                                        {githubProfile.avatarUrl ? (
                                            <img
                                                src={githubProfile.avatarUrl || currentUser.avatar}
                                                alt={currentUser.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="w-10 h-10 text-[#FF3B3B]" />
                                        )}
                                    </div>
                                </div>
                                <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#35c46b] border-2 border-[#121620] rounded-full animate-pulse" />
                            </div>

                            <h3 className="text-xl font-bold">{currentUser.name}</h3>
                            <p className="text-xs text-[#A1A1AA] mt-1 font-mono">@{currentUser.username || 'operator'}</p>

                            <span className="mt-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-[#FF3B3B] bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 uppercase">
                                {currentUser.role}
                            </span>
                        </div>

                        <div className="space-y-4 pt-6 text-sm font-medium">

                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090B]/60 border border-[#FF3B3B]/5">
                                <div className="flex items-center gap-2.5 text-[#A1A1AA]">
                                    <Mail className="w-4 h-4 text-[#FF3B3B]" />
                                    <span>Email Address</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-white select-text">
                                        {currentUser.email}
                                    </span>

                                    <div className="relative group">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 cursor-pointer" />

                                        {/* Custom Tooltip */}
                                        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-emerald-500/20 bg-[#09090B] px-2 py-1 text-xs font-medium text-emerald-400 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-1 pointer-events-none">
                                            Verified
                                        </div>

                                        {/* Arrow */}
                                        <div className="absolute bottom-full left-1/2 mb-1 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-emerald-500/20 bg-[#09090B] opacity-0 transition-all duration-200 group-hover:opacity-100 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090B]/60 border border-[#FF3B3B]/5">
                                <div className="flex items-center gap-2.5 text-[#A1A1AA]">
                                    <Shield className="w-4 h-4 text-[#FF3B3B]" />
                                    <span>Access Level</span>
                                </div>
                                <span className="text-white font-mono bg-[#FF3B3B]/10 px-2 py-0.5 rounded text-xs border border-[#FF3B3B]/20">
                                    {currentUser.role === 'Security Lead' || currentUser.role === 'admin' ? 'SYSTEM_ADMIN' : 'DEVELOPER_ROLE'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#09090B]/60 border border-[#FF3B3B]/5">
                                <div className="flex items-center gap-2.5 text-[#A1A1AA]">
                                    <Activity className="w-4 h-4 text-[#FF3B3B]" />
                                    <span>Session Status</span>
                                </div>
                                <span className="text-[#35c46b] font-mono text-xs flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#35c46b] animate-ping" />
                                    <span>ACTIVE</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Column 2: GitHub Profile Integration */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="lg:col-span-7 flex flex-col gap-6"
                >
                    <div className="bg-[#121620]/75 backdrop-blur-md border border-[#FF3B3B]/15 rounded-2xl p-6 relative overflow-hidden flex-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                        <h2 className="text-sm font-bold tracking-widest text-[#FF3B3B] uppercase mb-6 flex items-center gap-2">
                            <FaGithub className="w-4 h-4" />
                            <span>GitHub</span>
                        </h2>

                        <AnimatePresence mode="wait">
                            {isGithubConnected && githubProfile ? (
                                <motion.div
                                    key="connected"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* Connected Profile Details */}
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-[#09090B]/60 border border-[#FF3B3B]/15">
                                        <img
                                            src={githubProfile.avatarUrl}
                                            alt={githubProfile.name || githubProfile.username}
                                            className="w-16 h-16 rounded-xl object-cover ring-2 ring-[#FF3B3B]/30"
                                        />
                                        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white leading-tight">
                                                        {githubProfile.name || 'GitHub Operator'}
                                                    </h3>
                                                    <a
                                                        href={githubProfile.profileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs text-[#FF3B3B] hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                                                    >
                                                        @{githubProfile.username}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                                <span className="px-2.5 py-1 rounded bg-[#35c46b]/10 border border-[#35c46b]/20 text-[#35c46b] text-[10px] font-bold uppercase tracking-wider self-center sm:self-start">
                                                    CONNECTED
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                                                {githubProfile.bio || 'This GitHub user has no bio configured.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* GitHub Profile Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-[#09090B]/40 border border-[#FF3B3B]/10 rounded-xl p-3 text-center">
                                            <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Public Repos</span>
                                            <span className="text-xl font-black text-white mt-1 block">{githubProfile.publicRepos ?? 0}</span>
                                        </div>
                                        <div className="bg-[#09090B]/40 border border-[#FF3B3B]/10 rounded-xl p-3 text-center">
                                            <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Followers</span>
                                            <span className="text-xl font-black text-white mt-1 block">{githubProfile.followers ?? 0}</span>
                                        </div>
                                        <div className="bg-[#09090B]/40 border border-[#FF3B3B]/10 rounded-xl p-3 text-center">
                                            <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">Following</span>
                                            <span className="text-xl font-black text-white mt-1 block">{githubProfile.following ?? 0}</span>
                                        </div>
                                    </div>

                                    {/* Metadata fields list */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-[#A1A1AA]">
                                        <div className="flex items-center gap-2 p-3 bg-[#09090B]/20 border border-[#FF3B3B]/5 rounded-xl">
                                            <MapPin className="w-4 h-4 text-[#FF3B3B]" />
                                            <div className="min-w-0">
                                                <span className="block text-[9px] text-[#71717A] uppercase tracking-wider">Location</span>
                                                <span className="text-white truncate block mt-0.5">{githubProfile.location || 'Not Specified'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-[#09090B]/20 border border-[#FF3B3B]/5 rounded-xl">
                                            <Building className="w-4 h-4 text-[#FF3B3B]" />
                                            <div className="min-w-0">
                                                <span className="block text-[9px] text-[#71717A] uppercase tracking-wider">Company</span>
                                                <span className="text-white truncate block mt-0.5">{githubProfile.company || 'Not Specified'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-[#09090B]/20 border border-[#FF3B3B]/5 rounded-xl sm:col-span-2">
                                            <Calendar className="w-4 h-4 text-[#FF3B3B]" />
                                            <div className="min-w-0">
                                                <span className="block text-[9px] text-[#71717A] uppercase tracking-wider">Connected On</span>
                                                <span className="text-white block mt-0.5">{formatDate(githubProfile.connectedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revoke Integration Actions */}
                                    <div className="pt-4 border-t border-[#FF3B3B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm">
                                            Revoking integration will disable scan updates, webhook relays, and pull request generation capabilities.
                                        </p>
                                        <button
                                            onClick={handleDisconnect}
                                            disabled={disconnecting}
                                            className={`text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all select-none duration-150 border shrink-0 ${disconnectConfirm
                                                ? 'bg-[#FF3B3B] hover:bg-[#D32F2F] text-white border-transparent animate-bounce'
                                                : 'bg-transparent text-[#FF3B3B] hover:bg-[#FF3B3B]/10 border-[#FF3B3B]/20'
                                                }`}
                                        >
                                            <Unlink className="w-3.5 h-3.5" />
                                            <span>{disconnectConfirm ? 'Confirm Revoke Integration' : 'Revoke Integration'}</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="disconnected"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#1A1F2E] border border-[#FF3B3B]/15 flex items-center justify-center text-[#71717A] mb-4">
                                        <FaGithub className="w-8 h-8 opacity-40 animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-bold">No GitHub Account Connected</h3>
                                    <p className="text-xs text-[#A1A1AA] max-w-xs mt-1.5 leading-relaxed">
                                        Connect your GitHub account to start scanning repositories, auditing pull requests, and generating automated AI vulnerability fixes.
                                    </p>
                                    <button
                                        onClick={handleConnect}
                                        className="mt-6 text-xs text-white font-bold bg-gradient-to-r from-[#FF3B3B] to-[#FF5555] hover:shadow-[0_0_20px_rgba(255,59,59,0.35)] px-6 py-3 rounded-xl border border-red-500/30 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <GitBranch className="w-3.5 h-3.5" />
                                        <span>Connect GitHub Account</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto w-full text-center text-[10px] text-[#52525B] mt-12 py-4 border-t border-[#FF3B3B]/16">
                &copy; 2026 JQube DevSecOps Platform. All permissions logged under SOC-2 policy guidelines.
            </footer>
        </div>
    );
}