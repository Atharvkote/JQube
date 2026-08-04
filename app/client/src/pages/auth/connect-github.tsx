import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Lock, Terminal, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import logo from '@/assets/logo.png';
import { FaGithub } from "react-icons/fa";
import { LuLink } from "react-icons/lu";
import { SiTicktick } from "react-icons/si";

export default function ConnectToGitHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';

  const { connectGithub, isGithubConnected, isAuthenticated, loading } = useApp();
  const [authProgress, setAuthProgress] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/auth');
      } else if (isGithubConnected) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isGithubConnected, loading, navigate]);

  const handleGithubConnect = async () => {
    setAuthProgress(true);
    toast.info('Authorizing with GitHub OAuth...');
    try {
      await connectGithub();
      toast.success('GitHub account connected! Redirecting to Dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      setAuthProgress(false);
      if (error?.message !== 'Popup closed by user') {
        toast.error('GitHub connection failed', {
          description: error?.message || 'Please try again.'
        });
      }
    }
  };

  return (
    <div className="animated-bg min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white overflow-hidden relative bg-[#07080B] selection:bg-[#FF3B3B] selection:text-white">
      {/* Background graphic elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FF3B3B]/10 rounded-full blur-[140px] pointer-events-none animate-pulse -z-10" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse -z-10"
        style={{ animationDelay: '3s' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#FF3B3B_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="flex items-center justify-between select-none max-w-7xl mx-auto w-full z-20">
        <img
          src={logo}
          alt="JQube Logo"
          className="h-10 md:h-12 w-auto object-contain cursor-pointer select-none drop-shadow-[0_0_12px_rgba(255,59,59,0.3)] transition-transform hover:scale-105"
          onClick={() => navigate('/auth')}
        />
        <button
          onClick={() => navigate('/auth')}
          className="text-xs text-[#A1A1AA] hover:text-white transition-colors bg-[#121620]/80 px-4 py-2 rounded-xl border border-[#FF3B3B]/20 backdrop-blur-md flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Email Sign In</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 max-w-7xl mx-auto w-full py-4 lg:py-6 z-10">
        {/* Left Side: Hero Text & Features */}
        <div className="w-full lg:w-[50%] space-y-6 text-center lg:text-left shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF3B3B]/20 to-red-900/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(255,59,59,0.15)]">
              <Terminal className="text-[#FF3B3B] w-4 h-4" />
              <span className="text-white">GitHub OAuth v2</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Bring the code<br />
              <span className="bg-gradient-to-r from-[#FF3B3B] via-[#FF5555] to-orange-500 bg-clip-text text-transparent">
                We'll keep it secure
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto lg:mx-0 leading-relaxed font-normal">
              Authorize JQube to scan your repositories, analyze vulnerabilities, and issue automated Pull Requests directly on GitHub.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid sm:grid-cols-2  gap-3 mx-auto lg:mx-0"
          >
            {[
              {
                title: 'Vulnerability Detection',
                desc: 'Continuous code scanning for OWASP Top 10 & CWEs.',
                icon: ShieldCheck,
              },
              {
                title: 'AI-Powered Remediation',
                desc: 'Secure patch proposals with regression tests context.',
                icon: Cpu,
              },
              {
                title: 'Secure Pull Request',
                desc: 'Automated PR delivery directly to GitHub repositories.',
                icon: Lock,
              },
              {
                title: 'DevSecOps Integrations',
                desc: 'Webhooks triggering automated pipeline validation.',
                icon: CheckCircle2,
              },
            ].map((feat, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3.5 bg-[#121620]/60 border border-[#FF3B3B]/15 rounded-xl text-left hover:border-[#FF3B3B]/30 transition-all backdrop-blur-md"
              >
                <div className="p-2 bg-[#FF3B3B]/10 rounded-lg text-[#FF3B3B] shrink-0 border border-[#FF3B3B]/20">
                  <feat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                  <p className="text-[11px] text-[#8E939E] mt-0.5 leading-snug">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: 3D Offset Red Border Glassmorphic Connect GitHub Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-full lg:w-[50%] max-w-xl relative"
        >
          {/* Decorative Offset Red Glow Box behind card */}
          <div className="absolute -top-3 -right-3 bottom-3 left-3 border border-[#FF3B3B]/35 bg-transparent rounded-3xl pointer-events-none -z-10 shadow-[0_0_35px_rgba(255,59,59,0.15)]" />

          {/* Main Card Container */}
          <div className="bg-[#121620]/95 border border-[#FF3B3B]/25 p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF3B3B]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center items-center gap-3 mb-5"
              >
                <img
                  src={logo}
                  alt="JQube Logo"
                  className="w-28 sm:w-32 h-auto object-contain cursor-pointer select-none drop-shadow-xl"
                />
                <span className="text-[#FF3B3B]/40 hidden md:block text-xs font-mono">• • •</span>
                <LuLink className="w-7 h-7 text-[#FF3B3B] hidden md:block" />
                <span className="text-[#FF3B3B]/40 hidden md:block text-xs font-mono">• • •</span>
                <FaGithub className="w-10 h-10 text-white hidden md:block" />
              </motion.div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Connect GitHub Account
              </h2>
              <p className="text-xs text-[#8E939E] mt-1.5 font-medium">
                Link your GitHub identity to access the security platform &amp; Dashboard
              </p>
            </div>

            {/* Email Verified Banner */}
            <AnimatePresence>
              {isVerified && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-3.5 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#FF6666] font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FF3B3B]" />
                  <span>Email verified successfully! Connect your GitHub account to proceed to Dashboard.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connect GitHub button */}
            <div className="space-y-4">
              <button
                onClick={handleGithubConnect}
                disabled={authProgress || loading}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#FF3B3B]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authProgress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
                    <span>Connecting GitHub Account...</span>
                  </>
                ) : (
                  <>
                    <FaGithub className="w-5 h-5 text-white" />
                    <span>Connect GitHub &amp; Continue to Dashboard</span>
                  </>
                )}
              </button>

              <div className="flex flex-col items-center justify-between text-[11px] text-[#71717A] px-1 pt-2 gap-1.5 font-medium">
                <span className="flex items-center gap-2">
                  <SiTicktick className="w-3.5 h-3.5 text-[#FF3B3B]" /> Read &amp; Write repository access for PR generation
                </span>
                <span className="flex items-center gap-2">
                  <SiTicktick className="w-3.5 h-3.5 text-[#FF3B3B]" /> Authorized securely via GitHub OAuth App
                </span>
              </div>
            </div>

            {/* Security Note Footer */}
            <div className="mt-8 pt-6 border-t border-[#FF3B3B]/15 text-center">
              <p className="text-[11px] text-[#8E939E] flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-[#FF3B3B]" />
                <span>Enterprise grade security configurations enabled</span>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-[#FF3B3B]/15 text-[#71717A] text-xs max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
        <p>© 2026 JQube DevSecOps. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
