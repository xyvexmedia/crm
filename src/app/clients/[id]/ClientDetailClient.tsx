'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  Pencil,
  ArrowUp,
  ArrowRight,
  Megaphone,
  Edit,
  Plus,
  CreditCard,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  ExternalLink,
  MoreVertical,
  MessageSquare,
  MoreHorizontal,
  User,
  FileText,
  X,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate, formatPercentage, getDaysRemaining } from '@/lib/formatters';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const { clients, projects, payments, expenses, getClientReport } = useData();

  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const client = clients.find((c) => c.id === clientId);
  const report = getClientReport(clientId);

  if (!client || !report) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-sm text-zinc-400">Client not found</p>
          <Link href="/clients" className="glass-button-primary mt-4 text-xs py-2 px-4">
            Back to Clients
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Client's specific records
  const clientProjects = projects.filter((p) => p.client_id === clientId);
  const clientPayments = payments
    .filter((p) => p.client_id === clientId)
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  const clientExpenses = expenses
    .filter((e) => e.client_id === clientId)
    .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());

  // Expense breakdown for this specific client (Section 22)
  const expenseBreakdown = {
    metaAds: clientExpenses.filter((e) => e.category === 'Meta Ads').reduce((s, e) => s + Number(e.amount), 0),
    googleAds: clientExpenses.filter((e) => e.category === 'Google Ads').reduce((s, e) => s + Number(e.amount), 0),
    video: clientExpenses.filter((e) => e.category === 'Video').reduce((s, e) => s + Number(e.amount), 0),
    poster: clientExpenses.filter((e) => e.category === 'Poster').reduce((s, e) => s + Number(e.amount), 0),
    other: clientExpenses
      .filter((e) => !['Meta Ads', 'Google Ads', 'Video', 'Poster'].includes(e.category))
      .reduce((s, e) => s + Number(e.amount), 0),
  };

  const primaryProject = clientProjects[0];
  const dueInfo = getDaysRemaining(client.billing_date);

  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [showAllPaymentsModal, setShowAllPaymentsModal] = useState(false);
  const [showAllExpensesModal, setShowAllExpensesModal] = useState(false);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen =
      showFullDetailsModal ||
      showAllPaymentsModal ||
      showAllExpensesModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showFullDetailsModal, showAllPaymentsModal, showAllExpensesModal]);

  const percentPaid =
    report.totalBudget > 0
      ? Math.min(100, Math.round((report.amountReceived / report.totalBudget) * 100))
      : 0;

  const profitMargin =
    report.profitMargin !== null && report.profitMargin !== undefined
      ? report.profitMargin
      : report.amountReceived > 0
      ? Math.round((report.clientProfit / report.amountReceived) * 1000) / 10
      : 0;

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <AppLayout>
      {/* ======================================================== */}
      {/* 1. MOBILE CLIENT DETAILS VIEW (Strictly matching Mockup) */}
      {/* ======================================================== */}
      <div className="block sm:hidden space-y-4 pb-6">
        {/* Top Header: Back button (left) + Edit Pencil button (right) */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/clients"
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition"
            aria-label="Back to Clients"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </Link>
          <Link
            href={`/clients/${client.id}/edit`}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition"
            aria-label="Edit Client"
          >
            <Pencil className="w-4 h-4" />
          </Link>
        </div>

        {/* Client Identity Header: Squircle Logo + Name + Service + Status Pill */}
        <div className="flex items-center gap-3.5 pt-1">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#7f0d2d] via-[#5c081e] to-[#3b0311] border border-rose-500/20 shadow-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9 text-white">
              <path
                d="M14 15C18 10 24 14 23 21C20 22 14 20 12 17C11.3 16 12.3 14 14 15Z"
                fill="currentColor"
              />
              <path
                d="M34 15C30 10 24 14 25 21C28 22 34 20 36 17C36.7 16 35.7 14 34 15Z"
                fill="currentColor"
              />
              <path
                d="M13 32C17 37 23 34 23 27C19 26 14 28 12 30C11.3 30.8 12 32.5 13 32Z"
                fill="currentColor"
              />
              <path
                d="M35 32C31 37 25 34 25 27C29 26 34 28 36 30C36.7 30.8 36 32.5 35 32Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white tracking-tight truncate">
              {client.company_name}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {primaryProject?.service || 'Meta Ads Marketing'}
            </p>
            <div className="mt-1.5">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                  client.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : client.status === 'completed'
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/40'
                }`}
              >
                {client.status}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Summary Card: Budget, Paid, Pending + Progress Bar */}
        <div className="bg-[#131217] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-md">
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-base font-bold text-white tracking-tight">
                {formatCurrency(report.totalBudget)}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Budget</p>
            </div>
            <div>
              <p className="text-base font-bold text-white tracking-tight">
                {formatCurrency(report.amountReceived)}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Paid</p>
            </div>
            <div>
              <p className="text-base font-bold text-white tracking-tight">
                {formatCurrency(report.pendingAmount)}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">Pending</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-3 bg-zinc-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e11d48] to-[#be123c] rounded-full transition-all duration-500"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-200 shrink-0">
              {percentPaid}% Paid
            </span>
          </div>
        </div>

        {/* Client Profit Card: Profit + Growth + Client Expenses */}
        <div className="bg-[#131217] border border-white/[0.08] rounded-2xl p-4 shadow-md">
          <p className="text-xs text-zinc-400">Client Profit</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-white tracking-tight font-mono">
              {formatCurrency(report.clientProfit)}
            </p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{profitMargin}%</span>
            </div>
          </div>

          <div className="border-t border-white/[0.06] my-3.5" />

          <div>
            <p className="text-xs text-zinc-400">Client Expenses</p>
            <p className="text-sm font-bold text-white mt-0.5 font-mono">
              {formatCurrency(report.clientExpenses)}
            </p>
          </div>
        </div>

        {/* Recent Payments Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Payments</h3>
            <button
              type="button"
              onClick={() => setShowAllPaymentsModal(true)}
              className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {clientPayments.length === 0 ? (
            <div className="bg-[#131217] border border-white/[0.08] rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500">No payments yet</p>
              <button
                type="button"
                onClick={() => setAddPaymentOpen(true)}
                className="mt-1 text-xs text-rose-400 font-semibold"
              >
                + Add Payment
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {clientPayments.slice(0, 3).map((pmt) => (
                <div
                  key={pmt.id}
                  className="bg-[#131217] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <ArrowUp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white font-mono truncate">
                        {formatCurrency(pmt.amount)}
                      </p>
                      <p className="text-[11px] text-zinc-400 capitalize truncate">
                        {pmt.payment_type ? `${pmt.payment_type} Payment` : 'Payment'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium shrink-0 ml-2">
                    {formatShortDate(pmt.payment_date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Expenses Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Client Expenses</h3>
            <button
              type="button"
              onClick={() => setShowAllExpensesModal(true)}
              className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {clientExpenses.length === 0 ? (
            <div className="bg-[#131217] border border-white/[0.08] rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500">No expenses yet</p>
              <button
                type="button"
                onClick={() => setAddExpenseOpen(true)}
                className="mt-1 text-xs text-rose-400 font-semibold"
              >
                + Add Expense
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {clientExpenses.slice(0, 3).map((exp) => (
                <div
                  key={exp.id}
                  className="bg-[#131217] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {exp.category || exp.description || 'Expense'}
                      </p>
                      <p className="text-sm font-bold text-white font-mono truncate">
                        {formatCurrency(exp.amount)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium shrink-0 ml-2">
                    {formatShortDate(exp.expense_date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Full Details Bottom Button */}
        <button
          type="button"
          onClick={() => setShowFullDetailsModal(true)}
          className="w-full py-3.5 px-4 mb-6 rounded-2xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] hover:opacity-95 active:scale-[0.99] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition"
        >
          View Full Details <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Modal: Full Client Details */}
        {showFullDetailsModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-[#0e0e12] border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white">{client.company_name}</h3>
                  <p className="text-[11px] text-zinc-400">Complete Client Information</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullDetailsModal(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-4 space-y-4 overflow-y-auto overscroll-contain flex-1">
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullDetailsModal(false);
                      setAddPaymentOpen(true);
                    }}
                    className="py-2.5 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Payment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullDetailsModal(false);
                      setAddExpenseOpen(true);
                    }}
                    className="py-2.5 px-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Expense</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullDetailsModal(false);
                      router.push(`/clients/${client.id}/edit`);
                    }}
                    className="py-2.5 px-2 rounded-xl bg-white/[0.06] border border-white/10 text-zinc-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Client</span>
                  </button>
                </div>

                {/* Contact Information */}
                <div className="bg-[#141419] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Contact & Billing
                  </h4>
                  <div className="space-y-2 text-xs">
                    {client.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> Phone
                        </span>
                        <a href={`tel:${client.phone}`} className="text-white hover:underline font-mono">
                          {client.phone}
                        </a>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </span>
                        <a href={`mailto:${client.email}`} className="text-white hover:underline truncate max-w-[200px]">
                          {client.email}
                        </a>
                      </div>
                    )}
                    {client.billing_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Billing / Due Date
                        </span>
                        <span className="text-white">
                          {formatDate(client.billing_date)} ({dueInfo.text})
                        </span>
                      </div>
                    )}
                    {client.notes && (
                      <div className="pt-1.5 border-t border-white/[0.06]">
                        <span className="text-zinc-400 block text-[11px]">Notes:</span>
                        <p className="text-zinc-200 mt-0.5 text-xs">{client.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-[#141419] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Expense Breakdown
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Meta Ads Spend</span>
                      <span className="text-white font-mono">{formatCurrency(expenseBreakdown.metaAds)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Google Ads Spend</span>
                      <span className="text-white font-mono">{formatCurrency(expenseBreakdown.googleAds)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Video Production</span>
                      <span className="text-white font-mono">{formatCurrency(expenseBreakdown.video)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-zinc-400">Poster / Design</span>
                      <span className="text-white font-mono">{formatCurrency(expenseBreakdown.poster)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Other / Operations</span>
                      <span className="text-white font-mono">{formatCurrency(expenseBreakdown.other)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 pb-safe pb-4 border-t border-white/10 shrink-0 bg-[#0e0e12]">
                <button
                  type="button"
                  onClick={() => setShowFullDetailsModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.12] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: All Payments */}
        {showAllPaymentsModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-[#0e0e12] border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white">All Payments</h3>
                  <p className="text-[11px] text-zinc-400">{client.company_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllPaymentsModal(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-2 overflow-y-auto overscroll-contain flex-1">
                {clientPayments.length === 0 ? (
                  <p className="text-center py-8 text-xs text-zinc-500">No payments found</p>
                ) : (
                  clientPayments.map((pmt) => (
                    <div
                      key={pmt.id}
                      className="bg-[#141419] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <ArrowUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white font-mono">
                            {formatCurrency(pmt.amount)}
                          </p>
                          <p className="text-[10px] text-zinc-400 capitalize">
                            {pmt.payment_type} • {pmt.payment_method}
                            {pmt.notes ? ` • ${pmt.notes}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {formatShortDate(pmt.payment_date)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 pb-safe pb-4 border-t border-white/10 shrink-0 bg-[#0e0e12] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllPaymentsModal(false);
                    setAddPaymentOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold hover:opacity-95 transition"
                >
                  + Add Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllPaymentsModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.12] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: All Expenses */}
        {showAllExpensesModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-lg bg-[#0e0e12] border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white">All Client Expenses</h3>
                  <p className="text-[11px] text-zinc-400">{client.company_name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllExpensesModal(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-2 overflow-y-auto overscroll-contain flex-1">
                {clientExpenses.length === 0 ? (
                  <p className="text-center py-8 text-xs text-zinc-500">No expenses found</p>
                ) : (
                  clientExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="bg-[#141419] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-200">
                            {exp.category}
                          </p>
                          <p className="text-[10px] text-zinc-400">
                            {exp.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-white font-mono block">
                          {formatCurrency(exp.amount)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatShortDate(exp.expense_date)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 pb-safe pb-4 border-t border-white/10 shrink-0 bg-[#0e0e12] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllExpensesModal(false);
                    setAddExpenseOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold hover:opacity-95 transition"
                >
                  + Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllExpensesModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.12] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP / LAPTOP CLIENT DETAILS VIEW (100% UNCHANGED) */}
      {/* ======================================================== */}
      <div className="hidden sm:block space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
                  {client.company_name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    client.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-700/30 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {primaryProject?.service || 'Digital Marketing Retainer'} • Contact: {client.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddPaymentOpen(true)}
              className="glass-button-primary text-xs py-2 px-3"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => setAddExpenseOpen(true)}
              className="glass-button-secondary text-xs py-2 px-3"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Log Client Expense</span>
            </button>

            <Link
              href={`/clients/${client.id}/edit`}
              className="glass-button-secondary text-xs py-2 px-3"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Client</span>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Cards (Section 20) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Total Budget</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(report.totalBudget)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2 truncate">
              Agreed across {clientProjects.length} active project(s)
            </p>
          </div>

          <div className="glass-panel p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Amount Received</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(report.amountReceived)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">
              {clientPayments.length} payment(s) cleared
            </p>
          </div>

          <div className="glass-panel p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Pending Amount</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(report.pendingAmount)}
            </p>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
              {report.isOverdue ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Overdue ({dueInfo.text})
                </span>
              ) : client.billing_date ? (
                <span>Billing: {formatDate(client.billing_date)}</span>
              ) : (
                <span>No pending due date</span>
              )}
            </p>
          </div>

          <div className="glass-panel p-4 border-white/20 bg-gradient-to-b from-white/[0.09] to-white/[0.04]">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Client Profit</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(report.clientProfit)}
            </p>
            <p className="text-[11px] text-zinc-400 mt-2">
              Profit Margin: {formatPercentage(report.profitMargin)}
            </p>
          </div>
        </div>

        {/* Payment Progress Bar (Section 21) */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-white uppercase tracking-wider">
              Payment Realization Progress
            </span>
            <span className="font-mono text-zinc-300 font-medium">
              {report.paymentProgress}% Paid ({formatCurrency(report.amountReceived)} / {formatCurrency(report.totalBudget)})
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/[0.06] border border-white/10 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${report.paymentProgress}%` }}
            />
          </div>
        </div>

        {/* Client Expense Summary & Profit Breakdown (Section 22 & 23) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Expense Summary */}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                  Client Expense Summary
                </h2>
                <p className="text-xs text-zinc-400">Media, advertising, and creative spend</p>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {formatCurrency(report.clientExpenses)}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]">
                <span className="text-zinc-300">Meta Ads (Facebook & Instagram)</span>
                <span className="font-mono text-white font-medium">{formatCurrency(expenseBreakdown.metaAds)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]">
                <span className="text-zinc-300">Google Ads (Search & PPC)</span>
                <span className="font-mono text-white font-medium">{formatCurrency(expenseBreakdown.googleAds)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]">
                <span className="text-zinc-300">Video Production & Reels</span>
                <span className="font-mono text-white font-medium">{formatCurrency(expenseBreakdown.video)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]">
                <span className="text-zinc-300">Poster & Creative Design</span>
                <span className="font-mono text-white font-medium">{formatCurrency(expenseBreakdown.poster)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]">
                <span className="text-zinc-300">Other Direct Expenses</span>
                <span className="font-mono text-white font-medium">{formatCurrency(expenseBreakdown.other)}</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold text-sm px-2">
                <span className="text-zinc-200">Total Client Expense</span>
                <span className="font-mono text-rose-400">{formatCurrency(report.clientExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Client Profit & Margin Calculation (Section 23) */}
          <div className="glass-panel p-5 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-white/[0.08] mb-4">
                <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                  Client Profit Analysis
                </h2>
                <p className="text-xs text-zinc-400">Strictly computed from cash collected minus client spend</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Amount Received (Cash)</span>
                  <span className="font-mono font-medium text-emerald-400">
                    + {formatCurrency(report.amountReceived)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Direct Client Disbursements</span>
                  <span className="font-mono font-medium text-zinc-300">
                    - {formatCurrency(report.clientExpenses)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">Client Net Profit</span>
                    <span className="font-mono font-bold text-lg text-emerald-400">
                      {formatCurrency(report.clientProfit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Profit Margin:</span>
                    <span className="font-mono font-medium text-white">
                      {formatPercentage(report.profitMargin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Info Summary */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-zinc-400 space-y-1">
              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-500" /> {client.phone}</p>
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-500" /> {client.email}</p>
              {client.address && (
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-500" /> {client.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Client Payment History Table (Section 24) */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                Payment History
              </h2>
              <p className="text-xs text-zinc-400">Realized deposits and settlement milestones</p>
            </div>
            <button
              onClick={() => setAddPaymentOpen(true)}
              className="glass-button-secondary text-xs py-1.5 px-3"
            >
              + Add Payment
            </button>
          </div>

          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Payment Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {clientPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-zinc-500 text-xs">
                      No payments recorded yet for this client
                    </td>
                  </tr>
                ) : (
                  clientPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="text-zinc-300 font-mono text-xs">{formatDate(p.payment_date)}</td>
                      <td>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-zinc-300">
                          {p.payment_type}
                        </span>
                      </td>
                      <td className="font-mono text-emerald-400 font-bold">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="text-zinc-300 text-xs">{p.payment_method}</td>
                      <td className="text-zinc-400 text-xs max-w-xs truncate">{p.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Expense History Table (Section 25) */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                Client Expense History
              </h2>
              <p className="text-xs text-zinc-400">Ad budgets, vendor fees, and project costs</p>
            </div>
            <button
              onClick={() => setAddExpenseOpen(true)}
              className="glass-button-secondary text-xs py-1.5 px-3"
            >
              + Add Expense
            </button>
          </div>

          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Vendor / Partner</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {clientExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-zinc-500 text-xs">
                      No expenses logged specifically for this client
                    </td>
                  </tr>
                ) : (
                  clientExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="text-zinc-300 font-mono text-xs">{formatDate(exp.expense_date)}</td>
                      <td>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/10">
                          {exp.category}
                        </span>
                      </td>
                      <td className="font-mono text-zinc-200 font-semibold">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="text-zinc-300 text-xs">{exp.vendor || '—'}</td>
                      <td className="text-zinc-400 text-xs max-w-xs truncate">{exp.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals with client preset */}
      <AddPaymentModal
        isOpen={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        defaultClientId={client.id}
      />

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        defaultClientId={client.id}
        defaultType="client"
      />
    </AppLayout>
  );
}
