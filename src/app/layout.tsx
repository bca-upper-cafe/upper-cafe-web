import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'BCA Upper Cafe • Study Hall & Absence Pass',
  description: 'Digital check-in and teacher absence management for Bergen County Academies Upper Cafe Study Hall.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0E14] text-[#F0F6FC] antialiased min-h-screen flex flex-col selection:bg-[#C5B358] selection:text-[#0B0E14]">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-[#2C3442] py-6 text-center text-xs text-[#8B949E] bg-[#0B0E14]">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Bergen County Academies • Upper Cafe Study Hall</p>
            <p className="text-[#C5B358]">app.bcaupper.cafe</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
