'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Expense } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface ExpenseBreakdownChartProps {
  expenses: Expense[];
}

// Sophisticated monochrome & subtle cold accents matching dark liquid glass
const CATEGORY_COLORS: Record<string, string> = {
  'Meta Ads': '#ffffff',
  'Google Ads': '#e4e4e7',
  'Video': '#d4d4d8',
  'Poster': '#a1a1aa',
  'Hosting': '#71717a',
  'Software': '#52525b',
  'Photography': '#a8a29e',
  'Influencer': '#cbd5e1',
  'Office': '#3f3f46',
  'Internet': '#27272a',
  'Salary': '#94a3b8',
  'Other': '#78716c',
};

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({ expenses }) => {
  const { chartData, totalAmount } = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;

    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
      total += Number(e.amount || 0);
    });

    const data = Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return { chartData: data, totalAmount: total };
  }, [expenses]);

  return (
    <div className="glass-panel p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Expense Breakdown
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Category distribution across client & agency operations
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-300">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* Donut Chart or Clean Zero State */}
        {chartData.length === 0 ? (
          <div className="h-48 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl my-2">
            <span className="text-zinc-400 text-xs font-medium">No expenses recorded yet</span>
            <span className="text-zinc-600 text-[11px] mt-1">₹0 total expenditure</span>
          </div>
        ) : (
          <div className="h-48 w-full my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth={1.5}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CATEGORY_COLORS[entry.name] || '#a1a1aa'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="glass-panel bg-[#0d0d12]/95 border border-white/20 p-2.5 text-xs shadow-xl min-w-[140px]">
                          <p className="font-semibold text-white">{data.name}</p>
                          <p className="text-zinc-300 mt-0.5">{formatCurrency(data.value)}</p>
                          <p className="text-[11px] text-zinc-400">{formatPercentage(data.percentage)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Total Spend</span>
              <span className="text-sm font-bold text-white font-mono">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend with Category, Amount, Percentage */}
      {chartData.length === 0 ? (
        <div className="pt-3 border-t border-white/[0.06] text-center text-zinc-500 text-[11px] py-2">
          No category data available
        </div>
      ) : (
        <div className="space-y-1.5 pt-3 border-t border-white/[0.06] max-h-48 overflow-y-auto pr-1">
          {chartData.slice(0, 6).map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-white/[0.04] transition"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#a1a1aa' }}
                />
                <span className="text-zinc-300 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                <span className="text-zinc-500 w-10 text-right">{formatPercentage(item.percentage)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
