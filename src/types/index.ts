export type ClientStatus = 'active' | 'pending' | 'completed' | 'inactive' | 'lead' | 'paused' | 'cancelled';

export interface Client {
  id: string;
  name: string;
  company_name: string;
  contact_person?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  location?: string;
  address?: string;
  status: ClientStatus;
  total_budget?: number;
  billing_date?: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  client_id: string;
  name: string;
  service: string;
  budget: number;
  start_date: string;
  end_date?: string;
  assigned_to?: string;
  status: ProjectStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export type PaymentType = 'advance' | 'partial' | 'final' | 'full';
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Card' | 'Other';

export interface Payment {
  id: string;
  client_id: string;
  project_id?: string;
  invoice_id?: string;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  payment_date: string; // YYYY-MM-DD
  reference?: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
}

export type ExpenseType = 'client' | 'company';

export type ExpenseCategory =
  | 'Meta Ads'
  | 'Google Ads'
  | 'Video'
  | 'Poster'
  | 'Photography'
  | 'Influencer'
  | 'Hosting'
  | 'Domain'
  | 'Software'
  | 'Office'
  | 'Internet'
  | 'Salary'
  | 'Equipment'
  | 'Travel'
  | 'Subscription'
  | 'Marketing'
  | 'Other';

export interface Expense {
  id: string;
  client_id: string | null; // null if company expense
  project_id?: string | null;
  expense_type: ExpenseType;
  category: ExpenseCategory;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  vendor?: string;
  campaign?: string;
  description: string;
  notes?: string;
  receipt_url?: string;
  // Specific category metadata
  ad_account?: string;
  hosting_plan?: string;
  billing_period?: string;
  renewal_date?: string;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  invoice_date: string;
  issue_date?: string;
  due_date: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  items?: InvoiceItem[];
  created_at: string;
  updated_at?: string;
}

export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'payment' | 'billing';

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface CompanySettings {
  company_name: string;
  logo_url?: string;
  email: string;
  phone: string;
  address: string;
  gst_number?: string;
  website: string;
  invoice_prefix: string;
  default_tax: number;
  payment_terms: string;
  bank_details: string;
  upi_id: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;         // SUM(payments.amount)
  totalExpenses: number;        // SUM(client expenses + company expenses)
  clientExpenses: number;       // SUM(expenses with client_id)
  companyExpenses: number;      // SUM(expenses without client_id)
  netProfit: number;            // totalRevenue - totalExpenses
  pendingPayments: number;      // totalBudgets - totalRevenue (clamped >= 0)
  profitMargin: number;         // (netProfit / totalRevenue) * 100
  totalClients: number;
  activeProjects: number;
  revenueGrowth: number;        // % comparison to previous period
  expenseGrowth: number;
}

export interface ClientFinancialReport {
  client: Client;
  totalBudget: number;
  amountReceived: number;
  pendingAmount: number;
  clientExpenses: number;
  clientProfit: number;
  profitMargin: number | null; // null if amountReceived is 0
  paymentProgress: number;     // 0 - 100%
  status: ClientStatus;
  isOverdue: boolean;
}
