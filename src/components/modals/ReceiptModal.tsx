import React from 'react';
import { Modal } from '../ui/Modal';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { formatCOP, formatDateTime } from '../../utils/formatters';
import { Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  const { settings } = useApp();

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante de Operación" maxWidth="sm">
      <div className="space-y-4">
        {/* Printable Ticket */}
        <div
          id="receipt-print-area"
          className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 font-mono text-xs text-slate-800 shadow-xs"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
            <h4 className="font-bold text-sm tracking-tight text-slate-900 font-sans">
              {settings.businessName}
            </h4>
            <p className="text-[11px] text-slate-500">NIT: {settings.nit}</p>
            <p className="text-[11px] text-slate-500">{settings.address}</p>
            <p className="text-[11px] text-slate-500">Tel: {settings.phone}</p>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Transacción:</span>
              <span className="font-bold">#{transaction.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha/Hora:</span>
              <span>{formatDateTime(transaction.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tipo:</span>
              <span className="font-bold uppercase text-slate-900">{transaction.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Atendido por:</span>
              <span>{transaction.userName}</span>
            </div>
            {transaction.reference && (
              <div className="flex justify-between">
                <span className="text-slate-500">Referencia:</span>
                <span className="font-semibold">{transaction.reference}</span>
              </div>
            )}
            {transaction.customerOrProvider && (
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente/Tercero:</span>
                <span>{transaction.customerOrProvider}</span>
              </div>
            )}
          </div>

          {/* Description & Amount */}
          <div className="space-y-2 py-1">
            <p className="font-semibold text-slate-900">{transaction.description}</p>
            <div className="flex items-baseline justify-between border-t border-slate-200 pt-2 text-sm font-bold font-sans">
              <span>TOTAL {transaction.paymentMethodName}:</span>
              <span className="text-base text-emerald-700">{formatCOP(transaction.amount)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-1 text-[10px] text-slate-400">
            <p className="flex items-center justify-center gap-1 font-semibold text-emerald-600 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Operación Verificada y Registrada
            </p>
            <p>¡Gracias por preferir nuestro Punto de Pago!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Imprimir Comprobante
          </button>
        </div>
      </div>
    </Modal>
  );
};
