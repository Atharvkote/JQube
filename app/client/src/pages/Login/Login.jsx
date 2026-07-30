import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Github, Cpu, Lock, Terminal, CheckCircle2, ShieldCheck } from 'lucide-react';
import logo from '../../assets/logo.png';

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
    <div className="animated-bg min-h-screen flex flex-col justify-between p-6 text-white overflow-hidden relative bg-[#09090B]">
      {/* Background graphic elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF3B3B]/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF3B3B]/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Top Header */}
      <header className="flex items-center gap-3 select-none max-w-7xl mx-auto w-full">
        <img
          src={logo}
          alt="JQube Logo"
          className="h-10 md:h-12 w-auto object-contain cursor-pointer select-none drop-shadow-md"
        />
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-[#FF3B3B] text-xs font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Version 1.0.0 (B.Tech Capstone Project)</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-[#FF3B3B] via-[#FF5555] to-orange-500 bg-clip-text text-transparent">
                DevSecOps Platform
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AA] max-w-xl mx-auto lg:mx-0 leading-[1.7]">
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
              <div key={index} className="flex items-start gap-3 p-4 bg-[#151922] border border-[#FF3B3B]/15 rounded-xl text-left hover:border-[#FF3B3B]/35 transition-colors shadow-lg">
                <div className="p-2 bg-[#FF3B3B]/10 rounded-lg text-[#FF3B3B] shrink-0 border border-[#FF3B3B]/20">
                  <feat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                  <p className="text-[10.5px] text-[#A1A1AA] mt-1 leading-[1.7]">{feat.desc}</p>
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
          <div className="bg-[#151922] border border-[#FF3B3B]/15 p-8 rounded-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3B3B]/10 rounded-full blur-xl -z-10" />

            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center mb-4"
              >
                <img
                  src={logo}
                  alt="JQube Logo"
                  className="w-48 sm:w-56 h-auto object-contain cursor-pointer select-none drop-shadow-xl"
                />
              </motion.div>
              <h2 className="text-xl font-bold text-white tracking-wide">Welcome to JQube</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Connect your GitHub account to access the security platform
              </p>
            </div>

            {/* Login button and simulated progress states */}
            <div className="space-y-4">
              <button
                onClick={handleGithubLogin}
                disabled={authProgress || loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#FF3B3B] hover:bg-[#FF3B3B]/90 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-[#FF3B3B]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

              <div className="flex items-center justify-between text-[11px] text-[#71717A] px-1 pt-2">
                <span>By logging in you agree to our Terms</span>
                <span className="h-3 w-[1px] bg-[#FF3B3B]/15" />
                <span>Authorized via OAuth App</span>
              </div>
            </div>

            {/* Security Note Footer */}
            <div className="mt-8 pt-6 border-t border-[#FF3B3B]/15 text-center">
              <p className="text-[11px] text-[#A1A1AA] flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#FF3B3B]" />
                <span>Enterprise grade security configurations enabled</span>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-[#FF3B3B]/15 text-[#71717A] text-xs mt-12 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 J-QUBE DevSecOps. All Rights Reserved.</p>
        <p>B.Tech Capstone Project • Atharv Kote</p>
      </footer>
    </div>
  );
};

export default Login;
