-- ====================================================================
-- XYVEX CRM + FINANCE MANAGEMENT SYSTEM SCHEMA
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead', 'active', 'completed', 'paused', 'cancelled')),
  billing_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  budget NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (budget >= 0),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  tax NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
  total NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  rate NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (rate >= 0),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0)
);

-- 6. PAYMENTS (ACTUAL REVENUE)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_type TEXT NOT NULL DEFAULT 'partial' CHECK (payment_type IN ('advance', 'partial', 'final', 'full')),
  payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Bank Transfer', 'Cash', 'Card', 'Other')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. EXPENSES (CLIENT & COMPANY EXPENSES)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE, -- NULL means Company Expense
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('client', 'company')),
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Bank Transfer', 'Cash', 'Card', 'Other')),
  vendor TEXT,
  campaign TEXT,
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'payment', 'billing')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'XYVEX Creative Agency',
  logo_url TEXT,
  email TEXT DEFAULT 'contact@xyvex.com',
  phone TEXT DEFAULT '+91 98765 43210',
  address TEXT DEFAULT 'Calicut, Kerala, India',
  gst_number TEXT,
  website TEXT DEFAULT 'https://xyvex.agency',
  invoice_prefix TEXT DEFAULT 'XYV-',
  default_tax NUMERIC(5,2) DEFAULT 18.00,
  payment_terms TEXT DEFAULT 'Payment due within 15 days of invoice date.',
  bank_details TEXT DEFAULT 'Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234',
  upi_id TEXT DEFAULT 'xyvex@okaxis',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_client_id ON public.expenses(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON public.expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform operations
DO $$
BEGIN
  -- Authenticated users access policies
  DROP POLICY IF EXISTS "Authenticated users full access on profiles" ON public.profiles;
  CREATE POLICY "Authenticated users full access on profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on clients" ON public.clients;
  CREATE POLICY "Authenticated users full access on clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on projects" ON public.projects;
  CREATE POLICY "Authenticated users full access on projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on invoices" ON public.invoices;
  CREATE POLICY "Authenticated users full access on invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on invoice_items" ON public.invoice_items;
  CREATE POLICY "Authenticated users full access on invoice_items" ON public.invoice_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on payments" ON public.payments;
  CREATE POLICY "Authenticated users full access on payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on expenses" ON public.expenses;
  CREATE POLICY "Authenticated users full access on expenses" ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on notifications" ON public.notifications;
  CREATE POLICY "Authenticated users full access on notifications" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users full access on company_settings" ON public.company_settings;
  CREATE POLICY "Authenticated users full access on company_settings" ON public.company_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
