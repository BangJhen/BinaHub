"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type RiskLevel = "green" | "yellow" | "red";
type TimeRange = "7d" | "30d";
type WorkerChartRange = "1w" | "1m" | "6m" | "1y";

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

type WorkerConditionPoint = {
  day: string;
  green: number;
  yellow: number;
  red: number;
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

const workerConditionTrendByRange: Record<WorkerChartRange, WorkerConditionPoint[]> = {
  "1w": [
    { day: "Sen", green: 17, yellow: 5, red: 2 },
    { day: "Sel", green: 18, yellow: 4, red: 2 },
    { day: "Rab", green: 18, yellow: 5, red: 1 },
    { day: "Kam", green: 19, yellow: 4, red: 1 },
    { day: "Jum", green: 20, yellow: 3, red: 1 },
    { day: "Sab", green: 19, yellow: 3, red: 1 },
    { day: "Min", green: 20, yellow: 2, red: 1 }
  ],
  "1m": [
    { day: "W1", green: 18, yellow: 6, red: 2 },
    { day: "W2", green: 19, yellow: 5, red: 2 },
    { day: "W3", green: 20, yellow: 5, red: 1 },
    { day: "W4", green: 21, yellow: 4, red: 1 }
  ],
  "6m": [
    { day: "Okt", green: 17, yellow: 7, red: 4 },
    { day: "Nov", green: 18, yellow: 7, red: 3 },
    { day: "Des", green: 19, yellow: 6, red: 3 },
    { day: "Jan", green: 20, yellow: 6, red: 3 },
    { day: "Feb", green: 21, yellow: 5, red: 2 },
    { day: "Mar", green: 22, yellow: 4, red: 2 }
  ],
  "1y": [
    { day: "Q1", green: 58, yellow: 17, red: 8 },
    { day: "Q2", green: 61, yellow: 16, red: 7 },
    { day: "Q3", green: 64, yellow: 14, red: 6 },
    { day: "Q4", green: 67, yellow: 13, red: 5 }
  ]
};

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
  const [workerChartRange, setWorkerChartRange] = useState<WorkerChartRange>("1m");

  const kpi = kpiByRange[range];
  const workerConditionTrend = workerConditionTrendByRange[workerChartRange];
  const filteredAlerts = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((item) => item.level === filter);
  }, [filter]);

  const conditionDistribution = useMemo(() => {
    return workerConditionTrend.reduce(
      (acc, item) => {
        acc.green += item.green;
        acc.yellow += item.yellow;
        acc.red += item.red;
        return acc;
      },
      { green: 0, yellow: 0, red: 0 }
    );
  }, [workerConditionTrend]);

  const totalCondition = conditionDistribution.green + conditionDistribution.yellow + conditionDistribution.red;
  const greenRatio = totalCondition ? (conditionDistribution.green / totalCondition) * 100 : 0;
  const yellowRatio = totalCondition ? (conditionDistribution.yellow / totalCondition) * 100 : 0;
  const redRatio = totalCondition ? (conditionDistribution.red / totalCondition) * 100 : 0;
  const workerConditionDonutStyle = {
    background: `conic-gradient(#16a34a 0% ${greenRatio}%, #f59e0b ${greenRatio}% ${greenRatio + yellowRatio}%, #dc2626 ${greenRatio + yellowRatio}% 100%)`
  };

  return (
    <main className={styles.dashboardRoot}>
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

      <section className={styles.workerChartGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Visualisasi Kondisi Pekerja</h2>
            <div className={styles.chartRangeSwitch}>
              {([
                { key: "1w", label: "Mingguan" },
                { key: "1m", label: "1 Bulan" },
                { key: "6m", label: "6 Bulan" },
                { key: "1y", label: "1 Tahun" }
              ] as const).map((option) => (
                <button
                  key={option.key}
                  className={workerChartRange === option.key ? styles.chartRangeButtonActive : styles.chartRangeButton}
                  onClick={() => setWorkerChartRange(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.chartLegend}>
            <span><i className={styles.legendGreen} /> Stabil</span>
            <span><i className={styles.legendYellow} /> Perlu Atensi</span>
            <span><i className={styles.legendRed} /> Risiko Tinggi</span>
          </div>

          <div className={styles.stackedChart}>
            {workerConditionTrend.map((item) => {
              const total = item.green + item.yellow + item.red;
              const greenWidth = (item.green / total) * 100;
              const yellowWidth = (item.yellow / total) * 100;
              const redWidth = (item.red / total) * 100;

              return (
                <div
                  key={item.day}
                  className={styles.chartRow}
                  data-tooltip={`Stabil ${item.green} • Atensi ${item.yellow} • Tinggi ${item.red}`}
                >
                  <p>{item.day}</p>
                  <div className={styles.chartBarTrack}>
                    <span className={styles.chartBarGreen} style={{ width: `${greenWidth}%` }} />
                    <span className={styles.chartBarYellow} style={{ width: `${yellowWidth}%` }} />
                    <span className={styles.chartBarRed} style={{ width: `${redWidth}%` }} />
                  </div>
                  <strong>{total}</strong>
                </div>
              );
            })}
          </div>
        </article>

        <article className={`${styles.panel} ${styles.equalHeightPanel} ${styles.distributionPanel}`}>
          <h2>Distribusi Kondisi Saat Ini</h2>
          <div className={styles.distributionWrap}>
            <div className={styles.donutChart} style={workerConditionDonutStyle}>
              <div className={styles.donutCenter}>
                <strong>{totalCondition}</strong>
                <small>Total</small>
              </div>
            </div>
            <ul className={styles.distributionList}>
              <li data-tooltip={`${Math.round(greenRatio)}% pekerja berada pada kondisi stabil`}>
                <span className={styles.legendGreen} />
                <p>Stabil</p>
                <strong>{conditionDistribution.green}</strong>
              </li>
              <li data-tooltip={`${Math.round(yellowRatio)}% pekerja perlu atensi tambahan`}>
                <span className={styles.legendYellow} />
                <p>Perlu Atensi</p>
                <strong>{conditionDistribution.yellow}</strong>
              </li>
              <li data-tooltip={`${Math.round(redRatio)}% pekerja masuk risiko tinggi`}>
                <span className={styles.legendRed} />
                <p>Risiko Tinggi</p>
                <strong>{conditionDistribution.red}</strong>
              </li>
            </ul>
          </div>
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
