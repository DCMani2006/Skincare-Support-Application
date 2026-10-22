/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Course: BAMAT207 (Probability & Statistics)
 * Statistical Validation Engine: Modules 3, 4, and 5
 */

import type {
  AnovaGroupStat,
  ChiSquareTestResult,
  DailyLogEntry,
  LogisticRegressionResult,
  OneWayAnovaResult,
  RoutineArchetype,
  SkinFeel,
  WeatherRegime,
} from '../types/dermaSync';
import { logGamma, regularizedIncompleteBeta } from './bayesianEngine';

// ==========================================
// Mathematical Helpers: Distributions & Incomplete Functions
// ==========================================

/**
 * Regularized Upper Incomplete Gamma function: Q(a, x) = Γ(a, x) / Γ(a)
 * Evaluated via series expansion for x < a + 1 or Legendre continued fraction for x >= a + 1.
 * Used for computing exact p-values of the Chi-Square distribution:
 *   P(χ² >= x; df) = Q(df / 2, x / 2)
 */
export function regularizedUpperIncompleteGamma(a: number, x: number): number {
  if (x <= 0) return 1.0;
  if (a <= 0) return 0.0;

  // Series expansion for lower incomplete gamma P(a, x)
  if (x < a + 1.0) {
    let sum = 1.0 / a;
    let term = 1.0 / a;
    for (let n = 1; n <= 150; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-14) {
        break;
      }
    }
    const lowerIncomplete = Math.exp(-x + a * Math.log(x) - logGamma(a)) * sum;
    return Math.max(0.0, Math.min(1.0, 1.0 - lowerIncomplete));
  }

  // Continued fraction representation for Q(a, x)
  const TINY = 1e-30;
  let b = x + 1.0 - a;
  let c = 1.0 / TINY;
  let d = 1.0 / b;
  let h = d;

  for (let i = 1; i <= 150; i++) {
    const an = -i * (i - a);
    b += 2.0;
    d = an * d + b;
    if (Math.abs(d) < TINY) d = TINY;
    c = b + an / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1.0 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1.0) < 1e-14) {
      break;
    }
  }

  const factor = Math.exp(-x + a * Math.log(x) - logGamma(a));
  return Math.max(0.0, Math.min(1.0, factor * h));
}

/**
 * Standard Normal Error Function erf(x) via high-precision Chebyshev approximation
 */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  // Constants from Abramowitz and Stegun 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const y = 1.0 - poly * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function: Φ(z)
 */
