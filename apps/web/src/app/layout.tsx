import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'مهسا — مدیریت هوشمند دیابت',
  description: 'پلتفرم جامع مدیریت دیابت با هوش مصنوعی',
  keywords: ['دیابت', 'قند خون', 'مدیریت سلامت', 'هوش مصنوعی', 'مهسا'],
  applicationName: 'مهسا',
  appleWebApp: {
    capable: true,
    title: 'مهسا',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            {children}
            <Toaster position="top-center" toastOptions={{ style: { background: '#1f2937', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', direction: 'rtl' } }} />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
