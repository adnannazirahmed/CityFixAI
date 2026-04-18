import { AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCategoryLabel } from '@/lib/utils';
import type { AreaInsight } from '@/types';

interface EquityHeatmapProps {
  insights: AreaInsight[];
}

function EquityScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? 'bg-red-500' :
    score >= 55 ? 'bg-orange-500' :
    score >= 35 ? 'bg-amber-500' :
    'bg-green-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">Underserved Index</span>
        <span className="font-bold">{score}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function EquityHeatmap({ insights }: EquityHeatmapProps) {
  const cityAvgResolution =
    insights
      .filter((i) => i.avg_resolution_days !== null)
      .reduce((sum, i) => sum + (i.avg_resolution_days ?? 0), 0) /
    Math.max(insights.filter((i) => i.avg_resolution_days !== null).length, 1);

  return (
    <Card id="equity">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Equity Heatmap</CardTitle>
            <CardDescription>
              Neighborhoods ranked by unresolved issue burden and response time equity
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Equity Insight
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Callout for most underserved */}
        {insights[0]?.equity_flag && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800">
                <strong>{insights[0].neighborhood}</strong> has{' '}
                <strong>{insights[0].unresolved_reports}</strong> unresolved safety-related reports —{' '}
                {Math.round((insights[0].unresolved_reports / Math.max(insights[0].total_reports, 1)) * 100)}% unresolved.
                This neighborhood may be systematically underserved.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-xl border p-4 space-y-3 ${
                insight.equity_flag
                  ? 'border-red-200 bg-red-50'
                  : insight.equity_score >= 55
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Neighborhood header */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{insight.neighborhood}</h4>
                {insight.equity_flag && (
                  <Badge variant="destructive" className="text-xs">
                    ⚠ Flagged
                  </Badge>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Users className="h-3.5 w-3.5" />
                  <span>{insight.total_reports} total</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{insight.unresolved_reports} unresolved</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Avg priority: {insight.avg_priority_score}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {insight.avg_resolution_days
                      ? `${insight.avg_resolution_days.toFixed(1)}d avg`
                      : 'No data'}
                  </span>
                </div>
              </div>

              {/* Equity score bar */}
              <EquityScoreBar score={insight.equity_score} />

              {/* Top issues */}
              {insight.top_issues.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {insight.top_issues.slice(0, 3).map((issue) => (
                    <span
                      key={issue}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {getCategoryLabel(issue)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* City comparison */}
        <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3">
          <p className="text-xs text-gray-500 font-medium mb-2">City-Wide Comparison</p>
          <div className="space-y-2">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-24 shrink-0">{insight.neighborhood}</span>
                <Progress
                  value={(insight.unresolved_reports / Math.max(insight.total_reports, 1)) * 100}
                  className="flex-1 h-2"
                />
                <span className="text-xs font-medium tabular-nums w-8">
                  {Math.round((insight.unresolved_reports / Math.max(insight.total_reports, 1)) * 100)}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">% of reports unresolved per neighborhood</p>
        </div>
      </CardContent>
    </Card>
  );
}
