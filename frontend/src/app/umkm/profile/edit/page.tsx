"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BUSINESS_SECTORS = [
  "Kuliner", "Fashion", "Kerajinan", "Pertanian", "Teknologi",
  "Jasa", "Perdagangan", "Pendidikan", "Kesehatan", "Otomotif",
  "Konstruksi", "Hiburan", "Lainnya",
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

export default function UmkmProfileEditPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [form, setForm] = useState({
    business_name: "",
    business_sector: "",
    owner_name: "",
    phone: "",
    website: "",
    established_year: "",
    business_license: "",
    city: "",
    province: "",
    business_address: "",
    company_description: "",
  });

  useEffect(() => {
    fetch("/api/umkm/profile")
      .then(r => r.json())
      .then(({ profile, user }) => {
        if (profile) {
          setForm(prev => ({
            ...prev,
            business_name: profile.business_name || "",
            business_sector: profile.business_sector || "",
            owner_name: profile.owner_name || user?.full_name || "",
            phone: profile.phone || user?.phone || "",
            website: profile.website || "",
            established_year: profile.established_year ? String(profile.established_year) : "",
            business_license: profile.business_license || "",
            city: profile.city || "",
            province: profile.province || "",
            business_address: profile.business_address || "",
            company_description: profile.company_description || "",
          }));
        } else if (user) {
          setForm(prev => ({ ...prev, owner_name: user.full_name || "", phone: user.phone || "" }));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Completion progress
  const allFields = ["business_name", "business_sector", "city", "owner_name", "phone", "business_address", "company_description", "established_year"];
  const filled = allFields.filter(f => {
    const v = (form as any)[f];
    return v && String(v).trim() !== "";
  });
  const pct = Math.round((filled.length / allFields.length) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/umkm/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setSaveMsg("Profil berhasil disimpan!");
      setTimeout(() => router.push("/umkm/profile"), 1200);
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
        <a href="/umkm/profile" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0f6e99", textDecoration: "none", marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
          <i className="ti ti-arrow-left" /> Kembali ke Profil
        </a>

        {/* Hero Banner */}
        <div style={{ background: "linear-gradient(135deg,#0f6e99,#1198c8)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, color: "#fff", boxShadow: "0 16px 32px rgba(15,110,153,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 80, opacity: 0.12 }}>
            <i className="ti ti-building-store" />
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>Profil UMKM</p>
          <h1 style={{ margin: "0 0 6px", fontSize: "1.6rem" }}>Lengkapi Profil Bisnis</h1>
          <p style={{ margin: "0 0 16px", fontSize: 14, opacity: 0.9 }}>Profil lengkap meningkatkan kepercayaan pekerja dan mempermudah proses rekrutmen.</p>
          {/* Progress bar */}
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 8, marginBottom: 6 }}>
            <div style={{ background: "#fff", borderRadius: 99, height: 8, width: `${pct}%`, transition: "width 0.4s" }} />
          </div>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>{pct}% profil terisi · {filled.length}/{allFields.length} field</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* SECTION 1: INFO BISNIS */}
          <section style={sectionCard}>
            <h3 style={sectionHeader}>
              <i className="ti ti-building-store" style={{ color: "#0f6e99", fontSize: 18 }} /> Informasi Bisnis
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Nama Bisnis <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} type="text" required value={form.business_name} onChange={e => set("business_name", e.target.value)} placeholder="e.g. Warung Makan Bu Sari" />
              </div>
              <div>
                <label style={labelStyle}>Tahun Berdiri</label>
                <input style={inputStyle} type="number" min={1900} max={new Date().getFullYear()} value={form.established_year} onChange={e => set("established_year", e.target.value)} placeholder="e.g. 2015" />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Sektor Usaha <span style={{ color: "#dc2626" }}>*</span></label>
              <select style={{ ...inputStyle, cursor: "pointer" }} required value={form.business_sector} onChange={e => set("business_sector", e.target.value)}>
                <option value="">-- Pilih Sektor --</option>
                {BUSINESS_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nomor Izin Usaha (NIB / SIUP)</label>
              <input style={inputStyle} type="text" value={form.business_license} onChange={e => set("business_license", e.target.value)} placeholder="e.g. 1234567890123456" />
            </div>

            <div>
              <label style={labelStyle}>Deskripsi Bisnis</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.company_description} onChange={e => set("company_description", e.target.value)} placeholder="Ceritakan tentang bisnis Anda, produk/jasa yang ditawarkan, dan keunggulan Anda..." />
            </div>
          </section>

          {/* SECTION 2: KONTAK & LOKASI */}
          <section style={sectionCard}>
            <h3 style={sectionHeader}>
              <i className="ti ti-address-book" style={{ color: "#0f6e99", fontSize: 18 }} /> Kontak & Lokasi
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Nama Pemilik <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} type="text" required value={form.owner_name} onChange={e => set("owner_name", e.target.value)} placeholder="Nama lengkap pemilik" />
              </div>
              <div>
                <label style={labelStyle}>No. HP / WhatsApp <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} type="tel" required value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08xxxxxxxxxx" />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Website</label>
              <input style={inputStyle} type="url" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://www.contoh.com" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Kota <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} type="text" required value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Bandung" />
              </div>
              <div>
                <label style={labelStyle}>Provinsi</label>
                <input style={inputStyle} type="text" value={form.province} onChange={e => set("province", e.target.value)} placeholder="e.g. Jawa Barat" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Alamat Usaha</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.business_address} onChange={e => set("business_address", e.target.value)} placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..." />
            </div>
          </section>

          {/* Save message */}
          {saveMsg && (
            <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, background: saveMsg.startsWith("Gagal") ? "#fef2f2" : "#f0fdf4", color: saveMsg.startsWith("Gagal") ? "#dc2626" : "#16a34a", border: `1px solid ${saveMsg.startsWith("Gagal") ? "#fecaca" : "#bbf7d0"}`, fontWeight: 600, fontSize: 14 }}>
              <i className={`ti ${saveMsg.startsWith("Gagal") ? "ti-alert-circle" : "ti-circle-check"}`} /> {saveMsg}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8 }}>
            <a href="/umkm/profile" style={{ padding: "11px 24px", border: "1px solid #d6e6f2", borderRadius: 10, color: "#4d6473", fontSize: 14, fontWeight: 600, textDecoration: "none", background: "#fff" }}>
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
