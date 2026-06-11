'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogGlucose } from '@/hooks/useGlucose';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GLUCOSE_CONTEXTS } from '@/lib/constants';
import { glucoseColor, glucoseLabel } from '@/lib/utils';
import { Droplets, X } from 'lucide-react';

export function GlucoseLogForm({ onClose }: { onClose?: () => void }) {
  const [value, setValue] = useState('');
  const [context, setContext] = useState('RANDOM');
  const [note, setNote] = useState('');
  const { mutate, isPending } = useLogGlucose();

  const numVal = parseFloat(value);
  const isValid = numVal >= 20 && numVal <= 600;
  const color = isValid ? glucoseColor(numVal) : '#6b7280';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    mutate({ valueMgDl: numVal, context, note: note || undefined }, { onSuccess: () => { setValue(''); onClose?.(); } });
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gray-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">ثبت قند خون</h3>
        </div>
        {onClose && <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-end gap-2 mb-2">
            <Input
              type="number" placeholder="مثال: ۱۲۰" value={value} onChange={e => setValue(e.target.value)}
              className="text-3xl font-bold h-16 text-center"
              style={{ color: isValid ? color : undefined }}
              min={20} max={600} required
            />
            <span className="text-white/40 text-sm pb-4 whitespace-nowrap">mg/dL</span>
          </div>
          {isValid && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-sm font-medium" style={{ color }}>
              {glucoseLabel(numVal)}
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {GLUCOSE_CONTEXTS.map(ctx => (
            <button key={ctx.value} type="button" onClick={() => setContext(ctx.value)}
              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                context === ctx.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}>
              {ctx.label}
            </button>
          ))}
        </div>

        <Input placeholder="یادداشت (اختیاری)" value={note} onChange={e => setNote(e.target.value)} />

        <Button type="submit" className="w-full" loading={isPending} disabled={!isValid}>
          ثبت قند خون
        </Button>
      </form>
    </motion.div>
  );
}
