import { Transaction, CashRegister, Loan, DenominationCount } from '../types';

export interface FinancialSummary {
  availableLiquidity: number; // Total dinero disponible
  expectedCashInRegister: number; // Dinero esperado en la caja activa
  todayIncomes: number; // Ingresos de hoy (servicios + otros operativos)
  todayExpenses: number; // Egresos de hoy
  todayOperatingProfit: number; // Ganancia neta operativa de hoy
  receivedLoansTotal: number; // Total histórico o activo préstamos recibidos
  pendingPayableDebt: number; // Préstamos recibidos pendientes por pagar
  givenLoansTotal: number; // Total préstamos entregados a terceros
  pendingReceivableMoney: number; // Préstamos entregados pendientes por cobrar
  liquidityVariation: number; // Variación respecto al inicio
  liquidityVariationPercentage: number;
  openRegister: CashRegister | null;
}

/**
 * Recalculates expected cash balance for a cash register based on its transactions.
 * DINERO ESPERADO = SALDO INICIAL
 *   + INGRESOS
 *   + PRÉSTAMOS RECIBIDOS
 *   + COBROS DE PRÉSTAMOS (abonos de préstamos que dimos)
 *   - EGRESOS
 *   - PRÉSTAMOS ENTREGADOS
 *   - PAGOS DE PRÉSTAMOS (abonos que pagamos de deudas recibidas)
 *   ± AJUSTES
 */
export function calculateExpectedCash(
  initialBalance: number,
  transactions: Transaction[],
  registerId?: string
): number {
  const relevantTx = registerId 
    ? transactions.filter(t => t.cashRegisterId === registerId && !t.isVoided)
    : transactions.filter(t => !t.isVoided);

  let balance = initialBalance;

  for (const tx of relevantTx) {
    switch (tx.type) {
      case 'ingreso':
      case 'prestamo_recibido':
      case 'cobro_prestamo':
        balance += tx.amount;
        break;
      case 'egreso':
      case 'prestamo_entregado':
      case 'pago_prestamo':
        balance -= tx.amount;
        break;
      case 'ajuste':
        // Positive or negative adjustment
        balance += tx.amount;
        break;
    }
  }

  return balance;
}

/**
 * Calculates Operating Profit (Ganancia Operativa) for a given set of transactions.
 * STRICT BUSINESS RULE: Excludes loans, loan payments, and loan collections.
 * GANANCIA OPERATIVA = INGRESOS OPERATIVOS - EGRESOS OPERATIVOS
 */
export function calculateOperatingProfit(transactions: Transaction[]): {
  totalIncomes: number;
  totalExpenses: number;
  operatingProfit: number;
} {
  const activeTx = transactions.filter(t => !t.isVoided);
  
  const totalIncomes = activeTx
    .filter(t => t.type === 'ingreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = activeTx
    .filter(t => t.type === 'egreso')
    .reduce((sum, t) => sum + t.amount, 0);

  const operatingProfit = totalIncomes - totalExpenses;

  return {
    totalIncomes,
    totalExpenses,
    operatingProfit,
  };
}

/**
 * Computes loans metrics
 */
export function calculateLoansMetrics(loans: Loan[]): {
  totalReceived: number;
  pendingPayableDebt: number;
  totalGiven: number;
  pendingReceivableMoney: number;
} {
  let totalReceived = 0;
  let pendingPayableDebt = 0;
  let totalGiven = 0;
  let pendingReceivableMoney = 0;

  for (const loan of loans) {
    if (loan.type === 'recibido') {
      totalReceived += loan.initialAmount;
      if (loan.status !== 'pagado') {
        pendingPayableDebt += loan.currentBalance;
      }
    } else if (loan.type === 'entregado') {
      totalGiven += loan.initialAmount;
      if (loan.status !== 'pagado') {
        pendingReceivableMoney += loan.currentBalance;
      }
    }
  }

  return {
    totalReceived,
    pendingPayableDebt,
    totalGiven,
    pendingReceivableMoney,
  };
}

/**
 * Colombian Cash Denominations
 */
export const DEFAULT_DENOMINATIONS: DenominationCount[] = [
  { denomination: 100000, count: 0, type: 'billete' },
  { denomination: 50000, count: 0, type: 'billete' },
  { denomination: 20000, count: 0, type: 'billete' },
  { denomination: 10000, count: 0, type: 'billete' },
  { denomination: 5000, count: 0, type: 'billete' },
  { denomination: 2000, count: 0, type: 'billete' },
  { denomination: 1000, count: 0, type: 'moneda' },
  { denomination: 500, count: 0, type: 'moneda' },
  { denomination: 200, count: 0, type: 'moneda' },
  { denomination: 100, count: 0, type: 'moneda' },
  { denomination: 50, count: 0, type: 'moneda' },
];

export function calculateCashCountTotal(counts: DenominationCount[]): number {
  return counts.reduce((acc, item) => acc + (item.denomination * (item.count || 0)), 0);
}
