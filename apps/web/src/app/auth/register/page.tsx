"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../shared-auth.module.css";
import { signup } from "../actions";

const roles = [
  { id: "umkm", title: "Pemilik UMKM", desc: "Saya ingin mencari dan mempekerjakan tenaga kerja." },
  { id: "worker", title: "Pekerja (Worker)", desc: "Saya mencari peluang pekerjaan yang sesuai dengan keahlian saya." },
];

// ─── Client-side validation helpers ──────────────────────────────────────────
type FieldErrors = Record<string, string>;

function validateStep1(data: Record<string, any>): FieldErrors {
  const errors: FieldErrors = {};
  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const password = String(data.password ?? "");

  if (!name) {
    errors.name = "Nama lengkap wajib diisi";
  } else if (name.length < 3) {
    errors.name = "Nama minimal 3 karakter";
  } else if (name.length > 150) {
    errors.name = "Nama maksimal 150 karakter";
  }

  if (!email) {
    errors.email = "Email wajib diisi";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Format email tidak valid";
  } else if (email.length > 255) {
    errors.email = "Email terlalu panjang";
  }

  if (!password) {
    errors.password = "Password wajib diisi";
  } else if (password.length < 8) {
    errors.password = "Password minimal 8 karakter";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password harus mengandung minimal 1 huruf besar";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password harus mengandung minimal 1 angka";
  } else if (password.length > 128) {
    errors.password = "Password terlalu panjang";
  }

  return errors;
}

function validateStep3Umkm(data: Record<string, any>): FieldErrors {
  const errors: FieldErrors = {};
  const businessName = String(data.businessName ?? "").trim();
  const businessType = String(data.businessType ?? "").trim();
  const businessAddress = String(data.businessAddress ?? "").trim();

  if (!businessName) {
    errors.businessName = "Nama usaha wajib diisi";
  } else if (businessName.length < 4) {
    errors.businessName = "Nama usaha minimal 4 karakter";
  } else if (businessName.length > 150) {
    errors.businessName = "Nama usaha maksimal 150 karakter";
  }

  if (!businessType) {
    errors.businessType = "Bidang usaha wajib diisi";
  } else if (businessType.length < 2) {
    errors.businessType = "Bidang usaha minimal 2 karakter";
  } else if (businessType.length > 120) {
    errors.businessType = "Bidang usaha maksimal 120 karakter";
  }

  if (!businessAddress) {
    errors.businessAddress = "Alamat usaha wajib diisi";
  } else if (businessAddress.length < 5) {
    errors.businessAddress = "Alamat usaha minimal 5 karakter";
  } else if (businessAddress.length > 500) {
    errors.businessAddress = "Alamat usaha maksimal 500 karakter";
  }

  return errors;
}

