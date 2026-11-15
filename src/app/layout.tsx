import type { Metadata } from 'next';
import './globals.css';
import { TelemetryProvider } from '@/context/TelemetryContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Toast from '@/components/Toast';

export const metadata: Metadata = {
  title: 'ASTRA HEALTH | Astronaut Health Intelligence & Telemetry Platform',
  description: 'Monitor. Predict. Protect. Every Heartbeat Beyond Earth. AI-powered astronaut health monitoring and decision support prototype for NASA Space Apps Challenge 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#0071E3]/20 selection:text-[#0071E3]">
        <TelemetryProvider>
          <Navbar />
          <div className="flex flex-1 min-h-[calc(100vh-72px)] overflow-x-hidden">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto pb-16 md:pb-6 p-4 sm:p-6 lg:p-8 bg-[#F5F5F7]">
              {children}
            </main>
          </div>
          <MobileNav />
          <Toast />
        </TelemetryProvider>
      </body>
    </html>
  );
}
