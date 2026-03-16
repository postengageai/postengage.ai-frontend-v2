import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '6px',
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            border: '2.5px solid #6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: '14px',
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
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#22d3ee',
            top: '20px',
            left: '2px',
          }}
        />
        {/* Purple dot */}
        <div
          style={{
            position: 'absolute',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#a855f7',
            top: '2px',
            left: '13px',
          }}
        />
        {/* Blue dot */}
        <div
          style={{
            position: 'absolute',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#3b82f6',
            top: '20px',
            right: '2px',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
