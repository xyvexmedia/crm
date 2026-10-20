'use client';

import React from 'react';

interface ArcGaugeProps {
  percentage?: number; // 0 - 100
  icon?: React.ReactNode;
  size?: number;
  strokeColor?: string;
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({
  percentage = 75,
  icon,
  size = 40,
  strokeColor = '#e11d48',
}) => {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Crimson / Rose Active Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Centered Icon */}
      {icon && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          {icon}
        </div>
      )}
    </div>
  );
};
