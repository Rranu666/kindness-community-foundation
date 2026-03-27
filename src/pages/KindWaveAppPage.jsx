import { useEffect } from "react";
import Header from "@/components/kcf/Header";
import Footer from "@/components/kcf/Footer";
import KindWaveApp from "@/components/kindwave/KindWaveApp";

export default function KindWaveAppPage() {
  // Clean up KindWave's injected <style> tag on unmount to prevent SPA style leakage
  useEffect(() => {
    return () => {
      document.head.querySelectorAll("style").forEach((el) => {
        if (el.textContent.includes("Plus Jakarta Sans")) el.remove();
      });
    };
  }, []);

  return (
    // --kw-offset is read by KindWaveApp's root containers via calc(100vh - var(--kw-offset, 0px))
    <div style={{ background: "#02040f", width: "100%", "--kw-offset": "80px" }}>
      <Header />
      {/* paddingTop: 80px clears the fixed header; no height set — KindWaveApp owns its own height */}
      <div style={{ paddingTop: "80px", width: "100%", overflow: "hidden" }}>
        <KindWaveApp />
      </div>
      <Footer hideCta />
    </div>
  );
}
