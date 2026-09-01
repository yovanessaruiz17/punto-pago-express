import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { CashRegister } from '../../types';
import { formatCOP, formatDateTime } from '../../utils/formatters';
import { Unlock, ShieldAlert } from 'lucide-react';

interface ReopenCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  register: CashRegister | null;
}

export const ReopenCashModal: React.FC<ReopenCashModalProps> = ({ isOpen, onClose, register }) => {
  const { reopenCashRegister } = useApp();
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!register) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await reopenCashRegister(register.id, reason.trim());
      if (success) {
        setReason('');
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
      title="Reabrir Caja Cerrada (Solo Administrador)"
      subtitle="Permite corregir movimientos u omitir cierres accidentales"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4" />
            <span>Acción Crítica de Auditoría</span>
          </div>
          <p>
            Reabrir una caja habilitará nuevamente la adición o corrección de movimientos para
            este período.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
          <div className="flex justify-between">
            <span>Apertura:</span>
            <span className="font-semibold">{formatDateTime(register.openedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cierre previo:</span>
            <span className="font-semibold">{formatDateTime(register.closedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dinero esperado:</span>
            <span className="font-bold">{formatCOP(register.expectedBalance)}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Motivo de la Reapertura <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explica detalladamente por qué es necesario reabrir esta caja..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-600"
          />
        </div>

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
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            Reabrir Caja
          </button>
        </div>
      </form>
    </Modal>
  );
};
