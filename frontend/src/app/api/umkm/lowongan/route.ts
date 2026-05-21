import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, job_applications(count)')
      .eq('umkm_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedJobs = jobs.map((job: any) => {
      let mappedStatus = 'Draft';
      if (job.status === 'open') mappedStatus = 'Aktif';
      if (job.status === 'closed' || job.status === 'cancelled') mappedStatus = 'Tutup';
      
      const salaryMin = job.salary_min || 0;
      const salaryMax = job.salary_max || 0;
      let salaryFormat = 'Tidak dicantumkan';
      
      if (salaryMin > 0 || salaryMax > 0) {
          salaryFormat = `Rp ${salaryMin.toLocaleString('id-ID')} - Rp ${salaryMax.toLocaleString('id-ID')}`;
      }

      const applicantCount = job.job_applications && job.job_applications.length > 0 
        ? job.job_applications[0].count 
        : 0;

      return {
        id: job.id,
        title: job.title,
        jobCode: job.id.split('-')[0].toUpperCase(),
        location: job.location || 'Tidak disebutkan',
        type: job.employment_type || 'Full-time',
        salary: salaryFormat,
        description: job.description,
        requirements: job.requirements,
        status: mappedStatus,
        applicantCount: applicantCount,
        viewCount: 0, 
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        closedAt: job.status === 'closed' ? job.updated_at : undefined,
      };
    });

    return NextResponse.json({ data: formattedJobs });
  } catch (error: any) {
    console.error('Error fetching lowongan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    
    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert({
        umkm_id: user.id,
        title: payload.title,
        description: payload.description || '',
        requirements: payload.requirements || '',
        employment_type: payload.type || 'FULL_TIME',
        location: payload.location || '',
        salary_min: payload.salaryMin ? parseFloat(payload.salaryMin) : null,
        salary_max: payload.salaryMax ? parseFloat(payload.salaryMax) : null,
        status: 'open',
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: newJob });
  } catch (error: any) {
    console.error('Error creating lowongan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const ids = payload.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid ids provided' }, { status: 400 });
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('umkm_id', user.id)
      .in('id', ids);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting lowongan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

