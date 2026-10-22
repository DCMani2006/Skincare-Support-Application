/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * UI Philosophy: "Cozy Derma-Nook" (Animal Crossing / Retro-Web Desktop)
 * Course: BAMAT207 (Probability & Statistics)
 * Main Application Viewport
 */

import React, { useState, useMemo, useId, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
  WifiOff,
  Leaf,
  Thermometer,
  Droplets,
  Sun,
} from 'lucide-react';

import type {
  DailyLogEntry,
  RoutineArchetype,
  SkinFeel,
  SkinPriority,
  WeatherRegime,
  WeatherTelemetry,
} from './types/dermaSync';
import {
  computeArchetypePosteriorState,
} from './utils/bayesianEngine';
import {
  fetchLiveTelemetry,
  calculateDewPoint,
  classifyWeatherRegime,
  classifyUVLevel,
  FALLBACK_LOCATIONS,
} from './services/weatherService';
import { generateDailyRoutine } from './utils/regimenEngine';
import { INITIAL_DAILY_LOGS } from './data/sampleTelemetry';
import { Header } from './components/Header';
import { DailyRoutineCard } from './components/DailyRoutineCard';
import { DailyCheckInWidget } from './components/DailyCheckInWidget';
import { LearnedProfileSummary } from './components/LearnedProfileSummary';
import { AcademicInspector } from './components/AcademicInspector';
import { StatisticalValidationSuite } from './components/StatisticalValidationSuite';

