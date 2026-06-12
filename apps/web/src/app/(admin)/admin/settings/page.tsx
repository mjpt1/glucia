'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Bot, KeyRound, Info, Utensils, Users, ScrollText, ChevronLeft } from 'lucide-react';

const AI_PROVIDERS = [
  { id: 'openai', label: 'OpenAI (ChatGPT)', baseUrl: '', modelHint: 'gpt-4o-mini' },
  { id: 'openrouter', label: 'OpenRouter (همه مدل‌ها)', baseUrl: 'https://openrouter.ai/api/v1', modelHint: 'openai/gpt-4o-mini' },
  { id: 'anthropic', label: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com/v1/', modelHint: 'claude-haiku-4-5-20251001' },
  { id: 'gemini', label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/', modelHint: 'gemini-2.0-flash' },
  { id: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', modelHint: 'deepseek-chat' },
  { id: 'avalai', label: 'AvalAI (ایران)', baseUrl: 'https://api.avalai.ir/v1', modelHint: 'gpt-4o-mini' },
  { id: 'gapgpt', label: 'GapGPT (ایران)', baseUrl: 'https://api.gapgpt.app/v1', modelHint: 'gpt-4o-mini' },
  { id: 'custom', label: 'سفارشی (سازگار با OpenAI)', baseUrl: '', modelHint: '' },
];

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get('/admin/settings')).data,
  });

  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setProvider(settings.ai_provider ?? 'openai');
      setModel(settings.openai_model ?? '');
      setBaseUrl(settings.openai_base_url ?? '');
    }
  }, [settings]);

  const providerInfo = AI_PROVIDERS.find(p => p.id === provider) ?? AI_PROVIDERS[0];

  const selectProvider = (id: string) => {
    setProvider(id);
    const p = AI_PROVIDERS.find(x => x.id === id)!;
    setBaseUrl(p.baseUrl);
    if (p.modelHint) setModel(p.modelHint);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: any) => api.put('/admin/settings', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('تنظیمات ذخیره شد — کوچ هوشمند تا ۱ دقیقه دیگر با تنظیمات جدید کار می‌کند');
      setApiKey('');
    },
    onError: () => toast.error('خطا در ذخیره تنظیمات'),
  });

  const save = () => {
    const dto: Record<string, string> = { ai_provider: provider };
    if (apiKey.trim()) dto.openai_api_key = apiKey.trim();
    if (model.trim()) dto.openai_model = model.trim();
    dto.openai_base_url = baseUrl.trim() || '__CLEAR__';
    mutate(dto);
  };

  const quickLinks = [
    { href: '/admin/foods', label: 'مدیریت غذاها', desc: 'افزودن، ویرایش و ایمپورت اکسل پایگاه غذایی', icon: Utensils },
    { href: '/admin/users', label: 'مدیریت کاربران', desc: 'ساخت کاربر، فعال/غیرفعال‌سازی', icon: Users },
    { href: '/admin/reports', label: 'گزارش‌ها و رویدادها', desc: 'آمار سامانه و لاگ فعالیت‌ها', icon: ScrollText },
  ];

  return (
    <DashboardLayout title="تنظیمات برنامه">
      <div className="space-y-6 max-w-3xl">
        {/* Quick management links */}
        <div className="grid md:grid-cols-3 gap-3">
          {quickLinks.map(l => (
            <Link key={l.href} href={l.href}>
              <Card className="hover:border-blue-500/30 transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 flex items-center justify-center shrink-0">
                    <l.icon size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{l.label}</p>
                    <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{l.desc}</p>
                  </div>
                  <ChevronLeft size={15} className="text-white/30 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

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
            <div>
              <label className="text-xs text-white/60 mb-2 block">سرویس‌دهنده هوش مصنوعی</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AI_PROVIDERS.map(p => (
                  <button key={p.id} type="button" onClick={() => selectProvider(p.id)}
                    className={`py-2 px-2 rounded-xl text-xs transition-all border ${provider === p.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 text-xs text-white/60 leading-relaxed">
              <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                هر سرویس سازگار با OpenAI API پشتیبانی می‌شود. کلید را از پنل همان سرویس بگیرید؛
                {providerInfo.baseUrl && <> آدرس سرویس به‌صورت خودکار <code className="mx-1 text-blue-300" dir="ltr">{providerInfo.baseUrl}</code> تنظیم شد؛</>}
                {' '}برای کاربران داخل ایران، AvalAI و GapGPT و OpenRouter بدون تحریم کار می‌کنند.
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
                <Input placeholder={providerInfo.modelHint || 'gpt-4o-mini'} value={model} onChange={e => setModel(e.target.value)} dir="ltr" className="text-left" />
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">آدرس سرویس</label>
                <Input placeholder="https://api.openai.com/v1" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} dir="ltr" className="text-left" />
              </div>
            </div>
            <Button className="w-full" onClick={save} loading={isPending}>ذخیره تنظیمات هوش مصنوعی</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>اطلاعات سامانه</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-white/60">
            <div className="flex justify-between py-1 border-b border-white/5"><span>نسخه</span><span className="text-white">1.1.0</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span>API</span><span className="text-white" dir="ltr">glucia-api.vercel.app</span></div>
            <div className="flex justify-between py-1"><span>پایگاه داده</span><span className="text-white">PostgreSQL (Prisma)</span></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
