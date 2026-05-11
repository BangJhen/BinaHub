import Link from "next/link";
import { RevealSection } from "@/components/reveal-section";
import styles from "./cta-section.module.css";

export function CtaSection() {
  return (
    <RevealSection className={`${styles.sectionBand} ${styles.ctaBand}`}>
      <div className={styles.ctaInner}>
        <div className={styles.ctaText}>
          <h2>Siap mulai ekosistem kerja inklusif?</h2>
          <p>Masuk ke BinaHub untuk membuka lowongan, melakukan matching, dan memantau daily check pekerja.</p>
        </div>
        <div className={styles.ctaActions}>
          <Link href="/auth/register" className={styles.primaryBtn}>
            Mulai Sekarang
          </Link>
          <Link href="/auth/login" className={styles.outlineBtn}>
            Login
          </Link>
        </div>
      </div>
    </RevealSection>
  );
}
