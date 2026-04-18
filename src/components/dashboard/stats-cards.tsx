import {
  FileText, AlertTriangle, CheckCircle2, TrendingUp,
  Layers, Clock, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  variant?: 'default' | 'red' | 'orange' | 'green' | 'blue' | 'purple';
}

const variantStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'border-gray-200 bg-white',
  red: 'border-red-100 bg-red-50',
  orange: 'border-orange-100 bg-orange-50',
  green: 'border-green-100 bg-green-50',
  blue: 'border-blue-100 bg-blue-50',
  purple: 'border-purple-100 bg-purple-50',
};

const iconStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
};

function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <Card className={cn('border transition-shadow hover:shadow-md', variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend.value >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            )}
            <span className={trend.value >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Total Reports"
        value={stats.total_reports}
        subtitle={`${stats.reports_this_week} this week`}
        icon={FileText}
        variant="blue"
        trend={{ value: 12, label: 'vs last week' }}
      />
      <StatCard
        title="Open Issues"
        value={stats.open_reports}
        subtitle="Awaiting resolution"
        icon={AlertTriangle}
        variant="orange"
      />
      <StatCard
        title="Resolved"
        value={stats.resolved_reports}
        subtitle={`${stats.resolution_rate}% resolution rate`}
        icon={CheckCircle2}
        variant="green"
        trend={{ value: 8, label: 'vs last month' }}
      />
      <StatCard
        title="High Priority"
        value={stats.high_priority_reports}
        subtitle="Critical + High urgency"
        icon={TrendingUp}
        variant="red"
      />
      <StatCard
        title="Duplicate Clusters"
        value={stats.duplicate_clusters}
        subtitle="Grouped similar reports"
        icon={Layers}
        variant="purple"
      />
      <StatCard
        title="Avg Resolution"
        value={`${stats.avg_resolution_days}d`}
        subtitle="Days to resolve"
        icon={Clock}
        variant="default"
      />
      <StatCard
        title="Reports This Week"
        value={stats.reports_this_week}
        subtitle="New submissions"
        icon={FileText}
        variant="blue"
      />
      <StatCard
        title="Resolution Rate"
        value={`${stats.resolution_rate}%`}
        subtitle="Issues closed"
        icon={CheckCircle2}
        variant="green"
        trend={{ value: stats.resolution_rate > 50 ? 5 : -3, label: 'target: 80%' }}
      />
    </div>
  );
}
