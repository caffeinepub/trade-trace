import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Trace,
  TraceEvent,
  Fill,
  Settings,
  TraceQueryFilters,
  TraceInput,
  GhostStatus,
  ReceiveWebhookResponse,
  WebhookAlert,
} from '../backend';

// ─── Traces ───────────────────────────────────────────────────────────────────

export function useListTraces() {
  const { actor, isFetching } = useActor();
  return useQuery<Trace[]>({
    queryKey: ['traces'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listTraces();
      return [...result].sort((a, b) => {
        const aTime = typeof a.alert_received_at === 'bigint' ? Number(a.alert_received_at) : a.alert_received_at;
        const bTime = typeof b.alert_received_at === 'bigint' ? Number(b.alert_received_at) : b.alert_received_at;
        return bTime - aTime;
      });
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useFilterTraces(filters: TraceQueryFilters) {
  const { actor, isFetching } = useActor();
  return useQuery<Trace[]>({
    queryKey: ['traces', 'filtered', filters],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.filterTraces(filters);
      return [...result].sort((a, b) => {
        const aTime = typeof a.alert_received_at === 'bigint' ? Number(a.alert_received_at) : a.alert_received_at;
        const bTime = typeof b.alert_received_at === 'bigint' ? Number(b.alert_received_at) : b.alert_received_at;
        return bTime - aTime;
      });
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useGetTrace(traceId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Trace | null>({
    queryKey: ['trace', traceId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTrace(traceId);
    },
    enabled: !!actor && !isFetching && !!traceId,
  });
}

export function useGetTraceEvents(traceId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TraceEvent[]>({
    queryKey: ['traceEvents', traceId],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getTraceEvents(traceId);
      return [...result].sort((a, b) => {
        const aTime = typeof a.event_time === 'bigint' ? Number(a.event_time) : a.event_time;
        const bTime = typeof b.event_time === 'bigint' ? Number(b.event_time) : b.event_time;
        return aTime - bTime;
      });
    },
    enabled: !!actor && !isFetching && !!traceId,
  });
}

export function useGetTraceFills(traceId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Fill[]>({
    queryKey: ['traceFills', traceId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTraceFills(traceId);
    },
    enabled: !!actor && !isFetching && !!traceId,
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useGetSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.saveSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export function useReceiveWebhook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<ReceiveWebhookResponse, Error, { traceInput: TraceInput; traceId: string }>({
    mutationFn: async ({ traceInput, traceId }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.receiveWebhook(traceInput, traceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
      queryClient.invalidateQueries({ queryKey: ['webhookAlerts'] });
    },
  });
}

// ─── Webhook Alerts ───────────────────────────────────────────────────────────

export function useWebhookAlerts() {
  const { actor, isFetching } = useActor();
  return useQuery<WebhookAlert[]>({
    queryKey: ['webhookAlerts'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getWebhookAlerts();
      // Sort newest first by received_at
      return [...result].sort((a, b) => {
        const aTime = typeof a.received_at === 'bigint' ? Number(a.received_at) : a.received_at;
        const bTime = typeof b.received_at === 'bigint' ? Number(b.received_at) : b.received_at;
        return bTime - aTime;
      });
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

// ─── Ghost ────────────────────────────────────────────────────────────────────

export function useUpdateGhostStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { traceId: string; status: GhostStatus; responseJson: string; error: string | null }>({
    mutationFn: async ({ traceId, status, responseJson, error }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateGhostStatus(traceId, status, responseJson, error);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
      queryClient.invalidateQueries({ queryKey: ['trace', variables.traceId] });
      queryClient.invalidateQueries({ queryKey: ['traceEvents', variables.traceId] });
    },
  });
}

export function useReceiveGhostCallback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { payloadJson: string }>({
    mutationFn: async ({ payloadJson }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.receiveGhostCallback(payloadJson);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traces'] });
    },
  });
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export function useRefreshTrace(traceId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not ready');
      return actor.refreshTrace(traceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trace', traceId] });
      queryClient.invalidateQueries({ queryKey: ['traceEvents', traceId] });
      queryClient.invalidateQueries({ queryKey: ['traceFills', traceId] });
      queryClient.invalidateQueries({ queryKey: ['traces'] });
    },
  });
}
