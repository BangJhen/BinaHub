export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">BinaHub Prototype</p>
        <h1>Platform Inklusif Penyalur Tenaga Kerja</h1>
        <p>
          Menghubungkan ex-narapidana dengan UMKM melalui proses rekrutmen terstruktur,
          monitoring check-in, dan mitigasi risiko berbasis AI.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Untuk UMKM</h2>
          <p>Publikasikan lowongan, pantau status pekerja, dan terima alert risiko real-time.</p>
        </article>
        <article className="card">
          <h2>Untuk Pekerja</h2>
          <p>Buat profil, lamar pekerjaan, dan isi check-in harian secara aman dan humanis.</p>
        </article>
        <article className="card">
          <h2>Untuk Admin</h2>
          <p>Kelola ekosistem, verifikasi akun, dan evaluasi data risiko secara menyeluruh.</p>
        </article>
      </section>
    </main>
  );
}
