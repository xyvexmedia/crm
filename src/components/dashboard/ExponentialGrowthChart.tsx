'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
} from 'recharts';
import { ArrowLeft, ArrowRight, TrendingUp, Sparkles, Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

import { Project, Invoice } from '@/types';

interface ExponentialGrowthChartProps {
  totalRevenue?: number;
  paidInvoicesCount?: number;
  projects?: Project[];
  invoices?: Invoice[];
  onOpenPayment?: () => void;
  onOpenInvoice?: () => void;
}

const emptyTrajectoryData = [
  { month: 'May', layer1: 0, layer2: 0, layer3: 0, layer4: 0 },
  { month: 'Jun', layer1: 0, layer2: 0, layer3: 0, layer4: 0 },
  { month: 'Jul', layer1: 0, layer2: 0, layer3: 0, layer4: 0 },
  { month: 'Aug', layer1: 0, layer2: 0, layer3: 0, layer4: 0 },
  { month: 'Sep', layer1: 0, layer2: 0, layer3: 0, layer4: 0 },
  { month: 'Oct', layer1: 0, layer2: 0, layer3: 0, layer4: 0 },
];

const serviceCategories = [
  { name: 'Meta Ads', color: '#e11d48' },
  { name: 'Google Ads', color: '#be123c' },
  { name: 'SEO', color: '#9f1239' },
  { name: 'Social Media', color: '#881337' },
  { name: 'Design', color: '#6b0726' },
  { name: 'Web Development', color: '#4c0519' },
];

export const ExponentialGrowthChart: React.FC<ExponentialGrowthChartProps> = ({
  totalRevenue = 0,
  paidInvoicesCount = 0,
  projects = [],
  invoices = [],
  onOpenPayment,
  onOpenInvoice,
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Compute live breakdown per service
  const serviceBreakdown = useMemo(() => {
    return serviceCategories.map((s) => {
      const serviceProjects = projects.filter(
        (p) => p.service?.toLowerCase().includes(s.name.toLowerCase())
      );
      const amount = serviceProjects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
      const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
      return {
        name: s.name,
        amount,
        percentage,
        color: s.color,
      };
    });
  }, [projects, totalRevenue]);

  return (
    <div className="neo-card-dark p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
      {/* 1. Header & Main Metric */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            Agency Performance
          </p>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#3f0715] text-[#fb7185] border border-[#9f1239]/40 font-bold">
            Live Trajectory
          </span>
        </div>

        <div className="flex items-baseline gap-2.5 mt-2">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-xs text-[#fb7185] font-semibold flex items-center gap-0.5 bg-[#e11d48]/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" /> {totalRevenue > 0 ? '+18.4% MoM' : '0.0% MoM'}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 mt-1 font-medium">Revenue Growth Trajectory</p>
      </div>

      {/* 2. Layered Crimson/Ruby Area Chart with Right Axis */}
      <div className="relative">
        <div className="h-40 sm:h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={emptyTrajectoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="crimsonGlowGrad4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#9f1239" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="crimsonGlowGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#be123c" stopOpacity={0.65} />
                  <stop offset="100%" stopColor="#881337" stopOpacity={0.25} />
                </linearGradient>
                <linearGradient id="crimsonGlowGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9f1239" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#5c081e" stopOpacity={0.15} />
                </linearGradient>
                <linearGradient id="crimsonGlowGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5c081e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2a040d" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <YAxis
                orientation="right"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 100 ? `₹${v}k` : `${v}k`)}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#101013] border border-white/10 rounded-xl p-2.5 text-xs shadow-xl">
                        <span className="text-[#fb7185] font-bold block">
                          Growth Level: ₹{payload[0]?.value}k
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area type="monotone" dataKey="layer4" stroke="#fb7185" strokeWidth={2.5} fill="url(#crimsonGlowGrad4)" />
              <Area type="monotone" dataKey="layer3" stroke="none" fill="url(#crimsonGlowGrad3)" />
              <Area type="monotone" dataKey="layer2" stroke="none" fill="url(#crimsonGlowGrad2)" />
              <Area type="monotone" dataKey="layer1" stroke="none" fill="url(#crimsonGlowGrad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Service-Wise Revenue Breakdown List (from user requirement) */}
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-xs pb-1">
          <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
            Service-Wise Revenue
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">Breakdown</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {serviceBreakdown.map((s) => (
            <div key={s.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-zinc-300 font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-white font-semibold">{formatCurrency(s.amount)}</span>
                  <span className="text-zinc-500 text-[10px] w-7 text-right">{s.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recommendations / Action Cards */}
      <div className="pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-semibold text-white tracking-wide">
            Recommendations
          </h4>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCarouselIndex((prev) => (prev > 0 ? prev - 1 : 1))}
              className="w-6 h-6 rounded-full bg-[#222226] hover:bg-[#2d2d33] flex items-center justify-center text-zinc-300 transition"
              aria-label="Previous"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => setCarouselIndex((prev) => (prev < 1 ? prev + 1 : 0))}
              className="w-6 h-6 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center shadow-sm transition"
              aria-label="Next"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2 Mini Action Cards: Crimson & White */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={onOpenPayment}
            className="neo-card-crimson p-3.5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div>
              <span className="text-base font-bold font-sans tracking-tight text-white block">
                {formatCurrency(totalRevenue)}
              </span>
              <span className="text-[10px] font-semibold text-rose-200 flex items-center gap-0.5 mt-0.5">
                {totalRevenue > 0 ? '+8.92%' : '₹0'} <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[10px] font-semibold text-white mt-3 leading-tight">
              + Record Inflow
            </p>
          </div>

          <div
            onClick={onOpenInvoice}
            className="neo-card-white p-3.5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div>
              <span className="text-base font-bold font-sans tracking-tight text-black block">
                {paidInvoicesCount} Invoices
              </span>
              <span className="text-[10px] font-semibold text-[#e11d48] flex items-center gap-0.5 mt-0.5">
                {paidInvoicesCount > 0 ? '+5.23%' : '0 paid'} <TrendingUp className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[10px] font-semibold text-zinc-800 mt-3 leading-tight">
              View Invoices ↗
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
