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
  type: JobType | string;
  salary: string; // formatted display string
  salaryMin: number | null;
  salaryMax: number | null;
  description?: string;
  requirements?: string;
  skills?: string[];
  benefits?: string[];
  educationLevel?: string;
  experienceRequired?: string;
  ageRange?: string;
  status: LowonganStatus | string;
  positions: number; // How many positions needed
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  publishedAt?: Date | null;

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
  status: PekerjaStatus | string;
  salary?: number;
  notes?: string;
  coverLetter?: string;
  skills?: string;
  experienceSummary?: string;
  city?: string;
}

export interface DashboardStats {
  activeLowongan: number;
  totalApplicants: number;
  totalViews: number;
  withPekerja: number;
  viewsTrend: number;
}

export interface FilterSortState {
  statusFilter: LowonganStatus | "Semua Status";
  sortBy: "Terbaru Ditambahkan" | "Tertua" | "Paling Pelamar" | "Paling Views";
  searchQuery: string;
}
