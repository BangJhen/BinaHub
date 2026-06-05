import { createClient } from "@/utils/supabase/server";

type RiskLevel = "green" | "yellow" | "red";
type PerfRange = "1w" | "1m" | "3m";
type WorkerChartRange = "1w" | "1m" | "6m" | "1y";

type DbUser = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "umkm" | "worker";
  created_at: string;
};

type WorkerProfileRow = {
  user_id: string;
  skills: string | null;
  experience_summary: string | null;
};

type UmkmProfileRow = {
  user_id: string;
  business_name: string;
  business_sector: string | null;
  city: string | null;
};

type PlacementRow = {
  id: string;
  umkm_id: string;
  worker_id: string;
  job_id: string;
  start_date: string;
  status: string;
};

type JobRow = {
  id: string;
  title: string;
};

type CheckinRow = {
  id: string;
  worker_id: string;
  content: string;
  sentiment_score: number | null;
  ai_score: number | null;
  ai_label: string | null;
  trend_direction: string | null;
  submitted_at: string;
};

type RiskRow = {
  id: string;
  worker_id: string;
  checkin_id: string | null;
  risk_level: RiskLevel;
  trigger_reason: string | null;
  recommendation: string | null;
  assessed_at: string;
};

type AlertRow = {
  id: string;
  umkm_id: string;
  worker_id: string;
  title: string;
  message: string;
  created_at: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function riskFromSentiment(score: number | null | undefined): RiskLevel {
  if (score == null) return "yellow";
  if (score <= -0.2) return "red";
  if (score >= 0.25) return "green";
  return "yellow";
}

function riskToScore(risk: RiskLevel) {
  if (risk === "green") return 92;
  if (risk === "yellow") return 76;
  return 58;
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

async function getAuthAndDbUser() {
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let dbUser: DbUser | null = null;

  if (authUser?.email) {
    const { data } = await supabase
      .from("users")
      .select("id, email, full_name, role, created_at")
      .eq("email", authUser.email)
      .maybeSingle();

    dbUser = (data as DbUser | null) ?? null;
  }

  return { supabase, authUser, dbUser };
}

async function getAdminBaseDataset() {
  const { supabase } = await getAuthAndDbUser();

  const [{ data: umkmProfiles }, { data: placements }, { data: alerts }, { data: jobs }] = await Promise.all([
    supabase.from("umkm_profiles").select("user_id, business_name, business_sector, city"),
    supabase.from("placements").select("id, umkm_id, worker_id, job_id, start_date, status").eq("status", "active"),
    supabase.from("alerts").select("id, umkm_id, worker_id, title, message, created_at").order("created_at", { ascending: false }),
    supabase.from("jobs").select("id, title"),
  ]);

  const umkmProfileRows = (umkmProfiles ?? []) as UmkmProfileRow[];
  const placementRows = (placements ?? []) as PlacementRow[];
  const alertRows = (alerts ?? []) as AlertRow[];
  const jobRows = (jobs ?? []) as JobRow[];

  const umkmIds = uniq(umkmProfileRows.map((u) => u.user_id));
  const workerIds = uniq(placementRows.map((p) => p.worker_id));
  const allUserIds = uniq([...umkmIds, ...workerIds]);

  const [{ data: users }, { data: workerProfiles }, { data: checkins }, { data: risks }] = await Promise.all([
    allUserIds.length
      ? supabase.from("users").select("id, email, full_name, role, created_at").in("id", allUserIds)
      : Promise.resolve({ data: [] as DbUser[] }),
    workerIds.length
      ? supabase.from("worker_profiles").select("user_id, skills, experience_summary").in("user_id", workerIds)
      : Promise.resolve({ data: [] as WorkerProfileRow[] }),
    workerIds.length
      ? supabase.from("checkins").select("id, worker_id, content, sentiment_score, ai_score, ai_label, trend_direction, submitted_at").in("worker_id", workerIds).order("submitted_at", { ascending: false })
      : Promise.resolve({ data: [] as CheckinRow[] }),
    workerIds.length
      ? supabase
          .from("risk_assessments")
          .select("id, worker_id, checkin_id, risk_level, trigger_reason, recommendation, assessed_at")
          .in("worker_id", workerIds)
          .order("assessed_at", { ascending: false })
      : Promise.resolve({ data: [] as RiskRow[] }),
  ]);

  const userRows = (users ?? []) as DbUser[];
  const workerProfileRows = (workerProfiles ?? []) as WorkerProfileRow[];
  const checkinRows = (checkins ?? []) as CheckinRow[];
  const riskRows = (risks ?? []) as RiskRow[];

  const userById = new Map(userRows.map((u) => [u.id, u]));
  const jobById = new Map(jobRows.map((j) => [j.id, j]));
  const workerProfileById = new Map(workerProfileRows.map((w) => [w.user_id, w]));

  const checkinsByWorker = new Map<string, CheckinRow[]>();
  for (const item of checkinRows) {
    if (!checkinsByWorker.has(item.worker_id)) checkinsByWorker.set(item.worker_id, []);
    checkinsByWorker.get(item.worker_id)?.push(item);
  }

  const risksByWorker = new Map<string, RiskRow[]>();
  for (const item of riskRows) {
    if (!risksByWorker.has(item.worker_id)) risksByWorker.set(item.worker_id, []);
    risksByWorker.get(item.worker_id)?.push(item);
  }

  const placementByWorker = new Map<string, PlacementRow>();
  for (const p of placementRows) {
    if (!placementByWorker.has(p.worker_id)) placementByWorker.set(p.worker_id, p);
  }

  const umkmData = umkmProfileRows.map((profile) => {
    const umkmUser = userById.get(profile.user_id);
    const umkmPlacements = placementRows.filter((p) => p.umkm_id === profile.user_id);

    const workers = umkmPlacements.map((placement) => {
      const worker = userById.get(placement.worker_id);
      const workerCheckins = checkinsByWorker.get(placement.worker_id) ?? [];
      const workerRisks = risksByWorker.get(placement.worker_id) ?? [];
      const latestCheckin = workerCheckins[0];
      const latestRisk = workerRisks[0];
      const recent30 = workerCheckins.filter(
        (c) => new Date(c.submitted_at).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000
      );

      const attendanceRate = clamp(Math.round((recent30.length / 30) * 100), 0, 100);
      const sentimentAvg =
        workerCheckins.length > 0
          ? workerCheckins.reduce((acc, item) => acc + (item.sentiment_score ?? 0), 0) / workerCheckins.length
          : 0;

      const aiLabelMap: Record<string, RiskLevel> = { Hijau: "green", Kuning: "yellow", Merah: "red" };
      const latestCondition: RiskLevel = latestRisk?.risk_level ?? (latestCheckin?.ai_label ? aiLabelMap[latestCheckin.ai_label] : riskFromSentiment(latestCheckin?.sentiment_score)) ?? "green";
      const workerProfile = workerProfileById.get(placement.worker_id);

      return {
        id: placement.worker_id,
        name: worker?.full_name ?? "Pekerja",
        role: jobById.get(placement.job_id)?.title ?? "Pekerja",
        startDate: formatDate(placement.start_date),
        attendanceRate,
        productivityScore: clamp(Math.round((sentimentAvg + 1) * 50), 40, 100),
        checkinConsistency: attendanceRate,
        hasCheckedInToday:
          latestCheckin != null &&
          new Date(latestCheckin.submitted_at).toDateString() === new Date().toDateString(),
        latestCheckin: latestCheckin ? formatDateTime(latestCheckin.submitted_at) : "Belum ada check-in",
        latestCondition,
        mentorNote:
          latestRisk?.trigger_reason ??
          workerProfile?.experience_summary ??
          "Monitoring rutin untuk memastikan stabilitas kerja.",
      };
    });

    const workerById = new Map(workers.map((w) => [w.id, w]));

    const issues = alertRows
      .filter((a) => a.umkm_id === profile.user_id)
      .map((a) => {
        const workerRisk = risksByWorker.get(a.worker_id)?.[0]?.risk_level ?? "yellow";
        const workerName = workerById.get(a.worker_id)?.name ?? "Pekerja";

        return {
          id: a.id,
          workerId: a.worker_id,
          workerName,
          level: workerRisk,
          message: a.message,
          createdAt: formatDateTime(a.created_at),
          createdAtIso: a.created_at,
        };
      });

    return {
      id: profile.user_id,
      name: profile.business_name,
      category: profile.business_sector ?? "UMKM",
      location: profile.city ?? "-",
      owner: umkmUser?.full_name ?? "Pemilik UMKM",
      lastUpdate: issues[0]?.createdAt ?? "Belum ada update",
      notes:
        issues.length > 0
          ? `${issues.length} isu terbuka perlu tindak lanjut.`
          : "Monitoring stabil, lanjutkan pendampingan berkala.",
      workers,
      issues,
      userId: profile.user_id,
    };
  });

  return { umkmData, checkinRows, riskRows, alertRows, dbUsers: userRows, placements: placementRows };
}

function getRiskFromCheckin(checkin?: CheckinRow, risk?: RiskRow): RiskLevel {
  if (risk) return risk.risk_level;
  if (!checkin) return "green";
  if (checkin.ai_label === "Merah") return "red";
  if (checkin.ai_label === "Kuning") return "yellow";
  if (checkin.ai_label === "Hijau") return "green";
  return riskFromSentiment(checkin.sentiment_score) ?? "green";
}

function makeDailyTrend(
  workerId: string,
  days: number,
  risksByWorker: Map<string, RiskRow[]>
): { day: string; green: number; yellow: number; red: number }[] {
  const workerRisks = risksByWorker.get(workerId) ?? [];

  return Array.from({ length: days }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - idx));
    const yyyyMmDd = date.toISOString().slice(0, 10);

    const dayRisk = workerRisks.find((r) => r.assessed_at.slice(0, 10) === yyyyMmDd)?.risk_level ?? "green";
    return {
      day: date.toLocaleDateString("id-ID", { weekday: "short" }),
      green: dayRisk === "green" ? 1 : 0,
      yellow: dayRisk === "yellow" ? 1 : 0,
      red: dayRisk === "red" ? 1 : 0,
    };
  });
}

