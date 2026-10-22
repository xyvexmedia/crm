'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Plus,
  ArrowUpRight,
  Trash2,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { InvoiceStatus } from '@/types';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, clients, deleteInvoice } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; number: string } | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const client = clients.find((c) => c.id === inv.client_id);
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      client?.company_name.toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteInvoice(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header (Section 38) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Billing & Documentation
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
              Client Invoices
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Issue professional GST invoices, track payment status, and export agency PDFs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/invoices/new" className="glass-button-primary text-xs py-2 px-4">
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Link>
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
              placeholder="Search invoice number or client..."
              className="glass-input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 overflow-x-auto">
            {['all', 'draft', 'sent', 'partially_paid', 'paid', 'overdue'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize whitespace-nowrap transition ${
                  statusFilter === tab
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="glass-panel p-0 overflow-hidden">
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Client</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Tax</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-500 text-xs">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const client = clients.find((c) => c.id === inv.client_id);

                    return (
                      <tr key={inv.id} className="hover:bg-white/[0.03]">
                        <td>
                          <Link
                            href={`/invoices/detail?id=${inv.id}`}
                            className="font-mono font-bold text-white hover:underline flex items-center gap-1.5 text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td>
                          {client ? (
                            <Link
                              href={`/clients/detail?id=${client.id}`}
                              className="font-medium text-zinc-200 hover:text-white hover:underline text-xs"
                            >
                              {client.company_name}
                            </Link>
                          ) : (
                            <span className="text-zinc-500 text-xs">Client</span>
                          )}
                        </td>
                        <td className="font-mono text-zinc-300 text-xs">
                          {formatDate(inv.invoice_date)}
                        </td>
                        <td className="font-mono text-zinc-300 text-xs">
                          {formatDate(inv.due_date)}
                        </td>
                        <td className="font-mono text-zinc-400 text-xs">
                          {formatCurrency(inv.tax)}
                        </td>
                        <td className="font-mono text-white font-bold text-sm">
                          {formatCurrency(inv.total)}
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                              inv.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : inv.status === 'overdue'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : inv.status === 'partially_paid'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : 'bg-white/10 text-zinc-300 border-white/10'
                            }`}
                          >
                            {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                            {inv.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {inv.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/invoices/detail?id=${inv.id}`}
                              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition"
                              title="View & Download PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() =>
                                setDeleteTarget({ id: inv.id, number: inv.invoice_number })
                              }
                              className="p-1.5 rounded-md hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete Invoice ${deleteTarget?.number}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
