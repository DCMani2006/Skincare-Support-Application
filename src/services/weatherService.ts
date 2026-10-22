/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Real-World Environmental Ingestion Service (Open-Meteo REST API)
 *
 * Implements:
 * - Browser Geolocation query with robust fallbacks (Vellore: 12.9165°N, 79.1325°E / Berlin: 52.52°N, 13.41°E)
 * - Magnus-Tetens dew point approximation
 * - Meteorological regime & UV level categorizations
 * - In-memory TTL caching to avoid hitting Open-Meteo rate limits on re-renders
 * - Graceful offline / network failure handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { UVLevel, WeatherRegime, WeatherTelemetry } from '../types/dermaSync';

// ==========================================
// 1. Types & Result Interfaces
// ==========================================

export interface TelemetryResult {
  readonly telemetry: WeatherTelemetry;
  readonly regime: WeatherRegime;
  readonly uvLevel: UVLevel;
  readonly fromCache: boolean;
  readonly isOfflineFallback: boolean;
}

export interface Coordinates {
  readonly lat: number;
  readonly lon: number;
  readonly locationName: string;
}

// Fallback coordinate locations
export const FALLBACK_LOCATIONS: Record<string, Coordinates> = {
  vellore: {
    lat: 12.9165,
    lon: 79.1325,
    locationName: 'Vellore, Tamil Nadu, India (12.9165°N, 79.1325°E)',
  },
  berlin: {
    lat: 52.52,
    lon: 13.41,
    locationName: 'Berlin, Germany (52.52°N, 13.41°E)',
  },
  phoenix: {
    lat: 33.4484,
    lon: -112.074,
    locationName: 'Phoenix, Arizona, USA (Arid Desert)',
  },
};

export const DEFAULT_FALLBACK_LOCATION: Coordinates = FALLBACK_LOCATIONS.vellore;

// ==========================================
// 2. Physical & Meteorological Formulas
// ==========================================

/**
 * Computes exact Dew Point temperature (°C) via the Magnus-Tetens approximation:
 *   γ(T, RH) = ln(RH / 100) + (b · T) / (c + T)
 *   T_d = (c · γ) / (b - γ)
 * where b = 17.625, c = 243.04°C (WMO standard coefficients).
 */
export function calculateDewPoint(tempC: number, relativeHumidity: number): number {
  const b = 17.625;
  const c = 243.04;
  // Guard against non-positive humidity for log evaluation
  const clampedRh = Math.max(1.0, Math.min(100.0, relativeHumidity));
  const gamma = Math.log(clampedRh / 100.0) + (b * tempC) / (c + tempC);
  const dewPoint = (c * gamma) / (b - gamma);
  return Number(dewPoint.toFixed(1));
}

/**
 * Categorizes relative humidity into distinct epidermal moisture regimes:
 * - 'arid': RH < 40% (high stratum corneum evaporation)
 * - 'temperate': 40% <= RH <= 70% (homeostatic ambient vapor)
 * - 'humid': RH > 70% (hindered evaporative cooling, sweat/sebum pooling)
 */
export function classifyWeatherRegime(relativeHumidity: number): WeatherRegime {
  if (relativeHumidity < 40) return 'arid';
  if (relativeHumidity > 70) return 'humid';
  return 'temperate';
}

/**
 * Categorizes solar UV index into biological risk levels:
 * - 'low': 0 - 2
 * - 'moderate': 3 - 5
 * - 'high': 6+ (mandatory photoprotective reapplication & acid suspension)
 */
export function classifyUVLevel(uvIndex: number): UVLevel {
  if (uvIndex < 3) return 'low';
  if (uvIndex < 6) return 'moderate';
  return 'high';
}

// ==========================================
// 3. In-Memory Caching System
// ==========================================

interface CacheEntry {
  readonly result: TelemetryResult;
  readonly cachedAt: number;
}

// 10-minute cache TTL prevents rate-limiting and redundant API requests
const CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map<string, CacheEntry>();

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

/**
 * Manually flushes the in-memory telemetry cache (useful for force refresh)
 */
export function clearTelemetryCache(): void {
  memoryCache.clear();
}

// ==========================================
// 4. Geolocation Resolver
// ==========================================

/**
 * Resolves current geographic coordinates via browser navigator.geolocation,
 * falling back gracefully to Vellore / Berlin if permissions are denied,
 * timeout occurs, or the API is unavailable.
 */
export async function resolveCoordinates(
  requestedLat?: number,
  requestedLon?: number
): Promise<Coordinates> {
  // If coordinates were explicitly provided, use them
  if (typeof requestedLat === 'number' && typeof requestedLon === 'number') {
    return {
      lat: requestedLat,
      lon: requestedLon,
      locationName: `Custom Coordinates (${requestedLat.toFixed(2)}°N, ${requestedLon.toFixed(2)}°E)`,
    };
  }

  // Attempt browser geolocation if in browser environment
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 300000, // 5 min cached position allowed
        });
      });

      return {
        lat: Number(position.coords.latitude.toFixed(4)),
        lon: Number(position.coords.longitude.toFixed(4)),
        locationName: `Local Device Location (${position.coords.latitude.toFixed(2)}°N, ${position.coords.longitude.toFixed(2)}°E)`,
      };
    } catch {
      // Permission denied, timeout, or position unavailable -> fallback to default
    }
  }

  return DEFAULT_FALLBACK_LOCATION;
}

// ==========================================
// 5. Open-Meteo REST API Telemetry Fetcher
// ==========================================

interface OpenMeteoApiResponse {
  current?: {
    temperature_2m: number;
    relative_humidity_2m: number;
    uv_index: number;
    cloud_cover?: number;
    dew_point_2m?: number;
    time: string;
  };
}

