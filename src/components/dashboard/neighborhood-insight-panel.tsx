'use client';

import { useState, useEffect } from 'react';
import { Brain, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  neighborhood?: string;
}

export function NeighborhoodInsightPanel({ neighborhood }: Props) {
  const [narrative, setNarrative] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  async function fetchInsight() {
    try {
      const res = await fetch('/api/ai/neighborhood-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ neighborhood }),
      });
      const json = await res.json();
      if (json.data?.narrative) {
        setNarrative(json.data.narrative);
        setGeneratedAt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      setNarrative('Unable to generate insight at this time.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchInsight(); }, [neighborhood]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsight();
  };

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-100 p-1.5">
              <Brain className="h-4 w-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base">AI Neighborhood Insight</CardTitle>
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs font-medium px-1.5 py-0.5">
              <Sparkles className="h-3 w-3 mr-1" />
              GPT-4o
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {neighborhood && (
          <p className="text-xs text-gray-500 mt-1 ml-9">Focused on: <span className="font-medium text-gray-700">{neighborhood}</span></p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-indigo-100 rounded animate-pulse w-full" />
            <div className="h-4 bg-indigo-100 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-indigo-100 rounded animate-pulse w-4/6" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">{narrative}</p>
            {generatedAt && (
              <p className="text-xs text-indigo-400">Generated at {generatedAt} · Powered by GPT-4o</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
