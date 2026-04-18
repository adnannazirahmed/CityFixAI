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
    description: 'Report in English, Español, Português, or any language. AI routes your report to the right city department automatically.',
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    icon: Brain,
    title: 'AI-Powered Classification',
    description: 'Upload a photo and describe the issue. Our AI classifies it across 35 SeeClickFix categories, assesses severity, and generates a formal civic report.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Zap,
    title: 'Smart Department Routing',
    description: '"Water main break" → Water Dept. emergency (4h SLA). "Tree trimming" → Parks queue (14d SLA). AI decides automatically.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: TrendingUp,
    title: 'Smart Priority Scoring',
    description: 'Every report gets an urgency score, impact score, and priority score based on location, severity, and community impact.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Users,
    title: 'Duplicate Detection',
    description: 'Automatically clusters similar reports in the same area. City staff see the full picture, not just individual complaints.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: BarChart3,
    title: 'Equity Heatmap',
    description: 'Identify neighborhoods with disproportionately high unresolved issues. Ensure every community gets fair attention.',
    color: 'bg-green-100 text-green-600',
  },
];

const stats = [
  { value: '95%', label: 'Faster classification vs manual' },
  { value: '3x', label: 'More reports resolved per week' },
  { value: '2.4x', label: 'Equity improvement in underserved areas' },
  { value: '<5s', label: 'Average AI analysis time' },
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 text-white">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />

        <div className="relative container py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Powered by GPT-4o Vision</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Report once.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Route smart.
              </span>{' '}
              Fix faster.
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              CityFix AI turns resident reports into intelligent, prioritized work orders —
              so cities fix the <em>right</em> problems first.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/chat">
                <Button size="xl" className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-900/50">
                  <MessageSquare className="h-5 w-5" />
                  Chat to Report
                </Button>
              </Link>
              <Link href="/report">
                <Button size="xl" className="bg-transparent border border-gray-500 text-white hover:bg-white/10 gap-2">
                  Report an Issue
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="xl" variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800 gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>

            {/* Issue type pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {issueTypes.map((type) => (
                <span
                  key={type.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm text-gray-300"
                >
                  {type.icon} {type.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-b bg-white py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-black text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-100 text-blue-700">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              From photo to priority — in seconds
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Residents report. AI analyzes. City staff act. It's that simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Resident Reports',
                description: 'Upload a photo, add location, write a quick description. Done in under 60 seconds.',
                color: 'text-blue-600 bg-blue-100',
                icon: MapPin,
              },
              {
                step: '02',
                title: 'AI Analyzes',
                description: 'GPT-4o Vision classifies the issue, scores urgency and impact, checks for duplicates, and generates a formal civic report.',
                color: 'text-purple-600 bg-purple-100',
                icon: Brain,
              },
              {
                step: '03',
                title: 'City Acts',
                description: 'Admin dashboard shows prioritized issues, equity insights, and recommended actions. Cities fix the right things first.',
                color: 'text-green-600 bg-green-100',
                icon: CheckCircle2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative">
                  <Card className="text-center p-2 h-full hover:shadow-md transition-shadow">
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="text-5xl font-black text-gray-100 mb-2 select-none">{item.step}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-purple-100 text-purple-700">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Everything cities need to respond smarter
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-md transition-shadow group">
                  <CardContent className="pt-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Example AI output ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-blue-950 to-gray-950 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
                AI Output Example
              </Badge>
              <h2 className="text-3xl font-black">
                What city staff actually see
              </h2>
            </div>

            <Card className="bg-gray-900 border-gray-800 text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">🔴 Critical Priority</Badge>
                  <span className="text-xs text-gray-500">Auto-generated by AI</span>
                </div>
                <h3 className="font-bold text-lg">Broken Streetlight Near Elementary School</h3>
                <p className="text-sm text-gray-300">
                  Streetlight completely non-functional at the corner of 5th Ave and Oak St, located adjacent to
                  Lincoln Elementary School. Nighttime visibility is severely compromised, creating a high-risk
                  environment for students and pedestrians.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Urgency', value: 95, color: 'text-red-400' },
                    { label: 'Impact', value: 90, color: 'text-orange-400' },
                    { label: 'Priority', value: 93, color: 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg bg-gray-800 p-3 text-center">
                      <div className={`text-3xl font-black ${color}`}>{value}</div>
                      <div className="text-xs text-gray-400 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-red-900/30 border border-red-700/30 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-300 mb-1">Recommended Action</p>
                      <p className="text-sm text-red-200">
                        EMERGENCY repair required within 24 hours. Install temporary lighting immediately.
                        School proximity makes this a critical safety priority.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  Analysis completed in 2.4 seconds
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-black text-gray-900">
            Ready to fix your city smarter?
          </h2>
          <p className="text-gray-500">
            Join the demo and see how CityFix AI helps communities get the attention they deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
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
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t bg-gray-950 text-gray-400 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="CityFix AI" className="h-8 w-8 object-contain" />
            <span className="font-black text-white text-sm">CityFix <span className="text-blue-400">AI</span></span>
            <span className="text-xs">· Report once. Route smart. Fix faster.</span>
          </div>
          <p className="text-xs">Built for hackathon demo · Powered by GPT-4o + Next.js + Supabase</p>
        </div>
      </footer>
    </div>
  );
}
