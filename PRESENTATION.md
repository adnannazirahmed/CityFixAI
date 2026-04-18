# CityFix AI — Hackathon Presentation
**Theme: AI for Community**
**Total time: ~8–10 minutes + Q&A**

---

## PERSON 1 — The Problem & Vision (~3 min)

### Slide: Hook
> "Every day, thousands of potholes go unfixed, streetlights stay broken, and sidewalks remain dangerous — not because cities don't care, but because they don't know."

### Slide: The Problem
- City infrastructure issues affect everyone, but reporting them is broken
- Current process: call a hotline, fill a long web form, hope someone sees it
- Reports are vague, unverified, and impossible to prioritize
- City staff waste time triaging low-priority issues while critical ones sit ignored
- Residents in lower-income neighborhoods are disproportionately underserved

### Slide: Who Suffers
| Resident | City Official |
|---|---|
| No feedback after reporting | Hundreds of reports with no context |
| Can't tell if anyone is acting | No way to prioritize by urgency |
| Reporting feels pointless | Manual classification wastes staff time |
| Language barriers | Duplicate reports clog the queue |

### Slide: Our Insight
> The missing piece isn't effort — it's intelligence.
> What if every report came pre-analyzed, prioritized, and verified by AI — the moment it was submitted?

---

## PERSON 2 — The AI & Technology (~3–4 min)

### Slide: Introducing CityFix AI
- A civic issue reporting platform powered by **GPT-4o Vision**
- Residents report in seconds. AI does the rest.
- City officials get a real-time, pre-prioritized dashboard

### Slide: How It Works (Resident Side)
1. Open the app → pick GPS location or type address with live autocomplete
2. Upload a photo of the issue + describe it in any of **8 languages**
3. GPT-4o **visually analyzes** the photo — classifies the issue, detects if the photo matches the description
4. AI returns: category, severity, urgency score, impact score, priority score, reasoning, and recommended action
5. Resident reviews the AI analysis and submits in one tap

### Slide: The AI Engine (GPT-4o Vision)
- **Visual classification** — AI looks at the photo, not just the description
- **Mismatch detection** — if someone uploads a photo of trash but writes "pothole," AI catches it and flags it
- **Context-aware severity** — AI knows it's winter rush hour on a weekday and adjusts urgency accordingly (ice on a sidewalk at 8am is more urgent than the same crack at midnight in summer)
- **Confidence scoring** — every analysis comes with a visual confidence score

### Slide: The Admin Dashboard (AI for Officials)
- Real-time map of all open issues, color-coded by priority
- **AI Neighborhood Insight Panel** — GPT-4o reads live report data and writes a situation report: *"12 potholes in the Canal District remain unresolved this week, disproportionately affecting the east side. Recommend joint DPW inspection."*
- **Duplicate Cluster Narrative** — when 5 residents report the same intersection, AI explains: *"Repeated reports indicate a structural problem, not isolated incidents"*
- Stats: open reports, resolution rate, average response time, high-priority alerts

### Slide: Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Recharts |
| AI | GPT-4o Vision (OpenAI) |
| Database | Supabase (PostgreSQL + Storage) |
| Maps | Leaflet + OpenStreetMap |
| Geocoding | Nominatim (free, no API key) |
| Deployment | Vercel |

---

## PERSON 3 — Demo, Impact & Future (~2–3 min)

### Slide: Live Demo
> Walk through the app:
> 1. Go to `/report` → select GPS or type address → watch autocomplete
> 2. Upload a photo → type a description → click "Analyze with AI"
> 3. Show the AI result card: title, category, scores, reasoning, recommended action
> 4. Show mismatch detection (upload wrong photo)
> 5. Go to `/admin` → show dashboard, AI insight panel, cluster narratives
> 6. Show leaderboard at `/leaderboard`

### Slide: User Scoring & Gamification
- Every resident earns an **activity score** (reports submitted, resolved) and **accuracy score** (how often their photo matches their description)
- **7 badges**: First Reporter, Accurate Reporter, Community Champion, etc.
- Public **leaderboard** — turns civic duty into community competition
- Encourages quality reporting: accurate photos score higher

### Slide: Impact
| Metric | What It Solves |
|---|---|
| AI pre-classification | Eliminates manual triage for city staff |
| Priority scoring | Critical issues rise to the top automatically |
| Duplicate clustering | Reduces noise by grouping same-location reports |
| Multilingual support | Removes language barriers for immigrant communities |
| Neighborhood equity tracking | Flags underserved areas getting fewer resolutions |

### Slide: Why AI is Core — Not a Gimmick
- Without AI: a form that submits text to a spreadsheet
- With AI: every report is **verified, classified, scored, and explained** before a human sees it
- The city gets structured intelligence, not raw complaints
- AI doesn't replace city workers — it makes them 10x more effective

