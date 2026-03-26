import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const MILESTONES = [
  { name: "Clean Water Access", icon: "💧", target: 10000, cause: "Clean Water Access" },
  { name: "Meals Funded", icon: "🍽️", target: 15000, cause: "Hunger & Food Security" },
  { name: "Trees Planted", icon: "🌳", target: 5000, cause: "Climate & Reforestation" },
];

export default function GlobalProgressBar() {
  const [currentMilestone, setCurrentMilestone] = useState(MILESTONES[0]);
  const [totalForCause, setTotalForCause] = useState(0);
  const [loading, setLoading] = useState(true);

  const conversions = {
    "Clean Water Access": 1, // $1 = 1 unit
    "Hunger & Food Security": 1.5, // $1 = 1.5 meals
    "Climate & Reforestation": 0.25, // $1 = 0.25 trees
  };

  const progress = useMemo(() => {
    const conversion = conversions[currentMilestone.cause] || 1;
    const units = totalForCause * conversion;
    return Math.min((units / currentMilestone.target) * 100, 100);
  }, [totalForCause, currentMilestone]);

  const units = useMemo(() => {
    const conversion = conversions[currentMilestone.cause] || 1;
    return Math.floor(totalForCause * conversion);
  }, [totalForCause, currentMilestone]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const donations = await base44.entities.Donation.filter({
          cause: currentMilestone.cause,
        });

        const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        setTotalForCause(total);
      } catch {
        // silently ignore — progress bar shows last known value
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();

    // Subscribe to real-time updates
    const unsubscribe = base44.entities.Donation.subscribe((event) => {
      if (event.data?.cause === currentMilestone.cause) {
        fetchDonations();
      }
    });

    if (typeof unsubscribe === 'function') return unsubscribe;
    return undefined;
  }, [currentMilestone.cause]);

  const rotateMilestone = () => {
    setCurrentMilestone((prev) => {
      const currentIdx = MILESTONES.indexOf(prev);
      return MILESTONES[(currentIdx + 1) % MILESTONES.length];
    });
  };

  return (
    <div className="sticky top-16 md:top-20 z-30 bg-gradient-to-r from-[#1B2B22] to-[#2d4a38] border-b border-[#3D6B50]/30 px-5 py-4 md:px-10 md:py-5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        {/* Left — Milestone info */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-3xl">{currentMilestone.icon}</span>
          <div>
            <div className="text-white text-sm font-bold">{currentMilestone.name}</div>
            <div className="text-[#a8bdb0] text-xs">Community Impact</div>
          </div>
        </div>

        {/* Center — Progress bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 rounded-full bg-white/8 flex-1 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#6db88a] to-[#D4A84B]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-[#D4A84B] text-xs font-bold whitespace-nowrap">{Math.round(progress)}%</span>
          </div>
          <div className="text-[#a8bdb0] text-xs">
            {loading ? "Loading..." : `${units.toLocaleString()} / ${currentMilestone.target.toLocaleString()} ${currentMilestone.name.split(" ")[0]}`}
          </div>
        </div>

        {/* Right — Rotate milestone */}
        <button
          onClick={rotateMilestone}
          className="px-4 py-2 rounded-lg bg-white/8 hover:bg-white/15 text-white text-xs font-semibold transition-colors flex-shrink-0"
        >
          Next Goal
        </button>
      </div>
    </div>
  );
}