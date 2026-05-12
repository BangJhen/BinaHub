"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type WorkerItem = {
  id: string;
  name: string;
  role: string;
  attendanceRate: number;
  checkinConsistency: number;
  productivityScore: number;
  latestCondition: "green" | "yellow" | "red";
};

type UmkmDashboardData = {
  workers: WorkerItem[];
};

const openJobs = [
  "Staff Operasional Toko",
  "Kasir Shift Sore",
  "Admin Gudang",
  "Kurir UMKM"
] as const;

type OpenJob = (typeof openJobs)[number];

function computeJobFit(worker: WorkerItem, job: OpenJob) {
  const base =
    worker.attendanceRate * 0.4 +
    worker.checkinConsistency * 0.35 +
    worker.productivityScore * 0.25;

  let bonus = 0;
  const roleText = worker.role.toLowerCase();
  if (job === "Kasir Shift Sore" && roleText.includes("kasir")) bonus += 10;
  if (job === "Admin Gudang" && (roleText.includes("gudang") || roleText.includes("admin"))) bonus += 10;
  if (job === "Kurir UMKM" && roleText.includes("kurir")) bonus += 10;
  if (job === "Staff Operasional Toko" && roleText.includes("operasional")) bonus += 10;

  if (worker.latestCondition === "green") bonus += 4;
  if (worker.latestCondition === "red") bonus -= 6;

  return Math.max(0, Math.min(99, Math.round(base + bonus)));
}

export default function UmkmMatchingPage() {
  const [workers, setWorkers] = useState<WorkerItem[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [selectedJob, setSelectedJob] = useState<OpenJob>("Staff Operasional Toko");

  useEffect(() => {
    let isMounted = true;

    async function loadWorkers() {
      setFetchError("");
      const res = await fetch("/api/dashboard/umkm", { cache: "no-store" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        if (isMounted) setFetchError(payload.message ?? "Gagal memuat data pekerja.");
        return;
      }

      const payload = (await res.json()) as UmkmDashboardData;
      if (!isMounted) return;
      setWorkers(payload.workers ?? []);
    }

    loadWorkers();
    return () => {
      isMounted = false;
    };
  }, []);

  const rankedWorkers = useMemo(() => {
    return [...workers]
      .map((worker) => ({
        ...worker,
        score: computeJobFit(worker, selectedJob)
      }))
      .sort((a, b) => b.score - a.score);
  }, [selectedJob, workers]);

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <p className={styles.eyebrow}>Matching</p>
        <h1>Pencocokan Lowongan dengan Ex-Napi</h1>
        <p>Pilih lowongan lalu lihat ranking kandidat paling cocok berdasarkan kondisi kerja, konsistensi check-in, dan performa.</p>
      </section>

      <section className={styles.mainCard}>
        {fetchError && <p>{fetchError}</p>}
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
