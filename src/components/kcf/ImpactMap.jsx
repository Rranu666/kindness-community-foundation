import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createCustomIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
  });

const locations = [
  {
    id: 1,
    name: "Newport Beach, CA — Headquarters",
    coords: [33.6189, -117.9298],
    color: "#f43f5e",
    tag: "HQ",
    impact: "Kindness Community headquarters overseeing all strategic operations, governance, and global program coordination.",
    initiative: "Global Coordination",
  },
  {
    id: 2,
    name: "London, UK",
    coords: [51.5074, -0.1278],
    color: "#6366f1",
    tag: "Operations",
    impact: "European operations hub driving Service Connect Pro rollout and digital infrastructure development across the region.",
    initiative: "Service Connect Pro · Digital Infrastructure",
  },
  {
    id: 3,
    name: "Nairobi, Kenya",
    coords: [-1.286389, 36.817223],
    color: "#0ea5e9",
    tag: "Community",
    impact: "Community outreach programs and Haven on Earth pilot projects supporting displaced families and urban communities.",
    initiative: "Haven on Earth",
  },
  {
    id: 4,
    name: "Toronto, Canada",
    coords: [43.6532, -79.3832],
    color: "#10b981",
    tag: "Tech",
    impact: "Technology and innovation hub for building digital tools and platforms that power our community-centered retail and service models.",
    initiative: "Digital Infrastructure · Retail Model",
  },
  {
    id: 5,
    name: "Los Angeles, CA",
    coords: [34.0522, -118.2437],
    color: "#f97316",
    tag: "Outreach",
    impact: "US community outreach and partnership development, connecting donors and organizations with Kindness Community programs.",
    initiative: "Service Connect Pro",
  },
];

export default function ImpactMap() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(null);

  return (
    <section id="impact" className="py-24 lg:py-32 bg-[#080f1a]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-rose-400 text-xs font-bold tracking-widest uppercase">Our Impact</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-2xl mx-auto">
            Where we're{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300">
              making a difference
            </span>
          </h2>
          <p className="mt-5 text-white/40 max-w-xl mx-auto text-base leading-relaxed">
            From our headquarters in Newport Beach to communities across the globe, our initiatives span continents with purpose.
          </p>
        </motion.div>

        {/* Map + Detail Panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        >
          <div className="relative" style={{ height: "clamp(320px, 50vw, 500px)" }}>
            <MapContainer
              center={[25, 40]}
              zoom={3}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={loc.coords}
                  icon={createCustomIcon(loc.color)}
                  eventHandlers={{ click: () => setActive(loc) }}
                />
              ))}
            </MapContainer>

            {/* Detail Popup Overlay */}
            <AnimatePresence>
              {active && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-4 right-4 left-4 sm:left-auto z-[1000] w-auto sm:w-72 bg-[#0d1b2a]/95 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl"
                >
                  <button
                    onClick={() => setActive(null)}
                    className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-3"
                    style={{ background: active.color + "22", color: active.color }}
                  >
                    {active.tag}
                  </div>
                  <h3 className="text-white font-bold text-sm mb-2 leading-snug">{active.name}</h3>
                  <p className="text-white/50 text-xs leading-relaxed mb-3">{active.impact}</p>
                  <div className="text-xs text-white/30 border-t border-white/10 pt-3">
                    <span className="text-rose-400 font-semibold">Initiative: </span>
                    {active.initiative}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Location Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setActive(active?.id === loc.id ? null : loc)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all duration-200"
              style={{
                borderColor: active?.id === loc.id ? loc.color : "rgba(255,255,255,0.1)",
                background: active?.id === loc.id ? loc.color + "22" : "transparent",
                color: active?.id === loc.id ? loc.color : "rgba(255,255,255,0.4)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: loc.color }}
              />
              {loc.name.split("—")[0].trim()}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}