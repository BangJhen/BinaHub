"use client";

import { useRouter } from "next/navigation";
import LowonganForm from "./components/LowonganForm";

export default function CreateLowonganPage() {
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null
      };
      const response = await fetch("/api/umkm/lowongan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create lowongan");
      }

      const data = await response.json();
      router.push(`/umkm/lowongan?selected=${data.data.id}`);
    } catch (error: any) {
      alert(error.message || "Gagal membuat lowongan");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f3faff 100%)",
        padding: "2rem",
        minHeight: "100vh"
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <a
          href="/umkm/lowongan"
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

        <div
          style={{
            background: "linear-gradient(135deg, #0f6e99 0%, #1198c8 100%)",
            color: "#ffffff",
            borderRadius: 20,
            padding: "26px 30px",
            marginBottom: 20,
            boxShadow: "0 16px 32px rgba(15, 110, 153, 0.18)"
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.85
            }}
          >
            Lowongan Baru
          </p>
          <h1 style={{ margin: "6px 0 4px", fontSize: "1.75rem" }}>Buat Lowongan Baru</h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.92 }}>
            Lengkapi informasi lowongan untuk menemukan kandidat yang paling cocok dengan UMKM Anda.
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: "26px 28px",
            border: "1px solid #d6e6f2",
            boxShadow: "0 12px 28px rgba(10, 44, 79, 0.06)"
          }}
        >
          <LowonganForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
