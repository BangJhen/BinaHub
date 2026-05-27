import Link from "next/link";
import styles from "./hero-section.module.css";
import GridMotion from "./GridMotion";

const T = ({ role, text, name }: { role: string; text: string; name: string }) => (
  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px', height: '100%', justifyContent: 'center' }}>
    <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#0b4f6e', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
      &ldquo;{text}&rdquo;
    </p>
    <div>
      <strong style={{ fontSize: '10px', color: '#0369a1', display: 'block' }}>{name}</strong>
      <span style={{ fontSize: '10px', color: '#49657a' }}>{role}</span>
    </div>
  </div>
);

export function HeroSection() {
  const gridItems = [
    // Row 1
    <T key="t1"  name="Budi S."    role="UMKM Kopi"       text="Platform ini memudahkan saya mencari pekerja jujur yang siap kerja." />,
    <T key="t2"  name="Agus T."    role="Pekerja"          text="BinaHub memberi saya kesempatan kedua yang sangat berharga." />,
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=800&auto=format&fit=crop',
    <T key="t3"  name="Siti R."    role="Pemilik Warung"   text="Fitur daily check membantu saya memantau kinerja harian mereka." />,
    <T key="t4"  name="Rizky M."   role="Pekerja"          text="Proses matching-nya sangat akurat dengan keahlian bengkel saya." />,
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop',
    <T key="t5"  name="Hendra P."  role="UMKM Konveksi"    text="Pekerja dari BinaHub rajin dan selalu mendapat pendampingan." />,
    // Row 2
    <T key="t6"  name="Doni W."    role="Pekerja"          text="Saya bisa bekerja tenang karena ada dukungan mentor tiap minggu." />,
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
    <T key="t7"  name="Lina A."    role="UMKM Katering"    text="Skoring AI membuat saya tidak ragu lagi merekrut mereka." />,
    <T key="t8"  name="Yanto K."   role="Pekerja"          text="Aplikasi ini mudah digunakan dan lowongannya selalu update." />,
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800&auto=format&fit=crop',
    <T key="t9"  name="Toni B."    role="Pemilik Bengkel"  text="Ekosistem inklusif ini benar-benar membawa dampak sosial positif." />,
    <T key="t10" name="Fajar H."   role="Pekerja"          text="Terima kasih BinaHub, hidup saya sekarang jauh lebih terarah." />,
    // Row 3
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    <T key="t11" name="Maya S."    role="UMKM Laundry"     text="Mitigasi risikonya terukur, saya sangat merekomendasikan ini." />,
    <T key="t12" name="Bagas R."   role="Pekerja"          text="Sistemnya transparan, gaji dan absen bisa dilihat langsung." />,
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=800&auto=format&fit=crop',
    <T key="t13" name="Dedi K."    role="Pemilik Toko"     text="Sangat membantu kami yang kesulitan mencari pegawai." />,
    <T key="t14" name="Bayu A."    role="Pekerja"          text="BinaHub mengerti kondisi kami dan mencarikan solusi terbaik." />,
    <T key="t15" name="Rina W."    role="UMKM Kuliner"     text="Proses rekrutmen cepat dan tidak ribet sama sekali." />,
    // Row 4
    <T key="t16" name="Iwan S."    role="Pekerja"          text="Ada komunitas yang saling mendukung satu sama lain." />,
    <T key="t17" name="Eko P."     role="UMKM Retail"      text="Pendampingan berkelanjutan adalah kunci kesuksesan platform ini." />,
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop',
    <T key="t18" name="Ahmad Z."   role="Pekerja"          text="Masa lalu bukan halangan berkat sistem matchmaking BinaHub." />,
    <T key="t19" name="Diana F."   role="UMKM Jasa"        text="Kami merasa aman mempekerjakan mereka karena ada pantauan." />,
    <T key="t20" name="Reza M."    role="Pekerja"          text="Mendapatkan kepercayaan lagi adalah hal yang luar biasa." />,
    <T key="t21" name="Wahyu N."   role="UMKM Kerajinan"   text="Pekerja yang dikirimkan selalu sesuai dengan spesifikasi kami." />,
    // Row 5
    <T key="t22" name="Surya D."   role="Pekerja"          text="Semoga platform ini bisa menjangkau lebih banyak teman-teman." />,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    <T key="t23" name="Nita K."    role="UMKM Batik"       text="Kami bangga bisa memberi kesempatan kerja yang bermartabat." />,
    <T key="t24" name="Andi P."    role="Pekerja"          text="Pelatihan dan bimbingan dari BinaHub sangat membantu karir saya." />,
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    <T key="t25" name="Fitri L."   role="UMKM Catering"    text="Dashboard monitoring sangat memudahkan pengelolaan tim kami." />,
    <T key="t26" name="Joko S."    role="Pekerja"          text="Saya bisa membuktikan diri lewat kinerja nyata di sini." />,
    // Row 6
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop',
    <T key="t27" name="Putri A."   role="UMKM Florist"     text="Sangat mudah menemukan kandidat yang cocok dengan usaha kami." />,
    <T key="t28" name="Haris M."   role="Pekerja"          text="BinaHub membantu saya membangun reputasi kerja yang baik." />,
    <T key="t29" name="Dewi R."    role="UMKM Salon"       text="Sistem penilaian AI-nya akurat dan sangat membantu seleksi." />,
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop',
    <T key="t30" name="Fandi O."   role="Pekerja"          text="Akhirnya ada platform yang benar-benar peduli dengan kami." />,
    <T key="t31" name="Ratna S."   role="UMKM Percetakan"  text="Rekrutmen jadi lebih efisien dan hasilnya memuaskan." />,
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
