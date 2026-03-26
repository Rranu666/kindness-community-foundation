import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag, Heart, Globe, Users, Zap, Shield, Sparkles, BrainCircuit, ArrowRight, ChevronRight } from "lucide-react";
import Header from "@/components/kcf/Header";
import Footer from "@/components/kcf/Footer";

const featuredPost = {
  id: 1,
  slug: "reinventing-giving-through-kindness",
  title: "Reinventing Giving Through Kindness",
  subtitle: "Kindness Community Foundation",
  excerpt: "At Kindness Community Foundation, we are redefining online giving, digital philanthropy, and community support platforms by transforming simple acts of kindness into a global movement.",
  date: "March 24, 2026",
  readTime: "6 min read",
  category: "Vision & Mission",
  image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&q=80",
  tags: ["Giving", "Community", "Technology", "Impact"],
  featured: true,
};

const upcomingPosts = [
  {
    title: "How Technology Is Powering Ethical Commerce",
    excerpt: "Exploring the intersection of tech, transparency, and community-driven economies.",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
    comingSoon: true,
  },
  {
    title: "Volunteer Stories: Lives Changed Through Kindness",
    excerpt: "Real stories from our community members who have made a difference.",
    category: "Stories",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80",
    comingSoon: true,
  },
  {
    title: "The Future of Social Impact: A Transparent Giving Model",
    excerpt: "How KCF is building trust through radical transparency and measurable outcomes.",
    category: "Impact",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
    comingSoon: true,
  },
];

const highlights = [
  { icon: Globe, label: "47+ Nations", desc: "Global community reach", color: "from-rose-500 to-pink-500" },
  { icon: Heart, label: "Kindness First", desc: "Purpose-driven giving", color: "from-pink-500 to-fuchsia-500" },
  { icon: Shield, label: "Transparent", desc: "Accountable & ethical", color: "from-violet-500 to-indigo-500" },
  { icon: Zap, label: "Impactful", desc: "Measurable social change", color: "from-indigo-500 to-sky-500" },
];

