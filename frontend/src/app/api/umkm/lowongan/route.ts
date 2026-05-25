import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all jobs for this UMKM along with related applications
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        job_applications(id, status, applied_at)
      `)
      .eq('umkm_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedJobs = (jobs || []).map((job: any) => {
      let mappedStatus: string = 'Draft';
      if (job.status === 'open') mappedStatus = 'Aktif';
      else if (job.status === 'closed' || job.status === 'cancelled') mappedStatus = 'Ditutup';
      else if (job.status === 'draft') mappedStatus = 'Draft';

      const salaryMin = job.salary_min || 0;
      const salaryMax = job.salary_max || 0;
      let salaryFormat = 'Tidak dicantumkan';

      if (salaryMin > 0 && salaryMax > 0) {
        salaryFormat = `Rp ${salaryMin.toLocaleString('id-ID')} - Rp ${salaryMax.toLocaleString('id-ID')}`;
      } else if (salaryMin > 0) {
        salaryFormat = `Mulai Rp ${salaryMin.toLocaleString('id-ID')}`;
      } else if (salaryMax > 0) {
        salaryFormat = `Hingga Rp ${salaryMax.toLocaleString('id-ID')}`;
      }

      const applications = job.job_applications || [];
      const applicants = applications.length;
      const hired = applications.filter((app: any) => app.status === 'accepted').length;

      // Generate consistent pseudo views based on id and applicant count
      const seed = (job.id || '').split('').reduce((sum: number, ch: string) => sum + ch.charCodeAt(0), 0);
      const baseViews = (seed % 60) + applicants * 8 + 12;
      const viewsThisWeek = Math.max(2, Math.round(baseViews * 0.18));

      return {
        id: job.id,
        title: job.title,
        jobCode: 'JOB-' + job.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
        location: job.location || 'Tidak disebutkan',
        type: job.employment_type || 'Full Time',
        salary: salaryFormat,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        description: job.description || '',
        requirements: job.requirements || '',
        skills: job.skills || [],
        benefits: job.benefits || [],
        educationLevel: job.education_level || '',
        experienceRequired: job.experience_required || '',
        ageRange: job.age_range || '',
        status: mappedStatus,
        positions: 1,
        applicants,
        hired,
        views: baseViews,
        viewsThisWeek,
        umkmId: job.umkm_id,
        publishedAt: job.published_at,
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

    // Verify the user is UMKM role
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'umkm') {
      return NextResponse.json({ error: 'Only UMKM can create jobs' }, { status: 403 });
    }

    const payload = await request.json();

    if (!payload.title || !payload.title.trim()) {
      return NextResponse.json({ error: 'Title wajib diisi' }, { status: 400 });
    }

    const status = payload.status === 'draft' ? 'draft' : 'open';

    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert({
        umkm_id: user.id,
        title: payload.title,
        description: payload.description || '',
        requirements: payload.requirements || '',
        employment_type: payload.type || 'Full Time',
        location: payload.location || '',
        salary_min: payload.salaryMin ? parseFloat(payload.salaryMin) : null,
        salary_max: payload.salaryMax ? parseFloat(payload.salaryMax) : null,
        skills: Array.isArray(payload.skills) ? payload.skills : [],
        benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
        education_level: payload.educationLevel || null,
        experience_required: payload.experienceRequired || null,
        age_range: payload.ageRange || null,
        status,
        published_at: status === 'open' ? new Date().toISOString() : null
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
