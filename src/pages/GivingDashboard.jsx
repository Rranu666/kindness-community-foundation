import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Header from "@/components/kcf/Header";
import Footer from "@/components/kcf/Footer";
import ImpactMetrics from "@/components/giving/ImpactMetrics";
import ImpactScore from "@/components/giving/ImpactScore";
import GivingGoals from "@/components/giving/GivingGoals";
import DonationHistory from "@/components/giving/DonationHistory";
import DonationChart from "@/components/giving/DonationChart";
import SubscriptionManager from "@/components/giving/SubscriptionManager";
import PaymentMethods from "@/components/giving/PaymentMethods";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const TABS = ["Overview", "Subscriptions", "Impact", "Goals", "History", "Payment"];

export default function GivingDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("Overview");

  useEffect(() => {
    let mounted = true;
    base44.auth.me().then(u => { if (mounted) setUser(u); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const { data: donations = [], isLoading: loadingDon } = useQuery({
    queryKey: ["donations", user?.email],
    queryFn: () => base44.entities.Donation.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: goals = [], isLoading: loadingGoals } = useQuery({
    queryKey: ["givingGoals", user?.email],
    queryFn: () => base44.entities.GivingGoal.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: subscriptions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ["subscriptions", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const totalDonated = donations.reduce((s, d) => s + d.amount, 0);
  const totalDonations = donations.length;
  const activeGoals = goals.filter(g => !g.is_completed).length;
  const completedGoals = goals.filter(g => g.is_completed).length;

  // top cause
  const causeTotals = {};
  donations.forEach(d => { causeTotals[d.cause] = (causeTotals[d.cause] || 0) + d.amount; });
  const topCause = Object.entries(causeTotals).sort((a, b) => b[1] - a[1])[0]?.[0];

  const isLoading = !user || loadingDon || loadingGoals || loadingSubs;
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      setIsAuthed(authed);
      setAuthChecked(true);
      if (!authed) base44.auth.redirectToLogin(window.location.pathname);
    });
  }, []);

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#030712" }}>
        <div className="w-8 h-8 border-4 border-white/20 border-t-rose-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-8" style={{ background: "#030712" }}>
        <Lock className="w-12 h-12 text-rose-400" />
        <h2 className="text-2xl font-bold text-white">Sign in to view your dashboard</h2>
        <p className="text-white/40 text-sm">You need to be logged in to access your giving history and plans.</p>
        <button onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
          className="px-8 py-3 text-white font-semibold rounded-xl hover:-translate-y-0.5 transition-all"
          style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#030712" }}>
      <Header />

      <div className="pt-24 pb-20 px-5 md:px-10 lg:px-20 max-w-6xl mx-auto">
        {/* ── Page Header ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-3 text-rose-400 text-xs font-bold tracking-[0.14em] uppercase mb-3">
            <span className="w-7 h-0.5 bg-rose-400" />
            <Link to="/servekindness" className="hover:text-rose-300 transition-colors">KindnessConnect</Link>
            <span className="text-white/20">›</span>
            <span>My Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {user ? `Welcome back, ${user.full_name?.split(" ")[0]}.` : "Your Giving Dashboard"}
          </h1>
          <p className="text-white/40 mt-2 text-base">Track your donations, impact, and goals all in one place.</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-28">
            <div className="w-8 h-8 border-4 border-[#EAF0EC] border-t-[#3D6B50] rounded-full animate-spin" />
          </div>
        ) : (
           <>
             {/* ── Summary Cards ── */}
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
               {[
                 { label: "Total Given", value: `$${totalDonated.toFixed(2)}`, icon: "💚", sub: "lifetime donations", accent: true },
                 { label: "Donations Logged", value: totalDonations, icon: "📋", sub: `${subscriptions.filter(s => s.status === "active").length} recurring` },
                 { label: "Active Goals", value: activeGoals, icon: "🎯", sub: `${completedGoals} completed` },
                 { label: "Top Cause", value: topCause ? topCause.split(" ")[0] : "—", icon: "🌟", sub: topCause || "Start giving to see" },
               ].map((s, i) => (
                 <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                   className="rounded-2xl p-5 border border-white/[0.08]"
                   style={{ background: s.accent ? "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" : "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                   <div className="text-2xl mb-2">{s.icon}</div>
                   <div className={`text-2xl font-bold mb-0.5 ${s.accent ? "text-white" : "text-white"}`}>{s.value}</div>
                   <div className={`text-xs font-semibold ${s.accent ? "text-white/90" : "text-white/60"}`}>{s.label}</div>
                   <div className={`text-xs mt-0.5 ${s.accent ? "text-white/70" : "text-white/40"}`}>{s.sub}</div>
                 </motion.div>
               ))}
             </div>

             {/* ── Tabs ── */}
             <div className="flex flex-wrap gap-1 p-1 rounded-2xl mb-8 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.05)" }}>
               {TABS.map(t => (
                 <button key={t} onClick={() => setTab(t)}
                   className={`px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${tab === t ? "text-white" : "text-white/50 hover:text-white/70"}`}
                   style={{ background: tab === t ? "rgba(244,63,94,0.3)" : "transparent" }}>
                   {t}
                 </button>
               ))}
             </div>

            {/* ── Tab: Overview ── */}
            {tab === "Overview" && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Row 1 col 1-2: Chart */}
                <div className="lg:col-span-2 rounded-3xl p-7 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                  <h2 className="font-bold text-lg text-white mb-5">Giving Over the Last 6 Months</h2>
                  <DonationChart donations={donations} />
                </div>
                {/* Row 1 col 3: Goals + Subs sidebar */}
                <div className="rounded-3xl p-7 border border-white/[0.08] flex flex-col gap-6" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-lg text-white">Active Goals</h2>
                    </div>
                    <GivingGoals goals={goals.slice(0, 2)} donations={donations} userEmail={user?.email} />
                  </div>
                  <div className="border-t border-white/[0.05] pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-bold text-base text-white">Subscriptions</h2>
                      <button onClick={() => setTab("Subscriptions")} className="text-xs text-rose-400 font-bold hover:text-rose-300">Manage →</button>
                    </div>
                    <div className="text-2xl font-bold text-rose-400">
                      ${subscriptions.filter(s => s.status === "active").reduce((a, s) => a + s.amount, 0).toFixed(2)}<span className="text-sm font-normal text-white/40">/mo</span>
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">{subscriptions.filter(s => s.status === "active").length} active · {subscriptions.filter(s => s.status === "paused").length} paused</div>
                  </div>
                </div>
                {/* Row 2: Impact Score + Impact Metrics */}
                <div className="lg:col-span-1">
                  <ImpactScore donations={donations} subscriptions={subscriptions} goals={goals} />
                </div>
                <div className="lg:col-span-2 rounded-3xl p-7 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                  <h2 className="font-bold text-lg text-white mb-6">Your Impact at a Glance</h2>
                  <ImpactMetrics donations={donations} />
                </div>
              </div>
            )}

            {/* ── Tab: Subscriptions ── */}
            {tab === "Subscriptions" && (
              <div className="rounded-3xl p-7 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                <h2 className="font-bold text-xl text-white mb-2">Monthly Subscriptions</h2>
                <p className="text-white/40 text-sm mb-8">Manage your recurring donations — edit amounts, pause, or cancel at any time.</p>
                <SubscriptionManager subscriptions={subscriptions} userEmail={user?.email} />
              </div>
            )}

            {/* ── Tab: Impact ── */}
            {tab === "Impact" && (
              <div className="rounded-3xl p-7 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                <h2 className="font-bold text-xl text-white mb-2">Your Impact Metrics</h2>
                <p className="text-white/40 text-sm mb-8">Every dollar you donate creates tangible, measurable outcomes in the world.</p>
                <ImpactMetrics donations={donations} />
                <div className="mt-10 pt-8 border-t border-white/[0.05]">
                  <h3 className="font-bold text-lg text-white mb-5">Monthly Giving Trend</h3>
                  <DonationChart donations={donations} />
                </div>
              </div>
            )}

            {/* ── Tab: Goals ── */}
            {tab === "Goals" && (
              <div className="rounded-3xl p-7 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                <h2 className="font-bold text-xl text-white mb-2">Giving Goals</h2>
                <p className="text-white/40 text-sm mb-8">Set personal targets and track your progress toward them.</p>
                <GivingGoals goals={goals} donations={donations} userEmail={user?.email} />
              </div>
            )}

            {/* ── Tab: History ── */}
            {tab === "History" && (
              <div className="rounded-3xl p-7 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                <h2 className="font-bold text-xl text-white mb-2">Donation History</h2>
                <DonationHistory donations={donations} userEmail={user?.email} />
              </div>
            )}

            {/* ── Tab: Payment ── */}
            {tab === "Payment" && (
              <div className="rounded-3xl p-7 border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}>
                <PaymentMethods />
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}