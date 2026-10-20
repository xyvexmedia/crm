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
  Layers,
  Building,
  Users,
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

  return (
    <AppLayout>
      <div className="space-y-6">
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
