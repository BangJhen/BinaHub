import Link from "next/link";
import styles from "./page.module.css";

const valueItems = [
  {
    title: "Lowongan lebih terarah",
    description: "UMKM membuat lowongan berdasarkan kebutuhan shift, kapasitas tim, dan kesiapan pendampingan harian."
  },
  {
    title: "Matching berbasis data perilaku",
    description: "Skor kecocokan mempertimbangkan performa kerja, konsistensi check-in, dan profil risiko individu."
  },
  {
    title: "Monitoring harian yang humanis",
    description: "Daily check memberi sinyal awal kondisi emosional agar dukungan dapat diberikan sebelum masalah membesar."
  }
];

const flowSteps = [
  {
    title: "Registrasi dan pilih role",
    description: "Akun dibuat sesuai peran: UMKM, pekerja, atau admin program."
  },
  {
    title: "Buat lowongan operasional",
    description: "Posisi, lokasi, shift, dan target performa ditentukan sejak awal."
  },
  {
    title: "Lihat hasil matchmaking",
    description: "Sistem menampilkan kandidat ex-napi paling relevan untuk tiap kebutuhan UMKM."
  },
  {
    title: "Pantau daily check pekerja",
    description: "Dashboard individu menampilkan kondisi hari ini, riwayat check-in, dan tindak lanjut."
  }
];

const roleItems = [
  {
    title: "UMKM",
    points: [
      "Kelola lowongan dan shortlist kandidat secara cepat.",
      "Pantau alert risiko serta status check-in harian.",
      "Terima rekomendasi pendampingan per individu pekerja."
    ]
  },
  {
    title: "Pekerja Ex-Napi",
    points: [
      "Mendapat akses peluang kerja yang lebih adil.",
      "Menyampaikan kondisi harian melalui daily check terstruktur.",
      "Menerima dukungan dan mentoring sesuai kebutuhan lapangan."
    ]
  },
  {
    title: "Admin Program",
    points: [
      "Mengawasi kualitas matching antar UMKM.",
      "Menganalisis tren risiko pada level populasi.",
      "Menjaga standar pendampingan tetap konsisten."
    ]
  }
];

export default function HomePage() {
  return (
    <main className={styles.pageRoot}>
      <nav className={styles.topNav}>
        <div className={styles.brand}>BinaHub</div>
        <div className={styles.navCenter}>
          <a href="#fitur">Fitur</a>
          <a href="#alur">Alur</a>
          <a href="#peran">Peran</a>
        </div>
        <div className={styles.navLinks}>
          <Link href="/auth/login" className={styles.ghostBtn}>
            Login
          </Link>
          <Link href="/auth/register" className={styles.primaryBtn}>
            Register
          </Link>
        </div>
      </nav>

      <section className={`${styles.sectionBand} ${styles.heroBand}`}>
        <div className={styles.heroContent}>
          <article className={styles.heroCopy}>
            <p className={styles.eyebrow}>Ekosistem Kerja Inklusif Berbasis Monitoring</p>
            <h1>BinaHub menghubungkan UMKM dan ex-napi lewat lowongan, matching, dan daily check yang terukur.</h1>
            <p>
              Platform ini membantu proses dari awal hingga pasca-penempatan: mulai publikasi lowongan, penilaian kandidat,
              sampai pemantauan kondisi harian agar keberlanjutan kerja lebih aman dan manusiawi.
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
              <li>120+ UMKM aktif</li>
              <li>1.420 daily check per minggu</li>
              <li>87% kandidat lanjut ke penempatan</li>
            </ul>
          </article>

          <aside className={styles.heroVisual}>
            <div className={styles.pulseHalo} />
            <div className={styles.metricStack}>
              <div className={styles.metricItem}>
                <strong>High Match</strong>
                <p>Skor kecocokan kerja 92%</p>
              </div>
              <div className={styles.metricItem}>
                <strong>Daily Check</strong>
                <p>1 pekerja perlu follow-up hari ini</p>
              </div>
              <div className={styles.metricItem}>
                <strong>Mentoring</strong>
                <p>6 sesi pendampingan minggu ini</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="fitur" className={`${styles.sectionBand} ${styles.valueBand}`}>
        <div className={styles.bandHeader}>
          <p className={styles.eyebrow}>Platform Inklusi Kerja Berbasis Monitoring</p>
          <h2>Kenapa BinaHub</h2>
          <p>Setiap section dirancang untuk menyederhanakan proses operasional UMKM tanpa kehilangan aspek pendampingan manusia.</p>
        </div>
        <div className={styles.valueRows}>
          {valueItems.map((item, index) => (
            <article key={item.title} className={styles.valueRow}>
              <span className={styles.valueIndex}>0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="alur" className={`${styles.sectionBand} ${styles.flowBand}`}>
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
            </li>
          ))}
        </ol>
      </section>

      <section id="peran" className={`${styles.sectionBand} ${styles.roleBand}`}>
        <div className={styles.bandHeader}>
          <p className={styles.eyebrow}>Peran</p>
          <h2>Siapa yang Diuntungkan</h2>
          <p>Setiap role mendapatkan pengalaman kerja yang berbeda namun saling terhubung.</p>
        </div>
        <div className={styles.roleColumns}>
          {roleItems.map((role) => (
            <article key={role.title} className={styles.rolePanel}>
              <h3 className={styles.roleTitle}>{role.title}</h3>
              <ul>
                {role.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.sectionBand} ${styles.ctaBand}`}>
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
      </section>

      <footer className={styles.footerBand}>
        <span>© {new Date().getFullYear()} BinaHub Prototype</span>
        <span>Inklusi kerja dengan monitoring yang humanis, terukur, dan berkelanjutan.</span>
      </footer>
    </main>
  );
}
