import { 
  UserProfile, 
  ServiceItem, 
  CategoryItem, 
  PaymentMethodItem, 
  CashRegister, 
  Transaction, 
  Loan, 
  AuditLog, 
  BusinessSettings,
  DigitalPlatform,
  PlatformTransaction,
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-1',
    name: 'Administrador',
    email: 'admin@puntodepago.co',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-cajero-1',
    name: 'Cajero Principal',
    email: 'cajero@puntodepago.co',
    role: 'cajero',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Pago de factura',
    category: 'Servicios Públicos',
    description: 'Recaudo de facturas de energía, gas, agua y telefonía',
    defaultPrice: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'srv-2',
    name: 'Recarga celular',
    category: 'Telefonía y Datos',
    description: 'Recargas a Claro, Movistar, Tigo, Wom, Virgin',
    defaultPrice: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'srv-3',
    name: 'Giro nacional',
    category: 'Giros y Remesas',
    description: 'Envío y pago de giros nacionales',
    defaultPrice: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'srv-4',
    name: 'Trámites y Certificados',
    category: 'Documentación',
    description: 'Impresión de antecedentes, RUT, certificados bancarios',
    defaultPrice: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'srv-5',
    name: 'Servicio general / Varios',
    category: 'Varios',
    description: 'Otros servicios de caja y corresponsalía',
    defaultPrice: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-ing-1', name: 'Recaudos y Facturas', type: 'ingreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-ing-2', name: 'Recargas y Paquetes', type: 'ingreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-ing-3', name: 'Giros y Comisiones', type: 'ingreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-ing-4', name: 'Papelería y Trámites', type: 'ingreso', isActive: true, createdAt: new Date().toISOString() },
  
  { id: 'cat-egr-1', name: 'Compra de saldo / Insumos', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-2', name: 'Servicios públicos', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-3', name: 'Transporte y Envíos', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-4', name: 'Nómina y Turnos', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-5', name: 'Proveedor', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-6', name: 'Mantenimiento e Internet', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-7', name: 'Papelería y Tintas', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-8', name: 'Alimentación / Refrigerios', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-9', name: 'Impuestos y Comisiones bancarias', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
  { id: 'cat-egr-10', name: 'Otros egresos', type: 'egreso', isActive: true, createdAt: new Date().toISOString() },
];

export const INITIAL_PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: 'pm-1', code: 'efectivo', name: 'Efectivo en Caja', isActive: true, isCash: true },
  { id: 'pm-2', code: 'nequi', name: 'Nequi', isActive: true, isCash: false },
  { id: 'pm-3', code: 'daviplata', name: 'Daviplata', isActive: true, isCash: false },
  { id: 'pm-4', code: 'bancolombia', name: 'Bancolombia Transferencia', isActive: true, isCash: false },
  { id: 'pm-5', code: 'tarjeta', name: 'Tarjeta Débito/Crédito (Datáfono)', isActive: true, isCash: false },
  { id: 'pm-6', code: 'transferencia', name: 'Otra Transferencia', isActive: true, isCash: false },
  { id: 'pm-7', code: 'otro', name: 'Otro método', isActive: true, isCash: false },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'Mi Punto de Pago',
  nit: '',
  address: '',
  phone: '',
  email: '',
  currency: 'COP',
  minCashAlert: 100000,
  allowCashierReopen: false,
};

// 100% Clean - No sample cash registers, everything at $0
export const INITIAL_CASH_REGISTERS: CashRegister[] = [];

// 100% Clean - No sample loans
export const INITIAL_LOANS: Loan[] = [];

// 100% Clean - No sample transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// 100% Clean - No sample audit logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Platforms ready with $0 balance for user configuration
export const INITIAL_PLATFORMS: DigitalPlatform[] = [
  {
    id: 'plat-ptm',
    name: 'PTM',
    code: 'ptm',
    accountNumber: '',
    currentBalance: 0,
    initialBalance: 0,
    color: '#0284c7', // Sky-600
    description: 'Plataforma Tecnológica Multiservicios (Recargas, pines, apuestas, certificados)',
    isActive: true,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plat-bemovil',
    name: 'Bemovil',
    code: 'bemovil',
    accountNumber: '',
    currentBalance: 0,
    initialBalance: 0,
    color: '#059669', // Emerald-600
    description: 'Recargas a todos los operadores, paquetes prepago, recaudo y giros',
    isActive: true,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plat-punto-pago',
    name: 'Punto de Pago',
    code: 'punto_pago',
    accountNumber: '',
    currentBalance: 0,
    initialBalance: 0,
    color: '#d97706', // Amber-600
    description: 'Pasarela de recaudos de servicios públicos, convenios municipales y facturación',
    isActive: true,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_PLATFORM_TRANSACTIONS: PlatformTransaction[] = [];
