import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { CashRegister } from '../../types';
import { formatCOP, formatDateTime } from '../../utils/formatters';
import {
  Wallet,
  Layers,
  Lock,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Info,
} from 'lucide-react';

interface CashRegisterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  register: CashRegister | null;
}

export const CashRegisterDetailModal: React.FC<CashRegisterDetailModalProps> = ({
  isOpen,
  onClose,
  register,
}) => {
  if (!register) return null;

  const cashDiff = register.difference ?? 0;
  const globalDiff = register.globalDifference ?? cashDiff;
  const isClosed = register.status === 'closed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle de Auditoría y Cierre de Caja"
      subtitle={`Caja #${register.id.substring(0, 8)} • Abierta por ${register.openedByUserName}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Top Status & Timestamps Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">
                {isClosed ? 'Caja Cerrada & Conciliada' : 'Caja Abierta en Operación'}
              </span>
              <Badge variant={isClosed ? 'slate' : 'emerald'} size="sm">
                {register.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Apertura: {formatDateTime(register.openedAt)} ({register.openedByUserName})</div>
              {register.closedAt && (
                <div>Cierre: {formatDateTime(register.closedAt)} ({register.closedByUserName || 'N/A'})</div>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Resultado Conciliación
            </span>
            <span
              className={`text-base font-black ${
                cashDiff === 0
                  ? 'text-emerald-400'
                  : cashDiff < 0
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {cashDiff === 0
                ? '✅ Cuadrada Exacta'
                : cashDiff < 0
                ? `🔴 Faltante ${formatCOP(Math.abs(cashDiff))}`
                : `🟢 Sobrante +${formatCOP(cashDiff)}`}
            </span>
          </div>
        </div>

        {/* Physical Cash Breakdown */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>1. Arqueo de Efectivo Físico (Gaveta)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo Inicial</span>
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                {formatCOP(register.initialBalance)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Esperado Sistema</span>
              <span className="font-extrabold text-indigo-700 text-xs sm:text-sm">
                {formatCOP(register.expectedBalance || register.initialBalance)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Físico Contado</span>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                {formatCOP(register.physicalCountedBalance ?? register.expectedBalance ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Digital Platforms Reconciliation Snapshot */}
        {register.platformsClosing && register.platformsClosing.length > 0 && (
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-teal-950">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>2. Conciliación de Plataformas Digitales al Cierre</span>
              </div>
            </div>

            <div className="space-y-2">
              {register.platformsClosing.map((snap) => {
                const diff = snap.difference ?? 0;
                return (
                  <div
                    key={snap.platformId}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 block">{snap.platformName}</span>
                      <span className="text-[10px] text-slate-400">
                        Esperado: {formatCOP(snap.expectedBalance)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-800 block">
                        Real: {formatCOP(snap.actualBalance)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          diff === 0
                            ? 'text-emerald-600'
                            : diff < 0
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {diff === 0 ? '✅ Sin diferencia' : diff < 0 ? `Dif: ${formatCOP(diff)}` : `Dif: +${formatCOP(diff)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Difference Justifications if any */}
        {(register.differenceReason || register.differenceNotes) && (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Justificación del Descuadre Registrado</span>
            </div>
            {register.differenceReason && (
              <p className="text-xs text-slate-800 font-semibold">
                Motivo: <span className="font-normal text-slate-700">{register.differenceReason}</span>
              </p>
            )}
            {register.differenceNotes && (
              <p className="text-xs text-slate-800 font-semibold">
                Observaciones: <span className="font-normal text-slate-600 italic">{register.differenceNotes}</span>
              </p>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </Modal>
  );
};
