"use client";

import { Lowongan } from "@/features/lowongan/types";
import { formatDate, getRelativeTime, getStatusColor, getHiringProgress } from "@/features/lowongan/format";
import { useState } from "react";
import styles from "./lowongan.module.css";

interface LowonganPreviewPanelProps {
  lowongan: Lowongan;
  onEdit: (id: string) => void;
  onClose: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function LowonganPreviewPanel({ lowongan, onEdit, onClose, onDuplicate }: LowonganPreviewPanelProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const statusColor = getStatusColor(lowongan.status as string);
  const hiringProgress = getHiringProgress(lowongan.hired || 0, lowongan.positions || 1);
  const isClosed = lowongan.status === "Ditutup";

  const handleClose = async () => {
    const message = isClosed
      ? "Buka kembali lowongan ini?"
      : "Apakah Anda yakin ingin menutup lowongan ini?";
    if (!confirm(message)) return;

    setIsClosing(true);
    try {
      await onClose(lowongan.id);
    } finally {
      setIsClosing(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      await onDuplicate(lowongan.id);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div className={styles.previewPanel}>
      <div className={styles.previewHeader}>
        <div className={styles.previewMeta}>
          <p className={styles.previewCode}>{lowongan.jobCode}</p>
          <span
            className={styles.statusBadge}
            style={{
              background: statusColor.bg,
              color: statusColor.text,
              borderColor: statusColor.border
            }}
          >
            {lowongan.status}
          </span>
        </div>
        <h2 className={styles.previewTitle}>{lowongan.title}</h2>
        <div className={styles.previewSubMeta}>
          <span><i className="ti ti-map-pin" aria-hidden /> {lowongan.location}</span>
          <span><i className="ti ti-briefcase" aria-hidden /> {lowongan.type}</span>
          <span><i className="ti ti-coin" aria-hidden /> {lowongan.salary}</span>
        </div>
      </div>

      {/* META */}
      <section className={styles.previewSection}>
        <h3 className={styles.sectionTitle}>Ringkasan Persyaratan</h3>
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <p className={styles.metaLabel}>Pendidikan</p>
            <p className={styles.metaValue}>{lowongan.educationLevel || "Tidak disebutkan"}</p>
          </div>
          <div className={styles.metaItem}>
            <p className={styles.metaLabel}>Pengalaman</p>
            <p className={styles.metaValue}>{lowongan.experienceRequired || "Tidak disebutkan"}</p>
          </div>
          <div className={styles.metaItem}>
            <p className={styles.metaLabel}>Rentang Usia</p>
            <p className={styles.metaValue}>{lowongan.ageRange || "Tidak disebutkan"}</p>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <p className={styles.metaLabel} style={{ marginBottom: 8 }}>Skills</p>
          <div className={styles.tagWrap}>
            {(lowongan.skills || []).length > 0 ? (
              (lowongan.skills || []).map((s) => (
                <span key={s} className={styles.tag}>{s}</span>
              ))
            ) : (
              <span style={{ fontSize: 13, color: "#6f8190" }}>Belum ada</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <p className={styles.metaLabel} style={{ marginBottom: 8 }}>Benefit</p>
          <div className={styles.tagWrap}>
            {(lowongan.benefits || []).length > 0 ? (
              (lowongan.benefits || []).map((b) => (
                <span key={b} className={styles.tag} style={{ background: "#fef3c7", color: "#92400e", borderColor: "#fde68a" }}>
                  {b}
                </span>
              ))
            ) : (
              <span style={{ fontSize: 13, color: "#6f8190" }}>Belum ada</span>
            )}
          </div>
        </div>
      </section>

      {/* DESC */}
      {lowongan.description && (
        <section className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>Deskripsi Pekerjaan</h3>
          <p style={{ margin: 0, fontSize: 13, color: "#324b5e", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
            {lowongan.description}
          </p>
        </section>
      )}

      {/* TIMELINE */}
      <section className={styles.previewSection}>
        <h3 className={styles.sectionTitle}>Timeline</h3>
        <div style={{ display: "grid", gap: 8, fontSize: 13, color: "#4d6473" }}>
          <div>
            <i className="ti ti-calendar-plus" aria-hidden style={{ marginRight: 6, color: "#0f6e99" }} />
            <strong style={{ color: "#0a2c4f" }}>Dibuat:</strong>{" "}
            {formatDate(lowongan.createdAt)} • {getRelativeTime(lowongan.createdAt)}
          </div>
          {lowongan.publishedAt && (
            <div>
              <i className="ti ti-broadcast" aria-hidden style={{ marginRight: 6, color: "#16a34a" }} />
              <strong style={{ color: "#0a2c4f" }}>Dipublikasi:</strong>{" "}
              {formatDate(lowongan.publishedAt)}
            </div>
          )}
          {lowongan.closedAt && (
            <div>
              <i className="ti ti-circle-x" aria-hidden style={{ marginRight: 6, color: "#dc2626" }} />
              <strong style={{ color: "#0a2c4f" }}>Ditutup:</strong>{" "}
              {formatDate(lowongan.closedAt)}
            </div>
          )}
        </div>
      </section>

      {/* STATS */}
      <section className={styles.previewSection}>
        <h3 className={styles.sectionTitle}>Statistik</h3>
        <div className={styles.statRow}>
          <div className={styles.statBox}>
            <p className={styles.metaLabel}>Total Views</p>
            <p className={styles.statValue}>{lowongan.views}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#6f8190" }}>+{lowongan.viewsThisWeek} minggu ini</p>
          </div>
          <div className={styles.statBox}>
            <p className={styles.metaLabel}>Pelamar</p>
            <p className={styles.statValue}>{lowongan.applicants}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#6f8190" }}>{lowongan.hired} diterima</p>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#4d6473" }}>
            <span>Progres rekrutmen</span>
            <strong style={{ color: "#0a2c4f" }}>{hiringProgress}%</strong>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "#ebf2f7", overflow: "hidden" }}>
            <div
              style={{
                width: `${hiringProgress}%`,
                height: "100%",
                background: hiringProgress >= 100 ? "#16a34a" : "#0f6e99",
                transition: "width 0.4s ease"
              }}
            />
          </div>
        </div>
      </section>

      {/* APPLICANTS */}
      {lowongan.pekerjaList && lowongan.pekerjaList.length > 0 && (
        <section className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>Pelamar Terbaru ({lowongan.pekerjaList.length})</h3>
          <div className={styles.applicantList}>
            {lowongan.pekerjaList.slice(0, 4).map((pekerja) => (
              <div key={pekerja.id} className={styles.applicantRow}>
                <div className={styles.applicantAvatar}>
                  {pekerja.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className={styles.applicantInfo}>
                  <p className={styles.applicantName}>{pekerja.name}</p>
                  <p className={styles.applicantMeta}>
                    {pekerja.city || pekerja.email || "-"} • {pekerja.status}
                  </p>
                </div>
                <span className={styles.appliedAt}>{getRelativeTime(pekerja.joinedAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ACTIONS */}
      <section className={styles.previewSection}>
        <div className={styles.actionGrid}>
          <a
            href={`/umkm/lowongan/${lowongan.id}/pelamar`}
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          >
            <i className="ti ti-users" aria-hidden /> Lihat Pelamar
          </a>
          <button
            type="button"
            onClick={() => onEdit(lowongan.id)}
            className={styles.actionBtn}
          >
            <i className="ti ti-edit" aria-hidden /> Edit
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isDuplicating}
            className={styles.actionBtn}
          >
            <i className="ti ti-copy" aria-hidden /> {isDuplicating ? "..." : "Duplikasi"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={isClosing}
            className={`${styles.actionBtn} ${isClosed ? "" : styles.actionBtnDanger}`}
          >
            {isClosed ? (
              <><i className="ti ti-refresh" aria-hidden /> {isClosing ? "..." : "Buka Lagi"}</>
            ) : (
              <><i className="ti ti-x" aria-hidden /> {isClosing ? "..." : "Tutup"}</>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
