import { Lowongan } from "@/types/lowongan";

/**
 * Get relative time (e.g., "2 hari lalu")
 */
export function getRelativeTime(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  if (!(target instanceof Date) || isNaN(target.getTime())) return "-";

  const now = new Date();
  const diffInMs = now.getTime() - target.getTime();
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
export function formatDate(date: Date | string, format: "full" | "short" = "full"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return "-";

  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  if (format === "short") {
    return `${d.getDate()} ${months[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
  }

  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string) {
  switch (status) {
    case "Aktif":
      return { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" };
    case "Draft":
      return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
    case "Ditutup":
      return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
    default:
      return { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
  }
}

/**
 * Filter and sort lowongan list
 */
export function filterAndSort(
  lowongan: Lowongan[],
  statusFilter: string,
  sortBy: string,
  searchQuery: string
): Lowongan[] {
  let filtered = [...lowongan];

  if (statusFilter && statusFilter !== "Semua Status") {
    filtered = filtered.filter((l) => l.status === statusFilter);
  }

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        (l.jobCode || "").toLowerCase().includes(query) ||
        (l.location || "").toLowerCase().includes(query)
    );
  }

  switch (sortBy) {
    case "Terbaru Ditambahkan":
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "Tertua":
      return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case "Paling Views":
      return filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    case "Paling Pelamar":
      return filtered.sort((a, b) => (b.applicants || 0) - (a.applicants || 0));
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
    totalApplicants: lowongan.reduce((sum, l) => sum + (l.applicants || 0), 0),
    totalViews: lowongan.reduce((sum, l) => sum + (l.views || 0), 0),
    withPekerja: lowongan.filter((l) => (l.hired || 0) > 0).length,
    viewsTrend: 0
  };
  return stats;
}

/**
 * Get hiring progress percentage
 */
export function getHiringProgress(hired: number, positions: number): number {
  if (!positions || positions === 0) return 0;
  return Math.min(100, Math.round((hired / positions) * 100));
}

/**
 * Format Rupiah
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}
