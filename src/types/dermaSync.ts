/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Course: BAMAT207 (Probability & Statistics)
 * Foundational Domain Types & Mathematical Model Interfaces
 */

// ==========================================
// 1. Enums and Literal Unions
// ==========================================

/**
 * Atmospheric humidity regimes determined by relative humidity (% RH):
 * - 'arid': RH < 40% (high transepidermal water loss potential)
 * - 'temperate': 40% <= RH <= 70% (homeostatic ambient moisture)
 * - 'humid': RH > 70% (high sweat retention & microbial proliferation)
 */
export type WeatherRegime = 'arid' | 'temperate' | 'humid';

/**
 * Ultraviolet radiation levels:
 * - 'low': UV Index 0 - 2
 * - 'moderate': UV Index 3 - 5
 * - 'high': UV Index 6+
 */
export type UVLevel = 'low' | 'moderate' | 'high';

/**
 * User daily subjective epidermal response (1-tap feedback):
 * - 'balanced': Homeostatic success (neutral, calm, supple)
 * - 'tight_dry': Moisture deficit / stratum corneum dehydration
 * - 'greasy_clogged': Excess sebum production / pore congestion
 * - 'stinging_irritated': Barrier disruption / erythema / chemical irritation
 */
export type SkinFeel = 'balanced' | 'tight_dry' | 'greasy_clogged' | 'stinging_irritated';

/**
 * User-selected daily skin priority or primary concern:
 * - 'acne_breakouts': Active papules, pustules, inflamed blemishes, microcomedones
 * - 'barrier_soothe': Acute sensitivity, stinging, erythema, compromised stratum corneum
 * - 'deep_hydration': Parched tightness, flaking, dehydration micro-cracks
 * - 'pore_shine_control': Excess sebum flux, T-zone oiliness, enlarged pores
 * - 'gentle_glow': Texture irregularities, dullness, mild dead skin turnover
 * - 'sun_defense': Heavy outdoor photoprotection, high UV index barrier
 * - 'balanced_wellness': Daily baseline equilibrium and preventative maintenance
 */
export type SkinPriority =
  | 'acne_breakouts'
  | 'barrier_soothe'
  | 'deep_hydration'
  | 'pore_shine_control'
  | 'gentle_glow'
  | 'sun_defense'
  | 'balanced_wellness';

/**
 * Dermatological routine archetypes formulated for meteorological adaptation:
 * - 'barrier_recovery': High ceramide/lipid repair, rich occlusives
 * - 'lightweight_hydration': Humectant-dense (hyaluronic acid/glycerin), gel-based, oil-free
 * - 'deep_nourish': Squalane/fatty acid replenishment for arid desquamation
 * - 'pore_clarifying': Niacinamide, BHA/salicylic acid, sebum regulation
 * - 'gentle_exfoliation': Lactic/mandelic acid, cellular turnover optimization
 */
export type RoutineArchetype =
  | 'barrier_recovery'
  | 'lightweight_hydration'
  | 'deep_nourish'
  | 'pore_clarifying'
  | 'gentle_exfoliation';

// ==========================================
// 2. Telemetry and Daily Logging
// ==========================================

/**
 * Real-time or simulated meteorological telemetry data (Open-Meteo compliant)
 */
export interface WeatherTelemetry {
  readonly temp: number;            // Ambient dry-bulb temperature in Celsius (°C)
  readonly humidity: number;        // Relative humidity as a percentage (0 - 100%)
  readonly uvIndex: number;         // Solar UV Index (0 - 15+)
  readonly dewPoint: number;        // Dew point temperature in Celsius (°C)
  readonly locationName: string;    // Geographical locality description
  readonly timestamp: string;       // ISO 8601 timestamp string
  readonly cloudCover?: number;     // Total cloud cover as a percentage (0 - 100%)
}

/**
 * Historical daily observation and feedback entry for Bayesian updating
 */
export interface DailyLogEntry {
  readonly dayIndex: number;
  readonly date: string;
  readonly weather: WeatherTelemetry;
  readonly userReport: SkinFeel;
  readonly prescribedArchetype: RoutineArchetype;
  readonly satisfactionScore: number; // Quantitative rating: 1.0 (lowest) to 5.0 (highest)
  readonly dailyPriority?: SkinPriority;
  readonly activeIngredientsUsed?: readonly string[];
}

// ==========================================
// 3. Regimen & Prescriptions
// ==========================================

export interface RoutineStep {
  readonly step: number;
  readonly action: string;
  readonly productType: string;
  readonly guidance: string;
  readonly keyActive?: string;
}

/**
 * Meteorological adaptive skincare regimen plan
 */
