"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AvatarCropModal from "@/shared/components/AvatarCropModal";

const REHAB_STATUS_LABEL: Record<string, string> = {
  not_started: "Belum Mulai",
  ongoing: "Sedang Berjalan",
  completed: "Selesai",
  certified: "Bersertifikat",
};

const REHAB_STATUS_COLOR: Record<string, string> = {
  not_started: "#7a8a99",
  ongoing: "#0f6e99",
  completed: "#16a34a",
  certified: "#7c3aed",
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

export default function WorkerProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarHover, setAvatarHover] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/worker/profile")
      .then(r => r.json())
      .then(({ profile, user }) => {
        setProfile(profile);
        setUser(user);
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

    // Open crop modal
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
      // Notify navbar to refresh avatar
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

  const name = profile?.full_name || user?.full_name || "Pengguna";
  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const skills: string[] = profile?.skills
    ? profile.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const allFields = ["full_name", "gender", "city", "education_level", "nik", "phone", "skills", "experience_summary"];
  const filled = allFields.filter(f => {
    if (f === "skills") return skills.length > 0;
    const v = profile?.[f];
    return v && String(v).trim() !== "";
  });
  const pct = Math.round((filled.length / allFields.length) * 100);
  const rehabStatus = profile?.rehabilitation_status || "not_started";

  return (
    <>
      {/* Crop Modal */}
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
        <a href="/worker/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#0f6e99", textDecoration: "none", marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
          <i className="ti ti-arrow-left" /> Kembali ke Dashboard
        </a>

        {/* Hero Banner */}
        <div style={{ background: "linear-gradient(135deg,#0f6e99,#1198c8)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, color: "#fff", boxShadow: "0 16px 32px rgba(15,110,153,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 80, opacity: 0.12 }}>
            <i className="ti ti-user-circle" />
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
                    width: 72, height: 72, borderRadius: "50%",
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

                  {/* Hover overlay */}
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

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>

              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>Profil Saya</p>
                <h1 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: 800 }}>{name}</h1>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                    <i className="ti ti-briefcase" style={{ marginRight: 4 }} />Pekerja
                  </span>
                  {profile?.city && (
                    <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                      <i className="ti ti-map-pin" style={{ marginRight: 4 }} />{profile.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={() => router.push("/worker/profile/edit")}
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

        {/* SECTION 1: DATA DIRI */}
        <section style={{ background: "#f6fafe", border: "1px solid #e5edf4", borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#0a2c4f", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-user" style={{ color: "#0f6e99", fontSize: 18 }} /> Data Diri
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
            <InfoRow label="Nama Lengkap" value={profile?.full_name} icon="ti-id-badge" />
            <InfoRow label="NIK" value={profile?.nik} icon="ti-credit-card" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 18 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                <i className="ti ti-gender-bigender" style={{ marginRight: 4 }} />Jenis Kelamin
              </span>
              {profile?.gender ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f4fd", color: "#0f6e99", borderRadius: 99, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>
                  <i className={profile.gender === "Laki-laki" ? "ti ti-man" : "ti ti-woman"} />
                  {profile.gender}
                </span>
              ) : (
                <span style={{ fontSize: 14, color: "#b0bec5" }}>Belum diisi</span>
              )}
            </div>
            <InfoRow label="Tanggal Lahir" value={profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : null} icon="ti-calendar" />
            <InfoRow label="Usia" value={profile?.age ? `${profile.age} tahun` : null} icon="ti-clock" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <InfoRow label="No. HP" value={profile?.phone || user?.phone} icon="ti-phone" />
            <InfoRow label="Kota Domisili" value={profile?.city} icon="ti-map-pin" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
            <InfoRow label="Provinsi" value={profile?.province} icon="ti-map" />
          </div>

          {profile?.address && (
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                <i className="ti ti-home" style={{ marginRight: 4 }} />Alamat Lengkap
              </span>
              <p style={{ margin: 0, fontSize: 14, color: "#0a2c4f", lineHeight: 1.6, background: "#fff", border: "1px solid #e5edf4", borderRadius: 10, padding: "10px 14px" }}>
                {profile.address}
              </p>
            </div>
          )}
        </section>

        {/* SECTION 2: PENDIDIKAN & PENGALAMAN */}
        <section style={{ background: "#f6fafe", border: "1px solid #e5edf4", borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#0a2c4f", display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-school" style={{ color: "#0f6e99", fontSize: 18 }} /> Pendidikan & Pengalaman
          </h3>

          <div style={{ marginBottom: 18 }}>
            <InfoRow label="Pendidikan Terakhir" value={profile?.education_level} icon="ti-certificate" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 8 }}>
              <i className="ti ti-tools" style={{ marginRight: 4 }} />Skills / Keahlian
            </span>
            {skills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.map(s => (
                  <span key={s} style={{ background: "#0f6e99", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 14, color: "#b0bec5" }}>Belum diisi</span>
            )}
          </div>

          {profile?.experience_summary && (
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                <i className="ti ti-briefcase" style={{ marginRight: 4 }} />Ringkasan Pengalaman Kerja
              </span>
              <p style={{ margin: 0, fontSize: 14, color: "#0a2c4f", lineHeight: 1.7, background: "#fff", border: "1px solid #e5edf4", borderRadius: 10, padding: "10px 14px" }}>
                {profile.experience_summary}
              </p>
            </div>
          )}

          {profile?.rehabilitation_program && (
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
                <i className="ti ti-heart-handshake" style={{ marginRight: 4 }} />Program Rehabilitasi
              </span>
              <p style={{ margin: 0, fontSize: 14, color: "#0a2c4f", lineHeight: 1.7, background: "#fff", border: "1px solid #e5edf4", borderRadius: 10, padding: "10px 14px" }}>
                {profile.rehabilitation_program}
              </p>
            </div>
          )}

          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0f6e99", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 8 }}>
              <i className="ti ti-progress" style={{ marginRight: 4 }} />Status Rehabilitasi
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${REHAB_STATUS_COLOR[rehabStatus]}18`, color: REHAB_STATUS_COLOR[rehabStatus], borderRadius: 99, padding: "4px 14px", fontSize: 13, fontWeight: 600, border: `1px solid ${REHAB_STATUS_COLOR[rehabStatus]}30` }}>
              <i className="ti ti-circle-check" />
              {REHAB_STATUS_LABEL[rehabStatus]}
            </span>
          </div>
        </section>

        {/* SECTION 3: LATAR BELAKANG */}
        {(profile?.crime_type || profile?.sentence_years || profile?.release_date || profile?.lapas_name) && (
          <section style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 16, padding: "22px 24px", marginBottom: 18 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
              <i className="ti ti-shield-lock" style={{ color: "#f59e0b", fontSize: 18 }} /> Latar Belakang
              <span style={{ marginLeft: "auto", fontSize: 11, background: "#fde68a", color: "#92400e", padding: "2px 10px", borderRadius: 99, fontWeight: 600 }}>SENSITIF</span>
            </h3>

            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <i className="ti ti-lock" style={{ color: "#f59e0b", fontSize: 18, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 13, color: "#78350f" }}>Informasi ini bersifat rahasia dan hanya terlihat oleh Anda.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>Jenis Tindak Pidana</span>
                <span style={{ fontSize: 14, color: profile?.crime_type ? "#0a2c4f" : "#b0bec5" }}>{profile?.crime_type || "Belum diisi"}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>Lama Hukuman</span>
                <span style={{ fontSize: 14, color: profile?.sentence_years ? "#0a2c4f" : "#b0bec5" }}>
                  {profile?.sentence_years ? `${profile.sentence_years} tahun` : "Belum diisi"}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>Tanggal Bebas</span>
                <span style={{ fontSize: 14, color: profile?.release_date ? "#0a2c4f" : "#b0bec5" }}>
                  {profile?.release_date ? new Date(profile.release_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Belum diisi"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>Nama Lapas / Rutan</span>
                <span style={{ fontSize: 14, color: profile?.lapas_name ? "#0a2c4f" : "#b0bec5" }}>{profile?.lapas_name || "Belum diisi"}</span>
              </div>
            </div>
          </section>
        )}

        {/* CTA if profile incomplete */}
        {pct < 100 && (
          <div style={{ background: "#e8f4fd", border: "1px solid #bfdbfe", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="ti ti-info-circle" style={{ color: "#0f6e99", fontSize: 20 }} />
              <p style={{ margin: 0, fontSize: 14, color: "#0a2c4f", fontWeight: 500 }}>
                Profil Anda belum lengkap. Lengkapi profil untuk meningkatkan peluang diterima kerja.
              </p>
            </div>
            <button
              onClick={() => router.push("/worker/profile/edit")}
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
