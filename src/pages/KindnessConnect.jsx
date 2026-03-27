import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/kcf/Header";
import Footer from "@/components/kcf/Footer";
import HelpOthersHealYourself from "@/components/kcf/HelpOthersHealYourself";
import { motion, AnimatePresence } from "framer-motion";


const features = [
  { num: "01", icon: "📅", title: "Giving Plans", desc: "Set up a recurring monthly contribution — starting from just $5 — and let KindnessConnect direct it automatically to the causes you care about most.", tag: "From $5 / month", dark: false },
  { num: "02", icon: "🪙", title: "Micro-Donation Roundups", desc: "Link your payment card and we'll automatically round up every purchase to the nearest dollar. Those pennies pool together into real-world impact — without you thinking twice.", tag: "Automatic Roundups", dark: true },
  { num: "03", icon: "🛍️", title: "Conscious Shopping Cashback", desc: "Shop through KindnessConnect's partner brands and earn up to 15% cashback — automatically redirected as a donation to your chosen cause.", tag: "Up to 15% Back", dark: true },
  { num: "04", icon: "📊", title: "Live Impact Dashboard", desc: "Track every outcome your contributions generate — meals provided, trees planted, liters of water delivered — through a beautifully transparent dashboard updated in real time.", tag: "Real-Time Tracking", dark: false },
  { num: "05", icon: "🤝", title: "Community Giving Circles", desc: "Pool your contributions with friends or colleagues to multiply your collective impact. Giving Circles bring people together around shared values.", tag: "Group Giving", dark: false },
  { num: "06", icon: "🏆", title: "Kindness Score & Milestones", desc: "Your personal Kindness Score grows with every act of generosity. Unlock milestones, earn recognition badges, and see your cumulative impact.", tag: "Gamified Giving", dark: true },
];

const causes = [
  { emoji: "🍽️", name: "Feeding America", desc: "The largest hunger-relief network in the US, connecting 60,000+ food banks with people facing food insecurity nationwide.", sdg: "SDG 2 — Zero Hunger" },
  { emoji: "💧", name: "Water.org", desc: "A pioneering nonprofit whose market-driven approach has helped over 44 million people gain sustained access to safe water and sanitation.", sdg: "SDG 6 — Clean Water" },
  { emoji: "👧", name: "Save the Children", desc: "Operating in 100+ countries, delivering life-saving aid and long-term development programmes that protect children's rights.", sdg: "SDG 4 — Quality Education" },
  { emoji: "🌳", name: "One Tree Planted", desc: "A global reforestation charity that has planted over 40 million trees across 47 countries, restoring ecosystems worldwide.", sdg: "SDG 13 — Climate Action" },
  { emoji: "🌊", name: "Ocean Conservancy", desc: "Science-led advocacy protecting ocean ecosystems from plastic pollution, overfishing, and warming seas.", sdg: "SDG 14 — Life Below Water" },
  { emoji: "🤝", name: "UNICEF", desc: "Working in the world's most challenging environments to deliver vaccines, nutrition, education, and protection to children.", sdg: "SDG 3 — Good Health" },
];

const stats = [
  { num: "$592B", label: "Total US charitable giving in 2024 — a record high" },
  { num: "76%", label: "of US adults made a financial donation last year" },
  { num: "84%", label: "of Gen Z support a nonprofit or cause in some way" },
  { num: "6.3%", label: "growth in charitable giving year-over-year" },
];

const faqs = [
  { q: "How does KindnessConnect send money to charities?", a: "All donations are aggregated and sent monthly to our verified charity partners via bank transfer. We maintain full financial records and publish transfer confirmations in our quarterly impact reports." },
  { q: "Can I change my chosen causes at any time?", a: "Absolutely. Your cause preferences can be updated any time from your dashboard. Changes take effect from the next donation cycle. There's no lock-in, and you can pause or cancel with a single click." },
  { q: "How do Roundups work — is my card data safe?", a: "We use bank-grade Open Banking connections (read-only) to detect transactions and calculate your roundup amounts. We never store your card details, and all connections are encrypted with 256-bit TLS." },
  { q: "What percentage goes to the charity vs platform fees?", a: "For Giving Plans and Roundups, we deduct a 5% platform maintenance fee — so 95 cents in every dollar reaches your chosen charity. For Cashback Shopping, the full cashback amount is passed on with no deduction." },
  { q: "What is a Giving Circle and how do I start one?", a: "A Giving Circle is a group account that pools contributions from multiple members toward shared causes. Any member can start one, invite others via link or email, and track collective impact together." },
  { q: "Is KindnessConnect available outside the US?", a: "Currently we support users in the US and Canada. Expansion to the UK, EU, Australia, and South Asia is planned for late 2025. Sign up to our waitlist to be notified when your region goes live." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-200" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
      <button
        className="w-full flex justify-between items-center px-6 py-5 text-left font-semibold text-white text-sm md:text-base gap-4 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span className={`text-rose-400 text-xl flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-white/40 text-sm leading-relaxed border-t border-white/[0.05]">
          <div className="pt-4">{a}</div>
        </div>
      )}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: "easeOut" } }),
};

