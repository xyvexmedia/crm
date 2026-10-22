'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Calendar,
  MoreVertical,
  X,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

type FilterTab = 'all' | 'received' | 'pending' | 'overdue';

// Service icon map
const SERVICE_ICONS: Record<string, string> = {
  'meta ads': '󰈷',
  'google ads': '󰊭',
  'seo': '󰈈',
  'social media': '󰒆',
  'website': '󰖟',
  'design': '󰏬',
  'poster design': '󰏬',
  'video': '󰕧',
  'crm': '󱃴',
  'other': '󰙵',
};

function getInitials(name: string) {
  return (name || 'UN')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const AVATAR_GRADIENTS = [
  'from-rose-600 via-rose-700 to-rose-900',
  'from-emerald-600 via-emerald-700 to-emerald-900',
  'from-blue-600 via-blue-700 to-blue-900',
  'from-amber-500 via-amber-600 to-amber-800',
  'from-purple-600 via-purple-700 to-purple-900',
  'from-cyan-600 via-cyan-700 to-cyan-900',
  'from-fuchsia-600 via-fuchsia-700 to-fuchsia-900',
  'from-teal-600 via-teal-700 to-teal-900',
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function statusBadge(status: FilterTab | 'received') {
  switch (status) {
    case 'received':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          Received
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
          Pending
        </span>
      );
    case 'overdue':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
          Overdue
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/25">
          Cleared
        </span>
      );
  }
}

function formatPaymentType(type: string) {
  const map: Record<string, string> = {
    advance: 'Advance Payment',
    partial: 'Partial Payment',
    final: 'Final Payment',
    full: 'Full Payment',
    second: 'Second Payment',
  };
  return map[type?.toLowerCase()] || type;
}

