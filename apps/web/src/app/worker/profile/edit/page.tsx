"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const PRESET_SKILLS = ["Kasir", "Operasional", "Customer Service", "Memasak", "Menjahit", "Pertukangan", "Berkendara", "Komputer", "Komunikasi", "Gudang", "Cleaning Service", "Keamanan"];
const EDUCATION_OPTIONS = ["Tidak Tamat SD", "SD/Sederajat", "SMP/Sederajat", "SMA/SMK/Sederajat", "D1/D2/D3", "S1/Sarjana", "S2/Magister"];
const REHAB_STATUS_OPTIONS = [
  { value: "not_started", label: "Belum Mulai" },
  { value: "ongoing", label: "Sedang Berjalan" },
  { value: "completed", label: "Selesai" },
  { value: "certified", label: "Bersertifikat" },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "1px solid #d6e6f2",
  borderRadius: 10, background: "#fff", fontSize: 14, color: "#0a2c4f",
  outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: 6, fontSize: 12, fontWeight: 700,
  color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em",
};
const sectionCard: React.CSSProperties = {
  background: "#f6fafe", border: "1px solid #e5edf4",
  borderRadius: 16, padding: "22px 24px", marginBottom: 18,
};
const sectionHeader: React.CSSProperties = {
  margin: "0 0 18px", fontSize: "1rem", fontWeight: 700,
  color: "#0a2c4f", display: "flex", alignItems: "center", gap: 8,
};

