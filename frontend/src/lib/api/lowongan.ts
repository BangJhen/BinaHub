import { Lowongan, DashboardStats } from "@/types/lowongan";

/**
 * GET /api/umkm/lowongan
 * Fetch all lowongan untuk UMKM yang login
 */
export async function fetchLowonganList(): Promise<Lowongan[]> {
  const response = await fetch("/api/umkm/lowongan", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Failed to fetch lowongan list");
  const data = await response.json();

  // Convert string dates to Date objects
  return data.data.map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    closedAt: item.closedAt ? new Date(item.closedAt) : undefined
  }));
}

/**
 * GET /api/umkm/lowongan/:id
 * Fetch single lowongan with full details
 */
export async function fetchLowonganDetail(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Failed to fetch lowongan detail");
  const data = await response.json();

  return {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt),
    closedAt: data.data.closedAt ? new Date(data.data.closedAt) : undefined,
    pekerjaList:
      data.data.pekerjaList?.map((p: any) => ({
        ...p,
        joinedAt: new Date(p.joinedAt)
      })) || []
  };
}

/**
 * GET /api/umkm/lowongan/stats
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch("/api/umkm/lowongan/stats", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

/**
 * POST /api/umkm/lowongan/:id/close
 * Close a lowongan
 */
export async function closeLowongan(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Failed to close lowongan");
  const data = await response.json();

  return {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt),
    closedAt: new Date(data.data.closedAt)
  };
}

/**
 * POST /api/umkm/lowongan/:id/duplicate
 * Duplicate a lowongan
 */
export async function duplicateLowongan(lowonganId: string): Promise<Lowongan> {
  const response = await fetch(`/api/umkm/lowongan/${lowonganId}/duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Failed to duplicate lowongan");
  const data = await response.json();

  return {
    ...data.data,
    createdAt: new Date(data.data.createdAt),
    updatedAt: new Date(data.data.updatedAt)
  };
}

/**
 * DELETE /api/umkm/lowongan
 * Delete multiple lowongan
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
 * Track lowongan view (call when user views the listing)
 */
export async function trackLowonganView(lowonganId: string, isInternal: boolean = false): Promise<void> {
  await fetch(`/api/umkm/lowongan/${lowonganId}/view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isInternal })
  });
}
