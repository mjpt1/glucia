'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toJalaliDateTime, faToEnDigits } from '@/lib/utils';
import { Search, ToggleLeft, ToggleRight, UserPlus, X } from 'lucide-react';

const ROLES = [
  { value: 'PATIENT', label: 'بیمار' },
  { value: 'DOCTOR', label: 'پزشک' },
  { value: 'ADMIN', label: 'مدیر' },
];

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', password: '', role: 'PATIENT', specialty: '' });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: k === 'phone' ? faToEnDigits(v) : v }));
  const formValid = /^09[0-9]{9}$/.test(form.phone) && form.password.length >= 8 && form.fullName.trim().length >= 2;

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter],
    queryFn: async () => (await api.get('/admin/users', { params: { search, role: roleFilter || undefined } })).data,
  });

  const { mutate: toggleUser } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/admin/users/${id}/toggle`, { isActive }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('وضعیت کاربر تغییر کرد'); },
  });

  const { mutate: createUser, isPending: creating } = useMutation({
    mutationFn: (dto: any) => api.post('/admin/users', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('کاربر جدید ساخته شد');
      setShowCreate(false);
      setForm({ fullName: '', phone: '', password: '', role: 'PATIENT', specialty: '' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'خطا در ساخت کاربر'),
  });

  const roleMap: Record<string, { label: string; variant: any }> = {
    ADMIN: { label: 'مدیر', variant: 'destructive' },
    DOCTOR: { label: 'پزشک', variant: 'default' },
    PATIENT: { label: 'بیمار', variant: 'success' },
  };

  return (
    <DashboardLayout title="مدیریت کاربران">
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white/70">
            <option value="">همه نقش‌ها</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
            <UserPlus size={16} /> کاربر جدید
          </Button>
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><UserPlus size={16} /> ساخت کاربر جدید</span>
                    <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">نام و نام خانوادگی</label>
                      <Input placeholder="مثال: مریم محمدی" value={form.fullName} onChange={e => set('fullName', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">شماره موبایل</label>
                      <Input type="tel" placeholder="09xxxxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" className="text-left" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">رمز عبور (حداقل ۸ کاراکتر)</label>
                      <Input type="text" placeholder="رمز اولیه کاربر" value={form.password} onChange={e => set('password', e.target.value)} dir="ltr" className="text-left" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">نقش</label>
                      <div className="flex gap-2">
                        {ROLES.map(r => (
                          <button key={r.value} type="button" onClick={() => set('role', r.value)}
                            className={`flex-1 py-2.5 rounded-xl text-xs transition-all border ${form.role === r.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.role === 'DOCTOR' && (
                      <div className="md:col-span-2">
                        <label className="text-xs text-white/60 mb-1 block">تخصص</label>
                        <Input placeholder="مثال: غدد و متابولیسم" value={form.specialty} onChange={e => set('specialty', e.target.value)} />
                      </div>
                    )}
                  </div>
                  <Button className="w-full" onClick={() => createUser(form)} loading={creating} disabled={!formValid}>
                    ساخت کاربر
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="divide-y divide-white/5">
                {(users ?? []).map((u: any) => (
                  <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                      {u.fullName?.[0] ?? u.phone[2]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{u.fullName ?? ''}</p>
                      <p className="text-white/40 text-xs">{u.phone}{u.email ? ` · ${u.email}` : ''}</p>
                    </div>
                    <Badge variant={roleMap[u.role]?.variant ?? 'outline'}>{roleMap[u.role]?.label ?? u.role}</Badge>
                    <span className="text-white/30 text-xs">{toJalaliDateTime(u.createdAt)}</span>
                    <button onClick={() => toggleUser({ id: u.id, isActive: !u.isActive })}
                      title={u.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                      className={`transition-all ${u.isActive ? 'text-green-400 hover:text-red-400' : 'text-red-400 hover:text-green-400'}`}>
                      {u.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
