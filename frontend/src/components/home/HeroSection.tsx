import Link from "next/link";
import styles from "./hero-section.module.css";
import { HeroBackground } from "./HeroBackground";

export function HeroSection() {
  return (
    <section className={`${styles.sectionBand} ${styles.heroBand}`}>
      <HeroBackground />
      <div className={styles.heroContent}>
        <article className={styles.heroCopy}>
          <p className={styles.eyebrow}>Ekosistem Kerja Inklusif Berbasis Monitoring</p>
          <h1>
            <span className={styles.heroTitleLoop}>
              Platform kerja inklusif untuk <span style={{ whiteSpace: "nowrap" }}>UMKM dan ex-napi.</span>
            </span>
          </h1>
          <p>
            BinaHub menyatukan lowongan, matchmaking, dan daily check agar proses penempatan lebih rapi serta pendampingan pekerja
            lebih konsisten dari hari ke hari.
          </p>

          <div className={styles.heroCta}>
            <Link href="/auth/register" className={styles.primaryBtn}>
              Buat Akun BinaHub
            </Link>
            <Link href="/auth/login" className={styles.outlineBtn}>
              Masuk ke Platform
            </Link>
          </div>

          <ul className={styles.heroMeta}>
            <li>Lowongan terstruktur</li>
            <li>Matching terukur</li>
            <li>Pendampingan berkelanjutan</li>
          </ul>
        </article>

        <aside className={styles.heroVisual}>
          <div className={styles.artContainer}>
            <svg className={styles.artSvg} viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(3, 105, 161, 0.08)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="500" height="500" fill="url(#grid)" />
              
              <circle cx="250" cy="250" r="80" fill="none" stroke="rgba(3, 105, 161, 0.15)" strokeWidth="1" strokeDasharray="5,5" />
              <circle cx="250" cy="250" r="120" fill="none" stroke="rgba(3, 105, 161, 0.1)" strokeWidth="1" strokeDasharray="5,5" />
              <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(3, 105, 161, 0.08)" strokeWidth="1" strokeDasharray="5,5" />
            </svg>

            <div className={styles.rotatingWrapper}>
              <div className={styles.rotatingPlatform}>
                
                <div className={styles.labelNode} style={{ top: '80px', left: '21.5px' }}>
                  <div className={styles.labelTransform}>
                    <div className={styles.labelCounterRotate}>
                      <div className={`${styles.artBadge} ${styles.badgePrimary}`}>
                        Lowongan
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.labelNode} style={{ top: '80px', left: '298.5px' }}>
                  <div className={styles.labelTransform}>
                    <div className={styles.labelCounterRotate}>
                      <div className={`${styles.artBadge} ${styles.badgeSecondary}`}>
                        Matching
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.labelNode} style={{ top: '320px', left: '160px' }}>
                  <div className={styles.labelTransform}>
                    <div className={styles.labelCounterRotate}>
                      <div className={`${styles.artBadge} ${styles.badgePrimary}`}>
                        Daily Check
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className={styles.coreNodeContainer}>
              <div className={styles.coreNode}>
                BinaHub
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
