import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const redirect = () => {
    const dest = sessionStorage.getItem('auth_redirect') || '/';
    sessionStorage.removeItem('auth_redirect');
    navigate(dest, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    redirect();
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage('Account created! Check your email to confirm, then sign in.');
    setMode('login');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setMessage('Password reset email sent! Check your inbox.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#030712' }}>
      <div className="w-full max-w-md">

        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm font-medium transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            Kindness Community
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>
          {message && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm text-emerald-300 border border-emerald-500/20" style={{ background: 'rgba(16,185,129,0.08)' }}>
              {message}
            </div>
          )}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm text-rose-300 border border-rose-500/20" style={{ background: 'rgba(244,63,94,0.08)' }}>
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none border border-white/[0.08] focus:border-rose-500/50 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none border border-white/[0.08] focus:border-rose-500/50 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-white text-sm outline-none border border-white/[0.08] focus:border-rose-500/50 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' && (loading ? 'Signing in…' : 'Sign In')}
              {mode === 'signup' && (loading ? 'Creating account…' : 'Create Account')}
              {mode === 'reset' && (loading ? 'Sending…' : 'Send Reset Email')}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center space-y-2 text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('reset'); setError(''); setMessage(''); }} className="text-white/40 hover:text-rose-400 transition-colors block w-full">
                  Forgot password?
                </button>
                <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="text-white/40 hover:text-white transition-colors block w-full">
                  Don't have an account? <span className="text-rose-400 font-semibold">Sign up</span>
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="text-white/40 hover:text-white transition-colors">
                Already have an account? <span className="text-rose-400 font-semibold">Sign in</span>
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="text-white/40 hover:text-white transition-colors">
                ← Back to Sign In
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 Kindness Community Foundation ·{' '}
          <Link to="/" className="hover:text-white/50 transition-colors">kindness-community-ai.netlify.app</Link>
        </p>
      </div>
    </div>
  );
}
