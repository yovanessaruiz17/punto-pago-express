import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  Wallet,
  ReceiptText,
  BarChart3,
  Users,
  ShieldAlert,
  Settings,
  X,
  Building2,
  Sparkles,
  Layers,
  LogOut,
  Smartphone,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'servicios'
  | 'plataformas'
  | 'ingresos'
  | 'egresos'
  | 'prestamos'
  | 'caja'
  | 'movimientos'
  | 'reportes'
  | 'usuarios'
  | 'auditoria'
  | 'configuracion';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, settings, platforms, logout } = useApp();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard, role: 'all' },
    { id: 'servicios' as NavTab, label: 'Servicios & Recaudos', icon: Layers, role: 'all', badge: 'Catálogo' },
    { id: 'plataformas' as NavTab, label: 'Plataformas Digitales', icon: Smartphone, role: 'all', badge: `${platforms.length} Apps` },
    { id: 'ingresos' as NavTab, label: 'Ingresos', icon: ArrowDownLeft, role: 'all' },
    { id: 'egresos' as NavTab, label: 'Egresos', icon: ArrowUpRight, role: 'all' },
    { id: 'prestamos' as NavTab, label: 'Préstamos', icon: HandCoins, role: 'all' },
    { id: 'caja' as NavTab, label: 'Caja & Cierres', icon: Wallet, role: 'all' },
    { id: 'movimientos' as NavTab, label: 'Movimientos', icon: ReceiptText, role: 'all' },
    { id: 'reportes' as NavTab, label: 'Reportes', icon: BarChart3, role: 'all' },
    { id: 'usuarios' as NavTab, label: 'Usuarios', icon: Users, role: 'admin' },
    { id: 'auditoria' as NavTab, label: 'Auditoría', icon: ShieldAlert, role: 'admin' },
    { id: 'configuracion' as NavTab, label: 'Configuración', icon: Settings, role: 'admin' },
  ];

  const filteredNavItems = navItems.filter(
    (item) => item.role === 'all' || currentUser.role === 'admin'
  );

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              PE
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
                {settings.businessName}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                POS & Caja v2.0
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Módulos Operativos
          </p>

          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout at bottom */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {currentUser.role === 'admin' ? '🛡️ Admin' : '💼 Cajero'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
