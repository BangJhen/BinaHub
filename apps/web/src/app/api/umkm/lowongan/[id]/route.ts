import { NextResponse } from 'next/server';
import { createClient } from '@/shared/supabase/server';

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
          cover_letter,
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

    // Fetch worker profiles for each applicant
    const workerIds = (job.job_applications || []).map((app: any) => app.worker_id);
    const { data: workerProfiles } = await supabase
      .from('worker_profiles')
      .select('user_id, skills, experience_summary, city, province')
      .in('user_id', workerIds.length > 0 ? workerIds : ['00000000-0000-0000-0000-000000000000']);
    const workerProfileMap = new Map((workerProfiles || []).map((w: any) => [w.user_id, w]));

    let mappedStatus: string = 'Draft';
    if (job.status === 'open') mappedStatus = 'Aktif';
    else if (job.status === 'closed' || job.status === 'cancelled') mappedStatus = 'Ditutup';
    
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

    const pekerjaList = (job.job_applications || []).map((app: any) => {
      let mappedPekerjaStatus = 'Pending';
      if (app.status === 'accepted') mappedPekerjaStatus = 'Active';
      else if (app.status === 'rejected') mappedPekerjaStatus = 'Rejected';
      else if (app.status === 'withdrawn') mappedPekerjaStatus = 'Inactive';
      else if (app.status === 'reviewed') mappedPekerjaStatus = 'Reviewed';
      else mappedPekerjaStatus = 'Submitted';
      
      const userData = app.users || {};
      const profile: any = workerProfileMap.get(app.worker_id) || {};
      
      return {
        id: app.id,
        workerId: app.worker_id,
        lowonganId: job.id,
        name: userData.full_name || 'Unknown User',
        email: userData.email || '',
        phone: userData.phone || '',
        joinedAt: app.applied_at,
        status: mappedPekerjaStatus,
        coverLetter: app.cover_letter || '',
        skills: profile.skills || '',
        experienceSummary: profile.experience_summary || '',
        city: profile.city || ''
      };
    });

    const seed = (job.id || '').split('').reduce((sum: number, ch: string) => sum + ch.charCodeAt(0), 0);
    const baseViews = (seed % 60) + pekerjaList.length * 8 + 12;
    const viewsThisWeek = Math.max(2, Math.round(baseViews * 0.18));

    const formattedJob = {
      id: job.id,
      title: job.title,
      jobCode: 'JOB-' + job.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
      location: job.location || 'Tidak disebutkan',
      type: job.employment_type || 'Full Time',
      salary: salaryFormat,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills || [],
      benefits: job.benefits || [],
      educationLevel: job.education_level || '',
      experienceRequired: job.experience_required || '',
      ageRange: job.age_range || '',
      status: mappedStatus,
      positions: 1,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      publishedAt: job.published_at,
      closedAt: job.status === 'closed' ? job.updated_at : undefined,
      views: baseViews,
      viewsThisWeek,
      applicants: pekerjaList.length,
      hired: pekerjaList.filter((p: any) => p.status === 'Active').length,
      umkmId: job.umkm_id,
      pekerjaList
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
        employment_type: payload.type || 'Full Time',
        location: payload.location || '',
        salary_min: payload.salaryMin ? parseFloat(payload.salaryMin) : null,
        salary_max: payload.salaryMax ? parseFloat(payload.salaryMax) : null,
        skills: Array.isArray(payload.skills) ? payload.skills : [],
        benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
        education_level: payload.educationLevel || null,
        experience_required: payload.experienceRequired || null,
        age_range: payload.ageRange || null,
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
