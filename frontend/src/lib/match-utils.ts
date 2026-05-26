/**
 * Job-worker matching algorithm.
 * Weights: skills 40% | location 25% | education 20% | experience 15%
 */

export type WorkerProfileForMatch = {
  skills: string[] | string | null;
  education_level: string | null;
  city: string | null;
  province: string | null;
  experience_summary: string | null;
};

export type JobForMatch = {
  skills: string[] | null;
  education_level_required: string | null;
  location: string | null;
  experience_required: string | null;
};

export type MatchLabel = "Sangat Cocok" | "Cocok" | "Cukup Cocok" | null;

// Education hierarchy — higher index = higher level
const EDUCATION_RANK: Record<string, number> = {
  "tidak tamat sd": 0,
  "sd/sederajat": 1,
  "smp/sederajat": 2,
  "sma/smk/sederajat": 3,
  "d1/d2/d3": 4,
  "s1/sarjana": 5,
  "s2/magister": 6,
};

function parseSkills(raw: string[] | string | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s) => s.toLowerCase().trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  } catch {}
  return raw.split(",").map((s) => s.toLowerCase().trim()).filter(Boolean);
}

function scoreSkills(workerSkills: string[], jobSkills: string[] | null): number {
  if (!jobSkills || jobSkills.length === 0) return 1; // no requirement → full score
  if (workerSkills.length === 0) return 0;
  const jobLower = jobSkills.map((s) => s.toLowerCase().trim());
  const matched = workerSkills.filter((ws) =>
    jobLower.some((js) => js.includes(ws) || ws.includes(js))
  ).length;
  return Math.min(matched / jobLower.length, 1);
}

function scoreEducation(workerEdu: string | null, jobEdu: string | null): number {
  if (!jobEdu) return 1;
  if (!workerEdu) return 0;
  const wRank = EDUCATION_RANK[workerEdu.toLowerCase()] ?? -1;
  const jRank = EDUCATION_RANK[jobEdu.toLowerCase()] ?? -1;
  if (jRank === -1) return 0.5; // unknown requirement
  if (wRank === -1) return 0;
  if (wRank >= jRank) return 1;
  if (wRank === jRank - 1) return 0.5; // one level below
  return 0;
}

function scoreLocation(city: string | null, province: string | null, jobLocation: string | null): number {
  if (!jobLocation) return 1;
  if (!city && !province) return 0;
  const loc = jobLocation.toLowerCase();
  if (city && loc.includes(city.toLowerCase())) return 1;
  if (province && loc.includes(province.toLowerCase())) return 0.7;
  return 0;
}

function scoreExperience(summary: string | null, jobExp: string | null): number {
  if (!jobExp) return 1;
  const exp = jobExp.toLowerCase();
  // Job accepts fresh graduates
  if (exp.includes("fresh") || exp.includes("0 tahun") || exp.includes("tidak diperlukan")) return 1;
  if (!summary || summary.trim().length < 20) return 0.2;
  if (summary.trim().length >= 80) return 0.9;
  return 0.6;
}

export function computeMatchScore(worker: WorkerProfileForMatch, job: JobForMatch): number {
  const workerSkills = parseSkills(worker.skills);
  const skill = scoreSkills(workerSkills, job.skills);
  const loc = scoreLocation(worker.city, worker.province, job.location);
  const edu = scoreEducation(worker.education_level, job.education_level_required);
  const exp = scoreExperience(worker.experience_summary, job.experience_required);
  const total = skill * 0.4 + loc * 0.25 + edu * 0.2 + exp * 0.15;
  return Math.round(total * 100);
}

export function getMatchLabel(score: number): MatchLabel {
  if (score >= 75) return "Sangat Cocok";
  if (score >= 55) return "Cocok";
  if (score >= 35) return "Cukup Cocok";
  return null;
}

export function getMatchColors(label: MatchLabel): { bg: string; color: string; border: string } {
  switch (label) {
    case "Sangat Cocok": return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
    case "Cocok":        return { bg: "#eaf3fb", color: "#0f6e99", border: "#bfdbfe" };
    case "Cukup Cocok":  return { bg: "#fef3c7", color: "#d97706", border: "#fde68a" };
    default:             return { bg: "#f1f5f9", color: "#64748b", border: "#e2e8f0" };
  }
}
