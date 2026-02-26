import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trace, Fill } from '../backend';
import { formatPrice, formatPnl, formatDuration, formatTimestamp } from '../lib/utils';
import { BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RoundTurnSummaryProps {
  trace: Trace;
  fills: Fill[];
}

export function RoundTurnSummary({ trace, fills }: RoundTurnSummaryProps) {
  const hasPnl = trace.pnl !== undefined && trace.pnl !== null;
  const pnlPositive = hasPnl && (trace.pnl as number) > 0;
  const pnlNegative = hasPnl && (trace.pnl as number) < 0;

  // Separate fills by side (buy = entry for long, sell = entry for short)
  const isLong = trace.action.toLowerCase() === 'long';
  const entryFills = fills.filter((f) => {
    const side = (f as unknown as { side?: string }).side;
    return isLong ? side === 'buy' : side === 'sell';
  });
  const exitFills = fills.filter((f) => {
    const side = (f as unknown as { side?: string }).side;
    return isLong ? side === 'sell' : side === 'buy';
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Round Turn Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Avg Entry"
            value={trace.avg_entry !== undefined && trace.avg_entry !== null ? formatPrice(trace.avg_entry) : '—'}
          />
          <MetricCard
            label="Avg Exit"
            value={trace.avg_exit !== undefined && trace.avg_exit !== null ? formatPrice(trace.avg_exit) : '—'}
          />
          <MetricCard
            label="P&L"
            value={
              hasPnl ? (
                <span className={`flex items-center gap-1 ${pnlPositive ? 'text-success' : pnlNegative ? 'text-danger' : 'text-muted-foreground'}`}>
                  {pnlPositive ? <TrendingUp className="h-3 w-3" /> : pnlNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {formatPnl(trace.pnl)}
                </span>
              ) : '—'
            }
          />
          <MetricCard
            label="Duration"
            value={formatDuration(trace.duration_seconds)}
          />
        </div>

        {/* Fills tables */}
        {fills.length > 0 ? (
          <div className="space-y-4">
            <FillsTable title="Entry Fills" fills={entryFills.length > 0 ? entryFills : fills} />
            {exitFills.length > 0 && <FillsTable title="Exit Fills" fills={exitFills} />}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground font-mono text-sm">
            No fills recorded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded p-3">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-mono font-semibold text-foreground">{value}</p>
    </div>
  );
}

function FillsTable({ title, fills }: { title: string; fills: Fill[] }) {
  return (
    <div>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      <div className="border border-border rounded overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase">Fill Time</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase">Side</TableHead>
              <TableHead className="text-[10px] font-mono text-muted-foreground uppercase">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fills.map((fill, i) => {
              const side = (fill as unknown as { side?: string }).side;
              return (
                <TableRow key={i} className="border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatTimestamp(fill.fill_time)}
                  </TableCell>
                  <TableCell>
                    {side ? (
                      <span className={`font-mono text-xs font-semibold ${side === 'buy' ? 'text-success' : 'text-danger'}`}>
                        {side.toUpperCase()}
                      </span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-foreground">
                    {formatPrice(fill.price)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
