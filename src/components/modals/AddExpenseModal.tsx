'use client';

import React, { useState, useEffect } from 'react';
import { X, Receipt, Upload, Paperclip } from 'lucide-react';
import { useData } from '@/context/data-context';
import { ExpenseType, ExpenseCategory, PaymentMethod } from '@/types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
  defaultType?: ExpenseType;
}

const CLIENT_CATEGORIES: ExpenseCategory[] = [
  'Meta Ads',
  'Google Ads',
  'Video',
  'Poster',
  'Photography',
  'Influencer',
  'Other',
];

const COMPANY_CATEGORIES: ExpenseCategory[] = [
  'Hosting',
  'Domain',
  'Software',
  'Office',
  'Internet',
  'Salary',
  'Equipment',
  'Travel',
  'Subscription',
  'Marketing',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
  defaultType = 'client',
}) => {
  const { clients, projects, addExpense } = useData();

  const [expenseType, setExpenseType] = useState<ExpenseType>(
    defaultClientId ? 'client' : defaultType
  );
  const [clientId, setClientId] = useState(defaultClientId || (clients[0]?.id || ''));
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(
    expenseType === 'client' ? 'Meta Ads' : 'Hosting'
  );

  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [campaign, setCampaign] = useState('');
  const [adAccount, setAdAccount] = useState('');
  const [hostingPlan, setHostingPlan] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock mobile body scroll completely while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const clientProjects = projects.filter((p) => p.client_id === clientId);

  const handleTypeChange = (newType: ExpenseType) => {
    setExpenseType(newType);
    if (newType === 'client') {
      setCategory('Meta Ads');
      if (!clientId && clients.length > 0) setClientId(clients[0].id);
    } else {
      setCategory('Hosting');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please specify a valid amount.');
      return;
    }

    if (expenseType === 'client' && !clientId) {
      setError('Please select a client for client-specific expense.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addExpense({
        expense_type: expenseType,
        client_id: expenseType === 'client' ? clientId : null,
        project_id: expenseType === 'client' && projectId ? projectId : null,
        category,
        amount: amountNum,
        expense_date: expenseDate,
        payment_method: paymentMethod,
        vendor: vendor.trim() || undefined,
        campaign: campaign.trim() || undefined,
        ad_account: adAccount.trim() || undefined,
        hosting_plan: hostingPlan.trim() || undefined,
        renewal_date: renewalDate || undefined,
        description: description.trim() || `${category} expenditure`,
        receipt_url: receiptFileName ? `/receipts/${receiptFileName}` : undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
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
      <div className="relative w-full max-w-xl bg-[#111116] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88dvh] sm:max-h-[85vh] flex flex-col min-h-0 overflow-hidden animate-fade">
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Add Expense
              </h2>
              <p className="text-[11px] text-zinc-400">
                Record advertising, production, media buying, or operating overhead
              </p>
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
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3.5 text-xs touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
          {/* Expense Type Toggle */}
          <div>
            <label className="block text-zinc-300 mb-1.5 font-medium">Expense Nature</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => handleTypeChange('client')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition ${
                  expenseType === 'client'
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ● Client Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('company')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition ${
                  expenseType === 'company'
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ○ Company Expense (XYVEX)
              </button>
            </div>
          </div>

          {/* Conditional Client Field */}
          {expenseType === 'client' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Associated Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setProjectId('');
                  }}
                  required
                  className="glass-input bg-zinc-900"
                >
                  <option value="" disabled>Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Project (Optional)</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="glass-input bg-zinc-900"
                >
                  <option value="">General Client Scope</option>
                  {clientProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Category & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="glass-input bg-zinc-900"
              >
                {(expenseType === 'client' ? CLIENT_CATEGORIES : COMPANY_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Amount Spent (₹) *</label>
              <input
                type="number"
                min="1"
                step="50"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 4500"
                className="glass-input font-mono font-medium"
              />
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Paid Via</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="glass-input bg-zinc-900"
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Category-Specific Dynamic Fields */}
          {(category === 'Meta Ads' || category === 'Google Ads') && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Ad Campaign Name</label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g. Retargeting Funnel V2"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Ad Account ID</label>
                <input
                  type="text"
                  value={adAccount}
                  onChange={(e) => setAdAccount(e.target.value)}
                  placeholder="e.g. act_190283921"
                  className="glass-input"
                />
              </div>
            </div>
          )}

          {(category === 'Video' || category === 'Poster' || category === 'Photography' || category === 'Influencer') && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Vendor / Freelancer / Creator</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Pixel Studio / Editor Name"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Campaign / Deliverable</label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="e.g. 4x Medical Reels Shoot"
                  className="glass-input"
                />
              </div>
            </div>
          )}

          {category === 'Hosting' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Hosting Provider & Plan</label>
                <input
                  type="text"
                  value={hostingPlan}
                  onChange={(e) => setHostingPlan(e.target.value)}
                  placeholder="Vercel Pro / Supabase Pro"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Next Renewal Date</label>
                <input
                  type="date"
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Description / Details</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for? (e.g. Domain purchase, Facebook invoice #9921)"
              className="glass-input"
            />
          </div>

          {/* Upload Receipt */}
          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Upload Receipt / Invoice</label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-white/20 hover:border-white/40 cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition">
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-400 truncate">
                {receiptFileName ? (
                  <span className="text-white flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> {receiptFileName}
                  </span>
                ) : (
                  'Click to attach receipt (PDF, PNG, JPG)'
                )}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          </div>

          <div className="px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#141419] shrink-0 flex items-center justify-end gap-3">
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
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-[0_4px_20px_rgba(168,85,247,0.35)] transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Receipt className="w-4 h-4" />
              <span>{loading ? 'Adding Expense...' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
