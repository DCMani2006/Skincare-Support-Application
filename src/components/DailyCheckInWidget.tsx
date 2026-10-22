/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * UI Philosophy: "Cozy Derma-Nook" (Animal Crossing / Retro-Web Desktop)
 * Component: DailyCheckInWidget.tsx (4 Interactive Pastel Sticker Buttons with Priority Memory)
 */

import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Heart } from 'lucide-react';
import type { SkinFeel, SkinPriority } from '../types/dermaSync';

interface DailyCheckInWidgetProps {
  readonly onFeedback: (feel: SkinFeel) => void;
  readonly currentFeel?: SkinFeel;
  readonly currentPriority?: SkinPriority;
}

interface StickerOption {
  readonly key: SkinFeel;
  readonly label: string;
  readonly subtitle: string;
  readonly emoji: string;
  readonly bgIdle: string;
  readonly bgActive: string;
  readonly borderIdle: string;
  readonly borderActive: string;
  readonly textTitle: string;
  readonly shadowIdle: string;
  readonly shadowActive: string;
  readonly microNotice: string;
}

const STICKER_OPTIONS: readonly StickerOption[] = [
  {
    key: 'balanced',
    label: 'Calm & Happy',
    subtitle: 'Soft, balanced, zero irritation',
    emoji: '🌿',
    bgIdle: 'bg-[#F4F8F1]',
    bgActive: 'bg-[#E8EFE3]',
    borderIdle: 'border-[#C4D7BC]',
    borderActive: 'border-[#5B7052]',
    textTitle: 'text-[#2A3B24]',
    shadowIdle: 'shadow-[0_3px_0_#C4D7BC]',
    shadowActive: 'shadow-[0_4px_0_#5B7052]',
    microNotice:
      '🌱 Noted! We love a happy skin barrier. Beta-Binomial parameters boosted for today\'s weather regime. Tomorrow will keep this exact equilibrium!',
  },
  {
    key: 'tight_dry',
    label: 'A Bit Tight',
    subtitle: 'Parched, tight, or slight flaking',
    emoji: '🍯',
    bgIdle: 'bg-[#FFFBF0]',
    bgActive: 'bg-[#FEF9E7]',
    borderIdle: 'border-[#F2D5A5]',
    borderActive: 'border-[#CF9C52]',
    textTitle: 'text-[#5E4630]',
    shadowIdle: 'shadow-[0_3px_0_#F2D5A5]',
    shadowActive: 'shadow-[0_4px_0_#CF9C52]',
    microNotice:
      '💧 Noted! Queuing extra ceramide hydration & the PM sandwich technique for tomorrow to lock in moisture.',
  },
  {
    key: 'greasy_clogged',
    label: 'A Bit Oily',
    subtitle: 'Excess shine, heavy pore feel',
    emoji: '🍑',
    bgIdle: 'bg-[#FFF6F2]',
    bgActive: 'bg-[#FFF0EB]',
    borderIdle: 'border-[#F5C3B3]',
    borderActive: 'border-[#D97861]',
    textTitle: 'text-[#692417]',
    shadowIdle: 'shadow-[0_3px_0_#F5C3B3]',
    shadowActive: 'shadow-[0_4px_0_#D97861]',
    microNotice:
      '🍃 Noted! Tomorrow we\'ll swap rich creams for weightless oil-free water-gels & gentle BHA / Niacinamide sebum control.',
  },
  {
    key: 'stinging_irritated',
    label: 'Stinging / Ouch',
    subtitle: 'Redness, burning, or tingling',
    emoji: '🍓',
    bgIdle: 'bg-[#FFF0F0]',
    bgActive: 'bg-[#FDE8E8]',
    borderIdle: 'border-[#F8B4B4]',
    borderActive: 'border-[#E11D48]',
    textTitle: 'text-[#7F1D1D]',
    shadowIdle: 'shadow-[0_3px_0_#F8B4B4]',
    shadowActive: 'shadow-[0_4px_0_#BE123C]',
    microNotice:
      '🛡️ Emergency Barrier Reset queued: All direct acids and exfoliants paused for 72 hours. Tomorrow will prescribe only soothing oat wash & ceramide recovery.',
  },
];

