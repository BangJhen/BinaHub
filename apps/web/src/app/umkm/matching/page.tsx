"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type RiskLevel = "green" | "yellow" | "red";

type Candidate = {
  id: string;
  name: string;
  city: string | null;
  skills: string;
  experienceSummary: string | null;
  educationLevel: string | null;
  attendanceRate: number;
  checkinConsistency: number;
  productivityScore: number;
  latestCondition: RiskLevel;
};

type JobLite = {
  id: string;
  title: string;
  location: string | null;
  skills: string[];
  educationLevel: string | null;
  applicants: number;
  applicantIds: string[];
};

type ScoreBreakdown = {
  skillScore: number;
  locationScore: number;
  performanceScore: number;
  conditionScore: number;
  matchedSkills: string[];
  total: number;
};

function computeBreakdown(job: JobLite, candidate: Candidate): ScoreBreakdown {
  // Skill matching (35%)
  const candidateSkills = (candidate.skills || "")
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

  let matchedSkills: string[] = [];
  if (jobSkills.length > 0) {
    matchedSkills = jobSkills.filter((js) =>
      candidateSkills.some((cs) => cs.includes(js) || js.includes(cs))
    );
  }
  const skillScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 60;

  // Location matching (15%)
  const locationScore =
    job.location && candidate.city
      ? job.location.toLowerCase().includes(candidate.city.toLowerCase()) ||
        candidate.city.toLowerCase().includes(job.location.toLowerCase())
        ? 100
        : 40
      : 50;

  // Performance (35%) — rata-rata kehadiran, konsistensi, produktivitas
  const performanceScore = Math.round(
    candidate.attendanceRate * 0.4 +
      candidate.checkinConsistency * 0.3 +
      candidate.productivityScore * 0.3
  );

  // Condition score (15%)
  const conditionScore =
    candidate.latestCondition === "green" ? 95 :
    candidate.latestCondition === "yellow" ? 65 :
    35;

  const total = Math.round(
    skillScore * 0.35 +
      locationScore * 0.15 +
      performanceScore * 0.35 +
      conditionScore * 0.15
  );

  return { skillScore, locationScore, performanceScore, conditionScore, matchedSkills, total };
}

function badgeClassFor(score: number) {
  if (score >= 75) return "";
  if (score >= 55) return styles.scoreBadgeMid;
  return styles.scoreBadgeLow;
}

function barColorFor(score: number) {
  if (score >= 75) return styles.scoreBarFillGreen;
  if (score >= 50) return styles.scoreBarFillYellow;
  return styles.scoreBarFillRed;
}

function conditionLabel(c: RiskLevel) {
  if (c === "green") return "Stabil";
  if (c === "yellow") return "Perlu Atensi";
  return "Risiko Tinggi";
}

