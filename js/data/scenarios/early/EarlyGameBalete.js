/**
 * EarlyGameBalete.js
 * Registers EARLY_GAME Substory 02: "The Whispering Balete of Sitio Malungkot"
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

export const SubstoryEarlyBalete = {
  substoryId: 'sub_early_02_whispering_balete',
  mainLoopId: 'loop_eclipse_bakunawa',
  phase: 'EARLY_GAME',
  internalName: 'The Whispering Balete of Sitio Malungkot',
  targetScenarioCount: 5,
  scenarios: [
    {
      id: 'scn_balete_01',
      phase: 'EARLY_GAME',
      creatureId: 'wakwak',
      locationLabel: 'Silent Belfry of Sitio Malungkot',
      environment: 'BALETE',
      weather: 'SPIRIT FOG',
      timeOfDay: 'DUSK',
      baseWeight: 1.4,
      intrinsicTags: ['fog_gathering', 'silent_village'],
      affinityWeights: {
        fog_gathering: 2.5,
        cautious: 1.5
      },
      seamlessHooks: {
        entering_deep_forest:
          'The trail climbs steeply through creaking bamboo thickets until the monstrous silhouette of an ancient Balete swallows the twilight sky.',
        from_coastal_marsh:
          'Leaving the brackish mud and salt-pans behind, the ground beneath your sandals firms into volcanic loam as you ascend toward the mountain barrio.',
        dusk_falling:
          'The dying glow of dusk bleeds across the mountain spine, casting long, twisted shadows between the silent nipa huts of Sitio Malungkot.',
        spirit_fog_rising:
          'Cold spirit-mist rises from the mossy ditches, funnels between the barred stilt-huts, and gathers around the roots of the silent belfry.',
        raining:
          'Leaving the coastal marsh behind, the steady rain thins into a cold evening drizzle as you climb the slick stone steps into Sitio Malungkot.',
        clear_sky:
          'As dusk settles, the open sky vanishes behind the sprawling canopy of an ancient strangler fig towering over a silent mountain barrio.',
        default:
          'You enter the central square of Sitio Malungkot at the hour of the evening Angelus, yet the stone belfry hangs mute.'
      },
      passive: {
        stat: 'WIS',
        dc: 14,
        success:
          'You recognize the acoustically inverted call of a Kikik bird scout: because its cry is a faint whisper, the vampiric predator is perched directly overhead! Shouting "Adi an asin!" with coarse salt or tracking the stench of fermented oil will expose the threat.',
        fail:
          'Hearing only a faint whisper above, you assume the nocturnal predator is still leagues away.'
      },
      prompt: [
        'At the center of the plaza stands a colossal Balete tree, its aerial roots hanging like petrified pythons in the gloom. Directly above your head, a giant-winged Wakwak emissary clings to the belfry eaves with its razor beak poised.',
        'From the thatch roof of the midwife house to the east comes the slow, leathery rustle of the severed horror, the torso-severing Manananggal that the Wakwak scouts for.'
      ],
      choices: [
        {
          text: 'Strike the roof ridge with your Bagacay Bamboo Spear or Buntot Pagi whip to drive the stalkers into the light',
          requiredTag: 'aswang_bane',
          itemActionTag: 'Equipped // Aswang-Bane Weapon',
          complexity: 'tactical',
          minInt: 10,
          check: null,
          successStory: [
            'The high-frequency resonance of your Aswang-warded weapon cracks against the rafters! Both the Wakwak scout and the winged Manananggal shriek in agony, dropping a cluster of piloncitos as they retreat toward the giant Balete.'
          ],
          onSuccess: {
            piloncitos: 5,
            addItem: 'rattan_staff',
            discoverCreature: ['wakwak', 'manananggal'],
            emitTags: ['wounded_manananggal', 'clear_sky']
          }
        },
        {
          text: 'Fling Coarse Sea Salt directly into the dark eave overhead to blind the perched Wakwak before it strikes',
          passiveRequirement: { stat: 'WIS', dc: 12 },
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'DEX', dc: 12 },
          allowedConsumables: ['coarse_salt_pouch', 'blessed_lana_vial'],
          consumableEffect: {
            coarse_salt_pouch: {
              bonusModifier: 3,
              consumeQuantity: 1,
              narrative:
                'You fling coarse salt into the rafters, scorching the Wakwak feathers.'
            },
            blessed_lana_vial: {
              autoSuccess: true,
              consumeQuantity: 1,
              narrative:
                'Consecrated coconut oil ignites against the rafters, putting the demon bird to flight.'
            }
          },
          successStory: [
            'Alerted by your keen perception of the inverted acoustic whisper, you fling a fistful of coarse sea salt straight into the belfry rafters! The Wakwak screeches in agony as the salt burns its feathers, tumbling from the eave and fleeing into the storm!'
          ],
          failStory: [
            'Your throw grazes the eave, and though the salt startles the Wakwak into flight, its beak rakes your arm as it escapes.'
          ],
          onSuccess: {
            piloncitos: 5,
            heatDelta: -15,
            discoverCreature: 'wakwak',
            emitTags: ['wounded_manananggal', 'clear_sky']
          },
          onFail: {
            hp: -2,
            heatDelta: 5,
            emitTags: ['wounded', 'raining']
          }
        },
        {
          text: 'Interpret the Wakwak inverted acoustic call and shout "Adi an asin!" while flinging coarse salt upward',
          passiveRequirement: { stat: 'WIS', dc: 13 },
          complexity: 'clever',
          minInt: 11,
          check: { stat: 'WIS', dc: 14 },
          loud: true,
          allowedConsumables: ['coarse_salt_pouch', 'blessed_lana_vial'],
          consumableEffect: {
            coarse_salt_pouch: {
              bonusModifier: 3,
              consumeQuantity: 1,
              narrative: 'Coarse salt burns the eave, doubling the effectiveness of your shout.'
            },
            blessed_lana_vial: {
              autoSuccess: true,
              consumeQuantity: 1,
              narrative: 'Blessed oil creates a burst of spiritual flame that scatters the flock.'
            }
          },
          successStory: [
            'Refusing to be fooled by its whispered call, you hurl a handful of coarse sea salt straight overhead and shout "Adi an asin!" Blinded and warded off by the salt announcement, the Wakwak screeches and flees the rooftops!'
          ],
          failStory: [
            'Misjudging the inverted acoustic distance, you look toward the far trees just as the Wakwak dives from directly overhead, raking your scalp with its hooked talons!'
          ],
          onSuccess: {
            heatDelta: 10,
            piloncitos: 6,
            addItem: 'coarse_salt_pouch',
            discoverCreature: 'wakwak',
            emitTags: ['wounded_manananggal', 'high_ground']
          },
          onFail: {
            hp: -3,
            heatDelta: 20,
            applyCondition: { id: 'bleeding_wound', bodyPart: 'Scalp / Forearm' },
            emitTags: ['wounded', 'raining']
          }
        },
        {
          text: 'Track the sour stench of fermented coconut oil and severed viscera to pinpoint where the Manananggal concealed its lower torso',
          passiveRequirement: { stat: 'WIS', dc: 12 },
          complexity: 'advanced',
          minInt: 12,
          check: { stat: 'INT', dc: 15 },
          successStory: [
            'Relying on keen deduction and sharp tracking, you follow the sour trail of fermented coconut oil, vinegar, and snapped saringsing bamboo deep into the buttress roots, discovering where the Manananggal concealed its severed lower waist!'
          ],
          failStory: [
            'The pungent stench of fermented oil and spoiled viscera overwhelms your senses in the dark; you lose the trail as cold claws scrape near your ear!'
          ],
          onSuccess: {
            piloncitos: 6,
            addItem: 'anting_anting_brass_pendant',
            discoverCreature: 'manananggal',
            emitTags: ['found_hidden_torso', 'steady_nerves']
          },
          onFail: { hp: -3, emitTags: ['wounded', 'fog_gathering'] }
        },
        {
          text: 'Murmur "Tabi-tabi po" into the darkness to plead for safe passage past the roof-stalkers',
          complexity: 'basic',
          autoFail: true,
          folkloreTag: 'Animist Etiquette // Tabi-tabi po',
          failureTag: 'Ineffective Folklore',
          failStory: [
            'A blood-chilling shriek of mocking laughter answers from the belfry roof: flesh-eating Aswang and vampiric night-scouts hold zero reverence for animist etiquette! Polite apologies ("Tabi-tabi po") only work on earth and nature spirits, not monsters of the blood! Before you can raise your guard, the Wakwak dives, raking your shoulder with filthy talons!'
          ],
          onFail: {
            hp: -3,
            heatDelta: 15,
            emitTags: ['wounded', 'raining']
          }
        },
        {
          text: 'Crouch under the overhanging belfry roof-eaves with weapon drawn and wait in silence',
          complexity: 'basic',
          check: null,
          successStory: [
            'Huddling in the deep shadow beneath the wooden eaves, you keep your breath still until the leathery rustling on the roof shifts toward the eastern edge of the village.'
          ],
          onSuccess: { emitTags: ['cautious', 'steady_nerves'] }
        }
      ]
    },
    {
      id: 'scn_balete_02',
      phase: 'EARLY_GAME',
      creatureId: 'manananggal',
      locationLabel: 'The Midwife Barred Nipa House',
      environment: 'CABIN',
      weather: 'DRIZZLE',
      timeOfDay: 'NIGHT',
      baseWeight: 1.2,
      intrinsicTags: ['night_hunt', 'severed_torso', 'aerial_hunter', 'proboscis'],
      affinityWeights: {
        wounded_manananggal: 3.0,
        cautious: 1.5
      },
      seamlessHooks: {
        dusk_falling:
          'The last violet rays of sunset fade behind the palm ridges, bathing the bamboo walls of the midwife house in eerie shadows.',
        midnight_darkness:
          'Deep night settles across the deserted mountain barrio, leaving only the faint, comforting scent of smoldering coconut husks beneath the stilt-posts.',
        entering_deep_forest:
          'Stepping into the heavy shadow of the colossal banyan tree, the air turns thick with the musky scent of bat droppings and fermented palm sap.',
        spirit_fog_rising:
          'A shutter cracks open through the swirling spirit-mist, revealing the pale, terrified face of the midwife apprentice.',
        raining:
          'Rain patters against the woven sawali walls as a frightened whisper calls to you from behind a shutter.',
        default:
          'You duck under the low eaves of the midwife stilt-house where braided garlic and marurugi thorns hang from every beam.'
      },
      passive: {
        stat: 'WIS',
        dc: 14,
        success:
          'A long, hollow proboscis tongue is already probing silently through a gap in the nipa thatch directly above the boy, while a faint Wakwak whisper echoes on the ridgepole!',
        fail:
          'The shadows in the rafters seem to sway even though there is no draft inside.'
      },
      prompt: [
        'Inside the warmly lit Bahay Kubo, young Lito clutches a mortar of coarse sea salt, crushed garlic, and sharpened Bagacay bamboo stakes. "It is an Anananggal, a Manananggal that leaves its legs behind," he whispers hoarsely by the crackling hearth. "Not a Layog. This one hid its lower half somewhere near."',
        'Overhead, the bamboo ridgepole groans under the weight of the viscera-trailing nightmare as its hollow tongue searches for a sleeper.'
      ],
      choices: [
        {
          text: 'Thrust your burning Resin Torch straight into the thatch gap to sear the probing proboscis',
          requiredTag: 'has_light_source',
          itemActionTag: 'Equipped // Resin Torch',
          complexity: 'tactical',
          minInt: 10,
          check: null,
          successStory: [
            'Boiling sahing resin blisters the Manananggal hollow tongue! It recoils with a deafening screech, tangling its trailing viscera in the marurugi thorns outside while Lito hands you a Vial of Blessed Lana Oil.'
          ],
          onSuccess: {
            addItem: 'blessed_lana_vial',
            discoverCreature: 'manananggal',
            emitTags: ['wounded_manananggal', 'helped_lito']
          }
        },
        {
          text: 'Quickly seal the roof gaps with saringsing bamboo and marurugi thorns before the fiend descends',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'DEX', dc: 13 },
          successStory: [
            'Moving with nimble precision, you wedge thorny marurugi branches and saringsing bamboo into every thatch gap! Snagged by its trailing entrails, the Manananggal shrieks and retreats toward the Balete tree.'
          ],
          failStory: [
            'Before you can lash the final thorn bundle, a razor talon punches through the thatch and gashes your forearm!'
          ],
          onSuccess: {
            piloncitos: 5,
            addItem: 'salakot_hat',
            discoverCreature: 'manananggal',
            emitTags: ['wounded_manananggal', 'helped_lito']
          },
          onFail: { hp: -3, emitTags: ['wounded', 'raining'] }
        },
        {
          text: 'Drive a sharpened Bagacay bamboo spear upward through the rafters into its flying torso',
          complexity: 'basic',
          check: { stat: 'STR', dc: 14 },
          successStory: [
            'With a mighty upward heave, the sharpened Bagacay bamboo pierces the roof thatch and emits a high-frequency whistle as it strikes the Manananggal! The wounded fiend crashes off the roof and flees toward its hidden lower half.'
          ],
          failStory: [
            'The creature slams through the rotten thatch, raking your shoulder with iron-hard talons before flapping back into the night!'
          ],
          onSuccess: {
            piloncitos: 5,
            addItem: 'bagacay_bamboo_spear',
            discoverCreature: 'manananggal',
            emitTags: ['wounded_manananggal', 'helped_lito']
          },
          onFail: { hp: -4, emitTags: ['wounded', 'raining'] }
        }
      ]
    },
    {
      id: 'scn_balete_03',
      phase: 'EARLY_GAME',
      creatureId: 'manananggal',
      locationLabel: 'Cavern of the Strangler Roots',
      environment: 'BALETE',
      weather: 'SPIRIT FOG',
      timeOfDay: 'NIGHT',
      baseWeight: 1.1,
      intrinsicTags: ['balete_heart'],
      affinityWeights: {
        found_hidden_torso: 3.5,
        wounded_manananggal: 2.5
      },
      seamlessHooks: {
        entering_deep_forest:
          'Leaving the stilt-houses behind, the jungle floor plunges beneath the labyrinthine boughs of the colossal strangler fig, where the air turns damp with the scent of crushed wild ginger.',
        midnight_darkness:
          'The silence of midnight settles over Sitio Malungkot, shrouding the ancient Balete in ink-black shadows as nocturnal predators take wing.',
        spirit_fog_rising:
          'Phosphorescent spirit-mist pools knee-deep around the massive buttress roots, drifting like unquiet breath through the hollows.',
        raining:
          'Heavy raindrops patter against the waxy canopy high above, while down below among the knotted roots only a damp, sepulchral chill remains.',
        default:
          'At the stroke of midnight, the aerial roots of the giant Balete part like a ribcage, revealing the damp hollow beneath the plaza.'
      },
      passive: {
        stat: 'INT',
        dc: 15,
        success:
          'Tracing the trajectory of the flying torso and the scent of fermented coconut oil, you locate the severed lower waist of the Anananggal hidden among the buttress roots!',
        fail:
          'The stench of copper and crushed night-jasmine makes your head spin in the confined dark.'
      },
      prompt: [
        'Inside the root-cavern of the ancient Balete, bundles of stolen village heirlooms lie tangled in bone-white roots alongside the motionless lower torso of the Manananggal matriarch.',
        'Above the canopy, leathery wings beat furiously as the viscera-trailing nightmare races back to rejoin its vulnerable half before sunrise.'
      ],
      choices: [
        {
          text: 'Pour Blessed Lana Oil, coarse salt, and volcanic ash over the severed waist to prevent re-attachment',
          requiredItem: 'blessed_lana_vial',
          itemActionTag: 'Item // Vial of Blessed Lana',
          complexity: 'tactical',
          minInt: 10,
          check: null,
          successStory: [
            'Blue flame races across the hollow waist as the blessed oil, coarse salt, and ash take hold! Unable to rejoin its lower half, the matriarch lets out a death-rattle above the canopy.'
          ],
          onSuccess: {
            removeItem: 'blessed_lana_vial',
            piloncitos: 8,
            addItem: 'brass_vambraces',
            discoverCreature: 'manananggal',
            emitTags: ['destroyed_manananggal_torso', 'clear_sky', 'salt_ward']
          }
        },
        {
          text: 'Scatter coarse salt, crushed garlic, and volcanic ash across the severed torso while holding off the roots',
          passiveRequirement: { stat: 'INT', dc: 14 },
          complexity: 'advanced',
          minInt: 12,
          check: { stat: 'INT', dc: 15 },
          successStory: [
            'Applying the exact folkloric ward of coarse salt, crushed garlic, and ash across the exposed waist, you permanently seal the severed torso against re-attachment before scrambling out of the root-cage!'
          ],
          failStory: [
            'Black ichor sprays from the roots as you pack the salt, searing your forearms before you retreat into the square!'
          ],
          onSuccess: {
            piloncitos: 6,
            addItem: 'hemp_utility_belt',
            discoverCreature: 'manananggal',
            emitTags: ['destroyed_manananggal_torso', 'salt_ward']
          },
          onFail: { hp: -4, emitTags: ['wounded', 'spirit_hexed'] }
        },
        {
          text: 'Smash the tangled root-lattices with brute force to shatter the wooden cage',
          complexity: 'basic',
          check: { stat: 'STR', dc: 13 },
          successStory: [
            'Heaving with all your strength against the petrified root-weave, you crack open a gap wide enough to scatter the stolen relics and disrupt the matriarch sanctuary before scrambling clear!'
          ],
          failStory: [
            'The strangler roots whip like barbed whips, bruising your shoulders before you extract yourself from the hollow!'
          ],
          onSuccess: {
            piloncitos: 5,
            discoverCreature: 'manananggal',
            emitTags: ['destroyed_manananggal_torso', 'steady_nerves']
          },
          onFail: { hp: -3, emitTags: ['wounded', 'fog_gathering'] }
        }
      ]
    },
    {
      id: 'scn_balete_04',
      phase: 'EARLY_GAME',
      minLevel: 2,
      creatureId: 'aswang',
      locationLabel: 'The Toll Before Dawn',
      environment: 'BALETE',
      weather: 'CLEAR',
      timeOfDay: 'DAWN',
      baseWeight: 0.9,
      ambush: true,
      pressureTimer: 5000,
      reactionTimer: 5,
      intrinsicTags: ['dawn_approaching', 'night_stalker', 'flesh_hunter'],
      affinityWeights: {
        destroyed_manananggal_torso: 4.0,
        wounded_manananggal: 2.5
      },
      seamlessHooks: {
        dawn_break:
          'The indigo veil of night begins to crack over the eastern mountain spires, revealing the dew-soaked plaza as roosters crow in distant barrios.',
        spirit_fog_rising:
          'Cold spirit-mist swirls across the bloodied flagstones as the mountain chill deepens before the first rays of sunrise.',
        raining:
          'Drizzle slants across the courtyard tiles, washing away the foul stench of sulfur and burning tallow as morning nears.',
        entering_deep_forest:
          'Emerging from the strangler roots back into the open square, the damp earth beneath your sandals trembles with impending dawn.',
        default:
          'A faint indigo line of pre-dawn light touches the eastern ridge as the winged Manananggal and a pack of feral Aswang make their final desperate lunge across the plaza.'
      },
      passive: {
        stat: 'CON',
        dc: 15,
        success:
          'Your constitution resists the bloodborne Aswang miasma, and you spot how the creatures recoil from the morning light and sharpened Bagacay bamboo.',
        fail:
          'The chill wind before sunrise and the scent of bloodied claws numb your fingers on your weapon grip.'
      },
      prompt: [
        'With morning only heartbeats away, the shrieking Manananggal matriarch and a black-hound Ungo stalker lunge across the flagstones of Sitio Malungkot, drawn by the scent of battle.',
        'Villagers peer from behind their barred shutters, waiting to see if you can survive the ambush until the first sunbeams strike the square.'
      ],
      choices: [
        {
          text: 'Evade the sudden nocturnal ambush and pin the horrors in the open until sunbeams strike at dawn',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'DEX', dc: 14 },
          successStory: [
            'Sidestepping the feral Ungo lunge with razor-sharp agility, you pin the severed Manananggal in the open plaza until the first golden lance of sunrise reduces it to harmless gray ash!'
          ],
          failStory: [
            'A bloodied claw grazes your ribs in the frantic pre-dawn clash before the rising sunlight finally forces the stalkers to burn and scatter!'
          ],
          onSuccess: {
            piloncitos: 10,
            addItem: ['herbal_poultice', 'kampilan_sword'],
            discoverCreature: ['aswang', 'manananggal'],
            emitTags: ['clear_sky', 'slain_matriarch']
          },
          onFail: {
            hp: -3,
            emitTags: ['wounded', 'slain_matriarch']
          }
        },
        {
          text: 'Brace with a Bagacay bamboo stake and resist the dark infection of their frenzied assault',
          complexity: 'basic',
          check: { stat: 'CON', dc: 15 },
          successStory: [
            'Withstanding the foul breath and venomous claws without yielding an inch, you drive the sharpened Bagacay stake home as dawn breaks over the belfry!'
          ],
          failStory: [
            'The psychic and physical strain of the bloodied clash leaves you feverish, though the sunrise destroys the winged matriarch.'
          ],
          onSuccess: {
            piloncitos: 10,
            addItem: ['herbal_poultice', 'carabao_hide_cuirass'],
            discoverCreature: ['aswang', 'manananggal'],
            emitTags: ['clear_sky', 'slain_matriarch']
          },
          onFail: {
            hp: -4,
            applyStatus: 'InfectedBite',
            spiritScent: 15,
            applyCondition: { id: 'infected_aswang_bite', bodyPart: 'Ribs / Shoulder' },
            emitTags: ['wounded', 'slain_matriarch']
          }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstoryEarlyBalete);

