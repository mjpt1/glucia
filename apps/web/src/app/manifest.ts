import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مهسا — مدیریت هوشمند دیابت',
    short_name: 'مهسا',
    description: 'پلتفرم جامع مدیریت دیابت با هوش مصنوعی: ثبت قند خون، تغذیه ایرانی، کوچ هوشمند و ارتباط با پزشک',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    dir: 'rtl',
    lang: 'fa',
    background_color: '#030712',
    theme_color: '#030712',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'ثبت قند خون', url: '/patient/glucose', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'کوچ هوشمند', url: '/patient/ai-coach', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
