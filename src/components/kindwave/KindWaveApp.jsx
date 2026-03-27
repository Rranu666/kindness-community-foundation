import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   KINDWAVE 3.0  ·  "Deep Space Bioluminescence"
   Font: Syne (display) + Plus Jakarta Sans (body)
   Philosophy: Healing flows from serving others first
═══════════════════════════════════════════════════════ */

// ── Design Tokens ─────────────────────────────────────
const T = {
  void:     "#02040f",
  deep:     "#05091a",
  navy:     "#08122a",
  panel:    "rgba(8,18,42,0.78)",
  glass:    "rgba(255,255,255,0.045)",
  teal:     "#00e8b4",
  tealDim:  "#00bf94",
  tealGlow: "rgba(0,232,180,0.22)",
  gold:     "#ffc43d",
  goldLow:  "rgba(255,196,61,0.18)",
  urgent:   "#ff3d5a",
  warm:     "#ff7b3a",
  violet:   "#8580ff",
  emerald:  "#1de99b",
  rose:     "#ff5e9e",
  white:    "#eef6ff",
  muted:    "#4a7a9b",
  border:   "rgba(255,255,255,0.07)",
  borderHi: "rgba(0,232,180,0.28)",
};

// ── Gamification Data ──────────────────────────────────
const LEVELS = [
  { name:"Seedling",  emoji:"🌱", min:0,    max:100  },
  { name:"Helper",    emoji:"🤝", min:100,  max:300  },
  { name:"Beacon",    emoji:"💫", min:300,  max:700  },
  { name:"Guide",     emoji:"🌟", min:700,  max:1500 },
  { name:"Guardian",  emoji:"🛡️", min:1500, max:9999 },
];

const BADGES = [
  { id:"journey",   name:"Journey Begun",   emoji:"🚀", desc:"Completed onboarding",              xp:30  },
  { id:"first",     name:"First Ripple",    emoji:"🌊", desc:"Helped someone for the first time",  xp:50  },
  { id:"listener",  name:"Kind Ear",        emoji:"👂", desc:"Gave emotional support",             xp:40  },
  { id:"verified",  name:"Trusted Heart",   emoji:"💚", desc:"Verified identity",                  xp:20  },
  { id:"streak3",   name:"3-Day Flame",     emoji:"🔥", desc:"Helped 3 days in a row",             xp:60  },
  { id:"streak7",   name:"Week Warrior",    emoji:"🌟", desc:"7-day kindness streak",              xp:120 },
  { id:"streak30",  name:"Month of Grace",  emoji:"🏆", desc:"30-day kindness streak",             xp:400 },
  { id:"video1",    name:"Live Helper",     emoji:"📹", desc:"First instant video help session",   xp:80  },
  { id:"share1",    name:"Ripple Spreader", emoji:"✨", desc:"Shared your first impact card",      xp:25  },
];

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const LEAGUE = [
  { name:"Priya T.",    avatar:"🌸", streak:28, ripples:84  },
  { name:"Hamid A.",    avatar:"⭐", streak:21, ripples:63  },
  { name:"Mrs. Kapoor", avatar:"🌙", streak:14, ripples:42  },
  { name:"Green GGN",   avatar:"🌱", streak:9,  ripples:27  },
];

// ── Help Categories ────────────────────────────────────
const CATS = [
  { id:"urgent",    label:"Urgent Physical",    color:T.urgent,  emoji:"🚨", desc:"Emergency non-medical help" },
  { id:"emotional", label:"Emotional Support",  color:T.warm,    emoji:"💬", desc:"Listening & encouragement"  },
  { id:"prayer",    label:"Prayer & Spiritual", color:T.violet,  emoji:"🙏", desc:"Faith & spiritual support"   },
  { id:"general",   label:"General Help",       color:T.emerald, emoji:"✅", desc:"Errands, tasks, guidance"    },
  { id:"community", label:"Community Group",    color:T.rose,    emoji:"🏘️", desc:"Events & volunteering"       },
];

// ── Seed Data ──────────────────────────────────────────
const PINS = [
  { id:1, title:"Need a ride to Medanta",      cat:"urgent",    urgency:"Urgent",   x:36,y:40, user:"Aanya S.",    time:"3m",  desc:"Car broke down near Sector 14. Hospital appointment urgent.", verified:true  },
  { id:2, title:"Someone to talk to tonight",  cat:"emotional", urgency:"Standard", x:58,y:28, user:"Anonymous",   time:"11m", desc:"Going through a rough week. Just need a kind ear.",          verified:false },
  { id:3, title:"Prayer circle this Sunday",   cat:"prayer",    urgency:"Flexible", x:72,y:54, user:"Faith Circle",time:"1h",  desc:"Open interfaith prayer at DLF park. All are welcome.",       verified:true  },
  { id:4, title:"Help carrying groceries",     cat:"general",   urgency:"Standard", x:23,y:66, user:"Mrs. Kapoor", time:"18m", desc:"3rd floor, lift broken. Heavy bags from the market.",        verified:true  },
  { id:5, title:"Neighbourhood cleanup drive", cat:"community", urgency:"Flexible", x:64,y:74, user:"Green GGN",   time:"2h",  desc:"Saturday 8am, Sector 56 park. Gloves provided!",            verified:true  },
  { id:6, title:"Stranded at metro station",   cat:"urgent",    urgency:"Urgent",   x:47,y:57, user:"Rahul M.",    time:"1m",  desc:"Wallet stolen. Need cab fare home to Sector 82.",           verified:false },
  { id:7, title:"Grief support needed",        cat:"emotional", urgency:"Standard", x:82,y:33, user:"Anonymous",   time:"43m", desc:"Lost someone last week. Feeling very alone.",               verified:false },
  { id:8, title:"Tutor for kids (Math)",       cat:"general",   urgency:"Flexible", x:17,y:44, user:"Priya T.",    time:"3h",  desc:"2 kids need help with Math & Science, Grade 7-8.",          verified:true  },
];

const AVATARS = ["🌟","🌊","🌱","💚","🦋","☀️","🌙","⭐","🔮","🌸","🦄","🎯"];

// ── Global CSS ─────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:${T.tealDim}44;border-radius:3px}
input,textarea,button{font-family:'Plus Jakarta Sans',sans-serif}

@keyframes fadeUp    {from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn    {from{opacity:0} to{opacity:1}}
@keyframes scaleIn   {from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)}}
@keyframes slideL    {from{opacity:0;transform:translateX(36px)} to{opacity:1;transform:translateX(0)}}
@keyframes slideR    {from{opacity:0;transform:translateX(-36px)} to{opacity:1;transform:translateX(0)}}
@keyframes float3d   {0%,100%{transform:perspective(500px) rotateX(0deg) rotateY(0deg) translateZ(0px)} 33%{transform:perspective(500px) rotateX(5deg) rotateY(-4deg) translateZ(10px)} 66%{transform:perspective(500px) rotateX(-4deg) rotateY(5deg) translateZ(14px)}}
@keyframes heartbeat {0%,100%{transform:scale(1)} 50%{transform:scale(1.14)}}
@keyframes pulse     {0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(1.9)}}
@keyframes rippleOut {0%{transform:scale(.5);opacity:.9} 100%{transform:scale(4);opacity:0}}
@keyframes orbFloat  {0%,100%{transform:translate(0,0)} 38%{transform:translate(28px,-20px)} 70%{transform:translate(-18px,14px)}}
@keyframes glow      {0%,100%{box-shadow:0 0 20px ${T.tealGlow}} 50%{box-shadow:0 0 42px rgba(0,232,180,.42)}}
@keyframes pinBounce {0%{transform:translate(-50%,-100%) scale(0.15);opacity:0} 65%{transform:translate(-50%,-100%) scale(1.12)} 100%{transform:translate(-50%,-100%) scale(1);opacity:1}}
@keyframes msgIn     {from{opacity:0;transform:scale(.88) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes xpFill    {from{width:0%} to{width:var(--xp-w,60%)}}
@keyframes badgeIn   {0%{opacity:0;transform:scale(0.2) rotate(-20deg)} 60%{transform:scale(1.18) rotate(4deg)} 80%{transform:scale(.96) rotate(-1deg)} 100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes confetti  {0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(120px) rotate(540deg);opacity:0}}
@keyframes shimmer   {0%{background-position:200% 50%} 100%{background-position:-200% 50%}}
@keyframes countUp   {from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1}}
@keyframes popIn     {0%{transform:scale(0);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1}}
@keyframes goldShine {0%,100%{text-shadow:0 0 8px ${T.goldLow}} 50%{text-shadow:0 0 22px rgba(255,196,61,.5)}}
@keyframes tooltipIn {from{opacity:0;transform:translateY(8px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes fireDance {0%,100%{transform:scale(1) rotate(-2deg)} 33%{transform:scale(1.12) rotate(2deg)} 66%{transform:scale(1.06) rotate(-1deg)}}
@keyframes sonarRing {0%{transform:scale(.4);opacity:.9} 100%{transform:scale(2.8);opacity:0}}
@keyframes radarSpin {from{transform:rotate(0deg)} to{transform:rotate(360deg)}}
@keyframes cardReveal{0%{opacity:0;transform:scale(.82) translateY(32px)} 70%{transform:scale(1.03) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes streakPop {0%{transform:scale(0) rotate(-15deg);opacity:0} 65%{transform:scale(1.18) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes dotBounce {0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)}}
@keyframes callPulse {0%,100%{box-shadow:0 0 0 0 rgba(29,233,155,.5)} 50%{box-shadow:0 0 0 16px rgba(29,233,155,0)}}
@keyframes shieldFloat{0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)}}
@keyframes heatIn    {from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)}}
@keyframes pulseRing {0%{box-shadow:0 0 0 0 rgba(0,232,180,.55),0 4px 26px rgba(0,232,180,.22)} 70%{box-shadow:0 0 0 18px rgba(0,232,180,0),0 4px 26px rgba(0,232,180,.22)} 100%{box-shadow:0 0 0 0 rgba(0,232,180,0),0 4px 26px rgba(0,232,180,.22)}}

.fu{animation:fadeUp  .52s cubic-bezier(.22,1,.36,1) both}
.si{animation:scaleIn .4s  cubic-bezier(.22,1,.36,1) both}
.sl{animation:slideL  .45s cubic-bezier(.22,1,.36,1) both}
.sr{animation:slideR  .45s cubic-bezier(.22,1,.36,1) both}
.d1{animation-delay:.06s}.d2{animation-delay:.14s}.d3{animation-delay:.22s}
.d4{animation-delay:.30s}.d5{animation-delay:.40s}.d6{animation-delay:.52s}

.glass   {background:${T.panel};backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid ${T.border}}
.glassHi {background:rgba(8,18,42,.92);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);border:1px solid ${T.borderHi}}
.neu     {background:linear-gradient(145deg,rgba(14,28,65,.92),rgba(5,9,26,.96));box-shadow:6px 6px 16px rgba(0,0,0,.55),-3px -3px 8px rgba(255,255,255,.022)}
.press   {transition:transform .12s;cursor:pointer}
.press:active{transform:scale(.955)}
.hov     {transition:transform .22s,box-shadow .22s}
.hov:hover{transform:translateY(-3px)}
.btn-p   {background:linear-gradient(135deg,${T.teal},${T.tealDim});color:${T.deep};border:none;border-radius:16px;padding:16px 28px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 26px ${T.tealGlow};transition:transform .12s,box-shadow .15s;width:100%}
.btn-p:hover{transform:translateY(-1px);box-shadow:0 8px 34px rgba(0,232,180,.42),0 0 0 1px rgba(0,232,180,.2)}
.btn-p:active{transform:scale(.962)}
.btn-pulse{animation:pulseRing 2.2s ease-out infinite}
.btn-s   {background:rgba(255,255,255,.05);border:1px solid ${T.border};border-radius:16px;padding:15px 28px;font-size:15px;font-weight:600;color:${T.muted};cursor:pointer;width:100%;transition:all .2s}
.btn-s:hover{border-color:${T.borderHi};color:${T.white};background:rgba(0,232,180,.08)}
.inp     {width:100%;background:rgba(255,255,255,.04);border:1px solid ${T.border};border-radius:14px;padding:14px 18px;color:${T.white};font-size:15px;outline:none;transition:border-color .2s,box-shadow .2s}
.inp:focus{border-color:${T.tealDim};box-shadow:0 0 0 3px rgba(0,232,180,.15)}
.inp::placeholder{color:${T.muted}}
`;

// ── Utilities ──────────────────────────────────────────
const catOf   = (id) => CATS.find(c => c.id === id) || CATS[3];
const levelOf = (xp) => LEVELS.reduce((best, l) => xp >= l.min ? l : best, LEVELS[0]);
const xpPct   = (xp) => {
  const lv = levelOf(xp);
  return Math.round(((xp - lv.min) / (lv.max - lv.min)) * 100);
};

// ══════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════

function ParticleCanvas() {
  const ref = useRef();
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let raf;
    const resize = () => { cvs.width = cvs.offsetWidth; cvs.height = cvs.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * 2000, y: Math.random() * 2000,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.5 + .35, a: Math.random() * Math.PI * 2,
    }));
    const tick = () => {
      const W = cvs.width, H = cvs.height;
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.a += .007;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const op = (Math.sin(p.a) + 1) / 2 * .52;
        ctx.beginPath(); ctx.arc(p.x % W, p.y % H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,232,180,${op})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 105) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,232,180,${.11 * (1 - d / 105)})`; ctx.lineWidth = .5; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

function OrbBg({ cols }) {
  const colors = cols || [T.teal, T.violet, T.warm];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {colors.map((col, i) => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          width: 260 + i * 80 + "px", height: 260 + i * 80 + "px",
          background: `radial-gradient(circle, ${col}16 0%, transparent 68%)`,
          left: `${[12, 54, 30][i % 3]}%`, top: `${[6, 50, 80][i % 3]}%`,
          transform: "translate(-50%,-50%)",
          animation: `orbFloat ${7 + i * 3}s ease-in-out infinite`,
          animationDelay: `${i * 2.4}s`,
        }} />
      ))}
    </div>
  );
}

