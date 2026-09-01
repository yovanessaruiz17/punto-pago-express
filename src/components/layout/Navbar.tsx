import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCOP } from '../../utils/formatters';
import {
  LockOpen,
  Lock,
  UserCheck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Menu,
  Coins,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
  onOpenCashModal: () => void;
  onOpenSetInitialCash?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenQuickIncome,
  onOpenQuickExpense,
  onOpenCashModal,
  onOpenSetInitialCash,
}) => {
  const { currentUser, switchUserRole, currentRegister, summary } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 font-extrabold text-base shadow-xs">
            ⚡
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 leading-tight">
              Punto de Pago Express
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Control de Caja & Finanzas
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Cash Register Live Status Pill */}
      <div className="flex items-center gap-2">
        {currentRegister ? (
          <button
            type="button"
            onClick={onOpenCashModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold shadow-2xs hover:bg-emerald-100 transition-all"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <LockOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Caja Abierta:</span>
            <span className="font-extrabold text-emerald-800">{formatCOP(summary.expectedCashInRegister)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenCashModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold shadow-2xs hover:bg-rose-100 transition-all animate-pulse"
          >
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Caja Cerrada (Abrir)</span>
          </button>
        )}
      </div>

      {/* Right: Quick Action Buttons & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenSetInitialCash && (
          <button
            type="button"
            onClick={onOpenSetInitialCash}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-amber-900 text-xs font-extrabold shadow-2xs active:scale-95 transition-all"
            title="Montar o definir cantidad de dinero inicial en caja"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Montar Dinero</span>
          </button>
        )}

        {/* Quick Transaction Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenQuickIncome}
            disabled={!currentRegister}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>+ Ingreso</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickExpense}
            disabled={!currentRegister}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>- Egreso</span>
          </button>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => switchUserRole('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentUser.role === 'admin'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Cambiar a Administrador"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <button
            type="button"
            onClick={() => switchUserRole('cajero')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentUser.role === 'cajero'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Cambiar a Cajero"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Cajero</span>
          </button>
        </div>
      </div>
    </header>
  );
};
