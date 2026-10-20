'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface KPICardProps {
  label: string;
  amount: number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  highlight?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  amount,
  subtitle,
  icon: Icon,
  trend,
  highlight,
}) => {
  return (
    <div
      className={`glass-panel p-5 relative overflow-hidden transition-all duration-300 ${
        highlight
          ? 'border-white/25 bg-gradient-to-b from-white/[0.12] to-white/[0.05]'
          : 'hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
            {label}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5 font-sans">
            {formatCurrency(amount)}
          </h3>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
          <Icon className="w-5 h-5 text-white/90" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs">
        <span className="text-zinc-400 truncate max-w-[70%]">
          {subtitle}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-zinc-400'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </span>
        )}
      </div>
    </div>
  );
};
