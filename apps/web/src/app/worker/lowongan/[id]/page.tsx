"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./job-detail.module.css";

type RelatedJob = {
  id: string;
  title: string;
  salary: string;
  contract: string;
  duration: string;
  level: string;
  company: string;
  location: string;
  posted: string;
};

type JobDetail = {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  employmentType: string;
  location: string;
  salary: {
    min: number | null;
    max: number | null;
    display: string;
  };
  publishedAt: string | null;
  company: {
    id: string;
    name: string;
    sector: string;
    address: string;
    description: string;
  };
  descriptionBullets: string[];
  skills: string[];
  benefits: string[];
  educationLevel: string;
  experienceRequired: string;
  ageRange: string;
  relatedJobs: RelatedJob[];
  isApplied: boolean;
  applicationStatus: string | null;
  isSaved: boolean;
};

function formatRelativeTime(dateString: string | null) {
  if (!dateString) return "Baru saja";
  const date = new Date(dateString);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/worker/lowongan/${params.id}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Gagal memuat detail lowongan");
        }

        const payload = await response.json();
        setJob(payload.data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail lowongan");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  const descriptionItems = useMemo(() => {
    if (!job) return [];
    if (job.descriptionBullets?.length) return job.descriptionBullets;
    const fallback = job.description || job.requirements || "Deskripsi belum tersedia";
    return fallback.split(/\n+/).filter(Boolean);
  }, [job]);

  const requirementItems = useMemo(() => {
    if (!job?.requirements) return [];
    return job.requirements.split(/\n+/).filter(Boolean);
  }, [job]);

  const handleApply = async () => {
    if (!job || isApplying || job.isApplied) return;
    setApplyError("");
    setApplySuccess(false);
    setIsApplying(true);

    try {
      const response = await fetch(`/api/worker/lowongan/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal mengirim lamaran");
      }

      setApplySuccess(true);
      setJob((prev) =>
        prev ? { ...prev, isApplied: true, applicationStatus: "submitted" } : prev
      );
    } catch (err: any) {
      setApplyError(err.message || "Gagal mengirim lamaran");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!job || isSaving) return;
    setSaveError("");
    setSaveMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/worker/lowongan/${job.id}/save`, {
        method: job.isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal memperbarui status simpan");
      }

      const payload = await response.json();
      setJob((prev) => (prev ? { ...prev, isSaved: Boolean(payload.saved) } : prev));
      setSaveMessage(payload.saved ? "Lowongan disimpan." : "Lowongan dihapus dari simpan.");
    } catch (err: any) {
      setSaveError(err.message || "Gagal memperbarui status simpan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!job) return;
    setShareMessage("");

    try {
      const shareUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `Lowongan: ${job.title}`,
          url: shareUrl
        });
        setShareMessage("Tautan berhasil dibagikan.");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Tautan berhasil disalin ke clipboard.");
      }
    } catch (err: any) {
      setShareMessage("Gagal membagikan tautan.");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.jobDetailContainer}>
        <div className={styles.card} style={{ gridColumn: "1 / -1", textAlign: "center", color: "#0f6e99" }}>
          <i className="ti ti-loader-2" aria-hidden /> Memuat detail lowongan...
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.jobDetailContainer}>
        <div className={styles.card} style={{ gridColumn: "1 / -1", textAlign: "center", color: "#b91c1c" }}>
          <i className="ti ti-alert-circle" aria-hidden /> {error || "Lowongan tidak ditemukan"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.jobDetailContainer}>
      <a href="/worker/lowongan" className={styles.backLink}>
        <i className="ti ti-arrow-left" aria-hidden /> Kembali ke Daftar Lowongan
      </a>

      {/* MAIN COLUMN */}
      <main className={styles.mainContent}>
        {job.isApplied && (
          <div className={styles.statusBanner}>
            <i className="ti ti-circle-check" aria-hidden style={{ fontSize: 18 }} />
            Lamaran Anda sudah terkirim dan sedang ditinjau oleh perekrut.
          </div>
        )}

        {/* HERO */}
        <section className={styles.heroCard}>
          <div className={styles.headerTop}>
            <div className={styles.companyLogoFallback}>
              {job.company.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.headerInfo}>
              <p className={styles.eyebrow}>Lowongan Pekerjaan</p>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <div className={styles.companyRow}>
                <span className={styles.companyName}>{job.company.name}</span>
                <span style={{ opacity: 0.7, fontSize: 13 }}>• {job.location}</span>
              </div>
              <p className={styles.headerSubtext}>
                <i className="ti ti-calendar" aria-hidden /> Dipublikasikan {formatRelativeTime(job.publishedAt)}
              </p>
            </div>
          </div>
        </section>

        {/* QUICK INFO */}
        <section className={styles.card}>
          <div className={styles.quickInfoStrip}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gaji</span>
              <span className={styles.infoValue}>{job.salary.display}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tipe</span>
              <span className={styles.infoValue}>{job.employmentType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Lokasi</span>
              <span className={styles.infoValue}>{job.location}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Sektor</span>
              <span className={styles.infoValue}>{job.company.sector || "-"}</span>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <section className={styles.card}>
          <div className={styles.actionButtons}>
            <button
              className={styles.btnPrimary}
              type="button"
              onClick={handleApply}
              disabled={job.isApplied || isApplying}
            >
              {job.isApplied ? (
                <>
                  <i className="ti ti-check" aria-hidden /> Sudah Melamar
                </>
              ) : isApplying ? (
                <>
                  <i className="ti ti-loader-2" aria-hidden /> Mengirim...
                </>
              ) : (
                <>
                  <i className="ti ti-send" aria-hidden /> Lamar Pekerjaan Ini
                </>
              )}
            </button>
            <button
              className={`${styles.btnIcon} ${job.isSaved ? styles.btnIconActive : ""}`}
              type="button"
              onClick={handleSaveToggle}
              disabled={isSaving}
            >
              <i className={job.isSaved ? "ti ti-bookmark-filled" : "ti ti-bookmark"} aria-hidden />
              {job.isSaved ? "Tersimpan" : "Simpan"}
            </button>
            <button className={styles.btnIcon} type="button" onClick={handleShare}>
              <i className="ti ti-share" aria-hidden /> Bagikan
            </button>
          </div>
          {applyError && <p className={styles.applyError}>{applyError}</p>}
          {applySuccess && <p className={styles.applySuccess}>Lamaran berhasil dikirim.</p>}
          {saveError && <p className={styles.applyError}>{saveError}</p>}
          {saveMessage && <p className={styles.applySuccess}>{saveMessage}</p>}
          {shareMessage && <p className={styles.applySuccess}>{shareMessage}</p>}
        </section>

        {/* SUMMARY GRID */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Ringkasan Persyaratan</h2>
          <div className={styles.quickSummary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Pendidikan</span>
              <span className={styles.summaryValue}>{job.educationLevel || "Tidak ditentukan"}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Pengalaman</span>
              <span className={styles.summaryValue}>{job.experienceRequired || "Tidak ditentukan"}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Rentang Usia</span>
              <span className={styles.summaryValue}>{job.ageRange || "Tidak ditentukan"}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Lokasi Kerja</span>
              <span className={styles.summaryValue}>{job.location}</span>
            </div>
          </div>
        </section>

        {/* DESCRIPTION */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Deskripsi Pekerjaan</h2>
          <ul className={styles.descriptionList}>
            {descriptionItems.map((item, idx) => (
              <li className={styles.descriptionItem} key={`desc-${idx}`}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* REQUIREMENTS */}
        {requirementItems.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Syarat & Kualifikasi</h2>
            <ul className={styles.descriptionList}>
              {requirementItems.map((item, idx) => (
                <li className={styles.descriptionItem} key={`req-${idx}`}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* SKILLS */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Skills yang Dibutuhkan</h2>
          <div className={styles.tagList}>
            {job.skills.length > 0 ? (
              job.skills.map((skill) => (
                <span className={styles.tag} key={skill}>
                  {skill}
                </span>
              ))
            ) : (
              <p className={styles.emptyState}>Belum ada informasi skills.</p>
            )}
          </div>
        </section>

        {/* BENEFITS */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Benefit Kerja</h2>
          <div className={styles.tagList}>
            {job.benefits.length > 0 ? (
              job.benefits.map((benefit) => (
                <span className={`${styles.tag} ${styles.tagBenefit}`} key={benefit}>
                  <i className="ti ti-check" aria-hidden style={{ marginRight: 4 }} />
                  {benefit}
                </span>
              ))
            ) : (
              <p className={styles.emptyState}>Belum ada benefit yang dicantumkan.</p>
            )}
          </div>
        </section>

        {/* COMPANY */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Tentang Perusahaan</h2>
          <div className={styles.companyInfo}>
            <div className={styles.companyHeader}>
              <div className={styles.companyLogoSmall}>{job.company.name.charAt(0).toUpperCase()}</div>
              <div className={styles.companyDetails}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0a2c4f" }}>{job.company.name}</p>
                <p className={styles.companyMeta}>{job.company.sector || "Sektor tidak ditentukan"}</p>
              </div>
            </div>
            <div className={styles.companyAddress}>
              <p className={styles.companyMetaRow}>
                <i className="ti ti-map-pin" aria-hidden /> Alamat Kantor
              </p>
              <p className={styles.companyMeta}>{job.company.address || "Alamat tidak tersedia"}</p>
            </div>
            {job.company.description && (
              <p className={styles.companyMeta} style={{ lineHeight: 1.6 }}>
                {job.company.description}
              </p>
            )}
          </div>
        </section>
      </main>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <section className={styles.safetyCard}>
          <div className={styles.safetyHeader}>
            <span className={styles.safetyIcon}>!</span>
            <h3 className={styles.safetyTitle}>Tips Aman Cari Kerja</h3>
          </div>
          <p className={styles.safetyText}>
            Pemberi kerja yang kredibel tidak pernah meminta uang dalam bentuk apapun. Jangan berikan data bank,
            kartu kredit, atau dokumen sensitif sebelum proses interview resmi.
          </p>
        </section>

        <section className={styles.card}>
          <h3 className={styles.sectionTitle}>Lowongan Lainnya</h3>
          <div className={styles.relatedList}>
            {job.relatedJobs.length > 0 ? (
              job.relatedJobs.map((item) => (
                <article className={styles.relatedItem} key={item.id}>
                  <div className={styles.relatedHeader}>
                    <p className={styles.relatedTitle}>{item.title}</p>
                    <span className={styles.relatedSalary}>{item.salary}</span>
                  </div>
                  <div className={styles.relatedMeta}>
                    <span>{item.contract}</span>
                    {item.level && <span>{item.level}</span>}
                  </div>
                  <p className={styles.relatedCompany}>{item.company}</p>
                  <div className={styles.relatedFooter}>
                    <span>
                      <i className="ti ti-map-pin" aria-hidden /> {item.location}
                    </span>
                    <span>{item.posted}</span>
                  </div>
                </article>
              ))
            ) : (
              <p className={styles.emptyState}>Belum ada lowongan terkait.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
