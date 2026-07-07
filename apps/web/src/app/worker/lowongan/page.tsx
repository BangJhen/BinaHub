"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import type { WorkerLowongan, WorkerLowonganPage } from "@/features/lowongan/queries";
import { computeMatchScore, getMatchLabel, getMatchColors, type WorkerProfileForMatch } from "@/features/lowongan/match";

const JOB_TYPES = ["Full Time", "Part Time", "Freelance", "Contract", "Internship"];
const WORK_SYSTEMS = ["Work from Office", "Hybrid", "Remote"];
const EXPERIENCES = ["Fresh Graduate", "1-3 Tahun", "3-5 Tahun", "Senior"];

function formatRupiah(amount: number | null) {
  if (!amount) return "";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

function getSalary(job: WorkerLowongan) {
  if (job.salary_min && job.salary_max) return `${formatRupiah(job.salary_min)} - ${formatRupiah(job.salary_max)}`;
  if (job.salary_min) return `Mulai dari ${formatRupiah(job.salary_min)}`;
  if (job.salary_max) return `Hingga ${formatRupiah(job.salary_max)}`;
  return "Gaji Dirahasiakan";
}

function getRelativeTime(dateString: string | null) {
  if (!dateString) return "Baru saja";
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return `${Math.floor(diffDays / 30)} bulan lalu`;
}

function MatchBadge({ score, label }: { score: number; label: ReturnType<typeof getMatchLabel> }) {
  if (!label) return null;
  const { bg, color, border } = getMatchColors(label);
  return (
    <span style={{
      background: bg, color, border: `1px solid ${border}`,
      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
    }}>
      <i className="ti ti-target-arrow" style={{ fontSize: 11 }} />
      {score}% {label}
    </span>
  );
}

function JobCard({
  job, onSave, onApply, isSaving, isApplying, isApplied,
}: {
  job: WorkerLowongan;
  onSave: (id: string, saved: boolean) => void;
  onApply: (id: string) => void;
  isSaving: boolean;
  isApplying: boolean;
  isApplied: boolean;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.companyLogo}>{job.umkm_name.charAt(0).toUpperCase()}</div>
        <div className={styles.jobInfo}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
            <h3 className={styles.jobTitle} style={{ margin: 0 }}>{job.title}</h3>
            {job.matchLabel && <MatchBadge score={job.matchScore ?? 0} label={job.matchLabel} />}
          </div>
          <p className={styles.companyName}>
            {job.umkm_name}
            <span className={styles.verifiedBadge} title="Verified UMKM">
              <i className="ti ti-check" style={{ fontSize: 9 }} />
            </span>
          </p>
          <p className={styles.companyMeta}>
            <span><i className="ti ti-map-pin" aria-hidden /> {job.location || "Lokasi tidak ditentukan"}</span>
            <span>•</span>
            <span><i className="ti ti-briefcase" aria-hidden /> {job.employment_type || "Full Time"}</span>
            {job.business_sector && (
              <>
                <span>•</span>
                <span><i className="ti ti-building-store" aria-hidden /> {job.business_sector}</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSave(job.id, job.isSaved); }}
          disabled={isSaving}
          title={job.isSaved ? "Hapus dari simpan" : "Simpan lowongan"}
          aria-label={job.isSaved ? "Hapus dari simpan" : "Simpan lowongan"}
          style={{
            marginLeft: "auto",
            padding: "8px 10px",
            borderRadius: 10,
            border: job.isSaved ? "1.5px solid #fde68a" : "1.5px solid #d6e6f2",
            background: job.isSaved ? "#fef3c7" : "#ffffff",
            cursor: isSaving ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            opacity: isSaving ? 0.6 : 1,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: job.isSaved ? "#d97706" : "#4d6473",
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.background = job.isSaved ? "#fcd34d" : "#eaf3fb";
              e.currentTarget.style.borderColor = job.isSaved ? "#fcd34d" : "#0f6e99";
              e.currentTarget.style.color = job.isSaved ? "#b45309" : "#0f6e99";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = job.isSaved ? "#fef3c7" : "#ffffff";
            e.currentTarget.style.borderColor = job.isSaved ? "#fde68a" : "#d6e6f2";
            e.currentTarget.style.color = job.isSaved ? "#d97706" : "#4d6473";
          }}
        >
          <i className={job.isSaved ? "ti ti-bookmark-filled" : "ti ti-bookmark"} aria-hidden />
        </button>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.metaRow}>
          <span className={styles.salaryText}>
            <i className="ti ti-coin" aria-hidden /> {getSalary(job)}
          </span>
        </div>
        {job.skills && job.skills.length > 0 && (
          <div className={styles.skillsWrapper}>
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className={styles.skillBadge}>{skill}</span>
            ))}
            {job.skills.length > 4 && (
              <span className={styles.skillBadgeMore}>+{job.skills.length - 4} lagi</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.timeLabel}>
          <i className="ti ti-clock" aria-hidden /> {getRelativeTime(job.published_at)}
        </span>
        <div className={styles.cardActions}>
          <a className={styles.secondaryBtn} href={`/worker/lowongan/${job.id}`}>Lihat Detail</a>
          {isApplied ? (
            <span className={styles.appliedBadge}>
              <i className="ti ti-check" aria-hidden /> Sudah Melamar
            </span>
          ) : (
            <button className={styles.applyBtn} onClick={() => onApply(job.id)} disabled={isApplying}>
              {isApplying ? "Mengirim..." : "Lamar Sekarang"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LowonganPage() {
  const [lowonganList, setLowonganList] = useState<WorkerLowongan[]>([]);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfileForMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [applyingIds, setApplyingIds] = useState<string[]>([]);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "salary" | "match">("newest");

  useEffect(() => {
    setPage(1);
  }, [searchTitle, searchLocation, selectedTypes, sortBy]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          sortBy: sortBy === "salary" ? "salary" : "newest",
        });
        if (searchTitle.trim()) params.set("search", searchTitle.trim());
        if (searchLocation.trim()) params.set("location", searchLocation.trim());
        if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","));

        const [jobsRes, profileRes] = await Promise.all([
          fetch(`/api/worker/lowongan?${params.toString()}`, { cache: "no-store" }),
          fetch("/api/worker/profile", { cache: "no-store" }),
        ]);

        if (!jobsRes.ok) {
          const payload = (await jobsRes.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || "Gagal mengambil data lowongan");
        }

        const jobsPayload: WorkerLowonganPage = await jobsRes.json();
        const jobs = jobsPayload.items;
        let profile: WorkerProfileForMatch | null = null;

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData?.profile) {
            profile = {
              skills: profileData.profile.skills,
              education_level: profileData.profile.education_level,
              city: profileData.profile.city,
              province: profileData.profile.province,
              experience_summary: profileData.profile.experience_summary,
            };
          }
        }

        if (!isMounted) return;

        // Compute match scores
        const scored = jobs.map((job) => {
          if (!profile) return job;
          const score = computeMatchScore(profile, {
            skills: job.skills,
            education_level_required: job.education_level_required,
            location: job.location,
            experience_required: job.experience_required,
          });
          return { ...job, matchScore: score, matchLabel: getMatchLabel(score) };
        });

        setWorkerProfile(profile);
        setLowonganList(scored);
        setTotalJobs(jobsPayload.total);
        setTotalPages(Math.max(1, jobsPayload.totalPages));
        setError("");
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Gagal memuat data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [page, searchTitle, searchLocation, selectedTypes, sortBy]);

  // Top recommendations: score >= 50, sorted desc, max 3
  const recommendations = useMemo(() => {
    if (!workerProfile) return [];
    return [...lowonganList]
      .filter((j) => (j.matchScore ?? 0) >= 50)
      .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
      .slice(0, 3);
  }, [lowonganList, workerProfile]);

  const filteredList = useMemo(() => {
    let result = [...lowonganList];

    if (sortBy === "match") {
      result.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    }
    return result;
  }, [lowonganList, sortBy]);

  const toggleArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const handleResetFilters = () => {
    setSearchTitle(""); setSearchLocation(""); setSelectedTypes([]); setSelectedSystems([]); setPage(1);
  };

  const handleSaveToggle = async (jobId: string, isSaved: boolean) => {
    if (savingIds.includes(jobId)) return;
    setSavingIds((prev) => [...prev, jobId]);
    setLowonganList((prev) => prev.map((item) => item.id === jobId ? { ...item, isSaved: !isSaved } : item));
    try {
      const response = await fetch(`/api/worker/lowongan/${jobId}/save`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal memperbarui simpan lowongan");
      }
    } catch (err: any) {
      setLowonganList((prev) => prev.map((item) => item.id === jobId ? { ...item, isSaved } : item));
      setError(err.message || "Gagal memperbarui simpan lowongan");
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  const handleApply = async (jobId: string) => {
    if (applyingIds.includes(jobId) || appliedIds.includes(jobId)) return;
    setApplyingIds((prev) => [...prev, jobId]);
    try {
      const response = await fetch(`/api/worker/lowongan/${jobId}/apply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
      });
      if (!response.ok && response.status !== 409) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Gagal melamar");
      }
      setAppliedIds((prev) => [...prev, jobId]);
    } catch (err: any) {
      setError(err.message || "Gagal melamar");
    } finally {
      setApplyingIds((prev) => prev.filter((id) => id !== jobId));
    }
  };

  const hasProfile = !!workerProfile;

  return (
    <main className={styles.mainContainer}>
      {/* HERO SEARCH */}
      <section className={styles.heroSearch}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Cari Pekerjaan Impianmu</h1>
          <p className={styles.heroSubtitle}>
            Temukan lowongan dari UMKM terverifikasi yang siap memberi kesempatan kerja inklusif.
          </p>

          <div className={styles.searchBar}>
            <div className={styles.searchInputWrapper}>
              <i className="ti ti-search" style={{ fontSize: 18, marginRight: 10, color: "#4d6473", flexShrink: 0 }} />
              <input type="text" placeholder="Posisi, skill, atau perusahaan"
                value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)}
                className={styles.searchInput} />
            </div>
            <div className={styles.searchInputWrapper}>
              <i className="ti ti-map-pin" style={{ fontSize: 18, marginRight: 10, color: "#4d6473", flexShrink: 0 }} />
              <input type="text" placeholder="Semua Kota / Provinsi"
                value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)}
                className={styles.searchInput} />
            </div>
            <button className={styles.searchBtn}>CARI</button>
          </div>

          <button className={styles.mobileFilterBtn} onClick={() => setIsMobileFilterOpen(true)}>
            <i className="ti ti-filter" aria-hidden /> Filter Lowongan
          </button>
        </div>
      </section>

      <div className={styles.contentLayout}>
        {isMobileFilterOpen && (
          <div className={styles.mobileOverlay} onClick={() => setIsMobileFilterOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${isMobileFilterOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <h3>Filter Pencarian</h3>
            <button className={styles.closeSidebarBtn} onClick={() => setIsMobileFilterOpen(false)}>✕</button>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Tipe Pekerjaan</h3>
            <div className={styles.filterList}>
              {JOB_TYPES.map((type) => (
                <label key={type} className={styles.checkboxLabel}>
                  <input type="checkbox" checked={selectedTypes.includes(type)}
                    onChange={() => setSelectedTypes((prev) => toggleArray(prev, type))}
                    className={styles.checkbox} />
                  <span className={styles.checkboxText}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Sistem Kerja</h3>
            <div className={styles.filterList}>
              {WORK_SYSTEMS.map((sys) => (
                <label key={sys} className={styles.checkboxLabel}>
                  <input type="checkbox" checked={selectedSystems.includes(sys)}
                    onChange={() => setSelectedSystems((prev) => toggleArray(prev, sys))}
                    className={styles.checkbox} />
                  <span className={styles.checkboxText}>{sys}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Pengalaman</h3>
            <div className={styles.filterList}>
              {EXPERIENCES.map((exp) => (
                <label key={exp} className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxText}>{exp}</span>
                </label>
              ))}
            </div>
          </div>

          <button className={styles.resetFilters} onClick={handleResetFilters}>
            <i className="ti ti-restore" aria-hidden /> Reset Filter
          </button>
        </aside>

        {/* JOB LISTINGS */}
        <section className={styles.jobListings}>

          {/* Profile incomplete notice */}
          {!isLoading && !hasProfile && (
            <div style={{
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              border: "1px solid #fcd34d", borderRadius: 12,
              padding: "14px 18px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            }}>
              <i className="ti ti-info-circle" style={{ color: "#d97706", fontSize: 20, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#92400e" }}>
                  Profil belum lengkap — rekomendasi kecocokan belum tersedia
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#b45309" }}>
                  Lengkapi profil Anda agar kami bisa menampilkan lowongan yang paling cocok.
                </p>
              </div>
              <a href="/worker/profile/edit" style={{
                background: "#d97706", color: "#fff", padding: "7px 16px",
                borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
              }}>
                Lengkapi Profil
              </a>
            </div>
          )}

          {/* RECOMMENDATIONS */}
          {!isLoading && hasProfile && recommendations.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, #0f6e99, #1198c8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className="ti ti-sparkles" style={{ color: "#fff", fontSize: 16 }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0a2c4f" }}>
                    Rekomendasi Untukmu
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: "#4d6473" }}>
                    Berdasarkan skill, lokasi, dan pendidikan Anda
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {recommendations.map((job) => {
                  const { bg, color, border } = getMatchColors(job.matchLabel ?? null);
                  return (
                    <a key={job.id} href={`/worker/lowongan/${job.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        background: "#fff", border: `1px solid ${border}`,
                        borderRadius: 14, padding: "16px 16px 14px",
                        transition: "all 0.2s", cursor: "pointer",
                        boxShadow: `0 4px 16px ${color}18`,
                      }}>
                        {/* Match score bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{
                            background: bg, color, border: `1px solid ${border}`,
                            padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                            display: "inline-flex", alignItems: "center", gap: 4,
                          }}>
                            <i className="ti ti-target-arrow" style={{ fontSize: 11 }} />
                            {job.matchScore}% {job.matchLabel}
                          </span>
                          <span style={{ fontSize: 11, color: "#8198a8" }}>
                            {getRelativeTime(job.published_at)}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 4, background: "#f1f5f9", borderRadius: 99, marginBottom: 12, overflow: "hidden" }}>
                          <div style={{
                            height: 4, borderRadius: 99, width: `${job.matchScore}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}99)`,
                            transition: "width 0.6s ease",
                          }} />
                        </div>

                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: bg, color, display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 18, fontWeight: 800,
                          }}>
                            {job.umkm_name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "#0a2c4f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {job.title}
                            </p>
                            <p style={{ margin: "0 0 6px", fontSize: 12, color: "#0f6e99", fontWeight: 600 }}>
                              {job.umkm_name}
                            </p>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 11, color: "#6f8190", display: "flex", alignItems: "center", gap: 3 }}>
                                <i className="ti ti-map-pin" /> {job.location}
                              </span>
                              {job.salary_min && (
                                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                                  <i className="ti ti-coin" /> {formatRupiah(job.salary_min)}+
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* LISTING HEADER */}
          <div className={styles.listingHeader}>
            <h2>{totalJobs} Lowongan Ditemukan</h2>
            <div className={styles.listingActions}>
              <div className={styles.sortWrapper}>
                <label htmlFor="sort">Urutkan:</label>
                <select id="sort" className={styles.sortSelect}
                  value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                  <option value="newest">Terbaru</option>
                  <option value="salary">Gaji Tertinggi</option>
                  {hasProfile && <option value="match">Paling Cocok</option>}
                </select>
              </div>
              <a href="/worker/lowongan/saved" className={styles.savedShortcut}
                title="Lowongan tersimpan" aria-label="Lowongan tersimpan">
                <i className="ti ti-bookmark" aria-hidden /> Tersimpan
              </a>
            </div>
          </div>

          {/* SKELETON */}
          {isLoading && (
            <div className={styles.list}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonLogo} />
                    <div className={styles.skeletonInfo}>
                      <div className={styles.skeletonTitle} />
                      <div className={styles.skeletonText} />
                    </div>
                  </div>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                  </div>
                  <div className={styles.skeletonFooter}>
                    <div className={styles.skeletonTime} />
                    <div className={styles.skeletonBtn} />
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
              <button className={styles.resetBtn} onClick={handleResetFilters}>Reset Filter</button>
            </div>
          )}

          {!isLoading && !error && filteredList.length > 0 && (
            <>
              <div className={styles.list}>
                {filteredList.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSave={handleSaveToggle}
                    onApply={handleApply}
                    isSaving={savingIds.includes(job.id)}
                    isApplying={applyingIds.includes(job.id)}
                    isApplied={appliedIds.includes(job.id)}
                  />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <button
                  className={styles.secondaryBtn}
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}
                >
                  Sebelumnya
                </button>
                <span style={{ color: "#4d6473", fontWeight: 700 }}>
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  className={styles.secondaryBtn}
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{ opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}
                >
                  Berikutnya
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
