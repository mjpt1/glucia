'use client';
import { useEffect, useMemo, useState } from 'react';
import { JALALI_MONTHS, currentJalaliYear, jalaliMonthDays, jalaliToDate } from '@/lib/jalali';

interface Props {
  onChange: (isoDate: string) => void;
  label?: string;
}

const selectCls =
  'bg-white/5 border border-white/10 rounded-xl px-2 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

function todayJalaliPlus(daysAhead: number) {
  const d = new Date(Date.now() + daysAhead * 86400000);
  const parts = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 1);
  return { jy: get('year'), jm: get('month'), jd: get('day') };
}

export function JalaliDateTimePicker({ onChange, label }: Props) {
  const tomorrow = useMemo(() => todayJalaliPlus(1), []);
  const thisYear = useMemo(() => currentJalaliYear(), []);
  const [jy, setJy] = useState(tomorrow.jy);
  const [jm, setJm] = useState(tomorrow.jm);
  const [jd, setJd] = useState(tomorrow.jd);
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);

  const days = jalaliMonthDays(jy, jm);

  useEffect(() => {
    if (jd > days) setJd(days);
  }, [days, jd]);

  useEffect(() => {
    const date = jalaliToDate(jy, jm, Math.min(jd, days), hour, minute);
    onChange(date.toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jy, jm, jd, hour, minute]);

  return (
    <div>
      {label && <label className="text-sm text-white/60 mb-1 block">{label}</label>}
      <div className="grid grid-cols-3 gap-2">
        <select className={selectCls} value={jd} onChange={(e) => setJd(+e.target.value)}>
          {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{d.toLocaleString('fa-IR')}</option>
          ))}
        </select>
        <select className={selectCls} value={jm} onChange={(e) => setJm(+e.target.value)}>
          {JALALI_MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select className={selectCls} value={jy} onChange={(e) => setJy(+e.target.value)}>
          {[thisYear, thisYear + 1].map((y) => (
            <option key={y} value={y}>{y.toLocaleString('fa-IR', { useGrouping: false })}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <select className={selectCls} value={hour} onChange={(e) => setHour(+e.target.value)}>
          {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
            <option key={h} value={h}>ساعت {h.toLocaleString('fa-IR')}</option>
          ))}
        </select>
        <select className={selectCls} value={minute} onChange={(e) => setMinute(+e.target.value)}>
          {[0, 15, 30, 45].map((m) => (
            <option key={m} value={m}>دقیقه {m.toLocaleString('fa-IR')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
