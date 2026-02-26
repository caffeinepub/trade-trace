import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GhostStatus, TradeStatus } from '../backend';
import { ghostStatusLabel, tradeStatusLabel } from '../lib/utils';

export interface FilterState {
  ticker: string;
  strategy: string;
  ghostStatus: string;
  tradovateStatus: string;
  startDate: string;
  endDate: string;
}

interface TraceFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const TICKERS = ['', 'MSE1!', 'MGC1!', 'SIL1!', 'MBT1!'];

const GHOST_STATUSES = [
  { value: '', label: 'All Ghost' },
  { value: GhostStatus.received, label: ghostStatusLabel(GhostStatus.received) },
  { value: GhostStatus.accepted, label: ghostStatusLabel(GhostStatus.accepted) },
  { value: GhostStatus.rejected, label: ghostStatusLabel(GhostStatus.rejected) },
  { value: GhostStatus.unknown_, label: ghostStatusLabel(GhostStatus.unknown_) },
];

const TRADE_STATUSES = [
  { value: '', label: 'All Tradovate' },
  { value: TradeStatus.submitted, label: tradeStatusLabel(TradeStatus.submitted) },
  { value: TradeStatus.working, label: tradeStatusLabel(TradeStatus.working) },
  { value: TradeStatus.filled, label: tradeStatusLabel(TradeStatus.filled) },
  { value: TradeStatus.canceled, label: tradeStatusLabel(TradeStatus.canceled) },
  { value: TradeStatus.rejected, label: tradeStatusLabel(TradeStatus.rejected) },
  { value: TradeStatus.unknown_, label: tradeStatusLabel(TradeStatus.unknown_) },
];

export function TraceFilters({ filters, onChange }: TraceFiltersProps) {
  const hasActiveFilters =
    filters.ticker || filters.strategy || filters.ghostStatus ||
    filters.tradovateStatus || filters.startDate || filters.endDate;

  const clearFilters = () => {
    onChange({ ticker: '', strategy: '', ghostStatus: '', tradovateStatus: '', startDate: '', endDate: '' });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-card border border-border rounded-lg">
      <Filter className="h-4 w-4 text-muted-foreground shrink-0" />

      {/* Ticker */}
      <Select
        value={filters.ticker}
        onValueChange={(v) => onChange({ ...filters, ticker: v === '__all__' ? '' : v })}
      >
        <SelectTrigger className="h-8 w-32 text-xs font-mono bg-background border-border">
          <SelectValue placeholder="Ticker" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-xs font-mono">All Tickers</SelectItem>
          {TICKERS.filter(Boolean).map((t) => (
            <SelectItem key={t} value={t} className="text-xs font-mono">{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Ghost Status */}
      <Select
        value={filters.ghostStatus}
        onValueChange={(v) => onChange({ ...filters, ghostStatus: v === '__all__' ? '' : v })}
      >
        <SelectTrigger className="h-8 w-36 text-xs font-mono bg-background border-border">
          <SelectValue placeholder="Ghost Status" />
        </SelectTrigger>
        <SelectContent>
          {GHOST_STATUSES.map((s) => (
            <SelectItem key={s.value || '__all__'} value={s.value || '__all__'} className="text-xs font-mono">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tradovate Status */}
      <Select
        value={filters.tradovateStatus}
        onValueChange={(v) => onChange({ ...filters, tradovateStatus: v === '__all__' ? '' : v })}
      >
        <SelectTrigger className="h-8 w-40 text-xs font-mono bg-background border-border">
          <SelectValue placeholder="Tradovate Status" />
        </SelectTrigger>
        <SelectContent>
          {TRADE_STATUSES.map((s) => (
            <SelectItem key={s.value || '__all__'} value={s.value || '__all__'} className="text-xs font-mono">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Strategy */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Strategy..."
          value={filters.strategy}
          onChange={(e) => onChange({ ...filters, strategy: e.target.value })}
          className="h-8 pl-6 w-36 text-xs font-mono bg-background border-border"
        />
      </div>

      {/* Date Range */}
      <Input
        type="date"
        value={filters.startDate}
        onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
        className="h-8 w-36 text-xs font-mono bg-background border-border"
        title="Start date"
      />
      <span className="text-muted-foreground text-xs">→</span>
      <Input
        type="date"
        value={filters.endDate}
        onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
        className="h-8 w-36 text-xs font-mono bg-background border-border"
        title="End date"
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
