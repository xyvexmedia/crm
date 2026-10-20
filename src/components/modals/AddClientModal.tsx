'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (clientId: string) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addClient, addProject, addPayment } = useData();

  // Client Details
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');

  // Initial Project Details
  const [projectName, setProjectName] = useState('');
  const [service, setService] = useState('Meta Ads Management');
  const [budget, setBudget] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Card'>('UPI');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !name.trim()) {
      setError('Company Name and Contact Name are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Client
      const newClient = await addClient({
        name: name.trim(),
        company_name: companyName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        address: address.trim(),
        billing_date: billingDate || undefined,
        status,
        notes: notes.trim(),
      });

      // 2. Create Project if provided
      const budgetNum = Number(budget) || 0;
      let newProj = null;
      if (projectName.trim() || budgetNum > 0) {
        newProj = await addProject({
          client_id: newClient.id,
          name: projectName.trim() || `${service} Project`,
          service,
          budget: budgetNum,
          start_date: startDate,
          status: 'active',
          assigned_to: 'Salih (Lead)',
        });
      }

      // 3. Record Advance Payment if specified
      const advanceNum = Number(advancePayment) || 0;
      if (advanceNum > 0) {
        await addPayment({
          client_id: newClient.id,
          project_id: newProj?.id,
          amount: advanceNum,
          payment_type: 'advance',
          payment_method: paymentMethod,
          payment_date: startDate,
          notes: 'Initial advance payment on onboarding',
        });
      }

      onClose();
      if (onSuccess) onSuccess(newClient.id);
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl glass-panel bg-[#0d0d12]/95 border border-white/20 p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <Sparkles className="w-5 h-5 text-white" />
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">
              Add New Client
            </h2>
            <p className="text-xs text-zinc-400">
              Set up client identity, project scope, budget and advance payment
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* SECTION 1: Client Information */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3">
              1. Client & Business Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Company / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Healthcare"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Rayan"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@brand.com"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98470 00000"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 98470 00000"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="glass-input bg-zinc-900"
                >
                  <option value="active">Active</option>
                  <option value="lead">Lead</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-300 mb-1 font-medium">Office / City Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kochi, Kerala, India"
                  className="glass-input"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Project Scope & Financial Agreement */}
          <div className="pt-3 border-t border-white/10">
            <h3 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3">
              2. Initial Project & Financials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Primary Agency Service</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="glass-input bg-zinc-900"
                >
                  <option value="Meta Ads Management">Meta Ads Management (FB/Insta)</option>
                  <option value="Google Ads Management">Google Ads Management</option>
                  <option value="Social Media Management">Social Media Management (SMM)</option>
                  <option value="Creative Design & Video">Creative Design & Video Reels</option>
                  <option value="SEO & Web Development">SEO & Web Development</option>
                  <option value="Full Funnel Growth Retainer">Full Funnel Growth Retainer</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Q4 Growth Campaign"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Agreed Client Budget (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 45000"
                  className="glass-input font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Advance Payment Received (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(e.target.value)}
                  placeholder="e.g. 20000 (Optional)"
                  className="glass-input font-mono"
                />
              </div>

              {Number(advancePayment) > 0 && (
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="glass-input bg-zinc-900"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Next Billing / Due Date</label>
                <input
                  type="date"
                  value={billingDate}
                  onChange={(e) => setBillingDate(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-300 mb-1 font-medium">Internal Notes & Deliverables</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contract terms, deliverables agreement, target ROAS..."
                  className="glass-input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="glass-button-secondary py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary py-2 px-5"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating Client...' : 'Add Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
