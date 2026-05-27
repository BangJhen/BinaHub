import Link from "next/link";
import styles from "./hero-section.module.css";
import GridMotion from "./GridMotion";

export function HeroSection() {
  const gridItems = [
    'UMKM Go Digital',
    <div key="g1" style={{color: '#0d6f9a'}}>Lowongan Valid</div>,
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop',
    'Mitigasi Risiko',
    <div key="g2" style={{color: '#1d9e75'}}>Skoring AI</div>,
    'Monitoring',
    <div key="g3">Daily Check</div>,
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop',
    'Ex-Napi Mandiri',
    <div key="g4">Bimbingan</div>,
    'Matching Tepat',
    <div key="g5" style={{color: '#d97706'}}>Data Terpusat</div>,
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop',
    'Peluang Baru',
    'Ekosistem Inklusif',
    <div key="g6">Dashboard Pintar</div>,
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2000&auto=format&fit=crop',
    'Transparan',
    <div key="g7" style={{color: '#0369a1'}}>BinaHub</div>,
    'Evaluasi Rutin',
    <div key="g8">Kesetaraan</div>,
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop',
    'Produktivitas',
    <div key="g9">Keahlian</div>,
    'Kerja Nyata',
    <div key="g10" style={{color: '#16a34a'}}>Harmoni</div>,
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=2000&auto=format&fit=crop',
    'Terintegrasi'
  ];

  return (
    <section className={`${styles.sectionBand} ${styles.heroBand}`}>
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
            <GridMotion items={gridItems} />
          </div>
        </aside>
      </div>
    </section>
  );
}
