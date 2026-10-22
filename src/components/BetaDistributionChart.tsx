/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * UI Philosophy: "Cozy Derma-Nook" (Animal Crossing / Retro-Web Desktop)
 * Component: BetaDistributionChart.tsx
 * Interactive SVG Beta(α, β) PDF Visualizer with 95% HDI Marker
 */

import React from 'react';
import { betaPdf } from '../utils/bayesianEngine';

interface BetaDistributionChartProps {
  readonly alpha: number;
  readonly beta: number;
  readonly credibleInterval: readonly [number, number];
  readonly isSelected?: boolean;
}

export const BetaDistributionChart: React.FC<BetaDistributionChartProps> = ({
  alpha,
  beta,
  credibleInterval,
  isSelected = false,
}) => {
  const width = 240;
  const height = 90;
  const padding = 10;
  const pointsCount = 60;

  // Compute PDF values across [0.01, 0.99]
  const xs: number[] = [];
  const ys: number[] = [];
  let maxY = 0.01;

  for (let i = 0; i <= pointsCount; i++) {
    const x = 0.01 + (i / pointsCount) * 0.98;
    const y = Math.min(15, betaPdf(x, alpha, beta)); // Cap extreme spikes for stable rendering
    xs.push(x);
    ys.push(y);
    if (y > maxY) maxY = y;
  }

  // Map to SVG coordinates
  const scaleX = (x: number): number => padding + x * (width - 2 * padding);
  const scaleY = (y: number): number =>
    height - padding - (y / maxY) * (height - 2 * padding);

  let pathD = `M ${scaleX(xs[0])} ${height - padding}`;
  for (let i = 0; i < xs.length; i++) {
    pathD += ` L ${scaleX(xs[i])} ${scaleY(ys[i])}`;
  }
  pathD += ` L ${scaleX(xs[xs.length - 1])} ${height - padding} Z`;

  // Credible interval coordinates
  const ciLowX = scaleX(credibleInterval[0]);
  const ciHighX = scaleX(credibleInterval[1]);

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-20 overflow-visible"
        aria-label={`Beta(${alpha.toFixed(1)}, ${beta.toFixed(1)}) distribution curve`}
      >
        <defs>
          <linearGradient id={`grad-${alpha}-${beta}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={isSelected ? '#5B7052' : '#A3B899'}
              stopOpacity="0.45"
            />
            <stop
              offset="100%"
              stopColor={isSelected ? '#5B7052' : '#A3B899'}
              stopOpacity="0.05"
            />
          </linearGradient>
        </defs>

        {/* Shaded 95% HDI region */}
        <rect
          x={ciLowX}
          y={padding}
          width={Math.max(1, ciHighX - ciLowX)}
          height={height - 2 * padding}
          fill="#A3B899"
          fillOpacity="0.25"
          rx="2"
        />

        {/* Beta PDF Curve */}
        <path
          d={pathD}
          fill={`url(#grad-${alpha}-${beta})`}
          stroke={isSelected ? '#5B7052' : '#7C6044'}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* 95% HDI vertical bounds */}
        <line
          x1={ciLowX}
          y1={padding}
          x2={ciLowX}
          y2={height - padding}
          stroke="#5B7052"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
        <line
          x1={ciHighX}
          y1={padding}
          x2={ciHighX}
          y2={height - padding}
          stroke="#5B7052"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />

        {/* Baseline axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#D4CEBF"
          strokeWidth="1.5"
        />
      </svg>

      {/* Axis markers */}
      <div className="w-full flex justify-between text-[10px] text-[#7C6044] font-mono font-semibold px-1">
        <span>0.0</span>
        <span className="text-[#5B7052] font-bold">
          95% HDI: [{credibleInterval[0].toFixed(2)}, {credibleInterval[1].toFixed(2)}]
        </span>
        <span>1.0</span>
      </div>
    </div>
  );
};