export default function UmkmMatchingPage() {
  const [jobs, setJobs] = useState<JobLite[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setError("");
      try {
        const res = await fetch("/api/umkm/matching", { cache: "no-store" });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Gagal memuat data matching");
        }
        const data = await res.json();
        if (!isMounted) return;
        setJobs(data.jobs || []);
        setCandidates(data.candidates || []);
        if ((data.jobs || []).length > 0) {
          setSelectedJobId(data.jobs[0].id);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Gagal memuat data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;

  const ranked = useMemo(() => {
    if (!selectedJob) return [];
    return candidates
      .filter((c) => selectedJob.applicantIds.includes(c.id))
      .map((c) => ({ candidate: c, breakdown: computeBreakdown(selectedJob, c) }))
      .sort((a, b) => b.breakdown.total - a.breakdown.total);
  }, [selectedJob, candidates]);

  const topMatch = ranked[0]?.breakdown.total || 0;
  const averageMatch = ranked.length > 0
    ? Math.round(ranked.reduce((sum, r) => sum + r.breakdown.total, 0) / ranked.length)
    : 0;

  return (
    <main className={styles.pageRoot}>
      <section className={styles.headerCard}>
        <div>
          <p className={styles.eyebrow}>Job Matching</p>
          <h1>Pencocokan Kandidat dengan Lowongan</h1>
          <p>
            Pilih lowongan aktif Anda dan lihat ranking kandidat paling cocok berdasarkan kecocokan skill,
            lokasi, performa kerja, dan kondisi terkini.
          </p>
        </div>
        <div className={styles.kpiRow}>
          <div className={styles.kpiPill}>
            <p>Lowongan Aktif</p>
            <strong>{jobs.length}</strong>
          </div>
          <div className={styles.kpiPill}>
            <p>Total Pelamar</p>
            <strong>{selectedJob ? ranked.length : 0}</strong>
          </div>
          <div className={styles.kpiPill}>
            <p>Rata-rata Match</p>
            <strong>{averageMatch}%</strong>
          </div>
        </div>
      </section>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            color: "#b91c1c",
            marginBottom: 16,
            fontSize: 13
          }}
        >
          <i className="ti ti-alert-circle" aria-hidden style={{ marginRight: 6 }} />
          {error}
        </div>
      )}

      <div className={styles.matchingGrid}>
        {/* JOB SELECTOR */}
        <aside className={styles.jobSelectorPanel}>
          <div className={styles.panelHeader}>
            <h2>Lowongan Aktif</h2>
            <p>{jobs.length} lowongan tersedia</p>
          </div>

          {isLoading ? (
            <div className={styles.emptyOption}>Memuat...</div>
          ) : jobs.length === 0 ? (
            <div className={styles.emptyOption}>
              Belum ada lowongan aktif.
              <a href="/umkm/lowongan/create">+ Buat Lowongan</a>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className={`${styles.jobOption} ${selectedJobId === job.id ? styles.jobOptionActive : ""}`}
                onClick={() => setSelectedJobId(job.id)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.jobOptionInfo}>
                  <h3>{job.title}</h3>
                  <p>
                    {job.location || "-"} • {job.skills.length} skill diminta
                  </p>
                </div>
                <span className={styles.jobOptionApplicants}>{job.applicants} pelamar</span>
              </div>
            ))
          )}
        </aside>

        {/* RESULTS */}
        <section className={styles.resultsPanel}>
          {!selectedJob ? (
            <div className={styles.emptyResults}>
              <h3>Pilih lowongan</h3>
              <p>Pilih salah satu lowongan untuk melihat ranking kandidat yang cocok.</p>
            </div>
          ) : (
            <>
              <div className={styles.resultsHeader}>
                <div className="titleRow" style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, color: "#0f6e99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Lowongan Dipilih
                    </p>
                    <h2 style={{ margin: "4px 0 0", fontSize: "1.2rem", color: "#0a2c4f", fontWeight: 700 }}>
                      {selectedJob.title}
                    </h2>
                  </div>
                  <span className={styles.scoreBadge}>{topMatch}% Top Match</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, color: "#4d6473", fontSize: 13 }}>
                  <span><i className="ti ti-map-pin" aria-hidden /> {selectedJob.location || "-"}</span>
                  <span><i className="ti ti-school" aria-hidden /> {selectedJob.educationLevel || "Tidak ditentukan"}</span>
                  <span><i className="ti ti-stack-2" aria-hidden /> {selectedJob.skills.join(", ") || "Tidak ada skill"}</span>
                </div>
              </div>

              <div className={styles.weightingBar}>
                <span><strong>Bobot Skoring:</strong></span>
                <span><i className="ti ti-stack-2" aria-hidden style={{ color: "#0f6e99" }} /> Skill 35%</span>
                <span><i className="ti ti-map-pin" aria-hidden style={{ color: "#0f6e99" }} /> Lokasi 15%</span>
                <span><i className="ti ti-chart-line" aria-hidden style={{ color: "#16a34a" }} /> Performa 35%</span>
                <span><i className="ti ti-mood-smile" aria-hidden style={{ color: "#f59e0b" }} /> Kondisi 15%</span>
              </div>

              <div className={styles.candidateList}>
                {ranked.length === 0 ? (
                  <div className={styles.emptyResults}>
                    <h3>Belum ada pelamar</h3>
                    <p>Pelamar yang melamar pada lowongan ini akan muncul di sini untuk dicocokkan (matching).</p>
                  </div>
                ) : (
                  ranked.map((entry, idx) => {
                    const { candidate, breakdown } = entry;
                    return (
                      <article key={candidate.id} className={styles.candidateRow}>
                        <div className={`${styles.candidateRank} ${idx < 3 ? styles.candidateRankTop : ""}`}>
                          {idx + 1}
                        </div>
                        <div className={styles.candidateBody}>
                          <div className={styles.candidateHeader}>
                            <div className={styles.candidateInfo}>
                              <h3 className={styles.candidateName}>{candidate.name}</h3>
                              <p className={styles.candidateMeta}>
                                <span><i className="ti ti-map-pin" aria-hidden /> {candidate.city || "-"}</span>
                                <span><i className="ti ti-school" aria-hidden /> {candidate.educationLevel || "-"}</span>
                                <span>
                                  <span className={`${styles.conditionDot} ${
                                    candidate.latestCondition === "green" ? styles.conditionGreen :
                                    candidate.latestCondition === "yellow" ? styles.conditionYellow :
                                    styles.conditionRed
                                  }`} />
                                  {conditionLabel(candidate.latestCondition)}
                                </span>
                              </p>
                            </div>
                            <span className={`${styles.scoreBadge} ${badgeClassFor(breakdown.total)}`}>
                              {breakdown.total}% Match
                            </span>
                          </div>

                          <div className={styles.scoreBreakdown}>
                            <div className={styles.scoreItem}>
                              <span className={styles.scoreItemLabel}>Skill</span>
                              <span className={styles.scoreItemValue}>{breakdown.skillScore}%</span>
                              <div className={styles.scoreBar}>
                                <div className={`${styles.scoreBarFill} ${barColorFor(breakdown.skillScore)}`} style={{ width: `${breakdown.skillScore}%` }} />
                              </div>
                            </div>
                            <div className={styles.scoreItem}>
                              <span className={styles.scoreItemLabel}>Lokasi</span>
                              <span className={styles.scoreItemValue}>{breakdown.locationScore}%</span>
                              <div className={styles.scoreBar}>
                                <div className={`${styles.scoreBarFill} ${barColorFor(breakdown.locationScore)}`} style={{ width: `${breakdown.locationScore}%` }} />
                              </div>
                            </div>
                            <div className={styles.scoreItem}>
                              <span className={styles.scoreItemLabel}>Performa</span>
                              <span className={styles.scoreItemValue}>{breakdown.performanceScore}%</span>
                              <div className={styles.scoreBar}>
                                <div className={`${styles.scoreBarFill} ${barColorFor(breakdown.performanceScore)}`} style={{ width: `${breakdown.performanceScore}%` }} />
                              </div>
                            </div>
                            <div className={styles.scoreItem}>
                              <span className={styles.scoreItemLabel}>Kondisi</span>
                              <span className={styles.scoreItemValue}>{breakdown.conditionScore}%</span>
                              <div className={styles.scoreBar}>
                                <div className={`${styles.scoreBarFill} ${barColorFor(breakdown.conditionScore)}`} style={{ width: `${breakdown.conditionScore}%` }} />
                              </div>
                            </div>
                          </div>

                          {candidate.skills && (
                            <div className={styles.candidateTags}>
                              {candidate.skills
                                .split(/[,;]+/)
                                .map((s) => s.trim())
                                .filter(Boolean)
                                .slice(0, 6)
                                .map((skill) => {
                                  const isMatched = breakdown.matchedSkills.some((ms) =>
                                    skill.toLowerCase().includes(ms) || ms.includes(skill.toLowerCase())
                                  );
                                  return (
                                    <span
                                      key={skill}
                                      className={`${styles.candidateTag} ${isMatched ? styles.candidateTagMatched : ""}`}
                                    >
                                      {isMatched && <i className="ti ti-check" aria-hidden style={{ marginRight: 4 }} />}
                                      {skill}
                                    </span>
                                  );
                                })}
                            </div>
                          )}

                          <div className={styles.candidateActions}>
                            <a
                              href={`/umkm/workers/${candidate.id}`}
                              className={styles.candidateActionBtn}
                            >
                              <i className="ti ti-user-circle" aria-hidden /> Lihat Profil
                            </a>
                            <button
                              type="button"
                              className={styles.candidateActionBtn}
                              onClick={() =>
                                alert(`Undangan ke ${candidate.name} akan tersedia di iterasi berikutnya.`)
                              }
                            >
                              <i className="ti ti-send" aria-hidden /> Kirim Undangan
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
