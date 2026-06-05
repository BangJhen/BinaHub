import Image from "next/image";
import { RevealSection } from "@/shared/components/reveal-section";
import styles from "./founders-section.module.css";

const founders = [
  {
    photo: "/Ammar-Ridho.jpeg",
    name: "Muhammad Ammar Ridho",
    role: "Founder",
    tagline: "AI/ML Researcher & Full-Stack Engineer",
    university: "S1 Data Sains — Telkom University",
    bio: "Merancang arsitektur BinaHub dari nol: mulai dari sistem matching berbasis kecerdasan buatan, pipeline monitoring pekerja, hingga seluruh layer frontend. Berpengalaman dalam machine learning, web development, dan kompetisi data bertaraf nasional.",
    highlights: [
      "1st Place Kaggle Data Slayer 2025",
      "Finalist GEMASTIK XVIII Data Mining",
      "Mentor ML — GDGOC Telkom University",
    ],
    skills: ["Machine Learning", "Deep Learning", "React / Next.js", "Data Science", "Web Scraping"],
    linkedin: null,
  },
  {
    photo: "/Yaser.jpeg",
    name: "Yaser Nur Taxiano",
    role: "Co-Founder",
    tagline: "Backend & Systems Engineer",
    university: "Telkom University",
    bio: "Membangun dan menjaga fondasi sistem BinaHub: integrasi Supabase, alur autentikasi multi-role, API backend, serta infrastruktur database yang mendukung ekosistem kerja inklusif UMKM dan pekerja.",
    highlights: [
      "Backend Architecture BinaHub",
      "Supabase & Auth Integration",
      "API & Database Design",
    ],
    skills: ["Backend Development", "Supabase / PostgreSQL", "API Design", "System Architecture", "TypeScript"],
    linkedin: null,
  },
];

export function FoundersSection() {
  return (
    <RevealSection id="founders" className={`${styles.sectionBand} ${styles.foundersBand}`}>
      <div className={styles.bandHeader}>
        <p className={styles.eyebrow}>Tim Pendiri</p>
        <h2>Orang di Balik BinaHub</h2>
        <p>
          BinaHub lahir dari kepedulian dua mahasiswa Telkom University terhadap pekerja binaan UMKM yang sering luput dari
          sistem pemantauan modern.
        </p>
      </div>

      <div className={styles.founderGrid}>
        {founders.map((f, i) => (
          <article key={f.name} className={styles.founderCard}>
            {/* Accent bar top */}
            <div className={styles.cardAccent} />

            {/* Photo */}
            <div className={styles.photoWrapper}>
              <div className={styles.photoRing}>
                <Image
                  src={f.photo}
                  alt={`Foto ${f.name}`}
                  width={120}
                  height={120}
                  className={styles.photo}
                  priority={i === 0}
                />
              </div>
              <span className={styles.roleBadge}>{f.role}</span>
            </div>

            {/* Identity */}
            <div className={styles.identity}>
              <h3 className={styles.founderName}>{f.name}</h3>
              <p className={styles.founderTagline}>{f.tagline}</p>
              <p className={styles.founderUniv}>
                <span className={styles.univDot} />
                {f.university}
              </p>
            </div>

            {/* Bio */}
            <p className={styles.founderBio}>{f.bio}</p>

            {/* Highlights */}
            <ul className={styles.highlightList}>
              {f.highlights.map((h) => (
                <li key={h} className={styles.highlightItem}>
                  <span className={styles.checkIcon}>✓</span>
                  {h}
                </li>
              ))}
            </ul>

            {/* Skills */}
            <div className={styles.skillRow}>
              {f.skills.map((s) => (
                <span key={s} className={styles.skillChip}>
                  {s}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </RevealSection>
  );
}
