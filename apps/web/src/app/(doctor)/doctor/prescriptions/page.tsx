'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toJalali } from '@/lib/utils';
import { FileText, Plus, X, Trash2, Pill } from 'lucide-react';

interface DrugItem { drugName: string; dosage: string; frequency: string; duration: string; instruction: string; }
const emptyItem: DrugItem = { drugName: '', dosage: '', frequency: '', duration: '', instruction: '' };

export default function DoctorPrescriptionsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DrugItem[]>([{ ...emptyItem }]);

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['doctor', 'prescriptions'],
    queryFn: async () => (await api.get('/doctors/prescriptions')).data,
  });
  const { data: patients } = useQuery({
    queryKey: ['doctor', 'patients-list'],
    queryFn: async () => (await api.get('/doctors/patients')).data,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: any) => api.post('/doctors/prescriptions', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor', 'prescriptions'] });
      toast.success('نسخه ثبت شد');
      setShowForm(false); setPatientId(''); setDiagnosis(''); setNotes(''); setItems([{ ...emptyItem }]);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'خطا در ثبت نسخه'),
  });

  const setItem = (i: number, k: keyof DrugItem, v: string) =>
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  const validItems = items.filter(i => i.drugName.trim() && i.dosage.trim() && i.frequency.trim());
  const canSubmit = patientId && validItems.length > 0;

  return (
    <DashboardLayout title="نسخه‌ها">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/50 text-sm">نسخه‌های صادرشده برای بیماران شما</p>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus size={16} /> نسخه جدید</Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><FileText size={16} /> صدور نسخه</span>
                    <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">بیمار</label>
                      <select value={patientId} onChange={e => setPatientId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                        <option value="">انتخاب کنید...</option>
                        {(patients ?? []).map((p: any) => (
                          <option key={p.id} value={p.id}>{p.user?.fullName} — {p.user?.phone}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">تشخیص</label>
                      <Input placeholder="مثال: دیابت نوع ۲ کنترل‌نشده" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/60 block">داروها</label>
                    {items.map((item, i) => (
                      <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                        <Input placeholder="نام دارو *" value={item.drugName} onChange={e => setItem(i, 'drugName', e.target.value)} />
                        <Input placeholder="دوز * (مثل 500mg)" value={item.dosage} onChange={e => setItem(i, 'dosage', e.target.value)} />
                        <Input placeholder="تواتر * (روزی ۲ بار)" value={item.frequency} onChange={e => setItem(i, 'frequency', e.target.value)} />
                        <Input placeholder="مدت (۱ ماه)" value={item.duration} onChange={e => setItem(i, 'duration', e.target.value)} />
                        <div className="flex gap-2">
                          <Input placeholder="توضیح" value={item.instruction} onChange={e => setItem(i, 'instruction', e.target.value)} className="flex-1" />
                          {items.length > 1 && (
                            <button onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-300 shrink-0"><Trash2 size={15} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => setItems(prev => [...prev, { ...emptyItem }])}>
                      <Plus size={14} /> داروی دیگر
                    </Button>
                  </div>

                  <Input placeholder="توصیه‌ها و یادداشت (اختیاری)" value={notes} onChange={e => setNotes(e.target.value)} />
                  <Button className="w-full" loading={isPending} disabled={!canSubmit}
                    onClick={() => mutate({ patientId, diagnosis: diagnosis || undefined, notes: notes || undefined, items: validItems })}>
                    صدور نسخه
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : prescriptions?.length ? (
          <div className="space-y-3">
            {prescriptions.map((rx: any) => (
              <Card key={rx.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{rx.patient?.user?.fullName}</p>
                      {rx.diagnosis && <p className="text-white/50 text-xs mt-0.5">تشخیص: {rx.diagnosis}</p>}
                    </div>
                    <span className="text-white/30 text-xs">{toJalali(rx.createdAt)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {rx.items?.map((item: any) => (
                      <div key={item.id} className="flex flex-wrap items-center gap-2 text-sm p-2 rounded-lg bg-white/5">
                        <Pill size={13} className="text-blue-400" />
                        <span className="text-white font-medium">{item.drugName}</span>
                        <span className="text-white/50 text-xs">{item.dosage} · {item.frequency} · {item.duration}</span>
                        {item.instruction && <span className="text-white/40 text-xs">({item.instruction})</span>}
                      </div>
                    ))}
                  </div>
                  {rx.notes && <p className="text-white/40 text-xs mt-2">{rx.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-16 text-center text-white/30">هنوز نسخه‌ای صادر نشده است</CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
