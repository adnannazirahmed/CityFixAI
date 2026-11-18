import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { store } from '@/lib/store';
import type { ReportStatus } from '@/types';

import { IS_DEMO } from '@/lib/demo/config';

// Never prerender at build time: this reads live (Supabase or in-memory) data.
export const dynamic = 'force-dynamic';

// ─── GET /api/reports/:id ─────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (IS_DEMO) {
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

    if (IS_DEMO) {
      // Read-only in demo mode: return the would-be update without mutating anything.
      // The visitor's browser stores the override and any resolution points.
      const seed = store.getById(params.id);
      const updated = seed
        ? { ...seed, status, updated_at: new Date().toISOString() }
        : { id: params.id, status };
      return NextResponse.json({ data: updated, error: null });
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
  if (IS_DEMO) {
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
