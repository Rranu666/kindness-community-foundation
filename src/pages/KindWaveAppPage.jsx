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
    <div style={{ background: "#02040f", width: "100%", "--kw-offset": "80px" }}>
      <Header />
      <div style={{
        paddingTop: "80px",
        display: "flex",
        justifyContent: "center",
        background: "#02040f",
        minHeight: "calc(100vh - 80px)",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "600px",
          height: "calc(100vh - 80px)",
          overflow: "hidden",
        }}>
          <KindWaveApp />
        </div>
      </div>
      <Footer hideCta />
    </div>
  );
}
