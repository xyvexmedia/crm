'use client';

import React, { useState, useEffect } from 'react';
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
  SlidersHorizontal,
  ChevronRight,
  MoreVertical,
  Bell,
  X,
  Folder,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ProjectStatus, Project } from '@/types';
import { DeleteConfirmDialog } from '@/components/modals/DeleteConfirmDialog';

type FilterStatus = 'all' | ProjectStatus;

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, clients, payments, deleteProject } = useData();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedService, setSelectedService] = useState('All');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeProjectActions, setActiveProjectActions] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Body scroll locking when modals are open
  useEffect(() => {
    const isAnyModalOpen = showFiltersModal || !!activeProjectActions || !!deleteTarget;
    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showFiltersModal, activeProjectActions, deleteTarget]);

  // Project payment stats helper
  const getProjectStats = (projectId: string, clientId: string, budget: number) => {
    const pList = payments.filter(
      (p) => p.project_id === projectId || (p.client_id === clientId && !p.project_id)
    );
    const paid = pList.reduce((s, p) => s + Number(p.amount), 0);
    const pending = Math.max(0, budget - paid);
    const percent = budget > 0 ? Math.min(100, Math.round((paid / budget) * 100)) : 0;
    return { paid, pending, percent };
  };

  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const planningCount = projects.filter((p) => p.status === 'planning').length;
  const onHoldCount = projects.filter((p) => p.status === 'on_hold').length;

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
    if (selectedService !== 'All' && !p.service.toLowerCase().includes(selectedService.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProject(deleteTarget.id);
    setDeleteTarget(null);
  };

  const getAvatarStyle = (text: string) => {
    const charCode = (text || 'AB').charCodeAt(0) % 4;
    if (charCode === 0) return 'bg-[#5c081e] border-rose-500/30 text-rose-200';
    if (charCode === 1) return 'bg-emerald-950 border-emerald-500/30 text-emerald-300';
    if (charCode === 2) return 'bg-amber-950 border-amber-500/30 text-amber-300';
    return 'bg-sky-950 border-sky-500/30 text-sky-300';
  };

  const formatDue = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AppLayout>
      {/* ======================================================== */}
      {/* 1. MOBILE CLIENT PROJECTS VIEW (Strictly matching Mockup) */}
      {/* ======================================================== */}
      <div className="block sm:hidden space-y-4 pb-8">
        {/* Mobile Header: OPERATIONS & DELIVERABLES + Title + Subtitle + Notification & Profile */}
        <div className="flex items-start justify-between pt-1">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              OPERATIONS & DELIVERABLES
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Client Projects
            </h1>
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
              Active campaigns, retainer services, and budget commitments
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                <Bell className="w-4 h-4" />
              </div>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#881337] to-[#e11d48] border border-rose-500/30 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              S
            </div>
          </div>
        </div>

        {/* Full-width + Create Project Button */}
        <Link
          href="/projects/new"
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] hover:opacity-95 active:scale-[0.99] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project</span>
        </Link>

        {/* 4 Metric Summary Cards Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#131217] border border-white/[0.08] rounded-xl p-2.5 text-center">
            <p className="text-base font-bold text-white font-mono">{totalCount}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Total</p>
          </div>
          <div className="bg-emerald-500/[0.04] border border-emerald-500/25 rounded-xl p-2.5 text-center">
            <p className="text-base font-bold text-emerald-400 font-mono">{activeCount}</p>
            <p className="text-[10px] text-emerald-400/90 mt-0.5">Active</p>
          </div>
          <div className="bg-amber-500/[0.04] border border-amber-500/25 rounded-xl p-2.5 text-center">
            <p className="text-base font-bold text-amber-400 font-mono">{planningCount}</p>
            <p className="text-[10px] text-amber-400/90 mt-0.5">Planning</p>
          </div>
          <div className="bg-orange-500/[0.04] border border-orange-500/25 rounded-xl p-2.5 text-center">
            <p className="text-base font-bold text-orange-400 font-mono">{onHoldCount}</p>
            <p className="text-[10px] text-orange-400/90 mt-0.5">On Hold</p>
          </div>
        </div>

        {/* Search and Filters row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project, client, or service..."
              className="w-full bg-[#131217] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFiltersModal(true)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 active:scale-95 transition ${
              selectedService !== 'All'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-[#131217] border-white/10 text-zinc-300 hover:text-white'
            }`}
            aria-label="Open Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Status Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {(['all', 'active', 'planning', 'on_hold', 'completed'] as FilterStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-1.5 px-3.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                filter === tab
                  ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold shadow-sm'
                  : 'bg-[#131217] border border-white/[0.08] text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Projects Cards List */}
        {filteredProjects.length === 0 ? (
          /* Empty State (Screen 6) */
          <div className="bg-[#121217] border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/30">
              <Folder className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">No projects yet</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Create your first project to start managing campaigns, budgets and deliverables.
              </p>
            </div>
            <Link
              href="/projects/new"
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold shadow-md shadow-rose-950/40"
            >
              + Create Project
            </Link>

            <div className="w-full bg-[#16151c] border border-white/[0.06] rounded-xl p-3.5 text-left text-xs space-y-2 mt-2">
              <p className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                💡 Quick Tips
              </p>
              <ul className="space-y-1.5 text-zinc-400 text-[11px]">
                <li className="flex items-center gap-1.5 text-emerald-400">
                  ✓ <span className="text-zinc-400">Link projects to clients</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  ✓ <span className="text-zinc-400">Track budgets & payments</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  ✓ <span className="text-zinc-400">Manage deliverables</span>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-400">
                  ✓ <span className="text-zinc-400">Stay on top of deadlines</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => {
              const client = clients.find((c) => c.id === project.client_id);
              const { paid, pending, percent } = getProjectStats(project.id, project.client_id, project.budget);
              const initials = (client?.company_name || project.name || 'PR').slice(0, 2).toUpperCase();

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="bg-[#121217] border border-white/[0.08] hover:border-white/20 rounded-2xl p-3.5 transition active:scale-[0.99] cursor-pointer shadow-sm relative overflow-hidden"
                >
                  {/* Top row: Avatar + Name + Subtitle + Status Pill + More menu */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarStyle(client?.company_name || project.name)}`}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight truncate">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5 ${
                              project.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                : project.status === 'planning'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                : project.status === 'on_hold'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                                : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/40'
                            }`}
                          >
                            {project.status === 'on_hold'
                              ? 'On Hold'
                              : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            <ChevronRight className="w-2.5 h-2.5 opacity-70" />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProjectActions(project);
                            }}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {client?.company_name || 'Unassigned Client'}
                      </p>
                    </div>
                  </div>

                  {/* Second row: Service & Due date */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5 pt-2 border-t border-white/[0.04]">
                    <span className="flex items-center gap-1.5 truncate">
                      <Briefcase className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{project.service}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono shrink-0 ml-2">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>{formatDue(project.end_date)}</span>
                    </span>
                  </div>

                  {/* Third row: Financials summary */}
                  <div className="flex items-center justify-between text-xs mt-2 font-mono">
                    <div className="flex items-center gap-1.5 text-[11px] truncate">
                      <span className="font-bold text-white">
                        {formatCurrency(project.budget)}
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400">
                        {formatCurrency(paid)} paid
                      </span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-amber-400">
                        {formatCurrency(pending)} pending
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-zinc-300 shrink-0 ml-2">
                      {percent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1 bg-zinc-800/80 rounded-full overflow-hidden mt-2.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#e11d48] to-[#be123c] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filters Bottom Sheet / Modal (Screen 5) */}
        {showFiltersModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-md bg-[#0e0e12] border border-white/10 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <h3 className="text-sm font-bold text-white">Filters</h3>
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-5 overflow-y-auto overscroll-contain flex-1 text-xs">
                {/* Project Status */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2.5">Project Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'active', 'planning', 'on_hold', 'completed'] as FilterStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilter(st)}
                        className={`py-1.5 px-3 rounded-full text-xs font-medium capitalize transition ${
                          filter === st
                            ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold'
                            : 'bg-[#18181f] border border-white/10 text-zinc-300'
                        }`}
                      >
                        {st === 'all' ? 'All' : st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-2.5">Service Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'All',
                      'Meta Ads',
                      'Google Ads',
                      'SEO',
                      'Social Media',
                      'Design',
                      'Website',
                      'Video Production',
                      'Other',
                    ].map((srv) => {
                      const isSelected = selectedService === srv;
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => setSelectedService(srv)}
                          className={`py-1.5 px-3 rounded-full text-xs font-medium transition ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white font-semibold'
                              : 'bg-[#18181f] border border-white/10 text-zinc-300'
                          }`}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-white/10 shrink-0 bg-[#0e0e12] flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                    setSelectedService('All');
                    setShowFiltersModal(false);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-white/[0.08] text-white text-xs font-semibold hover:bg-white/[0.12] transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold hover:opacity-95 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Sheet for Project */}
        {activeProjectActions && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-sm bg-[#0e0e12] border border-white/10 rounded-t-3xl sm:rounded-2xl p-4 shadow-2xl space-y-2">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="text-xs font-bold text-white truncate">{activeProjectActions.name}</h4>
                <button
                  type="button"
                  onClick={() => setActiveProjectActions(null)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  router.push(`/projects/${activeProjectActions.id}`);
                  setActiveProjectActions(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-left text-xs text-white flex items-center justify-between"
              >
                <span>View Project Details</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget({ id: activeProjectActions.id, name: activeProjectActions.name });
                  setActiveProjectActions(null);
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
      {/* 2. DESKTOP / LAPTOP CLIENT PROJECTS VIEW (100% UNCHANGED) */}
      {/* ======================================================== */}
      <div className="hidden sm:block space-y-6">
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
