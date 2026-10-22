'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  Calendar,
  User,
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Pencil,
  Plus,
  MoreVertical,
  Check,
  ChevronRight,
  ArrowUp,
  FileText,
  Briefcase,
  Layers,
  X,
  Trash2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { projects, clients, payments, expenses, updateProject, deleteProject } = useData();

  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'overview' | 'tasks' | 'payments' | 'notes'>('overview');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'received' | 'pending'>('all');
  const [showMoreActions, setShowMoreActions] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const client = project ? clients.find((c) => c.id === project.client_id) : null;

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-zinc-400">
          Project not found.
          <Link href="/projects" className="glass-button-primary mt-4 text-xs py-2 px-4 block w-max mx-auto">
            Back to Projects
          </Link>
        </div>
      </AppLayout>
    );
  }

  const projectPayments = payments.filter(
    (p) => p.project_id === project.id || (p.client_id === project.client_id && !p.project_id)
  );
  const projectExpenses = expenses.filter(
    (e) => e.project_id === project.id || (e.client_id === project.client_id && !e.project_id)
  );

  const totalCollected = projectPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalSpent = projectExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const projectProfit = totalCollected - totalSpent;
  const pendingAmount = Math.max(0, project.budget - totalCollected);
  const percentPaid = project.budget > 0 ? Math.min(100, Math.round((totalCollected / project.budget) * 100)) : 0;

  const initials = (client?.company_name || project.name || 'PR').slice(0, 2).toUpperCase();

  const handleDelete = async () => {
    await deleteProject(project.id);
    router.push('/projects');
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AppLayout>
      {/* ======================================================== */}
      {/* 1. MOBILE PROJECT DETAILS VIEW (Strictly matching Mockup Screen 3 & 4) */}
      {/* ======================================================== */}
      <div className="block sm:hidden space-y-4 pb-8">
        {/* Top Header: Back button + Project Details Title + More menu */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/projects"
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition"
            aria-label="Back to Projects"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </Link>
          <h1 className="text-sm font-bold text-white tracking-tight">
            Project Details
          </h1>
          <button
            type="button"
            onClick={() => setShowMoreActions(true)}
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition"
            aria-label="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Project Header Card: Avatar + Name + Client + Status + Meta */}
        <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7f0d2d] via-[#5c081e] to-[#3b0311] border border-rose-500/25 shadow-md flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5">
                <h2 className="text-base font-bold text-white tracking-tight truncate">
                  {project.name}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 flex items-center gap-0.5 ${
                    project.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                      : project.status === 'planning'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                      : project.status === 'on_hold'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                      : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/40'
                  }`}
                >
                  {project.status === 'on_hold' ? 'On Hold' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  <ChevronRight className="w-2.5 h-2.5 opacity-70" />
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {client?.company_name || 'Unassigned Client'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/[0.04]">
            <span className="flex items-center gap-1.5 truncate">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{project.service}</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0 ml-2 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formatShortDate(project.end_date) || 'No due date'}</span>
            </span>
          </div>
        </div>

        {/* 3 Financial Metric Cards Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#121217] border border-white/[0.08] rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-white font-mono truncate">
              {formatCurrency(project.budget)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Total Budget</p>
          </div>
          <div className="bg-emerald-500/[0.04] border border-emerald-500/25 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-emerald-400 font-mono truncate">
              {formatCurrency(totalCollected)}
            </p>
            <p className="text-[10px] text-emerald-400/90 mt-0.5">Paid</p>
          </div>
          <div className="bg-amber-500/[0.04] border border-amber-500/25 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-amber-400 font-mono truncate">
              {formatCurrency(pendingAmount)}
            </p>
            <p className="text-[10px] text-amber-400/90 mt-0.5">Pending</p>
          </div>
        </div>

        {/* Payment Progress Bar */}
        <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-3.5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium text-[11px]">Payment Progress</span>
            <span className="font-bold text-zinc-200 text-xs font-mono">{percentPaid}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#e11d48] to-[#be123c] transition-all duration-500"
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>

        {/* 4 Action Buttons Row: Edit | Record Payment | View Client | More */}
        <div className="grid grid-cols-4 gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#141419] border border-white/[0.08] active:scale-95 transition text-zinc-300 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400">Edit</span>
          </Link>

          <button
            type="button"
            onClick={() => setAddPaymentOpen(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#141419] border border-white/[0.08] active:scale-95 transition text-zinc-300 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400">Record Payment</span>
          </button>

          {client ? (
            <Link
              href={`/clients/${client.id}`}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#141419] border border-white/[0.08] active:scale-95 transition text-zinc-300 hover:text-white"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-[10px] font-medium text-zinc-400">View Client</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#141419] border border-white/[0.08] opacity-50 text-zinc-400"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-[10px] font-medium text-zinc-400">View Client</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowMoreActions(true)}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-[#141419] border border-white/[0.08] active:scale-95 transition text-zinc-300 hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <MoreVertical className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400">More</span>
          </button>
        </div>

        {/* Sub-tabs Row: Overview | Tasks | Payments | Notes */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141418] rounded-full border border-white/5 overflow-x-auto no-scrollbar">
          {(['overview', 'tasks', 'payments', 'notes'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium capitalize whitespace-nowrap transition ${
                mobileTab === t
                  ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {mobileTab === 'overview' && (
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Project Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-zinc-500" /> Client
                </span>
                <span className="font-medium text-white">{client?.company_name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-500" /> Service
                </span>
                <span className="font-medium text-white truncate max-w-[200px]">{project.service}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-zinc-500" /> Type
                </span>
                <span className="font-medium text-white">
                  {project.service.toLowerCase().includes('retainer') ? 'Monthly Retainer' : 'One-time Project'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Start Date
                </span>
                <span className="font-mono text-white">{formatShortDate(project.start_date)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Due Date
                </span>
                <span className="font-mono text-white">{formatShortDate(project.end_date) || 'Ongoing'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" /> Status
                </span>
                <span className="capitalize text-emerald-400 font-semibold">{project.status.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-zinc-500" /> Assigned To
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-rose-900 border border-rose-500/30 text-[10px] text-white flex items-center justify-center font-bold">
                    S
                  </div>
                  <span className="text-white font-medium">{project.assigned_to || 'Salih'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Payments (Screen 4: Project Payments) */}
        {mobileTab === 'payments' && (
          <div className="space-y-3">
            {/* Filter pills: All, Received, Pending */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {(['all', 'received', 'pending'] as const).map((pf) => (
                  <button
                    key={pf}
                    type="button"
                    onClick={() => setPaymentFilter(pf)}
                    className={`py-1 px-3 rounded-full text-xs font-medium capitalize transition ${
                      paymentFilter === pf
                        ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold'
                        : 'bg-[#141419] border border-white/10 text-zinc-400'
                    }`}
                  >
                    {pf}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAddPaymentOpen(true)}
                className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            {projectPayments.length === 0 && paymentFilter !== 'pending' ? (
              <div className="bg-[#121217] border border-white/[0.08] rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500">No payments recorded yet</p>
                <button
                  type="button"
                  onClick={() => setAddPaymentOpen(true)}
                  className="mt-2 text-xs text-rose-400 font-semibold"
                >
                  + Record Payment
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Received payments */}
                {paymentFilter !== 'pending' &&
                  projectPayments.map((pmt) => (
                    <div
                      key={pmt.id}
                      className="bg-[#121217] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <ArrowUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white font-mono">
                            {formatCurrency(pmt.amount)}
                          </p>
                          <p className="text-[10px] text-zinc-400 capitalize">
                            {pmt.payment_type ? `${pmt.payment_type} Payment` : 'Payment'}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {formatShortDate(pmt.payment_date)}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Received
                      </span>
                    </div>
                  ))}

                {/* Pending balance representation */}
                {paymentFilter !== 'received' && pendingAmount > 0 && (
                  <div className="bg-[#121217] border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <ArrowUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white font-mono">
                          {formatCurrency(pendingAmount)}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Pending Balance
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {formatShortDate(project.end_date) || 'On Completion'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pending
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Tasks */}
        {mobileTab === 'tasks' && (
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400">All campaign deliverables are on schedule</p>
            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Milestone
            </span>
          </div>
        )}

        {/* Tab 4: Notes */}
        {mobileTab === 'notes' && (
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-white">Project Notes & Objectives</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {project.notes || 'No specific notes recorded for this campaign.'}
            </p>
          </div>
        )}

        {/* More Options Modal Sheet */}
        {showMoreActions && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-sm bg-[#0e0e12] border border-white/10 rounded-t-3xl sm:rounded-2xl p-4 pb-safe pb-5 shadow-2xl space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="text-xs font-bold text-white truncate">{project.name}</h4>
                <button
                  type="button"
                  onClick={() => setShowMoreActions(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMoreActions(false);
                  setAddExpenseOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-left text-xs text-white flex items-center justify-between"
              >
                <span>Log Project Expense</span>
                <Receipt className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMoreActions(false);
                  setDeleteConfirmOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-left text-xs text-rose-400 flex items-center justify-between"
              >
                <span>Delete Project</span>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP / LAPTOP PROJECT DETAILS VIEW (100% UNCHANGED) */}
      {/* ======================================================== */}
      <div className="hidden sm:block space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {project.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {project.service} • Client:{' '}
                {client ? (
                  <Link href={`/clients/${client.id}`} className="text-white hover:underline">
                    {client.company_name}
                  </Link>
                ) : (
                  'Unassigned'
                )}
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
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* 4 Financial KPIs for Project */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Project Budget</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(project.budget)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">Agreed deliverables contract</p>
          </div>

          <div className="glass-panel p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Total Collected</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(totalCollected)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">Received from client</p>
          </div>

          <div className="glass-panel p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Pending Balance</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {formatCurrency(pendingAmount)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">Owed before completion</p>
          </div>

          <div className="glass-panel p-4 border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.03]">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">Project Net Profit</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(projectProfit)}
            </p>
            <p className="text-[11px] text-zinc-500 mt-2">After {formatCurrency(totalSpent)} spent</p>
          </div>
        </div>

        {/* Scope and Deliverables Notes */}
        <div className="glass-panel p-5 text-xs space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Project Overview & Assignment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-zinc-300">
            <div>
              <span className="text-zinc-500 block mb-0.5">Assigned Lead</span>
              <span className="font-medium text-white">{project.assigned_to || 'Salih'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Start Date</span>
              <span className="font-mono">{formatDate(project.start_date)}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Target Completion</span>
              <span className="font-mono">{formatDate(project.end_date) || 'Ongoing Retainer'}</span>
            </div>
          </div>
          {project.notes && (
            <div className="pt-3 border-t border-white/10">
              <span className="text-zinc-500 block mb-1">Notes & Objectives:</span>
              <p className="text-zinc-300 leading-relaxed">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Linked Payments Table */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Project Payments
            </h2>
            <span className="text-xs font-mono font-medium text-emerald-400">
              Total: {formatCurrency(totalCollected)}
            </span>
          </div>

          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {projectPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-zinc-500 text-xs">
                      No payments associated with this project yet
                    </td>
                  </tr>
                ) : (
                  projectPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="text-zinc-300 font-mono text-xs">{formatDate(p.payment_date)}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-zinc-300">
                          {p.payment_type}
                        </span>
                      </td>
                      <td className="font-mono text-emerald-400 font-bold">{formatCurrency(p.amount)}</td>
                      <td className="text-zinc-300 text-xs">{p.payment_method}</td>
                      <td className="text-zinc-400 text-xs max-w-xs truncate">{p.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Linked Expenses Table */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Project Expenses & Disbursements
            </h2>
            <span className="text-xs font-mono font-medium text-zinc-300">
              Total Spend: {formatCurrency(totalSpent)}
            </span>
          </div>

          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Vendor</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {projectExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-zinc-500 text-xs">
                      No expenses logged for this project
                    </td>
                  </tr>
                ) : (
                  projectExpenses.map((e) => (
                    <tr key={e.id}>
                      <td className="text-zinc-300 font-mono text-xs">{formatDate(e.expense_date)}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/10">
                          {e.category}
                        </span>
                      </td>
                      <td className="font-mono text-zinc-200 font-semibold">{formatCurrency(e.amount)}</td>
                      <td className="text-zinc-300 text-xs">{e.vendor || '—'}</td>
                      <td className="text-zinc-400 text-xs max-w-xs truncate">{e.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddPaymentModal
        isOpen={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        defaultClientId={project.client_id}
      />

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        defaultClientId={project.client_id}
        defaultType="client"
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirmOpen}
        title={`Delete project "${project.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </AppLayout>
  );
}
