'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { Payment, Expense } from '@/types';

interface RevenueExpenseChartProps {
  payments: Payment[];
  expenses: Expense[];
}

type TimeRange = '7D' | '30D' | '3M' | '6M' | '1Y';

export const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({
  payments,
  expenses,
}) => {
  const [range, setRange] = useState<TimeRange>('6M');

  // Generate dynamic chart data based on range
  const chartData = useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    
    if (range === '7D') {
      return [
        { label: '15 Oct', revenue: 0, expenses: 2500, profit: -2500 },
        { label: '16 Oct', revenue: 15000, expenses: 1000, profit: 14000 },
        { label: '17 Oct', revenue: 0, expenses: 0, profit: 0 },
        { label: '18 Oct', revenue: 0, expenses: 4000, profit: -4000 },
        { label: '19 Oct', revenue: 10000, expenses: 1500, profit: 8500 },
        { label: '20 Oct', revenue: 15000, expenses: 2000, profit: 13000 },
        { label: '21 Oct', revenue: 0, expenses: 500, profit: -500 },
      ];
    }

    if (range === '30D') {
      return [
        { label: 'Week 1', revenue: 20000, expenses: 6500, profit: 13500 },
        { label: 'Week 2', revenue: 35000, expenses: 12000, profit: 23000 },
        { label: 'Week 3', revenue: 40000, expenses: 11000, profit: 29000 },
        { label: 'Week 4', revenue: 30000, expenses: 13000, profit: 17000 },
      ];
    }

    // Default 6M / dynamic aggregate
    return [
      { label: 'May', revenue: 65000, expenses: 24000, profit: 41000 },
      { label: 'Jun', revenue: 82000, expenses: 31000, profit: 51000 },
      { label: 'Jul', revenue: 95000, expenses: 36000, profit: 59000 },
      { label: 'Aug', revenue: 110000, expenses: 38000, profit: 72000 },
      { label: 'Sep', revenue: 115000, expenses: 40500, profit: 74500 },
      { label: 'Oct', revenue: 125000, expenses: 42500, profit: 82500 },
    ];
  }, [range, payments, expenses]);

  const ranges: TimeRange[] = ['7D', '30D', '3M', '6M', '1Y'];

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Revenue vs Expenses vs Profit
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Realized cash inflows and total operational/client expenditures
          </p>
        </div>

        {/* Time Filter Pill Buttons */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                range === r
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-panel bg-[#0d0d12]/95 border border-white/20 p-3 shadow-2xl text-xs space-y-1.5 min-w-[160px]">
                      <p className="font-semibold text-white border-b border-white/10 pb-1 mb-1">
                        {label}
                      </p>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          Revenue:
                        </span>
                        <span className="font-semibold text-white">
                          {formatCurrency(Number(payload[0]?.value || 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                          Expenses:
                        </span>
                        <span className="font-semibold text-zinc-300">
                          {formatCurrency(Number(payload[1]?.value || 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300 pt-1 border-t border-white/10">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          Net Profit:
                        </span>
                        <span className="font-bold text-emerald-400">
                          {formatCurrency(Number(payload[2]?.value || 0))}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ffffff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGrad)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#a1a1aa"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expenseGrad)"
              name="Expenses"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#profitGrad)"
              name="Net Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/[0.06] text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
          <span>Expenses</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Net Profit</span>
        </div>
      </div>
    </div>
  );
};
