'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Search,
  ArrowUpRight,
  Send,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate, getDaysRemaining } from '@/lib/formatters';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';

export default function PendingPaymentsPage() {
  const { clientReports } = useData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'pending'>('all');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Compute pending summary
  const totalPending = clientReports.reduce((s, r) => s + r.pendingAmount, 0);
  const overdueReports = clientReports.filter((r) => r.isOverdue);
  const totalOverdue = overdueReports.reduce((s, r) => s + r.pendingAmount, 0);

  const filteredReports = clientReports
    .filter((r) => {
      if (filter === 'overdue' && !r.isOverdue) return false;
      if (filter === 'pending' && r.pendingAmount === 0) return false;

      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        r.client.company_name.toLowerCase().includes(q) ||
        r.client.name.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Overdue first, then highest pending
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return b.pendingAmount - a.pendingAmount;
    });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Back (Section 36) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link
              href="/payments"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
                Receivables & Collection
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
                Pending & Overdue Payments
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monitor client pending balances, upcoming billing schedules, and overdue accounts.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Status KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 border-white/20 bg-gradient-to-b from-white/[0.09] to-white/[0.03]">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Total Pending Receivables</p>
            <p className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
              {formatCurrency(totalPending)}
            </p>
            <p className="text-[11px] text-zinc-400 mt-2">Outstanding client balances</p>
          </div>

          <div className="glass-panel p-4 border-rose-500/20 bg-gradient-to-b from-rose-500/[0.07] to-transparent">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-rose-300">Overdue Receivables</p>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono mt-1">
              {formatCurrency(totalOverdue)}
            </p>
            <p className="text-[11px] text-rose-300/80 mt-2">
              {overdueReports.length} client(s) currently past due date
            </p>
          </div>

          <div className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400">Collection Efficiency</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono mt-1">
              {clientReports.length > 0
                ? `${Math.round(
                    (clientReports.reduce((s, r) => s + r.amountReceived, 0) /
                      Math.max(1, clientReports.reduce((s, r) => s + r.totalBudget, 0))) *
                      100
                  )}%`
                : '100%'}
            </p>
            <p className="text-[11px] text-zinc-400 mt-2">Realized vs committed budgets</p>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client name..."
              className="glass-input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Clients
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                filter === 'pending'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pending Balances
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                filter === 'overdue'
                  ? 'bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Overdue ({overdueReports.length})
            </button>
          </div>
        </div>

        {/* Pending Receivables Table */}
        <div className="glass-panel p-0 overflow-hidden">
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Total Budget</th>
                  <th>Total Paid</th>
                  <th>Pending Amount</th>
                  <th>Billing Date</th>
                  <th>Timeline / Days</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-500 text-xs">
                      No pending records found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const due = getDaysRemaining(report.client.billing_date);

                    return (
                      <tr
                        key={report.client.id}
                        className={`hover:bg-white/[0.03] ${
                          report.isOverdue ? 'bg-rose-500/[0.03]' : ''
                        }`}
                      >
                        <td>
                          <div>
                            <Link
                              href={`/clients/detail?id=${report.client.id}`}
                              className="font-semibold text-white hover:underline flex items-center gap-1.5 text-xs"
                            >
                              {report.client.company_name}
                            </Link>
                            <span className="text-[11px] text-zinc-400">
                              {report.client.name} • {report.client.phone}
                            </span>
                          </div>
                        </td>
                        <td className="font-mono text-zinc-300 text-xs">
                          {formatCurrency(report.totalBudget)}
                        </td>
                        <td className="font-mono text-emerald-400 font-medium text-xs">
                          {formatCurrency(report.amountReceived)}
                        </td>
                        <td className="font-mono text-white font-bold text-sm">
                          {formatCurrency(report.pendingAmount)}
                        </td>
                        <td className="text-zinc-300 text-xs">
                          {formatDate(report.client.billing_date)}
                        </td>
                        <td>
                          {report.client.billing_date ? (
                            <span
                              className={`text-xs font-mono font-medium ${
                                report.isOverdue
                                  ? 'text-rose-400'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {due.text}
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-xs">—</span>
                          )}
                        </td>
                        <td>
                          {report.isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          ) : report.pendingAmount === 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Fully Paid
                            </span>
                          ) : report.amountReceived > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Partial
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-700/30 text-zinc-300 border border-zinc-700">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setSelectedClientId(report.client.id)}
                            className="glass-button-primary text-xs py-1 px-3"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Collect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Collect Payment Modal */}
      {selectedClientId && (
        <AddPaymentModal
          isOpen={true}
          onClose={() => setSelectedClientId(null)}
          defaultClientId={selectedClientId}
        />
      )}
    </AppLayout>
  );
}
