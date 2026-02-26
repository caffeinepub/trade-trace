import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SamplePayloadCard } from '../components/SamplePayloadCard';
import { useGetSettings, useSaveSettings } from '../hooks/useQueries';
import { Settings as SettingsType, RiskMethod } from '../backend';
import { Save, Settings2, Webhook, BarChart2, FlaskConical, AlertCircle, CheckCircle2, Copy, Check, Link2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: SettingsType = {
  ghost_api_key: '',
  tradovate_api_key: '',
  ghost_webhook_url: '',
  tradovate_live_url: 'https://live.tradovateapi.com/v1',
  tradovate_demo_url: 'https://demo.tradovateapi.com/v1',
  pipeline_test_mode: false,
  risk_method: RiskMethod.fixedQuantity,
  max_trade_quantity: BigInt(1),
  ghost_executed_from_devices: [],
  ghost_trade_max_qty_scale: BigInt(1),
  ghost_markup_pct: 0,
  ghost_spread_threshold: 0,
  ghost_exit_warn_time_sec: BigInt(180),
  ghost_exit_warn_ratio: 0.2,
};

function getWebhookUrl(): string {
  const hostname = window.location.hostname;
  // If running on ICP (*.icp0.io or *.ic0.app), use the current origin
  if (hostname.endsWith('.icp0.io') || hostname.endsWith('.ic0.app')) {
    return `${window.location.origin}/webhooks/tradingview`;
  }
  // Local dev fallback
  return `${window.location.origin}/webhooks/tradingview`;
}

function WebhookUrlCard() {
  const [copied, setCopied] = useState(false);
  const webhookUrl = getWebhookUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      toast.success('Webhook URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/30">
      <CardHeader className="pb-3 border-b border-primary/20">
        <CardTitle className="text-sm font-mono text-primary uppercase tracking-wider flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Your TradingView Webhook URL
        </CardTitle>
        <CardDescription className="text-xs font-mono text-muted-foreground mt-1">
          Paste this URL into TradingView's alert "Webhook URL" field to connect your alerts to Trade Trace.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={webhookUrl}
            className="h-9 text-xs font-mono bg-background border-primary/30 text-foreground select-all cursor-text flex-1"
            onFocus={(e) => e.target.select()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-9 px-3 text-xs font-mono border-primary/40 text-primary hover:bg-primary/10 hover:text-primary shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy URL
              </>
            )}
          </Button>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground mt-2">
          In TradingView: Create/edit an alert → Notifications → enable Webhook URL → paste above.
        </p>
      </CardContent>
    </Card>
  );
}

