"use client";

import Link from "next/link";
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
    latestCondition: RiskLevel;
  }>;
  issues: Array<{
    id: string;
    level: RiskLevel;
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminUmkmData[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setFetchError("");
      setLoading(true);
      const res = await fetch("/api/dashboard/admin", { cache: "no-store" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        if (isMounted) {
          setFetchError(payload.message ?? "Gagal memuat data dashboard admin.");
          setLoading(false);
        }
        return;
      }

      const payload = (await res.json()) as { adminUmkmData: AdminUmkmData[] };
      if (!isMounted) return;
      setData(payload.adminUmkmData ?? []);
      setLoading(false);
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

  if (loading) {
    return (
      <main className={styles.dashboardRoot}>
        <section className={styles.panel}>
          <h2>Memuat dashboard admin...</h2>
        </section>
      </main>
    );
  }

  const adminUmkmData = data;

  const totalUmkm = adminUmkmData.length;
  const totalWorkers = adminUmkmData.reduce((acc, umkm) => acc + umkm.workers.length, 0);
  const umkmNeedsAttention = adminUmkmData.filter((umkm) => {
    const summary = summarizeRisk(umkm.workers);
    return summary.red > 0 || summary.yellow > 0;
  }).length;
  const totalIssues = adminUmkmData.reduce((acc, umkm) => acc + umkm.issues.length, 0);

  const overallSummary = adminUmkmData.reduce(
    (acc, umkm) => {
      const summary = summarizeRisk(umkm.workers);
      acc.green += summary.green;
      acc.yellow += summary.yellow;
      acc.red += summary.red;
      return acc;
    },
    { green: 0, yellow: 0, red: 0 }
  );

  const totalConditions = overallSummary.green + overallSummary.yellow + overallSummary.red;
  const greenRatio = totalConditions ? (overallSummary.green / totalConditions) * 100 : 0;
  const yellowRatio = totalConditions ? (overallSummary.yellow / totalConditions) * 100 : 0;
  const donutStyle = {
    background: `conic-gradient(#16a34a 0% ${greenRatio}%, #f59e0b ${greenRatio}% ${greenRatio + yellowRatio}%, #dc2626 ${greenRatio + yellowRatio}% 100%)`
  };

  const issueChartData = adminUmkmData.map((umkm) => ({
    id: umkm.id,
    name: umkm.name,
    totalIssues: umkm.issues.length,
    redIssues: umkm.issues.filter((issue) => issue.level === "red").length,
    yellowIssues: umkm.issues.filter((issue) => issue.level === "yellow").length
  }));

  const maxIssueCount = Math.max(1, ...issueChartData.map((item) => item.totalIssues));

  const query = searchTerm.trim().toLowerCase();
  const filteredUmkm = adminUmkmData.filter((umkm) => {
    const summary = summarizeRisk(umkm.workers);

    const matchesRisk = (() => {
      if (riskFilter === "all") return true;
      if (riskFilter === "green") return summary.green > 0 && summary.yellow === 0 && summary.red === 0;
      if (riskFilter === "yellow") return summary.yellow > 0;
      return summary.red > 0;
    })();

    if (!matchesRisk) return false;
    if (!query) return true;

    return [umkm.name, umkm.owner, umkm.location, umkm.category]
      .some((value) => value.toLowerCase().includes(query));
  });

  const attentionList = filteredUmkm.filter((umkm) => {
    const summary = summarizeRisk(umkm.workers);
    return summary.red > 0 || summary.yellow > 0;
  });

  return (
    <main className={styles.dashboardRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Admin Dashboard</p>
          <h1>Monitoring Seluruh UMKM</h1>
          <p className={styles.subtext}>
            Admin memantau kondisi UMKM dan pekerja ex-napi untuk memastikan dukungan berjalan konsisten.
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span>Update terbaru</span>
          <strong>{totalIssues || 0}</strong>
          <small>Isu terbuka</small>
        </div>
      </section>

      <section className={styles.kpiGrid}>
        <article className={`${styles.kpiCard} ${styles.kpiPrimary}`}>
          <p>UMKM Aktif</p>
          <h3>{totalUmkm}</h3>
          <span>Terdaftar dan aktif monitoring</span>
        </article>
        <article className={`${styles.kpiCard} ${styles.kpiInfo}`}>
          <p>Total Pekerja</p>
          <h3>{totalWorkers}</h3>
          <span>Seluruh pekerja aktif di UMKM</span>
        </article>
        <article className={`${styles.kpiCard} ${styles.kpiWarning}`}>
          <p>UMKM Perlu Atensi</p>
          <h3>{umkmNeedsAttention}</h3>
          <span>Kondisi kuning atau merah</span>
        </article>
        <article className={`${styles.kpiCard} ${styles.kpiDanger}`}>
          <p>Isu Terbuka</p>
          <h3>{totalIssues}</h3>
          <span>Butuh tindak lanjut pendampingan</span>
        </article>
      </section>

      <section className={styles.chartGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Distribusi Kondisi Pekerja</h2>
            <span className={styles.helperBadge}>Total {totalConditions} pekerja</span>
          </div>
          <div className={styles.chartWrap}>
            <div
              className={styles.donutChart}
              style={donutStyle}
              data-tooltip={`Stabil ${overallSummary.green} • Atensi ${overallSummary.yellow} • Risiko ${overallSummary.red}`}
            >
              <div className={styles.donutCenter}>
                <strong>{totalConditions}</strong>
                <small>Total</small>
              </div>
            </div>
            <ul className={styles.distributionList}>
              <li>
                <span className={styles.legendGreen} />
                <p>Stabil</p>
                <strong>{overallSummary.green}</strong>
              </li>
              <li>
                <span className={styles.legendYellow} />
                <p>Perlu Atensi</p>
                <strong>{overallSummary.yellow}</strong>
              </li>
              <li>
                <span className={styles.legendRed} />
                <p>Risiko Tinggi</p>
                <strong>{overallSummary.red}</strong>
              </li>
            </ul>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Isu Terbuka per UMKM</h2>
            <span className={styles.helperBadge}>Prioritas tindak lanjut</span>
          </div>
          <div className={styles.issueChart}>
            {issueChartData.map((item) => {
              const tooltipLabel = `Red ${item.redIssues} • Yellow ${item.yellowIssues} • Total ${item.totalIssues}`;

              return (
                <div key={item.id} className={styles.issueRow}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.totalIssues} isu</small>
                  </div>
                  <div className={styles.issueTrack} data-tooltip={tooltipLabel}>
                    <span className={styles.issueBarRed} style={{ width: `${(item.redIssues / maxIssueCount) * 100}%` }} />
                    <span className={styles.issueBarYellow} style={{ width: `${(item.yellowIssues / maxIssueCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Daftar UMKM</h2>
            <span className={styles.helperBadge}>Klik detail UMKM</span>
          </div>
          <div className={styles.tableTools}>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Cari UMKM, owner, lokasi..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <div className={styles.filterRow}>
              {(["all", "green", "yellow", "red"] as const).map((item) => (
                <button
                  key={item}
                  className={riskFilter === item ? styles.filterActive : styles.filterButton}
                  onClick={() => setRiskFilter(item)}
                >
                  {item === "all" ? "Semua" : item}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>UMKM</th>
                  <th>Lokasi</th>
                  <th>Pekerja</th>
                  <th>Kondisi</th>
                  <th>Update</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUmkm.map((umkm) => {
                  const summary = summarizeRisk(umkm.workers);
                  const dominant = dominantRisk(summary);

                  return (
                    <tr key={umkm.id}>
                      <td>
                        <strong>{umkm.name}</strong>
                        <small>{umkm.category} • {umkm.owner}</small>
                      </td>
                      <td>{umkm.location}</td>
                      <td>{umkm.workers.length}</td>
                      <td>
                        <span className={styles[`risk${dominant}`]}>{riskLabel(dominant)}</span>
                      </td>
                      <td>
                        <span className={styles.updateBadge}>{umkm.issues.length}</span>
                        <small className={styles.updateMeta}>{umkm.lastUpdate}</small>
                      </td>
                      <td>
                        <Link className={styles.tableActionLink} href={`/admin/umkm/${umkm.id}`}>
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filteredUmkm.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      Tidak ada UMKM sesuai filter atau pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>UMKM Dengan Kendala</h2>
            <span className={styles.helperBadge}>Kondisi kuning atau merah</span>
          </div>
          <ul className={styles.alertList}>
            {attentionList.map((umkm) => {
              const summary = summarizeRisk(umkm.workers);
              const dominant = dominantRisk(summary);
              const attentionCount = summary.yellow + summary.red;

              return (
                <li key={umkm.id} className={styles.alertItem}>
                  <div className={styles.alertTop}>
                    <strong>{umkm.name}</strong>
                    <span className={styles[`risk${dominant}`]}>{riskLabel(dominant)}</span>
                  </div>
                  <p>{attentionCount} pekerja perlu atensi. {umkm.notes}</p>
                  <small>Update terakhir: {umkm.lastUpdate}</small>
                </li>
              );
            })}
            {attentionList.length === 0 && <li className={styles.emptyState}>Tidak ada UMKM yang butuh atensi khusus.</li>}
          </ul>
        </article>
      </section>
    </main>
  );
}
