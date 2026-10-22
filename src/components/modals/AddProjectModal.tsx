'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Briefcase,
  Calendar,
  Layers,
  IndianRupee,
  FileText,
  User,
} from 'lucide-react';
import { useData } from '@/context/data-context';
import { ProjectStatus } from '@/types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  onSuccess?: (projectId: string) => void;
}

const SERVICES = [
  'Meta Ads',
  'Google Ads',
  'SEO',
  'Social Media',
  'Website',
  'Poster Design',
  'Video Production',
  'Design',
  'CRM',
  'Other',
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  onSuccess,
}) => {
  const { clients, addProject, addPayment } = useData();

  const [clientId, setClientId] = useState(defaultClientId || (clients[0]?.id || ''));
  const [name, setName] = useState('');
  const [service, setService] = useState('Google Ads');
  const [projectType, setProjectType] = useState<'one-time' | 'retainer'>('one-time');
  const [budget, setBudget] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Salih (Lead)');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultClientId) {
      setClientId(defaultClientId);
    } else if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [defaultClientId, clients, clientId]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project Name is required.');
      return;
    }
    if (!clientId) {
      setError('Please select a client.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullServiceName =
        projectType === 'retainer' && !service.toLowerCase().includes('retainer')
          ? `${service} (Monthly Retainer)`
          : service;

      const budgetNum = Number(budget) || 0;
      const advanceNum = Number(advancePayment) || 0;

      const proj = await addProject({
        client_id: clientId,
        name: name.trim(),
        service: fullServiceName,
        budget: budgetNum,
        start_date: startDate,
        end_date: endDate || undefined,
        assigned_to: assignedTo.trim() || 'Salih (Lead)',
        status,
        notes: notes.trim() || undefined,
      });

      // Record advance payment if entered
      if (advanceNum > 0) {
        await addPayment({
          client_id: clientId,
          project_id: proj.id,
          amount: advanceNum,
          payment_type: 'advance',
          payment_method: 'UPI',
          payment_date: startDate,
          reference: 'Project Initial Advance',
          notes: 'Advance Payment on Project Setup',
        });
      }

      // Reset form
      setName('');
      setBudget('');
      setAdvancePayment('');
      setEndDate('');
      setNotes('');

      onClose();
      if (onSuccess) onSuccess(proj.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#111116] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[86dvh] sm:h-auto sm:max-h-[88vh] flex flex-col min-h-0 overflow-hidden animate-fade">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#991b1b] to-[#e11d48] border border-rose-500/30 flex items-center justify-center text-white shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Add New Project
              </h2>
              <p className="text-[11px] text-zinc-400">
                {selectedClient ? selectedClient.company_name : 'Assign deliverables & budget'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3.5 text-xs touch-pan-y">
            {/* Client selector (if not fixed) */}
            {!defaultClientId ? (
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Client <span className="text-[#e11d48]">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="glass-input !py-2.5 text-xs bg-[#1a1a1e] text-white w-full"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Project Name* */}
            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">
                Project Name <span className="text-[#e11d48]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google Ads Q4 Campaign, Rebranding"
                className="glass-input !py-2.5 text-xs text-white placeholder:text-zinc-500 w-full"
              />
            </div>

            {/* Service & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Service Category
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="glass-input !py-2.5 text-xs bg-[#1a1a1e] text-white w-full"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Engagement Model
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as any)}
                  className="glass-input !py-2.5 text-xs bg-[#1a1a1e] text-white w-full"
                >
                  <option value="one-time">One-time Project</option>
                  <option value="retainer">Monthly Retainer</option>
                </select>
              </div>
            </div>

            {/* Budget & Advance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Project Budget (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="text-zinc-500 font-bold absolute left-3 pointer-events-none">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="15000"
                    className="glass-input !pl-7 !py-2.5 text-xs font-mono text-white placeholder:text-zinc-500 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Advance Payment (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="text-zinc-500 font-bold absolute left-3 pointer-events-none">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    placeholder="5000"
                    className="glass-input !pl-7 !py-2.5 text-xs font-mono text-emerald-400 placeholder:text-zinc-500 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Start Date & Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input !py-2.5 text-xs text-white w-full"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input !py-2.5 text-xs text-white w-full"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="glass-input !py-2.5 text-xs bg-[#1a1a1e] text-white w-full capitalize"
              >
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">
                Project Notes & Scope
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key deliverables, campaign targets, asset links..."
                className="glass-input !py-2.5 text-xs text-white placeholder:text-zinc-500 w-full"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#141419] shrink-0 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white text-xs font-semibold transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
