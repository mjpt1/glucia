'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Bot, KeyRound, Info } from 'lucide-react';

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get('/admin/settings')).data,
  });

  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setModel(settings.openai_model ?? '');
      setBaseUrl(settings.openai_base_url ?? '');
    }
  }, [settings]);

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: any) => api.put('/admin/settings', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('تنظیمات ذخیره شد — کوچ هوشمند تا ۱ دقیقه دیگر فعال می‌شود');
      setApiKey('');
    },
    onError: () => toast.error('خطا در ذخیره تنظیمات'),
  });

  const save = () => {
    const dto: Record<string, string> = {};
    if (apiKey.trim()) dto.openai_api_key = apiKey.trim();
    if (model.trim()) dto.openai_model = model.trim();
    if (baseUrl.trim()) dto.openai_base_url = baseUrl.trim();
    if (!Object.keys(dto).length) { toast('چیزی برای ذخیره وارد نشده'); return; }
    mutate(dto);
  };

  return (
    <DashboardLayout title="تنظیمات برنامه">
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Bot size={16} className="text-purple-400" /> هوش مصنوعی (کوچ هوشمند)</span>
              {settings?.openai_api_key_set === 'true'
                ? <Badge variant="success">پیکربندی شده ({settings.openai_api_key_masked})</Badge>
                : <Badge variant="warning">پیکربندی نشده</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 text-xs text-white/60 leading-relaxed">
              <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                کلید API از OpenAI یا هر سرویس سازگار (OpenRouter، AvalAI، Gapgpt و…) را وارد کنید.
                برای سرویس‌های غیر OpenAI، «آدرس سرویس» را هم تنظیم کنید — مثلاً برای OpenRouter:
                <code className="mx-1 text-blue-300" dir="ltr">https://openrouter.ai/api/v1</code>
              </span>
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block flex items-center gap-1"><KeyRound size={12} /> کلید API</label>
              <Input type="password" placeholder={settings?.openai_api_key_set === 'true' ? 'برای تغییر، کلید جدید را وارد کنید' : 'sk-...'}
                value={apiKey} onChange={e => setApiKey(e.target.value)} dir="ltr" className="text-left" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">نام مدل</label>
                <Input placeholder="gpt-4o-mini" value={model} onChange={e => setModel(e.target.value)} dir="ltr" className="text-left" />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">آدرس سرویس (اختیاری)</label>
                <Input placeholder="https://api.openai.com/v1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} dir="ltr" className="text-left" />
              </div>
            </div>
            <Button className="w-full" onClick={save} loading={isPending}>ذخیره تنظیمات</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>اطلاعات سامانه</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-white/60">
            <div className="flex justify-between py-1 border-b border-white/5"><span>نسخه</span><span className="text-white">1.0.0</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span>API</span><span className="text-white" dir="ltr">glucia-api.vercel.app</span></div>
            <div className="flex justify-between py-1"><span>پایگاه داده</span><span className="text-white">PostgreSQL (Prisma)</span></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
