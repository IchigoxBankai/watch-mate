import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserCheck, AlertCircle, Phone, KeyRound, ArrowRight, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, loginAsGuest, setupRecaptcha, sendPhoneOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = location.state?.from || '/home';

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setError('Please enter a valid phone number with country code (e.g. +1 555 123 4567 or +91 9876543210)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneOtp(phoneNumber.trim(), appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send SMS code. Make sure phone number includes country code (+1, +91, etc.)');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otpCode.trim());
        navigate(redirectPath);
      } else {
        throw new Error('Verification session expired. Please request a new code.');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPhone = () => {
    setOtpSent(false);
    setConfirmationResult(null);
    setOtpCode('');
    setError('');
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    loginAsGuest(guestName.trim());
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-watchmate-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Vibrant Sapphire & Cyan Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-watchmate-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-watchmate-cyan/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-watchmate-gold/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-gradient-to-b from-watchmate-surface via-watchmate-elevated to-watchmate-bgSecondary border border-watchmate-borderLight rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(37,99,235,0.25)]"
      >
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <Logo size="md" />
          </div>
          <h2 className="font-display font-bold text-2xl text-watchmate-text mb-1">
            Welcome back to WatchMate
          </h2>
          <p className="text-xs text-watchmate-secondaryText">
            Sign in to access your saved lounges, friends, and watch history
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-watchmate-error/15 border border-watchmate-error/30 flex items-center gap-2.5 text-xs text-watchmate-error font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isGuestMode ? (
          /* Guest Access Form */
          <form onSubmit={handleGuestSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-watchmate-text mb-1.5">
                Choose a Display Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-sm text-watchmate-text focus:outline-none placeholder:text-watchmate-muted focus:ring-1 focus:ring-watchmate-cyan/40"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3.5 rounded-2xl text-sm font-semibold shadow-blue-glow transition-all"
            >
              Continue as Guest
            </button>

            <button
              type="button"
              onClick={() => setIsGuestMode(false)}
              className="w-full text-xs text-watchmate-muted hover:text-watchmate-cyan text-center pt-2 transition-colors"
            >
              ← Back to standard login
            </button>
          </form>
        ) : (
          /* Standard Login Form */
          <>
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mb-4 flex items-center justify-center gap-3 py-3 px-4 rounded-2xl text-xs font-semibold text-watchmate-text bg-watchmate-surface hover:bg-watchmate-elevated border border-watchmate-border hover:border-watchmate-cyan/50 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Auth Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-watchmate-surface rounded-2xl border border-watchmate-border mb-4">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(''); }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'email'
                    ? 'bg-watchmate-primary text-white shadow-blue-glow'
                    : 'text-watchmate-muted hover:text-watchmate-text'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError(''); }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'phone'
                    ? 'bg-watchmate-primary text-white shadow-blue-glow'
                    : 'text-watchmate-muted hover:text-watchmate-text'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone (SMS OTP)</span>
              </button>
            </div>

            {/* EMAIL LOGIN FORM */}
            {authMethod === 'email' && (
              <form onSubmit={handleSubmitEmail} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-watchmate-text mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-watchmate-muted absolute left-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-xs text-watchmate-text focus:outline-none placeholder:text-watchmate-muted focus:ring-1 focus:ring-watchmate-cyan/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-watchmate-text mb-1">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-watchmate-muted absolute left-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-xs text-watchmate-text focus:outline-none placeholder:text-watchmate-muted focus:ring-1 focus:ring-watchmate-cyan/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 btn-primary py-3.5 rounded-2xl text-xs font-semibold shadow-blue-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Signing in...' : 'Sign In with Email'}</span>
                </button>
              </form>
            )}

            {/* PHONE SMS OTP LOGIN FORM */}
            {authMethod === 'phone' && (
              <div className="space-y-3.5">
                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-watchmate-text mb-1">
                        Phone Number (with Country Code)
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="w-4 h-4 text-watchmate-muted absolute left-3.5" />
                        <input
                          type="tel"
                          required
                          placeholder="+1 555 123 4567 or +91 9876543210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-xs text-watchmate-text focus:outline-none placeholder:text-watchmate-muted focus:ring-1 focus:ring-watchmate-cyan/40"
                        />
                      </div>
                      <p className="text-[10px] text-watchmate-muted mt-1.5 pl-1">
                        We'll send you a 6-digit SMS verification code to log in.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-3.5 rounded-2xl text-xs font-semibold shadow-blue-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>{loading ? 'Sending SMS Code...' : 'Send Verification Code'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-3.5">
                    <div className="p-3 rounded-2xl bg-watchmate-cyan/10 border border-watchmate-cyan/30 text-xs text-watchmate-cyan flex items-center justify-between">
                      <span>Code sent to <strong>{phoneNumber}</strong></span>
                      <button
                        type="button"
                        onClick={handleResetPhone}
                        className="text-[11px] font-semibold underline hover:text-white flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Change
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-watchmate-text mb-1">
                        6-Digit Verification Code
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound className="w-4 h-4 text-watchmate-muted absolute left-3.5" />
                        <input
                          type="text"
                          maxLength={6}
                          required
                          autoFocus
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-watchmate-surface border border-watchmate-border focus:border-watchmate-cyan text-center tracking-widest text-base font-mono text-watchmate-text focus:outline-none placeholder:text-watchmate-muted focus:ring-1 focus:ring-watchmate-cyan/40"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary py-3.5 rounded-2xl text-xs font-semibold shadow-blue-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{loading ? 'Verifying...' : 'Verify & Enter WatchMate'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Guest button */}
            <div className="mt-5 pt-4 border-t border-watchmate-border text-center space-y-3">
              <button
                type="button"
                onClick={() => setIsGuestMode(true)}
                className="inline-flex items-center gap-1.5 text-xs text-watchmate-cyan hover:text-watchmate-brightBlue font-semibold transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Fast Join as Guest (No password)</span>
              </button>

              <p className="text-xs text-watchmate-muted">
                Don't have an account?{' '}
                <Link to="/signup" className="text-watchmate-gold hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
