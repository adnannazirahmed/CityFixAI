// Shared by the app (src/lib/openai/analyze.ts) and the sample-analysis generator
// (scripts/demo/generate-sample-analyses.ts), so both use exactly the same prompt,
// request settings and validation.
//
// Keep this module free of server-only imports and of '@/…' runtime imports: the
// generator runs it with tsx outside Next.js. (Type-only imports are erased.)

import { z } from 'zod';
import type OpenAI from 'openai';
import type { AIAnalysisResult } from '@/types';

// ─── Zod schema for structured AI output ─────────────────────────────────────
export const AnalysisSchema = z.object({
  category: z.enum([
    'pothole', 'broken_streetlight', 'damaged_sidewalk', 'road_obstruction',
    'trash_overflow', 'illegal_dumping', 'broken_sign', 'accessibility_hazard',
    'flooding', 'graffiti', 'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().max(120),
  summary: z.string().max(500),
  urgency_score: z.number().int().min(0).max(100),
  impact_score: z.number().int().min(0).max(100),
  priority_score: z.number().int().min(0).max(100),
  reasoning: z.string().max(600),
  recommended_action: z.string().max(300),
  confidence: z.number().int().min(0).max(100),
  mismatch_detected: z.boolean(),
  // GPT often returns null instead of omitting — accept both
  mismatch_note: z.string().max(300).nullish().transform(v => v ?? undefined),
});

// ─── System prompt ────────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `You are a civic issue analysis AI for CityFix AI. Analyze urban infrastructure reports.

CRITICAL: When a photo is provided, classify based on what you VISUALLY SEE in the photo — not what the description claims. If they differ, set mismatch_detected=true.

Categories: pothole | broken_streetlight | damaged_sidewalk | road_obstruction | trash_overflow | illegal_dumping | broken_sign | accessibility_hazard | flooding | graffiti | other

You MUST respond with ONLY this exact JSON structure — no extra text, no nesting, no renamed fields:
{
  "category": "<category from list above>",
  "severity": "<low|medium|high|critical>",
  "title": "<short civic title, max 80 chars>",
  "summary": "<2-3 sentence formal civic summary>",
  "urgency_score": <integer 0-100>,
  "impact_score": <integer 0-100>,
  "priority_score": <integer 0-100>,
  "reasoning": "<1-2 sentences explaining the scores>",
  "recommended_action": "<specific action for city staff>",
  "confidence": <integer 0-100, how certain you are from the visual evidence>,
  "mismatch_detected": <true if photo shows different issue than description, else false>,
  "mismatch_note": "<only include if mismatch_detected is true: explain what photo shows vs what was described>"
}`;

// ─── Request settings ─────────────────────────────────────────────────────────
export const ANALYSIS_MODEL = 'gpt-4o';
export const ANALYSIS_REQUEST_OPTIONS = {
  temperature: 0.2,
  max_tokens: 800,
  response_format: { type: 'json_object' as const },
};

// ─── Context builder ──────────────────────────────────────────────────────────
export function buildContextString(lat?: number | null, lng?: number | null, now = new Date()): string {
  const hour = now.getHours();
  const month = now.getMonth(); // 0-11

  const timeOfDay = hour < 6 ? 'night (midnight–6am)'
    : hour < 9 ? 'early morning rush hour (6–9am)'
    : hour < 12 ? 'morning (9am–noon)'
    : hour < 15 ? 'midday (noon–3pm)'
    : hour < 18 ? 'afternoon (3–6pm)'
    : hour < 21 ? 'evening rush hour (6–9pm)'
    : 'night (9pm–midnight)';

  const season = month <= 1 || month === 11 ? 'winter'
    : month <= 4 ? 'spring'
    : month <= 7 ? 'summer'
    : 'fall';

  const dayType = [0, 6].includes(now.getDay()) ? 'weekend' : 'weekday';

  let locationNote = '';
  if (lat && lng) {
    locationNote = `Location coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Worcester, MA area).`;
  }

  return `Context: ${dayType}, ${timeOfDay}, ${season}. ${locationNote}
Consider: Is this time when pedestrians/children are likely present? Does the season worsen this issue (e.g. ice on damaged sidewalk in winter, flooding in spring)? Are rush hours relevant to road hazards?`;
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export function buildAnalysisMessages(
  description: string,
  imageUrl?: string | null,
  lat?: number | null,
  lng?: number | null,
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
    {
      type: 'text',
      text: `Resident description: "${description || '(none provided)'}"

${buildContextString(lat, lng)}`,
    },
  ];

  if (imageUrl) {
    userContent.push({ type: 'image_url', image_url: { url: imageUrl, detail: 'auto' } });
  }

  userContent.push({ type: 'text', text: 'Return ONLY the JSON object. No explanation before or after.' });

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}

// ─── Response parsing ─────────────────────────────────────────────────────────
/** Parses and validates the model's JSON output. Throws on invalid output. */
export function parseAnalysisResponse(raw: string): AIAnalysisResult {
  const parsed = JSON.parse(raw);
  // Round numeric scores in case GPT returns floats (e.g. 72.5)
  for (const key of ['urgency_score', 'impact_score', 'priority_score', 'confidence'] as const) {
    if (typeof parsed[key] === 'number') parsed[key] = Math.round(parsed[key]);
  }
  return AnalysisSchema.parse(parsed);
}
