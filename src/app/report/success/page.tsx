'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { CheckCircle2, MapPin, ArrowRight, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { UserScoreCard } from '@/components/shared/user-score-card';
import type { UserScore } from '@/lib/user-store';

function SuccessContent() {
  const params = useSearchParams();
  const uid = params.get('uid');
  const [userScore, setUserScore] = useState<UserScore | null>(null);

  useEffect(() => {
    if (!uid) return;
    fetch(`/api/users/${uid}`)
      .then(r => r.json())
      .then(d => { if (d.data) setUserScore(d.data); })
      .catch(() => {});
  }, [uid]);

  // Points earned this submission: 10 base activity
  const pointsEarned = userScore ? Math.min(10, userScore.activity_score) : 10;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container py-16 max-w-lg mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">Report Submitted!</h1>
            <p className="text-gray-500">
              Thank you for helping make Worcester better. Your report has been analyzed by AI
              and added to the city's priority queue.
            </p>
          </div>
        </div>

        {/* User score card */}
        {userScore && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-gray-700">Your Contributor Score</p>
            </div>
            <UserScoreCard score={userScore} pointsEarned={pointsEarned} />
          </div>
        )}

        <Card className="text-left">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-gray-900">What happens next?</h3>
            {[
              { icon: Clock, text: 'City staff will review your report within 24–48 hours' },
              { icon: CheckCircle2, text: 'High-priority issues are escalated immediately' },
              { icon: MapPin, text: 'Your report will appear on the public issue map' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 text-sm text-gray-600">
                <Icon className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Link href="/leaderboard">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2">
              <Trophy className="h-4 w-4" /> View Leaderboard
            </Button>
          </Link>
          <Link href="/map">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
              View Issues on Map <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/report">
            <Button variant="outline" className="w-full">Report Another Issue</Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ReportSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
