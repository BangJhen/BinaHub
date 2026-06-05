"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

type TaskStatus = "todo" | "waiting_approval" | "approved" | "rejected";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  proofText?: string;
  proofMediaUrl?: string;
  feedback?: string;
};

export default function WorkerTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [proofText, setProofText] = useState("");
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/worker/workspace");
        if (res.ok) {
          const data = await res.json();
          if (data.tasks) {
            setTasks(data.tasks);
          }
        }
      } catch (err) {}
    }
    loadTasks();
  }, []);

  const handleSimulateUpload = () => {
    // Simulate picking an image
    setSimulatedImage("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400");
  };

  const handleSubmitProof = async (taskId: string) => {
    if (!proofText && !simulatedImage) return;

    try {
      await fetch(`/api/worker/tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof_text: proofText,
          proof_media_url: simulatedImage || undefined,
          proof_media_type: simulatedImage ? "image" : undefined
        })
      });
      
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: "waiting_approval",
            proofText: proofText,
            proofMediaUrl: simulatedImage || undefined
          };
        }
        return t;
      }));
    } catch (e) {
      console.error("Failed to submit proof", e);
    }

    setActiveTaskId(null);
    setProofText("");
    setSimulatedImage(null);
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "To Do";
      case "waiting_approval": return "In Review";
      case "approved": return "Approved";
      case "rejected": return "Needs Fix";
    }
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case "todo": return styles.statusTodo;
      case "waiting_approval": return styles.statusWaiting;
      case "approved": return styles.statusApproved;
      case "rejected": return styles.statusRejected;
    }
  };

  // Group tasks by status for Kanban Board
  const todoTasks = tasks.filter(t => t.status === "todo" || t.status === "rejected");
  const reviewTasks = tasks.filter(t => t.status === "waiting_approval");
  const doneTasks = tasks.filter(t => t.status === "approved");

  const renderTaskCard = (task: Task) => (
    <article key={task.id} className={styles.taskCard}>
      <div className={styles.taskHeader}>
        <h2 className={styles.taskTitle}>{task.title}</h2>
        <span className={`${styles.taskStatus} ${getStatusClass(task.status)}`}>
          {getStatusLabel(task.status)}
        </span>
      </div>
      <p className={styles.taskDesc}>{task.description}</p>

      {/* Feedback from UMKM (If rejected or approved with note) */}
      {task.feedback && task.status !== "waiting_approval" && (
        <div className={`${styles.feedbackBox} ${task.status === "approved" ? styles.feedbackApproved : styles.feedbackRejected}`}>
          <p className={styles.feedbackTitle}>CATATAN UMKM:</p>
          <p className={styles.feedbackText}>{task.feedback}</p>
        </div>
      )}

      {(task.status === "todo" || task.status === "rejected") && activeTaskId !== task.id && (
        <button 
          className={styles.submitBtn} 
          onClick={() => {
            setActiveTaskId(task.id);
            setProofText(task.proofText || "");
            setSimulatedImage(task.proofMediaUrl || null);
          }}
        >
          <i className="ti ti-upload" /> {task.status === "rejected" ? "Perbaiki & Kirim Ulang" : "Laporkan Selesai"}
        </button>
      )}

      {/* Input Form Area */}
      {activeTaskId === task.id && (
        <div className={styles.proofSection}>
          <p className={styles.proofTitle}>LAPORKAN HASIL KERJA</p>
          <textarea 
            className={styles.proofTextarea} 
            placeholder="Ceritakan apa yang sudah Anda selesaikan..."
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
          />

          {!simulatedImage ? (
            <div className={styles.uploadSimulateBox} onClick={handleSimulateUpload}>
              <i className={`ti ti-camera ${styles.uploadIcon}`} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: 13 }}>Unggah Foto Bukti</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Klik untuk simulasi memilih foto</p>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
              <img src={simulatedImage} alt="Preview" className={styles.uploadedPreview} />
              <button 
                onClick={() => setSimulatedImage(null)}
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <i className="ti ti-x" style={{ fontSize: 14 }} />
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button 
              className={styles.submitBtn} 
              onClick={() => handleSubmitProof(task.id)}
              disabled={!proofText && !simulatedImage}
              style={{ opacity: (!proofText && !simulatedImage) ? 0.5 : 1, flex: 1 }}
            >
              Kirim
            </button>
            <button 
              onClick={() => setActiveTaskId(null)}
              style={{ background: "transparent", color: "#64748b", border: "none", fontWeight: 600, cursor: "pointer", padding: "8px 16px" }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Readonly View for Waiting/Approved */}
      {(task.status === "waiting_approval" || task.status === "approved") && activeTaskId !== task.id && (
        <div className={styles.submittedProofBox}>
          <p className={styles.proofTitle} style={{ marginBottom: 8 }}>BUKTI KERJA:</p>
          {task.proofText && <p className={styles.submittedText}>&ldquo;{task.proofText}&rdquo;</p>}
          {task.proofMediaUrl && <img src={task.proofMediaUrl} alt="Bukti kerja" className={styles.uploadedPreview} style={{ marginBottom: 0 }} />}
        </div>
      )}
    </article>
  );

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Manajemen Tugas</p>
          <h1>Meja Kerja / Tugas</h1>
          <p>Kelola tugas harian Anda dari UMKM dengan tampilan papan proyek.</p>
        </div>
        <Link href="/worker/dashboard" style={{
          textDecoration: "none", color: "#0ea5e9", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6
        }}>
          <i className="ti ti-arrow-left" /> Kembali ke Dashboard
        </Link>
      </section>

      <div className={styles.tasksBoard}>
        {/* TO DO COLUMN */}
        <div className={styles.boardColumn}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>🚀 To Do</span>
            <span className={styles.columnBadge}>{todoTasks.length}</span>
          </div>
          {todoTasks.map(renderTaskCard)}
          {todoTasks.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 20 }}>Tidak ada tugas baru.</p>
          )}
        </div>

        {/* IN REVIEW COLUMN */}
        <div className={styles.boardColumn}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>⏳ Menunggu Review</span>
            <span className={styles.columnBadge}>{reviewTasks.length}</span>
          </div>
          {reviewTasks.map(renderTaskCard)}
          {reviewTasks.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 20 }}>Belum ada tugas yang direview.</p>
          )}
        </div>

        {/* DONE COLUMN */}
        <div className={styles.boardColumn}>
          <div className={styles.columnHeader}>
            <span className={styles.columnTitle}>✅ Selesai</span>
            <span className={styles.columnBadge}>{doneTasks.length}</span>
          </div>
          {doneTasks.map(renderTaskCard)}
          {doneTasks.length === 0 && (
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 20 }}>Belum ada tugas selesai.</p>
          )}
        </div>
      </div>
    </main>
  );
}
