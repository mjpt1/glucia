'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlucoseChart } from '@/components/charts/GlucoseChart';
import { TIRChart } from '@/components/charts/TIRChart';
import { useGlucoseStats, useGlucoseLogs } from '@/hooks/useGlucose';
import { glucoseColor } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PERIODS = [{ v: 7, l: 'هفته اخیر' }, { v: 14, l: '۲ هفته اخیر' }, { v: 30, l: 'ماه اخیر' }, { v: 90, l: '۳ ماه اخیر' }];

export default function ReportsPage() {
  const [days, setDays] = useState(30);
  const { data: stats } = useGlucoseStats(days);
  const { data: logs } = useGlucoseLogs({ limit: 500 });

  return (
    <DashboardLayout title="گزارش‌ها">
      <div className="space-y-6">
        <div className="flex gap-2">
          {PERIODS.map(p => (
            <button key={p.v} onClick={() => setDays(p.v)}
              className={`px-4 py-1.5 rounded-xl text-sm transition-all border ${days === p.v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
              {p.l}
            </button>
          ))}
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: 'میانگین قند', v: `${stats.average} mg/dL`, color: glucoseColor(stats.average) },
                { l: 'HbA1c تخمینی', v: `${stats.estimatedHba1c}%`, color: '#a78bfa' },
                { l: 'CV (نوسان)', v: `${stats.coefficientOfVariation}%`, color: stats.coefficientOfVariation > 36 ? '#ef4444' : '#22c55e' },
                { l: 'تعداد اندازه‌گیری', v: stats.count, color: '#60a5fa' },
              ].map(s => (
                <Card key={s.l}>
                  <CardContent className="p-4 text-center">
                    <p className="text-white/50 text-xs mb-1">{s.l}</p>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.v}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>نمودار روند قند خون</CardTitle></CardHeader>
                <CardContent>
                  {logs?.length ? (
                    <GlucoseChart data={logs} targetMin={stats.targetMin} targetMax={stats.targetMax} height={260} />
                  ) : <div className="h-64 flex items-center justify-center text-white/30">اطلاعاتی وجود ندارد</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>زمان در محدوده</CardTitle></CardHeader>
                <CardContent>
                  <TIRChart timeInRange={stats.timeInRange} timeBelow={stats.timeBelow} timeAbove={stats.timeAbove} />
                </CardContent>
              </Card>
            </div>

            {stats.dailyAverages?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>میانگین قند روزانه</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.dailyAverages}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        tickFormatter={v => new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(v))}
                        axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: any) => [`${v} mg/dL`, 'میانگین']}
                        contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', direction: 'rtl' }} />
                      <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
