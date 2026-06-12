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
import { toJalaliDateTime } from '@/lib/utils';
import { JalaliDateTimePicker } from '@/components/forms/JalaliDateTimePicker';
import { Calendar, Plus, Video, MapPin, X } from 'lucide-react';

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctorId: '', scheduledAt: '', kind: 'IN_PERSON', reason: '' });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'patient'],
    queryFn: async () => (await api.get('/appointments/patient')).data,
  });
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => (await api.get('/appointments/doctors')).data,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: any) => api.post('/appointments', dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('نوبت ثبت شد'); setShowForm(false); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'خطا'),
  });

  const statusLabel: Record<string, { label: string; variant: any }> = {
    PENDING: { label: 'در انتظار', variant: 'warning' },
    CONFIRMED: { label: 'تأیید شده', variant: 'success' },
    IN_PROGRESS: { label: 'در حال انجام', variant: 'default' },
    COMPLETED: { label: 'انجام شده', variant: 'outline' },
    CANCELLED: { label: 'لغو شده', variant: 'destructive' },
    NO_SHOW: { label: 'عدم مراجعه', variant: 'destructive' },
  };

  return (
    <DashboardLayout title="نوبت‌ها">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-white/50 text-sm">مدیریت نوبت‌های پزشکی شما</p>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus size={16} /> نوبت جدید</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>رزرو نوبت</span>
                  <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">انتخاب پزشک</label>
                  <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                    <option value="">انتخاب کنید...</option>
                    {(doctors ?? []).map((d: any) => (
                      <option key={d.id} value={d.id}>
                        دکتر {d.user?.fullName} — {d.specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <JalaliDateTimePicker
                  label="تاریخ و زمان (شمسی)"
                  onChange={(iso) => setForm(f => ({ ...f, scheduledAt: iso }))}
                />
                <div className="flex gap-3">
                  {[{ v: 'IN_PERSON', l: 'حضوری', icon: MapPin }, { v: 'VIDEO', l: 'آنلاین', icon: Video }].map(k => (
                    <button key={k.v} onClick={() => setForm(f => ({ ...f, kind: k.v }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-all ${form.kind === k.v ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                      <k.icon size={14} />{k.l}
                    </button>
                  ))}
                </div>
                <Input placeholder="دلیل مراجعه (اختیاری)" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
                <Button className="w-full" loading={isPending} onClick={() => mutate(form)} disabled={!form.doctorId || !form.scheduledAt}>
                  ثبت نوبت
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-3">
          {(appointments ?? []).map((appt: any) => {
            const s = statusLabel[appt.status] ?? { label: appt.status, variant: 'outline' };
            return (
              <Card key={appt.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    {appt.kind === 'VIDEO' ? <Video className="text-blue-400" size={20} /> : <Calendar className="text-blue-400" size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">دکتر {appt.doctor?.user?.fullName}</p>
                    <p className="text-white/50 text-sm mt-0.5">{toJalaliDateTime(appt.scheduledAt)}</p>
                    {appt.reason && <p className="text-white/30 text-xs mt-0.5">{appt.reason}</p>}
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                  {appt.kind === 'VIDEO' && appt.videoRoomId && appt.status === 'CONFIRMED' && (
                    <a href={`https://meet.jit.si/${appt.videoRoomId}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">ورود به جلسه</Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {!appointments?.length && (
            <Card><CardContent className="py-16 text-center text-white/30">هنوز نوبتی ندارید</CardContent></Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
