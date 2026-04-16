import './globals.css';
import type { Metadata } from 'next';
import { Inter, Newsreader } from 'next/font/google';
import { Nav } from '../components/nav';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'nestmono — a tiny content platform',
  description: 'NestJS + Next.js + Postgres MVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-screen font-sans">
        <Nav />
        <div className="mx-auto w-full max-w-container px-4 pb-24 pt-8 sm:px-6">
          {children}
        </div>
      </body>
    </html>
  );
}
