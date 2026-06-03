"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./check-in.module.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { createClient } from "@/utils/supabase/client";

type TaskStatus = "todo" | "waiting_approval" | "approved" | "rejected";
type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  location?: string;
  target?: string;
  checklist?: string[];
  proofText?: string;
  proofMediaUrl?: string;
  proofMediaType?: "image" | "video";
  feedback?: string;
};

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Input stok masuk",
    description: "Input data stok masuk untuk 25 item di gudang.",
    status: "todo",
    priority: "high",
    dueDate: "2026-05-30",
    location: "Gudang utama",
    target: "25 item selesai diinput",
    checklist: [
      "Cek fisik barang datang",
      "Input nomor batch",
      "Update stok di dashboard",
    ],
  },
  {
    id: "task-2",
    title: "Label rak baru",
    description: "Tempel label rak untuk kategori barang fast moving.",
    status: "waiting_approval",
    priority: "medium",
    dueDate: "2026-05-30",
    location: "Area rak A",
    target: "Semua rak fast moving tertempel label",
    proofText: "Label rak sudah dipasang dan difoto untuk verifikasi.",
  },
  {
    id: "task-3",
    title: "Bersihkan area packing",
    description: "Pastikan area packing bersih sebelum tutup gudang.",
    status: "rejected",
    priority: "low",
    dueDate: "2026-05-30",
    location: "Area packing",
    target: "Area packing siap shift besok",
    proofText: "Area packing dibersihkan dan lantai dipel.",
    feedback: "Foto kurang jelas, mohon unggah ulang dari sudut lebih dekat.",
  },
];

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<"tasks" | "checkin" | "history">(
    "tasks"
  );
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [aiReply, setAiReply] = useState("");

  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [proofDrafts, setProofDrafts] = useState<Record<string, string>>({});
  const [proofFiles, setProofFiles] = useState<Record<string, File | null>>({});
  const [sosOpen, setSosOpen] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState(3);

  // AI Result State
  const [aiResult, setAiResult] = useState<{
    score: number;
    label: string;
    reasoning: string;
    flags: Record<string, boolean>;
    dominant_emotions: string[];
    intervention_note: string;
    trend_direction?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastCheckinId, setLastCheckinId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await fetch("/api/worker/workspace");
        if (res.ok) {
          const data = await res.json();
          setWorkspaceData(data);
          const incomingTasks = Array.isArray(data?.tasks) ? data.tasks : [];
          setTasks(incomingTasks.length > 0 ? incomingTasks : mockTasks);
          return;
        }
      } catch (err) {
        console.error("Gagal mengambil data meja kerja", err);
      }

      setTasks(mockTasks);
    };

    fetchWorkspace().finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);
    setAiReply("");
    setAiResult(null);

    if (!content.trim()) {
      setErrorMsg("Jurnal tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/worker/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mood,
          stress,
          energy,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan jurnal");
      }

      setSuccess(true);
      setContent("");
      setAiReply("Terima kasih. Jurnal kamu sudah masuk dan sedang dianalisis AI...");

      setWorkspaceData((prev: any) => ({
        ...prev,
        history: [data.checkin, ...(prev?.history || [])],
      }));

      // Start polling for AI result if AI is analyzing
      if (data.ai_analyzing && data.checkin?.id) {
        setLastCheckinId(data.checkin.id);
        setAiLoading(true);

        // Poll Supabase every 3s for up to 30s
        const supabase = createClient();
        let attempts = 0;
        const maxAttempts = 10;

        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const { data: checkinData } = await supabase
              .from("checkins")
              .select("ai_score, ai_label, ai_reasoning, ai_flags, dominant_emotions, intervention_note, trend_direction")
              .eq("id", data.checkin.id)
              .not("ai_score", "is", null)
              .single();

            if (checkinData?.ai_score) {
              setAiResult({
                score: checkinData.ai_score,
                label: checkinData.ai_label,
                reasoning: checkinData.ai_reasoning,
                flags: checkinData.ai_flags || {},
                dominant_emotions: checkinData.dominant_emotions || [],
                intervention_note: checkinData.intervention_note,
                trend_direction: checkinData.trend_direction,
              });
              setAiLoading(false);
              clearInterval(pollInterval);
            }
          } catch (e) { /* silent */ }

          if (attempts >= maxAttempts) {
            setAiLoading(false);
            clearInterval(pollInterval);
          }
        }, 3000);
      }

      setTimeout(() => setSuccess(false), 8000);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProofChange = (taskId: string, value: string) => {
    setProofDrafts((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleFileChange = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFiles((prev) => ({ ...prev, [taskId]: file }));
    }
  };

  const handleProofSubmit = async (taskId: string) => {
    const draft = proofDrafts[taskId];
    const file = proofFiles[taskId];
    
    if (!draft?.trim() && !file) {
      return;
    }

    const supabase = createClient();
    let mediaUrl = undefined;
    let mediaType = undefined;

    // 1. Upload ke Storage jika ada file
    if (file) {
      mediaType = file.type.startsWith("video/") ? "video" : "image";
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
      
      try {
        const { data, error } = await supabase.storage
          .from("worker-media")
          .upload(`proofs/${fileName}`, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Storage upload error:", error.message);
          // Fallback UI mock jika gagal upload (misal bucket belum ada)
          mediaUrl = URL.createObjectURL(file);
        } else if (data) {
          const { data: publicData } = supabase.storage.from("worker-media").getPublicUrl(data.path);
          mediaUrl = publicData.publicUrl;
        }
      } catch (err) {
        console.error("Storage exception:", err);
        mediaUrl = URL.createObjectURL(file);
      }
    }

    // 2. Simpan ke Backend (API untuk update task)
    // Walaupun API belum ada/tabel belum ada, kita coba fetch
    try {
      await fetch(`/api/worker/tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof_text: draft?.trim() || "",
          proof_media_url: mediaUrl,
          proof_media_type: mediaType
        })
      });
    } catch (e) {
      console.error("Failed to update task via API, using local state mock");
    }

    // 3. Update Local State
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "waiting_approval",
              proofText: draft?.trim() || "",
              proofMediaUrl: mediaUrl,
              proofMediaType: mediaType as "image" | "video" | undefined,
              feedback: "",
            }
          : task
      )
    );

    setProofDrafts((prev) => ({ ...prev, [taskId]: "" }));
    setProofFiles((prev) => ({ ...prev, [taskId]: null }));
  };

  const handleSendSos = async () => {
    setSosSending(true);
    try {
      const res = await fetch("/api/worker/sos", { method: "POST" });
      if (res.ok) {
        setSosSent(true);
      }
    } catch (error) {
      console.error("Failed to send SOS:", error);
    } finally {
      setSosSending(false);
      setSosOpen(false);
    }
  };

  const formatDueDate = (value?: string) => {
    if (!value) {
      return "-";
    }

    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      return value;
    }

    return format(new Date(parsed), "dd MMM yyyy", { locale: id });
  };

  const getPriorityLabel = (priority?: TaskPriority) => {
    if (priority === "high") return "Prioritas Tinggi";
    if (priority === "medium") return "Prioritas Sedang";
    if (priority === "low") return "Prioritas Rendah";
    return null;
  };

  
  const renderTaskItem = (task: Task) => {
    const priorityLabel = getPriorityLabel(task.priority);

    return (
      <div key={task.id} className={styles.taskItem}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
          <div className={styles.taskTitle}>{task.title}</div>
          {priorityLabel && (
            <span
              className={`${styles.badge} ${
                task.priority === "high"
                  ? styles.badgePriorityHigh
                  : task.priority === "medium"
                  ? styles.badgePriorityMedium
                  : styles.badgePriorityLow
              }`}
              style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}
            >
              {priorityLabel}
            </span>
          )}
        </div>
        
        <div className={styles.taskSubline}>{task.description}</div>

        <div className={styles.compactDetails}>
          {task.dueDate && (
             <span className={styles.compactBadge}>📅 {formatDueDate(task.dueDate)}</span>
          )}
          {task.location && (
             <span className={styles.compactBadge}>📍 {task.location}</span>
          )}
        </div>

        {task.checklist && task.checklist.length > 0 && (
          <div style={{ marginTop: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem", textTransform: "uppercase" }}>Rincian langkah:</div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#475569" }}>
              {task.checklist.map((item, index) => (
                <li key={`${task.id}-step-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submitted Proof Display */}
        {(task.status === "waiting_approval" || task.status === "approved") && activeTaskId !== task.id && (
          <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "6px", border: "1px dashed #cbd5e1", marginTop: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>BUKTI KERJA:</div>
            {task.proofText && <div style={{ fontSize: "0.8rem", color: "#334155", fontStyle: "italic", marginBottom: "0.5rem" }}>&quot;{task.proofText}&quot;</div>}
            {task.proofMediaUrl && (
              task.proofMediaType === "video" ? (
                <video src={task.proofMediaUrl} controls style={{ width: "100%", borderRadius: "4px" }} />
              ) : (
                <img src={task.proofMediaUrl} alt="Bukti kerja" style={{ width: "100%", borderRadius: "4px" }} />
              )
            )}
          </div>
        )}

        {/* Feedback from UMKM */}
        {task.status === "rejected" && task.feedback && (
          <div className={`${styles.feedbackBox} ${styles.feedbackRejected}`} style={{ marginTop: "0.5rem" }}>
            <strong style={{ display: "block", marginBottom: "2px" }}>Revisi dari UMKM:</strong>
            {task.feedback}
          </div>
        )}

        {task.status === "approved" && task.feedback && (
          <div className={`${styles.feedbackBox} ${styles.feedbackApproved}`} style={{ marginTop: "0.5rem" }}>
            <strong style={{ display: "block", marginBottom: "2px" }}>Catatan UMKM:</strong>
            {task.feedback}
          </div>
        )}

        {/* Actions */}
        {(task.status === "todo" || task.status === "rejected") && activeTaskId !== task.id && (
          <button 
            className={`${styles.actionBtnFull} ${task.status === "rejected" ? styles.btnReject : styles.btnTodo}`}
            onClick={() => {
              setActiveTaskId(task.id);
            }}
          >
            {task.status === "rejected" ? "⚠️ Perbaiki & Kirim Ulang" : "🚀 Laporkan Selesai"}
          </button>
        )}

        {/* Submit Proof Form */}
        {activeTaskId === task.id && (
          <div className={styles.proofForm} style={{ marginTop: "0.5rem", padding: "0.75rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>LAPORKAN BUKTI:</div>
            <textarea
              className={styles.proofInput}
              placeholder="Tulis ringkasan (opsional)..."
              value={proofDrafts[task.id] || ""}
              onChange={(e) => handleProofChange(task.id, e.target.value)}
              style={{ minHeight: "60px", marginBottom: "0.5rem" }}
            />
            <input 
              type="file" 
              accept="image/*,video/*" 
              className={styles.fileInput} 
              onChange={(e) => handleFileChange(task.id, e)} 
              style={{ marginBottom: "0.5rem" }}
            />
            {proofFiles[task.id] && (
              <div className={styles.previewContainer}>
                {proofFiles[task.id].type.startsWith("video/") ? (
                  <video src={URL.createObjectURL(proofFiles[task.id])} className={styles.mediaPreview} controls />
                ) : (
                  <img src={URL.createObjectURL(proofFiles[task.id])} className={styles.mediaPreview} alt="Preview" />
                )}
              </div>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button className={styles.submitProofBtn} style={{ flex: 1, padding: "0.5rem" }} onClick={() => handleProofSubmit(task.id)}>Kirim</button>
              <button onClick={() => setActiveTaskId(null)} style={{ background: "transparent", color: "#64748b", border: "none", fontWeight: 600, cursor: "pointer", padding: "0.5rem" }}>Batal</button>
            </div>
          </div>
        )}
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>Menyiapkan Meja Kerjamu...</p>
      </div>
    );
  }

  const { placement, history = [] } = workspaceData || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Meja Kerja</h1>
        <p className={styles.subtitle}>
          Pusat informasi penempatan dan jurnal harianmu.
        </p>
      </div>

      {!placement ? (
        <div className={`${styles.card} ${styles.emptyState}`}>
          <h2>Belum Ada Pekerjaan Aktif</h2>
          <p>
            Kamu saat ini belum tergabung dengan UMKM mana pun. Jangan menyerah,
            yuk cari lowongan yang cocok untukmu.
          </p>
          <Link href="/worker/lowongan" className={styles.browseJobsBtn}>
            Eksplor Lowongan
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.tabsContainer}>
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "tasks" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("tasks")}
            >
              Tugas & Bukti Kerja
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "checkin" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("checkin")}
            >
              Check-in Harian
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "history" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              Riwayat
            </button>
          </div>

                    {activeTab === "tasks" && (
            <div className={styles.kanbanFullContainer}>
              <div className={styles.kanbanHeader}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Papan Tugas</h2>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                    Penempatan: <strong style={{ color: "#0ea5e9" }}>{placement?.umkm?.business_name || "UMKM TBD"}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.sosButton}
                  onClick={() => setSosOpen(true)}
                  disabled={sosSending}
                  style={{ marginTop: 0, padding: "0.6rem 1.25rem" }}
                >
                  🚨 Kirim SOS
                </button>
              </div>

              <div className={styles.tasksBoard}>
                {/* TO DO COLUMN */}
                <div className={styles.boardColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnTitle}>🚀 To Do & Revisi</span>
                    <span className={styles.columnBadge}>{tasks.filter(t => t.status === "todo" || t.status === "rejected").length}</span>
                  </div>
                  <div className={styles.columnBody}>
                    {tasks.filter(t => t.status === "todo" || t.status === "rejected").map(renderTaskItem)}
                    {tasks.filter(t => t.status === "todo" || t.status === "rejected").length === 0 && (
                      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "2rem" }}>Tidak ada tugas baru.</p>
                    )}
                  </div>
                </div>

                {/* IN REVIEW COLUMN */}
                <div className={styles.boardColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnTitle}>⏳ Menunggu Review</span>
                    <span className={styles.columnBadge}>{tasks.filter(t => t.status === "waiting_approval").length}</span>
                  </div>
                  <div className={styles.columnBody}>
                    {tasks.filter(t => t.status === "waiting_approval").map(renderTaskItem)}
                    {tasks.filter(t => t.status === "waiting_approval").length === 0 && (
                      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "2rem" }}>Belum ada tugas direview.</p>
                    )}
                  </div>
                </div>

                {/* APPROVED COLUMN */}
                <div className={styles.boardColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnTitle}>✅ Selesai</span>
                    <span className={styles.columnBadge}>{tasks.filter(t => t.status === "approved").length}</span>
                  </div>
                  <div className={styles.columnBody}>
                    {tasks.filter(t => t.status === "approved").map(renderTaskItem)}
                    {tasks.filter(t => t.status === "approved").length === 0 && (
                      <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "2rem" }}>Belum ada tugas selesai.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "checkin" && (
            <div className={styles.workspaceLayout}>
              <div className={styles.sidebar}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Prompt Harian</h2>
                  <div className={styles.promptBox}>
                    <div className={styles.promptLabel}>Fokus hari ini</div>
                    <div className={styles.promptText}>
                      Apa satu hal yang paling kamu banggakan dari kerja hari ini?
                    </div>
                  </div>
                  <div className={styles.promptBox}>
                    <div className={styles.promptLabel}>Tantangan</div>
                    <div className={styles.promptText}>
                      Apa yang paling membuatmu lelah atau cemas hari ini?
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.mainArea}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Monitoring Harian</h2>
                  <div className={styles.sliderGroup}>
                    <div className={styles.sliderLabelRow}>
                      <span>Perasaan</span>
                      <span>{mood}/5</span>
                    </div>
                    <input
                      className={styles.sliderInput}
                      type="range"
                      min={1}
                      max={5}
                      value={mood}
                      onChange={(e) => setMood(Number(e.target.value))}
                    />
                    <div className={styles.sliderDesc}>
                      <span>Berat</span>
                      <span>Ringan</span>
                    </div>
                  </div>

                  <div className={styles.sliderGroup}>
                    <div className={styles.sliderLabelRow}>
                      <span>Stres</span>
                      <span>{stress}/5</span>
                    </div>
                    <input
                      className={styles.sliderInput}
                      type="range"
                      min={1}
                      max={5}
                      value={stress}
                      onChange={(e) => setStress(Number(e.target.value))}
                    />
                    <div className={styles.sliderDesc}>
                      <span>Tenang</span>
                      <span>Tertekan</span>
                    </div>
                  </div>

                  <div className={styles.sliderGroup}>
                    <div className={styles.sliderLabelRow}>
                      <span>Energi</span>
                      <span>{energy}/5</span>
                    </div>
                    <input
                      className={styles.sliderInput}
                      type="range"
                      min={1}
                      max={5}
                      value={energy}
                      onChange={(e) => setEnergy(Number(e.target.value))}
                    />
                    <div className={styles.sliderDesc}>
                      <span>Drop</span>
                      <span>Bertenaga</span>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Jurnal Harian</h2>
                  <p
                    style={{
                      marginBottom: "1.5rem",
                      fontSize: "0.95rem",
                      color: "#64748b",
                    }}
                  >
                    Ceritakan apa yang kamu kerjakan dan rasakan hari ini. Laporan
                    ini rahasia dan membantu pendamping memantau kondisimu.
                  </p>

                  {success && (
                    <div className={styles.successMsg}>
                      Terima kasih! Jurnal harianmu telah berhasil disimpan.
                    </div>
                  )}

                  {/* ── AI Response Card ──────────────────────────────── */}
                  {(aiReply || aiLoading || aiResult) && (
                    <div style={{
                      margin: "1.5rem 0",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: aiResult
                        ? aiResult.label === "Hijau" ? "1px solid #bbf7d0"
                          : aiResult.label === "Merah" ? "1px solid #fecaca"
                          : "1px solid #fde68a"
                        : "1px solid #e2e8f0",
                      background: aiResult
                        ? aiResult.label === "Hijau" ? "linear-gradient(135deg,#f0fdf4,#dcfce7)"
                          : aiResult.label === "Merah" ? "linear-gradient(135deg,#fff5f5,#fee2e2)"
                          : "linear-gradient(135deg,#fffbeb,#fef3c7)"
                        : "#f8fafc",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                    }}>
                      {/* Header */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "14px 18px",
                        background: aiResult
                          ? aiResult.label === "Hijau" ? "rgba(22,163,74,0.1)"
                            : aiResult.label === "Merah" ? "rgba(220,38,38,0.1)"
                            : "rgba(245,158,11,0.1)"
                          : "rgba(99,102,241,0.08)",
                        borderBottom: "1px solid rgba(0,0,0,0.05)"
                      }}>
                        <span style={{ fontSize: "1.2rem" }}>
                          {aiResult
                            ? aiResult.label === "Hijau" ? "🟢"
                              : aiResult.label === "Merah" ? "🔴"
                              : "🟡"
                            : "🤖"}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>
                            {aiResult ? `Analisis AI — ${aiResult.label}` : "AI sedang menganalisis jurnal..."}
                          </div>
                          {aiResult && (
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                              Skor Risiko: {aiResult.score}/10
                              {aiResult.trend_direction && aiResult.trend_direction !== "insufficient_data" && (
                                <span style={{ marginLeft: 8 }}>
                                  {aiResult.trend_direction === "improving" ? "↑ Membaik" :
                                   aiResult.trend_direction === "deteriorating" ? "↓ Memburuk" : "→ Stabil"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {aiLoading && (
                          <div style={{
                            marginLeft: "auto",
                            width: 18, height: 18,
                            border: "2.5px solid #e2e8f0",
                            borderTopColor: "#6366f1",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite"
                          }} />
                        )}
                      </div>

                      {/* Body */}
                      <div style={{ padding: "16px 18px" }}>
                        {aiLoading && !aiResult && (
                          <div>
                            {/* Skeleton */}
                            {[80, 60, 90].map((w, i) => (
                              <div key={i} style={{
                                height: 12, borderRadius: 6,
                                background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite",
                                width: `${w}%`, marginBottom: 10
                              }} />
                            ))}
                            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 8 }}>
                              Biasanya selesai dalam 5-10 detik...
                            </p>
                          </div>
                        )}

                        {aiResult && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {/* Reasoning */}
                            <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.6, margin: 0 }}>
                              {aiResult.reasoning}
                            </p>

                            {/* Dominant Emotions */}
                            {aiResult.dominant_emotions?.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {aiResult.dominant_emotions.map((em) => (
                                  <span key={em} style={{
                                    background: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "999px",
                                    padding: "3px 10px",
                                    fontSize: "0.78rem",
                                    color: "#475569",
                                    fontWeight: 500
                                  }}>
                                    {em}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Intervention Note (only for Yellow/Red) */}
                            {aiResult.label !== "Hijau" && aiResult.intervention_note && (
                              <div style={{
                                background: "white",
                                borderRadius: 10,
                                padding: "10px 14px",
                                border: `1px solid ${aiResult.label === "Merah" ? "#fecaca" : "#fde68a"}`,
                                fontSize: "0.82rem",
                                color: "#374151"
                              }}>
                                <strong style={{ display: "block", marginBottom: 4 }}>
                                  {aiResult.label === "Merah" ? "⚠️ Catatan Penting:" : "💡 Saran:"}
                                </strong>
                                {aiResult.intervention_note}
                              </div>
                            )}

                            {/* Green Affirm */}
                            {aiResult.label === "Hijau" && (
                              <div style={{
                                background: "white", borderRadius: 10,
                                padding: "10px 14px", border: "1px solid #bbf7d0",
                                fontSize: "0.82rem", color: "#15803d"
                              }}>
                                ✨ Kondisi kamu terlihat stabil hari ini. Pertahankan semangat ini!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                      <textarea
                        id="journal-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Contoh: Hari ini aku menata stok, kondisi gudang cukup sibuk tapi bisa diatasi."
                        className={styles.textarea}
                        disabled={isSubmitting}
                      />
                    </div>

                    {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

                    <div className={styles.buttonContainer}>
                      <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting || !content.trim()}
                      >
                        {isSubmitting ? "Menyimpan..." : "Kirim Jurnal"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className={styles.workspaceLayout}>
              <div className={styles.sidebar}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Info Penempatan</h2>
                  <div className={styles.placementInfo}>
                    <div className={styles.companyName}>
                      {placement.umkm?.business_name || "UMKM TBD"}
                    </div>
                    <div className={styles.jobTitle}>
                      {placement.jobs?.title} (
                      {placement.jobs?.employment_type || "Tetap"})
                    </div>
                    <div className={styles.placementMeta}>
                      Mulai kerja:{" "}
                      {placement.start_date
                        ? format(new Date(placement.start_date), "dd MMMM yyyy", {
                            locale: id,
                          })
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.mainArea}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Riwayat Jurnal</h2>
                  {history.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      Belum ada jurnal yang dikirim.
                    </p>
                  ) : (
                    <ul className={styles.notesList}>
                      {history.map((h: any) => (
                        <li key={h.id} className={styles.noteItem}>
                          <div className={styles.noteDate}>
                            {format(new Date(h.submitted_at), "EEEE, dd MMM yyyy - HH:mm", {
                              locale: id,
                            })}
                          </div>
                          <div className={styles.noteContent}>"{h.content}"</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {sosOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalBox}>
                <div className={styles.modalTitle}>Konfirmasi SOS</div>
                <div className={styles.modalText}>
                  Tim pendamping akan menerima sinyal darurat kamu. Lanjutkan?
                </div>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelModalBtn}
                    onClick={() => setSosOpen(false)}
                    disabled={sosSending}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className={styles.confirmModalBtn}
                    onClick={handleSendSos}
                    disabled={sosSending}
                  >
                    {sosSending ? "Mengirim..." : "Kirim SOS"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
