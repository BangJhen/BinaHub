import dynamic from "next/dynamic";
import { HomeNav } from "@/features/home/components/HomeNav";
import { HeroSection } from "@/features/home/components/HeroSection";
import { HeroBackground } from "@/features/home/components/HeroBackground";
import styles from "./page.module.css";

// Lazy Load Below-the-fold Sections
const MetricSection = dynamic(() => import("@/features/home/components/MetricSection").then((mod) => mod.MetricSection));
const ValueSection = dynamic(() => import("@/features/home/components/ValueSection").then((mod) => mod.ValueSection));
const FlowSection = dynamic(() => import("@/features/home/components/FlowSection").then((mod) => mod.FlowSection));
const RoleSection = dynamic(() => import("@/features/home/components/RoleSection").then((mod) => mod.RoleSection));
const FaqSection = dynamic(() => import("@/features/home/components/FaqSection").then((mod) => mod.FaqSection));
const CtaSection = dynamic(() => import("@/features/home/components/CtaSection").then((mod) => mod.CtaSection));
const HomeFooter = dynamic(() => import("@/features/home/components/HomeFooter").then((mod) => mod.HomeFooter));

export default function HomePage() {
  return (
    <main className={styles.pageRoot}>
      <HomeNav />
      <div className={styles.heroWrapper}>
        <HeroBackground />
        <HeroSection />
        <MetricSection />
      </div>
      <ValueSection />
      <FlowSection />
      <RoleSection />
      <FaqSection />
      <CtaSection />
      <HomeFooter />
    </main>
  );
}