export function normalCdf(z: number): number {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

// ==========================================
// BAMAT207 Module 3: Chi-Square Test of Independence (χ²)
// ==========================================

const WEATHER_REGIMES: readonly WeatherRegime[] = ['arid', 'temperate', 'humid'];
const SKIN_FEELS: readonly SkinFeel[] = [
  'balanced',
  'tight_dry',
  'greasy_clogged',
  'stinging_irritated',
];

/**
 * BAMAT207 Module 3: Chi-Square (χ²) Test of Independence
 * Evaluates whether skin complaints are conditionally dependent on the prevailing weather regime.
 * Matrix dimensions: 3 Weather Regimes × 4 Skin Feel states (df = (3 - 1) × (4 - 1) = 6).
 */
export function performChiSquareTest(history: readonly DailyLogEntry[]): ChiSquareTestResult {
  // Initialize observed contingency matrix
  const contingencyTable: Record<WeatherRegime, Record<SkinFeel, number>> = {
    arid: { balanced: 0, tight_dry: 0, greasy_clogged: 0, stinging_irritated: 0 },
    temperate: { balanced: 0, tight_dry: 0, greasy_clogged: 0, stinging_irritated: 0 },
    humid: { balanced: 0, tight_dry: 0, greasy_clogged: 0, stinging_irritated: 0 },
  };

  const expectedTable: Record<WeatherRegime, Record<SkinFeel, number>> = {
    arid: { balanced: 0, tight_dry: 0, greasy_clogged: 0, stinging_irritated: 0 },
    temperate: { balanced: 0, tight_dry: 0, greasy_clogged: 0, stinging_irritated: 0 },
    humid: { balanced: 0, tight_dry: 0, greasy_clogged: 0, stinging_irritated: 0 },
  };

  // Populate observed counts
  for (const entry of history) {
    const regime = entry.weather.humidity < 40 ? 'arid' : entry.weather.humidity > 70 ? 'humid' : 'temperate';
    contingencyTable[regime][entry.userReport]++;
  }

  // Row and Column Marginal Totals
  const rowTotals: Record<WeatherRegime, number> = { arid: 0, temperate: 0, humid: 0 };
  const colTotals: Record<SkinFeel, number> = {
    balanced: 0,
    tight_dry: 0,
    greasy_clogged: 0,
    stinging_irritated: 0,
  };

  let grandTotal = 0;

  for (const regime of WEATHER_REGIMES) {
    for (const feel of SKIN_FEELS) {
      const count = contingencyTable[regime][feel];
      rowTotals[regime] += count;
      colTotals[feel] += count;
      grandTotal += count;
    }
  }

  // If insufficient sample size
  if (grandTotal === 0) {
    return {
      chiSquare: 0,
      degreesOfFreedom: 6,
      pValue: 1.0,
      contingencyTable,
      expectedTable,
      isSignificant: false,
      criticalValue95: 12.592, // χ²_0.05, df=6
    };
  }

  // Compute expected frequencies and Chi-Square statistic
  let chiSquare = 0;

  for (const regime of WEATHER_REGIMES) {
    for (const feel of SKIN_FEELS) {
      const expected = (rowTotals[regime] * colTotals[feel]) / grandTotal;
      expectedTable[regime][feel] = Number(expected.toFixed(3));

      if (expected > 0) {
        const diff = contingencyTable[regime][feel] - expected;
        chiSquare += (diff * diff) / expected;
      }
    }
  }

  const df = (WEATHER_REGIMES.length - 1) * (SKIN_FEELS.length - 1); // 2 * 3 = 6
  const pValue = regularizedUpperIncompleteGamma(df / 2, chiSquare / 2);
  const criticalValue95 = 12.5916; // Standard critical value for df=6 at α=0.05

  return {
    chiSquare: Number(chiSquare.toFixed(4)),
    degreesOfFreedom: df,
    pValue: Number(pValue.toFixed(6)),
    contingencyTable,
    expectedTable,
    isSignificant: pValue < 0.05,
    criticalValue95,
  };
}

// ==========================================
// BAMAT207 Module 4: Multiple Logistic Regression Estimator
// ==========================================

/**
 * Inverts a 3x3 symmetric/positive-definite matrix via explicit Cramer's rule / adjugate.
 */
function invert3x3(m: readonly (readonly number[])[]): number[][] {
  const [
    [a, b, c],
    [d, e, f],
    [g, h, k],
  ] = m;

  const det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);

  if (Math.abs(det) < 1e-15) {
    throw new Error('Hessian matrix is singular and cannot be inverted.');
  }

  const invDet = 1.0 / det;

  return [
    [(e * k - f * h) * invDet, -(b * k - c * h) * invDet, (b * f - c * e) * invDet],
    [-(d * k - f * g) * invDet, (a * k - c * g) * invDet, -(a * f - c * d) * invDet],
    [(d * h - e * g) * invDet, -(a * h - b * g) * invDet, (a * e - b * d) * invDet],
  ];
}

/**
 * BAMAT207 Module 4: Simple Multiple Logistic Regression
 * Fits the log-odds of experiencing epidermal discomfort (non-balanced feedback):
 *   ln(p / (1 - p)) = β₀ + β₁·Humidity + β₂·UV
 *
 * Solved via Iteratively Reweighted Least Squares (IRLS / Newton-Raphson)
 * with L2 Ridge stabilization.
 */
