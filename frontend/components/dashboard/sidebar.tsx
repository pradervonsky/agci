// components/dashboard/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Droplets, Wind, Recycle, Volume2, Home, BarChart, Map, HelpCircle } from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
}

function SidebarItem({ href, icon, title }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 ${
        isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500"
      }`}
    >
      {icon}
      <span className="hidden md:inline">{title}</span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <div className="border-r border-gray-200 bg-white w-16 md:w-64 flex-shrink-0">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link className="flex items-center gap-2 font-semibold text-lg" href="/">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="hidden md:inline">AGCI</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-2 px-4">
          <nav className="flex flex-col gap-1">
            <SidebarItem href="/dashboard" icon={<Home className="h-4 w-4" />} title="Overview" />
            <SidebarItem href="/dashboard/air" icon={<Wind className="h-4 w-4" />} title="Air Quality" />
            <SidebarItem href="/dashboard/water" icon={<Droplets className="h-4 w-4" />} title="Water" />
            <SidebarItem href="/dashboard/nature" icon={<Leaf className="h-4 w-4" />} title="Nature" />
            <SidebarItem href="/dashboard/waste" icon={<Recycle className="h-4 w-4" />} title="Waste" />
            <SidebarItem href="/dashboard/noise" icon={<Volume2 className="h-4 w-4" />} title="Noise" />
            <SidebarItem href="/dashboard/map" icon={<Map className="h-4 w-4" />} title="City Map" />
            <SidebarItem href="/dashboard/trends" icon={<BarChart className="h-4 w-4" />} title="Trends" />
          </nav>
        </div>
        
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex gap-2 items-center">
              <HelpCircle className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-sm hidden md:block">Did you know?</h3>
            </div>
            <p className="mt-1 text-xs text-gray-500 hidden md:block">Aarhus aims to be CO2 neutral by 2030. Currently at 73.5% progress towards target.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