function TiltCard({ children, style, className, onClick }) {
  const ref = useRef();
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-y * 11}deg) rotateY(${x * 11}deg) translateZ(8px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)"; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick}
      style={{ transition: "transform .35s ease", ...style }} className={className}>
      {children}
    </div>
  );
}

function XPBar({ xp, inline }) {
  const lv = levelOf(xp);
  const pct = xpPct(xp);
  if (inline) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>{lv.emoji}</span>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.08)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg,${T.teal},${T.tealDim})`, borderRadius: 3, width: pct + "%", transition: "width 1s cubic-bezier(.22,1,.36,1)" }} />
      </div>
      <span style={{ fontSize: 11, color: T.teal, fontWeight: 700 }}>{xp} XP</span>
    </div>
  );
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: T.teal, fontSize: 13, fontWeight: 700 }}>{lv.emoji} {lv.name}</span>
        <span style={{ color: T.muted, fontSize: 12 }}>{xp} / {lv.max} XP</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ "--xp-w": pct + "%", height: "100%", background: `linear-gradient(90deg,${T.teal},${T.tealDim})`, borderRadius: 4, animation: "xpFill 1.2s .3s cubic-bezier(.22,1,.36,1) both" }} className="xp-bar-fill" />
      </div>
    </div>
  );
}

function BadgeUnlock({ badge, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2,4,15,.82)", backdropFilter: "blur(18px)", animation: "fadeIn .3s both" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 88, animation: "badgeIn .7s cubic-bezier(.22,1,.36,1) both", display: "block", marginBottom: 20 }}>{badge.emoji}</div>
        <div style={{ color: T.gold, fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6, animation: "goldShine 2s infinite" }}>{badge.name}</div>
        <div style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>{badge.desc}</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.goldLow, border: `1px solid ${T.gold}44`, borderRadius: 20, padding: "8px 20px", color: T.gold, fontWeight: 700, fontSize: 15, animation: "popIn .5s .4s both" }}>
          +{badge.xp} XP earned!
        </div>
      </div>
    </div>
  );
}

function XPToast({ xp, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", top: 70, right: 16, zIndex: 8000, background: T.goldLow, border: `1px solid ${T.gold}55`, borderRadius: 14, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, animation: "slideL .35s both", backdropFilter: "blur(20px)" }}>
      <span style={{ fontSize: 18 }}>⭐</span>
      <span style={{ color: T.gold, fontWeight: 700, fontSize: 15 }}>+{xp} XP</span>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="glassHi" style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", borderRadius: 16, padding: "13px 20px", color: T.white, fontSize: 14, zIndex: 9500, display: "flex", gap: 10, alignItems: "center", boxShadow: `0 8px 32px rgba(0,0,0,.55),0 0 40px ${T.tealGlow}`, maxWidth: "90vw", animation: "fadeUp .32s both" }}>
      <span>{msg}</span>
      <button onClick={onDone} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16 }}>✕</button>
    </div>
  );
}

function ToggleSwitch({ def }) {
  const [on, setOn] = useState(def ?? false);
  return (
    <div onClick={() => setOn(v => !v)} style={{ width: 48, height: 26, borderRadius: 13, cursor: "pointer", flexShrink: 0, background: on ? `linear-gradient(90deg,${T.teal},${T.tealDim})` : "rgba(255,255,255,.09)", position: "relative", boxShadow: on ? `0 0 12px ${T.tealGlow}` : "none", transition: "all .3s" }}>
      <div style={{ position: "absolute", top: 3, left: on ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .3s", boxShadow: "0 1px 5px rgba(0,0,0,.35)" }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ONBOARDING SCREENS
// ══════════════════════════════════════════════════════

// Step 0 — Cinematic Splash
function OnboardSplash({ onNext }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "40px 28px", textAlign: "center", overflow: "hidden" }}>
      <ParticleCanvas />
      <OrbBg />
      <div style={{ position: "relative", zIndex: 1, opacity: show ? 1 : 0, transition: "opacity .6s" }}>
        {/* 3D floating logo */}
        {/* KCF Logo */}
        <div style={{ animation: "float3d 7s ease-in-out infinite", marginBottom: 32, display: "inline-block", filter: `drop-shadow(0 0 28px rgba(0,232,180,.45))` }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
            {/* Icon mark */}
            <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style={{ width: 72, height: 72, overflow: "visible" }}>
              <style>{`
                .kcf-bg2   { animation: kcfSquarePop2 .7s cubic-bezier(.34,1.56,.64,1) both; transform-origin:50% 50%; }
                .kcf-stem2 { animation: kcfStemGrow2  .45s .5s cubic-bezier(.22,1,.36,1) both; transform-origin:50% 100%; }
                .kcf-armu2 { animation: kcfArmIn2 .4s .72s cubic-bezier(.22,1,.36,1) both; transform-origin:left center; }
                .kcf-armd2 { animation: kcfArmIn2 .4s .84s cubic-bezier(.22,1,.36,1) both; transform-origin:left center; }
                .kcf-dot2  { animation: kcfDotPop2 .35s 1s cubic-bezier(.34,1.56,.64,1) both; transform-origin:50% 50%; }
                .kcf-hrt2  { transform-origin:50% 58%; animation: kcfHrtIn2 .5s 1.15s cubic-bezier(.34,1.56,.64,1) both, kcfHrtBeat2 2.4s 2s ease-in-out infinite; }
                @keyframes kcfSquarePop2 { 0%{transform:scale(0) rotate(-12deg);opacity:0} 100%{transform:scale(1) rotate(0);opacity:1} }
                @keyframes kcfStemGrow2  { 0%{transform:scaleY(0);opacity:0} 100%{transform:scaleY(1);opacity:1} }
                @keyframes kcfArmIn2     { 0%{transform:translateX(-10px) scaleX(0);opacity:0} 100%{transform:translateX(0) scaleX(1);opacity:1} }
                @keyframes kcfDotPop2    { 0%{transform:scale(0);opacity:0} 100%{transform:scale(1);opacity:1} }
                @keyframes kcfHrtIn2     { 0%{transform:scale(0) rotate(-20deg);opacity:0} 100%{transform:scale(1) rotate(0);opacity:1} }
                @keyframes kcfHrtBeat2   { 0%,100%{transform:scale(1)} 14%{transform:scale(1.28)} 28%{transform:scale(1)} 42%{transform:scale(1.16)} 56%{transform:scale(1)} }
              `}</style>
              <rect className="kcf-bg2"   x="0" y="0" width="96" height="96" rx="17" fill="#00e8b4" />
              <rect className="kcf-stem2" x="22" y="19" width="17" height="58" rx="4" fill="#04091a" />
              <polygon className="kcf-armu2" points="39,48 72,19 83,19 83,31 50,52" fill="#04091a" />
              <polygon className="kcf-armd2" points="39,52 72,77 83,77 83,65 50,46" fill="#04091a" />
              <circle  className="kcf-dot2"  cx="68" cy="27" r="5" fill="#00e8b4" />
              <path    className="kcf-hrt2"
                d="M50,50 C50,50 40,43 40,49 C40,55 50,62 50,62 C50,62 60,55 60,49 C60,43 50,50 50,50Z"
                fill="#04091a" />
            </svg>
            {/* Wordmark */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: T.white, letterSpacing: -1, lineHeight: 1 }}>
                {"kindness".split("").map((ch, i) => (
                  <span key={i} style={{ display: "inline-block", animation: `fadeUp .45s ${.55 + i * .06}s cubic-bezier(.22,1,.36,1) both` }}>{ch}</span>
                ))}
              </div>
              <div style={{ height: 1.5, background: T.teal, opacity: .35, transformOrigin: "left", animation: "xpFill .55s 1.05s cubic-bezier(.22,1,.36,1) both", "--xp-w": "100%" }} className="xp-bar-fill" />
              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 9, letterSpacing: 3, color: T.tealDim, textTransform: "uppercase", animation: "fadeUp .55s 1.28s ease both" }}>
                Community Foundation
              </div>
            </div>
          </div>
        </div>

        <h1 className="fu" style={{ fontFamily: "'Syne',sans-serif", fontSize: 56, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5, color: T.white, marginBottom: 6, textShadow: `0 0 40px rgba(0,232,180,.18)` }}>
          Help Others
        </h1>
        <h1 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontSize: 56, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5, background: `linear-gradient(90deg,${T.teal},${T.violet})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 28 }}>
          Heal Yourself
        </h1>

        <p className="fu d2" style={{ color: "#6b9fc2", fontSize: 17, lineHeight: 1.72, maxWidth: 300, margin: "0 auto 36px" }}>
          A GPS-powered community of kindness — where giving is the fastest path to healing.
        </p>

        {/* Category dots */}
        <div className="fu d3" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
          {CATS.map(c => (
            <span key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, background: `${c.color}18`, border: `1px solid ${c.color}50`, borderRadius: 20, padding: "8px 16px", color: c.color, fontSize: 13, fontWeight: 600, boxShadow: `0 0 12px ${c.color}25` }}>
              {c.emoji} {c.id}
            </span>
          ))}
        </div>

        <button className="btn-p press btn-pulse fu d4" onClick={onNext} style={{ marginBottom: 14 }}>
          Begin Your Journey ✦
        </button>
        <p className="fu d5" style={{ color: "#6b9fc2", fontSize: 11 }}>KCF LLC · California, USA · v3.0</p>
      </div>
    </div>
  );
}

// Step 1 — Value Proposition (Swipeable Story Cards)
function OnboardValueProp({ onNext }) {
  const [idx, setIdx] = useState(0);
  const cards = [
    { emoji: "🗺️", color: T.teal,   title: "Live GPS Help Map",        body: "Real-time color-coded pins show who needs help near you. Filter by urgency, category, and distance in seconds." },
    { emoji: "💜", color: T.violet,  title: "Healing Through Service",   body: "Science-backed: helping others releases serotonin and oxytocin — literally healing you while you help them." },
    { emoji: "🌊", color: T.warm,    title: "Your Ripple Effect",        body: "Every act of kindness is tracked. Watch your personal ripple expand across your community over time." },
  ];
  const go = (n) => { if (n >= cards.length) { onNext(); return; } setIdx(n); };
  const c = cards[idx];
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "48px 24px 32px", minHeight: "100%", position: "relative" }}>
      <OrbBg cols={[c.color, T.teal, T.violet]} />
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, marginBottom: 36, position: "relative", zIndex: 1 }}>
        {cards.map((_, i) => (
          <div key={i} style={{ flex: i === idx ? 2 : 1, height: 6, borderRadius: 3, background: i <= idx ? T.teal : T.border, transition: "all .4s", boxShadow: i === idx ? `0 0 10px ${T.teal}` : "none" }} />
        ))}
      </div>

      <div style={{ flex: 1, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <TiltCard key={idx} style={{ background: T.panel, border: `1.5px solid ${c.color}60`, borderRadius: 26, padding: "40px 28px", textAlign: "center", marginBottom: 32, boxShadow: `0 24px 60px rgba(0,0,0,.55), 0 0 50px ${c.color}18, inset 0 1px 0 rgba(255,255,255,.06)` }}>
          <div style={{ fontSize: 84, marginBottom: 24, animation: "float3d 6s ease-in-out infinite", display: "inline-block", filter: `drop-shadow(0 0 28px ${c.color}80)` }}>{c.emoji}</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.white, marginBottom: 14, lineHeight: 1.2 }}>{c.title}</h2>
          <p style={{ color: "#6b9fc2", fontSize: 15, lineHeight: 1.75 }}>{c.body}</p>
        </TiltCard>

        <div style={{ display: "flex", gap: 10 }}>
          {idx > 0 && (
            <button className="btn-s press" onClick={() => go(idx - 1)} style={{ width: "auto", padding: "15px 22px", flex: 0 }}>←</button>
          )}
          <button className="btn-p press" onClick={() => go(idx + 1)}>
            {idx < cards.length - 1 ? "Next →" : "Got it! Let's go →"}
          </button>
        </div>
      </div>

      <button onClick={onNext} style={{ background: "none", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", textAlign: "center", marginTop: 16, position: "relative", zIndex: 1 }}>
        Skip intro
      </button>
    </div>
  );
}

