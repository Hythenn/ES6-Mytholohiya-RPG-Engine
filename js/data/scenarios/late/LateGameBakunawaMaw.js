/**
 * LateGameBakunawaMaw.js
 * Registers LATE_GAME Substory 01: "The Abyssal Altar of the Bakunawa"
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

export const SubstoryLateBakunawa = {
  substoryId: 'sub_late_01_maw_of_bakunawa',
  mainLoopId: 'loop_eclipse_bakunawa',
  phase: 'LATE_GAME',
  internalName: 'The Abyssal Altar of the Bakunawa',
  targetScenarioCount: 5,
  scenarios: [
    {
      id: 'scn_bakunawa_01',
      phase: 'LATE_GAME',
      creatureId: 'bakunawa',
      locationLabel: 'Black Basalt Sea-Cliffs',
      environment: 'MAW',
      weather: 'MONSOON',
      timeOfDay: 'NIGHT',
      baseWeight: 1.5,
      intrinsicTags: ['eclipse_peak', 'raining'],
      affinityWeights: {
        mumbaki_blessing: 3.0,
        high_ground: 2.0
      },
      seamlessHooks: {
        approaching_coastal_marsh:
          'The earth slopes steeply down toward the churning black sea, where towering basalt columns shatter the titanic breakers.',
        spirit_fog_rising:
          'A cold sea-mist saturated with ash and salt sweeps inland, obscuring the jagged rocks and the frantic chanting of cultists.',
        monsoon_break:
          'The oceanic storm gathers into a cyclonic fury, turning the sky the color of bruised iron as the tide swells unnaturally.',
        dusk_falling:
          'The sun turns an ominous, sickly orange on the ocean horizon as the shadow of the Leviathan rises beneath the waves.',
        midnight_darkness:
          'Pitch blackness falls as the moon begins to disappear into the gaping jaws of the sky-serpent.',
        default:
          'You descend onto the jagged black basalt cliffs where the ocean boils under a total blood-red eclipse.'
      },
      passive: {
        stat: 'WIS',
        dc: 15,
        success:
          'Coils the size of mountain ridges shift beneath the whirlpool a half-league offshore.',
        fail:
          'The roar of the whirlpool drowns out even the thunder overhead.'
      },
      prompt: [
        'The seventh and final moon hangs half-swallowed in the jaws of a colossal winged sea-serpent whose scales glitter like wet obsidian. Each time the Bakunawa tightens its coil, tidal waves smash against the basalt altar.',
        'Along the cliff causeway, cultists of the Drowned Moon attempt to shatter the ancient bronze noise-makers meant to startle the serpent into releasing the moon.'
      ],
      choices: [
        {
          text: 'Charge through the cultist line and cut them down before they break the bronze drums',
          check: { stat: 'STR', dc: 15 },
          successStory: [
            'Driving through the spray like a tempest, you scatter the fanatics over the cliff edge and secure the ritual drums intact!'
          ],
          failStory: [
            'A cultist kris dagger slices deep across your forearm before you hurl him into the boiling surf!'
          ],
          onSuccess: { piloncitos: 10, addItem: 'kris_blade', emitTags: ['drums_secured'] },
          onFail: { hp: -5, emitTags: ['drums_secured', 'wounded'] }
        },
        {
          text: 'Slip through the eclipse shadows with your garment Inside-Out to ambush the cult leader',
          requiredTag: 'clothing_inside_out',
          itemActionTag: 'Folklore // Baliktad Stealth',
          check: null,
          successStory: [
            'Blind to your approach through the spirit-haze, the cult leader falls to a single decisive strike, leaving the ritual drums untouched!'
          ],
          onSuccess: { piloncitos: 12, addItem: 'batuani_brass_breastplate', emitTags: ['drums_secured', 'clear_sky'] }
        }
      ]
    },
    {
      id: 'scn_bakunawa_02',
      phase: 'LATE_GAME',
      creatureId: 'bakunawa',
      locationLabel: 'The Sovereign Reckoning',
      environment: 'MAW',
      weather: 'SPIRIT FOG',
      timeOfDay: 'ECLIPSE',
      baseWeight: 1.0,
      intrinsicTags: ['final_stand'],
      affinityWeights: {
        drums_secured: 5.0
      },
      seamlessHooks: {
        eclipse_rising:
          'A terrible shadow devours the silver face of the moon, plunging the islands into an icy, spectral twilight.',
        monsoon_break:
          'The sea roars in madness as tidal waves crash against the cliff face, spraying freezing brine across the ritual altar.',
        spirit_fog_rising:
          'The cosmic serpent breath chills the air to frost, wrapping the cliffs in billowing clouds of spectral vapor.',
        default:
          'Standing at the very edge of the abyssal altar, the shadow of the Bakunawa falls directly over you as the last crescent of moonlight flickers.'
      },
      passive: {
        stat: 'CHA',
        dc: 15,
        success:
          'Every spirit, beast, and villager you aided along the road lends their voice to the wind behind you.',
        fail:
          'The crushing pressure of the Leviathan gaze nearly forces you to your knees.'
      },
      prompt: [
        'Rising from the abyssal ocean trench, the colossal Bakunawa spreads its fin-like wings and opens a mouth the size of a lake to swallow the seventh and final moon, Bulan. Conventional steel cannot pierce scales as thick as cliff-basalt; only a massive acoustic shockwave or a perfectly timed Babaylan ritual chant can force the sky-devourer to uncoil its jaws.',
        'The bronze agung gongs and drums wait upon the basalt plinth as lightning forks across the boiling sea. This is the final test of your chronicle.'
      ],
      choices: [
        {
          text: 'Strike the bronze gongs and drums with maximum physical force to unleash an acoustic shockwave!',
          check: { stat: 'STR', dc: 17 },
          successStory: [
            'With the strength of a mountain storm, you hammer the ancient bronze agung! A deafening acoustic shockwave tears across the trench, rattling the Leviathan inner ear and shattering the tidal vortex. Startled and blinded by the thunderous resonance, the great Bakunawa uncoils its jaws and disgorges the radiant moon back into the heavens as dawn breaks across the archipelago!'
          ],
          failStory: [
            'The bronze mallet cracks under the strain and the Leviathan roar nearly bursts your eardrums, yet your relentless striking of the gongs still forces the beast to spit out the moon before sinking back into the abyss!'
          ],
          onSuccess: { piloncitos: 25, hp: 5, addItem: 'haliya_golden_mask', emitTags: ['eclipse_broken', 'clear_sky'] },
          onFail: { hp: -5, emitTags: ['eclipse_broken'] }
        },
        {
          text: 'Calculate the exact eclipse zenith and align the protective Babaylan chants with the bronze chimes!',
          check: { stat: 'INT', dc: 16 },
          successStory: [
            'Waiting until the exact heartbeat when the lunar corona aligns with the cliff altar, you intone the archaic Babaylan harmonic verse and strike the key bronze node! The amplified ritual frequency pierces the Bakunawa astral equilibrium, forcing the cosmic serpent to release Bulan unharmed as golden dawn floods the islands!'
          ],
          failStory: [
            'Though the psychic backlash of the eclipse timing scorches your nerves, your final chanted cadence resonates through the bronze gongs and compels the serpent to release the moon!'
          ],
          onSuccess: { piloncitos: 25, hp: 5, addItem: ['gold_calamansanay_band', 'black_coral_ring'], emitTags: ['eclipse_broken', 'clear_sky'] },
          onFail: { hp: -5, emitTags: ['eclipse_broken'] }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstoryLateBakunawa);

