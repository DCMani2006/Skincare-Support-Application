/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Comprehensive Dermatological Datasets:
 * - Real Active Ingredients & Interactions Database
 * - Clinical Skin Priority / Concern Profiles
 * - Weather-Skin Dynamic Interaction Rules
 * - Temporal History & Antidote Protocols (Skin Cycling & Barrier Safety)
 */

import type {
  RoutineArchetype,
  SkinPriority,
  SkincareActiveIngredient,
  WeatherTelemetry,
  DailyLogEntry,
} from '../types/dermaSync';

// ============================================================================
// 1. SCIENTIFIC ACTIVE INGREDIENTS DATABASE
// ============================================================================

export const INGREDIENT_DATABASE: Record<string, SkincareActiveIngredient> = {
  salicylic_acid: {
    id: 'salicylic_acid',
    name: 'Salicylic Acid (BHA 2%)',
    inciName: 'Salicylic Acid',
    category: 'exfoliant_bha',
    clinicalAction:
      'Lipophilic beta-hydroxy acid that dissolves desmosomes and penetrates deep into sebaceous follicular infundibula, removing microcomedones and suppressing C. acnes.',
    targetConcerns: ['acne_breakouts', 'pore_shine_control'],
    optimalRegimes: ['humid', 'temperate'],
    timeOfDay: 'pm',
    comedogenicRating: 0,
    incompatibleWith: ['glycolic_acid', 'retinol', 'benzoyl_peroxide'],
    cautionNotes:
      'Avoid stacking on consecutive days or in <30% relative humidity without compensatory ceramide buffer.',
  },

  benzoyl_peroxide: {
    id: 'benzoyl_peroxide',
    name: 'Micronized Benzoyl Peroxide (2.5%)',
    inciName: 'Benzoyl Peroxide',
    category: 'antimicrobial',
    clinicalAction:
      'Releases reactive oxygen species (free radicals) that selectively destroy anaerobic Cutibacterium acnes without inducing bacterial resistance.',
    targetConcerns: ['acne_breakouts'],
    optimalRegimes: ['humid', 'temperate'],
    timeOfDay: 'pm',
    comedogenicRating: 0,
    incompatibleWith: ['vitamin_c', 'retinol'],
    cautionNotes:
      'High potential for transepidermal moisture stripping in arid weather. Use 2.5% concentration to match 10% efficacy with minimal erythema.',
  },

  azelaic_acid: {
    id: 'azelaic_acid',
    name: 'Azelaic Acid (10% Micronized)',
    inciName: 'Azelaic Acid',
    category: 'anti_inflammatory',
    clinicalAction:
      'Dicarboxylic acid that normalizes follicular keratinization, inhibits competitive tyrosinase (preventing PIE/PIH marks), and calms inflammatory papules.',
    targetConcerns: ['acne_breakouts', 'barrier_soothe', 'gentle_glow'],
    optimalRegimes: ['arid', 'temperate', 'humid'],
    timeOfDay: 'any',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes:
      'Exceptional for arid acne and sensitive blemish-prone skin where conventional BHA is too drying.',
  },

  niacinamide_zinc: {
    id: 'niacinamide_zinc',
    name: 'Niacinamide (5%) + Zinc PCA (1%)',
    inciName: 'Niacinamide, Zinc PCA',
    category: 'anti_inflammatory',
    clinicalAction:
      'Inhibits sebaceous lipogenesis via selective 5-alpha reductase down-regulation while up-regulating physiological ceramide synthesis and tightening enlarged pores.',
    targetConcerns: ['pore_shine_control', 'acne_breakouts', 'balanced_wellness'],
    optimalRegimes: ['humid', 'temperate', 'arid'],
    timeOfDay: 'any',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes:
      'Concentrations at 5% provide optimal tolerance without the micro-flushing occasionally seen at >10%.',
  },

  centella_asiatica: {
    id: 'centella_asiatica',
    name: 'Centella Asiatica (Madecassoside 0.2% + Asiaticoside)',
    inciName: 'Centella Asiatica Leaf Extract',
    category: 'anti_inflammatory',
    clinicalAction:
      'Accelerates cellular re-epithelialization, down-regulates pro-inflammatory cytokines (IL-1alpha, TNF-alpha), and mitigates cutaneous burning sensations.',
    targetConcerns: ['barrier_soothe', 'acne_breakouts', 'balanced_wellness'],
    optimalRegimes: ['arid', 'temperate', 'humid'],
    timeOfDay: 'any',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes: 'Safe for acute chemical peel burns and active stinging flare-ups.',
  },

  multi_ceramides: {
    id: 'multi_ceramides',
    name: 'Multi-Ceramide Matrix (NP, AP, EOP) + Phytosphingosine',
    inciName: 'Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine',
    category: 'barrier_lipid',
    clinicalAction:
      'Reconstitutes intercellular stratum corneum lamellar lipid sheets in exact 3:1:1 physiological ratio with cholesterol and essential free fatty acids.',
    targetConcerns: ['barrier_soothe', 'deep_hydration', 'acne_breakouts'],
    optimalRegimes: ['arid', 'temperate'],
    timeOfDay: 'any',
    comedogenicRating: 1,
    incompatibleWith: [],
    cautionNotes:
      'Essential antidote whenever skin barrier is compromised or when weather drops below 40% RH.',
  },

  hyaluronic_polyglutamic: {
    id: 'hyaluronic_polyglutamic',
    name: 'Multi-Weight Hyaluronic Acid + Polyglutamic Acid (PGA)',
    inciName: 'Sodium Hyaluronate, Polyglutamic Acid',
    category: 'humectant',
    clinicalAction:
      'Combines low dalton polymers (deep hydration reservoir) with PGA micro-film forming polymers holding 4x more water than HA alone.',
    targetConcerns: ['deep_hydration', 'pore_shine_control', 'balanced_wellness'],
    optimalRegimes: ['temperate', 'humid'],
    timeOfDay: 'any',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes:
      'In arid air (<30% RH), humectants must be sealed immediately with an emollient or lipid seal to prevent reverse water extraction.',
  },

  panthenol: {
    id: 'panthenol',
    name: 'D-Panthenol (Pro-Vitamin B5 5%)',
    inciName: 'Panthenol',
    category: 'anti_inflammatory',
    clinicalAction:
      'Hygroscopic humectant converted in situ to pantothenic acid; stimulates fibroblast proliferation and rapidly stops stinging sensations.',
    targetConcerns: ['barrier_soothe', 'deep_hydration'],
    optimalRegimes: ['arid', 'temperate', 'humid'],
    timeOfDay: 'any',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes: 'Universal soothing antidote for acute reactive episodes.',
  },

  vitamin_c: {
    id: 'vitamin_c',
    name: 'Stabilized Vitamin C (10% 3-O-Ethyl Ascorbic Acid)',
    inciName: '3-O-Ethyl Ascorbic Acid',
    category: 'antioxidant',
    clinicalAction:
      'Scavenges reactive oxygen species triggered by atmospheric ozone and solar UVA/UVB, enhances photoprotection, and inhibits tyrosinase melanogenesis.',
    targetConcerns: ['sun_defense', 'gentle_glow', 'balanced_wellness'],
    optimalRegimes: ['temperate', 'humid', 'arid'],
    timeOfDay: 'am',
    comedogenicRating: 0,
    incompatibleWith: ['benzoyl_peroxide'],
    cautionNotes:
      'Pair with daytime broad-spectrum SPF 50+. Suspend if stratum corneum is currently stinging.',
  },

  glycolic_acid: {
    id: 'glycolic_acid',
    name: 'Glycolic Acid (AHA 7%)',
    inciName: 'Glycolic Acid',
    category: 'exfoliant_aha',
    clinicalAction:
      'Smallest molecular weight AHA that hydrolyzes corneodesmosomal bonds in stratum compactum, triggering rapid keratinocyte renewal.',
    targetConcerns: ['gentle_glow'],
    optimalRegimes: ['temperate'],
    timeOfDay: 'pm',
    comedogenicRating: 0,
    incompatibleWith: ['salicylic_acid', 'retinol', 'benzoyl_peroxide'],
    cautionNotes:
      'Mandates daytime photoprotection. Strict contraindication in solar UV >= 7 or within 72 hours of barrier irritation.',
  },

  lactic_acid: {
    id: 'lactic_acid',
    name: 'Lactic Acid (5%) + Micro-Algae',
    inciName: 'Lactic Acid',
    category: 'exfoliant_aha',
    clinicalAction:
      'Larger molecule alpha-hydroxy acid with intrinsic humectant properties that gently smooths roughness without acute TEWL.',
    targetConcerns: ['gentle_glow', 'deep_hydration'],
    optimalRegimes: ['arid', 'temperate'],
    timeOfDay: 'pm',
    comedogenicRating: 0,
    incompatibleWith: ['salicylic_acid', 'retinol'],
    cautionNotes: 'Milder alternative to glycolic acid on sensitive skin.',
  },

  squalane: {
    id: 'squalane',
    name: '100% Pure Plant Squalane Oil',
    inciName: 'Squalane',
    category: 'barrier_lipid',
    clinicalAction:
      'Fully saturated hydrocarbon biomimetic to human sebum squalene; creates a breathable, non-comedogenic shield stopping arid vapor loss.',
    targetConcerns: ['deep_hydration', 'barrier_soothe'],
    optimalRegimes: ['arid'],
    timeOfDay: 'pm',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes:
      'Apply 2-3 drops as the final layer ("sandwich technique") in dry atmospheric air (<40% RH).',
  },

  colloidal_oat: {
    id: 'colloidal_oat',
    name: 'Micronized Colloidal Oat Extract (1%)',
    inciName: 'Avena Sativa (Oat) Kernel Flour',
    category: 'anti_inflammatory',
    clinicalAction:
      'Rich in avenanthramides and beta-glucan polymers; coats hyper-reactive nerve endings and immediately quells itch, redness, and stinging.',
    targetConcerns: ['barrier_soothe', 'acne_breakouts'],
    optimalRegimes: ['arid', 'temperate', 'humid'],
    timeOfDay: 'any',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes: 'First-line antidote for chemical irritation or barrier breach.',
  },

  mineral_zinc_spf: {
    id: 'mineral_zinc_spf',
    name: 'Broad-Spectrum Mineral SPF 50+ (Zinc Oxide 18%)',
    inciName: 'Zinc Oxide, Titanium Dioxide',
    category: 'sunscreen_filter',
    clinicalAction:
      'Reflects both UVA (photoaging) and UVB (erythema) photons physically. Zinc delivers topical calming benefits to active acne and reactive blemishes.',
    targetConcerns: ['sun_defense', 'acne_breakouts', 'barrier_soothe'],
    optimalRegimes: ['arid', 'temperate', 'humid'],
    timeOfDay: 'am',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes: 'Mandatory non-comedogenic protection when UV index >= 6.',
  },

  chemical_fluid_spf: {
    id: 'chemical_fluid_spf',
    name: 'Ultra-Light Fluid Sunscreen SPF 50+ PA++++',
    inciName: 'Uvinul A Plus, Tinosorb S, Mexoryl SX',
    category: 'sunscreen_filter',
    clinicalAction:
      'High-performance photostable organic filters in weightless silica-matrix that absorbs UV radiation with zero pore occlusion or sweat trapping.',
    targetConcerns: ['sun_defense', 'pore_shine_control', 'balanced_wellness'],
    optimalRegimes: ['humid', 'temperate'],
    timeOfDay: 'am',
    comedogenicRating: 0,
    incompatibleWith: [],
    cautionNotes: 'Ideal for tropical humidity (>70% RH) and high perspiration environments.',
  },
};

