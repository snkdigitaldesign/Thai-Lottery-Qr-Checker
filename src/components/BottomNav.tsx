import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, History, Tv, Layers } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const search = location.search;
  
  const isActive = (itemPath: string) => {
    const [path, search] = itemPath.split('?');
    if (search) {
      return location.pathname === path && location.search === `?${search}`;
    }
    return location.pathname === path && !location.search;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'หน้าแรก' },
    { path: '/check', icon: Search, label: 'ตรวจหวย' },
    { path: '/check?mode=multiple', icon: Layers, label: 'หลายใบ' },
    { path: '/live', icon: Tv, label: 'สด' },
    { path: '/previous', icon: History, label: 'ย้อนหลัง' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 z-50 flex justify-around items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className="flex flex-col items-center group relative min-w-[64px]"
          >
            <div className={`relative px-5 py-1 rounded-full transition-all duration-300 ${
              active ? 'bg-emerald-100 text-emerald-900' : 'text-slate-500 hover:bg-slate-50'
            }`}>
              <Icon className={`h-6 w-6 transition-transform duration-300 ${active ? 'scale-110' : ''}`} />
            </div>
            <span className={`text-[11px] mt-1 font-medium transition-colors duration-300 ${
              active ? 'text-emerald-900 font-bold' : 'text-slate-500'
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