export function estimateLogisticRegression(
  history: readonly DailyLogEntry[]
): LogisticRegressionResult {
  const N = history.length;

  // Fallback defaults for empty or trivial history
  if (N < 3) {
    const defaultPredict = (_h: number, _u: number): number => 0.5;
    return {
      coefficients: { intercept: 0, humidityCoef: 0, uvCoef: 0 },
      oddsRatios: { humidityOR: 1, uvOR: 1 },
      standardErrors: { intercept: 0, humidityCoef: 0, uvCoef: 0 },
      zValues: { intercept: 0, humidityCoef: 0, uvCoef: 0 },
      pValues: { intercept: 1, humidityCoef: 1, uvCoef: 1 },
      deviance: 0,
      nullDeviance: 0,
      aic: 6,
      iterations: 0,
      converged: false,
      predictDiscomfortProbability: defaultPredict,
    };
  }

  // Design matrix X and binary response vector y:
  // y_i = 1 if user experienced discomfort (tight_dry, greasy_clogged, stinging_irritated)
  // y_i = 0 if balanced
  const X: number[][] = [];
  const y: number[] = [];

  for (const entry of history) {
    X.push([1.0, entry.weather.humidity, entry.weather.uvIndex]);
    y.push(entry.userReport === 'balanced' ? 0.0 : 1.0);
  }

  // Null deviance calculation
  const yMean = Math.max(1e-4, Math.min(1.0 - 1e-4, y.reduce((s, val) => s + val, 0) / N));
  let nullDeviance = 0;
  for (const yi of y) {
    nullDeviance += -2 * (yi * Math.log(yMean) + (1 - yi) * Math.log(1 - yMean));
  }

  // Newton-Raphson / IRLS iterations
  let beta = [0.0, 0.0, 0.0];
  const ridgeLambda = 1e-4; // Small ridge penalty to guarantee positive-definiteness
  let converged = false;
  let iterations = 0;
  let finalHessianInv: number[][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  const MAX_ITER = 50;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    iterations++;

    // Compute fitted probabilities p_i
    const p: number[] = [];
    const w: number[] = [];
    for (let i = 0; i < N; i++) {
      const eta = beta[0] * X[i][0] + beta[1] * X[i][1] + beta[2] * X[i][2];
      // Numerical clamping for sigmoid
      const clampedEta = Math.max(-25, Math.min(25, eta));
      const pi = 1.0 / (1.0 + Math.exp(-clampedEta));
      p.push(pi);
      w.push(Math.max(1e-6, pi * (1.0 - pi)));
    }

    // Gradient g = X^T (y - p) - λ * β
    const g = [0.0, 0.0, 0.0];
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < N; i++) {
        g[j] += X[i][j] * (y[i] - p[i]);
      }
      g[j] -= ridgeLambda * beta[j];
    }

    // Hessian H = X^T W X + λ I
    const H: number[][] = [
      [0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0],
    ];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        for (let i = 0; i < N; i++) {
          H[r][c] += X[i][r] * w[i] * X[i][c];
        }
        if (r === c) {
          H[r][c] += ridgeLambda;
        }
      }
    }

    // Invert Hessian
    const HInv = invert3x3(H);
    finalHessianInv = HInv;

    // Parameter delta: Δβ = H^(-1) * g
    const deltaBeta = [0.0, 0.0, 0.0];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        deltaBeta[r] += HInv[r][c] * g[c];
      }
    }

    // Update
    beta = [beta[0] + deltaBeta[0], beta[1] + deltaBeta[1], beta[2] + deltaBeta[2]];

    const stepNorm = Math.max(
      Math.abs(deltaBeta[0]),
      Math.abs(deltaBeta[1]),
      Math.abs(deltaBeta[2])
    );

    if (stepNorm < 1e-6) {
      converged = true;
      break;
    }
  }

  // Calculate residual deviance
  let deviance = 0;
  for (let i = 0; i < N; i++) {
    const eta = beta[0] * X[i][0] + beta[1] * X[i][1] + beta[2] * X[i][2];
    const pi = Math.max(1e-10, Math.min(1.0 - 1e-10, 1.0 / (1.0 + Math.exp(-eta))));
    deviance += -2 * (y[i] * Math.log(pi) + (1.0 - y[i]) * Math.log(1.0 - pi));
  }

  // Standard errors from diagonal of variance-covariance matrix (Hessian inverse)
  const se0 = Math.sqrt(Math.max(1e-8, finalHessianInv[0][0]));
  const se1 = Math.sqrt(Math.max(1e-8, finalHessianInv[1][1]));
  const se2 = Math.sqrt(Math.max(1e-8, finalHessianInv[2][2]));

  // Wald z-statistics and p-values
  const z0 = beta[0] / se0;
  const z1 = beta[1] / se1;
  const z2 = beta[2] / se2;

  const pVal0 = 2 * (1.0 - normalCdf(Math.abs(z0)));
  const pVal1 = 2 * (1.0 - normalCdf(Math.abs(z1)));
  const pVal2 = 2 * (1.0 - normalCdf(Math.abs(z2)));

  const predictDiscomfortProbability = (humidity: number, uv: number): number => {
    const logOdds = beta[0] + beta[1] * humidity + beta[2] * uv;
    const clamped = Math.max(-25, Math.min(25, logOdds));
    return 1.0 / (1.0 + Math.exp(-clamped));
  };

  return {
    coefficients: {
      intercept: Number(beta[0].toFixed(4)),
      humidityCoef: Number(beta[1].toFixed(4)),
      uvCoef: Number(beta[2].toFixed(4)),
    },
    oddsRatios: {
      humidityOR: Number(Math.exp(beta[1]).toFixed(4)),
      uvOR: Number(Math.exp(beta[2]).toFixed(4)),
    },
    standardErrors: {
      intercept: Number(se0.toFixed(4)),
      humidityCoef: Number(se1.toFixed(4)),
      uvCoef: Number(se2.toFixed(4)),
    },
    zValues: {
      intercept: Number(z0.toFixed(4)),
      humidityCoef: Number(z1.toFixed(4)),
      uvCoef: Number(z2.toFixed(4)),
    },
    pValues: {
      intercept: Number(pVal0.toFixed(4)),
      humidityCoef: Number(pVal1.toFixed(4)),
      uvCoef: Number(pVal2.toFixed(4)),
    },
    deviance: Number(deviance.toFixed(3)),
    nullDeviance: Number(nullDeviance.toFixed(3)),
    aic: Number((deviance + 2 * 3).toFixed(3)),
    iterations,
    converged,
    predictDiscomfortProbability,
  };
}

