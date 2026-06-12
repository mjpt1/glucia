'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { faToEnDigits } from '@/lib/utils';

export default function RegisterPage() {
  const [form, setForm] = useState({ phone: '', password: '', fullName: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { mutate, isPending } = useRegister();
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: k === 'phone' ? faToEnDigits(v) : v }));

  const valid = /^09[0-9]{9}$/.test(form.phone) && form.password.length >= 8 && form.fullName.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="rtl">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">ثبت‌نام در گلوسیا</h1>
            <p className="text-white/50 text-sm mt-1">مدیریت هوشمند دیابت</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (valid) mutate(form); }} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">نام و نام خانوادگی</label>
              <Input placeholder="مثال: علی احمدی" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">شماره موبایل</label>
              <Input type="tel" placeholder="09xxxxxxxxx" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                pattern="09[0-9]{9}" dir="ltr" className="text-left" required />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">رمز عبور (حداقل ۸ کاراکتر)</label>
              <div className="relative">
                <Input type={showPwd ? 'text' : 'password'} placeholder="رمز عبور قوی انتخاب کنید"
                  value={form.password} onChange={(e) => set('password', e.target.value)} minLength={8} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={isPending} disabled={!valid}>
              ثبت‌نام
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-white/50">
            حساب دارید؟{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">وارد شوید</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