function validateStep3Worker(data: Record<string, any>): FieldErrors {
  const errors: FieldErrors = {};
  const nik = String(data.nik ?? "").trim();
  const skills = String(data.skills ?? "").trim();
  const experience = String(data.experience ?? "").trim();
  const workerAddress = String(data.workerAddress ?? "").trim();
  const document = data.document;

  if (!nik) {
    errors.nik = "NIK wajib diisi";
  } else if (!/^\d{16}$/.test(nik)) {
    errors.nik = "NIK harus tepat 16 digit angka (tanpa spasi atau huruf)";
  }

  if (!skills) {
    errors.skills = "Keterampilan wajib diisi";
  } else if (skills.length < 3) {
    errors.skills = "Keterampilan minimal 3 karakter";
  } else if (skills.length > 500) {
    errors.skills = "Deskripsi keterampilan maksimal 500 karakter";
  }

  if (!experience) {
    errors.experience = "Pengalaman kerja wajib diisi";
  } else if (experience.length < 3) {
    errors.experience = "Pengalaman kerja minimal 3 karakter";
  } else if (experience.length > 1000) {
    errors.experience = "Pengalaman kerja maksimal 1000 karakter";
  }

  if (!workerAddress) {
    errors.workerAddress = "Alamat domisili wajib diisi";
  } else if (workerAddress.length < 5) {
    errors.workerAddress = "Alamat domisili minimal 5 karakter";
  } else if (workerAddress.length > 500) {
    errors.workerAddress = "Alamat domisili maksimal 500 karakter";
  }

  if (!document || !(document instanceof File) || document.size === 0) {
    errors.document = "Dokumen CV / Surat Keterangan wajib diunggah";
  } else {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    const allowedExts = ["pdf", "jpg", "jpeg", "png"];
    const ext = document.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedTypes.includes(document.type)) {
      errors.document = "Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG";
    } else if (!allowedExts.includes(ext)) {
      errors.document = "Ekstensi file tidak valid. Gunakan .pdf, .jpg, atau .png";
    } else if (document.size > 5 * 1024 * 1024) {
      errors.document = `Ukuran file terlalu besar. Maksimal 5MB`;
    }
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterProgressive() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({ role: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Clear a specific field error as soon as the user starts editing that field
  const clearFieldError = (name: string) => {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    clearFieldError(name);
    if (e.target.type === "file") {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setFormData((prev) => ({ ...prev, [name]: fileInput.files![0] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
  };

  // ── Step navigation with validation ──────────────────────────────────────
  const handleNext = () => {
    setSubmitError("");
    if (step === 1) {
      const errors = validateStep1(formData);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }
    setFieldErrors({});
    setStep((s) => s + 1);
  };

  const handlePrev = () => {
    setFieldErrors({});
    setSubmitError("");
    setStep((s) => s - 1);
  };

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Validate step 3 client-side before sending to server
    const errors =
      formData.role === "umkm"
        ? validateStep3Umkm(formData)
        : validateStep3Worker(formData);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    startTransition(async () => {
      const res = await signup(data);
      if (res.success) {
        setSuccessMsg(res.message ?? "Registrasi berhasil!");
        setStep(4);
      } else {
        setSubmitError(res.message);
      }
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fe = (field: string) => fieldErrors[field];
  const inputCls = (field: string) =>
    `${styles.input}${fe(field) ? ` ${styles.inputError}` : ""}`;

  const variants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  };

  return (
    <main className={styles.pageRoot}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Register</p>

        {step < 4 && (
          <div className={styles.stepper}>
            {[1, 2, 3].map((s) => (
              <div key={s} className={`${styles.stepDot} ${step >= s ? styles.active : ""}`} />
            ))}
          </div>
        )}

        {submitError && <p className={styles.message}>{submitError}</p>}

        <AnimatePresence mode="wait">

          {/* ── Step 1: Informasi Personal ──────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <h1>Informasi Personal</h1>
              <p>Mulai dengan identitas utama Anda.</p>
              <div className={styles.form}>

                <div className={styles.inputGroup}>
                  <label htmlFor="name">Nama Lengkap</label>
                  <input
                    className={inputCls("name")}
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    autoComplete="name"
                  />
                  {fe("name") && <span className={styles.fieldError}>{fe("name")}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    className={inputCls("email")}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="contoh@email.com"
                    autoComplete="email"
                  />
                  {fe("email") && <span className={styles.fieldError}>{fe("email")}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    className={inputCls("password")}
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  {fe("password")
                    ? <span className={styles.fieldError}>{fe("password")}</span>
                    : <span className={styles.passwordHint}>Min. 8 karakter, 1 huruf besar, 1 angka</span>
                  }
                </div>

                <button className={styles.primaryBtn} type="button" onClick={handleNext}>
                  Lanjut
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Pilih Role ───────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <h1>Pilih Peran</h1>
              <p>Sebagai apa Anda mendaftar di BinaHub?</p>
              <div className={styles.form}>
                <div className={styles.roleGrid}>
                  {roles.map((r) => (
                    <div
                      key={r.id}
                      className={`${styles.roleCard} ${formData.role === r.id ? styles.selected : ""}`}
                      onClick={() => handleRoleSelect(r.id)}
                    >
                      <h3>{r.title}</h3>
                      <p>{r.desc}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.btnGroup}>
                  <button type="button" className={styles.secondaryBtn} onClick={handlePrev}>Kembali</button>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={handleNext}
                    disabled={!formData.role}
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Detail Lanjutan ──────────────────────────────────── */}
          {step === 3 && (
            <motion.form
              key="step3"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              noValidate
            >
              <h1>Detail Lanjutan</h1>
              <p>Isi informasi spesifik untuk profil {formData.role === "umkm" ? "UMKM" : "Pekerja"} Anda.</p>
              <div className={styles.form}>

                {/* ── UMKM Fields ─────────────────────────────────────── */}
                {formData.role === "umkm" && (
                  <>
                    <div className={styles.inputGroup}>
                      <label htmlFor="businessName">Nama Usaha</label>
                      <input
                        className={inputCls("businessName")}
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName || ""}
                        onChange={handleChange}
                        placeholder="Contoh: Mebel Jaya Abadi"
                      />
                      {fe("businessName") && <span className={styles.fieldError}>{fe("businessName")}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="businessType">Bidang Usaha</label>
                      <input
                        className={inputCls("businessType")}
                        type="text"
                        id="businessType"
                        name="businessType"
                        value={formData.businessType || ""}
                        onChange={handleChange}
                        placeholder="Contoh: Mebel, Makanan, Jasa, dll."
                      />
                      {fe("businessType") && <span className={styles.fieldError}>{fe("businessType")}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="businessAddress">Alamat Usaha</label>
                      <textarea
                        className={inputCls("businessAddress")}
                        id="businessAddress"
                        name="businessAddress"
                        value={formData.businessAddress || ""}
                        onChange={handleChange}
                        placeholder="Contoh: Jl. Raya Mebel No. 12, Bandung"
                        rows={2}
                      />
                      {fe("businessAddress") && <span className={styles.fieldError}>{fe("businessAddress")}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="document">Dokumen Legalitas / NIB <span style={{ color: "#94a3b8", fontWeight: 400 }}>(Opsional, PDF/JPG/PNG, maks. 5MB)</span></label>
                      <input
                        className={styles.input}
                        type="file"
                        id="document"
                        name="document"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* ── Worker Fields ────────────────────────────────────── */}
                {formData.role === "worker" && (
                  <>
                    <div className={styles.inputGroup}>
                      <label htmlFor="nik">Nomor Induk Kependudukan (NIK)</label>
                      <input
                        className={inputCls("nik")}
                        type="text"
                        id="nik"
                        name="nik"
                        value={formData.nik || ""}
                        onChange={handleChange}
                        placeholder="16 digit angka sesuai KTP"
                        maxLength={16}
                        inputMode="numeric"
                      />
                      {fe("nik")
                        ? <span className={styles.fieldError}>{fe("nik")}</span>
                        : <span className={styles.passwordHint}>Tepat 16 digit, hanya angka</span>
                      }
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="skills">Keterampilan Utama</label>
                      <input
                        className={inputCls("skills")}
                        type="text"
                        id="skills"
                        name="skills"
                        value={formData.skills || ""}
                        onChange={handleChange}
                        placeholder="Contoh: Tukang Kayu, Menjahit, Las"
                      />
                      {fe("skills") && <span className={styles.fieldError}>{fe("skills")}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="experience">Pengalaman Kerja</label>
                      <input
                        className={inputCls("experience")}
                        type="text"
                        id="experience"
                        name="experience"
                        value={formData.experience || ""}
                        onChange={handleChange}
                        placeholder="Contoh: 2 tahun sebagai tukang mebel"
                      />
                      {fe("experience") && <span className={styles.fieldError}>{fe("experience")}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="workerAddress">Alamat Domisili</label>
                      <textarea
                        className={inputCls("workerAddress")}
                        id="workerAddress"
                        name="workerAddress"
                        value={formData.workerAddress || ""}
                        onChange={handleChange}
                        placeholder="Contoh: Jl. Melati No. 5, Cimahi"
                        rows={2}
                      />
                      {fe("workerAddress") && <span className={styles.fieldError}>{fe("workerAddress")}</span>}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="document">CV / Surat Keterangan Baik <span style={{ color: "#d93025" }}>*</span> <span style={{ color: "#94a3b8", fontWeight: 400 }}>(PDF/JPG/PNG, maks. 5MB)</span></label>
                      <input
                        className={inputCls("document")}
                        type="file"
                        id="document"
                        name="document"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleChange}
                      />
                      {fe("document") && <span className={styles.fieldError}>{fe("document")}</span>}
                    </div>
                  </>
                )}

                <div className={styles.btnGroup}>
                  <button type="button" className={styles.secondaryBtn} onClick={handlePrev}>Kembali</button>
                  <button type="submit" className={styles.primaryBtn} disabled={isPending}>
                    {isPending ? "Memproses..." : "Selesaikan Pendaftaran"}
                  </button>
                </div>
              </div>
            </motion.form>
          )}

          {/* ── Step 4: Sukses ───────────────────────────────────────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className={styles.successState}
            >
              <div className={styles.successIcon}>✓</div>
              <h2>Registrasi Berhasil!</h2>
              <p>{successMsg || `Akun ${formData.role.toUpperCase()} Anda telah didaftarkan.`}</p>
              <Link href="/auth/login" className={styles.primaryBtn} style={{ textDecoration: "none", width: "100%" }}>
                Menuju Halaman Login
              </Link>
            </motion.div>
          )}

        </AnimatePresence>

        {step < 4 && (
          <div className={styles.linksRow} style={{ marginTop: 24, textAlign: "center" }}>
            <Link href="/auth/login">Sudah punya akun? Login</Link>
          </div>
        )}
      </section>
    </main>
  );
}
