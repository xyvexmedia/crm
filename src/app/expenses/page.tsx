'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Plus,
  Trash2,
  Paperclip,
  Calendar,
  Building,
  Users,
  Video,
  Palette,
  Server,
  Cpu,
  Building2,
  MoreHorizontal,
  ArrowLeft,
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ExpenseType, ExpenseCategory } from '@/types';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

type TabType = 'all' | 'client' | 'company';

export default function ExpensesPage() {
  const { expenses, clients, metrics, deleteExpense } = useData();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; desc: string; amount: number } | null>(null);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (activeTab === 'client' && !e.client_id) return false;
        if (activeTab === 'company' && !!e.client_id) return false;

        if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;

        const client = e.client_id ? clients.find((c) => c.id === e.client_id) : null;
        const q = search.toLowerCase().trim();
        if (!q) return true;

        return (
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.vendor && e.vendor.toLowerCase().includes(q)) ||
          (client && client.company_name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
  }, [expenses, activeTab, selectedCategory, search, clients]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteExpense(deleteTarget.id);
    setDeleteTarget(null);
  };

  // 8 Categories Summary for Mobile View (Screen 4)
  const categorySummary = useMemo(() => {
    const categories = [
      { name: 'Meta Ads', icon: TrendingUp, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
      { name: 'Google Ads', icon: Search, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
      { name: 'Video Production', icon: Video, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
      { name: 'Poster / Design', icon: Palette, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
      { name: 'Hosting', icon: Server, color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
      { name: 'Software', icon: Cpu, color: 'text-teal-400 bg-teal-500/15 border-teal-500/30' },
      { name: 'Office', icon: Building2, color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30' },
      { name: 'Other', icon: MoreHorizontal, color: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30' },
    ];

    return categories.map((cat) => {
      const total = expenses
        .filter((e) => e.category?.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0]))
        .reduce((s, e) => s + Number(e.amount), 0);
      return { ...cat, total };
    });
  }, [expenses]);

  return (
    <AppLayout>
      {/* ======================================================== */}
      {/* 1. MOBILE EXPENSES VIEW (Strictly matching Mockup Screen 4)*/}
      {/* ======================================================== */}
      <div className="block sm:hidden space-y-4">
        {/* Header: Back arrow + Expenses title + + Add Expense button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Expenses
            </h1>
          </div>

          <button
            onClick={() => setAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#a3e635] text-black text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Category Filter Pills: All | Client Expenses | Company Expenses */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'all'
                ? 'bg-[#a3e635] text-black font-semibold shadow-sm'
                : 'bg-white/[0.05] text-zinc-400 border border-white/[0.08]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'client'
                ? 'bg-[#a3e635] text-black font-semibold shadow-sm'
                : 'bg-white/[0.05] text-zinc-400 border border-white/[0.08]'
            }`}
          >
            Client Expenses
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              activeTab === 'company'
                ? 'bg-[#a3e635] text-black font-semibold shadow-sm'
                : 'bg-white/[0.05] text-zinc-400 border border-white/[0.08]'
            }`}
          >
            Company Expenses
          </button>
        </div>

        {/* Search Bar + Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses..."
              className="w-full bg-[#141419] border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#a3e635]/50 transition"
            />
          </div>
          <button
            onClick={() => setSelectedCategory(selectedCategory === 'all' ? 'Meta Ads' : 'all')}
            className="w-10 h-10 rounded-2xl bg-[#141419] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Total Expenses Card (Screen 4) */}
        <div className="bg-[#121217] border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Total Expenses
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-sans text-white">
                {formatCurrency(metrics.totalExpenses)}
              </span>
              <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +8.2%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* 8 Category Grid (Screen 4 Exact) */}
        <div className="grid grid-cols-2 gap-2.5">
          {categorySummary.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'all' : cat.name)}
                className={`bg-[#121217] border rounded-2xl p-3 flex items-center gap-3 transition active:scale-98 cursor-pointer ${
                  selectedCategory === cat.name ? 'border-[#a3e635]' : 'border-white/[0.08]'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-zinc-400 text-[10px] block truncate font-medium">
                    {cat.name}
                  </span>
                  <span className="text-xs font-bold font-mono text-white block mt-0.5">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Expenses List (Screen 4) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white tracking-tight uppercase tracking-wider text-[11px]">
              Recent Expenses
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium">View All</span>
          </div>

          <div className="space-y-2">
            {filteredExpenses.length === 0 ? (
              <p className="text-center py-6 text-zinc-500 text-xs">No recent expenses recorded</p>
            ) : (
              filteredExpenses.slice(0, 5).map((exp) => {
                const client = exp.client_id ? clients.find((c) => c.id === exp.client_id) : null;
                return (
                  <div
                    key={exp.id}
                    className="bg-[#121217] border border-white/[0.06] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                        <Receipt className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate tracking-tight">
                          {exp.category}
                        </h4>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {client ? client.company_name : 'XYVEX Operations'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-rose-400 block">
                        -{formatCurrency(exp.amount)}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        {formatDate(exp.expense_date)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP / LAPTOP EXPENSES VIEW (100% UNCHANGED)       */}
      {/* ======================================================== */}
      <div className="hidden sm:block space-y-6">
        {/* Header & Main Tabs (Section 28) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Financial Outflows & Cost Accounting
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
              Expense Management
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Track media buying, ad spends, freelance production, and operational agency overhead.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddExpenseOpen(true)}
              className="glass-button-primary text-xs py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 3 Main KPIs (Section 28) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 border-white/20 bg-gradient-to-b from-white/[0.10] to-white/[0.04]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                Total Expenses
              </p>
              <Layers className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
              {formatCurrency(metrics.totalExpenses)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">Combined client disbursements + overhead</p>
          </div>

          <div className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                Client Expenses
              </p>
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-200 font-mono mt-1">
              {formatCurrency(metrics.clientExpenses)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">Meta Ads, Google Ads, Video, Posters</p>
          </div>

          <div className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                Company Expenses
              </p>
              <Building className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-zinc-300 font-mono mt-1">
              {formatCurrency(metrics.companyExpenses)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">Hosting, Software, Studio, Utilities</p>
          </div>
        </div>

        {/* Tab Selector & Filters (Section 28 & 34) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Main Segment Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                activeTab === 'all'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Expenses ({expenses.length})
            </button>
            <button
              onClick={() => setActiveTab('client')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                activeTab === 'client'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Client Specific ({expenses.filter((e) => !!e.client_id).length})
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                activeTab === 'company'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              XYVEX Overhead ({expenses.filter((e) => !e.client_id).length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, vendor..."
                className="glass-input pl-8 text-xs py-1.5"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input bg-zinc-900 text-xs py-1.5 w-44"
            >
              <option value="all">All Categories</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Video">Video</option>
              <option value="Poster">Poster / Design</option>
              <option value="Photography">Photography</option>
              <option value="Influencer">Influencer</option>
              <option value="Hosting">Hosting</option>
              <option value="Software">Software</option>
              <option value="Office">Office & Utilities</option>
              <option value="Internet">Internet</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="glass-panel p-0 overflow-hidden">
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Nature</th>
                  <th>Category</th>
                  <th>Client / Entity</th>
                  <th>Description</th>
                  <th>Vendor / Tool</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-zinc-500 text-xs">
                      No expense records found
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => {
                    const client = expense.client_id
                      ? clients.find((c) => c.id === expense.client_id)
                      : null;

                    return (
                      <tr key={expense.id} className="hover:bg-white/[0.03]">
                        <td className="font-mono text-zinc-300 text-xs">
                          {formatDate(expense.expense_date)}
                        </td>
                        <td>
                          {expense.client_id ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.07] text-zinc-300 border border-white/10">
                              Client
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                              Company
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 text-zinc-200 border border-white/10">
                            {expense.category}
                          </span>
                        </td>
                        <td>
                          {client ? (
                            <Link
                              href={`/clients/${client.id}`}
                              className="font-medium text-white hover:underline text-xs"
                            >
                              {client.company_name}
                            </Link>
                          ) : (
                            <span className="text-zinc-400 text-xs font-mono">XYVEX Agency</span>
                          )}
                        </td>
                        <td>
                          <div className="max-w-xs">
                            <p className="text-xs text-white truncate">{expense.description}</p>
                            {expense.campaign && (
                              <p className="text-[10px] text-zinc-400 truncate">
                                Campaign: {expense.campaign}
                              </p>
                            )}
                            {expense.hosting_plan && (
                              <p className="text-[10px] text-zinc-400 truncate">
                                Plan: {expense.hosting_plan}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-xs text-zinc-300">{expense.vendor || '—'}</span>
                        </td>
                        <td className="font-mono text-rose-400 font-bold text-sm">
                          - {formatCurrency(expense.amount)}
                        </td>
                        <td>
                          <span className="text-xs text-zinc-400">{expense.payment_method}</span>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: expense.id,
                                desc: expense.description,
                                amount: expense.amount,
                              })
                            }
                            className="p-1.5 rounded-md hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
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

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Expense Record?"
        message={`Delete expense "${deleteTarget?.desc}" for ${formatCurrency(
          deleteTarget?.amount
        )}? Net profit will be updated.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
