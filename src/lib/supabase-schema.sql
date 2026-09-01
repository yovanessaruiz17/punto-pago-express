-- ==============================================================================
-- PUNTO DE PAGO EXPRESS — CONTROL DE CAJA
-- SCHEMA COMPLETO POSTGRESQL + SUPABASE (RLS, POLICIES, TRIGGERS Y FUNCIONES)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'cajero');
CREATE TYPE transaction_type AS ENUM ('ingreso', 'egreso', 'prestamo_recibido', 'prestamo_entregado', 'pago_prestamo', 'cobro_prestamo', 'ajuste');
CREATE TYPE cash_register_status AS ENUM ('open', 'closed');
CREATE TYPE loan_type AS ENUM ('recibido', 'entregado');
CREATE TYPE loan_status AS ENUM ('pendiente', 'parcial', 'pagado');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'void', 'open_cash', 'close_cash', 'reopen_cash', 'login', 'config_change');

-- 3. TABLA: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'cajero',
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA: SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    default_price BIGINT DEFAULT 0 CHECK (default_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA: CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ingreso', 'egreso')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLA: PAYMENT_METHODS
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_cash BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABLA: CASH_REGISTERS (Apertura y Cierres)
CREATE TABLE IF NOT EXISTS public.cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    opened_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
    closed_by_user_id UUID REFERENCES public.profiles(id),
    initial_balance BIGINT NOT NULL CHECK (initial_balance >= 0),
    expected_balance BIGINT NOT NULL DEFAULT 0,
    physical_counted_balance BIGINT,
    difference BIGINT,
    difference_reason VARCHAR(100),
    difference_notes TEXT,
    status cash_register_status NOT NULL DEFAULT 'open',
    reopened_at TIMESTAMPTZ,
    reopened_by_user_id UUID REFERENCES public.profiles(id),
    reopened_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint: Only ONE open cash register at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_open_cash_register 
ON public.cash_registers (status) 
WHERE status = 'open';

-- 8. TABLA: LOANS (Préstamos recibidos y entregados)
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type loan_type NOT NULL,
    counterpart_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    initial_amount BIGINT NOT NULL CHECK (initial_amount > 0),
    current_balance BIGINT NOT NULL CHECK (current_balance >= 0),
    paid_amount BIGINT NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    due_date DATE,
    reason TEXT NOT NULL,
    notes TEXT,
    status loan_status NOT NULL DEFAULT 'pendiente',
    created_by_user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABLA: TRANSACTIONS (Movimientos centrales)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cash_register_id UUID NOT NULL REFERENCES public.cash_registers(id),
    type transaction_type NOT NULL,
    subtype VARCHAR(50),
    category_id UUID REFERENCES public.categories(id),
    service_id UUID REFERENCES public.services(id),
    description TEXT NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    payment_method_code VARCHAR(50) NOT NULL REFERENCES public.payment_methods(code),
    reference VARCHAR(100),
    customer_or_provider VARCHAR(255),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Anulación lógica (Regla 5 & 6)
    is_voided BOOLEAN NOT NULL DEFAULT false,
    voided_at TIMESTAMPTZ,
    voided_by_user_id UUID REFERENCES public.profiles(id),
    void_reason TEXT,
    loan_id UUID REFERENCES public.loans(id)
);

-- 10. TABLA: LOAN_PAYMENTS (Abonos)
CREATE TABLE IF NOT EXISTS public.loan_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL CHECK (amount > 0),
    payment_method_code VARCHAR(50) NOT NULL REFERENCES public.payment_methods(code),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TABLA: AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    user_name VARCHAR(255) NOT NULL,
    user_role user_role NOT NULL,
    action audit_action NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TABLA: SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL DEFAULT 'Punto de Pago Express',
    nit VARCHAR(50) NOT NULL DEFAULT '901.458.789-2',
    address TEXT NOT NULL DEFAULT 'Carrera 15 # 45-28, Local 102',
    phone VARCHAR(50) NOT NULL DEFAULT '+57 312 456 7890',
    email VARCHAR(255) NOT NULL DEFAULT 'contacto@puntoexpress.co',
    currency VARCHAR(10) NOT NULL DEFAULT 'COP',
    min_cash_alert BIGINT NOT NULL DEFAULT 200000,
    allow_cashier_reopen BOOLEAN NOT NULL DEFAULT false,
    logo_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_tx_cash_register ON public.transactions(cash_register_id);
CREATE INDEX IF NOT EXISTS idx_tx_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_tx_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);

-- 14. POLÍTICAS RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Read policies for all authenticated active users
CREATE POLICY "Allow read profiles for authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow read services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow read categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow read payment methods" ON public.payment_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage payment methods" ON public.payment_methods FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY "Allow read cash registers" ON public.cash_registers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert cash registers" ON public.cash_registers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow close cash registers" ON public.cash_registers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow read transactions" ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin or owner void transaction" ON public.transactions FOR UPDATE TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Allow read loans" ON public.loans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow manage loans" ON public.loans FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow read loan payments" ON public.loan_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert loan payments" ON public.loan_payments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Allow insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin update settings" ON public.settings FOR UPDATE TO authenticated USING (public.is_admin());

-- 15. FUNCIÓN POSTGRESQL PARA CÁLCULO DE DINERO ESPERADO (Regla 14 & 46)
CREATE OR REPLACE FUNCTION public.calculate_cash_register_expected(p_register_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_initial BIGINT;
    v_net_sum BIGINT;
BEGIN
    SELECT initial_balance INTO v_initial 
    FROM public.cash_registers 
    WHERE id = p_register_id;

    IF v_initial IS NULL THEN
        RETURN 0;
    END IF;

    SELECT COALESCE(SUM(
        CASE 
            WHEN type IN ('ingreso', 'prestamo_recibido', 'cobro_prestamo') THEN amount
            WHEN type IN ('egreso', 'prestamo_entregado', 'pago_prestamo') THEN -amount
            WHEN type = 'ajuste' THEN amount
            ELSE 0
        END
    ), 0) INTO v_net_sum
    FROM public.transactions
    WHERE cash_register_id = p_register_id AND is_voided = false;

    RETURN v_initial + v_net_sum;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
