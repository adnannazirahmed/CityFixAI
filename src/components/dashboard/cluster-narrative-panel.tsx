'use client';

import { useState, useEffect } from 'react';
import { Users, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCategoryLabel } from '@/lib/utils';
import type { IssueCategory } from '@/types';

interface ClusterNarrative {
  cluster_id: string;
  category: IssueCategory;
  neighborhood: string | null;
  cluster_size: number;
  narrative: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  pothole: 'bg-red-100 text-red-700 border-red-200',
  broken_streetlight: 'bg-orange-100 text-orange-700 border-orange-200',
  damaged_sidewalk: 'bg-amber-100 text-amber-700 border-amber-200',
  road_obstruction: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  trash_overflow: 'bg-lime-100 text-lime-700 border-lime-200',
  illegal_dumping: 'bg-green-100 text-green-700 border-green-200',
  broken_sign: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  accessibility_hazard: 'bg-blue-100 text-blue-700 border-blue-200',
  flooding: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  graffiti: 'bg-purple-100 text-purple-700 border-purple-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function ClusterNarrativePanel() {
  const [narratives, setNarratives] = useState<ClusterNarrative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/cluster-narrative', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(r => r.json())
      .then(json => { if (json.data?.narratives) setNarratives(json.data.narratives); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-violet-100 bg-gradient-to-br from-violet-50/60 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-100 p-1.5">
            <Users className="h-4 w-4 text-violet-600" />
          </div>
          <CardTitle className="text-base">Duplicate Cluster Analysis</CardTitle>
          <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs font-medium px-1.5 py-0.5">
            <Sparkles className="h-3 w-3 mr-1" />
            GPT-4o
          </Badge>
        </div>
        <p className="text-xs text-gray-500 ml-9 mt-1">Locations where multiple residents reported the same issue</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-lg border border-gray-100 p-3 space-y-2 animate-pulse bg-white">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : narratives.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-4 justify-center">
            <AlertCircle className="h-4 w-4" />
            No duplicate clusters detected yet.
          </div>
        ) : (
          <div className="space-y-3">
            {narratives.map(n => (
              <div key={n.cluster_id} className="rounded-lg border border-gray-100 bg-white p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs font-medium ${CATEGORY_COLORS[n.category] ?? CATEGORY_COLORS.other}`}>
                    {getCategoryLabel(n.category)}
                  </Badge>
                  {n.neighborhood && (
                    <span className="text-xs text-gray-500">{n.neighborhood}</span>
                  )}
                  <span className="ml-auto text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
                    {n.cluster_size} reports
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{n.narrative}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
