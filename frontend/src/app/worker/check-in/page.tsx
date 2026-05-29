"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./check-in.module.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function WorkspacePage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await fetch("/api/worker/workspace");
        if (res.ok) {
          const data = await res.json();
          setWorkspaceData(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data meja kerja", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspace();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!content.trim()) {
      setErrorMsg("Jurnal tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/worker/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan jurnal");
      }

      setSuccess(true);
      setContent("");
      
      // Update history in UI
      setWorkspaceData((prev: any) => ({
        ...prev,
        history: [data.checkin, ...(prev.history || [])]
      }));

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
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
          <h2>Belum Ada Pekerjaan Aktif 💼</h2>
          <p>Kamu saat ini belum tergabung dengan UMKM mana pun. Jangan menyerah, yuk cari lowongan yang cocok untukmu!</p>
          <Link href="/worker/lowongan" className={styles.browseJobsBtn}>
            Eksplor Lowongan
          </Link>
        </div>
      ) : (
        <div className={styles.workspaceLayout}>
          {/* KOLOM KIRI: INFO KERJA & TUGAS */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📌 Info Penempatan</h2>
              <div className={styles.placementInfo}>
                <div className={styles.companyName}>{placement.umkm?.business_name || "UMKM TBD"}</div>
                <div className={styles.jobTitle}>{placement.jobs?.title} ({placement.jobs?.employment_type || "Tetap"})</div>
                <div className={styles.placementMeta}>
                  Mulai kerja: {placement.start_date ? format(new Date(placement.start_date), "dd MMMM yyyy", { locale: id }) : "-"}
                </div>
              </div>

              {placement.notes && (
                <div className={styles.instructionBox}>
                  <strong>Catatan UMKM:</strong><br />
                  {placement.notes}
                </div>
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📝 Riwayat Jurnal Terakhir</h2>
              {history.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Belum ada jurnal yang dikirim.</p>
              ) : (
                <ul className={styles.notesList}>
                  {history.map((h: any) => (
                    <li key={h.id} className={styles.noteItem}>
                      <div className={styles.noteDate}>
                        {format(new Date(h.submitted_at), "EEEE, dd MMM yyyy - HH:mm", { locale: id })}
                      </div>
                      <div className={styles.noteContent}>"{h.content}"</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: JURNAL HARI INI */}
          <div className={styles.mainArea}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>✍️ Jurnal Harian (Daily Check-in)</h2>
              <p style={{ marginBottom: "1.5rem", fontSize: "0.95rem", color: "#64748b" }}>
                Ceritakan apa yang kamu kerjakan dan rasakan hari ini. Laporan ini rahasia dan akan membantu sistem AI kami memonitor kondisimu secara positif agar mendapat pendampingan yang tepat!
              </p>

              {success && (
                <div className={styles.successMsg}>
                  Terima kasih! Jurnal harianmu telah berhasil disimpan. Semangat terus!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <textarea
                    id="journal-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Contoh: Alhamdulillah hari ini kerjaan lancar, bos ngasih pujian karena aku datang tepat waktu. Tadi ada godaan diajak teman lama nongkrong malam, tapi aku tolak..."
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
    </div>
  );
}
