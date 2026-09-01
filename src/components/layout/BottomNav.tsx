import React from 'react';
import { NavTab } from './Sidebar';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Wallet,
  Plus,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickActionMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickActionMenu,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-bold transition-all ${
          currentTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'text-emerald-600' : ''}`} />
        <span>Inicio</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('ingresos')}
        className={`flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-bold transition-all ${
          currentTab === 'ingresos' ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        <ArrowDownLeft className={`w-5 h-5 ${currentTab === 'ingresos' ? 'text-emerald-600' : ''}`} />
        <span>Ingresos</span>
      </button>

      {/* Big Action Button */}
      <button
        type="button"
        onClick={onOpenQuickActionMenu}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 active:scale-90 transition-all -translate-y-3"
        aria-label="Registrar operación"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('egresos')}
        className={`flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-bold transition-all ${
          currentTab === 'egresos' ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        <ArrowUpRight className={`w-5 h-5 ${currentTab === 'egresos' ? 'text-rose-600' : ''}`} />
        <span>Egresos</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('caja')}
        className={`flex flex-col items-center justify-center gap-1 p-1 text-[10px] font-bold transition-all ${
          currentTab === 'caja' ? 'text-slate-900' : 'text-slate-400'
        }`}
      >
        <Wallet className={`w-5 h-5 ${currentTab === 'caja' ? 'text-indigo-600' : ''}`} />
        <span>Caja</span>
      </button>
    </div>
  );
};
