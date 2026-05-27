import Link from "next/link";
import styles from "./hero-section.module.css";
import GridMotion from "./GridMotion";

const TestimonialCard = ({ role, text, name }: { role: string, text: string, name: string }) => (
  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'center', textAlign: 'left' }}>
    <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#0b4f6e', margin: 0, lineHeight: 1.4 }}>"{text}"</p>
    <div style={{ marginTop: 'auto' }}>
      <strong style={{ fontSize: '12px', color: '#0369a1' }}>{name}</strong>
      <span style={{ fontSize: '11px', color: '#49657a', display: 'block' }}>{role}</span>
    </div>
  </div>
);

export function HeroSection() {
  const gridItems = [
    <TestimonialCard key="t1" name="Budi S." role="Pemilik UMKM Kopi" text="Platform ini memudahkan saya mencari pekerja jujur yang siap kerja." />,
    <TestimonialCard key="t2" name="Agus T." role="Pekerja Ex-Napi" text="BinaHub memberi saya kesempatan kedua yang sangat berharga." />,
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t3" name="Siti R." role="Pemilik Warung" text="Fitur daily check membantu saya memantau kinerja harian mereka." />,
    <TestimonialCard key="t4" name="Rizky M." role="Pekerja Ex-Napi" text="Proses matching-nya sangat akurat dengan keahlian bengkel saya." />,
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t5" name="Hendra P." role="UMKM Konveksi" text="Pekerja dari BinaHub rajin dan selalu mendapat pendampingan." />,
    <TestimonialCard key="t6" name="Doni W." role="Pekerja Ex-Napi" text="Saya bisa bekerja tenang karena ada dukungan mentor tiap minggu." />,
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t7" name="Lina A." role="UMKM Katering" text="Skoring AI membuat saya tidak ragu lagi merekrut mereka." />,
    <TestimonialCard key="t8" name="Yanto K." role="Pekerja Ex-Napi" text="Aplikasi ini mudah digunakan dan lowongannya selalu update." />,
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t9" name="Toni B." role="Pemilik Bengkel" text="Ekosistem inklusif ini benar-benar membawa dampak sosial positif." />,
    <TestimonialCard key="t10" name="Fajar H." role="Pekerja Ex-Napi" text="Terima kasih BinaHub, hidup saya sekarang jauh lebih terarah." />,
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t11" name="Maya S." role="UMKM Laundry" text="Mitigasi risikonya terukur, saya sangat merekomendasikan ini." />,
    <TestimonialCard key="t12" name="Bagas R." role="Pekerja Ex-Napi" text="Sistemnya transparan, gaji dan absen bisa dilihat langsung." />,
    'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t13" name="Dedi K." role="Pemilik Toko" text="Sangat membantu kami yang kesulitan mencari pegawai." />,
    <TestimonialCard key="t14" name="Bayu A." role="Pekerja Ex-Napi" text="BinaHub mengerti kondisi kami dan mencarikan solusi terbaik." />,
    <TestimonialCard key="t15" name="Rina W." role="UMKM Kuliner" text="Proses rekrutmen cepat dan tidak ribet sama sekali." />,
    <TestimonialCard key="t16" name="Iwan S." role="Pekerja Ex-Napi" text="Ada komunitas yang saling mendukung satu sama lain." />,
    <TestimonialCard key="t17" name="Eko P." role="UMKM Retail" text="Pendampingan berkelanjutan adalah kunci kesuksesan platform ini." />,
    <TestimonialCard key="t18" name="Ahmad Z." role="Pekerja Ex-Napi" text="Masa lalu bukan halangan berkat sistem matchmaking BinaHub." />,
    <TestimonialCard key="t19" name="Diana F." role="UMKM Jasa" text="Kami merasa aman mempekerjakan mereka karena ada pantauan." />,
    <TestimonialCard key="t20" name="Reza M." role="Pekerja Ex-Napi" text="Mendapatkan kepercayaan lagi adalah hal yang luar biasa." />,
    <TestimonialCard key="t21" name="Wahyu N." role="UMKM Kerajinan" text="Pekerja yang dikirimkan selalu sesuai dengan spesifikasi kami." />,
    <TestimonialCard key="t22" name="Surya D." role="Pekerja Ex-Napi" text="Semoga platform ini bisa menjangkau lebih banyak teman-teman." />,
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t23" name="Samsul A." role="UMKM Distribusi" text="Fitur absensi membuat kami bisa melacak produktivitas dengan mudah." />,
    <TestimonialCard key="t24" name="Dina M." role="Pekerja Ex-Napi" text="Sistem BinaHub membantu saya beradaptasi cepat dengan tim baru." />,
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2000&auto=format&fit=crop',
    <TestimonialCard key="t25" name="Lukman B." role="Pemilik Konveksi" text="Kami merasa didukung penuh dari hari pertama proses rekrutmen." />
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
      </div>
      
      {/* Moved outside heroContent to avoid being constrained by grid columns */}
      <div className={styles.artContainer}>
        <GridMotion items={gridItems} />
      </div>
    </section>
  );
}