// ============================================================================
// 2. CLINICAL CONCERN PROFILES & PRIORITY METADATA
// ============================================================================

export interface PriorityMetadata {
  readonly id: SkinPriority;
  readonly label: string;
  readonly shortDescription: string;
  readonly emoji: string;
  readonly defaultArchetype: RoutineArchetype;
  readonly primaryActiveIds: readonly string[];
  readonly weatherRationaleNotes: {
    readonly arid: string;
    readonly temperate: string;
    readonly humid: string;
  };
}

export const SKIN_PRIORITIES_METADATA: Record<SkinPriority, PriorityMetadata> = {
  acne_breakouts: {
    id: 'acne_breakouts',
    label: 'Active Acne & Breakouts',
    shortDescription: 'Clear blemishes, pustules & prevent scarring without barrier burn',
    emoji: '🎯',
    defaultArchetype: 'pore_clarifying',
    primaryActiveIds: ['salicylic_acid', 'azelaic_acid', 'niacinamide_zinc', 'mineral_zinc_spf'],
    weatherRationaleNotes: {
      humid:
        'In humid weather (>70% RH), sweat and excess sebum accelerate C. acnes proliferation. The antidote is oil-free 2% BHA (Salicylic Acid) to liquefy follicular plugs + 5% Niacinamide, strictly avoiding heavy pore-clogging occlusives.',
      arid:
        'In dry air (<40% RH), harsh acne washes strip the stratum corneum, creating micro-fissures and rebound blemish flare-ups ("dry acne"). The antidote is 10% Azelaic Acid + Ceramide buffer lotion instead of dehydrating alcohol-based peels.',
      temperate:
        'In temperate air, balanced pore clearing with Salicylic Acid PM and Niacinamide + Zinc PCA AM keeps sebum balanced without dehydration.',
    },
  },

  barrier_soothe: {
    id: 'barrier_soothe',
    label: 'Barrier Repair & Soothing',
    shortDescription: 'Calm stinging, redness, burning, and compromised skin layers',
    emoji: '🛡️',
    defaultArchetype: 'barrier_recovery',
    primaryActiveIds: ['colloidal_oat', 'centella_asiatica', 'multi_ceramides', 'panthenol'],
    weatherRationaleNotes: {
      humid:
        'Soothes inflammation using light centella and colloidal oat emulsion to avoid heat trapping under heavy vaseline.',
      arid:
        'Rapid TEWL worsens burning. Immediate antidote: physiological multi-ceramides (NP/AP/EOP) and squalane seal over damp skin.',
      temperate:
        'Restores lipid bilayers with panthenol B5 and multi-ceramides, suspending all acids for 72 hours.',
    },
  },

  deep_hydration: {
    id: 'deep_hydration',
    label: 'Deep Hydration & Dryness',
    shortDescription: 'Quench tight, stretching skin, dullness, and micro-flaking',
    emoji: '💧',
    defaultArchetype: 'deep_nourish',
    primaryActiveIds: ['hyaluronic_polyglutamic', 'multi_ceramides', 'squalane', 'panthenol'],
    weatherRationaleNotes: {
      humid:
        'High ambient humidity allows humectants (Hyaluronic & Polyglutamic Acid) to pull moisture from ambient air with minimal heavy oils needed.',
      arid:
        'Critical: Humectants in dry air can pull water OUT of the dermis unless sealed! Prescribing the PM ceramide + squalane sandwich.',
      temperate:
        'Dual-layer hydration with multi-molecular hyaluronic serum + light ceramide moisture seal.',
    },
  },

  pore_shine_control: {
    id: 'pore_shine_control',
    label: 'Pore Clarifying & Shine',
    shortDescription: 'Regulate midday sebum surges, refine pores, and mattify T-zone',
    emoji: '🍃',
    defaultArchetype: 'pore_clarifying',
    primaryActiveIds: ['niacinamide_zinc', 'salicylic_acid', 'chemical_fluid_spf'],
    weatherRationaleNotes: {
      humid:
        'High heat and moisture double sebum excretion rate. Prescribing Zinc PCA to curb lipogenesis + weightless oil-free water gel.',
      arid:
        'T-zone shine in dry weather is frequently rebound oiliness caused by surface dehydration. Prescribing Niacinamide + light hydration.',
      temperate:
        'Balanced pore maintenance with gentle 2% BHA exfoliation and matte fluid sunscreen.',
    },
  },

  gentle_glow: {
    id: 'gentle_glow',
    label: 'Gentle Glow & Exfoliation',
    shortDescription: 'Buff away dull surface keratin and smooth uneven texture',
    emoji: '✨',
    defaultArchetype: 'gentle_exfoliation',
    primaryActiveIds: ['lactic_acid', 'vitamin_c', 'centella_asiatica'],
    weatherRationaleNotes: {
      humid:
        'Cellular turnover optimized with gentle hydroxy acids PM; ensures skin is refreshed without heavy oil buildup.',
      arid:
        'Lactic Acid 5% is selected because its molecule also functions as a natural humectant, avoiding glycolic acid flaking.',
      temperate:
        'Gentle bi-weekly exfoliation paired with stabilized Vitamin C antioxidant defense in the AM.',
    },
  },

  sun_defense: {
    id: 'sun_defense',
    label: 'Maximum Sun & Urban Shield',
    shortDescription: 'High photoprotection against strong UV, ozone, and pigment spots',
    emoji: '☀️',
    defaultArchetype: 'lightweight_hydration',
    primaryActiveIds: ['mineral_zinc_spf', 'vitamin_c', 'chemical_fluid_spf'],
    weatherRationaleNotes: {
      humid:
        'High UV + sweat: Prescribing non-comedogenic fluid SPF 50+ PA++++ with sweat resistance and 2-finger measurement.',
      arid:
        'High UV + dry air: Prescribing mineral zinc oxide SPF 50+ formulated with glycerin to reflect rays without moisture loss.',
      temperate:
        'Broad-spectrum antioxidant shield: Stabilized Vitamin C under broad-spectrum SPF 50+ with 2-hour reapplication rule.',
    },
  },

  balanced_wellness: {
    id: 'balanced_wellness',
    label: 'Balanced Daily Wellness',
    shortDescription: 'Maintain healthy epidermal microbiome, barrier resilience & calm',
    emoji: '⚖️',
    defaultArchetype: 'lightweight_hydration',
    primaryActiveIds: ['centella_asiatica', 'niacinamide_zinc', 'multi_ceramides'],
    weatherRationaleNotes: {
      humid: 'Refreshing lightweight hydration that adapts to sweat without clogging.',
      arid: 'Protective ceramide barrier defense preventing desquamation.',
      temperate: 'Standard homeostatic balance of cleanse, treat, moisturize, protect.',
    },
  },
};

