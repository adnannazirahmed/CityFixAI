import Link from 'next/link';
import {
  MapPin, Brain, BarChart3, Shield, ArrowRight, CheckCircle2,
  AlertTriangle, Zap, Users, TrendingUp, Clock, MessageSquare, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';

const features = [
  {
    icon: Globe,
    title: 'Multilingual AI Chat',
    description: 'Report in English, Español, Português, or any of 8 languages. AI routes your report to the right city department automatically.',
    color: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
  },
  {
    icon: Brain,
    title: 'AI-Powered Classification',
    description: 'Upload a photo and describe the issue. GPT-4o Vision classifies it, assesses severity, and generates a formal civic report.',
    color: 'bg-blue-50 text-blue-600 border border-blue-100',
  },
  {
    icon: Zap,
    title: 'Smart Priority Scoring',
    description: 'Every report gets urgency, impact, and priority scores based on location, time of day, season, and community impact.',
    color: 'bg-amber-50 text-amber-600 border border-amber-100',
  },
  {
    icon: TrendingUp,
    title: 'Context-Aware Severity',
    description: 'A broken sidewalk in winter rush hour scores higher than the same crack at midnight in summer. AI reasons about context.',
    color: 'bg-purple-50 text-purple-600 border border-purple-100',
  },
  {
    icon: Users,
    title: 'Duplicate Detection',
    description: 'Automatically clusters similar reports in the same area. City staff see the full picture, not just individual complaints.',
    color: 'bg-orange-50 text-orange-600 border border-orange-100',
  },
  {
    icon: BarChart3,
    title: 'Equity Heatmap',
    description: 'Identify neighborhoods with disproportionately high unresolved issues. Ensure every community gets fair attention.',
    color: 'bg-green-50 text-green-600 border border-green-100',
  },
];

const stats = [
  { value: '95%', label: 'Faster classification vs manual' },
  { value: '3×',  label: 'More reports resolved per week' },
  { value: '2.4×', label: 'Equity improvement in underserved areas' },
  { value: '<5s',  label: 'Average AI analysis time' },
];

const issueTypes = [
  { icon: '🕳️', label: 'Potholes' },
  { icon: '💡', label: 'Broken Streetlights' },
  { icon: '🚶', label: 'Damaged Sidewalks' },
  { icon: '🚧', label: 'Road Obstructions' },
  { icon: '🗑️', label: 'Trash Overflow' },
  { icon: '♻️', label: 'Illegal Dumping' },
  { icon: '🪧', label: 'Broken Signs' },
  { icon: '♿', label: 'Accessibility Hazards' },
];

const steps = [
  {
    step: '01',
    title: 'Resident Reports',
    description: 'Upload a photo, pin your location, add a quick description. Done in under 60 seconds.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100',
    icon: MapPin,
  },
  {
    step: '02',
    title: 'AI Analyzes',
    description: 'GPT-4o Vision classifies the issue, scores urgency and impact, checks for duplicates, and generates a formal civic report.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-100',
    icon: Brain,
  },
  {
    step: '03',
    title: 'City Acts',
    description: 'Admin dashboard shows prioritized issues, equity insights, and AI-generated situation reports. Cities fix the right things first.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100',
    icon: CheckCircle2,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#080e1f] text-white">
        {/* Radial glow behind headline */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080e1f]" />

        <div className="relative container py-28 md:py-40">
          <div className="max-w-4xl mx-auto text-center space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
              </span>
              <span className="text-sm text-blue-300 font-medium tracking-wide">Powered by GPT-4o Vision</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-[72px] font-black leading-[1.05] tracking-[-0.03em]">
              Report once.{' '}
              <span className="text-gradient-blue">Route smart.</span>{' '}
              Fix faster.
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              CityFix AI turns resident reports into intelligent, prioritized work orders —
              so cities fix the <span className="text-white font-medium">right</span> problems first.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/chat">
                <Button size="xl" variant="cityfix" className="gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat to Report
                </Button>
              </Link>
              <Link href="/report">
                <Button size="xl" className="bg-white/10 border border-white/15 text-white hover:bg-white/18 backdrop-blur-sm gap-2">
                  Report an Issue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="xl" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>

            {/* Issue type pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {issueTypes.map((type) => (
                <span
                  key={type.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/8 px-3 py-1 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors cursor-default"
                >
                  {type.icon} {type.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-14">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center space-y-1">
                <div className="text-4xl md:text-5xl font-black tabular-nums text-blue-600 tracking-tight">{stat.value}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/70">
        <div className="container">
          <div className="text-center mb-16 space-y-3">
            <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-semibold tracking-wide uppercase text-[11px]">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              From photo to priority — in seconds
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto text-[15px]">
              Residents report. AI analyzes. City staff act.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative group">
                  {/* Connector line between cards */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-6 h-px bg-gray-200 z-10" />
                  )}
                  <Card className="text-center h-full hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 border-gray-100">
                    <CardContent className="pt-8 pb-7 px-6 space-y-4">
                      <div className="relative mx-auto w-14 h-14">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${item.bg}`}>
                          <Icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <span className={`absolute -top-2 -right-2 text-[10px] font-black ${item.color} bg-white border border-gray-100 rounded-full w-5 h-5 flex items-center justify-center shadow-sm`}>
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16 space-y-3">
            <Badge className="bg-violet-50 text-violet-600 border-violet-100 font-semibold tracking-wide uppercase text-[11px]">
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Everything cities need to respond smarter
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 group border-gray-100"
                >
                  <CardContent className="pt-6 pb-6">
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} transition-transform duration-200 group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Example AI output ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[#080e1f] text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-3">
              <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/25 font-semibold uppercase text-[11px] tracking-wide">
                AI Output Example
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black">
                What city staff actually see
              </h2>
            </div>

            <Card className="bg-[#0f172a] border-white/8 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_24px_64px_rgba(0,0,0,0.4)]">
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <Badge className="bg-red-500/15 text-red-300 border-red-500/25 uppercase text-[10px] tracking-wider font-bold">
                    🔴 Critical Priority
                  </Badge>
                  <span className="text-xs text-gray-500 font-medium">Auto-generated by GPT-4o</span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Broken Streetlight Near Elementary School</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Streetlight completely non-functional at the corner of 5th Ave and Oak St, adjacent to
                    Lincoln Elementary School. Nighttime visibility severely compromised — high-risk environment
                    for students and pedestrians during winter morning commute.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Urgency',  value: 95, color: 'text-red-400' },
                    { label: 'Impact',   value: 90, color: 'text-orange-400' },
                    { label: 'Priority', value: 93, color: 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl bg-white/5 border border-white/8 p-4 text-center">
                      <div className={`text-4xl font-black tabular-nums ${color}`}>{value}</div>
                      <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-semibold">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-red-500/8 border border-red-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-300 mb-1 uppercase tracking-wide">Recommended Action</p>
                      <p className="text-sm text-red-200/80 leading-relaxed">
                        Emergency repair required within 24 hours. Install temporary lighting immediately.
                        School proximity makes this a critical safety priority.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 pt-1">
                  <Clock className="h-3.5 w-3.5" />
                  Analysis completed in 2.4 seconds · Visual confidence: 94/100
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl px-8 py-14">
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-600 shadow-blue">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Ready to fix your city smarter?
            </h2>
            <p className="text-gray-500 text-[15px]">
              Join the demo and see how CityFix AI helps communities get the attention they deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/report">
                <Button size="lg" variant="cityfix" className="gap-2">
                  Report an Issue Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  View Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-900 bg-[#080e1f] text-gray-500 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CityFix AI" className="h-7 w-7 object-contain opacity-90" />
            <span className="font-black text-gray-200 text-sm tracking-tight">
              CityFix <span className="text-blue-400">AI</span>
            </span>
            <span className="text-xs text-gray-600">· Report once. Route smart. Fix faster.</span>
          </div>
          <p className="text-xs text-gray-600">Built for hackathon · Powered by GPT-4o + Next.js + Supabase</p>
        </div>
      </footer>
    </div>
  );
}
