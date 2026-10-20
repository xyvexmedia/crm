'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ClientStatus } from '@/types';
import { AddClientModal } from '@/components/modals/AddClientModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

type FilterTab = 'all' | 'active' | 'completed' | 'pending' | 'overdue';

export default function ClientsPage() {
  const router = useRouter();
  const { clients, clientReports, deleteClient, projects } = useData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Filter clients
  const filteredReports = useMemo(() => {
    return clientReports.filter((report) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        report.client.company_name.toLowerCase().includes(q) ||
        report.client.name.toLowerCase().includes(q) ||
        report.client.email?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'active') return report.client.status === 'active';
      if (filter === 'completed') return report.client.status === 'completed';
      if (filter === 'pending') return report.pendingAmount > 0;
      if (filter === 'overdue') return report.isOverdue;

      return true;
    });
  }, [clientReports, search, filter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteClient(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header (Section 17) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Client Portfolio
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
              Clients & Financial Relationships
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage client accounts, contract budgets, payment tracking, and profitability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddModalOpen(true)}
              className="glass-button-primary text-xs py-2 px-4"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company or person..."
              className="glass-input pl-9 text-xs"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 overflow-x-auto">
            {(['all', 'active', 'pending', 'overdue', 'completed'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize whitespace-nowrap transition-all ${
                  filter === tab
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Client Table (Section 18) */}
        <div className="glass-panel p-0 overflow-hidden">
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service / Project</th>
                  <th>Total Budget</th>
                  <th>Paid</th>
                  <th>Pending</th>
                  <th>Billing Date</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-zinc-600" />
                        <p className="text-sm font-medium text-zinc-300">No clients found</p>
                        <p className="text-xs text-zinc-500">
                          {search ? 'Try adjusting your search criteria' : 'Add your first client to start managing projects'}
                        </p>
                        {!search && (
                          <button
                            onClick={() => setAddModalOpen(true)}
                            className="glass-button-primary mt-2 text-xs py-1.5 px-3"
                          >
                            + Add Client
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const clientProjects = projects.filter((p) => p.client_id === report.client.id);
                    const primaryService = clientProjects[0]?.service || 'Creative Services';

                    return (
                      <tr key={report.client.id} className="hover:bg-white/[0.03]">
                        <td>
                          <div>
                            <Link
                              href={`/clients/${report.client.id}`}
                              className="font-semibold text-white hover:underline flex items-center gap-1.5"
                            >
                              {report.client.company_name}
                            </Link>
                            <span className="text-[11px] text-zinc-400">
                              {report.client.name} • {report.client.phone}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-xs text-zinc-300">{primaryService}</span>
                        </td>
                        <td className="font-mono text-zinc-300 font-medium">
                          {formatCurrency(report.totalBudget)}
                        </td>
                        <td className="font-mono text-emerald-400 font-medium">
                          {formatCurrency(report.amountReceived)}
                        </td>
                        <td className="font-mono text-white font-medium">
                          {formatCurrency(report.pendingAmount)}
                        </td>
                        <td className="text-zinc-300">
                          <span className="text-xs">{formatDate(report.client.billing_date)}</span>
                        </td>
                        <td>
                          {report.isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          ) : report.client.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-700/30 text-zinc-400 border border-zinc-700">
                              {report.client.status}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/clients/${report.client.id}`}
                              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition"
                              title="View Client Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/clients/${report.client.id}/edit`}
                              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition"
                              title="Edit Client"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  id: report.client.id,
                                  name: report.client.company_name,
                                })
                              }
                              className="p-1.5 rounded-md hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition"
                              title="Delete Client"
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

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(id) => router.push(`/clients/${id}`)}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        message="This will permanently delete this client along with their associated projects and financial records."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
