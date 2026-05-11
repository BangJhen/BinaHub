import { CtaSection } from "@/components/home/CtaSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FlowSection } from "@/components/home/FlowSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeNav } from "@/components/home/HomeNav";
import { MetricSection } from "@/components/home/MetricSection";
import { RoleSection } from "@/components/home/RoleSection";
import { ValueSection } from "@/components/home/ValueSection";
import styles from "./page.module.css";

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
