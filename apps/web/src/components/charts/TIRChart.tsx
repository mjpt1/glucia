'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TIRChartProps { timeInRange: number; timeBelow: number; timeAbove: number; }

export function TIRChart({ timeInRange, timeBelow, timeAbove }: TIRChartProps) {
  const data = [
    { name: 'در محدوده', value: timeInRange, color: '#22c55e' },
    { name: 'بالا', value: timeAbove, color: '#f97316' },
    { name: 'پایین', value: timeBelow, color: '#ef4444' },
  ];
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} cx={65} cy={65} innerRadius={45} outerRadius={65} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-green-400">{timeInRange}%</span>
          <span className="text-xs text-white/40">در محدوده</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-white/70">{item.name}</span>
            <span className="text-sm font-bold text-white mr-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
