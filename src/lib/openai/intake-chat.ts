import OpenAI from 'openai';
import { findCategoryByKeywords, SEECLICKFIX_CATEGORIES } from '@/data/seeclickfix-categories';
import type { SeeClickFixCategory, Department } from '@/data/seeclickfix-categories';
import type { IssueCategory } from '@/types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IntakeData {
  title: string;
  description_en: string;      // formal English report for city staff
  category: IssueCategory;
  seeclickfix_id: string;
  seeclickfix_label: string;
  department: Department;
  sla_hours: number;
  auto_escalate: boolean;
  detected_language: string;
  original_description: string;
}

export interface ChatResponse {
  reply: string;
  language: string;
  state: 'greeting' | 'gathering' | 'confirming' | 'complete';
  intake?: IntakeData;
}

// ─── Category list for system prompt ──────────────────────────────────────────
const CATEGORY_LIST = SEECLICKFIX_CATEGORIES
  .map(c =>
    `- ${c.id}: ${c.label} → ${c.department}${c.auto_escalate ? ' ⚠️ EMERGENCY' : ''} (${c.sla_hours}h SLA)`
  )
  .join('\n');

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish (Español)',
  pt: 'Portuguese (Português)',
  fr: 'French (Français)',
  zh: 'Chinese (中文)',
  ar: 'Arabic (العربية)',
  vi: 'Vietnamese (Tiếng Việt)',
  so: 'Somali (Soomaali)',
};

// ─── System prompt (language-aware) ───────────────────────────────────────────
function buildSystemPrompt(language: string): string {
  const langName = LANGUAGE_NAMES[language] ?? 'English';
  return `You are CityFix AI, a friendly civic issue reporting assistant for Worcester, MA.

GOAL: Help residents report city problems conversationally. Gather (1) what the issue is and (2) where it is.

LANGUAGE RULES:
- The resident has selected ${langName} as their preferred language
- Respond ONLY in ${langName} for ALL conversational replies
- Generate "title" and "description_en" in English (for city staff records)
- Always set the "language" field to "${language}"

CONVERSATION FLOW:
1. State "greeting" — welcome in ${langName}, ask them to describe the issue
2. State "gathering" — identify category; if location is missing, ask for it
3. State "confirming" — have category + location; summarize and ask for confirmation
4. State "complete" — user confirmed; return final intake data

CATEGORIES (use the id field exactly):
${CATEGORY_LIST}

RESPONSE FORMAT — return ONLY valid JSON, no other text:
{
  "reply": "<response in ${langName}, 1-3 sentences>",
  "language": "${language}",
  "state": "<greeting|gathering|confirming|complete>",
  "intake": {
    "title": "<short English civic title, max 80 chars>",
    "description_en": "<formal English report for city staff, 2-4 sentences>",
    "category": "<one of: pothole|broken_streetlight|damaged_sidewalk|road_obstruction|trash_overflow|illegal_dumping|broken_sign|accessibility_hazard|flooding|graffiti|other>",
    "seeclickfix_id": "<id from list above>",
    "seeclickfix_label": "<human-readable label>",
    "department": "<DPW|Parks|Water|Traffic|Sanitation|Police|Housing|Transit|General>",
    "sla_hours": <number>,
    "auto_escalate": <boolean>,
    "detected_language": "<full language name, e.g. Spanish>",
    "original_description": "<resident's own words, verbatim>"
  }
}
Include "intake" only when state is "confirming" or "complete".
Keep replies concise and warm.`;
}

// ─── Fallback scripted responses (demo mode / no OpenAI key) ──────────────────
function buildFallbackIntake(cat: SeeClickFixCategory, location: string, lang: string, original: string): IntakeData {
  const langLabel = LANGUAGE_NAMES[lang]?.split(' ')[0] ?? 'English';
  return {
    title: `${cat.label} – ${location.slice(0, 40)}`,
    description_en: `Resident reported a ${cat.label.toLowerCase()} at ${location}. Reported via CityFix AI in ${langLabel}. Auto-classified and routed to ${cat.department} Department (SLA: ${cat.sla_hours}h).`,
    category: cat.internal_category,
    seeclickfix_id: cat.id,
    seeclickfix_label: cat.label,
    department: cat.department,
    sla_hours: cat.sla_hours,
    auto_escalate: cat.auto_escalate,
    detected_language: langLabel,
    original_description: original,
  };
}

