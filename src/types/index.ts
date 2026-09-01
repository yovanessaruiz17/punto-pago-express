export type UserRole = 'admin' | 'cajero';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  code?: string;
  commissionType?: 'fixed' | 'percentage' | 'none';
  commissionAmount?: number;
  commissionPercentage?: number;
  defaultPrice?: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: 'ingreso' | 'egreso';
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export type PaymentMethodCode = 
  | 'efectivo' 
  | 'nequi' 
  | 'daviplata' 
  | 'bancolombia' 
  | 'transferencia' 
  | 'tarjeta' 
  | 'otro';

export interface PaymentMethodItem {
  id: string;
  code: PaymentMethodCode;
  name: string;
  isActive: boolean;
  isCash: boolean; // Indicates physical cash affecting physical cash drawer
}

export type TransactionType = 
  | 'ingreso' 
  | 'egreso' 
  | 'prestamo_recibido' 
  | 'prestamo_entregado' 
  | 'pago_prestamo' 
  | 'cobro_prestamo' 
  | 'ajuste';

export interface DigitalPlatform {
  id: string;
  name: string; // e.g. "PTM", "Bemovil", "Punto de Pago"
  code: string;
  accountNumber?: string;
  currentBalance: number;
  initialBalance: number;
  portalUrl?: string;
  category?: string;
  commissionRate?: number;
  colorTheme?: string;
  color?: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
}

export interface PlatformTransaction {
  id: string;
  platformId: string;
  platformName: string;
  type: 'carga_desde_caja' | 'descarga_a_caja' | 'ajuste_directo' | 'venta_servicio';
  amount: number;
  description: string;
  reference?: string;
  cashRegisterId?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  cashRegisterId: string;
  type: TransactionType;
  subtype?: string;
  categoryId?: string;
  categoryName?: string;
  serviceId?: string;
  serviceName?: string;
  platformId?: string;
  platformName?: string;
  description: string;
  amount: number; // Integer in COP (e.g. 50000)
  paymentMethodCode: PaymentMethodCode;
  paymentMethodName: string;
  reference?: string;
  customerOrProvider?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  createdAt: string;
  isVoided: boolean;
  voidedAt?: string;
  voidedByUserId?: string;
  voidedByUserName?: string;
  voidReason?: string;
  loanId?: string;
}

export type CashRegisterStatus = 'open' | 'closed';

export interface PlatformClosingSnapshot {
  platformId: string;
  platformName: string;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
}

export interface PlatformInitialSnapshot {
  platformId: string;
  platformName: string;
  initialBalance: number;
}

export interface CashRegister {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedByUserId: string;
  openedByUserName: string;
  closedByUserId?: string;
  closedByUserName?: string;
  initialBalance: number; // Saldo inicial en caja física
  initialPlatformsBalances?: PlatformInitialSnapshot[];
  totalInitialPlatforms?: number;
  totalInitialGlobal?: number;
  expectedBalance: number; // Dinero físico esperado
  physicalCountedBalance?: number; // Dinero físico contado en el arqueo
  difference?: number; // physical - expected
  platformsClosingSnapshots?: PlatformClosingSnapshot[];
  totalPlatformsExpected?: number;
  totalPlatformsActual?: number;
  totalPlatformsDifference?: number;
  globalExpectedBalance?: number; // physical expected + platforms expected
  globalActualBalance?: number; // physical counted + platforms actual
  globalDifference?: number; // global actual - global expected
  differenceReason?: string;
  differenceNotes?: string;
  status: CashRegisterStatus;
  reopenedAt?: string;
  reopenedByUserName?: string;
  reopenedReason?: string;
  createdAt: string;
}

export type LoanType = 'recibido' | 'entregado';
export type LoanStatus = 'pendiente' | 'parcial' | 'pagado';

export interface Loan {
  id: string;
  type: LoanType; // 'recibido' = Me prestaron (Deuda), 'entregado' = Yo presté (Por cobrar)
  counterpartName: string; // Prestamista o prestatario
  contactPhone?: string;
  initialAmount: number;
  currentBalance: number; // Saldo pendiente
  paidAmount: number; // Total abonado
  dueDate?: string; // Fecha límite
  reason: string;
  notes?: string;
  status: LoanStatus;
  createdAt: string;
  createdByUserId: string;
  createdByUserName: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentMethodCode: PaymentMethodCode;
  paymentMethodName: string;
  userId: string;
  userName: string;
  notes?: string;
  createdAt: string;
  transactionId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'create' | 'update' | 'void' | 'open_cash' | 'close_cash' | 'reopen_cash' | 'login' | 'config_change';
  entity: 'transaction' | 'cash_register' | 'loan' | 'loan_payment' | 'service' | 'category' | 'platform' | 'user' | 'settings';
  entityId: string;
  details: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  minCashAlert: number;
  allowCashierReopen: boolean;
  logoUrl?: string;
}

export interface DenominationCount {
  denomination: number;
  count: number;
  type: 'billete' | 'moneda';
}
