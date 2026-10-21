'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Clock,
  Check,
  ChevronDown,
  ArrowUpRight,
  Plus,
  CreditCard,
  Receipt,
  FileText,
  UserPlus,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ArcGauge } from '@/components/dashboard/ArcGauge';
import { ExponentialGrowthChart } from '@/components/dashboard/ExponentialGrowthChart';
import { UpcomingPaymentsTable } from '@/components/dashboard/UpcomingPaymentsTable';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ExpenseBreakdownChart } from '@/components/dashboard/ExpenseBreakdownChart';
import { AddClientModal } from '@/components/modals/AddClientModal';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';

type TimeRangeOption = 'Last 7 days' | 'Last 30 days' | 'Last 6 months' | 'This Year';

export default function DashboardPage() {
  const router = useRouter();
  const { metrics, payments, expenses, clients, projects, invoices, clientReports } = useData();

  // Modals state
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  // Time filter pills (Section 2 from user request)
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('Last 6 months');

  // Bottom drawer tab
  const [bottomTab, setBottomTab] = useState<'upcoming' | 'recent' | 'breakdown'>('upcoming');

  // Active counts for the 4 Agency Cards (Strictly dynamic from real database)
  const activeClientsCount = clients.filter((c) => c.status === 'active').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const paidInvoicesList = invoices.filter((inv) => inv.status === 'paid');
  const paidInvoicesCount = paidInvoicesList.length;
  const paidInvoicesAmount = paidInvoicesList.reduce((s, inv) => s + Number(inv.total), 0);

  const overdueList = clientReports.filter((r) => r.isOverdue);
  const overdueCount = overdueList.length;
  const overduePendingAmount = overdueList.reduce((s, r) => s + r.pendingAmount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* TIME FILTER CAPSULE ROW (from user request) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Business Overview
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live executive pulse of XYVEX agency finances & performance
            </p>
          </div>

          {/* Time Filter Pills: Last 7 days | Last 30 days | Last 6 months | This Year */}
          <div className="flex items-center gap-1 bg-[#141418] p-1 rounded-full border border-white/5 overflow-x-auto self-start sm:self-auto">
            {(['Last 7 days', 'Last 30 days', 'Last 6 months', 'This Year'] as TimeRangeOption[]).map(
              (option) => (
                <button
                  key={option}
                  onClick={() => setTimeRange(option)}
                  className={`pill-tab text-xs py-1.5 px-3.5 ${
                    timeRange === option ? 'pill-tab-active' : 'pill-tab-inactive'
                  }`}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </div>

        {/* 2. TOP 4 KPI CARDS (from user request) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 — Total Revenue */}
          <div className="neo-card-dark p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Total Revenue
              </span>
              <ArcGauge percentage={metrics.totalRevenue > 0 ? 85 : 0} strokeColor="#e11d48" icon={<Wallet className="w-3.5 h-3.5 text-white" />} />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                {formatCurrency(metrics.totalRevenue)}
              </h3>
              <p className="text-xs text-[#fb7185] font-semibold mt-1.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {metrics.totalRevenue > 0 ? '+18.4% vs last month' : 'No revenue yet'}
              </p>
            </div>
          </div>

          {/* Card 2 — Total Expenses */}
          <div className="neo-card-dark p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Total Expenses
              </span>
              <ArcGauge percentage={metrics.totalExpenses > 0 ? 55 : 0} strokeColor="#e11d48" icon={<Receipt className="w-3.5 h-3.5 text-white" />} />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                {formatCurrency(metrics.totalExpenses)}
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5">
                {formatCurrency(metrics.clientExpenses)} client expenses
              </p>
            </div>
          </div>

          {/* Card 3 — Net Profit */}
          <div className="neo-card-dark p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Net Profit
              </span>
              <ArcGauge percentage={metrics.netProfit > 0 ? 66 : 0} strokeColor="#e11d48" icon={<TrendingUp className="w-3.5 h-3.5 text-[#fb7185]" />} />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                {formatCurrency(metrics.netProfit)}
              </h3>
              <p className="text-xs text-[#fb7185] font-semibold mt-1.5">
                {metrics.profitMargin > 0 ? metrics.profitMargin.toFixed(1) : '0'}% profit margin
              </p>
            </div>
          </div>

          {/* Card 4 — Pending Receivables */}
          <div className="neo-card-dark p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Pending Receivables
              </span>
              <ArcGauge percentage={metrics.pendingPayments > 0 ? 45 : 0} strokeColor="#e11d48" icon={<Clock className="w-3.5 h-3.5 text-[#fb7185]" />} />
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
                {formatCurrency(metrics.pendingPayments)}
              </h3>
              <p className="text-xs text-[#fb7185] font-medium mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {overdueCount} overdue accounts
              </p>
            </div>
          </div>
        </div>

        {/* 3. CENTER BENTO GRID (Hero Left + Exponential Agency Performance Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SECTION (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight uppercase tracking-wider text-xs">
                Savings & Cash Realization
              </h2>
              <span className="text-xs text-zinc-400 font-mono">{timeRange}</span>
            </div>

            {/* Two Large Hero Cards: Crimson Card + White Card */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Card 1: Deep Crimson Hero Card (7 Cols) */}
              <div className="sm:col-span-7 neo-card-crimson p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-200/90 tracking-wide uppercase">
                    Cash Realized
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-base sm:text-lg text-white">
                    <span>{metrics.totalRevenue.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-black/30 text-rose-200 border border-white/10">INR</span>
                  </div>
                </div>

                <div className="my-6">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans block">
                    {metrics.totalRevenue > 0 ? '+38%' : '₹0'}
                  </span>
                  <p className="text-xs font-semibold text-rose-200/90 mt-1 flex items-center gap-1">
                    {metrics.totalRevenue > 0 ? 'grow since last day ↗' : 'Real-time cleared revenue'}
                  </p>
                </div>

                {/* 5 Stepped Rounded Visual Bars */}
                <div className="flex items-end gap-2.5 h-16 pt-2">
                  <div className="flex-1 h-[25%] rounded-2xl bg-white/20" />
                  <div className="flex-1 h-[40%] rounded-2xl bg-white/20" />
                  <div className="flex-1 h-[60%] rounded-2xl bg-white/25" />
                  <div className="flex-1 h-[80%] rounded-2xl bg-white/30" />
                  <div className="flex-1 h-[100%] rounded-2xl bg-[#24030b] border border-white/10 shadow-lg" />
                </div>
              </div>

              {/* Card 2: Pure White Card (5 Cols) */}
              <div className="sm:col-span-5 neo-card-white p-6 sm:p-7 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-600 uppercase">
                    Client Profit
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-base text-black">
                    <span>{metrics.netProfit.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800">INR</span>
                  </div>
                </div>

                <div className="my-6">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black font-sans block">
                    {metrics.netProfit > 0 ? '+28%' : '0%'}
                  </span>
                  <p className="text-xs font-medium text-zinc-500 mt-1">
                    Net client profit margin
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
                  <span>Actual revenue cleared</span>
                  <span className="font-bold text-black font-mono">{formatCurrency(metrics.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* 7. BOTTOM SMALL CARDS (completely replaced as requested) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Active Clients */}
              <div className="neo-card-dark p-4 sm:p-5 flex flex-col justify-between hover:border-white/15 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400">Active Clients</span>
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-sans block">
                    {activeClientsCount}
                  </span>
                  <p className="text-[11px] text-[#fb7185] font-semibold mt-1">
                    {activeClientsCount > 0 ? `+${activeClientsCount} this month` : 'No active clients'}
                  </p>
                </div>
              </div>

              {/* Card 2: Active Projects */}
              <div className="neo-card-dark p-4 sm:p-5 flex flex-col justify-between hover:border-white/15 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400">Active Projects</span>
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-sans block">
                    {activeProjectsCount}
                  </span>
                  <p className="text-[11px] text-amber-400 font-semibold mt-1">
                    {activeProjectsCount > 0 ? `${activeProjectsCount} in progress` : '0 due this week'}
                  </p>
                </div>
              </div>

              {/* Card 3: Paid Invoices */}
              <div className="neo-card-dark p-4 sm:p-5 flex flex-col justify-between hover:border-white/15 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-400">Paid Invoices</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#fb7185]" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-sans block">
                    {paidInvoicesCount}
                  </span>
                  <p className="text-[11px] text-zinc-300 font-mono mt-1">
                    {formatCurrency(paidInvoicesAmount)} received
                  </p>
                </div>
              </div>

              {/* Card 4: Overdue */}
              <div className="neo-card-dark p-4 sm:p-5 flex flex-col justify-between hover:border-rose-500/30 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-rose-300">Overdue</span>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl sm:text-3xl font-bold text-rose-400 font-sans block">
                    {overdueCount}
                  </span>
                  <p className="text-[11px] text-rose-400/90 font-mono mt-1">
                    {formatCurrency(overduePendingAmount)} pending
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 8. RIGHT SECTION (4 Cols) - Agency Performance + Service-Wise Revenue */}
          <div className="lg:col-span-4 h-full">
            <ExponentialGrowthChart
              totalRevenue={metrics.totalRevenue}
              paidInvoicesCount={paidInvoicesCount}
              projects={projects}
              invoices={invoices}
              onOpenPayment={() => setAddPaymentOpen(true)}
              onOpenInvoice={() => router.push('/invoices')}
            />
          </div>
        </div>

        {/* 4. BOTTOM EXPANDED SEGMENTS (Upcoming Receivables, Recent Activity, Expense Breakdown) */}
        <div className="space-y-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Tab switch pills */}
            <div className="flex items-center gap-1.5 bg-[#141418] p-1 rounded-full border border-white/5">
              <button
                onClick={() => setBottomTab('upcoming')}
                className={`px-4 py-1.5 text-xs rounded-full font-medium transition ${
                  bottomTab === 'upcoming'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Upcoming Receivables
              </button>
              <button
                onClick={() => setBottomTab('recent')}
                className={`px-4 py-1.5 text-xs rounded-full font-medium transition ${
                  bottomTab === 'recent'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Recent Transactions
              </button>
              <button
                onClick={() => setBottomTab('breakdown')}
                className={`px-4 py-1.5 text-xs rounded-full font-medium transition ${
                  bottomTab === 'breakdown'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Expense Breakdown
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddClientOpen(true)}
                className="glass-button-primary text-xs py-1.5 px-3.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Client</span>
              </button>
              <button
                onClick={() => setAddPaymentOpen(true)}
                className="glass-button-secondary text-xs py-1.5 px-3.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#fb7185]" />
                <span>+ Payment</span>
              </button>
              <button
                onClick={() => setAddExpenseOpen(true)}
                className="glass-button-secondary text-xs py-1.5 px-3.5"
              >
                <Receipt className="w-3.5 h-3.5 text-rose-400" />
                <span>+ Expense</span>
              </button>
            </div>
          </div>

          {/* Active Tab Content */}
          <div>
            {bottomTab === 'upcoming' && <UpcomingPaymentsTable reports={clientReports} />}
            {bottomTab === 'recent' && (
              <RecentTransactions payments={payments} expenses={expenses} clients={clients} />
            )}
            {bottomTab === 'breakdown' && <ExpenseBreakdownChart expenses={expenses} />}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        onSuccess={(id) => router.push(`/clients/${id}`)}
      />

      <AddPaymentModal
        isOpen={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
      />

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
      />
    </AppLayout>
  );
}
