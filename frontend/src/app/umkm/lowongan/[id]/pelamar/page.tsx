"use client";

import { useState, useEffect } from "react";
import { fetchLowonganDetail } from "@/lib/api/lowongan";
import { getRelativeTime } from "@/lib/utils/lowongan";

export default function DetailPelamarPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const detail = await fetchLowonganDetail(params.id);
        setData(detail);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data pelamar");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  if (isLoading) return <div style={{ padding: "2rem" }}>Loading pelamar...</div>;
  if (error) return <div style={{ padding: "2rem", color: "var(--color-text-danger)" }}>Error: {error}</div>;

  return (
    <div style={{ background: "var(--color-background-tertiary)", padding: "2rem", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <a
          href={`/umkm/lowongan?selected=${params.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--color-background-info)",
            textDecoration: "none",
            marginBottom: "1.5rem",
            fontSize: "14px"
          }}
        >
          <i className="ti ti-arrow-left" aria-hidden="true" />
          Kembali ke Dashboard Lowongan
        </a>

        <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", padding: "2rem" }}>
          <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Daftar Pelamar</h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            Pelamar untuk lowongan: <strong>{data?.title}</strong>
          </p>

          {data?.pekerjaList && data.pekerjaList.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.pekerjaList.map((pekerja: any) => (
                <div
                  key={pekerja.id}
                  style={{
                    background: "var(--color-background-secondary)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    border: "1px solid var(--color-border-secondary)"
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--color-background-info)",
                      color: "var(--color-text-info)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "18px"
                    }}
                  >
                    {pekerja.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "16px", fontWeight: 500 }}>{pekerja.name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      <i className="ti ti-mail" style={{ marginRight: "4px" }} /> {pekerja.email || "Tidak ada email"}
                      <span style={{ margin: "0 8px" }}>•</span>
                      <i className="ti ti-phone" style={{ marginRight: "4px" }} /> {pekerja.phone || "Tidak ada nomor HP"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        background: pekerja.status === 'Active' ? "#E1F5EE" : "var(--color-background-primary)",
                        color: pekerja.status === 'Active' ? "#0F6E56" : "var(--color-text-secondary)",
                        padding: "6px 12px",
                        borderRadius: "var(--border-radius-md)",
                        fontSize: "12px",
                        fontWeight: 500,
                        border: pekerja.status === 'Active' ? "none" : "1px solid var(--color-border-secondary)"
                      }}
                    >
                      {pekerja.status}
                    </span>
                    <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--color-text-tertiary)" }}>
                      Melamar {getRelativeTime(pekerja.joinedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
              <i className="ti ti-users" style={{ fontSize: "48px", color: "var(--color-border-primary)", marginBottom: "1rem" }} />
              <p>Belum ada pelamar untuk lowongan ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}