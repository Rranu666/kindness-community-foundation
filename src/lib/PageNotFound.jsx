import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#030712', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 20%, rgba(244,63,94,0.07) 0%, transparent 70%)' }}
      />

      <div className="text-center max-w-md relative z-10">
        {/* 404 number */}
        <div className="mb-6">
          <span
            className="text-[8rem] font-black leading-none text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, rgba(244,63,94,0.4), rgba(236,72,153,0.2))' }}
          >
            404
          </span>
        </div>

        <div
          className="w-px h-12 mx-auto mb-6"
          style={{ background: 'linear-gradient(to bottom, rgba(244,63,94,0.5), transparent)' }}
        />

        <h2 className="text-2xl font-black text-white mb-3">Page Not Found</h2>
        <p className="text-white/40 leading-relaxed mb-8 text-sm">
          {pageName
            ? <>The page <span className="text-white/60 font-medium">"{pageName}"</span> doesn't exist or has been moved.</>
            : <>This page doesn't exist or has been moved.</>}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/70 hover:text-white text-sm font-semibold border border-white/[0.08] hover:border-white/20 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #ec4899)' }}
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-10">
          © {new Date().getFullYear()} Kindness Community Foundation
        </p>
      </div>
    </div>
  );
}
