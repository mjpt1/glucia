import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useGlucoseStats(days = 14) {
  return useQuery({
    queryKey: ['glucose', 'stats', days],
    queryFn: async () => (await api.get(`/glucose/stats?days=${days}`)).data,
    staleTime: 60_000,
  });
}

export function useGlucoseLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['glucose', 'logs', params],
    queryFn: async () => (await api.get('/glucose', { params })).data,
    staleTime: 30_000,
  });
}

export function useLogGlucose() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { valueMgDl: number; context: string; note?: string }) => api.post('/glucose', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['glucose'] });
      toast.success('قند خون ثبت شد');
    },
    onError: () => toast.error('خطا در ثبت قند خون'),
  });
}
