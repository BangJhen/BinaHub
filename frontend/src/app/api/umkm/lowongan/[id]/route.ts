import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const id = params.id;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        job_applications(
          id,
          status,
          applied_at,
          worker_id,
          users:worker_id (
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('id', id)
      .eq('umkm_id', user.id)
      .single();

    if (error) throw error;
    if (!job) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let mappedStatus = 'Draft';
    if (job.status === 'open') mappedStatus = 'Aktif';
    if (job.status === 'closed' || job.status === 'cancelled') mappedStatus = 'Tutup';
    
    const salaryMin = job.salary_min || 0;
    const salaryMax = job.salary_max || 0;
    let salaryFormat = 'Tidak dicantumkan';
    
    if (salaryMin > 0 || salaryMax > 0) {
        salaryFormat = `Rp ${salaryMin.toLocaleString('id-ID')} - Rp ${salaryMax.toLocaleString('id-ID')}`;
    }

    const pekerjaList = (job.job_applications || []).map((app: any) => {
      let mappedPekerjaStatus = 'Pending';
      if (app.status === 'accepted') mappedPekerjaStatus = 'Active';
      if (app.status === 'rejected') mappedPekerjaStatus = 'Rejected';
      if (app.status === 'withdrawn') mappedPekerjaStatus = 'Inactive';
      
      const userData = app.users || {};
      
      return {
        id: app.id, // application id
        lowonganId: job.id,
        name: userData.full_name || 'Unknown User',
        email: userData.email || '',
        phone: userData.phone || '',
        joinedAt: app.applied_at,
        status: mappedPekerjaStatus
      };
    });

    const formattedJob = {
      id: job.id,
      title: job.title,
      jobCode: job.id.split('-')[0].toUpperCase(),
      location: job.location || 'Tidak disebutkan',
      type: job.employment_type || 'Full-time',
      salary: salaryFormat,
      description: job.description,
      requirements: job.requirements,
      status: mappedStatus,
      positions: 1, // Defaulting as nothing matches in jobs schema explicitly
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      closedAt: job.status === 'closed' ? job.updated_at : undefined,
      views: 0,
      viewsThisWeek: 0,
      applicants: pekerjaList.length,
      hired: pekerjaList.filter((p: any) => p.status === 'Active').length,
      umkmId: job.umkm_id,
      pekerjaList: pekerjaList
    };

    return NextResponse.json({ data: formattedJob });
  } catch (error: any) {
    console.error('Error fetching lowongan detail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const id = params.id;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    
    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update({
        title: payload.title,
        description: payload.description || '',
        requirements: payload.requirements || '',
        employment_type: payload.type || 'FULL_TIME',
        location: payload.location || '',
        salary_min: payload.salaryMin,
        salary_max: payload.salaryMax,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('umkm_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!updatedJob) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }
    
    return NextResponse.json({ data: updatedJob });
  } catch (error: any) {
    console.error('Error updating lowongan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