// Step 2 — Quick Auth
function OnboardAuth({ onNext, profile, setProfile }) {
  const [mode, setMode] = useState("options"); // options | email
  const [email, setEmail] = useState("");

  const continueEmail = () => {
    if (!email.includes("@")) return;
    setProfile(p => ({ ...p, email }));
    onNext();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "48px 24px 32px", minHeight: "100%", position: "relative" }}>
      <OrbBg cols={[T.teal, T.emerald]} />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p className="fu" style={{ color: T.tealDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>Step 1 of 4</p>
        <h2 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: T.white, marginBottom: 8 }}>How would you<br />like to continue?</h2>
        <p className="fu d2" style={{ color: "#6b9fc2", fontSize: 14, marginBottom: 36 }}>No passwords required. We respect your privacy.</p>

        {mode === "options" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TiltCard className="fu d2" onClick={() => setMode("email")} style={{ background: T.panel, border: `1px solid ${T.borderHi}`, borderRadius: 18, padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 8px 30px rgba(0,0,0,.3)` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.teal}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: `0 0 14px ${T.tealGlow}` }}>📧</div>
              <div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>Continue with Email</div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>Quick & secure one-time code</div>
              </div>
            </TiltCard>

            <TiltCard className="fu d3" onClick={onNext} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: `0 8px 30px rgba(0,0,0,.3)` }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📱</div>
              <div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>Continue with Phone</div>
                <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>Verified & trusted in community</div>
              </div>
            </TiltCard>

            <button className="btn-s press fu d4" onClick={onNext} style={{ marginTop: 8 }}>
              Skip for now — explore first
            </button>
          </div>
        )}

        {mode === "email" && (
          <div style={{ animation: "slideL .38s both" }}>
            <label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email Address</label>
            <input className="inp" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && continueEmail()} style={{ marginBottom: 14 }} />
            <button className="btn-p press" onClick={continueEmail} style={{ opacity: email.includes("@") ? 1 : .4 }}>Send Magic Link →</button>
            <button className="btn-s press" onClick={() => setMode("options")} style={{ marginTop: 10 }}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 3 — Smart Goal Quiz (3D Tilt Cards)
function OnboardGoal({ onNext, profile, setProfile }) {
  const [sel, setSel] = useState(profile.goal || null);
  const goals = [
    { id: "give",    emoji: "🤝", color: T.teal,   title: "Give Help",        sub: "I want to support others in my community" },
    { id: "receive", emoji: "🙏", color: T.violet, title: "Receive Help",      sub: "I could use some support right now" },
    { id: "both",    emoji: "💚", color: T.warm,   title: "Both — Give & Receive", sub: "I want to connect deeply with community" },
  ];
  const pick = (id) => {
    setSel(id);
    setProfile(p => ({ ...p, goal: id }));
    setTimeout(onNext, 380);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "48px 24px 32px", minHeight: "100%", position: "relative" }}>
      <OrbBg cols={[T.violet, T.teal, T.warm]} />
      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <p className="fu" style={{ color: T.tealDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>Step 2 of 4</p>
        <h2 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.white, marginBottom: 8, lineHeight: 1.2 }}>What brings you<br />to KindWave?</h2>
        <p className="fu d2" style={{ color: "#6b9fc2", fontSize: 14, marginBottom: 32 }}>We'll personalise your experience.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {goals.map((g, i) => {
            const isSel = sel === g.id;
            return (
              <TiltCard key={g.id} className={`fu d${i + 2} press`} onClick={() => pick(g.id)} style={{ background: isSel ? `${g.color}18` : T.panel, border: `2px solid ${isSel ? g.color : T.border}`, borderRadius: 20, padding: "20px 22px", display: "flex", gap: 16, alignItems: "center", boxShadow: isSel ? `0 0 30px ${g.color}28, 0 10px 30px rgba(0,0,0,.3)` : `0 8px 28px rgba(0,0,0,.28)`, transition: "border-color .25s, background .25s, box-shadow .25s" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: isSel ? `${g.color}28` : `${g.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, boxShadow: isSel ? `0 0 18px ${g.color}44` : "none", transition: "all .25s" }}>{g.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: isSel ? g.color : T.white, fontWeight: 700, fontSize: 16, marginBottom: 4, transition: "color .25s" }}>{g.title}</div>
                  <div style={{ color: T.muted, fontSize: 13 }}>{g.sub}</div>
                </div>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: isSel ? g.color : "transparent", border: `2px solid ${isSel ? g.color : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .25s" }}>
                  {isSel && <span style={{ color: T.deep, fontSize: 13, fontWeight: 800 }}>✓</span>}
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Step 4 — Category Picker (Duolingo-style)
function OnboardCategories({ onNext, profile, setProfile }) {
  const [sel, setSel] = useState(profile.cats || []);
  const toggle = (id) => {
    setSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const next = () => {
    setProfile(p => ({ ...p, cats: sel }));
    onNext();
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "48px 24px 24px", minHeight: "100%", position: "relative", overflow: "hidden" }}>
      <OrbBg cols={[T.warm, T.emerald, T.violet]} />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <p className="fu" style={{ color: T.tealDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>Step 3 of 4</p>
        <h2 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.white, marginBottom: 8 }}>What kinds of help<br />resonate with you?</h2>
        <p className="fu d2" style={{ color: "#6b9fc2", fontSize: 14, marginBottom: 20 }}>Pick all that apply — you can change anytime.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto", paddingBottom: 4 }}>
          {CATS.map((c, i) => {
            const on = sel.includes(c.id);
            return (
              <button key={c.id} className="press" onClick={() => toggle(c.id)} style={{ display: "flex", alignItems: "center", gap: 14, background: on ? `linear-gradient(135deg,${c.color}22,${c.color}0a)` : "rgba(255,255,255,.025)", border: `1px solid ${on ? c.color : T.border}`, borderRadius: 16, padding: "14px 18px", animation: `fadeUp .45s ${.06 + i * .08}s both`, transition: "background .2s, border-color .2s, box-shadow .2s", boxShadow: on ? `0 0 24px ${c.color}30, inset 0 0 12px ${c.color}08` : "none", textAlign: "left", width: "100%", flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: on ? `${c.color}35` : `${c.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, transition: "all .2s", boxShadow: on ? `0 0 16px ${c.color}50` : "none" }}>{c.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: on ? c.color : T.white, fontWeight: 700, fontSize: 15, transition: "color .2s" }}>{c.label}</div>
                  <div style={{ color: "#6b9fc2", fontSize: 12, marginTop: 2 }}>{c.desc}</div>
                </div>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: on ? c.color : "transparent", border: `2px solid ${on ? c.color : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .22s" }}>
                  {on && <span style={{ color: T.deep, fontSize: 13, fontWeight: 800 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <button className="btn-p press" onClick={next} style={{ marginTop: 16, position: "relative", zIndex: 1, flexShrink: 0 }}>
        {sel.length > 0 ? `Continue (${sel.length} selected) →` : "Skip for now →"}
      </button>
    </div>
  );
}

// Step 5 — Profile Setup
function OnboardProfile({ onNext, profile, setProfile }) {
  const [name, setName] = useState(profile.name || "");
  const [avatar, setAvatar] = useState(profile.avatar || AVATARS[0]);
  const next = () => {
    setProfile(p => ({ ...p, name: name || "Friend", avatar }));
    onNext();
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "48px 24px 24px", minHeight: "100%", position: "relative" }}>
      <OrbBg cols={[T.teal, T.emerald]} />
      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <p className="fu" style={{ color: T.tealDim, fontSize: 12, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>Step 4 of 4</p>
        <h2 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: T.white, marginBottom: 8 }}>Create your<br />identity</h2>
        <p className="fu d2" style={{ color: "#6b9fc2", fontSize: 14, marginBottom: 28 }}>Quick and optional — you can update anytime.</p>

        {/* Avatar selection */}
        <div className="fu d2" style={{ marginBottom: 24 }}>
          <label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Choose your avatar</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
            {AVATARS.map(a => (
              <button key={a} className="press" onClick={() => setAvatar(a)} style={{ fontSize: 30, background: avatar === a ? `${T.teal}20` : "rgba(255,255,255,.03)", border: `2px solid ${avatar === a ? T.teal : T.border}`, borderRadius: 14, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", boxShadow: avatar === a ? `0 0 14px ${T.tealGlow}` : "none" }}>{a}</button>
            ))}
          </div>
        </div>

        <div className="fu d3">
          <label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Your Name</label>
          <input className="inp" placeholder="What should we call you?" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && next()} />
        </div>

        {/* XP Preview */}
        <div className="fu d4" style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "16px 18px", marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 32 }}>{avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>{name || "Your Name"}</div>
              <div style={{ color: T.teal, fontSize: 12, marginTop: 2 }}>🌱 Seedling · 0 XP</div>
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>Your profile</div>
          </div>
        </div>
      </div>
      <button className="btn-p press" onClick={next} style={{ marginTop: 28, position: "relative", zIndex: 1 }}>
        {name ? "Let's go! →" : "Skip — continue anonymously →"}
      </button>
    </div>
  );
}

// Step 6 — Aha Moment: Real person needs help NOW
function OnboardAha({ onNext, onXP, profile }) {
  const urgentPin = PINS.find(p => p.urgency === "Urgent");
  const c = catOf(urgentPin.cat);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");

  const send = () => {
    if (!msg.trim() && !sent) return;
    setSent(true);
    onXP(25);
    setTimeout(onNext, 1800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "40px 24px 24px", minHeight: "100%", position: "relative", overflow: "hidden" }}>
      <OrbBg cols={[T.urgent, T.teal]} />
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="fu" style={{ display: "flex", align: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.urgent, boxShadow: `0 0 8px ${T.urgent}`, animation: "pulse 1.5s infinite", marginTop: 6 }} />
          <div>
            <div style={{ color: T.urgent, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>HAPPENING RIGHT NOW NEAR YOU</div>
          </div>
        </div>

        <h2 className="fu d1" style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: T.white, lineHeight: 1.22, marginBottom: 6 }}>
          Someone needs you
        </h2>
        <p className="fu d2" style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>This is why KindWave exists. Send a quick note.</p>

        {/* Request card — flies in */}
        <TiltCard className="fu d2" style={{ background: T.panel, border: `2px solid ${c.color}44`, borderLeft: `4px solid ${c.color}`, borderRadius: 20, padding: 22, marginBottom: 22, boxShadow: `0 16px 48px rgba(0,0,0,.45), 0 0 30px ${c.color}14` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: c.color, fontSize: 11, fontWeight: 700, letterSpacing: .6 }}>{c.emoji} {c.label.toUpperCase()}</span>
            <span style={{ color: T.urgent, fontSize: 10, background: `${T.urgent}18`, border: `1px solid ${T.urgent}35`, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>URGENT</span>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: T.white, fontSize: 18, marginBottom: 8 }}>{urgentPin.title}</div>
          <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.65 }}>{urgentPin.desc}</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
            <span style={{ color: T.muted, fontSize: 12 }}>👤 {urgentPin.user}</span>
            <span style={{ color: T.urgent, fontSize: 12, fontWeight: 600 }}>🕐 {urgentPin.time} ago</span>
          </div>
        </TiltCard>

        {!sent ? (
          <div className="fu d3">
            <label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Send {urgentPin.user} a quick note</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input className="inp" placeholder="Hi, I can help! I'm nearby..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} style={{ flex: 1 }} />
              <button className="press" onClick={send} style={{ background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, border: "none", borderRadius: 12, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", color: T.deep, fontSize: 20, flexShrink: 0, boxShadow: `0 4px 14px ${T.tealGlow}`, opacity: msg.trim() ? 1 : .5 }}>↑</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {["Hi, I can help!", "On my way!", "Sending support 🙏"].map(quick => (
                <button key={quick} className="press" onClick={() => { setMsg(quick); }} style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${T.border}`, borderRadius: 20, padding: "6px 12px", color: T.muted, fontSize: 12, whiteSpace: "nowrap" }}>{quick}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: `${T.teal}14`, border: `1px solid ${T.teal}44`, borderRadius: 16, padding: 18, textAlign: "center", animation: "scaleIn .4s both" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🌊</div>
            <div style={{ color: T.teal, fontWeight: 700, fontSize: 17 }}>Message sent! Your first ripple.</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>+25 XP earned</div>
          </div>
        )}
      </div>

      {!sent && (
        <button onClick={onNext} style={{ background: "none", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", textAlign: "center", marginTop: 16, position: "relative", zIndex: 1 }}>
          Skip for now — go to map
        </button>
      )}
    </div>
  );
}

