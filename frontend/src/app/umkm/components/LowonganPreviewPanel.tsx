"use client";

import { Lowongan } from "@/types/lowongan";
import { formatDate, getRelativeTime, getStatusColor, getHiringProgress } from "@/lib/utils/lowongan";
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
  const statusColor = getStatusColor(lowongan.status);
  const hiringProgress = getHiringProgress(lowongan.hired, lowongan.positions);

  const handleClose = async () => {
    if (confirm("Apakah Anda yakin ingin menutup lowongan ini?")) {
      setIsClosing(true);
      try {
        await onClose(lowongan.id);
      } finally {
        setIsClosing(false);
      }
    }
  };

  return (
    <div
      key={lowongan.id}
      className={styles.slideIn}
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1.5rem",
        overflow: "auto",
        maxHeight: "600px"
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
              {lowongan.jobCode}
            </p>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 500 }}>{lowongan.title}</h2>
          </div>
          <span
            style={{
              background: statusColor.bg,
              color: statusColor.text,
              padding: "6px 12px",
              borderRadius: "var(--border-radius-md)",
              fontSize: "12px",
              fontWeight: 500
            }}
          >
            {lowongan.status}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--color-text-secondary)" }}>
          {lowongan.location} • {lowongan.type} • Rp {lowongan.salary}
        </p>
      </div>

      <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 500 }}>Ringkas Persyaratan</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>Pendidikan</p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 500 }}>
              {lowongan.educationLevel || "Tidak disebutkan"}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>Pengalaman</p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 500 }}>
              {lowongan.experienceRequired || "Tidak disebutkan"}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>Rentang Usia</p>
            <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: 500 }}>
              {lowongan.ageRange || "Tidak disebutkan"}
            </p>
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>Skills</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
            {(lowongan.skills || []).length > 0 ? (
              lowongan.skills?.map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: "var(--color-background-secondary)",
                    fontSize: "11px",
                    color: "var(--color-text-primary)"
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Belum ada</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>Benefit</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
            {(lowongan.benefits || []).length > 0 ? (
              lowongan.benefits?.map((benefit) => (
                <span
                  key={benefit}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: "var(--color-background-secondary)",
                    fontSize: "11px",
                    color: "var(--color-text-primary)"
                  }}
                >
                  {benefit}
                </span>
              ))
            ) : (
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Belum ada</span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 500 }}>Timeline</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-text-secondary)" }}>
          <i className="ti ti-calendar-plus" style={{ fontSize: "16px" }} aria-hidden="true" />
          <span>Dibuat:</span>
          <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
            {formatDate(lowongan.createdAt)} • {getRelativeTime(lowongan.createdAt)}
          </span>
        </div>
      </div>

      {/* Statistik Views */}
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 500 }}>Statistik Views</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div
            style={{ background: "var(--color-background-secondary)", padding: "1rem", borderRadius: "var(--border-radius-md)" }}
          >
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--color-text-secondary)" }}>Total Views</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 500 }}>{lowongan.views}</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-secondary)" }}>All time</p>
          </div>
          <div
            style={{ background: "var(--color-background-secondary)", padding: "1rem", borderRadius: "var(--border-radius-md)" }}
          >
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--color-text-secondary)" }}>Views Minggu Ini</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 500 }}>{lowongan.viewsThisWeek}</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--color-text-secondary)" }}>7 hari terakhir</p>
          </div>
        </div>
      </div>

      {/* Pelamar & Hired */}
      <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 500 }}>Pelamar</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1rem" }}>
          <div
            style={{ background: "var(--color-background-secondary)", padding: "1rem", borderRadius: "var(--border-radius-md)" }}
          >
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--color-text-secondary)" }}>Total Pelamar</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 500 }}>{lowongan.applicants}</p>
          </div>
          <div style={{ background: "var(--color-background-info)", padding: "1rem", borderRadius: "var(--border-radius-md)" }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--color-text-secondary)" }}>Terisi</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 500, color: "var(--color-text-info)" }}>
              {lowongan.hired}/{lowongan.positions}
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-secondary)" }}>
          <i
            className="ti ti-info-circle"
            style={{ fontSize: "14px", marginRight: "6px", verticalAlign: "-1px" }}
            aria-hidden="true"
          />
          {lowongan.hired}/{lowongan.positions} posisi terisi
        </p>
      </div>

      {/* Pekerja Terisi */}
      {lowongan.pekerjaList && lowongan.pekerjaList.length > 0 && (
        <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 500 }}>Pekerja Terisi</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {lowongan.pekerjaList.map((pekerja) => (
              <div
                key={pekerja.id}
                style={{
                  background: "var(--color-background-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  padding: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#B5D4F4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "var(--color-text-primary)"
                    }}
                  >
                    {pekerja.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 500 }}>{pekerja.name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary)" }}>
                      Bergabung {getRelativeTime(pekerja.joinedAt)}
                    </p>
                  </div>
                  <span
                    style={{
                      background: "#E1F5EE",
                      color: "#0F6E56",
                      padding: "4px 8px",
                      borderRadius: "var(--border-radius-md)",
                      fontSize: "11px",
                      fontWeight: 500
                    }}
                  >
                    {pekerja.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={() => {
            window.location.href = `/umkm/lowongan/${lowongan.id}/pelamar`;
          }}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            color: "var(--color-text-primary)"
          }}
        >
          <i className="ti ti-eye" style={{ fontSize: "16px", marginRight: "6px", verticalAlign: "-2px" }} aria-hidden="true" />
          Lihat Semua Pelamar
        </button>
        <button
          onClick={() => onEdit(lowongan.id)}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            color: "var(--color-text-primary)"
          }}
        >
          <i className="ti ti-edit" style={{ fontSize: "16px", marginRight: "6px", verticalAlign: "-2px" }} aria-hidden="true" />
          Edit Lowongan
        </button>
        <button
          onClick={() => onDuplicate(lowongan.id)}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            color: "var(--color-text-primary)"
          }}
        >
          <i className="ti ti-copy" style={{ fontSize: "16px", marginRight: "6px", verticalAlign: "-2px" }} aria-hidden="true" />
          Duplikasi Lowongan
        </button>
        <button
          onClick={handleClose}
          disabled={isClosing}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "0.5px solid var(--color-border-danger)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: isClosing ? "not-allowed" : "pointer",
            color: "var(--color-text-danger)",
            opacity: isClosing ? 0.6 : 1
          }}
        >
          <i className="ti ti-x" style={{ fontSize: "16px", marginRight: "6px", verticalAlign: "-2px" }} aria-hidden="true" />
          {isClosing ? "Menutup..." : "Tutup Lowongan"}
        </button>
      </div>
    </div>
  );
}
