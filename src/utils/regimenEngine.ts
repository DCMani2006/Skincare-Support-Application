/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Adaptive Prescription & Antidote Engine
 *
 * Clinical Decision Framework:
 * 1. User Daily Priority (e.g., 'acne_breakouts', 'barrier_soothe', 'deep_hydration', 'pore_shine_control', 'gentle_glow', 'sun_defense', 'balanced_wellness')
 * 2. Temporal Past History & Skin Cycling (Irritation in past 72h? Acid used yesterday?)
 * 3. Multi-Dimensional Atmospheric Telemetry (Dry-Bulb Temp °C, Relative Humidity % RH, Solar UV Index, Dew Point °C)
 * 4. Bayesian Learned Profile (Posterior mean ranking across archetypes)
 * 5. General Skincare Rules & Contraindications (No acid-stacking, no daytime photosensitizers, no heavy occlusives on humid/hot acne)
 */

import type {
  BayesianArchetypeState,
  DailyLogEntry,
  RoutineArchetype,
  RoutinePlan,
  RoutineStep,
  SkinFeel,
  SkinPriority,
  WeatherTelemetry,
} from '../types/dermaSync';
import {
  INGREDIENT_DATABASE,
  evaluatePastHistoryAndAntidotes,
} from '../data/skincareDatasets';

// ==========================================
// 1. Helper: Bayesian Archetype Selector
// ==========================================

function selectTopArchetype(
  candidates: readonly RoutineArchetype[],
  profileHistory: readonly BayesianArchetypeState[],
  fallback: RoutineArchetype
): RoutineArchetype {
  if (!profileHistory || profileHistory.length === 0) {
    return fallback;
  }

  let bestArchetype = fallback;
  let highestMean = -1;

  for (const candidate of candidates) {
    const match = profileHistory.find((p) => p.archetype === candidate);
    if (match && match.posteriorMean > highestMean) {
      highestMean = match.posteriorMean;
      bestArchetype = candidate;
    }
  }

  return bestArchetype;
}

// ==========================================
// 2. Helper: Thermal, Humidity & UV Formatters
// ==========================================

function buildWeatherPrecautionAlert(
  temp: number,
  humidity: number,
  uvIndex: number,
  isEmergencyBarrier: boolean
): string | undefined {
  if (isEmergencyBarrier) {
    const envTail =
      humidity < 40
        ? `Low humidity (${humidity}% RH) and ${temp.toFixed(1)}°C air accelerate moisture loss through micro-fissures—reapply ceramide balm liberally.`
        : temp > 28
          ? `Elevated heat (${temp.toFixed(1)}°C) triggers neurogenic flushing—store your Centella ampoule cool and avoid heavy heat-trapping petrolatum.`
          : `Ambient conditions (${temp.toFixed(1)}°C, ${humidity}% RH) support steady recovery—wash with lukewarm water only.`;
    return `⚠️ EMERGENCY BARRIER RESET ACTIVATED: All chemical exfoliants (AHAs, BHAs, Vitamin C) and retinoids are strictly suspended. ${envTail}`;
  }

  const alerts: string[] = [];

  if (uvIndex >= 9.0) {
    alerts.push(
      `☀️ EXTREME SOLAR UV ALERT (UV ${uvIndex.toFixed(1)}): Intense photo-oxidative stress. Strictly suspend all daytime acids/retinoids, layer antioxidant Vitamin C under SPF 50+ PA++++, and reapply every 90–120 minutes outdoors.`
    );
  } else if (uvIndex >= 6.0) {
    alerts.push(
      `☀️ HIGH UV WARNING (UV ${uvIndex.toFixed(1)}): Elevated solar radiation accelerates PIH dark spots and collagen breakdown. Keep exfoliating acids strictly to PM and apply 2 finger-lengths of SPF 50+.`
    );
  }

  if (temp >= 34) {
    alerts.push(
      `🔥 THERMAL HEATWAVE STRESS (${temp.toFixed(1)}°C): Sebaceous excretion increases ~10% per +1°C rise. Avoid heavy waxes/petrolatum that trap sweat and trigger miliaria/heat congestion.`
    );
  } else if (temp < 12) {
    alerts.push(
      `❄️ CRYO-THERMAL BARRIER ADVISORY (${temp.toFixed(1)}°C): Cold air constricts dermal micro-capillaries and stiffens lipid bilayers. Rinse with lukewarm (never hot) water and seal with physiological ceramides.`
    );
  }

  if (humidity < 25) {
    alerts.push(
      `🏜️ EXTREME DESERT ARIDITY (${humidity}% RH): Unsealed humectants (Hyaluronic Acid) will draw water OUT of your dermis into dry air. Lock in hydration within 60 seconds with a ceramide + squalane seal.`
    );
  } else if (humidity < 40) {
    alerts.push(
      `🏜️ ARID CLIMATE ADVISORY (${humidity}% RH): Low ambient vapor pressure accelerates Transepidermal Water Loss (TEWL). Buffer active treatments with a ceramide moisturizer.`
    );
  } else if (humidity >= 85) {
    alerts.push(
      `💧 TROPICAL MONSOON HUMIDITY (${humidity}% RH): Near-saturated air prevents sweat evaporation and pools sebum in pores. Switch to 100% oil-free hydro-gels.`
    );
  }

  return alerts.length > 0 ? alerts.join(' • ') : undefined;
}

