"use client";

import { useEffect, useState } from "react";
import type { WorkerLowongan } from "@/lib/lowongan-queries";

function formatRupiah(amount: number | null) {
  if (!amount) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getSalary(job: WorkerLowongan) {
  if (job.salary_min && job.salary_max)
    return `${formatRupiah(job.salary_min)} – ${formatRupiah(job.salary_max)}`;
  if (job.salary_min) return `Mulai ${formatRupiah(job.salary_min)}`;
  if (job.salary_max) return `Hingga ${formatRupiah(job.salary_max)}`;
  return "Gaji Dirahasiakan";
}

function getRelativeTime(dateString: string | null | undefined) {
  if (!dateString) return "Baru saja";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

const LOGO_COLORS = [
  ["#eaf3fb", "#0f6e99"],
  ["#f0fdf4", "#16a34a"],
  ["#fef3c7", "#d97706"],
  ["#fdf2f8", "#9333ea"],
  ["#fff1f2", "#e11d48"],
];

function getLogoColor(name: string) {
  const idx = name.charCodeAt(0) % LOGO_COLORS.length;
  return LOGO_COLORS[idx];
}

export default function SavedLowonganPage() {
  const [list, setList] = useState<WorkerLowongan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/worker/lowongan/saved", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal mengambil data lowongan tersimpan");
        const data = await res.json();
        setList(Array.isArray(data) ? data : data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUnsave = async (jobId: string) => {
    if (removingIds.includes(jobId)) return;
    setRemovingIds((prev) => [...prev, jobId]);

    // Optimistic remove
    const snapshot = list;
    setList((prev) => prev.filter((j) => j.id !== jobId));

    try {
      const res = await fetch(`/api/worker/lowongan/${jobId}/save`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal menghapus simpanan");
      }
    } catch (err: any) {
      // Rollback
      setList(snapshot);
      setError(err.message || "Gagal menghapus simpanan");
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  return (
    <main style={{ maxWidth: 1320, margin: "0 auto", padding: "0 0 80px", minHeight: "100vh" }}>
      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #0a2c4f 0%, #0f6e99 100%)",
        padding: "40px 24px 44px",
        marginBottom: 32,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: "30%", width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
            <i className="ti ti-bookmark-filled" /> Koleksi Saya
          </p>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#ffffff" }}>
            Lowongan Tersimpan
          </h1>
          <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 1.6 }}>
            Lowongan yang Anda tandai untuk dilamar nanti. Jangan sampai kehabisan!
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
            }}>
              {isLoading ? "..." : list.length} lowongan tersimpan
            </span>
            <a href="/worker/lowongan" style={{
              background: "#ffffff",
              color: "#0f6e99",
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}>
              <i className="ti ti-search" /> Cari Lowongan Lainnya
            </a>
          </div>
        </div>
      </section>

      <div style={{ padding: "0 24px" }}>
        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ background: "#fff", border: "1px solid #d6e6f2", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #ebf2f7", display: "flex", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: "#ebf2f7", animation: "pulse 1.5s infinite" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ width: "60%", height: 16, background: "#ebf2f7", borderRadius: 4 }} />
                    <div style={{ width: "40%", height: 12, background: "#ebf2f7", borderRadius: 4 }} />
                  </div>
                </div>
                <div style={{ padding: "14px 20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ width: "80%", height: 12, background: "#ebf2f7", borderRadius: 4 }} />
                  <div style={{ width: "60%", height: 12, background: "#ebf2f7", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px", color: "#b91c1c", fontSize: 14, marginBottom: 16 }}>
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && list.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 20, border: "1px solid #d6e6f2" }}>
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: "linear-gradient(135deg, #eaf3fb, #cfe1ee)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <i className="ti ti-bookmark-off" style={{ fontSize: 40, color: "#0f6e99" }} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0a2c4f", margin: "0 0 10px" }}>
              Belum ada lowongan tersimpan
            </h3>
            <p style={{ color: "#4d6473", fontSize: 14, lineHeight: 1.6, margin: "0 0 28px", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
              Tekan ikon bookmark pada lowongan yang menarik untuk menyimpannya di sini.
            </p>
            <a href="/worker/lowongan" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #0f6e99, #1198c8)",
              color: "#fff", padding: "12px 28px", borderRadius: 12,
              fontWeight: 700, fontSize: 14, textDecoration: "none",
              boxShadow: "0 8px 20px rgba(15,110,153,0.25)",
            }}>
              <i className="ti ti-search" /> Jelajahi Lowongan
            </a>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && list.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {list.map((job) => {
              const [logoBg, logoColor] = getLogoColor(job.umkm_name);
              const isRemoving = removingIds.includes(job.id);
              return (
                <article key={job.id} style={{
                  background: "#ffffff",
                  border: "1px solid #d6e6f2",
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                  opacity: isRemoving ? 0.5 : 1,
                  boxShadow: "0 2px 8px rgba(10,44,79,0.04)",
                }}>
                  {/* Card header */}
                  <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #ebf2f7", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                      background: logoBg, color: logoColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 800,
                    }}>
                      {job.umkm_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: "#0a2c4f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {job.title}
                      </h3>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#0f6e99", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                        {job.umkm_name}
                        <span style={{ background: "#16a34a", color: "#fff", fontSize: 9, width: 15, height: 15, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="ti ti-check" style={{ fontSize: 9 }} />
                        </span>
                      </p>
                      {job.business_sector && (
                        <p style={{ margin: 0, fontSize: 12, color: "#6f8190", display: "flex", alignItems: "center", gap: 4 }}>
                          <i className="ti ti-building-store" /> {job.business_sector}
                        </p>
                      )}
                    </div>
                    {/* Unsave button */}
                    <button
                      onClick={() => handleUnsave(job.id)}
                      disabled={isRemoving}
                      title="Hapus dari simpanan"
                      aria-label="Hapus dari simpanan"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "1.5px solid #fecaca",
                        background: "#fef2f2",
                        color: "#dc2626",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: isRemoving ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        opacity: isRemoving ? 0.6 : 1,
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        if (!isRemoving) {
                          e.currentTarget.style.background = "#fee2e2";
                          e.currentTarget.style.borderColor = "#fca5a5";
                          e.currentTarget.style.color = "#b91c1c";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                        e.currentTarget.style.borderColor = "#fecaca";
                        e.currentTarget.style.color = "#dc2626";
                      }}
                    >
                      <i className="ti ti-bookmark-filled" />
                      Hapus
                    </button>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "14px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Salary */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
                      <i className="ti ti-coin" />
                      {getSalary(job)}
                    </div>

                    {/* Meta pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <i className="ti ti-map-pin" style={{ color: "#0f6e99" }} /> {job.location}
                      </span>
                      <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <i className="ti ti-briefcase" style={{ color: "#0f6e99" }} /> {job.employment_type}
                      </span>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} style={{ background: "#eaf3fb", color: "#0f6e99", padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, border: "1px solid #cfe1ee" }}>
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div style={{
                    padding: "12px 18px 14px",
                    borderTop: "1px solid #ebf2f7",
                    background: "#f8fbfe",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 11, color: "#8198a8", display: "flex", alignItems: "center", gap: 4 }}>
                        <i className="ti ti-bookmark" /> Disimpan {getRelativeTime(job.saved_at)}
                      </span>
                      <span style={{ fontSize: 11, color: "#8198a8", display: "flex", alignItems: "center", gap: 4 }}>
                        <i className="ti ti-calendar" /> Diposting {getRelativeTime(job.published_at)}
                      </span>
                    </div>
                    <a
                      href={`/worker/lowongan/${job.id}`}
                      style={{
                        background: "linear-gradient(135deg, #0f6e99, #1198c8)",
                        color: "#fff",
                        padding: "8px 18px",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 4px 12px rgba(15,110,153,0.2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Lihat Detail <i className="ti ti-arrow-right" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
