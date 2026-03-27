import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MessageSquare, FileText, Megaphone, Users, Shield, Zap, Heart, Cpu, Globe, ArrowRight } from 'lucide-react';

export default function TeamPortalLanding() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) navigate('/synergyhub');
        else setChecking(false);
      } catch {
        setChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const features = [
    { icon: Globe, title: 'Social Wall', description: 'Post updates, share moments, like and comment with the community', color: 'from-rose-500 to-pink-500' },
    { icon: MessageSquare, title: 'Team Messaging', description: 'Group chats and direct messages with your team in real-time', color: 'from-indigo-500 to-violet-500' },
    { icon: Cpu, title: 'AI Assistant', description: 'KCF-trained AI assistant that answers anything intelligently', color: 'from-sky-500 to-cyan-500' },
    { icon: FileText, title: 'Documents', description: 'Upload, organize and share files securely', color: 'from-emerald-500 to-teal-500' },
    { icon: Megaphone, title: 'Announcements', description: 'Stay informed with important team-wide updates', color: 'from-amber-500 to-orange-500' },
    { icon: Users, title: 'Team Directory', description: 'Browse team members, roles and contact details', color: 'from-purple-500 to-fuchsia-500' },
  ];

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
        <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#030712' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}>
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-white text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Kindness Synergy Hub</span>
          </div>
          <button
            onClick={() => base44.auth.redirectToLogin('/synergyhub')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
          >
            Sign In to Enter <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-28 lg:py-36">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(244,63,94,0.12) 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 mb-8" style={{ background: 'rgba(244,63,94,0.06)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">Kindness Community Foundation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Kindness{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">Synergy Hub</span>
          </h1>
          <p className="text-base sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            The team collaboration platform for KCF — connect, communicate, and create impact together.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin('/synergyhub')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all hover:scale-105 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)', boxShadow: '0 0 40px rgba(244,63,94,0.3)' }}
          >
            Sign In to Access <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-white/25 text-sm mt-4">Login required · KCF team members only</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="rounded-2xl p-6 border border-white/[0.06] hover:border-rose-500/20 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${f.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-white/[0.05] py-8 text-center text-white/25 text-sm">
        © 2026 Kindness Community Foundation · Kindness Synergy Hub
      </footer>
    </div>
  );
}