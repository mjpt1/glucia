import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useLogin() {
  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: (dto: { phone: string; password: string }) => api.post('/auth/login', dto).then(r => r.data),
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      const me = await api.get('/auth/me').then(r => r.data);
      setUser(me);
      const role = me.role;
      router.replace(role === 'ADMIN' ? '/admin/dashboard' : role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
    },
    onError: () => toast.error('شماره یا رمز عبور اشتباه است'),
  });
}

export function useRegister() {
  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: (dto: any) => api.post('/auth/register', dto).then(r => r.data),
    onSuccess: async (data) => {
      setTokens(data.accessToken, data.refreshToken);
      const me = await api.get('/auth/me').then(r => r.data);
      setUser(me);
      router.replace('/patient/dashboard');
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'خطا در ثبت‌نام'),
  });
}
