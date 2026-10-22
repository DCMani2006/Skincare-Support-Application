/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * UI Philosophy: "Cozy Derma-Nook" (Animal Crossing / Retro-Web Desktop)
 * Course: BAMAT207 (Probability & Statistics)
 * Validation Suite: Modules 3, 4, and 5 Interactive Botanical Proofs
 */

import React, { useState } from 'react';
import type { DailyLogEntry, RoutineArchetype, SkinFeel, WeatherRegime } from '../types/dermaSync';
import {
  performChiSquareTest,
  estimateLogisticRegression,
  performOneWayAnova,
} from '../utils/statisticalValidation';

interface StatisticalValidationSuiteProps {
  readonly logs: readonly DailyLogEntry[];
}

export const StatisticalValidationSuite: React.FC<StatisticalValidationSuiteProps> = ({ logs }) => {
  const [activeTab, setActiveTab] = useState<'module3' | 'module4' | 'module5' | 'ledger'>('module3');

  // Dynamic calculations
  const chiResult = performChiSquareTest(logs);
  const logitResult = estimateLogisticRegression(logs);
  const anovaResult = performOneWayAnova(logs);

  // Interactive risk simulator for Logistic Regression
  const [simHumidity, setSimHumidity] = useState<number>(30);
  const [simUv, setSimUv] = useState<number>(7);
  const simRisk = logitResult.predictDiscomfortProbability(simHumidity, simUv);

  const regimes: readonly WeatherRegime[] = ['arid', 'temperate', 'humid'];
  const feels: readonly SkinFeel[] = ['balanced', 'tight_dry', 'greasy_clogged', 'stinging_irritated'];
  const archetypes: readonly RoutineArchetype[] = [
    'barrier_recovery',
    'lightweight_hydration',
    'deep_nourish',
    'pore_clarifying',
    'gentle_exfoliation',
  ];

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)]">
      {/* Header and Course Identifier */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b-2 border-[#EFE8D8] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider bg-[#E8EFE3] text-[#5B7052] border border-[#A3B899] rounded-full">
              BAMAT207 Proof Ledger
            </span>
            <span className="text-xs text-[#6B5B52] font-mono font-semibold">
              Sample Size: N = {logs.length} observations
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#3D312A] mt-1">
            Inferential Statistical Proofs & Hypothesis Testing
          </h2>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#EFE8D8] p-1.5 rounded-2xl border-2 border-[#D4CEBF] text-xs font-bold font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('module3')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'module3'
                ? 'bg-[#5B7052] text-white shadow-xs'
                : 'text-[#6B5B52] hover:text-[#3D312A]'
            }`}
          >
            Mod 3: χ² Test
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('module4')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'module4'
                ? 'bg-[#5B7052] text-white shadow-xs'
                : 'text-[#6B5B52] hover:text-[#3D312A]'
            }`}
          >
            Mod 4: Logistic Reg
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('module5')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'module5'
                ? 'bg-[#5B7052] text-white shadow-xs'
                : 'text-[#6B5B52] hover:text-[#3D312A]'
            }`}
          >
            Mod 5: ANOVA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-[#5B7052] text-white shadow-xs'
                : 'text-[#6B5B52] hover:text-[#3D312A]'
            }`}
          >
            Data Ledger
          </button>
        </div>
      </div>

      {/* Tab 1: Chi-Square Test */}
      {activeTab === 'module3' && (
        <div className="mt-6 space-y-6">
          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF]">
            <h3 className="text-sm font-bold text-[#3D312A] flex items-center justify-between">
              <span>Dynamic Test of Independence: [Atmospheric Regime] × [Epidermal Response]</span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-mono font-bold border-2 ${
                  chiResult.isSignificant
                    ? 'bg-[#E8EFE3] text-[#2A3B24] border-[#5B7052]'
                    : 'bg-[#FEF9E7] text-[#7C6044] border-[#E9B872]'
                }`}
              >
                {chiResult.isSignificant
                  ? 'Significant Association (p < 0.05)'
                  : 'Fail to Reject H₀ (p ≥ 0.05)'}
              </span>
            </h3>
            <p className="text-xs text-[#6B5B52] mt-1 font-medium">
              Tests H₀: Epicutaneous symptom distribution is statistically independent of meteorological moisture regime.
            </p>
          </div>

          {/* Contingency Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border-2 border-[#D4CEBF] rounded-2xl overflow-hidden shadow-xs">
              <thead className="bg-[#EFE8D8] text-[#5E4630] font-mono uppercase font-bold">
                <tr>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF]">Weather Regime</th>
                  {feels.map((feel) => (
                    <th key={feel} className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">
                      {feel.replace('_', ' ')}
                      <span className="block text-[10px] text-[#7C6044] lowercase font-semibold">
                        (Observed / Expected)
                      </span>
                    </th>
                  ))}
                  <th className="p-3 border-b-2 border-[#D4CEBF] text-center text-[#7C6044]">
                    Row Sum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#EFE8D8] font-mono">
                {regimes.map((regime) => {
                  const rowSum = feels.reduce(
                    (sum, feel) => sum + chiResult.contingencyTable[regime][feel],
                    0
                  );
                  return (
                    <tr key={regime} className="hover:bg-[#FEF9E7]">
                      <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#3D312A] uppercase">
                        {regime}
                      </td>
                      {feels.map((feel) => {
                        const obs = chiResult.contingencyTable[regime][feel];
                        const exp = chiResult.expectedTable[regime][feel];
                        return (
                          <td key={feel} className="p-3 border-r-2 border-[#D4CEBF] text-center">
                            <span className="text-[#3D312A] font-bold">{obs}</span>
                            <span className="text-[#6B5B52] text-[11px] ml-1.5 font-semibold">
                              ({exp.toFixed(1)})
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-3 border-[#D4CEBF] text-center font-bold text-[#5B7052]">
                        {rowSum}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Test Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                χ² Test Statistic
              </span>
              <div className="text-xl font-bold font-mono text-[#5B7052] mt-1">
                {chiResult.chiSquare.toFixed(4)}
              </div>
              <span className="text-[10px] text-[#6B5B52]">∑ (O - E)² / E</span>
            </div>
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                Degrees of Freedom
              </span>
              <div className="text-xl font-bold font-mono text-[#3D312A] mt-1">
                df = {chiResult.degreesOfFreedom}
              </div>
              <span className="text-[10px] text-[#6B5B52]">(r - 1) × (c - 1) = 2 × 3</span>
            </div>
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                Critical Value (α = 0.05)
              </span>
              <div className="text-xl font-bold font-mono text-[#7C6044] mt-1">
                {chiResult.criticalValue95.toFixed(3)}
              </div>
              <span className="text-[10px] text-[#6B5B52]">χ²_crit(0.05, 6)</span>
            </div>
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                Asymptotic p-Value
              </span>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  chiResult.isSignificant ? 'text-[#5B7052]' : 'text-[#CF9C52]'
                }`}
              >
                {chiResult.pValue < 0.0001 ? '< 0.0001' : chiResult.pValue.toFixed(4)}
              </div>
              <span className="text-[10px] text-[#6B5B52]">Upper tail Incomplete Γ</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Logistic Regression */}
      {activeTab === 'module4' && (
        <div className="mt-6 space-y-6">
          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF]">
            <h3 className="text-sm font-bold text-[#3D312A]">
              Multiple Logistic Regression: Log-Odds of Cutaneous Discomfort
            </h3>
            <p className="text-xs text-[#7C6044] font-mono font-semibold mt-1">
              ln( p / (1 - p) ) = {logitResult.coefficients.intercept.toFixed(3)} + ({logitResult.coefficients.humidityCoef.toFixed(4)}) · Humidity + ({logitResult.coefficients.uvCoef.toFixed(4)}) · UV Index
            </p>
          </div>

          {/* Model Parameter Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border-2 border-[#D4CEBF] rounded-2xl overflow-hidden font-mono shadow-xs">
              <thead className="bg-[#EFE8D8] text-[#5E4630] uppercase font-bold">
                <tr>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF]">Predictor Variable</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Coefficient (β)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Odds Ratio (e^β)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Std Error (SE)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Wald z</th>
                  <th className="p-3 border-b-2 border-[#D4CEBF] text-center">p-Value</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#EFE8D8]">
                <tr>
                  <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#3D312A]">
                    Intercept (β₀)
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#3D312A] font-semibold">
                    {logitResult.coefficients.intercept.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">—</td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {logitResult.standardErrors.intercept.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#3D312A]">
                    {logitResult.zValues.intercept.toFixed(3)}
                  </td>
                  <td className="p-3 border-[#D4CEBF] text-center font-semibold">
                    {logitResult.pValues.intercept.toFixed(4)}
                  </td>
                </tr>
                <tr className="bg-[#F0F7F7]">
                  <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#2C525A]">
                    Relative Humidity (% RH, β₁)
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#2C525A] font-bold">
                    {logitResult.coefficients.humidityCoef.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#2C525A] font-bold">
                    {logitResult.oddsRatios.humidityOR.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {logitResult.standardErrors.humidityCoef.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#2C525A]">
                    {logitResult.zValues.humidityCoef.toFixed(3)}
                  </td>
                  <td className="p-3 border-[#D4CEBF] text-center font-semibold">
                    {logitResult.pValues.humidityCoef.toFixed(4)}
                  </td>
                </tr>
                <tr className="bg-[#FFFBF0]">
                  <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#7C6044]">
                    Solar UV Index (β₂)
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#7C6044] font-bold">
                    {logitResult.coefficients.uvCoef.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#CF9C52] font-bold">
                    {logitResult.oddsRatios.uvOR.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {logitResult.standardErrors.uvCoef.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#7C6044]">
                    {logitResult.zValues.uvCoef.toFixed(3)}
                  </td>
                  <td className="p-3 border-[#D4CEBF] text-center font-semibold">
                    {logitResult.pValues.uvCoef.toFixed(4)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Model Fit Diagnostics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                Residual Deviance
              </span>
              <div className="text-xl font-bold font-mono text-[#5B7052] mt-1">
                {logitResult.deviance.toFixed(2)}
              </div>
              <span className="text-[10px] text-[#6B5B52]">
                Null Dev: {logitResult.nullDeviance.toFixed(2)}
              </span>
            </div>
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                Akaike Info Criterion (AIC)
              </span>
              <div className="text-xl font-bold font-mono text-[#3D312A] mt-1">
                {logitResult.aic.toFixed(2)}
              </div>
              <span className="text-[10px] text-[#6B5B52]">Deviance + 2k (k=3)</span>
            </div>
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                IRLS Iterations
              </span>
              <div className="text-xl font-bold font-mono text-[#7C6044] mt-1">
                {logitResult.iterations}
              </div>
              <span className="text-[10px] text-[#6B5B52]">
                {logitResult.converged ? '✓ Converged (Tol < 1e-6)' : 'In progress'}
              </span>
            </div>
            <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF] shadow-xs">
              <span className="text-[11px] text-[#7C6044] font-mono font-bold uppercase">
                L2 Ridge Stabilization
              </span>
              <div className="text-xl font-bold font-mono text-[#5B7052] mt-1">
                λ = 1e-4
              </div>
              <span className="text-[10px] text-[#6B5B52]">Hessian Positive-Definite</span>
            </div>
          </div>

          {/* Interactive Discomfort Probability Calculator */}
          <div className="bg-[#FDFBF7] p-5 rounded-2xl border-2 border-[#D4CEBF] space-y-4 shadow-inner">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#3D312A] font-mono flex items-center justify-between">
              <span>Interactive Meteorological Discomfort Risk Evaluator</span>
              <span className="text-[#5B7052] font-mono text-sm font-bold bg-[#E8EFE3] px-2.5 py-0.5 rounded-full border border-[#A3B899]">
                P(Discomfort) = {(simRisk * 100).toFixed(1)}%
              </span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-xs text-[#6B5B52] mb-1 font-semibold">
                  <span>Simulated Relative Humidity</span>
                  <span className="font-mono text-[#3D312A] font-bold">{simHumidity}% RH</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={simHumidity}
                  onChange={(e) => setSimHumidity(Number(e.target.value))}
                  className="w-full accent-[#5B7052] cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#6B5B52] mb-1 font-semibold">
                  <span>Simulated Solar UV Index</span>
                  <span className="font-mono text-[#3D312A] font-bold">{simUv.toFixed(1)} UV</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={simUv}
                  onChange={(e) => setSimUv(Number(e.target.value))}
                  className="w-full accent-[#E9B872] cursor-pointer"
                />
              </div>
            </div>
            {/* Risk Bar */}
            <div className="w-full bg-[#EFE8D8] h-3 rounded-full overflow-hidden border border-[#D4CEBF]">
              <div
                className={`h-full transition-all duration-300 ${
                  simRisk > 0.6
                    ? 'bg-[#E11D48]'
                    : simRisk > 0.3
                    ? 'bg-[#E9B872]'
                    : 'bg-[#5B7052]'
                }`}
                style={{ width: `${Math.max(2, simRisk * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: One-Way ANOVA */}
      {activeTab === 'module5' && (
        <div className="mt-6 space-y-6">
          <div className="bg-[#F7F2E7] p-4 rounded-2xl border-2 border-[#D4CEBF]">
            <h3 className="text-sm font-bold text-[#3D312A] flex items-center justify-between">
              <span>One-Way ANOVA: Regimen Archetype vs. User Satisfaction Score</span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-mono font-bold border-2 ${
                  anovaResult.isSignificant
                    ? 'bg-[#E8EFE3] text-[#2A3B24] border-[#5B7052]'
                    : 'bg-[#FEF9E7] text-[#7C6044] border-[#E9B872]'
                }`}
              >
                {anovaResult.isSignificant
                  ? 'Significant Difference Detected (p < 0.05)'
                  : 'No Significant Variance (p ≥ 0.05)'}
              </span>
            </h3>
            <p className="text-xs text-[#6B5B52] mt-1 font-medium">
              Tests H₀: μ₁ = μ₂ = μ₃ = μ₄ = μ₅ (all prescribed archetypes yield equivalent satisfaction).
            </p>
          </div>

          {/* Group Descriptive Statistics */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border-2 border-[#D4CEBF] rounded-2xl overflow-hidden font-mono shadow-xs">
              <thead className="bg-[#EFE8D8] text-[#5E4630] uppercase font-bold">
                <tr>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF]">Routine Archetype</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Sample Size (n)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Mean Rating (ȳ)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Variance (s²)</th>
                  <th className="p-3 border-b-2 border-[#D4CEBF] text-center">Std Dev (s)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#EFE8D8]">
                {archetypes.map((archetype) => {
                  const stat = anovaResult.groupStats[archetype];
                  return (
                    <tr key={archetype} className="hover:bg-[#FEF9E7]">
                      <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#3D312A] uppercase">
                        {archetype.replace('_', ' ')}
                      </td>
                      <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#3D312A] font-semibold">
                        {stat.count}
                      </td>
                      <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#5B7052] font-bold">
                        {stat.mean > 0 ? stat.mean.toFixed(2) : '—'}
                      </td>
                      <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                        {stat.count > 1 ? stat.variance.toFixed(3) : '—'}
                      </td>
                      <td className="p-3 border-[#D4CEBF] text-center text-[#6B5B52]">
                        {stat.count > 1 ? stat.stdDev.toFixed(2) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Standard ANOVA Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border-2 border-[#D4CEBF] rounded-2xl overflow-hidden font-mono shadow-xs">
              <thead className="bg-[#EFE8D8] text-[#5E4630] uppercase font-bold">
                <tr>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF]">Source of Variation</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Sum of Squares (SS)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Degrees of Freedom (df)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">Mean Square (MS)</th>
                  <th className="p-3 border-b-2 border-r-2 border-[#D4CEBF] text-center">F-Statistic</th>
                  <th className="p-3 border-b-2 border-[#D4CEBF] text-center">p-Value</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#EFE8D8]">
                <tr>
                  <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#5B7052]">
                    Between Groups (Treatments)
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#3D312A] font-semibold">
                    {anovaResult.ssBetween.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {anovaResult.dfBetween}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#5B7052] font-bold">
                    {anovaResult.msBetween.toFixed(4)}
                  </td>
                  <td
                    rowSpan={2}
                    className="p-3 border-r-2 border-[#D4CEBF] text-center font-bold text-lg text-[#5B7052] align-middle bg-[#E8EFE3]/40"
                  >
                    F = {anovaResult.fStatistic.toFixed(3)}
                  </td>
                  <td
                    rowSpan={2}
                    className="p-3 border-[#D4CEBF] text-center font-bold text-lg align-middle bg-[#E8EFE3]/40"
                  >
                    <span
                      className={
                        anovaResult.isSignificant ? 'text-[#5B7052]' : 'text-[#CF9C52]'
                      }
                    >
                      {anovaResult.pValue < 0.0001
                        ? '< 0.0001'
                        : anovaResult.pValue.toFixed(4)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border-r-2 border-[#D4CEBF] font-bold text-[#6B5B52]">
                    Within Groups (Error)
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#3D312A] font-semibold">
                    {anovaResult.ssWithin.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">
                    {anovaResult.dfWithin}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52] font-mono">
                    {anovaResult.msWithin.toFixed(4)}
                  </td>
                </tr>
                <tr className="bg-[#EFE8D8] font-bold">
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-[#5E4630]">Total</td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#7C6044]">
                    {anovaResult.ssTotal.toFixed(4)}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#7C6044]">
                    {anovaResult.dfBetween + anovaResult.dfWithin}
                  </td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">—</td>
                  <td className="p-3 border-r-2 border-[#D4CEBF] text-center text-[#6B5B52]">—</td>
                  <td className="p-3 border-[#D4CEBF] text-center text-[#6B5B52]">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Historical Data Ledger */}
      {activeTab === 'ledger' && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-xs text-[#6B5B52] font-mono font-semibold">
            <span>Historical Chronological Telemetry & Feedback Log Ledger</span>
            <span>Total Logged Entries: {logs.length}</span>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left border-collapse border-2 border-[#D4CEBF] rounded-2xl overflow-hidden font-mono shadow-xs">
              <thead className="bg-[#EFE8D8] text-[#5E4630] sticky top-0 uppercase font-bold">
                <tr>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF]">Day</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF]">Date</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF]">Location & Telemetry</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF]">Humidity / UV</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF]">Prescribed Routine</th>
                  <th className="p-2.5 border-b-2 border-r-2 border-[#D4CEBF]">User Report</th>
                  <th className="p-2.5 border-b-2 border-[#D4CEBF] text-center">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#EFE8D8]">
                {logs.map((entry) => (
                  <tr key={entry.dayIndex} className="hover:bg-[#FEF9E7]">
                    <td className="p-2.5 border-r-2 border-[#D4CEBF] text-[#7C6044] font-bold">
                      #{entry.dayIndex}
                    </td>
                    <td className="p-2.5 border-r-2 border-[#D4CEBF] text-[#3D312A] font-medium">
                      {entry.date}
                    </td>
                    <td className="p-2.5 border-r-2 border-[#D4CEBF] text-[#6B5B52]">
                      {entry.weather.locationName}
                    </td>
                    <td className="p-2.5 border-r-2 border-[#D4CEBF] text-[#2C525A] font-semibold">
                      {entry.weather.humidity}% RH | UV {entry.weather.uvIndex}
                    </td>
                    <td className="p-2.5 border-r-2 border-[#D4CEBF] font-semibold text-[#3D312A]">
                      {entry.prescribedArchetype.replace('_', ' ')}
                    </td>
                    <td className="p-2.5 border-r-2 border-[#D4CEBF]">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          entry.userReport === 'balanced'
                            ? 'bg-[#E8EFE3] text-[#2A3B24] border-[#5B7052]'
                            : entry.userReport === 'tight_dry'
                            ? 'bg-[#FFFBF0] text-[#7C6044] border-[#E9B872]'
                            : entry.userReport === 'greasy_clogged'
                            ? 'bg-[#FFF6F2] text-[#692417] border-[#E8927C]'
                            : 'bg-[#FFF0F0] text-[#7F1D1D] border-[#E11D48]'
                        }`}
                      >
                        {entry.userReport.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-2.5 border-[#D4CEBF] text-center font-bold text-[#CF9C52]">
                      ★ {entry.satisfactionScore.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
