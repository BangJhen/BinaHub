"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type RiskLevel = "green" | "yellow" | "red";
type TimeRange = "7d" | "30d";
type WorkerChartRange = "1w" | "1m" | "6m" | "1y";

type UmkmDashboardData = {
  kpiByRange: Record<TimeRange, { activeWorkers: number; avgCheckinRate: number; needAttention: number; mentoringSessions: number }>;
  workers: Array<{
    id: string;
    name: string;
    role: string;
    attendanceRate: number;
    latestCheckin: string;
    latestCondition: RiskLevel;
  }>;
  alerts: Array<{
    id: string;
    workerId: string;
    workerName: string;
    role: string;
    level: RiskLevel;
    message: string;
    createdAt: string;
  }>;
  workerConditionTrendByRange: Record<string, Record<WorkerChartRange, Array<{ day: string; green: number; yellow: number; red: number }>>>;
  activities: string[];
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
  const [data, setData] = useState<UmkmDashboardData | null>(null);
  const [fetchError, setFetchError] = useState("");

  const [range, setRange] = useState<TimeRange>("7d");
  const [filter, setFilter] = useState<"all" | "green" | "yellow" | "red">("all");
  const [workerChartRange, setWorkerChartRange] = useState<WorkerChartRange>("1m");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setFetchError("");
      const res = await fetch("/api/dashboard/umkm", { cache: "no-store" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        if (isMounted) setFetchError(payload.message ?? "Gagal memuat data dashboard UMKM.");
        return;
      }

      const payload = (await res.json()) as UmkmDashboardData;
      if (!isMounted) return;
      setData(payload);
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (fetchError) {
    return (
      <main className={styles.dashboardRoot}>
        <section className={styles.panel}>
          <h2>Gagal memuat data</h2>
          <p>{fetchError}</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.dashboardRoot}>
        <section className={styles.panel}>
          <h2>Memuat dashboard UMKM...</h2>
        </section>
      </main>
    );
  }

  const { activities, alerts, kpiByRange, workers, workerConditionTrendByRange } = data;
  const defaultWorker = workers[0];

  if (!defaultWorker) {
    return (
      <main className={styles.dashboardRoot}>
        <section className={styles.panel}>
          <h2>Belum ada data pekerja aktif</h2>
        </section>
      </main>
    );
  }

  const kpi = kpiByRange[range];
  const labels = workerConditionTrendByRange[defaultWorker.id]?.[workerChartRange] ?? [];
  const workerConditionTrend = labels.map((basePoint, index) => {
    return workers.reduce(
      (acc, worker) => {
        const point = workerConditionTrendByRange[worker.id]?.[workerChartRange]?.[index];
        if (!point) {
          return acc;
        }
        acc.green += point.green;
        acc.yellow += point.yellow;
        acc.red += point.red;
        return acc;
      },
      { day: basePoint.day, green: 0, yellow: 0, red: 0 }
    );
  });

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((item) => item.level === filter);

  const conditionDistribution = workerConditionTrend.reduce(
    (acc, item) => {
      acc.green += item.green;
      acc.yellow += item.yellow;
      acc.red += item.red;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

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
          <h1>Monitoring Pekerja Aktif UMKM</h1>
          <p className={styles.subtext}>
            Flow awal menampilkan ringkasan keseluruhan. Klik pekerja untuk membuka halaman detail individu yang lebih personal.
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
          <span>Seluruh pekerja sudah aktif bekerja</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Perlu Atensi</p>
          <h3>{kpi.needAttention}</h3>
          <span>Pekerja kondisi kuning/merah</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Check-in Rate</p>
          <h3 className={checkinRateClass(kpi.avgCheckinRate)}>{kpi.avgCheckinRate}%</h3>
          <span>Konsistensi check-in pekerja aktif</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Sesi Pendampingan</p>
          <h3>{kpi.mentoringSessions}</h3>
          <span>Total sesi dalam periode ini</span>
        </article>
      </section>

      <section className={`${styles.contentGrid} ${styles.singlePaneGrid}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Daftar Pekerja Aktif</h2>
            <span className={styles.profileBadge}>Klik untuk detail</span>
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
                {workers.map((worker) => (
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
                      <Link className={styles.tableActionLink} href={`/umkm/workers/${worker.id}`}>
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className={`${styles.contentGrid} ${styles.singlePaneGrid}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Alert Risiko Seluruh Pekerja</h2>
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
            {filteredAlerts.length === 0 && <li className={styles.emptyState}>Tidak ada alert untuk filter ini.</li>}
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
              const safeTotal = total || 1;
              const greenWidth = (item.green / safeTotal) * 100;
              const yellowWidth = (item.yellow / safeTotal) * 100;
              const redWidth = (item.red / safeTotal) * 100;

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
          <h2>Rencana Tindak Lanjut Individu</h2>
          <div className={styles.funnelList}>
            <div className={styles.funnelItem}>
              <div className={styles.funnelHead}>
                <span>Coaching Mingguan</span>
                <strong>75%</strong>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: "75%", background: "#0f766e" }} />
              </div>
            </div>
            <div className={styles.funnelItem}>
              <div className={styles.funnelHead}>
                <span>Stabilisasi Check-in</span>
                <strong>68%</strong>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: "68%", background: "#1d4ed8" }} />
              </div>
            </div>
            <div className={styles.funnelItem}>
              <div className={styles.funnelHead}>
                <span>Kemandirian Kerja</span>
                <strong>81%</strong>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: "81%", background: "#15803d" }} />
              </div>
            </div>
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
