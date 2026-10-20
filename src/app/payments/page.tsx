'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Plus,
  Clock,
  Trash2,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

export default function PaymentsPage() {
  const { payments, clients, projects, metrics, deletePayment } = useData();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; amount: number } | null>(null);

  const filteredPayments = payments
    .filter((p) => {
      const client = clients.find((c) => c.id === p.client_id);
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        client?.company_name.toLowerCase().includes(q) ||
        p.payment_type.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (methodFilter !== 'all' && p.payment_method !== methodFilter) return false;
      if (typeFilter !== 'all' && p.payment_type !== typeFilter) return false;
      return true;
    })
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deletePayment(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header (Section 35) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Financial Collections
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
              Payment Management
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Advance payments, installments, and final client settlements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/payments/pending"
              className="glass-button-secondary text-xs py-2 px-3.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Receivables</span>
            </Link>

            <button
              onClick={() => setAddPaymentOpen(true)}
              className="glass-button-primary text-xs py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client or reference..."
              className="glass-input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="glass-input bg-zinc-900 text-xs py-1.5 w-36"
            >
              <option value="all">All Types</option>
              <option value="advance">Advance</option>
              <option value="partial">Partial</option>
              <option value="final">Final Settlement</option>
              <option value="full">Full Payment</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="glass-input bg-zinc-900 text-xs py-1.5 w-36"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="glass-panel p-0 overflow-hidden">
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Client</th>
                  <th>Project / Retainer</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-zinc-500 text-xs">
                      No payments found matching filters
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const client = clients.find((c) => c.id === payment.client_id);
                    const project = projects.find((p) => p.id === payment.project_id);

                    return (
                      <tr key={payment.id} className="hover:bg-white/[0.03]">
                        <td className="font-mono text-zinc-400 text-xs">
                          #{payment.id.slice(-6)}
                        </td>
                        <td>
                          {client ? (
                            <Link
                              href={`/clients/${client.id}`}
                              className="font-semibold text-white hover:underline text-xs"
                            >
                              {client.company_name}
                            </Link>
                          ) : (
                            <span className="text-zinc-500">Unknown</span>
                          )}
                        </td>
                        <td>
                          <span className="text-xs text-zinc-300">
                            {project ? project.name : 'General Retainer'}
                          </span>
                        </td>
                        <td className="font-mono text-emerald-400 font-bold text-sm">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="font-mono text-zinc-300 text-xs">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-zinc-300">
                            {payment.payment_type}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-zinc-300">{payment.payment_method}</span>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Cleared
                          </span>
                        </td>
                        <td className="text-zinc-400 text-xs max-w-xs truncate">
                          {payment.notes || '—'}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() =>
                              setDeleteTarget({ id: payment.id, amount: payment.amount })
                            }
                            className="p-1.5 rounded-md hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition"
                            title="Delete Payment"
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
