import React from 'react';
import { cn } from '../lib/utils';
import { GhostStatus, TradeStatus, WebhookStatus } from '../backend';
import { ghostStatusLabel, tradeStatusLabel } from '../lib/utils';

interface GhostStatusBadgeProps {
  status: GhostStatus;
  className?: string;
}

interface TradeStatusBadgeProps {
  status: TradeStatus;
  className?: string;
}

interface WebhookStatusBadgeProps {
  status: WebhookStatus;
  className?: string;
}

const colorMap: Record<string, string> = {
  success: 'bg-success/10 text-success border border-success/30',
  warning: 'bg-warning/10 text-warning border border-warning/30',
  danger: 'bg-danger/10 text-danger border border-danger/30',
  info: 'bg-info/10 text-info border border-info/30',
  muted: 'bg-muted/50 text-muted-foreground border border-border',
};

function getGhostColor(status: GhostStatus): string {
  switch (status) {
    case GhostStatus.accepted: return colorMap.success;
    case GhostStatus.received: return colorMap.info;
    case GhostStatus.rejected: return colorMap.danger;
    case GhostStatus.unknown_: return colorMap.muted;
    default: return colorMap.muted;
  }
}

function getTradeColor(status: TradeStatus): string {
  switch (status) {
    case TradeStatus.filled: return colorMap.success;
    case TradeStatus.working: return colorMap.warning;
    case TradeStatus.submitted: return colorMap.info;
    case TradeStatus.canceled: return colorMap.muted;
    case TradeStatus.rejected: return colorMap.danger;
    case TradeStatus.unknown_: return colorMap.muted;
    default: return colorMap.muted;
  }
}

function getWebhookStatusColor(status: WebhookStatus): string {
  switch (status.__kind__) {
    case 'received': return colorMap.info;
    case 'processed': return colorMap.success;
    case 'error': return colorMap.danger;
    default: return colorMap.muted;
  }
}

function getWebhookStatusLabel(status: WebhookStatus): string {
  switch (status.__kind__) {
    case 'received': return 'Received';
    case 'processed': return 'Processed';
    case 'error': return `Error`;
    default: return 'Unknown';
  }
}

export function GhostStatusBadge({ status, className }: GhostStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium',
        getGhostColor(status),
        className
      )}
    >
      {ghostStatusLabel(status)}
    </span>
  );
}

export function TradeStatusBadge({ status, className }: TradeStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium',
        getTradeColor(status),
        className
      )}
    >
      {tradeStatusLabel(status)}
    </span>
  );
}

export function WebhookStatusBadge({ status, className }: WebhookStatusBadgeProps) {
  const label = getWebhookStatusLabel(status);
  const colorClass = getWebhookStatusColor(status);
  const errorMsg = status.__kind__ === 'error' ? status.error : undefined;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium',
        colorClass,
        className
      )}
      title={errorMsg}
    >
      {label}
      {errorMsg && (
        <span className="ml-1 opacity-70 truncate max-w-[120px]" title={errorMsg}>
          : {errorMsg}
        </span>
      )}
    </span>
  );
}

export function ActionBadge({ action, className }: { action: string; className?: string }) {
  const isLong = action.toLowerCase() === 'long';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wider uppercase',
        isLong
          ? 'bg-success/10 text-success border border-success/30'
          : 'bg-danger/10 text-danger border border-danger/30',
        className
      )}
    >
      {action.toUpperCase()}
    </span>
  );
}
