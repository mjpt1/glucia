'use client';
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { DIABETES_TYPES } from '@/lib/constants';
import { User, Shield, Target } from 'lucide-react';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ['patient', 'profile'], queryFn: async () => (await api.get('/patients/profile')).data });
  const [form, setForm] = useState({ fullName: '', email: '', diabetesType: 'TYPE2', weightKg: '', heightCm: '', targetGlucoseMin: '70', targetGlucoseMax: '180' });

  useEffect(() => {
    if (profile) setForm({
      fullName: profile.user?.fullName ?? '',
      email: profile.user?.email ?? '',
      diabetesType: profile.diabetesType ?? 'TYPE2',
      weightKg: String(profile.weightKg ?? ''),
      heightCm: String(profile.heightCm ?? ''),
      targetGlucoseMin: String(profile.targetGlucoseMin ?? 70),
      targetGlucoseMax: String(profile.targetGlucoseMax ?? 180),
    });
  }, [profile]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: any) => api.patch('/patients/profile', dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patient'] }); toast.success('پروفایل به‌روز شد'); },
    onError: () => toast.error('خطا در ذخیره'),
  });

  return (
    <DashboardLayout title="تنظیمات">
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User size={16} />اطلاعات شخصی</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-xs text-white/60 mb-1 block">نام و نام خانوادگی</label><Input value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
            <div><label className="text-xs text-white/60 mb-1 block">ایمیل</label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} dir="ltr" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-white/60 mb-1 block">وزن (kg)</label><Input type="number" value={form.weightKg} onChange={e => set('weightKg', e.target.value)} /></div>
              <div><label className="text-xs text-white/60 mb-1 block">قد (cm)</label><Input type="number" value={form.heightCm} onChange={e => set('heightCm', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield size={16} />اطلاعات پزشکی</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-white/60 mb-2 block">نوع دیابت</label>
              <div className="grid grid-cols-2 gap-2">
                {DIABETES_TYPES.map(t => (
                  <button key={t.value} onClick={() => set('diabetesType', t.value)}
                    className={`py-2 px-3 rounded-xl text-xs transition-all border ${form.diabetesType === t.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target size={16} />محدوده هدف قند خون</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">حداقل (mg/dL)</label>
                <Input type="number" value={form.targetGlucoseMin} onChange={e => set('targetGlucoseMin', e.target.value)} min={40} max={120} />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">حداکثر (mg/dL)</label>
                <Input type="number" value={form.targetGlucoseMax} onChange={e => set('targetGlucoseMax', e.target.value)} min={100} max={300} />
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
              <div className="absolute top-0 bottom-0 bg-green-500/40 rounded-full"
                style={{ left: `${(+form.targetGlucoseMin / 400) * 100}%`, right: `${100 - (+form.targetGlucoseMax / 400) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={() => mutate(form)} loading={isPending}>ذخیره تغییرات</Button>
      </div>
    </DashboardLayout>
  );
}
