import { Lowongan } from "@/types/lowongan";

/**
 * Get relative time (e.g., "2 hari lalu")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  if (diffInDays === 1) return "Kemarin";
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  if (diffInWeeks === 1) return "1 minggu lalu";
  if (diffInWeeks < 4) return `${diffInWeeks} minggu lalu`;
  if (diffInMonths === 1) return "1 bulan lalu";
  if (diffInMonths < 12) return `${diffInMonths} bulan lalu`;

  return `${Math.floor(diffInMonths / 12)} tahun lalu`;
}

/**
 * Format date untuk display
 */
export function formatDate(date: Date, format: "full" | "short" = "full"): string {
  const d = new Date(date);
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember"
  ];

  if (format === "short") {
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string) {
  switch (status) {
    case "Aktif":
      return { bg: "#E1F5EE", text: "#0F6E56" };
    case "Draft":
      return { bg: "#FAEEDA", text: "#854F0B" };
    case "Ditutup":
      return { bg: "#F5F5F5", text: "#666" };
    default:
      return { bg: "#F5F5F5", text: "#666" };
  }
}

/**
 * Filter and sort lowongan list
 */
export function filterAndSort(lowongan: Lowongan[], statusFilter: string, sortBy: string, searchQuery: string): Lowongan[] {
  let filtered = lowongan;

  // Filter by status
  if (statusFilter !== "Semua Status") {
    filtered = filtered.filter((l) => l.status === statusFilter);
  }

  // Filter by search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (l) => l.title.toLowerCase().includes(query) || l.jobCode.includes(query) || l.location.toLowerCase().includes(query)
    );
  }

  // Sort
  switch (sortBy) {
    case "Terbaru Ditambahkan":
      return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "Tertua":
      return filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case "Paling Views":
      return filtered.sort((a, b) => b.views - a.views);
    case "Paling Pelamar":
      return filtered.sort((a, b) => b.applicants - a.applicants);
    default:
      return filtered;
  }
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(lowongan: Lowongan[]) {
  const stats = {
    activeLowongan: lowongan.filter((l) => l.status === "Aktif").length,
    totalApplicants: lowongan.reduce((sum, l) => sum + l.applicants, 0),
    totalViews: lowongan.reduce((sum, l) => sum + l.views, 0),
    withPekerja: lowongan.filter((l) => l.hired > 0).length
  };

  return stats;
}

/**
 * Get hiring progress percentage
 */
export function getHiringProgress(hired: number, positions: number): number {
  if (positions === 0) return 0;
  return Math.round((hired / positions) * 100);
}
