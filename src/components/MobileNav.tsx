'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Users, 
  UserCheck, 
  Sparkles, 
  Radiation, 
  Dumbbell, 
  Moon, 
  MessageSquare, 
  Bell, 
  FileSpreadsheet, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

const ALL_LINKS = [
  { href: '/', label: 'Mission Overview', icon: Home },
  { href: '/crew', label: 'Crew Health', icon: Users },
  { href: '/profile', label: 'Astronaut Profiles', icon: UserCheck },
  { href: '/intelligence', label: 'AI Health Intelligence', icon: Sparkles },
  { href: '/radiation', label: 'Radiation Monitor', icon: Radiation },
  { href: '/musculoskeletal', label: 'Bone & Muscle Health', icon: Dumbbell },
  { href: '/behavioral', label: 'Behavioral & Sleep', icon: Moon },
  { href: '/assistant', label: 'ASTRA AI Assistant', icon: MessageSquare },
  { href: '/alerts', label: 'Alert Center', icon: Bell },
  { href: '/research', label: 'NASA Research Data', icon: FileSpreadsheet },
  { href: '/reports', label: 'Health Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export default function MobileNav() {
  const pathname = usePathname();
  const { activeAlerts } = useTelemetry();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const primaryLinks = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/crew', label: 'Crew', icon: Users },
    { href: '/intelligence', label: 'AI Health', icon: Sparkles },
    { href: '/assistant', label: 'ASTRA AI', icon: MessageSquare },
    { href: '/alerts', label: 'Alerts', icon: Bell, badge: activeAlerts.length }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden flex justify-end"
          onClick={() => setDrawerOpen(false)}
        >
          <div 
            className="w-72 bg-white border-l border-[#E5E5EA] h-full p-4 overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5EA]">
              <span className="font-bold text-sm text-[#1D1D1F]">ASTRA HEALTH</span>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="p-1 text-[#6E6E73] hover:text-[#1D1D1F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1 mt-4">
              {ALL_LINKS.map(link => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors ${
                      isActive 
                        ? 'bg-[#E8F2FE] text-[#0071E3] font-semibold' 
                        : 'text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#E5E5EA] backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-sm">
        {primaryLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors relative ${
                isActive ? 'text-[#0071E3]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {Boolean(link.badge && link.badge > 0) && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] bg-[#D93025] text-white font-bold">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{link.label}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium text-[#6E6E73] hover:text-[#1D1D1F]"
        >
          <Menu className="h-5 w-5" />
          <span className="mt-0.5">More</span>
        </button>
      </div>
    </>
  );
}
