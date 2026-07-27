import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Github, Cpu, Lock, Terminal, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const { login, loading } = useContext(AppContext);
  const [authProgress, setAuthProgress] = useState(false);

  const handleGithubLogin = () => {
    setAuthProgress(true);
    // Simulate GitHub OAuth redirection and callback delay
    setTimeout(() => {
      login();
    }, 1500);
  };

  return (
    <div className="animated-bg min-h-screen flex flex-col justify-between p-6 text-slate-100 overflow-hidden relative">
      {/* Background graphic elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-650/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Top Header */}
      <header className="flex items-center gap-3 select-none max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 text-white">
          <ShieldCheck className="w-5.5 h-5.5" />
        </div>
        <span className="text-xl font-bold tracking-wider text-white">
          J-QUBE
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-7xl mx-auto w-full py-12">
        
        {/* Left Side: Hero Text & Features */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Version 1.0.0 (B.Tech Capstone Project)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                DevSecOps Platform
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              J-QUBE automates security analysis, detects code vulnerabilities, explains risks with custom LLMs, and creates secure remediation Pull Requests instantly.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0"
          >
            {[
              { title: 'Vulnerability Detection', desc: 'Continuous code scanning for OWASP Top 10 & CWEs.', icon: ShieldCheck },
              { title: 'AI-Powered Remediation', desc: 'Secure patch proposals with regression tests context.', icon: Cpu },
              { title: 'Secure Pull Request', desc: 'Automated PR delivery directly to GitHub repositories.', icon: Lock },
              { title: 'DevSecOps Integrations', desc: 'Webhooks triggering automated pipeline validation.', icon: CheckCircle2 },
            ].map((feat, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl text-left hover:border-slate-700/80 transition-colors">
                <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400 shrink-0">
                  <feat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{feat.title}</h4>
                  <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side: Glassmorphic Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -z-10" />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white tracking-wide">Welcome to J-QUBE</h2>
              <p className="text-xs text-slate-400 mt-2">
                Connect your GitHub account to access the dashboard
              </p>
            </div>

            {/* Login button and simulated progress states */}
            <div className="space-y-4">
              <button
                onClick={handleGithubLogin}
                disabled={authProgress || loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-medium text-sm transition-all duration-200 hover:border-blue-500/50 shadow-lg shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authProgress ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
                    <span>Authorizing on GitHub...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5 text-white" />
                    <span>Continue with GitHub</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2">
                <span>By logging in you agree to our Terms</span>
                <span className="h-3 w-[1px] bg-slate-800" />
                <span>Authorized via OAuth App</span>
              </div>
            </div>

            {/* Security Note Footer */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-450 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>Enterprise grade security configurations enabled</span>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-slate-900/60 text-slate-500 text-xs mt-12 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 J-QUBE DevSecOps. All Rights Reserved.</p>
        <p>B.Tech Capstone Project • Atharv Kote</p>
      </footer>
    </div>
  );
};

export default Login;
