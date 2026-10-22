/**
 * DermaSync: Adaptive Meteorological Skincare Planner
 * Course: BAMAT207 (Probability & Statistics)
 * Atmospheric Telemetry Service (Open-Meteo & Climate Presets)
 */

import type { UVLevel, WeatherRegime, WeatherTelemetry } from '../types/dermaSync';

export interface ClimatePreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly telemetry: WeatherTelemetry;
}

/**
 * Calculates dew point (°C) via the Magnus-Tetens approximation
 */
export function calculateDewPoint(tempC: number, relativeHumidity: number): number {
  const b = 17.625;
  const c = 243.04;
  const clampedRh = Math.max(1, Math.min(100, relativeHumidity));
  const gamma = Math.log(clampedRh / 100) + (b * tempC) / (c + tempC);
  const dewPoint = (c * gamma) / (b - gamma);
  return Number(dewPoint.toFixed(1));
}

export function classifyWeatherRegime(relativeHumidity: number): WeatherRegime {
  if (relativeHumidity < 40) return 'arid';
  if (relativeHumidity > 70) return 'humid';
  return 'temperate';
}

export function classifyUVLevel(uvIndex: number): UVLevel {
  if (uvIndex < 3) return 'low';
  if (uvIndex <= 5) return 'moderate';
  return 'high';
}

export const CLIMATE_PRESETS: readonly ClimatePreset[] = [
  {
    id: 'phoenix-arid',
    name: 'Phoenix / Sonoran (Arid Extreme)',
    description: 'RH 18% | Low atmospheric vapor, severe TEWL acceleration',
    telemetry: {
      temp: 34.0,
      humidity: 18,
      uvIndex: 9.5,
      dewPoint: 4.2,
      locationName: 'Phoenix, Arizona (Arid Desert)',
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'sf-temperate',
    name: 'San Francisco (Temperate Maritime)',
    description: 'RH 55% | Stable ambient vapor, moderate UV index',
    telemetry: {
      temp: 18.5,
      humidity: 55,
      uvIndex: 4.1,
      dewPoint: 9.3,
      locationName: 'San Francisco, California (Temperate Coast)',
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'singapore-humid',
    name: 'Singapore (Tropical Humid)',
    description: 'RH 88% | High thermal humidity, sweat evaporation hindered',
    telemetry: {
      temp: 31.5,
      humidity: 88,
      uvIndex: 11.2,
      dewPoint: 29.3,
      locationName: 'Singapore (Equatorial Humid)',
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'denver-alpine',
    name: 'Denver (Arid High-Altitude)',
    description: 'RH 32% | High elevation, intense UV irradiance, dry air',
    telemetry: {
      temp: 21.0,
      humidity: 32,
      uvIndex: 8.0,
      dewPoint: 4.0,
      locationName: 'Denver, Colorado (High-Altitude Arid)',
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'london-temperate',
    name: 'London (Temperate Maritime)',
    description: 'RH 68% | High cloud cover, gentle temperate conditions',
    telemetry: {
      temp: 15.0,
      humidity: 68,
      uvIndex: 2.0,
      dewPoint: 9.1,
      locationName: 'London, UK (Temperate Low UV)',
      timestamp: new Date().toISOString(),
    },
  },
];

/**
 * Fetches real-time telemetry from Open-Meteo API using latitude and longitude coordinates.
 */
export async function fetchLiveOpenMeteo(
  lat = 33.4484, // Default: Phoenix, AZ
  lon = -112.074,
  locationName = 'Live Meteorological Telemetry'
): Promise<WeatherTelemetry> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,uv_index,dew_point_2m&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo HTTP Error: ${response.status}`);
  }

  interface OpenMeteoResponse {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      uv_index: number;
      dew_point_2m?: number;
      time: string;
    };
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const temp = data.current.temperature_2m;
  const humidity = data.current.relative_humidity_2m;
  const uvIndex = data.current.uv_index;
  const dewPoint =
    typeof data.current.dew_point_2m === 'number'
      ? data.current.dew_point_2m
      : calculateDewPoint(temp, humidity);

  return {
    temp: Number(temp.toFixed(1)),
    humidity: Math.round(humidity),
    uvIndex: Number(uvIndex.toFixed(1)),
    dewPoint: Number(dewPoint.toFixed(1)),
    locationName,
    timestamp: data.current.time,
  };
}
