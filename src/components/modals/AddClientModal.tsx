'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Building2,
  User,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Activity,
  FileText,
  Calculator,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (clientId: string) => void;
}

const ALL_SERVICES = [
  'Meta Ads',
  'Google Ads',
  'SEO',
  'Social Media Management',
  'Website Development',
  'Poster Design',
  'Video Production',
  'Photography',
  'CRM Setup',
  'Branding',
  'Other',
];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addClient, addProject, addPayment } = useData();

  // Client Information
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  // Financial
  const [budget, setBudget] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');

  // Service & Billing
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [clientType, setClientType] = useState<'retainer' | 'one-time'>('retainer');
  const [billingDay, setBillingDay] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const budgetNum = Number(budget) || 0;
  const advanceNum = Number(advancePayment) || 0;
  const pendingAmount = Math.max(0, budgetNum - advanceNum);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCompany = companyName.trim();
    if (!trimmedCompany) {
      setError('Company / Client Name is required.');
      return;
    }
    if (budgetNum <= 0) {
      setError('Total Client Budget (₹) is required.');
      return;
    }
    if (selectedServices.length === 0) {
      setError('Please select at least one service.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newClient = await addClient({
        company_name: trimmedCompany,
        name: trimmedCompany,
        contact_person: contactPerson.trim() || undefined,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim() || undefined,
        email: email.trim(),
        location: location.trim() || undefined,
        address: location.trim() || undefined,
        status,
        total_budget: budgetNum,
        client_type: clientType,
        services: selectedServices,
        billing_day: clientType === 'retainer' && billingDay ? Number(billingDay) : undefined,
        billing_date: undefined,
        notes: notes.trim() || undefined,
      });

      // Auto-create project
      const projectService = selectedServices.join(' + ');
      const projectName = clientType === 'retainer'
        ? `${trimmedCompany} — ${projectService} (Retainer)`
        : `${trimmedCompany} — ${projectService}`;

      let newProj = null;
      newProj = await addProject({
        client_id: newClient.id,
        name: projectName,
        service: projectService,
        budget: budgetNum,
        start_date: new Date().toISOString().split('T')[0],
        end_date: undefined,
        status: status === 'completed' ? 'completed' : 'active',
        assigned_to: 'Salih (Lead)',
        notes: clientType === 'retainer'
          ? `Monthly retainer. Billing day: ${billingDay || 'TBD'}`
          : 'One-time project',
      });

      // Record advance payment
      if (advanceNum > 0) {
        await addPayment({
          client_id: newClient.id,
          project_id: newProj?.id,
          amount: advanceNum,
          payment_type: 'advance',
          payment_method: 'UPI',
          payment_date: new Date().toISOString().split('T')[0],
          reference: 'Initial Setup Advance',
          notes: 'Advance payment on client setup',
        });
      }

      // Reset
      setCompanyName('');
      setContactPerson('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setLocation('');
      setBudget('');
      setAdvancePayment('');
      setBillingDay('');
      setStatus('active');
      setSelectedServices([]);
      setClientType('retainer');
      setNotes('');

      onClose();
      if (onSuccess) onSuccess(newClient.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
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
      <div className="relative w-full max-w-xl bg-[#111116] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[90dvh] sm:h-auto sm:max-h-[92vh] flex flex-col min-h-0 overflow-hidden animate-fade">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#991b1b] to-[#e11d48] border border-rose-500/30 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Add New Client</h2>
              <p className="text-[11px] text-zinc-400">Setup client profile, scope & financial budget</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-95"
            aria-label="Close modal"
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
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-4 text-xs touch-pan-y">

            {/* Section 1: Client Info */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Client Information</h3>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Company / Client Name <span className="text-[#e11d48]">*</span></label>
                <div className="relative flex items-center">
                  <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. ABC Company, Zenith Brand"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Contact Person</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. John Doe (Founder)"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98470 12345"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">WhatsApp</label>
                  <div className="relative flex items-center">
                    <MessageSquare className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98470 12345"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Location</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dubai, Calicut, Kochi"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Client Type */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Client Type</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClientType('retainer')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition active:scale-95 ${
                    clientType === 'retainer'
                      ? 'bg-[#a3e635]/15 border-[#a3e635]/40 text-[#a3e635]'
                      : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retainer</span>
                  <span className="text-[10px] opacity-70">(Monthly)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('one-time')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition active:scale-95 ${
                    clientType === 'one-time'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>One-time</span>
                  <span className="text-[10px] opacity-70">(Project)</span>
                </button>
              </div>
              {clientType === 'retainer' && (
                <div className="flex items-center gap-3 bg-[#a3e635]/5 border border-[#a3e635]/20 rounded-xl p-3">
                  <Calendar className="w-4 h-4 text-[#a3e635] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[11px] text-[#a3e635] font-semibold">Monthly Billing Day</p>
                    <p className="text-[10px] text-zinc-500">Which day of each month do you collect payment?</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={billingDay}
                    onChange={(e) => setBillingDay(e.target.value)}
                    placeholder="15"
                    className="w-16 text-center glass-input !py-1.5 text-sm font-bold text-[#a3e635] placeholder:text-zinc-600"
                  />
                </div>
              )}
            </div>

            {/* Section 3: Services Multi-select */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Services <span className="text-[#e11d48]">*</span></h3>
                {selectedServices.length > 0 && (
                  <span className="text-[10px] text-[#a3e635] font-semibold">{selectedServices.length} selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_SERVICES.map((svc) => {
                  const isSelected = selectedServices.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition active:scale-95 ${
                        isSelected
                          ? 'bg-[#a3e635]/15 border-[#a3e635]/50 text-[#a3e635]'
                          : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
                      }`}
                    >
                      {isSelected && <span className="mr-1">✓</span>}{svc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Financial */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Financial Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    {clientType === 'retainer' ? 'Monthly Retainer ₹' : 'Project Budget ₹'} <span className="text-[#e11d48]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="text-zinc-400 font-bold absolute left-3.5 text-sm pointer-events-none">₹</span>
                    <input type="number" required min="0" value={budget} onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 30000"
                      className="glass-input !pl-8 !pr-3 !py-2.5 text-sm font-semibold font-mono text-white placeholder:text-zinc-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Advance Payment ₹</label>
                  <div className="relative flex items-center">
                    <span className="text-zinc-400 font-bold absolute left-3.5 text-sm pointer-events-none">₹</span>
                    <input type="number" min="0" value={advancePayment} onChange={(e) => setAdvancePayment(e.target.value)}
                      placeholder="e.g. 15000"
                      className="glass-input !pl-8 !pr-3 !py-2.5 text-sm font-semibold font-mono text-emerald-400 placeholder:text-zinc-500" />
                  </div>
                </div>
              </div>
              <div className="bg-[#141419] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-zinc-400" />
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Auto-Calculated Pending Amount:</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{formatCurrency(pendingAmount)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">Payment Progress</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {budgetNum > 0 ? `${Math.min(100, Math.round((advanceNum / budgetNum) * 100))}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 5: Status & Notes */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Status & Notes</h3>
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Status</label>
                <div className="relative flex items-center">
                  <Activity className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="glass-input glass-input-with-icon !py-2.5 text-xs bg-[#1a1a1e] text-white cursor-pointer capitalize">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Notes</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Campaign goals, payment schedules, special terms..."
                    className="glass-input !pl-10 !py-2.5 text-xs text-white placeholder:text-zinc-500 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#141419] shrink-0 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white text-xs font-semibold transition active:scale-95">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition flex items-center gap-1.5 disabled:opacity-50">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Creating...' : 'Create Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