// Step 7 — Badge Unlock + XP Bar = Dopamine Moment
function OnboardComplete({ onFinish, profile, totalXP }) {
  const [phase, setPhase] = useState(0); // 0: loading, 1: badge, 2: xp, 3: done
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setPhase(3), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const badge = BADGES.find(b => b.id === "journey");
  const lv = levelOf(totalXP);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "40px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <ParticleCanvas />
      <OrbBg cols={[T.gold, T.teal, T.violet]} />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 340 }}>

        {phase >= 1 && (
          <div style={{ marginBottom: 28, animation: "badgeIn .7s cubic-bezier(.22,1,.36,1) both" }}>
            <div style={{ fontSize: 90, display: "inline-block", filter: `drop-shadow(0 0 28px ${T.gold}66)` }}>{badge.emoji}</div>
          </div>
        )}

        {phase >= 1 && (
          <div style={{ animation: "fadeUp .5s .1s both" }}>
            <div style={{ color: T.gold, fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 6, animation: "goldShine 2s infinite" }}>
              Badge Unlocked!
            </div>
            <div style={{ color: T.white, fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{badge.name}</div>
            <div style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>{badge.desc}</div>
          </div>
        )}

        {phase >= 2 && (
          <div style={{ background: T.panel, border: `1px solid ${T.borderHi}`, borderRadius: 20, padding: "22px 24px", marginBottom: 28, animation: "scaleIn .45s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 36 }}>{profile.avatar || "🌱"}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 16 }}>{profile.name || "Friend"}</div>
                <div style={{ color: T.teal, fontSize: 13 }}>{lv.emoji} {lv.name}</div>
              </div>
              <div style={{ color: T.gold, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, animation: "countUp .5s both" }}>{totalXP} XP</div>
            </div>
            <div style={{ height: 10, background: "rgba(255,255,255,.07)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ "--xp-w": xpPct(totalXP) + "%", height: "100%", background: `linear-gradient(90deg,${T.gold},${T.teal})`, borderRadius: 5 }} className="xp-bar-fill" />
            </div>
          </div>
        )}

        {phase >= 3 && (
          <button className="btn-p press" onClick={onFinish} style={{ animation: "fadeUp .5s both" }}>
            Enter KindWave →
          </button>
        )}
      </div>
    </div>
  );
}

// Onboarding Manager
function Onboarding({ onComplete }) {
  const [step, setStep]       = useState(0);
  const [k, setK]             = useState(0);
  const [profile, setProfile] = useState({ name: "", avatar: AVATARS[0], goal: null, cats: [], email: "" });
  const [xp, setXp]           = useState(30);

  const next = () => { setStep(s => s + 1); setK(v => v + 1); };
  const addXP = (n) => setXp(v => v + n);

  const screens = [
    <OnboardSplash       onNext={next} key="s0" />,
    <OnboardValueProp    onNext={next} key="s1" />,
    <OnboardAuth         onNext={next} profile={profile} setProfile={setProfile} key="s2" />,
    <OnboardGoal         onNext={next} profile={profile} setProfile={setProfile} key="s3" />,
    <OnboardCategories   onNext={next} profile={profile} setProfile={setProfile} key="s4" />,
    <OnboardProfile      onNext={next} profile={profile} setProfile={setProfile} key="s5" />,
    <OnboardAha          onNext={next} profile={profile} onXP={addXP} key="s6" />,
    <OnboardComplete     onFinish={() => onComplete(profile, xp)} profile={profile} totalXP={xp} key="s7" />,
  ];

  // Skip button (shown on steps 2-6)
  const showSkip = step >= 2 && step <= 5;

  return (
    <div style={{ height: "calc(100vh - var(--kw-offset, 0px))", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif", color: T.white, width: "100%", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* Top progress bar (steps 2–6) */}
      {step >= 2 && step <= 6 && (
        <div style={{ display: "flex", gap: 4, padding: "14px 24px 0", position: "relative", zIndex: 10 }}>
          {[2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= i ? T.teal : T.border, transition: "background .4s", boxShadow: step >= i ? `0 0 6px ${T.tealGlow}` : "none" }} />
          ))}
        </div>
      )}

      <div key={k} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", animation: "fadeUp .45s cubic-bezier(.22,1,.36,1) both" }}>
        {screens[step]}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MAIN APP SCREENS
// ══════════════════════════════════════════════════════

// Tooltip Guide (first-time overlay)
function TooltipGuide({ tab, onDismiss }) {
  const tips = {
    map:  { emoji: "🗺️", text: "Tap any pin to see a request. Tap + to post your own.", y: "70%" },
    help: { emoji: "💚", text: "Swipe cards to browse. Toggle the switch to offer help.", y: "30%" },
    heal: { emoji: "✦",  text: "Your healing journey starts here. Log a moment.", y: "50%" },
    me:   { emoji: "👤", text: "Track your XP, badges, and help history.", y: "50%" },
  };
  const tip = tips[tab];
  if (!tip) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: "50%", top: tip.y, transform: "translate(-50%,-50%)", background: "rgba(8,18,42,.95)", border: `1px solid ${T.borderHi}`, borderRadius: 16, padding: "14px 20px", width: 260, textAlign: "center", animation: "tooltipIn .35s both", backdropFilter: "blur(20px)", pointerEvents: "auto" }}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>{tip.emoji}</div>
        <div style={{ color: T.white, fontSize: 13, lineHeight: 1.6 }}>{tip.text}</div>
        <button onClick={onDismiss} style={{ background: "none", border: `1px solid ${T.borderHi}`, borderRadius: 10, color: T.teal, fontSize: 12, fontWeight: 700, padding: "6px 16px", marginTop: 10, cursor: "pointer" }}>Got it ✓</button>
      </div>
    </div>
  );
}

// Map View
function MapView({ pins, onPin, onAdd, filterCats, setFilterCats }) {
  const [showF, setShowF] = useState(false);
  const [hov, setHov]     = useState(null);
  const vis = pins.filter(p => filterCats.length === 0 || filterCats.includes(p.cat));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div className="glass" style={{ padding: "16px 18px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div>
          <div style={{ color: T.muted, fontSize: 12, fontWeight: 500 }}>📍 Gurugram, Haryana</div>
          <div style={{ color: T.white, fontWeight: 700, fontSize: 16, marginTop: 2 }}><span style={{ color: T.teal }}>{pins.length}</span> active requests nearby</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="glass press" onClick={() => setShowF(f => !f)} style={{ border: `1px solid ${showF ? T.borderHi : T.border}`, borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: showF ? `${T.teal}14` : "rgba(255,255,255,.04)", fontSize: 16 }}>⚡</button>
          <button className="press" onClick={onAdd} style={{ background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, border: "none", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: T.deep, boxShadow: `0 4px 18px ${T.tealGlow}` }}>+</button>
        </div>
      </div>

      {showF && (
        <div className="glass" style={{ display: "flex", gap: 7, padding: "9px 16px", overflowX: "auto", borderBottom: `1px solid ${T.border}`, animation: "fadeUp .2s both" }}>
          <button className="press" onClick={() => setFilterCats([])} style={{ display: "flex", alignItems: "center", gap: 5, borderRadius: 20, padding: "6px 14px", background: filterCats.length === 0 ? `${T.teal}18` : "transparent", border: `1px solid ${filterCats.length === 0 ? T.tealDim : T.border}`, color: filterCats.length === 0 ? T.teal : T.muted, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>All</button>
          {CATS.map(c => {
            const on = filterCats.includes(c.id);
            return (
              <button key={c.id} className="press" onClick={() => setFilterCats(f => on ? f.filter(x => x !== c.id) : [...f, c.id])} style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 20, padding: "6px 13px", background: on ? `${c.color}18` : "transparent", border: `1px solid ${on ? c.color : T.border}`, color: on ? c.color : T.muted, fontSize: 12, fontWeight: on ? 700 : 400, whiteSpace: "nowrap", transition: "all .2s" }}>
                {c.emoji} {c.id}
              </button>
            );
          })}
        </div>
      )}

      {/* Map Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: `radial-gradient(ellipse at 28% 36%, #061530 0%, ${T.deep} 65%)` }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .07 }}>
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(p => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke={T.teal} strokeWidth=".5" />
              <line y1={`${p}%`} x1="0" y2={`${p}%`} x2="100%" stroke={T.teal} strokeWidth=".5" />
            </g>
          ))}
        </svg>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .22 }}>
          <defs><filter id="rg2"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          <path d="M 0 45% Q 30% 42% 52% 51% T 100% 49%" stroke={T.teal} strokeWidth="2.5" fill="none" filter="url(#rg2)" />
          <path d="M 22% 0 Q 24% 45% 26% 68% T 28% 100%" stroke={T.tealDim} strokeWidth="1.5" fill="none" filter="url(#rg2)" />
          <path d="M 63% 0 Q 65% 38% 67% 72% T 69% 100%" stroke={T.tealDim} strokeWidth="1.5" fill="none" filter="url(#rg2)" />
          <path d="M 0 76% Q 45% 74% 100% 73%" stroke={T.tealDim} strokeWidth="1.5" fill="none" filter="url(#rg2)" />
        </svg>
        {[["Sector 14", "10%", "20%"], ["DLF Phase 2", "58%", "12%"], ["Sector 47", "74%", "58%"], ["MG Road", "35%", "88%"], ["Cyber City", "14%", "52%"]].map(([l, x, y]) => (
          <div key={l} style={{ position: "absolute", left: x, top: y, fontSize: 10, color: `${T.teal}40`, pointerEvents: "none", transform: "translate(-50%,-50%)", fontWeight: 600 }}>{l}</div>
        ))}

        {vis.map((pin, i) => {
          const c = catOf(pin.cat);
          const urg = pin.urgency === "Urgent";
          return (
            <button key={pin.id} onClick={() => onPin(pin)} onMouseEnter={() => setHov(pin.id)} onMouseLeave={() => setHov(null)}
              style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-100%)", background: "none", border: "none", cursor: "pointer", padding: 0, zIndex: urg ? 20 : 10, animation: `pinBounce .55s ${i * .06}s both` }}>
              {urg && (<><div style={{ position: "absolute", inset: -10, borderRadius: "50%", background: `${c.color}18`, animation: "rippleOut 1.6s infinite" }} /><div style={{ position: "absolute", inset: -5, borderRadius: "50%", background: `${c.color}12`, animation: "rippleOut 1.6s .4s infinite" }} /></>)}
              <div style={{ transition: "transform .15s", transform: hov === pin.id ? "scale(1.25)" : "scale(1)" }}>
                <svg width="34" height="44" viewBox="0 0 34 44">
                  <defs><filter id={`pf${pin.id}`}><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={c.color} floodOpacity=".7" /></filter></defs>
                  <path d="M17 0C7.6 0 0 7.6 0 17c0 11 17 27 17 27s17-16 17-27C34 7.6 26.4 0 17 0z" fill={c.color} filter={`url(#pf${pin.id})`} />
                  <circle cx="17" cy="16" r="7" fill={T.deep} opacity=".85" />
                </svg>
              </div>
              {hov === pin.id && (
                <div className="glassHi si" style={{ position: "absolute", bottom: "calc(100% + 5px)", left: "50%", transform: "translateX(-50%)", borderRadius: 10, padding: "6px 11px", color: T.white, fontSize: 11, whiteSpace: "nowrap", pointerEvents: "none", border: `1px solid ${c.color}44`, zIndex: 50 }}>
                  {pin.title}
                </div>
              )}
            </button>
          );
        })}

        {/* My location */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 30 }}>
          <div style={{ position: "absolute", inset: -14, borderRadius: "50%", background: `${T.teal}12`, animation: "pulse 2.2s infinite" }} />
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, border: "3px solid rgba(255,255,255,.92)", boxShadow: `0 0 0 4px ${T.tealGlow}, 0 4px 14px ${T.tealGlow}` }} />
        </div>

        <div className="glass" style={{ position: "absolute", bottom: 16, left: 16, borderRadius: 12, padding: "7px 11px", display: "flex", gap: 8, flexWrap: "wrap", maxWidth: "56%" }}>
          {CATS.map(c => (<div key={c.id} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: c.color }} /><span style={{ fontSize: 10, color: T.muted }}>{c.id}</span></div>))}
        </div>
        <button className="press" onClick={onAdd} style={{ position: "absolute", bottom: 16, right: 16, width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, border: "none", fontSize: 26, color: T.deep, boxShadow: `0 4px 24px ${T.tealGlow}, 0 0 0 6px ${T.tealGlow}`, display: "flex", alignItems: "center", justifyContent: "center", animation: "glow 3s ease-in-out infinite" }}>+</button>
      </div>
    </div>
  );
}

