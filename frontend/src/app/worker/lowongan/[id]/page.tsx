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
          method: "GET",
          headers: { "Content-Type": "application/json" }
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
    return [fallback];
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
        prev
          ? {
              ...prev,
              isApplied: true,
              applicationStatus: "submitted"
            }
          : prev
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
      setJob((prev) =>
        prev
          ? {
              ...prev,
              isSaved: Boolean(payload.saved)
            }
          : prev
      );
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
        setShareMessage("Tautan berhasil disalin.");
      }
    } catch (err: any) {
      setShareMessage("Gagal membagikan tautan.");
    }
  };

  return (
    <div className={styles.jobDetailContainer}>
      {isLoading ? (
        <div className={styles.card}>Memuat detail lowongan...</div>
      ) : null}
      {!isLoading && error ? (
        <div className={styles.card}>{error}</div>
      ) : null}
      {!isLoading && !error && job ? (
        <>
      {/* Kolom Kiri: MAIN CONTENT */}
      <main className={styles.mainContent}>
        <section className={styles.card}>
          <div className={styles.headerTop}>
            <div className={styles.companyLogoFallback}>{job.company.name.charAt(0)}</div>
            <div className={styles.headerInfo}>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <div className={styles.companyRow}>
                <span className={styles.companyName}>{job.company.name}</span>
              </div>
              <p className={styles.headerSubtext}>
                Dipublikasikan {job.publishedAt ? new Date(job.publishedAt).toLocaleDateString("id-ID") : "Baru saja"}
              </p>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.quickInfoStrip}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Gaji</span>
              <span className={styles.infoValue}>{job.salary.display}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Kategori</span>
              <span className={styles.infoValue}>{job.company.sector}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Posisi</span>
              <span className={styles.infoValue}>{job.employmentType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Lokasi</span>
              <span className={styles.infoValue}>{job.location}</span>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.actionButtons}>
            <button className={styles.btnPrimary} type="button" onClick={handleApply} disabled={job.isApplied || isApplying}>
              {job.isApplied ? "Sudah Melamar" : isApplying ? "Mengirim..." : "Lamar Pekerjaan"}
            </button>
            <button className={styles.btnSecondary} type="button" onClick={handleApply} disabled={job.isApplied || isApplying}>
              {job.isApplied ? "Lamaran Terkirim" : "Lamar & Chat"}
            </button>
            <button
              className={`${styles.btnIcon} ${job.isSaved ? styles.btnIconActive : ""}`}
              type="button"
              onClick={handleSaveToggle}
              disabled={isSaving}
            >
              {job.isSaved ? "Tersimpan" : "Simpan"}
            </button>
            <button className={styles.btnIcon} type="button" onClick={handleShare}>
              Bagikan
            </button>
          </div>
          {applyError ? <p className={styles.applyError}>{applyError}</p> : null}
          {applySuccess ? <p className={styles.applySuccess}>Lamaran berhasil dikirim.</p> : null}
          {saveError ? <p className={styles.applyError}>{saveError}</p> : null}
          {saveMessage ? <p className={styles.applySuccess}>{saveMessage}</p> : null}
          {shareMessage ? <p className={styles.applySuccess}>{shareMessage}</p> : null}
        </section>

        <section className={styles.card}>
          <div className={styles.quickSummary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Lokasi Kerja</span>
              <span className={styles.summaryValue}>{job.location}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Pengalaman</span>
              <span className={styles.summaryValue}>{job.experienceRequired}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Pendidikan</span>
              <span className={styles.summaryValue}>{job.educationLevel}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Rentang Usia</span>
              <span className={styles.summaryValue}>{job.ageRange}</span>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Skills</h2>
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

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Benefit Kerja</h2>
          <div className={styles.tagList}>
            {job.benefits.length > 0 ? (
              job.benefits.map((benefit) => (
                <span className={styles.tag} key={benefit}>
                  {benefit}
                </span>
              ))
            ) : (
              <p className={styles.emptyState}>Belum ada benefit yang dicantumkan.</p>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Deskripsi Pekerjaan</h2>
          <ul className={styles.descriptionList}>
            {descriptionItems.map((item) => (
              <li className={styles.descriptionItem} key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Tentang Perusahaan</h2>
          <div className={styles.companyInfo}>
            <div className={styles.companyHeader}>
              <div className={styles.companyLogoSmall}>{job.company.name.charAt(0)}</div>
              <div className={styles.companyDetails}>
                <p className={styles.companyName}>{job.company.name}</p>
                <p className={styles.companyMeta}>{job.company.sector}</p>
              </div>
            </div>
            <div className={styles.companyAddress}>
              <p className={styles.companyMetaRow}>Alamat kantor</p>
              <p className={styles.companyMeta}>{job.company.address}</p>
            </div>
            {job.company.description ? (
              <p className={styles.companyMeta}>{job.company.description}</p>
            ) : null}
          </div>
        </section>
      </main>

      {/* Kolom Kanan: SIDEBAR */}
      <aside className={styles.sidebar}>
        <section className={styles.safetyCard}>
          <div className={styles.safetyHeader}>
            <span className={styles.safetyIcon}>!</span>
            <h3 className={styles.safetyTitle}>Tips Aman Cari Kerja</h3>
          </div>
          <p className={styles.safetyText}>
            Pemberi kerja yang benar tidak akan meminta uang dalam bentuk apapun. Jangan berikan data bank atau kartu kredit.
          </p>
        </section>

        <section className={styles.relatedCard}>
          <h3 className={styles.sectionTitle}>Lowongan Lainnya Untukmu</h3>
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
                    <span>{item.duration}</span>
                    <span>{item.level}</span>
                  </div>
                  <p className={styles.relatedCompany}>{item.company}</p>
                  <div className={styles.relatedFooter}>
                    <span>{item.location}</span>
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
      </>
      ) : null}
    </div>
  );
}
