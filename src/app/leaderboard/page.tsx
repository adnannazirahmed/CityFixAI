'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Star, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';
import { BADGES } from '@/lib/user-store';
import type { UserScore } from '@/lib/user-store';

const RANK_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
const RANK_BG = ['bg-yellow-50 border-yellow-200', 'bg-gray-50 border-gray-200', 'bg-amber-50 border-amber-200'];

function getRankLabel(score: number) {
  if (score >= 200) return { label: 'City Champion', color: 'bg-yellow-100 text-yellow-700' };
  if (score >= 100) return { label: 'Top Contributor', color: 'bg-blue-100 text-blue-700' };
  if (score >= 50)  return { label: 'Active Reporter', color: 'bg-green-100 text-green-700' };
  return { label: 'New Reporter', color: 'bg-gray-100 text-gray-600' };
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('cityfix_user_id') : null
  );

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => { setLeaders(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container py-12 max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <Trophy className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900">Community Leaderboard</h1>
          <p className="text-gray-500">Top reporters helping make Worcester better</p>
        </div>

        {/* Scoring explainer */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold text-blue-700 mb-2">How scoring works</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
              <div className="flex items-center gap-1.5"><Star className="h-3 w-3" /> +10 pts per report submitted</div>
              <div className="flex items-center gap-1.5"><Trophy className="h-3 w-3" /> +25 pts when report resolved</div>
              <div className="flex items-center gap-1.5"><Target className="h-3 w-3" /> Accuracy bonus for clear photos</div>
              <div className="flex items-center gap-1.5"><Medal className="h-3 w-3" /> Badges unlock at milestones</div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : leaders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reporters yet</p>
              <p className="text-sm mt-1">Be the first to submit a report!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaders.map((user, i) => {
              const isMe = user.user_id === myId;
              const rankLabel = getRankLabel(user.total_score);
              const earnedBadges = BADGES.filter(b => user.badges.includes(b.id));
              const borderClass = i < 3 ? RANK_BG[i] : isMe ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200';

              return (
                <Card key={user.user_id} className={`border-2 ${borderClass}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-4">
                      {/* Rank number */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-lg ${i < 3 ? RANK_COLORS[i] : 'text-gray-400'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {isMe ? 'You' : `Reporter #${user.user_id.slice(-4)}`}
                          </p>
                          {isMe && <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">YOU</Badge>}
                          <Badge className={`text-[10px] px-1.5 py-0 ${rankLabel.color}`}>{rankLabel.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span>{user.reports_submitted} reports</span>
                          <span>{user.reports_resolved} resolved</span>
                          <span>{user.accuracy_score}% accuracy</span>
                        </div>
                        {earnedBadges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {earnedBadges.map(b => (
                              <span key={b.id} title={b.label} className="text-sm">{b.emoji}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-black ${i < 3 ? RANK_COLORS[i] : 'text-gray-700'}`}>
                          {user.total_score}
                        </p>
                        <p className="text-[10px] text-gray-400">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/report" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
              Report an Issue <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
