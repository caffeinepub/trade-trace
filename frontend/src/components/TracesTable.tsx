import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { GhostStatusBadge, TradeStatusBadge, ActionBadge } from './StatusBadge';
import { Trace } from '../backend';
import {
  formatTimestamp,
  formatPrice,
  formatPnl,
  formatDuration,
} from '../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TracesTableProps {
  traces: Trace[];
  isLoading: boolean;
}

function PnlCell({ pnl }: { pnl: number | undefined }) {
  if (pnl === undefined || pnl === null) {
    return <span className="text-muted-foreground font-mono text-xs">—</span>;
  }
  const isPositive = pnl > 0;
  const isNegative = pnl < 0;
  return (
    <span className={`font-mono text-xs font-semibold flex items-center gap-1 ${isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-muted-foreground'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {formatPnl(pnl)}
    </span>
  );
}

export function TracesTable({ traces, isLoading }: TracesTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (traces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">📡</div>
        <p className="text-muted-foreground font-mono text-sm">No traces found</p>
        <p className="text-muted-foreground/60 font-mono text-xs mt-1">
          Send a TradingView alert or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">Alert Time</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Ticker</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Action</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">Strategy / TF</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">Entry / SL / TP</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ghost</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">Tradovate</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">Avg In / Out</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider">P&L</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {traces.map((trace) => (
            <TableRow
              key={trace.trace_id}
              className="border-border cursor-pointer hover:bg-accent/50 transition-colors group"
              onClick={() => navigate({ to: '/trace/$traceId', params: { traceId: trace.trace_id } })}
            >
              <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                {formatTimestamp(trace.alert_received_at)}
              </TableCell>
              <TableCell className="font-mono text-xs font-semibold text-foreground">
                {trace.ticker}
              </TableCell>
              <TableCell>
                <ActionBadge action={trace.action} />
              </TableCell>
              <TableCell className="font-mono text-xs">
                <div className="text-foreground">{trace.strategy || '—'}</div>
              </TableCell>
              <TableCell className="font-mono text-xs whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground">{formatPrice(trace.entry)}</span>
                  <span className="text-danger text-[10px]">SL {formatPrice(trace.stop_loss)}</span>
                  <span className="text-success text-[10px]">TP {formatPrice(trace.take_profit)}</span>
                </div>
              </TableCell>
              <TableCell>
                <GhostStatusBadge status={trace.ghost_status} />
              </TableCell>
              <TableCell>
                <TradeStatusBadge status={trace.tradovate_status} />
              </TableCell>
              <TableCell className="font-mono text-xs whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">In: {trace.avg_entry !== undefined && trace.avg_entry !== null ? formatPrice(trace.avg_entry) : '—'}</span>
                  <span className="text-muted-foreground">Out: {trace.avg_exit !== undefined && trace.avg_exit !== null ? formatPrice(trace.avg_exit) : '—'}</span>
                </div>
              </TableCell>
              <TableCell>
                <PnlCell pnl={trace.pnl} />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatDuration(trace.duration_seconds)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
