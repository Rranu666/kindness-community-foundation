import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SiteSearch from "./SiteSearch";
import KCFLogo from "./KCFLogo";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "KindWave", href: "/KindWaveApp", external: true, highlight: true },
  { label: "Serve", href: "/KindnessConnect", external: true },
  { label: "Initiatives", href: "#initiatives" },
  {
    label: "About",
    submenu: [
      { label: "Vision & Mission", href: "#vision" },
      { label: "Leadership", href: "#leadership" },
      { label: "Partners", href: "#partners" },
    ],
  },
  { label: "Blog", href: "/Blog", external: true },
  { label: "Contact", href: "/Contact", external: true },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/Home";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isHome && location.state?.scrollTarget) {
      const target = location.state.scrollTarget;
      navigate(location.pathname, { replace: true, state: {} });
      setTimeout(() => {
        scrollToLazy(target);
      }, 150);
    }
  }, [isHome, location.state]);

  // Scroll to a hash target, chasing the page bottom as lazy sections expand
  const scrollToLazy = (target) => {
    const el = document.querySelector(target);
    if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }

    // Keep scrolling to the current scrollHeight — it grows as lazy sections render
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    const interval = setInterval(() => {
      const t = document.querySelector(target);
      if (t) {
        clearInterval(interval);
        t.scrollIntoView({ behavior: "smooth" });
        return;
      }
      // Chase the growing bottom so every new lazy section enters the viewport
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    }, 100);
    setTimeout(() => clearInterval(interval), 8000);
  };

  const scrollTo = (href) => {
    setMobileOpen(false);
    if (!isHome) {
      navigate("/", { state: { scrollTarget: href } });
      return;
    }
    scrollToLazy(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500`}
        style={{
          background: scrolled
            ? "rgba(3, 7, 18, 0.85)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <button
            onClick={() => isHome ? scrollTo("#home") : navigate("/")}
            className="hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div style={{ height: "60px" }}>
              <KCFLogo />
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Main navigation">
            {navLinks.map((link) => {
              const hasSubmenu = !!link.submenu;
              const isActive = activeLink === link.href;

              if (!link.submenu) {
                if (link.external) {
                  if (link.highlight) {
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="relative px-5 py-2 text-sm font-bold rounded-full flex items-center gap-1.5 transition-all duration-200 group"
                        style={{
                          background: "linear-gradient(135deg, rgba(244,63,94,0.15), rgba(167,139,250,0.15))",
                          border: "1px solid rgba(244,63,94,0.35)",
                          color: "#f9a8d4",
                          boxShadow: "0 0 12px rgba(244,63,94,0.2)",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        {link.label}
                        <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full"
                          style={{ background: "rgba(244,63,94,0.25)", color: "#fb7185" }}>
                          NEW
                        </span>
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="relative px-5 py-2 text-base font-semibold text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  );
                }
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onMouseEnter={() => setActiveLink(link.href)}
                    onMouseLeave={() => setActiveLink(null)}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                    className="relative px-5 py-2 text-base font-semibold text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-white/6"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </a>
                );
              }

              return (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setOpenSubmenu(link.label)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <button className="relative px-5 py-2 text-base font-semibold text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-1.5">
                    {link.label}
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>

                  <AnimatePresence>
                    {openSubmenu === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-white/[0.08] overflow-hidden z-50"
                        style={{ background: "rgba(3,7,18,0.95)", backdropFilter: "blur(20px)" }}
                      >
                        {link.submenu.map((item, idx) => 
                          item.external ? (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setOpenSubmenu(null)}
                              className="block px-5 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all border-b border-white/[0.05] last:border-b-0"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <a
                              key={item.href}
                              href={item.href}
                              onClick={(e) => { e.preventDefault(); scrollTo(item.href); setOpenSubmenu(null); }}
                              className="block px-5 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all border-b border-white/[0.05] last:border-b-0"
                            >
                              {item.label}
                            </a>
                          )
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/8 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
            </button>

            <motion.button
              onClick={() => navigate('/TeamPortal')}
              className="ml-2 px-5 py-2 text-sm font-bold rounded-full text-white relative overflow-hidden group"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #fb7185, #f472b6)" }} />
              <span className="relative z-10">Team Portal</span>
            </motion.button>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl text-white/60 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-white/60 hover:text-white"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
              style={{
                background: "rgba(3,7,18,0.96)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(255,255,255,0.06)"
              }}
            >
              <nav className="px-4 py-4 space-y-1">
                {navLinks.map((link, i) => {
                  if (!link.submenu) {
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {link.external ? (
                          <Link
                            to={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all ${link.highlight ? "font-bold flex items-center gap-2" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                            style={link.highlight ? {
                              background: "linear-gradient(135deg, rgba(244,63,94,0.12), rgba(167,139,250,0.12))",
                              border: "1px solid rgba(244,63,94,0.25)",
                              color: "#f9a8d4",
                            } : {}}
                          >
                            {link.highlight && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
                            {link.label}
                            {link.highlight && <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full ml-auto" style={{ background: "rgba(244,63,94,0.25)", color: "#fb7185" }}>NEW</span>}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            onClick={(e) => { e.preventDefault(); scrollTo(link.href); setMobileOpen(false); }}
                            className="block px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-base font-semibold transition-all"
                          >
                            {link.label}
                          </a>
                        )}
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <button
                        onClick={() => setOpenSubmenu(openSubmenu === link.label ? null : link.label)}
                        className="w-full flex items-center justify-between px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-xl text-base font-semibold transition-all"
                      >
                        {link.label}
                        <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenu === link.label ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {openSubmenu === link.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            {link.submenu.map((item) => 
                              item.external ? (
                                <Link
                                  key={item.href}
                                  to={item.href}
                                  onClick={() => { setMobileOpen(false); setOpenSubmenu(null); }}
                                  className="block px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-all mt-1"
                                >
                                  {item.label}
                                </Link>
                              ) : (
                                <a
                                  key={item.href}
                                  href={item.href}
                                  onClick={(e) => { e.preventDefault(); scrollTo(item.href); setMobileOpen(false); setOpenSubmenu(null); }}
                                  className="block px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-all mt-1"
                                >
                                  {item.label}
                                </a>
                              )
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                  <button
                    onClick={() => { navigate('/TeamPortal'); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-3 text-white rounded-xl text-sm font-bold mt-2"
                    style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
                  >
                    Team Portal →
                  </button>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SiteSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}