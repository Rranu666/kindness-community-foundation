import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Handshake, Store, Users, TrendingUp, ArrowRight } from "lucide-react";

const partners = [
  { icon: Wrench, label: "Service Providers" },
  { icon: Handshake, label: "Strategic Collaborators" },
  { icon: Store, label: "Ethical Business Partners" },
  { icon: Users, label: "Community Leaders" },
  { icon: TrendingUp, label: "Long-term Impact Investors" },
];

export default function PartnerSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section id="partners" className="py-24 lg:py-32" style={{ background: "#050810" }} ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/20 mb-6" style={{ background: "rgba(244,63,94,0.06)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">Partner With Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
              Join a movement{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-400">
                built on trust
              </span>
            </h2>
            <p className="text-white/40 text-lg leading-relaxed mb-8">
              We welcome partners who share our commitment to ethical impact, sustainable growth,
              and community-first values.
            </p>
            <button
              onClick={() => navigate("/Contact")}
              className="group inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg" style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
            >
              Contact Us
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-3"
          >
            {partners.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-5 p-5 rounded-2xl border border-white/[0.05] hover:border-rose-500/20 transition-all duration-300" style={{ background: "rgba(255,255,255,0.025)" }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-200">
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/70 font-semibold">{p.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}