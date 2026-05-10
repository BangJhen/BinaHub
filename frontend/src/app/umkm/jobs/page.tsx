"use client";

import { useState } from "react";
import styles from "./page.module.css";

const jobList = [
  { id: "J-201", title: "Staff Operasional Toko", location: "Bandung", status: "Aktif", matches: 4 },
  { id: "J-207", title: "Kasir Shift Sore", location: "Bandung", status: "Aktif", matches: 3 },
  { id: "J-210", title: "Kurir UMKM Area Kota", location: "Bandung", status: "Draft", matches: 2 }
];

export default function UmkmJobsPage() {
  const [created, setCreated] = useState(false);

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Lowongan UMKM</p>
          <h1>Kelola dan Buat Lowongan Baru</h1>
          <p>UMKM bisa membuat lowongan, lalu melihat kandidat ex-napi yang paling relevan untuk posisi tersebut.</p>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Buat Lowongan</h2>
          <div className={styles.formGrid}>
            <label>
              Judul Posisi
              <input placeholder="Contoh: Staff Operasional" />
            </label>
            <label>
              Lokasi
              <input placeholder="Bandung" />
            </label>
            <label>
              Tipe Kerja
              <select defaultValue="full-time">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="shift">Shift</option>
              </select>
            </label>
            <label>
              Rentang Gaji
              <input placeholder="2500000 - 3500000" />
            </label>
          </div>
          <button className={created ? styles.primaryDone : styles.primaryBtn} onClick={() => setCreated(true)}>
            {created ? "Lowongan Tersimpan" : "Simpan Lowongan"}
          </button>
        </article>

        <article className={styles.card}>
          <h2>Daftar Lowongan</h2>
          <ul className={styles.list}>
            {jobList.map((job) => (
              <li key={job.id}>
                <div>
                  <strong>{job.title}</strong>
                  <small>
                    {job.id} • {job.location}
                  </small>
                </div>
                <p>{job.status}</p>
                <span>{job.matches} kandidat cocok</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
