import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Regional impact data
const IMPACT_REGIONS = [
  { name: "East Africa", lat: -1, lng: 37, color: "#6db88a", impact: { trees: 4200, water: 890, meals: 12500, children: 1250 } },
  { name: "West Africa", lat: 6, lng: -8, color: "#3D6B50", impact: { trees: 3100, water: 620, meals: 9800, children: 890 } },
  { name: "South Asia", lat: 20, lng: 78, color: "#5C9470", impact: { trees: 5600, water: 1420, meals: 18900, children: 2100 } },
  { name: "Southeast Asia", lat: 8, lng: 105, color: "#6db88a", impact: { trees: 3800, water: 760, meals: 14200, children: 1520 } },
  { name: "Central America", lat: 15, lng: -90, color: "#3D6B50", impact: { trees: 2200, water: 450, meals: 6800, children: 620 } },
  { name: "South America", lat: -10, lng: -60, color: "#5C9470", impact: { trees: 3500, water: 890, meals: 11200, children: 980 } },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function GlobalImpactMap() {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const mapStyle = {
    width: "100%",
    height: "clamp(300px, 45vw, 420px)",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    overflow: "hidden",
  };

  const stats = useMemo(() => {
    return IMPACT_REGIONS.reduce(
      (acc, region) => {
        acc.totalTrees += region.impact.trees;
        acc.totalWater += region.impact.water;
        acc.totalMeals += region.impact.meals;
        acc.totalChildren += region.impact.children;
        return acc;
      },
      { totalTrees: 0, totalWater: 0, totalMeals: 0, totalChildren: 0 }
    );
  }, []);

  return (
    <section className="py-24 px-5 md:px-10 lg:px-20 bg-gradient-to-b from-white to-[#FDFAF5]">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 text-[#3D6B50] text-xs font-bold tracking-[0.14em] uppercase mb-4">
            <span className="w-7 h-0.5 bg-[#3D6B50]" /> Global Impact Map
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1B2B22] mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            Where your <em className="text-[#5C9470] not-italic">kindness</em> reaches
          </h2>
          <p className="text-[#657066] text-base max-w-2xl mx-auto">
            Hover over any region to see the real-time impact of donations — trees planted, water access restored, lives changed.
          </p>
        </motion.div>

        {/* Global stats summary */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: "🌳", label: "Trees Planted Globally", value: stats.totalTrees.toLocaleString() },
            { icon: "💧", label: "People with Clean Water", value: stats.totalWater.toLocaleString() },
            { icon: "🍽️", label: "Meals Funded", value: stats.totalMeals.toLocaleString() },
            { icon: "👧", label: "Children in School", value: stats.totalChildren.toLocaleString() },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              className="bg-white border border-[#d4e0d8] rounded-2xl p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-3xl md:text-4xl mb-2">{stat.icon}</div>
              <div className="text-[#3D6B50] text-xs font-bold tracking-wider uppercase mb-1">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-bold text-[#1B2B22]" style={{ fontFamily: "'Georgia', serif" }}>{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Map */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-10 overflow-hidden">
          <div style={mapStyle}>
            <MapContainer center={[20, 0]} zoom={2} style={{ width: "100%", height: "100%" }} zoomControl={true}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors'
                maxZoom={18}
              />
              {IMPACT_REGIONS.map((region) => (
                <CircleMarker
                  key={region.name}
                  center={[region.lat, region.lng]}
                  radius={Math.sqrt(region.impact.trees) / 2}
                  fillColor={region.color}
                  color={region.color}
                  weight={2}
                  opacity={hoveredRegion === region.name ? 1 : 0.6}
                  fillOpacity={hoveredRegion === region.name ? 0.8 : 0.5}
                  eventHandlers={{
                    mouseover: () => setHoveredRegion(region.name),
                    mouseout: () => setHoveredRegion(null),
                    click: () => setSelectedRegion(region),
                  }}
                >
                  <Tooltip permanent={false} className="leaflet-tooltip-custom">
                    <div className="font-bold text-sm">{region.name}</div>
                  </Tooltip>
                  <Popup>
                    <div className="p-2 text-sm">
                      <div className="font-bold mb-2 text-[#1B2B22]">{region.name} Impact</div>
                      <div className="space-y-1 text-[#657066]">
                        <div>🌳 {region.impact.trees.toLocaleString()} trees planted</div>
                        <div>💧 {region.impact.water.toLocaleString()} people with clean water</div>
                        <div>🍽️ {region.impact.meals.toLocaleString()} meals funded</div>
                        <div>👧 {region.impact.children.toLocaleString()} children in school</div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </motion.div>

        {/* Regional Breakdown */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMPACT_REGIONS.map((region, i) => (
              <motion.div
                key={region.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                onMouseEnter={() => setHoveredRegion(region.name)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`rounded-2xl p-5 cursor-pointer transition-all duration-300 border-2 ${
                  hoveredRegion === region.name || selectedRegion?.name === region.name
                    ? `bg-[${region.color}]/10 border-[${region.color}]`
                    : "bg-white border-[#d4e0d8]"
                }`}
                style={{
                  backgroundColor: hoveredRegion === region.name || selectedRegion?.name === region.name ? `${region.color}15` : "white",
                  borderColor: hoveredRegion === region.name || selectedRegion?.name === region.name ? region.color : "#d4e0d8",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#1B2B22]">{region.name}</h3>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f5f8f6] rounded-lg p-3">
                    <div className="text-2xl font-bold text-[#3D6B50]">{region.impact.trees}</div>
                    <div className="text-xs text-[#657066] font-medium">Trees Planted</div>
                  </div>
                  <div className="bg-[#f5f8f6] rounded-lg p-3">
                    <div className="text-2xl font-bold text-[#3D6B50]">{region.impact.water}</div>
                    <div className="text-xs text-[#657066] font-medium">Water Access</div>
                  </div>
                  <div className="bg-[#f5f8f6] rounded-lg p-3">
                    <div className="text-2xl font-bold text-[#3D6B50]">{region.impact.meals}</div>
                    <div className="text-xs text-[#657066] font-medium">Meals Funded</div>
                  </div>
                  <div className="bg-[#f5f8f6] rounded-lg p-3">
                    <div className="text-2xl font-bold text-[#3D6B50]">{region.impact.children}</div>
                    <div className="text-xs text-[#657066] font-medium">Children Helped</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}