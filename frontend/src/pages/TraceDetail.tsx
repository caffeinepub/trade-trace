import React from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TraceSummaryCard } from '../components/TraceSummaryCard';
import { TraceTimeline } from '../components/TraceTimeline';
import { RoundTurnSummary } from '../components/RoundTurnSummary';
import { useGetTrace, useGetTraceEvents, useGetTraceFills, useRefreshTrace } from '../hooks/useQueries';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export function TraceDetail() {
  const { traceId } = useParams({ from: '/trace/$traceId' });

  const { data: trace, isLoading: traceLoading, error: traceError } = useGetTrace(traceId);
  const { data: events = [], isLoading: eventsLoading } = useGetTraceEvents(traceId);
  const { data: fills = [], isLoading: fillsLoading } = useGetTraceFills(traceId);
  const refreshMutation = useRefreshTrace(traceId);

  const isLoading = traceLoading || eventsLoading || fillsLoading;

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-8 text-xs font-mono text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-mono font-bold text-foreground">Trace Detail</h1>
            <p className="text-[10px] font-mono text-muted-foreground break-all">{traceId}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
          className="h-8 text-xs font-mono border-border"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Tradovate'}
        </Button>
      </div>

      {/* Error state */}
      {traceError && (
        <div className="flex items-center gap-2 p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load trace: {traceError.message}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Not found */}
      {!isLoading && !trace && !traceError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-muted-foreground font-mono text-sm">Trace not found</p>
          <p className="text-muted-foreground/60 font-mono text-xs mt-1">
            The trace ID <span className="text-foreground">{traceId}</span> does not exist
          </p>
          <Link to="/" className="mt-4">
            <Button variant="outline" size="sm" className="text-xs font-mono">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )}

      {/* Content */}
      {!isLoading && trace && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: Summary */}
          <div className="lg:col-span-1 space-y-4">
            <TraceSummaryCard trace={trace} />
          </div>

          {/* Right column: Timeline + Round Turn */}
          <div className="lg:col-span-2 space-y-4">
            <TraceTimeline events={events} />
            <RoundTurnSummary trace={trace} fills={fills} />
          </div>
        </div>
      )}

      {/* Refresh success message */}
      {refreshMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-success/10 border border-success/30 text-success text-xs font-mono px-4 py-2 rounded-lg shadow-lg">
          ✓ Tradovate data refreshed
        </div>
      )}
    </div>
  );
}
