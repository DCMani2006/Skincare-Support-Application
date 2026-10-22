/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Course: BAMAT207 (Probability & Statistics)
 * Simulation Cohort Presets for Academic Evaluation
 */

import type { DailyLogEntry } from '../types/dermaSync';

/**
 * 14-Day Monsoon Cohort (Equatorial / Tropical High Humidity Bias)
 * Characterized by RH 76%–92%, high dew points (24–28°C), and sebum congestion complaints
 */
export const MONSOON_COHORT_LOGS: DailyLogEntry[] = [
  {
    dayIndex: 1,
    date: '2026-10-01',
    weather: { temp: 31.2, humidity: 84, uvIndex: 8.5, dewPoint: 28.1, cloudCover: 75, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-01T08:00:00Z' },
    userReport: 'greasy_clogged',
    prescribedArchetype: 'barrier_recovery', // Overly heavy for 84% RH
    satisfactionScore: 2.3,
  },
  {
    dayIndex: 2,
    date: '2026-10-02',
    weather: { temp: 32.0, humidity: 88, uvIndex: 9.0, dewPoint: 29.4, cloudCover: 60, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-02T08:00:00Z' },
    userReport: 'greasy_clogged',
    prescribedArchetype: 'deep_nourish', // Overly rich butter in extreme humidity
    satisfactionScore: 1.9,
  },
  {
    dayIndex: 3,
    date: '2026-10-03',
    weather: { temp: 29.5, humidity: 82, uvIndex: 7.0, dewPoint: 26.0, cloudCover: 80, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-03T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'pore_clarifying', // BHA unclogged pores
    satisfactionScore: 4.8,
  },
  {
    dayIndex: 4,
    date: '2026-10-04',
    weather: { temp: 30.8, humidity: 86, uvIndex: 8.0, dewPoint: 28.0, cloudCover: 70, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-04T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'lightweight_hydration', // Oil-free water gel
    satisfactionScore: 4.7,
  },
  {
    dayIndex: 5,
    date: '2026-10-05',
    weather: { temp: 33.1, humidity: 90, uvIndex: 9.5, dewPoint: 31.0, cloudCover: 55, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-05T08:00:00Z' },
    userReport: 'greasy_clogged',
    prescribedArchetype: 'deep_nourish',
    satisfactionScore: 2.0,
  },
  {
    dayIndex: 6,
    date: '2026-10-06',
    weather: { temp: 31.0, humidity: 85, uvIndex: 7.8, dewPoint: 28.0, cloudCover: 65, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-06T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'pore_clarifying',
    satisfactionScore: 4.9,
  },
  {
    dayIndex: 7,
    date: '2026-10-07',
    weather: { temp: 28.6, humidity: 92, uvIndex: 6.2, dewPoint: 27.1, cloudCover: 90, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-07T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'lightweight_hydration',
    satisfactionScore: 4.6,
  },
  {
    dayIndex: 8,
    date: '2026-10-08',
    weather: { temp: 30.0, humidity: 80, uvIndex: 7.5, dewPoint: 26.1, cloudCover: 50, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-08T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'pore_clarifying',
    satisfactionScore: 4.8,
  },
  {
    dayIndex: 9,
    date: '2026-10-09',
    weather: { temp: 32.5, humidity: 84, uvIndex: 8.8, dewPoint: 29.2, cloudCover: 60, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-09T08:00:00Z' },
    userReport: 'greasy_clogged',
    prescribedArchetype: 'barrier_recovery',
    satisfactionScore: 2.6,
  },
  {
    dayIndex: 10,
    date: '2026-10-10',
    weather: { temp: 29.8, humidity: 88, uvIndex: 6.5, dewPoint: 27.5, cloudCover: 85, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-10T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'lightweight_hydration',
    satisfactionScore: 4.8,
  },
  {
    dayIndex: 11,
    date: '2026-10-11',
    weather: { temp: 31.5, humidity: 83, uvIndex: 8.2, dewPoint: 28.0, cloudCover: 70, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-11T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'pore_clarifying',
    satisfactionScore: 4.9,
  },
  {
    dayIndex: 12,
    date: '2026-10-12',
    weather: { temp: 30.4, humidity: 86, uvIndex: 7.9, dewPoint: 27.8, cloudCover: 75, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-12T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'lightweight_hydration',
    satisfactionScore: 4.7,
  },
  {
    dayIndex: 13,
    date: '2026-10-13',
    weather: { temp: 33.0, humidity: 87, uvIndex: 9.2, dewPoint: 30.5, cloudCover: 60, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-13T08:00:00Z' },
    userReport: 'greasy_clogged',
    prescribedArchetype: 'deep_nourish',
    satisfactionScore: 2.2,
  },
  {
    dayIndex: 14,
    date: '2026-10-14',
    weather: { temp: 31.8, humidity: 82, uvIndex: 8.4, dewPoint: 28.2, cloudCover: 65, locationName: 'Vellore (Monsoon Simulation)', timestamp: '2026-10-14T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'pore_clarifying',
    satisfactionScore: 4.8,
  },
];

/**
 * 14-Day Arid Winter Cohort (Desert / High-Altitude Cold Dryness Bias)
 * Characterized by RH 16%–34%, dew points below 5°C, and transepidermal flaking/tightness
 */
export const ARID_WINTER_COHORT_LOGS: DailyLogEntry[] = [
  {
    dayIndex: 1,
    date: '2026-10-01',
    weather: { temp: 18.2, humidity: 22, uvIndex: 5.5, dewPoint: -4.2, cloudCover: 10, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-01T08:00:00Z' },
    userReport: 'tight_dry',
    prescribedArchetype: 'lightweight_hydration', // Water-gel evaporates too fast in 22% RH
    satisfactionScore: 2.4,
  },
  {
    dayIndex: 2,
    date: '2026-10-02',
    weather: { temp: 19.5, humidity: 18, uvIndex: 6.0, dewPoint: -6.5, cloudCover: 5, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-02T08:00:00Z' },
    userReport: 'tight_dry',
    prescribedArchetype: 'pore_clarifying', // Stripping in dry winter air
    satisfactionScore: 2.0,
  },
  {
    dayIndex: 3,
    date: '2026-10-03',
    weather: { temp: 21.0, humidity: 25, uvIndex: 5.8, dewPoint: -2.0, cloudCover: 15, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-03T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'barrier_recovery', // Ceramides arrested TEWL
    satisfactionScore: 4.9,
  },
  {
    dayIndex: 4,
    date: '2026-10-04',
    weather: { temp: 22.4, humidity: 28, uvIndex: 6.2, dewPoint: 1.0, cloudCover: 20, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-04T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'deep_nourish', // Squalane sandwich
    satisfactionScore: 4.8,
  },
  {
    dayIndex: 5,
    date: '2026-10-05',
    weather: { temp: 17.5, humidity: 16, uvIndex: 5.0, dewPoint: -8.0, cloudCover: 5, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-05T08:00:00Z' },
    userReport: 'tight_dry',
    prescribedArchetype: 'gentle_exfoliation', // Direct acids in extreme aridity
    satisfactionScore: 2.1,
  },
  {
    dayIndex: 6,
    date: '2026-10-06',
    weather: { temp: 18.0, humidity: 20, uvIndex: 5.5, dewPoint: -5.0, cloudCover: 10, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-06T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'barrier_recovery',
    satisfactionScore: 4.9,
  },
  {
    dayIndex: 7,
    date: '2026-10-07',
    weather: { temp: 20.2, humidity: 24, uvIndex: 5.8, dewPoint: -2.5, cloudCover: 15, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-07T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'deep_nourish',
    satisfactionScore: 4.8,
  },
  {
    dayIndex: 8,
    date: '2026-10-08',
    weather: { temp: 21.5, humidity: 22, uvIndex: 6.0, dewPoint: -3.0, cloudCover: 10, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-08T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'barrier_recovery',
    satisfactionScore: 4.7,
  },
  {
    dayIndex: 9,
    date: '2026-10-09',
    weather: { temp: 19.8, humidity: 19, uvIndex: 5.2, dewPoint: -5.8, cloudCover: 5, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-09T08:00:00Z' },
    userReport: 'tight_dry',
    prescribedArchetype: 'lightweight_hydration',
    satisfactionScore: 2.7,
  },
  {
    dayIndex: 10,
    date: '2026-10-10',
    weather: { temp: 22.0, humidity: 26, uvIndex: 6.1, dewPoint: 0.2, cloudCover: 10, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-10T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'deep_nourish',
    satisfactionScore: 4.9,
  },
  {
    dayIndex: 11,
    date: '2026-10-11',
    weather: { temp: 20.8, humidity: 23, uvIndex: 5.9, dewPoint: -2.2, cloudCover: 15, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-11T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'barrier_recovery',
    satisfactionScore: 4.8,
  },
  {
    dayIndex: 12,
    date: '2026-10-12',
    weather: { temp: 18.5, humidity: 17, uvIndex: 5.4, dewPoint: -7.1, cloudCover: 5, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-12T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'deep_nourish',
    satisfactionScore: 4.9,
  },
  {
    dayIndex: 13,
    date: '2026-10-13',
    weather: { temp: 23.0, humidity: 30, uvIndex: 6.5, dewPoint: 3.5, cloudCover: 20, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-13T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'barrier_recovery',
    satisfactionScore: 4.8,
  },
  {
    dayIndex: 14,
    date: '2026-10-14',
    weather: { temp: 21.0, humidity: 20, uvIndex: 5.7, dewPoint: -4.5, cloudCover: 10, locationName: 'Phoenix (Arid Simulation)', timestamp: '2026-10-14T08:00:00Z' },
    userReport: 'balanced',
    prescribedArchetype: 'deep_nourish',
    satisfactionScore: 5.0,
  },
];

/**
 * Creates a Sensitive Skin Flare by injecting an acute stinging event into existing logs
 */
export function createSensitiveSkinFlare(baseLogs: readonly DailyLogEntry[]): DailyLogEntry[] {
  const nextDay = baseLogs.length + 1;
  const flareEntry: DailyLogEntry = {
    dayIndex: nextDay,
    date: new Date().toISOString().split('T')[0],
    weather: {
      temp: 24.0,
      humidity: 32,
      uvIndex: 7.5,
      dewPoint: 5.5,
      cloudCover: 10,
      locationName: 'Acute Flare Simulation (Arid + High UV)',
      timestamp: new Date().toISOString(),
    },
    userReport: 'stinging_irritated',
    prescribedArchetype: 'gentle_exfoliation', // Exfoliating acid triggered acute barrier tear
    satisfactionScore: 1.5,
  };

  return [...baseLogs, flareEntry];
}
