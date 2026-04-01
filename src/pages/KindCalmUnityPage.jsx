import { useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function KindCalmUnityPage() {
  usePageMeta(
    "KindCalmUnity – Cooperative Community Living | KCF",
    "KindCalmUnity is a cooperative community platform where families share meals, childcare, gardening, carpools and activities — so everyone gives, rests and thrives."
  );

  useEffect(() => {
    // Redirect to the standalone KindCalmUnity app
    window.location.replace("/kindcalmunity.html");
  }, []);

  return null;
}
