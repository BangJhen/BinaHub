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

    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString()
      })
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
