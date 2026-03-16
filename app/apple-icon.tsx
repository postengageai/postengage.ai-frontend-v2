import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0a1c',
          borderRadius: '40px',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            border: '8px solid #6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: '64px',
              fontWeight: 900,
              fontFamily: 'sans-serif',
              lineHeight: 1,
            }}
          >
            P
          </span>
        </div>
        {/* Cyan dot */}
        <div
          style={{
            position: 'absolute',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#22d3ee',
            top: '108px',
            left: '16px',
          }}
        />
        {/* Purple dot */}
        <div
          style={{
            position: 'absolute',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#a855f7',
            top: '16px',
            left: '79px',
          }}
        />
        {/* Blue dot */}
        <div
          style={{
            position: 'absolute',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#3b82f6',
            top: '108px',
            right: '16px',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
