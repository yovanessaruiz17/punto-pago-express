/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/ui/ToastContainer';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { IncomesPage } from './pages/IncomesPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { LoansPage } from './pages/LoansPage';
import { CashPage } from './pages/CashPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

// Modals
import { QuickIncomeModal } from './components/modals/QuickIncomeModal';
import { QuickExpenseModal } from './components/modals/QuickExpenseModal';
import { QuickLoanModal } from './components/modals/QuickLoanModal';
import { QuickLoanPaymentModal } from './components/modals/QuickLoanPaymentModal';
import { OpenCashModal } from './components/modals/OpenCashModal';
import { CloseCashModal } from './components/modals/CloseCashModal';
import { SetInitialCashModal } from './components/modals/SetInitialCashModal';

// Mobile Quick Action Menu Modal
import { Modal } from './components/ui/Modal';
import { ArrowDownLeft, ArrowUpRight, HandCoins, Lock, LockOpen, BarChart3, Layers, Coins, Smartphone } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentRegister, isAuthenticated } = useApp();

  // If not logged in, render the login page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Active View Tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMobileQuickMenuOpen, setIsMobileQuickMenuOpen] = useState<boolean>(false);

  // Modal Visibility States
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState<boolean>(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState<boolean>(false);
  const [isLoanPaymentModalOpen, setIsLoanPaymentModalOpen] = useState<boolean>(false);
  const [isOpenCashModalOpen, setIsOpenCashModalOpen] = useState<boolean>(false);
  const [isCloseCashModalOpen, setIsCloseCashModalOpen] = useState<boolean>(false);
  const [isSetInitialCashModalOpen, setIsSetInitialCashModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white flex flex-col antialiased">
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col flex-1 pb-20 lg:pb-8">
        {/* Top Sticky Navbar */}
        <Navbar
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenQuickIncome={() => setIsIncomeModalOpen(true)}
          onOpenQuickExpense={() => setIsExpenseModalOpen(true)}
          onOpenSetInitialCash={() => setIsSetInitialCashModalOpen(true)}
          onOpenCashModal={() => {
            if (currentRegister) {
              setIsCloseCashModalOpen(true);
            } else {
              setIsOpenCashModalOpen(true);
            }
          }}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentTab}
              onOpenQuickIncome={() => setIsIncomeModalOpen(true)}
              onOpenQuickExpense={() => setIsExpenseModalOpen(true)}
              onOpenQuickLoan={() => setIsLoanModalOpen(true)}
              onOpenQuickLoanPayment={() => setIsLoanPaymentModalOpen(true)}
              onOpenOpenCashModal={() => setIsOpenCashModalOpen(true)}
              onOpenCloseCashModal={() => setIsCloseCashModalOpen(true)}
              onOpenSetInitialCash={() => setIsSetInitialCashModalOpen(true)}
            />
          )}

          {currentTab === 'servicios' && (
            <ServicesPage
              onOpenQuickIncomeWithService={() => {
                setIsIncomeModalOpen(true);
              }}
            />
          )}

          {currentTab === 'plataformas' && <PlatformsPage />}

          {currentTab === 'ingresos' && (
            <IncomesPage onOpenQuickIncome={() => setIsIncomeModalOpen(true)} />
          )}

          {currentTab === 'egresos' && (
            <ExpensesPage onOpenQuickExpense={() => setIsExpenseModalOpen(true)} />
          )}

          {currentTab === 'prestamos' && (
            <LoansPage
              onOpenQuickLoan={() => setIsLoanModalOpen(true)}
              onOpenQuickLoanPayment={() => setIsLoanPaymentModalOpen(true)}
            />
          )}

          {currentTab === 'caja' && (
            <CashPage
              onOpenOpenCashModal={() => setIsOpenCashModalOpen(true)}
              onOpenCloseCashModal={() => setIsCloseCashModalOpen(true)}
              onOpenSetInitialCash={() => setIsSetInitialCashModalOpen(true)}
            />
          )}

          {currentTab === 'movimientos' && <TransactionsPage />}

          {currentTab === 'reportes' && <ReportsPage />}

          {currentTab === 'usuarios' && <UsersPage />}

          {currentTab === 'auditoria' && <AuditPage />}

          {currentTab === 'configuracion' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickActionMenu={() => setIsMobileQuickMenuOpen(true)}
      />

      {/* Mobile Quick Action Floating Menu */}
      <Modal
        isOpen={isMobileQuickMenuOpen}
        onClose={() => setIsMobileQuickMenuOpen(false)}
        title="Registrar Operación Rápida"
        maxWidth="sm"
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileQuickMenuOpen(false);
              setIsIncomeModalOpen(true);
            }}
            disabled={!currentRegister}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100 transition-all text-center disabled:opacity-40"
          >
            <ArrowDownLeft className="w-5 h-5 text-emerald-600 mb-1" />
            <span className="text-xs font-bold">➕ Ingreso</span>
            <span className="text-[10px] text-emerald-700">Recaudo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileQuickMenuOpen(false);
              setIsExpenseModalOpen(true);
            }}
            disabled={!currentRegister}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-rose-50 text-rose-950 border border-rose-200 hover:bg-rose-100 transition-all text-center disabled:opacity-40"
          >
            <ArrowUpRight className="w-5 h-5 text-rose-600 mb-1" />
            <span className="text-xs font-bold">➖ Egreso</span>
            <span className="text-[10px] text-rose-700">Gastos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileQuickMenuOpen(false);
              setCurrentTab('plataformas');
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-teal-50 text-teal-950 border border-teal-200 hover:bg-teal-100 transition-all text-center"
          >
            <Smartphone className="w-5 h-5 text-teal-600 mb-1" />
            <span className="text-xs font-bold">📱 Plataformas</span>
            <span className="text-[10px] text-teal-700">PTM, Bemovil</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileQuickMenuOpen(false);
              setIsSetInitialCashModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100 transition-all text-center"
          >
            <Coins className="w-5 h-5 text-amber-600 mb-1" />
            <span className="text-xs font-bold">💵 Dinero Inicial</span>
            <span className="text-[10px] text-amber-700">Montar Base</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMobileQuickMenuOpen(false);
              if (currentRegister) {
                setIsCloseCashModalOpen(true);
              } else {
                setIsOpenCashModalOpen(true);
              }
            }}
            className="col-span-2 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-md"
          >
            {currentRegister ? <Lock className="w-4 h-4 text-rose-400" /> : <LockOpen className="w-4 h-4 text-emerald-400" />}
            <span>{currentRegister ? 'Arqueo y Cierre Diario de Caja' : 'Abrir Caja Inicial'}</span>
          </button>
        </div>
      </Modal>

      {/* Global Business Modals */}
      <QuickIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />

      <QuickExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <QuickLoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
      />

      <QuickLoanPaymentModal
        isOpen={isLoanPaymentModalOpen}
        onClose={() => setIsLoanPaymentModalOpen(false)}
      />

      <OpenCashModal
        isOpen={isOpenCashModalOpen}
        onClose={() => setIsOpenCashModalOpen(false)}
      />

      <CloseCashModal
        isOpen={isCloseCashModalOpen}
        onClose={() => setIsCloseCashModalOpen(false)}
      />

      <SetInitialCashModal
        isOpen={isSetInitialCashModalOpen}
        onClose={() => setIsSetInitialCashModalOpen(false)}
      />

      {/* Global Toast Notifications Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
