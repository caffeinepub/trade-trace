import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TracesTable } from '../components/TracesTable';
import { TraceFilters, FilterState } from '../components/TraceFilters';
import { useListTraces } from '../hooks/useQueries';
import { GhostStatus, TradeStatus, Trace } from '../backend';
import { nsToDate } from '../lib/utils';
import { RefreshCw, Radio } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  ticker: '',
  strategy: '',
  ghostStatus: '',
  tradovateStatus: '',
  startDate: '',
  endDate: '',
};

function applyFilters(traces: Trace[], filters: FilterState): Trace[] {
  return traces.filter((trace) => {
    if (filters.ticker && trace.ticker !== filters.ticker) return false;
    if (filters.strategy && !trace.strategy.toLowerCase().includes(filters.strategy.toLowerCase())) return false;
    if (filters.ghostStatus) {
      const statusMap: Record<string, GhostStatus> = {
        [GhostStatus.received]: GhostStatus.received,
        [GhostStatus.accepted]: GhostStatus.accepted,
        [GhostStatus.rejected]: GhostStatus.rejected,
        [GhostStatus.unknown_]: GhostStatus.unknown_,
      };
      if (trace.ghost_status !== statusMap[filters.ghostStatus]) return false;
    }
    if (filters.tradovateStatus) {
      const statusMap: Record<string, TradeStatus> = {
        [TradeStatus.submitted]: TradeStatus.submitted,
        [TradeStatus.working]: TradeStatus.working,
        [TradeStatus.filled]: TradeStatus.filled,
        [TradeStatus.canceled]: TradeStatus.canceled,
        [TradeStatus.rejected]: TradeStatus.rejected,
        [TradeStatus.unknown_]: TradeStatus.unknown_,
      };
      if (trace.tradovate_status !== statusMap[filters.tradovateStatus]) return false;
    }
    if (filters.startDate) {
      const alertDate = nsToDate(trace.alert_received_at);
      const start = new Date(filters.startDate);
      if (alertDate < start) return false;
    }
    if (filters.endDate) {
      const alertDate = nsToDate(trace.alert_received_at);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      if (alertDate > end) return false;
    }
    return true;
  });
}

export function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { data: traces = [], isLoading, refetch, isFetching } = useListTraces();

  const filteredTraces = useMemo(() => applyFilters(traces, filters), [traces, filters]);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Pipeline Traces
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            TradingView → Ghost → Tradovate lineage view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {filteredTraces.length} / {traces.length} traces
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 text-xs font-mono border-border"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TraceFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <TracesTable traces={filteredTraces} isLoading={false} />
        )}
      </div>
    </div>
  );
}
