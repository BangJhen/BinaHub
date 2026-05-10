export type RiskLevel = "green" | "yellow" | "red";
export type TimeRange = "7d" | "30d";
export type WorkerChartRange = "1w" | "1m" | "6m" | "1y";

export type KpiSnapshot = {
  activeWorkers: number;
  avgCheckinRate: number;
  needAttention: number;
  mentoringSessions: number;
};

export type WorkerProfile = {
  id: string;
  name: string;
  role: string;
  startDate: string;
  attendanceRate: number;
  productivityScore: number;
  checkinConsistency: number;
  latestCheckin: string;
  hasCheckedInToday: boolean;
  latestCondition: RiskLevel;
  mentorNote: string;
};

export type RiskAlert = {
  id: string;
  workerId: string;
  workerName: string;
  role: string;
  level: RiskLevel;
  message: string;
  createdAt: string;
};

export type WorkerConditionPoint = {
  day: string;
  green: number;
  yellow: number;
  red: number;
};

export type CheckinNote = {
  id: string;
  workerId: string;
  summary: string;
  mood: "Stabil" | "Waspada" | "Butuh Pendampingan";
  submittedAt: string;
};

export const kpiByRange: Record<TimeRange, KpiSnapshot> = {
  "7d": {
    activeWorkers: 8,
    avgCheckinRate: 91,
    needAttention: 2,
    mentoringSessions: 6
  },
  "30d": {
    activeWorkers: 8,
    avgCheckinRate: 88,
    needAttention: 3,
    mentoringSessions: 21
  }
};

export const workers: WorkerProfile[] = [
  {
    id: "W-01",
    name: "Rizky Pratama",
    role: "Staff Operasional",
    startDate: "12 Jan 2026",
    attendanceRate: 96,
    productivityScore: 84,
    checkinConsistency: 92,
    latestCheckin: "Hari ini, 07:18",
    hasCheckedInToday: true,
    latestCondition: "yellow",
    mentorNote: "Perlu sesi refleksi ringan terkait tekanan target akhir pekan."
  },
  {
    id: "W-02",
    name: "Siti Rahma",
    role: "Kasir",
    startDate: "04 Feb 2026",
    attendanceRate: 98,
    productivityScore: 89,
    checkinConsistency: 95,
    latestCheckin: "Hari ini, 07:02",
    hasCheckedInToday: true,
    latestCondition: "green",
    mentorNote: "Stabil dan konsisten, cocok menjadi peer support internal."
  },
  {
    id: "W-03",
    name: "Andri Saputra",
    role: "Kurir",
    startDate: "22 Des 2025",
    attendanceRate: 87,
    productivityScore: 75,
    checkinConsistency: 81,
    latestCheckin: "Kemarin, 20:44",
    hasCheckedInToday: false,
    latestCondition: "red",
    mentorNote: "Butuh pendampingan intensif terkait disiplin check-in dan stres kerja."
  },
  {
    id: "W-04",
    name: "Dimas Arya",
    role: "Admin Gudang",
    startDate: "30 Jan 2026",
    attendanceRate: 92,
    productivityScore: 82,
    checkinConsistency: 88,
    latestCheckin: "Hari ini, 06:58",
    hasCheckedInToday: true,
    latestCondition: "yellow",
    mentorNote: "Perlu monitoring komunikasi saat beban kerja tinggi."
  }
];

export const alerts: RiskAlert[] = [
  {
    id: "A-7841",
    workerId: "W-01",
    workerName: "Rizky Pratama",
    role: "Staff Operasional",
    level: "yellow",
    message: "Check-in menunjukkan kecemasan ringan selama 2 hari berturut-turut.",
    createdAt: "14 menit lalu"
  },
  {
    id: "A-7840",
    workerId: "W-03",
    workerName: "Andri Saputra",
    role: "Kurir",
    level: "red",
    message: "Tidak melakukan check-in 2 hari dan performa menurun di shift terakhir.",
    createdAt: "35 menit lalu"
  },
  {
    id: "A-7839",
    workerId: "W-02",
    workerName: "Siti Rahma",
    role: "Kasir",
    level: "green",
    message: "Kondisi stabil, rekomendasi monitoring rutin mingguan.",
    createdAt: "1 jam lalu"
  },
  {
    id: "A-7838",
    workerId: "W-04",
    workerName: "Dimas Arya",
    role: "Admin Gudang",
    level: "yellow",
    message: "Nada komunikasi check-in menandakan tekanan kerja meningkat.",
    createdAt: "2 jam lalu"
  }
];

