export type CheckinCondition = "green" | "yellow" | "red" | "missed";
export type PerfRange = "1w" | "1m" | "3m";

export interface DailyCheckin {
  date: string;
  dayLabel: string;
  condition: CheckinCondition;
  mood: string;
  note: string;
  time: string;
}

export interface WeeklyPerf {
  week: string;
  score: number;
  checkinsCompleted: number;
  checkinsTotal: number;
}

export interface MonthlyDay {
  date: number;
  condition: CheckinCondition | "none";
}

export interface UmkmReview {
  id: string;
  umkmName: string;
  position: string;
  date: string;
  rating: number;
  comment: string;
  aspects: { label: string; score: number }[];
}

export const workerProfile = {
  name: "Rendi Saputra",
  position: "Kasir & Stok Barang",
  umkm: "Warung Makan Pak Budi",
  joinDate: "12 Feb 2025",
  streakDays: 14,
  attendanceRate: 92,
  performanceScore: 84,
  avgRating: 4.3,
  checkinThisMonth: 19,
  checkinTarget: 22,
};

export const dailyCheckins: DailyCheckin[] = [
  { date: "2025-05-11", dayLabel: "Min, 11 Mei", condition: "green", mood: "Semangat", note: "Hari ini kerja lancar, stok barang sudah dicek semua.", time: "07:52" },
  { date: "2025-05-10", dayLabel: "Sab, 10 Mei", condition: "green", mood: "Baik", note: "Tidak ada kendala berarti, shift selesai tepat waktu.", time: "08:10" },
  { date: "2025-05-09", dayLabel: "Jum, 9 Mei", condition: "yellow", mood: "Lelah", note: "Agak lelah setelah shift malam kemarin, tapi tetap hadir.", time: "08:45" },
  { date: "2025-05-08", dayLabel: "Kam, 8 Mei", condition: "green", mood: "Baik", note: "Pelanggan ramai, kerja cukup produktif.", time: "07:58" },
  { date: "2025-05-07", dayLabel: "Rab, 7 Mei", condition: "green", mood: "Semangat", note: "Check-in lebih awal, bantu persiapan pembukaan warung.", time: "07:30" },
  { date: "2025-05-06", dayLabel: "Sel, 6 Mei", condition: "yellow", mood: "Biasa", note: "Ada sedikit ketidaknyamanan, tapi berhasil diselesaikan.", time: "08:20" },
  { date: "2025-05-05", dayLabel: "Sen, 5 Mei", condition: "green", mood: "Baik", note: "Shift berjalan normal, tidak ada masalah.", time: "08:05" },
  { date: "2025-05-04", dayLabel: "Min, 4 Mei", condition: "missed", mood: "-", note: "Tidak melakukan check-in.", time: "-" },
  { date: "2025-05-03", dayLabel: "Sab, 3 Mei", condition: "green", mood: "Semangat", note: "Performa terbaik minggu ini, dapat pujian dari supervisor.", time: "07:48" },
  { date: "2025-05-02", dayLabel: "Jum, 2 Mei", condition: "green", mood: "Baik", note: "Transaksi kasir berjalan lancar tanpa error.", time: "08:02" },
  { date: "2025-05-01", dayLabel: "Kam, 1 Mei", condition: "missed", mood: "-", note: "Libur nasional, tidak ada shift.", time: "-" },
  { date: "2025-04-30", dayLabel: "Rab, 30 Apr", condition: "red", mood: "Kurang Baik", note: "Kondisi kesehatan kurang, izin setengah hari.", time: "09:30" },
  { date: "2025-04-29", dayLabel: "Sel, 29 Apr", condition: "yellow", mood: "Lelah", note: "Lelah setelah akhir pekan, tetap menyelesaikan tugas.", time: "08:35" },
  { date: "2025-04-28", dayLabel: "Sen, 28 Apr", condition: "green", mood: "Baik", note: "Awal minggu produktif, bantu restock barang.", time: "07:55" },
];

export const monthlyDays: MonthlyDay[] = [
  { date: 1, condition: "missed" },
  { date: 2, condition: "green" },
  { date: 3, condition: "green" },
  { date: 4, condition: "missed" },
  { date: 5, condition: "green" },
  { date: 6, condition: "yellow" },
  { date: 7, condition: "green" },
  { date: 8, condition: "green" },
  { date: 9, condition: "yellow" },
  { date: 10, condition: "green" },
  { date: 11, condition: "green" },
  { date: 12, condition: "none" },
  { date: 13, condition: "none" },
  { date: 14, condition: "none" },
  { date: 15, condition: "none" },
  { date: 16, condition: "none" },
  { date: 17, condition: "none" },
  { date: 18, condition: "none" },
  { date: 19, condition: "none" },
  { date: 20, condition: "none" },
  { date: 21, condition: "none" },
  { date: 22, condition: "none" },
  { date: 23, condition: "none" },
  { date: 24, condition: "none" },
  { date: 25, condition: "none" },
  { date: 26, condition: "none" },
  { date: 27, condition: "none" },
  { date: 28, condition: "none" },
  { date: 29, condition: "none" },
  { date: 30, condition: "none" },
  { date: 31, condition: "none" },
];