export const DailyCheckInWidget: React.FC<DailyCheckInWidgetProps> = ({
  onFeedback,
  currentFeel = 'balanced',
  currentPriority = 'balanced_wellness',
}) => {
  const [selected, setSelected] = useState<SkinFeel>(currentFeel);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  const getPrioritySpecificNotice = (feel: SkinFeel): string => {
    if (currentPriority === 'acne_breakouts') {
      if (feel === 'tight_dry') {
        return '💧 Antidote queued: Your acne-prone skin is feeling tight & dry. Tomorrow will replace harsh BHA peels with gentle Azelaic Acid 10% + Ceramide buffer lotion to prevent rebound oiliness!';
      }
      if (feel === 'greasy_clogged') {
        return '🍃 Antidote queued: Blemish congestion noted. Tomorrow activates 2% Salicylic Acid BHA deep pore wash and purges all heavy oils.';
      }
      if (feel === 'stinging_irritated') {
        return '🛡️ Emergency Barrier Reset: Direct acne acids paused for 72 hours. Skin barrier micro-tears must heal before resuming active blemish treatments.';
      }
      return '🌿 Acne equilibrium recorded! Blemish calming actives are working effectively without causing barrier dryness.';
    }

    const standard = STICKER_OPTIONS.find((opt) => opt.key === feel);
    return standard?.microNotice || STICKER_OPTIONS[0].microNotice;
  };

  const handleSelect = (option: StickerOption) => {
    setSelected(option.key);
    setShowAnimation(true);
    const notice = getPrioritySpecificNotice(option.key);
    setActiveNotice(notice);

    // Trigger conjugate Beta-Binomial update in parent state
    onFeedback(option.key);

    setTimeout(() => {
      setShowAnimation(false);
    }, 1200);
  };

  const currentOption =
    STICKER_OPTIONS.find((opt) => opt.key === selected) || STICKER_OPTIONS[0];

  return (
    <section className="w-full bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-6 sm:p-7 shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#EFE8D8]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#E8EFE3] border-2 border-[#5B7052] flex items-center justify-center text-[#5B7052] shadow-xs">
            <Heart className="w-4 h-4 fill-[#5B7052]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#3D312A] tracking-tight">
              5-Second Daily Skin Check-In
            </h2>
            <p className="text-xs text-[#6B5B52] font-semibold">
              How does your skin feel right now? Tap a sticker to log feedback &amp; adjust tomorrow&apos;s antidote!
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold text-[#5B7052] bg-[#E8EFE3] px-3 py-1 rounded-full border border-[#A3B899] self-start sm:self-auto shadow-xs">
          ⚡ 1-Tap Conjugate Updating
        </span>
      </div>

      {/* 4 Large Pastel Sticker Buttons with Bounce Micro-Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {STICKER_OPTIONS.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleSelect(opt)}
              type="button"
              className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 active:translate-y-0.5 ${
                isSelected
                  ? `${opt.bgActive} ${opt.borderActive} ${opt.shadowActive} ring-2 ring-[#5B7052]/20`
                  : `${opt.bgIdle} ${opt.borderIdle} ${opt.shadowIdle} hover:border-[#5B7052]`
              }`}
            >
              {/* Active Selection Pin Indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 text-[#5B7052] animate-in fade-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              <div>
                <span className="text-3xl mb-2.5 block transform transition-transform group-hover:scale-110">
                  {opt.emoji}
                </span>
                <h3
                  className={`text-sm font-bold tracking-tight mb-1 ${
                    isSelected ? opt.textTitle : 'text-[#3D312A]'
                  }`}
                >
                  {opt.label}
                </h3>
                <p className="text-[11px] text-[#6B5B52] font-medium leading-snug">
                  {opt.subtitle}
                </p>
              </div>

              <div className="mt-3.5 pt-2 border-t border-[#D4CEBF]/60 flex items-center justify-between text-[10px] font-mono font-semibold text-[#7C6044]">
                <span>{isSelected ? '✓ Active Feel' : 'Tap sticker'}</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Instant Micro-Adaptation Notice for Tomorrow */}
      <div
        className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-start gap-3 shadow-[0_3px_0_#D4CEBF] ${
          showAnimation ? 'scale-[1.01] ring-2 ring-[#5B7052]/40' : ''
        } ${currentOption.bgActive} ${currentOption.borderActive}`}
      >
        <span className="text-2xl shrink-0 mt-0.5">{currentOption.emoji}</span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider font-mono ${currentOption.textTitle}`}
            >
              ✨ AI Micro-Adaptation Queued for Tomorrow
            </span>
            <span className="text-[10px] font-semibold text-[#7C6044] bg-[#FFFFFF]/80 px-2 py-0.5 rounded-full border border-[#D4CEBF]">
              Bayesian Memory Processed
            </span>
          </div>
          <p className="text-xs text-[#3D312A] font-semibold leading-relaxed font-sans">
            {activeNotice || getPrioritySpecificNotice(currentOption.key)}
          </p>
        </div>
      </div>
    </section>
  );
};
