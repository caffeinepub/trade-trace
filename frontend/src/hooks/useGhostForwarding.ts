import { useState } from 'react';
import { useUpdateGhostStatus } from './useQueries';
import { GhostStatus } from '../backend';

interface GhostForwardResult {
  forwarding: boolean;
  error: string | null;
  forwardToGhost: (traceId: string, payload: Record<string, unknown>, ghostWebhookUrl: string) => Promise<void>;
}

export function useGhostForwarding(): GhostForwardResult {
  const [forwarding, setForwarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateGhostStatus = useUpdateGhostStatus();

  const forwardToGhost = async (
    traceId: string,
    payload: Record<string, unknown>,
    ghostWebhookUrl: string
  ) => {
    if (!ghostWebhookUrl || ghostWebhookUrl === 'dummy://' || ghostWebhookUrl.trim() === '') {
      return;
    }

    setForwarding(true);
    setError(null);

    const forwardPayload = { ...payload, trace_id: traceId };

    try {
      const response = await fetch(ghostWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forwardPayload),
      });

      const responseText = await response.text();

      if (response.ok) {
        await updateGhostStatus.mutateAsync({
          traceId,
          status: GhostStatus.accepted,
          responseJson: responseText,
          error: null,
        });
      } else {
        const errMsg = `HTTP ${response.status}: ${responseText}`;
        await updateGhostStatus.mutateAsync({
          traceId,
          status: GhostStatus.rejected,
          responseJson: responseText,
          error: errMsg,
        });
        setError(errMsg);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      await updateGhostStatus.mutateAsync({
        traceId,
        status: GhostStatus.rejected,
        responseJson: '{}',
        error: errMsg,
      });
      setError(errMsg);
    } finally {
      setForwarding(false);
    }
  };

  return { forwarding, error, forwardToGhost };
}
