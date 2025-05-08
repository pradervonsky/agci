'use client';

import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" />
          <h1 className="text-xl font-semibold text-gray-900">Aarhus Green City Index</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 hidden md:block">{date}</div>
          
          <Separator orientation="vertical" className="h-6" />
          
        </div>
      </div>
    </header>
  );
}