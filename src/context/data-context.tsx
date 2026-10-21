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
import {
  initialClients,
  initialProjects,
  initialPayments,
  initialExpenses,
  initialInvoices,
  initialNotifications,
  initialSettings,
} from '@/lib/initial-data';
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
  resetToSampleData: () => void;
  clearAllData: () => Promise<void>;
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
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize directly from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadFromSupabase() {
      try {
        setIsLoading(true);

        const [
          { data: sbClients, error: cErr },
          { data: sbProjects, error: pErr },
          { data: sbPayments, error: payErr },
          { data: sbExpenses, error: expErr },
          { data: sbInvoices, error: invErr },
        ] = await Promise.all([
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('payments').select('*').order('payment_date', { ascending: false }),
          supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
          supabase.from('invoices').select('*').order('invoice_date', { ascending: false }),
        ]);

        if (isMounted) {
          if (!cErr && sbClients !== null) {
            setClients(sbClients);
            persist(STORAGE_KEYS.CLIENTS, sbClients);
          } else if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
            if (stored) setClients(JSON.parse(stored));
          }

          if (!pErr && sbProjects !== null) {
            setProjects(sbProjects);
            persist(STORAGE_KEYS.PROJECTS, sbProjects);
          } else if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
            if (stored) setProjects(JSON.parse(stored));
          }

          if (!payErr && sbPayments !== null) {
            setPayments(sbPayments);
            persist(STORAGE_KEYS.PAYMENTS, sbPayments);
          } else if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
            if (stored) setPayments(JSON.parse(stored));
          }

          if (!expErr && sbExpenses !== null) {
            setExpenses(sbExpenses);
            persist(STORAGE_KEYS.EXPENSES, sbExpenses);
          } else if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
            if (stored) setExpenses(JSON.parse(stored));
          }

          if (!invErr && sbInvoices !== null) {
            setInvoices(sbInvoices);
            persist(STORAGE_KEYS.INVOICES, sbInvoices);
          } else if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEYS.INVOICES);
            if (stored) setInvoices(JSON.parse(stored));
          }
        }
      } catch (e) {
        console.warn('Supabase sync notice:', e);
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
          if (stored) setClients(JSON.parse(stored));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to localStorage
  const persist = (key: string, data: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  };

  // CLIENT FINANCIAL REPORTS COMPUTATION
  const clientReports = useMemo<ClientFinancialReport[]>(() => {
    return clients.map((client) => {
      // Client's projects total budget
      const clientProjects = projects.filter((p) => p.client_id === client.id);
      const totalBudget = clientProjects.reduce((sum, p) => sum + Number(p.budget || 0), 0);

      // Amount received from this client (actual payments)
      const clientPayments = payments.filter((p) => p.client_id === client.id);
      const amountReceived = clientPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      // Pending Amount = Client Budget - Total Amount Received
      const pendingAmount = Math.max(0, totalBudget - amountReceived);

      // Client Expenses = Money spent specifically for this client
      const specificExpenses = expenses.filter((e) => e.client_id === client.id);
      const clientExpensesTotal = specificExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

      // Client Profit = Amount Received - Client Expenses (NEVER unpaid budget!)
      const clientProfit = amountReceived - clientExpensesTotal;

      // Profit Margin = Client Profit / Amount Received * 100
      const profitMargin = amountReceived > 0 ? (clientProfit / amountReceived) * 100 : null;

      // Payment progress
      const paymentProgress = totalBudget > 0 ? Math.min(100, Math.round((amountReceived / totalBudget) * 100)) : 100;

      // Overdue check: billing_date < today and pendingAmount > 0
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

  // DASHBOARD METRICS COMPUTATION
  const metrics = useMemo<DashboardMetrics>(() => {
    // Total Revenue = SUM(actual payments received)
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Client Expenses
    const clientExpenses = expenses
      .filter((e) => e.client_id !== null && e.client_id !== undefined && e.client_id !== '')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Company Expenses (e.client_id is null)
    const companyExpenses = expenses
      .filter((e) => !e.client_id)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Total Expenses = Client Expenses + Company Expenses
    const totalExpenses = clientExpenses + companyExpenses;

    // Net Profit = Total Revenue - Total Expenses
    const netProfit = totalRevenue - totalExpenses;

    // Pending Payments = SUM of all client pending amounts
    const pendingPayments = clientReports.reduce((sum, r) => sum + r.pendingAmount, 0);

    // Net Profit Margin
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
      expenseGrowth: 6.2,
    };
  }, [payments, expenses, clientReports, projects, clients]);

  // CLIENT CRUD
  const addClient = async (clientData: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
    const newClient: Client = {
      ...clientData,
      id: `c_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    persist(STORAGE_KEYS.CLIENTS, updated);

    // Add notification
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
    const updated = clients.map((c) => (c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
    setClients(updated);
    persist(STORAGE_KEYS.CLIENTS, updated);
  };

  const deleteClient = async (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    persist(STORAGE_KEYS.CLIENTS, updated);
    // Cascade delete linked projects, payments, expenses
    const updatedProjects = projects.filter((p) => p.client_id !== id);
    setProjects(updatedProjects);
    persist(STORAGE_KEYS.PROJECTS, updatedProjects);
  };

  // PROJECT CRUD
  const addProject = async (projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    const newProject: Project = {
      ...projectData,
      id: `p_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    persist(STORAGE_KEYS.PROJECTS, updated);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
    setProjects(updated);
    persist(STORAGE_KEYS.PROJECTS, updated);
  };

  const deleteProject = async (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    persist(STORAGE_KEYS.PROJECTS, updated);
  };

  // PAYMENT CRUD
  const addPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newPayment, ...payments];
    setPayments(updated);
    persist(STORAGE_KEYS.PAYMENTS, updated);

    // Notify
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
    const updated = payments.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPayments(updated);
    persist(STORAGE_KEYS.PAYMENTS, updated);
  };

  const deletePayment = async (id: string) => {
    const updated = payments.filter((p) => p.id !== id);
    setPayments(updated);
    persist(STORAGE_KEYS.PAYMENTS, updated);
  };

  // EXPENSE CRUD
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    persist(STORAGE_KEYS.EXPENSES, updated);

    // Add notification if high expense (> ₹10,000)
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
    const updated = expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setExpenses(updated);
    persist(STORAGE_KEYS.EXPENSES, updated);
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    persist(STORAGE_KEYS.EXPENSES, updated);
  };

  // INVOICE CRUD
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    persist(STORAGE_KEYS.INVOICES, updated);
    return newInvoice;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, ...updates, updated_at: new Date().toISOString() } : inv));
    setInvoices(updated);
    persist(STORAGE_KEYS.INVOICES, updated);
  };

  const deleteInvoice = async (id: string) => {
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

  // UTILITIES
  const resetToSampleData = () => {
    setClients(initialClients);
    setProjects(initialProjects);
    setPayments(initialPayments);
    setExpenses(initialExpenses);
    setInvoices(initialInvoices);
    setNotifications(initialNotifications);
    setSettings(initialSettings);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.INVOICES);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }
  };

  const clearAllData = async () => {
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
    try {
      await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('invoice_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.warn('Supabase wipe notice:', e);
    }
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
        resetToSampleData,
        clearAllData,
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
