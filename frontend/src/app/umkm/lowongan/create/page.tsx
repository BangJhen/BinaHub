"use client";

import { useRouter } from "next/navigation";
import LowonganForm from "./components/LowonganForm";

export default function CreateLowonganPage() {
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch("/api/umkm/lowongan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to create lowongan");

      const data = await response.json();
      router.push(`/umkm/lowongan?selected=${data.data.id}`);
    } catch (error) {
      alert("Gagal membuat lowongan");
    }
  };

  return (
    <div style={{ background: "var(--color-background-tertiary)", padding: "2rem", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <a
          href="/umkm/lowongan"
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
          <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Buat Lowongan Baru</h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            Isi informasi lengkap tentang lowongan yang ingin Anda buat
          </p>

          <LowonganForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
