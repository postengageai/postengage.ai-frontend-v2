'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { socketService } from '@/lib/socket/socket.service';
import { queryKeys } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';

// ── Milestone payload type ────────────────────────────────────────────────────

interface MilestonePayload {
  readonly milestone_id: string;
  readonly title: string;
  readonly description: string;
  readonly celebration: 'toast' | 'confetti' | 'badge';
  readonly achieved_at: string;
}

// ── Confetti (lazy-loaded) ────────────────────────────────────────────────────

async function fireConfetti(): Promise<void> {
  try {
    const confetti = (await import('canvas-confetti')).default;
    void confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    });
  } catch {
    // canvas-confetti not installed — silently skip
  }
}

// ── MilestoneToastListener ────────────────────────────────────────────────────
// Mount this once at the app/layout level. It listens for milestone:achieved
// WebSocket events and shows toasts + fires confetti automatically.

export function MilestoneToastListener() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const handlerRef = useRef<((payload: MilestonePayload) => void) | null>(null);

  const handleMilestone = useCallback(
    (payload: MilestonePayload) => {
      // Invalidate milestones cache so MilestoneBanner refreshes
      void qc.invalidateQueries({ queryKey: queryKeys.value.milestones() });

      toast({
        title: (
          <span className='flex items-center gap-2 font-semibold'>
            <Trophy className='h-4 w-4 text-yellow-500' />
            {payload.title}
          </span>
        ) as unknown as string,
        description: payload.description,
        duration: 8_000,
      });

      if (payload.celebration === 'confetti') {
        void fireConfetti();
      }
    },
    [toast, qc]
  );

  useEffect(() => {
    handlerRef.current = handleMilestone;

    const socket = socketService.connect();
    if (!socket) return;

    socketService.subscribeToMilestoneAchieved(handleMilestone);

    return () => {
      if (handlerRef.current) {
        socketService.unsubscribeFromMilestoneAchieved(handlerRef.current);
      }
    };
  }, [handleMilestone]);

  // This component renders nothing — it's a side-effect-only listener
  return null;
}
