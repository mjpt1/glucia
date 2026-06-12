'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toJalaliDateTime } from '@/lib/utils';
import { Users, Calendar, AlertTriangle, TrendingDown } from 'lucide-react';

export default function DoctorDashboard() {
  const { data } = useQuery({
    queryKey: ['doctor', 'dashboard'],
    queryFn: async () => (await api.get('/doctors/dashboard')).data,
  });

  const cards = [
    { title: 'تعداد بیماران', value: data?.patientCount, icon: Users, color: 'blue' },
    { title: 'نوبت‌های در انتظار', value: data?.pendingAppointments?.length, icon: Calendar, color: 'orange' },
    { title: 'بیماران نیاز به توجه', value: data?.criticalPatients?.length, icon: AlertTriangle, color: 'red' },
  ];

  return (
    <DashboardLayout title="داشبورد پزشک">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {cards.map(c => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-${c.color}-500/20`}>
                    <c.icon size={20} className={`text-${c.color}-400`} />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs">{c.title}</p>
                    <p className="text-2xl font-bold text-white">{c.value ?? '—'}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Calendar size={16} />نوبت‌های آینده</span>
                <Link href="/doctor/appointments" className="text-blue-400 text-xs hover:text-blue-300">مشاهده همه</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.pendingAppointments?.slice(0, 5).map((appt: any) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                      {appt.patient?.user?.fullName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{appt.patient?.user?.fullName}</p>
                      <p className="text-white/40 text-xs">{toJalaliDateTime(appt.scheduledAt)}</p>
                    </div>
                    <Badge variant="warning">در انتظار</Badge>
                  </div>
                ))}
                {!data?.pendingAppointments?.length && (
                  <p className="text-white/30 text-sm text-center py-6">نوبتی در انتظار نیست</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2"><TrendingDown size={16} className="text-red-400" />بیماران نیاز به توجه</span>
                <Link href="/doctor/patients" className="text-blue-400 text-xs hover:text-blue-300">مشاهده همه</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.criticalPatients?.map((p: any) => (
                  <Link href={`/doctor/patients/${p.id}`} key={p.id}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all">
                      <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-400">
                        {p.user?.fullName?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{p.user?.fullName}</p>
                        <p className="text-white/40 text-xs">{p.user?.phone}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-red-400 font-bold">{p.healthScore}</p>
                        <p className="text-white/30 text-xs">امتیاز</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {!data?.criticalPatients?.length && (
                  <p className="text-white/30 text-sm text-center py-6">همه بیماران در وضعیت مناسب</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
