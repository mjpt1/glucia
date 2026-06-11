'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFoods, useMeals, useLogMeal } from '@/hooks/useMeals';
import { toJalaliDateTime } from '@/lib/utils';
import { MEAL_TYPES } from '@/lib/constants';
import { Plus, Search, Utensils, X, Flame, Wheat } from 'lucide-react';

export default function MealsPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('LUNCH');
  const [selectedItems, setSelectedItems] = useState<Array<{ food: any; servingGrams: number }>>([]);
  const { data: foods } = useFoods(search || undefined);
  const { data: meals } = useMeals();
  const { mutate, isPending } = useLogMeal();

  const addFood = (food: any) => {
    if (selectedItems.find(i => i.food.id === food.id)) return;
    setSelectedItems(prev => [...prev, { food, servingGrams: food.servingSize ?? 100 }]);
  };

  const removeItem = (id: string) => setSelectedItems(prev => prev.filter(i => i.food.id !== id));

  const updateServing = (id: string, grams: number) =>
    setSelectedItems(prev => prev.map(i => i.food.id === id ? { ...i, servingGrams: grams } : i));

  const submit = () => {
    if (!selectedItems.length) return;
    mutate({
      mealType,
      items: selectedItems.map(i => ({ foodId: i.food.id, servingGrams: i.servingGrams })),
    }, { onSuccess: () => { setShowForm(false); setSelectedItems([]); setSearch(''); } });
  };

  const totalCarbs = selectedItems.reduce((a, i) => a + (i.food.carbsPer100g ?? 0) * i.servingGrams / 100, 0);
  const totalCal = selectedItems.reduce((a, i) => a + (i.food.caloriesPer100g ?? 0) * i.servingGrams / 100, 0);

  return (
    <DashboardLayout title="وعده‌های غذایی">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white/70 text-sm">ثبت وعده‌های روزانه برای محاسبه کربوهیدرات و تأثیر بر قند خون</h2>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={16} /> ثبت وعده جدید
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Utensils size={16} /> ثبت وعده غذایی</span>
                    <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {MEAL_TYPES.map(t => (
                      <button key={t.value} onClick={() => setMealType(t.value)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${mealType === t.value ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <Input placeholder="جستجوی غذا... (مثل برنج، کباب، ماست)" value={search}
                      onChange={e => setSearch(e.target.value)} className="pr-9" />
                  </div>

                  {search && (
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {(foods ?? []).map((food: any) => (
                        <button key={food.id} onClick={() => addFood(food)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 text-right transition-all border border-transparent hover:border-white/10">
                          <div className="flex-1">
                            <p className="text-white text-sm">{food.nameFa}</p>
                            <p className="text-white/40 text-xs">{food.carbsPer100g}g کربوهیدرات · {food.caloriesPer100g} کالری در ۱۰۰g · GI: {food.glycemicIndex}</p>
                          </div>
                          <Plus size={14} className="text-blue-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedItems.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-white/50 text-xs">غذاهای انتخاب‌شده:</p>
                      {selectedItems.map(item => (
                        <div key={item.food.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-white text-sm flex-1">{item.food.nameFa}</span>
                          <input type="number" value={item.servingGrams} min={10} max={1000}
                            onChange={e => updateServing(item.food.id, +e.target.value)}
                            className="w-16 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center" />
                          <span className="text-white/40 text-xs">g</span>
                          <button onClick={() => removeItem(item.food.id)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                        </div>
                      ))}

                      <div className="flex gap-4 p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                        <div className="flex items-center gap-1.5">
                          <Flame size={14} className="text-orange-400" />
                          <span className="text-white/70 text-sm">{Math.round(totalCal)} کالری</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wheat size={14} className="text-yellow-400" />
                          <span className="text-white/70 text-sm">{Math.round(totalCarbs)}g کربوهیدرات</span>
                        </div>
                      </div>

                      <Button className="w-full" onClick={submit} loading={isPending} disabled={!selectedItems.length}>
                        ثبت وعده
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meals list */}
        <div className="space-y-3">
          {(meals ?? []).map((meal: any) => (
            <Card key={meal.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{MEAL_TYPES.find(t => t.value === meal.mealType)?.label}</Badge>
                    <span className="text-white/40 text-xs">{toJalaliDateTime(meal.eatenAt)}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" />{Math.round(meal.totalCalories ?? 0)}</span>
                    <span className="flex items-center gap-1"><Wheat size={12} className="text-yellow-400" />{Math.round(meal.totalCarbsG ?? 0)}g</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meal.items?.map((item: any) => (
                    <span key={item.id} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs">
                      {item.food?.nameFa} — {item.servingGrams}g
                    </span>
                  ))}
                </div>
                {meal.estimatedGlucoseRise > 0 && (
                  <p className="text-orange-400/70 text-xs mt-2">
                    تخمین افزایش قند: +{Math.round(meal.estimatedGlucoseRise)} mg/dL
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {!meals?.length && (
            <Card>
              <CardContent className="py-16 text-center text-white/30">
                هنوز وعده‌ای ثبت نشده است
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
