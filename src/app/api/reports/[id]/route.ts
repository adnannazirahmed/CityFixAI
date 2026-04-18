import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { store } from '@/lib/store';
import { userStore } from '@/lib/user-store';
import type { ReportStatus } from '@/types';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ─── GET /api/reports/:id ─────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const report = store.getById(params.id);
    if (!report) return NextResponse.json({ data: null, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: report, error: null });
  }

  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ data: null, error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ data, error: null });
  } catch (err) {
    console.error('[GET /api/reports/:id]', err);
    return NextResponse.json({ data: null, error: 'Server error' }, { status: 500 });
  }
}

// ─── PATCH /api/reports/:id ───────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, note } = body as { status: ReportStatus; note?: string };

    if (!status) {
      return NextResponse.json({ data: null, error: 'Status is required' }, { status: 400 });
    }

    const validStatuses: ReportStatus[] = [
      'submitted', 'under_review', 'assigned', 'in_progress', 'resolved',
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ data: null, error: 'Invalid status' }, { status: 400 });
    }

    if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const updated = store.updateStatus(params.id, status);
      // Award resolution points to the original reporter
      if (status === 'resolved' && updated?.user_id) {
        userStore.recordResolution(updated.user_id);
      }
      return NextResponse.json({ data: updated ?? { id: params.id, status }, error: null });
    }

    const supabase = await createServiceClient();

    // Get current status for history
    const { data: current } = await supabase
      .from('reports')
      .select('status')
      .eq('id', params.id)
      .single();

    const { data, error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Record status change history
    await supabase.from('report_status_history').insert({
      report_id: params.id,
      old_status: current?.status ?? null,
      new_status: status,
      changed_by: 'admin',
      note: note ?? null,
    });

    return NextResponse.json({ data, error: null });
  } catch (err) {
    console.error('[PATCH /api/reports/:id]', err);
    return NextResponse.json({ data: null, error: 'Failed to update report' }, { status: 500 });
  }
}

// ─── DELETE /api/reports/:id ──────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ data: { id: params.id }, error: null });
  }

  try {
    const supabase = await createServiceClient();
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ data: { id: params.id }, error: null });
  } catch (err) {
    console.error('[DELETE /api/reports/:id]', err);
    return NextResponse.json({ data: null, error: 'Failed to delete report' }, { status: 500 });
  }
}
