import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { analyzeReport } from '@/lib/openai/analyze';
import { calculatePriorityScore, findDuplicates } from '@/lib/scoring/priority';
import { store } from '@/lib/store';
import { userStore } from '@/lib/user-store';
import { scoreToLevel } from '@/lib/utils';
import type { IssueCategory } from '@/types';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ─── GET /api/reports ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const neighborhood = searchParams.get('neighborhood');
  const priority_level = searchParams.get('priority_level');
  const limit = parseInt(searchParams.get('limit') ?? '100');

  if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const data = store.getAll({ status: status ?? undefined, category: category ?? undefined, neighborhood: neighborhood ?? undefined, priority_level: priority_level ?? undefined, limit });
    return NextResponse.json({ data, error: null });
  }

  try {
    const supabase = await createServiceClient();
    let query = supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') query = query.eq('status', status);
    if (category && category !== 'all') query = query.eq('category', category);
    if (neighborhood && neighborhood !== 'all') query = query.eq('neighborhood', neighborhood);
    if (priority_level && priority_level !== 'all') query = query.eq('priority_level', priority_level);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data, error: null });
  } catch (err) {
    console.error('[GET /api/reports]', err);
    return NextResponse.json({ data: null, error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// ─── POST /api/reports ────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, latitude, longitude, address, neighborhood, image_url, user_id, ai_result } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({ data: null, error: 'Location is required' }, { status: 400 });
    }

    // Use pre-computed AI result from the form preview step if available (avoids duplicate OpenAI call)
    const aiResult = ai_result ?? await analyzeReport(description ?? '', image_url, latitude, longitude);

    // 2. Priority scoring (enhanced with location context)
    const scoring = calculatePriorityScore({
      category: aiResult.category as IssueCategory,
      severity: aiResult.severity,
      latitude,
      longitude,
      duplicate_count: 0,
    });

    // Merge AI scores with rule-based boost
    const finalUrgency = Math.round((aiResult.urgency_score + scoring.urgency_score) / 2);
    const finalImpact = Math.round((aiResult.impact_score + scoring.impact_score) / 2);
    const finalPriority = Math.round((aiResult.priority_score + scoring.priority_score) / 2);

    const reportData = {
      title: aiResult.title,
      description: description ?? null,
      image_url: image_url ?? null,
      latitude,
      longitude,
      address: address ?? null,
      neighborhood: neighborhood ?? null,
      category: aiResult.category,
      ai_summary: aiResult.summary,
      severity: aiResult.severity,
      urgency_score: finalUrgency,
      impact_score: finalImpact,
      priority_score: finalPriority,
      priority_level: scoreToLevel(finalPriority),
      ai_reasoning: aiResult.reasoning,
      recommended_action: aiResult.recommended_action,
      status: 'submitted',
      duplicate_cluster_id: null,
    };

    if (DEMO_MODE || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const newReport = {
        id: `report-${Date.now()}`,
        ...reportData,
        user_id: user_id ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.add(newReport);

      // Update user score
      const userScore = user_id
        ? userStore.recordReport(user_id, {
            type: 'report_submitted',
            confidence: aiResult.confidence,
            mismatch_detected: aiResult.mismatch_detected,
          })
        : null;

      return NextResponse.json({ data: newReport, userScore, error: null }, { status: 201 });
    }

    const supabase = await createServiceClient();

    // 3. Duplicate detection
    const { data: existingReports } = await supabase
      .from('reports')
      .select('id, category, latitude, longitude, status, duplicate_cluster_id')
      .neq('status', 'resolved');

    const duplicates = findDuplicates(
      { category: aiResult.category as IssueCategory, latitude, longitude },
      existingReports ?? []
    );

    let clusterId: string | null = null;
    if (duplicates.length > 0) {
      // Find or create cluster
      const existingClusterReport = duplicates.find(d => d.duplicate_cluster_id);
      if (existingClusterReport?.duplicate_cluster_id) {
        clusterId = existingClusterReport.duplicate_cluster_id;
        // Update cluster size
        await supabase.rpc('increment_cluster_size', { cluster_id: clusterId });
      } else {
        const { data: cluster } = await supabase
          .from('duplicate_clusters')
          .insert({
            category: aiResult.category,
            center_latitude: latitude,
            center_longitude: longitude,
            cluster_size: duplicates.length + 1,
            neighborhood: neighborhood ?? null,
            status: 'submitted',
          })
          .select()
          .single();
        clusterId = cluster?.id ?? null;

        // Update existing duplicates with cluster id
        if (clusterId) {
          await supabase
            .from('reports')
            .update({ duplicate_cluster_id: clusterId })
            .in('id', duplicates.map(d => d.id));
        }
      }
    }

    // 4. Insert report
    const { data, error } = await supabase
      .from('reports')
      .insert({ ...reportData, duplicate_cluster_id: clusterId })
      .select()
      .single();

    if (error) throw error;

    // 5. Insert status history
    await supabase.from('report_status_history').insert({
      report_id: data.id,
      old_status: null,
      new_status: 'submitted',
      changed_by: 'system',
      note: 'Report submitted by resident',
    });

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/reports]', err);
    return NextResponse.json({ data: null, error: 'Failed to create report' }, { status: 500 });
  }
}
