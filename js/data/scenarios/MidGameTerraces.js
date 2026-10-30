/**
 * MidGameTerraces.js
 * Registers MID_GAME Substory 01: "The Ash-Choked Terraces of Ifugao"
 */

import { NarrativeRegistry } from '../../narrative/NarrativeDirector.js';

export const SubstoryMidTerraces = {
  substoryId: 'sub_mid_01_ash_rice_terraces',
  mainLoopId: 'loop_eclipse_bakunawa',
  phase: 'MID_GAME',
  internalName: 'The Ash-Choked Terraces of Ifugao',
  targetScenarioCount: 5,
  scenarios: [
    {
      id: 'scn_terrace_01',
      phase: 'MID_GAME',
      locationLabel: 'Stairway of the Cloud-Carvers',
      weather: 'SPIRIT FOG',
      timeOfDay: 'DAY',
      baseWeight: 1.5,
      intrinsicTags: ['high_ground', 'ash_fall'],
      affinityWeights: {
        high_ground: 2.5,
        clear_sky: 1.5
      },
      seamlessHooks: {
        default:
          'Ascending from the lowlands into the Cordillera cloud-belt, you step onto ancient stone-walled rice terraces dusted with gray volcanic ash.'
      },
      passive: {
        stat: 'WIS',
        dc: 14,
        success:
          'The carved wooden Bulul granary guardians along the terrace walls have turned their heads to face the mountain peak.',
        fail:
          'The sheer vertical drop of the thousand-step stone Retaining walls makes your knees ache.'
      },
      prompt: [
        'For leagues upward, amphitheaters of hand-fitted river stone climb into the cold mist. Yet the paddies hold no green shoots: the water has turned the color of rust, and the Mumbaki priests have vanished into the upper pine groves.',
        'Blocking the narrow stone dike ahead stands a life-sized Bulul idol of darkened narra wood, its eyes weeping red resin and a headhunter axe wedged in its arms.'
      ],
      choices: [
        {
          text: 'Don your Carved Anito Visage or bow in ritual silence to pass the guardian idol',
          requiredTag: 'spirit_ward_item',
          itemActionTag: 'Equipped // Carved Anito Mask',
          check: null,
          successStory: [
            'Recognizing the sacred kamagong visage over your face, the animated Bulul lowers its iron axe and steps aside on creaking wooden joints, revealing a cache of mountain offerings.'
          ],
          onSuccess: {
            remnants: 6,
            emitTags: ['bulul_blessed', 'high_ground']
          }
        },
        {
          text: 'Pour rice-wine and recite an upland peace-invocation before the weeping Bulul',
          check: { stat: 'WIS', dc: 14 },
          successStory: [
            'Your words honor the ancestors who stacked these stones. The wooden guardian stills its trembling limbs and lets you pass unharmed.'
          ],
          failStory: [
            'The guardian rejects your lowland accent, swinging its heavy iron head-axe in a glancing blow across your ribs before freezing back into wood!'
          ],
          onSuccess: { emitTags: ['bulul_blessed', 'spirit_respect'] },
          onFail: { hp: -4, emitTags: ['wounded', 'fog_gathering'] }
        }
      ]
    },
    {
      id: 'scn_terrace_02',
      phase: 'MID_GAME',
      locationLabel: 'Gorge of Rabot the Half-Lizard',
      weather: 'MONSOON',
      timeOfDay: 'DUSK',
      baseWeight: 1.3,
      intrinsicTags: ['canyon_wind', 'raining', 'rabot_lair'],
      affinityWeights: {
        bulul_blessed: 2.5,
        raining: 2.0
      },
      seamlessHooks: {
        default:
          'Beyond the upper terraces, the canyon walls are lined with statues of mountain scouts frozen in expressions of sudden terror.'
      },
      passive: {
        stat: 'INT',
        dc: 14,
        success:
          'These are not carved stone statues: this is the hunting gorge of Rabot, the primordial half-man, half-lizard beast of the Ibalong epic whose gaze petrifies living flesh!',
        fail:
          'A voice louder than thunder reverberates through the limestone gorge, shaking pebbles loose from the cliff.'
      },
      prompt: [
        'Out of the flooded cavern mouth lumbers Rabot: a ferocious, hulking monstrosity with the scaled hide and lashing tail of a great lizard below a man-shaped torso, bristling black eyebrows, drooping ears, and eyes that burn with a pale calcifying glare. Where its voice booms across the gorge, the very river-reeds stiffen into brittle slate.',
        'Rabot draws a breath to unleash its roar and locks its petrifying gaze toward the narrow stone bridge!'
      ],
      choices: [
        {
          text: 'Angle your Kalasag Shield or polished blade to reflect Rabot gaze and flank its blindside',
          check: { stat: 'DEX', dc: 15 },
          successStory: [
            'Averting your eyes, you catch its calcifying glare in the wet sheen of your gear and dart into the beast blind spot! Startled by its own reflected light, Rabot smashes a boulder into gravel as you strike past and claim a Carabao-Horn War Cap from a petrified champion.'
          ],
          failStory: [
            'Your flank sprint slips on the wet stone; a shockwave from Rabot roar cracks the rock beneath you and numbs your legs before you scramble across!'
          ],
          onSuccess: {
            addItem: 'carabao_horn_helm',
            remnants: 6,
            emitTags: ['proven_in_duel', 'clear_sky']
          },
          onFail: { hp: -5, emitTags: ['wounded', 'raining'] }
        },
        {
          text: 'Brace your stance and steel your blood against the petrifying gaze of Rabot',
          check: { stat: 'CON', dc: 17 },
          successStory: [
            'Though gray frost creeps up your boots and your veins burn like molten lead, your sheer bodily resilience shatters the calcifying curse! Even the primordial beast recoils in astonishment as you stride across the gorge.'
          ],
          failStory: [
            'Stone stiffness seizes your shoulder and ribs for a terrifying heartbeat before you wrench yourself free at the cost of torn muscle!'
          ],
          onSuccess: {
            addItem: 'carabao_horn_helm',
            remnants: 7,
            emitTags: ['proven_in_duel', 'clear_sky']
          },
          onFail: { hp: -6, emitTags: ['wounded', 'raining'] }
        }
      ]
    },
    {
      id: 'scn_terrace_03',
      phase: 'MID_GAME',
      locationLabel: 'The Glade of Oryol',
      weather: 'SPIRIT FOG',
      timeOfDay: 'NIGHT',
      baseWeight: 1.2,
      intrinsicTags: ['oryol_encounter', 'fog_gathering'],
      affinityWeights: {
        proven_in_duel: 2.5,
        bulul_blessed: 2.0
      },
      seamlessHooks: {
        default:
          'Above the petrified gorge, a hauntingly melodic voice drifts from a bamboo terrace untouched by volcanic ash.'
      },
      passive: {
        stat: 'WIS',
        dc: 16,
        success:
          'Through the seductive glamour of the noblewoman standing by the spring, you discern the iridescent scales of Oryol, the half-woman, half-serpent daughter of Asuang from the Ibalong epic!',
        fail:
          'The lone maiden by the spring appears miraculously unharmed, her voice weaving a soothing calm over the mountain air.'
      },
      prompt: [
        'Oryol glides across the wet terrace stones, her upper body that of a regal Bicolano noblewoman and her lower coils shimmering like a giant python behind a veil of mist. Unlike mindless beasts, she cannot be permanently slain by brute steel alone, for her serpent tail re-knits when severed.',
        '"You survived the gorge of Rabot, mortal," Oryol purrs, her golden eyes testing your resolve. "Tell me why I should not bind your footsteps in my coils."'
      ],
      choices: [
        {
          text: 'See through her serpent illusions and match wits to propose a truce against the Bakunawa',
          check: { stat: 'CHA', dc: 15 },
          successStory: [
            'Addressing her as the strategic sovereign of the woodland rather than an enemy, you argue that the Bakunawa eternal eclipse will starve both mortal and serpent domains alike. Intrigued, Oryol inclines her head and parts the mist toward the summit shrine!'
          ],
          failStory: [
            'Oryol laughs at your stumble in courtly rhetoric; her hypnotic song twists your path through briars before she slithers into the dark.'
          ],
          onSuccess: {
            remnants: 6,
            emitTags: ['oryol_alliance', 'proven_in_duel', 'clear_sky']
          },
          onFail: { hp: -4, emitTags: ['wounded', 'fog_gathering'] }
        },
        {
          text: 'Pierce her illusionary snare with iron discipline and hold your blade ready without striking first',
          check: { stat: 'WIS', dc: 16 },
          successStory: [
            'Just as her coils tighten from the shadows behind you, you step calmly out of the illusory double reach. Respecting a mind her glamour cannot cloud, Oryol yields the high ridge.'
          ],
          failStory: [
            'You swing at a phantom image while the real serpent tail sweeps your legs hard against the terrace wall!'
          ],
          onSuccess: {
            remnants: 5,
            emitTags: ['oryol_alliance', 'high_ground']
          },
          onFail: { hp: -5, emitTags: ['wounded'] }
        }
      ]
    },
    {
      id: 'scn_terrace_04',
      phase: 'MID_GAME',
      locationLabel: 'The Pine-Shrine of the Mumbaki',
      environment: 'CABIN',
      weather: 'CLEAR',
      timeOfDay: 'NIGHT',
      baseWeight: 1.0,
      intrinsicTags: ['sacred_fire'],
      affinityWeights: {
        oryol_alliance: 3.5,
        proven_in_duel: 3.0,
        bulul_blessed: 3.0
      },
      seamlessHooks: {
        default:
          'At the summit above the ash-terraces, a ring of pine torches burns around an ancient stone granary.'
      },
      passive: {
        stat: 'INT',
        dc: 14,
        success:
          'The Mumbaki elder is chanting the Hudhud epic backward to hold the sky-serpent at bay.',
        fail:
          'The smoke of burning pine resin stings your eyes in the thin mountain air.'
      },
      prompt: [
        'An aged Mumbaki priest sits before a brass gong, blood dripping from his palms where he has beaten the rim for three nights without sleep. "The mountain wards are spent, traveler," he rasps. "The Bakunawa rises from the eastern sea-trench to swallow the last sliver of the moon."',
        'He gestures toward the descending ridge trail that leads down to the black volcanic coast.'
      ],
      choices: [
        {
          text: 'Take up the heavy wooden beater and strike the sacred gong to relieve the bleeding priest',
          check: { stat: 'CON', dc: 14 },
          successStory: [
            'Your steady rhythm sends a shockwave of bronze resonance across the peaks, parting the ash-clouds and earning the elder deepest blessing for the final descent.'
          ],
          failStory: [
            'The psychic weight of the eclipse rebounds through the brass gong, leaving your ears ringing and your nose bleeding as the ritual concludes.'
          ],
          onSuccess: {
            remnants: 7,
            hp: 3,
            emitTags: ['mumbaki_blessing', 'clear_sky']
          },
          onFail: { hp: -3, emitTags: ['mumbaki_blessing', 'fog_gathering'] }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstoryMidTerraces);

