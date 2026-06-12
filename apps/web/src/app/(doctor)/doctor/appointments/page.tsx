'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { toJalaliDateTime } from '@/lib/utils';
import { Calendar, Video, Check, X as XIcon, CheckCheck } from 'lucide-react';

const STATUS: Record<string, { label: string; variant: any }> = {
  PENDING: { label: 'در انتظار', variant: 'warning' },
  CONFIRMED: { label: 'تأیید شده', variant: 'success' },
  IN_PROGRESS: { label: 'در حال انجام', variant: 'default' },
  COMPLETED: { label: 'انجام شده', variant: 'outline' },
  CANCELLED: { label: 'لغو شده', variant: 'destructive' },
  NO_SHOW: { label: 'عدم مراجعه', variant: 'destructive' },
};

export default function DoctorAppointmentsPage() {
  const qc = useQueryClient();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'doctor'],
    queryFn: async () => (await api.get('/appointments/doctor')).data,
  });

  const { mutate: setStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/appointments/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('وضعیت نوبت به‌روز شد'); },
    onError: () => toast.error('خطا در تغییر وضعیت'),
  });

  return (
    <DashboardLayout title="نوبت‌های من">
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : appointments?.length ? (
          appointments.map((appt: any) => {
            const s = STATUS[appt.status] ?? { label: appt.status, variant: 'outline' };
            return (
              <Card key={appt.id}>
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-600/20 flex items-center justify-center">
                    {appt.kind === 'VIDEO' ? <Video className="text-blue-400" size={18} /> : <Calendar className="text-blue-400" size={18} />}
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-white font-medium">{appt.patient?.user?.fullName}</p>
                    <p className="text-white/40 text-xs mt-0.5">{appt.patient?.user?.phone} · {toJalaliDateTime(appt.scheduledAt)}</p>
                    {appt.note && <p className="text-white/30 text-xs mt-0.5">{appt.note}</p>}
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                  {appt.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" className="gap-1" onClick={() => setStatus({ id: appt.id, status: 'CONFIRMED' })}>
                        <Check size={14} /> تأیید
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => setStatus({ id: appt.id, status: 'CANCELLED' })}>
                        <XIcon size={14} /> لغو
                      </Button>
                    </div>
                  )}
                  {appt.status === 'CONFIRMED' && (
                    <div className="flex gap-2">
                      {appt.kind === 'VIDEO' && appt.videoRoomId && (
                        <a href={`https://meet.jit.si/${appt.videoRoomId}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">ورود به جلسه</Button>
                        </a>
                      )}
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setStatus({ id: appt.id, status: 'COMPLETED' })}>
                        <CheckCheck size={14} /> انجام شد
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card><CardContent className="py-16 text-center text-white/30">نوبتی ثبت نشده است</CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
