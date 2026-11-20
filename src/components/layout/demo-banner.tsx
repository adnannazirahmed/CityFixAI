'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Compass, RotateCcw, ArrowRight } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { resetDemo } from '@/lib/demo/browser-store';

// Rendered by the root layout only when IS_DEMO. Its height must match
// --demo-banner-h (set on <html> in src/app/layout.tsx), which the admin shell uses.

type GuideStep = { href: string; label: string; tip: string };

const GUIDE_AFTER_REPORT: GuideStep[] = [
  { href: '/chat', label: 'Chat to report', tip: 'Switch the language to Español and report an issue conversationally.' },
  { href: '/map', label: 'Issue map', tip: 'Find your new report among the open issues across Worcester.' },
  { href: '/leaderboard', label: 'Leaderboard', tip: 'See your contributor score and badges next to the sample residents.' },
  { href: '/admin', label: 'Admin dashboard', tip: 'Use "Enter demo dashboard" for one-click login, then scan the priority queue.' },
  { href: '/admin/reports', label: 'Manage reports', tip: 'Change a report’s status. Resolving your own report earns you points.' },
  { href: '/admin/analytics', label: 'Analytics', tip: 'Explore the equity heatmap, trends and category breakdowns.' },
];

interface DemoBannerProps {
  /** What the demo's AI results are, derived from the saved analyses' `source` fields. */
  aiNote: string;
  /** Guide tip for /report, derived the same way. */
  reportTip: string;
}

export function DemoBanner({ aiNote, reportTip }: DemoBannerProps) {
  const [open, setOpen] = useState(false);
  const guide: GuideStep[] = [
    { href: '/report', label: 'Report an issue', tip: reportTip },
    ...GUIDE_AFTER_REPORT,
  ];

  function handleReset() {
    resetDemo();
    window.location.reload();
  }

  return (
    <div
      role="region"
      aria-label="Demo notice"
      className="relative z-[60] flex h-10 items-center gap-3 bg-gray-950 px-3 text-xs text-gray-300 sm:px-4"
    >
      <p className="min-w-0 flex-1 truncate">
        <span className="font-semibold text-amber-300">Portfolio demo</span>
        <span className="hidden md:inline">
          {' '}· Sample data for Worcester, MA · {aiNote} · Your changes stay in this browser.
        </span>
      </p>

      <div className="flex shrink-0 items-center gap-1.5">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1.5 rounded-md bg-white/10 px-2.5 font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <Compass className="h-3.5 w-3.5" />
              Guide
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl sm:w-full">
            <DialogHeader>
              <DialogTitle>Tour the demo</DialogTitle>
              <DialogDescription>
                Everything runs on sample data for Worcester, MA. {aiNote}. Anything you submit
                or change is saved only in this browser.
              </DialogDescription>
            </DialogHeader>
            <ol className="space-y-1">
              {guide.map((step, i) => (
                <li key={step.href}>
                  <Link
                    href={step.href}
                    onClick={() => setOpen(false)}
                    className="group flex gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        {step.label}
                        <span className="font-mono text-xs font-normal text-gray-400">{step.href}</span>
                        <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-blue-600" />
                      </span>
                      <span className="mt-0.5 block text-sm text-gray-500">{step.tip}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </DialogContent>
        </Dialog>

        <button
          type="button"
          onClick={handleReset}
          title="Clear your reports, status changes and score from this browser"
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset demo</span>
          <span className="sm:hidden">Reset</span>
        </button>
      </div>
    </div>
  );
}
