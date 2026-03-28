import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { useInView } from "framer-motion";
import {
  ShieldCheck, Star, Lock, TrendingUp, Award, BarChart3,
  Store, Users, DollarSign, Building2, MapPin, Target,
  Smartphone, Globe, LayoutDashboard, PieChart, Database,
  Sparkles, Heart, ArrowRight, CheckCircle2,
  MessageSquare, Calendar, Cpu, Link2,
  ChevronLeft, ChevronRight
} from "lucide-react";

const initiatives = [
  {
    id: "freeappmaker",
    number: "01",
    title: "FreeAppMaker.ai",
    subtitle: "By MyMind Studio · KCF Initiative",
    tagline: "Instant Website to Android App Converter",
    description: "Turn any public website into a professional Android app in under 60 seconds — no coding required. Generate a ready-to-install APK or AAB for Google Play Store publishing instantly.",
    gradient: "from-rose-500 via-pink-500 to-rose-600",
    gradientDark: "from-rose-950 via-pink-950 to-rose-900",
    accent: "#f43f5e",
    accentLight: "rgba(244,63,94,0.15)",
    features: [
      { icon: Smartphone, label: "Instant APK", desc: "Download in under 60 seconds" },
      { icon: Globe, label: "Any Website", desc: "WebView-based build process" },
      { icon: Star, label: "Pro Upgrades", desc: "White-label & push notifications" },
      { icon: Store, label: "Play Store Ready", desc: "Optional AAB for publishing" },
    ],
    tags: ["Bloggers", "Small Businesses", "Creators", "Developers"],
    cta: { label: "Visit FreeAppMaker.ai", href: "https://freeappmaker.ai/" },
  },
  {
    id: "mymind-studio",
    number: "02",
    title: "MyMind Studio",
    subtitle: "By MyMind Studio · KCF Initiative",
    tagline: "Build Your Vision Into Reality",
    description: "A full-service digital product studio helping founders, startups, and businesses turn ideas into powerful custom apps, websites, and AI-enabled systems — with zero hidden costs and 100% code ownership.",
    gradient: "from-indigo-500 via-violet-500 to-indigo-600",
    gradientDark: "from-indigo-950 via-violet-950 to-indigo-900",
    accent: "#6366f1",
    accentLight: "rgba(99,102,241,0.15)",
    features: [
      { icon: Target, label: "Free Roadmap", desc: "Clear timeline & cost estimate" },
      { icon: ShieldCheck, label: "0 Hidden Costs", desc: "Full transparency upfront" },
      { icon: Database, label: "100% Code Ownership", desc: "You own everything" },
      { icon: Cpu, label: "AI Integrations", desc: "Web, mobile, SaaS & automation" },
    ],
    tags: ["Web Apps", "Mobile Apps", "SaaS", "AI Systems"],
    cta: { label: "Visit MyMind Studio", href: "https://mymindstudio.ai/" },
  },
  {
    id: "service-connect-pro",
    number: "03",
    title: "ServiceConnectPro.ai",
    subtitle: "By MyMind Studio · KCF Initiative",
    tagline: "Find Help. Get Hired. Build Trust.",
    description: "A digital service marketplace connecting service seekers with verified local providers — built on Trust, Transparency, Accessibility, and Community with unified bookings, messaging, and payments.",
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    gradientDark: "from-emerald-950 via-teal-950 to-emerald-900",
    accent: "#10b981",
    accentLight: "rgba(16,185,129,0.15)",
    features: [
      { icon: ShieldCheck, label: "Verified Providers", desc: "Ratings & reviews for trust" },
      { icon: Star, label: "Secure Bookings", desc: "Safe payment options" },
      { icon: TrendingUp, label: "Predictable Income", desc: "Quality leads for providers" },
      { icon: Award, label: "Reputation Building", desc: "Performance history tracking" },
    ],
    tags: ["Trust", "Transparency", "Accessibility", "Community"],
    cta: { label: "Visit ServiceConnectPro.ai", href: "https://serviceconnectpro.ai" },
  },
  {
    id: "kcf-foundation",
    number: "04",
    title: "KCF Foundation",
    subtitle: "By MyMind Studio · KCF Initiative",
    tagline: "Find Peace, Comfort & Biblical Guidance",
    description: "A safe, peaceful space providing emotional support, scripture-based guidance, and a calming presence for anyone seeking comfort, spiritual growth, or personal reflection.",
    gradient: "from-sky-500 via-cyan-500 to-sky-600",
    gradientDark: "from-sky-950 via-cyan-950 to-sky-900",
    accent: "#0ea5e9",
    accentLight: "rgba(14,165,233,0.15)",
    features: [
      { icon: Sparkles, label: "Bible Bot & AI Bible", desc: "Personalized scripture guidance" },
      { icon: Heart, label: "Self-Aid Tools", desc: "Manage stress, anxiety & mood" },
      { icon: MessageSquare, label: "Mood Support", desc: "Gentle emotional well-being tracking" },
      { icon: Users, label: "Community Connection", desc: "Safe, shared reflections" },
    ],
    tags: ["Spiritual Growth", "Emotional Support", "Biblical Wisdom", "Community"],
    cta: { label: "Visit KCF Foundation", href: "https://kindnesscommunity.ai/" },
  },
  {
    id: "cryptotradesignals",
    number: "05",
    title: "CryptoTradeSignals.ai",
    subtitle: "By MyMind Studio · KCF Initiative",
    tagline: "Smarter Crypto Insights, Clear Signals, Less Noise",
    description: "An AI-powered market signals platform blending real-time technical analysis, trend detection, and intuitive signal scoring to help retail crypto traders make more informed decisions.",
    gradient: "from-amber-400 via-orange-500 to-amber-500",
    gradientDark: "from-amber-950 via-orange-950 to-amber-900",
    accent: "#f59e0b",
    accentLight: "rgba(245,158,11,0.15)",
    features: [
      { icon: BarChart3, label: "Real-Time Analysis", desc: "Live technical signal scoring" },
      { icon: ShieldCheck, label: "Manipulation Scores", desc: "Detect institutional traps" },
      { icon: TrendingUp, label: "Buy/Sell Signals", desc: "Multi-asset & timeframe signals" },
      { icon: Lock, label: "Full Asset Control", desc: "No exchange credentials needed" },
    ],
    tags: ["Crypto", "AI Signals", "Retail Traders", "Risk Awareness"],
    cta: { label: "Explore CryptoTradeSignals.ai", href: "https://cryptotradesignals.ai/" },
  },
  {
    id: "karmatrust",
    number: "06",
    title: "KarmaTrust",
    subtitle: "By MyMind Studio · KCF Initiative",
    tagline: "A New Hub for Impact & Community Support",
    description: "An online space dedicated to community empowerment, meaningful impact, and collective growth — offering resources, stories, tools, and opportunities that inspire positive action.",
    gradient: "from-purple-500 via-fuchsia-500 to-purple-600",
    gradientDark: "from-purple-950 via-fuchsia-950 to-purple-900",
    accent: "#a855f7",
    accentLight: "rgba(168,85,247,0.15)",
    features: [
      { icon: Heart, label: "Community Empowerment", desc: "Inspiring positive action" },
      { icon: Globe, label: "Impact Resources", desc: "Stories, tools & opportunities" },
      { icon: Users, label: "Collective Growth", desc: "Connect and contribute" },
      { icon: Sparkles, label: "Compassion First", desc: "Kindness-driven platform" },
    ],
    tags: ["Impact", "Community", "Kindness", "Empowerment"],
    cta: { label: "Visit KarmaTrust", href: "https://karmatrust.net" },
  },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function InitiativesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index, dir) => {
    setDirection(dir);
    setActive(index);
  }, []);

  const next = useCallback(() => {
    goTo((active + 1) % initiatives.length, 1);
  }, [active, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + initiatives.length) % initiatives.length, -1);
  }, [active, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const initiative = initiatives[active];

  return (
    <section id="initiatives" className="py-24 lg:py-32" style={{ background: "#030712" }} ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">Strategic Initiatives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-3xl mx-auto">
            Six pillars of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
              sustainable impact
            </span>
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-2xl mx-auto">
            Revenue-backed, technology-enabled solutions designed to help communities thrive with kindness, support, and lasting sustainability.
          </p>
        </motion.div>

        {/* Pill navigation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-1.5 mb-10 px-2"
        >
          {initiatives.map((ini, i) => (
            <button
              key={ini.id}
              onClick={() => { goTo(i, i > active ? 1 : -1); setPaused(true); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 border ${
                active === i
                  ? "text-white border-transparent shadow-lg scale-105"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10"
              }`}
              style={active === i ? { background: `linear-gradient(135deg, ${initiative.accent}, ${initiative.accent}cc)`, borderColor: initiative.accent } : {}}
            >
              {ini.number} {ini.title}
            </button>
          ))}
        </motion.div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative overflow-hidden rounded-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={active}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`bg-gradient-to-br ${initiative.gradientDark} border border-white/10 rounded-3xl overflow-hidden`}
            >
              <div className="flex flex-col lg:grid lg:grid-cols-5 min-h-[460px]">
                 {/* Left panel */}
                 <div className={`lg:col-span-2 bg-gradient-to-br ${initiative.gradient} p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute -bottom-8 -right-8 text-white/10 text-[10rem] font-black leading-none select-none pointer-events-none">
                    {initiative.number}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-white/60 text-xs font-bold tracking-widest uppercase">{initiative.subtitle}</span>

                    </div>
                    <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 leading-tight">{initiative.title}</h3>
                    <p className="text-white/80 text-sm font-semibold mb-6">{initiative.tagline}</p>
                    <p className="text-white/65 text-sm leading-relaxed">{initiative.description}</p>
                  </div>
                  <div className="relative z-10 flex flex-wrap gap-2 mt-6">
                    {initiative.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right panel */}
                <div className="lg:col-span-3 p-6 lg:p-10 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6">Key Features</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {initiative.features.map((f, i) => (
                        <div
                           key={i}
                           className="flex items-start gap-4 p-4 rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-300"
                           style={{ background: initiative.accentLight }}
                         >
                           <div
                             className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                             style={{ background: `linear-gradient(135deg, ${initiative.accent}, ${initiative.accent}99)` }}
                           >
                             {(() => {
                               const IconComponent = f.icon;
                               return <IconComponent className="w-5 h-5 text-white" />;
                             })()}
                           </div>
                          <div>
                            <div className="text-white font-semibold text-sm">{f.label}</div>
                            <div className="text-white/45 text-xs mt-0.5">{f.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(initiative.quote || initiative.cta) && (
                    <div className="mt-6">
                      {initiative.quote && (
                        <div className="px-5 py-4 rounded-2xl border border-white/10 bg-white/5">
                          <p className="text-white/60 text-sm italic">"{initiative.quote}"</p>
                        </div>
                      )}
                      {initiative.cta && (
                        <a
                          href={initiative.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
                          style={{ background: `linear-gradient(135deg, ${initiative.accent}, ${initiative.accent}cc)` }}
                        >
                          <Calendar className="w-4 h-4" />
                          {initiative.cta.label}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next */}
          <button
            onClick={() => { prev(); setPaused(true); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => { next(); setPaused(true); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Dot progress + counter */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className="text-white/30 text-xs font-mono">{String(active + 1).padStart(2, '0')} / {String(initiatives.length).padStart(2, '0')}</span>
          <div className="flex gap-2">
            {initiatives.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i, i > active ? 1 : -1); setPaused(true); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active === i ? '24px' : '8px',
                  height: '8px',
                  background: active === i ? initiative.accent : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
          {/* Auto-play indicator */}
          <button
            onClick={() => setPaused(!paused)}
            className="text-white/30 hover:text-white/60 text-xs font-mono transition-colors"
          >
            {paused ? "▶ play" : "⏸ pause"}
          </button>
        </div>
      </div>
    </section>
  );
}