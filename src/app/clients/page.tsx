'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  ChevronRight,
  SlidersHorizontal,
  Phone,
  Calendar,
  AlertCircle,
  Briefcase,
  X,
  RotateCcw,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ClientStatus } from '@/types';
import { AddClientModal } from '@/components/modals/AddClientModal';

type FilterTab = 'all' | 'active' | 'pending' | 'completed';

export default function ClientsPage() {
  const router = useRouter();
  const { clients, clientReports, projects, payments } = useData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Advanced filters in drawer
  const [serviceFilter, setServiceFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Filter clients
  const filteredReports = useMemo(() => {
    return clientReports.filter((report) => {
      const q = search.toLowerCase().trim();
      const client = report.client;
      const clientProjects = projects.filter((p) => p.client_id === client.id);

      // Search by: Client/Company Name, Contact Person, Phone, Email, Service, Project Name
      if (q) {
        const matchesName = client.company_name.toLowerCase().includes(q) || client.name.toLowerCase().includes(q);
        const matchesContact = client.contact_person ? client.contact_person.toLowerCase().includes(q) : false;
        const matchesPhone = client.phone ? client.phone.toLowerCase().includes(q) : false;
        const matchesEmail = client.email ? client.email.toLowerCase().includes(q) : false;
        const matchesService = clientProjects.some((p) => p.service.toLowerCase().includes(q));
        const matchesProject = clientProjects.some((p) => p.name.toLowerCase().includes(q));

        if (!matchesName && !matchesContact && !matchesPhone && !matchesEmail && !matchesService && !matchesProject) {
          return false;
        }
      }

      // Pill filter: All, Active, Pending, Completed
      if (filter === 'active' && client.status !== 'active') return false;
      if (filter === 'completed' && client.status !== 'completed') return false;
      if (filter === 'pending') {
        const isPending = client.status === 'pending' || report.pendingAmount > 0;
        if (!isPending) return false;
      }

      // Advanced drawer filters
      if (serviceFilter !== 'all') {
        const hasService = clientProjects.some((p) =>
          p.service.toLowerCase().includes(serviceFilter.toLowerCase())
        );
        if (!hasService) return false;
      }

      if (paymentStatusFilter === 'paid' && report.pendingAmount > 0) return false;
      if (paymentStatusFilter === 'pending' && report.pendingAmount === 0) return false;
      if (paymentStatusFilter === 'overdue' && !report.isOverdue) return false;

      return true;
    });
  }, [clientReports, search, filter, serviceFilter, paymentStatusFilter, projects]);

  const allCount = clientReports.length;
  const activeCount = clientReports.filter((r) => r.client.status === 'active').length;
  const pendingCount = clientReports.filter((r) => r.client.status === 'pending' || r.pendingAmount > 0).length;
  const completedCount = clientReports.filter((r) => r.client.status === 'completed').length;

  return (
    <AppLayout>
      <div className="space-y-4 max-w-5xl mx-auto pb-12">
        {/* ======================================================== */}
        {/* 1. PAGE HEADER: Title + Subtitle + Top-Right + Add Client */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Clients
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your clients, projects and payments
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold shadow-md active:scale-95 transition hover:opacity-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Client</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. SEARCH BAR (Full Width) + Filter Button              */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-[#121217] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 transition shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilterDrawer(true)}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition active:scale-95 shrink-0 ${
              serviceFilter !== 'all' || paymentStatusFilter !== 'all'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-[#121217] border-white/10 text-zinc-400 hover:text-white'
            }`}
            aria-label="Filter Options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 3. CLIENT FILTERS (Pill Tabs: All | Active | Pending | Completed) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold shadow-sm'
                : 'bg-[#121217] text-zinc-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === 'active'
                ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold shadow-sm'
                : 'bg-[#121217] text-zinc-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold shadow-sm'
                : 'bg-[#121217] text-zinc-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold shadow-sm'
                : 'bg-[#121217] text-zinc-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* ======================================================== */}
        {/* 4. CLIENT CARDS LIST                                    */}
        {/* ======================================================== */}
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            /* Requirement #26: Client Page Empty State */
            <div className="bg-[#121217] border border-dashed border-white/10 rounded-3xl p-10 text-center space-y-3 shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Clients Yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Add your first client to start managing projects, payments and expenses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold shadow-md active:scale-95 transition"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Add Client</span>
              </button>
            </div>
          ) : (
            filteredReports.map((report) => {
              const client = report.client;
              const clientProjects = projects.filter((p) => p.client_id === client.id);
              const primaryService = clientProjects[0]?.service || 'Meta Ads & Creative';
              const activeProjectsCount = clientProjects.filter((p) => p.status === 'active').length;
              const initials = (client.company_name || 'CL').slice(0, 2).toUpperCase();

              // Get latest payment date
              const clientPayments = payments.filter((p) => p.client_id === client.id);
              const lastPayment = clientPayments[0];

              return (
                <Link
                  key={client.id}
                  href={`/clients/detail?id=${client.id}`}
                  className="block bg-[#121217] hover:bg-[#16161c] border border-white/[0.08] hover:border-white/20 rounded-2xl p-4 transition-all active:scale-[0.99] shadow-md group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Avatar / Initials */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7f0d2d] via-[#5c081e] to-[#3b0311] border border-rose-500/25 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
                        {initials}
                      </div>

                      {/* Client Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate group-hover:text-rose-200 transition">
                            {client.company_name}
                          </h2>
                          {report.isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>

                        {/* Service Name */}
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {primaryService}
                        </p>

                        {/* Financial Breakdown (Requirement #2 Exact Format) */}
                        <div className="flex items-center gap-2 text-xs font-mono mt-2 flex-wrap">
                          <span className="text-zinc-200 font-semibold">
                            {formatCurrency(report.totalBudget)} Total Budget
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-emerald-400 font-semibold">
                            {formatCurrency(report.amountReceived)} Paid
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-amber-400 font-semibold">
                            {formatCurrency(report.pendingAmount)} Pending
                          </span>
                        </div>

                        {/* Optional Meta Row: Phone, Billing Date, Active Projects */}
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-2 flex-wrap pt-1.5 border-t border-white/[0.04]">
                          {client.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-zinc-500" />
                              {client.phone}
                            </span>
                          )}
                          {client.billing_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-500" />
                              Next Billing: {formatDate(client.billing_date)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-zinc-500" />
                            {activeProjectsCount} active {activeProjectsCount === 1 ? 'project' : 'projects'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Status Pill & Chevron */}
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${
                          client.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : client.status === 'pending' || report.pendingAmount > 0
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : client.status === 'completed'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/40'
                        }`}
                      >
                        {client.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. FILTER DRAWER (Mobile Bottom Sheet / Desktop Modal)   */}
      {/* ======================================================== */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-[#111116] border border-white/10 rounded-t-3xl sm:rounded-2xl p-5 pb-safe pb-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Filter Clients</h3>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Service Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Service Type
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="glass-input !py-2.5 text-xs bg-[#1a1a1e] text-white w-full"
              >
                <option value="all">All Services</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="SEO">SEO</option>
                <option value="Social Media">Social Media</option>
                <option value="Website">Website</option>
                <option value="Video">Video Production</option>
                <option value="Design">Design</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="glass-input !py-2.5 text-xs bg-[#1a1a1e] text-white w-full"
              >
                <option value="all">All Payments</option>
                <option value="pending">Has Pending Balance</option>
                <option value="paid">Fully Settled</option>
                <option value="overdue">Payment Overdue</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setServiceFilter('all');
                  setPaymentStatusFilter('all');
                }}
                className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white text-xs font-bold hover:opacity-95"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(id) => router.push(`/clients/detail?id=${id}`)}
      />
    </AppLayout>
  );
}
