import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'BCA Upper Cafe • Study Hall & Attendance',
  description: 'Attendance check-in and teacher absence directory for Bergen County Academies Upper Cafe Study Hall.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#111111] antialiased min-h-screen flex flex-col selection:bg-brand-purple-subtle selection:text-brand-purple-deep">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
