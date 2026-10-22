/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * UI Philosophy: "Cozy Derma-Nook" (Animal Crossing / Retro-Web Desktop)
 * Course: BAMAT207 (Probability & Statistics)
 * Component: AcademicInspector.tsx (Botanical Research Ledger & Mathematical Proofs)
 */

import React, { useState, useMemo } from 'react';
import katex from 'katex';
import {
  Sparkles,
  BarChart2,
  TrendingUp,
  RotateCcw,
  CloudRain,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

import type {
  DailyLogEntry,
  RoutineArchetype,
  WeatherRegime,
} from '../types/dermaSync';
import {
  betaPdf,
  getBetaExpectation,
  getBetaVariance,
  REGIME_PRIORS,
  computeArchetypePosteriorState,
} from '../utils/bayesianEngine';
import {
  performChiSquareTest,
  estimateLogisticRegression,
  performOneWayAnova,
} from '../utils/statisticalValidation';
import {
  MONSOON_COHORT_LOGS,
  ARID_WINTER_COHORT_LOGS,
  createSensitiveSkinFlare,
} from '../data/simulationCohorts';

interface AcademicInspectorProps {
  readonly logs: readonly DailyLogEntry[];
  readonly onUpdateLogs: (newLogs: DailyLogEntry[]) => void;
  readonly onResetLogs: () => void;
  readonly currentRegime: WeatherRegime;
}

export const AcademicInspector: React.FC<AcademicInspectorProps> = ({
  logs,
  onUpdateLogs,
  onResetLogs,
  currentRegime,
}) => {
  // Selected archetype for Bayesian distribution inspection
  const [selectedArchetype, setSelectedArchetype] =
    useState<RoutineArchetype>('barrier_recovery');

  // Interactive risk simulator parameters for Logistic Regression
  const [simHumidity, setSimHumidity] = useState<number>(30);
  const [simUv, setSimUv] = useState<number>(7.0);

  // Active Cohort Tag
  const [activeCohortTag, setActiveCohortTag] = useState<string>('Baseline 14-Day Cohort');

  // ---------------------------------------------------------------------------
  // 1. Module 1 & 2: Bayesian Posterior Computation
  // ---------------------------------------------------------------------------
  const prior = REGIME_PRIORS[currentRegime][selectedArchetype];
  const posteriorState = useMemo(() => {
    return computeArchetypePosteriorState(selectedArchetype, currentRegime, logs);
  }, [selectedArchetype, currentRegime, logs]);

  const alpha0 = prior.alpha;
  const beta0 = prior.beta;
  const alpha1 = posteriorState.alpha;
  const beta1 = posteriorState.beta;
  const kSuccesses = Number((alpha1 - alpha0).toFixed(2));
  const nFailures = Number((beta1 - beta0).toFixed(2));
  const credibleInterval = posteriorState.credibleInterval;

  // Render LaTeX via KaTeX
  const katexPosteriorHtml = useMemo(() => {
    const tex = `\\text{Posterior: } \\text{Beta}(\\alpha_0 + k, \\, \\beta_0 + n - k) = \\text{Beta}(${alpha0.toFixed(1)} + ${kSuccesses}, \\, ${beta0.toFixed(1)} + ${nFailures}) = \\text{Beta}(${alpha1.toFixed(1)}, \\, ${beta1.toFixed(1)})`;
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode: true });
    } catch {
      return tex;
    }
  }, [alpha0, beta0, alpha1, beta1, kSuccesses, nFailures]);

  // SVG Coordinates Generator for Prior, Likelihood, and Posterior
  const svgWidth = 600;
  const svgHeight = 220;
  const padX = 35;
  const padY = 25;
  const numPoints = 80;

  const chartData = useMemo(() => {
    const xs: number[] = [];
    const priorYs: number[] = [];
    const postYs: number[] = [];
    const likeYs: number[] = [];

    let maxPostY = 0.01;

    // Likelihood mode and normalization
    const nTotal = kSuccesses + nFailures;
    const thetaHat = nTotal > 0 ? kSuccesses / nTotal : 0.5;

    for (let i = 0; i <= numPoints; i++) {
      const x = 0.01 + (i / numPoints) * 0.98;
      xs.push(x);

      const pY = betaPdf(x, alpha0, beta0);
      const postY = betaPdf(x, alpha1, beta1);
      priorYs.push(pY);
      postYs.push(postY);
      if (postY > maxPostY) maxPostY = postY;

      // Likelihood calculation
      if (nTotal > 0 && thetaHat > 0 && thetaHat < 1) {
        const likeVal =
          Math.pow(x / thetaHat, Math.max(0, kSuccesses)) *
          Math.pow((1 - x) / (1 - thetaHat), Math.max(0, nFailures));
        likeYs.push(likeVal);
      } else {
        likeYs.push(0.5);
      }
    }

    const scaleX = (x: number): number => padX + x * (svgWidth - 2 * padX);
    const scaleY = (y: number): number =>
      svgHeight - padY - (y / (maxPostY * 1.15)) * (svgHeight - 2 * padY);

    // Posterior Path
    let postPath = `M ${scaleX(xs[0])} ${scaleY(postYs[0])}`;
    for (let i = 1; i < xs.length; i++) {
      postPath += ` L ${scaleX(xs[i])} ${scaleY(postYs[i])}`;
    }

    // Shaded HDI Polygon under Posterior
    const hdiLeft = credibleInterval[0];
    const hdiRight = credibleInterval[1];
    let hdiPolygon = `M ${scaleX(hdiLeft)} ${svgHeight - padY}`;

    for (let i = 0; i < xs.length; i++) {
      if (xs[i] >= hdiLeft && xs[i] <= hdiRight) {
        hdiPolygon += ` L ${scaleX(xs[i])} ${scaleY(postYs[i])}`;
      }
    }
    hdiPolygon += ` L ${scaleX(hdiRight)} ${svgHeight - padY} Z`;

    // Prior Path (Dotted)
    let priorPath = `M ${scaleX(xs[0])} ${scaleY(priorYs[0])}`;
    for (let i = 1; i < xs.length; i++) {
      priorPath += ` L ${scaleX(xs[i])} ${scaleY(priorYs[i])}`;
    }

    // Likelihood Path (Normalized to maxPostY * 0.8)
    let likePath = `M ${scaleX(xs[0])} ${scaleY(likeYs[0] * maxPostY * 0.8)}`;
    for (let i = 1; i < xs.length; i++) {
      likePath += ` L ${scaleX(xs[i])} ${scaleY(likeYs[i] * maxPostY * 0.8)}`;
    }

    return {
      scaleX,
      postPath,
      priorPath,
      likePath,
      hdiPolygon,
      ciLowX: scaleX(hdiLeft),
      ciHighX: scaleX(hdiRight),
      meanX: scaleX(posteriorState.posteriorMean),
    };
  }, [alpha0, beta0, alpha1, beta1, credibleInterval, kSuccesses, nFailures, posteriorState.posteriorMean]);

  // ---------------------------------------------------------------------------
  // 2. Module 3: Chi-Square Test of Independence
  // ---------------------------------------------------------------------------
  const chiResult = useMemo(() => performChiSquareTest(logs), [logs]);

  // Construct a concise 2x2 table: [Arid vs Humid Weather] × [Balanced vs Discomfort Reports]
  const table2x2 = useMemo(() => {
    let aridBalanced = 0;
    let aridDiscomfort = 0;
    let humidBalanced = 0;
    let humidDiscomfort = 0;

    for (const log of logs) {
      if (log.weather.humidity < 40) {
        if (log.userReport === 'balanced') aridBalanced++;
        else aridDiscomfort++;
      } else if (log.weather.humidity > 70) {
        if (log.userReport === 'balanced') humidBalanced++;
        else humidDiscomfort++;
      }
    }

    const nTotal = aridBalanced + aridDiscomfort + humidBalanced + humidDiscomfort;
    const rowArid = aridBalanced + aridDiscomfort;
    const rowHumid = humidBalanced + humidDiscomfort;
    const colBal = aridBalanced + humidBalanced;
    const colDisc = aridDiscomfort + humidDiscomfort;

    const expAridBal = nTotal > 0 ? (rowArid * colBal) / nTotal : 0;
    const expAridDisc = nTotal > 0 ? (rowArid * colDisc) / nTotal : 0;
    const expHumidBal = nTotal > 0 ? (rowHumid * colBal) / nTotal : 0;
    const expHumidDisc = nTotal > 0 ? (rowHumid * colDisc) / nTotal : 0;

    let chi2 = 0;
    if (expAridBal > 0) chi2 += Math.pow(aridBalanced - expAridBal, 2) / expAridBal;
    if (expAridDisc > 0) chi2 += Math.pow(aridDiscomfort - expAridDisc, 2) / expAridDisc;
    if (expHumidBal > 0) chi2 += Math.pow(humidBalanced - expHumidBal, 2) / expHumidBal;
    if (expHumidDisc > 0) chi2 += Math.pow(humidDiscomfort - expHumidDisc, 2) / expHumidDisc;

    return {
      obs: {
        aridBal: aridBalanced,
        aridDisc: aridDiscomfort,
        humidBal: humidBalanced,
        humidDisc: humidDiscomfort,
      },
      exp: {
        aridBal: Number(expAridBal.toFixed(1)),
        aridDisc: Number(expAridDisc.toFixed(1)),
        humidBal: Number(expHumidBal.toFixed(1)),
        humidDisc: Number(expHumidDisc.toFixed(1)),
      },
      rowArid,
      rowHumid,
      colBal,
      colDisc,
      nTotal,
      chi2: Number(chi2.toFixed(3)),
    };
  }, [logs]);

  // ---------------------------------------------------------------------------
  // 3. Module 4 & 5: Logistic Regression & ANOVA
  // ---------------------------------------------------------------------------
  const logitResult = useMemo(() => estimateLogisticRegression(logs), [logs]);
  const anovaResult = useMemo(() => performOneWayAnova(logs), [logs]);

  const simRisk = logitResult.predictDiscomfortProbability(simHumidity, simUv);

  // ---------------------------------------------------------------------------
  // 4. Cohort Simulation Handlers
  // ---------------------------------------------------------------------------
  const handleSimulateMonsoon = (): void => {
    onUpdateLogs([...MONSOON_COHORT_LOGS]);
    setActiveCohortTag('14-Day Monsoon Cohort (High Humidity)');
  };

  const handleSimulateAridWinter = (): void => {
    onUpdateLogs([...ARID_WINTER_COHORT_LOGS]);
    setActiveCohortTag('14-Day Arid Winter Cohort (Low Humidity)');
  };

  const handleSimulateFlare = (): void => {
    const flared = createSensitiveSkinFlare(logs);
    onUpdateLogs(flared);
    setActiveCohortTag('Sensitive Skin Flare Injected (Stinging Triggered)');
  };

  const handleReset = (): void => {
    onResetLogs();
    setActiveCohortTag('Default Baseline 14-Day Ledger');
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* 1. Cohort Simulation Preset Bar (Stamp Buttons) */}
      <section className="bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-5 sm:p-6 shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#EFE8D8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-[#E8EFE3] text-[#5B7052] border border-[#A3B899]">
                🧪 Botanical Testbench
              </span>
              <span className="text-xs text-[#6B5B52] font-mono">
                Active Cohort: <strong className="text-[#3D312A]">{activeCohortTag}</strong> (N = {logs.length})
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#3D312A] mt-1">
              BAMAT207 Cohort Simulation Preset Bar
            </h2>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F7F2E7] hover:bg-[#EFE8D8] border-2 border-[#D4CEBF] text-xs text-[#5A432D] font-mono font-bold transition-all self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7C6044]" />
            Reset Baseline
          </button>
        </div>

        {/* 3 Preset Stamp Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={handleSimulateMonsoon}
            className="p-3.5 rounded-2xl bg-[#F0F7F7] hover:bg-[#E6F2F3] border-2 border-[#A2CCD4] hover:border-[#3E8594] text-left transition-all cursor-pointer flex items-center justify-between shadow-[0_2px_0_#A2CCD4] hover:-translate-y-0.5 group"
          >
            <div className="space-y-0.5">
              <div className="font-bold text-[#2C525A] flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-[#3E8594]" />
                Monsoon Cohort (14d)
              </div>
              <p className="text-[10px] text-[#557A82] font-sans font-medium">
                RH 80–92% • Sebum congestion bias
              </p>
            </div>
            <span className="text-[#3E8594] font-bold group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateAridWinter}
            className="p-3.5 rounded-2xl bg-[#FFFBF0] hover:bg-[#FEF6E4] border-2 border-[#F2D5A5] hover:border-[#CF9C52] text-left transition-all cursor-pointer flex items-center justify-between shadow-[0_2px_0_#F2D5A5] hover:-translate-y-0.5 group"
          >
            <div className="space-y-0.5">
              <div className="font-bold text-[#7C6044] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#CF9C52]" />
                Arid Winter Cohort (14d)
              </div>
              <p className="text-[10px] text-[#8C6F52] font-sans font-medium">
                RH 16–30% • TEWL & dryness bias
              </p>
            </div>
            <span className="text-[#CF9C52] font-bold group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateFlare}
            className="p-3.5 rounded-2xl bg-[#FFF0F0] hover:bg-[#FEE8E8] border-2 border-[#F8B4B4] hover:border-[#E11D48] text-left transition-all cursor-pointer flex items-center justify-between shadow-[0_2px_0_#F8B4B4] hover:-translate-y-0.5 group"
          >
            <div className="space-y-0.5">
              <div className="font-bold text-[#881337] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#E11D48]" />
                Sensitive Skin Flare
              </div>
              <p className="text-[10px] text-[#9F2F4E] font-sans font-medium">
                Stinging alert • Triggers Rule D
              </p>
            </div>
            <span className="text-[#E11D48] font-bold group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </section>

      {/* 2. Module 1 & 2: Bayesian Posterior Distribution Visualizer */}
      <section className="bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#EFE8D8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-[#E8EFE3] text-[#5B7052] border border-[#A3B899]">
                Module 1 & 2: Conjugate Bayesian Updating
              </span>
              <span className="text-xs text-[#6B5B52] font-mono font-semibold">
                Beta-Binomial Analytic Model
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#3D312A] mt-1">
              Interactive Probability Density Curves & 95% Credible Interval (HDI)
            </h3>
          </div>

          {/* Archetype Selector Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#F7F2E7] p-1.5 rounded-2xl border-2 border-[#D4CEBF] text-xs font-mono">
            {(
              [
                'barrier_recovery',
                'lightweight_hydration',
                'deep_nourish',
                'pore_clarifying',
                'gentle_exfoliation',
              ] as RoutineArchetype[]
            ).map((arch) => (
              <button
                key={arch}
                type="button"
                onClick={() => setSelectedArchetype(arch)}
                className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer font-bold ${
                  selectedArchetype === arch
                    ? 'bg-[#5B7052] text-white shadow-xs'
                    : 'text-[#6B5B52] hover:text-[#3D312A] hover:bg-[#EFE8D8]'
                }`}
              >
                {arch.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Live KaTeX Mathematical Display */}
        <div className="p-4 rounded-2xl bg-[#F7F2E7] border-2 border-[#D4CEBF] text-center overflow-x-auto shadow-inner">
          <div
            dangerouslySetInnerHTML={{ __html: katexPosteriorHtml }}
            className="text-[#3D312A] py-1 font-semibold"
          />
        </div>

        {/* SVG Probability Density Visualizer */}
        <div className="bg-[#FDFBF7] p-5 rounded-2xl border-2 border-[#D4CEBF] space-y-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[#6B5B52] gap-2 font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b-2 border-dotted border-[#8C7E72]" />
                Prior Beta({alpha0.toFixed(1)}, {beta0.toFixed(1)})
              </span>
              <span className="flex items-center gap-1.5 text-[#7C6044]">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-[#E9B872]" />
                Normalized Likelihood L(θ)
              </span>
              <span className="flex items-center gap-1.5 text-[#5B7052] font-bold">
                <span className="w-3 h-1 bg-[#5B7052] rounded-full" />
                Posterior Beta({alpha1.toFixed(1)}, {beta1.toFixed(1)})
              </span>
            </div>
            <span className="text-[#5B7052] font-bold bg-[#E8EFE3] px-2.5 py-0.5 rounded-full border border-[#A3B899]">
              Shaded: 95% HDI [{credibleInterval[0].toFixed(2)}, {credibleInterval[1].toFixed(2)}]
            </span>
          </div>

          {/* SVG Canvas Curve */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-52 overflow-visible"
              aria-label="Bayesian Beta PDF plot"
            >
              <defs>
                <linearGradient id="sageHdiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A3B899" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#A3B899" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Shaded 95% HDI Polygon */}
              <path d={chartData.hdiPolygon} fill="url(#sageHdiGrad)" />

              {/* Dotted Warm Taupe Prior Curve */}
              <path
                d={chartData.priorPath}
                fill="none"
                stroke="#8C7E72"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Dashed Honey Gold Likelihood Curve */}
              {kSuccesses + nFailures > 0 && (
                <path
                  d={chartData.likePath}
                  fill="none"
                  stroke="#E9B872"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              )}

              {/* Solid Matcha/Forest Sage Posterior Curve */}
              <path
                d={chartData.postPath}
                fill="none"
                stroke="#5B7052"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertical Guide: Credible Interval Bounds & Posterior Mean */}
              <line
                x1={chartData.ciLowX}
                y1={padY}
                x2={chartData.ciLowX}
                y2={svgHeight - padY}
                stroke="#5B7052"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line
                x1={chartData.ciHighX}
                y1={padY}
                x2={chartData.ciHighX}
                y2={svgHeight - padY}
                stroke="#5B7052"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <line
                x1={chartData.meanX}
                y1={padY}
                x2={chartData.meanX}
                y2={svgHeight - padY}
                stroke="#7C6044"
                strokeWidth="2"
              />

              {/* Bottom Axis Line */}
              <line
                x1={padX}
                y1={svgHeight - padY}
                x2={svgWidth - padX}
                y2={svgHeight - padY}
                stroke="#D4CEBF"
                strokeWidth="2"
              />
            </svg>

            {/* Scale Ticks */}
            <div className="flex justify-between text-[11px] font-mono font-semibold text-[#6B5B52] px-6 mt-1">
              <span>θ = 0.0</span>
              <span className="text-[#8C7E72]">0.25</span>
              <span className="text-[#5B7052] font-bold bg-[#E8EFE3] px-2 rounded">
                E[θ] = {posteriorState.posteriorMean.toFixed(3)}
              </span>
              <span className="text-[#8C7E72]">0.75</span>
              <span>θ = 1.0</span>
            </div>
          </div>
        </div>

        {/* Live Mathematical Readout Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
            <span className="text-[10px] text-[#7C6044] font-bold uppercase tracking-wider block">
              Prior Expectation E₀[θ]
            </span>
            <div className="text-xl font-bold text-[#7C6044] mt-1">
              {(getBetaExpectation(alpha0, beta0) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-[#6B5B52]">α₀ / (α₀ + β₀)</span>
          </div>

          <div className="bg-[#FEF9E7] p-4 rounded-2xl border-2 border-[#E9B872] shadow-xs">
            <span className="text-[10px] text-[#7C6044] font-bold uppercase tracking-wider block">
              Evidence Logged
            </span>
            <div className="text-xl font-bold text-[#E9B872] mt-1">
              +{kSuccesses} S / +{nFailures} F
            </div>
            <span className="text-[10px] text-[#6B5B52]">Daily check-ins</span>
          </div>

          <div className="bg-[#E8EFE3] p-4 rounded-2xl border-2 border-[#A3B899] shadow-xs">
            <span className="text-[10px] text-[#3E4E37] font-bold uppercase tracking-wider block">
              Posterior Mean E[θ]
            </span>
            <div className="text-xl font-bold text-[#5B7052] mt-1">
              {(posteriorState.posteriorMean * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-[#3E4E37]">α₁ / (α₁ + β₁)</span>
          </div>

          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
            <span className="text-[10px] text-[#7C6044] font-bold uppercase tracking-wider block">
              Posterior Variance Var(θ)
            </span>
            <div className="text-xl font-bold text-[#3D312A] mt-1">
              {getBetaVariance(alpha1, beta1).toFixed(4)}
            </div>
            <span className="text-[10px] text-[#6B5B52]">
              Precision: {(1 / getBetaVariance(alpha1, beta1)).toFixed(1)}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Module 3: Hypothesis Testing Card (Chi-Square Test of Independence) */}
      <section className="bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[#EFE8D8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-[#EFE8D8] text-[#5E4630] border border-[#D4CEBF]">
                Module 3: Hypothesis Testing
              </span>
              <span className="text-xs text-[#6B5B52] font-mono font-semibold">
                Contingency Analysis
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#3D312A] mt-1">
              Chi-Square (χ²) Test of Independence: Weather vs. Skin Complaint
            </h3>
          </div>

          {/* Hypothesis Verdict Badge */}
          <div
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border-2 shadow-xs ${
              chiResult.isSignificant
                ? 'bg-[#E8EFE3] text-[#2A3B24] border-[#5B7052]'
                : 'bg-[#FEF9E7] text-[#5E4630] border-[#CF9C52]'
            }`}
          >
            {chiResult.isSignificant ? (
              <CheckCircle2 className="w-4 h-4 text-[#5B7052]" />
            ) : (
              <XCircle className="w-4 h-4 text-[#CF9C52]" />
            )}
            <span>
              {chiResult.isSignificant
                ? `Reject H₀ (p = ${chiResult.pValue.toFixed(3)} < 0.05)`
                : `Fail to Reject H₀ (p = ${chiResult.pValue.toFixed(3)} ≥ 0.05)`}
            </span>
          </div>
        </div>

        {/* 2x2 Contingency Table (Botanical Ledger Table) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-[#6B5B52]">
            <span>2×2 Contingency Matrix (Observed Count / Expected Frequency)</span>
            <span className="text-[#7C6044]">Formula: E = (Row Total × Col Total) / N</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border-2 border-[#D4CEBF] rounded-2xl overflow-hidden font-mono shadow-xs">
              <thead className="bg-[#EFE8D8] text-[#5E4630] uppercase font-bold">
                <tr>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF]">Weather Regime</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">
                    Balanced Reports (O / E)
                  </th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">
                    Discomfort Complaints (O / E)
                  </th>
                  <th className="p-3 border-b-2 border-[#D4CEBF] text-center text-[#7C6044]">
                    Row Marginal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#EFE8D8]">
                <tr className="bg-[#FFFBF0] hover:bg-[#FEF6E4]">
                  <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#7C6044]">
                    Arid Weather (RH &lt; 40%)
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center">
                    <span className="text-[#3D312A] font-bold text-sm">{table2x2.obs.aridBal}</span>
                    <span className="text-[#6B5B52] text-xs ml-1.5">({table2x2.exp.aridBal})</span>
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center">
                    <span className="text-[#3D312A] font-bold text-sm">{table2x2.obs.aridDisc}</span>
                    <span className="text-[#6B5B52] text-xs ml-1.5">({table2x2.exp.aridDisc})</span>
                  </td>
                  <td className="p-3 border-[#D4CEBF] text-center font-bold text-[#3D312A]">
                    {table2x2.rowArid}
                  </td>
                </tr>

                <tr className="bg-[#F0F7F7] hover:bg-[#E6F2F3]">
                  <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#2C525A]">
                    Humid Weather (RH &gt; 70%)
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center">
                    <span className="text-[#3D312A] font-bold text-sm">{table2x2.obs.humidBal}</span>
                    <span className="text-[#6B5B52] text-xs ml-1.5">({table2x2.exp.humidBal})</span>
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center">
                    <span className="text-[#3D312A] font-bold text-sm">{table2x2.obs.humidDisc}</span>
                    <span className="text-[#6B5B52] text-xs ml-1.5">({table2x2.exp.humidDisc})</span>
                  </td>
                  <td className="p-3 border-[#D4CEBF] text-center font-bold text-[#3D312A]">
                    {table2x2.rowHumid}
                  </td>
                </tr>

                <tr className="bg-[#EFE8D8] font-bold">
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-[#5E4630]">Column Marginal</td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#5B7052]">
                    {table2x2.colBal}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#881337]">
                    {table2x2.colDisc}
                  </td>
                  <td className="p-3 border-[#D4CEBF] text-center text-[#7C6044]">
                    N = {table2x2.nTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistical Test Metrics & Formula Verdict */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
            <span className="text-[10px] text-[#7C6044] font-bold uppercase tracking-wider block">
              χ² Test Statistic
            </span>
            <div className="text-xl font-bold text-[#5B7052] mt-1">
              χ² = {chiResult.chiSquare.toFixed(3)}
            </div>
            <span className="text-[10px] text-[#6B5B52]">∑ (O - E)² / E</span>
          </div>

          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
            <span className="text-[10px] text-[#7C6044] font-bold uppercase tracking-wider block">
              Degrees of Freedom (df)
            </span>
            <div className="text-xl font-bold text-[#3D312A] mt-1">
              df = {chiResult.degreesOfFreedom}
            </div>
            <span className="text-[10px] text-[#6B5B52]">Critical Value: {chiResult.criticalValue95}</span>
          </div>

          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
            <span className="text-[10px] text-[#7C6044] font-bold uppercase tracking-wider block">
              Asymptotic p-Value
            </span>
            <div
              className={`text-xl font-bold mt-1 ${
                chiResult.isSignificant ? 'text-[#5B7052]' : 'text-[#CF9C52]'
              }`}
            >
              p = {chiResult.pValue < 0.001 ? '< 0.001' : chiResult.pValue.toFixed(3)}
            </div>
            <span className="text-[10px] text-[#6B5B52]">Upper tail Incomplete Γ</span>
          </div>
        </div>

        {/* Explicit Hypothesis Statement Card */}
        <div className="p-4 rounded-2xl bg-[#FEF9E7] border-2 border-[#E9B872] flex items-start gap-3 text-xs font-sans shadow-xs">
          <HelpCircle className="w-5 h-5 text-[#E9B872] shrink-0 mt-0.5" />
          <p className="text-[#3D312A] leading-relaxed font-medium">
            <strong className="text-[#7C6044]">Hypothesis Verdict: </strong>
            {chiResult.isSignificant ? (
              <span className="text-[#2A3B24] font-bold">
                Reject H₀: Skin complaints are statistically dependent on weather regime (p = {chiResult.pValue.toFixed(3)} &lt; 0.05). Atmospheric humidity significantly modulates epidermal symptom presentation.
              </span>
            ) : (
              <span className="text-[#7C6044] font-bold">
                Fail to reject H₀: Skin complaints are not statistically dependent on weather regime at α = 0.05 (p = {chiResult.pValue.toFixed(3)}). Insufficient evidence to rule out random variance.
              </span>
            )}
          </p>
        </div>
      </section>

      {/* 4. Module 4 & 5: Regression & ANOVA Summary */}
      <section className="bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)] space-y-6">
        <div className="pb-4 border-b-2 border-[#EFE8D8]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-[#EFE8D8] text-[#5E4630] border border-[#D4CEBF]">
              Module 4 & 5: Advanced Inference
            </span>
            <span className="text-xs text-[#6B5B52] font-mono font-semibold">
              Multiple Logistic Regression & One-Way ANOVA
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#3D312A] mt-1">
            Predictive Risk Modeling & Treatment Variance Analysis
          </h3>
        </div>

        {/* Module 4: Logistic Regression Odds Ratio Cards */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-[#6B5B52]">
            <span className="flex items-center gap-1.5 text-[#5B7052] font-bold uppercase">
              <TrendingUp className="w-3.5 h-3.5" />
              Module 4: Logistic Regression Odds Ratio Estimator
            </span>
            <span className="text-[#7C6044]">ln(p / (1 - p)) = β₀ + β₁·Humidity + β₂·UV</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            {/* Humidity Odds Ratio Card */}
            <div className="p-4 rounded-2xl bg-[#F0F7F7] border-2 border-[#A2CCD4] space-y-1 shadow-xs">
              <span className="text-[10px] text-[#2C525A] font-bold uppercase tracking-wider block">
                Humidity Protective Multiplier (e^β₁)
              </span>
              <div className="text-xl font-bold text-[#2C525A]">
                OR = {logitResult.oddsRatios.humidityOR.toFixed(3)}
              </div>
              <p className="text-[11px] text-[#41626A] font-sans font-medium leading-snug">
                Odds of skin discomfort increase by{' '}
                <strong className="text-[#2C525A] font-bold">
                  {(1 / Math.max(0.01, logitResult.oddsRatios.humidityOR)).toFixed(1)}x
                </strong>{' '}
                when humidity drops below 35% RH due to elevated TEWL.
              </p>
            </div>

            {/* UV Odds Ratio Card */}
            <div className="p-4 rounded-2xl bg-[#FFFBF0] border-2 border-[#F2D5A5] space-y-1 shadow-xs">
              <span className="text-[10px] text-[#7C6044] font-bold uppercase tracking-wider block">
                UV Irradiance Stress Multiplier (e^β₂)
              </span>
              <div className="text-xl font-bold text-[#CF9C52]">
                OR = {logitResult.oddsRatios.uvOR.toFixed(3)}
              </div>
              <p className="text-[11px] text-[#6B5B52] font-sans font-medium leading-snug">
                Each unit increase in solar UV Index elevates odds of epidermal barrier distress by{' '}
                <strong className="text-[#7C6044] font-bold">{logitResult.oddsRatios.uvOR.toFixed(2)}x</strong>.
              </p>
            </div>
          </div>

          {/* Interactive Discomfort Simulator Dial */}
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border-2 border-[#D4CEBF] space-y-3 font-mono text-xs shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-[#3D312A] font-bold">Simulate Ambient Conditions:</span>
              <span className="text-[#5B7052] font-bold text-sm bg-[#E8EFE3] px-2.5 py-0.5 rounded-full border border-[#A3B899]">
                Predicted P(Discomfort) = {(simRisk * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[#6B5B52] mb-1 text-[11px] font-semibold">
                  <span>Relative Humidity</span>
                  <span className="text-[#3D312A] font-bold">{simHumidity}% RH</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={simHumidity}
                  onChange={(e) => setSimHumidity(Number(e.target.value))}
                  className="w-full accent-[#5B7052] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[#6B5B52] mb-1 text-[11px] font-semibold">
                  <span>Solar UV Index</span>
                  <span className="text-[#3D312A] font-bold">{simUv.toFixed(1)} UV</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.5"
                  value={simUv}
                  onChange={(e) => setSimUv(Number(e.target.value))}
                  className="w-full accent-[#E9B872] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Module 5: One-Way ANOVA Summary */}
        <div className="space-y-3 pt-3 border-t-2 border-[#EFE8D8]">
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-[#6B5B52]">
            <span className="flex items-center gap-1.5 text-[#7C6044] font-bold uppercase">
              <BarChart2 className="w-3.5 h-3.5" />
              Module 5: One-Way ANOVA (Routine Archetype vs. Satisfaction)
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold border-2 ${
                anovaResult.isSignificant
                  ? 'bg-[#E8EFE3] text-[#2A3B24] border-[#5B7052]'
                  : 'bg-[#F7F2E7] text-[#6B5B52] border-[#D4CEBF]'
              }`}
            >
              {anovaResult.isSignificant ? 'Significant Variance (p < 0.05)' : 'No Significant Variance (p ≥ 0.05)'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border-2 border-[#D4CEBF] rounded-2xl overflow-hidden font-mono shadow-xs">
              <thead className="bg-[#EFE8D8] text-[#5E4630] uppercase font-bold">
                <tr>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF]">Source of Variation</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF] text-center">Sum of Squares (SS)</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF] text-center">Degrees of Freedom (df)</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF] text-center">Mean Square (MS)</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF] text-center">F-Statistic</th>
                  <th className="p-2.5 border-b-2 border-[#D4CEBF] text-center">p-Value</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#EFE8D8]">
                <tr className="bg-[#FFFFFF]">
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] font-bold text-[#5B7052]">
                    Between Groups (Treatments)
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#3D312A] font-semibold">
                    {anovaResult.ssBetween.toFixed(3)}
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {anovaResult.dfBetween}
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#5B7052] font-bold">
                    {anovaResult.msBetween.toFixed(3)}
                  </td>
                  <td
                    rowSpan={2}
                    className="p-2.5 border-r-2 border-[#D4CEBF] text-center font-bold text-base text-[#5B7052] align-middle bg-[#E8EFE3]/40"
                  >
                    F = {anovaResult.fStatistic.toFixed(3)}
                  </td>
                  <td
                    rowSpan={2}
                    className="p-2.5 border-[#D4CEBF] text-center font-bold text-base align-middle bg-[#E8EFE3]/40"
                  >
                    <span
                      className={
                        anovaResult.isSignificant ? 'text-[#5B7052]' : 'text-[#CF9C52]'
                      }
                    >
                      {anovaResult.pValue < 0.001
                        ? '< 0.001'
                        : anovaResult.pValue.toFixed(3)}
                    </span>
                  </td>
                </tr>
                <tr className="bg-[#FFFFFF]">
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] font-bold text-[#6B5B52]">
                    Within Groups (Error)
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#3D312A] font-semibold">
                    {anovaResult.ssWithin.toFixed(3)}
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {anovaResult.dfWithin}
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {anovaResult.msWithin.toFixed(3)}
                  </td>
                </tr>
                <tr className="bg-[#EFE8D8] font-bold">
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-[#5E4630]">Total</td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#7C6044]">
                    {anovaResult.ssTotal.toFixed(3)}
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#7C6044]">
                    {anovaResult.dfBetween + anovaResult.dfWithin}
                  </td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">—</td>
                  <td className="p-2.5 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">—</td>
                  <td className="p-2.5 border-[#D4CEBF] text-center text-[#6B5B52]">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
