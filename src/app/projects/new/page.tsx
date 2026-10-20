'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ProjectStatus } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const { clients, addProject } = useData();

  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [name, setName] = useState('');
  const [service, setService] = useState('Meta Ads Management');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Salih (Lead)');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const proj = await addProject({
        client_id: clientId,
        name: name.trim(),
        service,
        budget: Number(budget) || 0,
        start_date: startDate,
        end_date: endDate || undefined,
        assigned_to: assignedTo.trim(),
        status,
        notes: notes.trim(),
      });
      router.push(`/projects/${proj.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
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

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Project Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Scale Campaign"
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Agency Service</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="glass-input bg-zinc-900"
              >
                <option value="Meta Ads Management">Meta Ads Management</option>
                <option value="Google Ads Management">Google Ads Management</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Creative Design & Video">Creative Design & Video</option>
                <option value="SEO & Web Development">SEO & Web Development</option>
                <option value="Growth Retainer">Growth Retainer</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Total Project Budget (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 35000"
                className="glass-input font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Project Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="glass-input bg-zinc-900"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">End Date / Deadline</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="glass-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Assigned Lead / Team Member</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Salih / Media Buyer name"
                className="glass-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Scope & Deliverables Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Target ROAS, weekly posts schedule, reporting cadence..."
                className="glass-input resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link href="/projects" className="glass-button-secondary py-2 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary py-2 px-5"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
