import { NextResponse } from "next/server";
import { getWorkerLowonganPage } from "@/features/lowongan/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getWorkerLowonganPage({
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 10),
      search: searchParams.get("search") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      types: searchParams.get("types")?.split(",").filter(Boolean) ?? [],
      sortBy: searchParams.get("sortBy") === "salary" ? "salary" : "newest",
    });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch lowongan data";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}
