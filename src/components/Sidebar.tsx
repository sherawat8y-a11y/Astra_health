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
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

const NAV_ITEMS = [
  { href: '/', label: 'Mission Overview', icon: Home },
  { href: '/crew', label: 'Crew Health', icon: Users },
  { href: '/profile', label: 'Astronaut Profiles', icon: UserCheck },
  { href: '/intelligence', label: 'AI Health Intelligence', icon: Sparkles },
  { href: '/radiation', label: 'Radiation Monitor', icon: Radiation },
  { href: '/musculoskeletal', label: 'Bone & Muscle Health', icon: Dumbbell },
  { href: '/behavioral', label: 'Behavioral Health & Sleep', icon: Moon },
  { href: '/assistant', label: 'ASTRA AI Assistant', icon: MessageSquare },
  { href: '/alerts', label: 'Alert Center', icon: Bell, badge: true },
  { href: '/research', label: 'NASA Research Data', icon: FileSpreadsheet },
  { href: '/reports', label: 'Health Reports', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { activeAlerts } = useTelemetry();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`shrink-0 border-r border-[#E5E5EA] bg-white flex flex-col justify-between hidden md:flex sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto transition-all duration-300 z-30 ${
        collapsed ? 'w-[72px]' : 'w-[250px]'
      }`}
    >
      <div className="py-5 px-3 space-y-4">
        
        {/* Brand Header matching Reference Design */}
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5 px-3 mb-2 group">
            {/* Aerodynamic Blue Delta Logo */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 2L4 30H13L18 19L23 30H32L18 2Z" fill="#0071E3" />
                <path d="M18 10L12 24H24L18 10Z" fill="#2997FF" opacity="0.9" />
                <path d="M9 25L2 33H12L15 25H9Z" fill="#26C6E8" opacity="0.8" />
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-black tracking-tight text-[#1D1D1F] leading-none font-sans">
                ASTRA
              </div>
              <div className="text-[13px] font-bold tracking-wider text-[#1D1D1F] leading-none mt-0.5">
                HEALTH
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex justify-center mb-2">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L4 30H13L18 19L23 30H32L18 2Z" fill="#0071E3" />
            </svg>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-[#E8F2FE] text-[#0071E3] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#0071E3]' : 'text-[#6E6E73]'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && activeAlerts.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#D93025] text-white">
                        {activeAlerts.length}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Earth Watermark matching Reference Image */}
      <div className="relative border-t border-[#E5E5EA] overflow-hidden">
        
        {/* Earth Watermark Image */}
        {!collapsed && (
          <div className="relative h-24 w-full opacity-70 pointer-events-none select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/images/sidebar-earth.png" 
              alt="Lunar / Earth Horizon" 
              className="absolute bottom-0 left-0 w-full object-cover"
            />
          </div>
        )}

        <div className="p-3 relative z-10 space-y-2 bg-gradient-to-t from-white via-white/90 to-transparent">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="text-[11px] font-medium">Collapse</span>
              </>
            )}
          </button>

          {!collapsed && (
            <div className="pt-1 text-left px-1">
              <div className="text-xs font-bold text-[#1D1D1F]">
                Artemis IV · NRHO Gateway
              </div>
              <div className="text-[11px] text-[#6E6E73]">
                NASA Space Apps 2026 (Demo)
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
