'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toJalaliDateTime, faToEnDigits } from '@/lib/utils';
import { HeartPulse, Plus, X } from 'lucide-react';

function bpStatus(sys: number, dia: number): { label: string; variant: any; color: string } {
  if (sys >= 180 || dia >= 120) return { label: 'بحرانی', variant: 'destructive', color: '#dc2626' };
  if (sys >= 140 || dia >= 90) return { label: 'فشار بالا', variant: 'destructive', color: '#ef4444' };
  if (sys >= 130 || dia >= 80) return { label: 'مرحله ۱', variant: 'warning', color: '#f97316' };
  if (sys >= 120) return { label: 'بالای نرمال', variant: 'warning', color: '#eab308' };
  if (sys >= 90 && dia >= 60) return { label: 'نرمال', variant: 'success', color: '#22c55e' };
  return { label: 'پایین', variant: 'warning', color: '#3b82f6' };
}

export default function HealthPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  const { data: logs } = useQuery({
    queryKey: ['health-logs', 'BLOOD_PRESSURE'],
    queryFn: async () => (await api.get('/patients/health-logs', { params: { kind: 'BLOOD_PRESSURE' } })).data,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: any) => api.post('/patients/health-logs', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health-logs'] });
      toast.success('فشار خون ثبت شد');
      setSystolic(''); setDiastolic(''); setShowForm(false);
    },
    onError: () => toast.error('خطا در ثبت'),
  });

  const sys = parseInt(systolic, 10);
  const dia = parseInt(diastolic, 10);
  const valid = sys >= 60 && sys <= 260 && dia >= 30 && dia <= 160 && dia < sys;
  const num = (v: string) => faToEnDigits(v).replace(/[^0-9]/g, '');

  return (
    <DashboardLayout title="فشار خون">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/50 text-sm">پایش فشار خون در کنار قند برای بیماران دیابتی اهمیت دوچندان دارد</p>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus size={16} /> ثبت فشار خون</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><HeartPulse size={16} className="text-red-400" /> ثبت فشار خون</span>
                  <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">سیستولیک (بالا)</label>
                    <Input type="text" inputMode="numeric" dir="ltr" placeholder="۱۲۰" value={systolic}
                      onChange={e => setSystolic(num(e.target.value))} className="text-xl font-bold text-center" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">دیاستولیک (پایین)</label>
                    <Input type="text" inputMode="numeric" dir="ltr" placeholder="۸۰" value={diastolic}
                      onChange={e => setDiastolic(num(e.target.value))} className="text-xl font-bold text-center" />
                  </div>
                </div>
                {valid && (
                  <div className="text-center text-sm font-medium" style={{ color: bpStatus(sys, dia).color }}>
                    {bpStatus(sys, dia).label}
                  </div>
                )}
                <Button className="w-full" loading={isPending} disabled={!valid}
                  onClick={() => mutate({ kind: 'BLOOD_PRESSURE', systolic: sys, diastolic: dia, unit: 'mmHg' })}>
                  ثبت
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card>
          <CardHeader><CardTitle>تاریخچه فشار خون</CardTitle></CardHeader>
          <CardContent>
            {logs?.length ? (
              <div className="space-y-2">
                {logs.map((log: any) => {
                  const s = bpStatus(log.systolic, log.diastolic);
                  return (
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-white font-bold text-lg" dir="ltr">{log.systolic}/{log.diastolic}</span>
                      <span className="text-white/40 text-xs">mmHg</span>
                      <Badge variant={s.variant} className="mr-auto">{s.label}</Badge>
                      <span className="text-white/30 text-xs">{toJalaliDateTime(log.loggedAt)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/30 text-sm text-center py-10">هنوز فشار خونی ثبت نشده است</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