export default function PaymentsPage() {
  const { payments, clients, projects, clientReports, metrics, deletePayment } = useData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; amount: number } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Summary stats
  const totalReceivables = useMemo(
    () => clientReports.reduce((sum, r) => sum + r.totalBudget, 0),
    [clientReports]
  );
  const totalReceived = useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );
  const totalPending = useMemo(
    () => clientReports.reduce((sum, r) => sum + r.pendingAmount, 0),
    [clientReports]
  );
  const overdueReports = useMemo(
    () => clientReports.filter((r) => r.isOverdue),
    [clientReports]
  );
  const overdueAmount = useMemo(
    () => overdueReports.reduce((sum, r) => sum + r.pendingAmount, 0),
    [overdueReports]
  );

  // Filtered payments - match with overdue status
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        const client = clients.find((c) => c.id === p.client_id);
        const project = projects.find((proj) => proj.id === p.project_id);
        const q = search.toLowerCase().trim();

        const matchSearch =
          !q ||
          client?.company_name.toLowerCase().includes(q) ||
          client?.name?.toLowerCase().includes(q) ||
          project?.name?.toLowerCase().includes(q) ||
          p.payment_type?.toLowerCase().includes(q) ||
          p.reference?.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q);

        if (!matchSearch) return false;

        // Payment is "overdue" if client is overdue and payment is still pending
        const clientReport = clientReports.find((r) => r.client.id === p.client_id);
        const isOverdue = clientReport?.isOverdue && clientReport.pendingAmount > 0;

        if (filter === 'received') {
          // Only show payments that are marked as received (not overdue)
          if (isOverdue) return false;
          return true;
        }
        if (filter === 'pending') {
          return !!clientReport && clientReport.pendingAmount > 0 && !isOverdue;
        }
        if (filter === 'overdue') {
          return !!isOverdue;
        }

        return true;
      })
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }, [payments, clients, projects, clientReports, search, filter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePayment(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'received', label: 'Received' },
    { key: 'pending', label: 'Pending' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 max-w-5xl mx-auto pb-16">
        {/* ===================================================== */}
        {/* 1. PAGE HEADER                                       */}
        {/* ===================================================== */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="min-w-0">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              Financial Collections
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5 leading-tight">
              Payment Management
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block">
              Advance payments, installments, and client settlements
            </p>
          </div>
          <button
            onClick={() => setAddPaymentOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.3)] active:scale-95 transition shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Payment</span>
          </button>
        </div>

        {/* ===================================================== */}
        {/* 2. STATS CARDS ROW                                   */}
        {/* ===================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Receivables */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#7f0d2d]/30 border border-rose-500/20 flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-[10px] text-zinc-400">Total Receivables</p>
            <p className="text-lg font-bold text-white font-mono leading-none">
              {formatCurrency(totalReceivables)}
            </p>
            <p className="text-[10px] text-rose-400 font-medium">
              {clients.length} clients
            </p>
          </div>

          {/* Received */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-zinc-400">Received</p>
            <p className="text-lg font-bold text-emerald-400 font-mono leading-none">
              {formatCurrency(totalReceived)}
            </p>
            <p className="text-[10px] text-emerald-400 font-medium">
              {payments.length} payments
            </p>
          </div>

          {/* Pending */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <p className="text-[10px] text-zinc-400">Pending</p>
            <p className="text-lg font-bold text-amber-400 font-mono leading-none">
              {formatCurrency(totalPending)}
            </p>
            <p className="text-[10px] text-amber-400 font-medium">
              {clientReports.filter((r) => r.pendingAmount > 0 && !r.isOverdue).length} payments
            </p>
          </div>

          {/* Overdue */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-4.5 h-4.5 text-rose-400" />
            </div>
            <p className="text-[10px] text-zinc-400">Overdue</p>
            <p className="text-lg font-bold text-rose-400 font-mono leading-none">
              {formatCurrency(overdueAmount)}
            </p>
            <p className="text-[10px] text-rose-400 font-medium">
              {overdueReports.length} payments
            </p>
          </div>
        </div>

        {/* ===================================================== */}
        {/* 3. SEARCH BAR                                        */}
        {/* ===================================================== */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, project or reference..."
              className="w-full bg-[#121217] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button className="w-10 h-10 rounded-xl bg-[#121217] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ===================================================== */}
        {/* 4. FILTER PILLS + DATE RANGE                         */}
        {/* ===================================================== */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white shadow-md'
                    : 'bg-[#1a1a22] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/15'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            href="/payments/pending"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a22] border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/15 text-xs font-medium whitespace-nowrap transition shrink-0"
          >
            <Calendar className="w-3 h-3" />
            <span>Date Range</span>
          </Link>
        </div>

        {/* ===================================================== */}
        {/* 5. PAYMENT CARDS LIST                                */}
        {/* ===================================================== */}
        <div className="space-y-3">
          {filteredPayments.length === 0 ? (
            <div className="bg-[#121217] border border-dashed border-white/10 rounded-3xl p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 mx-auto">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">No Payments Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {search
                  ? 'No payments match your search.'
                  : 'Record your first payment to start tracking collections.'}
              </p>
              <button
                onClick={() => setAddPaymentOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold shadow-md active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                Record Payment
              </button>
            </div>
          ) : (
            filteredPayments.map((payment) => {
              const client = clients.find((c) => c.id === payment.client_id);
              const project = projects.find((p) => p.id === payment.project_id);
              const clientReport = clientReports.find((r) => r.client.id === payment.client_id);
              const isOverdue = clientReport?.isOverdue && clientReport.pendingAmount > 0;

              const name = client?.company_name || 'Unknown';
              const initials = getInitials(name);
              const gradient = getGradient(client?.id || payment.id);
              const service = project?.service || 'Other';

              // Status
              let paymentStatus: FilterTab = 'received';
              if (isOverdue) paymentStatus = 'overdue';
              else if (clientReport && clientReport.pendingAmount > 0) paymentStatus = 'pending';

              return (
                <div
                  key={payment.id}
                  className="bg-[#121217] border border-white/[0.07] hover:border-white/15 rounded-2xl p-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}
                    >
                      {initials}
                    </div>

                    {/* Client & Project Info */}
                    <div className="flex-1 min-w-0">
                      {client ? (
                        <Link
                          href={`/clients/detail?id=${client.id}`}
                          className="text-sm font-bold text-white hover:text-rose-300 transition truncate block"
                        >
                          {name}
                        </Link>
                      ) : (
                        <span className="text-sm font-bold text-white truncate block">{name}</span>
                      )}
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {project?.name || 'General Retainer'}
                      </p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <span className="w-3 h-3 inline-flex items-center justify-center opacity-70">
                          {service === 'Meta Ads' && (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                          )}
                          {service === 'Google Ads' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-amber-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                          )}
                          {service === 'SEO' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-emerald-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                          )}
                          {service === 'Social Media' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-purple-400"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                          )}
                          {!['Meta Ads', 'Google Ads', 'SEO', 'Social Media'].includes(service) && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-zinc-400"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                          )}
                        </span>
                        {service}
                      </p>
                    </div>

                    {/* Amount & Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-base font-bold text-white font-mono">
                        {formatCurrency(payment.amount)}
                      </p>
                      {statusBadge(paymentStatus)}
                    </div>

                    {/* More Menu */}
                    <div className="relative ml-1 shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === payment.id ? null : payment.id)}
                        className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.10] flex items-center justify-center text-zinc-400 hover:text-white transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === payment.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-10 z-50 w-44 bg-[#121217] border border-white/15 rounded-2xl shadow-2xl p-1.5 space-y-1">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeleteTarget({ id: payment.id, amount: payment.amount });
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Payment
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Details Row */}
                  <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-4 flex-wrap text-[11px] text-zinc-500">
                    <span className="font-semibold text-zinc-300">
                      {formatPaymentType(payment.payment_type)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(payment.payment_date)}
                    </span>
                    {payment.payment_method && (
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-mono">
                        {payment.payment_method}
                      </span>
                    )}
                    {payment.reference && (
                      <span className="text-zinc-600 truncate max-w-[120px]">
                        Ref: {payment.reference}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddPaymentModal
        isOpen={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Payment?"
        message={`Delete payment of ${formatCurrency(deleteTarget?.amount)}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
