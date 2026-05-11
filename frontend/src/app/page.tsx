import dynamic from "next/dynamic";
import { HomeNav } from "@/components/home/HomeNav";
import { HeroSection } from "@/components/home/HeroSection";
import styles from "./page.module.css";

// Lazy Load Below-the-fold Sections
const MetricSection = dynamic(() => import("@/components/home/MetricSection").then((mod) => mod.MetricSection));
const ValueSection = dynamic(() => import("@/components/home/ValueSection").then((mod) => mod.ValueSection));
const FlowSection = dynamic(() => import("@/components/home/FlowSection").then((mod) => mod.FlowSection));
const RoleSection = dynamic(() => import("@/components/home/RoleSection").then((mod) => mod.RoleSection));
const FaqSection = dynamic(() => import("@/components/home/FaqSection").then((mod) => mod.FaqSection));
const CtaSection = dynamic(() => import("@/components/home/CtaSection").then((mod) => mod.CtaSection));
const HomeFooter = dynamic(() => import("@/components/home/HomeFooter").then((mod) => mod.HomeFooter));

export default function HomePage() {
  return (
    <main className={styles.pageRoot}>
      <HomeNav />
      <HeroSection />
      <MetricSection />
      <ValueSection />
      <FlowSection />
      <RoleSection />
      <FaqSection />
      <CtaSection />
      <HomeFooter />
    </main>
  );
}
