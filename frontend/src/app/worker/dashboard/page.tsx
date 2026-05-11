"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";
import {
  workerProfile,
  dailyCheckins,
  monthlyDays,
  weeklyPerformanceByRange,
  umkmReviews,
  conditionLabel,
  performanceRecommendations,
  type PerfRange,
  type CheckinCondition,
} from "@/features/worker/worker-data";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </span>
  );
}

function ConditionDot({ condition }: { condition: CheckinCondition | "none" }) {
  const map: Record<string, string> = {
    green: styles.dotGreen,
    yellow: styles.dotYellow,
    red: styles.dotRed,
    missed: styles.dotMissed,
    none: styles.dotNone,
  };
  return <span className={`${styles.calDot} ${map[condition] ?? styles.dotNone}`} />;
}

function formatDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function WorkerDashboardPage() {
  const [perfRange, setPerfRange] = useState<PerfRange>("1m");
  const perfData = weeklyPerformanceByRange[perfRange];
  const maxScore = 100;

  const minDate = dailyCheckins[dailyCheckins.length - 1]?.date ?? "2025-04-28";
  const maxDate = dailyCheckins[0]?.date ?? "2025-05-11";
  const [startDate, setStartDate] = useState(minDate);

  const endDate = useMemo(() => {
    const d = new Date(startDate + "T00:00:00");
    d.setDate(d.getDate() + 13);
    return d.toISOString().split("T")[0];
  }, [startDate]);

  const filteredCheckins = useMemo(() => {
    return dailyCheckins.filter((c) => c.date >= startDate && c.date <= endDate);
  }, [startDate, endDate]);

  const checkinSummary = useMemo(() => {
    return {
      green: filteredCheckins.filter((c) => c.condition === "green").length,
      yellow: filteredCheckins.filter((c) => c.condition === "yellow").length,
      red: filteredCheckins.filter((c) => c.condition === "red").length,
      missed: filteredCheckins.filter((c) => c.condition === "missed").length,
    };
  }, [filteredCheckins]);

  const progressPct = Math.round((workerProfile.checkinThisMonth / workerProfile.checkinTarget) * 100);

  return (
    <main className={styles.dashboardRoot}>

      {/* Header */}
      <section className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <p className={styles.eyebrow}>Dashboard Pekerja</p>
          <h1>Selamat datang, {workerProfile.name.split(" ")[0]} 👋</h1>
          <p className={styles.subtext}>
            {workerProfile.position} · {workerProfile.umkm} · Bergabung {workerProfile.joinDate}
          </p>
        </div>
        <div className={styles.headerScoreBadge}>
          <span className={styles.scoreBig}>{workerProfile.performanceScore}</span>
          <span className={styles.scoreLabel}>Skor Performa</span>
          <span className={styles.scoreTrend}>↑ +5 dari bulan lalu</span>
        </div>
      </section>

      {/* KPI */}
      <section className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <p>Check-in Streak</p>
          <h3 className={styles.kpiHighlight}>{workerProfile.streakDays} hari</h3>
          <span>Berturut-turut tanpa absen</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Kehadiran</p>
          <h3 className={workerProfile.attendanceRate >= 90 ? styles.kpiGreen : styles.kpiYellow}>
            {workerProfile.attendanceRate}%
          </h3>
          <span>Bulan ini</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Rating UMKM</p>
          <h3 className={styles.kpiHighlight}>{workerProfile.avgRating} / 5</h3>
          <span>Rata-rata dari {umkmReviews.length} review</span>
        </article>
        <article className={styles.kpiCard}>
          <p>Target Check-in</p>
          <h3>{workerProfile.checkinThisMonth} / {workerProfile.checkinTarget}</h3>
          <div className={styles.miniProgressTrack}>
            <div className={styles.miniProgressBar} style={{ width: `${progressPct}%` }} />
          </div>
          <span>{progressPct}% dari target bulan ini</span>
        </article>
      </section>

      {/* Daily check history + monthly calendar */}
      <section className={styles.twoColGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Riwayat Daily Check</h2>
            <span className={styles.badge}>{filteredCheckins.length} entri</span>
          </div>
          <div className={styles.dateRangeRow}>
            <label>Dari</label>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              min="2025-01-01"
              max={maxDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label>s/d</label>
            <span className={styles.dateEndLabel}>{formatDateLabel(endDate)}</span>
          </div>
          <ul className={styles.checkinTimeline}>
            {filteredCheckins.length === 0 && (
              <li className={styles.emptyCheckin}>Tidak ada data check-in pada rentang tanggal ini.</li>
            )}
            {filteredCheckins.map((entry) => (
              <li key={entry.date} className={styles.timelineItem}>
                <div className={`${styles.timelineDot} ${styles[`dot_${entry.condition}`]}`} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTop}>
                    <strong>{entry.dayLabel}</strong>
                    <span className={`${styles.conditionTag} ${styles[`tag_${entry.condition}`]}`}>
                      {conditionLabel(entry.condition)}
                    </span>
                  </div>
                  {entry.condition !== "missed" && (
                    <>
                      <p>{entry.note}</p>
                      <small>Check-in {entry.time} · Mood: {entry.mood}</small>
                    </>
                  )}
                  {entry.condition === "missed" && (
                    <p className={styles.missedNote}>{entry.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </article>

        <div className={styles.rightStack}>
          {/* Monthly calendar */}
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Kalender Check-in Mei 2025</h2>
            </div>
            <div className={styles.calLegend}>
              <span><i className={styles.dotGreen} /> Stabil</span>
              <span><i className={styles.dotYellow} /> Perhatian</span>
              <span><i className={styles.dotRed} /> Kurang</span>
              <span><i className={styles.dotMissed} /> Absen</span>
            </div>
            <div className={styles.calGrid}>
              {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
                <span key={i} className={styles.calDayLabel}>{d}</span>
              ))}
              {/* offset: Mei 2025 starts on Thursday (index 4) */}
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {monthlyDays.map((day) => (
                <div key={day.date} className={styles.calCell}>
                  <span className={styles.calDate}>{day.date}</span>
                  <ConditionDot condition={day.condition} />
                </div>
              ))}
            </div>
          </article>

          {/* Check-in summary */}
          <article className={styles.panel}>
            <h2>Ringkasan {filteredCheckins.length} Hari</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={`${styles.sumDot} ${styles.dotGreen}`} />
                <p>Stabil</p>
                <strong>{checkinSummary.green}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span className={`${styles.sumDot} ${styles.dotYellow}`} />
                <p>Perhatian</p>
                <strong>{checkinSummary.yellow}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span className={`${styles.sumDot} ${styles.dotRed}`} />
                <p>Kurang</p>
                <strong>{checkinSummary.red}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span className={`${styles.sumDot} ${styles.dotMissed}`} />
                <p>Absen</p>
                <strong>{checkinSummary.missed}</strong>
              </div>
            </div>
          </article>

          {/* Recommendations */}
          <article className={styles.panel}>
            <h2>Rekomendasi Peningkatan</h2>
            <ul className={styles.recList}>
              {performanceRecommendations.map((rec) => (
                <li key={rec.title} className={styles.recItem}>
                  <span className={styles.recIcon}>{rec.icon}</span>
                  <div>
                    <strong>{rec.title}</strong>
                    <p>{rec.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* Weekly / monthly performance chart */}
      <section className={styles.panel} style={{ marginTop: 14 }}>
        <div className={styles.panelHeader}>
          <h2>Tren Performa</h2>
          <div className={styles.rangeSwitch}>
            {([
              { key: "1w", label: "Mingguan" },
              { key: "1m", label: "1 Bulan" },
              { key: "3m", label: "3 Bulan" },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                className={perfRange === opt.key ? styles.rangeButtonActive : styles.rangeButton}
                onClick={() => setPerfRange(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.perfChart}>
          {perfData.map((item) => (
            <div key={item.week} className={styles.perfBar}>
              <span className={styles.perfBarScoreLabel}>{item.score}</span>
              <div className={styles.perfBarTrack}>
                <div
                  className={styles.perfBarFill}
                  style={{ height: `${(item.score / maxScore) * 100}%` }}
                />
              </div>
              <span className={styles.perfBarLabel}>{item.week}</span>
            </div>
          ))}
        </div>
        <div className={styles.perfNote}>
          <span>Skor dihitung dari konsistensi check-in, kondisi harian, dan feedback UMKM.</span>
        </div>
      </section>

      {/* UMKM Reviews */}
      <section style={{ marginTop: 14 }}>
        <div className={styles.reviewsHeader}>
          <h2>Feedback dari UMKM</h2>
          <p>Review langsung dari Pak Budi untuk membantu perkembangan kamu.</p>
        </div>
        <div className={styles.reviewsList}>
          {umkmReviews.map((review) => (
            <article key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewTop}>
                <div>
                  <strong>{review.umkmName}</strong>
                  <p>{review.position} · {review.date}</p>
                </div>
                <div className={styles.reviewRatingBlock}>
                  <StarRating rating={review.rating} />
                  <span>{review.rating}.0 / 5</span>
                </div>
              </div>
              <blockquote className={styles.reviewQuote}>
                "{review.comment}"
              </blockquote>
              <div className={styles.aspectGrid}>
                {review.aspects.map((asp) => (
                  <div key={asp.label} className={styles.aspectItem}>
                    <div className={styles.aspectHead}>
                      <span>{asp.label}</span>
                      <strong>{asp.score}</strong>
                    </div>
                    <div className={styles.aspectTrack}>
                      <div
                        className={styles.aspectFill}
                        style={{
                          width: `${asp.score}%`,
                          background: asp.score >= 88 ? "#16a34a" : asp.score >= 75 ? "#f59e0b" : "#dc2626",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}
