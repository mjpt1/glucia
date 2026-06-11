'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlucoseChart } from '@/components/charts/GlucoseChart';
import { TIRChart } from '@/components/charts/TIRChart';
import { GlucoseLogForm } from '@/components/glucose/GlucoseLogForm';
import { useGlucoseStats, useGlucoseLogs } from '@/hooks/useGlucose';
import { glucoseColor, glucoseLabel, toJalaliTime } from '@/lib/utils';
import { Activity, Heart, TrendingUp, Zap, Plus, Calendar, Award } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

function StatCard({ title, value, unit, icon: Icon, color = 'blue' }: any) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/20 text-green-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
  };
  const cls = colors[color];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`bg-gradient-to-br ${cls} border`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">{title}</p>
              <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
              {unit && <p className="text-xs text-white/40 mt-0.5">{unit}</p>}
            </div>
            <div className="p-2 rounded-xl bg-white/10">
              <Icon size={20} className={cls.split(' ').pop()} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PatientDashboard() {
  const { data: stats } = useGlucoseStats(14);
  const { data: logs } = useGlucoseLogs({ limit: 20 });
  const { data: dashboard } = useQuery({
    queryKey: ['patient', 'dashboard'],
    queryFn: async () => (await api.get('/patients/dashboard')).data,
  });
  const [showForm, setShowForm] = useState(false);

  return (
    <DashboardLayout title="داشبورد">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              سلام، {dashboard?.patient?.user?.firstName ?? '...'} 👋
            </h2>
            <p className="text-white/50 text-sm mt-0.5">آخرین وضعیت سلامت شما</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={16} /> ثبت قند خون
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <GlucoseLogForm onClose={() => setShowForm(false)} />
          </motion.div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="میانگین قند" value={stats?.average} unit="mg/dL" icon={Activity} color="blue" />
          <StatCard title="HbA1c تخمینی" value={stats?.estimatedHba1c} unit="درصد" icon={Heart} color="purple" />
          <StatCard title="در محدوده" value={stats?.timeInRange} unit="درصد" icon={TrendingUp} color="green" />
          <StatCard title="امتیاز سلامت" value={dashboard?.patient?.healthScore} unit="از ۱۰۰" icon={Zap} color="orange" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>نمودار قند خون — ۲۴ ساعت اخیر</CardTitle>
            </CardHeader>
            <CardContent>
              {logs?.length ? (
                <GlucoseChart data={logs} targetMin={stats?.targetMin} targetMax={stats?.targetMax} />
              ) : (
                <div className="h-64 flex items-center justify-center text-white/30 text-sm">
                  داده‌ای برای نمایش وجود ندارد
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {stats && (
              <Card>
                <CardHeader><CardTitle>زمان در محدوده</CardTitle></CardHeader>
                <CardContent>
                  <TIRChart
                    timeInRange={stats.timeInRange}
                    timeBelow={stats.timeBelow}
                    timeAbove={stats.timeAbove}
                  />
                </CardContent>
              </Card>
            )}
            {dashboard?.upcomingAppointment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar size={16} />نوبت بعدی
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white font-medium">
                    {dashboard.upcomingAppointment.doctor?.user?.firstName}{' '}
                    {dashboard.upcomingAppointment.doctor?.user?.lastName}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeStyle: 'short' }).format(
                      new Date(dashboard.upcomingAppointment.scheduledAt),
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>آخرین اندازه‌گیری‌ها</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(logs ?? []).slice(0, 8).map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: glucoseColor(log.valueMgDl) }} />
                      <span className="text-white font-bold">{log.valueMgDl}</span>
                      <span className="text-white/40 text-xs">mg/dL</span>
                    </div>
                    <Badge variant={log.valueMgDl < 70 ? 'destructive' : log.valueMgDl <= 180 ? 'success' : 'warning'}>
                      {glucoseLabel(log.valueMgDl)}
                    </Badge>
                    <span className="text-white/40 text-xs">{toJalaliTime(log.measuredAt)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />توصیه‌های هوش مصنوعی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recentInsights?.length ? (
                  dashboard.recentInsights.map((ins: any) => (
                    <div key={ins.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-white text-sm font-medium">{ins.title}</p>
                      <p className="text-white/50 text-xs mt-1">{ins.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-white/30 text-sm text-center py-6">هنوز توصیه‌ای وجود ندارد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {dashboard?.badges?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={16} className="text-yellow-400" />دستاوردهای اخیر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {dashboard.badges.map((pb: any) => (
                  <div key={pb.id} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/10 min-w-[80px]">
                    <span className="text-2xl">{pb.badge.icon}</span>
                    <p className="text-xs text-white/70 text-center">{pb.badge.nameFa}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
