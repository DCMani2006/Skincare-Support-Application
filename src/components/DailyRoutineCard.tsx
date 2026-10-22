/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * UI Philosophy: "Cozy Derma-Nook" (Animal Crossing / Retro-Web Desktop)
 * Component: DailyRoutineCard.tsx (Recipe Card / Daily Quest Board with Priority & Antidotes)
 */

import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Check,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Droplets,
  Sparkles,
  MessageSquare,
  BookmarkCheck,
  ShieldAlert,
  Clock,
  Sparkle,
} from 'lucide-react';
import type { RoutinePlan, SkinPriority, WeatherTelemetry } from '../types/dermaSync';
import { SKIN_PRIORITIES_METADATA } from '../data/skincareDatasets';

interface DailyRoutineCardProps {
  readonly plan: RoutinePlan;
  readonly weather: WeatherTelemetry;
  readonly selectedPriority?: SkinPriority;
  readonly onPriorityChange?: (priority: SkinPriority) => void;
}

// Beginner-friendly dosage guidelines for each standard routine action
const DOSAGE_GUIDES: Record<string, { am: string; pm: string }> = {
  cleanse: {
    am: 'Nickel-sized amount (1.5 ml) • Lukewarm rinse',
    pm: 'Coin-sized amount (2 ml) • 45s massage to dissolve daytime grime',
  },
  treat: {
    am: '3–4 drops • Press gently into damp skin',
    pm: '4–5 drops • Pat across face, neck, and orbital bone',
  },
  moisturize: {
    am: 'Pea-sized dab • Smooth outward from T-zone',
    pm: 'Generous nickel-sized amount • First layer of PM sandwich',
  },
  protect: {
    am: '2 full finger lengths (1/4 tsp) • Crucial daytime barrier',
    pm: '2–3 drops facial oil or thin balm layer • Seals nocturnal moisture',
  },
};

// Pastel Pill Colors by Skincare Action
const ACTION_BADGES: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  cleanse: {
    bg: 'bg-[#E8EFE3]',
    border: 'border-[#A3B899]',
    text: 'text-[#3E4E37]',
    label: 'Cleanse & Refresh',
  },
  treat: {
    bg: 'bg-[#FEF9E7]',
    border: 'border-[#E9B872]',
    text: 'text-[#7C6044]',
    label: 'Target Actives',
  },
  moisturize: {
    bg: 'bg-[#F7F2E7]',
    border: 'border-[#D4CEBF]',
    text: 'text-[#5A432D]',
    label: 'Hydrate & Seal',
  },
  protect: {
    bg: 'bg-[#FFF4EE]',
    border: 'border-[#E8927C]',
    text: 'text-[#782E20]',
    label: 'Photoprotect / Shield',
  },
};

