"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import { workers } from "@/features/umkm/workers-data";

const openJobs = [
  "Staff Operasional Toko",
  "Kasir Shift Sore",
  "Admin Gudang",
  "Kurir UMKM"
] as const;

type OpenJob = (typeof openJobs)[number];

const suitabilityByJob: Record<OpenJob, Record<string, number>> = {
  "Staff Operasional Toko": { "W-01": 92, "W-02": 81, "W-03": 68, "W-04": 84 },
  "Kasir Shift Sore": { "W-01": 79, "W-02": 95, "W-03": 62, "W-04": 76 },
  "Admin Gudang": { "W-01": 83, "W-02": 74, "W-03": 71, "W-04": 93 },
  "Kurir UMKM": { "W-01": 72, "W-02": 66, "W-03": 90, "W-04": 70 }
};

export default function UmkmMatchingPage() {
  const [selectedJob, setSelectedJob] = useState<OpenJob>("Staff Operasional Toko");

  const rankedWorkers = useMemo(() => {
    return [...workers]
      .map((worker) => ({
        ...worker,
        score: suitabilityByJob[selectedJob][worker.id] ?? 0
      }))
      .sort((a, b) => b.score - a.score);
  }, [selectedJob]);

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <p className={styles.eyebrow}>Matching</p>
        <h1>Pencocokan Lowongan dengan Ex-Napi</h1>
        <p>Pilih lowongan lalu lihat ranking kandidat paling cocok berdasarkan kondisi kerja, konsistensi check-in, dan performa.</p>
      </section>

      <section className={styles.mainCard}>
        <div className={styles.topRow}>
          <label>
            Posisi Lowongan
            <select value={selectedJob} onChange={(event) => setSelectedJob(event.target.value as OpenJob)}>
              {openJobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className={styles.rankList}>
          {rankedWorkers.map((worker, index) => (
            <li key={worker.id}>
              <div>
                <strong>
                  #{index + 1} {worker.name}
                </strong>
                <small>
                  {worker.role} • Kehadiran {worker.attendanceRate}% • Check-in {worker.checkinConsistency}%
                </small>
              </div>
              <span className={styles.scoreBadge}>{worker.score}% Match</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
