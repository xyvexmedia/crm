'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowUpRight,
  Download,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

type SortOption = 'highest_profit' | 'highest_revenue' | 'lowest_profit' | 'highest_expense';

export default function ReportsPage() {
  const { metrics, clientReports, expenses, payments } = useData();

  const [sortBy, setSortBy] = useState<SortOption>('highest_profit');
  const [selectedReportTab, setSelectedReportTab] = useState<'client_profit' | 'monthly' | 'categories'>('client_profit');

  // Sorted client financial reports
  const sortedClientReports = useMemo(() => {
    return [...clientReports].sort((a, b) => {
      if (sortBy === 'highest_profit') return b.clientProfit - a.clientProfit;
      if (sortBy === 'highest_revenue') return b.amountReceived - a.amountReceived;
      if (sortBy === 'lowest_profit') return a.clientProfit - b.clientProfit;
      if (sortBy === 'highest_expense') return b.clientExpenses - a.clientExpenses;
      return 0;
    });
  }, [clientReports, sortBy]);

  // Client Profit Bar Chart Data
  const chartData = useMemo(() => {
    return clientReports.map((r) => ({
      name: r.client.company_name.split(' ')[0],
      fullName: r.client.company_name,
      received: r.amountReceived,
      expenses: r.clientExpenses,
      profit: r.clientProfit,
    }));
  }, [clientReports]);

  // Monthly Financial Summary (Section 43)
  const monthlySummary = {
    month: 'October 2026',
    revenue: metrics.totalRevenue,
    clientExpenses: metrics.clientExpenses,
    companyExpenses: metrics.companyExpenses,
    totalExpenses: metrics.totalExpenses,
    netProfit: metrics.netProfit,
    profitMargin: metrics.profitMargin,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header (Section 41) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Financial Intelligence
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
              Financial & Profitability Reports
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Client-level profit margin audit, monthly operational overhead, and revenue analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="glass-button-secondary text-xs py-2 px-3.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Monthly Financial Summary Card (Section 43) */}
        <div className="glass-panel p-6 border-white/20 bg-gradient-to-b from-white/[0.10] to-white/[0.03]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                Performance Executive Summary
              </span>
              <h2 className="text-lg font-bold text-white mt-0.5">{monthlySummary.month}</h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold self-start sm:self-auto">
              Net Profit Margin: {monthlySummary.profitMargin.toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-zinc-400 block text-[11px]">Realized Revenue</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                {formatCurrency(monthlySummary.revenue)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-zinc-400 block text-[11px]">Client Expenses</span>
              <span className="text-lg font-bold text-zinc-300 font-mono mt-1 block">
                {formatCurrency(monthlySummary.clientExpenses)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-zinc-400 block text-[11px]">Company Expenses</span>
              <span className="text-lg font-bold text-zinc-400 font-mono mt-1 block">
                {formatCurrency(monthlySummary.companyExpenses)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-zinc-400 block text-[11px]">Total Expenses</span>
              <span className="text-lg font-bold text-rose-400 font-mono mt-1 block">
                {formatCurrency(monthlySummary.totalExpenses)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.05] border border-white/15">
              <span className="text-emerald-400 block text-[11px] font-medium">Net Profit</span>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">
                {formatCurrency(monthlySummary.netProfit)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-zinc-400 block text-[11px]">Profit Margin</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                {formatPercentage(monthlySummary.profitMargin)}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Chart: Client Revenue vs Client Expense vs Profit */}
        <div className="glass-panel p-5">
          <div className="pb-3 border-b border-white/[0.08] mb-4">
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Client Financial Comparison
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cash received vs specific expenditures vs net margin by client
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const full = payload[0]?.payload?.fullName;
                      return (
                        <div className="glass-panel bg-[#0d0d12]/95 border border-white/20 p-3 shadow-xl text-xs space-y-1 min-w-[150px]">
                          <p className="font-semibold text-white border-b border-white/10 pb-1 mb-1">{full}</p>
                          <p className="text-zinc-300">Received: <span className="font-bold text-white">{formatCurrency(Number(payload[0]?.value))}</span></p>
                          <p className="text-zinc-400">Expenses: <span className="font-bold text-zinc-300">{formatCurrency(Number(payload[1]?.value))}</span></p>
                          <p className="text-emerald-400 font-semibold pt-1 border-t border-white/10">Profit: {formatCurrency(Number(payload[2]?.value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="received" fill="#ffffff" radius={[4, 4, 0, 0]} name="Amount Received" />
                <Bar dataKey="expenses" fill="#71717a" radius={[4, 4, 0, 0]} name="Client Expenses" />
                <Bar dataKey="profit" fill="#34d399" radius={[4, 4, 0, 0]} name="Client Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-white/[0.06] text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-white" />
              <span>Amount Received</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-500" />
              <span>Client Expenses</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
              <span>Client Profit</span>
            </div>
          </div>
        </div>

        {/* CLIENT PROFIT REPORT TABLE (Section 42) */}
        <div className="glass-panel p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] mb-4 gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                Client Profit Audit Table
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Exact profitability formula: Client Amount Received - Client Expenses (unpaid budget excluded)
              </p>
            </div>

            {/* Sort Dropdown (Section 42) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="glass-input bg-zinc-900 text-xs py-1.5 w-44"
              >
                <option value="highest_profit">Highest Profit</option>
                <option value="highest_revenue">Highest Revenue</option>
                <option value="lowest_profit">Lowest Profit</option>
                <option value="highest_expense">Highest Expense</option>
              </select>
            </div>
          </div>

          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Total Budget</th>
                  <th>Amount Received</th>
                  <th>Client Expenses</th>
                  <th>Net Client Profit</th>
                  <th>Profit Margin</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedClientReports.map((report) => (
                  <tr key={report.client.id} className="hover:bg-white/[0.03]">
                    <td>
                      <div>
                        <Link
                          href={`/clients/${report.client.id}`}
                          className="font-semibold text-white hover:underline text-xs"
                        >
                          {report.client.company_name}
                        </Link>
                        <span className="text-[11px] text-zinc-400 block">{report.client.name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-zinc-300 text-xs">
                      {formatCurrency(report.totalBudget)}
                    </td>
                    <td className="font-mono text-emerald-400 font-medium text-xs">
                      {formatCurrency(report.amountReceived)}
                    </td>
                    <td className="font-mono text-zinc-400 text-xs">
                      {formatCurrency(report.clientExpenses)}
                    </td>
                    <td className="font-mono font-bold text-sm text-emerald-400">
                      {formatCurrency(report.clientProfit)}
                    </td>
                    <td>
                      {report.profitMargin !== null ? (
                        <span
                          className={`font-mono text-xs font-semibold ${
                            report.profitMargin >= 50
                              ? 'text-emerald-400'
                              : report.profitMargin > 0
                              ? 'text-zinc-200'
                              : 'text-rose-400'
                          }`}
                        >
                          {formatPercentage(report.profitMargin)}
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-mono text-xs">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/clients/${report.client.id}`}
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
                      >
                        <span>Audit</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
