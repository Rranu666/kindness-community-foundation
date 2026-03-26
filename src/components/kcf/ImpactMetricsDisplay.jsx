import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const IMPACT_METRICS = [
  {
    id: "meals",
    label: "Meals Served",
    icon: "🍽️",
    cause: "Hunger & Food Security",
    conversion: 1.5, // $1 = 1.5 meals
    color: "from-orange-400 to-red-500",
  },
  {
    id: "trees",
    label: "Trees Planted",
    icon: "🌳",
    cause: "Climate & Reforestation",
    conversion: 0.25, // $1 = 0.25 trees
    color: "from-green-400 to-emerald-600",
  },
  {
    id: "water",
    label: "Water Access Points",
    icon: "💧",
    cause: "Clean Water Access",
    conversion: 1, // $1 = 1 water point
    color: "from-blue-400 to-cyan-600",
  },
  {
    id: "education",
    label: "Students Supported",
    icon: "📚",
    cause: "Education & Children",
    conversion: 0.5, // $1 = 0.5 students
    color: "from-purple-400 to-pink-600",
  },
];

export default function ImpactMetricsDisplay() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchImpactData = async () => {
    try {
      setLoading(true);
      const newMetrics = {};

      for (const metric of IMPACT_METRICS) {
        const donations = await base44.entities.Donation.filter({
          cause: metric.cause,
        });

        const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const impact = Math.floor(total * metric.conversion);
        newMetrics[metric.id] = impact;
      }

      setMetrics(newMetrics);
    } catch {
      // silently ignore — metrics show last known values
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpactData();

    // Subscribe to real-time donation updates
    const unsubscribe = base44.entities.Donation.subscribe(() => {
      fetchImpactData();
    });

    if (typeof unsubscribe === 'function') return unsubscribe;
    return undefined;
  }, []);

  const totalImpact = useMemo(() => {
    return Object.values(metrics).reduce((sum, val) => sum + val, 0);
  }, [metrics]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="impact" className="py-16 md:py-24 px-5" style={{ background: "#040810" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Real-Time Community Impact
          </h2>
          <p className="text-xl text-white/40 max-w-2xl mx-auto">
            Watch how your kindness transforms lives and communities in real time
          </p>
        </motion.div>

        {/* Total Impact Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-lg mb-2">Total Impact Units Generated</p>
              <p className="text-5xl md:text-6xl font-bold">
                {loading ? "—" : totalImpact.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-16 h-16 text-blue-200 opacity-50" />
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {IMPACT_METRICS.map((metric) => (
            <motion.div
              key={metric.id}
              variants={itemVariants}
              className={`bg-gradient-to-br ${metric.color} rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-shadow duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{metric.icon}</span>
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                  Live
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white/90 mb-2 opacity-90">
                {metric.label}
              </h3>

              <p className="text-3xl md:text-4xl font-bold mb-1">
                {loading ? "—" : (metrics[metric.id] || 0).toLocaleString()}
              </p>

              <p className="text-xs text-white/70">
                from {metric.cause}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-white/30 text-sm mt-12"
        >
          These metrics are updated in real-time as donations are received. Last updated: {new Date().toLocaleTimeString()}
        </motion.p>
      </div>
    </section>
  );
}