// auth page

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  ShieldCheck,
  Shield,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import logo from '@/assets/logo.png';
import type { LoginDTO, RegisterDTO } from '@/types';
import { FaGithub } from 'react-icons/fa';
import { useApp } from '@/hooks/useApp';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isGithubConnected, gitRepositories } = useApp();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  useEffect(() => {
    if (isAuthenticated) {
      if (isGithubConnected) {
        navigate('/dashboard');
      } else {
        navigate('/connect-github');
      }
    }
  }, [isAuthenticated, isGithubConnected, navigate]);

  // Form states
  const [loginForm, setLoginForm] = useState<LoginDTO>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterDTO>({
    email: '',
    username: '',
    password: '',
  });

  // Checkbox state for terms & conditions
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time password criteria calculations
  const regPassword = registerForm.password;
  const isMinLen = regPassword.length >= 8 && regPassword.length <= 20;
  const hasNumber = /\d/.test(regPassword);
  const hasSpecial = /[@$!%*?&^#()_+\-={}\[\]:;"'<>,./\\|`~]/.test(regPassword);
  const isPasswordValid = isMinLen && hasNumber && hasSpecial;

  // Password strength score (0 to 3)
  const passwordStrengthScore = [isMinLen, hasNumber, hasSpecial].filter(Boolean).length;

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginForm.email || !loginForm.password) {
      const err = 'Please enter your email and password.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      await login(loginForm);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!registerForm.email || !registerForm.username || !registerForm.password) {
      const err = 'Please fill in all required fields.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!isPasswordValid) {
      const err = 'Password does not satisfy all required security criteria.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!acceptedTerms) {
      const err = 'You must accept the Terms of Service & Privacy Policy to register.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      await register(registerForm);
      toast.success(`Account created! Redirecting to email OTP verification...`);
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(registerForm.email)}`);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-[#FF3B3B] selection:text-white">
      {/* Background Animated Gradient Mesh Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FF3B3B]/10 rounded-full blur-[140px] pointer-events-none animate-pulse -z-10" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse -z-10"
        style={{ animationDelay: '3s' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF3B3B]/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Futuristic Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#FF3B3B_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="flex items-center justify-between max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/auth')}>
          <img
            src={logo}
            alt="JQube Logo"
            className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(255,59,59,0.3)] transition-transform hover:scale-105"
          />
        </div>


      </header>

      {/* Main Container — Proportions updated so Right Card takes up more width (~60%) than Left Panel (~40%) */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12 max-w-7xl mx-auto w-full py-2 lg:py-4 z-10">
        {/* Left Side: Modern Hero Section (Compact ~40% width) */}
        <div className="w-full lg:w-[40%] space-y-6 text-center lg:text-left shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF3B3B]/20 to-red-900/10 border border-[#FF3B3B]/30 text-[#FF3B3B] text-xs font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(255,59,59,0.15)]">
              <Terminal className='text-[#FF3B3B] w-4 h-4' />
              <span className="text-white">Version v1.0.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Less "Oops", more <br />
              <span className="bg-gradient-to-r from-[#FF3B3B] via-[#FF6666] to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                "Fixed & Merged".
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#9095A1] max-w-md mx-auto lg:mx-0 leading-relaxed font-normal">
              Seamlessly authenticate to scan repositories, trigger real-time AI vulnerability remediation, and dispatch automated GitHub pull requests.
            </p>
          </motion.div>

          {/* Feature Highlights Stack */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3 max-w-md mx-auto lg:mx-0">
            <div className="flex items-start gap-3 p-3.5 bg-[#121620]/60 border border-[#FF3B3B]/15 rounded-xl text-left backdrop-blur-md transition-all hover:border-[#FF3B3B]/30">
              <div className="p-2 bg-[#FF3B3B]/10 rounded-lg text-[#FF3B3B] border border-[#FF3B3B]/20 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">6-Digit Email OTP</h4>
                <p className="text-[11px] text-[#8E939E] mt-0.5 leading-snug">
                  Automated verification code dispatch for verified user identity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#121620]/60 border border-[#FF3B3B]/15 rounded-xl text-left backdrop-blur-md transition-all hover:border-[#FF3B3B]/30">
              <div className="p-2 bg-[#FF3B3B]/10 rounded-lg text-[#FF3B3B] border border-[#FF3B3B]/20 shrink-0">
                <FaGithub className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Connected with GitHub</h4>
                <p className="text-[11px] text-[#8E939E] mt-0.5 leading-snug">
                  Connected your GitHub Account and you ready to go!!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Ultra-Modern Expanded Red Vault Card (~60% width) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full lg:w-[60%] max-w-xl relative"
        >
          {/* Decorative Offset Red Glow Box behind card */}
          <div className="absolute -top-3 -right-3 bottom-3 left-3 border border-[#FF3B3B]/35 bg-transparent rounded-3xl pointer-events-none -z-10 shadow-[0_0_35px_rgba(255,59,59,0.15)]" />

          {/* Main Form Card */}
          <div className="bg-[#121620]/95 border border-[#FF3B3B]/25 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF3B3B]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div>
              {/* Segmented Glowing Red Pill Switch */}
              <div className="relative flex bg-[#0A0D13] p-1.5 rounded-2xl border border-[#FF3B3B]/25 mb-6 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className={`relative flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs font-black tracking-wide rounded-xl transition-colors z-10 ${activeTab === 'login' ? 'text-white' : 'text-[#8E939E] hover:text-white'
                    }`}
                >
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="redAuthPill"
                      className="absolute inset-0 bg-gradient-to-r from-[#FF3B3B] to-[#D32F2F] rounded-xl shadow-[0_0_16px_rgba(255,59,59,0.5)] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className={`relative flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs font-black tracking-wide rounded-xl transition-colors z-10 ${activeTab === 'register' ? 'text-white' : 'text-[#8E939E] hover:text-white'
                    }`}
                >
                  {activeTab === 'register' && (
                    <motion.div
                      layoutId="redAuthPill"
                      className="absolute inset-0 bg-gradient-to-r from-[#FF3B3B] to-[#D32F2F] rounded-xl shadow-[0_0_16px_rgba(255,59,59,0.5)] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Form Header */}
              <div className="text-center mb-5">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p className="text-xs text-[#8E939E] mt-1 font-medium">
                  {activeTab === 'login'
                    ? 'Enter your credentials to access the DevSecOps workspace'
                    : 'Sign up to receive a 6-digit email OTP verification code'}
                </p>
              </div>

              {/* Error Banner */}
              {/* <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="mb-4 p-3 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#FF6666] font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF3B3B]" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence> */}

              {/* Animated Form Switch */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4 max-w-md mx-auto"
                  >
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA] mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          placeholder="user@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA] mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full cursor-pointer flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#FF3B3B]/25 disabled:opacity-50 mt-4"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In to Platform</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-3.5"
                  >
                    {/* Email Address & Username Side by Side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA] mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                            placeholder="user@example.com"
                            className="w-full pl-9 pr-3 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA] mb-1.5">
                          Username
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                            placeholder="jqube_dev"
                            className="w-full pl-9 pr-3 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
                          />
                        </div>
                      </div>
                    </div>



                    {/* Password Field & Cyber-Shield Tech-Pill Requirements */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA]">
                          Password
                        </label>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <Shield className={`w-3 h-3 transition-colors ${passwordStrengthScore === 3 ? 'text-[#FF3B3B] animate-pulse' : 'text-[#71717A]'}`} />
                          <span className={passwordStrengthScore === 3 ? 'text-[#FF3B3B] font-extrabold tracking-wider' : 'text-[#71717A]'}>
                            {passwordStrengthScore === 3 ? 'SECURE' : passwordStrengthScore === 2 ? 'MEDIUM' : 'WEAK'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-2">
                        <div className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[11px] font-mono font-semibold transition-all duration-300 select-none ${isMinLen
                          ? 'bg-[#FF3B3B]/10 border-[#FF3B3B] text-white shadow-[0_0_12px_rgba(255,59,59,0.25)]'
                          : 'bg-[#090C12] border-[#FF3B3B]/15 text-[#52525B]'
                          }`}>
                          <Lock className='w-3 h-3' />
                          <span className='font-mono uppercase tracking-widest'>8–20 Character</span>
                        </div>

                        <div className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[11px] font-mono font-semibold transition-all duration-300 select-none ${hasNumber
                          ? 'bg-[#FF3B3B]/10 border-[#FF3B3B] text-white shadow-[0_0_12px_rgba(255,59,59,0.25)]'
                          : 'bg-[#090C12] border-[#FF3B3B]/15 text-[#52525B]'
                          }`}>
                          <Lock className='w-3 h-3' />
                          <span className='font-mono uppercase tracking-widest'>1 digit</span>
                        </div>

                        <div className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[11px] font-mono font-semibold transition-all duration-300 select-none ${hasSpecial
                          ? 'bg-[#FF3B3B]/10 border-[#FF3B3B] text-white shadow-[0_0_12px_rgba(255,59,59,0.25)]'
                          : 'bg-[#090C12] border-[#FF3B3B]/15 text-[#52525B]'
                          }`}>
                          <Lock className='w-3 h-3' />

                          <span className='font-mono uppercase tracking-widest'>1 Symbol</span>
                        </div>
                      </div>

                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-[#FF3B3B] focus:ring-1 focus:ring-[#FF3B3B] transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
                        >
                          {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Conditions Checkbox */}
                    <div className="pt-0.5">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#8E939E] hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-[#FF3B3B]/40 bg-[#090C12] text-[#FF3B3B] focus:ring-[#FF3B3B] accent-[#FF3B3B]"
                        />
                        <span>
                          I agree to the{' '}
                          <strong className="text-white font-semibold underline underline-offset-2 hover:text-[#FF3B3B] transition-colors">
                            Terms of Service
                          </strong>{' '}
                          &amp;{' '}
                          <strong className="text-white font-semibold underline underline-offset-2 hover:text-[#FF3B3B] transition-colors">
                            Privacy Policy
                          </strong>
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !isPasswordValid || !acceptedTerms}
                      className="w-full cursor-pointer flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#FF3B3B]/25 disabled:opacity-40 disabled:cursor-not-allowed mt-3"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Register Account</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Card Footer Info */}
            <div className="flex flex-col items-center justify-between text-[11px] text-[#71717A] px-1 pt-4 border-t border-[#FF3B3B]/15 mt-5 font-medium">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF3B3B]" /> 256-Bit Encrypted Communication
              </span>
              <span className="flex items-center gap-2 mt-1">
                <Terminal className="w-3.5 h-3.5 text-[#FF3B3B]" /> Automated 6-Digit Email OTP Included
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modern Footer */}
      <footer className="text-center py-4 border-t border-[#FF3B3B]/15 text-[#71717A] text-xs max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
        <p>© 2026 JQube DevSecOps Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
