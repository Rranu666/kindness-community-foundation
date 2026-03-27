import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/kcf/Header";
import AmbientBackground from "@/components/kcf/AmbientBackground";
import SectionDivider from "@/components/kcf/SectionDivider";

const HeroSection = lazy(() => import("@/components/kcf/HeroSection"));
const AboutSection = lazy(() => import("@/components/kcf/AboutSection"));
const VisionMission = lazy(() => import("@/components/kcf/VisionMission"));
const InitiativesSection = lazy(() => import("@/components/kcf/InitiativesSection"));
const WhyDifferent = lazy(() => import("@/components/kcf/WhyDifferent"));
const EvolutionSection = lazy(() => import("@/components/kcf/EvolutionSection"));
const LeadershipSection = lazy(() => import("@/components/kcf/LeadershipSection"));
const PartnerSection = lazy(() => import("@/components/kcf/PartnerSection"));
const GovernanceSection = lazy(() => import("@/components/kcf/GovernanceSection"));
const ProspectusSection = lazy(() => import("@/components/kcf/ProspectusSection"));
const BoardRecruitmentSection = lazy(() => import("@/components/kcf/BoardRecruitmentSection"));
const EngagementSection = lazy(() => import("@/components/kcf/EngagementSection"));
const Footer = lazy(() => import("@/components/kcf/Footer"));

const SectionFallback = () => <div className="w-full h-20" />;

// Renders children only once the sentinel div enters the viewport
function LazySection({ children, rootMargin = "200px" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {visible ? (
        <Suspense fallback={<SectionFallback />}>{children}</Suspense>
      ) : (
        <SectionFallback />
      )}
    </div>
  );
}

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    // Prefer router state (set by Header when navigating from another page).
    // Fall back to URL hash for direct deep-link visits (e.g. kindness.app/#initiatives).
    const target = location.state?.scrollTarget || window.location.hash;
    if (!target) return;

    const scrollTo = () => {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    // First pass: scroll after React has painted (catches sections already in DOM)
    const t1 = setTimeout(scrollTo, 300);
    // Correction pass: re-scroll after lazy sections above the target have loaded
    // and expanded from their 80px placeholders to full height
    const t2 = setTimeout(scrollTo, 1100);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  // Re-run whenever a new scroll target arrives via router state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.scrollTarget]);

  return (
    <div id="home" className="min-h-screen" style={{ background: "#030712", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <AmbientBackground />
      <Header />
      <main id="main-content">
        <Suspense fallback={<SectionFallback />}>
          <HeroSection />
        </Suspense>

        <div id="about" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="300px">
          <AboutSection />
        </LazySection>

        <SectionDivider color="rose" />

        <div id="vision" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <VisionMission />
        </LazySection>

        <SectionDivider color="violet" />

        <div id="initiatives" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <InitiativesSection />
        </LazySection>

        <SectionDivider color="blue" />

        <LazySection rootMargin="200px">
          <WhyDifferent />
        </LazySection>

        <SectionDivider color="violet" />

        <div id="evolution" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <EvolutionSection />
        </LazySection>

        <SectionDivider color="blue" />

        <div id="leadership" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <LeadershipSection />
        </LazySection>

        <SectionDivider color="rose" />

        <div id="partners" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <PartnerSection />
        </LazySection>

        <SectionDivider color="violet" />

        <div id="governance" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <GovernanceSection />
        </LazySection>

        <SectionDivider color="rose" />

        <div id="prospectus" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <ProspectusSection />
        </LazySection>

        <SectionDivider color="blue" />

        <div id="board" style={{ scrollMarginTop: "80px" }} />
        <LazySection rootMargin="200px">
          <BoardRecruitmentSection />
        </LazySection>

        <SectionDivider color="violet" />

        <LazySection rootMargin="200px">
          <EngagementSection />
        </LazySection>

        <Suspense fallback={<SectionFallback />}>
          <Footer />
        </Suspense>
      </main>
    </div>
  );
}