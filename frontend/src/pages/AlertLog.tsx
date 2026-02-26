import React, { useState } from 'react';
import { RefreshCw, Bell, ChevronDown, ChevronRight, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWebhookAlerts } from '../hooks/useQueries';
import { WebhookStatusBadge } from '../components/StatusBadge';
import { formatTimestamp } from '../lib/utils';
import type { WebhookAlert } from '../backend';

function AlertRow({ alert }: { alert: WebhookAlert }) {
  const [open, setOpen] = useState(false);

  let prettyPayload = alert.raw_payload;
  try {
    if (alert.raw_payload) {
      prettyPayload = JSON.stringify(JSON.parse(alert.raw_payload), null, 2);
    }
  } catch {
    prettyPayload = alert.raw_payload || '(no payload)';
  }

  // Build a synthetic payload display from available fields if raw_payload is empty
  const syntheticPayload = !alert.raw_payload
    ? JSON.stringify(
        {
          alert_id: alert.alert_id,
          ticker: alert.ticker ?? null,
          action: alert.action ?? null,
          strategy: alert.strategy ?? null,
          alert_name: alert.alert_name ?? null,
          received_at: alert.received_at.toString(),
        },
        null,
        2
      )
    : prettyPayload;

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <>
        <CollapsibleTrigger asChild>
          <TableRow className="cursor-pointer hover:bg-accent/30 transition-colors group">
            <TableCell className="w-6 pr-0">
              {open ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(alert.received_at)}
            </TableCell>
            <TableCell className="font-mono text-xs font-semibold text-foreground">
              {alert.ticker ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {alert.action ? (
                <span
                  className={
                    alert.action.toLowerCase() === 'long' || alert.action.toLowerCase() === 'buy'
                      ? 'text-success font-semibold uppercase'
                      : alert.action.toLowerCase() === 'short' || alert.action.toLowerCase() === 'sell'
                      ? 'text-danger font-semibold uppercase'
                      : 'text-foreground uppercase'
                  }
                >
                  {alert.action.toUpperCase()}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="font-mono text-xs text-foreground">
              {alert.strategy ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {alert.alert_name ?? <span className="text-muted-foreground">—</span>}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
              <span title={alert.alert_id}>{alert.alert_id}</span>
            </TableCell>
            <TableCell>
              <WebhookStatusBadge status={alert.status} />
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <TableRow className="bg-sidebar/60 hover:bg-sidebar/60">
            <TableCell colSpan={8} className="py-0">
              <div className="py-3 px-2">
                <p className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wider">
                  Raw Payload
                </p>
                <pre className="text-xs font-mono text-info bg-background/60 border border-border rounded p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                  {syntheticPayload}
                </pre>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}

function AlertLogSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function AlertLog() {
  const { data: alerts, isLoading, isFetching, refetch } = useWebhookAlerts();

  const alertCount = alerts?.length ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-mono font-bold text-foreground tracking-tight">
            Alert Log
          </h1>
          <span className="text-xs font-mono text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded">
            {alertCount} {alertCount === 1 ? 'alert' : 'alerts'}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="font-mono text-xs gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 bg-info/5 border border-info/20 rounded px-3 py-2.5 text-xs font-mono text-info/80">
        <Bell className="h-3.5 w-3.5 mt-0.5 shrink-0 text-info" />
        <span>
          Every TradingView webhook alert sent to your endpoint is logged here in real-time.
          Auto-refreshes every 10 seconds. Click any row to expand the full payload.
        </span>
      </div>

      {/* Table card */}
      <Card className="border-border bg-sidebar/40">
        <CardHeader className="pb-0 pt-4 px-4">
          <CardTitle className="text-sm font-mono font-semibold text-foreground flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-green" />
            Received Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-3">
          {isLoading ? (
            <AlertLogSkeleton />
          ) : !alerts || alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Inbox className="h-10 w-10 opacity-30" />
              <p className="text-sm font-mono">No alerts received yet</p>
              <p className="text-xs font-mono opacity-60 text-center max-w-xs">
                Fire a TradingView alert to your webhook URL and it will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="w-6 pr-0" />
                    <TableHead className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Received At
                    </TableHead>
                    <TableHead className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                      Ticker
                    </TableHead>
                    <TableHead className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                      Action
                    </TableHead>
                    <TableHead className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                      Strategy
                    </TableHead>
                    <TableHead className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Alert Name
                    </TableHead>
                    <TableHead className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Alert ID
                    </TableHead>
                    <TableHead className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <AlertRow key={alert.alert_id} alert={alert} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
