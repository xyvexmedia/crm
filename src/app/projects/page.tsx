'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Search,
  Plus,
  ArrowUpRight,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ProjectStatus } from '@/types';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

type FilterStatus = 'all' | ProjectStatus;

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, clients, deleteProject } = useData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const filteredProjects = projects.filter((p) => {
    const client = clients.find((c) => c.id === p.client_id);
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.service.toLowerCase().includes(q) ||
      client?.company_name.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filter !== 'all' && p.status !== filter) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header (Section 26) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Operations & Deliverables
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
              Client Projects
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Active campaigns, retainer services, and budget commitments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/projects/new" className="glass-button-primary text-xs py-2 px-4">
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
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
              placeholder="Search by project, service, or client..."
              className="glass-input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 overflow-x-auto">
            {(['all', 'active', 'planning', 'on_hold', 'completed'] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize whitespace-nowrap transition-all ${
                  filter === tab
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid / Table */}
        <div className="glass-panel p-0 overflow-hidden">
          <div className="glass-table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Budget</th>
                  <th>Timeline</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-zinc-500">
                      No projects match the current criteria
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const client = clients.find((c) => c.id === project.client_id);

                    return (
                      <tr key={project.id} className="hover:bg-white/[0.03]">
                        <td>
                          <div>
                            <Link
                              href={`/projects/${project.id}`}
                              className="font-semibold text-white hover:underline flex items-center gap-1"
                            >
                              {project.name}
                            </Link>
                            {project.notes && (
                              <span className="text-[11px] text-zinc-400 block max-w-xs truncate">
                                {project.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {client ? (
                            <Link
                              href={`/clients/${client.id}`}
                              className="text-xs text-zinc-300 hover:text-white hover:underline"
                            >
                              {client.company_name}
                            </Link>
                          ) : (
                            <span className="text-zinc-500 text-xs">Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span className="text-xs text-zinc-300">{project.service}</span>
                        </td>
                        <td className="font-mono text-zinc-200 font-semibold">
                          {formatCurrency(project.budget)}
                        </td>
                        <td>
                          <span className="text-xs text-zinc-400 font-mono">
                            {formatDate(project.start_date)}
                            {project.end_date ? ` → ${formatDate(project.end_date)}` : ''}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-zinc-300 flex items-center gap-1">
                            <User className="w-3 h-3 text-zinc-500" />
                            {project.assigned_to || 'Salih (Lead)'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              project.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : project.status === 'planning'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : project.status === 'completed'
                                ? 'bg-zinc-700/30 text-zinc-400 border-zinc-700'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            }`}
                          >
                            {project.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/projects/${project.id}`}
                              className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition"
                              title="View Project"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                              className="p-1.5 rounded-md hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition"
                              title="Delete Project"
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
        title={`Delete ${deleteTarget?.name}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
}
