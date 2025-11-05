'use client';

import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