export const checkinNotes: CheckinNote[] = [
  {
    id: "C-901",
    workerId: "W-01",
    summary: "Merasa sedikit tertekan oleh target, tapi masih terkendali.",
    mood: "Waspada",
    submittedAt: "Hari ini, 07:18"
  },
  {
    id: "C-902",
    workerId: "W-01",
    summary: "Butuh arahan prioritas kerja saat jam ramai.",
    mood: "Waspada",
    submittedAt: "Kemarin, 07:10"
  },
  {
    id: "C-903",
    workerId: "W-02",
    summary: "Kondisi fokus dan siap bantu onboarding kasir baru.",
    mood: "Stabil",
    submittedAt: "Hari ini, 07:02"
  },
  {
    id: "C-904",
    workerId: "W-03",
    summary: "Kelelahan akibat rute panjang, perlu dukungan jadwal.",
    mood: "Butuh Pendampingan",
    submittedAt: "Kemarin, 20:44"
  },
  {
    id: "C-905",
    workerId: "W-04",
    summary: "Beban input stok meningkat, meminta prioritas tugas.",
    mood: "Waspada",
    submittedAt: "Hari ini, 06:58"
  }
];

export const activities = [
  "Mentoring 1-on-1 untuk Andri dijadwalkan pukul 16:00.",
  "Rizky menyelesaikan check-in dengan catatan stres ringan.",
  "Siti diberi apresiasi karena konsistensi check-in 14 hari.",
  "Dimas meminta penyesuaian beban kerja shift sore."
];

