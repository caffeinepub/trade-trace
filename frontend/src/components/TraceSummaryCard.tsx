import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GhostStatusBadge, TradeStatusBadge, ActionBadge } from './StatusBadge';
import { Trace } from '../backend';
import { formatTimestamp, formatPrice } from '../lib/utils';
import { Hash, Clock, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface TraceSummaryCardProps {
  trace: Trace;
}

function InfoRow({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider shrink-0 w-32">{label}</span>
      <span className={`text-xs text-right ${mono ? 'font-mono' : ''} text-foreground`}>{value}</span>
    </div>
  );
}

export function TraceSummaryCard({ trace }: TraceSummaryCardProps) {
  let paramsObj: Record<string, unknown> = {};
  try {
    if (trace && 'params_snapshot_json' in trace) {
      paramsObj = JSON.parse((trace as unknown as { params_snapshot_json: string }).params_snapshot_json || '{}');
    }
  } catch {
    // ignore
  }

  const hasParams = Object.keys(paramsObj).length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Trace Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-0">
        <InfoRow
          label="Trace ID"
          value={
            <span className="text-primary font-mono text-[11px] break-all">{trace.trace_id}</span>
          }
        />
        <InfoRow
          label="Alert Time"
          value={
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatTimestamp(trace.alert_received_at)}
            </span>
          }
        />
        <InfoRow
          label="Ticker"
          value={<span className="font-bold text-foreground">{trace.ticker}</span>}
        />
        <InfoRow
          label="Action"
          value={<ActionBadge action={trace.action} />}
        />
        <InfoRow
          label="Entry"
          value={<span className="text-foreground">{formatPrice(trace.entry)}</span>}
        />
        <InfoRow
          label="Stop Loss"
          value={<span className="text-danger">{formatPrice(trace.stop_loss)}</span>}
        />
        <InfoRow
          label="Take Profit"
          value={<span className="text-success">{formatPrice(trace.take_profit)}</span>}
        />
        <InfoRow
          label="Strategy"
          value={trace.strategy || '—'}
        />
        <InfoRow
          label="Ghost Status"
          value={<GhostStatusBadge status={trace.ghost_status} />}
        />
        <InfoRow
          label="Trade Status"
          value={<TradeStatusBadge status={trace.tradovate_status} />}
        />

        {hasParams && (
          <div className="pt-3">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
              Params Snapshot
            </p>
            <pre className="bg-background border border-border rounded p-3 text-[11px] font-mono text-foreground overflow-x-auto leading-relaxed">
              {JSON.stringify(paramsObj, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
