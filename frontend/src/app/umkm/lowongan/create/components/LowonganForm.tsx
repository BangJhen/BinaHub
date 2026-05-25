"use client";

import { useState } from "react";
import { JobType } from "@/types/lowongan";

interface LowonganFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #d6e6f2",
  borderRadius: 10,
  background: "#ffffff",
  fontSize: 14,
  color: "#0a2c4f",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 700,
  color: "#0f6e99",
  textTransform: "uppercase",
  letterSpacing: "0.04em"
};

const sectionStyle: React.CSSProperties = {
  background: "#f6fafe",
  border: "1px solid #e5edf4",
  borderRadius: 14,
  padding: "18px 20px",
  marginBottom: 16
};

const sectionHeaderStyle: React.CSSProperties = {
  margin: "0 0 14px",
  fontSize: "1rem",
  color: "#0a2c4f",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 8
};

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
    requirements: initialData?.requirements || "",
    skills: initialData?.skills || "",
    benefits: initialData?.benefits || "",
    educationLevel: initialData?.educationLevel || "",
    experienceRequired: initialData?.experienceRequired || "",
    ageRange: initialData?.ageRange || ""
  });

  const splitTags = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

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
        skills: splitTags(formData.skills),
        benefits: splitTags(formData.benefits)
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* SECTION 1: INFO DASAR */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <i className="ti ti-briefcase" aria-hidden style={{ color: "#0f6e99" }} />
          Informasi Dasar
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Posisi/Pekerjaan *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Barista, Admin Gudang"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Kode Job</label>
            <input
              type="text"
              name="jobCode"
              value={formData.jobCode}
              onChange={handleChange}
              placeholder="e.g. JOB-01 (otomatis)"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Lokasi Penempatan *</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="Area / Cabang"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tipe Pekerjaan *</label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {Object.values(JobType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Jumlah Posisi *</label>
            <input
              type="number"
              name="positions"
              min={1}
              required
              value={formData.positions}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: KUALIFIKASI */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <i className="ti ti-school" aria-hidden style={{ color: "#0f6e99" }} />
          Kualifikasi Kandidat
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Pendidikan Minimal</label>
            <input
              type="text"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              placeholder="e.g. SMA/SMK, D3, S1"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Pengalaman Minimal</label>
            <input
              type="text"
              name="experienceRequired"
              value={formData.experienceRequired}
              onChange={handleChange}
              placeholder="e.g. 1 Tahun, Fresh Graduate"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Rentang Usia</label>
            <input
              type="text"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleChange}
              placeholder="e.g. 18 - 30 Tahun"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: GAJI */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <i className="ti ti-coin" aria-hidden style={{ color: "#16a34a" }} />
          Gaji Bulanan
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Gaji Minimum (Rp) *</label>
            <input
              type="number"
              name="salaryMin"
              required
              value={formData.salaryMin}
              onChange={handleChange}
              placeholder="2500000"
              style={inputStyle}
            />
          </div>
          <span style={{ fontSize: 18, color: "#7a8a99", paddingBottom: 12 }}>—</span>
          <div>
            <label style={labelStyle}>Gaji Maksimum (Rp) *</label>
            <input
              type="number"
              name="salaryMax"
              required
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="4500000"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: DESKRIPSI */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <i className="ti ti-file-text" aria-hidden style={{ color: "#0f6e99" }} />
          Deskripsi & Tanggung Jawab
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Deskripsi Pekerjaan</label>
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder={"Contoh:\nBertanggung jawab atas pengelolaan stok masuk dan keluar.\nMencatat data inventory secara rapi pada sistem.\nBerkoordinasi dengan tim logistik."}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
          />
        </div>

        <div>
          <label style={labelStyle}>Syarat & Kualifikasi</label>
          <textarea
            name="requirements"
            rows={5}
            value={formData.requirements}
            onChange={handleChange}
            placeholder={"Contoh:\nPendidikan minimal SMA/SMK.\nTeliti, rapi, dan tepat waktu.\nMenguasai Microsoft Excel dasar."}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
          />
        </div>
      </section>

      {/* SECTION 5: SKILLS & BENEFITS */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <i className="ti ti-stack-2" aria-hidden style={{ color: "#0f6e99" }} />
          Skills & Benefit
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Skills (pisahkan dengan koma)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Contoh: Ms. Excel, Manajemen Stok, Customer Service"
            style={inputStyle}
          />
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#7a8a99" }}>
            <i className="ti ti-info-circle" aria-hidden /> Skills membantu sistem matching kandidat yang paling cocok.
          </p>
        </div>

        <div>
          <label style={labelStyle}>Benefit Kerja (pisahkan dengan koma)</label>
          <input
            type="text"
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            placeholder="Contoh: BPJS Kesehatan, BPJS Ketenagakerjaan, THR, Bonus Lembur"
            style={inputStyle}
          />
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 12,
          paddingTop: 18,
          borderTop: "1px solid #e5edf4"
        }}
      >
        <a
          href="/umkm/lowongan"
          style={{
            padding: "10px 22px",
            border: "1px solid #d6e6f2",
            borderRadius: 10,
            color: "#4d6473",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            background: "#ffffff"
          }}
        >
          Batal
        </a>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: isSubmitting ? "#7a8a99" : "linear-gradient(135deg, #0f6e99, #1198c8)",
            color: "#ffffff",
            border: "none",
            padding: "10px 28px",
            borderRadius: 10,
            fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: 14,
            boxShadow: "0 8px 18px rgba(15, 110, 153, 0.25)"
          }}
        >
          {isSubmitting ? (
            <>
              <i className="ti ti-loader-2" aria-hidden /> Menyimpan...
            </>
          ) : isEditing ? (
            <>
              <i className="ti ti-device-floppy" aria-hidden /> Simpan Perubahan
            </>
          ) : (
            <>
              <i className="ti ti-plus" aria-hidden /> Buat Lowongan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
