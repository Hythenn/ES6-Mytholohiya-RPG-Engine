/**
 * EarlyGameBalete.js
 * Registers EARLY_GAME Substory 02: "The Whispering Balete of Sitio Malungkot"
 */

import { NarrativeRegistry } from '../../narrative/NarrativeDirector.js';

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
      locationLabel: 'Silent Belfry of Sitio Malungkot',
      weather: 'SPIRIT FOG',
      timeOfDay: 'DUSK',
      baseWeight: 1.4,
      intrinsicTags: ['fog_gathering', 'silent_village'],
      affinityWeights: {
        fog_gathering: 2.5,
        cautious: 1.5
      },
      seamlessHooks: {
        raining:
          'Leaving the coastal marsh behind, the rain thins into a cold evening mist as you climb the stone steps into Sitio Malungkot.',
        clear_sky:
          'As dusk settles, the open sky vanishes behind the sprawling canopy of an ancient strangler fig towering over a silent mountain barrio.',
        fog_gathering:
          'The spirit-mist funnels you directly between the barred nipa huts of Sitio Malungkot.',
        default:
          'You enter the central square of Sitio Malungkot at the hour of the evening Angelus, yet the stone belfry hangs mute.'
      },
      passive: {
        stat: 'WIS',
        dc: 14,
        success:
          'You recognize the acoustically inverted call of a Wakwak (Kikik) scout: because its cry is a faint whisper, the vampiric bird is perched directly overhead! Shouting "Adi an asin!" with coarse salt or honoring the Dalakitnon Balete wardens will expose the threat.',
        fail:
          'Hearing only a faint "kikik" whisper above, you assume the nocturnal predator is still leagues away.'
      },
      prompt: [
        'At the center of the plaza stands a colossal Balete tree inhabited by watchful Engkanto and Dalakitnon wardens, its aerial roots hanging like petrified pythons. Directly above your head, a giant-winged Wakwak emissary clings to the belfry eaves with its razor beak poised.',
        'From the thatch roof of the midwife house to the east comes the slow, leathery rustle of the Anananggal, the torso-severing Manananggal that the Wakwak scouts for.'
      ],
      choices: [
        {
          text: 'Strike the roof ridge with your Bagacay Bamboo Spear or Buntot Pagi whip to drive the stalkers into the light',
          requiredTag: 'aswang_bane',
          itemActionTag: 'Equipped // Aswang-Bane Weapon',
          check: null,
          successStory: [
            'The high-frequency resonance of your Aswang-warded weapon cracks against the rafters! Both the Wakwak scout and the winged Manananggal shriek in agony, dropping a cluster of remnants as they retreat toward the giant Balete.'
          ],
          onSuccess: {
            remnants: 4,
            emitTags: ['wounded_manananggal', 'clear_sky']
          }
        },
        {
          text: 'Interpret the Wakwak inverted acoustic call and shout "Adi an asin!" while flinging coarse salt upward',
          check: { stat: 'WIS', dc: 14 },
          successStory: [
            'Refusing to be fooled by its whispered call, you hurl a handful of coarse sea salt straight overhead and shout "Adi an asin!" Blinded and warded off by the salt announcement, the Wakwak screeches and flees the rooftops!'
          ],
          failStory: [
            'Misjudging the inverted acoustic distance, you look toward the far trees just as the Wakwak dives from directly overhead, raking your scalp with its hooked talons!'
          ],
          onSuccess: { emitTags: ['wounded_manananggal', 'high_ground'] },
          onFail: { hp: -3, emitTags: ['wounded', 'raining'] }
        },
        {
          text: 'Murmur "Tabi-tabi po" to the Balete Engkanto wardens and track where the Manananggal hid its lower torso',
          check: { stat: 'INT', dc: 15 },
          successStory: [
            'Honoring the ecological etiquette of the Dalakitnon spirits, you study the trail of fermented coconut oil and saringsing bamboo to pinpoint where the Manananggal concealed its severed lower waist inside the roots!'
          ],
          failStory: [
            'You brush against a sacred Balete root without proper supplication; a sudden wave of Engkanto fever slams into your chest!'
          ],
          onSuccess: { emitTags: ['found_hidden_torso', 'spirit_respect'] },
          onFail: { hp: -3, emitTags: ['spirit_hexed', 'fog_gathering'] }
        }
      ]
    },
    {
      id: 'scn_balete_02',
      phase: 'EARLY_GAME',
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
        raining:
          'Rain patters against the woven sawali walls as a frightened whisper calls to you from behind a shutter.',
        fog_gathering:
          'A shutter cracks open through the mist, revealing the pale face of the midwife young apprentice.',
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
          check: null,
          successStory: [
            'Boiling sahing resin blisters the Manananggal hollow tongue! It recoils with a deafening screech, tangling its trailing viscera in the marurugi thorns outside while Lito hands you a Vial of Blessed Lana Oil.'
          ],
          onSuccess: {
            addItem: 'blessed_lana_vial',
            emitTags: ['wounded_manananggal', 'helped_lito']
          }
        },
        {
          text: 'Quickly seal the roof gaps with saringsing bamboo and marurugi thorns before the fiend descends',
          check: { stat: 'DEX', dc: 13 },
          successStory: [
            'Moving with nimble precision, you wedge thorny marurugi branches and saringsing bamboo into every thatch gap! Snagged by its trailing entrails, the Manananggal shrieks and retreats toward the Balete tree.'
          ],
          failStory: [
            'Before you can lash the final thorn bundle, a razor talon punches through the thatch and gashes your forearm!'
          ],
          onSuccess: { emitTags: ['wounded_manananggal', 'helped_lito'] },
          onFail: { hp: -3, emitTags: ['wounded', 'raining'] }
        },
        {
          text: 'Drive a sharpened Bagacay bamboo spear upward through the rafters into its flying torso',
          check: { stat: 'STR', dc: 14 },
          successStory: [
            'With a mighty upward heave, the sharpened Bagacay bamboo pierces the roof thatch and emits a high-frequency whistle as it strikes the Manananggal! The wounded fiend crashes off the roof and flees toward its hidden lower half.'
          ],
          failStory: [
            'The creature slams through the rotten thatch, raking your shoulder with iron-hard talons before flapping back into the night!'
          ],
          onSuccess: { remnants: 4, emitTags: ['wounded_manananggal', 'helped_lito'] },
          onFail: { hp: -4, emitTags: ['wounded', 'raining'] }
        }
      ]
    },
    {
      id: 'scn_balete_03',
      phase: 'EARLY_GAME',
      locationLabel: 'Cavern of the Strangler Roots',
      weather: 'SPIRIT FOG',
      timeOfDay: 'MIDNIGHT',
      baseWeight: 1.1,
      intrinsicTags: ['balete_heart'],
      affinityWeights: {
        found_hidden_torso: 3.5,
        wounded_manananggal: 2.5
      },
      seamlessHooks: {
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
          check: null,
          successStory: [
            'Blue flame races across the hollow waist as the blessed oil, coarse salt, and ash take hold! Unable to rejoin its lower half, the matriarch lets out a death-rattle above the canopy.'
          ],
          onSuccess: {
            removeItem: 'blessed_lana_vial',
            remnants: 6,
            emitTags: ['destroyed_manananggal_torso', 'clear_sky', 'salt_ward']
          }
        },
        {
          text: 'Scatter coarse salt, crushed garlic, and volcanic ash across the severed torso while holding off the roots',
          check: { stat: 'INT', dc: 15 },
          successStory: [
            'Applying the exact folkloric ward of coarse salt, crushed garlic, and ash across the exposed waist, you permanently seal the severed torso against re-attachment before scrambling out of the root-cage!'
          ],
          failStory: [
            'Black ichor sprays from the roots as you pack the salt, searing your forearms before you retreat into the square!'
          ],
          onSuccess: { remnants: 5, emitTags: ['destroyed_manananggal_torso', 'salt_ward'] },
          onFail: { hp: -4, emitTags: ['wounded', 'spirit_hexed'] }
        }
      ]
    },
    {
      id: 'scn_balete_04',
      phase: 'EARLY_GAME',
      locationLabel: 'The Toll Before Dawn',
      weather: 'CLEAR',
      timeOfDay: 'PRE-DAWN',
      baseWeight: 0.9,
      intrinsicTags: ['dawn_approaching', 'night_stalker', 'flesh_hunter'],
      affinityWeights: {
        destroyed_manananggal_torso: 4.0,
        wounded_manananggal: 2.5
      },
      seamlessHooks: {
        default:
          'A faint indigo line of pre-dawn light touches the eastern ridge as the winged Manananggal and a pack of feral Aswang ("Asuwang na Lakaw") make their final desperate lunge across the plaza.'
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
          check: { stat: 'DEX', dc: 14 },
          successStory: [
            'Sidestepping the feral Ungo lunge with razor-sharp agility, you pin the severed Manananggal in the open plaza until the first golden lance of sunrise reduces it to harmless gray ash!'
          ],
          failStory: [
            'A bloodied claw grazes your ribs in the frantic pre-dawn clash before the rising sunlight finally forces the stalkers to burn and scatter!'
          ],
          onSuccess: {
            remnants: 6,
            addItem: 'herbal_poultice',
            emitTags: ['clear_sky', 'slain_matriarch']
          },
          onFail: {
            hp: -3,
            remnants: 4,
            emitTags: ['wounded', 'slain_matriarch']
          }
        },
        {
          text: 'Brace with a Bagacay bamboo stake and resist the dark infection of their frenzied assault',
          check: { stat: 'CON', dc: 15 },
          successStory: [
            'Withstanding the foul breath and venomous claws without yielding an inch, you drive the sharpened Bagacay stake home as dawn breaks over the belfry!'
          ],
          failStory: [
            'The psychic and physical strain of the bloodied clash leaves you feverish, though the sunrise destroys the winged matriarch.'
          ],
          onSuccess: {
            remnants: 6,
            addItem: 'herbal_poultice',
            emitTags: ['clear_sky', 'slain_matriarch']
          },
          onFail: {
            hp: -4,
            remnants: 4,
            emitTags: ['wounded', 'slain_matriarch']
          }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstoryEarlyBalete);

