import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { ReportForm } from '@/components/forms/report-form';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Brain, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Report an Issue',
  description: 'Report a civic issue in your neighborhood. AI will classify, score, and route it to the right city department.',
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container py-10 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Left: Info panel ──────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Report an Issue</h1>
              <p className="text-gray-500 text-sm mt-1">
                Help your city fix problems faster. AI handles the classification and routing.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: Clock,
                  title: 'Takes under 2 minutes',
                  desc: 'Just a photo, location, and a quick description.',
                  color: 'text-blue-600 bg-blue-50',
                },
                {
                  icon: Brain,
                  title: 'AI does the work',
                  desc: 'Our AI classifies, scores severity, and checks for duplicates.',
                  color: 'text-purple-600 bg-purple-50',
                },
                {
                  icon: CheckCircle2,
                  title: 'City gets notified',
                  desc: 'Your report goes directly into the city\'s priority queue.',
                  color: 'text-green-600 bg-green-50',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-lg bg-white border p-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> CityFix AI is a reporting tool. For emergencies, call{' '}
                <strong>911</strong>. For urgent city services, call{' '}
                <strong>311</strong>.
              </p>
            </div>
          </div>

          {/* ─── Right: Form ───────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <ReportForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
