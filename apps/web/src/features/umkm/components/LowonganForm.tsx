"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { JobType } from "@/features/lowongan/types";

interface LowonganFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

// Style objects
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

const sectionBadgeStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 50,
  background: "#0f6e99",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
  flexShrink: 0
};

// Job type options with icons and labels
const jobTypeOptions = [
  { value: JobType.FULL_TIME, label: "Full Time", icon: "ti ti-clock" },
  { value: JobType.PART_TIME, label: "Part Time", icon: "ti ti-clock-half" },
  { value: JobType.CONTRACT, label: "Contract", icon: "ti ti-file-contract" },
  { value: JobType.FREELANCE, label: "Freelance", icon: "ti ti-briefcase" }
];

// Education level options
const educationOptions = [
  "Tidak Dipersyaratkan",
  "SMP/Sederajat",
  "SMA/SMK/Sederajat",
  "D1/D2/D3",
  "S1/Sarjana",
  "S2/Magister"
];

// Experience options
const experienceOptions = [
  "Fresh Graduate",
  "< 1 Tahun",
  "1 Tahun",
  "2 Tahun",
  "3 Tahun",
  "4 Tahun",
  "5+ Tahun"
];

// Preset skills
const presetSkills = [
  "Customer Service",
  "Ms. Excel",
  "Kasir",
  "Operasional",
  "Komunikasi",
  "Manajemen Stok",
  "Input Data",
  "SIM C"
];

// Preset benefits
const presetBenefits = [
  "BPJS Kesehatan",
  "BPJS Ketenagakerjaan",
  "THR",
  "Bonus Bulanan",
  "Makan Siang",
  "Uang Transport",
  "Komisi",
  "Lembur Dibayar"
];

// Helper function to format currency
const formatCurrency = (value: string | number): string => {
  if (!value) return "0";
  const num = typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value;
  return new Intl.NumberFormat("id-ID").format(num);
};

// Tag input component
interface TagInputProps {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
  presetTags?: string[];
  color?: "blue" | "green";
}