function AnimBlock({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function BlogPostFull() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const pillars = [
    { icon: Globe, text: "Discover verified causes and charities", color: "text-rose-400" },
    { icon: Users, text: "Participate in online fundraising and crowdfunding campaigns", color: "text-pink-400" },
    { icon: Heart, text: "Support neighbors and local communities", color: "text-fuchsia-400" },
    { icon: Zap, text: "Track and measure the real-world impact of their contributions", color: "text-indigo-400" },
  ];

  return (
    <article ref={ref} className="max-w-4xl mx-auto px-6 lg:px-0">
      {/* Article hero image */}
      <AnimBlock>
        <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-black/50">
          <img
            src={featuredPost.image}
            alt={featuredPost.title}
            className="w-full h-64 sm:h-80 lg:h-[420px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {featuredPost.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{ background: "rgba(244,63,94,0.15)", borderColor: "rgba(244,63,94,0.3)", color: "#fb7185" }}>
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
              {featuredPost.title}
            </h1>
            <p className="text-rose-300 font-semibold text-sm">{featuredPost.subtitle}</p>
          </div>
        </div>
      </AnimBlock>

      {/* Meta */}
      <AnimBlock delay={0.1} className="flex flex-wrap items-center gap-4 mb-10 pb-8 border-b border-white/[0.07]">
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Calendar className="w-4 h-4 text-rose-400" />
          {featuredPost.date}
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Clock className="w-4 h-4 text-rose-400" />
          {featuredPost.readTime}
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Tag className="w-4 h-4 text-rose-400" />
          {featuredPost.category}
        </div>
      </AnimBlock>

      {/* Body */}
      <div className="prose prose-invert max-w-none space-y-8">

        <AnimBlock delay={0.15}>
          <p className="text-white/75 text-lg leading-relaxed">
            At Kindness Community Foundation, we are redefining <strong className="text-white">online giving</strong>, <strong className="text-white">digital philanthropy</strong>, and <strong className="text-white">community support platforms</strong> by transforming simple acts of kindness into a global movement. We believe that giving is more than a one-time act — it's a purpose-driven ecosystem powered by empathy, innovation, and technology.
          </p>
        </AnimBlock>

        {/* Image break 1 */}
        <AnimBlock delay={0.2}>
          <div className="relative rounded-2xl overflow-hidden my-10">
            <img
              src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&q=80"
              alt="Community coming together"
              className="w-full h-52 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/70 to-transparent flex items-center">
              <div className="px-8">
                <p className="text-white font-bold text-lg max-w-xs">Building a trusted charity platform for everyone</p>
              </div>
            </div>
          </div>
        </AnimBlock>

        <AnimBlock delay={0.25}>
          <p className="text-white/70 text-base leading-relaxed">
            Our mission is to build a <strong className="text-white">trusted charity platform</strong> where individuals, communities, and organizations can easily donate, volunteer, and support meaningful causes. By integrating technology with compassion, we enable people to give back, connect with communities, and create measurable social impact like never before.
          </p>
        </AnimBlock>

        <AnimBlock delay={0.3}>
          <div className="rounded-3xl p-8 border border-white/[0.07]" style={{ background: "rgba(244,63,94,0.05)" }}>
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase">Future of Giving</span>
            </div>
            <p className="text-white/80 text-base leading-relaxed">
              We are shaping the future of <strong className="text-white">social impact platforms</strong> and <strong className="text-white">ethical commerce</strong>, where every transaction contributes to a greater purpose. Whether you're looking for ways to support local communities, participate in crowdfunding initiatives, or engage in sustainable giving — our platform makes it simple, transparent, and impactful.
            </p>
          </div>
        </AnimBlock>

        {/* Image break 2 */}
        <AnimBlock delay={0.35}>
          <div className="relative rounded-2xl overflow-hidden my-10">
            <img
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&q=80"
              alt="Volunteers in action"
              className="w-full h-52 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 to-transparent flex items-end">
              <p className="text-white/70 text-sm px-6 pb-5 italic">Our volunteers creating real-world change across communities</p>
            </div>
          </div>
        </AnimBlock>

        <AnimBlock delay={0.4}>
          <p className="text-white/70 text-base leading-relaxed">
            Through <strong className="text-white">secure donation systems</strong>, transparent giving models, and community-driven initiatives, we remove barriers that often prevent people from contributing. Our ecosystem is designed to empower users to:
          </p>
        </AnimBlock>

        {/* Pillar cards */}
        <AnimBlock delay={0.45}>
          <div className="grid sm:grid-cols-2 gap-4 my-8">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.07] hover:border-rose-500/30 transition-all duration-300"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(244,63,94,0.12)" }}>
                    <Icon className={`w-4 h-4 ${p.color}`} />
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed font-medium">{p.text}</p>
                </motion.div>
              );
            })}
          </div>
        </AnimBlock>

        {/* Closing quote */}
        <AnimBlock delay={0.5}>
          <div className="relative rounded-3xl p-8 overflow-hidden my-10" style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.08), rgba(236,72,153,0.04))", border: "1px solid rgba(244,63,94,0.2)" }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.5), transparent)" }} />
            <Sparkles className="w-6 h-6 text-rose-400 mb-4" />
            <p className="text-white text-lg font-semibold leading-relaxed mb-3">
              "Kindness is powerful — but when combined with technology, transparency, and collective action, it becomes transformative."
            </p>
            <p className="text-white/55 text-sm">— Kindness Community Foundation</p>
          </div>
        </AnimBlock>

        <AnimBlock delay={0.55}>
          <p className="text-white/70 text-base leading-relaxed">
            Together, we are building a <strong className="text-white">global kindness network</strong> that is compassionate, connected, and driven by real change. Join us in creating a better world through <strong className="text-white">digital giving</strong>, social good innovation, and community empowerment.
          </p>
        </AnimBlock>

        {/* CTA */}
        <AnimBlock delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-10 border-t border-white/[0.07]">
            <Link to="/KindnessConnect">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
              >
                <Heart className="w-4 h-4" />
                Start Giving Today
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link to="/VolunteerDashboard">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white/80 font-bold text-sm border border-white/20 hover:border-white/40 transition-all"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <Users className="w-4 h-4" />
                Volunteer With Us
              </motion.button>
            </Link>
          </div>
        </AnimBlock>
      </div>
    </article>
  );
}

