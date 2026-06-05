import { NextResponse } from "next/server";
import { getUmkmDashboardData } from "@/lib/dashboard-queries";

export async function GET() {
  try {
    const data = await getUmkmDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch UMKM dashboard data";
    return NextResponse.json({ message }, { status: 500 });
  }
}
