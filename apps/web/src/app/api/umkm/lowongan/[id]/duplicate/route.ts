import { NextResponse } from 'next/server';
import { createClient } from '@/shared/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const id = params.id;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the existing job
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('umkm_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Insert duplicated job
    const { data: newJob, error: insertError } = await supabase
      .from('jobs')
      .insert({
        umkm_id: user.id,
        title: job.title + ' (Copy)',
        description: job.description,
        requirements: job.requirements,
        employment_type: job.employment_type,
        location: job.location,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send mock response expected by the frontend
    return NextResponse.json({ data: newJob });
  } catch (error: any) {
    console.error('Error duplicating lowongan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
