'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  MoreVertical,
  Pencil,
  Plus,
  CreditCard,
  Receipt,
  Briefcase,
  FileText,
  Trash2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Download,
  Share2,
  ExternalLink,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  User,
  Activity,
  X,
  Wallet,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ClientStatus } from '@/types';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { AddProjectModal } from '@/components/modals/AddProjectModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

type ClientTab = 'overview' | 'projects' | 'payments' | 'expenses' | 'invoices';

export default function ClientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = (params?.id as string) || searchParams?.get('id') || '';
  const {
    clients,
    projects,
    payments,
    expenses,
    invoices,
    getClientReport,
    updateClient,
    deleteClient,
    isLoading,
  } = useData();

  // Modals state
  const [activeTab, setActiveTab] = useState<ClientTab>('overview');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const client = clients.find((c) => c.id === clientId);
  const report = getClientReport(clientId);

  const [editCompanyName, setEditCompanyName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editBillingDate, setEditBillingDate] = useState('');
  const [editStatus, setEditStatus] = useState<ClientStatus>('active');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync edit form with client data
  React.useEffect(() => {
    if (client) {
      setEditCompanyName(client.company_name || client.name || '');
      setEditContactPerson(client.contact_person || '');
      setEditPhone(client.phone || '');
      setEditWhatsapp(client.whatsapp || client.phone || '');
      setEditEmail(client.email || '');
      setEditLocation(client.location || client.address || '');
      setEditBudget(client.total_budget?.toString() || '');
      setEditBillingDate(client.billing_date || '');
      setEditStatus(client.status || 'active');
      setEditNotes(client.notes || '');
    }
  }, [client]);

  if (isLoading && !client) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400">Loading client profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (!client || !report) {
    return (
      <AppLayout>
        <div className="text-center py-24 space-y-4 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">Client Not Found</h2>
          <p className="text-xs text-zinc-400">
            This client may have been removed or does not exist.
          </p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Clients</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Filter client-specific records
  const clientProjects = projects.filter((p) => p.client_id === clientId);
  const clientPayments = payments
    .filter((p) => p.client_id === clientId)
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  const clientExpenses = expenses
    .filter((e) => e.client_id === clientId)
    .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  const clientInvoices = invoices
    .filter((inv) => inv.client_id === clientId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Initials
  const initials = (client.company_name || 'CL').slice(0, 2).toUpperCase();

  // Primary service
  const primaryService = clientProjects[0]?.service || 'Digital Marketing & Growth';

  // Distinct services
  const distinctServices = Array.from(new Set(clientProjects.map((p) => p.service)));
  if (distinctServices.length === 0) distinctServices.push('Meta Ads', 'Google Ads');

  // Unified Chronological Activity Feed (Requirement #9)
  const activities = [
    ...clientPayments.map((p) => ({
      id: p.id,
      type: 'payment',
      title: `${formatCurrency(p.amount)} payment received`,
      date: p.payment_date,
      time: '11:30 AM',
      method: p.payment_method,
      badge: 'Payment Received',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    })),
    ...clientProjects.map((p) => ({
      id: p.id,
      type: 'project',
      title: `Project created: ${p.name}`,
      date: p.start_date,
      time: '10:00 AM',
      method: p.service,
      badge: p.status === 'completed' ? 'Project Completed' : 'Project Active',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    })),
    ...clientExpenses.map((e) => ({
      id: e.id,
      type: 'expense',
      title: `${formatCurrency(e.amount)} expense added (${e.category})`,
      date: e.expense_date,
      time: '02:15 PM',
      method: e.category,
      badge: 'Expense Added',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    })),
    ...clientInvoices.map((inv) => ({
      id: inv.id,
      type: 'invoice',
      title: `Invoice ${inv.invoice_number} generated (${formatCurrency(inv.total)})`,
      date: inv.issue_date || inv.invoice_date || inv.created_at.split('T')[0],
      time: '04:00 PM',
      method: inv.status,
      badge: 'Invoice Generated',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Handle Edit Save
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateClient(client.id, {
        company_name: editCompanyName.trim() || client.company_name,
        name: editCompanyName.trim() || client.name,
        contact_person: editContactPerson.trim() || undefined,
        phone: editPhone.trim(),
        whatsapp: editWhatsapp.trim() || undefined,
        email: editEmail.trim(),
        location: editLocation.trim() || undefined,
        address: editLocation.trim() || undefined,
        total_budget: Number(editBudget) || client.total_budget || 0,
        billing_date: editBillingDate || undefined,
        status: editStatus,
        notes: editNotes.trim() || undefined,
      });
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (newStatus: ClientStatus) => {
    await updateClient(client.id, { status: newStatus });
  };

  // Handle Delete Client
  const handleDelete = async () => {
    await deleteClient(client.id);
    router.push('/clients');
  };

  return (
    <AppLayout>
      <div className="space-y-4 max-w-5xl mx-auto pb-14">
        {/* ======================================================== */}
        {/* 4. TOP NAVIGATION: ← Back | Client Details | More ⋮     */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/clients"
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition"
            aria-label="Back to Clients"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </Link>

          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Client Details
          </h1>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition"
              aria-label="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* More Menu Dropdown (Requirement #4) */}
            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-52 bg-[#121217] border border-white/15 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setEditModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-200 hover:text-white hover:bg-white/[0.08] transition text-left"
                  >
                    <Pencil className="w-4 h-4 text-zinc-400" />
                    <span>Edit Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setAddPaymentOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-emerald-400 hover:bg-emerald-500/10 transition text-left"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setAddProjectOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-blue-400 hover:bg-blue-500/10 transition text-left"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setAddExpenseOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition text-left"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Expense</span>
                  </button>
                  <Link
                    href={`/invoices/new?client=${client.id}`}
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-purple-400 hover:bg-purple-500/10 transition text-left"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Invoice</span>
                  </Link>
                  <div className="border-t border-white/[0.08] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setDeleteConfirmOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition text-left font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Client</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. CLIENT PROFILE HEADER                                */}
        {/* ======================================================== */}
        <div className="bg-[#121217] border border-white/[0.08] rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Avatar / Initials */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7f0d2d] via-[#5c081e] to-[#3b0311] border border-rose-500/25 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                  {client.company_name}
                </h2>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {primaryService}
                </p>
                {client.contact_person && (
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{client.contact_person}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Status Dropdown (Requirement #18) */}
            <select
              value={client.status}
              onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border cursor-pointer focus:outline-none transition ${
                client.status === 'active'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : client.status === 'pending' || report.pendingAmount > 0
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : client.status === 'completed'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'bg-zinc-700/30 text-zinc-400 border-zinc-700/40'
              }`}
            >
              <option value="active" className="bg-[#1a1a1e] text-white">Active</option>
              <option value="pending" className="bg-[#1a1a1e] text-white">Pending</option>
              <option value="completed" className="bg-[#1a1a1e] text-white">Completed</option>
              <option value="inactive" className="bg-[#1a1a1e] text-white">Inactive</option>
            </select>
          </div>

          {/* Clickable Contact Strip: Phone, WhatsApp, Email, Location (Requirement #5) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.06] text-xs">
            {client.phone ? (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition group border border-white/[0.04]"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase">Phone</span>
                  <span className="font-mono truncate block group-hover:underline text-[11px]">
                    {client.phone}
                  </span>
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] text-zinc-600 border border-white/[0.02]">
                <Phone className="w-3.5 h-3.5" />
                <span className="text-[11px]">No phone</span>
              </div>
            )}

            {client.whatsapp || client.phone ? (
              <a
                href={`https://wa.me/${(client.whatsapp || client.phone).replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition group border border-white/[0.04]"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase">WhatsApp</span>
                  <span className="font-mono truncate block group-hover:underline text-[11px]">
                    {client.whatsapp || client.phone}
                  </span>
                </div>
              </a>
            ) : null}

            {client.email ? (
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition group border border-white/[0.04]"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 block uppercase">Email</span>
                  <span className="truncate block group-hover:underline text-[11px]">
                    {client.email}
                  </span>
                </div>
              </a>
            ) : null}

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] text-zinc-300 border border-white/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 block uppercase">Location</span>
                <span className="truncate block text-[11px]">
                  {client.location || client.address || 'Calicut, Kerala'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. CLIENT FINANCIAL SUMMARY: 4 Cards + Profit Calculation */}
        {/* ======================================================== */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Total Budget */}
            <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Total Budget
              </span>
              <p className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
                {formatCurrency(report.totalBudget)}
              </p>
            </div>

            {/* 2. Paid */}
            <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider block">
                Paid
              </span>
              <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(report.amountReceived)}
              </p>
            </div>

            {/* 3. Pending */}
            <div className="bg-amber-500/[0.05] border border-amber-500/20 rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider block">
                Pending
              </span>
              <p className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-1">
                {formatCurrency(report.pendingAmount)}
              </p>
            </div>

            {/* 4. Expenses */}
            <div className="bg-rose-500/[0.05] border border-rose-500/20 rounded-2xl p-4 shadow-md">
              <span className="text-[10px] font-semibold text-rose-400/80 uppercase tracking-wider block">
                Expenses
              </span>
              <p className="text-lg sm:text-xl font-bold font-mono text-rose-400 mt-1">
                {formatCurrency(report.clientExpenses)}
              </p>
            </div>
          </div>

          {/* Client Profit Banner (Requirement #6 & #15 Exact Logic) */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-3.5 flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Client Profit (Revenue − Expenses)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-white">
                  {formatCurrency(report.clientProfit)}
                </span>
                <span className="text-xs text-zinc-400">
                  ({formatCurrency(report.amountReceived)} − {formatCurrency(report.clientExpenses)})
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              {report.profitMargin !== null ? `${report.profitMargin.toFixed(1)}% Margin` : '100% Margin'}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 7. PAYMENT PROGRESS                                     */}
        {/* ======================================================== */}
        <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-semibold text-xs">
              Payment Progress
            </span>
            <div className="flex items-center gap-2">
              {report.isOverdue && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Payment Overdue
                </span>
              )}
              <span className="font-bold font-mono text-white text-xs">
                {report.paymentProgress === 100
                  ? '100% Paid'
                  : `${report.paymentProgress}% Paid`}
              </span>
            </div>
          </div>

          {/* Progress Bar with Crimson Glow */}
          <div className="w-full h-3 rounded-full bg-zinc-800/80 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                report.isOverdue
                  ? 'bg-gradient-to-r from-[#991b1b] via-[#e11d48] to-[#fb7185]'
                  : 'bg-gradient-to-r from-[#991b1b] to-[#e11d48]'
              }`}
              style={{ width: `${report.paymentProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-0.5">
            <span>{formatCurrency(report.amountReceived)} received of {formatCurrency(report.totalBudget)}</span>
            {client.billing_date && (
              <span className={report.isOverdue ? 'text-rose-400 font-bold' : ''}>
                Next Billing: {formatDate(client.billing_date)}
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 8. CLIENT TABS: Overview | Projects | Payments | Expenses | Invoices */}
        {/* ======================================================== */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121217] rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          {(['overview', 'projects', 'payments', 'expenses', 'invoices'] as ClientTab[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition active:scale-95 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab}
                {tab === 'projects' && clientProjects.length > 0 && ` (${clientProjects.length})`}
                {tab === 'payments' && clientPayments.length > 0 && ` (${clientPayments.length})`}
                {tab === 'expenses' && clientExpenses.length > 0 && ` (${clientExpenses.length})`}
                {tab === 'invoices' && clientInvoices.length > 0 && ` (${clientInvoices.length})`}
              </button>
            )
          )}
        </div>

        {/* ======================================================== */}
        {/* 9. OVERVIEW TAB CONTENT                                 */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Client Information & Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Client Information */}
              <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-md">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Client Information
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Client Name</span>
                    <span className="text-white font-medium">{client.company_name}</span>
                  </div>
                  {client.contact_person && (
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Contact Person</span>
                      <span className="text-white font-medium">{client.contact_person}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Phone</span>
                      <a href={`tel:${client.phone}`} className="text-white font-mono hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.whatsapp && (
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">WhatsApp</span>
                      <span className="text-white font-mono">{client.whatsapp}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Email</span>
                      <a href={`mailto:${client.email}`} className="text-white hover:underline truncate max-w-[200px]">
                        {client.email}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Location</span>
                    <span className="text-white">{client.location || client.address || 'Calicut, Kerala'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Status</span>
                    <span className="capitalize font-semibold text-emerald-400">{client.status}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Financial Summary */}
              <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-md">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Financial Summary
                </h3>
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400 font-sans">Total Budget</span>
                    <span className="text-white font-bold">{formatCurrency(report.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400 font-sans">Total Paid</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(report.amountReceived)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400 font-sans">Pending Balance</span>
                    <span className="text-amber-400 font-bold">{formatCurrency(report.pendingAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400 font-sans">Total Expenses</span>
                    <span className="text-rose-400 font-bold">{formatCurrency(report.clientExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400 font-sans">Net Profit</span>
                    <span className="text-white font-bold text-sm">{formatCurrency(report.clientProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Services */}
            <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2.5 shadow-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Current Services
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {distinctServices.map((srv) => (
                  <span
                    key={srv}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.05] border border-white/10 text-zinc-200"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity Feed (Requirement #9) */}
            <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-md">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Activity
              </h3>
              {activities.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">No recent activities recorded</p>
              ) : (
                <div className="space-y-2.5">
                  {activities.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#16161c] border border-white/[0.04] rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="text-white font-semibold truncate">{item.title}</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {formatDate(item.date)} • {item.time}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 10. PROJECTS TAB                                        */}
        {/* ======================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Client Projects ({clientProjects.length})
              </h3>
              <button
                type="button"
                onClick={() => setAddProjectOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-sm hover:opacity-95 active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Add Project</span>
              </button>
            </div>

            {clientProjects.length === 0 ? (
              /* Requirement #27: Empty state for projects */
              <div className="bg-[#121217] border border-dashed border-white/10 rounded-2xl p-8 text-center space-y-2.5 shadow-md">
                <Briefcase className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No projects yet</h4>
                <p className="text-xs text-zinc-400">
                  Assign campaigns or monthly retainers to track execution and milestones.
                </p>
                <button
                  type="button"
                  onClick={() => setAddProjectOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-sm mt-2"
                >
                  + Add Project
                </button>
              </div>
            ) : (
              clientProjects.map((project) => {
                const projectPmts = payments.filter((p) => p.project_id === project.id);
                const projPaid = projectPmts.reduce((s, p) => s + Number(p.amount), 0);
                const projPending = Math.max(0, project.budget - projPaid);
                const projProgress = project.budget > 0 ? Math.min(100, Math.round((projPaid / project.budget) * 100)) : 0;

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block bg-[#121217] hover:bg-[#16161c] border border-white/[0.08] hover:border-white/20 rounded-2xl p-4 transition active:scale-[0.99] shadow-md group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white group-hover:text-rose-200 transition">
                            {project.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 mt-0.5">
                          Service: {project.service}
                        </p>

                        {/* Financial lines (Requirement #10) */}
                        <div className="flex items-center gap-2 text-xs font-mono mt-2 flex-wrap">
                          <span className="text-zinc-200 font-semibold">
                            Budget: {formatCurrency(project.budget)}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-emerald-400 font-semibold">
                            Paid: {formatCurrency(projPaid)}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-amber-400 font-semibold">
                            Pending: {formatCurrency(projPending)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                            <span>Progress</span>
                            <span>{projProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#991b1b] to-[#e11d48] rounded-full"
                              style={{ width: `${projProgress}%` }}
                            />
                          </div>
                        </div>

                        {project.end_date && (
                          <p className="text-[10px] text-zinc-500 mt-2 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Due Date: {formatDate(project.end_date)}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition shrink-0" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 11. PAYMENTS TAB                                        */}
        {/* ======================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            {/* Top Summary Bar (Requirement #11) */}
            <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div className="space-y-0.5 font-mono text-xs">
                <p className="text-zinc-400">
                  Total Received: <span className="text-emerald-400 font-bold text-sm">{formatCurrency(report.amountReceived)}</span>
                </p>
                <p className="text-zinc-400">
                  Pending: <span className="text-amber-400 font-bold text-sm">{formatCurrency(report.pendingAmount)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddPaymentOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-md active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Record Payment</span>
              </button>
            </div>

            {clientPayments.length === 0 ? (
              /* Requirement #27: Empty state for payments */
              <div className="bg-[#121217] border border-dashed border-white/10 rounded-2xl p-8 text-center space-y-2.5 shadow-md">
                <CreditCard className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No payments recorded</h4>
                <p className="text-xs text-zinc-400">
                  Record advance or milestone payments to update client revenue and profit automatically.
                </p>
                <button
                  type="button"
                  onClick={() => setAddPaymentOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-sm mt-2"
                >
                  + Record Payment
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {clientPayments.map((pmt) => (
                  <div
                    key={pmt.id}
                    className="bg-[#121217] border border-white/[0.08] rounded-2xl p-3.5 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold font-mono text-white block">
                          {formatCurrency(pmt.amount)}
                        </span>
                        <p className="text-[11px] text-zinc-400 capitalize mt-0.5 truncate">
                          {pmt.payment_type} Payment • {pmt.payment_method}
                          {pmt.reference ? ` • Ref: ${pmt.reference}` : ''}
                        </p>
                        {pmt.notes && (
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                            Note: {pmt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        Received
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                        {formatDate(pmt.payment_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 13. EXPENSES TAB                                        */}
        {/* ======================================================== */}
        {activeTab === 'expenses' && (
          <div className="space-y-3">
            {/* Top Summary Bar */}
            <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div className="space-y-0.5 font-mono text-xs">
                <p className="text-zinc-400">
                  Total Client Expenses: <span className="text-rose-400 font-bold text-sm">{formatCurrency(report.clientExpenses)}</span>
                </p>
                <p className="text-zinc-400">
                  Client Profit: <span className="text-emerald-400 font-bold text-sm">{formatCurrency(report.clientProfit)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddExpenseOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-md active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Add Expense</span>
              </button>
            </div>

            {clientExpenses.length === 0 ? (
              /* Requirement #27: Empty state for expenses */
              <div className="bg-[#121217] border border-dashed border-white/10 rounded-2xl p-8 text-center space-y-2.5 shadow-md">
                <Receipt className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No expenses recorded</h4>
                <p className="text-xs text-zinc-400">
                  Log Meta Ads spend, Google Ads spend, video production, or poster creative costs.
                </p>
                <button
                  type="button"
                  onClick={() => setAddExpenseOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-sm mt-2"
                >
                  + Add Expense
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {clientExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-[#121217] border border-white/[0.08] rounded-2xl p-3.5 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {exp.category}
                        </span>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {exp.description || 'Campaign spend'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-rose-400 block">
                        -{formatCurrency(exp.amount)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                        {formatDate(exp.expense_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 16. INVOICES TAB                                        */}
        {/* ======================================================== */}
        {activeTab === 'invoices' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Client Invoices ({clientInvoices.length})
              </h3>
              <Link
                href={`/invoices/new?client=${client.id}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-sm hover:opacity-95 active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Create Invoice</span>
              </Link>
            </div>

            {clientInvoices.length === 0 ? (
              /* Requirement #27: Empty state for invoices */
              <div className="bg-[#121217] border border-dashed border-white/10 rounded-2xl p-8 text-center space-y-2.5 shadow-md">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No invoices yet</h4>
                <p className="text-xs text-zinc-400">
                  Generate professional PDF invoices with GST, discounts, and payment links.
                </p>
                <Link
                  href={`/invoices/new?client=${client.id}`}
                  className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-semibold shadow-sm mt-2"
                >
                  + Create Invoice
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clientInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {inv.invoice_number}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : inv.status === 'overdue'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          }`}
                        >
                          {inv.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-bold font-mono text-white mt-1">
                        {formatCurrency(inv.total)}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                        Issue: {formatDate(inv.issue_date || inv.invoice_date)} • Due: {formatDate(inv.due_date)}
                      </p>
                    </div>

                    {/* View, Download, Send buttons (Requirement #16) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="py-1.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white text-xs font-semibold transition"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => router.push(`/invoices/${inv.id}`)}
                        className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition"
                        title="Download / Print"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `Invoice ${inv.invoice_number}`,
                              text: `Invoice for ${client.company_name} - ${formatCurrency(inv.total)}`,
                              url: window.location.origin + `/invoices/${inv.id}`,
                            });
                          } else {
                            window.open(`mailto:${client.email}?subject=Invoice ${inv.invoice_number}&body=Please find invoice details at ${window.location.origin}/invoices/${inv.id}`);
                          }
                        }}
                        className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition"
                        title="Send to client"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 19. CLIENT EDIT MODAL (Calculated values are read-only)   */}
      {/* ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade overflow-hidden">
          <div className="relative w-full max-w-xl bg-[#111116] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[86dvh] sm:h-auto sm:max-h-[88vh] flex flex-col min-h-0 overflow-hidden animate-fade">
            <div className="px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Edit Client Profile</h3>
                <p className="text-[11px] text-zinc-400">Update contact, budget & status (Calculated values are read-only)</p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3.5 text-xs touch-pan-y">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    Company / Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="glass-input !py-2.5 text-xs text-white w-full"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    className="glass-input !py-2.5 text-xs text-white w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 mb-1 font-semibold">Phone</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="glass-input !py-2.5 text-xs text-white w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1 font-semibold">WhatsApp</label>
                    <input
                      type="tel"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="glass-input !py-2.5 text-xs text-white w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 mb-1 font-semibold">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="glass-input !py-2.5 text-xs text-white w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1 font-semibold">Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="glass-input !py-2.5 text-xs text-white w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 mb-1 font-semibold">Total Client Budget (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      className="glass-input !py-2.5 text-xs font-mono text-white w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1 font-semibold">Billing Date</label>
                    <input
                      type="date"
                      value={editBillingDate}
                      onChange={(e) => setEditBillingDate(e.target.value)}
                      className="glass-input !py-2.5 text-xs text-white w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ClientStatus)}
                    className="glass-input !py-2.5 text-xs bg-[#1a1a1e] text-white w-full capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="glass-input !py-2.5 text-xs text-white w-full"
                  />
                </div>

                {/* Read-only financial notice (Requirement #19) */}
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-400 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="font-sans">Total Paid (Auto):</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(report.amountReceived)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans">Pending Balance (Auto):</span>
                    <span className="text-amber-400 font-bold">{formatCurrency(report.pendingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans">Net Profit (Auto):</span>
                    <span className="text-white font-bold">{formatCurrency(report.clientProfit)}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#141419] shrink-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.06] text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-bold hover:opacity-95"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <AddPaymentModal
        isOpen={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        defaultClientId={client.id}
      />

      {/* Expense Modal */}
      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        defaultClientId={client.id}
        defaultType="client"
      />

      {/* Project Modal */}
      <AddProjectModal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        defaultClientId={client.id}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Client?"
        message="This will permanently remove the client and associated records."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </AppLayout>
  );
}
