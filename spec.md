# Specification

## Summary
**Goal:** Add a TradingView webhook alert log page with persistent backend storage so users can see all received alerts in the Trade Trace app.

**Planned changes:**
- Add a `WebhookAlert` stable record type to the backend and append every incoming webhook payload to a stable log (survives canister upgrades)
- Add `getWebhookAlerts` (query, newest first) and `clearWebhookAlerts` (update) backend methods
- Extend the existing `receiveWebhook` endpoint to append each alert to the log without modifying existing behavior
- Add a `useWebhookAlerts` React Query hook that polls the backend every 10 seconds
- Create a new `AlertLog` page at route `/alerts` showing a sortable table with columns: Received At, Ticker, Action, Strategy, Alert Name, Alert ID, and Status badge
- Each table row is expandable to reveal the full raw JSON payload with syntax highlighting
- Include a Refresh button, total alert count, and an empty state message
- Add an "Alert Log" nav link in the top nav bar between Dashboard and Settings, with active-state highlighting
- Register the `/alerts` route in the router

**User-visible outcome:** Users can navigate to an Alert Log page to see a live-updating list of all TradingView webhook alerts received by the app, including their parsed fields and full raw payloads.
