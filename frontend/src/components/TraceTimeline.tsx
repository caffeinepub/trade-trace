import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TraceEvent, EventSource, EventType } from '../backend';
import { formatTimestamp, eventSourceLabel, eventTypeLabel, eventSourceColor } from '../lib/utils';
import { ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface TraceTimelineProps {
  events: TraceEvent[];
}

const sourceIconMap: Record<string, string> = {
  [EventSource.tradingview]: '📊',
  [EventSource.ghost]: '👻',
  [EventSource.tradovate]: '📈',
};

const eventTypeColorMap: Record<string, string> = {
  [EventType.alertReceived]: 'text-info',
  [EventType.validationError]: 'text-danger',
  [EventType.ghostForwardAttempt]: 'text-warning',
  [EventType.ghostForwardSuccess]: 'text-success',
  [EventType.ghostForwardFailure]: 'text-danger',
  [EventType.ghostCallback]: 'text-warning',
  [EventType.tradingviewEvent]: 'text-info',
};

function TimelineEvent({ event, index }: { event: TraceEvent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = eventSourceColor(event.source);
  const typeColor = eventTypeColorMap[event.event_type] || 'text-muted-foreground';

  const dotColorMap: Record<string, string> = {
    info: 'bg-info border-info/30',
    warning: 'bg-warning border-warning/30',
    success: 'bg-success border-success/30',
    danger: 'bg-danger border-danger/30',
    muted: 'bg-muted-foreground border-border',
  };

  return (
    <div className="flex gap-3 group">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={cn('w-2.5 h-2.5 rounded-full border-2 mt-1 shrink-0', dotColorMap[color] || dotColorMap.muted)} />
        <div className="w-px flex-1 bg-border mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div
          className="flex items-start justify-between cursor-pointer hover:bg-accent/30 rounded p-2 -ml-2 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{sourceIconMap[event.source] || '⚡'}</span>
            <span className="text-xs font-mono text-muted-foreground">
              {eventSourceLabel(event.source)}
            </span>
            <span className={cn('text-xs font-mono font-semibold', typeColor)}>
              {eventTypeLabel(event.event_type)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-muted-foreground">
              {formatTimestamp(event.event_time)}
            </span>
            {expanded
              ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
              : <ChevronRight className="h-3 w-3 text-muted-foreground" />
            }
          </div>
        </div>

        {expanded && (
          <div className="mt-1 ml-2">
            <pre className="bg-background border border-border rounded p-3 text-[11px] font-mono text-foreground overflow-x-auto leading-relaxed">
              {JSON.stringify({ id: Number(event.id), source: event.source, event_type: event.event_type, event_time: formatTimestamp(event.event_time) }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function TraceTimeline({ events }: TraceTimelineProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Event Timeline
          <span className="ml-auto text-xs bg-muted/50 px-2 py-0.5 rounded font-mono">
            {events.length} events
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground font-mono text-sm">
            No events recorded yet
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event, i) => (
              <TimelineEvent key={Number(event.id)} event={event} index={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
