import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all jobs for this UMKM to calculate stats
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, status, job_applications(status)')
      .eq('umkm_id', user.id);

    if (error) throw error;

    let activeLowongan = 0;
    let totalApplicants = 0;
    let withPekerja = 0;
    let totalViews = 0;
    let viewsTrend = 0;

    jobs.forEach((job: any) => {
      if (job.status === 'open') activeLowongan++;

      if (job.job_applications) {
        totalApplicants += job.job_applications.length;
        withPekerja += job.job_applications.filter(
          (app: any) => app.status === 'reviewed' || app.status === 'accepted'
        ).length;
      }
    });

    return NextResponse.json({
      activeLowongan,
      totalApplicants,
      withPekerja,
      totalViews,
      viewsTrend
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