function TagInput({ tags, onChange, presets, chipColor = "#0f6e99" }: {
  tags: string[]; onChange: (t: string[]) => void;
  presets?: string[]; chipColor?: string;
}) {
  const [input, setInput] = useState("");
  const addTag = (val: string) => {
    const v = val.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {tags.map(t => (
          <span key={t} style={{ background: chipColor, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); } }}
          placeholder="Ketik lalu Enter..."
          style={{ ...inputStyle, width: "auto", minWidth: 140, flex: 1 }} />
      </div>
      {presets && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {presets.filter(p => !tags.includes(p)).map(p => (
            <button key={p} type="button" onClick={() => addTag(p)}
              style={{ background: "#e8f4fd", border: `1px solid ${chipColor}40`, color: chipColor, borderRadius: 20, padding: "3px 10px", fontSize: 12, cursor: "pointer" }}>
              + {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorkerProfileEditPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [form, setForm] = useState({
    full_name: "", nik: "", gender: "", birth_date: "", age: "",
    phone: "", city: "", province: "", address: "",
    education_level: "", skills: [] as string[], experience_summary: "",
    rehabilitation_program: "", rehabilitation_status: "not_started",
    crime_type: "", sentence_years: "", release_date: "", lapas_name: "",
  });

  useEffect(() => {
    fetch("/api/worker/profile")
      .then(r => r.json())
      .then(({ profile, user }) => {
        if (profile) {
          setForm(prev => ({
            ...prev,
            full_name: profile.full_name || user?.full_name || "",
            nik: profile.nik || "",
            gender: profile.gender || "",
            birth_date: profile.birth_date || "",
            age: profile.age ? String(profile.age) : "",
            phone: profile.phone || user?.phone || "",
            city: profile.city || "",
            province: profile.province || "",
            address: profile.address || "",
            education_level: profile.education_level || "",
            skills: profile.skills ? profile.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
            experience_summary: profile.experience_summary || "",
            rehabilitation_program: profile.rehabilitation_program || "",
            rehabilitation_status: profile.rehabilitation_status || "not_started",
            crime_type: profile.crime_type || "",
            sentence_years: profile.sentence_years ? String(profile.sentence_years) : "",
            release_date: profile.release_date || "",
            lapas_name: profile.lapas_name || "",
          }));
        } else if (user) {
          setForm(prev => ({ ...prev, full_name: user.full_name || "", phone: user.phone || "" }));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Auto-calculate age from birth_date
  useEffect(() => {
    if (form.birth_date) {
      const age = Math.floor((Date.now() - new Date(form.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000));
      setForm(prev => ({ ...prev, age: String(age) }));
    }
  }, [form.birth_date]);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  // Completion progress
  const requiredFields = ["full_name", "gender", "city", "education_level"];
  const allFields = [...requiredFields, "nik", "phone", "skills", "experience_summary"];
  const filled = allFields.filter(f => {
    const v = (form as any)[f];
    return Array.isArray(v) ? v.length > 0 : v && String(v).trim() !== "";
  });
  const pct = Math.round((filled.length / allFields.length) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg("");
    try {
      const payload = { ...form, skills: form.skills.join(", ") };
      const res = await fetch("/api/worker/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setSaveMsg("Profil berhasil disimpan!");
      setTimeout(() => router.push("/worker/dashboard"), 1200);
    } catch (err: any) {
      setSaveMsg("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#0f6e99" }}>
      <i className="ti ti-loader-2" style={{ fontSize: 32 }} /> Memuat profil...
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(180deg,#fff 0%,#f3faff 100%)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Back */}
        <a href="/worker/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0f6e99", textDecoration: "none", marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
          <i className="ti ti-arrow-left" /> Kembali ke Dashboard
        </a>

        {/* Hero Banner */}
        <div style={{ background: "linear-gradient(135deg,#0f6e99,#1198c8)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, color: "#fff", boxShadow: "0 16px 32px rgba(15,110,153,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 80, opacity: 0.12 }}>
            <i className="ti ti-user-circle" />
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>Profil Saya</p>
          <h1 style={{ margin: "0 0 6px", fontSize: "1.6rem" }}>Lengkapi Profil Anda</h1>
          <p style={{ margin: "0 0 16px", fontSize: 14, opacity: 0.9 }}>Profil lengkap meningkatkan peluang Anda diterima kerja di UMKM.</p>
          {/* Progress bar */}
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 8, marginBottom: 6 }}>
            <div style={{ background: "#fff", borderRadius: 99, height: 8, width: `${pct}%`, transition: "width 0.4s" }} />
          </div>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>{pct}% profil terisi · {filled.length}/{allFields.length} field</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* SECTION 1: DATA DIRI */}
          <section style={sectionCard}>
            <h3 style={sectionHeader}>
              <i className="ti ti-user" style={{ color: "#0f6e99", fontSize: 18 }} /> Data Diri
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Nama Lengkap <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} type="text" required value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="Sesuai KTP" />
              </div>
              <div>
                <label style={labelStyle}>NIK</label>
                <input style={inputStyle} type="text" maxLength={16} value={form.nik} onChange={e => set("nik", e.target.value)} placeholder="16 digit" />
              </div>
            </div>

            {/* Gender */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Jenis Kelamin <span style={{ color: "#dc2626" }}>*</span></label>
              <div style={{ display: "flex", gap: 10 }}>
                {["Laki-laki", "Perempuan"].map(g => (
                  <button key={g} type="button" onClick={() => set("gender", g)}
                    style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: `2px solid ${form.gender === g ? "#0f6e99" : "#d6e6f2"}`, background: form.gender === g ? "#e8f4fd" : "#fff", color: form.gender === g ? "#0f6e99" : "#4d6473", fontWeight: 600, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className={g === "Laki-laki" ? "ti ti-man" : "ti ti-woman"} />
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Tanggal Lahir</label>
                <input style={inputStyle} type="date" value={form.birth_date} onChange={e => set("birth_date", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Usia</label>
                <input style={inputStyle} type="number" min={17} max={70} value={form.age} onChange={e => set("age", e.target.value)} placeholder="Tahun" />
              </div>
              <div>
                <label style={labelStyle}>No. HP</label>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08xxxxxxxxxx" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Kota Domisili <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} type="text" required value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Bandung" />
              </div>
              <div>
                <label style={labelStyle}>Provinsi</label>
                <input style={inputStyle} type="text" value={form.province} onChange={e => set("province", e.target.value)} placeholder="e.g. Jawa Barat" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Alamat Lengkap</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..." />
            </div>
          </section>

          {/* SECTION 2: PENDIDIKAN & PENGALAMAN */}
          <section style={sectionCard}>
            <h3 style={sectionHeader}>
              <i className="ti ti-school" style={{ color: "#0f6e99", fontSize: 18 }} /> Pendidikan & Pengalaman
            </h3>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Pendidikan Terakhir <span style={{ color: "#dc2626" }}>*</span></label>
              <select style={{ ...inputStyle, cursor: "pointer" }} required value={form.education_level} onChange={e => set("education_level", e.target.value)}>
                <option value="">-- Pilih Pendidikan --</option>
                {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Skills / Keahlian <span style={{ color: "#dc2626" }}>*</span></label>
              <TagInput tags={form.skills} onChange={v => set("skills", v)} presets={PRESET_SKILLS} chipColor="#0f6e99" />
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#7a8a99" }}>
                <i className="ti ti-info-circle" /> Skills membantu sistem menemukan lowongan yang paling cocok untuk Anda.
              </p>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Ringkasan Pengalaman Kerja</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.experience_summary} onChange={e => set("experience_summary", e.target.value)} placeholder="Ceritakan pengalaman kerja Anda sebelumnya, termasuk posisi, durasi, dan tanggung jawab..." />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Program Rehabilitasi yang Diikuti</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.rehabilitation_program} onChange={e => set("rehabilitation_program", e.target.value)} placeholder="e.g. Pelatihan menjahit di Lapas Bandung, Program Bimbingan Kerja..." />
            </div>

            <div>
              <label style={labelStyle}>Status Rehabilitasi</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.rehabilitation_status} onChange={e => set("rehabilitation_status", e.target.value)}>
                {REHAB_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </section>

          {/* SECTION 3: LATAR BELAKANG (SENSITIVE) */}
          <section style={{ ...sectionCard, background: "#fffbeb", border: "1px solid #fde68a" }}>
            <h3 style={{ ...sectionHeader, color: "#92400e" }}>
              <i className="ti ti-shield-lock" style={{ color: "#f59e0b", fontSize: 18 }} /> Latar Belakang
              <span style={{ marginLeft: "auto", fontSize: 11, background: "#fde68a", color: "#92400e", padding: "2px 10px", borderRadius: 99, fontWeight: 600 }}>SENSITIF</span>
            </h3>

            {/* Warning banner */}
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <i className="ti ti-lock" style={{ color: "#f59e0b", fontSize: 20, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13, color: "#92400e" }}>Informasi Rahasia & Terlindungi</p>
                <p style={{ margin: 0, fontSize: 13, color: "#78350f", lineHeight: 1.5 }}>
                  Informasi ini bersifat rahasia dan hanya digunakan untuk proses seleksi yang adil. Data Anda dilindungi dan tidak akan disebarluaskan kepada pihak yang tidak berwenang.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ ...labelStyle, color: "#92400e" }}>Jenis Tindak Pidana</label>
                <input style={{ ...inputStyle, borderColor: "#fde68a" }} type="text" value={form.crime_type} onChange={e => set("crime_type", e.target.value)} placeholder="e.g. Pencurian, Penggelapan, Narkoba..." />
              </div>
              <div>
                <label style={{ ...labelStyle, color: "#92400e" }}>Lama Hukuman</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...inputStyle, borderColor: "#fde68a", paddingRight: 50 }} type="number" min={0} step={0.5} value={form.sentence_years} onChange={e => set("sentence_years", e.target.value)} placeholder="0" />
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#92400e", fontWeight: 600 }}>tahun</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ ...labelStyle, color: "#92400e" }}>Tanggal Bebas</label>
                <input style={{ ...inputStyle, borderColor: "#fde68a" }} type="date" value={form.release_date} onChange={e => set("release_date", e.target.value)} />
              </div>
              <div>
                <label style={{ ...labelStyle, color: "#92400e" }}>Nama Lapas / Rutan</label>
                <input style={{ ...inputStyle, borderColor: "#fde68a" }} type="text" value={form.lapas_name} onChange={e => set("lapas_name", e.target.value)} placeholder="Nama lembaga pemasyarakatan" />
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 12, color: "#92400e", fontStyle: "italic" }}>
              <i className="ti ti-info-circle" /> Mengisi informasi ini dengan jujur membantu UMKM memberikan kesempatan yang tepat dan adil bagi Anda.
            </p>
          </section>

          {/* Save message */}
          {saveMsg && (
            <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, background: saveMsg.startsWith("Gagal") ? "#fef2f2" : "#f0fdf4", color: saveMsg.startsWith("Gagal") ? "#dc2626" : "#16a34a", border: `1px solid ${saveMsg.startsWith("Gagal") ? "#fecaca" : "#bbf7d0"}`, fontWeight: 600, fontSize: 14 }}>
              <i className={`ti ${saveMsg.startsWith("Gagal") ? "ti-alert-circle" : "ti-circle-check"}`} /> {saveMsg}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
            <a href="/worker/dashboard" style={{ padding: "11px 24px", border: "1px solid #d6e6f2", borderRadius: 10, color: "#4d6473", fontSize: 14, fontWeight: 600, textDecoration: "none", background: "#fff" }}>
              Batal
            </a>
            <button type="submit" disabled={isSaving}
              style={{ background: isSaving ? "#7a8a99" : "linear-gradient(135deg,#0f6e99,#1198c8)", color: "#fff", border: "none", padding: "11px 32px", borderRadius: 10, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", fontSize: 14, boxShadow: "0 8px 18px rgba(15,110,153,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
              <i className={`ti ${isSaving ? "ti-loader-2" : "ti-device-floppy"}`} />
              {isSaving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
