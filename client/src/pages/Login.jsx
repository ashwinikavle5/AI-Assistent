import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThemeSelector } from '../components/ui/ThemeSelector';
import robotAvatar from '../assets/speakwise-robot.png';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Top Bar with Brand & Theme Switcher */}
      <div className="w-full max-w-5xl flex items-center justify-between py-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center p-1 shadow-md overflow-hidden shrink-0"
            style={{
              background: 'var(--accent-gradient)',
              boxShadow: '0 8px 16px var(--accent-glow)'
            }}
          >
            <img
              src={robotAvatar}
              alt="SpeakWise AI Assistant"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-main)' }}>
            SpeakWise <span style={{ color: 'var(--accent-primary)' }}>AI</span>
          </span>
        </div>
        <ThemeSelector />
      </div>

      {/* Main Dual-Column Login Card */}
      <div
        className="w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)',
          boxShadow: '0 25px 60px -15px var(--accent-glow)'
        }}
      >
        {/* Left Column: Visual AI Hero / Value Proposition */}
        <div
          className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-white"
          style={{ background: 'var(--accent-gradient)' }}
        >
          {/* Subtle decorative background circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-black/10 blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs border border-white/20">
              <Sparkles size={14} /> SpeakWise AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Speak confidently. Learn naturally.
            </h2>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              Your friendly AI English companion that truly understands Marathi, Roman Marathi, and English.
            </p>
          </div>

          {/* Value Props */}
          <div className="relative z-10 my-8 space-y-3">
            {[
              "Understands Roman Marathi",
              "Friendly real-time grammar corrections",
              "Interactive pronunciation coach with audio",
              "Persistent daily practice streaks & progress"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-white/95">
                <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Social Proof / Quote */}
          <div className="relative z-10 p-4 rounded-2xl bg-black/15 backdrop-blur-xs border border-white/15 text-xs">
            <p className="italic text-white/90">
              "SpeakWise AI made me overcome my fear of speaking English in college presentations!"
            </p>
            <p className="mt-2 font-semibold text-white text-[11px]">
              — Ashu Kawale
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                Welcome back 👋
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Log in to continue your English learning journey.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 rounded-2xl text-xs flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 animate-in fade-in duration-150">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Email Address or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={17} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="learner@speakwise.ai"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/30"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("To reset your password, please create a new account or change it inside Settings.")}
                    className="text-xs hover:underline cursor-pointer"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500/30"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:opacity-80 transition cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-400 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl text-white font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
                style={{
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 8px 20px var(--accent-glow)'
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Log In to SpeakWise</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Registration link */}
            <div className="text-center pt-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
