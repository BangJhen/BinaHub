import { RevealSection } from "@/shared/components/reveal-section";
import { valueItems } from "@/features/home/home-data";
import { AppIcon } from "./AppIcon";
import styles from "./value-section.module.css";

export function ValueSection() {
  return (
    <RevealSection id="fitur" className={`${styles.sectionBand} ${styles.valueBand}`}>
      <div className={styles.bandHeader}>
        <p className={styles.eyebrow}>Platform Inklusi Kerja Berbasis Monitoring</p>
        <h2>Kenapa BinaHub</h2>
        <p>Setiap section dirancang untuk menyederhanakan proses operasional UMKM tanpa kehilangan aspek pendampingan manusia.</p>
      </div>
      <div className={styles.valueRows}>
        {valueItems.map((item) => (
          <article key={item.title} className={styles.valueRow}>
            <div className={styles.valueHead}>
              <span className={styles.valueIcon}>
                <AppIcon name={item.icon} />
              </span>
              <h3>{item.title}</h3>
            </div>
            <div>
              <p>{item.description}</p>
              <div className={styles.propertyList}>
                {item.properties.map((property) => (
                  <span key={property} className={styles.propertyChip}>
                    {property}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </RevealSection>
  );
}
