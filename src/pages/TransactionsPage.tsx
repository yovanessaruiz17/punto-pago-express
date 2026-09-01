import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { VoidTransactionModal } from '../components/modals/VoidTransactionModal';
import { Transaction, TransactionType } from '../types';
import { formatCOP, formatDateTime } from '../utils/formatters';
import {
  ReceiptText,
  Search,
  Download,
  Eye,
  Ban,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] = useState<string>('all');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [selectedVoidTx, setSelectedVoidTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedTypeFilter !== 'all' && tx.type !== selectedTypeFilter) {
        return false;
      }

      if (selectedStatusFilter === 'active' && tx.isVoided) return false;
      if (selectedStatusFilter === 'voided' && !tx.isVoided) return false;

      if (selectedPaymentMethodFilter !== 'all' && tx.paymentMethodCode !== selectedPaymentMethodFilter) {
        return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(term);
        const matchesUser = tx.userName.toLowerCase().includes(term);
        const matchesRef = tx.reference?.toLowerCase().includes(term) || false;
        const matchesClient = tx.customerOrProvider?.toLowerCase().includes(term) || false;
        if (!matchesDesc && !matchesUser && !matchesRef && !matchesClient) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedTypeFilter, selectedStatusFilter, selectedPaymentMethodFilter, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Fecha_Hora',
      'Tipo',
      'Concepto',
      'Monto',
      'Metodo_Pago',
      'Usuario',
      'Tercero_Cliente',
      'Referencia',
      'Estado',
      'Motivo_Anulacion',
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.id,
      formatDateTime(tx.createdAt),
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      tx.paymentMethodName,
      `"${tx.userName}"`,
      `"${tx.customerOrProvider || ''}"`,
      `"${tx.reference || ''}"`,
      tx.isVoided ? 'ANULADO' : 'ACTIVO',
      `"${tx.voidReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movimientos_punto_pago_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Historial Central de Movimientos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inmutable de todas las transacciones financieras y auditoría
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredTransactions.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs active:scale-95 transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Exportar a CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por concepto, cliente..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-800"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
          >
            <option value="all">Todos los tipos</option>
            <option value="ingreso">🟢 Ingresos de Servicio</option>
            <option value="egreso">🔴 Egresos Operativos</option>
            <option value="prestamo_recibido">🟣 Préstamos Recibidos</option>
            <option value="prestamo_entregado">🟠 Préstamos Entregados</option>
            <option value="cobro_prestamo">🔵 Cobros de Préstamo</option>
            <option value="pago_prestamo">🟤 Pagos de Préstamo</option>
          </select>

          {/* Payment Method */}
          <select
            value={selectedPaymentMethodFilter}
            onChange={(e) => setSelectedPaymentMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
          >
            <option value="all">Todos los métodos de pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="nequi">Nequi</option>
            <option value="daviplata">Daviplata</option>
            <option value="bancolombia">Bancolombia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo Activos</option>
            <option value="voided">Solo Anulados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No hay movimientos encontrados"
          description="Ajusta los filtros de búsqueda o registra una nueva operación en caja."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Concepto / Referencia</th>
                  <th className="py-3 px-4">Tercero / Cliente</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTransactions.map((tx) => {
                  const isPositive =
                    tx.type === 'ingreso' ||
                    tx.type === 'prestamo_recibido' ||
                    tx.type === 'cobro_prestamo';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        tx.isVoided ? 'bg-slate-50/50 opacity-60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-500">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-slate-100 text-slate-800">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{tx.description}</div>
                        {tx.reference && (
                          <span className="text-[10px] text-slate-400">Ref: {tx.reference}</span>
                        )}
                        {tx.isVoided && tx.voidReason && (
                          <span className="block text-[10px] text-rose-600 font-medium">
                            Anulación: {tx.voidReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {tx.customerOrProvider || '-'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px] text-slate-700">
                          {tx.paymentMethodName}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium">{tx.userName}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-extrabold text-sm ${
                            tx.isVoided
                              ? 'line-through text-slate-400'
                              : isPositive
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {isPositive ? `+${formatCOP(tx.amount)}` : `-${formatCOP(tx.amount)}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {tx.isVoided ? (
                          <Badge variant="rose" size="sm">
                            Anulado
                          </Badge>
                        ) : (
                          <Badge variant="emerald" size="sm">
                            Activo
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptTx(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Ver Comprobante"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!tx.isVoided && (
                            <button
                              type="button"
                              onClick={() => setSelectedVoidTx(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Anular Movimiento"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
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
