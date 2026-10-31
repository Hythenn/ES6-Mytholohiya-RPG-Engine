/**
 * js/data/scenarios/index.js
 * Barrel module loading all substory arcs (EARLY_GAME, MID_GAME, LATE_GAME)
 * and the global miscellaneous scenarios pool.
 */

import { ScenarioData } from './EarlyGameSaltTrail.js';
import { SubstoryEarlyBalete } from './EarlyGameBalete.js';
import { SubstoryMidTerraces } from './MidGameTerraces.js';
import { SubstoryLateBakunawa } from './LateGameBakunawaMaw.js';
import './MiscScenarios.js';
import './PeopleAndTerrainScenarios.js';

export {
  ScenarioData,
  SubstoryEarlyBalete,
  SubstoryMidTerraces,
  SubstoryLateBakunawa
};
