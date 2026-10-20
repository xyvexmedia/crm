'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, TrendingDown, ArrowDownLeft } from 'lucide-react';
import { Payment, Expense, Client } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface RecentTransactionsProps {
  payments: Payment[];
  expenses: Expense[];
  clients: Client[];
}

interface UnifiedTransaction {
  id: string;
  type: 'income' | 'client_expense' | 'company_expense';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  paymentMethod: string;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  payments,
  expenses,
  clients,
}) => {
  const transactions = useMemo<UnifiedTransaction[]>(() => {
    const list: UnifiedTransaction[] = [];

    // Payments -> Income (+)
    payments.forEach((p) => {
      const client = clients.find((c) => c.id === p.client_id);
      list.push({
        id: p.id,
        type: 'income',
        title: client?.company_name || 'Client Payment',
        subtitle: `${p.payment_type.toUpperCase()} • ${p.payment_method}`,
        amount: Number(p.amount),
        date: p.payment_date,
        paymentMethod: p.payment_method,
      });
    });

    // Expenses -> Spend (-)
    expenses.forEach((e) => {
      const isClient = !!e.client_id;
      const client = isClient ? clients.find((c) => c.id === e.client_id) : null;

      list.push({
        id: e.id,
        type: isClient ? 'client_expense' : 'company_expense',
        title: e.category,
        subtitle: isClient
          ? `${client?.company_name || 'Client Spend'} • ${e.description}`
          : `XYVEX Operations • ${e.description}`,
        amount: Number(e.amount),
        date: e.expense_date,
        paymentMethod: e.payment_method,
      });
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
  }, [payments, expenses, clients]);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Recent Transactions
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time feed of inflows, client disbursements, and operational overhead
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/revenue"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>Revenue</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
          <span className="text-zinc-600">•</span>
          <Link
            href="/expenses"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>Expenses</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-white/[0.05] mt-2">
        {transactions.length === 0 ? (
          <p className="text-center py-6 text-zinc-500 text-xs">No recent transactions recorded</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : tx.type === 'client_expense'
                      ? 'bg-zinc-800 text-zinc-200 border-white/10'
                      : 'bg-zinc-900 text-zinc-400 border-white/5'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{tx.title}</p>
                  <p className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs">
                    {tx.subtitle}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 font-mono">
                <p
                  className={`text-xs font-bold ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
                <p className="text-[10px] text-zinc-500">{formatDate(tx.date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