export const App: React.FC = () => {
  const currentTempInputId = useId();
  const currentHumidityInputId = useId();
  const currentUvInputId = useId();

  // 1. Navigation View: 'planner' (Cozy Derma-Nook) vs 'audit' (BAMAT207 Proofs)
  const [activeView, setActiveView] = useState<'planner' | 'audit'>('planner');

  // User-selected daily skin priority (defaults to active acne/breakouts to showcase custom logic)
  const [selectedPriority, setSelectedPriority] = useState<SkinPriority>('acne_breakouts');

  // 2. Weather Telemetry State & Ingestion Status
  const [telemetry, setTelemetry] = useState<WeatherTelemetry>(() => ({
    temp: 30.5,
    humidity: 72,
    uvIndex: 7.8,
    dewPoint: 24.9,
    cloudCover: 20,
    locationName: FALLBACK_LOCATIONS.vellore.locationName,
    timestamp: '2026-10-15T08:00:00Z',
  }));
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [showAtmosphericSimulator, setShowAtmosphericSimulator] = useState<boolean>(false);

  // 3. Historical Daily Logs (Bayesian Evidence & Frequentist Samples)
  const [logs, setLogs] = useState<DailyLogEntry[]>(INITIAL_DAILY_LOGS);

  // Initial Telemetry Fetch on Mount
  useEffect(() => {
    let isMounted = true;
    async function initWeather() {
      try {
        const res = await fetchLiveTelemetry();
        if (isMounted) {
          setTelemetry(res.telemetry);
          setIsFromCache(res.fromCache);
          setIsOfflineMode(res.isOfflineFallback);
        }
      } catch {
        // Handled gracefully in weather service
      }
    }
    void initWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  // Derived Classifications
  const regime: WeatherRegime = useMemo(
    () => classifyWeatherRegime(telemetry.humidity),
    [telemetry.humidity]
  );
  const uvLevel = useMemo(() => classifyUVLevel(telemetry.uvIndex), [telemetry.uvIndex]);

  // Compute Bayesian Posterior States for all 5 archetypes
  const archetypeList: readonly RoutineArchetype[] = useMemo(
    () => [
      'barrier_recovery',
      'lightweight_hydration',
      'deep_nourish',
      'pore_clarifying',
      'gentle_exfoliation',
    ],
    []
  );

  const posteriorStates = useMemo(() => {
    const states: Record<string, ReturnType<typeof computeArchetypePosteriorState>> = {};
    for (const archetype of archetypeList) {
      states[archetype] = computeArchetypePosteriorState(archetype, regime, logs);
    }
    return states as Record<RoutineArchetype, ReturnType<typeof computeArchetypePosteriorState>>;
  }, [archetypeList, regime, logs]);

  // Adaptive Prescription Rules & Antidote Engine with Past History & Priority Integration
  const lastLoggedFeel = logs.length > 0 ? logs[logs.length - 1].userReport : undefined;
  const activePlan = useMemo(
    () => generateDailyRoutine(telemetry, Object.values(posteriorStates), logs, selectedPriority),
    [telemetry, posteriorStates, logs, selectedPriority]
  );

  // 1-Tap Feedback Handler from DailyCheckInWidget
  const handleQuickFeedback = (feel: SkinFeel): void => {
    const newDayIndex = logs.length + 1;
    const nowIso = new Date().toISOString();
    const satisfactionScore = feel === 'balanced' ? 4.9 : feel === 'tight_dry' ? 3.0 : 2.5;

    const newEntry: DailyLogEntry = {
      dayIndex: newDayIndex,
      date: nowIso.split('T')[0],
      weather: telemetry,
      userReport: feel,
      prescribedArchetype: activePlan.archetype,
      satisfactionScore,
      dailyPriority: selectedPriority,
      activeIngredientsUsed: activePlan.activeIngredients,
    };

    setLogs((prev) => [...prev, newEntry]);
  };

  const handleResetLogs = (): void => {
    setLogs(INITIAL_DAILY_LOGS);
  };

  // Sync Telemetry from Open-Meteo
  const handleSyncWeather = async (): Promise<void> => {
    setIsFetchingLive(true);
    try {
      const res = await fetchLiveTelemetry(undefined, undefined, true);
      setTelemetry(res.telemetry);
      setIsFromCache(res.fromCache);
      setIsOfflineMode(res.isOfflineFallback);
    } catch {
      // Fallback handled
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Preset location select
  const handleLocationPreset = async (key: string): Promise<void> => {
    const preset = FALLBACK_LOCATIONS[key];
    if (preset) {
      setIsFetchingLive(true);
      try {
        const res = await fetchLiveTelemetry(preset.lat, preset.lon, false);
        setTelemetry(res.telemetry);
        setIsFromCache(res.fromCache);
        setIsOfflineMode(res.isOfflineFallback);
      } finally {
        setIsFetchingLive(false);
      }
    }
  };

  // Manual Dial Sliders
  const handleManualTempChange = (temp: number): void => {
    const dew = calculateDewPoint(temp, telemetry.humidity);
    setTelemetry((prev) => ({ ...prev, temp, dewPoint: dew }));
  };

  const handleManualHumidityChange = (humidity: number): void => {
    const dew = calculateDewPoint(telemetry.temp, humidity);
    setTelemetry((prev) => ({ ...prev, humidity, dewPoint: dew }));
  };

  const handleManualUvChange = (uvIndex: number): void => {
    setTelemetry((prev) => ({ ...prev, uvIndex }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D312A] flex flex-col items-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#A3B899]/40 selection:text-[#3D312A]">
      {/* Maximum Container */}
      <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
        {/* Component 1: Header (Cozy Animal Crossing Banner with Folder Tabs) */}
        <Header
          telemetry={telemetry}
          activeView={activeView}
          onViewChange={setActiveView}
          isLiveSyncing={isFetchingLive}
          onSyncClick={handleSyncWeather}
        />

        {/* VIEW 1: TODAY'S PLAN (Cozy Derma-Nook Quest & Recipe Board) */}
        {activeView === 'planner' && (
          <main className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Atmospheric Context Pill & Simulator Toggle */}
            <div className="flex items-center justify-between px-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#6B5B52] font-bold font-mono">Atmospheric Context:</span>
                <span className="px-3 py-1 rounded-full bg-[#E8EFE3] border border-[#A3B899] text-[#2A3B24] font-mono text-[11px] font-bold shadow-xs">
                  {regime.toUpperCase()} ({telemetry.humidity}% RH) • {telemetry.temp > 28 ? 'HOT' : telemetry.temp < 12 ? 'COLD' : 'MILD'} ({telemetry.temp.toFixed(1)}°C) • UV {uvLevel.toUpperCase()} ({telemetry.uvIndex.toFixed(1)})
                </span>
                {isFromCache && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#7C6044] font-mono font-semibold bg-[#F7F2E7] px-2.5 py-0.5 rounded-full border border-[#D4CEBF]">
                    <Database className="w-2.5 h-2.5" /> Cached
                  </span>
                )}
                {isOfflineMode && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#782E20] font-mono font-semibold bg-[#FFF4EE] px-2.5 py-0.5 rounded-full border border-[#E8927C]">
                    <WifiOff className="w-2.5 h-2.5" /> Offline Preset
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAtmosphericSimulator((prev) => !prev)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F7F2E7] text-[#3D312A] hover:text-[#5B7052] border-2 border-[#D4CEBF] text-xs font-bold transition-all cursor-pointer shadow-[0_2px_0_#D4CEBF]"
              >
                <Sliders className="w-3.5 h-3.5 text-[#5B7052]" />
                {showAtmosphericSimulator ? 'Hide Controls' : 'Simulate Weather 🍃'}
              </button>
            </div>

            {/* Expandable Atmospheric Control Panel (Cozy Weather Tuning Box) */}
            {showAtmosphericSimulator && (
              <section className="bg-[#FFFFFF] border-2 border-[#D4CEBF] rounded-3xl p-5 sm:p-6 shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)] space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#EFE8D8]">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C6044] font-mono flex items-center gap-2">
                    <Leaf className="w-3.5 h-3.5 text-[#5B7052]" />
                    Atmospheric Telemetry Simulator Dial
                  </h2>
                  <div className="flex gap-1.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('vellore')}
                      className="px-2.5 py-1 rounded-lg bg-[#F7F2E7] hover:bg-[#EFE8D8] border border-[#D4CEBF] text-[#3D312A] font-bold cursor-pointer"
                    >
                      Vellore
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('berlin')}
                      className="px-2.5 py-1 rounded-lg bg-[#F7F2E7] hover:bg-[#EFE8D8] border border-[#D4CEBF] text-[#3D312A] font-bold cursor-pointer"
                    >
                      Berlin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLocationPreset('phoenix')}
                      className="px-2.5 py-1 rounded-lg bg-[#F7F2E7] hover:bg-[#EFE8D8] border border-[#D4CEBF] text-[#3D312A] font-bold cursor-pointer"
                    >
                      Phoenix (Arid)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Dry-Bulb Temp Slider */}
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border-2 border-[#D4CEBF]">
                    <div className="flex justify-between text-xs text-[#6B5B52] mb-1 font-semibold">
                      <label htmlFor={currentTempInputId} className="cursor-pointer flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-[#CF9C52]" />
                        Dry-Bulb Temp
                      </label>
                      <span className="font-mono text-[#3D312A] font-bold">{telemetry.temp.toFixed(1)}°C</span>
                    </div>
                    <input
                      id={currentTempInputId}
                      type="range"
                      min="-5"
                      max="45"
                      step="0.5"
                      value={telemetry.temp}
                      onChange={(e) => handleManualTempChange(Number(e.target.value))}
                      className="w-full accent-[#5B7052] cursor-pointer"
                    />
                  </div>

                  {/* Relative Humidity Slider */}
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border-2 border-[#D4CEBF]">
                    <div className="flex justify-between text-xs text-[#6B5B52] mb-1 font-semibold">
                      <label htmlFor={currentHumidityInputId} className="cursor-pointer flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-[#3E8594]" />
                        Relative Humidity
                      </label>
                      <span className="font-mono text-[#2C525A] font-bold">{telemetry.humidity}% RH</span>
                    </div>
                    <input
                      id={currentHumidityInputId}
                      type="range"
                      min="5"
                      max="98"
                      value={telemetry.humidity}
                      onChange={(e) => handleManualHumidityChange(Number(e.target.value))}
                      className="w-full accent-[#3E8594] cursor-pointer"
                    />
                  </div>

                  {/* Solar UV Index Slider */}
                  <div className="bg-[#FDFBF7] p-4 rounded-2xl border-2 border-[#D4CEBF]">
                    <div className="flex justify-between text-xs text-[#6B5B52] mb-1 font-semibold">
                      <label htmlFor={currentUvInputId} className="cursor-pointer flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-[#E8927C]" />
                        Solar UV Index
                      </label>
                      <span className="font-mono text-[#782E20] font-bold">{telemetry.uvIndex.toFixed(1)} UV</span>
                    </div>
                    <input
                      id={currentUvInputId}
                      type="range"
                      min="0"
                      max="14"
                      step="0.5"
                      value={telemetry.uvIndex}
                      onChange={(e) => handleManualUvChange(Number(e.target.value))}
                      className="w-full accent-[#E8927C] cursor-pointer"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Component 2: Daily Routine Hero Card (Recipe Card / Quest Board with Priority & Antidotes) */}
            <DailyRoutineCard
              plan={activePlan}
              weather={telemetry}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
            />

            {/* Component 3: 5-Second 1-Tap Skin Feedback Widget (4 Pastel Sticker Buttons) */}
            <DailyCheckInWidget
              onFeedback={handleQuickFeedback}
              currentFeel={lastLoggedFeel}
              currentPriority={selectedPriority}
            />

            {/* Component 4: Learned Profile Summary (Skin Journal & Calibration Progress) */}
            <LearnedProfileSummary
              posteriorStates={posteriorStates}
              totalDaysLogged={logs.length}
            />

            {/* Peek at Statistics Cozy Recipe Card Banner */}
            <div
              onClick={() => setActiveView('audit')}
              className="group p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#FEF9E7] via-[#FFFBF0] to-[#E8EFE3] border-2 border-[#D4CEBF] hover:border-[#5B7052] shadow-[0_4px_0_#D4CEBF,0_10px_24px_rgba(91,112,82,0.06)] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-[#E8EFE3] text-[#5B7052] border-2 border-[#A3B899] group-hover:scale-105 transition-transform shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#3D312A] tracking-tight flex items-center gap-2">
                    Curious about the math behind your skin regimen?
                  </h3>
                  <p className="text-xs text-[#6B5B52] font-medium">
                    Inspect the BAMAT207 Chi-Square test, Logistic Regression equations, and ANOVA proofs.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-[#5B7052] group-hover:text-[#2A3B24] font-mono tracking-tight self-start sm:self-auto bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#D4CEBF] shadow-xs">
                <span>View Statistical Proofs</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </main>
        )}

        {/* VIEW 2: STATISTICAL AUDIT / SYLLABUS VIEW (BAMAT207 Botanical Academic Proofs) */}
        {activeView === 'audit' && (
          <main className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Component: Academic Inspector (BAMAT207 Botanical Evaluation Dashboard) */}
            <AcademicInspector
              logs={logs}
              onUpdateLogs={setLogs}
              onResetLogs={handleResetLogs}
              currentRegime={regime}
            />

            {/* Complete Data Ledger and Diagnostic Matrices */}
            <StatisticalValidationSuite logs={logs} />
          </main>
        )}

        {/* Global Footer (Cozy Desktop Style) */}
        <footer className="pt-6 pb-4 border-t-2 border-[#EFE8D8] text-center text-xs text-[#7C6044] font-mono space-y-1 font-medium">
          <p>
            🍃 DermaSync: Adaptive Meteorological Skincare Planner | BAMAT207 Probability & Statistics
          </p>
          <p className="text-[11px] text-[#8C7E72]">
            Cozy Derma-Nook UI System. Crafted with React 19, TypeScript, Vite, and Tailwind CSS.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
