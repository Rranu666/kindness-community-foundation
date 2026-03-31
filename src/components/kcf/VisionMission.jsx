import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Globe, Cpu, Heart, Sprout, Rocket, Layers, Eye, BarChart3, Shield, BookOpen, ChevronDown, ChevronUp, Sparkles, BrainCircuit, Network, Zap } from "lucide-react";
import KindnessConstitution from "./KindnessConstitution";

const visionItems = [
  { icon: Globe, text: "Communities empowered through ethical commerce" },
  { icon: Cpu, text: "Technology connects people with opportunity" },
  { icon: Shield, text: "Trust is the foundation of digital interaction" },
  { icon: Sprout, text: "Sustainable businesses fund social innovation" },
  { icon: Rocket, text: "Impact scales across cities, nations, and generations" },
];

const missionItems = [
  { icon: Layers, text: "Technology-driven platforms" },
  { icon: Eye, text: "Transparent operational systems" },
  { icon: BarChart3, text: "Revenue-generating social enterprises" },
  { icon: Heart, text: "Trust-centered digital ecosystems" },
];

const traditions = [
  { num: 1, title: "Unity Before Self", text: "Our shared welfare comes first. A thriving community depends on cooperation, trust, and a common purpose." },
  { num: 2, title: "Leadership Through Service", text: "For our shared mission, the ultimate authority is the collective wisdom and conscience of the community, guided by kindness and truth. Our leaders are trusted servants—they serve the mission, not control it." },
  { num: 3, title: "An Open Door for All", text: "The only requirement for participation is a sincere desire to live with kindness and contribute to the well-being of others." },
  { num: 4, title: "Local Freedom with Global Responsibility", text: "Each community or group may operate autonomously, except in matters that affect the unity and integrity of the whole." },
  { num: 5, title: "Our Primary Purpose", text: "Our purpose is to help individuals and communities grow through acts of kindness, service, and mutual support." },
  { num: 6, title: "Mission Above Influence", text: "The Foundation does not lend its name or resources to outside enterprises that could compromise or distract from its mission." },
  { num: 7, title: "Self-Supporting Spirit", text: "We remain self-supporting through voluntary contributions, generosity, and responsible stewardship of resources." },
  { num: 8, title: "Service Over Status", text: "Kindness is an act of service, not a position of status. While skilled professionals may assist when needed, the heart of our work is volunteer service." },
  { num: 9, title: "Organized for Service", text: "Structures may be created to support the mission, but authority always flows from the shared purpose of the community." },
  { num: 10, title: "Unity Over Division", text: "We avoid public controversies and political entanglements that could distract from our mission of kindness and service." },
  { num: 11, title: "Attraction Through Example", text: "Our message spreads through the example of compassionate lives—not through promotion." },
  { num: 12, title: "Principles Before Personalities", text: "Humility and respect guide our actions. No individual stands above the mission." },
];

const ecosystemSteps = [
  "Kindness Constitution",
  "Kindness Community Foundation (Nonprofit stewardship and mission leadership)",
  "ServiceLink and Supporting Technology Platforms (Tools that enable connection, collaboration, and service)",
  "Volunteer Communities and Service Networks (People putting kindness into action)",
  "Future Tools and Systems (Innovations that support kindness-based cooperation)",
];

const aiInsights = [
  { label: "Communities Empowered", value: "10K+", icon: Globe },
  { label: "AI-Powered Connections", value: "98%", icon: BrainCircuit },
  { label: "Global Impact Reach", value: "47 Nations", icon: Network },
  { label: "Real-Time Kindness Acts", value: "∞", icon: Zap },
];

export default function VisionMission() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="vision" style={{ background: "#030712" }} ref={ref}>

      {/* ── VISION HERO ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0d1b2a] py-28 lg:py-36">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.04)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">Our Vision</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                A global ecosystem where{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-orange-300">
                  kindness drives progress
                </span>
              </h2>
              <p className="text-white/55 text-lg leading-relaxed mb-8 max-w-lg">
                We believe the future belongs to communities united by compassion &#8212; powered by technology, guided by purpose, and scaled through intelligent systems that serve humanity.
              </p>

              {/* AI badge */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">AI-Accelerated Impact</div>
                  <div className="text-white/40 text-xs">Intelligent systems amplifying human kindness at scale</div>
                </div>
              </div>

              {/* AI stats row */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {aiInsights.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/30 transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500/30 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                      <s.icon className="w-4 h-4 text-rose-300" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{s.value}</div>
                      <div className="text-white/40 text-xs">{s.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT: Visual collage */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main large image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                <img
                  src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=700&q=80"
                  alt="Community coming together"
                  className="w-full h-72 lg:h-96 object-cover"
                  loading="lazy"
                  decoding="async"
                  width="700"
                  height="384"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/80 via-transparent to-transparent" />
                {/* Overlay caption */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-semibold">Live Community Impact</span>
                  </div>
                  <p className="text-white text-sm font-medium">People connecting across 47+ nations through kindness-first platforms.</p>
                </div>
              </div>

              {/* Floating bottom-right image */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="hidden sm:block absolute -bottom-6 -right-4 w-36 md:w-44 rounded-2xl overflow-hidden shadow-xl border-2 border-white/10"
              >
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&q=80"
                  alt="Team collaboration"
                  className="w-full h-24 md:h-28 object-cover"
                  loading="lazy"
                  decoding="async"
                  width="176"
                  height="112"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3 text-indigo-300" />
                    <span className="text-white text-xs font-semibold">AI Collaboration</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating top-left AI card */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span className="text-white text-xs font-bold">Kindness Score</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-extrabold text-white">9.8</span>
                  <span className="text-rose-400 text-xs font-semibold mb-1">/ 10</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 mt-1">
                  <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400" style={{ width: '98%' }} />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom vision pillars */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-16"
          >
            {visionItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/8 hover:border-rose-500/30 hover:bg-white/8 transition-all duration-300 group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-white/65 text-xs font-medium leading-relaxed group-hover:text-white/85 transition-colors">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── MISSION ─────────────────────────────────────────────────── */}
      <div className="py-24 lg:py-32" style={{ background: "#030712" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Mission */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">Our Mission</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
              Community empowerment through{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-400">
                measurable impact
              </span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed mb-6">
              To promote community empowerment, ethical commerce, and measurable impact through
              technology and transparency.
            </p>
            <div className="px-5 py-4 rounded-xl bg-[#0d1b2a] border-l-4 border-rose-500">
              <p className="text-sm text-white/70 font-medium italic">
                &ldquo;We do not rely solely on donations. We build sustainable infrastructure.&rdquo;
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-4"
          >
            {missionItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-5 p-5 rounded-2xl border border-white/[0.06] hover:border-rose-500/25 hover:bg-white/4 transition-all duration-300" style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-200">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/70 font-semibold">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      </div>

      {/* Kindness Constitution */}
      <KindnessConstitution inView={inView} />
    </section>
  );
}