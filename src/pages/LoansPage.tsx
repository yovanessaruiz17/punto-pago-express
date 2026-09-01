import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { QuickLoanModal } from '../components/modals/QuickLoanModal';
import { QuickLoanPaymentModal } from '../components/modals/QuickLoanPaymentModal';
import { Loan, LoanType } from '../types';
import { formatCOP, formatDate } from '../utils/formatters';
import {
  HandCoins,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Info,
  Calendar,
  Phone,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';

interface LoansPageProps {
  onOpenQuickLoan: () => void;
  onOpenQuickLoanPayment: () => void;
}

export const LoansPage: React.FC<LoansPageProps> = ({
  onOpenQuickLoan,
  onOpenQuickLoanPayment,
}) => {
  const { loans, currentRegister } = useApp();

  const [activeTab, setActiveTab] = useState<LoanType>('recibido');
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      if (l.type !== activeTab) return false;
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
      return true;
    });
  }, [loans, activeTab, filterStatus]);

  // Totals
  const receivedLoans = loans.filter((l) => l.type === 'recibido');
  const givenLoans = loans.filter((l) => l.type === 'entregado');

  const totalDebtPending = receivedLoans
    .filter((l) => l.status !== 'pagado')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const totalReceivablePending = givenLoans
    .filter((l) => l.status !== 'pagado')
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Préstamos & Deudas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de inyecciones de liquidez recibidas y dinero prestado a terceros con registro de abonos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedLoanForPayment(null);
              onOpenQuickLoanPayment();
            }}
            disabled={!currentRegister || loans.every((l) => l.status === 'pagado')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs active:scale-95 transition-all disabled:opacity-40"
          >
            <HandCoins className="w-4 h-4 text-amber-600" />
            Registrar Abono
          </button>

          <button
            type="button"
            onClick={() => setIsNewLoanModalOpen(true)}
            disabled={!currentRegister}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Nuevo Préstamo
          </button>
        </div>
      </div>

      {/* Principle Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 leading-relaxed">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Regla Financiera Fundamental:</span>
          Los préstamos aumentan o disminuyen el efectivo disponible en caja para respaldar las
          operaciones, pero <strong>NO se suman a las ganancias ni a los gastos operativos</strong>.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('recibido')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'recibido'
              ? 'border-indigo-600 text-indigo-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-indigo-600" />
          <span>Préstamos Recibidos (Deudas por Pagar)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
            {formatCOP(totalDebtPending)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entregado')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'entregado'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-amber-600" />
          <span>Dinero Prestado (Por Cobrar)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {formatCOP(totalReceivablePending)}
          </span>
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pendiente')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterStatus === 'pendiente' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('parcial')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterStatus === 'parcial' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Con Abono
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pagado')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filterStatus === 'pagado' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Pagados
          </button>
        </div>
      </div>

      {/* Loan Cards Grid */}
      {filteredLoans.length === 0 ? (
        <EmptyState
          title={`No hay préstamos ${activeTab === 'recibido' ? 'recibidos' : 'entregados'}`}
          description="Registra inyecciones de liquidez o préstamos para mantener el control de saldos pendientes."
          actionLabel="Registrar préstamo"
          onAction={() => setIsNewLoanModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => {
            const isOverdue = loan.dueDate && loan.dueDate <= todayStr && loan.status !== 'pagado';
            const progressPercent = Math.min(
              100,
              Math.round((loan.paidAmount / loan.initialAmount) * 100)
            );

            return (
              <div
                key={loan.id}
                className={`rounded-2xl border p-5 bg-white space-y-4 shadow-2xs transition-all ${
                  loan.status === 'pagado'
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : isOverdue
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{loan.counterpartName}</h4>
                    {loan.contactPhone && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {loan.contactPhone}
                      </span>
                    )}
                  </div>

                  <Badge
                    variant={
                      loan.status === 'pagado'
                        ? 'emerald'
                        : isOverdue
                        ? 'rose'
                        : loan.status === 'parcial'
                        ? 'blue'
                        : 'amber'
                    }
                  >
                    {loan.status === 'pagado'
                      ? '✅ Pagado'
                      : isOverdue
                      ? '🔴 Vencido'
                      : loan.status === 'parcial'
                      ? '🔵 Con Abono'
                      : '🟡 Pendiente'}
                  </Badge>
                </div>

                {/* Reason & Details */}
                <div className="space-y-1 text-xs">
                  <p className="text-slate-700 font-medium">{loan.reason}</p>
                  {loan.dueDate && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Compromiso: {formatDate(loan.dueDate)}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar of Payment */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Abonado ({progressPercent}%)</span>
                    <span className="font-bold text-slate-800">
                      {formatCOP(loan.paidAmount)} / {formatCOP(loan.initialAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        loan.status === 'pagado' ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Balance & Action */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Saldo Pendiente
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        loan.status === 'pagado' ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {formatCOP(loan.currentBalance)}
                    </span>
                  </div>

                  {loan.status !== 'pagado' && (
                    <button
                      type="button"
                      onClick={() => setSelectedLoanForPayment(loan)}
                      disabled={!currentRegister}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
                    >
                      <HandCoins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Abonar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Loan Modal */}
      <QuickLoanModal
        isOpen={isNewLoanModalOpen}
        onClose={() => setIsNewLoanModalOpen(false)}
        defaultType={activeTab}
      />

      {/* Loan Payment Modal */}
      <QuickLoanPaymentModal
        isOpen={Boolean(selectedLoanForPayment)}
        onClose={() => setSelectedLoanForPayment(null)}
        selectedLoan={selectedLoanForPayment}
      />
    </div>
  );
};
