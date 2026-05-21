// Enums
export enum LowonganStatus {
  AKTIF = "Aktif",
  DRAFT = "Draft",
  DITUTUP = "Ditutup"
}

export enum JobType {
  FULL_TIME = "Full Time",
  PART_TIME = "Part Time",
  CONTRACT = "Contract",
  FREELANCE = "Freelance"
}

export enum PekerjaStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
  PENDING = "Pending",
  REJECTED = "Rejected"
}

// Main Types
export interface Lowongan {
  id: string;
  title: string;
  jobCode: string; // e.g., J-201
  location: string;
  type: JobType;
  salary: string; // e.g., "2500000-3500000"
  description?: string;
  requirements?: string;
  status: LowonganStatus;
  positions: number; // How many positions needed
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;

  // Stats
  views: number;
  viewsThisWeek: number;
  applicants: number;
  hired: number;

  // Relations
  umkmId: string;
  pekerjaList?: Pekerja[];
}

export interface Pekerja {
  id: string;
  lowonganId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinedAt: Date;
  status: PekerjaStatus;
  salary?: number;
  notes?: string;
}

export interface LowonganView {
  id: string;
  lowonganId: string;
  viewedBy?: string; // User ID or anonymous
  viewedAt: Date;
  isInternal: boolean; // UMKM sendiri atau user lain
  userAgent?: string; // Browser info
}

export interface DashboardStats {
  activeLowongan: number;
  totalApplicants: number;
  totalViews: number;
  withPekerja: number;
  viewsTrend: number; // Percentage change from last week
}

export interface FilterSortState {
  statusFilter: LowonganStatus | "Semua Status";
  sortBy: "Terbaru Ditambahkan" | "Tertua" | "Paling Views" | "Paling Pelamar";
  searchQuery: string;
}
