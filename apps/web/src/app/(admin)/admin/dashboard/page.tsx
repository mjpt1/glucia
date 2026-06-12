'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toJalaliDateTime } from '@/lib/utils';
import { Users, Activity, Stethoscope, Calendar, Utensils, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  const stats = [
    { label: 'کاربران کل', value: data?.totals?.users, icon: Users, color: 'blue' },
    { label: 'بیماران', value: data?.totals?.patients, icon: Activity, color: 'green' },
    { label: 'پزشکان', value: data?.totals?.doctors, icon: Stethoscope, color: 'purple' },
    { label: 'اندازه‌گیری‌ها', value: data?.totals?.glucose, icon: BarChart3, color: 'cyan' },
    { label: 'وعده‌ها', value: data?.totals?.meals, icon: Utensils, color: 'orange' },
    { label: 'نوبت‌ها', value: data?.totals?.appointments, icon: Calendar, color: 'pink' },
  ];

  const roleColors: Record<string, any> = { ADMIN: 'destructive', DOCTOR: 'default', PATIENT: 'success' };
  const roleLabels: Record<string, string> = { ADMIN: 'مدیر', DOCTOR: 'پزشک', PATIENT: 'بیمار' };

  return (
    <DashboardLayout title="داشبورد مدیر">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/50 text-xs">{s.label}</p>
                    <div className={`p-1.5 rounded-lg bg-${s.color}-500/20`}>
                      <s.icon size={14} className={`text-${s.color}-400`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{s.value?.toLocaleString('fa-IR') ?? '—'}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>کاربران اخیر</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.recentUsers?.map((u: any) => (
                <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                    {u.fullName?.[0] ?? u.phone[2]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{u.fullName}</p>
                    <p className="text-white/40 text-xs">{u.phone}</p>
                  </div>
                  <Badge variant={roleColors[u.role] ?? 'outline'}>{roleLabels[u.role] ?? u.role}</Badge>
                  <span className="text-white/30 text-xs">{toJalaliDateTime(u.createdAt)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