export const workerConditionTrendByRange: Record<string, Record<WorkerChartRange, WorkerConditionPoint[]>> = {
  "W-01": {
    "1w": [
      { day: "Sen", green: 2, yellow: 1, red: 0 },
      { day: "Sel", green: 2, yellow: 1, red: 0 },
      { day: "Rab", green: 1, yellow: 2, red: 0 },
      { day: "Kam", green: 2, yellow: 1, red: 0 },
      { day: "Jum", green: 1, yellow: 2, red: 0 },
      { day: "Sab", green: 2, yellow: 1, red: 0 },
      { day: "Min", green: 2, yellow: 1, red: 0 }
    ],
    "1m": [
      { day: "W1", green: 9, yellow: 4, red: 0 },
      { day: "W2", green: 8, yellow: 5, red: 0 },
      { day: "W3", green: 10, yellow: 3, red: 0 },
      { day: "W4", green: 8, yellow: 4, red: 1 }
    ],
    "6m": [
      { day: "Okt", green: 30, yellow: 10, red: 1 },
      { day: "Nov", green: 28, yellow: 11, red: 2 },
      { day: "Des", green: 32, yellow: 9, red: 1 },
      { day: "Jan", green: 31, yellow: 10, red: 1 },
      { day: "Feb", green: 33, yellow: 8, red: 1 },
      { day: "Mar", green: 30, yellow: 10, red: 2 }
    ],
    "1y": [
      { day: "Q1", green: 93, yellow: 29, red: 4 },
      { day: "Q2", green: 97, yellow: 26, red: 4 },
      { day: "Q3", green: 95, yellow: 29, red: 5 },
      { day: "Q4", green: 98, yellow: 27, red: 4 }
    ]
  },
  "W-02": {
    "1w": [
      { day: "Sen", green: 3, yellow: 0, red: 0 },
      { day: "Sel", green: 3, yellow: 0, red: 0 },
      { day: "Rab", green: 2, yellow: 1, red: 0 },
      { day: "Kam", green: 3, yellow: 0, red: 0 },
      { day: "Jum", green: 3, yellow: 0, red: 0 },
      { day: "Sab", green: 2, yellow: 1, red: 0 },
      { day: "Min", green: 3, yellow: 0, red: 0 }
    ],
    "1m": [
      { day: "W1", green: 11, yellow: 2, red: 0 },
      { day: "W2", green: 12, yellow: 1, red: 0 },
      { day: "W3", green: 10, yellow: 2, red: 0 },
      { day: "W4", green: 11, yellow: 2, red: 0 }
    ],
    "6m": [
      { day: "Okt", green: 36, yellow: 5, red: 0 },
      { day: "Nov", green: 37, yellow: 4, red: 0 },
      { day: "Des", green: 35, yellow: 6, red: 0 },
      { day: "Jan", green: 38, yellow: 4, red: 0 },
      { day: "Feb", green: 36, yellow: 5, red: 0 },
      { day: "Mar", green: 37, yellow: 4, red: 0 }
    ],
    "1y": [
      { day: "Q1", green: 112, yellow: 15, red: 0 },
      { day: "Q2", green: 109, yellow: 17, red: 0 },
      { day: "Q3", green: 111, yellow: 16, red: 0 },
      { day: "Q4", green: 113, yellow: 15, red: 0 }
    ]
  },
  "W-03": {
    "1w": [
      { day: "Sen", green: 1, yellow: 1, red: 1 },
      { day: "Sel", green: 1, yellow: 1, red: 1 },
      { day: "Rab", green: 1, yellow: 1, red: 1 },
      { day: "Kam", green: 1, yellow: 1, red: 1 },
      { day: "Jum", green: 2, yellow: 1, red: 0 },
      { day: "Sab", green: 1, yellow: 1, red: 1 },
      { day: "Min", green: 1, yellow: 1, red: 1 }
    ],
    "1m": [
      { day: "W1", green: 5, yellow: 4, red: 4 },
      { day: "W2", green: 6, yellow: 4, red: 3 },
      { day: "W3", green: 7, yellow: 3, red: 3 },
      { day: "W4", green: 6, yellow: 4, red: 3 }
    ],
    "6m": [
      { day: "Okt", green: 18, yellow: 13, red: 10 },
      { day: "Nov", green: 19, yellow: 12, red: 10 },
      { day: "Des", green: 21, yellow: 11, red: 9 },
      { day: "Jan", green: 20, yellow: 12, red: 9 },
      { day: "Feb", green: 22, yellow: 10, red: 9 },
      { day: "Mar", green: 23, yellow: 10, red: 8 }
    ],
    "1y": [
      { day: "Q1", green: 59, yellow: 35, red: 28 },
      { day: "Q2", green: 61, yellow: 34, red: 27 },
      { day: "Q3", green: 63, yellow: 33, red: 26 },
      { day: "Q4", green: 65, yellow: 32, red: 25 }
    ]
  },
  "W-04": {
    "1w": [
      { day: "Sen", green: 2, yellow: 1, red: 0 },
      { day: "Sel", green: 2, yellow: 1, red: 0 },
      { day: "Rab", green: 2, yellow: 1, red: 0 },
      { day: "Kam", green: 1, yellow: 2, red: 0 },
      { day: "Jum", green: 2, yellow: 1, red: 0 },
      { day: "Sab", green: 1, yellow: 2, red: 0 },
      { day: "Min", green: 2, yellow: 1, red: 0 }
    ],
    "1m": [
      { day: "W1", green: 8, yellow: 5, red: 0 },
      { day: "W2", green: 9, yellow: 4, red: 0 },
      { day: "W3", green: 8, yellow: 5, red: 0 },
      { day: "W4", green: 9, yellow: 4, red: 0 }
    ],
    "6m": [
      { day: "Okt", green: 27, yellow: 14, red: 0 },
      { day: "Nov", green: 28, yellow: 13, red: 0 },
      { day: "Des", green: 29, yellow: 12, red: 0 },
      { day: "Jan", green: 30, yellow: 11, red: 0 },
      { day: "Feb", green: 29, yellow: 12, red: 0 },
      { day: "Mar", green: 30, yellow: 11, red: 0 }
    ],
    "1y": [
      { day: "Q1", green: 88, yellow: 36, red: 0 },
      { day: "Q2", green: 89, yellow: 35, red: 0 },
      { day: "Q3", green: 90, yellow: 34, red: 0 },
      { day: "Q4", green: 91, yellow: 33, red: 0 }
    ]
  }
};

export function riskLabel(level: RiskLevel) {
  if (level === "red") return "Risiko Tinggi";
  if (level === "yellow") return "Perlu Atensi";
  return "Stabil";
}
