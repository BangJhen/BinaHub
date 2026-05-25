import { NextResponse } from "next/server";
import { getWorkerLowonganData } from "@/lib/lowongan-queries";

export async function GET() {
  try {
    const data = await getWorkerLowonganData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch lowongan data";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ message }, { status });
  }
}
