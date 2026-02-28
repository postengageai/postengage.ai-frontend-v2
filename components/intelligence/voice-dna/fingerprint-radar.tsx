'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type {
  VoiceDnaFingerprint,
  VoiceDnaSource,
} from '@/lib/types/voice-dna';

interface FingerprintRadarProps {
  fingerprint: VoiceDnaFingerprint;
  source?: VoiceDnaSource;
  className?: string;
}

const SOURCE_COLORS: Record<VoiceDnaSource, string> = {
  user_configured: 'hsl(var(--primary))',
  auto_inferred: 'hsl(142, 76%, 36%)',
  hybrid: 'hsl(262, 83%, 58%)',
};

export function FingerprintRadar({
  fingerprint,
  source = 'user_configured',
  className,
}: FingerprintRadarProps) {
  const data = [
    {
      marker: 'Humor',
      value: fingerprint.tone_markers.humor_level,
      fullMark: 10,
    },
    {
      marker: 'Directness',
      value: fingerprint.tone_markers.directness,
      fullMark: 10,
    },
    {
      marker: 'Warmth',
      value: fingerprint.tone_markers.warmth,
      fullMark: 10,
    },
    {
      marker: 'Assertiveness',
      value: fingerprint.tone_markers.assertiveness,
      fullMark: 10,
    },
  ];

  const color = SOURCE_COLORS[source];

  return (
    <div className={className}>
      <ResponsiveContainer width='100%' height={280}>
        <RadarChart cx='50%' cy='50%' outerRadius='80%' data={data}>
          <PolarGrid strokeDasharray='3 3' />
          <PolarAngleAxis
            dataKey='marker'
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickCount={6}
          />
          <Radar
            name='Tone'
            dataKey='value'
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value}/10`, 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
