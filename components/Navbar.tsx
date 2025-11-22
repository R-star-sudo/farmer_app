
import React from 'react';
import { AppView, Language } from '../types';
import { Home, ScanLine, MessageCircle, Users, Store } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  language: Language;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, language }) => {
  const t = TRANSLATIONS[language].nav;

  const navItems = [
    { view: AppView.DASHBOARD, icon: Home, label: t.home },
    { view: AppView.DIAGNOSIS, icon: ScanLine, label: t.scan },
    { view: AppView.MARKETPLACE, icon: Store, label: t.market },
    { view: AppView.CHOUPAL, icon: Users, label: t.community }, // Replaced Finance
    { view: AppView.CHAT, icon: MessageCircle, label: t.ask },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-emerald-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-2 py-2 z-50 safe-area-pb">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center p-2 min-w-[64px] transition-colors duration-200 ${
                isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'block' : 'block'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