// ============================================================================
// 3. TEMPORAL HISTORY EVALUATION & ANTIDOTE PROTOCOL
// ============================================================================

export interface HistoryAuditResult {
  readonly hasRecentIrritation: boolean; // Stinging reported in past 72h
  readonly usedStrongAcidRecently: boolean; // Acid used in past 24-48h
  readonly usedRetinoidRecently: boolean;
  readonly consecutiveExfoliationCount: number;
  readonly historicalSatisfactionAverage: number;
  readonly antidoteTriggered: boolean;
  readonly antidoteRationale?: string;
  readonly historyConsiderations: string;
  readonly contraindicationsAvoided: readonly string[];
  readonly recommendedActiveIds: readonly string[];
}

/**
 * Analyzes the user's historical log entries (past 1-7 days) to ensure
 * clinical continuity, avoid chemical burns/over-exfoliation (Skin Cycling),
 * and trigger corrective antidotes when needed.
 */
export function evaluatePastHistoryAndAntidotes(
  recentLogs: readonly DailyLogEntry[] = [],
  priority: SkinPriority = 'balanced_wellness',
  weather: WeatherTelemetry
): HistoryAuditResult {
  // Sort logs by dayIndex descending (most recent first)
  const sortedLogs = [...recentLogs].sort((a, b) => b.dayIndex - a.dayIndex);
  const lastLog = sortedLogs[0];
  const last3Logs = sortedLogs.slice(0, 3);

  // 1. Check for recent barrier irritation / stinging in past 72 hours
  const hasRecentIrritation = last3Logs.some(
    (log) => log.userReport === 'stinging_irritated'
  );

  // 2. Check if strong exfoliating acids or peels were prescribed recently
  const usedStrongAcidRecently = sortedLogs.slice(0, 2).some(
    (log) => log.prescribedArchetype === 'gentle_exfoliation'
  );

  // 3. Consecutive exfoliation count
  let consecutiveExfoliationCount = 0;
  for (const log of sortedLogs) {
    if (log.prescribedArchetype === 'gentle_exfoliation') {
      consecutiveExfoliationCount++;
    } else {
      break;
    }
  }

  // 4. Calculate historical satisfaction average
  const totalScore = recentLogs.reduce((sum, log) => sum + (log.satisfactionScore || 4.0), 0);
  const historicalSatisfactionAverage =
    recentLogs.length > 0 ? Number((totalScore / recentLogs.length).toFixed(2)) : 4.5;

  const contraindicationsAvoided: string[] = [];
  const recommendedActiveIds: string[] = [];
  let antidoteTriggered = false;
  let antidoteRationale: string | undefined;
  let historyConsiderations = '';

  // --------------------------------------------------------------------------
  // SCENARIO 1: EMERGENCY BARRIER STINGING ANTIDOTE (Rule D Extended)
  // --------------------------------------------------------------------------
  if (hasRecentIrritation || lastLog?.userReport === 'stinging_irritated') {
    antidoteTriggered = true;
    contraindicationsAvoided.push('Direct Exfoliating Acids (AHA/BHA) strictly suspended');
    contraindicationsAvoided.push('Topical Retinoids & Benzoyl Peroxide blocked');
    contraindicationsAvoided.push('Synthetic fragrances and drying alcohols excluded');

    antidoteRationale =
      '🛡️ Barrier Antidote Active: Stinging was reported in your recent logs. All exfoliating acids (Salicylic, Glycolic, Lactic) and drying actives are locked out for 72 hours to allow your lipid bilayers to seal.';

    historyConsiderations =
      `Your log history shows acute sensitivity on Day ${lastLog?.dayIndex || 'recent'}. Regardless of daily weather or acne concerns, resolving barrier micro-tears takes clinical precedence to avoid permanent chemical burn.`;

    recommendedActiveIds.push('colloidal_oat', 'centella_asiatica', 'multi_ceramides', 'panthenol');

    return {
      hasRecentIrritation,
      usedStrongAcidRecently,
      usedRetinoidRecently: false,
      consecutiveExfoliationCount,
      historicalSatisfactionAverage,
      antidoteTriggered,
      antidoteRationale,
      historyConsiderations,
      contraindicationsAvoided,
      recommendedActiveIds,
    };
  }

  // --------------------------------------------------------------------------
  // SCENARIO 2: SKIN CYCLING & EXFOLIATION COOL-DOWN ANTIDOTE
  // --------------------------------------------------------------------------
  if (usedStrongAcidRecently) {
    contraindicationsAvoided.push('Stacking back-to-back daily chemical peels avoided');
    contraindicationsAvoided.push('Prevented cumulative stratum corneum thinning');

    if (priority === 'acne_breakouts') {
      antidoteTriggered = true;
      antidoteRationale =
        '🌱 Skin Cycling Antidote for Acne: You received an exfoliating treatment within the last 24–48 hours. Stacking Salicylic Acid again today risks barrier burnout. Instead, today uses non-acid 10% Azelaic Acid + Zinc PCA to starve acne bacteria while giving your skin barrier a rest day.';
      historyConsiderations =
        'Skin Cycling Protocol: Exfoliate -> Treat/Rest -> Recover -> Protect. Yesterday was an active cycle, so today prioritizes non-stripping blemish control.';
      recommendedActiveIds.push('azelaic_acid', 'niacinamide_zinc', 'centella_asiatica', 'mineral_zinc_spf');
    } else {
      historyConsiderations =
        'Recent active exfoliation detected in your history. Today shifts into recovery & replenishing phase to maintain balanced pH.';
      recommendedActiveIds.push('centella_asiatica', 'multi_ceramides', 'hyaluronic_polyglutamic');
    }

    return {
      hasRecentIrritation,
      usedStrongAcidRecently,
      usedRetinoidRecently: false,
      consecutiveExfoliationCount,
      historicalSatisfactionAverage,
      antidoteTriggered,
      antidoteRationale,
      historyConsiderations,
      contraindicationsAvoided,
      recommendedActiveIds,
    };
  }

  // --------------------------------------------------------------------------
  // SCENARIO 3: REACTING TO YESTERDAY'S SKIN REPORT
  // --------------------------------------------------------------------------
  if (lastLog?.userReport === 'tight_dry') {
    antidoteTriggered = true;
    contraindicationsAvoided.push('Unbuffered humectants in dry air prevented');
    antidoteRationale =
      '💧 Dehydration Antidote: Yesterday you reported feeling tight & dry. Today\'s formulation upgrades your ceramide concentration and injects squalane to seal in moisture.';
    historyConsiderations =
      `Following Day ${lastLog.dayIndex}'s dry feedback, today's routine counterbalances moisture loss with physiological lipid replenishment.`;
    recommendedActiveIds.push('multi_ceramides', 'panthenol', 'squalane');
  } else if (lastLog?.userReport === 'greasy_clogged') {
    antidoteTriggered = true;
    contraindicationsAvoided.push('Comedogenic heavy butters and mineral oils removed');
    antidoteRationale =
      '🍃 Pore Relief Antidote: Following yesterday\'s clogged pore feedback, heavy emollients are purged in favor of weightless water-gels and sebum-regulating Zinc PCA.';
    historyConsiderations =
      `Day ${lastLog.dayIndex} noted congestion. Today's products strictly feature zero-comedogenic ratings.`;
    recommendedActiveIds.push('salicylic_acid', 'niacinamide_zinc', 'hyaluronic_polyglutamic');
  } else {
    // Normal steady state
    historyConsiderations =
      `Historical profile is steady with ${recentLogs.length} logged observations (satisfaction avg: ${historicalSatisfactionAverage}/5.0). Regimen is calibrated to current atmospheric conditions and your selected priority.`;
    const defaultActives = SKIN_PRIORITIES_METADATA[priority].primaryActiveIds;
    recommendedActiveIds.push(...defaultActives);
  }

  // --------------------------------------------------------------------------
  // METEOROLOGICAL & SOLAR UV FILTER CHECKS
  // --------------------------------------------------------------------------
  if (weather.uvIndex >= 6.0) {
    contraindicationsAvoided.push('Daytime photosensitizing retinoids & strong AHAs barred');
    contraindicationsAvoided.push('Mandatory Broad-Spectrum SPF 50+ enforced');
  } else if (weather.uvIndex >= 3.0) {
    contraindicationsAvoided.push('Unprotected daytime UV exposure prevented (SPF 30–50+ active)');
  }

  if (weather.temp > 28) {
    contraindicationsAvoided.push(`Heavy heat-trapping petrolatum/waxes excluded at ${weather.temp.toFixed(1)}°C`);
  } else if (weather.temp < 12) {
    contraindicationsAvoided.push(`Stripping foaming surfactants & unsealed water-gels avoided at ${weather.temp.toFixed(1)}°C`);
  }

  if (weather.humidity < 40) {
    contraindicationsAvoided.push(`Unsealed humectant reverse-osmosis prevented (${weather.humidity}% RH)`);
  } else if (weather.humidity > 70) {
    contraindicationsAvoided.push(`Pore-occluding heavy butters excluded in ${weather.humidity}% RH`);
  }

  return {
    hasRecentIrritation,
    usedStrongAcidRecently,
    usedRetinoidRecently: false,
    consecutiveExfoliationCount,
    historicalSatisfactionAverage,
    antidoteTriggered,
    antidoteRationale,
    historyConsiderations,
    contraindicationsAvoided,
    recommendedActiveIds,
  };
}
