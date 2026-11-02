/**
 * js/data/scenarios/index.js
 * Central barrel module importing all scenario files from categorized subfolders:
 * - early/ (EarlyGameSaltTrail, EarlyGameBalete, EarlyGameMerchantRescue, EarlyGameKotaHub, EarlyGamePlayerCamping)
 * - mid/ (MidGameTerraces)
 * - late/ (LateGameBakunawaMaw)
 * - misc/ (MiscScenarios)
 * - people/ (PeopleAndTerrainScenarios, HumanFactions)
 */

import { ScenarioData } from './early/EarlyGameSaltTrail.js';
import { SubstoryEarlyBalete } from './early/EarlyGameBalete.js';
import { SubstoryMerchantRescue } from './early/EarlyGameMerchantRescue.js';
import { SubstoryKotaHub } from './early/EarlyGameKotaHub.js';
import { SubstoryPlayerCamping } from './early/EarlyGamePlayerCamping.js';
import { SubstoryMidTerraces } from './mid/MidGameTerraces.js';
import { SubstoryLateBakunawa } from './late/LateGameBakunawaMaw.js';
import './misc/MiscScenarios.js';
import './people/PeopleAndTerrainScenarios.js';
import './people/HumanFactions.js';

export {
  ScenarioData,
  SubstoryEarlyBalete,
  SubstoryMerchantRescue,
  SubstoryKotaHub,
  SubstoryPlayerCamping,
  SubstoryMidTerraces,
  SubstoryLateBakunawa
};
