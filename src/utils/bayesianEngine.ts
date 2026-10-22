/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Course: BAMAT207 (Probability & Statistics)
 * Bayesian Inference Engine: Conjugate Beta-Binomial Updating & Decision Logic
 */

import type {
  BayesianArchetypeState,
  DailyLogEntry,
  RoutineArchetype,
  SkinFeel,
  WeatherRegime,
} from '../types/dermaSync';

// ==========================================
// 1. Exact Mathematical Special Functions
// ==========================================

/**
 * 7-Term Lanczos coefficients for standard Gamma function approximation (g=7, N=9).
 * Provides double-precision floating-point accuracy (< 1e-13 relative error)
 * across the entire complex right half-plane and positive real line.
 */
const LANCZOS_COEFFICIENTS: readonly number[] = [
  0.99999999999980993,
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.138571095856205,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

const LN_SQRT_2PI = 0.5 * Math.log(2 * Math.PI);

/**
 * Evaluates the natural logarithm of the Gamma function: ln(Γ(z)).
 * Applies Euler's reflection formula for z < 0.5:
 *   Γ(z) · Γ(1 - z) = π / sin(π·z)  =>  ln(Γ(z)) = ln(π) - ln|sin(π·z)| - ln(Γ(1 - z))
 */
export function logGamma(z: number): number {
  if (z <= 0 && Number.isInteger(z)) {
    throw new RangeError(`Gamma function has poles at non-positive integers. Received z=${z}`);
  }

  // Reflection formula for negative values and z < 0.5
  if (z < 0.5) {
    const sinPiZ = Math.sin(Math.PI * z);
    if (sinPiZ === 0) {
      throw new RangeError(`Singularity at z=${z}`);
    }
    return Math.log(Math.PI) - Math.log(Math.abs(sinPiZ)) - logGamma(1 - z);
  }

  const zPrime = z - 1;
  let sum = LANCZOS_COEFFICIENTS[0];
  for (let i = 1; i < LANCZOS_COEFFICIENTS.length; i++) {
    sum += LANCZOS_COEFFICIENTS[i] / (zPrime + i);
  }

  const t = zPrime + 7 + 0.5;
  return LN_SQRT_2PI + (zPrime + 0.5) * Math.log(t) - t + Math.log(sum);
}

/**
 * Evaluates the natural logarithm of the Beta function:
 *   ln(B(a, b)) = ln(Γ(a)) + ln(Γ(b)) - ln(Γ(a + b))
 */
export function logBeta(a: number, b: number): number {
  if (a <= 0 || b <= 0) {
    throw new RangeError(`Beta parameters must be strictly positive. Received a=${a}, b=${b}`);
  }
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

/**
 * Evaluates the Beta Probability Density Function (PDF) at value x:
 *   f(x; α, β) = [x^(α - 1) · (1 - x)^(β - 1)] / B(α, β)
 * Computed in log-space to ensure numerical stability against overflow/underflow.
 */
export function betaPdf(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) {
    return 0;
  }
  if (x === 0) {
    if (a < 1) return Number.POSITIVE_INFINITY;
    if (a === 1) return b;
    return 0;
  }
  if (x === 1) {
    if (b < 1) return Number.POSITIVE_INFINITY;
    if (b === 1) return a;
    return 0;
  }

  const logDensity = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logBeta(a, b);
  return Math.exp(logDensity);
}

/**
 * Regularized Incomplete Beta function I_x(a, b) = B(x; a, b) / B(a, b)
 * Evaluated via modified Lentz continued fraction expansion (Numerical Recipes).
 */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Use symmetry relation if x > (a + 1) / (a + b + 2) for rapid continued fraction convergence
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - regularizedIncompleteBeta(1 - x, b, a);
  }

  const frontFactor = Math.exp(
    a * Math.log(x) + b * Math.log(1 - x) - logBeta(a, b)
  ) / a;

  const TINY = 1e-30;
  let c = 1;
  let d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let f = d;

  const MAX_ITER = 200;
  for (let m = 1; m <= MAX_ITER; m++) {
    const m2 = 2 * m;

    // Even step
    const dNumeratorEven = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + dNumeratorEven * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + dNumeratorEven / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    f *= c * d;

    // Odd step
    const dNumeratorOdd = -((a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + dNumeratorOdd * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + dNumeratorOdd / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = c * d;
    f *= delta;

    if (Math.abs(delta - 1) < 1e-14) {
      break;
    }
  }

  return frontFactor * f;
}

/**
 * Beta Quantile Function (Inverse Incomplete Beta CDF).
 * Solves for x such that I_x(a, b) = p via Newton-Raphson with bisection safety fallbacks.
 */
export function betaQuantile(p: number, a: number, b: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;

  // Initial estimate: mean or normal quantile approximation
  let x = a / (a + b);
  let low = 0;
  let high = 1;

  for (let iter = 0; iter < 60; iter++) {
    const cdfVal = regularizedIncompleteBeta(x, a, b);
    const err = cdfVal - p;

    if (Math.abs(err) < 1e-12) {
      return x;
    }

    if (err > 0) {
      high = x;
    } else {
      low = x;
    }

    const pdfVal = betaPdf(x, a, b);
    let step = 0;

    if (pdfVal > 1e-10) {
      step = err / pdfVal;
    }

    const candidate = x - step;
    if (candidate > low && candidate < high) {
      x = candidate;
    } else {
      x = 0.5 * (low + high); // Fallback to robust bisection
    }
  }

  return x;
}

/**
 * Computes the 95% Highest Density Interval (HDI) for a Beta(α, β) distribution.
 * Finds the interval [θ_L, θ_U] containing 95% probability mass with minimal span:
 * min (θ_U - θ_L) subject to I(θ_U) - I(θ_L) = 0.95.
 */
export function calculateBetaCredibleInterval(
  alpha: number,
  beta: number,
  credibility = 0.95
): [number, number] {
  if (alpha <= 0 || beta <= 0) {
    throw new RangeError(`Alpha and Beta must be > 0. Received alpha=${alpha}, beta=${beta}`);
  }

  // Edge case: symmetric distribution
  if (Math.abs(alpha - beta) < 1e-8) {
    const tail = (1 - credibility) / 2;
    return [betaQuantile(tail, alpha, beta), betaQuantile(1 - tail, alpha, beta)];
  }

  // Strictly decreasing density (mode at 0)
  if (alpha <= 1 && beta > 1) {
    return [0, betaQuantile(credibility, alpha, beta)];
  }

  // Strictly increasing density (mode at 1)
  if (alpha > 1 && beta <= 1) {
    return [betaQuantile(1 - credibility, alpha, beta), 1];
  }

  // U-shaped density
  if (alpha <= 1 && beta <= 1) {
    const tail = (1 - credibility) / 2;
    return [betaQuantile(tail, alpha, beta), betaQuantile(1 - tail, alpha, beta)];
  }

  // Unimodal distribution: 1D optimization over lower tail probability p_L ∈ [0, 1 - credibility]
  const maxPLow = 1 - credibility;
  let bestPLow = 0;
  let minSpan = Number.POSITIVE_INFINITY;
  const steps = 40;

  for (let i = 0; i <= steps; i++) {
    const pLow = (i / steps) * maxPLow;
    const pHigh = pLow + credibility;
    const low = betaQuantile(pLow, alpha, beta);
    const high = betaQuantile(pHigh, alpha, beta);
    const span = high - low;

    if (span < minSpan) {
      minSpan = span;
      bestPLow = pLow;
    }
  }

  // Refine using golden section search around bestPLow
  const delta = maxPLow / steps;
  let aInterval = Math.max(0, bestPLow - delta);
  let bInterval = Math.min(maxPLow, bestPLow + delta);
  const phi = (Math.sqrt(5) - 1) / 2;

  let x1 = bInterval - phi * (bInterval - aInterval);
  let x2 = aInterval + phi * (bInterval - aInterval);

  const evalSpan = (pL: number): number => {
    return betaQuantile(pL + credibility, alpha, beta) - betaQuantile(pL, alpha, beta);
  };

  let f1 = evalSpan(x1);
  let f2 = evalSpan(x2);

  for (let iter = 0; iter < 20; iter++) {
    if (f1 < f2) {
      bInterval = x2;
      x2 = x1;
      f2 = f1;
      x1 = bInterval - phi * (bInterval - aInterval);
      f1 = evalSpan(x1);
    } else {
      aInterval = x1;
      x1 = x2;
      f1 = f2;
      x2 = aInterval + phi * (bInterval - aInterval);
      f2 = evalSpan(x2);
    }
  }

  const optimalPLow = (aInterval + bInterval) / 2;
  return [
    betaQuantile(optimalPLow, alpha, beta),
    betaQuantile(optimalPLow + credibility, alpha, beta),
  ];
}

// ==========================================
// 2. Expected Value & Variance
// ==========================================

/**
 * Expected value of a Beta distribution: E[θ] = α / (α + β)
 */
export function getBetaExpectation(alpha: number, beta: number): number {
  if (alpha <= 0 || beta <= 0) {
    throw new RangeError(`Alpha and Beta must be > 0. Received alpha=${alpha}, beta=${beta}`);
  }
  return alpha / (alpha + beta);
}

/**
 * Variance of a Beta distribution: Var(θ) = (α · β) / [(α + β)² · (α + β + 1)]
 */
export function getBetaVariance(alpha: number, beta: number): number {
  if (alpha <= 0 || beta <= 0) {
    throw new RangeError(`Alpha and Beta must be > 0. Received alpha=${alpha}, beta=${beta}`);
  }
  const sum = alpha + beta;
  return (alpha * beta) / (sum * sum * (sum + 1));
}

// ==========================================
// 3. Meteorological Baseline Priors
// ==========================================

/**
 * Baseline prior distributions Beta(α₀, β₀) parameterized by atmospheric physics and dermatology:
 * - Arid: TEWL spikes; barrier lipids and deep nourishment are highly favored.
 * - Temperate: Homeostatic equilibrium; light hydration and cellular turnover are balanced.
 * - Humid: Microbial growth & pore congestion; lightweight humectants and clarifying actives dominate.
 */
export const REGIME_PRIORS: Record<WeatherRegime, Record<RoutineArchetype, { alpha: number; beta: number }>> = {
  arid: {
    barrier_recovery: { alpha: 4.5, beta: 1.5 },     // E[θ] = 0.75
    deep_nourish: { alpha: 5.0, beta: 2.0 },         // E[θ] = 0.71
    lightweight_hydration: { alpha: 2.5, beta: 3.5 },// E[θ] = 0.42
    pore_clarifying: { alpha: 1.5, beta: 4.5 },      // E[θ] = 0.25
    gentle_exfoliation: { alpha: 1.2, beta: 4.8 },   // E[θ] = 0.20
  },
  temperate: {
    lightweight_hydration: { alpha: 4.5, beta: 1.5 },// E[θ] = 0.75
    pore_clarifying: { alpha: 3.5, beta: 2.5 },      // E[θ] = 0.58
    gentle_exfoliation: { alpha: 3.5, beta: 2.5 },   // E[θ] = 0.58
    barrier_recovery: { alpha: 3.0, beta: 3.0 },     // E[θ] = 0.50
    deep_nourish: { alpha: 3.0, beta: 3.0 },         // E[θ] = 0.50
  },
  humid: {
    lightweight_hydration: { alpha: 5.5, beta: 1.5 },// E[θ] = 0.79
    pore_clarifying: { alpha: 5.0, beta: 2.0 },      // E[θ] = 0.71
    gentle_exfoliation: { alpha: 3.5, beta: 2.5 },   // E[θ] = 0.58
    barrier_recovery: { alpha: 2.0, beta: 4.0 },     // E[θ] = 0.33
    deep_nourish: { alpha: 1.2, beta: 5.0 },         // E[θ] = 0.19
  },
};

// ==========================================
// 4. Closed-Form Conjugate Updating
// ==========================================

/**
 * Calculates evidence updates (Δα, Δβ) from a 1-tap skin feedback event.
 * In Beta-Binomial conjugate updating:
 *   - 'balanced' represents therapeutic success (Δα = 1.0, Δβ = 0.0).
 *   - Discomfort complaints represent failures or adjustments:
 *     * 'tight_dry': insufficient occlusivity/hydration
 *     * 'greasy_clogged': excessive comedogenicity/lipid density
 *     * 'stinging_irritated': active acid overexposure or stratum corneum disruption
 */
export function evaluateEvidenceIncrement(
  feedback: SkinFeel,
  prescribedArchetype: RoutineArchetype
): { deltaAlpha: number; deltaBeta: number } {
  switch (feedback) {
    case 'balanced':
      return { deltaAlpha: 1.0, deltaBeta: 0.0 };

    case 'tight_dry':
      if (prescribedArchetype === 'barrier_recovery' || prescribedArchetype === 'deep_nourish') {
        // Attempted hydration but incomplete relief
        return { deltaAlpha: 0.2, deltaBeta: 0.8 };
      }
      return { deltaAlpha: 0.0, deltaBeta: 1.0 };

    case 'greasy_clogged':
      if (prescribedArchetype === 'deep_nourish' || prescribedArchetype === 'barrier_recovery') {
        // Overly heavy regimen for atmospheric condition
        return { deltaAlpha: 0.0, deltaBeta: 1.2 };
      }
      return { deltaAlpha: 0.0, deltaBeta: 1.0 };

    case 'stinging_irritated':
      if (prescribedArchetype === 'gentle_exfoliation' || prescribedArchetype === 'pore_clarifying') {
        // Severe chemical irritation from active keratolytics
        return { deltaAlpha: 0.0, deltaBeta: 1.5 };
      }
      return { deltaAlpha: 0.0, deltaBeta: 1.0 };
  }
}

/**
 * Computes the full posterior state Beta(α₁, β₁) for a given archetype
 * given historical daily log evidence:
 *   α₁ = α₀ + ∑ Δα_i
 *   β₁ = β₀ + ∑ Δβ_i
 */
export function computeArchetypePosteriorState(
  archetype: RoutineArchetype,
  currentRegime: WeatherRegime,
  history: readonly DailyLogEntry[]
): BayesianArchetypeState {
  const basePrior = REGIME_PRIORS[currentRegime][archetype];
  let alpha = basePrior.alpha;
  let beta = basePrior.beta;

  for (const entry of history) {
    if (entry.prescribedArchetype === archetype) {
      const { deltaAlpha, deltaBeta } = evaluateEvidenceIncrement(entry.userReport, archetype);
      alpha += deltaAlpha;
      beta += deltaBeta;
    }
  }

  const posteriorMean = getBetaExpectation(alpha, beta);
  const variance = getBetaVariance(alpha, beta);
  const credibleInterval = calculateBetaCredibleInterval(alpha, beta, 0.95);

  return {
    archetype,
    alpha,
    beta,
    posteriorMean,
    variance,
    credibleInterval,
  };
}

// ==========================================
// 5. Variate Generation & Routine Selection
// ==========================================

/**
 * Standard Normal variate generator via Box-Muller transform: Z ~ N(0, 1)
 */
function sampleStandardNormal(): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 <= 1e-15) {
    u1 = Math.random();
  }
  u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Standard Gamma variate generator Gamma(α, 1) via Marsaglia and Tsang method (2000).
 * Valid for all α > 0.
 */
