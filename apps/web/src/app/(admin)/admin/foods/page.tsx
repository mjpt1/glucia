'use client';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { faToEnDigits } from '@/lib/utils';
import { Utensils, Plus, X, Search, Trash2, FileSpreadsheet, Download, Upload } from 'lucide-react';

const CATEGORIES = [
  { value: 'RICE', label: 'برنج' }, { value: 'BREAD', label: 'نان' }, { value: 'SOUP', label: 'سوپ و آش' },
  { value: 'STEW', label: 'خورشت' }, { value: 'KEBAB', label: 'کباب' }, { value: 'SALAD', label: 'سالاد' },
  { value: 'DAIRY', label: 'لبنیات' }, { value: 'FRUIT', label: 'میوه' }, { value: 'VEGETABLE', label: 'سبزیجات' },
  { value: 'LEGUME', label: 'حبوبات' }, { value: 'NUTS', label: 'آجیل' }, { value: 'SWEETS', label: 'شیرینی' },
  { value: 'DRINK', label: 'نوشیدنی' }, { value: 'FAST_FOOD', label: 'فست‌فود' }, { value: 'TRADITIONAL', label: 'سنتی' },
  { value: 'BREAKFAST_ITEM', label: 'صبحانه' }, { value: 'SAUCE', label: 'سس' },
];
const catLabel = (v: string) => CATEGORIES.find(c => c.value === v)?.label ?? v;

const SAMPLE_ROWS = [
  { nameFa: 'کوکو سبزی', nameEn: 'Kuku Sabzi', category: 'سنتی', servingDesc: 'یک برش متوسط', servingGrams: 120, calories: 210, carbsG: 9, proteinG: 8, fatG: 16, fiberG: 3, sugarG: 2, glycemicIndex: 35, glycemicLoad: 3.2 },
  { nameFa: 'شیر کم‌چرب', nameEn: 'Low-fat Milk', category: 'لبنیات', servingDesc: 'یک لیوان', servingGrams: 240, calories: 110, carbsG: 12, proteinG: 8, fatG: 2.5, fiberG: 0, sugarG: 12, glycemicIndex: 32, glycemicLoad: 3.8 },
];

export default function AdminFoodsPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [importing, setImporting] = useState(false);
  const [form, setForm] = useState({ nameFa: '', category: 'TRADITIONAL', servingDesc: '', servingGrams: '100', calories: '', carbsG: '', proteinG: '', fatG: '', glycemicIndex: '50' });

  const numKeys = ['servingGrams', 'calories', 'carbsG', 'proteinG', 'fatG', 'glycemicIndex'];
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: numKeys.includes(k) ? faToEnDigits(v).replace(/[^0-9.]/g, '') : v }));

  const { data: foods, isLoading } = useQuery({
    queryKey: ['admin', 'foods', search],
    queryFn: async () => (await api.get('/admin/foods', { params: { search: search || undefined } })).data,
  });

  const { mutate: createFood, isPending: creating } = useMutation({
    mutationFn: (dto: any) => api.post('/admin/foods', dto).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] });
      toast.success('غذا اضافه شد');
      setShowAdd(false);
      setForm({ nameFa: '', category: 'TRADITIONAL', servingDesc: '', servingGrams: '100', calories: '', carbsG: '', proteinG: '', fatG: '', glycemicIndex: '50' });
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'خطا در ثبت غذا'),
  });

  const { mutate: deleteFood } = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/foods/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'foods'] }); toast.success('غذا حذف شد'); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'خطا در حذف'),
  });

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Foods');
    XLSX.writeFile(wb, 'glucia-foods-template.xlsx');
  };

  const handleFile = async (file: File) => {
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      if (!rows.length) { toast.error('فایل خالی است'); return; }
      const res = await api.post('/admin/foods/import', { foods: rows }).then(r => r.data);
      qc.invalidateQueries({ queryKey: ['admin', 'foods'] });
      toast.success(`ایمپورت انجام شد: ${res.created} جدید، ${res.updated} به‌روزرسانی${res.errors?.length ? `، ${res.errors.length} خطا` : ''}`, { duration: 6000 });
      if (res.errors?.length) console.warn('Import errors:', res.errors);
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'خطا در خواندن یا ایمپورت فایل');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <DashboardLayout title="مدیریت غذاها">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input placeholder="جستجوی غذا..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
          </div>
          <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
            <Download size={15} /> دانلود نمونه اکسل
          </Button>
          <Button variant="outline" className="gap-2" loading={importing} onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> ایمپورت اکسل
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <Button className="gap-2" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={16} /> غذای جدید
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 text-xs text-white/60 leading-relaxed">
          <FileSpreadsheet size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <span>
            ستون‌های اکسل: <code dir="ltr" className="text-blue-300">nameFa, nameEn, category, servingDesc, servingGrams, calories, carbsG, proteinG, fatG, fiberG, sugarG, glycemicIndex, glycemicLoad</code>
            — سرستون فارسی (نام غذا، دسته، گرم، کالری، کربوهیدرات و…) هم پشتیبانی می‌شود. غذای هم‌نام به‌روزرسانی می‌شود.
          </span>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Utensils size={16} /> افزودن غذا</span>
                    <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">نام غذا *</label>
                      <Input placeholder="مثال: عدس‌پلو" value={form.nameFa} onChange={e => set('nameFa', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">دسته</label>
                      <select value={form.category} onChange={e => set('category', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 mb-1 block">شرح واحد *</label>
                      <Input placeholder="مثال: یک بشقاب متوسط" value={form.servingDesc} onChange={e => set('servingDesc', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { k: 'servingGrams', l: 'گرم واحد' }, { k: 'calories', l: 'کالری' }, { k: 'carbsG', l: 'کربوهیدرات (g)' },
                      { k: 'proteinG', l: 'پروتئین (g)' }, { k: 'fatG', l: 'چربی (g)' }, { k: 'glycemicIndex', l: 'شاخص GI' },
                    ].map(f => (
                      <div key={f.k}>
                        <label className="text-xs text-white/60 mb-1 block">{f.l}</label>
                        <Input type="text" inputMode="decimal" dir="ltr" className="text-center"
                          value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" loading={creating}
                    disabled={!form.nameFa.trim() || !form.servingDesc.trim()}
                    onClick={() => createFood(form)}>
                    ثبت غذا
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardHeader>
            <CardTitle>فهرست غذاها {foods ? `(${foods.length.toLocaleString('fa-IR')})` : ''}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[32rem] overflow-y-auto">
                {(foods ?? []).map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-white">{f.nameFa}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {f.servingDesc} ({f.servingGrams}g) · {f.calories} کالری · {f.carbsG}g کربوهیدرات
                      </p>
                    </div>
                    <Badge variant="outline">{catLabel(f.category)}</Badge>
                    <Badge variant={f.glycemicIndex >= 70 ? 'destructive' : f.glycemicIndex >= 56 ? 'warning' : 'success'}>
                      GI {f.glycemicIndex}
                    </Badge>
                    <button onClick={() => deleteFood(f.id)} title="حذف"
                      className="text-white/30 hover:text-red-400 transition-all p-1"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
