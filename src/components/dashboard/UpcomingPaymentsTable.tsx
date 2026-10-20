'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { ClientFinancialReport } from '@/types';
import { formatCurrency, formatDate, getDaysRemaining } from '@/lib/formatters';

interface UpcomingPaymentsTableProps {
  reports: ClientFinancialReport[];
}

export const UpcomingPaymentsTable: React.FC<UpcomingPaymentsTableProps> = ({ reports }) => {
  // Sort by overdue first, then by earliest billing date
  const sortedReports = [...reports]
    .filter((r) => r.pendingAmount > 0 || r.client.billing_date)
    .sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return (a.client.billing_date || '').localeCompare(b.client.billing_date || '');
    });

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Upcoming & Pending Payments
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Client billing schedule, receivables, and overdue status
          </p>
        </div>
        <Link
          href="/payments/pending"
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
        >
          <span>View all</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="glass-table-container mt-4">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Budget</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Billing Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-zinc-500">
                  No upcoming pending payments
                </td>
              </tr>
            ) : (
              sortedReports.map((report) => {
                const dueInfo = getDaysRemaining(report.client.billing_date);

                return (
                  <tr key={report.client.id} className="hover:bg-white/[0.03]">
                    <td>
                      <div>
                        <Link
                          href={`/clients/${report.client.id}`}
                          className="font-medium text-white hover:underline flex items-center gap-1.5"
                        >
                          {report.client.company_name}
                        </Link>
                        <span className="text-[11px] text-zinc-400">{report.client.name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-zinc-300">
                      {formatCurrency(report.totalBudget)}
                    </td>
                    <td className="font-mono text-emerald-400">
                      {formatCurrency(report.amountReceived)}
                    </td>
                    <td className="font-mono font-medium text-white">
                      {formatCurrency(report.pendingAmount)}
                    </td>
                    <td className="text-zinc-300">
                      <div className="flex flex-col">
                        <span>{formatDate(report.client.billing_date)}</span>
                        {report.client.billing_date && (
                          <span
                            className={`text-[10px] font-mono ${
                              report.isOverdue
                                ? 'text-rose-400 font-medium'
                                : 'text-zinc-500'
                            }`}
                          >
                            {dueInfo.text}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {report.isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> Overdue
                        </span>
                      ) : report.pendingAmount === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/clients/${report.client.id}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition"
                        title="View Client"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
