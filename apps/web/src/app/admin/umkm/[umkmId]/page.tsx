"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type RiskLevel = "green" | "yellow" | "red";

type AdminUmkmData = {
  id: string;
  name: string;
  category: string;
  location: string;
  owner: string;
  lastUpdate: string;
  notes: string;
  workers: Array<{
    id: string;
    name: string;
    role: string;
    startDate: string;
    attendanceRate: number;
    productivityScore: number;
    checkinConsistency: number;
    latestCheckin: string;
    latestCondition: RiskLevel;
    mentorNote: string;
  }>;
  issues: Array<{
    id: string;
    workerId: string;
    workerName: string;
    level: RiskLevel;
    message: string;
    createdAt: string;
  }>;
};

function riskLabel(level: RiskLevel) {
  if (level === "red") return "Risiko Tinggi";
  if (level === "yellow") return "Perlu Atensi";
  return "Stabil";
}

function summarizeRisk(workers: { latestCondition: RiskLevel }[]) {
  return workers.reduce(
    (acc, worker) => {
      acc[worker.latestCondition] += 1;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );
}

function dominantRisk(summary: { green: number; yellow: number; red: number }) {
  if (summary.red >= summary.yellow && summary.red >= summary.green) return "red" as const;
  if (summary.yellow >= summary.green) return "yellow" as const;
  return "green" as const;
}

export default function AdminUmkmDetailPage() {
  const params = useParams<{ umkmId: string }>();
  const umkmId = params?.umkmId ?? "";
  const [data, setData] = useState<AdminUmkmData[]>([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setFetchError("");
      const res = await fetch("/api/dashboard/admin", { cache: "no-store" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        if (isMounted) setFetchError(payload.message ?? "Gagal memuat data UMKM.");
        return;
      }

      const payload = (await res.json()) as { adminUmkmData: AdminUmkmData[] };
      if (!isMounted) return;
      setData(payload.adminUmkmData ?? []);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (fetchError) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail UMKM</p>
            <h1>Gagal memuat data</h1>
            <p>{fetchError}</p>
          </div>
          <Link href="/admin/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (!umkmId) {
    return null;
  }

  if (data.length === 0) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail UMKM</p>
            <h1>Memuat data UMKM...</h1>
          </div>
          <Link href="/admin/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const umkm = data.find((item) => item.id === umkmId);

  if (!umkm) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail UMKM</p>
            <h1>UMKM tidak ditemukan</h1>
            <p>Data UMKM yang dipilih tidak tersedia.</p>
          </div>
          <Link href="/admin/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const summary = summarizeRisk(umkm.workers);
  const dominant = dominantRisk(summary);
  const attentionCount = summary.yellow + summary.red;
  const avgCheckin = Math.round(
    umkm.workers.reduce((acc, worker) => acc + worker.checkinConsistency, 0) / umkm.workers.length
  );

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Detail UMKM</p>
          <h1>{umkm.name}</h1>
          <p>{umkm.category} • {umkm.location} • PIC: {umkm.owner}</p>
        </div>
        <Link href="/admin/dashboard" className={styles.backLink}>
          Kembali ke Dashboard
        </Link>
      </section>

      <section className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <p>Pekerja Aktif</p>
          <h3>{umkm.workers.length}</h3>
          <span>Aktif dan sedang dipantau</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Rata-rata Check-in</p>
          <h3>{avgCheckin}%</h3>
          <span>Konsistensi harian pekerja</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Perlu Atensi</p>
          <h3>{attentionCount}</h3>
          <span>Yellow atau red</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Status UMKM</p>
          <h3 className={styles[`risk${dominant}`]}>{riskLabel(dominant)}</h3>
          <span>Update: {umkm.lastUpdate}</span>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Daftar Pekerja</h2>
            <span className={styles.helperBadge}>Klik detail pekerja</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Posisi</th>
                  <th>Kehadiran</th>
                  <th>Kondisi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {umkm.workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <strong>{worker.name}</strong>
                      <small>{worker.latestCheckin}</small>
                    </td>
                    <td>{worker.role}</td>
                    <td>{worker.attendanceRate}%</td>
                    <td>
                      <span className={styles[`risk${worker.latestCondition}`]}>
                        {riskLabel(worker.latestCondition)}
                      </span>
                    </td>
                    <td>
                      <Link
                        className={styles.tableActionLink}
                        href={`/admin/umkm/${umkm.id}/workers/${worker.id}`}
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Catatan Monitoring</h2>
            <span className={styles.helperBadge}>Ringkasan kendala</span>
          </div>
          <p className={styles.noteText}>{umkm.notes}</p>
          <ul className={styles.issueList}>
            {umkm.issues.map((issue) => (
              <li key={issue.id}>
                <div className={styles.issueTop}>
                  <strong>{issue.workerName}</strong>
                  <span className={styles[`risk${issue.level}`]}>{riskLabel(issue.level)}</span>
                </div>
                <p>{issue.message}</p>
                <small>{issue.createdAt}</small>
              </li>
            ))}
            {umkm.issues.length === 0 && <li className={styles.emptyState}>Belum ada kendala yang tercatat.</li>}
          </ul>
        </article>
      </section>
    </main>
  );
}
