import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail, MapPin, ArrowLeft, Send, CheckCircle,
  Heart, Phone, Globe, Clock
} from "lucide-react";
import Header from "@/components/kcf/Header";
import Footer from "@/components/kcf/Footer";

function AnimBlock({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const contactDetails = [
  {
    icon: Mail,
    label: "Email Us",
    value: "contact@kindnesscommunityfoundation.com",
    href: "mailto:contact@kindnesscommunityfoundation.com",
    color: "from-rose-500 to-pink-500",
    glow: "rgba(244,63,94,0.15)",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Newport Beach, California\nUSA 92660",
    color: "from-violet-500 to-indigo-500",
    glow: "rgba(167,139,250,0.15)",
  },
  {
    icon: Globe,
    label: "Website",
    value: "kindness-community-ai.netlify.app",
    href: "https://kindness-community-ai.netlify.app",
    color: "from-sky-500 to-blue-500",
    glow: "rgba(56,189,248,0.15)",
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "We typically respond within 24–48 hours",
    color: "from-emerald-500 to-teal-500",
    glow: "rgba(52,211,153,0.15)",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Build mailto link with form data
    const subject = encodeURIComponent(form.subject || `Message from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:contact@kindnesscommunityfoundation.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen" style={{ background: "#030712", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #f43f5e, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <Header />

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <AnimBlock>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 mb-6"
              style={{ background: "rgba(244,63,94,0.06)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">Get In Touch</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              We'd love to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-400">
                hear from you
              </span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-2xl">
              Whether you're interested in partnering with KCF, volunteering, supporting our mission,
              or just want to say hello — reach out. Every message matters.
            </p>
          </AnimBlock>
        </div>
      </section>

      {/* Main content */}
      <section className="relative z-10 pb-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          {/* Contact details */}
          <div className="space-y-6">
            <AnimBlock delay={0.1}>
              <h2 className="text-2xl font-black text-white mb-2">Contact Information</h2>
              <p className="text-white/40 text-sm leading-relaxed">
                Reach out through any of these channels. We're always happy to connect.
              </p>
            </AnimBlock>

            <div className="grid sm:grid-cols-2 gap-4">
              {contactDetails.map((item, i) => (
                <AnimBlock key={item.label} delay={0.15 + i * 0.08}>
                  <div
                    className="p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                    style={{ background: "rgba(255,255,255,0.025)" }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}
                      style={{ boxShadow: `0 4px 20px ${item.glow}` }}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-white/80 text-sm font-medium hover:text-rose-400 transition-colors leading-relaxed break-all"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white/80 text-sm font-medium leading-relaxed whitespace-pre-line">{item.value}</p>
                    )}
                  </div>
                </AnimBlock>
              ))}
            </div>

            {/* CTA card */}
            <AnimBlock delay={0.5}>
              <div
                className="p-6 rounded-2xl border border-rose-500/20 relative overflow-hidden"
                style={{ background: "rgba(244,63,94,0.06)" }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(244,63,94,0.15), transparent 70%)", filter: "blur(20px)" }} />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <Heart className="w-5 h-5 text-rose-400 fill-rose-400/30" />
                  <h3 className="text-white font-bold text-base">Join the KCF Community</h3>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-4 relative z-10">
                  Partner with us, volunteer, or support our mission. Together we build stronger communities.
                </p>
                <a
                  href="mailto:contact@kindnesscommunityfoundation.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold relative z-10 transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
                >
                  <Mail className="w-4 h-4" />
                  Send Us an Email
                </a>
              </div>
            </AnimBlock>
          </div>

          {/* Contact form */}
          <AnimBlock delay={0.2}>
            <div
              className="p-8 rounded-3xl border border-white/[0.07]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.1))" }}>
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">Your email app should open!</h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">
                    If it didn't open automatically, email us directly at{" "}
                    <a href="mailto:contact@kindnesscommunityfoundation.com"
                      className="text-rose-400 hover:underline">
                      contact@kindnesscommunityfoundation.com
                    </a>
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold border border-white/[0.1] hover:border-rose-500/30 transition-all"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-white mb-1">Send us a message</h2>
                  <p className="text-white/40 text-sm mb-6">Fill in the form and we'll get back to you shortly.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/20 border border-white/[0.08] focus:border-rose-500/40 focus:outline-none transition-all"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/20 border border-white/[0.08] focus:border-rose-500/40 focus:outline-none transition-all"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Partnership inquiry, Volunteer interest, General question..."
                        className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/20 border border-white/[0.08] focus:border-rose-500/40 focus:outline-none transition-all"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                    </div>

                    <div>
                      <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us how we can help, or share your thoughts about KCF's mission..."
                        className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-white/20 border border-white/[0.08] focus:border-rose-500/40 focus:outline-none transition-all resize-none"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading || !form.name || !form.email || !form.message}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Opening email...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </motion.button>

                    <p className="text-white/25 text-xs text-center">
                      Clicking "Send Message" will open your default email client.
                    </p>
                  </form>
                </>
              )}
            </div>
          </AnimBlock>
        </div>
      </section>

      <Footer />
    </div>
  );
}
