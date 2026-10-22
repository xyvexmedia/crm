'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  Plus,
  Calculator,
  Calendar,
  Check,
  User,
  Briefcase,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ProjectStatus } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { AddClientModal } from '@/components/modals/AddClientModal';

export default function NewProjectPage() {
  const router = useRouter();
  const { clients, addProject, addPayment } = useData();

  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [name, setName] = useState('');
  const [service, setService] = useState('Meta Ads Management (FB/Insta)');
  const [projectType, setProjectType] = useState<'one-time' | 'retainer'>('one-time');
  const [budget, setBudget] = useState('');
  const [advance, setAdvance] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Salih (Lead)');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [notes, setNotes] = useState('');

  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedClient = clients.find((c) => c.id === clientId);
  const clientInitials = (selectedClient?.company_name || 'AB').slice(0, 2).toUpperCase();

  const numBudget = Number(budget) || 0;
  const numAdvance = Number(advance) || 0;
  const pendingCalculated = Math.max(0, numBudget - numAdvance);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!clientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullServiceName =
        projectType === 'retainer' && !service.toLowerCase().includes('retainer')
          ? `${service} (Monthly Retainer)`
          : service;

      const proj = await addProject({
        client_id: clientId,
        name: name.trim(),
        service: fullServiceName,
        budget: numBudget,
        start_date: startDate,
        end_date: endDate || undefined,
        assigned_to: assignedTo.trim(),
        status,
        notes: notes.trim(),
      });

      // Automatically log advance payment if provided
      if (numAdvance > 0) {
        try {
          await addPayment({
            client_id: clientId,
            project_id: proj.id,
            amount: numAdvance,
            payment_type: 'advance',
            payment_method: 'UPI',
            payment_date: startDate,
            notes: 'Advance Payment',
          });
        } catch (pmtErr) {
          console.error('Failed to auto-log advance payment', pmtErr);
        }
      }

      router.push(`/projects/${proj.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {/* ======================================================== */}
      {/* 1. MOBILE CREATE PROJECT VIEW (Strictly matching Mockup Screen 2) */}
      {/* ======================================================== */}
      <div className="block sm:hidden space-y-4 pb-12">
        {/* Header: Back button + Title + Subtitle */}
        <div className="flex items-center gap-3 pt-1">
          <Link
            href="/projects"
            className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Create Project</h1>
            <p className="text-[11px] text-zinc-400">Add a new client project</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Client Information */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3 shadow-md">
            <h2 className="text-xs font-bold text-white tracking-tight">
              1. Client Information
            </h2>
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-300 font-medium">Select Client *</label>
              <button
                type="button"
                onClick={() => setAddClientModalOpen(true)}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition"
              >
                + Add New Client
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7f0d2d] via-[#5c081e] to-[#3b0311] border border-rose-500/20 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {clientInitials}
              </div>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="flex-1 bg-[#16151c] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-rose-500/50"
              >
                <option value="" disabled>Choose client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Project Details */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-md">
            <h2 className="text-xs font-bold text-white tracking-tight">
              2. Project Details
            </h2>

            <div>
              <label className="block text-xs text-zinc-300 mb-1 font-medium">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Growth Campaign"
                required
                className="w-full bg-[#16151c] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-300 mb-1 font-medium">
                Service *
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-[#16151c] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-rose-500/50"
              >
                <option value="Meta Ads Management (FB/Insta)">Meta Ads Management (FB/Insta)</option>
                <option value="Google Ads Campaign">Google Ads Campaign</option>
                <option value="SEO Optimization">SEO Optimization</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Branding & Design">Branding & Design</option>
                <option value="Website Development">Website Development</option>
                <option value="Video Production">Video Production</option>
                <option value="CRM & Automation">CRM & Automation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-300 mb-1.5 font-medium">
                Project Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProjectType('one-time')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    projectType === 'one-time'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-[#16151c] border-white/10 text-zinc-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${projectType === 'one-time' ? 'bg-rose-500' : 'bg-transparent'}`} />
                  <span>One-time Project</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectType('retainer')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    projectType === 'retainer'
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-[#16151c] border-white/10 text-zinc-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${projectType === 'retainer' ? 'bg-rose-500' : 'bg-transparent'}`} />
                  <span>Monthly Retainer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Budget & Timeline */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-3.5 shadow-md">
            <h2 className="text-xs font-bold text-white tracking-tight">
              3. Budget & Timeline
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">
                  Total Budget (₹) *
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 30000"
                  required
                  min="0"
                  className="w-full bg-[#16151c] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">
                  Advance Received (₹)
                </label>
                <input
                  type="number"
                  value={advance}
                  onChange={(e) => setAdvance(e.target.value)}
                  placeholder="e.g. 15000"
                  min="0"
                  className="w-full bg-[#16151c] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Auto Calculated Pending Amount Card */}
              <div className="bg-[#16151c] border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
                <span className="text-[10px] text-zinc-400 font-medium">Pending Amount</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {formatCurrency(pendingCalculated)}
                  </span>
                  <div className="w-6 h-6 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-medium">
                  Due Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#16151c] border border-white/10 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes (Optional) */}
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-4 space-y-2 shadow-md">
            <h2 className="text-xs font-bold text-white tracking-tight">
              4. Notes (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Project goals, deliverables, special notes..."
              rows={3}
              className="w-full bg-[#16151c] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="py-3 px-5 rounded-xl bg-white/[0.08] text-zinc-300 text-xs font-semibold hover:bg-white/[0.12] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold shadow-lg shadow-rose-950/40 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : '+ Create Project'}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP / LAPTOP CREATE PROJECT VIEW (100% UNCHANGED) */}
      {/* ======================================================== */}
      <div className="hidden sm:block max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <Link
            href="/projects"
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Create New Project</h1>
            <p className="text-xs text-zinc-400">Define scope, agreed budget, timeline, and lead assignee</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Select Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="glass-input bg-zinc-900"
              >
                <option value="" disabled>Choose client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Project Name / Campaign Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Meta Ads Scale Up"
                required
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Service Type</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="glass-input bg-zinc-900"
              >
                <option value="Meta Ads Management">Meta Ads Management</option>
                <option value="Google Ads Campaign">Google Ads Campaign</option>
                <option value="SEO Optimization">SEO Optimization</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Branding & Design">Branding & Design</option>
                <option value="Website Development">Website Development</option>
                <option value="Video Production">Video Production</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Total Project Budget (₹) *</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                required
                min="0"
                className="glass-input font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="glass-input font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Target End / Deadline Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Assigned Lead / Owner</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Salih (Lead)"
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="glass-input bg-zinc-900 capitalize"
              >
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Scope, Deliverables & Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agreed monthly ad spend target, creative deliverables, reporting cadence..."
                rows={4}
                className="glass-input resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Link href="/projects" className="glass-button-secondary py-2 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary py-2 px-5 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>

      <AddClientModal
        isOpen={addClientModalOpen}
        onClose={() => setAddClientModalOpen(false)}
      />
    </AppLayout>
  );
}
