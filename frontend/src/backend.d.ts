import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WebhookAlert {
    status: WebhookStatus;
    received_at: Time;
    action?: string;
    ticker?: string;
    strategy?: string;
    alert_name?: string;
    raw_payload: string;
    alert_id: string;
}
export type Time = bigint;
export interface ReceiveWebhookResponse {
    ok: boolean;
    error?: string;
    trace_id?: TraceId;
}
export interface Fill {
    fill_time: Time;
    trace_id: TraceId;
    price: number;
}
export interface TraceInput {
    action: string;
    ticker: string;
    take_profit: number;
    strategy: string;
    params_snapshot_json: string;
    entry: number;
    stop_loss: number;
}
export type TraceId = string;
export type WebhookStatus = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "processed";
    processed: null;
} | {
    __kind__: "received";
    received: null;
};
export interface Settings {
    pipeline_test_mode: boolean;
    ghost_exit_warn_ratio: number;
    ghost_api_key: string;
    tradovate_live_url: string;
    ghost_markup_pct: number;
    ghost_exit_warn_time_sec: bigint;
    risk_method: RiskMethod;
    max_trade_quantity: bigint;
    ghost_executed_from_devices: Array<string>;
    ghost_webhook_url: string;
    tradovate_api_key: string;
    tradovate_demo_url: string;
    ghost_trade_max_qty_scale: bigint;
    ghost_spread_threshold: number;
}
export interface TraceQueryFilters {
    ticker?: string;
    strategy?: string;
    ghost_status?: GhostStatus;
    end_time?: Time;
    start_time?: Time;
    tradovate_status?: TradeStatus;
}
export interface TraceEvent {
    id: bigint;
    source: EventSource;
    trace_id: TraceId;
    event_time: Time;
    event_type: EventType;
}
export interface Trace {
    pnl?: number;
    updated_at: Time;
    action: string;
    ticker: string;
    take_profit: number;
    alert_received_at: Time;
    duration_seconds?: bigint;
    strategy: string;
    ghost_status: GhostStatus;
    created_at: Time;
    entry: number;
    avg_entry?: number;
    stop_loss: number;
    trace_id: TraceId;
    avg_exit?: number;
    tradovate_status: TradeStatus;
}
export enum EventSource {
    tradovate = "tradovate",
    ghost = "ghost",
    tradingview = "tradingview"
}
export enum EventType {
    tradingviewEvent = "tradingviewEvent",
    ghostForwardAttempt = "ghostForwardAttempt",
    validationError = "validationError",
    ghostForwardSuccess = "ghostForwardSuccess",
    ghostForwardFailure = "ghostForwardFailure",
    alertReceived = "alertReceived",
    ghostCallback = "ghostCallback"
}
export enum GhostStatus {
    rejected = "rejected",
    accepted = "accepted",
    unknown_ = "unknown",
    received = "received"
}
export enum RiskMethod {
    percentBalance = "percentBalance",
    fixedQuantity = "fixedQuantity"
}
export enum TradeStatus {
    canceled = "canceled",
    submitted = "submitted",
    filled = "filled",
    working = "working",
    rejected = "rejected",
    unknown_ = "unknown"
}
export interface backendInterface {
    filterTraces(filters: TraceQueryFilters): Promise<Array<Trace>>;
    getSettings(): Promise<Settings>;
    getTrace(trace_id: TraceId): Promise<Trace | null>;
    getTraceEvents(trace_id: TraceId): Promise<Array<TraceEvent>>;
    getTraceFills(trace_id: TraceId): Promise<Array<Fill>>;
    getWebhookAlert(alert_id: string): Promise<WebhookAlert | null>;
    getWebhookAlerts(): Promise<Array<WebhookAlert>>;
    listTraces(): Promise<Array<Trace>>;
    receiveGhostCallback(_payload_json: string): Promise<void>;
    receiveWebhook(traceInput: TraceInput | null, traceId: TraceId): Promise<ReceiveWebhookResponse>;
    refreshTrace(_trace_id: TraceId): Promise<void>;
    saveSettings(_settings: Settings): Promise<void>;
    updateGhostStatus(_trace_id: TraceId, _status: GhostStatus, _response_json: string, _error: string | null): Promise<void>;
}