export interface RoutinePlan {
  readonly archetype: RoutineArchetype;
  readonly title: string;
  readonly rationale: string;
  readonly steps: readonly RoutineStep[];
  readonly precautionAlert?: string;
  readonly userPriority?: SkinPriority;
  readonly activeIngredients?: readonly string[];
  readonly antidoteRationale?: string;
  readonly historyConsiderations?: string;
  readonly contraindicationsAvoided?: readonly string[];
}

// ==========================================
// 3b. Skincare Actives & Clinical Dataset Interfaces
// ==========================================

export type ActiveIngredientCategory =
  | 'exfoliant_bha'
  | 'exfoliant_aha'
  | 'retinoid'
  | 'antimicrobial'
  | 'barrier_lipid'
  | 'humectant'
  | 'antioxidant'
  | 'anti_inflammatory'
  | 'sunscreen_filter';

export interface SkincareActiveIngredient {
  readonly id: string;
  readonly name: string;
  readonly inciName: string;
  readonly category: ActiveIngredientCategory;
  readonly clinicalAction: string;
  readonly targetConcerns: readonly SkinPriority[];
  readonly optimalRegimes: readonly WeatherRegime[];
  readonly timeOfDay: 'am' | 'pm' | 'any';
  readonly comedogenicRating: number; // 0 to 5
  readonly incompatibleWith: readonly string[]; // IDs of conflicting ingredients
  readonly cautionNotes: string;
}

// ==========================================
// 4. Bayesian Mathematical State
// ==========================================

/**
 * State of the conjugate Beta(alpha, beta) posterior for a routine archetype
 */
export interface BayesianArchetypeState {
  readonly archetype: RoutineArchetype;
  readonly alpha: number;                                // Shape parameter α (pseudocount of successes)
  readonly beta: number;                                 // Shape parameter β (pseudocount of failures)
  readonly posteriorMean: number;                        // E[θ] = α / (α + β)
  readonly variance: number;                             // Var(θ) = (α * β) / ((α + β)^2 * (α + β + 1))
  readonly credibleInterval: readonly [number, number];  // 95% Highest Density Interval [lower, upper]
}

// ==========================================
// 5. BAMAT207 Statistical Validation Types
// ==========================================

/**
 * Module 3: Chi-Square (χ²) Test of Independence output
 * Tests independence between [Weather Regime] and [Skin Complaint]
 */
export interface ChiSquareTestResult {
  readonly chiSquare: number;
  readonly degreesOfFreedom: number;
  readonly pValue: number;
  readonly contingencyTable: Record<WeatherRegime, Record<SkinFeel, number>>;
  readonly expectedTable: Record<WeatherRegime, Record<SkinFeel, number>>;
  readonly isSignificant: boolean; // True if p < 0.05
  readonly criticalValue95: number;
}

/**
 * Module 4: Multiple Logistic Regression output
 * Log-odds of skin discomfort: ln(p / (1 - p)) = β₀ + β₁·Humidity + β₂·UV
 */
export interface LogisticRegressionResult {
  readonly coefficients: {
    readonly intercept: number;
    readonly humidityCoef: number;
    readonly uvCoef: number;
  };
  readonly oddsRatios: {
    readonly humidityOR: number; // exp(humidityCoef)
    readonly uvOR: number;       // exp(uvCoef)
  };
  readonly standardErrors: {
    readonly intercept: number;
    readonly humidityCoef: number;
    readonly uvCoef: number;
  };
  readonly zValues: {
    readonly intercept: number;
    readonly humidityCoef: number;
    readonly uvCoef: number;
  };
  readonly pValues: {
    readonly intercept: number;
    readonly humidityCoef: number;
    readonly uvCoef: number;
  };
  readonly deviance: number;
  readonly nullDeviance: number;
  readonly aic: number;
  readonly iterations: number;
  readonly converged: boolean;
  readonly predictDiscomfortProbability: (humidity: number, uv: number) => number;
}

/**
 * Module 5: One-Way ANOVA output
 * Evaluates whether satisfaction scores differ significantly across routine archetypes
 */
export interface AnovaGroupStat {
  readonly count: number;
  readonly mean: number;
  readonly variance: number;
  readonly stdDev: number;
}

export interface OneWayAnovaResult {
  readonly fStatistic: number;
  readonly pValue: number;
  readonly dfBetween: number;
  readonly dfWithin: number;
  readonly ssBetween: number;
  readonly ssWithin: number;
  readonly ssTotal: number;
  readonly msBetween: number;
  readonly msWithin: number;
  readonly groupStats: Record<RoutineArchetype, AnovaGroupStat>;
  readonly isSignificant: boolean; // True if p < 0.05
}