function SettingSection({ title, description, icon: Icon, children }: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs font-mono text-muted-foreground/70 mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
      <div>
        <Label className="text-xs font-mono text-foreground">{label}</Label>
        {hint && <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

export function Settings() {
  const { data: serverSettings, isLoading } = useGetSettings();
  const saveMutation = useSaveSettings();
  const [form, setForm] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (serverSettings) {
      setForm(serverSettings);
    }
  }, [serverSettings]);

  const handleSave = async () => {
    setSaveStatus('idle');
    try {
      await saveMutation.mutateAsync(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const updateField = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-[900px] mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Configuration
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Pipeline settings, integrations, and credentials
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="h-8 text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saveMutation.isPending ? (
            <>
              <Save className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Save status */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-xs font-mono">
          <CheckCircle2 className="h-4 w-4" />
          Settings saved successfully
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-xs font-mono">
          <AlertCircle className="h-4 w-4" />
          Failed to save settings. Please try again.
        </div>
      )}

      {/* Webhook URL — prominent, at the top */}
      <WebhookUrlCard />

      {/* Pipeline Test Mode */}
      <SettingSection
        title="Pipeline Mode"
        description="Control whether the pipeline forwards to Ghost and Tradovate"
        icon={FlaskConical}
      >
        <FieldRow
          label="Pipeline Test Mode"
          hint="When enabled, skips Ghost and Tradovate — only stores traces"
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={form.pipeline_test_mode}
              onCheckedChange={(v) => updateField('pipeline_test_mode', v)}
            />
            <span className={`text-xs font-mono ${form.pipeline_test_mode ? 'text-warning' : 'text-muted-foreground'}`}>
              {form.pipeline_test_mode ? '⚠ TEST MODE — Ghost & Tradovate disabled' : 'Live mode'}
            </span>
          </div>
        </FieldRow>
      </SettingSection>

      {/* Ghost Settings */}
      <SettingSection
        title="Ghost Integration"
        description="Configure Ghost webhook forwarding (Mode A)"
        icon={Webhook}
      >
        <FieldRow label="Ghost Webhook URL" hint="TradingView payload will be forwarded here">
          <Input
            value={form.ghost_webhook_url}
            onChange={(e) => updateField('ghost_webhook_url', e.target.value)}
            placeholder="https://ghost.example.com/webhook"
            className="h-8 text-xs font-mono bg-background border-border"
          />
        </FieldRow>
        <FieldRow label="Ghost API Key">
          <Input
            value={form.ghost_api_key}
            onChange={(e) => updateField('ghost_api_key', e.target.value)}
            placeholder="ghost_api_key_..."
            className="h-8 text-xs font-mono bg-background border-border"
          />
        </FieldRow>
        <FieldRow label="Markup %" hint="Ghost markup percentage">
          <Input
            type="number"
            value={form.ghost_markup_pct}
            onChange={(e) => updateField('ghost_markup_pct', parseFloat(e.target.value) || 0)}
            className="h-8 text-xs font-mono bg-background border-border w-32"
            step="0.01"
          />
        </FieldRow>
        <FieldRow label="Spread Threshold">
          <Input
            type="number"
            value={form.ghost_spread_threshold}
            onChange={(e) => updateField('ghost_spread_threshold', parseFloat(e.target.value) || 0)}
            className="h-8 text-xs font-mono bg-background border-border w-32"
            step="0.01"
          />
        </FieldRow>
        <FieldRow label="Exit Warn Time (sec)">
          <Input
            type="number"
            value={Number(form.ghost_exit_warn_time_sec)}
            onChange={(e) => updateField('ghost_exit_warn_time_sec', BigInt(parseInt(e.target.value) || 180))}
            className="h-8 text-xs font-mono bg-background border-border w-32"
          />
        </FieldRow>
        <FieldRow label="Exit Warn Ratio">
          <Input
            type="number"
            value={form.ghost_exit_warn_ratio}
            onChange={(e) => updateField('ghost_exit_warn_ratio', parseFloat(e.target.value) || 0)}
            className="h-8 text-xs font-mono bg-background border-border w-32"
            step="0.01"
          />
        </FieldRow>
        <FieldRow label="Max Qty Scale">
          <Input
            type="number"
            value={Number(form.ghost_trade_max_qty_scale)}
            onChange={(e) => updateField('ghost_trade_max_qty_scale', BigInt(parseInt(e.target.value) || 1))}
            className="h-8 text-xs font-mono bg-background border-border w-32"
          />
        </FieldRow>
        <FieldRow label="Executed From Devices" hint="Comma-separated device IDs">
          <Input
            value={form.ghost_executed_from_devices.join(', ')}
            onChange={(e) => updateField('ghost_executed_from_devices', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
            placeholder="device1, device2"
            className="h-8 text-xs font-mono bg-background border-border"
          />
        </FieldRow>
      </SettingSection>

      {/* Tradovate Settings */}
      <SettingSection
        title="Tradovate Integration"
        description="Tradovate REST API credentials for order/fill enrichment"
        icon={BarChart2}
      >
        <FieldRow label="Tradovate API Key">
          <Input
            value={form.tradovate_api_key}
            onChange={(e) => updateField('tradovate_api_key', e.target.value)}
            placeholder="tradovate_api_key_..."
            className="h-8 text-xs font-mono bg-background border-border"
          />
        </FieldRow>
        <FieldRow label="Demo URL" hint="Tradovate demo API endpoint">
          <Input
            value={form.tradovate_demo_url}
            onChange={(e) => updateField('tradovate_demo_url', e.target.value)}
            placeholder="https://demo.tradovateapi.com/v1"
            className="h-8 text-xs font-mono bg-background border-border"
          />
        </FieldRow>
        <FieldRow label="Live URL" hint="Tradovate live API endpoint">
          <Input
            value={form.tradovate_live_url}
            onChange={(e) => updateField('tradovate_live_url', e.target.value)}
            placeholder="https://live.tradovateapi.com/v1"
            className="h-8 text-xs font-mono bg-background border-border"
          />
        </FieldRow>
        <FieldRow label="Risk Method">
          <Select
            value={form.risk_method === RiskMethod.fixedQuantity ? 'fixedQuantity' : 'percentBalance'}
            onValueChange={(v) => updateField('risk_method', v === 'fixedQuantity' ? RiskMethod.fixedQuantity : RiskMethod.percentBalance)}
          >
            <SelectTrigger className="h-8 w-48 text-xs font-mono bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixedQuantity" className="text-xs font-mono">Fixed Quantity</SelectItem>
              <SelectItem value="percentBalance" className="text-xs font-mono">% of Balance</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>
        <FieldRow label="Max Trade Quantity">
          <Input
            type="number"
            value={Number(form.max_trade_quantity)}
            onChange={(e) => updateField('max_trade_quantity', BigInt(parseInt(e.target.value) || 1))}
            className="h-8 text-xs font-mono bg-background border-border w-32"
            min={1}
          />
        </FieldRow>
      </SettingSection>

      {/* Sample Payload */}
      <SamplePayloadCard />

      {/* Bottom save button */}
      <div className="flex justify-end pb-4">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="h-8 text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saveMutation.isPending ? (
            <>
              <Save className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
