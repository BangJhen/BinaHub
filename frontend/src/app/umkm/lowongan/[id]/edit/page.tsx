"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchLowonganDetail } from "@/lib/api/lowongan";
import LowonganForm from "../../create/components/LowonganForm";

export default function EditLowonganPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchLowonganDetail(params.id);
        
        let salaryMin = "";
        let salaryMax = "";
        if (data.salary && data.salary !== "Tidak dicantumkan") {
          const parts = data.salary.split(" - ");
          if (parts.length === 2) {
            salaryMin = parts[0].replace(/Rp |\./g, "");
            salaryMax = parts[1].replace(/Rp |\./g, "");
          }
        }

        setInitialData({
          title: data.title,
          jobCode: data.jobCode,
          location: data.location,
          type: data.type,
          salaryMin: salaryMin,
          salaryMax: salaryMax,
          positions: data.positions || 1,
          description: data.description || "",
          requirements: data.requirements || ""
        });
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  const handleSubmit = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null
      };
      const response = await fetch(`/api/umkm/lowongan/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to edit lowongan");

      router.push(`/umkm/lowongan?selected=${params.id}`);
    } catch (error) {
      alert("Gagal menyimpan perubahan lowongan");
    }
  };

  if (isLoading) return <div style={{ padding: "2rem" }}>Loading...</div>;
  if (error) return <div style={{ padding: "2rem", color: "red" }}>Error: {error}</div>;

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
          <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>Edit Lowongan</h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            Ubah informasi tentang lowongan Anda
          </p>

          {initialData && <LowonganForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />}
        </div>
      </div>
    </div>
  );
}