### Slide: Future Roadmap
- Email/SMS/Slack notifications to city officials for critical reports
- Integration with city work order systems (311 APIs)
- Predictive maintenance: AI flags areas likely to have issues based on history
- Mobile native app (React Native)
- Multi-city deployment

### Slide: Closing
> "CityFix AI turns every resident into a civic sensor and every city official into a data-informed decision maker. Communities shouldn't have to fight to be heard — they should just have to point and click."

---

## POTENTIAL QUESTIONS & ANSWERS

### Technical Questions

**Q: Why GPT-4o instead of training your own model?**
A: Training a custom vision model requires thousands of labeled images per category and months of work. GPT-4o is already world-class at visual understanding, gives us natural language reasoning, handles all categories without retraining, and can be updated with better prompts instantly. For a civic tool that needs to explain its decisions to city officials, GPT-4o's reasoning output is actually a feature.

**Q: How does mismatch detection work exactly?**
A: The system prompt instructs GPT-4o to classify based on what it visually sees, not what the description says. If they differ, it sets `mismatch_detected: true` and writes a `mismatch_note` explaining what the photo actually shows vs. what was described. This is enforced as the primary directive in the prompt — before category, before scores.

**Q: What happens if the AI misclassifies something?**
A: The AI shows its confidence score and reasoning to the resident before they submit. If it's wrong, the resident can go back and fix the description or photo. City officials can also re-classify from the admin dashboard. Accuracy scores in the leaderboard also discourage intentional misuse.

**Q: How does context-aware severity work?**
A: Before calling GPT-4o, we build a context string with the current time of day (rush hour vs. midnight), season (winter vs. summer), and day type (weekday vs. weekend). This is injected into the prompt so GPT-4o can reason about it — a broken streetlight at 8pm rush hour on a winter weekday scores higher than the same issue at noon on a summer Sunday.

**Q: Is user data private?**
A: Residents are identified by an anonymous UUID stored in localStorage — no login, no email, no personal data collected. Photos are stored in Supabase Storage with no PII attached. Location is only used for the report and is not tracked over time.

**Q: How does duplicate detection work?**
A: Reports within a configurable radius (e.g. 100 meters) of the same category are grouped into a cluster. Cluster size boosts the priority score of all reports in it, and GPT-4o generates a narrative explaining the pattern.

---

### Product/Business Questions

**Q: Could this work for other cities besides Worcester?**
A: Absolutely. Worcester is hardcoded as the demo default, but the system is fully city-agnostic. The geocoding uses OpenStreetMap which covers the entire world. The AI categories cover universal infrastructure issues. Deploying for a new city is a configuration change, not a code change.

**Q: How do city officials get notified right now?**
A: In the current MVP, officials check the admin dashboard. The next feature on our roadmap is automated email/Slack/SMS alerts for any report that scores above a critical threshold, with the AI summary already included in the notification.

**Q: What's the business model?**
A: SaaS for municipalities — charge cities a monthly subscription based on population or report volume. The resident-facing app is always free. Cities save money by reducing manual triage time and resolving issues faster before they escalate into lawsuits or infrastructure damage.

**Q: Why would residents bother reporting if they don't know anyone is watching?**
A: Two reasons. First, we show them the AI analysis immediately — they get real value from the app before anyone reviews it. Second, the scoring and leaderboard create community status. Being known as the top reporter in your neighborhood is a real motivator. We make civic duty feel like contribution, not bureaucracy.

**Q: How do you prevent spam or fake reports?**
A: Photos are required — you can't submit text-only. The AI detects mismatches between photos and descriptions, which penalizes accuracy scores. Repeated low-accuracy reports from the same user drop their score and badge level. In a production version, rate limiting and account-level flags would add another layer.

---

### Impact Questions

**Q: How is this different from existing 311 apps?**
A: Traditional 311 apps are digital forms — they collect text and pass it to a human. CityFix AI adds a full intelligence layer: every report is automatically classified, scored, verified by vision AI, checked for duplicates, and explained before any human sees it. Officials don't get inbox items — they get a prioritized, AI-curated action queue.

**Q: How does this address equity?**
A: The Neighborhood Equity panel on the admin dashboard tracks which neighborhoods have the most unresolved reports relative to total submissions. Areas with high unresolved ratios are flagged as equity concerns — making structural neglect visible in a way that a spreadsheet never would.

**Q: Did AI actually contribute to this, or could you do it without AI?**
A: Without AI, this is just a form. AI is what makes the data actionable. It classifies 11 issue types without any rule writing. It verifies photos to prevent fraud. It scores urgency using contextual reasoning no rule system could replicate. It writes situation reports for officials that would otherwise require a data analyst. The entire value proposition — intelligent triage — is AI.
