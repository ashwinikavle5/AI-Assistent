import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { ThemeSelector } from '../components/ui/ThemeSelector';
import robotAvatar from '../assets/speakwise-robot.png';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength checker
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-gray-500' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(name.trim(), email.trim(), password, confirmPassword);
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Top Bar */}
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

      {/* Main Container */}
      <div
        className="w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-main)',
          boxShadow: '0 25px 60px -15px var(--accent-glow)'
        }}
      >
        {/* Left Column Visual */}
        <div
          className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-white"
          style={{ background: 'var(--accent-gradient)' }}
        >
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs border border-white/20">
              <Sparkles size={14} /> Start Free Today
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Begin your path to English fluency.
            </h2>
            <p className="text-sm text-white/90 leading-relaxed">
              Create your account to unlock interactive AI tutoring, pronunciation scoring, non-repeating practice questions, and daily streak tracking.
            </p>
          </div>

          <div className="relative z-10 my-8 space-y-3">
            {[
              "100% personalized learning pace",
              "Private, encouraging human-like tutor",
              "Full Roman Marathi understanding",
              "Audio speech synthesis with multiple speeds"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-white/95">
                <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 p-4 rounded-2xl bg-black/15 backdrop-blur-xs border border-white/15 text-xs">
            <p className="font-medium text-white/95">
              🚀 Join thousands of learners mastering spoken English without fear or hesitation.
            </p>
          </div>
        </div>

        {/* Right Column Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-5">
            <div>
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
                Create your account ✨
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Takes less than 30 seconds.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl text-xs flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 animate-in fade-in duration-150">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <User size={17} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Patil"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={17} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-200"
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
                <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
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
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border text-sm outline-none transition-all duration-200"
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

                {/* Password Strength Meter */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl text-white font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50 mt-2"
                style={{
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 8px 20px var(--accent-glow)'
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
