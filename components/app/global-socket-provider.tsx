'use client';

import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '@/lib/socket/socket.service';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/lib/user/store';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/hooks';
import { usePrependWinItem } from '@/lib/hooks';
import type { WinsFeedItem } from '@/lib/api/value-analytics';

// ─── Web Audio beep ───────────────────────────────────────────────────────────

function playNotificationSound(
  type: 'connect' | 'disconnect' | 'notification' = 'notification'
) {
  try {
    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'notification') {
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    } else if (type === 'connect') {
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    } else {
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      oscillator.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
    }

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not supported — fail silently
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function GlobalSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const user = useUser();
  const qc = useQueryClient();
  const prependWin = usePrependWinItem();
  const reconnectToastShown = useRef(false);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const soundEnabled = user?.sound_notifications_enabled ?? false;

  const maybePlaySound = useCallback(
    (type: 'connect' | 'disconnect' | 'notification') => {
      if (soundEnabled) playNotificationSound(type);
    },
    [soundEnabled]
  );

  useEffect(() => {
    if (!user) return; // Only connect when logged in

    const socket = socketService.connect();
    if (!socket) return;

    // Join user-specific room
    socket.on('connect', () => {
      socketService.joinUserRoom(user.id);
      // Show reconnect toast only if we previously lost connection
      if (reconnectToastShown.current) {
        reconnectToastShown.current = false;
        maybePlaySound('connect');
        toast({
          title: 'Back online',
          description: 'Real-time connection restored.',
          duration: 3000,
        });
      }
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
    });

    // Delay disconnect toast to avoid flashes on brief network blips
    socket.on('disconnect', () => {
      disconnectTimerRef.current = setTimeout(() => {
        reconnectToastShown.current = true;
        maybePlaySound('disconnect');
        toast({
          title: 'Connection lost',
          description: 'Live updates paused. Reconnecting…',
          variant: 'destructive',
          duration: 6000,
        });
      }, 4000); // Wait 4 s before showing — most reconnects happen within 2 s
    });

    socket.on('connect_error', () => {
      // Already handled by disconnect — don't double-toast
    });

    // ─── Global notification handler ──────────────────────────────────────
    const handleNotification = () => {
      // Refresh dashboard stats + notification bell count/list in real-time
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      maybePlaySound('notification');
    };

    // ─── Value: live wins feed ─────────────────────────────────────────────
    const handleWinsUpdate = (item: WinsFeedItem) => {
      prependWin(item);
    };

    // ─── Value: milestone achieved ─────────────────────────────────────────
    const handleMilestone = (payload: {
      milestone_id: string;
      title: string;
      description: string;
      celebration: 'toast' | 'confetti' | 'badge';
    }) => {
      const celebrationEmoji =
        payload.celebration === 'confetti'
          ? '🎉'
          : payload.celebration === 'badge'
            ? '🏅'
            : '✅';
      toast({
        title: `${celebrationEmoji} ${payload.title}`,
        description: payload.description,
        duration: 8_000,
      });
      qc.invalidateQueries({ queryKey: queryKeys.value.milestones() });
      if (payload.celebration === 'confetti') {
        void import('canvas-confetti')
          .then(m => m.default)
          .then(confetti =>
            confetti({
              particleCount: 160,
              spread: 80,
              origin: { y: 0.55 },
              colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
            })
          )
          .catch(() => undefined);
      }
    };

    socketService.subscribeToNotifications(handleNotification);
    socketService.subscribeToWinsUpdate(handleWinsUpdate);
    socketService.subscribeToMilestoneAchieved(handleMilestone);

    return () => {
      socketService.unsubscribeFromNotifications(handleNotification);
      socketService.unsubscribeFromWinsUpdate(handleWinsUpdate);
      socketService.unsubscribeFromMilestoneAchieved(handleMilestone);
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [user, toast, qc, maybePlaySound, prependWin]);

  return <>{children}</>;
}
