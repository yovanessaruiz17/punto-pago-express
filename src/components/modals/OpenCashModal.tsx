import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import { useApp } from '../../context/AppContext';
import { LockOpen } from 'lucide-react';

interface OpenCashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenCashModal: React.FC<OpenCashModalProps> = ({ isOpen, onClose }) => {
  const { openCashRegister } = useApp();
  const [initialBalance, setInitialBalance] = useState<number>(500000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await openCashRegister(initialBalance);
      if (success) {
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
      title="Apertura de Caja"
      subtitle="Registra el saldo base inicial para iniciar operaciones del día"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
          <p className="font-semibold mb-1">💡 Importante:</p>
          <p>
            El saldo inicial representa la base física en billetes y monedas con la que abres el
            punto de pago hoy.
          </p>
        </div>

        <MoneyInput
          id="initial-balance"
          label="Saldo Inicial en Caja (Base)"
          value={initialBalance}
          onChange={setInitialBalance}
          placeholder="0"
          required
          autoFocus
        />

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
            disabled={isSubmitting || initialBalance < 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LockOpen className="w-4 h-4" />
            )}
            Abrir Caja Ahora
          </button>
        </div>
      </form>
    </Modal>
  );
};