function buildProtectStep(
  temp: number,
  humidity: number,
  uvIndex: number,
  priority: SkinPriority
): { step: RoutineStep; activeName: string } {
  const isArid = humidity < 40;
  const isHumid = humidity > 70;
  const isHot = temp > 28;
  const isCold = temp < 12;
  const isHighUv = uvIndex >= 6.0;
  const isModUv = uvIndex >= 3.0 && uvIndex < 6.0;

  if (priority === 'barrier_soothe' || (isArid && priority === 'acne_breakouts')) {
    return {
      step: {
        step: 4,
        action: 'Protect',
        productType: isHighUv
          ? '100% Pure Mineral Zinc Oxide Sunscreen SPF 50+ PA++++ (Fragrance-Free)'
          : isModUv
            ? 'Calming Mineral Zinc Oxide Daily Shield SPF 50 (AM) / Ceramide Balm Seal (PM)'
            : 'Soothing Mineral Zinc Barrier Veil SPF 30+ (AM) / Squalane Lipid Seal (PM)',
        guidance: `UV Index is ${uvIndex.toFixed(1)} at ${temp.toFixed(1)}°C: Non-nano Zinc Oxide (18%) sits gently atop the stratum corneum to reflect UV rays while soothing erythema without chemical filter stinging.`,
        keyActive: INGREDIENT_DATABASE.mineral_zinc_spf.name,
      },
      activeName: INGREDIENT_DATABASE.mineral_zinc_spf.name,
    };
  }

  if (isHumid || isHot || priority === 'pore_shine_control') {
    return {
      step: {
        step: 4,
        action: 'Protect',
        productType: isHighUv
          ? `Sweat-Resistant Ultra-Matte Fluid Sunscreen SPF 50+ PA++++ (${temp.toFixed(1)}°C Heat-Proof)`
          : isModUv
            ? 'Weightless Silica-Matrix Fluid Sunscreen SPF 50 PA++++'
            : 'Featherlight Sebum-Absorbing UV Fluid SPF 30+ (AM) / Oil-Free Peptide Gel (PM)',
        guidance: `At ${temp.toFixed(1)}°C and ${humidity}% RH (UV ${uvIndex.toFixed(1)}), heavy sunscreens melt and clog pores. Apply 2 finger-lengths of this silica-microsphere fluid to control shine${isHighUv ? ' and reapply every 2 hours outdoors' : ''}.`,
        keyActive: INGREDIENT_DATABASE.chemical_fluid_spf.name,
      },
      activeName: INGREDIENT_DATABASE.chemical_fluid_spf.name,
    };
  }

  if (isArid || isCold || priority === 'deep_hydration') {
    return {
      step: {
        step: 4,
        action: 'Protect',
        productType: isHighUv
          ? 'Nourishing Squalane + Mineral Zinc Sunscreen Cream SPF 50+ PA++++'
          : 'Lipid-Enriched Moisture Lock SPF 50 (AM) / 100% Plant Squalane Occlusive Seal (PM)',
        guidance: `Dry/cool air (${temp.toFixed(1)}°C, ${humidity}% RH, UV ${uvIndex.toFixed(1)}) strips surface lipids. AM: Apply 2 finger-lengths of moisturizing SPF 50+. PM: Pat 2–3 drops of pure squalane oil over cream to arrest nocturnal TEWL.`,
        keyActive: isHighUv ? INGREDIENT_DATABASE.mineral_zinc_spf.name : INGREDIENT_DATABASE.squalane.name,
      },
      activeName: isHighUv ? INGREDIENT_DATABASE.mineral_zinc_spf.name : INGREDIENT_DATABASE.squalane.name,
    };
  }

  return {
    step: {
      step: 4,
      action: 'Protect',
      productType: isHighUv
        ? 'Broad-Spectrum Photostable Fluid Sunscreen SPF 50+ PA++++'
        : isModUv
          ? 'Everyday Invisible Antioxidant Sunscreen SPF 50'
          : 'Lightweight Daily Urban UV Shield SPF 30–50',
      guidance: `Solar UV is ${uvIndex.toFixed(1)} (${temp.toFixed(1)}°C, ${humidity}% RH). ${isHighUv ? 'High UV: Apply 2 full finger-lengths (1/4 tsp) to face and neck and reapply every 2 hours outdoors.' : 'Apply 2 finger-lengths every morning to prevent cumulative photoaging.'}`,
      keyActive: INGREDIENT_DATABASE.chemical_fluid_spf.name,
    },
    activeName: INGREDIENT_DATABASE.chemical_fluid_spf.name,
  };
}

// ==========================================
// 3. Main Rule & Antidote Engine
// ==========================================