// Help Feed
function HelpFeed({ pins, onPin, isVol, setIsVol, onAdd, onXP }) {
  const [tab, setTab] = useState("nearby");
  const list = tab === "urgent" ? pins.filter(p => p.urgency === "Urgent") : tab === "mine" ? pins.slice(0, 3) : pins;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <div style={{ padding: "20px 18px 0", background: `linear-gradient(180deg,rgba(5,9,26,.98) 0%,transparent 100%)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: T.white }}>Help Requests</h2>
            <p style={{ color: isVol ? T.emerald : T.muted, fontSize: 13, marginTop: 2, fontWeight: isVol ? 600 : 400 }}>
              {isVol ? "● You're visible as available" : "Toggle to offer your help"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: isVol ? T.emerald : T.muted, fontWeight: 600 }}>{isVol ? "Online" : "Offline"}</span>
            <div onClick={() => { setIsVol(v => !v); if (!isVol) onXP(5); }} style={{ width: 48, height: 26, borderRadius: 13, cursor: "pointer", transition: "background .3s", background: isVol ? `linear-gradient(90deg,${T.emerald},${T.tealDim})` : "rgba(255,255,255,.1)", position: "relative", boxShadow: isVol ? `0 0 14px ${T.emerald}40` : "none" }}>
              <div style={{ position: "absolute", top: 3, left: isVol ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .3s" }} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 0 }}>
          {[["nearby", "Nearby"], ["urgent", "🚨 Urgent"], ["mine", "My Posts"]].map(([v, l]) => (
            <button key={v} className="press" onClick={() => setTab(v)} style={{ flex: 1, padding: "8px 6px", borderRadius: 12, fontSize: 12, fontWeight: tab === v ? 700 : 400, background: tab === v ? `${T.teal}16` : "transparent", border: `1px solid ${tab === v ? T.tealDim : T.border}`, color: tab === v ? T.teal : T.muted, transition: "all .2s" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 90px" }}>
        {list.map((pin, i) => {
          const c = catOf(pin.cat);
          return (
            <button key={pin.id} onClick={() => onPin(pin)} className="press hov" style={{ width: "100%", textAlign: "left", background: T.panel, backdropFilter: "blur(20px)", border: `1px solid ${T.border}`, borderLeft: `3px solid ${c.color}`, borderRadius: 18, padding: 18, marginBottom: 10, boxShadow: `0 4px 20px rgba(0,0,0,.22)`, animation: `fadeUp .4s ${i * .06}s both`, transition: "transform .2s, box-shadow .2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, boxShadow: `0 0 7px ${c.color}` }} />
                  <span style={{ fontSize: 11, color: c.color, fontWeight: 700, letterSpacing: .5 }}>{c.label.toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {pin.urgency === "Urgent" && <span style={{ fontSize: 10, color: T.urgent, background: `${T.urgent}1a`, border: `1px solid ${T.urgent}38`, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>URGENT</span>}
                  {pin.verified && <span style={{ fontSize: 13, color: T.teal }}>✦</span>}
                </div>
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: T.white, fontSize: 16, marginBottom: 7 }}>{pin.title}</div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>{pin.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 12, color: T.muted }}>👤 {pin.user}</span>
                <span style={{ fontSize: 12, color: T.muted }}>🕐 {pin.time} ago</span>
              </div>
            </button>
          );
        })}
      </div>
      <button className="press" onClick={onAdd} style={{ position: "absolute", bottom: 80, right: 20, width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, border: "none", fontSize: 26, color: T.deep, boxShadow: `0 4px 24px ${T.tealGlow}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>+</button>
    </div>
  );
}

// Pin Detail
function PinDetail({ pin, onBack, onChat, onAccept, accepted }) {
  const c = catOf(pin.cat);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${c.color},${c.color}55)`, boxShadow: `0 0 16px ${c.color}60` }} />
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        <button className="glass press" onClick={onBack} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 14px", color: T.muted, fontSize: 13, marginBottom: 22 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, boxShadow: `0 0 9px ${c.color}` }} />
          <span style={{ color: c.color, fontWeight: 700, fontSize: 12, letterSpacing: .8 }}>{c.label.toUpperCase()}</span>
          {pin.urgency === "Urgent" && <span style={{ fontSize: 10, color: T.urgent, background: `${T.urgent}16`, border: `1px solid ${T.urgent}38`, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>🚨 URGENT</span>}
        </div>
        <h2 className="fu" style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: T.white, lineHeight: 1.22, marginBottom: 14 }}>{pin.title}</h2>
        <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, marginBottom: 22 }}>{pin.desc}</p>
        <div className="glass" style={{ borderRadius: 16, padding: 18, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["Posted by", pin.user], ["Time", pin.time + " ago"], ["Urgency", pin.urgency]].map(([l, v]) => (
            <div key={l}><div style={{ color: T.muted, fontSize: 11, fontWeight: 600, letterSpacing: .5, marginBottom: 4 }}>{l.toUpperCase()}</div><div style={{ color: T.white, fontWeight: 600, fontSize: 13 }}>{v}</div></div>
          ))}
        </div>
        {pin.urgency === "Urgent" && (
          <div style={{ background: `${T.urgent}0e`, border: `1px solid ${T.urgent}28`, borderRadius: 14, padding: 14, marginBottom: 18 }}>
            <p style={{ color: T.urgent, fontSize: 13, margin: 0, lineHeight: 1.6 }}>⚠️ Not a substitute for emergency services. Immediate danger? Call <strong>112</strong>.</p>
          </div>
        )}
        {accepted ? (
          <div className="glassHi si" style={{ borderRadius: 16, padding: 18, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ color: T.teal, fontWeight: 700, fontSize: 17 }}>You accepted this request!</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Chat with {pin.user} to coordinate</div>
          </div>
        ) : (
          <button className="btn-p press" onClick={() => onAccept(pin)} style={{ marginBottom: 10 }}>✓ Accept This Request</button>
        )}
        <button className="press glass" onClick={() => onChat(pin)} style={{ width: "100%", border: `1px solid ${T.border}`, borderRadius: 16, padding: "14px 0", color: T.muted, fontSize: 15, fontWeight: 600 }}>💬 Open Chat</button>
      </div>
    </div>
  );
}

// Chat
function ChatView({ pin, onBack }) {
  const [msgs, setMsgs] = useState([
    { from: "them", text: "Hi! I saw your request. About 10 min away.", time: "5:42 PM" },
    { from: "me", text: "Oh thank god! I'm outside the pharmacy on MG Road.", time: "5:43 PM" },
    { from: "them", text: "Perfect. Blue Honda City. On my way 🙏", time: "5:44 PM" },
  ]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const bot = useRef();
  const c = catOf(pin.cat);

  useEffect(() => { bot.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = () => {
    if (!inp.trim()) return;
    const now = new Date(), tm = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")} PM`;
    setMsgs(m => [...m, { from: "me", text: inp, time: tm }]);
    setInp(""); setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs(m => [...m, { from: "them", text: "Thank you so much 🙏", time: tm }]); }, 2000);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="glass" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 13, borderBottom: `1px solid ${T.border}` }}>
        <button className="press" onClick={onBack} style={{ background: "rgba(255,255,255,.05)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 11px", color: T.muted, fontSize: 13 }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${c.color}38,${c.color}18)`, border: `1.5px solid ${c.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.emoji}</div>
        <div style={{ flex: 1 }}><div style={{ color: T.white, fontWeight: 700, fontSize: 15 }}>{pin.user}</div><div style={{ color: c.color, fontSize: 12 }}>{pin.title.slice(0, 32)}…</div></div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.emerald, boxShadow: `0 0 6px ${T.emerald}` }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="glass" style={{ borderRadius: 12, padding: 11, textAlign: "center", marginBottom: 4 }}>
          <p style={{ color: T.muted, fontSize: 12, margin: 0 }}>🔒 Contact masked until mutual consent · About: <strong style={{ color: T.white }}>{pin.title.slice(0, 28)}…</strong></p>
        </div>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", animation: "msgIn .25s both" }}>
            <div style={{ maxWidth: "72%", background: m.from === "me" ? `linear-gradient(135deg,${T.teal},${T.tealDim})` : T.panel, backdropFilter: "blur(20px)", color: m.from === "me" ? T.deep : T.white, padding: "11px 15px", borderRadius: m.from === "me" ? "20px 20px 4px 20px" : "20px 20px 20px 4px", fontSize: 14, lineHeight: 1.5, boxShadow: m.from === "me" ? `0 4px 16px ${T.tealGlow}` : "0 4px 12px rgba(0,0,0,.3)" }}>
              {m.text}
              <div style={{ fontSize: 10, opacity: .6, marginTop: 4, textAlign: "right" }}>{m.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 4, padding: "11px 15px", background: T.panel, backdropFilter: "blur(20px)", borderRadius: "20px 20px 20px 4px", width: "fit-content" }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.muted, animation: `pulse .9s ${i * .2}s infinite` }} />)}
          </div>
        )}
        <div ref={bot} />
      </div>
      <div style={{ padding: "10px 16px 16px", display: "flex", gap: 10, background: `rgba(5,9,26,.96)`, borderTop: `1px solid ${T.border}` }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message…"
          style={{ flex: 1, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 24, padding: "11px 17px", color: T.white, fontSize: 14, outline: "none", transition: "border-color .2s", backdropFilter: "blur(20px)" }}
          onFocus={e => { e.target.style.borderColor = T.tealDim; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
        <button className="press" onClick={send} style={{ background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: T.deep, fontSize: 18, boxShadow: `0 4px 12px ${T.tealGlow}`, flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

// Post Request
function PostRequest({ onBack, onPost }) {
  const [form, setForm] = useState({ title: "", desc: "", cat: "general", urgency: "Standard" });
  const [done, setDone] = useState(false);
  const submit = () => {
    if (!form.title) return;
    setDone(true);
    setTimeout(() => { onPost(form); onBack(); }, 2200);
  };
  if (done) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", position: "relative" }}>
      <OrbBg cols={[T.teal, T.emerald]} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 28px" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ position: "absolute", inset: `${-i * 16}px`, borderRadius: "50%", border: `2px solid ${T.teal}`, opacity: 1 - i * .24, animation: `rippleOut ${1 + i * .4}s ease-out infinite`, animationDelay: `${i * .25}s` }} />)}
          <div style={{ position: "absolute", inset: 22, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>🌊</div>
        </div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: T.teal, marginBottom: 10 }}>Request Posted!</h2>
        <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.65 }}>Your request is now live on the map.<br />Nearby helpers have been notified. 🙏</p>
      </div>
    </div>
  );
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="glass" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.border}` }}>
        <button className="press" onClick={onBack} style={{ background: "rgba(255,255,255,.05)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 13px", color: T.muted, fontSize: 13 }}>← Back</button>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: T.white }}>Post a Request</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 17 }}>
        <div><label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Title</label>
          <input className="inp" maxLength={80} placeholder="What do you need help with?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
        <div><label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Description</label>
          <textarea className="inp" maxLength={500} rows={4} placeholder="Describe your situation…" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} style={{ resize: "none", lineHeight: 1.6 }} /></div>
        <div><label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Category</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {CATS.map(c => {
              const sel = form.cat === c.id;
              return (
                <button key={c.id} className="press" onClick={() => setForm(f => ({ ...f, cat: c.id }))} style={{ display: "flex", alignItems: "center", gap: 12, background: sel ? `${c.color}10` : "rgba(255,255,255,.02)", border: `1px solid ${sel ? c.color : T.border}`, borderRadius: 14, padding: "12px 15px", transition: "all .2s", textAlign: "left", width: "100%" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: sel ? `${c.color}25` : `${c.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, transition: "all .2s" }}>{c.emoji}</div>
                  <span style={{ color: sel ? c.color : T.muted, fontWeight: sel ? 700 : 400, fontSize: 14, flex: 1 }}>{c.label}</span>
                  {sel && <span style={{ color: c.color, fontSize: 16 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div><label style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 9 }}>Urgency</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["Urgent", T.urgent], ["Standard", T.teal], ["Flexible", T.muted]].map(([v, col]) => (
              <button key={v} className="press" onClick={() => setForm(f => ({ ...f, urgency: v }))} style={{ flex: 1, padding: "12px 0", borderRadius: 12, fontSize: 13, fontWeight: form.urgency === v ? 700 : 400, background: form.urgency === v ? `${col}14` : "rgba(255,255,255,.02)", border: `1px solid ${form.urgency === v ? col : T.border}`, color: form.urgency === v ? col : T.muted, transition: "all .2s" }}>{v}</button>
            ))}
          </div>
        </div>
        <button className="btn-p press" onClick={submit} style={{ opacity: form.title ? 1 : .38, pointerEvents: form.title ? "auto" : "none" }}>
          Post to Map 🗺️
        </button>
      </div>
    </div>
  );
}

