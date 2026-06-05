import { RevealSection } from "@/shared/components/reveal-section";
import { flowSteps } from "@/features/home/home-data";
import styles from "./flow-section.module.css";

export function FlowSection() {
  return (
    <RevealSection id="alur" className={`${styles.sectionBand} ${styles.flowBand}`}>
      <div className={styles.bandHeader}>
        <p className={styles.eyebrow}>Workflow</p>
        <h2>Alur Penggunaan</h2>
        <p>Flow end-to-end dari onboarding hingga monitoring individu pekerja.</p>
      </div>
      <ol className={styles.flowTrack}>
        {flowSteps.map((step, index) => (
          <li key={step.title} className={styles.flowStep}>
            <div className={styles.stepDot}>{index + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <span className={styles.flowMeta}>{step.meta}</span>
          </li>
        ))}
      </ol>
    </RevealSection>
  );
}
