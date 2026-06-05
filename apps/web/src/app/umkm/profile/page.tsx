"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AvatarCropModal from "@/shared/components/AvatarCropModal";

const SECTOR_ICON: Record<string, string> = {
  "Kuliner": "ti-tools-kitchen-2",
  "Fashion": "ti-shirt",
  "Kerajinan": "ti-needle-thread",
  "Pertanian": "ti-plant",
  "Teknologi": "ti-device-laptop",
  "Jasa": "ti-briefcase",
  "Perdagangan": "ti-shopping-cart",
  "Pendidikan": "ti-school",
};

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {icon && <i className={`ti ${icon}`} style={{ marginRight: 4 }} />}{label}
      </span>
      <span style={{ fontSize: 14, color: value ? "#0a2c4f" : "#b0bec5", fontWeight: value ? 500 : 400 }}>
        {value || "Belum diisi"}
      </span>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5edf4", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 22, color }} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0a2c4f", lineHeight: 1 }}>{value}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#7a8a99", fontWeight: 500 }}>{label}</p>
      </div>
    </div>
  );
}

export default function UmkmProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ totalWorkers: 0, activeWorkers: 0 });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarHover, setAvatarHover] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/umkm/profile")
      .then(r => r.json())
      .then(({ profile, user, stats }) => {
        setProfile(profile);
        setUser(user);
        if (stats) setStats(stats);
        if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Format tidak didukung. Gunakan JPG, PNG, atau WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Ukuran file terlalu besar. Maksimal 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setIsUploadingAvatar(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", blob, "avatar.jpg");
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAvatarUrl(data.avatar_url);
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: { avatar_url: data.avatar_url } }));
    } catch (err: any) {
      setAvatarError(err.message || "Gagal mengunggah foto.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#0f6e99" }}>
      <i className="ti ti-loader-2" style={{ fontSize: 32 }} /> Memuat profil...
    </div>
  );

  const businessName = profile?.business_name || "Nama Bisnis";
  const ownerName = profile?.owner_name || user?.full_name || "Pemilik";
  const initials = businessName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const sectorIcon = SECTOR_ICON[profile?.business_sector] || "ti-building-store";

  // Completion progress
  const allFields = ["business_name", "business_sector", "city", "owner_name", "phone", "business_address", "company_description", "established_year"];
  const filled = allFields.filter(f => {
    const v = profile?.[f];
    return v && String(v).trim() !== "";
  });
  const pct = Math.round((filled.length / allFields.length) * 100);

  return (
    <>
      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => { setCropSrc(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
        />
      )}

      <div style={{ background: "linear-gradient(180deg,#fff 0%,#f3faff 100%)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Back */}
        <a href="/umkm/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0f6e99", textDecoration: "none", marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
          <i className="ti ti-arrow-left" /> Kembali ke Dashboard
        </a>

        {/* Hero Banner */}
        <div style={{ background: "linear-gradient(135deg,#0f6e99,#1198c8)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, color: "#fff", boxShadow: "0 16px 32px rgba(15,110,153,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 80, opacity: 0.12 }}>
            <i className="ti ti-building-store" />
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar — clickable */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                  style={{
                    width: 72, height: 72, borderRadius: 16,
                    background: "rgba(255,255,255,0.25)",
                    border: "2.5px solid rgba(255,255,255,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, fontWeight: 800, cursor: "pointer",
                    overflow: "hidden", position: "relative",
                    transition: "border-color 0.2s",
                    borderColor: avatarHover ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    initials
                  )}
                  {(avatarHover || isUploadingAvatar) && (
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "rgba(0,0,0,0.45)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 2,
                    }}>
                      {isUploadingAvatar ? (
                        <i className="ti ti-loader-2" style={{ fontSize: 20, color: "#fff" }} />
                      ) : (
                        <>
                          <i className="ti ti-camera" style={{ fontSize: 18, color: "#fff" }} />
                          <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, letterSpacing: "0.04em" }}>UBAH</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>Profil UMKM</p>
                <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 800 }}>{businessName}</h1>
                <p style={{ margin: "0 0 8px", fontSize: 13, opacity: 0.85 }}>
                  <i className="ti ti-user" style={{ marginRight: 4 }} />Pemilik: {ownerName}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {profile?.business_sector && (
                    <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                      <i className={`ti ${sectorIcon}`} style={{ marginRight: 4 }} />{profile.business_sector}
                    </span>
                  )}
                  {profile?.city && (
                    <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                      <i className="ti ti-map-pin" style={{ marginRight: 4 }} />{profile.city}
                    </span>
                  )}
                  {profile?.established_year && (
                    <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                      <i className="ti ti-calendar" style={{ marginRight: 4 }} />Est. {profile.established_year}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={() => router.push("/umkm/profile/edit")}
              style={{ background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, backdropFilter: "blur(4px)" }}
            >
              <i className="ti ti-edit" /> Edit Profil
            </button>
          </div>

          {/* Avatar error */}
          {avatarError && (
            <div style={{ marginTop: 12, background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-alert-circle" /> {avatarError}
            </div>
          )}

          {/* Avatar hint */}
          {!avatarError && (
            <p style={{ margin: "10px 0 0", fontSize: 12, opacity: 0.7 }}>
              <i className="ti ti-camera" style={{ marginRight: 4 }} />Klik foto untuk mengubah · Maks. 2MB · JPG, PNG, WebP
            </p>
          )}

          {/* Progress bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 8, marginBottom: 6 }}>
              <div style={{ background: "#fff", borderRadius: 99, height: 8, width: `${pct}%`, transition: "width 0.4s" }} />
            </div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>{pct}% profil terisi · {filled.length}/{allFields.length} field</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <StatCard icon="ti-users" label="Total Pekerja Pernah Bergabung" value={stats.totalWorkers} color="#0f6e99" />
          <StatCard icon="ti-user-check" label="Pekerja Aktif Saat Ini" value={stats.activeWorkers} color="#16a34a" />
        </div>

        {/* SECTION 1: INFO BISNIS */}
        <section style={{ background: "#f6fafe", border: "1px solid #e5edf4", borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#0a2c4f", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-building-store" style={{ color: "#0f6e99", fontSize: 18 }} /> Informasi Bisnis
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
            <InfoRow label="Nama Bisnis" value={profile?.business_name} icon="ti-building-store" />
            <InfoRow label="Sektor Usaha" value={profile?.business_sector} icon="ti-category" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <InfoRow label="Tahun Berdiri" value={profile?.established_year ? String(profile.established_year) : null} icon="ti-calendar" />
            <InfoRow label="Nomor Izin Usaha" value={profile?.business_license} icon="ti-license" />
          </div>

          {profile?.company_description && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                <i className="ti ti-file-description" style={{ marginRight: 4 }} />Deskripsi Bisnis
              </span>
              <p style={{ margin: 0, fontSize: 14, color: "#0a2c4f", lineHeight: 1.7, background: "#fff", border: "1px solid #e5edf4", borderRadius: 10, padding: "10px 14px" }}>
                {profile.company_description}
              </p>
            </div>
          )}
        </section>

        {/* SECTION 2: KONTAK & LOKASI */}
        <section style={{ background: "#f6fafe", border: "1px solid #e5edf4", borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#0a2c4f", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-address-book" style={{ color: "#0f6e99", fontSize: 18 }} /> Kontak & Lokasi
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <InfoRow label="Nama Pemilik" value={profile?.owner_name} icon="ti-user" />
            <InfoRow label="No. HP / WhatsApp" value={profile?.phone || user?.phone} icon="ti-phone" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <InfoRow label="Kota" value={profile?.city} icon="ti-map-pin" />
            <InfoRow label="Provinsi" value={profile?.province} icon="ti-map" />
          </div>

          {profile?.website && (
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                <i className="ti ti-world" style={{ marginRight: 4 }} />Website
              </span>
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 14, color: "#0f6e99", fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {profile.website} <i className="ti ti-external-link" style={{ fontSize: 12 }} />
              </a>
            </div>
          )}

          {profile?.business_address && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                <i className="ti ti-home" style={{ marginRight: 4 }} />Alamat Usaha
              </span>
              <p style={{ margin: 0, fontSize: 14, color: "#0a2c4f", lineHeight: 1.6, background: "#fff", border: "1px solid #e5edf4", borderRadius: 10, padding: "10px 14px" }}>
                {profile.business_address}
              </p>
            </div>
          )}
        </section>

        {/* CTA if profile incomplete */}
        {pct < 100 && (
          <div style={{ background: "#e8f4fd", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="ti ti-info-circle" style={{ color: "#0f6e99", fontSize: 20 }} />
              <p style={{ margin: 0, fontSize: 14, color: "#0a2c4f", fontWeight: 500 }}>
                Profil bisnis Anda belum lengkap. Profil lengkap meningkatkan kepercayaan pekerja.
              </p>
            </div>
            <button
              onClick={() => router.push("/umkm/profile/edit")}
              style={{ background: "linear-gradient(135deg,#0f6e99,#1198c8)", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
            >
              <i className="ti ti-edit" /> Lengkapi Sekarang
            </button>
          </div>
        )}

      </div>
      </div>
    </>
  );
}
