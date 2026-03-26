import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function ScrollToggleButton() {
  const [scrollY, setScrollY] = useState(0);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollY(y);
      setAtBottom(maxScroll > 0 && y >= maxScroll - 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showUp = scrollY > 200;
  const showDown = !atBottom && document.documentElement.scrollHeight > window.innerHeight + 200;

  const btnBase =
    "w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg";
  const btnStyle = { background: "linear-gradient(135deg, #f43f5e, #ec4899)" };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-center">
      {/* Scroll to Top */}
      <AnimatePresence>
        {showUp && (
          <motion.button
            key="scroll-up"
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Scroll to top"
            className={btnBase}
            style={btnStyle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll to Bottom */}
      <AnimatePresence>
        {showDown && (
          <motion.button
            key="scroll-down"
            initial={{ opacity: 0, scale: 0.7, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
            title="Scroll to bottom"
            className={btnBase}
            style={btnStyle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
