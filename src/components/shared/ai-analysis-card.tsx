import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn, getCategoryLabel, getScoreBg } from '@/lib/utils';
import type { Report } from '@/types';

interface AIAnalysisCardProps {
  report: Report;
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>
        <span className={cn('font-bold tabular-nums', getScoreBg(score), 'text-white px-1.5 py-0.5 rounded text-xs')}>
          {Math.round(score)}/100
        </span>
      </div>
      <Progress
        value={score}
        className={cn('h-2', score >= 85 ? '[&>div]:bg-red-500' : score >= 70 ? '[&>div]:bg-orange-500' : score >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500')}
      />
    </div>
  );
}

export function AIAnalysisCard({ report }: AIAnalysisCardProps) {
  return (
    <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-blue-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
            <Brain className="h-3.5 w-3.5" />
          </div>
          AI Analysis
          <Badge variant="outline" className="ml-auto text-xs border-blue-200 text-blue-700">
            Auto-generated
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Category & Severity */}
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {getCategoryLabel(report.category)}
          </Badge>
          {report.severity && (
            <Badge variant={
              report.severity === 'critical' ? 'critical' :
              report.severity === 'high' ? 'high' :
              report.severity === 'medium' ? 'medium' : 'low'
            }>
              {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)} Severity
            </Badge>
          )}
        </div>

        {/* AI Summary */}
        {report.ai_summary && (
          <div className="rounded-lg bg-white border border-blue-100 p-3">
            <p className="text-sm text-gray-700 leading-relaxed">{report.ai_summary}</p>
          </div>
        )}

        {/* Score bars */}
        <div className="space-y-3">
          <ScoreBar label="Urgency Score" score={report.urgency_score} icon={AlertTriangle} />
          <ScoreBar label="Impact Score" score={report.impact_score} icon={TrendingUp} />
          <ScoreBar label="Priority Score" score={report.priority_score} icon={CheckCircle2} />
        </div>

        {/* AI Reasoning */}
        {report.ai_reasoning && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Why this score?</p>
                <p className="text-sm text-amber-800 leading-relaxed">{report.ai_reasoning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Action */}
        {report.recommended_action && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-800 mb-1">Recommended Action</p>
                <p className="text-sm text-green-800 leading-relaxed">{report.recommended_action}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
