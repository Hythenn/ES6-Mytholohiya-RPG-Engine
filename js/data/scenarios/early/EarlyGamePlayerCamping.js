/**
 * js/data/scenarios/early/EarlyGamePlayerCamping.js
 * Multi-stage, chained scenario sequence for Player-Initiated Camping and Shelter Management:
 * - Node 1: Wilderness Trail (Voluntary decision to pitch camp or press onward through dark forest)
 * - Node 2: Inside the Tent / Campsite (Chained via pitched_camp_tent: 100.0)
 *   Provides options to sleep deeply, invert armor for folklore wards, cleanse bloodied scent trails,
 *   or pack up camp and resume traveling on the trail.
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

export const SubstoryPlayerCamping = {
  substoryId: 'sub_early_player_camping',
  mainLoopId: 'loop_wilderness_survival',
  phase: 'EARLY_GAME',
  internalName: 'Player-Initiated Campsite & Shelter',
  targetScenarioCount: 2,
  scenarios: [
    // NODE 1: WILDERNESS TRAIL (Prerequisite Decision)
    {
      id: 'scn_trail_rest_decision_01',
      phase: 'EARLY_GAME',
      locationLabel: 'Sheltered Forest Ridge',
      environment: 'FOREST',
      weather: 'DRIZZLE',
      timeOfDay: 'DUSK',
      baseWeight: 1.0,
      intrinsicTags: ['wilderness_trail', 'dusk_falling', 'shelter_opportunity'],
      affinityWeights: {
        cautious: 1.5,
        wounded: 2.0,
        exhausted: 2.5
      },
      seamlessHooks: {
        default: 'As dusk settles over the ridge, the cold drizzle makes your damp garments cling heavily to your shoulders.'
      },
      passive: {
        stat: 'WIS',
        dc: 11,
        success:
          'You spot a dry hollow beneath an overhanging limestone ledge: an ideal spot to pitch a tent out of the wind.',
        fail:
          'The shadows deepen quickly, making the surrounding ironwood trees feel suffocating and exposed.'
      },
      prompt: [
        'Nightfall approaches rapidly over the mountain ridge. The air turns cold, and the distant, inverted whistles of nocturnal birds warn that predators will soon begin their hunt.',
        'You can unroll your woven rattan tent under the limestone ledge to shelter for the night, or press onward through the dark wilderness.'
      ],
      choices: [
        {
          text: 'Unroll your rattan shelter and pitch camp under the rock ledge',
          complexity: 'basic',
          whisperTag: 'Shelter // Pitch Rattan Tent',
          check: null,
          successStory: [
            'Working swiftly before the last embers of sunset fade, you lash your woven rattan sheet against sturdy wooden pegs, creating a dry, windproof shelter beneath the limestone overhang.'
          ],
          onSuccess: {
            emitTags: ['pitched_camp_tent']
          }
        },
        {
          text: 'Press onward through the dark forest without stopping to rest',
          complexity: 'basic',
          whisperTag: 'March // Travel Through Night',
          check: null,
          successStory: [
            'Tightening your belt and checking your weapon grip, you push forward into the dark canopy, leaving the potential campsite behind in favor of progress.'
          ],
          onSuccess: {
            emitTags: ['night_march', 'on_the_trail']
          }
        }
      ]
    },

    // NODE 2: INSIDE THE TENT (Chained via pitched_camp_tent)
    {
      id: 'scn_inside_tent_01',
      phase: 'EARLY_GAME',
      locationLabel: 'Inside the Rattan Tent',
      environment: 'CAMP',
      weather: 'DRIZZLE',
      timeOfDay: 'NIGHT',
      baseWeight: 0.1,
      intrinsicTags: ['safe_shelter', 'resting_node', 'camp_management'],
      // Forced Chaining: Triggers immediately when player chooses to camp
      affinityWeights: {
        pitched_camp_tent: 100.0
      },
      seamlessHooks: {
        default: 'Rain patters softly against the tight rattan roof of your tent. Inside, a small resin lamp casts a warm, flickering glow across your dry woven mat.'
      },
      prompt: [
        'Safe inside your makeshift shelter, the damp chill of the mountain forest is kept at bay. Here, you have a private moment to breathe, tend to injuries, or sleep.',
        'Outside, mountain gusts rustle the wet leaves, but inside the tent, you control your next move.'
      ],
      choices: [
        {
          text: 'Wrap yourself in your woven mat and sleep deeply until dawn',
          complexity: 'basic',
          whisperTag: 'Rest // Sleep Until Morning',
          check: null,
          successStory: [
            'You extinguish the resin lamp and drift into a deep, uninterrupted slumber.',
            'You wake up at the first golden rays of dawn completely restored, clear-headed, and energized for the journey ahead.'
          ],
          onSuccess: {
            hp: 6,
            heatDelta: -25,
            emitTags: ['well_rested', 'cleansed', 'clear_sky']
          }
        },
        {
          text: 'Turn your armor inside-out (baliktad) and apply Blessed Lana oil to your gear before resting',
          complexity: 'tactical',
          whisperTag: 'Folklore Prep // Inverted Armor and Wards',
          minInt: 10,
          check: null,
          successStory: [
            'You flip your garments inside-out (baliktad) to scramble spatial illusions and rub consecrated coconut oil along your armor seams and blade edges.',
            'Protected by these time-honored animist wards, you rest peacefully through the dark hours without fear of supernatural interference.'
          ],
          onSuccess: {
            hp: 4,
            heatDelta: -20,
            emitTags: ['clothing_inside_out', 'blessed_weapon', 'well_rested', 'clear_sky']
          }
        },
        {
          text: 'Scrub fresh blood and predator scent from your armor using collected rainwater and wood ash',
          complexity: 'tactical',
          whisperTag: 'Decontamination // Mask Trail Scent',
          check: { stat: 'DEX', dc: 11 },
          successStory: [
            'Using collected rainwater and ash from your resin burner, you scour every trace of viscera and dried blood from your cuirass and boots.',
            'The telltale scent trail that would have guided nocturnal prowlers to your campsite is completely neutralized, allowing you to rest in stealth.'
          ],
          failStory: [
            'Working hastily in the dim light, you smudge the dried gore across your leather sleeves rather than cleaning it. Outside in the darkness, twigs snap as nocturnal scavengers catch the iron scent of fresh blood!'
          ],
          onSuccess: {
            heatDelta: -20,
            emitTags: ['scent_masked', 'steady_nerves']
          },
          onFail: {
            heatDelta: 25,
            emitTags: ['bloodied_gear', 'nocturnal_camp_ambush', 'panicked']
          }
        },
        {
          text: 'Break camp early and slip back onto the trail before midnight',
          complexity: 'basic',
          whisperTag: 'Travel // Pack Up Shelter',
          check: null,
          successStory: [
            'Deciding not to linger in one location long enough for predators to track your position, you roll up your rattan shelter, douse the resin lamp, and quietly step back onto the winding trail.'
          ],
          onSuccess: {
            emitTags: ['on_the_trail', 'cautious']
          }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstoryPlayerCamping);

