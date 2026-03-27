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
    <div style={{ background: "#02040f", width: "100%", overflow: "hidden" }}>
      <Header />
      {/* paddingTop: 80px clears the fixed header so the app renders below it */}
      <div style={{ paddingTop: "80px", height: "100vh", width: "100%" }}>
        <KindWaveApp />
      </div>
      <Footer hideCta />
    </div>
  );
}
