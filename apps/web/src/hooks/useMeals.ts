import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useFoods(search?: string, category?: string) {
  return useQuery({
    queryKey: ['foods', search, category],
    queryFn: async () => (await api.get('/meals/foods', { params: { q: search, category } })).data,
    staleTime: 300_000,
  });
}

export function useMeals(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['meals', params],
    queryFn: async () => (await api.get('/meals', { params })).data,
    staleTime: 60_000,
  });
}

export function useLogMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/meals', dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meals'] }); toast.success('وعده غذایی ثبت شد'); },
    onError: () => toast.error('خطا در ثبت وعده'),
  });
}
