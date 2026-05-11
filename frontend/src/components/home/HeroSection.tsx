import Link from "next/link";
import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <section className={`${styles.sectionBand} ${styles.heroBand}`}>
      <div className={styles.heroContent}>
        <article className={styles.heroCopy}>
          <p className={styles.eyebrow}>Ekosistem Kerja Inklusif Berbasis Monitoring</p>
          <h1>
            <span className={styles.heroTitleLoop}>Platform kerja inklusif untuk UMKM dan ex-napi.</span>
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
          <div className={styles.heroArtwork}>
            <div className={styles.artGrid} />
            <div className={`${styles.orbit} ${styles.orbitOne}`} />
            <div className={`${styles.orbit} ${styles.orbitTwo}`} />
            <div className={styles.coreNode}>BinaHub</div>
            <div className={`${styles.artBadge} ${styles.artBadgeTop}`}>Lowongan</div>
            <div className={`${styles.artBadge} ${styles.artBadgeMiddle}`}>Matching</div>
            <div className={`${styles.artBadge} ${styles.artBadgeBottom}`}>Daily Check</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
