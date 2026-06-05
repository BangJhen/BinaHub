"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchLowonganDetail, respondApplication } from "@/features/lowongan/api";
import { getRelativeTime } from "@/features/lowongan/format";

const STATUS_OPTIONS = ["Semua", "Submitted", "Reviewed", "Active", "Rejected", "Inactive"] as const;

const statusBadgeStyle = (status: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string; border?: string }> = {
    Submitted: { bg: "#e0f2fe", color: "#075985" },
    Reviewed: { bg: "#fef9c3", color: "#854d0e" },
    Active: { bg: "#dcfce7", color: "#15803d" },
    Rejected: { bg: "#fee2e2", color: "#b91c1c" },
    Inactive: { bg: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }
  };
  const s = map[status] || map.Submitted;
  return {
    background: s.bg,
    color: s.color,
    border: s.border || "none",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em"
  };
};

export default function DetailPelamarPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [search, setSearch] = useState("");
  const [activePelamar, setActivePelamar] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const detail = await fetchLowonganDetail(params.id);
        setData(detail);
        if (detail.pekerjaList && detail.pekerjaList.length > 0) {
          setActivePelamar(detail.pekerjaList[0]);
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat data pelamar");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  const filteredPelamar = useMemo(() => {
    if (!data?.pekerjaList) return [];
    let list = [...data.pekerjaList];
    if (statusFilter !== "Semua") {
      list = list.filter((p: any) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.skills || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: 0, Submitted: 0, Reviewed: 0, Active: 0, Rejected: 0, Inactive: 0 };
    (data?.pekerjaList || []).forEach((p: any) => {
      counts.Semua += 1;
      if (counts[p.status] !== undefined) counts[p.status] += 1;
    });
    return counts;
  }, [data]);

  const handleRespond = async (decision: "accept" | "reject") => {
    if (!activePelamar || isProcessing) return;
    
    // Konfirmasi
    const isAccepted = decision === "accept";
    const confirmMsg = isAccepted 
      ? `Apakah Anda yakin ingin MENERIMA ${activePelamar.name}? Pekerja akan ditambahkan ke sistem pemantauan.` 
      : `Apakah Anda yakin ingin MENOLAK lamaran ${activePelamar.name}?`;
      
    if (!confirm(confirmMsg)) return;

    setIsProcessing(true);
    try {
      await respondApplication(activePelamar.id, decision);
      
      alert(isAccepted ? "Berhasil menerima pelamar!" : "Berhasil menolak pelamar.");
      
      const newStatus = isAccepted ? "Active" : "Rejected";
      setData((prevData: any) => {
        if (!prevData) return prevData;
        const updatedList = prevData.pekerjaList.map((p: any) => 
          p.id === activePelamar.id ? { ...p, status: newStatus } : p
        );
        return { ...prevData, pekerjaList: updatedList };
      });
      setActivePelamar((prev: any) => ({ ...prev, status: newStatus }));

    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses keputusan.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", background: "#f6f8fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", color: "#0f6e99" }}>Memuat data pelamar...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: "2rem", background: "#f6f8fb", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", color: "#b91c1c" }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f6f8fb", padding: "2rem", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <a
          href={`/umkm/lowongan?selected=${params.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#0f6e99",
            textDecoration: "none",
            marginBottom: 20,
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <i className="ti ti-arrow-left" aria-hidden /> Kembali ke Dashboard Lowongan
        </a>

        {/* HEADER */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f6e99 0%, #1198c8 100%)",
            color: "#ffffff",
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 20,
            boxShadow: "0 16px 36px rgba(15, 110, 153, 0.18)"
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>
            Daftar Pelamar
          </p>
          <h1 style={{ margin: "6px 0 4px", fontSize: "1.75rem" }}>{data?.title}</h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.92 }}>
            <i className="ti ti-map-pin" aria-hidden /> {data?.location} • <i className="ti ti-briefcase" aria-hidden /> {data?.type} • {data?.applicants || 0} pelamar total
          </p>
        </div>

        {/* FILTER ROW */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #d6e6f2",
            padding: "16px 18px",
            marginBottom: 18,
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow: "0 8px 22px rgba(10, 44, 79, 0.04)"
          }}
        >
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
            <i
              className="ti ti-search"
              aria-hidden
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#7a8a99" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / email / skill"
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                border: "1px solid #d6e6f2",
                borderRadius: 10,
                fontSize: 13,
                outline: "none"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setStatusFilter(opt)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  border: statusFilter === opt ? "1px solid #0f6e99" : "1px solid #d6e6f2",
                  background: statusFilter === opt ? "#0f6e99" : "#ffffff",
                  color: statusFilter === opt ? "#ffffff" : "#4d6473",
                  cursor: "pointer"
                }}
              >
                {opt} {statusCounts[opt] !== undefined ? `(${statusCounts[opt]})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
            gap: 18,
            alignItems: "flex-start"
          }}
        >
          {/* LIST */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              border: "1px solid #d6e6f2",
              padding: 18,
              boxShadow: "0 12px 28px rgba(10, 44, 79, 0.05)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: "1rem", color: "#0a2c4f" }}>
                {filteredPelamar.length} Pelamar {statusFilter !== "Semua" ? `· ${statusFilter}` : ""}
              </h2>
            </div>

            {filteredPelamar.length === 0 ? (
              <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#7a8a99" }}>
                <i className="ti ti-users" aria-hidden style={{ fontSize: 38, color: "#cce5f4" }} />
                <p style={{ marginTop: 12, fontSize: 14 }}>Tidak ada pelamar pada filter ini.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredPelamar.map((pekerja: any) => {
                  const isActive = activePelamar?.id === pekerja.id;
                  const initials = pekerja.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
                  return (
                    <button
                      key={pekerja.id}
                      type="button"
                      onClick={() => setActivePelamar(pekerja)}
                      style={{
                        display: "flex",
                        gap: 14,
                        padding: 14,
                        border: isActive ? "1.5px solid #0f6e99" : "1px solid #e5edf4",
                        background: isActive ? "#f0f9ff" : "#ffffff",
                        borderRadius: 14,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s"
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #0f6e99, #1198c8)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0a2c4f" }}>{pekerja.name}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#7a8a99" }}>
                          {pekerja.city || "-"} • Melamar {getRelativeTime(pekerja.joinedAt)}
                        </p>
                      </div>
                      <span style={statusBadgeStyle(pekerja.status)}>{pekerja.status}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DETAIL */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              border: "1px solid #d6e6f2",
              padding: 22,
              boxShadow: "0 12px 28px rgba(10, 44, 79, 0.05)",
              position: "sticky",
              top: 24
            }}
          >
            {!activePelamar ? (
              <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#7a8a99" }}>
                <i className="ti ti-user-circle" aria-hidden style={{ fontSize: 42, color: "#cce5f4" }} />
                <p style={{ marginTop: 12, fontSize: 14 }}>Pilih pelamar untuk melihat detail.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0f6e99, #1198c8)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 22
                    }}
                  >
                    {activePelamar.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0a2c4f" }}>{activePelamar.name}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#7a8a99" }}>
                      Melamar {getRelativeTime(activePelamar.joinedAt)}
                    </p>
                  </div>
                  <span style={statusBadgeStyle(activePelamar.status)}>{activePelamar.status}</span>
                </div>

                <div style={{ display: "grid", gap: 10, marginBottom: 18, fontSize: 13, color: "#4d6473" }}>
                  <div>
                    <i className="ti ti-mail" aria-hidden style={{ color: "#0f6e99", marginRight: 6 }} />
                    {activePelamar.email || "Email tidak tersedia"}
                  </div>
                  <div>
                    <i className="ti ti-phone" aria-hidden style={{ color: "#0f6e99", marginRight: 6 }} />
                    {activePelamar.phone || "Nomor HP tidak tersedia"}
                  </div>
                  <div>
                    <i className="ti ti-map-pin" aria-hidden style={{ color: "#0f6e99", marginRight: 6 }} />
                    {activePelamar.city || "Kota tidak tersedia"}
                  </div>
                </div>

                {activePelamar.skills && (
                  <section style={{ marginBottom: 18 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#0f6e99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                      Skills
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {activePelamar.skills
                        .split(/[,;]+/)
                        .map((s: string) => s.trim())
                        .filter(Boolean)
                        .map((skill: string) => (
                          <span
                            key={skill}
                            style={{
                              padding: "4px 10px",
                              fontSize: 12,
                              background: "#f0f9ff",
                              border: "1px solid #cce5f4",
                              borderRadius: 999,
                              color: "#0f6e99",
                              fontWeight: 600
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </section>
                )}

                {activePelamar.experienceSummary && (
                  <section style={{ marginBottom: 18 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#0f6e99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                      Ringkasan Pengalaman
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: "#4d6473", lineHeight: 1.55 }}>
                      {activePelamar.experienceSummary}
                    </p>
                  </section>
                )}

                {activePelamar.coverLetter && (
                  <section style={{ marginBottom: 18 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#0f6e99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                      Surat Lamaran
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#4d6473",
                        lineHeight: 1.55,
                        background: "#f6fafe",
                        border: "1px solid #e5edf4",
                        borderRadius: 12,
                        padding: 12
                      }}
                    >
                      {activePelamar.coverLetter}
                    </p>
                  </section>
                )}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href={`mailto:${activePelamar.email}`}
                    style={{
                      flex: "1 1 140px",
                      padding: "10px 14px",
                      background: "#0f6e99",
                      color: "#ffffff",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                      textDecoration: "none"
                    }}
                  >
                    <i className="ti ti-mail" aria-hidden /> Kirim Email
                  </a>
                  <a
                    href={`/umkm/workers/${activePelamar.workerId}`}
                    style={{
                      flex: "1 1 140px",
                      padding: "10px 14px",
                      background: "#ffffff",
                      color: "#0f6e99",
                      border: "1px solid #cce5f4",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: "center",
                      textDecoration: "none"
                    }}
                  >
                    <i className="ti ti-user-circle" aria-hidden /> Lihat Profil
                  </a>
                </div>

                {(activePelamar.status === "Submitted" || activePelamar.status === "Reviewed" || activePelamar.status === "Pending") && (
                  <div style={{ display: "flex", gap: 10, marginTop: 18, paddingTop: 18, borderTop: "1px solid #e5edf4", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleRespond("reject")}
                      disabled={isProcessing}
                      style={{
                        flex: "1 1 140px",
                        padding: "10px 14px",
                        background: "#ffffff",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        opacity: isProcessing ? 0.6 : 1
                      }}
                    >
                      {isProcessing ? "Memproses..." : "Tolak Lamaran"}
                    </button>
                    <button
                      onClick={() => handleRespond("accept")}
                      disabled={isProcessing}
                      style={{
                        flex: "1 1 140px",
                        padding: "10px 14px",
                        background: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
                        opacity: isProcessing ? 0.6 : 1
                      }}
                    >
                      {isProcessing ? "Memproses..." : "Terima Pelamar"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