function makeBucketTrend(
  workerId: string,
  bucketLabels: string[],
  getBucketIndex: (date: Date) => number | null,
  risksByWorker: Map<string, RiskRow[]>
): { day: string; green: number; yellow: number; red: number }[] {
  const rows = risksByWorker.get(workerId) ?? [];
  const bucket = bucketLabels.map((label) => ({ day: label, green: 0, yellow: 0, red: 0 }));

  for (const item of rows) {
    const index = getBucketIndex(new Date(item.assessed_at));
    if (index == null || index < 0 || index >= bucket.length) continue;
    bucket[index][item.risk_level] += 1;
  }

  return bucket.map((row) => {
    const total = row.green + row.yellow + row.red;
    if (total > 0) return row;
    return { ...row, green: 1 };
  });
}

export async function getAdminDashboardData() {
  const { umkmData } = await getAdminBaseDataset();
  return { adminUmkmData: umkmData };
}

export async function getUmkmDashboardData() {
  const { supabase, authUser, dbUser } = await getAuthAndDbUser();
  const { umkmData, riskRows, checkinRows, alertRows } = await getAdminBaseDataset();

  const selectedUmkm =
    umkmData.find((u) => u.userId === dbUser?.id) ??
    umkmData.find((u) => u.owner.toLowerCase().includes((authUser?.user_metadata?.name ?? "").toLowerCase())) ??
    umkmData[0];

  if (!selectedUmkm) {
    return {
      kpiByRange: { "7d": { activeWorkers: 0, avgCheckinRate: 0, needAttention: 0, mentoringSessions: 0 }, "30d": { activeWorkers: 0, avgCheckinRate: 0, needAttention: 0, mentoringSessions: 0 } },
      workers: [],
      alerts: [],
      workerConditionTrendByRange: {},
      activities: [],
    };
  }

  const workers = selectedUmkm.workers;
  const workerIds = workers.map((w) => w.id);

  const risksByWorker = new Map<string, RiskRow[]>();
  for (const item of riskRows.filter((r) => workerIds.includes(r.worker_id))) {
    if (!risksByWorker.has(item.worker_id)) risksByWorker.set(item.worker_id, []);
    risksByWorker.get(item.worker_id)?.push(item);
  }

  const alerts = selectedUmkm.issues.map((item) => ({
    id: item.id,
    workerId: item.workerId,
    workerName: item.workerName,
    role: workers.find((w) => w.id === item.workerId)?.role ?? "Pekerja",
    level: item.level,
    message: item.message,
    createdAt: item.createdAt,
  }));

  function countRange(days: number) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const checkinsInRange = checkinRows.filter(
      (c) => workerIds.includes(c.worker_id) && new Date(c.submitted_at).getTime() >= cutoff
    );
    const alertsInRange = alertRows.filter(
      (a) => a.umkm_id === selectedUmkm.userId && new Date(a.created_at).getTime() >= cutoff
    );

    const avgCheckinRate = workers.length
      ? clamp(Math.round((checkinsInRange.length / (workers.length * days)) * 100), 0, 100)
      : 0;

    return {
      activeWorkers: workers.length,
      avgCheckinRate,
      needAttention: workers.filter((w) => w.latestCondition !== "green").length,
      mentoringSessions: alertsInRange.length,
    };
  }

  const kpiByRange = {
    "7d": countRange(7),
    "30d": countRange(30),
  };

  const now = new Date();
  const monthLabels6 = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleDateString("id-ID", { month: "short" });
  });

  const monthLabels12 = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return d.toLocaleDateString("id-ID", { month: "short" });
  });

  const workerConditionTrendByRange: Record<
    string,
    Record<WorkerChartRange, { day: string; green: number; yellow: number; red: number }[]>
  > = {};

  for (const worker of workers) {
    workerConditionTrendByRange[worker.id] = {
      "1w": makeDailyTrend(worker.id, 7, risksByWorker),
      "1m": makeBucketTrend(
        worker.id,
        ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
        (date) => {
          const diffDay = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDay < 0 || diffDay >= 28) return null;
          return 3 - Math.floor(diffDay / 7);
        },
        risksByWorker
      ),
      "6m": makeBucketTrend(
        worker.id,
        monthLabels6,
        (date) => {
          const diffMonth = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
          if (diffMonth < 0 || diffMonth >= 6) return null;
          return 5 - diffMonth;
        },
        risksByWorker
      ),
      "1y": makeBucketTrend(
        worker.id,
        monthLabels12,
        (date) => {
          const diffMonth = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
          if (diffMonth < 0 || diffMonth >= 12) return null;
          return 11 - diffMonth;
        },
        risksByWorker
      ),
    };
  }

  const activities = [
    ...alerts.slice(0, 3).map((a) => `${a.workerName}: ${a.message}`),
    ...workers.slice(0, 2).map((w) => `${w.name} check-in terakhir ${w.latestCheckin}`),
  ].slice(0, 5);

  const deterioratingWorkers = workers.filter(w => {
    const workerCheckins = checkinRows.filter(c => c.worker_id === w.id && new Date(c.submitted_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000);
    const latest = workerCheckins[0];
    return latest && (latest.trend_direction === "deteriorating" || latest.ai_label === "Merah" || latest.ai_label === "Kuning");
  });

  const aiInsights = deterioratingWorkers.map(w => ({
    workerId: w.id,
    workerName: w.name,
    reason: "menunjukkan tren penurunan kondisi emosional (risiko kuning/merah) dalam 7 hari terakhir."
  }));

  const checkinNotes = checkinRows
    .filter((c) => workerIds.includes(c.worker_id))
    .slice(0, 80)
    .map((c) => {
      const relatedRisk = risksByWorker.get(c.worker_id)?.find((r) => r.checkin_id === c.id);
      const sentiment = c.sentiment_score ?? 0;
      const mood = sentiment >= 0.25 ? "Stabil" : sentiment <= -0.2 ? "Butuh Pendampingan" : "Waspada";
      return {
        id: c.id,
        workerId: c.worker_id,
        summary: c.content,
        mood,
        submittedAt: formatDateTime(c.submitted_at),
        level: relatedRisk?.risk_level ?? riskFromSentiment(c.sentiment_score),
      };
    });

  return {
    kpiByRange,
    workers,
    alerts,
    checkinNotes,
    workerConditionTrendByRange,
    activities,
    aiInsights,
  };
}

