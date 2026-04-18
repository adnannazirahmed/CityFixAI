import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PriorityLevel } from '@/types';

interface PriorityBadgeProps {
  level: PriorityLevel;
  score?: number;
  className?: string;
}

export function PriorityBadge({ level, score, className }: PriorityBadgeProps) {
  const labelMap: Record<PriorityLevel, string> = {
    critical: '🔴 Critical',
    high: '🟠 High',
    medium: '🟡 Medium',
    low: '🟢 Low',
  };

  return (
    <Badge variant={level} className={cn('font-semibold', className)}>
      {labelMap[level]}
      {score !== undefined && <span className="ml-1 opacity-80">· {Math.round(score)}</span>}
    </Badge>
  );
}
