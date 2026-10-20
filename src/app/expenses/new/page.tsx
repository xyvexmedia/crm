'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Receipt, Upload, Paperclip } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ExpenseType, ExpenseCategory, PaymentMethod } from '@/types';

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

export default function NewExpensePage() {
  const router = useRouter();
  const { clients, projects, addExpense } = useData();

  const [expenseType, setExpenseType] = useState<ExpenseType>('client');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Meta Ads');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [vendor, setVendor] = useState('');
  const [campaign, setCampaign] = useState('');
  const [adAccount, setAdAccount] = useState('');
  const [description, setDescription] = useState('');
  const [hostingPlan, setHostingPlan] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (newType: ExpenseType) => {
    setExpenseType(newType);
    if (newType === 'client') {
      setCategory('Meta Ads');
    } else {
      setCategory('Hosting');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid expense amount');
      return;
    }
    if (expenseType === 'client' && !clientId) {
      setError('Please select a client');
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
        description: description.trim() || `${category} spend`,
        receipt_url: receiptFileName ? `/receipts/${receiptFileName}` : undefined,
      });

      router.push('/expenses');
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <Link
            href="/expenses"
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Record New Expense</h1>
            <p className="text-xs text-zinc-400">Classify between client direct disbursements or agency operations</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Expense Nature</label>
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
                ○ XYVEX Company Overhead
              </button>
            </div>
          </div>

          {expenseType === 'client' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
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
                  {projects
                    .filter((p) => p.client_id === clientId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

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
              <label className="block text-zinc-300 mb-1 font-medium">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                step="50"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="glass-input font-mono font-medium"
              />
            </div>
          </div>

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
              <label className="block text-zinc-300 mb-1 font-medium">Payment Method</label>
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

          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Instagram Lead Generation Campaign ad spend"
              className="glass-input"
            />
          </div>

          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Vendor / Platform / Creator</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Meta Ireland, Google India, Freelancer name"
              className="glass-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link href="/expenses" className="glass-button-secondary py-2 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary py-2 px-5"
            >
              <Receipt className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
