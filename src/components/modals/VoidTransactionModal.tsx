import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatCOP, formatDateTime } from '../../utils/formatters';
import { Ban, AlertTriangle } from 'lucide-react';

interface VoidTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const VOID_REASONS = [
  'Error en digitación de monto',
  'Operación duplicada accidentalmente',
  'Servicio rechazado o fallido por operador',
  'Cancelación solicitada por el cliente',
  'Registro en método de pago incorrecto',
  'Otro motivo justificado',
];

export const VoidTransactionModal: React.FC<VoidTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { voidTransaction } = useApp();
  const [reason, setReason] = useState<string>(VOID_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Otro motivo justificado' ? customReason.trim() : reason;

    if (!finalReason) return;

    setIsSubmitting(true);
    try {
      const success = await voidTransaction(transaction.id, finalReason);
      if (success) {
        setCustomReason('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Anulación Lógica de Movimiento"
      subtitle="Los movimientos financieros nunca se eliminan físicamente (Regla de Auditoría)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Concepto:</span>
            <span className="font-bold text-slate-900">{transaction.description}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Monto:</span>
            <span className="font-extrabold text-sm text-slate-900">{formatCOP(transaction.amount)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Registrado por:</span>
            <span className="font-medium text-slate-800">{transaction.userName}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Fecha y Hora:</span>
            <span className="font-medium text-slate-800">{formatDateTime(transaction.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            Esta anulación quedará registrada en los registros de auditoría y revertirá
            automáticamente el impacto en el dinero disponible.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Motivo Obligatorio de Anulación <span className="text-rose-500">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-rose-600"
          >
            {VOID_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {reason === 'Otro motivo justificado' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Escribe el motivo detallado
            </label>
            <input
              type="text"
              required
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Explica qué ocurrió..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-rose-600"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            Confirmar Anulación
          </button>
        </div>
      </form>
    </Modal>
  );
};
