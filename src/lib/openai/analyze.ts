import OpenAI from 'openai';
import { aiEnabled } from '@/lib/demo/config';
import {
  ANALYSIS_MODEL,
  ANALYSIS_REQUEST_OPTIONS,
  buildAnalysisMessages,
  parseAnalysisResponse,
} from '@/lib/openai/analysis-shared';
import type { AIAnalysisResult, IssueCategory } from '@/types';

// Prompt, schema, context and parsing live in ./analysis-shared.ts so the
// sample-analysis generator (scripts/demo) uses exactly the same ones.

// ─── Fallback demo analysis (used if API key not configured) ──────────────────
function generateFallbackAnalysis(description: string): AIAnalysisResult {
  const lower = description.toLowerCase();

  let category: IssueCategory = 'other';
  let urgency = 50;
  let impact = 50;

  if (lower.includes('pothole') || lower.includes('hole') || lower.includes('road')) {
    category = 'pothole'; urgency = 72; impact = 68;
  } else if (lower.includes('light') || lower.includes('dark') || lower.includes('lamp')) {
    category = 'broken_streetlight'; urgency = 78; impact = 74;
  } else if (lower.includes('sidewalk') || lower.includes('walkway') || lower.includes('pavement')) {
    category = 'damaged_sidewalk'; urgency = 62; impact = 58;
  } else if (lower.includes('trash') || lower.includes('garbage') || lower.includes('waste')) {
    category = 'trash_overflow'; urgency = 55; impact = 52;
  } else if (lower.includes('dump') || lower.includes('dumping')) {
    category = 'illegal_dumping'; urgency = 65; impact = 60;
  } else if (lower.includes('flood') || lower.includes('water')) {
    category = 'flooding'; urgency = 80; impact = 75;
  } else if (lower.includes('sign')) {
    category = 'broken_sign'; urgency = 60; impact = 55;
  } else if (lower.includes('wheelchair') || lower.includes('access')) {
    category = 'accessibility_hazard'; urgency = 82; impact = 78;
  }

  const priority = Math.round(urgency * 0.6 + impact * 0.4);

  return {
    category,
    severity: urgency >= 85 ? 'critical' : urgency >= 65 ? 'high' : urgency >= 40 ? 'medium' : 'low',
    title: `${category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Reported`,
    summary: `A civic issue has been reported: ${description.slice(0, 200)}. This has been classified and scored automatically.`,
    urgency_score: urgency,
    impact_score: impact,
    priority_score: priority,
    reasoning: `Based on the reported issue type and standard civic impact criteria, this has been assigned a priority score of ${priority}/100.`,
    recommended_action: urgency >= 75
      ? 'Prioritize inspection within 24–48 hours.'
      : urgency >= 55
      ? 'Schedule inspection within the next week.'
      : 'Add to routine maintenance schedule.',
    confidence: 60,
    mismatch_detected: false,
  };
}

// ─── Main analysis function ───────────────────────────────────────────────────
export async function analyzeReport(
  description: string,
  imageUrl?: string | null,
  lat?: number | null,
  lng?: number | null,
): Promise<AIAnalysisResult> {
  if (!aiEnabled()) {
    return generateFallbackAnalysis(description || 'civic issue reported');
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const response = await client.chat.completions.create({
      model: ANALYSIS_MODEL,
      messages: buildAnalysisMessages(description, imageUrl, lat, lng),
      ...ANALYSIS_REQUEST_OPTIONS,
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    console.log('[OpenAI] Raw response:', raw);
    return parseAnalysisResponse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[OpenAI] Analysis failed:', msg);
    throw new Error(`OpenAI failed: ${msg}`);
  }
}
