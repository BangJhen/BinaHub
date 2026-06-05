import { RevealSection } from "@/components/reveal-section";
import { faqItems } from "@/features/home/home-data";
import styles from "./faq-section.module.css";

export function FaqSection() {
  return (
    <RevealSection id="faq" className={`${styles.sectionBand} ${styles.faqBand}`}>
      <div className={styles.bandHeader}>
        <p className={styles.eyebrow}>FAQ</p>
        <h2>Pertanyaan yang Sering Diajukan</h2>
        <p>Ringkasan jawaban singkat untuk memahami alur penggunaan BinaHub.</p>
      </div>

      <div className={styles.faqList}>
        {faqItems.map((item) => (
          <details key={item.question} className={styles.faqItem}>
            <summary>{item.question}</summary>
            <div className={styles.faqAnswer}>
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </RevealSection>
  );
}