// Healing View
function HealingView({ user, xp, onXP }) {
  const [tab, setTab] = useState("log");
  const [mood, setMood] = useState(null);
  const [jt, setJt] = useState("");
  const [entries, setEntries] = useState([]);
  const helpsGiven = Math.floor(xp / 40);
  const MOODS = ["😔", "😐", "🙂", "😊", "🌟"];

  const saveJournal = () => {
    if (!jt.trim()) return;
    setEntries(prev => [{ text: jt, date: new Date().toLocaleDateString(), mood }, ...prev]);
    setJt(""); setMood(null);
    onXP(15);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "22px 18px 0", background: `linear-gradient(180deg,#1a053580 0%,rgba(5,9,26,0) 100%)`, position: "relative" }}>
        <OrbBg cols={[T.violet, T.warm]} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: T.white }}>Your Healing Journey</h2>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 3, marginBottom: 14 }}>Track your growth, gratitude & impact</p>
          <XPBar xp={xp} inline />
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {[["log", "✦ Miracles"], ["journal", "📝 Journal"], ["ripple", "🌊 Ripple"]].map(([v, l]) => (
              <button key={v} className="press" onClick={() => setTab(v)} style={{ flex: 1, padding: "9px 6px", borderRadius: 12, fontSize: 12, fontWeight: tab === v ? 700 : 400, background: tab === v ? `${T.violet}1e` : "rgba(255,255,255,.03)", border: `1px solid ${tab === v ? T.violet : T.border}`, color: tab === v ? T.violet : T.muted, transition: "all .2s" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {tab === "log" && (
          <div className="fu">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[["Helps Given", helpsGiven, T.urgent], ["Ripples", helpsGiven * 3, T.teal], ["XP", xp, T.gold]].map(([l, v, col]) => (
                <div key={l} className="glass" style={{ borderRadius: 16, padding: 15, textAlign: "center", border: `1px solid ${col}22`, boxShadow: `0 0 18px ${col}0e` }}>
                  <div style={{ color: col, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, animation: "countUp .5s both" }}>{v}</div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", color: T.white, fontWeight: 700, fontSize: 16, marginBottom: 11 }}>Badges Earned</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {BADGES.slice(0, 4).map(b => (
                <TiltCard key={b.id} className="glass" style={{ borderRadius: 14, padding: "16px 14px", textAlign: "center", border: `1px solid ${T.gold}22`, boxShadow: `0 0 12px ${T.gold}0c` }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{b.emoji}</div>
                  <div style={{ color: T.white, fontSize: 13, fontWeight: 700 }}>{b.name}</div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 3 }}>{b.desc}</div>
                  <div style={{ color: T.gold, fontSize: 11, marginTop: 5, fontWeight: 700 }}>+{b.xp} XP</div>
                </TiltCard>
              ))}
            </div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", color: T.white, fontWeight: 700, fontSize: 16, marginBottom: 11 }}>Recent Moments</h3>
            {[{ icon: "💜", col: T.urgent, title: "Helped Rahul M.", desc: "Provided cab fare · 2h ago", badge: "+3 ripples" }, { icon: "💬", col: T.warm, title: "Emotional support", desc: "Listened for 30 min · Yesterday", badge: "+5 ripples" }, { icon: "✦", col: T.teal, title: "Gratitude received", desc: '"You changed my day" · 2d ago', badge: "✨ Miracle" }].map((item, i) => (
              <div key={i} className="glass hov" style={{ display: "flex", gap: 12, borderRadius: 16, padding: "13px 15px", marginBottom: 9, alignItems: "flex-start", animation: `fadeUp .4s ${i * .08}s both`, borderLeft: `3px solid ${item.col}30` }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${item.col}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.white, fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>{item.desc}</div>
                </div>
                <span style={{ fontSize: 11, color: T.teal, background: `${T.teal}13`, border: `1px solid ${T.teal}28`, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>{item.badge}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "journal" && (
          <div className="fu">
            <div className="glass" style={{ borderRadius: 18, padding: 20, marginBottom: 14 }}>
              <div style={{ color: T.teal, fontStyle: "italic", fontSize: 15, lineHeight: 1.65, marginBottom: 16, borderLeft: `3px solid ${T.teal}`, paddingLeft: 13 }}>
                "How did helping someone today shift your own heart?"
              </div>
              <div style={{ marginBottom: 13 }}>
                <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: .9, marginBottom: 10 }}>HOW ARE YOU FEELING?</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {MOODS.map((e, i) => (<button key={i} className="press" onClick={() => setMood(i)} style={{ fontSize: 28, background: "none", border: "none", cursor: "pointer", transform: mood === i ? "scale(1.35)" : "scale(1)", transition: "transform .2s", filter: mood === i ? "drop-shadow(0 0 8px gold)" : "none" }}>{e}</button>))}
                </div>
              </div>
              <textarea className="inp" value={jt} onChange={e => setJt(e.target.value)} placeholder="Write your thoughts here…" rows={5} style={{ resize: "none", lineHeight: 1.65, width: "100%", boxSizing: "border-box" }} />
              <button className="btn-p press" onClick={saveJournal} style={{ marginTop: 13 }}>Save Entry (+15 XP)</button>
            </div>
            {entries.map((e, i) => (
              <div key={i} className="glass" style={{ borderRadius: 16, padding: 15, marginBottom: 9, animation: "fadeUp .3s both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}><span style={{ color: T.muted, fontSize: 12 }}>{e.date}</span>{e.mood != null && <span style={{ fontSize: 20 }}>{MOODS[e.mood]}</span>}</div>
                <p style={{ color: T.muted, fontSize: 14, margin: 0, lineHeight: 1.65 }}>{e.text}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "ripple" && (
          <div className="fu" style={{ textAlign: "center" }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", color: T.white, fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Your Ripple Effect</h3>
            <p style={{ color: T.muted, fontSize: 14, marginBottom: 30 }}>Each act of kindness ripples outward forever</p>
            <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 28px" }}>
              {[1, 2, 3, 4].map(i => (<div key={i} style={{ position: "absolute", inset: `${i * 18}px`, borderRadius: "50%", border: `1.5px solid ${T.teal}`, opacity: 1 - i * .2, animation: `rippleOut ${1.2 + i * .5}s ease-out infinite`, animationDelay: `${i * .3}s` }} />))}
              <div style={{ position: "absolute", inset: 70, borderRadius: "50%", background: `linear-gradient(135deg,${T.teal},${T.tealDim})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: `0 0 34px ${T.tealGlow}` }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: T.deep }}>{helpsGiven * 3}</div>
                <div style={{ fontSize: 10, color: `${T.deep}99`, fontWeight: 700 }}>ripples</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {[["People Helped", helpsGiven, T.urgent], ["2nd Connections", helpsGiven * 2, T.warm], ["Gratitude Notes", Math.floor(helpsGiven * .7), T.violet], ["Impact Score", `${helpsGiven * 12}pts`, T.teal]].map(([l, v, col]) => (
                <div key={l} className="glass" style={{ borderRadius: 16, padding: 17, border: `1px solid ${col}22` }}>
                  <div style={{ color: col, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26 }}>{v}</div>
                  <div style={{ color: T.muted, fontSize: 12, marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Profile View
function ProfileView({ user, xp, onXP, onLogout }) {
  const [tab, setTab] = useState("me");
  const lv = levelOf(xp);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "22px 18px 0", background: `linear-gradient(180deg,#0d1535 0%,rgba(5,9,26,0) 100%)`, position: "relative" }}>
        <OrbBg cols={[T.teal, T.violet]} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 18 }}>
            <div style={{ width: 66, height: 66, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg,${T.teal},${T.violet})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: `0 0 0 3px ${T.deep},0 0 0 5px ${T.tealDim}`, animation: "float3d 8s ease-in-out infinite" }}>{user.avatar || "🌱"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", color: T.white, fontWeight: 800, fontSize: 21 }}>{user.name || "Friend"}</div>
              <div style={{ color: T.teal, fontSize: 13, marginTop: 2, fontWeight: 600 }}>{lv.emoji} {lv.name} · {xp} XP</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 1 }}>Member since March 2026</div>
            </div>
          </div>
          <XPBar xp={xp} inline />
          <div style={{ display: "flex", gap: 6, marginTop: 14, marginBottom: 0 }}>
            {[["me", "Profile"], ["settings", "Settings"], ["admin", "Admin"]].map(([v, l]) => (
              <button key={v} className="press" onClick={() => setTab(v)} style={{ flex: 1, padding: "8px 6px", borderRadius: 12, fontSize: 12, fontWeight: tab === v ? 700 : 400, background: tab === v ? `${T.teal}16` : "rgba(255,255,255,.03)", border: `1px solid ${tab === v ? T.tealDim : T.border}`, color: tab === v ? T.teal : T.muted, transition: "all .2s" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {tab === "me" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[["Given", Math.floor(xp / 40), T.teal], ["Received", 2, T.violet], ["Ripples", Math.floor(xp / 40) * 3, T.warm]].map(([l, v, col]) => (
                <div key={l} className="glass" style={{ borderRadius: 16, padding: 15, textAlign: "center", border: `1px solid ${col}22` }}>
                  <div style={{ color: col, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26 }}>{v}</div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
            <h3 style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>My Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              {(user.cats && user.cats.length > 0 ? user.cats : ["emotional", "general"]).map(s => {
                const c = catOf(s);
                return (<span key={s} style={{ background: `${c.color}13`, color: c.color, border: `1px solid ${c.color}32`, borderRadius: 20, padding: "5px 13px", fontSize: 13, fontWeight: 600 }}>{c.emoji} {c.label}</span>);
              })}
            </div>
            <h3 style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Help History</h3>
            {[["Emotional support session", "emotional", "Today", true], ["Carry groceries – Mrs. Kapoor", "general", "Yesterday", true], ["Ride to hospital", "urgent", "Mar 24", false]].map(([t, ci, d, given], i) => {
              const c = catOf(ci);
              return (
                <div key={i} className="glass hov" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 14, padding: "13px 15px", marginBottom: 8, animation: `fadeUp .3s ${i * .08}s both`, borderLeft: `3px solid ${c.color}28` }}>
                  <div><div style={{ color: T.white, fontWeight: 600, fontSize: 14 }}>{t}</div><div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{d}</div></div>
                  <span style={{ fontSize: 11, color: given ? T.teal : T.violet, background: given ? `${T.teal}13` : `${T.violet}13`, border: `1px solid ${given ? T.tealDim + "44" : T.violet + "44"}`, padding: "4px 11px", borderRadius: 20 }}>{given ? "Given" : "Received"}</span>
                </div>
              );
            })}
          </div>
        )}
        {tab === "settings" && (
          <div>
            {[["Anonymous mode", "Post without showing your name", true], ["Location privacy", "Approximate zone only", true], ["Urgent alerts", "Notifications for nearby urgent requests", false], ["Audio features", "Background music & narration", false]].map(([l, s, d], i) => (
              <div key={i} className="glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 16, padding: "15px 17px", marginBottom: 9, animation: `fadeUp .3s ${i * .08}s both` }}>
                <div><div style={{ color: T.white, fontSize: 14, fontWeight: 600 }}>{l}</div><div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{s}</div></div>
                <ToggleSwitch def={d} />
              </div>
            ))}
            <button className="press" onClick={onLogout} style={{ width: "100%", marginTop: 22, background: "transparent", border: `1px solid ${T.urgent}44`, borderRadius: 16, padding: "14px 0", color: T.urgent, fontSize: 15, fontWeight: 600, transition: "background .2s" }}>Sign Out</button>
          </div>
        )}
        {tab === "admin" && (
          <div>
            <div style={{ background: `${T.violet}10`, border: `1px solid ${T.violet}28`, borderRadius: 14, padding: 13, marginBottom: 14 }}>
              <div style={{ color: T.violet, fontWeight: 700, fontSize: 14 }}>🛡️ Admin Panel · Demo Mode</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>Real-time moderation and analytics</div>
            </div>
            {[["🚨", "Flagged Queue", "3 pending", T.urgent], ["⚡", "Urgent Active", "2 now", T.warm], ["👤", "New Today", "47 users", T.teal], ["✦", "Active Now", "1,204", T.emerald], ["💬", "Live Chats", "89", T.violet], ["✓", "Fulfilled Today", "127", T.rose]].map(([ic, l, v, col], i) => (
              <div key={i} className="glass hov" style={{ display: "flex", alignItems: "center", gap: 13, borderRadius: 16, padding: "13px 15px", marginBottom: 9, animation: `fadeUp .3s ${i * .07}s both`, border: `1px solid ${col}13` }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${col}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                <div style={{ flex: 1, color: T.white, fontSize: 14, fontWeight: 600 }}>{l}</div>
                <span style={{ color: col, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// FEATURE 1: DAILY KINDNESS STREAK
// ══════════════════════════════════════════════════════

function StreakBanner({ streak, checkedToday, onCheckIn }) {
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak) || 100;
  const pct = Math.round((streak / nextMilestone) * 100);
  return (
    <div style={{ margin: "12px 16px 0", background: streak > 0 ? `linear-gradient(135deg,rgba(255,124,58,.12),rgba(255,61,90,.08))` : T.panel, border: `1px solid ${streak > 0 ? T.warm + "44" : T.border}`, borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(20px)" }}>
      <div style={{ fontSize: 32, animation: streak > 0 ? "fireDance 2s ease-in-out infinite" : "none", lineHeight: 1 }}>
        {streak > 0 ? "🔥" : "🌱"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: streak > 0 ? T.warm : T.muted }}>{streak}</span>
          <span style={{ color: T.muted, fontSize: 13 }}>day streak · next milestone: {nextMilestone}</span>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,.08)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", background: streak > 0 ? `linear-gradient(90deg,${T.warm},${T.urgent})` : T.muted, borderRadius: 3, width: pct + "%", transition: "width 1s cubic-bezier(.22,1,.36,1)" }} />
        </div>
      </div>
      {!checkedToday && (
        <button className="press" onClick={onCheckIn} style={{ background: `linear-gradient(135deg,${T.warm},${T.urgent})`, border: "none", borderRadius: 12, padding: "8px 14px", color: T.white, fontSize: 12, fontWeight: 700, flexShrink: 0, boxShadow: `0 4px 14px ${T.warm}44` }}>
          Check in
        </button>
      )}
      {checkedToday && (
        <div style={{ background: `${T.emerald}18`, border: `1px solid ${T.emerald}44`, borderRadius: 10, padding: "6px 10px", fontSize: 11, color: T.emerald, fontWeight: 700 }}>Done today!</div>
      )}
    </div>
  );
}

function StreakView({ streak, shields, checkedToday, onCheckIn, onUseShield, user, xp, badgeList }) {
  const [tab, setTab] = useState("streak");
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const activeDays = Array.from({ length: 7 }, (_, i) => i < (streak % 7 || (streak > 0 ? 7 : 0)));
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak) || 100;
  const pct = Math.round((streak / nextMilestone) * 100);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "24px 18px 0", background: `linear-gradient(180deg,rgba(255,90,40,.14) 0%,transparent 100%)`, position: "relative" }}>
        <OrbBg cols={[T.warm, T.urgent, T.gold]} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Big flame + count */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 72, animation: streak > 0 ? "fireDance 1.8s ease-in-out infinite" : "none", display: "inline-block", filter: streak > 0 ? `drop-shadow(0 0 24px ${T.warm}88)` : "none" }}>
              {streak > 0 ? "🔥" : "🌱"}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 56, fontWeight: 800, color: streak > 0 ? T.warm : T.muted, lineHeight: 1, marginTop: 8, animation: streak > 0 ? "streakPop .6s both" : "none" }}>
              {streak}
            </div>
            <div style={{ color: T.muted, fontSize: 15, marginTop: 4 }}>day kindness streak</div>
          </div>

          {/* Progress to next milestone */}
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 14, backdropFilter: "blur(20px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: T.muted, fontSize: 12 }}>Toward {nextMilestone}-day milestone</span>
              <span style={{ color: T.warm, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,.07)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg,${T.gold},${T.warm},${T.urgent})`, borderRadius: 4, width: pct + "%", transition: "width 1.2s cubic-bezier(.22,1,.36,1)" }} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {[["streak", "🔥 Streak"], ["league", "🏆 League"], ["milestones", "🎯 Goals"]].map(([v, l]) => (
              <button key={v} className="press" onClick={() => setTab(v)} style={{ flex: 1, padding: "8px 4px", borderRadius: 12, fontSize: 12, fontWeight: tab === v ? 700 : 400, background: tab === v ? `${T.warm}18` : "rgba(255,255,255,.03)", border: `1px solid ${tab === v ? T.warm : T.border}`, color: tab === v ? T.warm : T.muted, transition: "all .2s" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

        {/* STREAK TAB */}
        {tab === "streak" && (
          <div className="fu">
            {/* 7-day calendar strip */}
            <div className="glass" style={{ borderRadius: 16, padding: "16px", marginBottom: 14 }}>
              <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>This week</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                {days.map((d, i) => {
                  const active = activeDays[i];
                  const isToday = i === new Date().getDay() - 1 || i === 6;
                  return (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{d}</div>
                      <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, background: active ? `linear-gradient(135deg,${T.warm},${T.urgent})` : "rgba(255,255,255,.05)", border: `1px solid ${isToday ? T.teal : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: active ? `0 0 10px ${T.warm}44` : "none", animation: active ? `heatIn .4s ${i * .06}s both` : "none" }}>
                        {active ? "🔥" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shield bank */}
            <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ color: T.white, fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Streak Shields</div>
                  <div style={{ color: T.muted, fontSize: 12 }}>Use one to protect a missed day</div>
                </div>
                <div style={{ color: T.violet, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>{shields}</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} style={{ width: 48, height: 48, borderRadius: 12, background: i < shields ? `${T.violet}22` : "rgba(255,255,255,.04)", border: `1px solid ${i < shields ? T.violet : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, animation: i < shields ? `shieldFloat ${2 + i * .5}s ease-in-out infinite` : "none" }}>
                    {i < shields ? "🛡️" : ""}
                  </div>
                ))}
              </div>
              {shields > 0 && streak === 0 && (
                <button className="btn-p press" onClick={onUseShield} style={{ padding: "12px 0", fontSize: 14 }}>
                  Use Shield — protect yesterday's streak
                </button>
              )}
              {shields === 0 && (
                <div style={{ color: T.muted, fontSize: 13 }}>Earn shields by reaching 3-day milestones</div>
              )}
            </div>

            {/* Check-in CTA */}
            {!checkedToday ? (
              <button className="btn-p press" onClick={onCheckIn} style={{ animation: "glow 3s ease-in-out infinite" }}>
                🔥 Check in for today (+20 XP)
              </button>
            ) : (
              <div style={{ background: `${T.emerald}14`, border: `1px solid ${T.emerald}44`, borderRadius: 16, padding: 18, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔥</div>
                <div style={{ color: T.emerald, fontWeight: 700, fontSize: 16 }}>Streak alive! Come back tomorrow.</div>
                <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>You've checked in for day {streak}</div>
              </div>
            )}
          </div>
        )}

        {/* LEAGUE TAB */}
        {tab === "league" && (
          <div className="fu">
            <div className="glass" style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Gurugram Weekly League</div>
              {[{ name: user?.name || "You", avatar: user?.avatar || "🌱", streak, ripples: streak * 3, isMe: true }, ...LEAGUE].sort((a, b) => b.streak - a.streak).map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < LEAGUE.length ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 24, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: i === 0 ? T.gold : i === 1 ? T.muted : i === 2 ? T.warm : T.muted, textAlign: "center" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: p.isMe ? `linear-gradient(135deg,${T.teal},${T.violet})` : `${T.warm}22`, border: p.isMe ? `2px solid ${T.teal}` : `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {p.avatar || p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: p.isMe ? T.teal : T.white, fontWeight: p.isMe ? 700 : 500, fontSize: 14 }}>{p.name}{p.isMe ? " (you)" : ""}</div>
                    <div style={{ color: T.muted, fontSize: 12 }}>{p.ripples} ripples this week</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 14 }}>🔥</span>
                    <span style={{ color: T.warm, fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16 }}>{p.streak}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ color: T.muted, fontSize: 12, textAlign: "center" }}>League resets every Sunday · Top 3 earn bonus XP</div>
          </div>
        )}

        {/* MILESTONES TAB */}
        {tab === "milestones" && (
          <div className="fu">
            {STREAK_MILESTONES.map((m, i) => {
              const done = streak >= m;
              const next = streak < m && (i === 0 || streak >= STREAK_MILESTONES[i - 1]);
              return (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 14, background: done ? `${T.warm}10` : "rgba(255,255,255,.025)", border: `1px solid ${done ? T.warm + "44" : next ? T.teal + "44" : T.border}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10, animation: `fadeUp .4s ${i * .08}s both` }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: done ? `linear-gradient(135deg,${T.warm},${T.urgent})` : next ? `${T.teal}18` : "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: done ? `0 0 16px ${T.warm}44` : "none", flexShrink: 0 }}>
                    {done ? "🔥" : next ? "🎯" : "🔒"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: done ? T.warm : next ? T.white : T.muted, fontWeight: done || next ? 700 : 400, fontSize: 15, marginBottom: 2 }}>{m}-day streak</div>
                    <div style={{ color: T.muted, fontSize: 12 }}>{done ? "Completed!" : next ? `${m - streak} days to go` : `Locked`}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: done ? T.gold : T.muted, fontSize: 13, fontWeight: 700 }}>+{m * 12} XP</div>
                    {m <= 7 && <div style={{ color: T.violet, fontSize: 11, marginTop: 2 }}>+1 Shield</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// FEATURE 2: INSTANT VIDEO HELP MODE
// ══════════════════════════════════════════════════════

function VideoMatchView({ onBack, onComplete, user }) {
  const [phase, setPhase] = useState("standby"); // standby | searching | matched | call | done
  const [countdown, setCountdown] = useState(60);
  const [matched, setMatched] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const timerRef = useRef(null);

  const startSearch = () => {
    setPhase("searching");
    let t = 60;
    timerRef.current = setInterval(() => {
      t--;
      setCountdown(t);
      if (t <= 45 && phase !== "matched") {
        clearInterval(timerRef.current);
        setMatched({ name: "Aanya S.", avatar: "🌸", cat: "urgent", need: "Need a ride to Medanta", dist: "0.8 km away", time: "3m ago" });
        setPhase("matched");
      }
    }, 1000);
  };

  const acceptCall = () => {
    setPhase("call");
    let s = 0;
    timerRef.current = setInterval(() => { s++; setCallTime(s); }, 1000);
    setTimeout(() => {
      clearInterval(timerRef.current);
      setPhase("done");
    }, 8000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmtTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const c = catOf("urgent");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="glass" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.border}` }}>
          <button className="press" onClick={onBack} style={{ background: "rgba(255,255,255,.05)", border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 12px", color: T.muted, fontSize: 13 }}>← Back</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: T.white }}>Instant Video Help</div>
            <div style={{ color: T.teal, fontSize: 12 }}>Be available for someone right now</div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, position: "relative" }}>
          <OrbBg cols={[T.emerald, T.teal, T.violet]} />

          {/* STANDBY */}
          {phase === "standby" && (
            <div style={{ textAlign: "center", position: "relative", zIndex: 1, animation: "fadeUp .5s both" }}>
              <div style={{ fontSize: 80, marginBottom: 24, animation: "float3d 6s ease-in-out infinite", filter: `drop-shadow(0 0 24px ${T.emerald}66)` }}>📹</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: T.white, marginBottom: 10 }}>Help Someone Live</h2>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 280 }}>
                Tap "I'm Available Now" and get matched with someone who needs help — within 60 seconds.
              </p>
              {[["📹 Video", "See & guide in real time"], ["📞 Voice only", "Audio call, no camera"], ["💬 Chat", "Text-based live support"]].map(([type, sub], i) => (
                <div key={i} className="glass hov press" style={{ borderRadius: 14, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, textAlign: "left", cursor: "pointer", animation: `fadeUp .4s ${.1 + i * .08}s both`, border: `1px solid ${i === 0 ? T.teal + "44" : T.border}` }} onClick={i === 0 ? startSearch : undefined}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{type.split(" ")[0]}</div>
                  <div>
                    <div style={{ color: T.white, fontWeight: 600, fontSize: 14 }}>{type.split(" ").slice(1).join(" ")}</div>
                    <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{sub}</div>
                  </div>
                  {i === 0 && <div style={{ marginLeft: "auto", background: `${T.teal}22`, border: `1px solid ${T.teal}44`, borderRadius: 8, padding: "4px 10px", color: T.teal, fontSize: 11, fontWeight: 700 }}>GO LIVE</div>}
                </div>
              ))}
            </div>
          )}

          {/* SEARCHING */}
          {phase === "searching" && (
            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              {/* Sonar rings */}
              <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 28px" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ position: "absolute", inset: `${i * 18}px`, borderRadius: "50%", border: `2px solid ${T.emerald}`, animation: `sonarRing ${1.4 + i * .4}s ease-out infinite`, animationDelay: `${i * .35}s` }} />
                ))}
                <div style={{ position: "absolute", inset: 54, borderRadius: "50%", background: `${T.emerald}18`, border: `2px solid ${T.emerald}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, animation: "callPulse 2s infinite" }}>
                  {user?.avatar || "🌱"}
                </div>
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: T.white, marginBottom: 8 }}>Matching you now…</div>
              <div style={{ color: T.teal, fontSize: 28, fontWeight: 800, fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>{countdown}s</div>
              <div style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Looking for someone who needs help nearby</div>
              <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.teal, animation: `dotBounce .9s ${i * .2}s infinite` }} />)}
              </div>
            </div>
          )}

          {/* MATCHED */}
          {phase === "matched" && matched && (
            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 340, animation: "cardReveal .6s both" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ color: T.emerald, fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>MATCH FOUND</div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: T.white }}>Someone needs you!</h2>
              </div>
              <TiltCard style={{ background: T.panel, border: `2px solid ${c.color}55`, borderRadius: 22, padding: 22, marginBottom: 20, boxShadow: `0 20px 50px rgba(0,0,0,.5), 0 0 30px ${c.color}18`, backdropFilter: "blur(20px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${T.warm}22`, border: `2px solid ${T.warm}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, animation: "callPulse 2s infinite" }}>
                    {matched.avatar}
                  </div>
                  <div>
                    <div style={{ color: T.white, fontWeight: 700, fontSize: 16 }}>{matched.name}</div>
                    <div style={{ color: c.color, fontSize: 12, marginTop: 2 }}>{matched.dist}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: T.urgent, fontSize: 10, background: `${T.urgent}18`, border: `1px solid ${T.urgent}35`, padding: "3px 8px", borderRadius: 20, fontWeight: 700 }}>URGENT</div>
                </div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{matched.need}</div>
                <div style={{ color: T.muted, fontSize: 13 }}>{matched.time} · tap to accept video call</div>
              </TiltCard>
              <button className="btn-p press" onClick={acceptCall} style={{ marginBottom: 10, animation: "glow 2s ease-in-out infinite" }}>
                📹 Accept Video Call
              </button>
              <button className="press btn-s" onClick={() => setPhase("searching")}>Skip — find another match</button>
            </div>
          )}

          {/* IN CALL */}
          {phase === "call" && (
            <div style={{ position: "relative", zIndex: 1, width: "100%", textAlign: "center" }}>
              {/* Simulated video frame */}
              <div style={{ background: `linear-gradient(135deg,#0a1628,#08122a)`, border: `2px solid ${T.emerald}44`, borderRadius: 20, padding: 0, overflow: "hidden", marginBottom: 16, position: "relative", height: 240 }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <div style={{ fontSize: 64 }}>{matched?.avatar || "🌸"}</div>
                  <div style={{ color: T.muted, fontSize: 13, marginTop: 8 }}>Live video · {matched?.name}</div>
                </div>
                <div style={{ position: "absolute", bottom: 12, right: 12, width: 64, height: 64, borderRadius: 12, background: `${T.emerald}22`, border: `1px solid ${T.emerald}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                  {user?.avatar || "🌱"}
                </div>
                <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,.6)", borderRadius: 8, padding: "4px 10px", color: T.emerald, fontSize: 12, fontWeight: 700 }}>
                  {fmtTime(callTime)}
                </div>
              </div>
              {/* Controls */}
              <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                {[["🎤", T.teal, "Mute"], ["📹", T.teal, "Camera"], ["💬", T.violet, "Chat"]].map(([ic, col, lbl]) => (
                  <div key={lbl} style={{ textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${col}18`, border: `1px solid ${col}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 4 }}>{ic}</div>
                    <div style={{ color: T.muted, fontSize: 11 }}>{lbl}</div>
                  </div>
                ))}
                <div style={{ textAlign: "center" }}>
                  <div className="press" onClick={() => { clearInterval(timerRef.current); setPhase("done"); }} style={{ width: 52, height: 52, borderRadius: "50%", background: `${T.urgent}18`, border: `1px solid ${T.urgent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 4, cursor: "pointer" }}>📵</div>
                  <div style={{ color: T.urgent, fontSize: 11 }}>End</div>
                </div>
              </div>
            </div>
          )}

          {/* DONE */}
          {phase === "done" && (
            <div style={{ position: "relative", zIndex: 1, textAlign: "center", animation: "scaleIn .5s both" }}>
              <div style={{ fontSize: 72, marginBottom: 20, animation: "streakPop .7s both" }}>🌊</div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: T.emerald, marginBottom: 8 }}>Session complete!</h2>
              <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>You helped {matched?.name} for {fmtTime(callTime)}.<br />That moment mattered.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}>
                {["+80 XP", "+1 Shield", "+3 Ripples"].map(b => (
                  <span key={b} style={{ background: `${T.teal}18`, border: `1px solid ${T.teal}44`, borderRadius: 20, padding: "6px 14px", color: T.teal, fontSize: 13, fontWeight: 700, animation: "popIn .5s both" }}>{b}</span>
                ))}
              </div>
              <button className="btn-p press" onClick={() => { onComplete(80); onBack(); }}>Back to map</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// FEATURE 3: MILESTONE SHARE CARDS
// ══════════════════════════════════════════════════════

const SHARE_TEMPLATES = {
  first:   { emoji: "🌊", title: "First Ripple",    sub: "Just helped someone in my community.",      gradient: ["#00e8b4","#00bf94"] },
  streak7: { emoji: "🔥", title: "7-Day Streak!",   sub: "7 days of kindness in a row.",              gradient: ["#ff7b3a","#ff3d5a"] },
  streak30:{ emoji: "🏆", title: "30-Day Champion", sub: "30 days of making a difference.",           gradient: ["#ffc43d","#ff7b3a"] },
  xp100:   { emoji: "💫", title: "100 XP Earned",   sub: "Growing through giving.",                   gradient: ["#8580ff","#00e8b4"] },
  video1:  { emoji: "📹", title: "Live Helper",      sub: "Just helped someone via video in real time.",gradient: ["#1de99b","#00e8b4"] },
};

function ShareCardOverlay({ type, user, xp, streak, onShare, onClose }) {
  const tpl = SHARE_TEMPLATES[type] || SHARE_TEMPLATES.first;
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef();

  const handleShare = () => {
    setCopied(true);
    onShare();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 8500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(2,4,15,.88)", backdropFilter: "blur(20px)", padding: 24, animation: "fadeIn .3s both" }}>
      <ParticleCanvas />

      {/* The share card */}
      <div ref={canvasRef} style={{ width: "100%", maxWidth: 320, background: `linear-gradient(145deg,#05091a,#08122a)`, border: `1px solid ${T.teal}33`, borderRadius: 24, padding: 28, textAlign: "center", position: "relative", overflow: "hidden", animation: "cardReveal .6s cubic-bezier(.22,1,.36,1) both", zIndex: 1 }}>
        {/* Shimmer bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${tpl.gradient[0]},${tpl.gradient[1]},${tpl.gradient[0]})`, backgroundSize: "200% 100%", animation: "shimmerSlide 2s linear infinite" }} />

        {/* KCF icon mark (compact) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <svg viewBox="0 0 96 96" style={{ width: 36, height: 36 }}>
            <rect x="0" y="0" width="96" height="96" rx="17" fill={tpl.gradient[0]} />
            <rect x="22" y="19" width="17" height="58" rx="4" fill="#05091a" />
            <polygon points="39,48 72,19 83,19 83,31 50,52" fill="#05091a" />
            <polygon points="39,52 72,77 83,77 83,65 50,46" fill="#05091a" />
            <circle cx="68" cy="27" r="5" fill={tpl.gradient[0]} />
          </svg>
        </div>

        {/* Big emoji */}
        <div style={{ fontSize: 64, marginBottom: 16, animation: "streakPop .7s .2s both", display: "block" }}>{tpl.emoji}</div>

        {/* Achievement */}
        <div style={{ background: `linear-gradient(90deg,${tpl.gradient[0]},${tpl.gradient[1]})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{tpl.title}</div>
        <div style={{ color: T.muted, fontSize: 14, marginBottom: 20 }}>{tpl.sub}</div>

        {/* User + stats */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: tpl.gradient[0], fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>{xp}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>XP</div>
          </div>
          <div style={{ width: 1, background: T.border }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: tpl.gradient[0], fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>{streak}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>day streak</div>
          </div>
          <div style={{ width: 1, background: T.border }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: tpl.gradient[0], fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>{streak * 3}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>ripples</div>
          </div>
        </div>

        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${tpl.gradient[0]},${tpl.gradient[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{user?.avatar || "🌱"}</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: T.white, fontWeight: 700, fontSize: 13 }}>{user?.name || "A Helper"}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>kindness · community · healing</div>
          </div>
        </div>

        {/* Watermark */}
        <div style={{ marginTop: 16, color: T.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>KindWave · Help Others → Heal Yourself</div>
      </div>

      {/* Actions */}
      <div style={{ width: "100%", maxWidth: 320, marginTop: 16, display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}>
        <button className="btn-p press" onClick={handleShare}>
          {copied ? "✓ Copied to clipboard!" : "📤 Share your impact card"}
        </button>
        <button className="btn-s press" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}

// ── Streak header pill (used in HelpFeed) ───────────────
function StreakPill({ streak, checkedToday, onGoToStreak }) {
  return (
    <button className="press" onClick={onGoToStreak} style={{ display: "flex", alignItems: "center", gap: 6, background: streak > 0 ? `${T.warm}18` : "rgba(255,255,255,.05)", border: `1px solid ${streak > 0 ? T.warm + "44" : T.border}`, borderRadius: 20, padding: "5px 12px 5px 8px" }}>
      <span style={{ fontSize: 16, animation: streak > 0 ? "fireDance 2s ease-in-out infinite" : "none" }}>{streak > 0 ? "🔥" : "🌱"}</span>
      <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: streak > 0 ? T.warm : T.muted }}>{streak}</span>
      {checkedToday && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.emerald, display: "inline-block" }} />}
    </button>
  );
}

// Bottom Nav
function BottomNav({ active, setActive, isVol, streak }) {
  const tabs = [
    { id: "map",    icon: "🗺️", l: "Map"     },
    { id: "help",   icon: "💚", l: "Help"    },
    { id: "streak", icon: streak > 0 ? "🔥" : "🌱", l: streak > 0 ? `${streak}` : "Streak" },
    { id: "heal",   icon: "✦",  l: "Heal"   },
    { id: "me",     icon: "👤", l: "Profile" },
  ];
  return (
    <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 3, zIndex: 100, background: "rgba(8,18,42,.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", borderRadius: 28, padding: "5px", border: `1px solid ${T.border}`, boxShadow: "0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.03)" }}>
      {tabs.map(t => {
        const on = active === t.id;
        const isStreak = t.id === "streak";
        return (
          <button key={t.id} className="press" onClick={() => setActive(t.id)} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", background: on ? (isStreak && streak > 0 ? `rgba(255,123,58,.16)` : `rgba(0,232,180,.12)`) : "transparent", border: `1px solid ${on ? (isStreak && streak > 0 ? T.warm : T.tealDim) : T.border}`, borderRadius: 22, padding: "7px 14px", transition: "all .25s", boxShadow: on ? (isStreak && streak > 0 ? `0 0 16px rgba(255,123,58,.25)` : `0 0 16px rgba(0,232,180,.18)`) : "none" }}>
            <span style={{ fontSize: 18, animation: isStreak && streak > 0 && on ? "fireDance 2s ease-in-out infinite" : "none" }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: on ? (isStreak && streak > 0 ? T.warm : T.teal) : T.muted, fontWeight: on ? 700 : 400, marginTop: 3, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.l}</span>
            {t.id === "help" && isVol && <div style={{ position: "absolute", top: 5, right: 8, width: 7, height: 7, borderRadius: "50%", background: T.emerald, boxShadow: `0 0 6px ${T.emerald}` }} />}
          </button>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════
export default function KindWaveApp() {
  const [user, setUser]               = useState(null);
  const [xp, setXp]                   = useState(0);
  const [tab, setTab]                 = useState("map");
  const [pins, setPins]               = useState(PINS);
  const [filterCats, setFilterCats]   = useState([]);
  const [view, setView]               = useState("main");
  const [selPin, setSelPin]           = useState(null);
  const [chatPin, setChatPin]         = useState(null);
  const [isVol, setIsVol]             = useState(false);
  const [accepted, setAccepted]       = useState(false);
  const [toast, setToast]             = useState(null);
  const [xpToast, setXpToast]         = useState(null);
  const [badgeQ, setBadgeQ]           = useState([]);
  const [firstVisit, setFirstVisit]   = useState(true);
  const [tooltipDismissed, setTooltipDismissed] = useState({});

  // ── Feature 1: Streak ──────────────────────────────
  const [streak, setStreak]           = useState(0);
  const [shields, setShields]         = useState(2);
  const [checkedToday, setCheckedToday] = useState(false);

  // ── Feature 3: Share card ──────────────────────────
  const [shareCard, setShareCard]     = useState(null);
  const [sharedOnce, setSharedOnce]   = useState(false);

  const notify = (msg) => setToast(msg);

  const addXP = (n) => {
    setXp(prev => prev + n);
    setXpToast(n);
  };

  const handleCheckIn = () => {
    if (checkedToday) return;
    const newStreak = streak + 1;
    setStreak(newStreak);
    setCheckedToday(true);
    addXP(20);
    notify(`🔥 Streak: ${newStreak} days! Keep it going!`);

    // Streak milestone badges
    if (newStreak === 3) setBadgeQ(prev => [...prev, BADGES.find(b => b.id === "streak3")]);
    if (newStreak === 7) {
      setBadgeQ(prev => [...prev, BADGES.find(b => b.id === "streak7")]);
      setTimeout(() => setShareCard("streak7"), 3500);
    }
    if (newStreak === 30) {
      setBadgeQ(prev => [...prev, BADGES.find(b => b.id === "streak30")]);
      setTimeout(() => setShareCard("streak30"), 3500);
    }
    // Earn a shield at milestones
    if (STREAK_MILESTONES.slice(0, 3).includes(newStreak)) {
      setShields(s => Math.min(3, s + 1));
      notify("🛡️ Streak Shield earned!");
    }
  };

  const handleUseShield = () => {
    if (shields < 1) return;
    setShields(s => s - 1);
    setStreak(prev => Math.max(prev, 1));
    setCheckedToday(true);
    notify("🛡️ Shield used — streak protected!");
  };

  const handleComplete = (profile, initialXP) => {
    setUser(profile);
    setXp(initialXP);
    setBadgeQ([BADGES.find(b => b.id === "journey")]);
    notify(`Welcome, ${profile.name || "Friend"}! ✦ Help Others → Heal Yourself`);
  };

  const handleAccept = (p) => {
    setAccepted(true);
    addXP(50);
    notify(`Accepted! Chat with ${p.user} to coordinate.`);
    setBadgeQ(prev => [...prev, BADGES.find(b => b.id === "first")]);
    // Trigger share card after first accepted help
    setTimeout(() => setShareCard("first"), 3500);
  };

  const handleVideoComplete = (earnedXP) => {
    addXP(earnedXP);
    setBadgeQ(prev => [...prev, BADGES.find(b => b.id === "video1")]);
    setTimeout(() => setShareCard("video1"), 3500);
  };

  const handleShare = () => {
    if (!sharedOnce) {
      setSharedOnce(true);
      addXP(25);
      setBadgeQ(prev => [...prev, BADGES.find(b => b.id === "share1")]);
    }
    notify("Impact card copied! Share it to spread kindness. ✨");
  };

  if (!user) return (<Onboarding onComplete={handleComplete} />);

  const showTooltip = firstVisit && !tooltipDismissed[tab];
  const dismissTooltip = () => {
    setTooltipDismissed(prev => ({ ...prev, [tab]: true }));
    if (Object.keys(tooltipDismissed).length >= 3) setFirstVisit(false);
  };

  return (
    <div style={{ height: "calc(100vh - var(--kw-offset, 0px))", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans',sans-serif", color: T.white, width: "100%", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* Notifications */}
      {toast   && <Toast msg={toast} onDone={() => setToast(null)} />}
      {xpToast && <XPToast xp={xpToast} onDone={() => setXpToast(null)} />}
      {badgeQ.length > 0 && <BadgeUnlock badge={badgeQ[0]} onDone={() => setBadgeQ(prev => prev.slice(1))} />}

      {/* Feature 3: Share card overlay */}
      {shareCard && view === "main" && (
        <ShareCardOverlay
          type={shareCard}
          user={user}
          xp={xp}
          streak={streak}
          onShare={handleShare}
          onClose={() => setShareCard(null)}
        />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {view === "main" && tab === "map" && (
          <MapView pins={pins}
            onPin={p => { setSelPin(p); setAccepted(false); setView("detail"); }}
            onAdd={() => setView("post")}
            filterCats={filterCats}
            setFilterCats={setFilterCats}
          />
        )}
        {view === "main" && tab === "help" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Streak banner in help feed */}
            <StreakBanner streak={streak} checkedToday={checkedToday} onCheckIn={handleCheckIn} />
            {/* Video Help NOW button */}
            <div style={{ margin: "10px 16px 0", display: "flex", gap: 8 }}>
              <button className="press" onClick={() => setView("video")} style={{ flex: 1, background: `linear-gradient(135deg,${T.emerald}18,${T.teal}10)`, border: `1px solid ${T.emerald}44`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>📹</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: T.emerald, fontWeight: 700, fontSize: 14 }}>Help RIGHT NOW</div>
                  <div style={{ color: T.muted, fontSize: 11 }}>Instant video match · 60s</div>
                </div>
                <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: T.emerald, animation: "callPulse 2s infinite" }} />
              </button>
            </div>
            <HelpFeed
              pins={pins}
              onPin={p => { setSelPin(p); setAccepted(false); setView("detail"); }}
              isVol={isVol}
              setIsVol={v => { setIsVol(v); if (v) { notify("🟢 You're now visible as available!"); addXP(5); } else notify("⚪ You're now offline."); }}
              onAdd={() => setView("post")}
              onXP={addXP}
            />
          </div>
        )}
        {view === "main" && tab === "streak" && (
          <StreakView
            streak={streak}
            shields={shields}
            checkedToday={checkedToday}
            onCheckIn={handleCheckIn}
            onUseShield={handleUseShield}
            user={user}
            xp={xp}
            badgeList={badgeQ}
          />
        )}
        {view === "main" && tab === "heal" && <HealingView user={user} xp={xp} onXP={addXP} />}
        {view === "main" && tab === "me"   && <ProfileView user={user} xp={xp} onXP={addXP} onLogout={() => setUser(null)} />}

        {view === "detail" && selPin && (
          <PinDetail
            pin={selPin}
            onBack={() => setView("main")}
            onChat={p => { setChatPin(p); setView("chat"); }}
            onAccept={handleAccept}
            accepted={accepted}
          />
        )}
        {view === "chat" && chatPin && <ChatView pin={chatPin} onBack={() => setView(selPin ? "detail" : "main")} />}
        {view === "post" && (
          <PostRequest
            onBack={() => setView("main")}
            onPost={f => {
              setPins(prev => [{ id: Date.now(), title: f.title, desc: f.desc, cat: f.cat, urgency: f.urgency, x: 38 + Math.random() * 18, y: 38 + Math.random() * 18, user: user?.name || "You", time: "Just now", verified: false }, ...prev]);
              addXP(20);
              notify("🗺️ Your request is live on the map!");
            }}
          />
        )}
        {view === "video" && (
          <VideoMatchView
            onBack={() => setView("main")}
            onComplete={handleVideoComplete}
            user={user}
          />
        )}

        {view === "main" && showTooltip && <TooltipGuide tab={tab} onDismiss={dismissTooltip} />}
      </div>

      {view === "main" && <BottomNav active={tab} setActive={setTab} isVol={isVol} streak={streak} />}
    </div>
  );
}
