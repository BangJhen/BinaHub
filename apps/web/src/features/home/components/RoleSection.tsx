import { RevealSection } from "@/shared/components/reveal-section";
import { roleItems } from "@/features/home/home-data";
import { AppIcon } from "./AppIcon";
import styles from "./role-section.module.css";

export function RoleSection() {
  return (
    <RevealSection id="peran" className={`${styles.sectionBand} ${styles.roleBand}`}>
      <div className={styles.bandHeader}>
        <p className={styles.eyebrow}>Peran</p>
        <h2>Siapa yang Diuntungkan</h2>
        <p>Setiap role mendapatkan pengalaman kerja yang berbeda namun saling terhubung.</p>
      </div>
      <div className={styles.roleColumns}>
        {roleItems.map((role) => (
          <article key={role.title} className={styles.rolePanel}>
            <div className={styles.roleHead}>
              <span className={styles.roleIcon}>
                <AppIcon name={role.icon} />
              </span>
              <h3 className={styles.roleTitle}>{role.title}</h3>
            </div>
            <p className={styles.roleMeta}>{role.focus}</p>
            <ul>
              {role.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </RevealSection>
  );
}
