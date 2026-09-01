# 💼 Punto de Pago Express - Sistema Contable y Control de Caja

Sistema web integral de gestión contable, arqueo de caja diario, recaudos, gastos y control de cartera de préstamos para corresponsales bancarios, puntos de pago de servicios y comercios (adaptado al mercado colombiano - COP).

---

## 🚀 Características Principales

### 1. 📊 Panel de Control y Estadísticas en Tiempo Real
- **Cálculo de Liquidez en Caja:** Muestra el saldo físico real esperado al instante.
- **Utilidad Operativa Neta:** Ingresos por comisiones menos gastos operativos.
- **Gastos Operativos del Día:** Monitoreo en tiempo real de salidas de dinero.
- **Cartera de Préstamos:** Diferenciación entre cuentas por cobrar (préstamos otorgados) y cuentas por pagar (préstamos recibidos).
- **Accesos Rápidos:** Registro ágil de ingresos, egresos, préstamos, abonos y gestión de caja.

### 2. 🔒 Gestión de Caja y Arqueo Diario
- **Apertura de Caja:** Definición del saldo base inicial.
- **Cierre y Arqueo de Caja:**
  - Desglose físico por denominaciones de billetes ($100k, $50k, $20k, $10k, $5k, $2k, $1k) y monedas.
  - Comparativa matemática automática entre saldo físico contado vs. saldo esperado del sistema.
  - Detección de **Caja Cuadrada**, **Sobrantes** o **Faltantes** con campo obligatorio de justificación.
- **Reapertura de Caja:** Controlada con registro obligatorio de motivos para auditoría.

### 3. ➕ Registro y Control de Ingresos
- Catálogo de servicios configurables (Facturas de Energía, Agua, Gas, Telefonía, Giros, Recargas, Datáfono, etc.).
- Comisiones por transacción diferenciadas.
- Registro por múltiples métodos de pago: **Efectivo, Nequi, Daviplata, Bancolombia, Tarjeta Débito/Crédito**.
- Emisión e impresión de recibos de pago en formato ticket/térmico de 80mm.

### 4. ➖ Control de Egresos y Gastos
- Clasificación por categorías (Servicios públicos, Arriendo, Nómina, Insumos, Mantenimiento, Transporte, Otros).
- Registro de proveedor o destinatario del pago.

### 5. 🤝 Cartera de Préstamos y Deudas
- **Préstamos Recibidos (Pasivos):** Registra dinero inyectado en caja desde terceros y sus pagos de cuotas.
- **Préstamos Entregados (Activos / Por Cobrar):** Registra dinero prestado a clientes o socios y sus cobros/abonos.
- Control de fechas de vencimiento, saldos pendientes y estado de cuenta individual.

### 6. 🛡️ Auditoría e Historial Inmutable
- Bitácora completa de eventos críticos:
  - Aperturas y cierres de caja.
  - Reaperturas no programadas.
  - Anulaciones lógicas de transacciones con motivo obligatorio.
  - Exportación de reportes a formato **CSV / Excel**.

### 7. 👥 Roles y Usuarios
- Soporte para perfiles de **Administrador** y **Cajero**.
- Conmutador rápido de usuario para pruebas y operación diaria.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 18, TypeScript, Vite.
- **Estilos:** Tailwind CSS, Lucide Icons.
- **Gráficos:** Recharts.
- **Persistencia de Datos:**
  - Modo Local (Offline-first con sincronización en memoria / `localStorage`).
  - Base de datos en la nube: **Supabase** (PostgreSQL) con soporte de políticas de seguridad (RLS).

---

## 📦 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18 o superior instalado.
- npm o yarn.

### Pasos

1. **Clonar o descargar el proyecto:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd punto-pago-express
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (Opcional si usas Supabase):**
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Configura tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:3000`.

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 🌐 Despliegue en Netlify y Supabase

### Paso 1: Configurar Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Ve a **SQL Editor** en Supabase y ejecuta el siguiente script:

```sql
-- HABILITAR EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cajero')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA DE REGISTROS DE CAJA
CREATE TABLE IF NOT EXISTS public.cash_registers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  closed_at TIMESTAMPTZ,
  opened_by_user_id TEXT NOT NULL,
  opened_by_user_name TEXT NOT NULL,
  closed_by_user_id TEXT,
  closed_by_user_name TEXT,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  expected_balance NUMERIC NOT NULL DEFAULT 0,
  physical_counted_balance NUMERIC,
  difference NUMERIC,
  difference_reason TEXT,
  difference_notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DE TRANSACCIONES
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cash_register_id UUID REFERENCES public.cash_registers(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso', 'prestamo_recibido', 'prestamo_entregado', 'cobro_prestamo', 'pago_prestamo', 'ajuste')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  service_id UUID,
  category_id UUID,
  payment_method_code TEXT NOT NULL DEFAULT 'efectivo',
  payment_method_name TEXT NOT NULL DEFAULT 'Efectivo',
  reference TEXT,
  customer_or_provider TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  is_voided BOOLEAN NOT NULL DEFAULT false,
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  voided_by_user_id TEXT,
  loan_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA DE PRÉSTAMOS
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('recibido', 'entregado')),
  counterpart_name TEXT NOT NULL,
  contact_phone TEXT,
  initial_amount NUMERIC NOT NULL CHECK (initial_amount > 0),
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL,
  due_date DATE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'parcial', 'pagado', 'vencido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- POLÍTICAS RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public read cash" ON public.cash_registers FOR ALL USING (true);
CREATE POLICY "Allow public read transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Allow public read loans" ON public.loans FOR ALL USING (true);
```

3. Obtén tu **Project URL** y **anon public key** en `Project Settings` > `API`.

---

### Paso 2: Desplegar en Netlify

1. Inicia sesión en [netlify.com](https://www.netlify.com/).
2. Haz clic en **"Add new site"** > **"Import an existing project"** y selecciona tu repositorio de GitHub.
3. Parámetros de compilación:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. En **Environment Variables**, añade:
   - `VITE_SUPABASE_URL` = *(Tu URL del proyecto de Supabase)*
   - `VITE_SUPABASE_ANON_KEY` = *(Tu clave anónima pública de Supabase)*
5. Haz clic en **"Deploy site"**. El archivo `public/_redirects` ya incluido evitará errores 404 en rutas SPA.

---

## 📄 Licencia

Este proyecto está bajo la licencia [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
