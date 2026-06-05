import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const id = params.id;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find existing job to toggle
    const { data: existing, error: fetchError } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('id', id)
      .eq('umkm_id', user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const nextStatus = existing.status === 'closed' ? 'open' : 'closed';

    const updates: Record<string, any> = {
      status: nextStatus,
      updated_at: new Date().toISOString()
    };
    if (nextStatus === 'open') {
      updates.published_at = new Date().toISOString();
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .eq('umkm_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: job });
  } catch (error: any) {
    console.error('Error closing lowongan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
