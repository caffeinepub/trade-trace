import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GhostStatus, TradeStatus, EventSource, EventType } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert nanosecond bigint timestamp to Date
export function nsToDate(ns: bigint | number): Date {
  const nsNum = typeof ns === 'bigint' ? Number(ns) : ns;
  return new Date(nsNum / 1_000_000);
}

export function formatTimestamp(ns: bigint | number): string {
  const date = nsToDate(ns);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDuration(seconds: bigint | number | undefined): string {
  if (seconds === undefined || seconds === null) return '—';
  const s = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) return '—';
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function formatPnl(pnl: number | undefined): string {
  if (pnl === undefined || pnl === null) return '—';
  const sign = pnl >= 0 ? '+' : '';
  return `${sign}${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ghostStatusLabel(status: GhostStatus): string {
  switch (status) {
    case GhostStatus.received: return 'Received';
    case GhostStatus.accepted: return 'Accepted';
    case GhostStatus.rejected: return 'Rejected';
    case GhostStatus.unknown_: return 'Unknown';
    default: return String(status);
  }
}

export function tradeStatusLabel(status: TradeStatus): string {
  switch (status) {
    case TradeStatus.submitted: return 'Submitted';
    case TradeStatus.working: return 'Working';
    case TradeStatus.filled: return 'Filled';
    case TradeStatus.canceled: return 'Canceled';
    case TradeStatus.rejected: return 'Rejected';
    case TradeStatus.unknown_: return 'Unknown';
    default: return String(status);
  }
}

export function eventSourceLabel(source: EventSource): string {
  switch (source) {
    case EventSource.tradingview: return 'TradingView';
    case EventSource.ghost: return 'Ghost';
    case EventSource.tradovate: return 'Tradovate';
    default: return String(source);
  }
}

export function eventTypeLabel(type: EventType): string {
  switch (type) {
    case EventType.alertReceived: return 'Alert Received';
    case EventType.validationError: return 'Validation Error';
    case EventType.ghostForwardAttempt: return 'Ghost Forward Attempt';
    case EventType.ghostForwardSuccess: return 'Ghost Forward Success';
    case EventType.ghostForwardFailure: return 'Ghost Forward Failure';
    case EventType.ghostCallback: return 'Ghost Callback';
    case EventType.tradingviewEvent: return 'TradingView Event';
    default: return String(type);
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ghostStatusColor(status: GhostStatus): string {
  switch (status) {
    case GhostStatus.accepted: return 'success';
    case GhostStatus.received: return 'info';
    case GhostStatus.rejected: return 'danger';
    case GhostStatus.unknown_: return 'muted';
    default: return 'muted';
  }
}

export function tradeStatusColor(status: TradeStatus): string {
  switch (status) {
    case TradeStatus.filled: return 'success';
    case TradeStatus.working: return 'warning';
    case TradeStatus.submitted: return 'info';
    case TradeStatus.canceled: return 'muted';
    case TradeStatus.rejected: return 'danger';
    case TradeStatus.unknown_: return 'muted';
    default: return 'muted';
  }
}

export function eventSourceColor(source: EventSource): string {
  switch (source) {
    case EventSource.tradingview: return 'info';
    case EventSource.ghost: return 'warning';
    case EventSource.tradovate: return 'success';
    default: return 'muted';
  }
}
