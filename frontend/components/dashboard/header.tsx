// components/dashboard/header.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, Settings, User, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Header() {
  const [date, setDate] = useState('');
  
  useEffect(() => {
    setDate(new Date().toLocaleDateString('en-DK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);
  
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Aarhus Green City Index</h1>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 hidden md:block">{date}</div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}