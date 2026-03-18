'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2 } from 'lucide-react';

interface QrCodeWithLogoProps {
  /** The otpauth:// URL to encode */
  value: string;
  /** Canvas size in px (default 200) */
  size?: number;
  /** Logo size as fraction of QR size (default 0.22 — 22%) */
  logoFraction?: number;
  className?: string;
}

/**
 * Renders a QR code with the PostEngage logo mark in the centre.
 * QR codes include ~30% error correction so a logo covering ≤25% is safe.
 */
export function QrCodeWithLogo({
  value,
  size = 200,
  logoFraction = 0.22,
  className,
}: QrCodeWithLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!value || !canvasRef.current) return;

    let cancelled = false;

    const draw = async () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      // ── 1. Draw QR code onto an offscreen canvas ──────────────────────────
      const offscreen = document.createElement('canvas');
      offscreen.width = size;
      offscreen.height = size;

      await QRCode.toCanvas(offscreen, value, {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'H', // highest — needed when logo covers the centre
        color: {
          dark: '#0a0a0f',  // matches --background dark token
          light: '#ffffff',
        },
      });

      if (cancelled) return;

      // Copy QR to main canvas
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(offscreen, 0, 0);

      // ── 2. Draw white rounded square behind logo ───────────────────────────
      const logoSize = Math.round(size * logoFraction);
      const padding = Math.round(logoSize * 0.18);
      const bgSize = logoSize + padding * 2;
      const bgX = (size - bgSize) / 2;
      const bgY = (size - bgSize) / 2;
      const radius = Math.round(bgSize * 0.22);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bgX + radius, bgY);
      ctx.lineTo(bgX + bgSize - radius, bgY);
      ctx.quadraticCurveTo(bgX + bgSize, bgY, bgX + bgSize, bgY + radius);
      ctx.lineTo(bgX + bgSize, bgY + bgSize - radius);
      ctx.quadraticCurveTo(bgX + bgSize, bgY + bgSize, bgX + bgSize - radius, bgY + bgSize);
      ctx.lineTo(bgX + radius, bgY + bgSize);
      ctx.quadraticCurveTo(bgX, bgY + bgSize, bgX, bgY + bgSize - radius);
      ctx.lineTo(bgX, bgY + radius);
      ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();

      // ── 3. Draw logo mark ─────────────────────────────────────────────────
      const logoImg = new Image();
      logoImg.src = '/logo-mark-dark.png';

      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = reject;
      });

      if (cancelled) return;

      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

      setIsReady(true);
    };

    setIsReady(false);
    draw().catch(() => {
      // If canvas drawing fails, still mark as ready so the fallback shows
      if (!cancelled) setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [value, size, logoFraction]);

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          borderRadius: 12,
          display: 'block',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />
      {!isReady && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </div>
      )}
    </div>
  );
}
