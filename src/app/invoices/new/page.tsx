'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, FileText, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { InvoiceStatus, InvoiceItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export default function NewInvoicePage() {
  const router = useRouter();
  const { clients, invoices, settings, addInvoice } = useData();

  const nextNumber = `${settings.invoice_prefix || 'XYV-2026-'}${String(invoices.length + 1).padStart(3, '0')}`;

  const [invoiceNumber, setInvoiceNumber] = useState(nextNumber);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<InvoiceStatus>('sent');
  const [discount, setDiscount] = useState('0');
  const [taxRate, setTaxRate] = useState(settings.default_tax?.toString() || '18');
  const [notes, setNotes] = useState(settings.payment_terms || 'Payment due within 15 days of invoice date.');

  // Dynamic Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item_1',
      description: 'Meta Ads Management & Creative Direction',
      quantity: 1,
      rate: 25000,
      amount: 25000,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Item helpers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'rate') {
      const q = field === 'quantity' ? Number(value) : current.quantity;
      const r = field === 'rate' ? Number(value) : current.rate;
      current.amount = (q || 0) * (r || 0);
    }

    updated[index] = current;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `item_${Date.now()}`,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const discountAmount = Number(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client');
      return;
    }
    if (!invoiceNumber.trim()) {
      setError('Invoice number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const inv = await addInvoice({
        client_id: clientId,
        invoice_number: invoiceNumber.trim(),
        invoice_date: invoiceDate,
        due_date: dueDate,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: grandTotal,
        status,
        notes: notes.trim(),
        items,
      });

      router.push(`/invoices/${inv.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <Link
            href="/invoices"
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Create Client Invoice</h1>
            <p className="text-xs text-zinc-400">Generate professional invoice with tax calculation and itemized billing</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-6 text-xs">
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="glass-input font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Bill To (Client) *</label>
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
              <label className="block text-zinc-300 mb-1 font-medium">Invoice Date</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Payment Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="glass-input bg-zinc-900"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent to Client</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid in Full</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                Services & Deliverables
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="glass-button-secondary py-1 px-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Service description (e.g. Meta Ads, Video Production)"
                      className="glass-input"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="glass-input font-mono text-center"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      placeholder="Rate (₹)"
                      className="glass-input font-mono text-right"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-1 text-right font-mono font-medium text-white text-xs">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Tax Calculation */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Payment Terms & Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-input resize-none"
                />
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-300 py-1">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-zinc-300 py-1">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="glass-input w-24 py-1 text-right font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-zinc-300 py-1">
                <span>GST / Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="glass-input w-20 py-1 text-right font-mono"
                />
              </div>

              <div className="flex justify-between text-zinc-400 py-1">
                <span>Tax Amount</span>
                <span className="font-mono">{formatCurrency(taxAmount)}</span>
              </div>

              <div className="pt-2 border-t border-white/15 flex justify-between text-sm font-bold text-white">
                <span>Total Due</span>
                <span className="font-mono text-emerald-400 text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link href="/invoices" className="glass-button-secondary py-2 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary py-2 px-5"
            >
              <FileText className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Save & Issue Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
