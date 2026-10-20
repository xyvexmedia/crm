'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { projects, clients, payments, expenses, updateProject } = useData();

  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

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

  const projectPayments = payments.filter((p) => p.project_id === project.id || (p.client_id === project.client_id && !p.project_id));
  const projectExpenses = expenses.filter((e) => e.project_id === project.id || (e.client_id === project.client_id && !e.project_id));

  const totalCollected = projectPayments.reduce((s, p) => s + Number(p.amount), 0);
  const totalSpent = projectExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const projectProfit = totalCollected - totalSpent;
  const pendingAmount = Math.max(0, project.budget - totalCollected);

  return (
    <AppLayout>
      <div className="space-y-6">
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
    </AppLayout>
  );
}
