'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
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

  return (
    <AppLayout>
      <div className="space-y-6">
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
