/**
 * js/data/scenarios/early/EarlyGameMerchantRescue.js
 * Multi-stage, chained scenario sequence in the flooded mangrove roots:
 * - Node 1 (Combat/Encounter): Drive off backward-walking Sigbin hounds assaulting a trapped merchant.
 * - Node 2 (Dialogue/Intel Hub): Interactive post-encounter conversation with Mang Tasyo.
 *   Provides options to learn hidden locations, unlock creature codex intel, barter for herbs,
 *   or betray the NPC for illicit gold and faction enmity.
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

export const SubstoryMerchantRescue = {
  substoryId: 'sub_early_merchant_rescue',
  mainLoopId: 'loop_human_intrigue',
  phase: 'EARLY_GAME',
  internalName: 'The Stranded Merchant of Bakawan',
  targetScenarioCount: 2,
  scenarios: [
    {
      id: 'scn_rescue_01_combat',
      phase: 'EARLY_GAME',
      creatureId: 'sigbin',
      locationLabel: 'Flooded Mangrove Roots',
      environment: 'MANGROVE',
      weather: 'DRIZZLE',
      timeOfDay: 'DUSK',
      baseWeight: 1.2,
      intrinsicTags: ['mangrove_swamp', 'distress_call', 'night_stalker'],
      affinityWeights: {
        muddy_ground: 2.0,
        raining: 1.5
      },
      seamlessHooks: {
        default: 'Through the tangled stilt-roots of the brackish mangrove, frantic cries echo above the low growls of backward-walking shadow hounds.'
      },
      passive: {
        stat: 'WIS',
        dc: 12,
        success:
          'Your keen ears pick out the unnatural, reversed footfalls of two Sigbin hounds circling a stranded traveler clinging to an aerial root.',
        fail:
          'You wade knee-deep into the black mud right as two feral silhouettes turn their glowing red eyes upon your approach.'
      },
      prompt: [
        'A traveling merchant clutches a heavy rattan pack against his chest as two backward-walking Sigbin hounds snap at his heels with saliva-slick fangs.',
        '"Tulong! By the Anito, drive these shadow-beasts off and I will share my trade secrets!" he cries out, his knuckles white against the slippery bark.'
      ],
      choices: [
        {
          text: 'Thrust with a Bagacay Bamboo Spear or melee weapon to impale the lunging hound',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'DEX', dc: 13 },
          allowedConsumables: ['coarse_salt_pouch', 'blessed_lana_vial'],
          consumableEffect: {
            coarse_salt_pouch: {
              bonusModifier: 3,
              consumeQuantity: 1,
              narrative: 'You fling coarse sea salt onto your spear tip, burning the shadow-hound with holy sting.'
            },
            blessed_lana_vial: {
              autoSuccess: true,
              consumeQuantity: 1,
              narrative: 'Consecrated coconut oil flares along the weapon shaft, terrifying the dark cryptids into instant retreat.'
            }
          },
          successStory: [
            'Leaping across the submerged stilt-roots with razor-sharp balance, you drive your weapon deep into the flanking hound!',
            'The creature emits a horrific, bird-like screech as black ichor spatters the brackish tide, prompting the pair to turn tail and vanish into the shadowy delta.'
          ],
          failStory: [
            'You charge forward and drive the pack back, but the second hound snaps viciously at your calf before slipping into the deep mangrove channels!'
          ],
          onSuccess: {
            remnants: 5,
            emitTags: ['rescued_merchant_lito', 'clear_sky', 'steady_nerves']
          },
          onFail: {
            hp: -3,
            applyStatus: 'InfectedBite',
            applyCondition: { id: 'infected_aswang_bite', bodyPart: 'Calf / Ankle' },
            emitTags: ['rescued_merchant_lito', 'wounded']
          }
        },
        {
          text: 'Fling a burning torch and shout an ancestral war cry to frighten the shadow pack into the mire',
          complexity: 'basic',
          check: { stat: 'STR', dc: 12 },
          successStory: [
            'Swinging the blazing brand in wide, roaring arcs, you bellow a fierce challenge across the water!',
            'Intimidated by the dancing embers and raw aggression, the Sigbin hounds whine and bound backward into the dense nipa palms, abandoning their quarry.'
          ],
          failStory: [
            'The splashing brackish water douses your flame! You manage to drag the merchant up into the roots, but not before a shadow claw rakes across your shoulder.'
          ],
          onSuccess: {
            remnants: 4,
            emitTags: ['rescued_merchant_lito', 'clear_sky']
          },
          onFail: {
            hp: -2,
            emitTags: ['rescued_merchant_lito', 'wounded']
          }
        },
        {
          text: 'Toss coarse sea salt and garlic husks across the brackish pool to invoke ancient folklore wards',
          complexity: 'tactical',
          requiredTag: 'aswang_ward',
          folkloreTag: 'Folklore Ward // Salt and Garlic Barrier',
          check: { stat: 'WIS', dc: 11 },
          successStory: [
            'You scatter the pungent wards across the water surface! The mineral sting and consecrated garlic hiss against the supernatural mist, forcing the hounds to choke and flee in agony.'
          ],
          failStory: [
            'A sudden gust disperses the salt powder too thin, though the burning scent buys you enough time to pull the terrified merchant to safety.'
          ],
          onSuccess: {
            remnants: 5,
            emitTags: ['rescued_merchant_lito', 'salt_ward']
          },
          onFail: {
            hp: -1,
            emitTags: ['rescued_merchant_lito', 'fog_gathering']
          }
        }
      ]
    },
    {
      id: 'scn_rescue_02_dialogue',
      phase: 'EARLY_GAME',
      locationLabel: 'Sheltered Mangrove Outcrop',
      environment: 'MANGROVE',
      weather: 'CLEAR',
      timeOfDay: 'DUSK',
      baseWeight: 0.1,
      intrinsicTags: ['human_interaction', 'intel_gathering', 'peaceful_encounter'],
      // Immediate deterministic chaining: triggers right after scn_rescue_01
      affinityWeights: {
        rescued_merchant_lito: 100.0
      },
      seamlessHooks: {
        default: 'With the Sigbin hounds driven off into the murky depths, the merchant catches his breath on a dry limestone shelf and wrings out his embroidered tunic.'
      },
      prompt: [
        'The merchant bows low, touching his forehead with open palms in reverent pre-colonial gratitude.',
        '"Salamat, brave traveler! I am Mang Tasyo, a licensed goods-bearer from Datu Dula\'s fortified Kota. Those backward-walking hell-hounds nearly tore through my trade rattan."',
        '"Ask what you will: I know the hidden waterway passes through these swamps, the roosts of nocturnal monsters, and whose word carries weight inside Kota Dula."'
      ],
      choices: [
        {
          text: 'Inquire about secret waterways, hidden locations, and safe paths to Kota Dula',
          complexity: 'tactical',
          whisperTag: 'Cartography // Secret Mangrove Channels',
          check: { stat: 'WIS', dc: 10 },
          successStory: [
            'Mang Tasyo unrolls a oiled goat-hide chart marked with charcoal glyphs. "Heed this well: downstream to the southeast sits Kota Dula\'s palisade gate. Tell the guard-chief Bagani that Tasyo the potter sent you, and they will grant you free entry without taxation."',
            '"Furthermore, if you follow the white-flowered mangroves inland, you will reach the Hidden Salt Flats, where the winged viscera hunters cache their lower waists before nightfall."'
          ],
          failStory: [
            'Mang Tasyo sketches hasty landmarks in the sand. "My hand trembles from the adrenaline, but follow the ebb-tide downriver and speak my name at the Kota ramparts to secure safe harbor."'
          ],
          onSuccess: {
            discoverLocation: 'loc_hidden_salt_flats',
            emitTags: [
              'unlocked_location_salt_flats',
              'knows_kota_dula_gatecode',
              'rep_rajahnate_trusted'
            ]
          },
          onFail: {
            emitTags: ['knows_kota_dula_gatecode', 'rep_rajahnate_trusted']
          }
        },
        {
          text: 'Ask what manner of beast those hounds were and inquire about other regional monstrosities',
          complexity: 'advanced',
          whisperTag: 'Bestiary Lore // Sigbin and Night Roosts',
          check: { stat: 'INT', dc: 11 },
          successStory: [
            'The merchant shivers, speaking in hushed tones: "Those were Sigbin: horn-headed, backward-walking familiars kept by elder Aswang clans. They scout for fresh blood and harvest shadows for their masters."',
            '"If you travel deeper into the mangrove eaves after nightfall, watch the bamboo ridges: a colony of winged Manananggal nests in the dead ironwood canopy. Carry coarse sea salt at all times."'
          ],
          failStory: [
            'Mang Tasyo looks anxiously over his shoulder. "They call them Sigbin, beasts born of blood-oaths with darkness. Keep your blade ready and your fires bright."'
          ],
          onSuccess: {
            discoverCreature: ['sigbin', 'manananggal'],
            directLearning: true,
            emitTags: ['knows_aswang_nest', 'sigbin_lore_revealed', 'rep_rajahnate_trusted']
          },
          onFail: {
            discoverCreature: 'sigbin',
            directLearning: true,
            emitTags: ['sigbin_lore_revealed']
          }
        },
        {
          text: 'Ask if he has restorative salves or protective herbal charms to barter for your aid',
          complexity: 'tactical',
          whisperTag: 'Barter // Consecrated Trade Wares',
          check: { stat: 'CHA', dc: 11 },
          successStory: [
            'Overcome with gratitude, Mang Tasyo opens a woven cedar case nestled inside his pack. "You risked your life for a stranger. Take these gifts of our artisans."',
            'He presents a bundle of crushed Bayabas leaves to soothe septic wounds and a consecrated vial of Blessed Lana Oil to repel nocturnal curses, along with a purse of polished Piloncitos.'
          ],
          failStory: [
            'Mang Tasyo bows apologetically. "My rarest porcelain broke in the scramble, but please take this pouch of medicinal herbs and what modest coins I can spare."'
          ],
          onSuccess: {
            addItem: ['bayabas_herbs', 'blessed_lana_vial'],
            remnants: 8,
            emitTags: ['rep_rajahnate_trusted', 'tasyo_trade_ally']
          },
          onFail: {
            addItem: 'bayabas_herbs',
            remnants: 4,
            emitTags: ['rep_rajahnate_trusted']
          }
        },
        {
          text: '[Hostile] Threaten the exhausted merchant and seize his trade pack for yourself',
          complexity: 'basic',
          whisperTag: 'Outlaw Ambush // Plunder and Betrayal',
          check: { stat: 'STR', dc: 12 },
          successStory: [
            'You bare your blade and step into his path with cold, demanding eyes. Paralyzed by betrayal, Mang Tasyo drops his woven pack and scrambles backward into the mangrove mud, his face pale with horror.',
            '"Treacherous brigand! The Bagani of Kota Dula will place your head on a bamboo pike for this!" he shrieks before vanishing into the winding waterways.',
            'You pry open the pack, finding a hoard of gold Piloncitos, sea salt, and brass trinkets.'
          ],
          failStory: [
            'As you draw your weapon, Mang Tasyo anticipates the strike and flings a fistful of blinding lime dust straight into your eyes! He slips into the stilt-roots while you stumble blindly in the mire.'
          ],
          onSuccess: {
            remnants: 25,
            addItem: ['coarse_salt_pouch', 'triangle_brass_pendant'],
            emitTags: [
              'rep_rajahnate_enemy',
              'robbed_merchant',
              'wanted_bounty',
              'blood_on_the_marsh'
            ]
          },
          onFail: {
            hp: -2,
            applyStatus: 'Blinded',
            emitTags: ['rep_rajahnate_enemy', 'blinded_temp']
          }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstoryMerchantRescue);