function TagInput({ label, tags, onAdd, onRemove, placeholder, presetTags, color = "blue" }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValue.trim();
      if (value && !tags.includes(value)) {
        onAdd(value);
        setInputValue("");
      }
    }
  };

  const handlePresetClick = (preset: string) => {
    if (!tags.includes(preset)) {
      onAdd(preset);
    }
  };

  const colorStyles = color === "blue" ? {
    chip: {
      background: "#e3f2fd",
      color: "#0f6e99",
      border: "1px solid #bbdefb"
    },
    presetChip: {
      background: "#f0f7ff",
      color: "#0f6e99",
      border: "1px dashed #bbdefb"
    }
  } : {
    chip: {
      background: "#e8f5e9",
      color: "#16a34a",
      border: "1px solid #c8e6c9"
    },
    presetChip: {
      background: "#f1f8e9",
      color: "#16a34a",
      border: "1px dashed #c8e6c9"
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      
      {/* Tag display area */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "8px 12px",
        border: "1px solid #d6e6f2",
        borderRadius: 10,
        background: "#ffffff",
        minHeight: 40,
        alignItems: "center"
      }}>
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            style={{
              ...colorStyles.chip,
              padding: "4px 10px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              style={{
                background: "none",
                border: "none",
                color: color === "blue" ? "#0f6e99" : "#16a34a",
                cursor: "pointer",
                fontSize: 14,
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 14,
            padding: "4px 0",
            minWidth: 80
          }}
        />
      </div>

      {/* Preset tags */}
      {presetTags && presetTags.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, color: "#7a8a99" }}>
            <i className="ti ti-star" aria-hidden /> Pilih dari preset:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {presetTags.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                style={{
                  ...colorStyles.presetChip,
                  padding: "4px 12px",
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
    requirements: initialData?.requirements || "",
    skills: initialData?.skills || [],
    benefits: initialData?.benefits || [],
    educationLevel: initialData?.educationLevel || "",
    experienceRequired: initialData?.experienceRequired || "",
    ageMin: initialData?.ageMin || "",
    ageMax: initialData?.ageMax || "",
    bannerImage: initialData?.bannerImage || "",
    jobIcon: initialData?.jobIcon || ""
  });

  // Format salary display
  const salaryDisplay = (() => {
    const min = formData.salaryMin ? formatCurrency(formData.salaryMin) : "";
    const max = formData.salaryMax ? formatCurrency(formData.salaryMax) : "";
    if (min && max) return `Rp ${min} – Rp ${max}`;
    if (min) return `Rp ${min}`;
    if (max) return `Rp ${max}`;
    return "";
  })();

  // Handle banner image upload
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, bannerImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setFormData((prev) => ({ ...prev, bannerImage: "" }));
  };

  // Handle job icon selection
  const jobIcons = ["💼", "🔧", "💻", "🛒", "🍽️", "👕", "📦", "📞", "📊", "🎨"];
  
  const selectJobIcon = (icon: string) => {
    setFormData((prev) => ({ ...prev, jobIcon: icon }));
  };

  // Handle skills
  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s: string) => s !== skill) }));
  };

  // Handle benefits
  const addBenefit = (benefit: string) => {
    if (!formData.benefits.includes(benefit)) {
      setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, benefit] }));
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData((prev) => ({ ...prev, benefits: prev.benefits.filter((b: string) => b !== benefit) }));
  };

  // Handle textarea with bullet points
  const handleBulletPoints = (field: "description" | "requirements") => {
    const currentText = formData[field];
    const lines = currentText.split("\n");
    const newLines = lines.map((line: string) => {
      if (line.trim() && !line.trim().startsWith("•")) {
        return "• " + line.trim();
      }
      return line;
    });
    setFormData((prev) => ({ ...prev, [field]: newLines.join("\n") }));
  };

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
        ageRange: formData.ageMin && formData.ageMax ? `${formData.ageMin} - ${formData.ageMax}` : ""
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* BANNER UPLOAD SECTION */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <i className="ti ti-photo" aria-hidden style={{ color: "#0f6e99" }} />
          Banner & Identitas
        </h3>

        {/* Banner Upload */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Banner Lowongan</label>
          
          {formData.bannerImage ? (
            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
              <Image
                src={formData.bannerImage}
                alt="Banner preview"
                fill
                style={{
                  objectFit: "cover",
                  borderRadius: 10
                }}
              />
              <button
                type="button"
                onClick={removeBanner}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: 50,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#dc3545",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 150,
                border: "2px dashed #d6e6f2",
                borderRadius: 10,
                background: "#f9fbfd",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <i className="ti ti-upload" style={{ fontSize: 32, color: "#0f6e99", marginBottom: 8 }} />
              <span style={{ color: "#0f6e99", fontWeight: 600, fontSize: 14 }}>
                Upload Banner Lowongan
              </span>
              <span style={{ fontSize: 11, color: "#7a8a99", marginTop: 4 }}>
                JPG, PNG, WEBP (max 5MB)
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* Job Icon Picker */}
        <div>
          <label style={labelStyle}>Ikon Kategori (Opsional)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {jobIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => selectJobIcon(icon)}
                style={{
                  width: 48,
                  height: 48,
                  border: formData.jobIcon === icon ? "2px solid #0f6e99" : "1px solid #d6e6f2",
                  borderRadius: 10,
                  background: formData.jobIcon === icon ? "#e3f2fd" : "#ffffff",
                  fontSize: 24,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: INFO DASAR */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <span style={sectionBadgeStyle}>①</span>
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
          
          {/* Job Type Card Buttons */}
          <div>
            <label style={labelStyle}>Tipe Pekerjaan *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {jobTypeOptions.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                  style={{
                    padding: "10px 12px",
                    border: formData.type === type.value 
                      ? "2px solid #0f6e99" 
                      : "1px solid #d6e6f2",
                    borderRadius: 10,
                    background: formData.type === type.value ? "#e3f2fd" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: formData.type === type.value ? "#0f6e99" : "#4d6473",
                    transition: "all 0.15s"
                  }}
                >
                  <i className={type.icon} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label style={labelStyle}>Jumlah Posisi *</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, positions: Math.max(1, prev.positions - 1) }))}
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid #d6e6f2",
                  borderRadius: 10,
                  background: "#ffffff",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#0f6e99",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                −
              </button>
              <input
                type="number"
                name="positions"
                min={1}
                required
                value={formData.positions}
                onChange={handleChange}
                style={{ ...inputStyle, textAlign: "center" }}
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, positions: prev.positions + 1 }))}
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid #d6e6f2",
                  borderRadius: 10,
                  background: "#ffffff",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#0f6e99",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: KUALIFIKASI */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <span style={sectionBadgeStyle}>②</span>
          Kualifikasi Kandidat
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Pendidikan Minimal</label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Pilih pendidikan</option>
              {educationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={labelStyle}>Pengalaman Minimal</label>
            <select
              name="experienceRequired"
              value={formData.experienceRequired}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Pilih pengalaman</option>
              {experienceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Usia Minimum</label>
            <input
              type="number"
              name="ageMin"
              min={16}
              max={60}
              value={formData.ageMin}
              onChange={handleChange}
              placeholder="18"
              style={{ ...inputStyle, textAlign: "center" }}
            />
          </div>
          <span style={{ fontSize: 18, color: "#7a8a99", paddingBottom: 10, textAlign: "center" }}>—</span>
          <div>
            <label style={labelStyle}>Usia Maksimum</label>
            <input
              type="number"
              name="ageMax"
              min={18}
              max={65}
              value={formData.ageMax}
              onChange={handleChange}
              placeholder="30"
              style={{ ...inputStyle, textAlign: "center" }}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: KOMPENSASI */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <span style={sectionBadgeStyle}>③</span>
          Kompensasi & Gaji
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 14, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Gaji Minimum (Rp)</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7a8a99",
                fontSize: 14
              }}>
                Rp
              </span>
              <input
                type="text"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                placeholder="2500000"
                style={{ ...inputStyle, paddingLeft: 42 }}
              />
            </div>
          </div>
          <span style={{ fontSize: 18, color: "#7a8a99", paddingBottom: 12 }}>—</span>
          <div>
            <label style={labelStyle}>Gaji Maksimum (Rp)</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7a8a99",
                fontSize: 14
              }}>
                Rp
              </span>
              <input
                type="text"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                placeholder="4500000"
                style={{ ...inputStyle, paddingLeft: 42 }}
              />
            </div>
          </div>
        </div>

        {/* Salary Preview */}
        {salaryDisplay && (
          <div style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "#e8f5e9",
            borderRadius: 10,
            color: "#16a34a",
            fontSize: 14,
            fontWeight: 600
          }}>
            <i className="ti ti-eye" aria-hidden /> Preview Gaji: {salaryDisplay}
          </div>
        )}
      </section>

      {/* SECTION 4: DESKRIPSI & SYARAT */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <span style={sectionBadgeStyle}>④</span>
          Deskripsi & Syarat
        </h3>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={labelStyle}>Deskripsi Pekerjaan</label>
            <button
              type="button"
              onClick={() => handleBulletPoints("description")}
              style={{
                fontSize: 11,
                color: "#0f6e99",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <i className="ti ti-list-check" aria-hidden /> Tambah bullet
            </button>
          </div>
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder={"Contoh:\nBertanggung jawab atas pengelolaan stok masuk dan keluar.\nMencatat data inventory secara rapi pada sistem.\nBerkoordinasi dengan tim logistik."}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#7a8a99" }}>
            <i className="ti ti-info-circle" aria-hidden /> Gunakan baris baru untuk setiap poin
          </p>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={labelStyle}>Syarat & Kualifikasi</label>
            <button
              type="button"
              onClick={() => handleBulletPoints("requirements")}
              style={{
                fontSize: 11,
                color: "#0f6e99",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <i className="ti ti-list-check" aria-hidden /> Tambah bullet
            </button>
          </div>
          <textarea
            name="requirements"
            rows={5}
            value={formData.requirements}
            onChange={handleChange}
            placeholder={"Contoh:\nPendidikan minimal SMA/SMK.\nTeliti, rapi, dan tepat waktu.\nMenguasai Microsoft Excel dasar."}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#7a8a99" }}>
            <i className="ti ti-info-circle" aria-hidden /> Gunakan baris baru untuk setiap poin
          </p>
        </div>
      </section>

      {/* SECTION 5: SKILLS & BENEFITS */}
      <section style={sectionStyle}>
        <h3 style={sectionHeaderStyle}>
          <span style={sectionBadgeStyle}>⑤</span>
          Skills & Benefit
        </h3>

        <TagInput
          label="Skills (pisahkan dengan Enter atau koma)"
          tags={formData.skills}
          onAdd={addSkill}
          onRemove={removeSkill}
          placeholder="Ketik skill lalu Enter..."
          presetTags={presetSkills}
          color="blue"
        />

        <TagInput
          label="Benefit Kerja (pisahkan dengan Enter atau koma)"
          tags={formData.benefits}
          onAdd={addBenefit}
          onRemove={removeBenefit}
          placeholder="Ketik benefit lalu Enter..."
          presetTags={presetBenefits}
          color="green"
        />
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
            background: "#ffffff",
            transition: "all 0.15s"
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
            boxShadow: "0 8px 18px rgba(15, 110, 153, 0.25)",
            transition: "all 0.15s"
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