export const weeklyPerformanceByRange: Record<PerfRange, WeeklyPerf[]> = {
  "1w": [
    { week: "Sen", score: 88, checkinsCompleted: 1, checkinsTotal: 1 },
    { week: "Sel", score: 75, checkinsCompleted: 1, checkinsTotal: 1 },
    { week: "Rab", score: 92, checkinsCompleted: 1, checkinsTotal: 1 },
    { week: "Kam", score: 90, checkinsCompleted: 1, checkinsTotal: 1 },
    { week: "Jum", score: 78, checkinsCompleted: 1, checkinsTotal: 1 },
    { week: "Sab", score: 88, checkinsCompleted: 1, checkinsTotal: 1 },
    { week: "Min", score: 92, checkinsCompleted: 1, checkinsTotal: 1 },
  ],
  "1m": [
    { week: "Minggu 1", score: 82, checkinsCompleted: 5, checkinsTotal: 6 },
    { week: "Minggu 2", score: 76, checkinsCompleted: 4, checkinsTotal: 6 },
    { week: "Minggu 3", score: 88, checkinsCompleted: 6, checkinsTotal: 6 },
    { week: "Minggu 4", score: 91, checkinsCompleted: 6, checkinsTotal: 6 },
  ],
  "3m": [
    { week: "Mar", score: 71, checkinsCompleted: 18, checkinsTotal: 26 },
    { week: "Apr", score: 79, checkinsCompleted: 21, checkinsTotal: 26 },
    { week: "Mei", score: 84, checkinsCompleted: 19, checkinsTotal: 22 },
  ],
};

export const umkmReviews: UmkmReview[] = [
  {
    id: "r1",
    umkmName: "Warung Makan Pak Budi",
    position: "Kasir & Stok Barang",
    date: "5 Mei 2025",
    rating: 5,
    comment: "Rendi menunjukkan peningkatan signifikan bulan ini. Hadir tepat waktu, antusias dalam bekerja, dan sudah mampu bekerja mandiri tanpa perlu banyak arahan. Terus pertahankan!",
    aspects: [
      { label: "Kehadiran", score: 95 },
      { label: "Etos Kerja", score: 90 },
      { label: "Kerjasama", score: 88 },
      { label: "Adaptasi", score: 85 },
    ],
  },
  {
    id: "r2",
    umkmName: "Warung Makan Pak Budi",
    position: "Kasir & Stok Barang",
    date: "4 Apr 2025",
    rating: 4,
    comment: "Perkembangan kerja bulan April cukup baik. Masih perlu konsisten di check-in pagi hari, tapi kualitas kerja sudah meningkat dari bulan sebelumnya. Semangat terus!",
    aspects: [
      { label: "Kehadiran", score: 80 },
      { label: "Etos Kerja", score: 82 },
      { label: "Kerjasama", score: 85 },
      { label: "Adaptasi", score: 78 },
    ],
  },
  {
    id: "r3",
    umkmName: "Warung Makan Pak Budi",
    position: "Kasir & Stok Barang",
    date: "3 Mar 2025",
    rating: 3,
    comment: "Bulan pertama memang masa adaptasi. Rendi sudah menunjukkan kemauan untuk belajar. Ada beberapa keterlambatan, tapi secara keseluruhan bisa mengikuti ritme kerja.",
    aspects: [
      { label: "Kehadiran", score: 72 },
      { label: "Etos Kerja", score: 74 },
      { label: "Kerjasama", score: 80 },
      { label: "Adaptasi", score: 70 },
    ],
  },
];

export const performanceRecommendations = [
  {
    icon: "🔥",
    title: "Pertahankan Streak Check-in",
    desc: "Kamu sudah 14 hari berturut-turut melakukan check-in. Konsistensi ini sangat berpengaruh positif pada skor performa bulanan.",
  },
  {
    icon: "💛",
    title: "Kurangi Hari Kondisi Kuning",
    desc: "Ada 2 hari kondisi 'Perlu Atensi' dalam 2 minggu terakhir. Istirahat cukup dan sampaikan kendalamu ke supervisor lebih awal.",
  },
  {
    icon: "💬",
    title: "Minta Feedback Rutin dari UMKM",
    desc: "Feedback dari Pak Budi membantu meningkatkan skor. Aktif tanya ke supervisor minimal seminggu sekali untuk panduan kerja.",
  },
  {
    icon: "🎯",
    title: "Targetkan Rating 4.5 Bulan Depan",
    desc: "Rating kamu saat ini 4.3/5 — sudah bagus! Fokus tingkatkan aspek Kehadiran dan Adaptasi untuk naik ke 4.5 bulan depan.",
  },
];

export function conditionLabel(c: CheckinCondition): string {
  if (c === "green") return "Stabil";
  if (c === "yellow") return "Perlu Atensi";
  if (c === "red") return "Kurang Baik";
  return "Tidak Check-in";
}
