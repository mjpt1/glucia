'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toJalaliDateTime } from '@/lib/utils';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter],
    queryFn: async () => (await api.get('/admin/users', { params: { search, role: roleFilter || undefined } })).data,
  });

  const { mutate: toggleUser } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/admin/users/${id}/toggle`, { isActive }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('وضعیت کاربر تغییر کرد'); },
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
            <option value="PATIENT">بیمار</option>
            <option value="DOCTOR">پزشک</option>
            <option value="ADMIN">مدیر</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="divide-y divide-white/5">
                {(users ?? []).map((u: any) => (
                  <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-white/3 transition-all">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                      {u.fullName?.[0] ?? u.phone[2]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{u.fullName ?? ''}</p>
                      <p className="text-white/40 text-xs">{u.phone} · {u.email}</p>
                    </div>
                    <Badge variant={roleMap[u.role]?.variant ?? 'outline'}>{roleMap[u.role]?.label ?? u.role}</Badge>
                    <span className="text-white/30 text-xs">{toJalaliDateTime(u.createdAt)}</span>
                    <button onClick={() => toggleUser({ id: u.id, isActive: !u.isActive })}
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
