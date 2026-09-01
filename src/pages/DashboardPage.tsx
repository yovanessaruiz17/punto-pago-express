import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { VoidTransactionModal } from '../components/modals/VoidTransactionModal';
import { Transaction } from '../types';
import { formatCOP, formatTime, formatDate, formatDateTime } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  ShieldCheck,
  Lock,
  LockOpen,
  ReceiptText,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Ban,
  Clock,
  Sparkles,
  Layers,
  Coins,
  Smartphone,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
  onOpenQuickLoan: () => void;
  onOpenQuickLoanPayment: () => void;
  onOpenOpenCashModal: () => void;
  onOpenCloseCashModal: () => void;
  onOpenSetInitialCash?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenQuickIncome,
  onOpenQuickExpense,
  onOpenQuickLoan,
  onOpenQuickLoanPayment,
  onOpenOpenCashModal,
  onOpenCloseCashModal,
  onOpenSetInitialCash,
}) => {
  const { summary, currentRegister, cashRegisters, transactions, loans, platforms, settings } = useApp();
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [selectedVoidTx, setSelectedVoidTx] = useState<Transaction | null>(null);

  // Recent closed cash register
  const lastClosedRegister = cashRegisters.find((r) => r.status === 'closed');

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Overdue or near-due loans check
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingLoansAlert = loans.filter((l) => l.status !== 'pagado' && l.dueDate && l.dueDate <= todayStr);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Cash Register Status & Alerts */}
      {!currentRegister ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900">La caja se encuentra cerrada</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Debes abrir la caja o montar la cantidad de dinero inicial que tienes en físico y plataformas para iniciar operaciones.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenSetInitialCash && (
              <button
                type="button"
                onClick={onOpenSetInitialCash}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                Montar Dinero Actual
              </button>
            )}
            <button
              type="button"
              onClick={onOpenOpenCashModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <LockOpen className="w-4 h-4" />
              Abrir Caja
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <LockOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Caja Activa del Día</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  EN OPERACIÓN
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Abierta por {currentRegister.openedByUserName} • Base inicial física: {formatCOP(currentRegister.initialBalance)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSetInitialCash && (
              <button
                type="button"
                onClick={onOpenSetInitialCash}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Montar / Ajustar Dinero</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCloseCashModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              Arqueo y Cierre Diario
            </button>
          </div>
        </div>
      )}

      {/* Global Liquidity & Digital Platforms Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Saldos en Plataformas Digitales & Liquidez Global
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                PTM, Bemovil, Punto de Pago y efectivo en caja
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('plataformas')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Gestionar Plataformas</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Liquidez Global Consolidada */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Gran Total Liquidez
            </span>
            <p className="text-xl font-black text-emerald-900 mt-0.5">
              {formatCOP(summary.totalGlobalLiquidity)}
            </p>
            <p className="text-[10px] text-emerald-800/80 mt-0.5 font-medium">
              Caja ({formatCOP(summary.expectedCashInRegister)}) + Plataformas ({formatCOP(summary.totalPlatformsBalance)})
            </p>
          </div>

          {/* Individual Platform mini-cards */}
          {platforms.filter(p => p.isActive).slice(0, 3).map((plat) => {
            const isPtm = plat.code === 'ptm';
            const isBemovil = plat.code === 'bemovil';
            return (
              <div
                key={plat.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 truncate">
                    {plat.name}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPtm ? 'bg-blue-500' : isBemovil ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <p className="text-base font-black text-slate-900 mt-1">
                  {formatCOP(plat.currentBalance)}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('plataformas')}
                  className="text-[10px] font-bold text-teal-700 hover:text-teal-900 mt-1 flex items-center gap-1 cursor-pointer"
                >
                  <span>Recargar / Transferir</span>
                  <ArrowDownLeft className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Dinero Disponible en Caja */}
        <StatCard
          id="stat-available-cash"
          title="Efectivo en Caja Física"
          amount={summary.expectedCashInRegister}
          subtitle="Saldo real en gaveta física"
          icon={Wallet}
          variant="indigo"
          isLarge
          badge="Caja Activa"
        />

        {/* 2. Ganancia Operativa del Día */}
        <StatCard
          id="stat-operating-profit"
          title="Ganancia Neta del Día"
          amount={summary.todayOperatingProfit}
          subtitle={`Ingresos (${formatCOP(summary.todayIncomes)}) - Egresos (${formatCOP(summary.todayExpenses)})`}
          icon={TrendingUp}
          variant={summary.todayOperatingProfit >= 0 ? 'emerald' : 'rose'}
          badge="Rentabilidad Real"
          badgeType={summary.todayOperatingProfit >= 0 ? 'positive' : 'negative'}
        />

        {/* 3. Egresos Operativos */}
        <StatCard
          id="stat-today-expenses"
          title="Egresos Operativos de Hoy"
          amount={summary.todayExpenses}
          subtitle="Gastos, compras, servicios y nómina"
          icon={ArrowUpRight}
          variant="rose"
        />

        {/* 4. Deuda Pendiente por Pagar */}
        <StatCard
          id="stat-pending-debt"
          title="Deuda por Pagar (Préstamos)"
          amount={summary.pendingPayableDebt}
          subtitle="Préstamos recibidos pendientes"
          icon={HandCoins}
          variant="amber"
          badge="Pasivo"
        />

        {/* 5. Dinero Pendiente por Cobrar */}
        <StatCard
          id="stat-pending-receivable"
          title="Dinero por Cobrar (Prestado)"
          amount={summary.pendingReceivableMoney}
          subtitle="Préstamos entregados a terceros"
          icon={ArrowDownLeft}
          variant="blue"
          badge="Activo"
        />

        {/* 6. Total Plataformas */}
        <StatCard
          id="stat-platforms-total"
          title="Total en Plataformas Digitales"
          amount={summary.totalPlatformsBalance}
          subtitle="PTM, Bemovil, Punto de Pago..."
          icon={Smartphone}
          variant="neutral"
          badge={`${platforms.length} Apps`}
        />
      </div>

      {/* Quick Action Grid (Large Action Buttons) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Acciones Rápidas de Operación
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Ingreso */}
          <button
            type="button"
            onClick={onOpenQuickIncome}
            disabled={!currentRegister}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50/40 active:scale-95 transition-all text-center group disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">➕ Ingreso</span>
            <span className="text-[10px] text-slate-400">Recaudar Servicio</span>
          </button>

          {/* Egreso */}
          <button
            type="button"
            onClick={onOpenQuickExpense}
            disabled={!currentRegister}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-rose-500 hover:bg-rose-50/40 active:scale-95 transition-all text-center group disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">➖ Egreso</span>
            <span className="text-[10px] text-slate-400">Gastos / Compras</span>
          </button>

          {/* Plataformas Digitales */}
          <button
            type="button"
            onClick={() => onNavigate('plataformas')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-teal-500 hover:bg-teal-50/40 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">📱 Plataformas</span>
            <span className="text-[10px] text-slate-400">PTM, Bemovil, Pago</span>
          </button>

          {/* Catálogo de Servicios */}
          <button
            type="button"
            onClick={() => onNavigate('servicios')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-500 hover:bg-indigo-50/40 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">⚡ Servicios</span>
            <span className="text-[10px] text-slate-400">Crear & Gestionar</span>
          </button>

          {/* Montar Dinero / Base Inicial */}
          <button
            type="button"
            onClick={onOpenSetInitialCash ? onOpenSetInitialCash : onOpenOpenCashModal}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-amber-500 hover:bg-amber-50/40 active:scale-95 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">💵 Dinero Inicial</span>
            <span className="text-[10px] text-slate-400">Montar / Ajustar</span>
          </button>

          {/* Préstamo */}
          <button
            type="button"
            onClick={onOpenQuickLoan}
            disabled={!currentRegister}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-purple-500 hover:bg-purple-50/40 active:scale-95 transition-all text-center group disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HandCoins className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">🤝 Préstamos</span>
            <span className="text-[10px] text-slate-400">Recibir o Entregar</span>
          </button>
        </div>
      </div>

      {/* Two-Column Section: Last Closing + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col (1 Col): Last Cash Closing Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Último Cierre Registrado
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('caja')}
              className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          {lastClosedRegister ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {formatDate(lastClosedRegister.closedAt || lastClosedRegister.openedAt)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cerrado por: {lastClosedRegister.closedByUserName || 'Administrador'}
                  </span>
                </div>
                <Badge
                  variant={
                    lastClosedRegister.difference === 0
                      ? 'emerald'
                      : (lastClosedRegister.difference || 0) < 0
                      ? 'rose'
                      : 'amber'
                  }
                >
                  {lastClosedRegister.difference === 0
                    ? '✅ Cuadrada'
                    : (lastClosedRegister.difference || 0) < 0
                    ? `🔴 Faltante ${formatCOP(Math.abs(lastClosedRegister.difference || 0))}`
                    : `🟢 Sobrante ${formatCOP(lastClosedRegister.difference || 0)}`}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Dinero esperado:</span>
                  <span className="font-semibold text-slate-900">{formatCOP(lastClosedRegister.expectedBalance)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Dinero físico contado:</span>
                  <span className="font-semibold text-slate-900">{formatCOP(lastClosedRegister.physicalCountedBalance)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                  <span>Diferencia:</span>
                  <span
                    className={
                      lastClosedRegister.difference === 0
                        ? 'text-emerald-700'
                        : (lastClosedRegister.difference || 0) < 0
                        ? 'text-rose-700'
                        : 'text-amber-700'
                    }
                  >
                    {lastClosedRegister.difference && lastClosedRegister.difference > 0 ? '+' : ''}
                    {formatCOP(lastClosedRegister.difference)}
                  </span>
                </div>
                {lastClosedRegister.differenceReason && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                    <span className="font-bold block text-slate-800">Motivo de diferencia:</span>
                    {lastClosedRegister.differenceReason}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 bg-white">
              No hay cierres históricos registrados aún
            </div>
          )}

          {/* Quick Active Loans Indicator */}
          {pendingLoansAlert.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Préstamos Vencidos o por Vencer</span>
              </div>
              <p className="leading-relaxed">
                Hay {pendingLoansAlert.length} préstamo(s) con fecha de compromiso pendiente.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('prestamos')}
                className="font-bold text-amber-900 hover:underline inline-block cursor-pointer"
              >
                Revisar cartera de préstamos →
              </button>
            </div>
          )}
        </div>

        {/* Right Col (2 Cols): Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Movimientos Financieros Recientes
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('movimientos')}
              className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Ver todos ({transactions.length})
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="Sin movimientos aún"
              description="Registra ingresos, servicios o egresos para ver la trazabilidad en vivo."
              actionLabel="Registrar primer ingreso"
              onAction={onOpenQuickIncome}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors ${
                      tx.isVoided ? 'opacity-50 bg-slate-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.isVoided
                            ? 'bg-slate-200 text-slate-500'
                            : tx.type === 'ingreso' || tx.type === 'prestamo_recibido' || tx.type === 'cobro_prestamo'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tx.type === 'ingreso' || tx.type === 'prestamo_recibido' || tx.type === 'cobro_prestamo' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {tx.description}
                          </p>
                          {tx.isVoided && <Badge variant="rose" size="sm">ANULADO</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{tx.userName}</span>
                          <span>•</span>
                          <span>{tx.paymentMethodName}</span>
                          <span>•</span>
                          <span>{formatTime(tx.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <div className="text-right">
                        <span
                          className={`text-xs sm:text-sm font-extrabold block ${
                            tx.isVoided
                              ? 'line-through text-slate-400'
                              : tx.type === 'ingreso' || tx.type === 'prestamo_recibido' || tx.type === 'cobro_prestamo'
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {tx.type === 'ingreso' || tx.type === 'prestamo_recibido' || tx.type === 'cobro_prestamo'
                            ? `+${formatCOP(tx.amount)}`
                            : `-${formatCOP(tx.amount)}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Ver comprobante"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!tx.isVoided && (
                          <button
                            type="button"
                            onClick={() => setSelectedVoidTx(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Anular movimiento"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals for Receipt and Void */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptTx)}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
      />
      <VoidTransactionModal
        isOpen={Boolean(selectedVoidTx)}
        onClose={() => setSelectedVoidTx(null)}
        transaction={selectedVoidTx}
      />
    </div>
  );
};