function generateFallbackResponse(messages: ChatMessage[], language: string): ChatResponse {
  const userMessages = messages.filter(m => m.role === 'user');
  const count = userMessages.length;

  // Greeting replies per language
  const greetings: Record<string, string> = {
    en: "Hi! I'm CityFix AI. Describe any city problem — pothole, broken light, water leak, or anything else — and I'll report it for you.",
    es: '¡Hola! Soy CityFix AI. Describe cualquier problema en la ciudad — bache, luz rota, fuga de agua, etc. — y lo reportaré por ti.',
    pt: 'Olá! Sou o CityFix AI. Descreva qualquer problema na cidade — buraco, luz quebrada, vazamento — e eu farei o registro.',
    fr: "Bonjour ! Je suis CityFix AI. Décrivez tout problème urbain — nid-de-poule, lampe cassée, fuite d'eau — et je le signalerai.",
    zh: '您好！我是 CityFix AI。请描述任何城市问题——坑洼、路灯损坏、漏水等——我来帮您报告。',
    ar: 'مرحباً! أنا CityFix AI. صف أي مشكلة في المدينة — حفرة، ضوء مكسور، تسرب مياه — وسأبلغ عنها.',
    vi: 'Xin chào! Tôi là CityFix AI. Hãy mô tả bất kỳ vấn đề nào trong thành phố và tôi sẽ báo cáo cho bạn.',
    so: 'Salaam! Waxaan ahay CityFix AI. Sharax dhibaatada magaalada — dalool, nalka jabay, biyo daadanaya — waxaan u gudbin doonaa.',
  };

  if (count === 0) {
    return { reply: greetings[language] ?? greetings.en, language, state: 'greeting' };
  }

  const firstMsg = userMessages[0].content;
  const lastMsg = userMessages[count - 1].content;
  const cat = findCategoryByKeywords(firstMsg + ' ' + lastMsg);

  if (count === 1) {
    const replies: Record<string, string> = {
      en: `I can see you're reporting a "${cat.label}" issue. Could you tell me the exact location — street name, intersection, or nearby landmark?`,
      es: `Entiendo que estás reportando un problema de "${cat.label}". ¿Puedes indicar la ubicación exacta?`,
      pt: `Entendi que você está reportando um problema de "${cat.label}". Pode me dizer a localização exata?`,
      fr: `Je vois que vous signalez un problème de "${cat.label}". Pouvez-vous indiquer l'adresse exacte?`,
      zh: `我看到您报告的是"${cat.label}"问题。能告诉我具体位置吗？`,
      ar: `أرى أنك تبلغ عن مشكلة "${cat.label}". هل يمكنك ذكر الموقع بالضبط؟`,
      vi: `Tôi thấy bạn đang báo cáo vấn đề "${cat.label}". Bạn có thể cho biết địa điểm cụ thể không?`,
      so: `Waxaan araa inaad soo gudbinaysid dhibaatada "${cat.label}". Ma noo sheegi kartaa goobta saxda ah?`,
    };
    return { reply: replies[language] ?? replies.en, language, state: 'gathering' };
  }

  if (count === 2) {
    const location = lastMsg;
    const slaText = cat.sla_hours < 24 ? `${cat.sla_hours} hours` : `${Math.round(cat.sla_hours / 24)} days`;
    const escalateNote = cat.auto_escalate ? ' ⚠️ EMERGENCY.' : '';
    const replies: Record<string, string> = {
      en: `Got it! Filing a "${cat.label}" report to ${cat.department} (SLA: ${slaText}).${escalateNote} Ready to submit?`,
      es: `¡Entendido! Reporte de "${cat.label}" al Dpto. ${cat.department} (plazo: ${slaText}).${escalateNote} ¿Lo enviamos?`,
      pt: `Perfeito! Registro de "${cat.label}" no Dpto. ${cat.department} (prazo: ${slaText}).${escalateNote} Posso enviar?`,
      fr: `Compris ! Signalement "${cat.label}" au ${cat.department} (délai: ${slaText}).${escalateNote} Prêt à soumettre?`,
      zh: `明白！将"${cat.label}"报告提交给${cat.department}部门（SLA: ${slaText}）。${escalateNote}准备提交吗？`,
      ar: `حسناً! سأرسل تقرير "${cat.label}" إلى ${cat.department} (المدة: ${slaText}).${escalateNote} هل أنت مستعد؟`,
      vi: `Được rồi! Báo cáo "${cat.label}" tới ${cat.department} (SLA: ${slaText}).${escalateNote} Sẵn sàng gửi chưa?`,
      so: `Waa hagaag! Waxaan u gudbinayaa "${cat.label}" ${cat.department} (SLA: ${slaText}).${escalateNote} Diyaar ma u tahay?`,
    };
    return {
      reply: replies[language] ?? replies.en,
      language,
      state: 'confirming',
      intake: buildFallbackIntake(cat, location, language, firstMsg),
    };
  }

  const replies: Record<string, string> = {
    en: '✅ Report submitted! City staff have been notified. Thank you for helping improve Worcester.',
    es: '✅ ¡Reporte enviado! El personal de la ciudad ha sido notificado. ¡Gracias!',
    pt: '✅ Relatório enviado! A equipe da cidade foi notificada. Obrigado!',
    fr: '✅ Signalement envoyé! Le personnel municipal a été notifié. Merci!',
    zh: '✅ 报告已提交！城市工作人员已收到通知。谢谢！',
    ar: '✅ تم إرسال التقرير! تم إخطار موظفي المدينة. شكراً!',
    vi: '✅ Đã gửi báo cáo! Nhân viên thành phố đã được thông báo. Cảm ơn!',
    so: '✅ Warbixinta waa la gudbiyey! Shaqaalaha magaaladu waa la ogeysiiyey. Mahadsanid!',
  };
  return {
    reply: replies[language] ?? replies.en,
    language,
    state: 'complete',
    intake: buildFallbackIntake(cat, userMessages[1]?.content ?? 'unknown location', language, firstMsg),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function processMessage(messages: ChatMessage[], language = 'en'): Promise<ChatResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return generateFallbackResponse(messages, language);
  }

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(language) },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    return JSON.parse(raw) as ChatResponse;
  } catch (err) {
    console.error('[intake-chat] OpenAI failed, using fallback:', err);
    return generateFallbackResponse(messages, language);
  }
}
