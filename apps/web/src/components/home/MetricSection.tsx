import { RevealSection } from "@/components/reveal-section";
import { metricItems } from "@/features/home/home-data";
import { AppIcon } from "./AppIcon";
import styles from "./metric-section.module.css";

export function MetricSection() {
  return (
    <RevealSection className={`${styles.sectionBand} ${styles.metricBand}`}>
      <div className={styles.metricRow}>
        {metricItems.map((metric) => (
          <article key={metric.label} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>
                <AppIcon name={metric.icon} />
              </span>
              <p>{metric.label}</p>
            </div>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </div>
    </RevealSection>
  );
}
