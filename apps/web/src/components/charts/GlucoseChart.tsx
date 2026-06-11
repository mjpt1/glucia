'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { glucoseColor } from '@/lib/utils';

interface GlucoseChartProps {
  data: Array<{ measuredAt: string; valueMgDl: number }>;
  targetMin?: number;
  targetMax?: number;
  height?: number;
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = glucoseColor(payload.valueMgDl, props.targetMin ?? 70, props.targetMax ?? 180);
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="none" />;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = glucoseColor(d.valueMgDl);
  return (
    <div className="bg-gray-900/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
      <p className="text-xs text-white/50 mb-1">{new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(d.measuredAt))}</p>
      <p className="text-lg font-bold" style={{ color }}>{d.valueMgDl} <span className="text-xs font-normal text-white/50">mg/dL</span></p>
    </div>
  );
};

export function GlucoseChart({ data, targetMin = 70, targetMax = 180, height = 300 }: GlucoseChartProps) {
  const sorted = [...data].sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={sorted} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="measuredAt"
          tickFormatter={(v) => new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(v))}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[40, 400]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={targetMin} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
        <ReferenceLine y={targetMax} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.5} />
        <Area
          type="monotoneX"
          dataKey="valueMgDl"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#glucoseGradient)"
          dot={<CustomDot targetMin={targetMin} targetMax={targetMax} />}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
