import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { ReceiptModal } from '../components/modals/ReceiptModal';
import { VoidTransactionModal } from '../components/modals/VoidTransactionModal';
import { Transaction } from '../types';
import { formatCOP, formatDateTime } from '../utils/formatters';
import {
  ArrowUpRight,
  Plus,
  Search,
  Tag,
  ToggleLeft,
  ToggleRight,
  Eye,
  Ban,
} from 'lucide-react';

interface ExpensesPageProps {
  onOpenQuickExpense: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ onOpenQuickExpense }) => {
  const { transactions, categories, currentRegister, addCategory, toggleCategoryActive, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'expenses' | 'categories'>('expenses');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPaymentMethodFilter, setSelectedPaymentMethodFilter] = useState<string>('all');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [selectedVoidTx, setSelectedVoidTx] = useState<Transaction | null>(null);

  // New Category modal
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDesc, setNewCategoryDesc] = useState<string>('');

  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.type !== 'egreso') return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(term);
        const matchesProvider = t.customerOrProvider?.toLowerCase().includes(term) || false;
        if (!matchesDesc && !matchesProvider) return false;
      }

      if (selectedCategoryFilter !== 'all' && t.categoryId !== selectedCategoryFilter) {
        return false;
      }

      if (selectedPaymentMethodFilter !== 'all' && t.paymentMethodCode !== selectedPaymentMethodFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, selectedCategoryFilter, selectedPaymentMethodFilter]);

  const totalExpensesSum = useMemo(() => {
    return expenseTransactions
      .filter((t) => !t.isVoided)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [expenseTransactions]);

  const expenseCategories = categories.filter((c) => c.type === 'egreso');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory({
      name: newCategoryName.trim(),
      type: 'egreso',
      description: newCategoryDesc.trim() || undefined,
      isActive: true,
    });

    setNewCategoryName('');
    setNewCategoryDesc('');
    setIsNewCategoryModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Egresos & Gastos Operativos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de compras, nómina, servicios públicos, insumos y proveedores
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'expenses' ? (
            <button
              type="button"
              onClick={onOpenQuickExpense}
              disabled={!currentRegister}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Registrar Egreso
            </button>
          ) : (
            currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setIsNewCategoryModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'expenses'
              ? 'border-rose-600 text-rose-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Historial de Egresos ({expenseTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-rose-600 text-rose-800'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Categorías de Gasto ({expenseCategories.length})</span>
        </button>
      </div>

      {activeTab === 'expenses' ? (
        <div className="space-y-4">
          {/* Summary & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">
                  Total Egresos Filtrados
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatCOP(totalExpensesSum)} COP
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por concepto, proveedor..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-rose-600"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="all">Todas las categorías</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPaymentMethodFilter}
                onChange={(e) => setSelectedPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="all">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
                <option value="bancolombia">Bancolombia</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {expenseTransactions.length === 0 ? (
            <EmptyState
              title="No hay egresos registrados"
              description="No se encontraron egresos con los filtros seleccionados."
              actionLabel="Registrar egreso"
              onAction={onOpenQuickExpense}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Concepto / Categoría</th>
                      <th className="py-3 px-4">Proveedor / Destino</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4 text-right">Monto</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {expenseTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-50/60 transition-colors ${
                          tx.isVoided ? 'bg-slate-50/50 opacity-60' : ''
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-500">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{tx.description}</div>
                          {tx.categoryName && (
                            <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-semibold">
                              {tx.categoryName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
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
                              tx.isVoided ? 'line-through text-slate-400' : 'text-rose-700'
                            }`}
                          >
                            -{formatCOP(tx.amount)}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCategories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl border p-5 bg-white space-y-3 transition-all ${
                cat.isActive ? 'border-slate-200 shadow-2xs' : 'border-slate-100 opacity-60 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                    Egreso Operativo
                  </span>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => toggleCategoryActive(cat.id)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    {cat.isActive ? (
                      <ToggleRight className="w-6 h-6 text-rose-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed min-h-[30px]">
                {cat.description || 'Categoría para clasificación de costos del negocio'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* New Category Modal */}
      <Modal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        title="Crear Categoría de Egreso"
        subtitle="Permite clasificar los gastos y egresos del punto de pago"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nombre de la Categoría <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ej: Impuestos y Cámaras de Comercio"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-rose-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Descripción
            </label>
            <textarea
              rows={2}
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="Detalle para qué gastos aplica esta categoría..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-hidden focus:border-rose-600"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewCategoryModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="flex-1 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      </Modal>

      {/* Modals for Receipt & Void */}
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
