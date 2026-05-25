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
        const res = await fetch("/api/worker/lowongan/saved", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal mengambil data lowongan tersimpan");
        const data = await res.json();
        setLowonganList(Array.isArray(data) ? data : data.data || []);
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
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSalary = (job: WorkerLowongan) => {
    if (job.salary_min && job.salary_max) {
      return `${formatRupiah(job.salary_min)} - ${formatRupiah(job.salary_max)}`;
    }
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
      // Remove unsaved jobs from list to provide immediate visual feedback
      if (!payload.saved) {
        setLowonganList((prev) => prev.filter((item) => item.id !== jobId));
      } else {
        setLowonganList((prev) =>
          prev.map((item) => (item.id === jobId ? { ...item, isSaved: true } : item))
        );
      }
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
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.85
            }}
          >
            Daftar Tersimpan
          </p>
          <h1 className={styles.heroTitle}>Lowongan Tersimpan</h1>
          <p className={styles.heroSubtitle}>
            Daftar lowongan yang sudah Anda simpan untuk dilamar nanti.
          </p>
        </div>
      </section>

      <div className={styles.contentLayout} style={{ gridTemplateColumns: "1fr" }}>
        <section className={styles.jobListings}>
          <div className={styles.listingHeader}>
            <h2>{lowonganList.length} Lowongan Tersimpan</h2>
            <a href="/worker/lowongan" className={styles.savedShortcut}>
              <i className="ti ti-search" aria-hidden /> Cari Lowongan Lainnya
            </a>
          </div>

          {isLoading && (
            <div className={styles.loading}>
              <i className="ti ti-loader-2" aria-hidden /> Memuat lowongan tersimpan...
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {!isLoading && !error && lowonganList.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <i className="ti ti-bookmark" aria-hidden />
              </div>
              <h3>Belum ada lowongan tersimpan</h3>
              <p>Gunakan tombol Simpan di halaman lowongan untuk menambahkannya ke sini.</p>
              <a href="/worker/lowongan" className={styles.resetBtn} style={{ marginTop: 14 }}>
                Jelajahi Lowongan
              </a>
            </div>
          )}

          {!isLoading && !error && lowonganList.length > 0 && (
            <div className={styles.list}>
              {lowonganList.map((job) => (
                <article key={job.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.companyLogo}>
                      {job.umkm_name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.companyName}>
                        {job.umkm_name}
                        <span className={styles.verifiedBadge} title="Verified UMKM">
                          <i className="ti ti-rosette-discount-check" aria-hidden />
                        </span>
                      </p>
                      <p className={styles.companyMeta}>
                        <span>
                          <i className="ti ti-building" aria-hidden /> {job.business_sector || "Sektor tidak ditentukan"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <i className="ti ti-map-pin" aria-hidden style={{ color: "#0f6e99" }} />
                      {job.location || "Lokasi tidak ditentukan"}
                    </div>
                    <div className={styles.metaRow}>
                      <i className="ti ti-briefcase" aria-hidden style={{ color: "#0f6e99" }} />
                      {job.employment_type || "Full Time"}
                    </div>
                    <div className={styles.metaRow}>
                      <i className="ti ti-coin" aria-hidden style={{ color: "#16a34a" }} />
                      <span className={styles.salaryText}>{getSalary(job)}</span>
                    </div>
                    {job.business_address && (
                      <div className={styles.metaRow}>
                        <i className="ti ti-map-2" aria-hidden style={{ color: "#0f6e99" }} />
                        {job.business_address}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.timeLabel}>
                      <i className="ti ti-calendar" aria-hidden /> Dipublikasikan{" "}
                      {job.published_at
                        ? new Date(job.published_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })
                        : "Baru saja"}
                    </span>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={`${styles.saveIconBtn} ${styles.saveIconBtnActive}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSaveToggle(job.id, true);
                        }}
                        disabled={savingIds.includes(job.id)}
                        aria-label="Hapus dari simpan"
                        title="Hapus dari simpan"
                      >
                        <i className="ti ti-bookmark-filled" aria-hidden />
                      </button>
                      <a className={styles.applyBtn} href={`/worker/lowongan/${job.id}`}>
                        Lihat Detail <i className="ti ti-arrow-right" aria-hidden />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
