'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Activity, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { mutate, isPending } = useLogin();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="rtl">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/2 translate-x-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">ورود به گلوسیا</h1>
            <p className="text-white/50 text-sm mt-1">مدیریت هوشمند دیابت</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); mutate({ phone, password }); }} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">شماره موبایل</label>
              <Input type="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" value={phone} onChange={e => setPhone(e.target.value)}
                required pattern="09[0-9]{9}" dir="ltr" className="text-left" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-2 block">رمز عبور</label>
              <div className="relative">
                <Input type={showPwd ? 'text' : 'password'} placeholder="رمز عبور خود را وارد کنید"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" loading={isPending} size="lg">ورود</Button>
          </form>

          <div className="mt-4 text-center text-sm text-white/50">
            حساب ندارید؟{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300">ثبت‌نام کنید</Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-white/30 text-center mb-3">حساب‌های آزمایشی:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'بیمار', phone: '09222222222', pwd: 'Patient@1234' },
                { label: 'پزشک', phone: '09111111111', pwd: 'Doctor@1234' },
                { label: 'مدیر', phone: '09000000000', pwd: 'Admin@1234' },
              ].map(a => (
                <button key={a.label} type="button"
                  onClick={() => { setPhone(a.phone); setPassword(a.pwd); }}
                  className="py-2 px-3 rounded-xl text-xs bg-white/5 hover:bg-white/10 text-white/60 transition-all border border-white/10">
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