export const DailyRoutineCard: React.FC<DailyRoutineCardProps> = ({
  plan,
  weather,
  selectedPriority = 'balanced_wellness',
  onPriorityChange,
}) => {
  // Diurnal Mode: AM (Morning) vs PM (Evening)
  const [diurnalMode, setDiurnalMode] = useState<'am' | 'pm'>('am');

  // Track checked steps for interactive completion
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepNumber: number) => {
    const key = `${diurnalMode}-${stepNumber}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalSteps = plan.steps.length;
  const completedCount = plan.steps.filter(
    (st) => !!completedSteps[`${diurnalMode}-${st.step}`]
  ).length;

  const currentPriorityMeta = SKIN_PRIORITIES_METADATA[selectedPriority] || SKIN_PRIORITIES_METADATA.balanced_wellness;

  return (
    <article className="w-full bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-6 sm:p-8 shadow-[0_4px_0_#D4CEBF,0_12px_28px_rgba(91,112,82,0.08)] space-y-6">
      {/* 1. Daily Skin Priority / Focus Selection Bar */}
      <div className="bg-[#F7F2E7] border-2 border-[#D4CEBF] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentPriorityMeta.emoji}</span>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C6044] font-mono">
                Choose Today&apos;s Skin Priority &amp; Goal
              </h3>
              <p className="text-xs text-[#6B5B52] font-semibold">
                What does your skin need today? Tap to instantly adapt the clinical prescription.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#5B7052] bg-[#E8EFE3] px-3 py-1 rounded-full border border-[#A3B899] self-start sm:self-auto">
            Priority: {currentPriorityMeta.label}
          </span>
        </div>

        {/* 7 Priority Selector Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.keys(SKIN_PRIORITIES_METADATA) as SkinPriority[]).map((key) => {
            const meta = SKIN_PRIORITIES_METADATA[key];
            const isSelected = selectedPriority === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onPriorityChange?.(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'bg-[#5B7052] text-white border-[#3E4E37] shadow-[0_2px_0_#3E4E37] scale-[1.02]'
                    : 'bg-[#FFFFFF] text-[#6B5B52] border-[#D4CEBF] hover:border-[#5B7052] hover:bg-[#FDFBF7] shadow-[0_1px_0_#D4CEBF]'
                }`}
              >
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Header Bar: Quest / Recipe Title & Diurnal Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#EFE8D8]">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8EFE3] text-[#3E4E37] border-2 border-[#A3B899] flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B7052]" />
              {plan.archetype.replace('_', ' ')}
            </span>
            {weather.uvIndex >= 6 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF4EE] text-[#782E20] border-2 border-[#E8927C] flex items-center gap-1 shadow-xs">
                <Sun className="w-3.5 h-3.5 text-[#E8927C]" /> High UV Shield 50+
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#F7F2E7] text-[#6B5B52] border border-[#D4CEBF]">
              Priority #{selectedPriority}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#3D312A] tracking-tight">
            {plan.title}
          </h2>
        </div>

        {/* Diurnal Toggle: [☀️ Morning Routine] / [🌙 Evening Routine] */}
        <div className="flex p-1.5 bg-[#EFE8D8] rounded-2xl border-2 border-[#D4CEBF] self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setDiurnalMode('am')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              diurnalMode === 'am'
                ? 'bg-[#E9B872] text-[#3D312A] border-2 border-[#CF9C52] shadow-[0_2px_0_#CF9C52]'
                : 'text-[#6B5B52] hover:text-[#3D312A] border-2 border-transparent'
            }`}
          >
            <Sun className="w-4 h-4 text-[#7C6044]" />
            Morning Routine
          </button>
          <button
            type="button"
            onClick={() => setDiurnalMode('pm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              diurnalMode === 'pm'
                ? 'bg-[#5B7052] text-white border-2 border-[#3E4E37] shadow-[0_2px_0_#3E4E37]'
                : 'text-[#6B5B52] hover:text-[#3D312A] border-2 border-transparent'
            }`}
          >
            <Moon className="w-4 h-4 text-[#E9B872]" />
            Evening Routine
          </button>
        </div>
      </div>

      {/* 3. "Why this routine today?" Animal Crossing Speech Bubble / Sticky Note */}
      <div className="relative bg-[#FEF9E7] border-2 border-[#E9B872] rounded-2xl p-4 sm:p-5 shadow-[0_3px_0_#E9B872] flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-[#FFFFFF] border-2 border-[#E9B872] text-[#7C6044] shrink-0 mt-0.5 shadow-xs">
          <MessageSquare className="w-5 h-5 text-[#E9B872]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6044] font-mono">
              🍃 Leaf Note: Why this routine today?
            </span>
            <span className="text-[11px] text-[#6B5B52] font-semibold bg-[#FFFFFF]/80 px-2 py-0.5 rounded-full border border-[#E9B872]/60">
              Weather + Skin Priority Synchronization
            </span>
          </div>
          <p className="text-sm text-[#3D312A] font-semibold leading-relaxed">
            &ldquo;{plan.rationale}&rdquo;
          </p>
        </div>
      </div>

      {/* 4. Temporal History & Antidote Safety Check Callout Box */}
      {(plan.antidoteRationale || plan.historyConsiderations) && (
        <div className="bg-[#F0F7F7] border-2 border-[#A2CCD4] rounded-2xl p-4 sm:p-5 shadow-[0_3px_0_#A2CCD4] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#A2CCD4]/50 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#2C525A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2C525A] font-mono">
                Past History Memory &amp; Antidote Protocol
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#2C525A] bg-[#FFFFFF]/80 px-2.5 py-0.5 rounded-full border border-[#A2CCD4]">
              Skin Cycling &amp; Safety Audit
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-[#3D312A] font-medium leading-relaxed">
            {plan.historyConsiderations && (
              <p className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#3E8594] shrink-0 mt-0.5" />
                <span><strong>Regimen Memory:</strong> {plan.historyConsiderations}</span>
              </p>
            )}

            {plan.antidoteRationale && (
              <p className="flex items-start gap-2 text-[#2C525A] font-semibold">
                <Sparkle className="w-3.5 h-3.5 text-[#3E8594] shrink-0 mt-0.5" />
                <span>{plan.antidoteRationale}</span>
              </p>
            )}
          </div>

          {/* Contraindications Avoided Pills */}
          {plan.contraindicationsAvoided && plan.contraindicationsAvoided.length > 0 && (
            <div className="pt-2 border-t border-[#A2CCD4]/40 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <span className="text-[#557A82] font-bold">Contraindications Avoided:</span>
              {plan.contraindicationsAvoided.map((avoided, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#2C525A] border border-[#A2CCD4] font-semibold shadow-2xs"
                >
                  ✓ {avoided}
                </span>
              ))}
            </div>
          )}

          {/* Key Actives Prescribed from Scientific Dataset */}
          {plan.activeIngredients && plan.activeIngredients.length > 0 && (
            <div className="pt-2 border-t border-[#A2CCD4]/40 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <span className="text-[#557A82] font-bold">Target Actives:</span>
              {plan.activeIngredients.map((active, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-[#E8EFE3] text-[#2A3B24] border border-[#A3B899] font-bold shadow-2xs"
                >
                  🌿 {active}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Precaution Alert / Irritant Warning (if triggered) */}
      {plan.precautionAlert && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start gap-3 border-2 shadow-[0_3px_0_#E8927C] ${
            plan.precautionAlert.includes('EMERGENCY')
              ? 'bg-[#FDE8E2] border-[#E8927C] text-[#782E20]'
              : 'bg-[#FFF9EA] border-[#E9B872] text-[#6E4E23]'
          }`}
        >
          {plan.precautionAlert.includes('EMERGENCY') ? (
            <Flame className="w-5 h-5 text-[#E8927C] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#E9B872] shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider block font-mono text-[10px]">
              {plan.precautionAlert.includes('EMERGENCY')
                ? 'Barrier Safety Protocol Active'
                : 'Meteorological Caution'}
            </span>
            <p className="leading-relaxed font-semibold">{plan.precautionAlert}</p>
          </div>
        </div>
      )}

      {/* 6. Step-by-Step Product Checklist (Cleanse -> Treat -> Moisturize -> Protect) */}
      <div className="space-y-3">
        {/* Checklist Header */}
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#6B5B52] px-1">
          <span className="flex items-center gap-2 text-[#5B7052]">
            <Sparkles className="w-4 h-4 text-[#5B7052]" />
            {diurnalMode === 'am' ? 'Morning Quest Checklist' : 'Evening Recovery Checklist'}
          </span>
          <span className="flex items-center gap-1.5 text-[#7C6044] bg-[#F7F2E7] px-2.5 py-1 rounded-full border border-[#D4CEBF]">
            <BookmarkCheck className="w-3.5 h-3.5 text-[#5B7052]" />
            {completedCount} / {totalSteps} Complete
          </span>
        </div>

        {/* Step Items as Cozy Recipe Cards */}
        <div className="space-y-3">
          {plan.steps.map((st) => {
            const isChecked = !!completedSteps[`${diurnalMode}-${st.step}`];
            const actionKey = st.action.toLowerCase();
            const dosageInfo =
              DOSAGE_GUIDES[actionKey]?.[diurnalMode] ||
              (diurnalMode === 'am' ? 'Standard daytime dose' : 'Evening restorative dose');
            const actionBadge =
              ACTION_BADGES[actionKey] || ACTION_BADGES.cleanse;

            // Adapt product label for diurnal view
            let displayProduct = st.productType;
            let displayGuidance = st.guidance;

            if (diurnalMode === 'pm' && st.action === 'Protect') {
              displayProduct = 'Restorative Barrier Seal / Facial Oil (PM)';
              displayGuidance =
                'Complete the PM routine: gently pat a thin occlusive layer or 2 drops of facial oil to lock in all restorative layers while you sleep.';
            }

            return (
              <div
                key={st.step}
                onClick={() => toggleStep(st.step)}
                className={`group relative p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  isChecked
                    ? 'bg-[#F7F2E7]/70 border-[#D4CEBF] opacity-75'
                    : 'bg-[#FFFFFF] border-[#D4CEBF] hover:border-[#5B7052] hover:bg-[#FDFBF7] shadow-[0_3px_0_#D4CEBF]'
                }`}
              >
                {/* Circular Stamp Checkbox */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 transition-all shadow-xs ${
                    isChecked
                      ? 'bg-[#5B7052] border-[#5B7052] text-white'
                      : 'border-[#A3B899] group-hover:border-[#5B7052] bg-[#F7F2E7]'
                  }`}
                >
                  {isChecked ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-[#5B7052]">
                      {st.step}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Step Action Pastel Pill */}
                    <span
                      className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isChecked
                          ? 'bg-[#EFE8D8] text-[#8C7E72] border-[#D4CEBF] line-through'
                          : `${actionBadge.bg} ${actionBadge.border} ${actionBadge.text}`
                      }`}
                    >
                      Step {st.step} • {actionBadge.label}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Key Active Badge */}
                      {st.keyActive && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8EFE3] text-[#2A3B24] border border-[#A3B899]">
                          🌿 {st.keyActive}
                        </span>
                      )}

                      {/* Dosage Tip Pill */}
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F7F2E7] text-[#6B5B52] border border-[#D4CEBF] font-sans flex items-center gap-1 shadow-xs">
                        <Droplets className="w-3 h-3 text-[#5B7052]" />
                        {dosageInfo}
                      </span>
                    </div>
                  </div>

                  {/* Product Title */}
                  <h3
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      isChecked
                        ? 'text-[#8C7E72] line-through'
                        : 'text-[#3D312A]'
                    }`}
                  >
                    {displayProduct}
                  </h3>

                  {/* Guidance */}
                  <p
                    className={`text-xs leading-relaxed font-medium ${
                      isChecked ? 'text-[#8C7E72]' : 'text-[#6B5B52]'
                    }`}
                  >
                    {displayGuidance}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};
