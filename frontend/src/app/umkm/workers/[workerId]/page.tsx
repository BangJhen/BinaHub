"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { createClient } from "@/utils/supabase/client";

type RiskLevel = "green" | "yellow" | "red";
type WorkerChartRange = "1w" | "1m" | "6m" | "1y";

type UmkmDashboardData = {
  workers: Array<{
    id: string;
    name: string;
    role: string;
    startDate: string;
    attendanceRate: number;
    productivityScore: number;
    checkinConsistency: number;
    hasCheckedInToday: boolean;
    latestCheckin: string;
    latestCondition: RiskLevel;
    mentorNote: string;
  }>;
  alerts: Array<{
    id: string;
    workerId: string;
    level: RiskLevel;
    message: string;
    createdAt: string;
  }>;
  checkinNotes: Array<{
    id: string;
    workerId: string;
    summary: string;
    mood: "Stabil" | "Waspada" | "Butuh Pendampingan";
    submittedAt: string;
    level: RiskLevel;
  }>;
  workerConditionTrendByRange: Record<string, Record<WorkerChartRange, Array<{ day: string; green: number; yellow: number; red: number }>>>;
};

function riskLabel(level: RiskLevel) {
  if (level === "red") return "Risiko Tinggi";
  if (level === "yellow") return "Perlu Atensi";
  return "Stabil";
}

function dominantLevel(green: number, yellow: number, red: number) {
  if (red >= yellow && red >= green) return "red" as const;
  if (yellow >= green) return "yellow" as const;
  return "green" as const;
}