export async function getWorkerDashboardData() {
  const { supabase, dbUser } = await getAuthAndDbUser();

  let workerUser = dbUser?.role === "worker" ? dbUser : null;

  if (!workerUser) {
    const { data } = await supabase
      .from("users")
      .select("id, email, full_name, role, created_at")
      .eq("role", "worker")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    workerUser = (data as DbUser | null) ?? null;
  }

  if (!workerUser) {
    return {
      workerProfile: {
        name: "-",
        position: "-",
        umkm: "-",
        joinDate: "-",
        streakDays: 0,
        attendanceRate: 0,
        performanceScore: 0,
        avgRating: 0,
        checkinThisMonth: 0,
        checkinTarget: 22,
      },
      dailyCheckins: [],
      monthlyDays: [],
      weeklyPerformanceByRange: { "1w": [], "1m": [], "3m": [] },
      umkmReviews: [],
      performanceRecommendations: [],
    };
  }

  const [{ data: workerProfileRow }, { data: placementRows }] = await Promise.all([
    supabase.from("worker_profiles").select("user_id, skills, experience_summary").eq("user_id", workerUser.id).maybeSingle(),
    supabase.from("placements").select("id, umkm_id, worker_id, job_id, start_date, status").eq("worker_id", workerUser.id).eq("status", "active"),
  ]);

  const activePlacement = ((placementRows ?? []) as PlacementRow[])[0] ?? null;

  // Worker belum punya pekerjaan aktif — return empty state
  if (!activePlacement) {
    return {
      isEmpty: true,
      workerProfile: {
        name: workerUser.full_name,
        position: "-",
        umkm: "-",
        joinDate: formatDate(workerUser.created_at),
        streakDays: 0,
        attendanceRate: 0,
        performanceScore: 0,
        avgRating: 0,
        checkinThisMonth: 0,
        checkinTarget: 22,
      },
      dailyCheckins: [],
      monthlyDays: [],
      weeklyPerformanceByRange: { "1w": [], "1m": [], "3m": [] },
      umkmReviews: [],
      performanceRecommendations: [],
    };
  }

  const [umkmProfileRes, jobRes, checkinsRes, risksRes, alertsRes] = await Promise.all([
    activePlacement
      ? supabase.from("umkm_profiles").select("business_name").eq("user_id", activePlacement.umkm_id).maybeSingle()
      : Promise.resolve({ data: null }),
    activePlacement
      ? supabase.from("jobs").select("title").eq("id", activePlacement.job_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("checkins")
      .select("id, worker_id, content, sentiment_score, ai_score, ai_label, trend_direction, submitted_at")
      .eq("worker_id", workerUser.id)
      .order("submitted_at", { ascending: false })
      .limit(120),
    supabase
      .from("risk_assessments")
      .select("id, worker_id, checkin_id, risk_level, trigger_reason, recommendation, assessed_at")
      .eq("worker_id", workerUser.id)
      .order("assessed_at", { ascending: false })
      .limit(120),
    supabase
      .from("alerts")
      .select("id, title, message, created_at, umkm_id")
      .eq("worker_id", workerUser.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const checkins = (checkinsRes.data ?? []) as CheckinRow[];
  if (checkinsRes.error) {
    console.error("Checkins Fetch Error:", checkinsRes.error);
  }
  const risks = (risksRes.data ?? []) as RiskRow[];
  const alerts = (alertsRes.data ?? []) as Array<{ id: string; title: string; message: string; created_at: string; umkm_id: string }>;

  const riskByCheckinId = new Map<string, RiskRow>();
  for (const risk of risks) {
    if (risk.checkin_id && !riskByCheckinId.has(risk.checkin_id)) {
      riskByCheckinId.set(risk.checkin_id, risk);
    }
  }

  const checkinByDate = new Map<string, CheckinRow>();
  for (const row of checkins) {
    const key = row.submitted_at.slice(0, 10);
    if (!checkinByDate.has(key)) checkinByDate.set(key, row);
  }

  const today = new Date();
  const dailyCheckins = Array.from({ length: 45 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const checkin = checkinByDate.get(date);

    if (!checkin) {
      return {
        date,
        dayLabel: formatDayLabel(date),
        condition: "missed",
        mood: "-",
        note: "Tidak melakukan check-in.",
        time: "-",
      };
    }

    const risk = riskByCheckinId.get(checkin.id);
    const condition = risk?.risk_level ?? riskFromSentiment(checkin.sentiment_score);
    const sentiment = checkin.sentiment_score ?? 0;
    const mood = sentiment >= 0.25 ? "Semangat" : sentiment <= -0.2 ? "Lelah" : "Biasa";

    return {
      date,
      dayLabel: formatDayLabel(date),
      condition,
      mood,
      note: checkin.content,
      time: new Date(checkin.submitted_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dailyByDay = new Map<number, "green" | "yellow" | "red" | "missed">();
  for (const entry of dailyCheckins) {
    const d = new Date(entry.date + "T00:00:00");
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) continue;
    const day = d.getDate();
    if (!dailyByDay.has(day)) {
      dailyByDay.set(day, entry.condition as "green" | "yellow" | "red" | "missed");
    }
  }

  const monthlyDays = Array.from({ length: daysInMonth }).map((_, idx) => {
    const day = idx + 1;
    const isFuture = day > now.getDate();
    if (isFuture) return { date: day, condition: "none" as const };
    return { date: day, condition: (dailyByDay.get(day) ?? "missed") as "green" | "yellow" | "red" | "missed" | "none" };
  });

  function computeScore(entry: (typeof dailyCheckins)[number]) {
    if (entry.condition === "missed") return 45;
    const base = riskToScore(entry.condition as RiskLevel);
    return base;
  }

  const oneWeek = dailyCheckins.slice(0, 7).reverse();
  const weekly1w = oneWeek.map((entry) => ({
    week: new Date(entry.date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short" }),
    score: computeScore(entry),
    checkinsCompleted: entry.condition === "missed" ? 0 : 1,
    checkinsTotal: 1,
  }));

  const last28 = dailyCheckins.slice(0, 28);
  const weekly1m = [0, 1, 2, 3].map((idx) => {
    const chunk = last28.slice(idx * 7, idx * 7 + 7);
    const completed = chunk.filter((c) => c.condition !== "missed").length;
    const avgScore = chunk.length
      ? Math.round(chunk.reduce((acc, c) => acc + computeScore(c), 0) / chunk.length)
      : 0;

    return {
      week: `Minggu ${4 - idx}`,
      score: avgScore,
      checkinsCompleted: completed,
      checkinsTotal: 7,
    };
  }).reverse();

  const monthBuckets = Array.from({ length: 3 }).map((_, idx) => {
    const d = new Date(currentYear, currentMonth - idx, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("id-ID", { month: "short" }),
    };
  }).reverse();

  const monthlyMap = new Map<string, { scores: number[]; completed: number; total: number }>();
  for (const bucket of monthBuckets) {
    monthlyMap.set(bucket.key, { scores: [], completed: 0, total: 0 });
  }

  for (const entry of dailyCheckins.slice(0, 90)) {
    const key = entry.date.slice(0, 7);
    if (!monthlyMap.has(key)) continue;
    const item = monthlyMap.get(key)!;
    item.scores.push(computeScore(entry));
    item.total += 1;
    if (entry.condition !== "missed") item.completed += 1;
  }

  const weekly3m = monthBuckets.map((bucket) => {
    const stats = monthlyMap.get(bucket.key)!;
    const score = stats.scores.length
      ? Math.round(stats.scores.reduce((acc, val) => acc + val, 0) / stats.scores.length)
      : 0;

    return {
      week: bucket.label,
      score,
      checkinsCompleted: stats.completed,
      checkinsTotal: stats.total || 30,
    };
  });

  const umkmName = (umkmProfileRes.data as { business_name?: string } | null)?.business_name ?? "UMKM";

  const umkmReviews = alerts.slice(0, 3).map((alert, idx) => {
    const level = risks[idx]?.risk_level ?? "yellow";
    const rating = level === "green" ? 5 : level === "yellow" ? 4 : 3;
    return {
      id: alert.id,
      umkmName,
      position: (jobRes.data as { title?: string } | null)?.title ?? "Pekerja",
      date: formatDate(alert.created_at),
      rating,
      comment: alert.message,
      aspects: [
        { label: "Kehadiran", score: clamp(weekly1m.at(-1)?.score ?? 70, 50, 100) },
        { label: "Etos Kerja", score: clamp((weekly3m.at(-1)?.score ?? 70) + 2, 50, 100) },
        { label: "Kerjasama", score: clamp((weekly3m.at(-1)?.score ?? 70) + 4, 50, 100) },
        { label: "Adaptasi", score: clamp((weekly1m.at(-1)?.score ?? 70) - 1, 50, 100) },
      ],
    };
  });

  const performanceRecommendations = uniq(
    risks
      .map((r) => r.recommendation)
      .filter((r): r is string => Boolean(r && r.trim()))
  )
    .slice(0, 4)
    .map((text, idx) => ({
      icon: ["🔥", "🎯", "💬", "📈"][idx] ?? "✅",
      title: `Prioritas ${idx + 1}`,
      desc: text,
    }));

  if (performanceRecommendations.length === 0) {
    performanceRecommendations.push({
      icon: "✅",
      title: "Pertahankan Konsistensi",
      desc: "Lanjutkan check-in harian dan komunikasikan kendala lebih awal agar performa tetap stabil.",
    });
  }

  const checkinThisMonth = monthlyDays.filter((d) => d.condition !== "none" && d.condition !== "missed").length;
  const attendanceRate = clamp(Math.round((dailyCheckins.slice(0, 30).filter((d) => d.condition !== "missed").length / 30) * 100), 0, 100);

  let streakDays = 0;
  for (const entry of dailyCheckins) {
    if (entry.condition === "missed") break;
    streakDays += 1;
  }

  const avgRating = umkmReviews.length
    ? Number((umkmReviews.reduce((acc, item) => acc + item.rating, 0) / umkmReviews.length).toFixed(1))
    : 0;

  const workerProfile = {
    name: workerUser.full_name,
    position: (jobRes.data as { title?: string } | null)?.title ?? "Pekerja",
    umkm: umkmName,
    joinDate: formatDate(activePlacement?.start_date ?? workerUser.created_at),
    streakDays,
    attendanceRate,
    performanceScore: weekly1m.length ? Math.round(weekly1m.reduce((acc, val) => acc + val.score, 0) / weekly1m.length) : 0,
    avgRating,
    checkinThisMonth,
    checkinTarget: 22,
  };

  return {
    workerProfile,
    dailyCheckins,
    monthlyDays,
    weeklyPerformanceByRange: {
      "1w": weekly1w,
      "1m": weekly1m,
      "3m": weekly3m,
    } as Record<PerfRange, Array<{ week: string; score: number; checkinsCompleted: number; checkinsTotal: number }>>,
    umkmReviews,
    performanceRecommendations,
  };
}
