'use client';

import { Trophy, Target, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { UserScore } from '@/lib/user-store';
import { BADGES } from '@/lib/user-store';

interface UserScoreCardProps {
  score: UserScore;
  /** show a +points earned line after submission */
  pointsEarned?: number;
  /** show compact version without breakdown */
  compact?: boolean;
}

const RANK_THRESHOLDS = [
  { min: 200, label: 'City Champion',    color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { min: 100, label: 'Top Contributor',  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  { min: 50,  label: 'Active Reporter',  color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
  { min: 0,   label: 'New Reporter',     color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200' },
];

function getRank(score: number) {
  return RANK_THRESHOLDS.find(r => score >= r.min) ?? RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
}

export function UserScoreCard({ score, pointsEarned, compact = false }: UserScoreCardProps) {
  const rank = getRank(score.total_score);
  const earnedBadges = BADGES.filter(b => score.badges.includes(b.id));
  const nextRank = RANK_THRESHOLDS.find(r => r.min > score.total_score);
  const progressToNext = nextRank
    ? Math.round((score.total_score / nextRank.min) * 100)
    : 100;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${rank.bg}`}>
        <Trophy className={`h-4 w-4 shrink-0 ${rank.color}`} />
        <div className="min-w-0">
          <p className={`text-xs font-bold ${rank.color}`}>{rank.label}</p>
          <p className="text-xs text-gray-500">{score.total_score} pts · {score.reports_submitted} reports</p>
        </div>
        {earnedBadges.slice(0, 3).map(b => (
          <span key={b.id} title={b.label} className="text-base">{b.emoji}</span>
        ))}
      </div>
    );
  }

  return (
    <Card className={`border-2 ${rank.bg}`}>
      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className={`h-5 w-5 ${rank.color}`} />
            <div>
              <p className={`font-bold text-sm ${rank.color}`}>{rank.label}</p>
              <p className="text-xs text-gray-500">Your reporter rank</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${rank.color}`}>{score.total_score}</p>
            <p className="text-xs text-gray-500">total points</p>
          </div>
        </div>

        {/* Points earned this submission */}
        {pointsEarned !== undefined && (
          <div className="flex items-center gap-2 rounded-lg bg-green-100 border border-green-200 px-3 py-2">
            <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-700">+{pointsEarned} points earned for this report!</p>
          </div>
        )}

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white border p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-gray-600">Accuracy</span>
            </div>
            <p className="text-xl font-black text-amber-600">{score.accuracy_score}%</p>
            <Progress value={score.accuracy_score} className="h-1 mt-1" />
          </div>
          <div className="rounded-lg bg-white border p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-gray-600">Activity</span>
            </div>
            <p className="text-xl font-black text-blue-600">{score.activity_score}</p>
            <p className="text-[10px] text-gray-400 mt-1">{score.reports_submitted} submitted · {score.reports_resolved} resolved</p>
          </div>
        </div>

        {/* Progress to next rank */}
        {nextRank && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to {nextRank.label}</span>
              <span>{score.total_score} / {nextRank.min} pts</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Badges earned</p>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(b => (
                <Badge key={b.id} className="bg-white border text-gray-700 gap-1 text-xs">
                  {b.emoji} {b.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
