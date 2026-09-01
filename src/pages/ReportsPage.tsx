import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/ui/StatCard';
import { formatCOP } from '../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart as PieIcon,
  HandCoins,
  Wallet,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export const ReportsPage: React.FC = () => {
  const { transactions, summary, cashRegisters } = useApp();

  // Payment Method Breakdown
  const paymentMethodData = useMemo(() => {
    const counts: Record<string, { name: string; value: number }> = {};
    for (const tx of transactions) {
      if (tx.isVoided) continue;
      const method = tx.paymentMethodName || 'Efectivo';
      if (!counts[method]) {
        counts[method] = { name: method, value: 0 };
      }
      counts[method].value += tx.amount;
    }
    return Object.values(counts);
  }, [transactions]);

  // Service Breakdown
  const serviceBreakdownData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.isVoided || tx.type !== 'ingreso') continue;
      const key = tx.description || 'Otros Servicios';
      counts[key] = (counts[key] || 0) + tx.amount;
    }
    return Object.entries(counts)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  // Category Expense Breakdown
  const categoryExpenseData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.isVoided || tx.type !== 'egreso') continue;
      const key = tx.categoryName || 'Otros Gastos';
      counts[key] = (counts[key] || 0) + tx.amount;
    }
    return Object.entries(counts)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Daily Comparison (Historical Cierres)
  const historicalTrendData = useMemo(() => {
    if (cashRegisters.length === 0) return [];
    return cashRegisters
      .filter((r) => r.status === 'closed')
      .slice(0, 7)
      .reverse()
      .map((r, i) => ({
        date: r.closedAt ? new Date(r.closedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : `Cierre ${i + 1}`,
        esperado: r.expectedBalance,
        contado: r.physicalCountedBalance,
        diferencia: r.difference || 0,
      }));
  }, [cashRegisters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Reportes Financieros & Estadísticas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Análisis de rentabilidad operativa, distribución de canales de pago y rendimiento del negocio
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="rep-operating-profit"
          title="Ganancia Neta Acumulada"
          amount={summary.todayOperatingProfit}
          subtitle="Ingresos menos egresos reales"
          icon={TrendingUp}
          variant="emerald"
        />
        <StatCard
          id="rep-incomes-total"
          title="Ingresos Totales por Servicio"
          amount={summary.todayIncomes}
          subtitle="Comisiones y recaudos directos"
          icon={ArrowDownLeft}
          variant="indigo"
        />
        <StatCard
          id="rep-expenses-total"
          title="Egresos Operativos Totales"
          amount={summary.todayExpenses}
          subtitle="Costos de funcionamiento"
          icon={ArrowUpRight}
          variant="rose"
        />
        <StatCard
          id="rep-loans-balance"
          title="Balance Neto de Préstamos"
          amount={summary.pendingReceivableMoney - summary.pendingPayableDebt}
          subtitle="Por cobrar vs Por pagar"
          icon={HandCoins}
          variant="neutral"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Distribución por Métodos de Pago
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            {paymentMethodData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Sin movimientos registrados
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCOP(value), 'Monto Total']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Services Incomes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Top Servicios con Mayor Recaudo
              </h3>
            </div>
          </div>

          <div className="h-64 w-full">
            {serviceBreakdownData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Sin ingresos registrados
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceBreakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [formatCOP(value), 'Ingresos']} />
                  <Bar dataKey="amount" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category Expenses Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Distribución de Gastos por Categoría
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categoryExpenseData.map((cat, idx) => (
            <div key={cat.name} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block truncate">{cat.name}</span>
              <span className="text-sm font-extrabold text-rose-700 block">{formatCOP(cat.amount)}</span>
            </div>
          ))}
          {categoryExpenseData.length === 0 && (
            <p className="text-xs text-slate-400 col-span-full">No hay egresos registrados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};