export function sampleGamma(shape: number): number {
  if (shape < 1.0) {
    // Boost for shape < 1 via Ahrens-Dieter identity: Gamma(α) = Gamma(α + 1) * U^(1/α)
    const u = Math.random();
    return sampleGamma(shape + 1.0) * Math.pow(u, 1.0 / shape);
  }

  const d = shape - 1.0 / 3.0;
  const c = 1.0 / Math.sqrt(9.0 * d);

  while (true) {
    const z = sampleStandardNormal();
    const v = Math.pow(1.0 + c * z, 3);

    if (v <= 0) {
      continue;
    }

    const u = Math.random();
    // Fast acceptance check
    if (u < 1.0 - 0.0331 * Math.pow(z, 4)) {
      return d * v;
    }

    if (Math.log(u) < 0.5 * z * z + d * (1.0 - v + Math.log(v))) {
      return d * v;
    }
  }
}

/**
 * Draws an exact pseudo-random sample θ ~ Beta(α, β):
 *   θ = X / (X + Y), where X ~ Gamma(α, 1) and Y ~ Gamma(β, 1)
 */
export function sampleBeta(alpha: number, beta: number): number {
  const x = sampleGamma(alpha);
  const y = sampleGamma(beta);
  if (x + y === 0) return 0.5;
  return x / (x + y);
}

