'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import {
  Activity, LayoutDashboard, Utensils, Bot, Calendar, FileText,
  Settings, Users, LogOut, ChevronLeft, Stethoscope, Shield
} from 'lucide-react';

const patientNav = [
  { href: '/patient/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/patient/glucose', label: 'قند خون', icon: Activity },
  { href: '/patient/meals', label: 'وعده‌های غذایی', icon: Utensils },
  { href: '/patient/ai-coach', label: 'کوچ هوشمند', icon: Bot },
  { href: '/patient/appointments', label: 'نوبت‌ها', icon: Calendar },
  { href: '/patient/reports', label: 'گزارش‌ها', icon: FileText },
  { href: '/patient/settings', label: 'تنظیمات', icon: Settings },
];

const doctorNav = [
  { href: '/doctor/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/doctor/patients', label: 'بیماران', icon: Users },
  { href: '/doctor/prescriptions', label: 'نسخه‌ها', icon: FileText },
  { href: '/doctor/appointments', label: 'نوبت‌ها', icon: Calendar },
  { href: '/patient/settings', label: 'تنظیمات', icon: Settings },
];

const adminNav = [
  { href: '/admin/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/reports', label: 'گزارش‌ها', icon: FileText },
  { href: '/patient/settings', label: 'تنظیمات', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const nav = user?.role === 'ADMIN' ? adminNav : user?.role === 'DOCTOR' ? doctorNav : patientNav;
  const roleIcon = user?.role === 'ADMIN' ? Shield : user?.role === 'DOCTOR' ? Stethoscope : Activity;
  const RoleIcon = roleIcon;
  const roleName = user?.role === 'ADMIN' ? 'مدیر سیستم' : user?.role === 'DOCTOR' ? 'پزشک' : 'بیمار';

  return (
    <div className="fixed right-0 top-0 h-full w-64 flex flex-col bg-gray-950/80 backdrop-blur-xl border-l border-white/10 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">گلوسیا</h1>
            <p className="text-xs text-white/40">مدیریت دیابت</p>
          </div>
        </Link>
      </div>

      {/* User */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.firstName?.[0] ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <div className="flex items-center gap-1">
              <RoleIcon className="w-3 h-3 text-blue-400" />
              <p className="text-xs text-white/40">{roleName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: -2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                  active ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                <span>{item.label}</span>
                {active && <ChevronLeft className="w-4 h-4 mr-auto opacity-60" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />
          <span>خروج</span>
        </button>
      </div>
    </div>
  );
}
