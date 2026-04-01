import { usePageMeta } from "@/hooks/usePageMeta";

export default function KindCalmUnityPage() {
  usePageMeta(
    "KindCalmUnity – Cooperative Community Living | KCF",
    "KindCalmUnity is a cooperative community platform where families share meals, childcare, gardening, carpools and activities — so everyone gives, rests and thrives."
  );
  // Netlify rewrites /kindcalmunity → /kindcalmunity.html at the server level,
  // so this component is never actually rendered in production.
  return null;
}
