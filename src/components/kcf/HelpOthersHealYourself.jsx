import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Geolocation hook — resolves once, no city name needed here
function useGeoLocation() {
  const [loc, setLoc] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) { setLoc({ lat: 37.7749, lng: -122.4194 }); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLoc({ lat: coords.latitude, lng: coords.longitude }),
      () => setLoc({ lat: 37.7749, lng: -122.4194 }),
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);
  return loc;
}

// Coloured inline-SVG marker
function pinIcon(color) {
  return L.divIcon({
    html: `<svg width="32" height="42" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 5px ${color}99);display:block"><path d="M17 0C7.6 0 0 7.6 0 17c0 11 17 27 17 27s17-16 17-27C34 7.6 26.4 0 17 0z" fill="${color}"/><circle cx="17" cy="16" r="7" fill="#030712" opacity=".85"/></svg>`,
    iconSize: [32, 42], iconAnchor: [16, 42], className: "",
  });
}

// Scatter offsets for demo pins around user
const PIN_OFFSETS = [
  { dlat: -0.010, dlng: -0.015, color: "#f43f5e" },
  { dlat:  0.016, dlng:  0.008, color: "#8b66ff" },
  { dlat:  0.005, dlng: -0.022, color: "#44aaff" },
  { dlat: -0.018, dlng:  0.019, color: "#f43f5e" },
];

const MY_DOT = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#00e8b4,#00bf94);border:3px solid rgba(255,255,255,.9);box-shadow:0 0 0 4px rgba(0,232,180,.25)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7], className: "",
});

// Auto-pan to user location once it resolves
function MapRecenter({ loc }) {
  const map = useMap();
  useEffect(() => { if (loc) map.setView([loc.lat, loc.lng], 14, { animate: true }); }, [loc, map]);
  return null;
}

// Map card — fills 100% of parent via absolute positioning
function LiveMapCard() {
  const loc = useGeoLocation();
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {!loc && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(3,7,18,0.88)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #00e8b4", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          <span style={{ color: "#4a7a9b", fontSize: 12 }}>Getting your location…</span>
        </div>
      )}
      <MapContainer
        center={[37.7749, -122.4194]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {loc && <MapRecenter loc={loc} />}
        {loc && <Marker position={[loc.lat, loc.lng]} icon={MY_DOT} zIndexOffset={1000} />}
        {loc && PIN_OFFSETS.map((p, i) => (
          <Marker key={i} position={[loc.lat + p.dlat, loc.lng + p.dlng]} icon={pinIcon(p.color)} />
        ))}
      </MapContainer>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" } }),
};

const scenes = [
  {
    id: "insight",
    tag: "The Insight",
    headline: "The fastest way to heal is not receiving help — it's giving it.",
    body: "Counter-intuitive but science-backed: a small act of service breaks isolation for the giver just as much as the receiver. Carrying groceries. Asking 'Are you okay?' Simply listening.",
    visual: "⟶",
    accent: "rgba(244,63,94,0.08)",
  },
  {
    id: "science",
    tag: "The Science",
    headline: "Helping others changes your brain.",
    body: "Oxytocin and dopamine release create a natural mood lift. Cortisol — the stress hormone — measurably drops. A sense of purpose and connection is restored. Science-backed. Human-proven.",
    visual: "🧠",
    accent: "rgba(139,102,255,0.08)",
  },
  {
    id: "platform",
    tag: "The Platform",
    headline: "Imagine a world where help is visible and anyone can step in.",
    body: "A real-time GPS-powered help map where every act of need and every offer of kindness is just a tap away. Urgent, emotional, general, community — all visible, all near you.",
    visual: "📍",
    accent: "rgba(68,170,255,0.07)",
  },
];

const journeySteps = [
  { icon: "🧭", label: "Explorer", desc: "Just curious, exploring what's possible" },
  { icon: "🙌", label: "Helper", desc: "Offering small acts, local help" },
  { icon: "🔗", label: "Connector", desc: "Building community ties" },
  { icon: "🏅", label: "Leader", desc: "Guiding others on their journey" },
  { icon: "⭐", label: "Mentor", desc: "Creating lasting ripples of change" },
];