export default function Blog() {
  const [viewPost, setViewPost] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  const handleSubscribe = () => {
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    const subject = encodeURIComponent('Newsletter Subscription Request');
    const body = encodeURIComponent(`Please add me to the KCF newsletter.\n\nEmail: ${newsletterEmail}`);
    window.location.href = `mailto:contact@kindnesscommunityfoundation.com?subject=${subject}&body=${body}`;
    setNewsletterDone(true);
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen" style={{ background: "#030712" }}>
      <Header />

      {/* ── HERO ── */}
      <div className="relative pt-28 pb-20 overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1b2a 0%, #030712 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(244,63,94,0.1) 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 mb-6"
              style={{ background: "rgba(244,63,94,0.07)" }}>
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">KCF Blog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-5">
              Stories of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400">
                Kindness & Impact
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
              Insights, stories, and ideas from the Kindness Community Foundation — reimagining how humanity gives, connects, and grows together.
            </p>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${h.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white font-bold text-sm">{h.label}</div>
                  <div className="text-white/40 text-xs">{h.desc}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-20">

        {/* Featured Post Card / Full Post Toggle */}
        <AnimatePresence mode="wait">
          {!viewPost ? (
            <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Section label */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #f43f5e, #ec4899)" }} />
                <span className="text-white font-black text-xl">Latest Articles</span>
              </div>

              {/* Featured big card */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl overflow-hidden border border-white/[0.07] cursor-pointer mb-12 group"
                style={{ background: "rgba(255,255,255,0.02)" }}
                onClick={() => setViewPost(true)}
              >
                <div className="flex flex-col lg:grid lg:grid-cols-2">
                  <div className="relative overflow-hidden">
                    <img src={featuredPost.image} alt={featuredPost.title}
                      className="w-full h-52 sm:h-64 lg:h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#030712]/30 lg:block hidden" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)", color: "#fff" }}>
                        ✦ Featured Post
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredPost.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold border"
                          style={{ background: "rgba(244,63,94,0.1)", borderColor: "rgba(244,63,94,0.25)", color: "#fb7185" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight mb-3 group-hover:text-rose-300 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-rose-400 font-semibold text-sm mb-4">{featuredPost.subtitle}</p>
                    <p className="text-white/55 text-sm leading-relaxed mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-white/40 text-xs">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{featuredPost.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featuredPost.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-rose-400 text-sm font-bold group-hover:gap-3 transition-all">
                        Read Article <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Coming Soon cards */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #6366f1, #8b5cf6)" }} />
                <span className="text-white font-black text-xl">Coming Soon</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {upcomingPosts.map((post, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl overflow-hidden border border-white/[0.06]"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="relative overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-40 object-cover opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] to-transparent" />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-500/40"
                        style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>
                        Coming Soon
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-rose-400/70 text-xs font-bold uppercase tracking-wider">{post.category}</span>
                      <h3 className="text-white font-bold text-sm mt-2 mb-2 leading-snug">{post.title}</h3>
                      <p className="text-white/40 text-xs leading-relaxed">{post.excerpt}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="post" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Back button */}
              <button onClick={() => setViewPost(false)}
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-semibold mb-10 transition-colors group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Blog
              </button>
              <BlogPostFull />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── NEWSLETTER CTA ── */}
      <AnimBlock>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 pb-20">
          <div className="relative rounded-3xl p-10 lg:p-14 text-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.08), rgba(236,72,153,0.04))", border: "1px solid rgba(244,63,94,0.15)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(244,63,94,0.08) 0%, transparent 70%)" }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.4), transparent)" }} />
            <BrainCircuit className="w-10 h-10 text-indigo-400 mx-auto mb-5" />
            <h3 className="text-white font-black text-2xl sm:text-3xl mb-3">Stay Inspired</h3>
            <p className="text-white/50 text-base max-w-xl mx-auto mb-8">
              Get the latest stories, impact updates, and insights from the Kindness Community Foundation delivered to your inbox.
            </p>
            {newsletterDone ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-emerald-300 text-sm font-semibold border border-emerald-500/20" style={{ background: "rgba(16,185,129,0.08)" }}>
                ✓ Thanks! Your email client should open to complete the subscription.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  placeholder="Enter your email"
                  className="flex-1 px-5 py-3 rounded-2xl text-white text-sm outline-none border border-white/10 focus:border-rose-500/50 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
                <motion.button
                  onClick={handleSubscribe}
                  disabled={!newsletterEmail || !newsletterEmail.includes('@')}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-2xl text-white font-bold text-sm flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
                >
                  Subscribe
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </AnimBlock>

      <Footer />
    </div>
  );
}