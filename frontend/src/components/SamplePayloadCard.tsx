import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2 } from 'lucide-react';

const SAMPLE_PAYLOAD = {
  ticker: "MGC1!",
  action: "long",
  entry: 2345.6,
  stop_loss: 2330.0,
  take_profit: 2380.0,
  strategy: "BP v1.0.3",
  timeframe: "5m",
  alert_id: "alert_001",
  alert_name: "MGC1! BP Long Signal",
  params_snapshot: {
    risk_pct: 1.0,
    atr_multiplier: 1.5,
    session: "RTH",
    orb_minutes: 30,
    version: "1.0.3"
  }
};

export function SamplePayloadCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Sample TradingView Alert Payload
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-xs font-mono border-border"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy JSON
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground font-mono mb-3">
          Use this payload to test your TradingView → Trade Trace pipeline. Paste it into a TradingView alert or use curl/Postman to POST to your webhook endpoint.
        </p>
        <pre className="bg-background border border-border rounded p-4 text-[11px] font-mono text-foreground overflow-x-auto leading-relaxed">
          {JSON.stringify(SAMPLE_PAYLOAD, null, 2)}
        </pre>
        <div className="mt-3 p-3 bg-muted/30 border border-border rounded">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Webhook Endpoint</p>
          <p className="text-xs font-mono text-foreground">POST /webhooks/tradingview</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-1">Content-Type: application/json</p>
        </div>
      </CardContent>
    </Card>
  );
}
