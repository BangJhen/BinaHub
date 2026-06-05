import { NextResponse } from "next/server";
import { getWorkerDashboardData } from "@/lib/dashboard-queries";

export async function GET() {
  try {
    const data = await getWorkerDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch worker dashboard data";
    return NextResponse.json({ message }, { status: 500 });
  }
}