/**
 * Generates medically sound synthetic fallback telemetry when offline
 */
function createOfflineFallbackTelemetry(coords: Coordinates): TelemetryResult {
  const isVellore = Math.abs(coords.lat - FALLBACK_LOCATIONS.vellore.lat) < 1;
  const temp = isVellore ? 30.5 : 19.0;
  const humidity = isVellore ? 72 : 55;
  const uvIndex = isVellore ? 7.8 : 3.5;
  const cloudCover = isVellore ? 25 : 60;
  const dewPoint = calculateDewPoint(temp, humidity);
  const regime = classifyWeatherRegime(humidity);
  const uvLevel = classifyUVLevel(uvIndex);

  const telemetry: WeatherTelemetry = {
    temp,
    humidity,
    uvIndex,
    dewPoint,
    cloudCover,
    locationName: `${coords.locationName} [Offline Default]`,
    timestamp: new Date().toISOString(),
  };

  return {
    telemetry,
    regime,
    uvLevel,
    fromCache: false,
    isOfflineFallback: true,
  };
}

/**
 * Asynchronous core function: fetchLiveTelemetry
 * Queries browser geolocation or coordinates, checks in-memory cache,
 * executes Open-Meteo API query, computes dew point, and returns classified telemetry.
 */
export async function fetchLiveTelemetry(
  lat?: number,
  lon?: number,
  forceRefresh = false
): Promise<TelemetryResult> {
  const coords = await resolveCoordinates(lat, lon);
  const cacheKey = getCacheKey(coords.lat, coords.lon);
  const now = Date.now();

  // 1. Check in-memory cache
  if (!forceRefresh) {
    const cached = memoryCache.get(cacheKey);
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      return {
        ...cached.result,
        fromCache: true,
      };
    }
  }

  // 2. Check offline status
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return { ...cached.result, fromCache: true, isOfflineFallback: true };
    }
    const fallback = createOfflineFallbackTelemetry(coords);
    memoryCache.set(cacheKey, { result: fallback, cachedAt: now });
    return fallback;
  }

  // 3. Fetch from Open-Meteo REST API
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,uv_index,cloud_cover&timezone=auto`;

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenMeteoApiResponse;

    if (!data.current) {
      throw new Error('Malformed Open-Meteo response: missing "current" payload');
    }

    const temp = Number(data.current.temperature_2m.toFixed(1));
    const humidity = Math.round(data.current.relative_humidity_2m);
    const uvIndex = Number(data.current.uv_index.toFixed(1));
    const cloudCover = typeof data.current.cloud_cover === 'number' ? Math.round(data.current.cloud_cover) : undefined;
    const dewPoint = calculateDewPoint(temp, humidity);

    const regime = classifyWeatherRegime(humidity);
    const uvLevel = classifyUVLevel(uvIndex);

    const telemetry: WeatherTelemetry = {
      temp,
      humidity,
      uvIndex,
      dewPoint,
      cloudCover,
      locationName: coords.locationName,
      timestamp: data.current.time || new Date().toISOString(),
    };

    const result: TelemetryResult = {
      telemetry,
      regime,
      uvLevel,
      fromCache: false,
      isOfflineFallback: false,
    };

    // Store in memory cache
    memoryCache.set(cacheKey, { result, cachedAt: now });

    return result;
  } catch {
    // If request failed (e.g. offline, CORS, network drop), check cache before synthetic fallback
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return { ...cached.result, fromCache: true, isOfflineFallback: true };
    }

    // Graceful offline fallback and cache it
    const fallback = createOfflineFallbackTelemetry(coords);
    memoryCache.set(cacheKey, { result: fallback, cachedAt: now });
    return fallback;
  }
}

// ==========================================
// 6. Asynchronous React Hook: useLiveTelemetry
// ==========================================

export interface UseLiveTelemetryState {
  readonly telemetry: WeatherTelemetry | null;
  readonly regime: WeatherRegime | null;
  readonly uvLevel: UVLevel | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly fromCache: boolean;
  readonly isOfflineFallback: boolean;
  readonly refresh: (force?: boolean) => Promise<void>;
}

/**
 * React Hook for seamless, rate-limit safe weather telemetry ingestion
 */
export function useLiveTelemetry(initialLat?: number, initialLon?: number): UseLiveTelemetryState {
  const [telemetry, setTelemetry] = useState<WeatherTelemetry | null>(null);
  const [regime, setRegime] = useState<WeatherRegime | null>(null);
  const [uvLevel, setUvLevel] = useState<UVLevel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    let active = true;
    void fetchLiveTelemetry(initialLat, initialLon, false).then(
      (res) => {
        if (active) {
          setTelemetry(res.telemetry);
          setRegime(res.regime);
          setUvLevel(res.uvLevel);
          setFromCache(res.fromCache);
          setIsOfflineFallback(res.isOfflineFallback);
          setLoading(false);
        }
      },
      (err: unknown) => {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve meteorological telemetry';
          setError(msg);
          setLoading(false);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [initialLat, initialLon]);

  const refresh = useCallback(
    async (force = true) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchLiveTelemetry(initialLat, initialLon, force);
        if (isMountedRef.current) {
          setTelemetry(res.telemetry);
          setRegime(res.regime);
          setUvLevel(res.uvLevel);
          setFromCache(res.fromCache);
          setIsOfflineFallback(res.isOfflineFallback);
        }
      } catch (err: unknown) {
        if (isMountedRef.current) {
          const msg = err instanceof Error ? err.message : 'Failed to retrieve meteorological telemetry';
          setError(msg);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [initialLat, initialLon]
  );

  return {
    telemetry,
    regime,
    uvLevel,
    loading,
    error,
    fromCache,
    isOfflineFallback,
    refresh,
  };
}
