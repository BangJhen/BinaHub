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

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

const MAX_DAILY_REPLIES = 3;

const fallbackQuestions = [
  "Halo, aku BinaBot. Gimana kabarmu setelah bekerja hari ini?",
  "Apa hal yang paling berkesan dari pekerjaanmu hari ini?",
  "Ada yang ingin kamu ceritakan lebih lanjut tentang harimu?",
];

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
    checklist: ["Cek fisik barang datang", "Input nomor batch", "Update stok di dashboard"],
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
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [content, setContent] = useState("");
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userResponseCount, setUserResponseCount] = useState(0);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [aiReply, setAiReply] = useState("");

  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [proofDrafts, setProofDrafts] = useState<Record<string, string>>({});
  const [proofFiles, setProofFiles] = useState<Record<string, File | null>>({});
  const [sosOpen, setSosOpen] = useState(false);
  const [sosSending, setSosSending] = useState(false);
  const [mood] = useState(3);
  const [stress] = useState(3);
  const [energy] = useState(3);

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

  // ── Fetch pertanyaan personal langsung dari AI Service ────────────────
  const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8001";

  useEffect(() => {
    let cancelled = false;

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${AI_SERVICE_URL}/api/v1/generate-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ worker_id: "client" }),
        });
        if (cancelled) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        const questions = Array.isArray(data?.questions) ? data.questions : fallbackQuestions;
        while (questions.length < 3) questions.push(fallbackQuestions[questions.length]);
        setDynamicQuestions(questions);
      } catch (err) {
        if (cancelled) return;
        console.error("Gagal ambil pertanyaan dari AI Service:", err);
        setDynamicQuestions(fallbackQuestions);
      } finally {
        if (!cancelled) setQuestionsLoading(false);
      }
    };

    fetchQuestions();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // ← fetch sekali saat mount

  // ── Set pesan pertama BinaBot setelah questions siap ───────────────────
  useEffect(() => {
    if (!questionsLoading && dynamicQuestions.length >= 3 && chatMessages.length === 0) {
      setChatMessages([
        { id: `bot-start-${Date.now()}`, role: "bot", text: dynamicQuestions[0] },
      ]);
    }
  }, [questionsLoading, dynamicQuestions, chatMessages.length]);

  const submitDailyJournal = async (journalContent: string) => {
    setErrorMsg("");
    setSuccess(false);
    setAiReply("");
    setAiResult(null);

    if (!journalContent.trim()) {
      setErrorMsg("Jurnal tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/worker/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: journalContent, mood, stress, energy }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan jurnal");
      }

      setSuccess(true);
      setContent("");
      setAiReply("Jurnalmu sudah masuk. Aku sedang menunggu hasil analisis AI.");
      setChatPanelOpen(true);

      setWorkspaceData((prev: any) => ({
        ...prev,
        history: [data.checkin, ...(prev?.history || [])],
      }));

      if (data.ai_analyzing && data.checkin?.id) {
        setAiLoading(true);
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
          } catch (pollError) {
            console.error("Gagal mengambil hasil analisis AI", pollError);
          }

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

  const buildJournalFromMessages = (messages: ChatMessage[]) =>
    messages
      .map((message) => `${message.role === "bot" ? "BinaBot" : "Worker"}: ${message.text}`)
      .join("\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const answer = content.trim();
    if (!answer || isSubmitting || conversationComplete) return;

    const nextCount = userResponseCount + 1;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: answer,
    };

    setContent("");

    // ── Jawaban ke-3: sesi selesai → langsung kirim jurnal ──────────────
    if (nextCount >= MAX_DAILY_REPLIES) {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: "Terima kasih. Aku sudah cukup tahu kondisi harianmu. Aku kirim rangkuman percakapan ini sebagai jurnal untuk dianalisis.",
      };
      const nextMessages = [...chatMessages, userMessage, botMessage];
      setChatMessages(nextMessages);
      setUserResponseCount(nextCount);
      setConversationComplete(true);
      await submitDailyJournal(buildJournalFromMessages(nextMessages));
      return;
    }

    // ── Jawaban 1-2: tampilkan user msg dulu, lalu generate balasan AI ──
    setChatMessages((prev) => [...prev, userMessage]);
    setUserResponseCount(nextCount);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/v1/bina-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_answer: answer,
          question: dynamicQuestions[nextCount - 1] || "",
          next_question: dynamicQuestions[nextCount] || fallbackQuestions[nextCount],
        }),
      });
      const data = await res.json();
      const botReply =
        data.reply ||
        dynamicQuestions[nextCount] ||
        fallbackQuestions[nextCount];

      setChatMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: "bot", text: botReply },
      ]);
    } catch {
      // Fallback: langsung tanya pertanyaan berikutnya
      const nextQ = dynamicQuestions[nextCount] || fallbackQuestions[nextCount];
      setChatMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: "bot", text: nextQ },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBinaBotSession = async () => {
    setQuestionsLoading(true);
    setChatMessages([]);
    setUserResponseCount(0);
    setConversationComplete(false);
    setContent("");
    setErrorMsg("");
    setSuccess(false);
    setAiReply("");
    setAiResult(null);
    setAiLoading(false);
    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/v1/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worker_id: "client" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const questions = Array.isArray(data?.questions) ? data.questions : fallbackQuestions;
      while (questions.length < 3) questions.push(fallbackQuestions[questions.length]);
      setDynamicQuestions(questions);
    } catch {
      setDynamicQuestions(fallbackQuestions);
    } finally {
      setQuestionsLoading(false);
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

    try {
      await fetch(`/api/worker/tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof_text: draft?.trim() || "",
          proof_media_url: mediaUrl,
          proof_media_type: mediaType,
        }),
      });
    } catch (e) {
      console.error("Failed to update task via API, using local state mock");
    }

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
    setActiveTaskId(null);
  };

  const handleSendSos = async () => {
    setSosSending(true);
    try {
      await fetch("/api/worker/sos", { method: "POST" });
    } catch (error) {
      console.error("Failed to send SOS:", error);
    } finally {
      setSosSending(false);
      setSosOpen(false);
    }
  };

  const formatDueDate = (value?: string) => {
    if (!value) return "-";
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return value;
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
          {task.dueDate && <span className={styles.compactBadge}>📅 {formatDueDate(task.dueDate)}</span>}
          {task.location && <span className={styles.compactBadge}>📍 {task.location}</span>}
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

        {(task.status === "waiting_approval" || task.status === "approved") && activeTaskId !== task.id && (
          <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "6px", border: "1px dashed #cbd5e1", marginTop: "0.5rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", marginBottom: "0.25rem" }}>BUKTI KERJA:</div>
            {task.proofText && <div style={{ fontSize: "0.8rem", color: "#334155", fontStyle: "italic", marginBottom: "0.5rem" }}>&quot;{task.proofText}&quot;</div>}
            {task.proofMediaUrl &&
              (task.proofMediaType === "video" ? (
                <video src={task.proofMediaUrl} controls style={{ width: "100%", borderRadius: "4px" }} />
              ) : (
                <img src={task.proofMediaUrl} alt="Bukti kerja" style={{ width: "100%", borderRadius: "4px" }} />
              ))}
          </div>
        )}

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

        {(task.status === "todo" || task.status === "rejected") && activeTaskId !== task.id && (
          <button className={`${styles.actionBtnFull} ${task.status === "rejected" ? styles.btnReject : styles.btnTodo}`} onClick={() => setActiveTaskId(task.id)}>
            {task.status === "rejected" ? "⚠️ Perbaiki & Kirim Ulang" : "🚀 Laporkan Selesai"}
          </button>
        )}

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
            <input type="file" accept="image/*,video/*" className={styles.fileInput} onChange={(e) => handleFileChange(task.id, e)} style={{ marginBottom: "0.5rem" }} />
            {proofFiles[task.id] && (
              <div className={styles.previewContainer}>
                {proofFiles[task.id]!.type.startsWith("video/") ? (
                  <video src={URL.createObjectURL(proofFiles[task.id]!)} className={styles.mediaPreview} controls />
                ) : (
                  <img src={URL.createObjectURL(proofFiles[task.id]!)} className={styles.mediaPreview} alt="Preview" />
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

  const { placement } = workspaceData || {};

  return (
    <div className={styles.container}>
      {!placement ? (
        <div className={`${styles.card} ${styles.emptyState}`}>
          <h2>Belum Ada Pekerjaan Aktif</h2>
          <p>Kamu saat ini belum tergabung dengan UMKM mana pun. Jangan menyerah, yuk cari lowongan yang cocok untukmu.</p>
          <Link href="/worker/lowongan" className={styles.browseJobsBtn}>Eksplor Lowongan</Link>
        </div>
      ) : (
        <>
          <div className={`${styles.workspaceShell} ${chatPanelOpen ? styles.workspaceShellChatOpen : styles.workspaceShellChatClosed}`}>
            <section className={styles.kanbanFullContainer}>
              <div className={styles.kanbanHeader}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Papan Tugas</h2>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                    Penempatan: <strong style={{ color: "#0ea5e9" }}>{placement?.umkm?.business_name || "UMKM TBD"}</strong>
                  </p>
                </div>
                <button type="button" className={styles.sosButton} onClick={() => setSosOpen(true)} disabled={sosSending} style={{ marginTop: 0, padding: "0.6rem 1.25rem" }}>
                  🚨 Kirim SOS
                </button>
              </div>

              <div className={styles.tasksBoard}>
                <div className={styles.boardColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnTitle}>🚀 To Do & Revisi</span>
                    <span className={styles.columnBadge}>{tasks.filter((t) => t.status === "todo" || t.status === "rejected").length}</span>
                  </div>
                  <div className={styles.columnBody}>
                    {tasks.filter((t) => t.status === "todo" || t.status === "rejected").map(renderTaskItem)}
                    {tasks.filter((t) => t.status === "todo" || t.status === "rejected").length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "2rem" }}>Tidak ada tugas baru.</p>}
                  </div>
                </div>

                <div className={styles.boardColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnTitle}>⏳ Menunggu Review</span>
                    <span className={styles.columnBadge}>{tasks.filter((t) => t.status === "waiting_approval").length}</span>
                  </div>
                  <div className={styles.columnBody}>
                    {tasks.filter((t) => t.status === "waiting_approval").map(renderTaskItem)}
                    {tasks.filter((t) => t.status === "waiting_approval").length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "2rem" }}>Belum ada tugas direview.</p>}
                  </div>
                </div>

                <div className={styles.boardColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnTitle}>✅ Selesai</span>
                    <span className={styles.columnBadge}>{tasks.filter((t) => t.status === "approved").length}</span>
                  </div>
                  <div className={styles.columnBody}>
                    {tasks.filter((t) => t.status === "approved").map(renderTaskItem)}
                    {tasks.filter((t) => t.status === "approved").length === 0 && <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", marginTop: "2rem" }}>Belum ada tugas selesai.</p>}
                  </div>
                </div>
              </div>
            </section>

            {!chatPanelOpen && (
              <div className={styles.floatingChatButtonWrapper}>
                {!conversationComplete && <div className={styles.notificationBadge} />}
                <button
                  type="button"
                  className={styles.floatingChatButton}
                  onClick={() => setChatPanelOpen(true)}
                  aria-label="Buka BinaBot"
                >
                  🤖 BinaBot
                </button>
              </div>
            )}

            <aside
              className={`${styles.aiChatPanel} ${
                chatPanelOpen ? styles.aiChatPanelOpen : styles.aiChatPanelClosed
              }`}
              aria-label="BinaBot AI Pendamping"
              aria-hidden={!chatPanelOpen}
            >
              <button type="button" className={styles.chatToggleButton} onClick={() => setChatPanelOpen((prev) => !prev)} aria-label={chatPanelOpen ? "Tutup BinaBot" : "Buka BinaBot"}>
                →
              </button>

              {chatPanelOpen ? (
                <div className={styles.chatInner}>
                  <div className={styles.chatHeader}>
                    <div className={styles.chatAvatar}>🤖</div>
                    <div>
                      <h2>BinaBot</h2>
                      <p>AI mengajukan 3 pertanyaan harian. Jawab dengan jujur ya.</p>
                    </div>
                  </div>

                  <div className={styles.chatMessages}>
                    {questionsLoading ? (
                      <div className={styles.aiMessage}>Memuat pertanyaan personal dari AI...</div>
                    ) : (
                      <div className={styles.chatLimitPill}>{userResponseCount}/{MAX_DAILY_REPLIES} jawaban harian</div>
                    )}

                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={message.role === "bot" ? styles.aiMessage : styles.userMessage}
                      >
                        {message.text}
                      </div>
                    ))}

                    {success && <div className={styles.aiMessage}>Terima kasih! Jurnal harianmu sudah tersimpan.</div>}
                    {aiReply && !aiResult && !aiLoading && <div className={styles.aiMessage}>{aiReply}</div>}

                    {aiLoading && !aiResult && (
                      <div className={styles.aiAnalysisCard}>
                        <div className={styles.aiAnalysisHeader}>
                          <span>🤖</span>
                          <div><strong>AI sedang menganalisis jurnal...</strong><small>Biasanya selesai dalam 5-10 detik.</small></div>
                        </div>
                        <div className={styles.skeletonLine} />
                        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                      </div>
                    )}

                    {aiResult && (
                      <div className={`${styles.aiAnalysisCard} ${aiResult.label === "Hijau" ? styles.aiGreen : aiResult.label === "Merah" ? styles.aiRed : styles.aiYellow}`}>
                        <div className={styles.aiAnalysisHeader}>
                          <span>{aiResult.label === "Hijau" ? "🟢" : aiResult.label === "Merah" ? "🔴" : "🟡"}</span>
                          <div><strong>Analisis AI — {aiResult.label}</strong><small>Skor Risiko: {aiResult.score}/10</small></div>
                        </div>
                        <p>{aiResult.reasoning}</p>
                        {aiResult.dominant_emotions?.length > 0 && (
                          <div className={styles.emotionRow}>{aiResult.dominant_emotions.map((emotion) => <span key={emotion}>{emotion}</span>)}</div>
                        )}
                        {aiResult.intervention_note && <div className={styles.interventionNote}>{aiResult.label === "Merah" ? "⚠️" : "💡"} {aiResult.intervention_note}</div>}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className={styles.chatComposer}>
                    <textarea
                      id="journal-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={questionsLoading ? "Memuat..." : conversationComplete ? "Sesi harian selesai." : "Balas pertanyaan BinaBot..."}
                      className={styles.chatTextarea}
                      disabled={isSubmitting || conversationComplete || questionsLoading}
                    />
                    {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
                    <div className={styles.chatComposerActions}>
                      <button type="submit" className={styles.chatSendButton} disabled={isSubmitting || conversationComplete || questionsLoading || !content.trim()}>
                        {questionsLoading ? "Memuat..." : isSubmitting ? "Mengirim jurnal..." : userResponseCount + 1 >= MAX_DAILY_REPLIES ? "Kirim jawaban terakhir" : "Kirim"}
                      </button>
                      {conversationComplete && (
                        <button type="button" className={styles.chatResetButton} onClick={resetBinaBotSession} disabled={isSubmitting}>
                          Mulai sesi baru
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : null}
            </aside>
          </div>

          {sosOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalBox}>
                <div className={styles.modalTitle}>Konfirmasi SOS</div>
                <div className={styles.modalText}>Tim pendamping akan menerima sinyal darurat kamu. Lanjutkan?</div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelModalBtn} onClick={() => setSosOpen(false)} disabled={sosSending}>Batal</button>
                  <button type="button" className={styles.confirmModalBtn} onClick={handleSendSos} disabled={sosSending}>{sosSending ? "Mengirim..." : "Kirim SOS"}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
