import { useEffect } from "react";
import Header from "@/components/kcf/Header";
import Footer from "@/components/kcf/Footer";
import KindWaveApp from "@/components/kindwave/KindWaveApp";

const FEATURES = [
  { emoji: "🗺️", title: "Live Kindness Map",    desc: "See real-time help requests pinned near you — urgent rides, emotional support, community drives." },
  { emoji: "💚", title: "Help Feed",             desc: "Swipe through requests, toggle your availability, and connect with people who need exactly what you can give." },
  { emoji: "✦",  title: "Healing Journal",       desc: "Track your giving streak, log moments of kindness, and watch your wellbeing grow with every act." },
  { emoji: "🏆", title: "XP & Badges",           desc: "Earn recognition as you help — from First Ripple to Month of Grace. Kindness has its own leaderboard." },
];

const STATS = [
  { value: "5",    label: "Help categories" },
  { value: "GPS",  label: "Real-time matching" },
  { value: "0ms",  label: "Instant connect" },
];

export default function KindWaveAppPage() {
  useEffect(() => {
    return () => {
      document.head.querySelectorAll("style").forEach((el) => {
        if (el.textContent.includes("Plus Jakarta Sans")) el.remove();
      });
    };
  }, []);

  return (
    <div style={{ background: "#02040f", width: "100%", minHeight: "100vh", "--kw-offset": "80px" }}>
      <Header />

      <style>{`
        .kw-layout {
          display: flex;
          min-height: calc(100vh - 80px);
          padding-top: 80px;
        }
        /* ── Left hero panel ── */
        .kw-hero {
          flex: 1;
          min-width: 0;
          padding: 64px 56px 64px 72px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
          position: relative;
          overflow: hidden;
        }
        .kw-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 0% 40%, rgba(0,232,180,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 100% 80%, rgba(133,128,255,0.05) 0%, transparent 60%);
          pointer-events: none;
        }
        /* ── Right app panel ── */
        .kw-app-panel {
          width: 440px;
          flex-shrink: 0;
          height: calc(100vh - 80px);
          position: sticky;
          top: 80px;
          border-left: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          background: #05091a;
        }
        /* ── Typography ── */
        .kw-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,232,180,0.1);
          border: 1px solid rgba(0,232,180,0.25);
          border-radius: 100px;
          padding: 6px 14px;
          color: #00e8b4;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          width: fit-content;
          margin-bottom: 28px;
        }
        .kw-badge-dot {
          width: 7px; height: 7px;
          background: #00e8b4;
          border-radius: 50%;
          animation: kwPulse 2s ease-in-out infinite;
        }
        @keyframes kwPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.4; transform:scale(1.6); }
        }
        .kw-headline {
          font-family: 'Syne', 'Inter', sans-serif;
          font-size: clamp(36px, 3.8vw, 58px);
          font-weight: 800;
          line-height: 1.1;
          color: #eef6ff;
          margin: 0 0 20px;
          letter-spacing: -0.02em;
        }
        .kw-headline span { color: #00e8b4; }
        .kw-tagline {
          font-size: clamp(15px, 1.2vw, 17px);
          color: #6b9fc2;
          line-height: 1.65;
          margin: 0 0 44px;
          max-width: 480px;
        }
        /* ── Feature list ── */
        .kw-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 48px;
        }
        .kw-feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .kw-feature-icon {
          width: 40px; height: 40px;
          flex-shrink: 0;
          background: rgba(0,232,180,0.08);
          border: 1px solid rgba(0,232,180,0.18);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-top: 2px;
        }
        .kw-feature-title {
          font-size: 15px;
          font-weight: 700;
          color: #eef6ff;
          margin-bottom: 3px;
        }
        .kw-feature-desc {
          font-size: 13px;
          color: #4a7a9b;
          line-height: 1.55;
        }
        /* ── Stats ── */
        .kw-stats {
          display: flex;
          gap: 32px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .kw-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #00e8b4;
          font-family: 'Syne', 'Inter', sans-serif;
          line-height: 1;
          margin-bottom: 4px;
        }
        .kw-stat-label {
          font-size: 12px;
          color: #4a7a9b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        /* ── Responsive ── */
        @media (max-width: 900px) {
          .kw-layout { flex-direction: column; padding-top: 80px; }
          .kw-hero { padding: 48px 24px 40px; justify-content: flex-start; }
          .kw-app-panel {
            width: 100%;
            height: calc(100vh - 80px);
            position: relative;
            top: 0;
            border-left: none;
            border-top: 1px solid rgba(255,255,255,0.07);
          }
          .kw-stats { gap: 24px; }
        }
        @media (max-width: 600px) {
          .kw-hero { padding: 36px 20px 32px; }
          .kw-features { gap: 16px; }
        }
      `}</style>

      <div className="kw-layout">

        {/* ── Left: Hero + Features ── */}
        <div className="kw-hero">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="kw-badge">
              <span className="kw-badge-dot" />
              Now Live · Free to Join
            </div>

            <h1 className="kw-headline">
              Help Others,<br />
              <span>Heal Yourself</span>
            </h1>

            <p className="kw-tagline">
              KindWave is a GPS-powered community app where every act of giving —
              a ride, a kind word, a prayer — is the fastest path to your own healing.
            </p>

            <div className="kw-features">
              {FEATURES.map((f) => (
                <div className="kw-feature" key={f.title}>
                  <div className="kw-feature-icon">{f.emoji}</div>
                  <div>
                    <div className="kw-feature-title">{f.title}</div>
                    <div className="kw-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="kw-stats">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="kw-stat-value">{s.value}</div>
                  <div className="kw-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Interactive App ── */}
        <div className="kw-app-panel">
          <KindWaveApp />
        </div>

      </div>

      <Footer hideCta />
    </div>
  );
}
