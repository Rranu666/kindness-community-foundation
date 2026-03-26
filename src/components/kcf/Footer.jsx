import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import KCFLogo from "@/components/kcf/KCFLogo";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "Initiatives", href: "#initiatives" },
  { label: "Vision & Mission", href: "#vision" },
  { label: "Leadership", href: "#leadership" },
  { label: "KindWave App", href: "/KindWaveApp", external: true },
  { label: "Blog", href: "/Blog", external: true },
  { label: "Partners", href: "#partners" },
  { label: "Governance", href: "#governance" },
  { label: "Community Stories", href: "#stories" },
  { label: "Contact", href: "#contact" },
];

const legalLinks = [
  { label: "Terms of Service", href: "#governance" },
  { label: "Privacy Policy", href: "#governance" },
  { label: "Governance & Ethics", href: "#governance" },
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const isHome = location.pathname === "/" || location.pathname === "/Home";

  const scrollTo = (href) => {
    if (!isHome) {
      navigate("/", { state: { scrollTarget: href } });
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="contact" ref={ref} className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0f1e 0%, #030712 60%)" }}>

      {/* Grid texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(244,63,94,0.10) 0%, transparent 65%)" }} />

      {/* Top border line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-16 border-b border-white/[0.07]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/20 text-rose-300/70 text-xs tracking-widest uppercase font-semibold mb-6"
              style={{ background: "rgba(244,63,94,0.07)" }}>
              Get in touch
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Let's build{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">
                something meaningful
              </span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Ready to partner with us? Reach out — we'd love to hear from you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
            <motion.a
              href="mailto:contact@kindnesscommunityfoundation.com"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)" }} />
              <Mail className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Get In Touch</span>
              <ArrowUpRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Links grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="mb-5">
            <KCFLogo />
          </div>
          <p className="text-sm text-white/50 font-medium leading-relaxed mb-4 mt-4">
            Building sustainable systems for community impact worldwide.
          </p>
          <div className="flex items-center gap-2 text-sm text-white/40 font-semibold">
            <MapPin className="w-4 h-4 text-rose-400/70 flex-shrink-0" />
            Newport Beach, CA · USA
          </div>
        </motion.div>

        {/* Quick Links & Legal */}
        {[
          { title: "Quick Links", links: quickLinks },
          { title: "Legal", links: legalLinks },
        ].map((col, ci) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 + ci * 0.1 }}
          >
            <h4 className="text-xs font-black text-white uppercase tracking-[0.18em] mb-5">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <Link to={link.href} className="text-sm text-white/50 hover:text-rose-400 hover:font-semibold transition-all duration-200">
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollTo(link.href)}
                      className="text-sm text-white/50 hover:text-rose-400 hover:font-semibold transition-all duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h4 className="text-xs font-black text-white uppercase tracking-[0.18em] mb-5">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li>
              <a href="mailto:contact@kindnesscommunityfoundation.com"
                className="text-white/70 hover:text-rose-400 transition-colors duration-200 font-semibold whitespace-nowrap block">
                contact@kindnesscommunityfoundation.com
              </a>
            </li>
            <li className="text-white/50 font-medium leading-relaxed text-sm">
              Newport Beach, California<br />
              USA 92660
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.07] py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-center">
          <p className="text-xs text-white/40 font-medium text-center flex items-center gap-1.5 flex-wrap justify-center">
            © {new Date().getFullYear()} Kindness Community Foundation. Developed by KCF LLC, A California, USA company serving the world. All rights reserved. Made with{" "}
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline flex-shrink-0" />{" "}
            for our community.
          </p>
        </div>
      </div>
    </footer>
  );
}