'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlucoseChart } from '@/components/charts/GlucoseChart';
import api from '@/lib/api';
import { glucoseColor, glucoseLabel, toJalaliDateTime } from '@/lib/utils';
import { DIABETES_TYPES } from '@/lib/constants';
import { ArrowRight, FileText, Phone, Zap, Activity, Target, Scale } from 'lucide-react';

export default function DoctorPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['doctor', 'patient', id],
    queryFn: async () => (await api.get(`/doctors/patients/${id}`)).data,
    enabled: !!id,
  });

  const logs = patient?.glucoseLogs ?? [];
  const values = logs.map((l: any) => l.valueMgDl);
  const avg = values.length ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length) : null;
  const min = patient?.targetGlucoseMin ?? 70;
  const max = patient?.targetGlucoseMax ?? 180;
  const tir = values.length ? Math.round((values.filter((v: number) => v >= min && v <= max).length / values.length) * 100) : null;

  if (isLoading) {
    return (
      <DashboardLayout title="پرونده بیمار">
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return (
      <DashboardLayout title="پرونده بیمار">
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-white/50">بیمار یافت نشد یا در فهرست بیماران شما نیست</p>
            <Button variant="outline" onClick={() => router.push('/doctor/patients')}>بازگشت به فهرست بیماران</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="پرونده بیمار">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="p-5 flex flex-wrap items-center gap-4">
            <button onClick={() => router.push('/doctor/patients')}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <ArrowRight size={18} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {patient.user?.fullName?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-[180px]">
              <h2 className="text-white text-lg font-bold">{patient.user?.fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-white/50">
                <span className="flex items-center gap-1"><Phone size={11} />{patient.user?.phone}</span>
                <Badge variant="default">{DIABETES_TYPES.find(t => t.value === patient.diabetesType)?.label ?? patient.diabetesType}</Badge>
                {patient.diagnosisYear && <span>تشخیص: {patient.diagnosisYear}</span>}
              </div>
            </div>
            <Link href="/doctor/prescriptions">
              <Button className="gap-2"><FileText size={15} /> صدور نسخه</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'امتیاز سلامت', value: patient.healthScore ?? '—', unit: 'از ۱۰۰', icon: Zap, color: patient.healthScore >= 70 ? '#22c55e' : patient.healthScore >= 50 ? '#f97316' : '#ef4444' },
            { label: 'میانگین قند اخیر', value: avg ?? '—', unit: 'mg/dL', icon: Activity, color: avg ? glucoseColor(avg, min, max) : '#6b7280' },
            { label: 'در محدوده (۲۰ اندازه اخیر)', value: tir ?? '—', unit: 'درصد', icon: Target, color: (tir ?? 0) >= 70 ? '#22c55e' : '#f97316' },
            { label: 'وزن / قد', value: `${patient.weightKg ?? '—'} / ${patient.heightCm ?? '—'}`, unit: 'kg / cm', icon: Scale, color: '#60a5fa' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/50 text-xs">{s.label}</p>
                  <s.icon size={15} style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-white/30 text-xs">{s.unit}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Glucose chart */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>قند خون — ۲۰ اندازه‌گیری اخیر</CardTitle></CardHeader>
            <CardContent>
              {logs.length ? (
                <GlucoseChart data={logs} targetMin={min} targetMax={max} height={260} />
              ) : (
                <div className="h-60 flex items-center justify-center text-white/30 text-sm">اندازه‌گیری ثبت نشده است</div>
              )}
            </CardContent>
          </Card>

          {/* AI insights for doctor */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={15} className="text-yellow-400" /> هشدارها و بینش‌ها</CardTitle></CardHeader>
            <CardContent>
              {patient.aiInsights?.length ? (
                <div className="space-y-2">
                  {patient.aiInsights.map((ins: any) => (
                    <div key={ins.id} className={`p-3 rounded-xl border ${ins.severity === 'HIGH' || ins.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                      <p className="text-white text-sm font-medium">{ins.title}</p>
                      <p className="text-white/50 text-xs mt-1 leading-relaxed">{ins.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm text-center py-8">بینش فعالی وجود ندارد</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent logs table */}
        <Card>
          <CardHeader><CardTitle>اندازه‌گیری‌های اخیر</CardTitle></CardHeader>
          <CardContent>
            {logs.length ? (
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 transition-all text-sm">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: glucoseColor(log.valueMgDl, min, max) }} />
                    <span className="text-white font-bold w-12">{log.valueMgDl}</span>
                    <span className="text-white/40 text-xs">mg/dL</span>
                    <Badge variant={log.valueMgDl < min ? 'destructive' : log.valueMgDl <= max ? 'success' : 'warning'} className="mr-auto">
                      {glucoseLabel(log.valueMgDl, min, max)}
                    </Badge>
                    <span className="text-white/30 text-xs">{toJalaliDateTime(log.measuredAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm text-center py-8">اندازه‌گیری ثبت نشده است</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
