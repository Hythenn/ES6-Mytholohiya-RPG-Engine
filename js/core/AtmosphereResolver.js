/**
 * AtmosphereResolver.js
 * Unified Atmosphere & Environment Resolver for "Mytholohiya".
 * Resolves weather, time of day, and environment biomes with 3-tier priority,
 * preventing desynchronization between canvas visualizers, CSS glow, and scenario prose.
 */

import {
  WEATHER,
  TIME_OF_DAY,
  ENVIRONMENTS,
  ENVIRONMENT_DISPLAY_LABELS
} from './Constants.js';

/**
 * Resolves the active atmosphere (weather, timeOfDay, environment) for a scenario.
 *
 * @param {Object} scenario
 * @param {Object} [context={}]
 * @param {import('./ECS.js').World} [context.world]
 * @param {string} [context.currentWeather='DRIZZLE']
 * @param {string} [context.currentTimeOfDay='DUSK']
 * @param {string} [context.currentEnvironment='WILDERNESS']
 * @returns {{ weather: string, timeOfDay: string, environment: string, envLabel: string }}
 */
export function resolveAtmosphere(scenario, context = {}) {
  const world = context.world;
  const prevWeather = context.currentWeather || WEATHER.DRIZZLE;
  const prevTime = context.currentTimeOfDay || TIME_OF_DAY.DUSK;
  const prevEnv = context.currentEnvironment || ENVIRONMENTS.WILDERNESS;
  const intrinsicTags = Array.isArray(scenario && scenario.intrinsicTags)
    ? scenario.intrinsicTags
    : [];

  // 1. Resolve Weather
  let weather = scenario ? scenario.weather : null;
  if (!weather || weather === 'ANY') {
    if (world) {
      if (world.hasFlag('storm')) {
        weather = WEATHER.MONSOON;
      } else if (world.hasFlag('raining')) {
        weather = WEATHER.DRIZZLE;
      } else if (
        world.hasFlag('fog') ||
        world.hasFlag('mist') ||
        world.hasFlag('fog_gathering')
      ) {
        weather = WEATHER.SPIRIT_FOG;
      } else if (world.hasFlag('clear_sky')) {
        weather = WEATHER.CLEAR;
      } else {
        weather = prevWeather;
      }
    } else {
      weather = prevWeather;
    }
  } else {
    const upper = String(weather).toUpperCase();
    if (upper === 'SPIRIT_FOG' || upper === 'SPIRIT FOG') {
      weather = WEATHER.SPIRIT_FOG;
    } else if (WEATHER[upper]) {
      weather = WEATHER[upper];
    } else {
      weather = prevWeather;
    }
  }

  // 2. Resolve Time of Day
  let timeOfDay = scenario ? scenario.timeOfDay : null;
  if (Array.isArray(timeOfDay)) {
    const upperList = timeOfDay.map(t => {
      const u = String(t).toUpperCase();
      return TIME_OF_DAY[u] || u;
    });
    if (upperList.includes(prevTime)) {
      timeOfDay = prevTime;
    } else {
      timeOfDay = upperList[0];
    }
  }

  if (!timeOfDay) {
    if (intrinsicTags.includes('eclipse') || (world && world.hasFlag('lunar_eclipse_active'))) {
      timeOfDay = TIME_OF_DAY.ECLIPSE;
    } else if (intrinsicTags.includes('night_only') || intrinsicTags.includes('night')) {
      timeOfDay = TIME_OF_DAY.NIGHT;
    } else if (intrinsicTags.includes('day_only') || intrinsicTags.includes('day')) {
      timeOfDay = TIME_OF_DAY.DAY;
    } else {
      timeOfDay = prevTime;
    }
  } else {
    const upper = String(timeOfDay).toUpperCase();
    if (TIME_OF_DAY[upper]) {
      timeOfDay = TIME_OF_DAY[upper];
    } else {
      timeOfDay = prevTime;
    }
  }

  // 3. Resolve Environment (3-Tier Priority)
  // Priority 1: Explicit scenario.environment
  let environment = null;
  if (scenario && scenario.environment) {
    const explicit = String(scenario.environment).toUpperCase();
    if (explicit === 'OUTDOOR') {
      environment = ENVIRONMENTS.WILDERNESS;
    } else if (ENVIRONMENTS[explicit]) {
      environment = ENVIRONMENTS[explicit];
    }
  }

  // Priority 2: Keyword match on locationLabel and intrinsicTags
  if (!environment && scenario) {
    const location = String(scenario.locationLabel || '').toLowerCase();
    const tagsStr = intrinsicTags.join(' ').toLowerCase();
    const promptText = Array.isArray(scenario.prompt)
      ? scenario.prompt.join(' ').toLowerCase()
      : String(scenario.prompt || '').toLowerCase();
    const combined = `${location} ${tagsStr} ${promptText}`;

    if (/\b(salt|flats|shore|coast|reef|shoal|tidal|beach|ocean|mangasinan)\b/.test(combined)) {
      environment = ENVIRONMENTS.COAST;
    } else if (/\b(mangrove|bakawan|estuary|mudflat|sedge|swamp)\b/.test(combined)) {
      environment = ENVIRONMENTS.MANGROVE;
    } else if (/\b(balete|grove|acacia|banyan|canopy|sacred tree|dalakit)\b/.test(combined)) {
      environment = ENVIRONMENTS.BALETE;
    } else if (/\b(terrace|terraces|mountain|ridge|highland|cordillera|cloud-terrace|banaue)\b/.test(combined)) {
      environment = ENVIRONMENTS.TERRACES;
    } else if (/\b(ruin|ruins|megalith|ancient pillar|crumbled altar|punso mound)\b/.test(combined)) {
      environment = ENVIRONMENTS.RUINS;
    } else if (/\b(maw|trench|abyss|crater|void|chasm|caldera)\b/.test(combined)) {
      environment = ENVIRONMENTS.MAW;
    } else if (/\b(kubo|cabin|nipa house|nipa shack|hovel|tapahan|tavern|establishment)\b/.test(combined)) {
      environment = ENVIRONMENTS.CABIN;
    } else if (/\b(tent|bivouac|habihan shelter|lean-to|oilskin flaps)\b/.test(combined)) {
      environment = ENVIRONMENTS.TENT;
    } else if (/\b(city|kedatuan|kingdom|torogan|wharf|bazaar|port)\b/.test(combined)) {
      environment = ENVIRONMENTS.CITY;
    } else if (/\b(village|barangay|settlement|stilt huts|riverbank)\b/.test(combined)) {
      environment = ENVIRONMENTS.VILLAGE;
    }
  }

  // Priority 3: Keep previous active environment before falling back to WILDERNESS
  if (!environment) {
    environment = prevEnv || ENVIRONMENTS.WILDERNESS;
  }

  const envKey = (environment || 'WILDERNESS').toUpperCase();
  const envLabel = ENVIRONMENT_DISPLAY_LABELS[envKey] || ENVIRONMENT_DISPLAY_LABELS[environment] || environment || 'WILDERNESS';

  return {
    weather,
    timeOfDay,
    environment,
    envLabel
  };
}

/**
 * Validates whether a seamless hook text is valid under the current atmospheric conditions.
 * Prevents sunlight descriptions during NIGHT/ECLIPSE, or clear sky descriptions in rain.
 *
 * @param {string} text
 * @param {string} timeOfDay
 * @param {string} weather
 * @returns {boolean}
 */
export function isSeamlessHookCompatible(text, timeOfDay, weather) {
  if (!text) return false;
  const isNightOrEclipse = timeOfDay === TIME_OF_DAY.NIGHT || timeOfDay === TIME_OF_DAY.ECLIPSE;
  if (isNightOrEclipse && /\b(sunlight|sun-dappled|morning light|blazing sun|sun glare|basking in the sun)\b/i.test(text)) {
    return false;
  }
  if (weather === WEATHER.MONSOON || weather === WEATHER.DRIZZLE) {
    if (/\b(dry dust|basking under the hot sun|cloudless sky|clear sky)\b/i.test(text)) {
      return false;
    }
  }
  if (weather === WEATHER.CLEAR) {
    if (/\b(torrential downpour|driving monsoon|drenching rain)\b/i.test(text)) {
      return false;
    }
  }
  return true;
}

