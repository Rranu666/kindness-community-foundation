import { useEffect } from "react";
import Header from "@/components/kcf/Header";
import Footer from "@/components/kcf/Footer";
import KindWaveApp from "@/components/kindwave/KindWaveApp";

export default function KindWaveAppPage() {
  useEffect(() => {
    return () => {
      document.head.querySelectorAll("style").forEach((el) => {
        if (el.textContent.includes("Plus Jakarta Sans")) el.remove();
      });
    };
  }, []);

  return (
    <div style={{ background: "#05091a", width: "100%", "--kw-offset": "80px", position: "relative", overflow: "hidden" }}>
      {/* Full-viewport ambient orbs so the centered app blends seamlessly */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,232,180,0.06) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "40%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(133,128,255,0.05) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,123,58,0.04) 0%, transparent 65%)" }} />
      </div>
      <Header />
      <div style={{ paddingTop: "80px", position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "520px" }}>
          <KindWaveApp />
        </div>
      </div>
      <Footer hideCta />
    </div>
  );
}
