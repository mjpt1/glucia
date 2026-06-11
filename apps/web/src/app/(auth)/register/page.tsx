'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity } from 'lucide-react';
import { DIABETES_TYPES } from '@/lib/constants';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ phone: '', password: '', firstName: '', lastName: '', diabetesType: 'TYPE_2', role: 'PATIENT' });
  const { mutate, isPending } = useRegister();
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

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
          </div>

          <div className="flex gap-2 mb-6">
            {[1, 2].map(s => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} />
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">شماره موبایل</label>
                <Input type="tel" placeholder="09xxxxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} dir="ltr" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">رمز عبور</label>
                <Input type="password" placeholder="حداقل ۸ کاراکتر" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => setStep(2)} disabled={!form.phone || form.password.length < 6}>
                مرحله بعد
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">نام</label>
                  <Input placeholder="علی" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">نام خانوادگی</label>
                  <Input placeholder="احمدی" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">نوع دیابت</label>
                <div className="grid grid-cols-2 gap-2">
                  {DIABETES_TYPES.slice(0, 4).map(t => (
                    <button key={t.value} type="button" onClick={() => set('diabetesType', t.value)}
                      className={`py-2 px-3 rounded-xl text-xs transition-all border ${form.diabetesType === t.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">برگشت</Button>
                <Button loading={isPending} className="flex-1"
                  onClick={() => mutate(form)} disabled={!form.firstName}>
                  ثبت‌نام
                </Button>
              </div>
            </motion.div>
          )}

          <div className="mt-4 text-center text-sm text-white/50">
            حساب دارید؟{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">وارد شوید</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
