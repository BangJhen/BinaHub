"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import type { WorkerLowongan } from "@/lib/lowongan-queries";

export default function SavedLowonganPage() {
  const [lowonganList, setLowonganList] = useState<WorkerLowongan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingIds, setSavingIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/worker/lowongan/saved");
        if (!res.ok) throw new Error("Gagal mengambil data lowongan tersimpan");
        const data = await res.json();
        setLowonganList(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const formatRupiah = (amount: number | null) => {
    if (!amount) return "";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const getSalary = (job: WorkerLowongan) => {
    if (job.salary_min && job.salary_max) return `${formatRupiah(job.salary_min)} - ${formatRupiah(job.salary_max)}`;
    if (job.salary_min) return `Mulai dari ${formatRupiah(job.salary_min)}`;
    return "Gaji Dirahasiakan";
  };

  const handleSaveToggle = async (jobId: string, isSaved: boolean) => {
    if (savingIds.includes(jobId)) return;
    setSavingIds((prev) => [...prev, jobId]);

    try {
      const response = await fetch(`/api/worker/lowongan/${jobId}/save`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal memperbarui simpan lowongan");
      }

      const payload = await response.json();
      setLowonganList((prev) =>
        prev.map((item) => (item.id === jobId ? { ...item, isSaved: Boolean(payload.saved) } : item))
      );
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui simpan lowongan");
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  return (
    <main className={styles.mainContainer}>
      <section className={styles.heroSearch}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Lowongan Tersimpan</h1>
          <p className={styles.heroSubtitle}>Daftar lowongan yang kamu simpan untuk diproses nanti.</p>
        </div>
      </section>

      <div className={styles.contentLayout}>
        <section className={styles.jobListings}>
          <div className={styles.listingHeader}>
            <h2>{lowonganList.length} Lowongan Tersimpan</h2>
          </div>

          {isLoading && (
            <div className={styles.loading}>
              <div className="animate-pulse">Memuat lowongan tersimpan...</div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {!isLoading && !error && lowonganList.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔖</div>
              <h3>Belum ada lowongan tersimpan</h3>
              <p>Gunakan tombol Simpan di halaman lowongan untuk menambahkannya.</p>
            </div>
          )}

          {!isLoading && !error && lowonganList.length > 0 && (
            <div className={styles.list}>
              {lowonganList.map((job) => (
                <div key={job.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.companyLogo}>{job.umkm_name.charAt(0).toUpperCase()}</div>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.companyName}>
                        {job.umkm_name} <span className={styles.verifiedBadge} title="Verified UMKM">✓</span>
                      </p>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaIcon}>📍</span> {job.location || "Lokasi tidak ditentukan"}
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaIcon}>🏢</span> {job.business_sector || "Sektor tidak ditentukan"}
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaIcon}>🧭</span> {job.business_address || "Alamat tidak ditentukan"}
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaIcon}>💰</span> <span className={styles.salaryText}>{getSalary(job)}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaIcon}>💼</span> {job.employment_type || "Full Time"}
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.timeLabel}>
                      Ditambahkan {job.published_at ? new Date(job.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Baru saja"}
                    </span>
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.saveBtn} ${job.isSaved ? styles.saveBtnActive : ""}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSaveToggle(job.id, job.isSaved);
                        }}
                        disabled={savingIds.includes(job.id)}
                      >
                        {job.isSaved ? "Tersimpan" : "Simpan"}
                      </button>
                      <a className={styles.applyBtn} href={`/worker/lowongan/${job.id}`}>
                        Lihat Detail
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
