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

        setInitialData({
          title: data.title,
          jobCode: data.jobCode,
          location: data.location,
          type: data.type,
          salaryMin: data.salaryMin ? String(data.salaryMin) : "",
          salaryMax: data.salaryMax ? String(data.salaryMax) : "",
          positions: data.positions || 1,
          description: data.description || "",
          requirements: data.requirements || "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          benefits: Array.isArray(data.benefits) ? data.benefits.join(", ") : "",
          educationLevel: data.educationLevel || "",
          experienceRequired: data.experienceRequired || "",
          ageRange: data.ageRange || ""
        });
      } catch (err: any) {
        setError(err.message || "Gagal memuat data");
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
    <div style={{ background: "#f6f8fb", padding: "2rem", minHeight: "100vh" }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        <a
          href="/umkm/lowongan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#0f6e99",
            textDecoration: "none",
            marginBottom: "1.5rem",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          <i className="ti ti-arrow-left" aria-hidden />
          Kembali ke Dashboard Lowongan
        </a>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "2rem",
            border: "1px solid #d6e6f2",
            boxShadow: "0 14px 32px rgba(10, 44, 79, 0.06)"
          }}
        >
          <h1 style={{ fontSize: "1.6rem", margin: "0 0 6px", color: "#0a2c4f" }}>Edit Lowongan</h1>
          <p style={{ fontSize: "14px", color: "#4d6473", marginBottom: "2rem" }}>
            Ubah informasi tentang lowongan Anda. Perubahan akan langsung terlihat oleh kandidat.
          </p>

          {initialData && <LowonganForm initialData={initialData} onSubmit={handleSubmit} isEditing={true} />}
        </div>
      </div>
    </div>
  );
}
