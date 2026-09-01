import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { OpenCashModal } from '../components/modals/OpenCashModal';
import { CloseCashModal } from '../components/modals/CloseCashModal';
import { ReopenCashModal } from '../components/modals/ReopenCashModal';
import { CashRegister } from '../types';
import { formatCOP, formatDateTime, formatDate, formatTime } from '../utils/formatters';
import {
  Wallet,
  Lock,
  LockOpen,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Unlock,
  History,
  Info,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

interface CashPageProps {
  onOpenOpenCashModal: () => void;
  onOpenCloseCashModal: () => void;
}

export const CashPage: React.FC<CashPageProps> = ({
  onOpenOpenCashModal,
  onOpenCloseCashModal,
}) => {
  const { currentRegister, cashRegisters, transactions, summary, currentUser } = useApp();
  const [selectedRegisterForReopen, setSelectedRegisterForReopen] = useState<CashRegister | null>(null);

  // Active register breakdown
  const regTx = currentRegister
    ? transactions.filter((t) => t.cashRegisterId === currentRegister.id && !t.isVoided)
    : [];

  const incomes = regTx
    .filter((t) => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const loansReceived = regTx
    .filter((t) => t.type === 'prestamo_recibido')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = regTx
    .filter((t) => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const loansGiven = regTx
    .filter((t) => t.type === 'prestamo_entregado')
    .reduce((sum, t) => sum + t.amount, 0);

  const closedRegisters = cashRegisters.filter((r) => r.status === 'closed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Control de Caja, Arqueos & Cierres
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Conciliación de dinero físico contado contra saldo esperado por sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRegister ? (
            <button
              type="button"
              onClick={onOpenCloseCashModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              Realizar Arqueo y Cerrar Caja
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenOpenCashModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <LockOpen className="w-4 h-4" />
              Abrir Caja con Saldo Base
            </button>
          )}
        </div>
      </div>

      {/* Active Cash Register Live Breakdown */}
      {currentRegister ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xs">
                <LockOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Caja en Operación (Abierta)
                  </h3>
                  <Badge variant="emerald" size="sm">
                    Activa
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Iniciada el {formatDateTime(currentRegister.openedAt)} por {currentRegister.openedByUserName}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Dinero Esperado en Caja
              </span>
              <span className="text-2xl font-black text-slate-900">
                {formatCOP(summary.expectedCashInRegister)} COP
              </span>
            </div>
          </div>

          {/* Formula Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">1. Saldo Inicial</span>
              <span className="text-sm font-extrabold text-slate-800">{formatCOP(currentRegister.initialBalance)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block">+ 2. Ingresos</span>
              <span className="text-sm font-extrabold text-emerald-700">{formatCOP(incomes)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-indigo-600 block">+ 3. Préstamos Rec.</span>
              <span className="text-sm font-extrabold text-indigo-700">{formatCOP(loansReceived)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-rose-600 block">- 4. Egresos</span>
              <span className="text-sm font-extrabold text-rose-700">{formatCOP(expenses)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-amber-600 block">- 5. Préstamos Ent.</span>
              <span className="text-sm font-extrabold text-amber-700">{formatCOP(loansGiven)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-300 block">= Total Esperado</span>
              <span className="text-sm font-black text-emerald-400">{formatCOP(summary.expectedCashInRegister)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-rose-950">No hay ninguna caja abierta en este momento</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            Para iniciar las transacciones y cobros del día, abre la caja registrando el dinero base inicial.
          </p>
          <button
            type="button"
            onClick={onOpenOpenCashModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <LockOpen className="w-4 h-4" />
            Abrir Caja Ahora
          </button>
        </div>
      )}

      {/* Cash Closings History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Historial de Cierres Diarios ({closedRegisters.length})
            </h3>
          </div>
        </div>

        {closedRegisters.length === 0 ? (
          <EmptyState
            title="Sin cierres registrados"
            description="Cuando realices el primer cierre diario, aparecerá aquí el registro con la conciliación y arqueo."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Fecha Cierre</th>
                    <th className="py-3 px-4">Usuario Cierre</th>
                    <th className="py-3 px-4 text-right">Saldo Inicial</th>
                    <th className="py-3 px-4 text-right">Esperado</th>
                    <th className="py-3 px-4 text-right">Físico Contado</th>
                    <th className="py-3 px-4 text-center">Diferencia</th>
                    <th className="py-3 px-4">Motivo / Notas</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {closedRegisters.map((reg) => {
                    const diff = reg.difference || 0;
                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                          {formatDateTime(reg.closedAt || reg.openedAt)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium">
                          {reg.closedByUserName || reg.openedByUserName}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-semibold">
                          {formatCOP(reg.initialBalance)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-semibold">
                          {formatCOP(reg.expectedBalance)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-900">
                          {formatCOP(reg.physicalCountedBalance)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <Badge
                            variant={diff === 0 ? 'emerald' : diff < 0 ? 'rose' : 'amber'}
                            size="sm"
                          >
                            {diff === 0
                              ? '✅ Cuadrada'
                              : diff < 0
                              ? `🔴 Faltante ${formatCOP(Math.abs(diff))}`
                              : `🟢 Sobrante ${formatCOP(diff)}`}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500">
                          {reg.differenceReason ? (
                            <div>
                              <span className="font-semibold text-slate-800">{reg.differenceReason}</span>
                              {reg.differenceNotes && (
                                <span className="block text-slate-400 truncate">{reg.differenceNotes}</span>
                              )}
                            </div>
                          ) : (
                            'Sin observaciones'
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {currentUser.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => setSelectedRegisterForReopen(reg)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all"
                              title="Reabrir caja para correcciones"
                            >
                              <Unlock className="w-3.5 h-3.5 text-amber-600" />
                              Reabrir
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reopen Cash Modal */}
      <ReopenCashModal
        isOpen={Boolean(selectedRegisterForReopen)}
        onClose={() => setSelectedRegisterForReopen(null)}
        register={selectedRegisterForReopen}
      />
    </div>
  );
};
