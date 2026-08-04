// verify email

import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'user@example.com';
  const { verifyEmail, resendVerification } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // handle single digit change in otp inputs
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // handle keydown for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // handle paste 6-digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      const err = 'Please enter the full 6-digit verification code.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const verified = await verifyEmail(email, fullCode);
      if (verified) {
        toast.success('Email verified successfully!');
        // redirect user to the login/github connect page
        setTimeout(() => {
          navigate('/connect-github?verified=true');
        }, 1500);
      } else {
        const err = 'Verification failed. Please check the code and try again.';
        setErrorMessage(err);
        toast.error(err);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setErrorMessage(null);
    toast.info(`Resending verification code to ${email}...`);
    try {
      await resendVerification(email);
      toast.success(`A new 6-digit verification code has been sent to ${email}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resend code.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="animated-bg min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white overflow-hidden relative bg-[#07080B] selection:bg-[#FF3B3B] selection:text-white">
      {/* Background glowing visuals */}
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
          className="text-xs text-[#A1A1AA] hover:text-white transition-colors bg-[#121620]/80 px-4 py-2 rounded-xl border border-[#FF3B3B]/20 backdrop-blur-md"
        >
          Back to Sign In
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full py-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full relative"
        >
          {/* Decorative Offset Red Glow Box behind card */}
          <div className="absolute -top-3 -right-3 bottom-3 left-3 border border-[#FF3B3B]/35 bg-transparent rounded-3xl pointer-events-none -z-10 shadow-[0_0_35px_rgba(255,59,59,0.15)]" />

          {/* Main Card */}
          <div className="bg-[#121620]/95 border border-[#FF3B3B]/25 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF3B3B]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-[#FF3B3B]/10 rounded-2xl border border-[#FF3B3B]/25 mb-4 text-[#FF3B3B]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Verify Your Email Address
              </h2>
              <p className="text-xs text-[#8E939E] mt-2 leading-relaxed font-medium">
                User registered successfully! Please enter the 6-digit verification code sent to{' '}
                <strong className="text-white font-semibold">{email}</strong> to activate your account.
              </p>
            </div>

            {/* Error Alert */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#FF6666] font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF3B3B]" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 6-Digit OTP Form */}
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg font-bold bg-[#090C12] border border-[#FF3B3B]/25 rounded-xl text-white focus:outline-none focus:border-[#FF3B3B] focus:ring-2 focus:ring-[#FF3B3B]/30 transition-all shadow-md"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full cursor-pointer flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF3B3B] via-[#E60000] to-[#C40000] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#FF3B3B]/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-t-white border-r-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify &amp; Continue to GitHub Connect</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Resend Code Action */}
            <div className="mt-6 text-center border-t border-[#FF3B3B]/15 pt-4 flex items-center justify-between text-xs text-[#71717A] font-medium">
              <span>Didn't receive the code?</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-[#FF3B3B] hover:underline font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {resending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span>Resend Code</span>
              </button>
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
