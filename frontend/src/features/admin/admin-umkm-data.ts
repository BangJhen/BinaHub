import type { RiskLevel } from "@/features/umkm/workers-data";

export type AdminWorker = {
  id: string;
  name: string;
  role: string;
  startDate: string;
  attendanceRate: number;
  productivityScore: number;
  checkinConsistency: number;
  latestCheckin: string;
  latestCondition: RiskLevel;
  mentorNote: string;
};

export type UmkmIssue = {
  id: string;
  workerId: string;
  workerName: string;
  level: RiskLevel;
  message: string;
  createdAt: string;
};

export type AdminUmkm = {
  id: string;
  name: string;
  category: string;
  location: string;
  owner: string;
  lastUpdate: string;
  notes: string;
  workers: AdminWorker[];
  issues: UmkmIssue[];
};

export const adminUmkmData: AdminUmkm[] = [
  {
    id: "U-01",
    name: "Warung Makan Pak Budi",
    category: "Kuliner",
    location: "Bandung",
    owner: "Budi Santosa",
    lastUpdate: "Hari ini, 09:10",
    notes: "Check-in sore cenderung turun saat akhir pekan, perlu penyesuaian shift.",
    workers: [
      {
        id: "W-01",
        name: "Rizky Pratama",
        role: "Staff Operasional",
        startDate: "12 Jan 2026",
        attendanceRate: 96,
        productivityScore: 84,
        checkinConsistency: 92,
        latestCheckin: "Hari ini, 07:18",
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
        latestCondition: "red",
        mentorNote: "Butuh pendampingan intensif terkait disiplin check-in dan stres kerja."
      }
    ],
    issues: [
      {
        id: "I-101",
        workerId: "W-03",
        workerName: "Andri Saputra",
        level: "red",
        message: "Tidak melakukan check-in 2 hari dan performa menurun di shift terakhir.",
        createdAt: "35 menit lalu"
      },
      {
        id: "I-102",
        workerId: "W-01",
        workerName: "Rizky Pratama",
        level: "yellow",
        message: "Check-in menunjukan kecemasan ringan selama 2 hari berturut-turut.",
        createdAt: "1 jam lalu"
      }
    ]
  },
  {
    id: "U-02",
    name: "Laundry Kembang",
    category: "Jasa",
    location: "Cimahi",
    owner: "Sari Wahyuni",
    lastUpdate: "Hari ini, 08:42",
    notes: "Monitoring stabil, pastikan rotasi kerja tetap konsisten di shift pagi.",
    workers: [
      {
        id: "W-05",
        name: "Dewi Lestari",
        role: "Operator Mesin",
        startDate: "08 Feb 2026",
        attendanceRate: 94,
        productivityScore: 86,
        checkinConsistency: 90,
        latestCheckin: "Hari ini, 06:40",
        latestCondition: "green",
        mentorNote: "Konsisten, fokus pada peningkatan target lipat."
      },
      {
        id: "W-06",
        name: "Fajar Nugraha",
        role: "Logistik",
        startDate: "15 Jan 2026",
        attendanceRate: 91,
        productivityScore: 80,
        checkinConsistency: 88,
        latestCheckin: "Hari ini, 06:52",
        latestCondition: "yellow",
        mentorNote: "Perlu reminder rutin untuk update kondisi saat beban tinggi."
      }
    ],
    issues: [
      {
        id: "I-201",
        workerId: "W-06",
        workerName: "Fajar Nugraha",
        level: "yellow",
        message: "Check-in menunjukan kelelahan ringan saat shift akhir pekan.",
        createdAt: "2 jam lalu"
      }
    ]
  },
  {
    id: "U-03",
    name: "Toko Kelontong Maju",
    category: "Ritel",
    location: "Bandung",
    owner: "Agus Prasetyo",
    lastUpdate: "Kemarin, 18:10",
    notes: "Tidak ada kendala besar, tetap lakukan coaching mingguan.",
    workers: [
      {
        id: "W-07",
        name: "Nina Putri",
        role: "Kasir",
        startDate: "28 Jan 2026",
        attendanceRate: 97,
        productivityScore: 90,
        checkinConsistency: 96,
        latestCheckin: "Hari ini, 07:00",
        latestCondition: "green",
        mentorNote: "Performa stabil, siap bantu onboarding pekerja baru."
      },
      {
        id: "W-08",
        name: "Bayu Mahendra",
        role: "Penata Stok",
        startDate: "05 Feb 2026",
        attendanceRate: 93,
        productivityScore: 83,
        checkinConsistency: 90,
        latestCheckin: "Hari ini, 06:55",
        latestCondition: "green",
        mentorNote: "Stabil, cocok untuk tugas inventori mingguan."
      }
    ],
    issues: []
  }
];
