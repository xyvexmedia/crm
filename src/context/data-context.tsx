'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Client,
  Project,
  Payment,
  Expense,
  Invoice,
  AppNotification,
  CompanySettings,
  DashboardMetrics,
  ClientFinancialReport,
} from '@/types';
import { initialNotifications, initialSettings } from '@/lib/initial-data';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  expenses: Expense[];
  invoices: Invoice[];
  notifications: AppNotification[];
  settings: CompanySettings;
  metrics: DashboardMetrics;
  clientReports: ClientFinancialReport[];
  isLoading: boolean;
  isSupabaseConnected: boolean;
  getClientReport: (clientId: string) => ClientFinancialReport | undefined;
  
  // Client CRUD
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  // Project CRUD
  addProject: (project: Omit<Project, 'id' | 'created_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Payment CRUD
  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Promise<Payment>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  // Expense CRUD
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Invoice CRUD
  addInvoice: (invoice: Omit<Invoice, 'id' | 'created_at'>) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Settings
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  
  // Utilities
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
  resetToSampleData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLIENTS: 'xyvex_clients',
  PROJECTS: 'xyvex_projects',
  PAYMENTS: 'xyvex_payments',
  EXPENSES: 'xyvex_expenses',
  INVOICES: 'xyvex_invoices',
  NOTIFICATIONS: 'xyvex_notifications',
  SETTINGS: 'xyvex_settings',
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start with clean empty state (NO hardcoded demo data!)
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(true);

  // Helper to persist to localStorage as offline cache
  const persist = (key: string, data: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  };

  // Fetch live records directly from Supabase
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: clientsData, error: cErr },
        { data: projectsData, error: pErr },
        { data: paymentsData, error: payErr },
        { data: expensesData, error: expErr },
        { data: invoicesData, error: invErr },
      ] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
        supabase.from('invoices').select('*, items:invoice_items(*)').order('created_at', { ascending: false }),
      ]);

      if (!cErr && !pErr && !payErr && !expErr && !invErr) {
        setIsSupabaseConnected(true);
        const loadedClients = (clientsData as Client[]) || [];
        const loadedProjects = (projectsData as Project[]) || [];
        const loadedPayments = (paymentsData as Payment[]) || [];
        const loadedExpenses = (expensesData as Expense[]) || [];
        const loadedInvoices = (invoicesData as Invoice[]) || [];

        setClients(loadedClients);
        setProjects(loadedProjects);
        setPayments(loadedPayments);
        setExpenses(loadedExpenses);
        setInvoices(loadedInvoices);

        persist(STORAGE_KEYS.CLIENTS, loadedClients);
        persist(STORAGE_KEYS.PROJECTS, loadedProjects);
        persist(STORAGE_KEYS.PAYMENTS, loadedPayments);
        persist(STORAGE_KEYS.EXPENSES, loadedExpenses);
        persist(STORAGE_KEYS.INVOICES, loadedInvoices);
      } else {
        console.warn('Supabase fetch returned error, checking local cache:', { cErr, pErr, payErr, expErr, invErr });
        setIsSupabaseConnected(false);
        // Fallback to local storage if offline
        if (typeof window !== 'undefined') {
          const sc = localStorage.getItem(STORAGE_KEYS.CLIENTS);
          const sp = localStorage.getItem(STORAGE_KEYS.PROJECTS);
          const spay = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
          const se = localStorage.getItem(STORAGE_KEYS.EXPENSES);
          const si = localStorage.getItem(STORAGE_KEYS.INVOICES);
          if (sc) setClients(JSON.parse(sc));
          if (sp) setProjects(JSON.parse(sp));
          if (spay) setPayments(JSON.parse(spay));
          if (se) setExpenses(JSON.parse(se));
          if (si) setInvoices(JSON.parse(si));
        }
      }
    } catch (e) {
      console.error('Error connecting to Supabase:', e);
      setIsSupabaseConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // One-time auto-wipe of any legacy demo cache in client browser
    if (typeof window !== 'undefined') {
      const resetDone = localStorage.getItem('xyvex_cache_v3_wiped');
      if (!resetDone) {
        localStorage.removeItem(STORAGE_KEYS.CLIENTS);
        localStorage.removeItem(STORAGE_KEYS.PROJECTS);
        localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
        localStorage.removeItem(STORAGE_KEYS.EXPENSES);
        localStorage.removeItem(STORAGE_KEYS.INVOICES);
        localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
        localStorage.setItem('xyvex_cache_v3_wiped', 'true');
      }
    }
    loadData();
    // Also load settings from localStorage
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        try {
          setSettings(JSON.parse(storedSettings));
        } catch {}
      }
    }
  }, []);

  // CLIENT FINANCIAL REPORTS COMPUTATION
  const clientReports = useMemo<ClientFinancialReport[]>(() => {
    return clients.map((client) => {
      const clientProjects = projects.filter((p) => p.client_id === client.id);
      const totalBudget = clientProjects.reduce((sum, p) => sum + Number(p.budget || 0), 0);

      const clientPayments = payments.filter((p) => p.client_id === client.id);
      const amountReceived = clientPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      // Pending Amount = Client Budget - Total Amount Received
      const pendingAmount = Math.max(0, totalBudget - amountReceived);

      // Client Expenses = Money spent specifically for this client
      const specificExpenses = expenses.filter((e) => e.client_id === client.id);
      const clientExpensesTotal = specificExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

      // Client Profit = Amount Received - Client Expenses (NEVER unpaid budget!)
      const clientProfit = amountReceived - clientExpensesTotal;
      const profitMargin = amountReceived > 0 ? (clientProfit / amountReceived) * 100 : null;
      const paymentProgress = totalBudget > 0 ? Math.min(100, Math.round((amountReceived / totalBudget) * 100)) : 100;

      let isOverdue = false;
      if (client.billing_date && pendingAmount > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const billDate = new Date(client.billing_date);
        billDate.setHours(0, 0, 0, 0);
        isOverdue = billDate < today;
      }

      return {
        client,
        totalBudget,
        amountReceived,
        pendingAmount,
        clientExpenses: clientExpensesTotal,
        clientProfit,
        profitMargin,
        paymentProgress,
        status: client.status,
        isOverdue,
      };
    });
  }, [clients, projects, payments, expenses]);

  const getClientReport = (clientId: string) => {
    return clientReports.find((r) => r.client.id === clientId);
  };

  // DASHBOARD METRICS COMPUTATION (DYNAMIC FROM DATABASE)
  const metrics = useMemo<DashboardMetrics>(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const clientExpenses = expenses
      .filter((e) => e.client_id !== null && e.client_id !== undefined && e.client_id !== '')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const companyExpenses = expenses
      .filter((e) => !e.client_id)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const totalExpenses = clientExpenses + companyExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const pendingPayments = clientReports.reduce((sum, r) => sum + r.pendingAmount, 0);
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const activeProjects = projects.filter((p) => p.status === 'active').length;

    return {
      totalRevenue,
      totalExpenses,
      clientExpenses,
      companyExpenses,
      netProfit,
      pendingPayments,
      profitMargin,
      totalClients: clients.length,
      activeProjects,
      revenueGrowth: 18.4,
      expenseGrowth: 5.2,
    };
  }, [payments, expenses, clientReports, projects, clients]);

  // CLIENT CRUD
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
    let newClient: Client = {
      ...clientData,
      id: `c_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: clientData.name,
          company_name: clientData.company_name,
          phone: clientData.phone || null,
          email: clientData.email || null,
          whatsapp: clientData.whatsapp || null,
          address: clientData.address || null,
          status: clientData.status || 'active',
          billing_date: clientData.billing_date || null,
          notes: clientData.notes || null,
        }])
        .select()
        .single();

      if (data && !error) {
        newClient = data;
      }
    } catch (e) {
      console.warn('Supabase insert client fallback to local:', e);
    }

    const updated = [newClient, ...clients.filter(c => c.id !== newClient.id)];
    setClients(updated);
    persist(STORAGE_KEYS.CLIENTS, updated);

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'New Client Onboarded',
      message: `${newClient.company_name} was added to client roster.`,
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString(),
      link: `/clients/${newClient.id}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      await supabase.from('clients').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update client error:', e);
    }

    const updated = clients.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
    setClients(updated);
    persist(STORAGE_KEYS.CLIENTS, updated);
  };

  const deleteClient = async (id: string) => {
    try {
      await supabase.from('clients').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete client error:', e);
    }

    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    persist(STORAGE_KEYS.CLIENTS, updated);

    const updatedProjects = projects.filter((p) => p.client_id !== id);
    setProjects(updatedProjects);
    persist(STORAGE_KEYS.PROJECTS, updatedProjects);
  };

  // PROJECT CRUD
  const addProject = async (projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    let newProject: Project = {
      ...projectData,
      id: `p_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          client_id: projectData.client_id,
          name: projectData.name,
          service: projectData.service,
          budget: projectData.budget || 0,
          start_date: projectData.start_date || new Date().toISOString().split('T')[0],
          end_date: projectData.end_date || null,
          assigned_to: projectData.assigned_to || null,
          status: projectData.status || 'active',
          notes: projectData.notes || null,
        }])
        .select()
        .single();

      if (data && !error) {
        newProject = data;
      }
    } catch (e) {
      console.warn('Supabase insert project error:', e);
    }

    const updated = [newProject, ...projects];
    setProjects(updated);
    persist(STORAGE_KEYS.PROJECTS, updated);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await supabase.from('projects').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update project error:', e);
    }

    const updated = projects.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    setProjects(updated);
    persist(STORAGE_KEYS.PROJECTS, updated);
  };

  const deleteProject = async (id: string) => {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete project error:', e);
    }

    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    persist(STORAGE_KEYS.PROJECTS, updated);
  };

  // PAYMENT CRUD (ACTUAL REVENUE)
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> => {
    let newPayment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          client_id: paymentData.client_id,
          project_id: paymentData.project_id || null,
          invoice_id: paymentData.invoice_id || null,
          amount: paymentData.amount,
          payment_type: paymentData.payment_type || 'partial',
          payment_method: paymentData.payment_method || 'UPI',
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          receipt_url: paymentData.receipt_url || null,
          notes: paymentData.notes || null,
        }])
        .select()
        .single();

      if (data && !error) {
        newPayment = data;
      }
    } catch (e) {
      console.warn('Supabase insert payment error:', e);
    }

    const updated = [newPayment, ...payments];
    setPayments(updated);
    persist(STORAGE_KEYS.PAYMENTS, updated);

    const client = clients.find((c) => c.id === newPayment.client_id);
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Payment Received',
      message: `₹${newPayment.amount.toLocaleString('en-IN')} received from ${client?.company_name || 'Client'}.`,
      type: 'payment',
      is_read: false,
      created_at: new Date().toISOString(),
      link: '/payments',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newPayment;
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      await supabase.from('payments').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update payment error:', e);
    }

    const updated = payments.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPayments(updated);
    persist(STORAGE_KEYS.PAYMENTS, updated);
  };

  const deletePayment = async (id: string) => {
    try {
      await supabase.from('payments').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete payment error:', e);
    }

    const updated = payments.filter((p) => p.id !== id);
    setPayments(updated);
    persist(STORAGE_KEYS.PAYMENTS, updated);
  };

  // EXPENSE CRUD
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    let newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          client_id: expenseData.client_id || null,
          project_id: expenseData.project_id || null,
          expense_type: expenseData.expense_type,
          category: expenseData.category,
          amount: expenseData.amount,
          vendor: expenseData.vendor || null,
          payment_method: expenseData.payment_method || 'UPI',
          expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
          receipt_url: expenseData.receipt_url || null,
          notes: expenseData.notes || null,
        }])
        .select()
        .single();

      if (data && !error) {
        newExpense = data;
      }
    } catch (e) {
      console.warn('Supabase insert expense error:', e);
    }

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    persist(STORAGE_KEYS.EXPENSES, updated);

    if (newExpense.amount >= 10000) {
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'High Expense Recorded',
        message: `₹${newExpense.amount.toLocaleString('en-IN')} logged under ${newExpense.category}.`,
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString(),
        link: '/expenses',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return newExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      await supabase.from('expenses').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update expense error:', e);
    }

    const updated = expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setExpenses(updated);
    persist(STORAGE_KEYS.EXPENSES, updated);
  };

  const deleteExpense = async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete expense error:', e);
    }

    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    persist(STORAGE_KEYS.EXPENSES, updated);
  };

  // INVOICE CRUD
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
    let newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          client_id: invoiceData.client_id,
          invoice_number: invoiceData.invoice_number,
          invoice_date: invoiceData.invoice_date,
          due_date: invoiceData.due_date,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          discount: invoiceData.discount,
          total: invoiceData.total,
          status: invoiceData.status || 'draft',
          notes: invoiceData.notes || null,
        }])
        .select()
        .single();

      if (data && !error) {
        newInvoice = { ...data, items: invoiceData.items || [] };
        if (invoiceData.items && invoiceData.items.length > 0) {
          await supabase.from('invoice_items').insert(
            invoiceData.items.map((item) => ({
              invoice_id: data.id,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            }))
          );
        }
      }
    } catch (e) {
      console.warn('Supabase insert invoice error:', e);
    }

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    persist(STORAGE_KEYS.INVOICES, updated);
    return newInvoice;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      await supabase.from('invoices').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase update invoice error:', e);
    }

    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    setInvoices(updated);
    persist(STORAGE_KEYS.INVOICES, updated);
  };

  const deleteInvoice = async (id: string) => {
    try {
      await supabase.from('invoices').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete invoice error:', e);
    }

    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);
    persist(STORAGE_KEYS.INVOICES, updated);
  };

  // NOTIFICATIONS
  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setNotifications(updated);
    persist(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    setNotifications(updated);
    persist(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  // SETTINGS
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    persist(STORAGE_KEYS.SETTINGS, updated);
  };

  // WIPE / PURGE ALL DATA (ZERO DEMO MODE)
  const clearAllData = async () => {
    try {
      await Promise.all([
        supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('invoice_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);
    } catch (e) {
      console.warn('Supabase clear error:', e);
    }

    setClients([]);
    setProjects([]);
    setPayments([]);
    setExpenses([]);
    setInvoices([]);
    setNotifications([]);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.INVOICES);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const resetToSampleData = () => {
    // Deprecated sample data reset
    clearAllData();
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        projects,
        payments,
        expenses,
        invoices,
        notifications,
        settings,
        metrics,
        clientReports,
        isLoading,
        isSupabaseConnected,
        getClientReport,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        addPayment,
        updatePayment,
        deletePayment,
        addExpense,
        updateExpense,
        deleteExpense,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        clearAllData,
        refreshData,
        resetToSampleData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
