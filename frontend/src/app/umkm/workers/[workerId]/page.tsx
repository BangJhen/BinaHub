"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "./page.module.css";
import {
  alerts,
  checkinNotes,
  riskLabel,
  workers,
  workerConditionTrendByRange,
  type WorkerChartRange
} from "@/features/umkm/workers-data";

function dominantLevel(green: number, yellow: number, red: number) {
  if (red >= yellow && red >= green) return "red" as const;
  if (yellow >= green) return "yellow" as const;
  return "green" as const;
}

export default function WorkerDetailPage() {
  const params = useParams<{ workerId: string }>();
  const workerId = params?.workerId;

  if (!workerId) {
    return null;
  }

  const worker = workers.find((item) => item.id === workerId);

  if (!worker) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail Individu</p>
            <h1>Pekerja tidak ditemukan</h1>
            <p>Data pekerja yang dipilih tidak tersedia.</p>
          </div>
          <Link href="/umkm/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const [chartRange, setChartRange] = useState<WorkerChartRange>("1m");

  const workerAlerts = useMemo(() => {
    return alerts.filter((item) => item.workerId === worker.id);
  }, [worker.id]);

  const workerCheckins = useMemo(() => {
    return checkinNotes.filter((item) => item.workerId === worker.id);
  }, [worker.id]);

  const weeklyDailyChecks = workerConditionTrendByRange[worker.id]?.["1w"] ?? [];
  const todayCheck = weeklyDailyChecks[weeklyDailyChecks.length - 1];
  const stableDays = weeklyDailyChecks.filter((item) => dominantLevel(item.green, item.yellow, item.red) === "green").length;
  const attentionDays = weeklyDailyChecks.filter((item) => dominantLevel(item.green, item.yellow, item.red) !== "green").length;

  const trend = workerConditionTrendByRange[worker.id]?.[chartRange] ?? [];

  const conditionDistribution = trend.reduce(
    (acc, item) => {
      acc.green += item.green;
      acc.yellow += item.yellow;
      acc.red += item.red;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

  const total = conditionDistribution.green + conditionDistribution.yellow + conditionDistribution.red;
  const greenRatio = total ? (conditionDistribution.green / total) * 100 : 0;
  const yellowRatio = total ? (conditionDistribution.yellow / total) * 100 : 0;

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Detail Individu</p>
          <h1>{worker.name}</h1>
          <p>{worker.role} • Mulai bekerja: {worker.startDate}</p>
        </div>
        <Link href="/umkm/dashboard" className={styles.backLink}>
          Kembali ke Dashboard
        </Link>
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
          <div className={styles.rowHead}>
            <h2>Distribusi Kondisi</h2>
            <div className={styles.rangeSwitch}>
              {([
                { key: "1w", label: "Mingguan" },
                { key: "1m", label: "1 Bulan" },
                { key: "6m", label: "6 Bulan" },
                { key: "1y", label: "1 Tahun" }
              ] as const).map((option) => (
                <button
                  key={option.key}
                  className={chartRange === option.key ? styles.rangeBtnActive : styles.rangeBtn}
                  onClick={() => setChartRange(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.chartWrap}>
            <div
              className={styles.donut}
              style={{
                background: `conic-gradient(#16a34a 0% ${greenRatio}%, #f59e0b ${greenRatio}% ${greenRatio + yellowRatio}%, #dc2626 ${greenRatio + yellowRatio}% 100%)`
              }}
            >
              <div className={styles.donutCenter}><strong>{total}</strong><small>Total</small></div>
            </div>
            <ul className={styles.legendList}>
              <li><i className={styles.green} /> Stabil <strong>{conditionDistribution.green}</strong></li>
              <li><i className={styles.yellow} /> Atensi <strong>{conditionDistribution.yellow}</strong></li>
              <li><i className={styles.red} /> Tinggi <strong>{conditionDistribution.red}</strong></li>
            </ul>
          </div>
        </article>
      </section>

      <section className={styles.gridBottom}>
        <article className={styles.card}>
          <div className={styles.rowHead}>
            <h2>Daily Check Kondisi</h2>
            <span className={worker.hasCheckedInToday ? styles.todayBadge : styles.todayBadgeDanger}>
              {worker.hasCheckedInToday ? "Sudah check-in hari ini" : "Belum check-in hari ini"}
            </span>
          </div>

          {!worker.hasCheckedInToday && (
            <div className={styles.missedCheckAlert}>
              Pekerja belum melakukan daily check hari ini. Disarankan follow-up langsung untuk memastikan kondisi terkini.
            </div>
          )}

          {todayCheck && (
            <div className={styles.todaySummary}>
              <p>
                Kondisi hari ini: <strong>{riskLabel(dominantLevel(todayCheck.green, todayCheck.yellow, todayCheck.red))}</strong>
              </p>
              <small>
                Stabil {stableDays} hari • Perlu atensi {attentionDays} hari dalam 1 minggu terakhir
              </small>
            </div>
          )}

          <div className={styles.dailyGrid}>
            {weeklyDailyChecks.map((item) => {
              const level = dominantLevel(item.green, item.yellow, item.red);
              return (
                <div key={item.day} className={styles.dailyItem}>
                  <div className={styles.dailyTop}>
                    <span>{item.day}</span>
                    <i className={styles[level]} />
                  </div>
                  <p>{riskLabel(level)}</p>
                  <small>
                    G:{item.green} • Y:{item.yellow} • R:{item.red}
                  </small>
                </div>
              );
            })}
          </div>
        </article>

        <article className={styles.card}>
          <h2>Alert Terkini</h2>
          <ul className={styles.list}>
            {workerAlerts.map((item) => (
              <li key={item.id}>
                <p>{item.message}</p>
                <small>{riskLabel(item.level)} • {item.createdAt}</small>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <h2>Check-in Terkini</h2>
          <ul className={styles.list}>
            {workerCheckins.map((item) => (
              <li key={item.id}>
                <p>{item.summary}</p>
                <small>{item.mood} • {item.submittedAt}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
