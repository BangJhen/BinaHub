import Link from "next/link";
import { RevealSection } from "@/components/reveal-section";
import styles from "./page.module.css";

function AppIcon({ name }: { name: string }) {
  if (name === "briefcase") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (name === "radar") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1" />
        <path d="M12 12l6-4" />
      </svg>
    );
  }

  if (name === "clipboard-check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <rect x="5" y="5" width="14" height="17" rx="2" />
        <path d="m8 14 2 2 4-4" />
      </svg>
    );
  }

  if (name === "user-plus") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="8" r="3" />
        <path d="M4 19a6 6 0 0 1 12 0" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </svg>
    );
  }

  if (name === "file-plus") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5" />
        <path d="M12 11v6" />
        <path d="M9 14h6" />
      </svg>
    );
  }

  if (name === "link-match") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 14a4 4 0 0 1 0-6l1-1a4 4 0 0 1 6 6l-1 1" />
        <path d="M14 10a4 4 0 0 1 0 6l-1 1a4 4 0 0 1-6-6l1-1" />
      </svg>
    );
  }

  if (name === "calendar-check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    );
  }

  if (name === "store") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10h16" />
        <path d="M5 10v9h14v-9" />
        <path d="m3 10 2-5h14l2 5" />
        <path d="M10 19v-5h4v5" />
      </svg>
    );
  }

  if (name === "worker") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 11V9a6 6 0 0 1 12 0v2" />
        <rect x="5" y="11" width="14" height="4" rx="1" />
        <path d="M12 15v3" />
        <path d="M7 21a5 5 0 0 1 10 0" />
      </svg>
    );
  }

  if (name === "shield-check") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "chart-up") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19h16" />
        <path d="m6 15 4-4 3 3 5-6" />
        <path d="M18 8h2v2" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2" />
        <path d="M3 19a6 6 0 0 1 12 0" />
        <path d="M14 19a4 4 0 0 1 7 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

const valueItems = [
  {
    icon: "briefcase",
    title: "Lowongan lebih terarah",
    description: "UMKM membuat lowongan berdasarkan kebutuhan shift, kapasitas tim, dan kesiapan pendampingan harian.",
    properties: ["Shift-ready", "Target jelas", "Pendampingan awal"]
  },
  {
    icon: "radar",
    title: "Matching berbasis data perilaku",
    description: "Skor kecocokan mempertimbangkan performa kerja, konsistensi check-in, dan profil risiko individu.",
    properties: ["Skor relevansi", "Riwayat check-in", "Profil risiko"]
  },
  {
    icon: "clipboard-check",
    title: "Monitoring harian yang humanis",
    description: "Daily check memberi sinyal awal kondisi emosional agar dukungan dapat diberikan sebelum masalah membesar.",
    properties: ["Alert dini", "Follow-up cepat", "Mentoring terjadwal"]
  }
];

const faqItems = [
  {
    question: "Apakah BinaHub hanya untuk UMKM tertentu?",
    answer:
      "Tidak. BinaHub dirancang untuk berbagai skala UMKM yang ingin membuka peluang kerja inklusif dengan proses monitoring yang lebih terstruktur."
  },
  {
    question: "Bagaimana BinaHub melakukan matching kandidat?",
    answer:
      "Sistem mencocokkan kebutuhan posisi dengan data kandidat, termasuk riwayat check-in, konsistensi kerja, dan indikator kesiapan operasional."
  },
  {
    question: "Apakah daily check wajib diisi setiap hari?",
    answer:
      "Disarankan diisi setiap hari untuk membantu deteksi dini kondisi pekerja. Data ini menjadi dasar rekomendasi tindak lanjut dan pendampingan."
  },
  {
    question: "Siapa yang bisa melihat data monitoring individu?",
    answer:
      "Akses ditentukan berdasarkan role. UMKM melihat pekerja di unitnya, sementara admin program memantau tren agregat sesuai otorisasi."
  }
];

const flowSteps = [
  {
    title: "Registrasi dan pilih role",
    description: "Akun dibuat sesuai peran: UMKM, pekerja, atau admin program.",
    meta: "Durasi: < 5 menit"
  },
  {
    title: "Buat lowongan operasional",
    description: "Posisi, lokasi, shift, dan target performa ditentukan sejak awal.",
    meta: "Output: lowongan aktif"
  },
  {
    title: "Lihat hasil matchmaking",
    description: "Sistem menampilkan kandidat ex-napi paling relevan untuk tiap kebutuhan UMKM.",
    meta: "Output: shortlist kandidat"
  },
  {
    title: "Pantau daily check pekerja",
    description: "Dashboard individu menampilkan kondisi hari ini, riwayat check-in, dan tindak lanjut.",
    meta: "Output: rencana follow-up"
  }
];

const roleItems = [
  {
    icon: "store",
    title: "UMKM",
    focus: "Fokus: operasional dan kestabilan tim",
    points: [
      "Kelola lowongan dan shortlist kandidat secara cepat.",
      "Pantau alert risiko serta status check-in harian.",
      "Terima rekomendasi pendampingan per individu pekerja."
    ]
  },
  {
    icon: "worker",
    title: "Pekerja Ex-Napi",
    focus: "Fokus: adaptasi kerja dan dukungan harian",
    points: [
      "Mendapat akses peluang kerja yang lebih adil.",
      "Menyampaikan kondisi harian melalui daily check terstruktur.",
      "Menerima dukungan dan mentoring sesuai kebutuhan lapangan."
    ]
  },
  {
    icon: "shield-check",
    title: "Admin Program",
    focus: "Fokus: kualitas program dan monitoring agregat",
    points: [
      "Mengawasi kualitas matching antar UMKM.",
      "Menganalisis tren risiko pada level populasi.",
      "Menjaga standar pendampingan tetap konsisten."
    ]
  }
];

const metricItems = [
  {
    icon: "store",
    label: "UMKM Aktif",
    value: "120+",
    note: "Mitra usaha yang rutin membuka lowongan"
  },
  {
    icon: "clipboard-check",
    label: "Daily Check",
    value: "1.420",
    note: "Laporan kondisi mingguan yang terpantau"
  },
  {
    icon: "chart-up",
    label: "Match Rate",
    value: "87%",
    note: "Kandidat lanjut ke fase penempatan kerja"
  },
  {
    icon: "users",
    label: "Mentoring",
    value: "6 / minggu",
    note: "Sesi aktif untuk dukungan adaptasi pekerja"
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
          <a href="#faq">FAQ</a>
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

      <footer className={styles.footerBand}>
        <span>© {new Date().getFullYear()} BinaHub Prototype</span>
        <span>Inklusi kerja dengan monitoring yang humanis, terukur, dan berkelanjutan.</span>
      </footer>
    </main>
  );
}
