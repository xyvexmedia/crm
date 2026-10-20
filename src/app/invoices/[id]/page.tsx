'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle2,
  FileText,
  Building,
  Mail,
  Phone,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { InvoiceStatus } from '@/types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;
  const { invoices, clients, settings, updateInvoice, payments } = useData();

  const [downloading, setDownloading] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const invoice = invoices.find((inv) => inv.id === invoiceId);
  const client = invoice ? clients.find((c) => c.id === invoice.client_id) : null;

  if (!invoice) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-zinc-400">
          Invoice not found.
          <Link href="/invoices" className="glass-button-primary mt-4 text-xs py-2 px-4 block w-max mx-auto">
            Back to Invoices
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Calculate actual paid on this invoice or client
  const clientPayments = payments.filter((p) => p.client_id === invoice.client_id);
  const totalPaid = invoice.status === 'paid' ? invoice.total : clientPayments.reduce((s, p) => s + Number(p.amount), 0);
  const remainingDue = Math.max(0, invoice.total - (invoice.status === 'paid' ? invoice.total : Math.min(invoice.total, totalPaid)));

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    await updateInvoice(invoice.id, { status: newStatus });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      // Use standard browser print/save as PDF for ultra crisp vector fidelity
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08] print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                  {invoice.invoice_number}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border uppercase ${
                    invoice.status === 'paid'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : invoice.status === 'overdue'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-white/10 text-zinc-300 border-white/10'
                  }`}
                >
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Issued for {client?.company_name || 'Client'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={invoice.status}
              onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
              className="glass-input bg-zinc-900 text-xs py-1.5 w-36"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Mark as Paid</option>
              <option value="overdue">Overdue</option>
            </select>

            <button
              onClick={handlePrint}
              className="glass-button-secondary text-xs py-2 px-3.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="glass-button-primary text-xs py-2 px-4"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Preparing...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET (Section 40) */}
        <div
          ref={printAreaRef}
          className="glass-panel p-8 sm:p-12 bg-[#0c0c10]/95 border border-white/20 shadow-2xl rounded-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
        >
          {/* Header Block: Brand & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-white/10 print:border-zinc-300">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/20 p-1 flex items-center justify-center print:border-zinc-300">
                  <img
                    src="/xyvex-logo.jpeg"
                    alt="XYVEX"
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-black text-sm text-white print:text-black">XY</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white print:text-black">
                    {settings.company_name}
                  </h2>
                  <p className="text-[11px] text-zinc-400 print:text-zinc-600">
                    Digital Marketing & Creative Agency
                  </p>
                </div>
              </div>

              <div className="text-xs text-zinc-400 print:text-zinc-600 space-y-0.5 mt-3">
                <p>{settings.address}</p>
                <p>Email: {settings.email} • Phone: {settings.phone}</p>
                {settings.gst_number && (
                  <p className="font-mono text-zinc-300 print:text-zinc-800">
                    GSTIN: {settings.gst_number}
                  </p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                Tax Invoice
              </span>
              <h3 className="text-2xl font-bold text-white print:text-black font-mono mt-0.5">
                {invoice.invoice_number}
              </h3>

              <div className="mt-3 text-xs text-zinc-400 print:text-zinc-600 space-y-1">
                <p>
                  <span className="text-zinc-500">Invoice Date:</span>{' '}
                  <span className="text-white print:text-black font-medium">{formatDate(invoice.invoice_date)}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Due Date:</span>{' '}
                  <span className="text-white print:text-black font-medium">{formatDate(invoice.due_date)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Billed To Client Block */}
          <div className="py-6 border-b border-white/10 print:border-zinc-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                Billed To
              </span>
              <h4 className="text-base font-bold text-white print:text-black">
                {client?.company_name || 'Client Name'}
              </h4>
              <div className="text-xs text-zinc-400 print:text-zinc-600 space-y-0.5 mt-1">
                <p>Attention: {client?.name}</p>
                <p>{client?.address || 'India'}</p>
                <p>Phone: {client?.phone} • Email: {client?.email}</p>
              </div>
            </div>

            <div className="sm:text-right flex flex-col justify-end">
              <div className="inline-block p-3 rounded-xl bg-white/[0.03] border border-white/10 print:bg-zinc-100 print:border-zinc-300 sm:self-end">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 print:text-zinc-600 block">
                  Total Amount Due
                </span>
                <span className="text-2xl font-bold text-emerald-400 print:text-emerald-700 font-mono">
                  {formatCurrency(remainingDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/15 print:border-zinc-400 text-zinc-400 print:text-zinc-600 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Rate</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-zinc-200">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item) => (
                    <tr key={item.id} className="text-zinc-200 print:text-zinc-800">
                      <td className="py-3 font-medium text-white print:text-black">
                        {item.description}
                      </td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">{formatCurrency(item.rate)}</td>
                      <td className="py-3 text-right font-mono font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-zinc-200 print:text-zinc-800">
                    <td className="py-3 font-medium text-white print:text-black">
                      Digital Marketing & Creative Retainer
                    </td>
                    <td className="py-3 text-center font-mono">1</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(invoice.subtotal)}</td>
                    <td className="py-3 text-right font-mono font-medium">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Tax, Discount & Total Calculation */}
          <div className="pt-4 border-t border-white/10 print:border-zinc-300 flex flex-col sm:flex-row justify-between gap-6">
            {/* Payment Details & Bank Information */}
            <div className="flex-1 space-y-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 print:bg-zinc-50 print:border-zinc-200 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 print:text-zinc-600 font-semibold block mb-2">
                  Payment Details
                </span>
                <p className="text-zinc-300 print:text-zinc-800 font-mono text-[11px] leading-relaxed">
                  {settings.bank_details}
                </p>
                <p className="text-zinc-300 print:text-zinc-800 font-mono text-[11px] mt-1">
                  UPI ID: <span className="font-bold text-white print:text-black">{settings.upi_id}</span>
                </p>
              </div>

              {invoice.notes && (
                <div className="text-[11px] text-zinc-400 print:text-zinc-600">
                  <span className="font-semibold text-zinc-300 print:text-zinc-700 block mb-0.5">Terms:</span>
                  <p>{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400 print:text-zinc-600 py-1">
                <span>Subtotal</span>
                <span className="font-mono text-white print:text-black font-medium">{formatCurrency(invoice.subtotal)}</span>
              </div>

              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-zinc-400 print:text-zinc-600 py-1">
                  <span>Discount</span>
                  <span className="font-mono text-emerald-400">- {formatCurrency(invoice.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400 print:text-zinc-600 py-1">
                <span>Tax (GST)</span>
                <span className="font-mono text-white print:text-black font-medium">{formatCurrency(invoice.tax)}</span>
              </div>

              <div className="pt-2 border-t border-white/15 print:border-zinc-300 flex justify-between text-base font-bold text-white print:text-black">
                <span>Invoice Total</span>
                <span className="font-mono">{formatCurrency(invoice.total)}</span>
              </div>

              <div className="flex justify-between text-emerald-400 print:text-emerald-700 py-1 text-xs">
                <span>Paid to Date</span>
                <span className="font-mono">{formatCurrency(invoice.status === 'paid' ? invoice.total : totalPaid)}</span>
              </div>

              <div className="pt-2 border-t border-dashed border-white/15 print:border-zinc-300 flex justify-between text-sm font-bold text-white print:text-black">
                <span>Pending Balance</span>
                <span className="font-mono text-rose-400 print:text-rose-600">{formatCurrency(remainingDue)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-white/5 print:border-zinc-200 text-center text-[10px] text-zinc-500">
            <p>Thank you for partnering with XYVEX. For billing inquiries, email {settings.email}</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
