'use client';

interface ConfidenceGaugeProps {
  value: number; // 0-1
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

function getColor(value: number): string {
  if (value >= 0.7) return '#22c55e';
  if (value >= 0.5) return '#eab308';
  if (value >= 0.3) return '#f97316';
  return '#ef4444';
}

const SIZES = {
  sm: { outer: 40, stroke: 4, fontSize: 11, labelSize: 8 },
  md: { outer: 64, stroke: 5, fontSize: 16, labelSize: 10 },
  lg: { outer: 96, stroke: 6, fontSize: 24, labelSize: 12 },
};

export function ConfidenceGauge({
  value,
  size = 'md',
  label,
}: ConfidenceGaugeProps) {
  const config = SIZES[size];
  const radius = (config.outer - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.min(Math.max(value, 0), 1);
  const color = getColor(value);
  const percent = Math.round(value * 100);

  return (
    <div className='flex flex-col items-center gap-0.5'>
      <svg width={config.outer} height={config.outer} className='-rotate-90'>
        {/* Background circle */}
        <circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={config.stroke}
          className='text-muted/20'
        />
        {/* Filled arc */}
        <circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill='none'
          stroke={color}
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap='round'
          className='transition-all duration-500'
        />
      </svg>
      {/* Center text overlay */}
      <div
        className='absolute flex items-center justify-center'
        style={{
          width: config.outer,
          height: config.outer,
          marginTop: -(config.outer + (label ? 4 : 0)),
        }}
      >
        <span
          className='font-bold'
          style={{ fontSize: config.fontSize, color }}
        >
          {percent}%
        </span>
      </div>
      {label && (
        <span
          className='text-muted-foreground'
          style={{ fontSize: config.labelSize }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
