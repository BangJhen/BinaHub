import { Lowongan, DashboardStats } from "@/types/lowongan";

/**
 * GET /api/umkm/lowongan
 * Fetch all lowongan untuk UMKM yang login
 */
export async function fetchLowonganList(): Promise<Lowongan[]> {
  const response = await fetch("/api/umkm/lowongan", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Failed to fetch lowongan list");
  const data = await response.json();

  return (data.data || []).map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
    closedAt: item.closedAt ? new Date(item.closedAt) : undefined
  }));
}

/**
 * GET /api/umkm/lowongan/:id
 */
export async function fetchLowonganDetail(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Failed to fetch lowongan detail");
  const data = await response.json();

  return {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt),
    publishedAt: data.data.publishedAt ? new Date(data.data.publishedAt) : null,
    closedAt: data.data.closedAt ? new Date(data.data.closedAt) : undefined,
    pekerjaList:
      (data.data.pekerjaList || []).map((p: any) => ({
        ...p,
        joinedAt: new Date(p.joinedAt)
      }))
  };
}

/**
 * GET /api/umkm/lowongan/stats
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/umkm/lowongan/stats", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

/**
 * POST /api/umkm/lowongan/:id/close
 */
export async function closeLowongan(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Failed to close lowongan");
  // Refetch full detail so the UI keeps consistent shape
  return fetchLowonganDetail(lowonganId);
}

/**
 * POST /api/umkm/lowongan/:id/duplicate
 */
export async function duplicateLowongan(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Failed to duplicate lowongan");
  const data = await response.json();
  // The duplicate route returns the raw inserted job; refetch to get UI shape
  if (data?.data?.id) {
    return fetchLowonganDetail(data.data.id);
  }
  throw new Error("Duplicate response missing id");
}

/**
 * DELETE /api/umkm/lowongan
 */
export async function deleteLowongan(ids: string[]): Promise<void> {
  const response = await fetch('/api/umkm/lowongan', {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids })
  });

  if (!response.ok) throw new Error("Failed to delete lowongan");
}

/**
 * POST /api/umkm/lowongan/:id/view
 */
export async function trackLowonganView(lowonganId: string, isInternal: boolean = false): Promise<void> {
  await fetch(`/api/umkm/lowongan/${lowonganId}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isInternal })
  }).catch(() => undefined);
}
