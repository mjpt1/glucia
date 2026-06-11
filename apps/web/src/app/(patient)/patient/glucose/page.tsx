'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlucoseChart } from '@/components/charts/GlucoseChart';
import { TIRChart } from '@/components/charts/TIRChart';
import { GlucoseLogForm } from '@/components/glucose/GlucoseLogForm';
import { useGlucoseStats, useGlucoseLogs } from '@/hooks/useGlucose';
import { glucoseColor, glucoseLabel, toJalaliDateTime } from '@/lib/utils';
import { GLUCOSE_CONTEXTS } from '@/lib/constants';
import { Plus, Filter } from 'lucide-react';

const DAYS_OPTIONS = [7, 14, 30, 90];

export default function GlucosePage() {
  const [days, setDays] = useState(14);
  const [showForm, setShowForm] = useState(false);
  const [contextFilter, setContextFilter] = useState<string | undefined>();
  const { data: stats, isLoading: statsLoading } = useGlucoseStats(days);
  const { data: logs, isLoading: logsLoading } = useGlucoseLogs({ limit: 100, context: contextFilter });

  return (
    <DashboardLayout title="قند خون">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-2">
            {DAYS_OPTIONS.map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-4 py-1.5 rounded-xl text-sm transition-all border ${days === d ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                {d} روز
              </button>
            ))}
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={16} /> ثبت قند جدید
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <GlucoseLogForm onClose={() => setShowForm(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'میانگین', value: stats.average, unit: 'mg/dL', color: glucoseColor(stats.average) },
              { label: 'HbA1c', value: stats.estimatedHba1c, unit: '%', color: '#a78bfa' },
              { label: 'حداقل', value: stats.min, unit: 'mg/dL', color: glucoseColor(stats.min) },
              { label: 'حداکثر', value: stats.max, unit: 'mg/dL', color: glucoseColor(stats.max) },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-white/50 text-xs">{s.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-white/30 text-xs">{s.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>نمودار {days} روز اخیر</CardTitle></CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-72 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : logs?.length ? (
                <GlucoseChart data={logs} targetMin={stats?.targetMin} targetMax={stats?.targetMax} height={280} />
              ) : (
                <div className="h-72 flex items-center justify-center text-white/30">اطلاعاتی وجود ندارد</div>
              )}
            </CardContent>
          </Card>

          {stats && (
            <Card>
              <CardHeader><CardTitle>زمان در محدوده</CardTitle></CardHeader>
              <CardContent>
                <TIRChart timeInRange={stats.timeInRange} timeBelow={stats.timeBelow} timeAbove={stats.timeAbove} />
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-white/50 text-xs">تعداد اندازه‌گیری</p>
                  <p className="text-xl font-bold text-white mt-0.5">{stats.count}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Daily averages */}
        {stats?.dailyAverages?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>میانگین روزانه</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...stats.dailyAverages].reverse().map((day: any) => (
                  <div key={day.date} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm w-28">
                      {new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(day.date))}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min((day.avg / 300) * 100, 100)}%`, backgroundColor: glucoseColor(day.avg) }}
                      />
                    </div>
                    <span className="text-white font-bold w-16 text-left" style={{ color: glucoseColor(day.avg) }}>
                      {day.avg}
                    </span>
                    <span className="text-white/30 text-xs w-16">{day.count} بار</span>
                    <Badge variant={day.avg < 70 ? 'destructive' : day.avg <= 180 ? 'success' : 'warning'}>
                      {glucoseLabel(day.avg)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>تاریخچه اندازه‌گیری‌ها</CardTitle>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-white/40" />
                <select
                  value={contextFilter ?? ''}
                  onChange={e => setContextFilter(e.target.value || undefined)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70">
                  <option value="">همه</option>
                  {GLUCOSE_CONTEXTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {(logs ?? []).map((log: any) => (
                  <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: glucoseColor(log.valueMgDl) }} />
                    <span className="text-white font-bold text-lg w-16">{log.valueMgDl}</span>
                    <span className="text-white/40 text-xs">mg/dL</span>
                    <Badge variant={log.valueMgDl < 70 ? 'destructive' : log.valueMgDl <= 180 ? 'success' : 'warning'} className="mr-auto">
                      {glucoseLabel(log.valueMgDl)}
                    </Badge>
                    <span className="text-white/50 text-xs">{GLUCOSE_CONTEXTS.find(c => c.value === log.context)?.label}</span>
                    <span className="text-white/30 text-xs">{toJalaliDateTime(log.measuredAt)}</span>
                    {log.note && <span className="text-white/40 text-xs truncate max-w-[120px]">{log.note}</span>}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