const safetyItems = [
  { icon: "✅", title: "Verified Users", desc: "Phone verification + Good Samaritan pledge at signup" },
  { icon: "🔒", title: "Masked Contacts", desc: "No phone numbers shared until mutual consent" },
  { icon: "🛡️", title: "AI Moderation", desc: "Pre-screening + human review within 1 hour" },
  { icon: "👁️", title: "Privacy Control", desc: "Approximate zones only — never precise GPS" },
  { icon: "🚨", title: "Crisis Protocol", desc: "Mental health hotline links on emotional pins" },
];

const moods = ["😌 Peaceful", "😊 Happy", "💪 Energised", "🥹 Touched", "🌟 Purposeful"];

export default function HelpOthersHealYourself() {
  const [activeMood, setActiveMood] = useState(null);
  const [startLevel, setStartLevel] = useState(null);

  const levels = [
    { icon: "🌫", label: "Just exploring", desc: "I'm not sure what I need yet — just curious" },
    { icon: "🌱", label: "Curious to help", desc: "I feel okay and would like to offer something small" },
    { icon: "🤝", label: "Ready to engage", desc: "I'm in a good place and ready to connect" },
    { icon: "🔥", label: "Committed to growth", desc: "I want to make real, lasting impact" },
  ];

  return (
    <div style={{ background: "#030712" }} className="text-white overflow-x-hidden">

      {/* ── UNIVERSAL TRUTH ── */}
      <section className="py-28 px-5 md:px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[160px]"
            style={{ background: "radial-gradient(ellipse, rgba(244,63,94,0.07) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-rose-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-10"
              style={{ background: "rgba(244,63,94,0.06)" }}>
              ✦ A Universal Truth
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              No matter who we are…<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
                at some point, we all feel lost.
              </span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed max-w-2xl mx-auto mb-14">
              Disconnected. Stuck. Alone. It touches every life — rich or poor, young or old.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: "🌙", label: "Scrolling alone at night" },
              { icon: "😰", label: "Stressed parent" },
              { icon: "😟", label: "Anxious teenager" },
              { icon: "🪑", label: "Elderly & quiet" },
              { icon: "💼", label: "Successful but empty" },
            ].map((item, i) => (
              <motion.div key={item.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="rounded-2xl p-5 flex flex-col items-center gap-3 border border-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                <span className="text-3xl">{item.icon}</span>
                <span className="text-white/40 text-xs text-center leading-snug">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE KEY INSIGHTS ── */}
      <section className="py-16 px-5 md:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {scenes.map((s, i) => (
            <motion.div key={s.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="rounded-3xl p-8 border border-white/[0.08] hover:-translate-y-1 transition-all duration-300"
              style={{ background: `rgba(255,255,255,0.025)`, backdropFilter: "blur(10px)" }}>
              <div className="text-5xl mb-6">{s.visual}</div>
              <div className="inline-block text-rose-400 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-rose-500/20 mb-4"
                style={{ background: "rgba(244,63,94,0.08)" }}>
                {s.tag}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 leading-snug">{s.headline}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── GPS HELP MAP CONCEPT ── */}
      <section className="py-28 px-5 md:px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[150px]"
            style={{ background: "radial-gradient(ellipse, rgba(68,170,255,0.06) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-rose-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6"
              style={{ background: "rgba(244,63,94,0.06)" }}>
              ✦ The Platform
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 max-w-3xl">
              Help is always <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>within reach.</span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed max-w-xl">
              A real-time map where every act of need and every offer of kindness is visible and a tap away.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Live map — fills full card height */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="rounded-3xl border border-white/[0.08] relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", minHeight: "380px" }}>
              {/* Label overlay */}
              <div className="absolute top-4 left-4 z-[1000] text-xs text-white/60 tracking-widest uppercase font-bold px-3 py-1.5 rounded-full border border-white/10" style={{ background: "rgba(3,7,18,0.75)", backdropFilter: "blur(8px)" }}>
                Help Near You
              </div>
              <LiveMapCard />
            </motion.div>

            {/* Connection moment */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="rounded-3xl p-8 border border-white/[0.08] flex flex-col justify-between"
              style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
              <div>
                <div className="text-xs text-white/30 tracking-widest uppercase font-bold mb-6">Real Human Connection</div>
                <h3 className="text-2xl font-bold text-white mb-3 leading-snug">A stranger becomes a connection.<br />A moment becomes meaning.</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-8">
                  Someone nearby asks for help. Someone else responds. In two minutes, isolation breaks — for both of them.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl px-5 py-4 border border-white/[0.06]" style={{ background: "rgba(244,63,94,0.06)" }}>
                  <div className="text-rose-300 text-xs font-bold mb-1">🙋 Request</div>
                  <div className="text-white/60 text-sm">"I need help carrying things to my car. Anyone nearby?"</div>
                </div>
                <div className="self-end text-white/20 text-xs">↓ Matched</div>
                <div className="rounded-2xl px-5 py-4 border border-white/[0.06]" style={{ background: "rgba(68,255,140,0.05)" }}>
                  <div className="text-emerald-400 text-xs font-bold mb-1">✓ Connected · 200m away</div>
                  <div className="text-white/60 text-sm">"I'm nearby — I'll be there in 2 minutes!"</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── START WHERE YOU ARE ── */}
      <section className="py-24 px-5 md:px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] blur-[130px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(139,102,255,0.07) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-violet-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6"
              style={{ background: "rgba(139,102,255,0.06)" }}>
              ✦ Your Entry Point
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Start where you are.</h2>
            <p className="text-white/40 text-lg">No pressure. No expectations.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {levels.map((level, i) => (
              <motion.button
                key={level.label}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                onClick={() => setStartLevel(level.label)}
                className={`text-left rounded-2xl px-6 py-5 border transition-all duration-200 ${startLevel === level.label ? "border-rose-400/40" : "border-white/[0.07] hover:border-white/20"}`}
                style={{
                  background: startLevel === level.label
                    ? "rgba(244,63,94,0.08)"
                    : "rgba(255,255,255,0.025)",
                  backdropFilter: "blur(10px)"
                }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{level.icon}</span>
                  <span className="font-bold text-white text-sm">{level.label}</span>
                  {startLevel === level.label && <span className="ml-auto text-rose-400 text-xs font-bold">Selected ✓</span>}
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{level.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HEALING LOOP ── */}
      <section className="py-24 px-5 md:px-10 lg:px-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-rose-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6"
              style={{ background: "rgba(244,63,94,0.06)" }}>
              ✦ The Healing Loop
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Every act of kindness becomes<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
                a step forward in your own healing.
              </span>
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="rounded-3xl p-6 md:p-12 border border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
            <div className="text-white/40 text-xs uppercase tracking-widest font-bold mb-6">✨ Help complete! How do you feel right now?</div>
            <div className="flex flex-wrap gap-3 mb-8">
              {moods.map((m) => (
                <button key={m}
                  onClick={() => setActiveMood(m)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${activeMood === m ? "border-rose-400/60 text-white" : "border-white/[0.07] text-white/50 hover:border-white/20 hover:text-white/70"}`}
                  style={{ background: activeMood === m ? "rgba(244,63,94,0.12)" : "rgba(255,255,255,0.04)" }}>
                  {m}
                </button>
              ))}
            </div>
            <div className="rounded-2xl px-6 py-4 border border-white/[0.06] mb-6 italic text-white/50 text-sm leading-relaxed"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              "Thank you so much — you truly made my day easier. I'm so grateful." — Sarah, 68
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-white/30">
              <span>📓 Journal entry saved</span>
              <span>⭐ Added to Miracles Log</span>
              <span>🌊 Ripple created</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PROGRESSION ── */}
      <section className="py-24 px-5 md:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-rose-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6"
              style={{ background: "rgba(244,63,94,0.06)" }}>
              ✦ Your Journey
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
              Your impact grows —{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
                and so do you.
              </span>
            </h2>
            <p className="text-white/40 text-lg">Every act of service takes you further along your journey.</p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-rose-500/20 via-violet-500/20 to-rose-500/20" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
              {journeySteps.map((step, i) => (
                <motion.div key={step.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border border-white/[0.08]"
                    style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)" }}>
                    {step.icon}
                  </div>
                  <div className="font-bold text-white text-sm">{step.label}</div>
                  <div className="text-white/35 text-xs leading-snug">{step.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="mt-14 rounded-3xl p-8 border border-white/[0.08] grid sm:grid-cols-3 gap-6 text-center"
            style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
            {[
              { icon: "🌊", value: "47", label: "Ripple count" },
              { icon: "🤝", value: "12", label: "Helps given" },
              { icon: "💚", value: "↑ Improving", label: "Mood trend" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-white font-bold text-2xl mb-1">{s.value}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SAFETY & TRUST ── */}
      <section className="py-24 px-5 md:px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(68,170,255,0.05) 0%, transparent 70%)" }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-14">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-blue-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-6"
              style={{ background: "rgba(68,170,255,0.06)" }}>
              ✦ Safety & Trust
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Built with safety, trust,<br />and dignity at the core.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {safetyItems.map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className={`rounded-2xl p-6 border border-white/[0.07] ${i === 4 ? "sm:col-span-2 md:col-span-1" : ""}`}
                style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                <div className="text-white/40 text-xs leading-relaxed">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISION ── */}
      <section className="py-28 px-5 md:px-10 lg:px-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] blur-[180px]"
            style={{ background: "radial-gradient(ellipse, rgba(244,63,94,0.08) 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-rose-400 text-xs font-bold tracking-widest uppercase px-5 py-2 rounded-full mb-10"
              style={{ background: "rgba(244,63,94,0.06)" }}>
              ✦ The Vision
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              A world where<br />
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
                no one feels alone.
              </span>
            </h2>
            <p className="text-white/40 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl mx-auto">
              Because help is always within reach. What starts with one act can transform entire communities — neighbourhood, city, world.
            </p>

            {/* Globe avatars */}
            <div className="flex flex-wrap justify-center gap-3 mb-14 text-2xl">
              {["👩 Bengaluru", "👨 New York", "👴 Lagos", "👧 Jakarta", "🧕 Dubai", "👦 São Paulo", "👩‍⚕️ London", "🧓 Tokyo"].map((p) => (
                <span key={p} className="text-sm text-white/30 flex items-center gap-1">{p}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">
            <a href="#kc-cta"
              className="group relative inline-flex items-center justify-center gap-2 text-white font-bold px-8 py-4 rounded-full hover:-translate-y-1 transition-all duration-300 text-base overflow-hidden w-full sm:w-auto"
              style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
              🤝 Start Helping
            </a>
            <a href="#kc-cta"
              className="inline-flex items-center justify-center gap-2 border border-white/[0.08] text-white font-semibold px-8 py-4 rounded-full hover:border-white/50 transition-all duration-300 text-base w-full sm:w-auto"
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)" }}>
              🙏 Ask for Help
            </a>
            <a href="#kc-cta"
              className="inline-flex items-center justify-center gap-2 border border-white/[0.08] text-white/60 font-semibold px-8 py-4 rounded-full hover:border-white/50 transition-all duration-300 text-base w-full sm:w-auto"
              style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(14px)" }}>
              🧭 Explore
            </a>
          </motion.div>

          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="mt-12 text-white/20 text-xs tracking-widest">
            A Kindness Community Initiative · KCF LLC, California, USA · 2026
          </motion.p>
        </div>
      </section>
    </div>
  );
}