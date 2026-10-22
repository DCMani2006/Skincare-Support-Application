/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Course: BAMAT207 (Probability & Statistics)
 * Dermatological Routine Catalog: Archetypes, Step Formulations, and Rationale
 */

import type { RoutineArchetype, RoutinePlan, WeatherRegime } from '../types/dermaSync';

export const ROUTINE_CATALOG: Record<RoutineArchetype, RoutinePlan> = {
  barrier_recovery: {
    archetype: 'barrier_recovery',
    title: 'Lipid-Replenishing Barrier Recovery Regimen',
    rationale:
      'Formulated for severe moisture deficits and transepidermal water loss (TEWL) in arid (<40% RH) or high-evaporation environments. Uses physiological 3:1:1 lipid ratios (ceramides, cholesterol, free fatty acids) and panthenol to seal stratum corneum micro-fissures.',
    precautionAlert:
      'Atmospheric humidity < 40% accelerates epidermal evaporation. Apply moisturizers onto damp skin immediately after gentle non-foaming cleansing.',
    steps: [
      {
        step: 1,
        action: 'Cleanse',
        productType: 'Colloidal Oat Hydrating Milk Cleanser',
        guidance: 'pH 5.5 sulfate-free emulsion. Lukewarm water rinse to prevent lipid barrier stripping.',
      },
      {
        step: 2,
        action: 'Hydrate & Soothe',
        productType: 'Centella Asiatica + 5% Panthenol Essence',
        guidance: 'Pat gently across face and neck. Promotes rapid micro-circulatory calming.',
      },
      {
        step: 3,
        action: 'Barrier Restoration',
        productType: 'Multi-Ceramide Complex (NP, AP, EOP) Emulsion',
        guidance: 'Mimics stratum corneum lamellar lipids to restore membrane permeability barrier.',
      },
      {
        step: 4,
        action: 'Occlusive Seal (AM/PM)',
        productType: 'Squalane + Microcrystalline Occlusive Balm',
        guidance: 'Forms a flexible semi-permeable film resisting dry atmospheric vapor pressure gradients.',
      },
      {
        step: 5,
        action: 'Photoprotection (AM Only)',
        productType: 'Broad-Spectrum Mineral SPF 50+ Zinc Oxide',
        guidance: 'Non-nano zinc provides physical UV reflection without chemical irritation.',
      },
    ],
  },

  lightweight_hydration: {
    archetype: 'lightweight_hydration',
    title: 'Hydro-Dynamic Balancing & Moisture-Lock Regimen',
    rationale:
      'Engineered for temperate to humid environments (40-80% RH). Relies on multi-weight hyaluronic acid, beta-glucan, and glycerin to draw moisture from ambient air without heavy film-forming oils that trigger pore occlusion.',
    steps: [
      {
        step: 1,
        action: 'Cleanse',
        productType: 'Amino Acid Gel Cleanser',
        guidance: 'Gentle micellar surfactant system maintaining cutaneous microbiome balance.',
      },
      {
        step: 2,
        action: 'Multi-Depth Hydration',
        productType: 'Multi-Molecular Weight Hyaluronic Acid (2%) + B5',
        guidance: 'Distributes low and high dalton polymers across superficial and deeper epidermal layers.',
      },
      {
        step: 3,
        action: 'Antioxidant Barrier',
        productType: '3% Ectoin + Green Tea Extract Serum',
        guidance: 'Counteracts atmospheric ozone and free radical cascades under high daytime ambient UV.',
      },
      {
        step: 4,
        action: 'Moisture Lock',
        productType: 'Oil-Free Water Gel with Polyglutamic Acid',
        guidance: 'Fast-absorbing non-comedogenic gel matrix that leaves a weightless natural finish.',
      },
      {
        step: 5,
        action: 'Photoprotection (AM Only)',
        productType: 'Invisible Fluid Sunscreen SPF 50+ PA++++',
        guidance: 'Next-generation photostable filters with matte finish and high sweat resistance.',
      },
    ],
  },

  deep_nourish: {
    archetype: 'deep_nourish',
    title: 'Rich Nutrient Infusion & Desquamation Defense',
    rationale:
      'Tailored for low-humidity (<35% RH) conditions with high thermal evaporation or cold wind exposure. Infuses essential omega-3/6/9 fatty acids and phytosterols to prevent cellular flaking and desquamation.',
    precautionAlert:
      'Avoid combining with strong exfoliating acids on the same evening to ensure maximal lipid absorption.',
    steps: [
      {
        step: 1,
        action: 'Cleanse',
        productType: 'Nourishing Oil-to-Milk Balm Cleanser',
        guidance: 'Dissolves oxidized sebum and SPF without disrupting cellular intercellular cement.',
      },
      {
        step: 2,
        action: 'Hydrate',
        productType: 'Tremella Mushroom + Bifida Ferment Lysate Mist',
        guidance: 'High-viscosity fungal polysaccharides offering 500x water retention capacity.',
      },
      {
        step: 3,
        action: 'Lipid Replenishment',
        productType: 'Rosehip Seed & Cold-Pressed Marula Oil Concentrate',
        guidance: 'High linoleic acid fraction to reinforce lipid bilayers and enhance flexibility.',
      },
      {
        step: 4,
        action: 'Deep Moisture',
        productType: 'Rich Shea & Peptide Reconstruction Cream',
        guidance: 'Locks in moisture reserves and cushions stratum corneum against shear stress.',
      },
      {
        step: 5,
        action: 'Photoprotection (AM Only)',
        productType: 'Moisturizing Cream Sunscreen SPF 50+',
        guidance: 'Nourishing UV shield preventing solar degradation of lipid components.',
      },
    ],
  },

  pore_clarifying: {
    archetype: 'pore_clarifying',
    title: 'Sebum-Regulating Pore Clarifying Protocol',
    rationale:
      'Indicated for humid (>70% RH) or high-sweat climates where elevated ambient vapor pressure inhibits evaporative cooling, precipitating sebum pooling and cutibacterium acnes proliferation.',
    precautionAlert:
      'High ambient UV increases post-inflammatory pigmentation risk; mandatory daily SPF 50+ reapplication.',
    steps: [
      {
        step: 1,
        action: 'Cleanse',
        productType: '1% Zinc PCA & Tea Tree Clarifying Cleanser',
        guidance: 'Suppresses 5-alpha reductase activity while cleansing follicle infundibulum.',
      },
      {
        step: 2,
        action: 'Keratolytic Treatment',
        productType: '1.5% Lipophilic Salicylic Acid (BHA) Solution',
        guidance: 'Penetrates oil-rich sebaceous pores to clear cellular debris and prevent micro-comedones.',
      },
      {
        step: 3,
        action: 'Sebum Modulation',
        productType: '5% Niacinamide + Zinc Serum',
        guidance: 'Normalizes epidermal lipid synthesis and strengthens intercellular tight junctions.',
      },
      {
        step: 4,
        action: 'Weightless Hydration',
        productType: 'Centella Hydro-Gel',
        guidance: 'Non-occlusive humectant gel providing hydration without feeding microbial biofilms.',
      },
      {
        step: 5,
        action: 'Photoprotection (AM Only)',
        productType: 'Silica Matte-Shield Fluid SPF 50+',
        guidance: 'Oil-absorbing microspheres controlling shine throughout humid days.',
      },
    ],
  },

  gentle_exfoliation: {
    archetype: 'gentle_exfoliation',
    title: 'Micro-Exfoliating Cellular Renewal Regimen',
    rationale:
      'Recommended under temperate conditions (45-65% RH) and low UV indices (UV < 4) to normalize turnover kinetics and remove dull keratinized squames without evoking barrier inflammation.',
    precautionAlert:
      'Chemical exfoliation elevates photosensitivity. Limit use to evening (PM) and apply SPF 50+ the following morning.',
    steps: [
      {
        step: 1,
        action: 'Cleanse',
        productType: 'pH 5.0 Hydrating Cream Cleanser',
        guidance: 'Prepares epidermal acid mantle without pre-irritating sensitive nerve endings.',
      },
      {
        step: 2,
        action: 'Chemical Exfoliation (PM Only)',
        productType: '5% Lactic Acid + 2% Mandelic Acid Complex',
        guidance: 'Alpha hydroxy acids with larger molecular weights ensure slow, controlled desquamation.',
      },
      {
        step: 3,
        action: 'Restorative Buffer',
        productType: 'Allantoin & Madecassoside Calming Emulsion',
        guidance: 'Suppresses pro-inflammatory interleukin cascades and quenches transient tingling.',
      },
      {
        step: 4,
        action: 'Barrier Seal',
        productType: 'Ceramide-Infused Recovery Cream',
        guidance: 'Protects newly uncovered keratinocytes from immediate ambient moisture loss.',
      },
      {
        step: 5,
        action: 'Photoprotection (AM Next Day)',
        productType: 'Broad-Spectrum Mineral Sunscreen SPF 50+',
        guidance: 'Guards freshly renewed epidermal layers from actinic damage.',
      },
    ],
  },
};

/**
 * Returns routine plan customized with regime-specific advisories
 */
export function getCustomizedRoutinePlan(
  archetype: RoutineArchetype,
  regime: WeatherRegime,
  uvIndex: number
): RoutinePlan {
  const base = ROUTINE_CATALOG[archetype];
  let extraPrecaution = base.precautionAlert;

  if (uvIndex >= 6) {
    extraPrecaution = `[HIGH UV ALERT: UV Index ${uvIndex}] Solar irradiance poses acute DNA damage risk. Reapply broad-spectrum sunscreen every 2 hours if outdoors. Exfoliants should strictly be deferred to PM.`;
  } else if (regime === 'arid' && !extraPrecaution) {
    extraPrecaution = `[ARID CLIMATE ADVISORY] Ambient relative humidity is low. Minimize hot water exposure and apply occlusive within 60 seconds of washing.`;
  }

  return {
    ...base,
    precautionAlert: extraPrecaution,
  };
}