// ==========================================
// BAMAT207 Module 5: One-Way ANOVA Calculator
// ==========================================

const ALL_ARCHETYPES: readonly RoutineArchetype[] = [
  'barrier_recovery',
  'lightweight_hydration',
  'deep_nourish',
  'pore_clarifying',
  'gentle_exfoliation',
];

/**
 * BAMAT207 Module 5: One-Way Analysis of Variance (ANOVA)
 * Tests H₀: μ₁ = μ₂ = μ₃ = μ₄ = μ₅ (no difference in user satisfaction between routine archetypes)
 * versus H₁: at least one archetype mean satisfaction differs significantly.
 */
export function performOneWayAnova(history: readonly DailyLogEntry[]): OneWayAnovaResult {
  // Aggregate observations by archetype
  const groupScores: Record<RoutineArchetype, number[]> = {
    barrier_recovery: [],
    lightweight_hydration: [],
    deep_nourish: [],
    pore_clarifying: [],
    gentle_exfoliation: [],
  };

  for (const entry of history) {
    groupScores[entry.prescribedArchetype].push(entry.satisfactionScore);
  }

  // Compute group-level statistics
  const groupStats: Record<string, AnovaGroupStat> = {};
  let totalObservations = 0;
  let grandSum = 0;
  let activeGroupsCount = 0;

  for (const archetype of ALL_ARCHETYPES) {
    const scores = groupScores[archetype];
    const n = scores.length;
    totalObservations += n;

    if (n === 0) {
      groupStats[archetype] = { count: 0, mean: 0, variance: 0, stdDev: 0 };
      continue;
    }

    activeGroupsCount++;
    const sum = scores.reduce((acc, val) => acc + val, 0);
    grandSum += sum;
    const mean = sum / n;

    let varSum = 0;
    for (const val of scores) {
      const diff = val - mean;
      varSum += diff * diff;
    }

    const variance = n > 1 ? varSum / (n - 1) : 0;
    groupStats[archetype] = {
      count: n,
      mean: Number(mean.toFixed(3)),
      variance: Number(variance.toFixed(4)),
      stdDev: Number(Math.sqrt(variance).toFixed(3)),
    };
  }

  // Edge cases: not enough groups or observations to conduct ANOVA
  if (activeGroupsCount < 2 || totalObservations <= activeGroupsCount) {
    return {
      fStatistic: 0,
      pValue: 1.0,
      dfBetween: Math.max(1, activeGroupsCount - 1),
      dfWithin: Math.max(1, totalObservations - activeGroupsCount),
      ssBetween: 0,
      ssWithin: 0,
      ssTotal: 0,
      msBetween: 0,
      msWithin: 0,
      groupStats: groupStats as Record<RoutineArchetype, AnovaGroupStat>,
      isSignificant: false,
    };
  }

  const grandMean = grandSum / totalObservations;

  // Sum of Squares Between (SSB / Treatment)
  let ssBetween = 0;
  // Sum of Squares Within (SSW / Error)
  let ssWithin = 0;

  for (const archetype of ALL_ARCHETYPES) {
    const scores = groupScores[archetype];
    const n = scores.length;
    if (n === 0) continue;

    const groupMean = groupStats[archetype].mean;
    const meanDiff = groupMean - grandMean;
    ssBetween += n * meanDiff * meanDiff;

    for (const score of scores) {
      const errDiff = score - groupMean;
      ssWithin += errDiff * errDiff;
    }
  }

  const ssTotal = ssBetween + ssWithin;
  const dfBetween = activeGroupsCount - 1;
  const dfWithin = totalObservations - activeGroupsCount;

  const msBetween = ssBetween / dfBetween;
  const msWithin = dfWithin > 0 ? ssWithin / dfWithin : 1e-8;

  const fStatistic = msWithin > 1e-12 ? msBetween / msWithin : 0;

  // P-value for F-distribution:
  // p = 1 - F_cdf(F; df1, df2) = I_x(df2/2, df1/2) where x = df2 / (df2 + df1 * F)
  let pValue = 1.0;
  if (fStatistic > 0 && dfBetween > 0 && dfWithin > 0) {
    const x = dfWithin / (dfWithin + dfBetween * fStatistic);
    pValue = regularizedIncompleteBeta(x, dfWithin / 2.0, dfBetween / 2.0);
  }

  return {
    fStatistic: Number(fStatistic.toFixed(4)),
    pValue: Number(pValue.toFixed(6)),
    dfBetween,
    dfWithin,
    ssBetween: Number(ssBetween.toFixed(4)),
    ssWithin: Number(ssWithin.toFixed(4)),
    ssTotal: Number(ssTotal.toFixed(4)),
    msBetween: Number(msBetween.toFixed(4)),
    msWithin: Number(msWithin.toFixed(4)),
    groupStats: groupStats as Record<RoutineArchetype, AnovaGroupStat>,
    isSignificant: pValue < 0.05,
  };
}
