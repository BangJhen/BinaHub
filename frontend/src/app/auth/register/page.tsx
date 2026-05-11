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

export default function RegisterProgressive() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({ role: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (e.target.type === "file") {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setFormData({ ...formData, [e.target.name]: fileInput.files[0] });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleRoleSelect = (roleId: string) => {
    setFormData({ ...formData, role: roleId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    startTransition(async () => {
      const res = await signup(data);
      if (res.success) {
        setStep(4); // Success State
      } else {
        setErrorMsg(res.message);
      }
    });
  };

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

        {errorMsg && <p className={styles.message}>{errorMsg}</p>}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <h1>Informasi Personal</h1>
              <p>Mulai dengan identitas utama Anda.</p>
              <div className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Nama Lengkap</label>
                  <input className={styles.input} type="text" name="name" value={formData.name || ""} onChange={handleChange} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <input className={styles.input} type="email" name="email" value={formData.email || ""} onChange={handleChange} required />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="password">Password</label>
                  <input className={styles.input} type="password" name="password" value={formData.password || ""} onChange={handleChange} required minLength={6} />
                </div>
                <button 
                  className={styles.primaryBtn} 
                  onClick={handleNext} 
                  disabled={!formData.name || !formData.email || !formData.password || formData.password.length < 6}
                >
                  Lanjut
                </button>
              </div>
            </motion.div>
          )}

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
                  <button className={styles.secondaryBtn} onClick={handlePrev}>Kembali</button>
                  <button className={styles.primaryBtn} onClick={handleNext} disabled={!formData.role}>Lanjut</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.form key="step3" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} onSubmit={handleSubmit}>
              <h1>Detail Lanjutan</h1>
              <p>Isi informasi spesifik untuk profil {formData.role === "umkm" ? "UMKM" : "Worker"} Anda.</p>
              <div className={styles.form}>
                
                {formData.role === "umkm" && (
                  <>
                    <div className={styles.inputGroup}>
                      <label>Nama Usaha</label>
                      <input className={styles.input} type="text" name="businessName" value={formData.businessName || ""} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Bidang Usaha</label>
                      <input className={styles.input} type="text" name="businessType" placeholder="Mebel, Makanan, dsb." value={formData.businessType || ""} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Alamat Usaha</label>
                      <textarea className={styles.input} name="businessAddress" value={formData.businessAddress || ""} onChange={handleChange} required rows={2} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Dokumen Legalitas Usaha / NIB (Opsional/PDF)</label>
                      <input className={styles.input} type="file" name="document" accept=".pdf,.png,.jpg,.jpeg" onChange={handleChange} />
                    </div>
                  </>
                )}

                {formData.role === "worker" && (
                  <>
                    <div className={styles.inputGroup}>
                      <label>Nomor Induk Kependudukan (NIK)</label>
                      <input className={styles.input} type="text" name="nik" value={formData.nik || ""} onChange={handleChange} required minLength={16} maxLength={16} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Keterampilan Utama</label>
                      <input className={styles.input} type="text" name="skills" placeholder="Tukang Kayu, Menjahit, dsb." value={formData.skills || ""} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Pengalaman Kerja (Tahun / Deskripsi)</label>
                      <input className={styles.input} type="text" name="experience" value={formData.experience || ""} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Alamat Domisili</label>
                      <textarea className={styles.input} name="workerAddress" value={formData.workerAddress || ""} onChange={handleChange} required rows={2} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Upload CV / Surat Keterangan Baik (PDF)</label>
                      <input className={styles.input} type="file" name="document" accept=".pdf,.png,.jpg,.jpeg" onChange={handleChange} required />
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

          {step === 4 && (
            <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4 }} className={styles.successState}>
              <div className={styles.successIcon}>✓</div>
              <h2>Registrasi Berhasil!</h2>
              <p>Akun {formData.role.toUpperCase()} Anda telah didaftarkan. Kami telah mengirimkan email konfirmasi ke <b>{formData.email}</b>. Silakan periksa inbox atau folder spam Anda.</p>
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
