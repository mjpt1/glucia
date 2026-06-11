import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع seed کردن دیتابیس...');

  // ─── Iranian Foods Database ────────────────────────────────
  console.log('🍽️  افزودن دیتابیس غذاهای ایرانی...');

  const iranianFoods = [
    // برنج و پلوها
    { nameFa: 'برنج سفید ایرانی', nameEn: 'Iranian White Rice', category: 'RICE', servingDesc: 'یک کاسه متوسط (۱۵۰ گرم)', servingGrams: 150, calories: 195, carbsG: 43, proteinG: 3.5, fatG: 0.4, fiberG: 0.6, sugarG: 0, glycemicIndex: 72, giLevel: 'HIGH', glycemicLoad: 31, sugarSpikeNote: 'باعث افزایش سریع قند خون می‌شود', healthierSwap: 'برنج قهوه‌ای یا برنج کنجد دار' },
    { nameFa: 'زرشک پلو', nameEn: 'Zereshk Polo', category: 'RICE', servingDesc: 'یک بشقاب (۲۰۰ گرم)', servingGrams: 200, calories: 280, carbsG: 52, proteinG: 5, fatG: 6, fiberG: 1.2, sugarG: 4, glycemicIndex: 68, giLevel: 'HIGH', glycemicLoad: 35, sugarSpikeNote: 'زرشک کمی GI را کاهش می‌دهد', healthierSwap: 'کمتر برنج + بیشتر زرشک' },
    { nameFa: 'لوبیا پلو', nameEn: 'Lubia Polo', category: 'RICE', servingDesc: 'یک بشقاب (۲۵۰ گرم)', servingGrams: 250, calories: 340, carbsG: 55, proteinG: 12, fatG: 7, fiberG: 5, sugarG: 2, glycemicIndex: 58, giLevel: 'MEDIUM', glycemicLoad: 32, sugarSpikeNote: 'لوبیا GI را کاهش می‌دهد', healthierSwap: 'با برنج کمتر و لوبیای بیشتر' },
    { nameFa: 'باقالی پلو با ماهیچه', nameEn: 'Baghali Polo', category: 'RICE', servingDesc: 'یک بشقاب (۳۰۰ گرم)', servingGrams: 300, calories: 420, carbsG: 58, proteinG: 22, fatG: 10, fiberG: 6, sugarG: 1, glycemicIndex: 55, giLevel: 'MEDIUM', glycemicLoad: 32, sugarSpikeNote: 'باقالی و ماهیچه افزایش قند را کند می‌کنند' },
    { nameFa: 'عدس پلو', nameEn: 'Adas Polo', category: 'RICE', servingDesc: 'یک بشقاب (۲۵۰ گرم)', servingGrams: 250, calories: 320, carbsG: 58, proteinG: 14, fatG: 5, fiberG: 8, sugarG: 3, glycemicIndex: 45, giLevel: 'LOW', glycemicLoad: 26, sugarSpikeNote: 'عدس GI پایینی دارد - مناسب دیابت', healthierSwap: 'گزینه مناسب برای بیماران دیابتی' },
    { nameFa: 'سبزی پلو', nameEn: 'Sabzi Polo', category: 'RICE', servingDesc: 'یک بشقاب (۲۰۰ گرم)', servingGrams: 200, calories: 260, carbsG: 48, proteinG: 5, fatG: 6, fiberG: 3, sugarG: 1, glycemicIndex: 60, giLevel: 'MEDIUM', glycemicLoad: 29, sugarSpikeNote: 'سبزیجات GI را اندکی کاهش می‌دهند' },
    { nameFa: 'ته چین مرغ', nameEn: 'Tahchin Morgh', category: 'RICE', servingDesc: 'یک تکه بزرگ (۳۰۰ گرم)', servingGrams: 300, calories: 480, carbsG: 58, proteinG: 24, fatG: 16, fiberG: 0.8, sugarG: 3, glycemicIndex: 65, giLevel: 'HIGH', glycemicLoad: 38, sugarSpikeNote: 'ماست و تخم‌مرغ افزایش قند را کند می‌کنند' },
    { nameFa: 'کلم پلو', nameEn: 'Kalam Polo', category: 'RICE', servingDesc: 'یک بشقاب (۲۵۰ گرم)', servingGrams: 250, calories: 310, carbsG: 52, proteinG: 14, fatG: 7, fiberG: 4, sugarG: 2, glycemicIndex: 56, giLevel: 'MEDIUM', glycemicLoad: 29 },
    { nameFa: 'رشته پلو', nameEn: 'Reshte Polo', category: 'RICE', servingDesc: 'یک بشقاب (۲۵۰ گرم)', servingGrams: 250, calories: 380, carbsG: 68, proteinG: 10, fatG: 8, fiberG: 2, sugarG: 2, glycemicIndex: 70, giLevel: 'HIGH', glycemicLoad: 48, sugarSpikeNote: 'رشته + برنج قند خون را سریع بالا می‌برد' },
    // خورش‌ها
    { nameFa: 'خورش قورمه سبزی', nameEn: 'Ghormeh Sabzi', category: 'STEW', servingDesc: 'یک بشقاب متوسط (۱۵۰ گرم)', servingGrams: 150, calories: 210, carbsG: 12, proteinG: 18, fatG: 11, fiberG: 5, sugarG: 2, glycemicIndex: 35, giLevel: 'LOW', glycemicLoad: 4, sugarSpikeNote: 'حبوبات و سبزیجات GI را پایین نگه می‌دارند', healthierSwap: 'گزینه بسیار مناسب برای دیابتی‌ها' },
    { nameFa: 'خورش قیمه', nameEn: 'Ghimeh', category: 'STEW', servingDesc: 'یک بشقاب متوسط (۱۵۰ گرم)', servingGrams: 150, calories: 280, carbsG: 22, proteinG: 20, fatG: 13, fiberG: 6, sugarG: 3, glycemicIndex: 45, giLevel: 'LOW', glycemicLoad: 10, healthierSwap: 'مناسب برای دیابتی‌ها به جای قورمه' },
    { nameFa: 'خورش فسنجان', nameEn: 'Fesenjaan', category: 'STEW', servingDesc: 'یک بشقاب متوسط (۱۵۰ گرم)', servingGrams: 150, calories: 380, carbsG: 28, proteinG: 16, fatG: 22, fiberG: 3, sugarG: 18, glycemicIndex: 55, giLevel: 'MEDIUM', glycemicLoad: 15, sugarSpikeNote: 'انار شکر دارد - با احتیاط مصرف کنید' },
    { nameFa: 'خورش بادمجان', nameEn: 'Khoresh Bademjan', category: 'STEW', servingDesc: 'یک بشقاب (۱۵۰ گرم)', servingGrams: 150, calories: 220, carbsG: 18, proteinG: 14, fatG: 10, fiberG: 4, sugarG: 5, glycemicIndex: 38, giLevel: 'LOW', glycemicLoad: 7 },
    { nameFa: 'خورش هویج', nameEn: 'Khoresh Havij', category: 'STEW', servingDesc: 'یک بشقاب (۱۵۰ گرم)', servingGrams: 150, calories: 190, carbsG: 24, proteinG: 12, fatG: 6, fiberG: 3, sugarG: 10, glycemicIndex: 42, giLevel: 'LOW', glycemicLoad: 10 },
    { nameFa: 'خورش کرفس', nameEn: 'Khoresh Karafs', category: 'STEW', servingDesc: 'یک بشقاب (۱۵۰ گرم)', servingGrams: 150, calories: 180, carbsG: 14, proteinG: 14, fatG: 8, fiberG: 3, sugarG: 3, glycemicIndex: 35, giLevel: 'LOW', glycemicLoad: 5 },
    // کباب‌ها
    { nameFa: 'کباب کوبیده', nameEn: 'Kabab Koobideh', category: 'KEBAB', servingDesc: 'دو سیخ (۱۵۰ گرم)', servingGrams: 150, calories: 290, carbsG: 3, proteinG: 28, fatG: 18, fiberG: 0, sugarG: 1, glycemicIndex: 10, giLevel: 'VERY_LOW', glycemicLoad: 0.3, healthierSwap: 'گزینه مناسب برای دیابتی - بدون برنج' },
    { nameFa: 'جوجه کباب', nameEn: 'Joojeh Kabab', category: 'KEBAB', servingDesc: 'دو سیخ (۱۶۰ گرم)', servingGrams: 160, calories: 240, carbsG: 2, proteinG: 30, fatG: 12, fiberG: 0, sugarG: 1, glycemicIndex: 8, giLevel: 'VERY_LOW', glycemicLoad: 0.2, healthierSwap: 'بهترین گزینه کبابی برای دیابتی' },
    { nameFa: 'کباب برگ', nameEn: 'Kabab Barg', category: 'KEBAB', servingDesc: 'یک سیخ (۱۲۰ گرم)', servingGrams: 120, calories: 260, carbsG: 1, proteinG: 28, fatG: 16, fiberG: 0, sugarG: 0, glycemicIndex: 5, giLevel: 'VERY_LOW', glycemicLoad: 0.1 },
    { nameFa: 'کباب سلطانی', nameEn: 'Kabab Soltani', category: 'KEBAB', servingDesc: 'یک پرس (۲۵۰ گرم)', servingGrams: 250, calories: 480, carbsG: 4, proteinG: 48, fatG: 30, fiberG: 0, sugarG: 1, glycemicIndex: 8, giLevel: 'VERY_LOW', glycemicLoad: 0.3 },
    // آش و سوپ
    { nameFa: 'آش رشته', nameEn: 'Ash Reshte', category: 'SOUP', servingDesc: 'یک کاسه بزرگ (۳۵۰ گرم)', servingGrams: 350, calories: 280, carbsG: 42, proteinG: 12, fatG: 6, fiberG: 8, sugarG: 4, glycemicIndex: 52, giLevel: 'MEDIUM', glycemicLoad: 22, sugarSpikeNote: 'حبوبات و سبزیجات زیاد GI را کاهش می‌دهند' },
    { nameFa: 'حلیم', nameEn: 'Haleem', category: 'SOUP', servingDesc: 'یک کاسه (۳۰۰ گرم)', servingGrams: 300, calories: 350, carbsG: 48, proteinG: 20, fatG: 8, fiberG: 4, sugarG: 2, glycemicIndex: 55, giLevel: 'MEDIUM', glycemicLoad: 26 },
    { nameFa: 'آبگوشت', nameEn: 'Abgoosht', category: 'SOUP', servingDesc: 'یک کاسه کامل (۴۰۰ گرم)', servingGrams: 400, calories: 380, carbsG: 32, proteinG: 28, fatG: 14, fiberG: 7, sugarG: 3, glycemicIndex: 42, giLevel: 'LOW', glycemicLoad: 13 },
    { nameFa: 'سوپ جو', nameEn: 'Barley Soup', category: 'SOUP', servingDesc: 'یک کاسه (۳۰۰ گرم)', servingGrams: 300, calories: 180, carbsG: 28, proteinG: 8, fatG: 4, fiberG: 5, sugarG: 2, glycemicIndex: 40, giLevel: 'LOW', glycemicLoad: 11, healthierSwap: 'مناسب برای دیابتی - جو GI پایین دارد' },
    { nameFa: 'آش اناری', nameEn: 'Ash Anari', category: 'SOUP', servingDesc: 'یک کاسه (۳۰۰ گرم)', servingGrams: 300, calories: 240, carbsG: 35, proteinG: 10, fatG: 6, fiberG: 6, sugarG: 12, glycemicIndex: 48, giLevel: 'MEDIUM', glycemicLoad: 17 },
    // غذاهای سنتی
    { nameFa: 'کوکو سبزی', nameEn: 'Kuku Sabzi', category: 'TRADITIONAL', servingDesc: 'دو تکه (۱۵۰ گرم)', servingGrams: 150, calories: 220, carbsG: 8, proteinG: 14, fatG: 15, fiberG: 3, sugarG: 2, glycemicIndex: 28, giLevel: 'LOW', glycemicLoad: 2.2, healthierSwap: 'گزینه عالی برای دیابتی - GI بسیار پایین' },
    { nameFa: 'کتلت', nameEn: 'Kotlet', category: 'TRADITIONAL', servingDesc: 'دو عدد (۱۵۰ گرم)', servingGrams: 150, calories: 280, carbsG: 18, proteinG: 18, fatG: 15, fiberG: 1, sugarG: 2, glycemicIndex: 48, giLevel: 'MEDIUM', glycemicLoad: 9 },
    { nameFa: 'کشک بادمجان', nameEn: 'Kashk-e Bademjan', category: 'TRADITIONAL', servingDesc: 'نصف پیاله (۱۵۰ گرم)', servingGrams: 150, calories: 180, carbsG: 14, proteinG: 7, fatG: 10, fiberG: 5, sugarG: 5, glycemicIndex: 30, giLevel: 'LOW', glycemicLoad: 4 },
    { nameFa: 'میرزا قاسمی', nameEn: 'Mirza Ghasemi', category: 'TRADITIONAL', servingDesc: 'نصف پیاله (۱۵۰ گرم)', servingGrams: 150, calories: 160, carbsG: 10, proteinG: 6, fatG: 11, fiberG: 3, sugarG: 4, glycemicIndex: 25, giLevel: 'LOW', glycemicLoad: 2.5 },
    { nameFa: 'دلمه برگ مو', nameEn: 'Dolmeh', category: 'TRADITIONAL', servingDesc: 'شش عدد (۱۸۰ گرم)', servingGrams: 180, calories: 220, carbsG: 28, proteinG: 10, fatG: 8, fiberG: 4, sugarG: 3, glycemicIndex: 48, giLevel: 'MEDIUM', glycemicLoad: 13 },
    // نان‌ها
    { nameFa: 'نان سنگک', nameEn: 'Sangak Bread', category: 'BREAD', servingDesc: 'یک تکه بزرگ (۱۰۰ گرم)', servingGrams: 100, calories: 255, carbsG: 50, proteinG: 8, fatG: 2, fiberG: 3, sugarG: 1, glycemicIndex: 57, giLevel: 'MEDIUM', glycemicLoad: 29 },
    { nameFa: 'نان لواش', nameEn: 'Lavash Bread', category: 'BREAD', servingDesc: 'یک لواش کامل (۷۰ گرم)', servingGrams: 70, calories: 185, carbsG: 38, proteinG: 6, fatG: 1.5, fiberG: 1, sugarG: 1, glycemicIndex: 70, giLevel: 'HIGH', glycemicLoad: 27, sugarSpikeNote: 'نازک و سریع‌الهضم - قند را سریع بالا می‌برد' },
    { nameFa: 'نان بربری', nameEn: 'Barbari Bread', category: 'BREAD', servingDesc: 'یک تکه (۱۰۰ گرم)', servingGrams: 100, calories: 265, carbsG: 52, proteinG: 9, fatG: 3, fiberG: 2, sugarG: 2, glycemicIndex: 68, giLevel: 'HIGH', glycemicLoad: 35 },
    { nameFa: 'نان تافتون', nameEn: 'Taftoon Bread', category: 'BREAD', servingDesc: 'نصف نان (۸۰ گرم)', servingGrams: 80, calories: 210, carbsG: 42, proteinG: 7, fatG: 2, fiberG: 1.5, sugarG: 1, glycemicIndex: 62, giLevel: 'MEDIUM', glycemicLoad: 26 },
    // لبنیات
    { nameFa: 'ماست ایرانی پرچرب', nameEn: 'Iranian Yogurt', category: 'DAIRY', servingDesc: 'یک کاسه (۲۰۰ گرم)', servingGrams: 200, calories: 120, carbsG: 8, proteinG: 7, fatG: 6, fiberG: 0, sugarG: 8, glycemicIndex: 14, giLevel: 'VERY_LOW', glycemicLoad: 1.1, healthierSwap: 'گزینه عالی برای دیابتی' },
    { nameFa: 'دوغ', nameEn: 'Doogh', category: 'DRINK', servingDesc: 'یک لیوان (۲۵۰ میلی)', servingGrams: 250, calories: 40, carbsG: 4, proteinG: 3, fatG: 1, fiberG: 0, sugarG: 4, glycemicIndex: 10, giLevel: 'VERY_LOW', glycemicLoad: 0.4, healthierSwap: 'بهترین نوشیدنی برای کنار غذا' },
    { nameFa: 'پنیر ایرانی', nameEn: 'Iranian Feta Cheese', category: 'DAIRY', servingDesc: 'یک تکه (۵۰ گرم)', servingGrams: 50, calories: 130, carbsG: 1, proteinG: 8, fatG: 10, fiberG: 0, sugarG: 1, glycemicIndex: 0, giLevel: 'VERY_LOW', glycemicLoad: 0 },
    { nameFa: 'کشک', nameEn: 'Kashk', category: 'DAIRY', servingDesc: 'دو قاشق غذاخوری (۵۰ گرم)', servingGrams: 50, calories: 80, carbsG: 5, proteinG: 7, fatG: 3, fiberG: 0, sugarG: 4, glycemicIndex: 12, giLevel: 'VERY_LOW', glycemicLoad: 0.6 },
    // میوه‌ها
    { nameFa: 'خرما', nameEn: 'Dates', category: 'FRUIT', servingDesc: 'سه عدد (۳۰ گرم)', servingGrams: 30, calories: 83, carbsG: 22, proteinG: 0.7, fatG: 0.1, fiberG: 1.6, sugarG: 20, glycemicIndex: 42, giLevel: 'LOW', glycemicLoad: 9.2, sugarSpikeNote: 'قند طبیعی - در حد متعادل مصرف کنید' },
    { nameFa: 'انار', nameEn: 'Pomegranate', category: 'FRUIT', servingDesc: 'نصف انار (۱۵۰ گرم)', servingGrams: 150, calories: 105, carbsG: 26, proteinG: 1.5, fatG: 0.5, fiberG: 3.5, sugarG: 20, glycemicIndex: 35, giLevel: 'LOW', glycemicLoad: 9.1 },
    { nameFa: 'هندوانه', nameEn: 'Watermelon', category: 'FRUIT', servingDesc: 'یک تکه بزرگ (۳۰۰ گرم)', servingGrams: 300, calories: 90, carbsG: 23, proteinG: 1.8, fatG: 0.3, fiberG: 1.5, sugarG: 18, glycemicIndex: 76, giLevel: 'HIGH', glycemicLoad: 17.5, sugarSpikeNote: 'با وجود شیرینی، بار گلیسمی متوسط دارد' },
    // شیرینی‌ها
    { nameFa: 'زولبیا بامیه', nameEn: 'Zoolbia Bamieh', category: 'SWEETS', servingDesc: 'سه عدد (۱۰۰ گرم)', servingGrams: 100, calories: 350, carbsG: 58, proteinG: 4, fatG: 12, fiberG: 0, sugarG: 38, glycemicIndex: 85, giLevel: 'VERY_HIGH', glycemicLoad: 49, sugarSpikeNote: 'خطرناک برای دیابتی‌ها - از مصرف پرهیز کنید' },
    { nameFa: 'حلوا ارده', nameEn: 'Halvah', category: 'SWEETS', servingDesc: 'یک تکه (۵۰ گرم)', servingGrams: 50, calories: 220, carbsG: 22, proteinG: 5, fatG: 13, fiberG: 1, sugarG: 16, glycemicIndex: 55, giLevel: 'MEDIUM', glycemicLoad: 12 },
    { nameFa: 'سوهان', nameEn: 'Sohan', category: 'SWEETS', servingDesc: 'دو تکه (۴۰ گرم)', servingGrams: 40, calories: 190, carbsG: 24, proteinG: 2, fatG: 10, fiberG: 0.5, sugarG: 18, glycemicIndex: 65, giLevel: 'HIGH', glycemicLoad: 15.6 },
    { nameFa: 'گز', nameEn: 'Gaz', category: 'SWEETS', servingDesc: 'دو تکه (۴۰ گرم)', servingGrams: 40, calories: 150, carbsG: 32, proteinG: 1.5, fatG: 3, fiberG: 0, sugarG: 28, glycemicIndex: 68, giLevel: 'HIGH', glycemicLoad: 21.8, sugarSpikeNote: 'با احتیاط مصرف کنید' },
    { nameFa: 'شیرینی نان برنجی', nameEn: 'Nan Berenji', category: 'SWEETS', servingDesc: 'سه عدد (۶۰ گرم)', servingGrams: 60, calories: 240, carbsG: 35, proteinG: 3, fatG: 10, fiberG: 0.5, sugarG: 20, glycemicIndex: 70, giLevel: 'HIGH', glycemicLoad: 24.5 },
    // نوشیدنی‌ها
    { nameFa: 'چای ایرانی', nameEn: 'Iranian Tea', category: 'DRINK', servingDesc: 'یک استکان با قند (۱۵۰ میلی)', servingGrams: 150, calories: 30, carbsG: 7, proteinG: 0, fatG: 0, fiberG: 0, sugarG: 7, glycemicIndex: 65, giLevel: 'HIGH', glycemicLoad: 4.6 },
    { nameFa: 'آب میوه هویج', nameEn: 'Carrot Juice', category: 'DRINK', servingDesc: 'یک لیوان (۲۵۰ میلی)', servingGrams: 250, calories: 95, carbsG: 22, proteinG: 2, fatG: 0.5, fiberG: 1.7, sugarG: 18, glycemicIndex: 43, giLevel: 'LOW', glycemicLoad: 9.5 },
    { nameFa: 'شربت آلبالو', nameEn: 'Cherry Sharbat', category: 'DRINK', servingDesc: 'یک لیوان (۲۵۰ میلی)', servingGrams: 250, calories: 120, carbsG: 30, proteinG: 0, fatG: 0, fiberG: 0, sugarG: 28, glycemicIndex: 55, giLevel: 'MEDIUM', glycemicLoad: 16.5, sugarSpikeNote: 'با اعتدال مصرف کنید' },
    // آجیل و خشکبار
    { nameFa: 'گردو', nameEn: 'Walnut', category: 'NUTS', servingDesc: 'یک مشت (۳۰ گرم)', servingGrams: 30, calories: 196, carbsG: 4, proteinG: 5, fatG: 19, fiberG: 2, sugarG: 0.7, glycemicIndex: 15, giLevel: 'VERY_LOW', glycemicLoad: 0.6, healthierSwap: 'میان‌وعده عالی برای دیابتی' },
    { nameFa: 'بادام', nameEn: 'Almond', category: 'NUTS', servingDesc: 'یک مشت (۳۰ گرم)', servingGrams: 30, calories: 173, carbsG: 6, proteinG: 6, fatG: 15, fiberG: 3.5, sugarG: 1.2, glycemicIndex: 0, giLevel: 'VERY_LOW', glycemicLoad: 0, healthierSwap: 'بهترین میان‌وعده - GI صفر' },
    { nameFa: 'پسته', nameEn: 'Pistachio', category: 'NUTS', servingDesc: 'یک مشت (۳۰ گرم)', servingGrams: 30, calories: 159, carbsG: 8, proteinG: 6, fatG: 13, fiberG: 3, sugarG: 2, glycemicIndex: 15, giLevel: 'VERY_LOW', glycemicLoad: 1.2 },
    // صبحانه
    { nameFa: 'نیمرو', nameEn: 'Nimroo (Fried Egg)', category: 'BREAKFAST_ITEM', servingDesc: 'دو عدد (۱۰۰ گرم)', servingGrams: 100, calories: 196, carbsG: 1, proteinG: 13, fatG: 15, fiberG: 0, sugarG: 0.6, glycemicIndex: 0, giLevel: 'VERY_LOW', glycemicLoad: 0 },
    { nameFa: 'عسل', nameEn: 'Honey', category: 'BREAKFAST_ITEM', servingDesc: 'یک قاشق غذاخوری (۲۰ گرم)', servingGrams: 20, calories: 61, carbsG: 17, proteinG: 0.1, fatG: 0, fiberG: 0, sugarG: 16.4, glycemicIndex: 61, giLevel: 'MEDIUM', glycemicLoad: 10.4, sugarSpikeNote: 'با احتیاط مصرف کنید' },
    { nameFa: 'کره ایرانی', nameEn: 'Iranian Butter', category: 'BREAKFAST_ITEM', servingDesc: 'یک قاشق (۱۵ گرم)', servingGrams: 15, calories: 107, carbsG: 0, proteinG: 0.1, fatG: 12, fiberG: 0, sugarG: 0, glycemicIndex: 0, giLevel: 'VERY_LOW', glycemicLoad: 0 },
  ];

  for (const food of iranianFoods) {
    await prisma.iranianFood.upsert({
      where: { nameFa: food.nameFa },
      update: food as any,
      create: food as any,
    });
  }
  console.log(`✅ ${iranianFoods.length} غذا ثبت شد`);

  // ─── Badges ───────────────────────────────────────────────
  const badges = [
    { code: 'first_log', titleFa: 'اولین قدم', description: 'اولین قند خون خود را ثبت کردید', icon: '🎯', color: '#6366f1', points: 10 },
    { code: 'streak_7', titleFa: 'هفت روز قوی', description: '۷ روز متوالی قند خون ثبت کردید', icon: '🔥', color: '#f59e0b', points: 50 },
    { code: 'streak_30', titleFa: 'یک ماه مداوم', description: '۳۰ روز متوالی ثبت قند خون', icon: '⭐', color: '#f59e0b', points: 200 },
    { code: 'tir_champion', titleFa: 'قهرمان TIR', description: 'بیش از ۷۰٪ روز در محدوده هدف بودید', icon: '🏆', color: '#10b981', points: 100 },
    { code: 'healthy_meal', titleFa: 'غذای سالم', description: 'اولین وعده غذایی سالم ثبت شد', icon: '🥗', color: '#10b981', points: 20 },
    { code: 'medication_perfect', titleFa: 'دارو منظم', description: 'یک هفته دارو به موقع مصرف کردید', icon: '💊', color: '#3b82f6', points: 75 },
    { code: 'active_life', titleFa: 'زندگی فعال', description: '۳۰ دقیقه ورزش ثبت کردید', icon: '🏃', color: '#8b5cf6', points: 30 },
    { code: 'hydration', titleFa: 'آبرسانی کامل', description: '۸ لیوان آب در یک روز نوشیدید', icon: '💧', color: '#06b6d4', points: 15 },
    { code: 'hba1c_goal', titleFa: 'هدف HbA1c', description: 'HbA1c به هدف تعیین‌شده رسید', icon: '🎖️', color: '#10b981', points: 300 },
    { code: 'ai_insights', titleFa: 'بینش هوشمند', description: 'اولین تحلیل AI را دریافت کردید', icon: '🤖', color: '#6366f1', points: 25 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    });
  }
  console.log(`✅ ${badges.length} مدال ثبت شد`);

  // ─── Challenges ───────────────────────────────────────────
  const challenges = [
    { titleFa: 'چالش ۷ روزه قند متعادل', description: 'برای ۷ روز متوالی قند خون را بالای ۷۰ و زیر ۱۸۰ نگه دارید', targetValue: 7, unit: 'day', kind: 'TIR', durationDays: 7, points: 100, isActive: true },
    { titleFa: 'چالش آبرسانی ۳ روزه', description: '۳ روز پشت سر هم روزانه ۸ لیوان آب بنوشید', targetValue: 3, unit: 'day', kind: 'WATER', durationDays: 3, points: 50, isActive: true },
    { titleFa: 'چالش ورزش هفتگی', description: 'این هفته ۵ جلسه ورزش ۳۰ دقیقه‌ای ثبت کنید', targetValue: 5, unit: 'session', kind: 'ACTIVITY', durationDays: 7, points: 150, isActive: true },
    { titleFa: 'چالش داروی منظم ماهانه', description: 'یک ماه بدون هیچ دارویی را از دست ندهید', targetValue: 30, unit: 'day', kind: 'MEDICATION', durationDays: 30, points: 300, isActive: true },
  ];

  for (const ch of challenges) {
    await prisma.challenge.upsert({
      where: { id: ch.titleFa },
      update: ch,
      create: { ...ch, id: ch.titleFa.substring(0, 25) },
    });
  }

  // ─── Demo Admin User ──────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { phone: '09000000000' },
    update: {},
    create: {
      phone: '09000000000',
      email: 'admin@glucia.ir',
      passwordHash: adminHash,
      fullName: 'مدیر سیستم',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  });

  // Demo doctor
  const doctorHash = await bcrypt.hash('Doctor@1234', 12);
  const doctorUser = await prisma.user.upsert({
    where: { phone: '09111111111' },
    update: {},
    create: {
      phone: '09111111111',
      email: 'doctor@glucia.ir',
      passwordHash: doctorHash,
      fullName: 'دکتر سارا احمدی',
      role: 'DOCTOR',
      isActive: true,
      isVerified: true,
    },
  });
  await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      medicalCode: 'IR-12345',
      specialty: 'غدد و متابولیسم',
      subspecialty: 'دیابت',
      bio: 'متخصص دیابت با بیش از ۱۵ سال تجربه',
      clinicName: 'کلینیک دیابت گلوسیا',
      isVerified: true,
      rating: 4.9,
      reviewCount: 128,
    },
  });

  // Demo patient
  const patientHash = await bcrypt.hash('Patient@1234', 12);
  const patientUser = await prisma.user.upsert({
    where: { phone: '09222222222' },
    update: {},
    create: {
      phone: '09222222222',
      email: 'patient@glucia.ir',
      passwordHash: patientHash,
      fullName: 'علی رضایی',
      role: 'PATIENT',
      isActive: true,
      isVerified: true,
    },
  });
  await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      birthDate: new Date('1985-03-15'),
      gender: 'MALE',
      diabetesType: 'TYPE2',
      diagnosisYear: 2018,
      heightCm: 175,
      weightKg: 82,
      targetGlucoseMin: 70,
      targetGlucoseMax: 180,
      targetHba1c: 7.0,
      healthScore: 72,
      streakDays: 5,
      totalPoints: 340,
    },
  });

  console.log('✅ کاربران نمونه ایجاد شدند');
  console.log('');
  console.log('📋 اطلاعات ورود:');
  console.log('   ادمین:   09000000000 / Admin@1234');
  console.log('   پزشک:    09111111111 / Doctor@1234');
  console.log('   بیمار:   09222222222 / Patient@1234');
  console.log('');
  console.log('🎉 seed کردن با موفقیت تمام شد!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
