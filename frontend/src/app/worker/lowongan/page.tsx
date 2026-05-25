"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import type { WorkerLowongan } from "@/lib/lowongan-queries";

export default function LowonganPage() {
  const [lowonganList, setLowonganList] = useState<WorkerLowongan[]>([]);
  const [filteredList, setFilteredList] = useState<WorkerLowongan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/worker/lowongan");
        if (!res.ok) throw new Error("Gagal mengambil data lowongan");
        const data = await res.json();
        setLowonganList(data);
        setFilteredList(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    // Client-side filtering
    let result = lowonganList;

    if (searchTitle.trim()) {
      const query = searchTitle.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(query) || 
        j.umkm_name.toLowerCase().includes(query)
      );
    }

    if (searchLocation.trim()) {
      const query = searchLocation.toLowerCase();
      result = result.filter(j => 
        (j.location || "").toLowerCase().includes(query)
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter(j => {
        const type = j.employment_type || "Full-time";
        // Check if any selected type matches
        return selectedTypes.some(t => type.toLowerCase().includes(t.toLowerCase()));
      });
    }

    setFilteredList(result);
  }, [searchTitle, searchLocation, selectedTypes, lowonganList]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const jobTypes = ["Full Time", "Part Time", "Freelance", "Contract", "Internship"];

  const formatRupiah = (amount: number | null) => {
    if (!amount) return "";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const getSalary = (job: WorkerLowongan) => {
    if (job.salary_min && job.salary_max) return `${formatRupiah(job.salary_min)} - ${formatRupiah(job.salary_max)}`;
    if (job.salary_min) return `Mulai dari ${formatRupiah(job.salary_min)}`;
    return "Gaji Dirahasiakan";
  };

  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Baru saja";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Dibuka hari ini";
    return `Dibuka ${diffDays} hari lalu`;
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
      {/* HERO SEARCH SECTION */}
      <section className={styles.heroSearch}>
        <div className={styles.heroContent}>
          
          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <svg className={styles.searchSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Cari Nama Pekerjaan, Skill, dan Perusahaan" 
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.searchInputWrapper}>
              <svg className={styles.searchSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C16 16.8 19 12.8 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.8 8 16.8 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Semua Kota/Provinsi" 
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.searchBtn}>CARI</button>
          </div>
          <button 
            className={styles.mobileFilterBtn}
            onClick={() => setIsMobileFilterOpen(true)}
          >
            Filter Lowongan
          </button>
        </div>
      </section>

      <div className={styles.contentLayout}>
        {/* MOBILE OVERLAY */}
        {isMobileFilterOpen && (
          <div className={styles.mobileOverlay} onClick={() => setIsMobileFilterOpen(false)}></div>
        )}

        {/* SIDEBAR FILTER */}
        <aside className={`${styles.sidebar} ${isMobileFilterOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <h3>Filter</h3>
            <button className={styles.closeSidebarBtn} onClick={() => setIsMobileFilterOpen(false)}>✕</button>
          </div>
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Tipe Pekerjaan</h3>
            <div className={styles.filterList}>
              {jobTypes.map(type => (
                <label key={type} className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>{type}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Filter Visual Placeholder ala Glints */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Sistem Kerja</h3>
            <div className={styles.filterList}>
              {["Work from Office", "Hybrid", "Remote"].map(sys => (
                <label key={sys} className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxText}>{sys}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Pengalaman</h3>
            <div className={styles.filterList}>
              {["Fresh Graduate", "1-3 Tahun", "3-5 Tahun", "Senior"].map(exp => (
                <label key={exp} className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxText}>{exp}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* JOB LISTINGS */}
        <section className={styles.jobListings}>
          <div className={styles.listingHeader}>
            <h2>{filteredList.length} Lowongan Ditemukan</h2>
            <div className={styles.listingActions}>
              <div className={styles.sortWrapper}>
                <label>Urutkan: </label>
                <select className={styles.sortSelect}>
                  <option>Paling Relevan</option>
                  <option>Terbaru</option>
                </select>
              </div>
              <a
                href="/worker/lowongan/saved"
                className={styles.savedShortcut}
                title="Lowongan tersimpan"
                aria-label="Lowongan tersimpan"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 3H18C19.1046 3 20 3.89543 20 5V21L12 16.5L4 21V5C4 3.89543 4.89543 3 6 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          {isLoading && (
            <div className={styles.list}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonLogo}></div>
                    <div className={styles.skeletonInfo}>
                      <div className={styles.skeletonTitle}></div>
                      <div className={styles.skeletonText}></div>
                    </div>
                  </div>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLine}></div>
                  </div>
                  <div className={styles.skeletonFooter}>
                    <div className={styles.skeletonTime}></div>
                    <div className={styles.skeletonBtn}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {error && <div className={styles.error}>{error}</div>}

          {!isLoading && !error && filteredList.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>Pencarian tidak ditemukan</h3>
              <p>Coba gunakan kata kunci lain atau hapus beberapa filter.</p>
              <button 
                className={styles.resetBtn}
                onClick={() => {
                  setSearchTitle("");
                  setSearchLocation("");
                  setSelectedTypes([]);
                }}
              >
                Reset Filter
              </button>
            </div>
          )}

          {!isLoading && !error && filteredList.length > 0 && (
            <div className={styles.list}>
              {filteredList.map((job) => (
                <div key={job.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.companyLogo}>{job.umkm_name.charAt(0).toUpperCase()}</div>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.companyName}>
                        {job.umkm_name} <span className={styles.verifiedBadge} title="Verified UMKM">✓</span>
                      </p>
                      <p className={styles.companyMeta}>
                        {job.location || "Lokasi tidak ditentukan"} • {job.employment_type || "Full Time"}
                      </p>
                    </div>
                    <button
                      className={`${styles.saveIconBtn} ${job.isSaved ? styles.saveIconBtnActive : ""}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSaveToggle(job.id, job.isSaved);
                      }}
                      disabled={savingIds.includes(job.id)}
                      title={job.isSaved ? "Hapus dari simpan" : "Simpan lowongan"}
                      aria-label={job.isSaved ? "Hapus dari simpan" : "Simpan lowongan"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M6 3H18C19.1046 3 20 3.89543 20 5V21L12 16.5L4 21V5C4 3.89543 4.89543 3 6 3Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill={job.isSaved ? "currentColor" : "none"}
                        />
                      </svg>
                    </button>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.salaryText}>{getSalary(job)}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Sektor</span>
                      <span>{job.business_sector || "Sektor tidak ditentukan"}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Alamat</span>
                      <span>{job.business_address || "Alamat tidak ditentukan"}</span>
                    </div>
                    {job.skills && job.skills.length > 0 && (
                      <div className={styles.skillsWrapper}>
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className={styles.skillBadge}>{skill}</span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className={styles.skillBadgeMore}>+{job.skills.length - 3} lagi</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.timeLabel}>
                      {getRelativeTime(job.published_at)}
                    </span>
                    <div className={styles.cardActions}>
                      <a className={styles.secondaryBtn} href={`/worker/lowongan/${job.id}`}>
                        Lihat Detail
                      </a>
                      <button className={styles.applyBtn}>Lamar Sekarang</button>
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