/**
 * Filters the feasible candidate archetypes based on today's weather regime:
 * - Arid: Disallows harsh astringent clarifying routines unless specifically indicated; prioritizes lipid restoration.
 * - Humid: Restricts ultra-heavy occlusive deep nourishment to prevent folliculitis/acne.
 * - Temperate: Permissive to all archetypes.
 */
export function getFilteredArchetypesForRegime(regime: WeatherRegime): RoutineArchetype[] {
  switch (regime) {
    case 'arid':
      return ['barrier_recovery', 'deep_nourish', 'lightweight_hydration'];
    case 'humid':
      return ['lightweight_hydration', 'pore_clarifying', 'gentle_exfoliation'];
    case 'temperate':
      return [
        'barrier_recovery',
        'lightweight_hydration',
        'deep_nourish',
        'pore_clarifying',
        'gentle_exfoliation',
      ];
  }
}

export interface ThompsonSelectionResult {
  readonly selectedArchetype: RoutineArchetype;
  readonly sampledValues: Record<RoutineArchetype, number>;
  readonly posteriorStates: Record<RoutineArchetype, BayesianArchetypeState>;
}

/**
 * Thompson Sampling (Posterior Sampling):
 * Probabilistic decision rule balancing exploration of uncertain routines vs.
 * exploitation of high-efficacy routines.
 * For each eligible archetype k, draws θ_k ~ Beta(α_k, β_k) and selects argmax θ_k.
 */
