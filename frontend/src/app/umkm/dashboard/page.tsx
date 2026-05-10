"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type RiskLevel = "green" | "yellow" | "red";
type TimeRange = "7d" | "30d";

type KpiSnapshot = {
  activeWorkers: number;
  openJobs: number;
  avgCheckinRate: number;
  riskAlerts: number;
};

type JobRow = {
  id: string;
  title: string;
  applicants: number;
  filled: number;
  target: number;
  status: "Open" | "Closing Soon";
};

type RiskAlert = {
  id: string;
  workerName: string;
  role: string;
  level: RiskLevel;
  message: string;
  createdAt: string;
};

type CandidateFunnel = {
  label: string;
  count: number;
  color: string;
};

const kpiByRange: Record<TimeRange, KpiSnapshot> = {
  "7d": {
    activeWorkers: 24,
    openJobs: 6,
    avgCheckinRate: 91,
    riskAlerts: 5
  },
  "30d": {
    activeWorkers: 31,
    openJobs: 9,
    avgCheckinRate: 88,
    riskAlerts: 14
  }
};

const jobs: JobRow[] = [
  { id: "J-201", title: "Staff Operasional Toko", applicants: 18, filled: 3, target: 4, status: "Open" },
  { id: "J-204", title: "Admin Gudang", applicants: 11, filled: 2, target: 2, status: "Open" },
  { id: "J-207", title: "Kasir Shift Sore", applicants: 9, filled: 1, target: 2, status: "Closing Soon" },
  { id: "J-210", title: "Kurir UMKM Area Kota", applicants: 22, filled: 4, target: 6, status: "Open" }
];

const alerts: RiskAlert[] = [
  {
    id: "A-7841",
    workerName: "Rizky Pratama",
    role: "Staff Operasional",
    level: "yellow",
    message: "Check-in menunjukkan kecemasan ringan selama 2 hari berturut-turut.",
    createdAt: "14 menit lalu"
  },
  {
    id: "A-7840",
    workerName: "Andri Saputra",
    role: "Kurir",
    level: "red",
    message: "Tidak melakukan check-in 2 hari dan performa menurun di shift terakhir.",
    createdAt: "35 menit lalu"
  },
  {
    id: "A-7839",
    workerName: "Siti Rahma",
    role: "Kasir",
    level: "green",
    message: "Kondisi stabil, rekomendasi monitoring rutin mingguan.",
    createdAt: "1 jam lalu"
  },
  {
    id: "A-7838",
    workerName: "Dimas Arya",
    role: "Admin Gudang",
    level: "yellow",
    message: "Nada komunikasi check-in menandakan tekanan kerja meningkat.",
    createdAt: "2 jam lalu"
  }
];

const funnel: CandidateFunnel[] = [
  { label: "Applied", count: 63, color: "#1d4ed8" },
  { label: "Screening", count: 34, color: "#0f766e" },
  { label: "Interview", count: 17, color: "#7c3aed" },
  { label: "Placed", count: 10, color: "#15803d" }
];

const activities = [
  "Lowongan Kurir UMKM mendapat 6 pelamar baru.",
  "2 kandidat lolos screening untuk posisi Kasir Shift Sore.",
  "Sistem mengirim 1 alert risiko merah ke supervisor.",
  "Tingkat check-in harian naik dari 86% ke 91%."
];

function riskLabel(level: RiskLevel) {
  if (level === "red") return "Risiko Tinggi";
  if (level === "yellow") return "Perlu Atensi";
  return "Stabil";
}

function checkinRateClass(rate: number) {
  if (rate >= 90) return styles.checkinHigh;
  if (rate >= 75) return styles.checkinMedium;
  return styles.checkinLow;
}

export default function UmkmDashboardPage() {
  const [range, setRange] = useState<TimeRange>("7d");
  const [filter, setFilter] = useState<RiskLevel | "all">("all");

  const kpi = kpiByRange[range];
  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((item) => item.level === filter);
  }, [filter]);

  return (
    <main className={styles.dashboardRoot}>
      <div className={styles.gradientGlow} />
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>UMKM Dashboard</p>
          <h1>Monitoring Pekerja & Rekrutmen BinaHub</h1>
          <p className={styles.subtext}>
            Pantau progres lowongan, kesehatan operasional tim, dan notifikasi risiko secara terpusat.
          </p>
        </div>
        <div className={styles.rangeSwitch}>
          <button
            className={range === "7d" ? styles.rangeButtonActive : styles.rangeButton}
            onClick={() => setRange("7d")}
          >
            7 Hari
          </button>
          <button
            className={range === "30d" ? styles.rangeButtonActive : styles.rangeButton}
            onClick={() => setRange("30d")}
          >
            30 Hari
          </button>
        </div>
      </section>

      <section className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <p>Pekerja Aktif</p>
          <h3>{kpi.activeWorkers}</h3>
          <span>+4 dari periode sebelumnya</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Lowongan Aktif</p>
          <h3>{kpi.openJobs}</h3>
          <span>2 posisi hampir terpenuhi</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Check-in Rate</p>
          <h3 className={checkinRateClass(kpi.avgCheckinRate)}>{kpi.avgCheckinRate}%</h3>
          <span>Kepatuhan check-in harian</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Alert Risiko</p>
          <h3>{kpi.riskAlerts}</h3>
          <span>Butuh tindak lanjut supervisor</span>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Lowongan Aktif</h2>
            <button className={styles.linkButton}>+ Tambah Lowongan</button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Posisi</th>
                  <th>Pelamar</th>
                  <th>Terisi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <strong>{job.title}</strong>
                      <small>{job.id}</small>
                    </td>
                    <td>{job.applicants}</td>
                    <td>
                      {job.filled}/{job.target}
                    </td>
                    <td>
                      <span className={job.status === "Open" ? styles.badgeOpen : styles.badgeWarn}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${styles.panel} ${styles.equalHeightPanel}`}>
          <div className={styles.panelHeader}>
            <h2>Alert Risiko</h2>
            <div className={styles.filterRow}>
              {(["all", "green", "yellow", "red"] as const).map((item) => (
                <button
                  key={item}
                  className={filter === item ? styles.filterActive : styles.filterButton}
                  onClick={() => setFilter(item)}
                >
                  {item === "all" ? "Semua" : item}
                </button>
              ))}
            </div>
          </div>
          <ul className={styles.alertList}>
            {filteredAlerts.map((alert) => (
              <li key={alert.id} className={styles.alertItem}>
                <div className={styles.alertTop}>
                  <strong>{alert.workerName}</strong>
                  <span className={styles[`risk${alert.level}`]}>{riskLabel(alert.level)}</span>
                </div>
                <p>{alert.message}</p>
                <small>
                  {alert.role} • {alert.createdAt}
                </small>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <h2>Funnel Rekrutmen</h2>
          <div className={styles.funnelList}>
            {funnel.map((step) => (
              <div key={step.label} className={styles.funnelItem}>
                <div className={styles.funnelHead}>
                  <span>{step.label}</span>
                  <strong>{step.count}</strong>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressBar} style={{ width: `${(step.count / 63) * 100}%`, background: step.color }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.panel} ${styles.equalHeightPanel}`}>
          <h2>Aktivitas Hari Ini</h2>
          <ul className={styles.activityList}>
            {activities.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
