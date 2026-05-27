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
    // Row 1 (7 items)
    <T key="t1"  name="Budi S."    role="UMKM Kopi"       text="Platform ini memudahkan saya mencari pekerja jujur yang siap kerja." />,
    <T key="t2"  name="Agus T."    role="Pekerja"         text="BinaHub memberi saya kesempatan kedua yang sangat berharga." />,
    <T key="t3"  name="Siti R."    role="Pemilik Warung"  text="Fitur daily check membantu saya memantau kinerja harian mereka." />,
    <T key="t4"  name="Rizky M."   role="Pekerja"         text="Proses matching-nya sangat akurat dengan keahlian bengkel saya." />,
    <T key="t5"  name="Hendra P."  role="UMKM Konveksi"   text="Pekerja dari BinaHub rajin dan selalu mendapat pendampingan." />,
    <T key="t6"  name="Doni W."    role="Pekerja"         text="Saya bisa bekerja tenang karena ada dukungan mentor tiap minggu." />,
    <T key="t7"  name="Lina A."    role="UMKM Katering"   text="Skoring AI membuat saya tidak ragu lagi merekrut mereka." />,
    // Row 2 (7 items)
    <T key="t8"  name="Yanto K."   role="Pekerja"         text="Aplikasi ini mudah digunakan dan lowongannya selalu update." />,
    <T key="t9"  name="Toni B."    role="Pemilik Bengkel" text="Ekosistem inklusif ini benar-benar membawa dampak sosial positif." />,
    <T key="t10" name="Fajar H."   role="Pekerja"         text="Terima kasih BinaHub, hidup saya sekarang jauh lebih terarah." />,
    <T key="t11" name="Maya S."    role="UMKM Laundry"    text="Mitigasi risikonya terukur, saya sangat merekomendasikan ini." />,
    <T key="t12" name="Bagas R."   role="Pekerja"         text="Sistemnya transparan, gaji dan absen bisa dilihat langsung." />,
    <T key="t13" name="Dedi K."    role="Pemilik Toko"    text="Sangat membantu kami yang kesulitan mencari pegawai." />,
    <T key="t14" name="Bayu A."    role="Pekerja"         text="BinaHub mengerti kondisi kami dan mencarikan solusi terbaik." />,
    // Row 3 (7 items)
    <T key="t15" name="Rina W."    role="UMKM Kuliner"    text="Proses rekrutmen cepat dan tidak ribet sama sekali." />,
    <T key="t16" name="Iwan S."    role="Pekerja"         text="Ada komunitas yang saling mendukung satu sama lain." />,
    <T key="t17" name="Eko P."     role="UMKM Retail"     text="Pendampingan berkelanjutan adalah kunci kesuksesan platform ini." />,
    <T key="t18" name="Ahmad Z."   role="Pekerja"         text="Masa lalu bukan halangan berkat sistem matchmaking BinaHub." />,
    <T key="t19" name="Diana F."   role="UMKM Jasa"       text="Kami merasa aman mempekerjakan mereka karena ada pantauan." />,
    <T key="t20" name="Reza M."    role="Pekerja"         text="Mendapatkan kepercayaan lagi adalah hal yang luar biasa." />,
    <T key="t21" name="Wahyu N."   role="UMKM Kerajinan"  text="Pekerja yang dikirimkan selalu sesuai dengan spesifikasi kami." />,
    // Row 4 (7 items)
    <T key="t22" name="Surya D."   role="Pekerja"         text="Semoga platform ini bisa menjangkau lebih banyak teman-teman." />,
    <T key="t23" name="Nita K."    role="UMKM Batik"      text="Kami bangga bisa memberi kesempatan kerja yang bermartabat." />,
    <T key="t24" name="Andi P."    role="Pekerja"         text="Pelatihan dan bimbingan dari BinaHub sangat membantu karir saya." />,
    <T key="t25" name="Fitri L."   role="UMKM Catering"   text="Dashboard monitoring sangat memudahkan pengelolaan tim kami." />,
    <T key="t26" name="Joko S."    role="Pekerja"         text="Saya bisa membuktikan diri lewat kinerja nyata di sini." />,
    <T key="t27" name="Putri A."   role="UMKM Florist"    text="Sangat mudah menemukan kandidat yang cocok dengan usaha kami." />,
    <T key="t28" name="Haris M."   role="Pekerja"         text="BinaHub membantu saya membangun reputasi kerja yang baik." />,
    // Row 5 (7 items)
    <T key="t29" name="Dewi R."    role="UMKM Salon"      text="Sistem penilaian AI-nya akurat dan sangat membantu seleksi." />,
    <T key="t30" name="Fandi O."   role="Pekerja"         text="Akhirnya ada platform yang benar-benar peduli dengan kami." />,
    <T key="t31" name="Ratna S."   role="UMKM Percetakan" text="Rekrutmen jadi lebih efisien dan hasilnya memuaskan." />,
    <T key="t32" name="Bambang L." role="Pekerja"         text="Kesempatan kerja yang adil dan berkelanjutan ada di sini." />,
    <T key="t33" name="Sinta M."   role="UMKM Tekstil"    text="Kualitas pekerja dari BinaHub konsisten dan terpercaya." />,
    <T key="t34" name="Rudi K."    role="Pekerja"         text="Saya merasa dihargai dan didengar oleh platform ini." />,
    <T key="t35" name="Lia N."     role="UMKM Printing"   text="Fitur monitoring membuat manajemen tim jadi lebih mudah." />,
    // Row 6 (7 items)
    <T key="t36" name="Tono S."    role="Pekerja"         text="Dari nol kesempatan menjadi punya pekerjaan tetap berkat BinaHub." />,
    <T key="t37" name="Citra W."   role="UMKM Logistik"   text="Transparansi sistem membuat kami percaya penuh pada platform ini." />,
    <T key="t38" name="Bimo A."    role="Pekerja"         text="Pendampingan rutin membuat saya terus berkembang di pekerjaan." />,
    <T key="t39" name="Sari P."    role="UMKM Restoran"   text="Matching algorithm BinaHub sangat memahami kebutuhan bisnis kami." />,
    <T key="t40" name="Hari B."    role="Pekerja"         text="Saya bangga bisa berkontribusi nyata untuk UMKM lokal." />,
    <T key="t41" name="Mira D."    role="UMKM Kecantikan" text="Sistem daily check membuat komunikasi dengan tim lebih efektif." />,
    <T key="t42" name="Joni R."    role="Pekerja"         text="BinaHub adalah bukti nyata bahwa inklusivitas bisa menguntungkan semua." />,
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
