import OpenAI from 'openai';
import { z } from 'zod';
import type { AIAnalysisResult, IssueCategory } from '@/types';

// ─── Zod schema for structured AI output ─────────────────────────────────────
const AnalysisSchema = z.object({
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
const SYSTEM_PROMPT = `You are a civic issue analysis AI for CityFix AI. Analyze urban infrastructure reports.

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

// ─── Context builder ──────────────────────────────────────────────────────────
function buildContextString(lat?: number | null, lng?: number | null): string {
  const now = new Date();
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

// ─── Main analysis function ───────────────────────────────────────────────────
export async function analyzeReport(
  description: string,
  imageUrl?: string | null,
  lat?: number | null,
  lng?: number | null,
): Promise<AIAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return generateFallbackAnalysis(description || 'civic issue reported');
  }

  const client = new OpenAI({ apiKey });
  const contextString = buildContextString(lat, lng);

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

  userContent.push({
    type: 'text',
    text: `Resident description: "${description || '(none provided)'}"

${contextString}`,
  });

  if (imageUrl) {
    userContent.push({
      type: 'image_url',
      image_url: { url: imageUrl, detail: 'auto' },
    });
  }

  userContent.push({
    type: 'text',
    text: 'Return ONLY the JSON object. No explanation before or after.',
  });

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    console.log('[OpenAI] Raw response:', raw);
    const parsed = JSON.parse(raw);
    // Round numeric scores in case GPT returns floats (e.g. 72.5)
    if (typeof parsed.urgency_score === 'number') parsed.urgency_score = Math.round(parsed.urgency_score);
    if (typeof parsed.impact_score === 'number') parsed.impact_score = Math.round(parsed.impact_score);
    if (typeof parsed.priority_score === 'number') parsed.priority_score = Math.round(parsed.priority_score);
    if (typeof parsed.confidence === 'number') parsed.confidence = Math.round(parsed.confidence);
    const validated = AnalysisSchema.parse(parsed);
    return validated;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[OpenAI] Analysis failed:', msg);
    throw new Error(`OpenAI failed: ${msg}`);
  }
}
