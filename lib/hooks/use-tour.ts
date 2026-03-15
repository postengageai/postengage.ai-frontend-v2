'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, useUserActions } from '@/lib/user/store';
import { UserApi } from '@/lib/api/user';
import { PAGE_TOURS, getPageKeyFromPath } from '@/lib/tour/tours';
import type { TourPageKey } from '@/lib/tour/tours';
import type { Driver } from 'driver.js';

export function useTour() {
  const pathname = usePathname();
  const user = useUser();
  const userActions = useUserActions();
  const driverRef = useRef<Driver | null>(null);
  const autoStartedRef = useRef<Set<string>>(new Set());

  const pageKey = getPageKeyFromPath(pathname) as TourPageKey | null;
  const tourEnabled = user?.tour_enabled ?? true;
  const toursSeen = user?.tours_seen ?? [];
  const toursSkipped = user?.tours_skipped ?? [];

  const hasSeenTour = pageKey ? toursSeen.includes(pageKey) : true;
  const hasSkippedTour = pageKey ? toursSkipped.includes(pageKey) : true;
  const isFirstVisit = pageKey ? !hasSeenTour && !hasSkippedTour : false;

  const markTourStatus = useCallback(
    async (page: TourPageKey, action: 'seen' | 'skipped') => {
      try {
        const updated = await UserApi.updateTourStatus({
          tour_page: page,
          action,
        });
        if (updated?.data) {
          userActions.updateUser({
            tours_seen: updated.data.tours_seen,
            tours_skipped: updated.data.tours_skipped,
          });
        }
      } catch {
        // fail silently — tour tracking shouldn't break the app
      }
    },
    [userActions]
  );

  const startTour = useCallback(async () => {
    if (!pageKey) return;
    const tourDef = PAGE_TOURS[pageKey];
    if (!tourDef || tourDef.steps.length === 0) return;

    // Dynamically import driver.js to avoid SSR issues
    const { driver } = await import('driver.js');

    if (driverRef.current) {
      driverRef.current.destroy();
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.6,
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'postengage-tour-popover',
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      steps: tourDef.steps,
      onDestroyStarted: () => {
        // Check if user finished all steps or closed early
        const isLastStep = driverObj.isLastStep();
        if (isLastStep) {
          void markTourStatus(pageKey, 'seen');
        } else {
          void markTourStatus(pageKey, 'skipped');
        }
        driverObj.destroy();
      },
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [pageKey, markTourStatus]);

  // Auto-start tour for first-time visitors
  useEffect(() => {
    if (
      !tourEnabled ||
      !pageKey ||
      !isFirstVisit ||
      autoStartedRef.current.has(pageKey)
    ) {
      return;
    }

    // Only auto-start if user data is loaded
    if (!user) return;

    // Small delay to let page render
    autoStartedRef.current.add(pageKey);
    const timer = setTimeout(() => {
      void startTour();
    }, 800);

    return () => clearTimeout(timer);
  }, [tourEnabled, pageKey, isFirstVisit, user, startTour]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return {
    startTour,
    tourEnabled,
    hasSeenTour,
    hasSkippedTour,
    isFirstVisit,
    pageKey,
  };
}
