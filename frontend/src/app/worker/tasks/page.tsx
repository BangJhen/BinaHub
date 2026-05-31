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
      case "todo": return "Belum Dikerjakan";
      case "waiting_approval": return "Menunggu Review UMKM";
      case "approved": return "Disetujui";
      case "rejected": return "Perlu Perbaikan (Ditolak)";
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

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Manajemen Tugas</p>
          <h1>Todo List & Hasil Kerja</h1>
          <p>Lihat tugas yang diberikan UMKM dan laporkan hasilnya beserta bukti foto.</p>
        </div>
        <Link href="/worker/dashboard" style={{
          textDecoration: "none", color: "#0ea5e9", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6
        }}>
          <i className="ti ti-arrow-left" /> Kembali ke Dashboard
        </Link>
      </section>

      <div className={styles.tasksGrid}>
        {tasks.map(task => (
          <article key={task.id} className={styles.taskCard}>
            <div className={styles.taskHeader}>
              <h2 className={styles.taskTitle}>{task.title}</h2>
              <span className={`${styles.taskStatus} ${getStatusClass(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>
            <p className={styles.taskDesc}>{task.description}</p>

            {(task.status === "todo" || task.status === "rejected") && activeTaskId !== task.id && (
              <button 
                className={styles.submitBtn} 
                onClick={() => {
                  setActiveTaskId(task.id);
                  setProofText(task.proofText || "");
                  setSimulatedImage(task.proofMediaUrl || null);
                }}
              >
                <i className="ti ti-upload" /> {task.status === "rejected" ? "Perbaiki & Kirim Ulang Bukti" : "Laporkan Selesai"}
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
                      <p style={{ margin: "0 0 4px 0", fontWeight: 600, fontSize: 14 }}>Unggah Foto Bukti</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Klik untuk simulasi memilih foto dari galeri</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img src={simulatedImage} alt="Preview" className={styles.uploadedPreview} />
                    <button 
                      onClick={() => setSimulatedImage(null)}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <i className="ti ti-x" style={{ fontSize: 14 }} />
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <button 
                    className={styles.submitBtn} 
                    onClick={() => handleSubmitProof(task.id)}
                    disabled={!proofText && !simulatedImage}
                    style={{ opacity: (!proofText && !simulatedImage) ? 0.5 : 1 }}
                  >
                    Kirim ke UMKM
                  </button>
                  <button 
                    onClick={() => setActiveTaskId(null)}
                    style={{ background: "transparent", color: "#64748b", border: "none", fontWeight: 600, cursor: "pointer" }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Readonly View for Waiting/Approved */}
            {(task.status === "waiting_approval" || task.status === "approved") && activeTaskId !== task.id && (
              <div className={styles.submittedProofBox}>
                <p className={styles.proofTitle} style={{ marginBottom: 8 }}>BUKTI YANG DIKIRIM:</p>
                {task.proofText && <p className={styles.submittedText}>"{task.proofText}"</p>}
                {task.proofMediaUrl && <img src={task.proofMediaUrl} alt="Bukti kerja" className={styles.uploadedPreview} />}
              </div>
            )}

            {/* Feedback from UMKM */}
            {task.feedback && task.status !== "waiting_approval" && (
              <div className={`${styles.feedbackBox} ${task.status === "approved" ? styles.feedbackApproved : styles.feedbackRejected}`}>
                <p className={styles.feedbackTitle}>CATATAN DARI UMKM:</p>
                <p className={styles.feedbackText}>{task.feedback}</p>
              </div>
            )}

          </article>
        ))}
      </div>
    </main>
  );
}
