/**
 * DermaSync: Principal Mathematical & Clinical Logic Self-Audit Suite
 * Course: BAMAT207 (Probability & Statistics)
 *
 * Executes four exhaustive verification suites across:
 *   - src/utils/bayesianEngine.ts
 *   - src/utils/regimenEngine.ts
 *   - src/utils/statisticalValidation.ts
 *   - src/services/weatherService.ts
 *   - src/data/skincareDatasets.ts
 */

import {
  logGamma,
  logBeta,
  betaPdf,
  regularizedIncompleteBeta,
  betaQuantile,
  calculateBetaCredibleInterval,
  getBetaExpectation,
  getBetaVariance,
  evaluateEvidenceIncrement,
} from '../src/utils/bayesianEngine';
import { generateDailyRoutine } from '../src/utils/regimenEngine';
import {
  performChiSquareTest,
  estimateLogisticRegression,
  performOneWayAnova,
} from '../src/utils/statisticalValidation';
import {
  calculateDewPoint,
  classifyWeatherRegime,
  classifyUVLevel,
} from '../src/services/weatherService';
import { evaluatePastHistoryAndAntidotes } from '../src/data/skincareDatasets';
import type { DailyLogEntry, WeatherTelemetry } from '../src/types/dermaSync';

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assertCondition(condition: boolean, description: string, details: string): void {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${description}`);
    console.log(`         -> ${details}`);
  } else {
    failedAssertions++;
    console.error(`  [FAIL] ${description}`);
    console.error(`         -> ${details}`);
  }
}

console.log('================================================================================');
console.log(' DERMASYNC PRINCIPAL MATHEMATICAL, NUMERICAL & CLINICAL LOGIC SELF-AUDIT');
console.log(' Course: BAMAT207 (Probability & Statistics)');
console.log('================================================================================\n');

// ============================================================================
// TEST SUITE 1: Conjugate Beta-Binomial Updating & Numerical Stability
// ============================================================================
console.log('--------------------------------------------------------------------------------');
console.log(' TEST SUITE 1: Conjugate Beta-Binomial Updating & Numerical Stability');
console.log('--------------------------------------------------------------------------------');

// 1.1 Asymptotic Convergence: Prior Beta(3, 7) + 100 consecutive 'balanced' check-ins
console.log('\n[1.1] Asymptotic Convergence (Prior Beta(alpha_0 = 3, beta_0 = 7), n = 100 successes):');
let alpha = 3.0;
let beta = 7.0;
const checkpoints = new Set([1, 14, 50, 100]);
const checkpointStates: Record<
  number,
  { alpha: number; beta: number; mean: number; variance: number; hdi: [number, number] }
> = {};

for (let day = 1; day <= 100; day++) {
  const { deltaAlpha, deltaBeta } = evaluateEvidenceIncrement('balanced', 'lightweight_hydration');
  alpha += deltaAlpha;
  beta += deltaBeta;

  if (checkpoints.has(day)) {
    const mean = getBetaExpectation(alpha, beta);
    const variance = getBetaVariance(alpha, beta);
    const hdi = calculateBetaCredibleInterval(alpha, beta, 0.95);
    checkpointStates[day] = { alpha, beta, mean, variance, hdi };
    console.log(
      `  Day ${String(day).padStart(3, ' ')} | alpha = ${alpha.toFixed(1).padStart(5, ' ')}, beta = ${beta.toFixed(1)} | ` +
        `E[theta] = ${mean.toFixed(8)} (${alpha}/${alpha + beta}) | Var(theta) = ${variance.toExponential(6)} | ` +
        `95% HDI = [${hdi[0].toFixed(6)}, ${hdi[1].toFixed(6)}]`
    );
  }
}

const day100 = checkpointStates[100];
const theoreticalMean100 = 103 / 110; // ~0.93636364
const theoreticalVar100 = (103 * 7) / (110 * 110 * 111); // ~0.00053751

assertCondition(
  Math.abs(day100.mean - theoreticalMean100) < 1e-12 && !Number.isNaN(day100.mean),
  'Day 100 Posterior Mean E[theta] converges to exact 103/110 (~0.936364)',
  `Computed E[theta] = ${day100.mean.toFixed(8)}, Theoretical = ${theoreticalMean100.toFixed(8)}, |diff| = ${Math.abs(day100.mean - theoreticalMean100).toExponential(3)}`
);

assertCondition(
  day100.variance < checkpointStates[1].variance &&
    day100.variance < 0.001 &&
    Math.abs(day100.variance - theoreticalVar100) < 1e-12 &&
    Number.isFinite(day100.variance),
  'Posterior Variance Var(theta) monotonically collapses toward 0 without NaN/overflow',
  `Day 1 Var = ${checkpointStates[1].variance.toFixed(6)} -> Day 14 Var = ${checkpointStates[14].variance.toFixed(6)} -> Day 50 Var = ${checkpointStates[50].variance.toFixed(6)} -> Day 100 Var = ${day100.variance.toFixed(8)}`
);

// 1.2 Log-Space Special Function Underflow Test: alpha = 120, beta = 80, theta = 0.60
console.log('\n[1.2] Log-Space Special Function Underflow Test (alpha = 120, beta = 80, theta = 0.60):');
const lg120 = logGamma(120);
const lg80 = logGamma(80);
const lg200 = logGamma(200);
const lb120_80 = logBeta(120, 80);
const densityAt060 = betaPdf(0.6, 120, 80);

// Note: Direct unlogged Gamma(200) = 199! ~ 3.94e372 > Number.MAX_VALUE (1.797e308), which would overflow to Infinity in naive implementations!
console.log(`  logGamma(120) = ${lg120.toFixed(8)}`);
console.log(`  logGamma(80)  = ${lg80.toFixed(8)}`);
console.log(`  logGamma(200) = ${lg200.toFixed(8)} (Note: direct 199! = 10^372.59 > IEEE-754 MAX_VALUE 10^308.25)`);
console.log(`  logBeta(120, 80) = ${lb120_80.toFixed(8)}`);
console.log(`  betaPdf(0.60; 120, 80) = ${densityAt060.toFixed(8)}`);

assertCondition(
  Number.isFinite(lg120) &&
    Number.isFinite(lg80) &&
    Number.isFinite(lg200) &&
    Number.isFinite(lb120_80) &&
    Number.isFinite(densityAt060) &&
    densityAt060 > 11.0 &&
    densityAt060 < 12.0,
  '7-Term Lanczos logGamma(z) & Beta PDF prevent IEEE-754 overflow/underflow at alpha=120, beta=80',
  `f(0.60; 120, 80) = ${densityAt060.toFixed(8)} (Finite, non-zero, peak mode near 119/198 = 0.6010)`
);

// 1.3 95% Highest Density Interval (HDI) Numerical Integration Proof for Beta(15, 7)
console.log('\n[1.3] 95% Highest Density Interval (HDI) Integration Proof for Beta(15, 7):');
const [hdiLower, hdiUpper] = calculateBetaCredibleInterval(15, 7, 0.95);
const hdiWidth = hdiUpper - hdiLower;

// Equal-tailed 95% interval for comparison of minimal width
const eqLower = betaQuantile(0.025, 15, 7);
const eqUpper = betaQuantile(0.975, 15, 7);
const eqWidth = eqUpper - eqLower;

// Numerical integration via Composite Simpson's Rule & Fine Riemann Trapezoidal Sum (step size dx ~ 0.001)
const nSteps = Math.max(2, Math.round((hdiUpper - hdiLower) / 0.001));
const evenSteps = nSteps % 2 === 0 ? nSteps : nSteps + 1;
const dx = (hdiUpper - hdiLower) / evenSteps;

let riemannMass = 0;
for (let i = 0; i < evenSteps; i++) {
  const xMid = hdiLower + (i + 0.5) * dx;
  riemannMass += betaPdf(xMid, 15, 7) * dx;
}

let simpsonMass = betaPdf(hdiLower, 15, 7) + betaPdf(hdiUpper, 15, 7);
for (let i = 1; i < evenSteps; i++) {
  const x = hdiLower + i * dx;
  simpsonMass += (i % 2 === 1 ? 4 : 2) * betaPdf(x, 15, 7);
}
simpsonMass *= dx / 3;

const exactCdfDiff =
  regularizedIncompleteBeta(hdiUpper, 15, 7) - regularizedIncompleteBeta(hdiLower, 15, 7);
const pdfAtLower = betaPdf(hdiLower, 15, 7);
const pdfAtUpper = betaPdf(hdiUpper, 15, 7);

console.log(`  Beta(15, 7) 95% HDI Bounds      : [${hdiLower.toFixed(6)}, ${hdiUpper.toFixed(6)}] (Width = ${hdiWidth.toFixed(6)})`);
console.log(`  Beta(15, 7) Equal-Tailed Bounds : [${eqLower.toFixed(6)}, ${eqUpper.toFixed(6)}] (Width = ${eqWidth.toFixed(6)})`);
console.log(`  Midpoint Riemann Sum (dx~0.001) : ${riemannMass.toFixed(8)}`);
console.log(`  Composite Simpson's Rule Mass   : ${simpsonMass.toFixed(8)}`);
console.log(`  Exact Incomplete Beta CDF Mass  : ${exactCdfDiff.toFixed(8)}`);
console.log(`  Boundary Densities              : f(theta_L) = ${pdfAtLower.toFixed(6)}, f(theta_U) = ${pdfAtUpper.toFixed(6)}`);

assertCondition(
  Math.abs(riemannMass - 0.95) <= 0.005 &&
    Math.abs(simpsonMass - 0.95) <= 0.005 &&
    hdiWidth < eqWidth,
  'Beta(15, 7) 95% HDI integrates to 0.95 +/- 0.005 and achieves strictly narrower width than equal-tailed CI',
  `Integrated Mass = ${simpsonMass.toFixed(6)} (target 0.95 +/- 0.005), HDI Width (${hdiWidth.toFixed(6)}) < Equal-Tailed Width (${eqWidth.toFixed(6)})`
);

// ============================================================================
// TEST SUITE 2: Psychrometric Telemetry & Boundary Extremes
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log(' TEST SUITE 2: Psychrometric Telemetry & Boundary Extremes');
console.log('--------------------------------------------------------------------------------');

// 2.1 Desert Arid Fixture: T = 38°C, RH = 15%, UV = 4.2
console.log('\n[2.1] Fixture 1 — Desert Arid (T = 38°C, RH = 15%, UV = 4.2):');
const aridDewPoint = calculateDewPoint(38, 15);
const aridRegime = classifyWeatherRegime(15);
const aridUvLevel = classifyUVLevel(4.2);
const aridTelemetry: WeatherTelemetry = {
  temp: 38,
  humidity: 15,
  uvIndex: 4.2,
  dewPoint: aridDewPoint,
  locationName: 'Desert Arid Test Fixture',
  timestamp: '2026-10-22T12:00:00Z',
};
const aridPlan = generateDailyRoutine(aridTelemetry, [], [], 'balanced_wellness');

console.log(`  Computed Dew Point : ${aridDewPoint.toFixed(1)}°C | Regime: '${aridRegime}' | UV Level: '${aridUvLevel}'`);
console.log(`  Prescribed Title   : ${aridPlan.title} (${aridPlan.archetype})`);
console.log(`  Precaution Alert   : ${aridPlan.precautionAlert}`);
console.log(`  Contraindications  : ${aridPlan.contraindicationsAvoided?.join(' | ')}`);

assertCondition(
  Math.abs(aridDewPoint - 6.9) <= 0.1 && Math.abs(aridDewPoint - 7.2) <= 0.4 && aridRegime === 'arid',
  'Desert Arid Magnus-Tetens Dew Point (6.9°C exact WMO / ~7.2°C approx) and Regime ("arid") verified',
  `Dew Point = ${aridDewPoint.toFixed(1)}°C (exact WMO Magnus-Tetens: 6.8916°C, ~7.2°C), Regime = '${aridRegime}'`
);

assertCondition(
  Boolean(
    aridPlan.precautionAlert?.includes('ARID') &&
      aridPlan.contraindicationsAvoided?.some((c) => c.toLowerCase().includes('unsealed humectant')) &&
      aridPlan.steps.some((s) => s.productType.includes('Ceramide') || s.productType.includes('Squalane'))
  ),
  'Arid Rules Engine flags high TEWL risk, blocks unbuffered water-gels, and enforces Ceramide/Squalane seal',
  `Step 3 Moisturizer = "${aridPlan.steps[2].productType}"`
);

// 2.2 Monsoon / Tropical Fixture: T = 32°C, RH = 92%, UV = 2.1
console.log('\n[2.2] Fixture 2 — Monsoon / Tropical (T = 32°C, RH = 92%, UV = 2.1):');
const humidDewPoint = calculateDewPoint(32, 92);
const humidRegime = classifyWeatherRegime(92);
const humidUvLevel = classifyUVLevel(2.1);
const humidTelemetry: WeatherTelemetry = {
  temp: 32,
  humidity: 92,
  uvIndex: 2.1,
  dewPoint: humidDewPoint,
  locationName: 'Monsoon Tropical Test Fixture',
  timestamp: '2026-10-22T12:00:00Z',
};
const humidPlan = generateDailyRoutine(humidTelemetry, [], [], 'balanced_wellness');

console.log(`  Computed Dew Point : ${humidDewPoint.toFixed(1)}°C | Regime: '${humidRegime}' | UV Level: '${humidUvLevel}'`);
console.log(`  Prescribed Title   : ${humidPlan.title} (${humidPlan.archetype})`);
console.log(`  Precaution Alert   : ${humidPlan.precautionAlert}`);
console.log(`  Contraindications  : ${humidPlan.contraindicationsAvoided?.join(' | ')}`);

assertCondition(
  Math.abs(humidDewPoint - 30.5) <= 0.1 && humidRegime === 'humid',
  'Monsoon Tropical Magnus-Tetens Dew Point (~30.5°C) and Regime ("humid") verified',
  `Dew Point = ${humidDewPoint.toFixed(1)}°C (expected ~30.5°C), Regime = '${humidRegime}'`
);

assertCondition(
  Boolean(
    humidPlan.precautionAlert?.includes('HUMIDITY') &&
      humidPlan.contraindicationsAvoided?.some((c) => c.toLowerCase().includes('occluding') || c.toLowerCase().includes('waxes')) &&
      humidPlan.steps[2].productType.toLowerCase().includes('oil-free')
  ),
  'Humid Rules Engine flags follicular occlusion risk and purges heavy occlusives in favor of 100% Oil-Free Hydro-Gel',
  `Step 3 Moisturizer = "${humidPlan.steps[2].productType}"`
);

// 2.3 Extreme Solar Fixture: T = 28°C, RH = 50%, UV = 8.5
console.log('\n[2.3] Fixture 3 — Extreme Solar (T = 28°C, RH = 50%, UV = 8.5):');
const solarDewPoint = calculateDewPoint(28, 50);
const solarRegime = classifyWeatherRegime(50);
const solarUvLevel = classifyUVLevel(8.5);
const solarTelemetry: WeatherTelemetry = {
  temp: 28,
  humidity: 50,
  uvIndex: 8.5,
  dewPoint: solarDewPoint,
  locationName: 'Extreme Solar Test Fixture',
  timestamp: '2026-10-22T12:00:00Z',
};
const solarGlowPlan = generateDailyRoutine(solarTelemetry, [], [], 'gentle_glow');

console.log(`  Computed Dew Point : ${solarDewPoint.toFixed(1)}°C | Regime: '${solarRegime}' | UV Level: '${solarUvLevel}'`);
console.log(`  Prescribed Title   : ${solarGlowPlan.title}`);
console.log(`  Step 2 (Treat)     : ${solarGlowPlan.steps[1].productType}`);
console.log(`  Step 4 (Protect)   : ${solarGlowPlan.steps[3].productType}`);
console.log(`  Contraindications  : ${solarGlowPlan.contraindicationsAvoided?.join(' | ')}`);

assertCondition(
  solarUvLevel === 'high' &&
    Boolean(
      solarGlowPlan.contraindicationsAvoided?.some((c) => c.includes('photosensitizing retinoids & strong AHAs barred')) &&
        solarGlowPlan.contraindicationsAvoided?.some((c) => c.includes('SPF 50+')) &&
        solarGlowPlan.steps[3].productType.includes('SPF 50+') &&
        solarGlowPlan.steps[1].productType.includes('Vitamin C')
    ),
  'Extreme Solar UV (8.5) classifies as "high", locks out daytime photosensitizers (AHA/Retinol), and enforces SPF 50+',
  `UVLevel = '${solarUvLevel}', Treat = "${solarGlowPlan.steps[1].productType}", Protect = "${solarGlowPlan.steps[3].productType}"`
);

// ============================================================================
// TEST SUITE 3: Clinical Logic & Temporal Safety Gating (5-Day Patient Run)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log(' TEST SUITE 3: Clinical Logic & Temporal Safety Gating (5-Day Sequential Run)');
console.log('--------------------------------------------------------------------------------');

const temperateWeather: WeatherTelemetry = {
  temp: 22.0,
  humidity: 55,
  uvIndex: 3.5,
  dewPoint: calculateDewPoint(22.0, 55),
  locationName: 'Temperate Clinic Baseline',
  timestamp: '2026-10-18T08:00:00Z',
};

const patientHistory: DailyLogEntry[] = [];

// Day 1: Balanced log under temperate weather
const day1Plan = generateDailyRoutine(temperateWeather, [], patientHistory, 'balanced_wellness');
patientHistory.push({
  dayIndex: 1,
  date: '2026-10-18',
  weather: temperateWeather,
  userReport: 'balanced',
  prescribedArchetype: day1Plan.archetype,
  satisfactionScore: 4.8,
  dailyPriority: 'balanced_wellness',
  activeIngredientsUsed: day1Plan.activeIngredients,
});
console.log(`\n  [Day 1] Weather: Temperate (55% RH, 22°C) | Priority: 'balanced_wellness'`);
console.log(`          Prescribed: ${day1Plan.title} | Actives: ${day1Plan.activeIngredients?.join(', ')}`);

assertCondition(
  (day1Plan.activeIngredients?.length ?? 0) > 0 && day1Plan.archetype === 'lightweight_hydration',
  'Day 1: Balanced temperate log prescribes active homeostatic routine',
  `Archetype = '${day1Plan.archetype}', Actives = [${day1Plan.activeIngredients?.join(', ')}]`
);

// Day 2: Exfoliating acid (AHA/BHA) applied
const day2Plan = generateDailyRoutine(temperateWeather, [], patientHistory, 'gentle_glow');
patientHistory.push({
  dayIndex: 2,
  date: '2026-10-19',
  weather: temperateWeather,
  userReport: 'balanced',
  prescribedArchetype: day2Plan.archetype, // 'gentle_exfoliation'
  satisfactionScore: 4.6,
  dailyPriority: 'gentle_glow',
  activeIngredientsUsed: day2Plan.activeIngredients,
});
const postDay2Audit = evaluatePastHistoryAndAntidotes(patientHistory, 'acne_breakouts', temperateWeather);
console.log(`\n  [Day 2] Exfoliating Acid Applied (${day2Plan.activeIngredients?.[0]})`);
console.log(`          Post-Day 2 Audit -> usedStrongAcidRecently = ${postDay2Audit.usedStrongAcidRecently}, consecutiveExfoliationCount = ${postDay2Audit.consecutiveExfoliationCount}`);

assertCondition(
  day2Plan.archetype === 'gentle_exfoliation' && postDay2Audit.usedStrongAcidRecently === true,
  'Day 2: Exfoliating acid applied -> 48h skin-cycling cool-down gate activates immediately',
  `usedStrongAcidRecently = ${postDay2Audit.usedStrongAcidRecently}, Antidote Triggered = ${postDay2Audit.antidoteTriggered}`
);

// Day 3: User selects 'acne_breakouts' priority -> Engine must BLOCK acid stacking (BHA) and swap to Azelaic Acid + Zinc PCA
const day3Plan = generateDailyRoutine(temperateWeather, [], patientHistory, 'acne_breakouts');
patientHistory.push({
  dayIndex: 3,
  date: '2026-10-20',
  weather: temperateWeather,
  userReport: 'balanced',
  prescribedArchetype: day3Plan.archetype,
  satisfactionScore: 4.7,
  dailyPriority: 'acne_breakouts',
  activeIngredientsUsed: day3Plan.activeIngredients,
});
console.log(`\n  [Day 3] User Selects 'acne_breakouts' during 48h Acid Cool-Down Window:`);
console.log(`          Step 2 (Treat)     : ${day3Plan.steps[1].productType}`);
console.log(`          Prescribed Actives : ${day3Plan.activeIngredients?.join(', ')}`);
console.log(`          Antidote Rationale : ${day3Plan.antidoteRationale}`);

const day3HasSalicylic = day3Plan.activeIngredients?.some((a) => a.includes('Salicylic')) ?? false;
const day3HasAzelaicAndZinc =
  (day3Plan.activeIngredients?.some((a) => a.includes('Azelaic Acid')) ?? false) &&
  (day3Plan.activeIngredients?.some((a) => a.includes('Zinc PCA')) ?? false);

assertCondition(
  !day3HasSalicylic && day3HasAzelaicAndZinc,
  'Day 3: Engine BLOCKS back-to-back BHA/AHA stacking and swaps to Azelaic Acid (10%) + Niacinamide/Zinc PCA',
  `Salicylic Blocked = ${!day3HasSalicylic}, Swapped Actives = [${day3Plan.activeIngredients?.join(', ')}]`
);

// Day 4: User logs feedback = 'stinging_irritated' -> Emergency 72-Hour Barrier Reset engages immediately
patientHistory.push({
  dayIndex: 4,
  date: '2026-10-21',
  weather: temperateWeather,
  userReport: 'stinging_irritated',
  prescribedArchetype: 'pore_clarifying',
  satisfactionScore: 2.0,
  dailyPriority: 'acne_breakouts',
});
const day4Plan = generateDailyRoutine(temperateWeather, [], patientHistory, 'acne_breakouts');
console.log(`\n  [Day 4] User Reports 'stinging_irritated' -> Emergency 72-Hour Barrier Reset Check:`);
console.log(`          Prescribed Title   : ${day4Plan.title} (${day4Plan.archetype})`);
console.log(`          Precaution Alert   : ${day4Plan.precautionAlert}`);
console.log(`          Prescribed Actives : ${day4Plan.activeIngredients?.join(', ')}`);

const day4HasAnyAcid =
  day4Plan.activeIngredients?.some(
    (a) => a.includes('Salicylic') || a.includes('Glycolic') || a.includes('Lactic') || a.includes('Azelaic')
  ) ?? false;
const day4HasBarrierTriad =
  (day4Plan.activeIngredients?.some((a) => a.includes('Colloidal Oat')) ?? false) &&
  (day4Plan.activeIngredients?.some((a) => a.includes('Ceramide')) ?? false) &&
  (day4Plan.activeIngredients?.some((a) => a.includes('Mineral SPF 50+')) ?? false);

assertCondition(
  day4Plan.archetype === 'barrier_recovery' &&
    !day4HasAnyAcid &&
    day4HasBarrierTriad &&
    Boolean(day4Plan.precautionAlert?.includes('EMERGENCY BARRIER RESET')),
  'Day 4: Emergency 72-Hour Barrier Reset engages immediately, suspending all acids and prescribing Colloidal Oat + Ceramides + Mineral SPF',
  `Archetype = '${day4Plan.archetype}', Acids Present = ${day4HasAnyAcid}, Actives = [${day4Plan.activeIngredients?.join(', ')}]`
);

// Day 5: Simulate humid weather (where BHA is normally preferred) while Barrier Reset timer is active (within 72h of Day 4 stinging)
// Log a 'balanced' check-in on Day 4 evening / Day 5 morning so lastSkinFeel is 'balanced', testing that the 72h lookback window (last3Logs) STILL enforces the override!
patientHistory.push({
  dayIndex: 5,
  date: '2026-10-22',
  weather: humidTelemetry,
  userReport: 'balanced',
  prescribedArchetype: 'barrier_recovery',
  satisfactionScore: 4.5,
  dailyPriority: 'acne_breakouts',
});
const day5Plan = generateDailyRoutine(humidTelemetry, [], patientHistory, 'acne_breakouts');
console.log(`\n  [Day 5] Humid Weather (92% RH, 32°C) + 'acne_breakouts' Priority while 72h Barrier Reset Timer Active:`);
console.log(`          Prescribed Title   : ${day5Plan.title} (${day5Plan.archetype})`);
console.log(`          Step 3 (Moisturize): ${day5Plan.steps[2].productType}`);
console.log(`          Prescribed Actives : ${day5Plan.activeIngredients?.join(', ')}`);

const day5HasAnyAcid =
  day5Plan.activeIngredients?.some(
    (a) => a.includes('Salicylic') || a.includes('Glycolic') || a.includes('Lactic')
  ) ?? false;

assertCondition(
  day5Plan.archetype === 'barrier_recovery' &&
    !day5HasAnyAcid &&
    Boolean(day5Plan.precautionAlert?.includes('EMERGENCY BARRIER RESET')),
  'Day 5: 72h Barrier Safety Override supersedes Humid + Acne weather preference and refuses all exfoliating acids',
  `Archetype = '${day5Plan.archetype}', Exfoliating Acids Refused = ${!day5HasAnyAcid}, Vehicle = "${day5Plan.steps[2].productType}"`
);

// ============================================================================
// TEST SUITE 4: Inferential Statistical Suite (BAMAT207 Modules 3, 4, 5)
// ============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log(' TEST SUITE 4: Inferential Statistical Suite (BAMAT207 Modules 3, 4, 5)');
console.log('--------------------------------------------------------------------------------');

// 4.1 Chi-Square Null vs. Alternate Verification
console.log('\n[4.1] Module 3 — Chi-Square (chi^2) Test of Independence (Null vs. Alternate):');

function makeSyntheticLog(
  dayIndex: number,
  humidity: number,
  uvIndex: number,
  report: DailyLogEntry['userReport'],
  archetype: DailyLogEntry['prescribedArchetype'] = 'lightweight_hydration',
  score = 4.5
): DailyLogEntry {
  return {
    dayIndex,
    date: '2026-10-22',
    weather: {
      temp: 25,
      humidity,
      uvIndex,
      dewPoint: calculateDewPoint(25, humidity),
      locationName: 'Synthetic Cohort',
      timestamp: '2026-10-22T08:00:00Z',
    },
    userReport: report,
    prescribedArchetype: archetype,
    satisfactionScore: score,
  };
}

// Case A (Null Scenario): [10 balanced, 2 tight_dry] in Arid (25% RH); [10 balanced, 2 tight_dry] in Humid (85% RH)
const nullCohort: DailyLogEntry[] = [];
let idxA = 1;
for (let i = 0; i < 10; i++) nullCohort.push(makeSyntheticLog(idxA++, 25, 3.0, 'balanced'));
for (let i = 0; i < 2; i++) nullCohort.push(makeSyntheticLog(idxA++, 25, 3.0, 'tight_dry'));
for (let i = 0; i < 10; i++) nullCohort.push(makeSyntheticLog(idxA++, 85, 3.0, 'balanced'));
for (let i = 0; i < 2; i++) nullCohort.push(makeSyntheticLog(idxA++, 85, 3.0, 'tight_dry'));

const chiNull = performChiSquareTest(nullCohort);
console.log(
  `  Case A (Null / Independence)    : chi^2 = ${chiNull.chiSquare.toFixed(4)}, df = ${chiNull.degreesOfFreedom}, p-value = ${chiNull.pValue.toFixed(6)}, Significant = ${chiNull.isSignificant}`
);

assertCondition(
  chiNull.chiSquare === 0 && chiNull.pValue > 0.05 && chiNull.isSignificant === false,
  'Chi-Square Case A (Null Hypothesis): chi^2 = 0.0000, p = 1.000000 > 0.05 (Fail to reject H_0)',
  `chi^2 = ${chiNull.chiSquare}, p-value = ${chiNull.pValue}, isSignificant = ${chiNull.isSignificant}`
);

// Case B (Alternate Scenario): [12 balanced, 1 tight_dry] in Humid; [2 balanced, 11 tight_dry] in Arid
const altCohort: DailyLogEntry[] = [];
let idxB = 1;
for (let i = 0; i < 12; i++) altCohort.push(makeSyntheticLog(idxB++, 85, 3.0, 'balanced'));
for (let i = 0; i < 1; i++) altCohort.push(makeSyntheticLog(idxB++, 85, 3.0, 'tight_dry'));
for (let i = 0; i < 2; i++) altCohort.push(makeSyntheticLog(idxB++, 25, 3.0, 'balanced'));
for (let i = 0; i < 11; i++) altCohort.push(makeSyntheticLog(idxB++, 25, 3.0, 'tight_dry'));

const chiAlt = performChiSquareTest(altCohort);
console.log(
  `  Case B (Alternate / Dependence) : chi^2 = ${chiAlt.chiSquare.toFixed(4)}, df = ${chiAlt.degreesOfFreedom}, p-value = ${chiAlt.pValue.toFixed(6)}, Significant = ${chiAlt.isSignificant}`
);

assertCondition(
  chiAlt.chiSquare > chiAlt.criticalValue95 && chiAlt.pValue < 0.01 && chiAlt.isSignificant === true,
  `Chi-Square Case B (Alternate Hypothesis): chi^2 surges above critical value (${chiAlt.criticalValue95}) and p < 0.01 (Reject H_0)`,
  `chi^2 = ${chiAlt.chiSquare.toFixed(4)} > ${chiAlt.criticalValue95} (df=${chiAlt.degreesOfFreedom}), p-value = ${chiAlt.pValue.toFixed(6)} < 0.01`
);

// 4.2 Multiple Logistic Regression Output Check (IRLS Convergence)
console.log('\n[4.2] Module 4 — Multiple Logistic Regression IRLS Convergence & Odds Ratios:');
const logisticCohort: DailyLogEntry[] = [
  makeSyntheticLog(1, 22, 8.5, 'tight_dry'),
  makeSyntheticLog(2, 28, 7.8, 'stinging_irritated'),
  makeSyntheticLog(3, 32, 7.2, 'tight_dry'),
  makeSyntheticLog(4, 35, 6.5, 'balanced'),
  makeSyntheticLog(5, 48, 4.0, 'balanced'),
  makeSyntheticLog(6, 52, 3.5, 'balanced'),
  makeSyntheticLog(7, 55, 4.2, 'balanced'),
  makeSyntheticLog(8, 60, 3.0, 'balanced'),
  makeSyntheticLog(9, 64, 5.0, 'balanced'),
  makeSyntheticLog(10, 72, 4.5, 'balanced'),
  makeSyntheticLog(11, 78, 8.2, 'greasy_clogged'),
  makeSyntheticLog(12, 85, 9.0, 'greasy_clogged'),
  makeSyntheticLog(13, 88, 3.2, 'balanced'),
  makeSyntheticLog(14, 25, 8.0, 'tight_dry'),
  makeSyntheticLog(15, 58, 2.8, 'balanced'),
];

const logReg = estimateLogisticRegression(logisticCohort);
console.log(`  IRLS Converged     : ${logReg.converged} in ${logReg.iterations} iterations (Threshold <= 20)`);
console.log(
  `  Coefficients       : beta_0 (Intercept) = ${logReg.coefficients.intercept}, beta_1 (Humidity) = ${logReg.coefficients.humidityCoef}, beta_2 (UV) = ${logReg.coefficients.uvCoef}`
);
console.log(
  `  Odds Ratios        : OR_Humidity = ${logReg.oddsRatios.humidityOR}, OR_UV = ${logReg.oddsRatios.uvOR}`
);
console.log(
  `  Model Fit Metrics  : Null Deviance = ${logReg.nullDeviance}, Residual Deviance = ${logReg.deviance}, AIC = ${logReg.aic}`
);
const probAridHighUv = logReg.predictDiscomfortProbability(20, 9.0);
const probTempLowUv = logReg.predictDiscomfortProbability(55, 2.5);
console.log(
  `  Predicted P(Discomfort) : Arid/High-UV (20% RH, UV 9) = ${(probAridHighUv * 100).toFixed(2)}% vs. Temperate/Low-UV (55% RH, UV 2.5) = ${(probTempLowUv * 100).toFixed(2)}%`
);

assertCondition(
  logReg.converged === true &&
    logReg.iterations <= 20 &&
    logReg.deviance < logReg.nullDeviance &&
    logReg.oddsRatios.uvOR > 1.0 &&
    Number.isFinite(logReg.aic),
  'Multiple Logistic Regression IRLS converges in <= 20 iterations without matrix singularity and yields valid Odds Ratios & AIC',
  `Iterations = ${logReg.iterations}, Deviance Reduction = ${logReg.nullDeviance} -> ${logReg.deviance}, OR_UV = ${logReg.oddsRatios.uvOR}, AIC = ${logReg.aic}`
);

// 4.3 One-Way ANOVA Check
console.log('\n[4.3] Module 5 — One-Way ANOVA F-Test Across Archetype Satisfaction Scores:');
const anovaCohort: DailyLogEntry[] = [
  // barrier_recovery: high satisfaction [4.8, 4.9, 4.7, 4.8] -> mean = 4.800
  makeSyntheticLog(1, 30, 5, 'balanced', 'barrier_recovery', 4.8),
  makeSyntheticLog(2, 32, 5, 'balanced', 'barrier_recovery', 4.9),
  makeSyntheticLog(3, 28, 5, 'balanced', 'barrier_recovery', 4.7),
  makeSyntheticLog(4, 35, 5, 'balanced', 'barrier_recovery', 4.8),
  // lightweight_hydration: high satisfaction [4.7, 4.6, 4.8, 4.7] -> mean = 4.700
  makeSyntheticLog(5, 55, 4, 'balanced', 'lightweight_hydration', 4.7),
  makeSyntheticLog(6, 58, 4, 'balanced', 'lightweight_hydration', 4.6),
  makeSyntheticLog(7, 52, 4, 'balanced', 'lightweight_hydration', 4.8),
  makeSyntheticLog(8, 60, 4, 'balanced', 'lightweight_hydration', 4.7),
  // deep_nourish: moderate satisfaction [3.9, 4.1, 4.0, 3.8] -> mean = 3.950
  makeSyntheticLog(9, 40, 5, 'balanced', 'deep_nourish', 3.9),
  makeSyntheticLog(10, 42, 5, 'balanced', 'deep_nourish', 4.1),
  makeSyntheticLog(11, 38, 5, 'balanced', 'deep_nourish', 4.0),
  makeSyntheticLog(12, 45, 5, 'balanced', 'deep_nourish', 3.8),
  // pore_clarifying: high satisfaction [4.6, 4.5, 4.7, 4.6] -> mean = 4.600
  makeSyntheticLog(13, 75, 6, 'balanced', 'pore_clarifying', 4.6),
  makeSyntheticLog(14, 78, 6, 'balanced', 'pore_clarifying', 4.5),
  makeSyntheticLog(15, 80, 6, 'balanced', 'pore_clarifying', 4.7),
  makeSyntheticLog(16, 72, 6, 'balanced', 'pore_clarifying', 4.6),
  // gentle_exfoliation: lower satisfaction due to sensitivity [2.8, 3.0, 2.9, 2.7] -> mean = 2.850
  makeSyntheticLog(17, 35, 7, 'stinging_irritated', 'gentle_exfoliation', 2.8),
  makeSyntheticLog(18, 38, 7, 'tight_dry', 'gentle_exfoliation', 3.0),
  makeSyntheticLog(19, 33, 7, 'stinging_irritated', 'gentle_exfoliation', 2.9),
  makeSyntheticLog(20, 36, 7, 'tight_dry', 'gentle_exfoliation', 2.7),
];

const anovaRes = performOneWayAnova(anovaCohort);
console.log(
  `  Sum of Squares     : SS_Between = ${anovaRes.ssBetween.toFixed(4)}, SS_Within = ${anovaRes.ssWithin.toFixed(4)}, SS_Total = ${anovaRes.ssTotal.toFixed(4)}`
);
console.log(
  `  Degrees of Freedom : df_Between = ${anovaRes.dfBetween}, df_Within = ${anovaRes.dfWithin}`
);
console.log(
  `  Mean Squares       : MS_Between = ${anovaRes.msBetween.toFixed(4)}, MS_Within = ${anovaRes.msWithin.toFixed(4)}`
);
console.log(
  `  F-Test Result      : F = ${anovaRes.fStatistic.toFixed(4)}, p-value = ${anovaRes.pValue.toFixed(6)}, Significant = ${anovaRes.isSignificant}`
);

// Hand-calculated verification for anovaCohort:
// Group means: [4.80, 4.70, 3.95, 4.60, 2.85], Grand Mean = 4.18
// SS_Between = 4 * ((4.80-4.18)^2 + (4.70-4.18)^2 + (3.95-4.18)^2 + (4.60-4.18)^2 + (2.85-4.18)^2)
//            = 4 * (0.3844 + 0.2704 + 0.0529 + 0.1764 + 1.7689) = 4 * 2.653 = 10.6120
// SS_Within  = 5 * (0.01 + 0.01 + 0.025 + 0.025) ... wait: each group has values [m-0.1, m, m, m+0.1] or [m-0.15, m-0.05, m+0.05, m+0.15]:
//   barrier_recovery: (0)^2 + (0.1)^2 + (-0.1)^2 + (0)^2 = 0.02
//   lightweight_hydration: (0)^2 + (-0.1)^2 + (0.1)^2 + (0)^2 = 0.02
//   deep_nourish: (-0.05)^2 + (0.15)^2 + (0.05)^2 + (-0.15)^2 = 0.05
//   pore_clarifying: (0)^2 + (-0.1)^2 + (0.1)^2 + (0)^2 = 0.02
//   gentle_exfoliation: (-0.05)^2 + (0.15)^2 + (0.05)^2 + (-0.15)^2 = 0.05
//   Total SS_Within = 0.02 + 0.02 + 0.05 + 0.02 + 0.05 = 0.1600
// MS_Between = 10.6120 / 4 = 2.6530
// MS_Within  = 0.1600 / 15 = 0.010667
// F          = 2.6530 / 0.01066667 = 248.7188
assertCondition(
  Math.abs(anovaRes.ssBetween - 10.612) < 1e-3 &&
    Math.abs(anovaRes.ssWithin - 0.16) < 1e-3 &&
    Math.abs(anovaRes.ssTotal - 10.772) < 1e-3 &&
    Math.abs(anovaRes.fStatistic - 248.7188) < 1e-2 &&
    anovaRes.pValue < 0.0001 &&
    anovaRes.isSignificant === true,
  'One-Way ANOVA matches closed-form analytical SS_Between (10.6120), SS_Within (0.1600), F-ratio (248.7188), and p < 0.0001',
  `SS_B = ${anovaRes.ssBetween}, SS_W = ${anovaRes.ssWithin}, F(4, 15) = ${anovaRes.fStatistic}, p = ${anovaRes.pValue}`
);

console.log('\n================================================================================');
console.log(
  ` AUDIT SUMMARY: ${passedAssertions} / ${totalAssertions} Assertions Passed (${failedAssertions} Failed)`
);
console.log('================================================================================');

if (failedAssertions > 0) {
  process.exit(1);
}