export function selectRoutineByThompsonSampling(
  regime: WeatherRegime,
  allStates: Record<RoutineArchetype, BayesianArchetypeState>
): ThompsonSelectionResult {
  const eligible = getFilteredArchetypesForRegime(regime);
  const sampledValues: Record<string, number> = {};

  let bestArchetype: RoutineArchetype = eligible[0];
  let maxSample = -Number.MAX_VALUE;

  for (const archetype of Object.keys(allStates) as RoutineArchetype[]) {
    const state = allStates[archetype];
    const sample = sampleBeta(state.alpha, state.beta);
    sampledValues[archetype] = sample;

    if (eligible.includes(archetype) && sample > maxSample) {
      maxSample = sample;
      bestArchetype = archetype;
    }
  }

  return {
    selectedArchetype: bestArchetype,
    sampledValues: sampledValues as Record<RoutineArchetype, number>,
    posteriorStates: allStates,
  };
}

export interface MAPSelectionResult {
  readonly selectedArchetype: RoutineArchetype;
  readonly mapValues: Record<RoutineArchetype, number>;
  readonly posteriorStates: Record<RoutineArchetype, BayesianArchetypeState>;
}

/**
 * Maximum A Posteriori (MAP) Selection:
 * Deterministic greedy decision rule selecting the archetype with the highest posterior mode:
 *   Mode = (α - 1) / (α + β - 2) for α, β > 1.
 */
export function selectRoutineByMAP(
  regime: WeatherRegime,
  allStates: Record<RoutineArchetype, BayesianArchetypeState>
): MAPSelectionResult {
  const eligible = getFilteredArchetypesForRegime(regime);
  const mapValues: Record<string, number> = {};

  let bestArchetype: RoutineArchetype = eligible[0];
  let maxMode = -Number.MAX_VALUE;

  for (const archetype of Object.keys(allStates) as RoutineArchetype[]) {
    const { alpha, beta } = allStates[archetype];
    let mode: number;

    if (alpha > 1 && beta > 1) {
      mode = (alpha - 1) / (alpha + beta - 2);
    } else if (alpha <= 1 && beta > 1) {
      mode = 0.0;
    } else if (alpha > 1 && beta <= 1) {
      mode = 1.0;
    } else {
      mode = alpha / (alpha + beta); // Fallback to mean
    }

    mapValues[archetype] = mode;

    if (eligible.includes(archetype) && mode > maxMode) {
      maxMode = mode;
      bestArchetype = archetype;
    }
  }

  return {
    selectedArchetype: bestArchetype,
    mapValues: mapValues as Record<RoutineArchetype, number>,
    posteriorStates: allStates,
  };
}
