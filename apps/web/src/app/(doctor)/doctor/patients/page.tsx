'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Search, ChevronLeft } from 'lucide-react';

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState('');
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor', 'patients', search],
    queryFn: async () => (await api.get('/doctors/patients', { params: { search } })).data,
  });

  return (
    <DashboardLayout title="بیماران">
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
          <Input placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {(patients ?? []).map((p: any) => (
              <Link href={`/doctor/patients/${p.id}`} key={p.id}>
                <Card className="hover:border-blue-500/30 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3 lg:gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {p.user?.fullName?.[0] ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{p.user?.fullName}</p>
                      <p className="text-white/40 text-xs mt-0.5 truncate">{p.user?.phone} · {p.diabetesType}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <p className={`font-bold ${p.healthScore >= 70 ? 'text-green-400' : p.healthScore >= 50 ? 'text-orange-400' : 'text-red-400'}`}>{p.healthScore ?? '—'}</p>
                      <p className="text-white/30 text-xs">سلامت</p>
                    </div>
                    <Badge variant={p.healthScore >= 70 ? 'success' : p.healthScore >= 50 ? 'warning' : 'destructive'} className="hidden sm:inline-flex shrink-0">
                      {p._count?.glucoseLogs ?? 0} اندازه‌گیری
                    </Badge>
                    <ChevronLeft size={16} className="text-white/30 shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
