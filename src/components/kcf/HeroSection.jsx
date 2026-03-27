import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

/* ─── Magnetic button ──────────────────────────────────────────────────── */
function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18 });
  const sy = useSpring(y, { stiffness: 180, damping: 18 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = (e) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - r.left - r.width / 2) * strength);
      y.set((e.clientY - r.top - r.height / 2) * strength);
    };
    const ml = () => { x.set(0); y.set(0); };
    el.addEventListener("mousemove", mm);
    el.addEventListener("mouseleave", ml);
    return () => { el.removeEventListener("mousemove", mm); el.removeEventListener("mouseleave", ml); };
  }, [x, y, strength]);

  return { ref, style: { x: sx, y: sy } };
}

/* ─── Kinetic word cycler ──────────────────────────────────────────────── */
const WORDS = ["Communities", "Futures", "Ecosystems", "Movements", "Legacies"];
function KineticWord() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: "13ch", verticalAlign: "bottom" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: 80, opacity: 0, filter: "blur(12px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -80, opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block text-transparent bg-clip-text"
          style={{ backgroundImage: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #f97316 100%)" }}
        >
          {WORDS[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ─── Animated counter ─────────────────────────────────────────────────── */
function Counter({ end, suffix = "", duration = 2200 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      ob.disconnect();
      const s = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - s) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        setVal(Math.round(ease * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Typing effect ────────────────────────────────────────────────────── */
function TypingText({ text, delay = 0 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shown >= text.length) return;
      const t = setInterval(() => {
        setShown(n => {
          if (n >= text.length) { clearInterval(t); return n; }
          return n + 1;
        });
      }, 28);
      return () => clearInterval(t);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay, shown]);
  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && <span className="animate-pulse text-rose-400">|</span>}
    </span>
  );
}

/* ─── STATS ────────────────────────────────────────────────────────────── */
const stats = [
  { value: 6, suffix: "+", label: "Strategic Initiatives" },
  { value: 47, suffix: "+", label: "Nations Reached" },
  { value: 100, suffix: "%", label: "Revenue-Backed" },
  { value: 12, suffix: "K+", label: "Lives Impacted" },
];

/* ─── MARQUEE ITEMS ────────────────────────────────────────────────────── */
const marqueeItems = [
  "Community Infrastructure", "Ethical Technology", "Volunteer Networks",
  "Transparent Governance", "Sustainable Impact", "AI-Accelerated Kindness",
  "47+ Nations", "Revenue-Backed Model", "Founded 2026", "California Nonprofit",
];

/* ─── MAIN COMPONENT ───────────────────────────────────────────────────── */
export default function HeroSection() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const btn1 = useMagnetic(0.32);
  const btn2 = useMagnetic(0.32);
  const cursorOuter = useRef(null);
  const cursorDot = useRef(null);
  const trailsRef = useRef([]);
  const mousePos = useRef({ x: 0, y: 0 });

  /* ── Custom cursor + trail ────────────────────────────────────────────── */
  useEffect(() => {
    const NUM_TRAILS = 8;
    const trails = [];
    for (let i = 0; i < NUM_TRAILS; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position:fixed;top:0;left:0;width:6px;height:6px;border-radius:50%;
        background:rgba(244,63,94,${0.6 - i * 0.07});
        pointer-events:none;z-index:9998;transform:translate(-50%,-50%);
        transition:transform 0.05s linear;will-change:transform;
      `;
      document.body.appendChild(el);
      trails.push({ el, x: 0, y: 0 });
    }
    trailsRef.current = trails;

    const onMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (cursorOuter.current) {
        cursorOuter.current.style.transform = `translate(${e.clientX - 20}px,${e.clientY - 20}px)`;
      }
      if (cursorDot.current) {
        cursorDot.current.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 3}px)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf;
    const animTrails = () => {
      let lx = mousePos.current.x, ly = mousePos.current.y;
      trails.forEach((t, i) => {
        const speed = 0.35 - i * 0.03;
        t.x += (lx - t.x) * speed;
        t.y += (ly - t.y) * speed;
        t.el.style.transform = `translate(${t.x - 3}px,${t.y - 3}px)`;
        lx = t.x; ly = t.y;
      });
      raf = requestAnimationFrame(animTrails);
    };
    animTrails();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      trails.forEach(t => t.el.remove());
    };
  }, []);

  /* ── Three.js scene ───────────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 6;

    /* particles */
    const COUNT = 2800;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const sz = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      col[i * 3] = 0.85 + t * 0.15;
      col[i * 3 + 1] = 0.15 + t * 0.25;
      col[i * 3 + 2] = 0.25 + t * 0.55;
      sz[i] = Math.random() * 2.8 + 0.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sz, 1));
    const mat = new THREE.ShaderMaterial({
      vertexColors: true, transparent: true, depthWrite: false,
      vertexShader: `
        attribute float size; varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (280.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float a = 1.0 - smoothstep(0.25, 0.5, d);
          gl_FragColor = vec4(vColor, a * 0.65);
        }`,
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    /* icosahedron wireframe */
    const icoGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, wireframe: true, transparent: true, opacity: 0.12 });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    /* orbital rings */
    const rings = [];
    [[2.2, 0.025, 0xff4466, 0.18, 0], [3.1, 0.018, 0x8866ff, 0.09, Math.PI / 3], [4.0, 0.012, 0x44aaff, 0.06, Math.PI / 5]].forEach(([r, t, c, o, rx]) => {
      const rg = new THREE.TorusGeometry(r, t, 16, 120);
      const rm = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o });
      const mesh = new THREE.Mesh(rg, rm);
      mesh.rotation.x = rx;
      scene.add(mesh);
      rings.push(mesh);
    });

    /* DNA helix */
    const helixGroup = new THREE.Group();
    const helixMat1 = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.5 });
    const helixMat2 = new THREE.MeshBasicMaterial({ color: 0x8866ff, transparent: true, opacity: 0.5 });
    const bridgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI * 6;
      const x1 = Math.cos(t) * 0.45, z1 = Math.sin(t) * 0.45;
      const x2 = Math.cos(t + Math.PI) * 0.45, z2 = Math.sin(t + Math.PI) * 0.45;
      const y = (i / 40) * 6 - 3;
      const sg = new THREE.SphereGeometry(0.04, 8, 8);
      const s1 = new THREE.Mesh(sg, helixMat1); s1.position.set(x1 + 3.5, y, z1); helixGroup.add(s1);
      const s2 = new THREE.Mesh(sg, helixMat2); s2.position.set(x2 + 3.5, y, z2); helixGroup.add(s2);
      if (i % 4 === 0) {
        const bl = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const bg = new THREE.CylinderGeometry(0.012, 0.012, bl, 6);
        const bm = new THREE.Mesh(bg, bridgeMat);
        bm.position.set((x1 + x2) / 2 + 3.5, y, (z1 + z2) / 2);
        bm.rotation.z = Math.PI / 2;
        bm.lookAt(new THREE.Vector3(x2 + 3.5, y, z2));
        helixGroup.add(bm);
      }
    }
    scene.add(helixGroup);

    let mx = 0, my = 0;
    const onMM = (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMM, { passive: true });

    const clock = new THREE.Clock();
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      particles.rotation.y = t * 0.035 + mx * 0.12;
      particles.rotation.x = t * 0.018 + my * 0.06;
      ico.rotation.x = t * 0.22;
      ico.rotation.y = t * 0.14;
      ico.rotation.z = t * 0.08;
      rings[0].rotation.z = t * 0.18;
      rings[1].rotation.z = -t * 0.12;
      rings[1].rotation.x = Math.PI / 3 + t * 0.08;
      rings[2].rotation.z = t * 0.09;
      rings[2].rotation.y = t * 0.05;
      helixGroup.rotation.y = t * 0.25 + mx * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!canvas) return;
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  const scrollTo = useCallback((href) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    const interval = setInterval(() => {
      const target = document.querySelector(href);
      if (target) {
        clearInterval(interval);
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
    setTimeout(() => clearInterval(interval), 5000);
  }, []);

  return (
    <>
      {/* Custom cursor */}
      <div ref={cursorOuter} className="fixed top-0 left-0 w-10 h-10 rounded-full border border-rose-400/30 pointer-events-none z-[9999] hidden lg:block"
        style={{ willChange: "transform", mixBlendMode: "difference", transition: "transform 0.08s linear" }} />
      <div ref={cursorDot} className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-rose-400 pointer-events-none z-[9999] hidden lg:block"
        style={{ willChange: "transform" }} />

      <section id="home" className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#030712" }}>
        {/* THREE.js canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Layered ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] rounded-full blur-[160px]"
            style={{ background: "radial-gradient(circle, rgba(244,63,94,0.10) 0%, transparent 70%)" }} />
          <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[140px]"
            style={{ background: "radial-gradient(circle, rgba(136,102,255,0.07) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(68,170,255,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 0%, transparent 100%)"
        }} />

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.018] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px"
        }} />

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-20 sm:pt-28 lg:pt-36 pb-8 sm:pb-12 lg:pb-16 w-full flex-1 flex flex-col justify-center items-center text-center">

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-5 sm:mb-8 lg:mb-10"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.035)", backdropFilter: "blur(16px)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-white/45 text-[11px] tracking-[0.25em] uppercase font-medium">
                <TypingText text="Building the future of kindness" delay={800} />
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <div className="max-w-5xl mb-4 sm:mb-6 lg:mb-8 w-full">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-black text-white leading-[1.03] tracking-tight"
              style={{
                fontSize: "clamp(2.2rem, 8vw, 5.8rem)",
                fontFamily: "'Inter', system-ui, sans-serif"
              }}
            >
              Building Sustainable
              <br />
              <KineticWord />
              <br />
              <span className="relative">
                for Lasting Impact
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-2 left-0 right-0 h-[2px] origin-left"
                  style={{ background: "linear-gradient(90deg, #f43f5e 0%, #ec4899 50%, transparent 100%)" }}
                />
              </span>
            </motion.h1>
          </div>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/80 font-semibold leading-relaxed max-w-xl mb-6 sm:mb-8 lg:mb-12"
            style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.35rem)" }}
          >
            Kindness Community Foundation reinventing giving through kindness and helping others, empowering communities with technology, ethical commerce, and structured opportunities to amplify humanity.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.68 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-14 lg:mb-24 justify-center w-full sm:w-auto"
          >
            <motion.button
              ref={btn1.ref}
              style={btn1.style}
              onClick={() => navigate('/synergyhub')}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold overflow-hidden text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="absolute inset-0 transition-all duration-300"
                style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 60%, #f97316 100%)" }} />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)" }} />
              {/* shimmer */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)", skewX: "-15deg" }} />
              <span className="relative z-10">Explore Team Portal</span>
              <motion.span className="relative z-10 text-lg" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>→</motion.span>
            </motion.button>

            <motion.button
              ref={btn2.ref}
              style={{ ...btn2.style, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(14px)" }}
              onClick={() => scrollTo("#contact")}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold border border-white/[0.08] overflow-hidden text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/5" />
              <span className="relative z-10">Partner With Us</span>
              <span className="relative z-10 text-white/30 group-hover:text-white/70 transition-colors duration-300">↗</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 + i * 0.09 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative group px-6 py-5 rounded-2xl border border-white/[0.05] cursor-default overflow-hidden"
                style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(10px)" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: "radial-gradient(circle at 50% -10%, rgba(244,63,94,0.1) 0%, transparent 70%)" }} />
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(244,63,94,0.5), transparent)" }} />
                <div className="text-3xl font-black text-white mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-white/30 font-medium tracking-wide">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Marquee ticker */}
        <div className="relative z-10 border-t border-white/[0.05] overflow-hidden py-4"
          style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(10px)" }}>
          <div className="flex whitespace-nowrap animate-[marquee_28s_linear_infinite]">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 mx-4 text-xs font-semibold tracking-[0.18em] uppercase text-white/25">
                {item}
                <span className="text-rose-500/40">◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-16 left-0 right-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to top, #030712 0%, transparent 100%)" }} />

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <span className="text-white/15 text-[9px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-[1px] h-10 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="w-full h-5 bg-gradient-to-b from-rose-400/60 to-transparent"
              animate={{ y: ["0%", "200%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Marquee keyframe */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </>
  );
}