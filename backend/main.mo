import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import List "mo:core/List";
import OutCall "http-outcalls/outcall";
import Migration "migration";
import Option "mo:core/Option";

(with migration = Migration.run)
actor {
  module Duration {
    public type Duration = Nat64;
    public func compare(d1 : Duration, d2 : Duration) : Order.Order {
      Nat64.compare(d1, d2);
    };
  };

  module Pnl {
    public type Pnl = Int64;
    public func compare(p1 : Pnl, p2 : Pnl) : Order.Order {
      Int64.compare(p1, p2);
    };
  };

  // Types
  public type TraceId = Text;

  public type Settings = {
    ghost_api_key : Text;
    tradovate_api_key : Text;
    ghost_webhook_url : Text;
    tradovate_live_url : Text;
    tradovate_demo_url : Text;
    pipeline_test_mode : Bool;
    risk_method : RiskMethod;
    max_trade_quantity : Nat;
    ghost_executed_from_devices : [Text];
    ghost_trade_max_qty_scale : Nat;
    ghost_markup_pct : Float;
    ghost_spread_threshold : Float;
    ghost_exit_warn_time_sec : Nat64;
    ghost_exit_warn_ratio : Float;
  };

  public type RiskMethod = {
    #fixedQuantity;
    #percentBalance;
  };

  public type Trace = {
    trace_id : TraceId;
    alert_received_at : Time.Time;
    ticker : Text;
    action : Text;
    strategy : Text;
    entry : Float;
    stop_loss : Float;
    take_profit : Float;
    ghost_status : GhostStatus;
    tradovate_status : TradeStatus;
    avg_entry : ?Float;
    avg_exit : ?Float;
    pnl : ?Float;
    duration_seconds : ?Nat64;
    created_at : Time.Time;
    updated_at : Time.Time;
  };

  public type TraceEvent = {
    id : Nat;
    trace_id : TraceId;
    event_time : Time.Time;
    source : EventSource;
    event_type : EventType;
  };

  public type Fill = {
    trace_id : TraceId;
    price : Float;
    fill_time : Time.Time;
  };

  public type GhostStatus = {
    #received;
    #accepted;
    #rejected;
    #unknown;
  };

  public type TradeStatus = {
    #submitted;
    #working;
    #filled;
    #canceled;
    #rejected;
    #unknown;
  };

  public type EventSource = {
    #tradingview;
    #ghost;
    #tradovate;
  };

  public type EventType = {
    #alertReceived;
    #validationError;
    #ghostForwardAttempt;
    #ghostForwardSuccess;
    #ghostForwardFailure;
    #ghostCallback;
    #tradingviewEvent;
  };

  public type TraceInput = {
    ticker : Text;
    action : Text;
    strategy : Text;
    entry : Float;
    stop_loss : Float;
    take_profit : Float;
    params_snapshot_json : Text;
  };

  public type TraceQueryFilters = {
    ticker : ?Text;
    start_time : ?Time.Time;
    end_time : ?Time.Time;
    ghost_status : ?GhostStatus;
    tradovate_status : ?TradeStatus;
    strategy : ?Text;
  };

  public type ReceiveWebhookResponse = {
    ok : Bool;
    trace_id : ?TraceId;
    error : ?Text;
  };

  // New WebhookAlert type for persistent storage
  public type WebhookStatus = {
    #received;
    #processed;
    #error : Text;
  };

  public type WebhookAlert = {
    alert_id : Text;
    received_at : Time.Time;
    raw_payload : Text;
    ticker : ?Text;
    action : ?Text;
    strategy : ?Text;
    alert_name : ?Text;
    status : WebhookStatus;
  };

  // Map data structures
  let traces = Map.empty<TraceId, Trace>();
  let traceEvents = Map.empty<TraceId, List.List<TraceEvent>>();
  let fills = Map.empty<TraceId, List.List<Fill>>();
  let webhookAlerts = Map.empty<Text, WebhookAlert>();

  public query ({ caller }) func getTrace(trace_id : TraceId) : async ?Trace {
    traces.get(trace_id);
  };

  public query ({ caller }) func listTraces() : async [Trace] {
    traces.values().toArray();
  };

  public query ({ caller }) func getTraceEvents(trace_id : TraceId) : async [TraceEvent] {
    let events = traceEvents.get(trace_id);
    switch (events) {
      case (null) { [] };
      case (?es) { es.toArray() };
    };
  };

  public query ({ caller }) func getTraceFills(trace_id : TraceId) : async [Fill] {
    let traceFills = fills.get(trace_id);
    switch (traceFills) {
      case (null) { [] };
      case (?f) { f.toArray() };
    };
  };

  public query ({ caller }) func filterTraces(filters : TraceQueryFilters) : async [Trace] {
    traces.values().toArray().filter(
      func(trace) {
        switch (filters.ticker) {
          case (null) { true };
          case (?t) { Text.equal(trace.ticker, t) };
        };
      }
    );
  };

  public shared ({ caller }) func receiveWebhook(traceInput : ?TraceInput, traceId : TraceId) : async ReceiveWebhookResponse {
    // Process incoming webhook as usual
    let response = processTraceInput(traceInput, traceId);

    // Store WebhookAlert in persistent map
    let webhookAlert : WebhookAlert = {
      alert_id = traceId;
      received_at = Time.now();
      raw_payload = ""; // Should store actual raw JSON if available
      ticker = switch (traceInput) {
        case (null) { null };
        case (?input) { ?input.ticker };
      };
      action = switch (traceInput) {
        case (null) { null };
        case (?input) { ?input.action };
      };
      strategy = switch (traceInput) {
        case (null) { null };
        case (?input) { ?input.strategy };
      };
      alert_name = null;
      status = #received;
    };

    webhookAlerts.add(traceId, webhookAlert);

    response;
  };

  func processTraceInput(traceInput : ?TraceInput, traceId : TraceId) : ReceiveWebhookResponse {
    switch (traceInput) {
      case (null) {
        {
          ok = false;
          trace_id = null;
          error = ?("Payload missing");
        };
      };
      case (?input) {
        let newTrace : Trace = {
          trace_id = traceId;
          alert_received_at = Time.now();
          ticker = input.ticker;
          action = input.action;
          strategy = input.strategy;
          entry = input.entry;
          stop_loss = input.stop_loss;
          take_profit = input.take_profit;
          ghost_status = #received;
          tradovate_status = #submitted;
          avg_entry = null;
          avg_exit = null;
          pnl = null;
          duration_seconds = null;
          created_at = Time.now();
          updated_at = Time.now();
        };

        let initialEvents = List.empty<TraceEvent>();
        let initialFills = List.empty<Fill>();
        traces.add(traceId, newTrace);
        traceEvents.add(traceId, initialEvents);
        fills.add(traceId, initialFills);

        {
          ok = true;
          trace_id = ?traceId;
          error = null;
        };
      };
    };
  };

  public query ({ caller }) func getWebhookAlerts() : async [WebhookAlert] {
    webhookAlerts.values().toArray();
  };

  public query ({ caller }) func getWebhookAlert(alert_id : Text) : async ?WebhookAlert {
    webhookAlerts.get(alert_id);
  };

  public shared ({ caller }) func saveSettings(_settings : Settings) : async () {};

  public shared ({ caller }) func updateGhostStatus(_trace_id : TraceId, _status : GhostStatus, _response_json : Text, _error : ?Text) : async () {};

  public shared ({ caller }) func receiveGhostCallback(_payload_json : Text) : async () {};

  public shared ({ caller }) func refreshTrace(_trace_id : TraceId) : async () {};

  public query ({ caller }) func getSettings() : async Settings {
    {
      ghost_api_key = "dummy";
      tradovate_api_key = "dummy";
      ghost_webhook_url = "dummy://";
      tradovate_live_url = "dummy://";
      tradovate_demo_url = "dummy://";
      pipeline_test_mode = false;
      risk_method = #fixedQuantity;
      max_trade_quantity = 10;
      ghost_executed_from_devices = ["dummy"];
      ghost_trade_max_qty_scale = 10;
      ghost_markup_pct = 0.5;
      ghost_spread_threshold = 1.0;
      ghost_exit_warn_time_sec = 180;
      ghost_exit_warn_ratio = 0.2;
    };
  };
};