export function generateDailyRoutine(
  weather: WeatherTelemetry,
  profileHistory: readonly BayesianArchetypeState[] = [],
  lastSkinFeelOrLogs?: SkinFeel | readonly DailyLogEntry[],
  userPriority: SkinPriority = 'balanced_wellness'
): RoutinePlan {
  // Graceful fallback for weather telemetry
  const temp = typeof weather?.temp === 'number' && !isNaN(weather.temp) ? weather.temp : 25.0;
  const humidity = typeof weather?.humidity === 'number' && !isNaN(weather.humidity) ? weather.humidity : 50;
  const uvIndex = typeof weather?.uvIndex === 'number' && !isNaN(weather.uvIndex) ? weather.uvIndex : 3.0;
  const dewPoint =
    typeof weather?.dewPoint === 'number' && !isNaN(weather.dewPoint)
      ? weather.dewPoint
      : Number((temp - (100 - humidity) / 5).toFixed(1));

  // Multi-dimensional meteorological classification
  const isHighUv = uvIndex >= 6.0;
  const isLowUv = uvIndex < 3.0;
  const isArid = humidity < 40;
  const isHumid = humidity > 70;
  const isHot = temp > 28;
  const isCold = temp < 12;

  const thermalLabel = isHot
    ? `Hot (${temp.toFixed(1)}°C)`
    : isCold
      ? `Cold (${temp.toFixed(1)}°C)`
      : `Moderate (${temp.toFixed(1)}°C)`;

  const humidityLabel = isArid
    ? `Arid (${humidity}% RH)`
    : isHumid
      ? `Humid (${humidity}% RH)`
      : `Temperate (${humidity}% RH)`;

  const uvLabel = isHighUv
    ? `High UV (${uvIndex.toFixed(1)})`
    : isLowUv
      ? `Low UV (${uvIndex.toFixed(1)})`
      : `Moderate UV (${uvIndex.toFixed(1)})`;

  // Normalize historical logs
  let recentLogs: readonly DailyLogEntry[] = [];
  let lastSkinFeel: SkinFeel | undefined;

  if (Array.isArray(lastSkinFeelOrLogs)) {
    recentLogs = lastSkinFeelOrLogs;
    if (recentLogs.length > 0) {
      const sorted = [...recentLogs].sort((a, b) => b.dayIndex - a.dayIndex);
      lastSkinFeel = sorted[0].userReport;
    }
  } else if (typeof lastSkinFeelOrLogs === 'string') {
    lastSkinFeel = lastSkinFeelOrLogs;
    recentLogs = [
      {
        dayIndex: 1,
        date: new Date().toISOString().split('T')[0],
        weather,
        userReport: lastSkinFeel,
        prescribedArchetype: 'lightweight_hydration',
        satisfactionScore: 4.0,
      },
    ];
  }

  // Evaluate temporal skin cycling & antidote safety checks
  const historyAudit = evaluatePastHistoryAndAntidotes(recentLogs, userPriority, weather);

  // --------------------------------------------------------------------------
  // RULE 1: BARRIER REPAIR & SOOTHING (OR ACUTE RECENT STINGING)
  // Adapts texture & barrier seal to Temp, Humidity, and UV!
  // --------------------------------------------------------------------------
  if (
    userPriority === 'barrier_soothe' ||
    historyAudit.hasRecentIrritation ||
    lastSkinFeel === 'stinging_irritated'
  ) {
    const protect = buildProtectStep(temp, humidity, uvIndex, 'barrier_soothe');

    const cleanseProduct = isCold || isArid
      ? 'Ultra-Gentle Colloidal Oat & Squalane Lipid Milk Cleanser'
      : isHot || isHumid
        ? 'Cooling Micellar Colloidal Oat & Thermal Water Gel Wash'
        : 'Ultra-Gentle Colloidal Oat Milk Cleanser';

    const treatProduct = isHot
      ? 'Cooling 0.2% Madecassoside (Centella) & 5% Panthenol Thermal-Calm Ampoule'
      : 'Soothing 5% D-Panthenol & Centella Calming Ampoule';

    const moisturizeProduct = isArid || isCold
      ? 'Intensive Multi-Ceramide (3:1:1) & Squalane Cryo-Barrier Repair Balm'
      : isHumid || isHot
        ? 'Breathable Colloidal Oat & Multi-Ceramide Cooling Hydro-Emulsion'
        : 'Physiological Multi-Ceramide (NP/AP/EOP) Barrier Repair Cream';

    const moisturizeGuidance = isArid || isCold
      ? `In ${humidityLabel}, ${thermalLabel} air, epidermal micro-fissures lose water rapidly. Generously press this rich ceramide + squalane balm onto damp skin to seal cracked lipid bilayers.`
      : isHumid || isHot
        ? `In ${humidityLabel}, ${thermalLabel} conditions, heavy petrolatum traps heat and worsens redness. This breathable ceramide emulsion repairs the stratum corneum while letting heat escape.`
        : `Smooth over face and neck at ${temp.toFixed(1)}°C (${humidity}% RH) to infuse skin-identical ceramides, cholesterol, and fatty acids.`;

    const steps: RoutineStep[] = [
      {
        step: 1,
        action: 'Cleanse',
        productType: cleanseProduct,
        guidance: `Wash gently with ${isHot ? 'cool-to-lukewarm' : 'lukewarm'} water for 30 seconds (${temp.toFixed(1)}°C ambient). Pat dry softly—never rub—to protect the recovering acid mantle.`,
        keyActive: INGREDIENT_DATABASE.colloidal_oat.name,
      },
      {
        step: 2,
        action: 'Treat',
        productType: treatProduct,
        guidance: `Press 3–4 drops into damp skin. Down-regulates IL-1α cytokines${isHot ? ` and counteracts ${temp.toFixed(1)}°C heat-induced vasodilation` : ''} with zero exfoliating acids.`,
        keyActive: INGREDIENT_DATABASE.centella_asiatica.name,
      },
      {
        step: 3,
        action: 'Moisturize',
        productType: moisturizeProduct,
        guidance: moisturizeGuidance,
        keyActive: INGREDIENT_DATABASE.multi_ceramides.name,
      },
      protect.step,
    ];

    const rationale = `Why this routine today? Barrier Repair protocol calibrated for ${humidityLabel}, ${thermalLabel}, and ${uvLabel}. All direct acids (AHAs/BHAs) and retinoids are suspended to prevent stinging. Because today is ${isArid ? 'arid' : isHumid ? 'humid' : 'temperate'} and ${isHot ? 'hot' : isCold ? 'cold' : 'mild'}, your barrier repair vehicle is tuned to a ${isArid || isCold ? 'rich ceramide-squalane balm' : isHumid || isHot ? 'cooling, non-occlusive oat-ceramide emulsion' : 'physiological multi-ceramide cream'}.`;

    return {
      archetype: 'barrier_recovery',
      title:
        isArid || isCold
          ? 'Cryo-Arid Intensive Barrier Rescue & Lipid Seal Protocol'
          : isHumid || isHot
            ? 'Thermal-Calming Breathable Barrier Recovery Protocol'
            : '72-Hour Physiological Barrier Reset & Soothing Protocol',
      rationale,
      steps,
      precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, true),
      userPriority: 'barrier_soothe',
      activeIngredients: [
        INGREDIENT_DATABASE.colloidal_oat.name,
        INGREDIENT_DATABASE.centella_asiatica.name,
        INGREDIENT_DATABASE.multi_ceramides.name,
        protect.activeName,
      ],
      antidoteRationale:
        historyAudit.antidoteRationale ||
        `Barrier antidote calibrated to ${temp.toFixed(1)}°C and ${humidity}% RH.`,
      historyConsiderations: historyAudit.historyConsiderations,
      contraindicationsAvoided: historyAudit.contraindicationsAvoided,
    };
  }

  // --------------------------------------------------------------------------
  // RULE 2: USER CHOSE "ACNE & BREAKOUTS" TODAY
  // Adapts across Arid / Temperate / Humid + Cold / Moderate / Hot + UV Index
  // --------------------------------------------------------------------------
  if (userPriority === 'acne_breakouts') {
    const canUseBHA = !historyAudit.usedStrongAcidRecently;
    const protect = buildProtectStep(temp, humidity, uvIndex, 'acne_breakouts');

    if (isHumid) {
      const steps: RoutineStep[] = [
        {
          step: 1,
          action: 'Cleanse',
          productType: isHot
            ? 'Cooling Amino Acid, Green Tea & Zinc PCA Purifying Gel Wash'
            : 'Purifying Amino Acid & Zinc PCA Foaming Cleanser',
          guidance: `At ${temp.toFixed(1)}°C and ${humidity}% RH (Dew Point ${dewPoint.toFixed(1)}°C), sebum and sweat pool rapidly. Lather for 45 seconds to clear follicular ostia without stripping barrier lipids.`,
          keyActive: INGREDIENT_DATABASE.niacinamide_zinc.name,
        },
        {
          step: 2,
          action: 'Treat',
          productType: canUseBHA
            ? isHighUv
              ? 'Niacinamide 5% + Zinc PCA (AM) / Salicylic Acid 2% BHA (PM Only — High UV Shield)'
              : 'Salicylic Acid (BHA 2%) & Zinc PCA Sebum-Clarifying Solution'
            : 'Azelaic Acid 10% + Centella Calming Serum (Skin Cycling Acid-Rest Day)',
          guidance: canUseBHA
            ? `Lipophilic 2% BHA cuts through ${humidity}% RH humidity-trapped sebum plugs${isHighUv ? `, while daytime application is shifted to Niacinamide due to UV ${uvIndex.toFixed(1)}` : ''}.`
            : 'Skin Cycling Rest: Using non-exfoliating Azelaic Acid + Centella to suppress C. acnes without over-thinning the stratum corneum.',
          keyActive: canUseBHA
            ? INGREDIENT_DATABASE.salicylic_acid.name
            : INGREDIENT_DATABASE.azelaic_acid.name,
        },
        {
          step: 3,
          action: 'Moisturize',
          productType: isHot
            ? 'Cryo-Cooling 100% Oil-Free Polyglutamic & Centella Water-Gel'
            : '100% Oil-Free Hydro-Gel with Polyglutamic Acid & Green Tea',
          guidance: `Zero-comedogenic water-gel engineered for ${humidity}% RH and ${temp.toFixed(1)}°C—hydrates deeply while preventing sweat-trapped comedones.`,
          keyActive: INGREDIENT_DATABASE.hyaluronic_polyglutamic.name,
        },
        protect.step,
      ];

      return {
        archetype: 'pore_clarifying',
        title: isHot
          ? 'Tropical Heat & Humidity Sebum-Purifying Acne Protocol'
          : 'Humid Climate Pore-Clarifying & Anti-Blemish Regimen',
        rationale: `Why this routine today? You selected Acne Care in ${humidityLabel}, ${thermalLabel} conditions (Dew Point ${dewPoint.toFixed(1)}°C, ${uvLabel}). Elevated humidity${isHot ? ' combined with thermal heat' : ''} slows sweat evaporation and accelerates sebum oxidation, feeding Cutibacterium acnes. Today prescribes ${canUseBHA ? 'lipophilic 2% Salicylic Acid' : '10% Azelaic Acid'}, Sebum-regulating Zinc PCA, and a 100% oil-free hydro-gel.`,
        steps,
        precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
        userPriority: 'acne_breakouts',
        activeIngredients: [
          canUseBHA ? INGREDIENT_DATABASE.salicylic_acid.name : INGREDIENT_DATABASE.azelaic_acid.name,
          INGREDIENT_DATABASE.niacinamide_zinc.name,
          INGREDIENT_DATABASE.hyaluronic_polyglutamic.name,
          protect.activeName,
        ],
        antidoteRationale:
          historyAudit.antidoteRationale ||
          `Oil-free tropical acne defense calibrated to ${humidity}% RH and ${temp.toFixed(1)}°C.`,
        historyConsiderations: historyAudit.historyConsiderations,
        contraindicationsAvoided: historyAudit.contraindicationsAvoided,
      };
    }

    if (isArid) {
      const steps: RoutineStep[] = [
        {
          step: 1,
          action: 'Cleanse',
          productType: isCold
            ? 'Creamy Colloidal Oat & Squalane Barrier-Preserving Wash'
            : 'Non-Stripping Hydrating Oat & Amino Acid Cleanser',
          guidance: `In dry ${humidity}% RH air (${temp.toFixed(1)}°C), harsh foaming acne washes strip lipids and trigger rebound breakouts. Massage gently with lukewarm water.`,
          keyActive: INGREDIENT_DATABASE.colloidal_oat.name,
        },
        {
          step: 2,
          action: 'Treat',
          productType: isHighUv
            ? '10% Micronized Azelaic Acid + Niacinamide Serum (UV-Safe Anti-Blemish)'
            : '10% Micronized Azelaic Acid & Centella Blemish Calming Serum',
          guidance: `In ${humidity}% RH arid air, high-strength BHA peels cause severe flaking around pustules. Azelaic Acid (10%) eliminates C. acnes and fades red marks without stripping moisture.`,
          keyActive: INGREDIENT_DATABASE.azelaic_acid.name,
        },
        {
          step: 3,
          action: 'Moisturize',
          productType: isCold
            ? 'Non-Comedogenic Multi-Ceramide & Squalane Barrier Cream'
            : 'Non-Comedogenic Multi-Ceramide (NP/AP/EOP) Barrier Lotion',
          guidance: `Seals micro-fissures caused by ${humidity}% RH dry air (${temp.toFixed(1)}°C) with comedogenic-rating-0 ceramides to stop dehydration-induced oil spikes.`,
          keyActive: INGREDIENT_DATABASE.multi_ceramides.name,
        },
        protect.step,
      ];

      return {
        archetype: 'barrier_recovery',
        title: isCold
          ? 'Cold-Arid Dehydrated-Acne & Barrier Buffer Protocol'
          : 'Arid Climate Dehydrated-Acne Rescue Protocol',
        rationale: `Why this routine today? You selected Acne Care in ${humidityLabel}, ${thermalLabel} conditions (${uvLabel}). In dry air (<40% RH), conventional acne astringents crack the stratum corneum and trigger compensatory sebum surges ("dry acne"). Today replaces drying peels with 10% Micronized Azelaic Acid and a non-comedogenic Multi-Ceramide buffer.`,
        steps,
        precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
        userPriority: 'acne_breakouts',
        activeIngredients: [
          INGREDIENT_DATABASE.azelaic_acid.name,
          INGREDIENT_DATABASE.centella_asiatica.name,
          INGREDIENT_DATABASE.multi_ceramides.name,
          protect.activeName,
        ],
        antidoteRationale:
          historyAudit.antidoteRationale ||
          `Non-stripping Azelaic Acid + Ceramide buffer deployed for ${humidity}% RH arid acne.`,
        historyConsiderations: historyAudit.historyConsiderations,
        contraindicationsAvoided: historyAudit.contraindicationsAvoided,
      };
    }

    // TEMPERATE ACNE PROTOCOL (adapts to Cold / Moderate / Hot & UV)
    const steps: RoutineStep[] = [
      {
        step: 1,
        action: 'Cleanse',
        productType: isCold
          ? 'Gentle Amino Acid & Colloidal Oat Gel-Milk Cleanser'
          : 'Balanced Amino Acid & Zinc PCA Gel Cleanser',
        guidance: `Cleanses pores at ${temp.toFixed(1)}°C and ${humidity}% RH without disrupting normal epidermal pH (4.7–5.5).`,
        keyActive: INGREDIENT_DATABASE.niacinamide_zinc.name,
      },
      {
        step: 2,
        action: 'Treat',
        productType: canUseBHA
          ? isHighUv
            ? 'Niacinamide 5% + Zinc PCA (AM) / Salicylic Acid 2% BHA Serum (PM)'
            : 'Salicylic Acid 2% (BHA) + Niacinamide 5% Clarifying Serum'
          : '10% Azelaic Acid + Madecassoside Calming Emulsion',
        guidance: canUseBHA
          ? `Clears follicular microcomedones in ${humidity}% RH air${isHighUv ? ` while reserving BHA for evening due to UV ${uvIndex.toFixed(1)}` : ''}.`
          : 'Skin cycling rest day: Soothes active breakouts without over-exfoliation.',
        keyActive: canUseBHA
          ? INGREDIENT_DATABASE.salicylic_acid.name
          : INGREDIENT_DATABASE.azelaic_acid.name,
      },
      {
        step: 3,
        action: 'Moisturize',
        productType: isHot
          ? 'Weightless Niacinamide & Polyglutamic Gel-Lotion'
          : isCold
            ? 'Protective Ceramide & Squalane Non-Comedogenic Cream'
            : 'Lightweight Ceramide & Squalane Moisture Emulsion',
        guidance: `Calibrated for ${temp.toFixed(1)}°C: ${isHot ? 'cooling gel-lotion prevents heat-induced oiliness' : isCold ? 'extra ceramide cushion shields against cold wind' : 'maintains skin-identical lipid balance without clogging pores'}.`,
        keyActive: INGREDIENT_DATABASE.multi_ceramides.name,
      },
      protect.step,
    ];

    return {
      archetype: 'pore_clarifying',
      title: isHot
        ? 'Warm-Temperate Sebum & Blemish Control Protocol'
        : isCold
          ? 'Cool-Temperate Barrier-Safe Anti-Blemish Protocol'
          : 'Balanced Anti-Blemish Clarifying Protocol',
      rationale: `Why this routine today? You selected Acne Care in ${humidityLabel}, ${thermalLabel} weather (${uvLabel}). With balanced ${humidity}% RH moisture and ${temp.toFixed(1)}°C temperatures, today pairs ${canUseBHA ? '2% Salicylic Acid and Niacinamide' : '10% Azelaic Acid'} with a ${isHot ? 'cooling gel-lotion' : isCold ? 'protective ceramide cream' : 'lightweight ceramide emulsion'}.`,
      steps,
      precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
      userPriority: 'acne_breakouts',
      activeIngredients: [
        canUseBHA ? INGREDIENT_DATABASE.salicylic_acid.name : INGREDIENT_DATABASE.azelaic_acid.name,
        INGREDIENT_DATABASE.niacinamide_zinc.name,
        INGREDIENT_DATABASE.multi_ceramides.name,
        protect.activeName,
      ],
      antidoteRationale:
        historyAudit.antidoteRationale ||
        `Targeted blemish control calibrated to ${humidity}% RH and ${temp.toFixed(1)}°C.`,
      historyConsiderations: historyAudit.historyConsiderations,
      contraindicationsAvoided: historyAudit.contraindicationsAvoided,
    };
  }

  // --------------------------------------------------------------------------
  // RULE 3: USER CHOSE "DEEP HYDRATION & DRYNESS"
  // Adapts across Arid / Temperate / Humid + Cold / Moderate / Hot + UV
  // --------------------------------------------------------------------------
  if (userPriority === 'deep_hydration') {
    const archetype = selectTopArchetype(
      isHumid ? ['lightweight_hydration', 'deep_nourish'] : ['deep_nourish', 'barrier_recovery'],
      profileHistory,
      isHumid ? 'lightweight_hydration' : 'deep_nourish'
    );
    const protect = buildProtectStep(temp, humidity, uvIndex, 'deep_hydration');

    const steps: RoutineStep[] = [
      {
        step: 1,
        action: 'Cleanse',
        productType:
          isArid || isCold
            ? 'Hydrating Squalane & Colloidal Oat Cream Cleanser'
            : 'Gentle Glycerin & Amino Acid Hydrating Gel-Milk Wash',
        guidance: `At ${temp.toFixed(1)}°C and ${humidity}% RH, cleanse with lukewarm water to preserve intercellular lipids.`,
        keyActive: INGREDIENT_DATABASE.colloidal_oat.name,
      },
      {
        step: 2,
        action: 'Treat',
        productType: isHighUv
          ? 'Multi-Molecular Hyaluronic Acid + 10% Vitamin C Antioxidant Hydrator'
          : 'Multi-Molecular Hyaluronic Acid (2%) + Polyglutamic Acid & Panthenol B5 Serum',
        guidance: isArid
          ? `CRITICAL IN ${humidity}% RH ARID AIR: Press 3–4 drops onto soaking-damp skin and immediately seal within 30 seconds so dry air cannot draw water out.`
          : `Draws ambient moisture (${humidity}% RH, Dew Point ${dewPoint.toFixed(1)}°C) deep into the stratum corneum.`,
        keyActive: INGREDIENT_DATABASE.hyaluronic_polyglutamic.name,
      },
      {
        step: 3,
        action: 'Moisturize',
        productType: isArid || isCold
          ? 'Rich Physiological Multi-Ceramide (NP/AP/EOP) + Squalane Lipid Cream'
          : isHumid || isHot
            ? 'Deep-Quench Polyglutamic & Ceramide Bounce Water-Cream'
            : 'Balanced Multi-Ceramide & Panthenol Replenishing Cream',
        guidance: isArid || isCold
          ? `PM Sandwich Layer: Locks humectants under a biomimetic ceramide + squalane shield against ${humidity}% RH, ${temp.toFixed(1)}°C moisture evaporation.`
          : `Floods dehydrated cells with weightless ceramides without feeling heavy or sticky at ${temp.toFixed(1)}°C (${humidity}% RH).`,
        keyActive: INGREDIENT_DATABASE.multi_ceramides.name,
      },
      protect.step,
    ];

    return {
      archetype,
      title:
        isArid || isCold
          ? 'Arid-Cryo Deep Lipid-Replenishing & Moisture Sandwich Protocol'
          : isHumid || isHot
            ? 'Humid-Climate Humectant Reservoir & Bounce-Gel Protocol'
            : 'Multi-Molecular Deep Hydration & Ceramide Lock Regimen',
      rationale: `Why this routine today? You selected Deep Hydration in ${humidityLabel}, ${thermalLabel} weather (${uvLabel}). ${
        isArid
          ? `Because ambient humidity is low (${humidity}% RH), unsealed humectants evaporate rapidly—so today uses the Ceramide + Squalane sandwich seal.`
          : isHumid
            ? `With ${humidity}% RH ambient moisture (Dew Point ${dewPoint.toFixed(1)}°C), Hyaluronic and Polyglutamic Acid effortlessly pull atmospheric water into your skin using a breathable water-cream.`
            : `In temperate ${humidity}% RH air at ${temp.toFixed(1)}°C, dual-weight humectants paired with physiological ceramides restore optimal skin suppleness.`
      }`,
      steps,
      precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
      userPriority: 'deep_hydration',
      activeIngredients: [
        INGREDIENT_DATABASE.hyaluronic_polyglutamic.name,
        INGREDIENT_DATABASE.multi_ceramides.name,
        INGREDIENT_DATABASE.panthenol.name,
        protect.activeName,
      ],
      antidoteRationale:
        historyAudit.antidoteRationale ||
        `Hydration architecture tuned to ${humidity}% RH vapor pressure and ${temp.toFixed(1)}°C.`,
      historyConsiderations: historyAudit.historyConsiderations,
      contraindicationsAvoided: historyAudit.contraindicationsAvoided,
    };
  }

  // --------------------------------------------------------------------------
  // RULE 4: USER CHOSE "PORE CLARIFYING & SHINE"
  // Adapts across Arid ("Dehydrated Shine") vs Temperate vs Humid ("Tropical Sebum")
  // --------------------------------------------------------------------------
  if (userPriority === 'pore_shine_control') {
    const archetype = selectTopArchetype(
      isArid ? ['lightweight_hydration', 'pore_clarifying'] : ['pore_clarifying', 'lightweight_hydration'],
      profileHistory,
      'pore_clarifying'
    );
    const protect = buildProtectStep(temp, humidity, uvIndex, 'pore_shine_control');

    const steps: RoutineStep[] = [
      {
        step: 1,
        action: 'Cleanse',
        productType: isArid || isCold
          ? 'pH-Balanced Amino Acid & Niacinamide Micellar Gel Wash'
          : 'Purifying Amino Acid & Zinc PCA Foaming Gel Wash',
        guidance: `At ${temp.toFixed(1)}°C and ${humidity}% RH, removes oxidized surface sebum without triggering rebound oil production.`,
        keyActive: INGREDIENT_DATABASE.niacinamide_zinc.name,
      },
      {
        step: 2,
        action: 'Treat',
        productType: isArid
          ? 'Niacinamide 5% + Zinc PCA & Hyaluronic Rebound-Oil Balancer'
          : isHighUv
            ? 'Niacinamide 5% + Green Tea Sebum Balancer (AM) / Salicylic Acid 2% BHA (PM)'
            : 'Salicylic Acid 2% (BHA) & Niacinamide 5% Pore-Refining Serum',
        guidance: isArid
          ? `In dry ${humidity}% RH air, T-zone shine is often compensatory oil from dehydration. Niacinamide + Zinc regulates sebum while keeping water levels plump.`
          : `Dissolves deep follicular sebum plugs accelerated by ${temp.toFixed(1)}°C warmth and ${humidity}% RH humidity.`,
        keyActive: isArid
          ? INGREDIENT_DATABASE.niacinamide_zinc.name
          : INGREDIENT_DATABASE.salicylic_acid.name,
      },
      {
        step: 3,
        action: 'Moisturize',
        productType: isArid || isCold
          ? 'Oil-Free Ceramide & Squalane Matte-Finish Balancing Fluid'
          : '100% Oil-Free Hydro-Gel with Polyglutamic Acid & Green Tea',
        guidance: isArid || isCold
          ? `Prevents dry-air tightness at ${humidity}% RH (${temp.toFixed(1)}°C) with a soft-matte, non-greasy finish.`
          : `Ultralight water-gel absorbs instantly at ${temp.toFixed(1)}°C with zero pore occlusion.`,
        keyActive: isArid
          ? INGREDIENT_DATABASE.multi_ceramides.name
          : INGREDIENT_DATABASE.hyaluronic_polyglutamic.name,
      },
      protect.step,
    ];

    return {
      archetype,
      title: isArid
        ? 'Arid Rebound-Shine & Pore-Balancing Protocol'
        : isHumid || isHot
          ? 'Tropical Heat & Humidity Matte Pore-Clarifying Protocol'
          : 'Sebum-Regulating Pore Clarifying Protocol',
      rationale: `Why this routine today? You selected Pore & Shine Control in ${humidityLabel}, ${thermalLabel} conditions (${uvLabel}). ${
        isArid
          ? `In dry air (${humidity}% RH), excess T-zone shine is frequently rebound sebum triggered by surface dehydration—so today pairs 5% Niacinamide + Zinc PCA with an oil-free ceramide fluid.`
          : `At ${temp.toFixed(1)}°C and ${humidity}% RH, sebaceous flux is elevated. Today deploys 2% BHA, Zinc PCA, and a 100% oil-free hydro-gel to mattify pores.`
      }`,
      steps,
      precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
      userPriority: 'pore_shine_control',
      activeIngredients: [
        isArid ? INGREDIENT_DATABASE.niacinamide_zinc.name : INGREDIENT_DATABASE.salicylic_acid.name,
        INGREDIENT_DATABASE.niacinamide_zinc.name,
        isArid
          ? INGREDIENT_DATABASE.multi_ceramides.name
          : INGREDIENT_DATABASE.hyaluronic_polyglutamic.name,
        protect.activeName,
      ],
      antidoteRationale:
        historyAudit.antidoteRationale ||
        `Sebum & pore regulation calibrated to ${temp.toFixed(1)}°C and ${humidity}% RH.`,
      historyConsiderations: historyAudit.historyConsiderations,
      contraindicationsAvoided: historyAudit.contraindicationsAvoided,
    };
  }

  // --------------------------------------------------------------------------
  // RULE 5: USER CHOSE "GENTLE GLOW & EXFOLIATION"
  // Adapts acid choice & vehicle to UV Index, Humidity, and Temperature
  // --------------------------------------------------------------------------
  if (userPriority === 'gentle_glow') {
    const canExfoliate = !historyAudit.usedStrongAcidRecently && !isHighUv;
    const protect = buildProtectStep(temp, humidity, uvIndex, 'gentle_glow');

    const treatProduct = !canExfoliate
      ? 'Stabilized Vitamin C (10% 3-O-Ethyl Ascorbic) + Ectoin Radiance Shield (AM) / Lactic Acid 5% (PM Only)'
      : isArid || isCold
        ? 'Humectant Lactic Acid 5% + Micro-Algae Gentle Renewal Serum'
        : isHumid || isHot
          ? 'Glycolic Acid 7% (AHA) + Niacinamide Pore-Polishing Solution (PM)'
          : 'Lactic Acid 5% + Stabilized Vitamin C Radiance Duo';

    const treatActive = !canExfoliate
      ? INGREDIENT_DATABASE.vitamin_c.name
      : isHumid || isHot
        ? INGREDIENT_DATABASE.glycolic_acid.name
        : INGREDIENT_DATABASE.lactic_acid.name;

    const steps: RoutineStep[] = [
      {
        step: 1,
        action: 'Cleanse',
        productType: isArid || isCold
          ? 'Creamy Oat & Amino Acid Radiance Wash'
          : 'Gentle Hydrating Amino Acid Gel Cleanser',
        guidance: `Prepares stratum corneum at ${temp.toFixed(1)}°C (${humidity}% RH) without stripping barrier lipids prior to active renewal.`,
        keyActive: INGREDIENT_DATABASE.colloidal_oat.name,
      },
      {
        step: 2,
        action: 'Treat',
        productType: treatProduct,
        guidance: !canExfoliate
          ? `Because UV is ${uvIndex.toFixed(1)}${historyAudit.usedStrongAcidRecently ? ' and you exfoliated recently' : ''}, daytime AHAs are barred to prevent sunburn cells. Using 10% Vitamin C for safe antioxidant glow.`
          : isArid || isCold
            ? `In ${humidity}% RH, ${temp.toFixed(1)}°C air, Lactic Acid (5%) is chosen over Glycolic Acid because its larger molecular weight acts as a natural humectant.`
            : `Smooths rough corneocytes in ${humidity}% RH, ${temp.toFixed(1)}°C conditions for glass-skin luminosity.`,
        keyActive: treatActive,
      },
      {
        step: 3,
        action: 'Moisturize',
        productType: isArid || isCold
          ? 'Multi-Ceramide & Squalane Post-Exfoliation Recovery Cream'
          : isHumid || isHot
            ? 'Oil-Free Centella & Polyglutamic Dewy Hydro-Gel'
            : 'Balanced Ceramide & Centella Moisture Emulsion',
        guidance: `Buffers newly revealed keratinocytes against ${temp.toFixed(1)}°C and ${humidity}% RH atmospheric stress.`,
        keyActive: INGREDIENT_DATABASE.multi_ceramides.name,
      },
      protect.step,
    ];

    return {
      archetype: 'gentle_exfoliation',
      title: isHighUv
        ? 'High-UV Antioxidant Radiance & PM-Only Renewal Protocol'
        : isArid || isCold
          ? 'Arid-Safe Humectant Lactic Acid & Ceramide Glow Regimen'
          : 'Gentle Radiance & Cellular Micro-Renewal Regimen',
      rationale: `Why this routine today? You selected Gentle Glow in ${humidityLabel}, ${thermalLabel} conditions (${uvLabel}). ${
        isHighUv
          ? `Because Solar UV is elevated (${uvIndex.toFixed(1)}), daytime AHA peeling is blocked in favor of 10% Stabilized Vitamin C + SPF 50+.`
          : isArid
            ? `In dry air (${humidity}% RH), Lactic Acid 5% buffs away dullness while acting as a water-binding humectant.`
            : `Balanced ${humidity}% RH moisture at ${temp.toFixed(1)}°C allows smooth keratinocyte turnover supported by ceramide replenishment.`
      }`,
      steps,
      precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
      userPriority: 'gentle_glow',
      activeIngredients: [
        treatActive,
        INGREDIENT_DATABASE.multi_ceramides.name,
        protect.activeName,
      ],
      antidoteRationale:
        historyAudit.antidoteRationale ||
        `Renewal active calibrated to UV ${uvIndex.toFixed(1)} and ${humidity}% RH.`,
      historyConsiderations: historyAudit.historyConsiderations,
      contraindicationsAvoided: historyAudit.contraindicationsAvoided,
    };
  }

  // --------------------------------------------------------------------------
  // RULE 6: USER CHOSE "MAXIMUM SUN & URBAN SHIELD" ('sun_defense')
  // --------------------------------------------------------------------------
  if (userPriority === 'sun_defense') {
    const protect = buildProtectStep(temp, humidity, uvIndex, 'sun_defense');

    const steps: RoutineStep[] = [
      {
        step: 1,
        action: 'Cleanse',
        productType: isHumid || isHot
          ? 'Antioxidant Green Tea & Amino Acid Purifying Gel Wash'
          : 'Gentle Hydrating Colloidal Oat & Amino Acid Cleanser',
        guidance: `Removes urban particulate matter and oxidized sebum at ${temp.toFixed(1)}°C (${humidity}% RH).`,
        keyActive: INGREDIENT_DATABASE.colloidal_oat.name,
      },
      {
        step: 2,
        action: 'Treat',
        productType:
          uvIndex >= 6.0
            ? '10% Stabilized Vitamin C + Ferulic & Ectoin Photo-Defense Serum (AM)'
            : '10% Vitamin C + Niacinamide 5% Urban Antioxidant Serum',
        guidance: `Neutralizes singlet oxygen free radicals generated by UV ${uvIndex.toFixed(1)} and ${temp.toFixed(1)}°C thermal radiation, boosting sunscreen efficacy by 4x.`,
        keyActive: INGREDIENT_DATABASE.vitamin_c.name,
      },
      {
        step: 3,
        action: 'Moisturize',
        productType: isArid || isCold
          ? 'Multi-Ceramide & Squalane UV-Barrier Moisture Cream'
          : isHumid || isHot
            ? 'Weightless Centella & Hyaluronic Cooling Gel-Fluid'
            : 'Balanced Ceramide & Centella Daily Moisture Emulsion',
        guidance: `Creates an even, hydrated canvas at ${humidity}% RH (${temp.toFixed(1)}°C) so sunscreen filters form an unbroken protective film.`,
        keyActive: isArid || isCold
          ? INGREDIENT_DATABASE.multi_ceramides.name
          : INGREDIENT_DATABASE.centella_asiatica.name,
      },
      protect.step,
    ];

    return {
      archetype: isArid ? 'barrier_recovery' : 'lightweight_hydration',
      title:
        uvIndex >= 8.0
          ? 'Extreme Solar Index Antioxidant & Photostable SPF 50+ Shield'
          : isHumid || isHot
            ? 'Tropical Sweat-Proof Photoprotection & Antioxidant Regimen'
            : 'Maximum Sun & Urban Free-Radical Defense Protocol',
      rationale: `Why this routine today? You selected Sun & Urban Shield under ${uvLabel}, ${humidityLabel}, and ${thermalLabel}. Stabilized Vitamin C (10%) scavenges UV-induced reactive oxygen species while a ${isHumid || isHot ? 'sweat-resistant matte fluid SPF 50+' : isArid ? 'lipid-enriched mineral zinc SPF 50+' : 'broad-spectrum photostable SPF 50+'} blocks UVA/UVB damage.`,
      steps,
      precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
      userPriority: 'sun_defense',
      activeIngredients: [
        INGREDIENT_DATABASE.vitamin_c.name,
        isArid || isCold
          ? INGREDIENT_DATABASE.multi_ceramides.name
          : INGREDIENT_DATABASE.centella_asiatica.name,
        protect.activeName,
      ],
      antidoteRationale:
        historyAudit.antidoteRationale ||
        `Photoprotection matrix calibrated to UV ${uvIndex.toFixed(1)}, ${temp.toFixed(1)}°C, and ${humidity}% RH.`,
      historyConsiderations: historyAudit.historyConsiderations,
      contraindicationsAvoided: historyAudit.contraindicationsAvoided,
    };
  }

  // --------------------------------------------------------------------------
  // RULE 7: BALANCED DAILY WELLNESS ('balanced_wellness')
  // Pure meteorological adaptation driven by Humidity, Temperature, and UV!
  // --------------------------------------------------------------------------
  const candidates: RoutineArchetype[] = isArid
    ? ['deep_nourish', 'barrier_recovery']
    : isHumid
      ? ['lightweight_hydration', 'pore_clarifying']
      : ['lightweight_hydration', 'gentle_exfoliation', 'barrier_recovery'];

  const archetype = selectTopArchetype(
    candidates,
    profileHistory,
    isArid ? 'deep_nourish' : 'lightweight_hydration'
  );
  const protect = buildProtectStep(temp, humidity, uvIndex, 'balanced_wellness');

  const steps: RoutineStep[] = [
    {
      step: 1,
      action: 'Cleanse',
      productType: isArid || isCold
        ? 'Hydrating Colloidal Oat & Squalane Cream Cleanser'
        : isHumid || isHot
          ? 'Refreshing Amino Acid & Zinc PCA Foaming Gel Cleanser'
          : 'Gentle Hydrating Amino Acid Gel Cleanser',
      guidance: `Calibrated for ${temp.toFixed(1)}°C and ${humidity}% RH: cleanses impurities while keeping the acid mantle balanced.`,
      keyActive: isHumid || isHot
        ? INGREDIENT_DATABASE.niacinamide_zinc.name
        : INGREDIENT_DATABASE.colloidal_oat.name,
    },
    {
      step: 2,
      action: 'Treat',
      productType: isHighUv
        ? 'Stabilized Vitamin C (10%) + 3% Ectoin Antioxidant Shield'
        : isArid || isCold
          ? 'Multi-Molecular Hyaluronic Acid + 5% Panthenol B5 Plumping Serum'
          : isHumid || isHot
            ? 'Niacinamide 5% + Zinc PCA & Green Tea Balancing Serum'
            : 'Centella Asiatica + Niacinamide 5% Everyday Balancing Serum',
      guidance: isHighUv
        ? `High UV (${uvIndex.toFixed(1)}): Antioxidant Vitamin C neutralizes solar free radicals at ${temp.toFixed(1)}°C.`
        : isArid || isCold
          ? `Draws deep water reserves into skin exposed to ${humidity}% RH, ${temp.toFixed(1)}°C air.`
          : isHumid || isHot
            ? `Regulates sebum flux triggered by ${temp.toFixed(1)}°C warmth and ${humidity}% RH moisture.`
            : 'Maintains daily skin equilibrium, supports collagen integrity, and refines pores.',
      keyActive: isHighUv
        ? INGREDIENT_DATABASE.vitamin_c.name
        : isArid || isCold
          ? INGREDIENT_DATABASE.hyaluronic_polyglutamic.name
          : INGREDIENT_DATABASE.niacinamide_zinc.name,
    },
    {
      step: 3,
      action: 'Moisturize',
      productType: isArid || isCold
        ? 'Physiological Multi-Ceramide (NP/AP/EOP) & Squalane Barrier Cream'
        : isHumid || isHot
          ? '100% Oil-Free Polyglutamic & Centella Hydro-Gel'
          : 'Balanced Ceramide & Centella Daily Moisture Emulsion',
      guidance: isArid || isCold
        ? `Seals the epidermis against ${humidity}% RH dry air and ${temp.toFixed(1)}°C temperatures to prevent TEWL.`
        : isHumid || isHot
          ? `Weightless water-gel hydrates at ${temp.toFixed(1)}°C (${humidity}% RH) without trapping sweat or oil.`
          : `Lightweight lotion providing balanced lipid replenishment for temperate ${humidity}% RH conditions.`,
      keyActive: isHumid || isHot
        ? INGREDIENT_DATABASE.hyaluronic_polyglutamic.name
        : INGREDIENT_DATABASE.multi_ceramides.name,
    },
    protect.step,
  ];

  return {
    archetype,
    title: isArid
      ? isCold
        ? 'Cryo-Arid Lipid Shield & Moisture Lock Routine'
        : 'Arid Climate Ceramide & Humectant Seal Routine'
      : isHumid
        ? isHot
          ? 'Tropical Heat Oil-Free Hydro-Gel & Matte Defense Routine'
          : 'Humid Climate Weightless Balancing Routine'
        : isHot
          ? 'Warm-Day Cooling Antioxidant & Fluid Balance Routine'
          : isCold
            ? 'Cold-Weather Barrier Cushion & Daily Shield Routine'
            : 'Balanced Hydro-Protect Routine',
    rationale: `Why this routine today? Under ${humidityLabel}, ${thermalLabel}, and ${uvLabel} (Dew Point ${dewPoint.toFixed(1)}°C), your skin requires ${
      isArid
        ? 'occlusive ceramide-squalane protection to stop rapid vapor loss'
        : isHumid
          ? 'breathable oil-free hydro-gels and Zinc PCA to prevent humidity-induced congestion'
          : 'homeostatic ceramide and antioxidant balance'
    }${isHot ? ` paired with cooling textures for ${temp.toFixed(1)}°C heat` : isCold ? ` and extra lipid cushioning against ${temp.toFixed(1)}°C cold air` : ''}.`,
    steps,
    precautionAlert: buildWeatherPrecautionAlert(temp, humidity, uvIndex, false),
    userPriority: 'balanced_wellness',
    activeIngredients: [
      isHighUv
        ? INGREDIENT_DATABASE.vitamin_c.name
        : isArid || isCold
          ? INGREDIENT_DATABASE.hyaluronic_polyglutamic.name
          : INGREDIENT_DATABASE.niacinamide_zinc.name,
      isHumid || isHot
        ? INGREDIENT_DATABASE.hyaluronic_polyglutamic.name
        : INGREDIENT_DATABASE.multi_ceramides.name,
      protect.activeName,
    ],
    antidoteRationale: historyAudit.antidoteRationale,
    historyConsiderations: historyAudit.historyConsiderations,
    contraindicationsAvoided: historyAudit.contraindicationsAvoided,
  };
}
