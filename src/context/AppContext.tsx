import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserProfile,
  ServiceItem,
  CategoryItem,
  PaymentMethodItem,
  CashRegister,
  Transaction,
  Loan,
  LoanPayment,
  AuditLog,
  BusinessSettings,
  UserRole,
  TransactionType,
  PaymentMethodCode,
  DigitalPlatform,
  PlatformTransaction,
  PlatformInitialSnapshot,
  PlatformClosingSnapshot,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_CATEGORIES,
  INITIAL_PAYMENT_METHODS,
  INITIAL_SETTINGS,
  INITIAL_CASH_REGISTERS,
  INITIAL_LOANS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PLATFORMS,
  INITIAL_PLATFORM_TRANSACTIONS,
} from '../data/initialData';
import { calculateExpectedCash, calculateOperatingProfit, calculateLoansMetrics, FinancialSummary } from '../utils/calculations';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<boolean>;
  logout: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchUserRole: (role: UserRole) => void;
  users: UserProfile[];

  services: ServiceItem[];
  categories: CategoryItem[];
  paymentMethods: PaymentMethodItem[];
  platforms: DigitalPlatform[];
  platformTransactions: PlatformTransaction[];
  cashRegisters: CashRegister[];
  currentRegister: CashRegister | null;
  transactions: Transaction[];
  loans: Loan[];
  auditLogs: AuditLog[];
  settings: BusinessSettings;
  summary: FinancialSummary;
  isProcessing: boolean;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Actions
  openCashRegister: (
    initialBalance: number,
    platformBalances?: { platformId: string; balance: number }[]
  ) => Promise<boolean>;
  closeCashRegister: (
    physicalBalance: number,
    platformsClosing?: { platformId: string; actualBalance: number }[],
    reason?: string,
    notes?: string
  ) => Promise<boolean>;
  reopenCashRegister: (registerId: string, reason: string) => Promise<boolean>;
  
  createTransaction: (params: {
    type: TransactionType;
    amount: number;
    paymentMethodCode: PaymentMethodCode;
    description: string;
    serviceId?: string;
    categoryId?: string;
    platformId?: string;
    reference?: string;
    customerOrProvider?: string;
    loanId?: string;
  }) => Promise<Transaction | null>;

  voidTransaction: (transactionId: string, reason: string) => Promise<boolean>;
  
  createLoan: (params: {
    type: 'recibido' | 'entregado';
    counterpartName: string;
    contactPhone?: string;
    initialAmount: number;
    dueDate?: string;
    reason: string;
    notes?: string;
    paymentMethodCode: PaymentMethodCode;
  }) => Promise<Loan | null>;

  registerLoanPayment: (params: {
    loanId: string;
    amount: number;
    paymentMethodCode: PaymentMethodCode;
    notes?: string;
  }) => Promise<boolean>;

  // Configuration management
  addService: (service: Omit<ServiceItem, 'id' | 'createdAt'>) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;

  // Digital Platforms (PTM, Bemovil, Punto de Pago, etc.)
  addPlatform: (platform: Omit<DigitalPlatform, 'id' | 'lastUpdated' | 'createdAt'>) => void;
  updatePlatform: (id: string, updates: Partial<DigitalPlatform>) => void;
  deletePlatform: (id: string) => void;
  togglePlatformActive: (id: string) => void;
  adjustPlatformBalance: (platformId: string, newBalance: number, reason: string) => Promise<boolean>;
  transferBetweenCashAndPlatform: (params: {
    platformId: string;
    amount: number;
    direction: 'cash_to_platform' | 'platform_to_cash';
    description?: string;
    reference?: string;
  }) => Promise<boolean>;

  setInitialCashBalance: (params: {
    amount: number;
    mode?: 'set_base' | 'adjust_capital';
    reason?: string;
    platformBalances?: { platformId: string; balance: number }[];
  }) => Promise<boolean>;
  
  addCategory: (category: Omit<CategoryItem, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => void;
  toggleCategoryActive: (id: string) => void;

  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  addUser: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  
  // Data Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  USERS: 'ppe_users_v1',
  CURRENT_USER: 'ppe_current_user_v1',
  AUTH_SESSION: 'ppe_auth_session_v1',
  SERVICES: 'ppe_services_v1',
  CATEGORIES: 'ppe_categories_v1',
  PAYMENT_METHODS: 'ppe_payment_methods_v1',
  PLATFORMS: 'ppe_platforms_v1',
  PLATFORM_TXS: 'ppe_platform_txs_v1',
  CASH_REGISTERS: 'ppe_cash_registers_v1',
  TRANSACTIONS: 'ppe_transactions_v1',
  LOANS: 'ppe_loans_v1',
  AUDIT_LOGS: 'ppe_audit_logs_v1',
  SETTINGS: 'ppe_settings_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or fall back to Initial Seed Data
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    return saved !== null ? saved === 'true' : true; // Default to true so user sees active state, but can logout and login
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [platforms, setPlatforms] = useState<DigitalPlatform[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLATFORMS);
    return saved ? JSON.parse(saved) : INITIAL_PLATFORMS;
  });

  const [platformTransactions, setPlatformTransactions] = useState<PlatformTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLATFORM_TXS);
    return saved ? JSON.parse(saved) : INITIAL_PLATFORM_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [paymentMethods] = useState<PaymentMethodItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_REGISTERS);
    return saved ? JSON.parse(saved) : INITIAL_CASH_REGISTERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLATFORM_TXS, JSON.stringify(platformTransactions));
  }, [platformTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_REGISTERS, JSON.stringify(cashRegisters));
  }, [cashRegisters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Toasts helper
  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Login & Logout
  const login = async (emailOrUsername: string, password?: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const cleanInput = emailOrUsername.trim().toLowerCase();
      // Match with known users or demo profiles
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === cleanInput ||
          u.name.toLowerCase().includes(cleanInput) ||
          (cleanInput === 'admin' && u.role === 'admin') ||
          (cleanInput === 'cajero' && u.role === 'cajero')
      );

      if (matched) {
        setCurrentUser(matched);
      } else {
        // Create quick guest profile with role based on input
        const role: UserRole = cleanInput.includes('admin') ? 'admin' : 'cajero';
        const newUsr: UserProfile = {
          id: `usr-${Date.now()}`,
          name: emailOrUsername.split('@')[0],
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@puntoexpress.co`,
          role,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [newUsr, ...prev]);
        setCurrentUser(newUsr);
      }

      setIsAuthenticated(true);
      addToast('success', 'Sesión iniciada', `Bienvenido al sistema Punto de Pago Express.`);
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast('info', 'Sesión finalizada', 'Has cerrado la sesión correctamente.');
  };

  // Current Open Cash Register
  const currentRegister = useMemo(() => {
    return cashRegisters.find((r) => r.status === 'open') || null;
  }, [cashRegisters]);

  // Log Audit record helper
  const logAudit = useCallback((
    action: AuditLog['action'],
    entity: AuditLog['entity'],
    entityId: string,
    details: string,
    oldData?: Record<string, unknown>,
    newData?: Record<string, unknown>
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
      oldData,
      newData,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [currentUser]);

  // Recalculate Live Expected Cash in open register
  const liveExpectedBalance = useMemo(() => {
    if (!currentRegister) return 0;
    return calculateExpectedCash(currentRegister.initialBalance, transactions, currentRegister.id);
  }, [currentRegister, transactions]);

  // Financial Summary computation
  const summary: FinancialSummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTx = transactions.filter((t) => t.createdAt.startsWith(todayStr) && !t.isVoided);

    const { totalIncomes: todayIncomes, totalExpenses: todayExpenses, operatingProfit: todayOperatingProfit } =
      calculateOperatingProfit(todayTx);

    const { totalReceived, pendingPayableDebt, totalGiven, pendingReceivableMoney } =
      calculateLoansMetrics(loans);

    const initial = currentRegister ? currentRegister.initialBalance : 0;
    const currentCash = currentRegister ? liveExpectedBalance : 0;
    const variation = currentCash - initial;
    const variationPct = initial > 0 ? (variation / initial) * 100 : 0;

    // Platform balances (PTM, Bemovil, Punto de Pago, etc.)
    const totalPlatformsBalance = platforms
      .filter((p) => p.isActive)
      .reduce((sum, p) => sum + (p.currentBalance || 0), 0);

    const totalGlobalLiquidity = currentCash + totalPlatformsBalance;

    return {
      availableLiquidity: currentCash,
      expectedCashInRegister: currentCash,
      totalPlatformsBalance,
      totalGlobalLiquidity,
      todayIncomes,
      todayExpenses,
      todayOperatingProfit,
      receivedLoansTotal: totalReceived,
      pendingPayableDebt,
      givenLoansTotal: totalGiven,
      pendingReceivableMoney,
      liquidityVariation: variation,
      liquidityVariationPercentage: variationPct,
      openRegister: currentRegister,
    };
  }, [transactions, loans, currentRegister, liveExpectedBalance, platforms]);

  // Switch role seamlessly for testing
  const switchUserRole = useCallback((role: UserRole) => {
    const matchedUser = users.find((u) => u.role === role) || {
      id: `usr-${role}`,
      name: role === 'admin' ? 'Carlos Mendoza (Admin)' : 'Yorle Martínez (Cajero)',
      email: `${role}@puntoexpress.co`,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(matchedUser);
    addToast('info', 'Rol cambiado', `Has cambiado a vista de ${role.toUpperCase()}`);
  }, [users, addToast]);

  // Open Cash Register
  const openCashRegister = async (
    initialBalance: number,
    platformBalances?: { platformId: string; balance: number }[]
  ): Promise<boolean> => {
    if (initialBalance < 0) {
      addToast('error', 'Error', 'El saldo inicial no puede ser negativo.');
      return false;
    }

    if (currentRegister) {
      addToast('warning', 'Caja ya abierta', 'Ya existe una caja abierta actualmente.');
      return false;
    }

    setIsProcessing(true);
    try {
      // 1. Update platform balances if provided
      const platformSnapshots: PlatformInitialSnapshot[] = [];
      let totalInitialPlatforms = 0;

      if (platformBalances && platformBalances.length > 0) {
        for (const pb of platformBalances) {
          if (!isNaN(pb.balance) && pb.balance >= 0) {
            setPlatforms((prev) =>
              prev.map((p) =>
                p.id === pb.platformId
                  ? { ...p, currentBalance: pb.balance, initialBalance: pb.balance, lastUpdated: new Date().toISOString() }
                  : p
              )
            );
            const platObj = platforms.find((p) => p.id === pb.platformId);
            platformSnapshots.push({
              platformId: pb.platformId,
              platformName: platObj?.name || pb.platformId,
              initialBalance: pb.balance,
            });
            totalInitialPlatforms += pb.balance;
          }
        }
      } else {
        platforms.forEach((p) => {
          platformSnapshots.push({
            platformId: p.id,
            platformName: p.name,
            initialBalance: p.currentBalance,
          });
          totalInitialPlatforms += p.currentBalance;
        });
      }

      const totalInitialGlobal = initialBalance + totalInitialPlatforms;

      const newRegister: CashRegister = {
        id: `reg-${Date.now()}`,
        openedAt: new Date().toISOString(),
        openedByUserId: currentUser.id,
        openedByUserName: currentUser.name,
        initialBalance,
        initialPlatformsBalances: platformSnapshots,
        totalInitialPlatforms,
        totalInitialGlobal,
        expectedBalance: initialBalance,
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      setCashRegisters((prev) => [newRegister, ...prev]);
      logAudit(
        'open_cash',
        'cash_register',
        newRegister.id,
        `Apertura de caja con base física de $${initialBalance.toLocaleString('es-CO')} y $${totalInitialPlatforms.toLocaleString('es-CO')} en plataformas digitales. Gran Total Liquidez: $${totalInitialGlobal.toLocaleString('es-CO')}`,
        undefined,
        { initialBalance, totalInitialPlatforms, totalInitialGlobal }
      );
      addToast(
        'success',
        'Caja abierta con éxito',
        `Iniciaste operaciones con $${initialBalance.toLocaleString('es-CO')} en gaveta y $${totalInitialPlatforms.toLocaleString('es-CO')} en plataformas digitales.`
      );
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  // Close Cash Register with Arqueo & Platform Reconciliation
  const closeCashRegister = async (
    physicalBalance: number,
    platformsClosing?: { platformId: string; actualBalance: number }[],
    differenceReason?: string,
    notes?: string
  ): Promise<boolean> => {
    if (!currentRegister) {
      addToast('error', 'Error', 'No hay ninguna caja abierta para cerrar.');
      return false;
    }

    if (physicalBalance < 0 || isNaN(physicalBalance)) {
      addToast('error', 'Error', 'Debes ingresar el dinero físico contado.');
      return false;
    }

    const expectedCash = liveExpectedBalance;
    const cashDifference = physicalBalance - expectedCash;

    // Platform closing snapshots
    const closingSnapshots: PlatformClosingSnapshot[] = [];
    let totalPlatformsExpected = 0;
    let totalPlatformsActual = 0;

    platforms.forEach((plat) => {
      const expected = plat.currentBalance;
      const actualObj = platformsClosing?.find((p) => p.platformId === plat.id);
      const actual = actualObj !== undefined && !isNaN(actualObj.actualBalance) ? actualObj.actualBalance : expected;
      const diff = actual - expected;

      totalPlatformsExpected += expected;
      totalPlatformsActual += actual;

      closingSnapshots.push({
        platformId: plat.id,
        platformName: plat.name,
        expectedBalance: expected,
        actualBalance: actual,
        difference: diff,
      });
    });

    const totalPlatformsDifference = totalPlatformsActual - totalPlatformsExpected;
    const globalExpectedBalance = expectedCash + totalPlatformsExpected;
    const globalActualBalance = physicalBalance + totalPlatformsActual;
    const globalDifference = globalActualBalance - globalExpectedBalance;

    const hasAnyDifference = cashDifference !== 0 || totalPlatformsDifference !== 0 || globalDifference !== 0;

    if (hasAnyDifference && !differenceReason) {
      addToast('warning', 'Justificación requerida', 'Debes seleccionar el motivo de la diferencia encontrada.');
      return false;
    }

    setIsProcessing(true);
    try {
      const closedAt = new Date().toISOString();

      // Update platform current balances to actual confirmed balances if any changed
      if (platformsClosing && platformsClosing.length > 0) {
        setPlatforms((prev) =>
          prev.map((p) => {
            const found = platformsClosing.find((item) => item.platformId === p.id);
            if (found && !isNaN(found.actualBalance) && found.actualBalance !== p.currentBalance) {
              return {
                ...p,
                currentBalance: found.actualBalance,
                lastUpdated: closedAt,
              };
            }
            return p;
          })
        );
      }

      const updatedRegister: CashRegister = {
        ...currentRegister,
        closedAt,
        closedByUserId: currentUser.id,
        closedByUserName: currentUser.name,
        expectedBalance: expectedCash,
        physicalCountedBalance: physicalBalance,
        difference: cashDifference,
        platformsClosingSnapshots: closingSnapshots,
        totalPlatformsExpected,
        totalPlatformsActual,
        totalPlatformsDifference,
        globalExpectedBalance,
        globalActualBalance,
        globalDifference,
        differenceReason,
        differenceNotes: notes,
        status: 'closed',
      };

      setCashRegisters((prev) =>
        prev.map((r) => (r.id === currentRegister.id ? updatedRegister : r))
      );

      logAudit(
        'close_cash',
        'cash_register',
        currentRegister.id,
        `Cierre de caja y plataformas. Físico: $${physicalBalance.toLocaleString('es-CO')} (Esp: $${expectedCash.toLocaleString('es-CO')}). Plataformas: $${totalPlatformsActual.toLocaleString('es-CO')} (Esp: $${totalPlatformsExpected.toLocaleString('es-CO')}). Gran Total: $${globalActualBalance.toLocaleString('es-CO')} (Esp: $${globalExpectedBalance.toLocaleString('es-CO')})`,
        { status: 'open' },
        { status: 'closed', cashDifference, totalPlatformsDifference, globalDifference, differenceReason }
      );

      if (globalDifference === 0 && cashDifference === 0) {
        addToast('success', 'Caja y Plataformas Cuadradas ✅', 'El cierre concilió exactamente en efectivo físico y plataformas digitales.');
      } else if (globalDifference < 0) {
        addToast('warning', 'Cierre con Faltante Global 🔴', `Faltante global de $${Math.abs(globalDifference).toLocaleString('es-CO')}. Motivo: ${differenceReason}`);
      } else {
        addToast('info', 'Cierre con Sobrante Global 🟢', `Sobrante global de $${globalDifference.toLocaleString('es-CO')}. Motivo: ${differenceReason}`);
      }

      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  // Reopen Cash Register (Admin Only)
  const reopenCashRegister = async (registerId: string, reason: string): Promise<boolean> => {
    if (currentUser.role !== 'admin') {
      addToast('error', 'Acceso denegado', 'Solo los administradores pueden reabrir una caja.');
      return false;
    }

    if (!reason || reason.trim().length < 5) {
      addToast('warning', 'Motivo requerido', 'Debes especificar un motivo detallado para reabrir la caja.');
      return false;
    }

    if (currentRegister) {
      addToast('error', 'Conflicto', 'Ya existe otra caja abierta. Debes cerrarla antes de reabrir una anterior.');
      return false;
    }

    setIsProcessing(true);
    try {
      setCashRegisters((prev) =>
        prev.map((r) => {
          if (r.id === registerId) {
            return {
              ...r,
              status: 'open',
              reopenedAt: new Date().toISOString(),
              reopenedByUserName: currentUser.name,
              reopenedReason: reason,
              closedAt: undefined,
              closedByUserId: undefined,
              closedByUserName: undefined,
            };
          }
          return r;
        })
      );

      logAudit('reopen_cash', 'cash_register', registerId, `Reapertura de caja autorizada por ${currentUser.name}. Motivo: ${reason}`);
      addToast('success', 'Caja Reabierta', 'La caja fue reabierta para correcciones.');
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  // Create Financial Transaction (Ingreso, Egreso, etc.)
  const createTransaction = async (params: {
    type: TransactionType;
    amount: number;
    paymentMethodCode: PaymentMethodCode;
    description: string;
    serviceId?: string;
    categoryId?: string;
    platformId?: string;
    reference?: string;
    customerOrProvider?: string;
    loanId?: string;
  }): Promise<Transaction | null> => {
    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes abrir una caja antes de registrar movimientos financieros.');
      return null;
    }

    if (params.amount <= 0 || isNaN(params.amount)) {
      addToast('error', 'Monto inválido', 'El monto debe ser un valor numérico mayor a cero.');
      return null;
    }

    if (!params.description.trim()) {
      addToast('warning', 'Descripción requerida', 'Debes ingresar un concepto o descripción del movimiento.');
      return null;
    }

    setIsProcessing(true);
    try {
      const pm = paymentMethods.find((p) => p.code === params.paymentMethodCode);
      const serv = services.find((s) => s.id === params.serviceId);
      const cat = categories.find((c) => c.id === params.categoryId);
      const plat = platforms.find((p) => p.id === params.platformId);

      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        cashRegisterId: currentRegister.id,
        type: params.type,
        serviceId: params.serviceId,
        serviceName: serv?.name,
        categoryId: params.categoryId,
        categoryName: cat?.name,
        platformId: params.platformId,
        platformName: plat?.name,
        description: params.description.trim(),
        amount: Math.round(params.amount),
        paymentMethodCode: params.paymentMethodCode,
        paymentMethodName: pm?.name || params.paymentMethodCode,
        reference: params.reference?.trim(),
        customerOrProvider: params.customerOrProvider?.trim(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        createdAt: new Date().toISOString(),
        isVoided: false,
        loanId: params.loanId,
      };

      setTransactions((prev) => [newTx, ...prev]);

      // Audit
      logAudit(
        'create',
        'transaction',
        newTx.id,
        `Registro de ${params.type.toUpperCase()}: ${newTx.description} por $${newTx.amount.toLocaleString('es-CO')}`,
        undefined,
        { ...newTx }
      );

      const typeLabels: Record<TransactionType, string> = {
        ingreso: 'Ingreso registrado correctamente',
        egreso: 'Egreso registrado correctamente',
        prestamo_recibido: 'Préstamo recibido registrado',
        prestamo_entregado: 'Dinero prestado registrado',
        pago_prestamo: 'Pago de préstamo registrado',
        cobro_prestamo: 'Cobro de préstamo registrado',
        ajuste: 'Ajuste de caja registrado',
      };

      addToast('success', 'Operación Exitosa', typeLabels[params.type]);
      return newTx;
    } finally {
      setIsProcessing(false);
    }
  };

  // Void Transaction logically (No physical deletion - Reglas 5 & 6)
  const voidTransaction = async (transactionId: string, reason: string): Promise<boolean> => {
    if (!reason || reason.trim().length < 4) {
      addToast('warning', 'Motivo requerido', 'Debes ingresar el motivo de la anulación.');
      return false;
    }

    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) {
      addToast('error', 'Error', 'El movimiento no fue encontrado.');
      return false;
    }

    if (tx.isVoided) {
      addToast('warning', 'Ya anulado', 'Este movimiento ya se encuentra anulado.');
      return false;
    }

    // Role check: Only admin or cashier who created in open register
    if (currentUser.role !== 'admin' && tx.userId !== currentUser.id) {
      addToast('error', 'Permiso denegado', 'Solo el administrador o el creador pueden anular este movimiento.');
      return false;
    }

    setIsProcessing(true);
    try {
      const voidedAt = new Date().toISOString();

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transactionId
            ? {
                ...t,
                isVoided: true,
                voidedAt,
                voidedByUserId: currentUser.id,
                voidedByUserName: currentUser.name,
                voidReason: reason.trim(),
              }
            : t
        )
      );

      logAudit(
        'void',
        'transaction',
        transactionId,
        `Anulación de movimiento: "${tx.description}" ($${tx.amount.toLocaleString('es-CO')}). Motivo: ${reason}`,
        { isVoided: false },
        { isVoided: true, voidReason: reason }
      );

      addToast('info', 'Movimiento Anulado', 'El movimiento fue anulado y los saldos se recalcularon.');
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  // Create Loan (Recibido o Entregado)
  const createLoan = async (params: {
    type: 'recibido' | 'entregado';
    counterpartName: string;
    contactPhone?: string;
    initialAmount: number;
    dueDate?: string;
    reason: string;
    notes?: string;
    paymentMethodCode: PaymentMethodCode;
  }): Promise<Loan | null> => {
    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes abrir una caja antes de registrar un préstamo.');
      return null;
    }

    if (params.initialAmount <= 0) {
      addToast('error', 'Monto inválido', 'El monto del préstamo debe ser mayor a 0.');
      return null;
    }

    setIsProcessing(true);
    try {
      const loanId = `loan-${Date.now()}`;
      const newLoan: Loan = {
        id: loanId,
        type: params.type,
        counterpartName: params.counterpartName.trim(),
        contactPhone: params.contactPhone?.trim(),
        initialAmount: Math.round(params.initialAmount),
        currentBalance: Math.round(params.initialAmount),
        paidAmount: 0,
        dueDate: params.dueDate,
        reason: params.reason.trim(),
        notes: params.notes?.trim(),
        status: 'pendiente',
        createdAt: new Date().toISOString(),
        createdByUserId: currentUser.id,
        createdByUserName: currentUser.name,
      };

      setLoans((prev) => [newLoan, ...prev]);

      // Also create associated financial transaction to affect cash balance
      const txType: TransactionType = params.type === 'recibido' ? 'prestamo_recibido' : 'prestamo_entregado';
      const desc =
        params.type === 'recibido'
          ? `Préstamo recibido de ${params.counterpartName}: ${params.reason}`
          : `Dinero prestado a ${params.counterpartName}: ${params.reason}`;

      await createTransaction({
        type: txType,
        amount: params.initialAmount,
        paymentMethodCode: params.paymentMethodCode,
        description: desc,
        customerOrProvider: params.counterpartName,
        loanId,
      });

      logAudit(
        'create',
        'loan',
        loanId,
        `Nuevo préstamo ${params.type} de $${params.initialAmount.toLocaleString('es-CO')} con ${params.counterpartName}`,
        undefined,
        { ...newLoan }
      );

      addToast('success', 'Préstamo Registrado', `Se registró el préstamo de $${params.initialAmount.toLocaleString('es-CO')}`);
      return newLoan;
    } finally {
      setIsProcessing(false);
    }
  };

  // Register Loan Payment / Abono
  const registerLoanPayment = async (params: {
    loanId: string;
    amount: number;
    paymentMethodCode: PaymentMethodCode;
    notes?: string;
  }): Promise<boolean> => {
    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes abrir una caja antes de registrar abonos.');
      return false;
    }

    const loan = loans.find((l) => l.id === params.loanId);
    if (!loan) {
      addToast('error', 'Error', 'El préstamo no fue encontrado.');
      return false;
    }

    if (params.amount <= 0 || params.amount > loan.currentBalance) {
      addToast('error', 'Monto no válido', `El abono debe ser entre $1 y el saldo pendiente ($${loan.currentBalance.toLocaleString('es-CO')})`);
      return false;
    }

    setIsProcessing(true);
    try {
      const newPaidAmount = loan.paidAmount + params.amount;
      const newBalance = loan.currentBalance - params.amount;
      const newStatus: Loan['status'] = newBalance === 0 ? 'pagado' : 'parcial';

      setLoans((prev) =>
        prev.map((l) =>
          l.id === params.loanId
            ? { ...l, paidAmount: newPaidAmount, currentBalance: newBalance, status: newStatus }
            : l
        )
      );

      // Corresponding transaction
      // If we received a loan, paying it back is 'pago_prestamo' (reduces cash)
      // If we gave a loan, collecting it back is 'cobro_prestamo' (increases cash)
      const txType: TransactionType = loan.type === 'recibido' ? 'pago_prestamo' : 'cobro_prestamo';
      const desc =
        loan.type === 'recibido'
          ? `Abono/Pago de préstamo a ${loan.counterpartName}`
          : `Cobro/Abono recibido de préstamo de ${loan.counterpartName}`;

      await createTransaction({
        type: txType,
        amount: params.amount,
        paymentMethodCode: params.paymentMethodCode,
        description: `${desc}${params.notes ? ` - ${params.notes}` : ''}`,
        customerOrProvider: loan.counterpartName,
        loanId: loan.id,
      });

      logAudit(
        'update',
        'loan_payment',
        loan.id,
        `Abono de $${params.amount.toLocaleString('es-CO')} registrado para préstamo con ${loan.counterpartName}. Saldo restante: $${newBalance.toLocaleString('es-CO')}`,
        { currentBalance: loan.currentBalance },
        { currentBalance: newBalance, status: newStatus }
      );

      addToast(
        'success',
        'Abono Registrado',
        newBalance === 0
          ? `¡Préstamo cancelado en su totalidad! 🎉`
          : `Abono de $${params.amount.toLocaleString('es-CO')} registrado. Saldo restante: $${newBalance.toLocaleString('es-CO')}`
      );
      return true;
    } finally {
      setIsProcessing(false);
    }
  };

  // Services Management
  const addService = (service: Omit<ServiceItem, 'id' | 'createdAt'>) => {
    const newService: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setServices((prev) => [newService, ...prev]);
    logAudit('create', 'service', newService.id, `Nuevo servicio creado: ${newService.name}`);
    addToast('success', 'Servicio Creado', `El servicio "${newService.name}" fue agregado.`);
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    logAudit('update', 'service', id, `Servicio actualizado: ${updates.name || id}`);
    addToast('success', 'Servicio Actualizado', 'Los cambios fueron guardados.');
  };

  const deleteService = (id: string) => {
    const s = services.find((item) => item.id === id);
    if (!s) return;
    setServices((prev) => prev.filter((item) => item.id !== id));
    logAudit('void', 'service', id, `Servicio eliminado del catálogo: ${s.name}`);
    addToast('info', 'Servicio Eliminado', `El servicio "${s.name}" fue eliminado.`);
  };

  const toggleServiceActive = (id: string) => {
    const s = services.find((item) => item.id === id);
    if (!s) return;
    const newState = !s.isActive;
    updateService(id, { isActive: newState });
    addToast('info', 'Estado Actualizado', `Servicio ${s.name} ${newState ? 'activado' : 'desactivado'}`);
  };

  // Digital Platforms (PTM, Bemovil, Punto de Pago, and custom ones)
  const addPlatform = (platform: Omit<DigitalPlatform, 'id' | 'lastUpdated' | 'createdAt'>) => {
    const newPlat: DigitalPlatform = {
      ...platform,
      id: `plat-${Date.now()}`,
      initialBalance: platform.currentBalance || 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setPlatforms((prev) => [...prev, newPlat]);
    logAudit('create', 'platform', newPlat.id, `Nueva plataforma digital registrada: ${newPlat.name} con saldo $${newPlat.currentBalance.toLocaleString('es-CO')}`);
    addToast('success', 'Plataforma Agregada', `Plataforma "${newPlat.name}" añadida con éxito.`);
  };

  const updatePlatform = (id: string, updates: Partial<DigitalPlatform>) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p
      )
    );
    logAudit('update', 'platform', id, `Plataforma actualizada`);
    addToast('success', 'Plataforma Actualizada', 'Los cambios en la plataforma fueron guardados.');
  };

  const deletePlatform = (id: string) => {
    const p = platforms.find((item) => item.id === id);
    if (!p) return;
    setPlatforms((prev) => prev.filter((item) => item.id !== id));
    logAudit('void', 'platform', id, `Plataforma eliminada: ${p.name}`);
    addToast('info', 'Plataforma Eliminada', `La plataforma "${p.name}" fue eliminada.`);
  };

  const togglePlatformActive = (id: string) => {
    const p = platforms.find((item) => item.id === id);
    if (!p) return;
    const newState = !p.isActive;
    updatePlatform(id, { isActive: newState });
    addToast('info', 'Estado de Plataforma', `Plataforma ${p.name} ${newState ? 'activada' : 'desactivada'}`);
  };

  const adjustPlatformBalance = async (platformId: string, newBalance: number, reason: string): Promise<boolean> => {
    const p = platforms.find((item) => item.id === platformId);
    if (!p) {
      addToast('error', 'Error', 'Plataforma no encontrada');
      return false;
    }
    const oldBalance = p.currentBalance;
    const diff = newBalance - oldBalance;

    setPlatforms((prev) =>
      prev.map((item) =>
        item.id === platformId
          ? { ...item, currentBalance: newBalance, lastUpdated: new Date().toISOString() }
          : item
      )
    );

    const newTx: PlatformTransaction = {
      id: `ptx-${Date.now()}`,
      platformId,
      platformName: p.name,
      type: 'ajuste_directo',
      amount: Math.abs(diff),
      description: `Ajuste de saldo: ${reason} (Antes: $${oldBalance.toLocaleString('es-CO')} -> Ahora: $${newBalance.toLocaleString('es-CO')})`,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setPlatformTransactions((prev) => [newTx, ...prev]);

    logAudit(
      'config_change',
      'platform',
      platformId,
      `Ajuste de saldo en ${p.name}: de $${oldBalance.toLocaleString('es-CO')} a $${newBalance.toLocaleString('es-CO')}. Motivo: ${reason}`
    );

    addToast('success', 'Saldo Actualizado', `Saldo de ${p.name} actualizado a $${newBalance.toLocaleString('es-CO')}.`);
    return true;
  };

  const transferBetweenCashAndPlatform = async (params: {
    platformId: string;
    amount: number;
    direction: 'cash_to_platform' | 'platform_to_cash';
    description?: string;
    reference?: string;
  }): Promise<boolean> => {
    if (params.amount <= 0 || isNaN(params.amount)) {
      addToast('error', 'Monto inválido', 'El monto de transferencia debe ser mayor a 0.');
      return false;
    }

    const platform = platforms.find((p) => p.id === params.platformId);
    if (!platform) {
      addToast('error', 'Error', 'Plataforma no encontrada.');
      return false;
    }

    if (!currentRegister) {
      addToast('error', 'Caja cerrada', 'Debes tener una caja abierta para transferir dinero con efectivo físico.');
      return false;
    }

    setIsProcessing(true);
    try {
      if (params.direction === 'cash_to_platform') {
        // Cash leaves drawer -> Platform gets credited
        // Check if cash drawer has enough funds
        if (liveExpectedBalance < params.amount) {
          addToast('warning', 'Fondos insuficientes en caja', `La caja solo tiene $${liveExpectedBalance.toLocaleString('es-CO')} en efectivo.`);
        }

        // 1. Log Egreso from cash drawer
        await createTransaction({
          type: 'egreso',
          amount: params.amount,
          paymentMethodCode: 'efectivo',
          description: `Carga de cupo a plataforma ${platform.name}: ${params.description || 'Recarga de saldo digital'}`,
          reference: params.reference,
          customerOrProvider: platform.name,
          platformId: platform.id,
        });

        // 2. Increase platform balance
        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === platform.id
              ? { ...p, currentBalance: p.currentBalance + params.amount, lastUpdated: new Date().toISOString() }
              : p
          )
        );

        // 3. Platform movement record
        const ptx: PlatformTransaction = {
          id: `ptx-${Date.now()}`,
          platformId: platform.id,
          platformName: platform.name,
          type: 'carga_desde_caja',
          amount: params.amount,
          description: params.description || `Carga de saldo desde caja física (${currentRegister.id})`,
          reference: params.reference,
          cashRegisterId: currentRegister.id,
          userId: currentUser.id,
          userName: currentUser.name,
          createdAt: new Date().toISOString(),
        };
        setPlatformTransactions((prev) => [ptx, ...prev]);

        addToast(
          'success',
          'Recarga Exitosa',
          `Se transfirieron $${params.amount.toLocaleString('es-CO')} de la caja física a ${platform.name}.`
        );
        return true;
      } else {
        // Platform gets debited -> Cash drawer receives money
        if (platform.currentBalance < params.amount) {
          addToast('error', 'Saldo insuficiente', `La plataforma ${platform.name} solo tiene $${platform.currentBalance.toLocaleString('es-CO')}.`);
          return false;
        }

        // 1. Log Ingreso in cash drawer
        await createTransaction({
          type: 'ingreso',
          amount: params.amount,
          paymentMethodCode: 'efectivo',
          description: `Descarga / Retiro de fondos de ${platform.name} a caja física: ${params.description || 'Descarga de saldo'}`,
          reference: params.reference,
          customerOrProvider: platform.name,
          platformId: platform.id,
        });

        // 2. Decrease platform balance
        setPlatforms((prev) =>
          prev.map((p) =>
            p.id === platform.id
              ? { ...p, currentBalance: p.currentBalance - params.amount, lastUpdated: new Date().toISOString() }
              : p
          )
        );

        // 3. Platform movement record
        const ptx: PlatformTransaction = {
          id: `ptx-${Date.now()}`,
          platformId: platform.id,
          platformName: platform.name,
          type: 'descarga_a_caja',
          amount: params.amount,
          description: params.description || `Descarga de fondos a caja física (${currentRegister.id})`,
          reference: params.reference,
          cashRegisterId: currentRegister.id,
          userId: currentUser.id,
          userName: currentUser.name,
          createdAt: new Date().toISOString(),
        };
        setPlatformTransactions((prev) => [ptx, ...prev]);

        addToast(
          'success',
          'Descarga Exitosa',
          `Se descargaron $${params.amount.toLocaleString('es-CO')} de ${platform.name} ingresando a la caja física.`
        );
        return true;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Set / Mount Initial Cash Balance & Platform balances
  const setInitialCashBalance = async (params: {
    amount: number;
    mode?: 'set_base' | 'adjust_capital';
    reason?: string;
    platformBalances?: { platformId: string; balance: number }[];
  }): Promise<boolean> => {
    if (params.amount < 0 || isNaN(params.amount)) {
      addToast('error', 'Monto inválido', 'El saldo inicial no puede ser un valor negativo.');
      return false;
    }

    setIsProcessing(true);
    try {
      // 1. Update platform balances if provided
      if (params.platformBalances && params.platformBalances.length > 0) {
        for (const pb of params.platformBalances) {
          if (!isNaN(pb.balance) && pb.balance >= 0) {
            setPlatforms((prev) =>
              prev.map((p) =>
                p.id === pb.platformId
                  ? { ...p, currentBalance: pb.balance, initialBalance: pb.balance, lastUpdated: new Date().toISOString() }
                  : p
              )
            );
          }
        }
      }

      if (!currentRegister) {
        // If no open register, open one with this exact amount
        return await openCashRegister(params.amount);
      }

      if (params.mode === 'adjust_capital') {
        // Create an 'ajuste' transaction
        await createTransaction({
          type: 'ajuste',
          amount: params.amount,
          paymentMethodCode: 'efectivo',
          description: `Ajuste / Inyección de Capital a la Caja: ${params.reason || 'Carga de dinero actual'}`,
        });
        logAudit('create', 'transaction', currentRegister.id, `Inyección de capital de $${params.amount.toLocaleString('es-CO')} en caja activa.`);
        addToast('success', 'Capital Inyectado', `Se agregaron $${params.amount.toLocaleString('es-CO')} a la caja activa.`);
        return true;
      } else {
        // Directly update the active register's initialBalance
        const oldInitial = currentRegister.initialBalance;
        const updatedRegister: CashRegister = {
          ...currentRegister,
          initialBalance: params.amount,
        };

        setCashRegisters((prev) =>
          prev.map((r) => (r.id === currentRegister.id ? updatedRegister : r))
        );

        logAudit(
          'config_change',
          'cash_register',
          currentRegister.id,
          `Modificación del Saldo Inicial de Caja: De $${oldInitial.toLocaleString('es-CO')} a $${params.amount.toLocaleString('es-CO')}. Motivo: ${params.reason || 'Configuración de dinero actual'}`,
          { initialBalance: oldInitial },
          { initialBalance: params.amount, reason: params.reason }
        );

        addToast(
          'success',
          'Saldos Actualizados',
          `Se configuró el dinero inicial en caja física ($${params.amount.toLocaleString('es-CO')}) y plataformas digitales.`
        );
        return true;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Categories Management
  const addCategory = (category: Omit<CategoryItem, 'id' | 'createdAt'>) => {
    const newCat: CategoryItem = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [newCat, ...prev]);
    logAudit('create', 'category', newCat.id, `Nueva categoría creada: ${newCat.name} (${newCat.type})`);
    addToast('success', 'Categoría Creada', `Categoría "${newCat.name}" agregada.`);
  };

  const updateCategory = (id: string, updates: Partial<CategoryItem>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit('update', 'category', id, `Categoría actualizada`);
    addToast('success', 'Categoría Actualizada', 'Los cambios fueron guardados.');
  };

  const toggleCategoryActive = (id: string) => {
    const c = categories.find((item) => item.id === id);
    if (!c) return;
    const newState = !c.isActive;
    updateCategory(id, { isActive: newState });
    addToast('info', 'Estado Actualizado', `Categoría ${c.name} ${newState ? 'activada' : 'desactivada'}`);
  };

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('config_change', 'settings', 'business_config', 'Actualización de configuración del negocio');
    addToast('success', 'Configuración Guardada', 'La información del negocio ha sido actualizada.');
  };

  // Users
  const addUser = (user: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newUser: UserProfile = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    logAudit('create', 'user', newUser.id, `Usuario creado: ${newUser.name} (${newUser.role})`);
    addToast('success', 'Usuario Creado', `Usuario ${newUser.name} registrado.`);
  };

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logAudit('update', 'user', id, `Usuario actualizado: ${updates.name || id}`);
    addToast('success', 'Usuario Actualizado', 'Perfil actualizado.');
  };

  // Reset to Demo
  const resetToDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setServices(INITIAL_SERVICES);
    setPlatforms(INITIAL_PLATFORMS);
    setPlatformTransactions(INITIAL_PLATFORM_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setCashRegisters(INITIAL_CASH_REGISTERS);
    setLoans(INITIAL_LOANS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SETTINGS);
    addToast('info', 'Datos Restaurados', 'Se cargaron los datos demostrativos del Punto de Pago.');
  };

  // Clear all data
  const clearAllData = () => {
    setTransactions([]);
    setLoans([]);
    setCashRegisters([]);
    setAuditLogs([]);
    setPlatformTransactions([]);
    addToast('warning', 'Datos Limpiados', 'Se han limpiado todas las transacciones y registros de caja.');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser,
        switchUserRole,
        users,
        services,
        categories,
        paymentMethods,
        platforms,
        platformTransactions,
        cashRegisters,
        currentRegister,
        transactions,
        loans,
        auditLogs,
        settings,
        summary,
        isProcessing,
        toasts,
        addToast,
        removeToast,
        openCashRegister,
        closeCashRegister,
        reopenCashRegister,
        createTransaction,
        voidTransaction,
        createLoan,
        registerLoanPayment,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        addPlatform,
        updatePlatform,
        deletePlatform,
        togglePlatformActive,
        adjustPlatformBalance,
        transferBetweenCashAndPlatform,
        setInitialCashBalance,
        addCategory,
        updateCategory,
        toggleCategoryActive,
        updateSettings,
        addUser,
        updateUser,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
