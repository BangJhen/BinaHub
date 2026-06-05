"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type RiskLevel = "green" | "yellow" | "red";

type AdminUmkmData = {
  id: string;
  name: string;
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

export default function AdminWorkerDetailPage() {
  const params = useParams<{ umkmId: string; workerId: string }>();
  const umkmId = params?.umkmId ?? "";
  const workerId = params?.workerId ?? "";
  const [data, setData] = useState<AdminUmkmData[]>([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setFetchError("");
      const res = await fetch("/api/dashboard/admin", { cache: "no-store" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        if (isMounted) setFetchError(payload.message ?? "Gagal memuat data worker.");
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
            <p className={styles.eyebrow}>Detail Pekerja</p>
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

  if (!umkmId || !workerId) {
    return null;
  }

  if (data.length === 0) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail Pekerja</p>
            <h1>Memuat data pekerja...</h1>
          </div>
          <Link href="/admin/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const umkm = data.find((item) => item.id === umkmId);
  const worker = umkm?.workers.find((item) => item.id === workerId);

  if (!umkm || !worker) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail Pekerja</p>
            <h1>Pekerja tidak ditemukan</h1>
            <p>Data pekerja yang dipilih tidak tersedia.</p>
          </div>
          <Link href="/admin/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const workerIssues = umkm.issues.filter((issue) => issue.workerId === worker.id);

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Detail Pekerja</p>
          <h1>{worker.name}</h1>
          <p>{worker.role} • UMKM: {umkm.name}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/admin/umkm/${umkm.id}`} className={styles.backLink}>
            Kembali ke UMKM
          </Link>
          <Link href="/admin/dashboard" className={styles.secondaryLink}>
            Dashboard
          </Link>
        </div>
      </section>

      <section className={styles.gridTop}>
        <article className={styles.card}>
          <h2>Snapshot Personal</h2>
          <div className={styles.stats}>
            <div><span>Kehadiran</span><strong>{worker.attendanceRate}%</strong></div>
            <div><span>Produktivitas</span><strong>{worker.productivityScore}</strong></div>
            <div><span>Check-in</span><strong>{worker.checkinConsistency}%</strong></div>
            <div><span>Kondisi Saat Ini</span><strong>{riskLabel(worker.latestCondition)}</strong></div>
          </div>
          <p className={styles.note}>{worker.mentorNote}</p>
        </article>

        <article className={styles.card}>
          <h2>Update Terakhir</h2>
          <div className={styles.metaList}>
            <div>
              <span>Mulai Bekerja</span>
              <strong>{worker.startDate}</strong>
            </div>
            <div>
              <span>Check-in Terakhir</span>
              <strong>{worker.latestCheckin}</strong>
            </div>
            <div>
              <span>Status Kondisi</span>
              <strong className={styles[`risk${worker.latestCondition}`]}>{riskLabel(worker.latestCondition)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.card}>
        <h2>Isu Terkini</h2>
        <ul className={styles.issueList}>
          {workerIssues.map((issue) => (
            <li key={issue.id}>
              <div className={styles.issueTop}>
                <strong>{issue.message}</strong>
                <span className={styles[`risk${issue.level}`]}>{riskLabel(issue.level)}</span>
              </div>
              <small>{issue.createdAt}</small>
            </li>
          ))}
          {workerIssues.length === 0 && <li className={styles.emptyState}>Belum ada isu untuk pekerja ini.</li>}
        </ul>
      </section>
    </main>
  );
}
