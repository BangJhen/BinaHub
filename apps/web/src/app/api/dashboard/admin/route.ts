import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/shared/lib/dashboard-queries";

export async function GET() {
  try {
    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch admin dashboard data";
    return NextResponse.json({ message }, { status: 500 });
  }
}
