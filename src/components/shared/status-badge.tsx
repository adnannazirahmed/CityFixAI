import { Badge } from '@/components/ui/badge';
import { getStatusLabel } from '@/lib/utils';
import type { ReportStatus } from '@/types';

interface StatusBadgeProps {
  status: ReportStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={status}>
      {getStatusLabel(status)}
    </Badge>
  );
}
