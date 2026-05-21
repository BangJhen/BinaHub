"use client";

import { useState } from "react";
import { JobType } from "@/types/lowongan";

interface LowonganFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export default function LowonganForm({ initialData, onSubmit, isEditing }: LowonganFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    jobCode: initialData?.jobCode || "",
    location: initialData?.location || "",
    type: initialData?.type || JobType.FULL_TIME,
    salaryMin: initialData?.salaryMin || "",
    salaryMax: initialData?.salaryMax || "",
    positions: initialData?.positions || 1,
    description: initialData?.description || "",
    requirements: initialData?.requirements || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        salary: `${formData.salaryMin}-${formData.salaryMax}`
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 2 }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Posisi/Pekerjaan *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Barista, Admin Gudang"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-primary)",
              fontSize: "14px"
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Kode Job *</label>
          <input
            type="text"
            name="jobCode"
            required
            value={formData.jobCode}
            onChange={handleChange}
            placeholder="e.g. JOB-01"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-primary)",
              fontSize: "14px"
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Lokasi Penempatan *</label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="Area / Cabang"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-primary)",
              fontSize: "14px"
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Tipe Pekerjaan *</label>
          <select
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-primary)",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {Object.values(JobType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Jumlah Posisi *</label>
          <input
            type="number"
            name="positions"
            min="1"
            required
            value={formData.positions}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-primary)",
              fontSize: "14px"
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Gaji Bulanan (Rp) *</label>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="number"
            name="salaryMin"
            required
            value={formData.salaryMin}
            onChange={handleChange}
            placeholder="Min"
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-primary)",
              fontSize: "14px"
            }}
          />
          <span>-</span>
          <input
            type="number"
            name="salaryMax"
            required
            value={formData.salaryMax}
            onChange={handleChange}
            placeholder="Max"
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-primary)",
              fontSize: "14px"
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Deskripsi Pekerjaan</label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          placeholder="Tugas dan tanggung jawab..."
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            fontSize: "14px"
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }}>Syarat & Kualifikasi</label>
        <textarea
          name="requirements"
          rows={4}
          value={formData.requirements}
          onChange={handleChange}
          placeholder="Pengalaman, keahlian khusus..."
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-primary)",
            fontSize: "14px"
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "1rem" }}>
        <a
          href="/umkm/lowongan"
          style={{
            padding: "10px 20px",
            border: "1px solid var(--color-border-secondary)",
            borderRadius: "var(--border-radius-md)",
            color: "var(--color-text-secondary)",
            fontSize: "14px",
            textDecoration: "none"
          }}
        >
          Batal
        </a>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: "var(--color-background-info)",
            color: "var(--color-text-info)",
            border: "none",
            padding: "10px 24px",
            borderRadius: "var(--border-radius-md)",
            fontWeight: 500,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: "14px"
          }}
        >
          {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan Lowongan"}
        </button>
      </div>
    </form>
  );
}
