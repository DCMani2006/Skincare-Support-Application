/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * UI Philosophy: "Cozy Derma-Nook" (Animal Crossing / Retro-Web Desktop)
 * Component: Header.tsx
 */

import React from 'react';
import {
  Sparkles,
  Calendar,
  BarChart3,
  RefreshCw,
  Leaf,
  Sun,
  Droplets,
  ArrowLeft,
  ArrowRight,
  Lock,
  MapPin,
  Thermometer,
} from 'lucide-react';
import type { WeatherTelemetry } from '../types/dermaSync';

interface HeaderProps {
  readonly telemetry: WeatherTelemetry;
  readonly activeView: 'planner' | 'audit';
  readonly onViewChange: (view: 'planner' | 'audit') => void;
  readonly isLiveSyncing?: boolean;
  readonly onSyncClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  activeView,
  onViewChange,
  isLiveSyncing = false,
  onSyncClick,
}) => {
  // Extract concise locality title (e.g. "Vellore" or "Berlin")
  const shortLocation = telemetry.locationName
    .split(',')[0]
    .split('(')[0]
    .trim();

  return (
    <header className="w-full bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl pt-3 px-4 sm:px-6 shadow-[0_4px_0_#D4CEBF,0_10px_25px_rgba(91,112,82,0.08)] flex flex-col gap-4">
      {/* 1. Retro Vintage Window Controls & Browser Address Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#EFE8D8]">
        {/* Window control dots: Coral, Honey, Matcha */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span
              className="w-3.5 h-3.5 rounded-full bg-[#E8927C] border border-[#D97861] shadow-xs cursor-pointer inline-block"
              title="Close window"
            />
            <span
              className="w-3.5 h-3.5 rounded-full bg-[#E9B872] border border-[#D9A557] shadow-xs cursor-pointer inline-block"
              title="Minimize window"
            />
            <span
              className="w-3.5 h-3.5 rounded-full bg-[#A3B899] border border-[#5B7052] shadow-xs cursor-pointer inline-block"
              title="Expand window"
            />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#7C6044] bg-[#F7F2E7] px-2.5 py-0.5 rounded-full border border-[#D4CEBF]">
            Cozy Derma-Nook OS v2.0
          </span>
        </div>

        {/* Decorative Retro Address Bar: my.skincare.day */}
        <div className="flex items-center gap-2 flex-1 max-w-md mx-auto sm:mx-4">
          <div className="flex items-center gap-1 text-[#6B5B52]">
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-[#F7F2E7] text-[#6B5B52] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded-lg hover:bg-[#F7F2E7] text-[#6B5B52] transition-colors"
              aria-label="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onSyncClick}
              className="p-1 rounded-lg hover:bg-[#F7F2E7] text-[#6B5B52] transition-colors"
              aria-label="Refresh telemetry"
              title="Refresh meteorological telemetry"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin text-[#5B7052]' : ''}`}
              />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-between bg-[#F7F2E7] border border-[#D4CEBF] rounded-full px-3.5 py-1 text-xs font-mono text-[#3D312A] shadow-inner">
            <div className="flex items-center gap-1.5 truncate">
              <Lock className="w-3 h-3 text-[#5B7052] shrink-0" />
              <span className="text-[#6B5B52]">https://</span>
              <span className="font-bold text-[#3D312A]">my.skincare.day</span>
              <span className="text-[#7C6044]/70">/planner</span>
            </div>
            <Leaf className="w-3.5 h-3.5 text-[#5B7052] shrink-0 ml-1" />
          </div>
        </div>

        {/* Course Tag */}
        <div className="hidden lg:flex items-center">
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#EFE8D8] text-[#5E4630] border border-[#D4CEBF] font-semibold">
            BAMAT207 Stats
          </span>
        </div>
      </div>

      {/* 2. Brand Identity & Telemetry Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E8EFE3] border-2 border-[#5B7052] shadow-[0_3px_0_#5B7052]">
            <Leaf className="w-6 h-6 text-[#5B7052]" />
            <Sparkles className="w-3 h-3 text-[#E9B872] absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#3D312A]">
                DermaSync
              </h1>
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#E8EFE3] text-[#5B7052] border border-[#A3B899]">
                🍃 Island Nook
              </span>
            </div>
            <p className="text-xs text-[#6B5B52] font-semibold">
              Adaptive Meteorological Regimen & Bayesian Calibration
            </p>
          </div>
        </div>

        {/* Cute Capsule Pills: Location, Temp, Humidity, UV */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Location Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F7F2E7] border border-[#D4CEBF] text-[#3D312A] shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#7C6044]" />
            <span className="font-bold">{shortLocation}</span>
          </div>

          {/* Temperature Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF9E7] border border-[#E9B872] text-[#3D312A] shadow-xs">
            <Thermometer className="w-3.5 h-3.5 text-[#E9B872]" />
            <span className="font-bold">{Math.round(telemetry.temp)}°C</span>
          </div>

          {/* Humidity Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EBF3F5] border border-[#A2CCD4] text-[#2C525A] shadow-xs">
            <Droplets className="w-3.5 h-3.5 text-[#3E8594]" />
            <span className="font-bold">{telemetry.humidity}% RH</span>
          </div>

          {/* Solar UV Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF4EE] border border-[#E8927C] text-[#693125] shadow-xs">
            <Sun className="w-3.5 h-3.5 text-[#E8927C]" />
            <span className="font-bold">UV {telemetry.uvIndex.toFixed(1)}</span>
          </div>

          {/* Live Sync Beacon */}
          <button
            onClick={onSyncClick}
            type="button"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8EFE3] border border-[#A3B899] hover:border-[#5B7052] text-[#5B7052] font-semibold cursor-pointer transition-all shadow-xs"
            title="Click to sync Open-Meteo telemetry"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B7052] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B7052]" />
            </span>
            <span className="text-[11px] uppercase tracking-wider">Live</span>
            <RefreshCw
              className={`w-3 h-3 text-[#5B7052] transition-transform ${
                isLiveSyncing ? 'animate-spin' : 'group-hover:rotate-90'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Folder Tabs: [Today's Plan] & [Math Inspector / Syllabus] sticking out of the card */}
      <nav aria-label="Folder Navigation" className="flex items-end gap-2 pt-2 border-t-2 border-[#EFE8D8] -mb-[2px]">
        <button
          onClick={() => onViewChange('planner')}
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl text-xs font-bold transition-all cursor-pointer border-t-2 border-l-2 border-r-2 ${
            activeView === 'planner'
              ? 'bg-[#FDFBF7] border-[#5B7052] text-[#3D312A] shadow-[0_-2px_0_#5B7052] relative z-10'
              : 'bg-[#EFE8D8] border-[#D4CEBF] text-[#6B5B52] hover:bg-[#F7F2E7] hover:text-[#3D312A]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#5B7052]" />
          <span>Today&apos;s Regimen Plan</span>
        </button>

        <button
          onClick={() => onViewChange('audit')}
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl text-xs font-bold transition-all cursor-pointer border-t-2 border-l-2 border-r-2 ${
            activeView === 'audit'
              ? 'bg-[#FDFBF7] border-[#5B7052] text-[#3D312A] shadow-[0_-2px_0_#5B7052] relative z-10'
              : 'bg-[#EFE8D8] border-[#D4CEBF] text-[#6B5B52] hover:bg-[#F7F2E7] hover:text-[#3D312A]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#7C6044]" />
          <span>Math Lab & Syllabus Audit</span>
        </button>
      </nav>
    </header>
  );
};
