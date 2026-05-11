"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./page.module.css";
import { adminUmkmData } from "@/features/admin/admin-umkm-data";
import { riskLabel } from "@/features/umkm/workers-data";

export default function AdminWorkerDetailPage() {
  const params = useParams<{ umkmId: string; workerId: string }>();
  const umkmId = params?.umkmId;
  const workerId = params?.workerId;

  if (!umkmId || !workerId) {
    return null;
  }

  const umkm = adminUmkmData.find((item) => item.id === umkmId);
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
