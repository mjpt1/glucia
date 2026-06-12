'use client';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toJalaliDateTime } from '@/lib/utils';
import { Users, Activity, Stethoscope, Utensils, Calendar, BarChart3, ScrollText } from 'lucide-react';

const ACTION_LABELS: Record<string, { label: string; variant: any }> = {
  LOGIN: { label: 'ورود', variant: 'success' },
  REGISTER: { label: 'ثبت‌نام', variant: 'default' },
};

export default function AdminReportsPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });
  const { data: auditLogs } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: async () => (await api.get('/admin/audit-logs')).data,
  });

  const cards = [
    { label: 'کاربران', value: stats?.totals?.users, icon: Users, color: 'text-blue-400' },
    { label: 'بیماران', value: stats?.totals?.patients, icon: Activity, color: 'text-green-400' },
    { label: 'پزشکان', value: stats?.totals?.doctors, icon: Stethoscope, color: 'text-purple-400' },
    { label: 'اندازه‌گیری قند', value: stats?.totals?.glucose, icon: BarChart3, color: 'text-cyan-400' },
    { label: 'وعده‌های غذایی', value: stats?.totals?.meals, icon: Utensils, color: 'text-orange-400' },
    { label: 'نوبت‌ها', value: stats?.totals?.appointments, icon: Calendar, color: 'text-pink-400' },
  ];

  return (
    <DashboardLayout title="گزارش‌های سیستم">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(c => (
            <Card key={c.label}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs mb-1">{c.label}</p>
                  <p className="text-2xl font-bold text-white">{(c.value ?? 0).toLocaleString('fa-IR')}</p>
                </div>
                <c.icon size={22} className={c.color} />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText size={16} /> رویدادهای اخیر سامانه (Audit Log)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs?.length ? (
              <div className="space-y-1 max-h-[28rem] overflow-y-auto">
                {auditLogs.map((log: any) => {
                  const a = ACTION_LABELS[log.action] ?? { label: log.action, variant: 'outline' };
                  return (
                    <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-sm">
                      <Badge variant={a.variant}>{a.label}</Badge>
                      <span className="text-white">{log.user?.fullName ?? '—'}</span>
                      <span className="text-white/40 text-xs">{log.user?.phone}</span>
                      <span className="text-white/30 text-xs mr-auto">{toJalaliDateTime(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/30 text-sm text-center py-10">رویدادی ثبت نشده است</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
