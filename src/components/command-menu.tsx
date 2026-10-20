'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Briefcase,
  TrendingUp,
  Receipt,
  FileText,
  PlusCircle,
  X,
  ArrowRight,
} from 'lucide-react';
import { useData } from '@/context/data-context';
import { formatCurrency } from '@/lib/formatters';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddClient?: () => void;
  onOpenAddPayment?: () => void;
  onOpenAddExpense?: () => void;
  onOpenCreateInvoice?: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  isOpen,
  onClose,
  onOpenAddClient,
  onOpenAddPayment,
  onOpenAddExpense,
  onOpenCreateInvoice,
}) => {
  const router = useRouter();
  const { clients, projects, payments, expenses, invoices } = useData();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
      try {
        dialogRef.current?.showModal();
      } catch {
        // fallback
      }
    } else {
      try {
        dialogRef.current?.close();
      } catch {
        // fallback
      }
    }
  }, [isOpen]);

  // Handle escape key & keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search Results
  const filteredClients = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    : clients.slice(0, 3);

  const filteredProjects = q
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.service.toLowerCase().includes(q)
      )
    : projects.slice(0, 3);

  const filteredInvoices = q
    ? invoices.filter((i) => i.invoice_number.toLowerCase().includes(q))
    : invoices.slice(0, 3);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const handleAction = (action?: () => void) => {
    onClose();
    if (action) action();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl glass-panel bg-[#0c0c10]/95 border border-white/20 shadow-2xl p-0 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search clients, projects, invoices, or quick actions..."
            className="w-full bg-transparent border-none text-white text-sm outline-none placeholder:text-zinc-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Content List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-2">
              Quick Actions
            </span>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleAction(onOpenAddClient || (() => router.push('/clients/new')))}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>+ Add Client</span>
              </button>
              <button
                onClick={() => handleAction(onOpenAddPayment || (() => router.push('/payments')))}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>+ Add Payment</span>
              </button>
              <button
                onClick={() => handleAction(onOpenAddExpense || (() => router.push('/expenses/new')))}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                <Receipt className="w-4 h-4 text-rose-400" />
                <span>+ Add Expense</span>
              </button>
              <button
                onClick={() => handleAction(onOpenCreateInvoice || (() => router.push('/invoices/new')))}
                className="flex items-center gap-2 p-2 rounded-lg text-left text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>+ Create Invoice</span>
              </button>
            </div>
          </div>

          {/* Clients Section */}
          {filteredClients.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-2">
                Clients
              </span>
              <div className="mt-1 space-y-1">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelect(`/clients/${client.id}`)}
                    className="flex items-center justify-between w-full p-2 rounded-lg text-left text-zinc-300 hover:text-white hover:bg-white/[0.08] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
                      <div>
                        <p className="font-medium text-white">{client.company_name}</p>
                        <p className="text-[11px] text-zinc-400">{client.name}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {filteredProjects.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-2">
                Projects
              </span>
              <div className="mt-1 space-y-1">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelect(`/projects/${project.id}`)}
                    className="flex items-center justify-between w-full p-2 rounded-lg text-left text-zinc-300 hover:text-white hover:bg-white/[0.08] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-[11px] text-zinc-400">{project.service} • {formatCurrency(project.budget)}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Section */}
          {filteredInvoices.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold px-2">
                Invoices
              </span>
              <div className="mt-1 space-y-1">
                {filteredInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => handleSelect(`/invoices/${inv.id}`)}
                    className="flex items-center justify-between w-full p-2 rounded-lg text-left text-zinc-300 hover:text-white hover:bg-white/[0.08] transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-zinc-400 group-hover:text-white transition" />
                      <div>
                        <p className="font-medium text-white">{inv.invoice_number}</p>
                        <p className="text-[11px] text-zinc-400">{formatCurrency(inv.total)} • {inv.status}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