export default function KindnessConnect() {
  const navigate = useNavigate();
  const [scoreExpanded, setScoreExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  const handleEarlyAccess = () => {
    if (!email) return;
    const subject = encodeURIComponent('KindnessConnect Early Access Request');
    const body = encodeURIComponent(`I'd like early access to KindnessConnect.\n\nEmail: ${email}`);
    window.location.href = `mailto:contact@kindnesscommunityfoundation.com?subject=${subject}&body=${body}`;
    setSignedUp(true);
    setEmail('');
  };

  return (
    <div style={{ background: "#030712" }} className="text-white overflow-x-hidden">
      <Header />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20 px-5 md:px-10 lg:px-20 overflow-hidden" style={{ background: "#030712" }}>
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] rounded-full blur-[160px]"
            style={{ background: "radial-gradient(circle, rgba(244,63,94,0.10) 0%, transparent 70%)" }} />
          <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px]"
            style={{ background: "radial-gradient(circle, rgba(139,102,255,0.07) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(68,170,255,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 0%, transparent 100%)"
        }} />

        <div className="max-w-6xl mx-auto w-full relative z-10">
          {/* Top badge */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] text-rose-400 text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full" style={{ background: "rgba(244,63,94,0.06)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              Powered by love, driven by kindness
            </div>
          </motion.div>

          {/* Hero headline — centered, massive */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-black leading-[1.1] text-white mb-0">
              Give a little.
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-black leading-[1.1] mb-8 text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #f97316 100%)" }}>
              Change a lot.
            </h1>
            <p className="text-white/40 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              KindnessConnect turns your everyday spending and intentions into meaningful, measurable support for the causes that shape our world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HELP OTHERS → HEAL YOURSELF ── */}
      <HelpOthersHealYourself />

      {/* ── CTA ── */}
      <section id="kc-cta" className="py-28 px-5 relative overflow-hidden" style={{ background: "#030712" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 text-rose-400 text-xs font-bold tracking-[0.18em] uppercase mb-6">
              <span className="w-7 h-0.5 bg-rose-400" /> Join the Movement <span className="w-7 h-0.5 bg-rose-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Start making a<br /><span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>difference</span> today
            </h2>
            <p className="text-white/40 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              Choose your path — create a free account to unlock giving plans, or make a direct donation right now with no sign-up needed.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden border border-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5 text-xl" style={{ background: "rgba(244,63,94,0.15)" }}>🌱</div>
              <h3 className="text-xl font-bold text-white mb-2">Create Free Account</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6 flex-1">Unlock giving plans, track your impact, set recurring donations, and earn milestone badges.</p>
              {signedUp ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-emerald-300 text-sm font-semibold border border-emerald-500/20" style={{ background: "rgba(16,185,129,0.08)" }}>
                  ✓ Thanks! Check your email client to complete sign-up.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <input type="email" placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEarlyAccess()}
                    className="w-full px-5 py-3.5 rounded-xl border border-white/[0.08] bg-white/3 text-white placeholder-white/25 outline-none focus:border-rose-400/60 text-sm transition-colors" />
                  <button onClick={handleEarlyAccess} disabled={!email}
                    className="w-full text-white font-bold px-6 py-3.5 rounded-xl hover:-translate-y-0.5 transition-all duration-300 text-sm disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
                    Get Early Access →
                  </button>
                </div>
              )}
              <p className="text-white/25 text-xs mt-4 text-center">No spam. Unsubscribe any time.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden border border-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5 text-xl" style={{ background: "rgba(139,102,255,0.15)" }}>💛</div>
              <h3 className="text-xl font-bold text-white mb-2">Direct Donation</h3>
              <p className="text-white/40 text-sm leading-relaxed mb-6 flex-1">Give instantly to a cause you care about — no account, no sign-up, no friction. Just kindness.</p>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2">
                  {["$5", "$10", "$25"].map(amt => (
                    <button key={amt} className="py-3 rounded-xl border border-white/[0.08] text-white font-bold text-sm hover:bg-white/8 transition-all">{amt}</button>
                  ))}
                </div>
                <button onClick={() => window.open("https://www.every.org/kindness-community-foundation", "_blank")}
                  className="w-full text-white font-bold px-6 py-3.5 rounded-xl hover:-translate-y-0.5 transition-all text-sm"
                  style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
                  Donate Now — No Sign-up →
                </button>
              </div>
              <p className="text-white/25 text-xs mt-4 text-center">Secure · 100% goes to your chosen cause</p>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mt-10">
            <Link to="/mygiving" className="inline-flex items-center gap-2 text-rose-400 text-sm font-semibold hover:text-rose-300 transition-colors">
              Already giving? View your dashboard →
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}