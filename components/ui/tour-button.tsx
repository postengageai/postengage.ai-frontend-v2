'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTour } from '@/lib/hooks/use-tour';
import { useUser } from '@/lib/user/store';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'pe-tour-btn-pos';
const SNAP_MARGIN = 20; // px gap from viewport edge when snapped to a side
const DRAG_THRESHOLD = 6; // px moved before treating pointer-down as a drag

// ─── Types ───────────────────────────────────────────────────────────────────
interface PersistedPos {
  side: 'left' | 'right';
  /** Vertical position as a 0–1 fraction of viewport height — responsive across
   *  different screen sizes since it scales with the window. */
  yRatio: number;
}

// Default: bottom-left — save/action buttons almost always live bottom-right,
// so this avoids overlap out of the box.
const DEFAULT_POS: PersistedPos = { side: 'left', yRatio: 0.86 };

// ─── Component ───────────────────────────────────────────────────────────────
export function TourButton() {
  const user = useUser();
  const { startTour, tourEnabled, pageKey, hasSeenTour } = useTour();

  const btnRef = useRef<HTMLButtonElement>(null);
  // Stores the pointer + element origin at drag start
  const dragOrigin = useRef<{
    btnLeft: number;
    btnTop: number;
    ptrX: number;
    ptrY: number;
  } | null>(null);
  // True once the pointer has moved past the drag threshold
  const wasDrag = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PersistedPos>(DEFAULT_POS);
  const [dragging, setDragging] = useState(false);
  // Live x/y (in px from viewport origin) while the user is dragging
  const [liveXY, setLiveXY] = useState<{ x: number; y: number } | null>(null);

  // ── Hydration: load persisted position after mount (client-only) ─────────
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as PersistedPos;
        if (
          (p.side === 'left' || p.side === 'right') &&
          typeof p.yRatio === 'number' &&
          p.yRatio >= 0 &&
          p.yRatio <= 1
        ) {
          setPos(p);
        }
      }
    } catch {
      /* ignore parse/storage errors */
    }
  }, []);

  const persistPos = useCallback((p: PersistedPos) => {
    setPos(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, []);

  // ── Drag: pointer events handle both mouse and touch ─────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const btn = btnRef.current;
      if (!btn) return;
      e.preventDefault();
      // Capture so move/up fire on this element even when cursor leaves it
      btn.setPointerCapture(e.pointerId);
      const rect = btn.getBoundingClientRect();
      dragOrigin.current = {
        btnLeft: rect.left,
        btnTop: rect.top,
        ptrX: e.clientX,
        ptrY: e.clientY,
      };
      wasDrag.current = false;
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragOrigin.current) return;
      const dx = e.clientX - dragOrigin.current.ptrX;
      const dy = e.clientY - dragOrigin.current.ptrY;
      // Promote to drag once threshold is exceeded
      if (!wasDrag.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        wasDrag.current = true;
        setDragging(true);
      }
      if (wasDrag.current) {
        setLiveXY({
          x: dragOrigin.current.btnLeft + dx,
          y: dragOrigin.current.btnTop + dy,
        });
      }
    },
    [],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragOrigin.current) return;
      if (wasDrag.current && liveXY) {
        const btn = btnRef.current;
        const btnW = btn?.offsetWidth ?? 120;
        const btnH = btn?.offsetHeight ?? 44;
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        // Snap to whichever side the button's center is closer to
        const centerX = liveXY.x + btnW / 2;
        const side: 'left' | 'right' = centerX < winW / 2 ? 'left' : 'right';

        // Convert y to a viewport-relative fraction, clamped away from edges
        const rawY = liveXY.y + btnH / 2;
        const yRatio = Math.min(Math.max(rawY / winH, 0.06), 0.93);

        persistPos({ side, yRatio });
      }
      setDragging(false);
      setLiveXY(null);
      dragOrigin.current = null;
    },
    [liveXY, persistPos],
  );

  // Only fire the tour if the pointer-up was not the end of a drag
  const handleClick = useCallback(() => {
    if (!wasDrag.current) void startTour();
  }, [startTour]);

  // Skip render until after hydration to avoid SSR/localStorage mismatch
  if (!mounted || !user || !tourEnabled || !pageKey) return null;

  // ── Compute fixed position ────────────────────────────────────────────────
  let posStyle: React.CSSProperties;
  if (dragging && liveXY) {
    // Follow the pointer freely while dragging
    posStyle = { left: liveXY.x, top: liveXY.y };
  } else {
    // Snap to the stored side at the stored vertical fraction
    const winH = window.innerHeight;
    const topPx = Math.round(Math.min(Math.max(pos.yRatio * winH, 50), winH - 60));
    posStyle =
      pos.side === 'right'
        ? { right: SNAP_MARGIN, top: topPx }
        : { left: SNAP_MARGIN, top: topPx };
  }

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={handleClick}
      data-tour='tour-trigger-btn'
      style={{
        position: 'fixed',
        zIndex: 40,
        touchAction: 'none', // prevent browser scroll/zoom hijacking drag
        userSelect: 'none',
        ...posStyle,
      }}
      className={cn(
        'relative flex items-center gap-2 group select-none',
        // Mobile: square-ish icon button — Desktop: pill with label
        'p-3 sm:px-4 sm:py-2.5',
        'rounded-full',
        'bg-background/95 backdrop-blur-sm',
        'border border-border/60',
        'shadow-lg shadow-black/10',
        'text-sm font-medium text-muted-foreground',
        !dragging && 'hover:text-foreground hover:border-border hover:shadow-xl',
        'transition-shadow duration-200',
        // Pulse only when tour unseen and not mid-drag
        !hasSeenTour && !dragging && 'animate-pulse-subtle',
        dragging
          ? 'cursor-grabbing scale-105 opacity-90 shadow-2xl shadow-black/20'
          : 'cursor-grab',
      )}
      title={
        dragging
          ? 'Drop to set position'
          : 'Take a tour · Drag to reposition'
      }
      aria-label='Start page tour'
    >
      <GraduationCap
        className={cn(
          'h-4 w-4 shrink-0 transition-colors duration-200',
          !hasSeenTour
            ? 'text-primary'
            : 'text-muted-foreground group-hover:text-foreground',
        )}
      />

      {/* Text label — hidden on mobile to keep the button compact */}
      <span className='hidden sm:block whitespace-nowrap'>
        {hasSeenTour ? 'Tour' : 'Take a tour'}
      </span>

      {/* Dot indicator for pages the user hasn't toured yet */}
      {!hasSeenTour && (
        <span className='absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary shadow-sm' />
      )}
    </button>
  );
}