export default function WorkerDetailPage() {
  const params = useParams<{ workerId: string }>();
  const workerId = params?.workerId ?? "";
  const [data, setData] = useState<UmkmDashboardData | null>(null);
  const [realWorkerFallback, setRealWorkerFallback] = useState<any>(null);
  const [fetchError, setFetchError] = useState("");
  const [chartRange, setChartRange] = useState<WorkerChartRange>("1m");
  const [tasks, setTasks] = useState<any[]>([]);
  const [realAlerts, setRealAlerts] = useState<any[]>([]);
  const [realCheckins, setRealCheckins] = useState<any[]>([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [questionText, setQuestionText] = useState("");
  const [questionSent, setQuestionSent] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setFetchError("");
      
      const [dashRes, realWorkerRes] = await Promise.all([
        fetch("/api/dashboard/umkm", { cache: "no-store" }),
        fetch(`/api/umkm/workers/${workerId}`, { cache: "no-store" })
      ]);

      if (realWorkerRes.ok) {
        const payload = await realWorkerRes.json();
        if (isMounted && payload.data) {
          setRealWorkerFallback(payload.data);
        }
      }

      if (!dashRes.ok) {
        const payload = (await dashRes.json().catch(() => ({}))) as { message?: string };
        if (isMounted) setFetchError(payload.message ?? "Gagal memuat data pekerja.");
        return;
      }

      const payload = (await dashRes.json()) as UmkmDashboardData;
      if (!isMounted) return;
      setData(payload);
    }

    if (workerId) loadData();
    return () => {
      isMounted = false;
    };
  }, [workerId]);

  if (fetchError) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail Individu</p>
            <h1>Gagal memuat data</h1>
            <p>{fetchError}</p>
          </div>
          <Link href="/umkm/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (!data && !realWorkerFallback) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail Individu</p>
            <h1>Memuat detail pekerja...</h1>
          </div>
          <Link href="/umkm/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (!workerId) {
    return null;
  }

  const { workers, alerts, checkinNotes, workerConditionTrendByRange } = data || { workers: [], alerts: [], checkinNotes: [], workerConditionTrendByRange: {} };

  const worker = workers.find((item) => item.id === workerId);

  const renderTasksAndMessages = () => (
    <section className={styles.gridFull}>
      <article className={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Tugas & Bukti Kerja Pekerja</h2>
        </div>

        <div className={styles.addTaskFormContainer}>
          <h3>Tambah To-Do / Instruksi Baru</h3>
          <form onSubmit={handleAddTask} className={styles.addTaskForm}>
            <input 
              type="text" 
              className={styles.addTaskInput} 
              placeholder="Judul Tugas (misal: Rapikan gudang A)" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <textarea 
              className={styles.addTaskTextarea} 
              placeholder="Detail / Instruksi tambahan (opsional)"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
            />
            <button 
              type="submit" 
              className={styles.addTaskSubmit} 
              disabled={!newTaskTitle.trim() || isAddingTask}
            >
              {isAddingTask ? "Menyimpan..." : "+ Tambahkan Tugas"}
            </button>
          </form>
        </div>

        <div className={styles.taskList}>
          {tasks.map(task => (
            <div key={task.id} className={styles.taskItem}>
              <div className={styles.taskHeader}>
                <div className={styles.taskTitle}>{task.title}</div>
                <div className={`${styles.taskBadge} ${task.status === "approved" ? styles.badgeApproved : task.status === "rejected" ? styles.badgeRejected : styles.badgeWaiting}`}>
                  {task.status === "approved" ? "Disetujui" : task.status === "rejected" ? "Ditolak" : "Menunggu"}
                </div>
              </div>
              <p className={styles.taskDesc}>{task.description}</p>
              
              {(task.proofText || task.proofMediaUrl) && (
                <div className={styles.proofBox}>
                  <p style={{margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: "#64748b"}}>BUKTI DIKIRIM:</p>
                  {task.proofText && <p className={styles.proofText}>"{task.proofText}"</p>}
                  {task.proofMediaUrl && (
                    task.proofMediaType === "video" ? (
                      <video src={task.proofMediaUrl} controls className={styles.proofMedia} />
                    ) : (
                      <img src={task.proofMediaUrl} alt="Bukti kerja" className={styles.proofMedia} />
                    )
                  )}
                </div>
              )}

              {task.status === "waiting_approval" && (
                <div className={styles.feedbackForm}>
                  <textarea 
                    className={styles.feedbackInput} 
                    placeholder="Catatan untuk pekerja (opsional)..."
                    value={feedbackDrafts[task.id] || ""}
                    onChange={(e) => setFeedbackDrafts(prev => ({...prev, [task.id]: e.target.value}))}
                  />
                  <div className={styles.feedbackActions}>
                    <button type="button" className={styles.approveBtn} onClick={() => handleApprove(task.id)}>Setujui</button>
                    <button type="button" className={styles.rejectBtn} onClick={() => handleReject(task.id)}>Tolak</button>
                  </div>
                </div>
              )}

              {task.feedback && task.status !== "waiting_approval" && (
                <div className={styles.proofBox} style={{marginTop: "8px", background: task.status === "approved" ? "#f0fdf4" : "#fef2f2"}}>
                  <p style={{margin: "0 0 5px", fontSize: 12, fontWeight: 700, color: task.status === "approved" ? "#166534" : "#991b1b"}}>CATATAN ANDA:</p>
                  <p className={styles.proofText} style={{color: task.status === "approved" ? "#14532d" : "#7f1d1d"}}>{task.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>

      <article className={styles.card}>
        <h2>Tanya Pekerja / Kirim Pesan</h2>
        <p style={{fontSize: 13, color: "#64748b", marginBottom: 12}}>
          Kirimkan pertanyaan atau instruksi langsung kepada pekerja. Mereka akan menerimanya di aplikasi mereka.
        </p>
        {questionSent && (
          <div className={styles.successMsg} style={{marginBottom: 12}}>
            Pesan berhasil dikirim ke pekerja.
          </div>
        )}
        <form onSubmit={handleSendQuestion} className={styles.messageForm}>
          <textarea 
            className={styles.messageInput} 
            placeholder="Tulis pesan atau pertanyaan Anda di sini..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <button type="submit" className={styles.messageSubmit} disabled={!questionText.trim()}>
            Kirim Pesan
          </button>
        </form>
      </article>
    </section>
  );

  // Jika tidak ketemu di dummy dashboard, gunakan data real fallback
  if (!worker && !realWorkerFallback) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Detail Individu</p>
            <h1>Pekerja tidak ditemukan</h1>
            <p>Data pekerja yang dipilih tidak tersedia atau tidak ada di database.</p>
          </div>
          <Link href="/umkm/dashboard" className={styles.backLink}>
            Kembali ke Dashboard
          </Link>
        </section>
      </main>
    );
  }

  // Jika Pekerja Dummy Tidak Ketemu TAPI Data Real Profil Supabase ketemu, render Fallback UI Data Asli Supabase
  if (!worker && realWorkerFallback) {
    return (
      <main className={styles.pageRoot}>
        <section className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Profil Pekerja (Belum mulai bekerja)</p>
            <h1>{realWorkerFallback.name}</h1>
            <p>{realWorkerFallback.email} • {realWorkerFallback.phone}</p>
          </div>
          <Link href="/umkm/lowongan" className={styles.backLink}>
            Kembali ke Lowongan
          </Link>
        </section>

        <section className={styles.gridTop}>
          <article className={styles.card} style={{ gridColumn: "1 / -1" }}>
            <h2>Informasi Personal & Keahlian</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "1rem" }}>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 13, color: "#64748b" }}>Lokasi</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{realWorkerFallback.location}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 13, color: "#64748b" }}>Pendidikan</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{realWorkerFallback.educationLevel}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 13, color: "#64748b" }}>Usia</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{realWorkerFallback.age} Tahun</p>
              </div>
              <div>
                <p style={{ margin: "0 0 5px", fontSize: 13, color: "#64748b" }}>Gender</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{realWorkerFallback.gender}</p>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: "0 0 5px", fontSize: 13, color: "#64748b" }}>Keahlian / Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {realWorkerFallback.skills.split(",").filter(Boolean).map((s: string) => (
                  <span key={s} style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", fontSize: 13, border: "1px solid #cbd5e1" }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <p style={{ margin: "0 0 5px", fontSize: 13, color: "#64748b" }}>Ringkasan Pengalaman</p>
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{realWorkerFallback.experienceSummary}</p>
              </div>
            </div>
            
            <p style={{ marginTop: "2rem", fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
              * Data grafik check-in dan absensi hanya tersedia untuk pekerja yang sudah diterima dan mulai bekerja aktif.
            </p>
          </article>
        </section>
      </main>
    );
  }

  // ALUR NORMAL UNTUK KARYAWAN DUMMY (YANG SUDAH ADA DI DASHBOARD) 
  const workerAlerts = alerts.filter((item) => item.workerId === worker!.id);

  const workerCheckins = checkinNotes.filter((item) => item.workerId === worker!.id);

  const weeklyDailyChecks = workerConditionTrendByRange[worker!.id]?.["1w"] ?? [];
  const todayCheck = weeklyDailyChecks[weeklyDailyChecks.length - 1];
  const stableDays = weeklyDailyChecks.filter((item) => dominantLevel(item.green, item.yellow, item.red) === "green").length;
  const attentionDays = weeklyDailyChecks.filter((item) => dominantLevel(item.green, item.yellow, item.red) !== "green").length;

  const trend = workerConditionTrendByRange[worker!.id]?.[chartRange] ?? [];

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
          <h1>{worker!.name}</h1>
          <p>{worker!.role} • Mulai bekerja: {worker!.startDate}</p>
        </div>
        <Link href="/umkm/dashboard" className={styles.backLink}>
          Kembali ke Dashboard
        </Link>
      </section>

      <section className={styles.gridTop}>
        <article className={styles.card}>
          <h2>Snapshot Personal</h2>
          <div className={styles.stats}>
            <div><span>Kehadiran</span><strong>{worker!.attendanceRate}%</strong></div>
            <div><span>Produktivitas</span><strong>{worker!.productivityScore}</strong></div>
            <div><span>Check-in</span><strong>{worker!.checkinConsistency}%</strong></div>
            <div><span>Kondisi Saat Ini</span><strong>{riskLabel(worker!.latestCondition)}</strong></div>
          </div>
          <p className={styles.note}>{worker!.mentorNote}</p>
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
