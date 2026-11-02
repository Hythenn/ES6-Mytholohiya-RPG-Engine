import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

export const SubstorySpecialGilPerez = {
  substoryId: 'sub_special_02_gil_perez_time_displacement',
  mainLoopId: 'loop_human_intrigue',
  phase: 'EARLY_GAME', // Starting phase
  isSpecialStory: true, // Grants Cross-Phase Spanning
  internalName: 'The Timeless Guard: Legend of Gil Pérez (1593)',
  targetScenarioCount: 6,
  scenarios: [
    // ==========================================
    // ACT 1: THE DISCOVERY (EARLY_GAME)
    // ==========================================
    {
      id: 'scn_gil_perez_01_discovery',
      phase: 'EARLY_GAME',
      locationLabel: 'Overgrown Bamboo Ridge',
      environment: 'FOREST',
      weather: 'SPIRIT FOG',
      timeOfDay: 'DUSK',
      baseWeight: 1.2,
      intrinsicTags: ['special_quest', 'historical_mystery', 'human_interaction'],
      affinityWeights: {
        cautious: 1.5,
        clear_sky: 1.2
      },
      seamlessHooks: {
        default: 'Pushing through the dripping bamboo stalks, the unfamiliar clanking of heavy iron and frantic foreign curses cut through the evening fog.'
      },
      passive: {
        stat: 'WIS',
        dc: 11,
        success: 'You recognize the smell of black gunpowder smoke and polished steel - weapons unknown to local village smiths.',
        fail: 'The strange metallic clanking echoes through the mist ahead.'
      },
      prompt: [
        'Sitting against a mossy boulder is a man wearing a high-crested steel morion helmet and a heavy cloth tunic. He clutches a heavy matchlock musket with trembling hands, staring wildly at the virgin jungle around him.',
        '"¡Dios mío! ¿Dónde está el Palacio del Gobernador?" he mutters in a panicking tongue, wiping sweat from his brow. "This is not Manila... where are the stone walls?"'
      ],
      choices: [
        {
          text: 'Step forward peacefully, raising your hands to show no weapon, and greet him softly',
          complexity: 'basic',
          check: null,
          successStory: [
            'You step out from the bamboo thicket with unweaponed hands, speaking in a calm, measured voice.',
            'The soldier startles, raising his matchlock musket before noticing your peaceful stance. He lowers the heavy barrel, leaning heavily against the rock as he catches his breath.'
          ],
          onSuccess: { emitTags: ['met_gil_perez'] }
        },
        {
          text: '[WISDOM] Inspect his strange uniform and foreign weapon from the shadows',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'WIS', dc: 11 },
          successStory: [
            'You observe his polished iron helmet, steel breastplate, and the insignia of the Spanish Guardia Civil pinned to his coat.',
            'You realize this man carries the gear of a palace guard, yet no Spanish galleons or garrisons exist in this era.'
          ],
          onSuccess: { emitTags: ['met_gil_perez', 'inspected_gil_uniform'] }
        },
        {
          text: 'Offer him a bamboo tube of fresh spring water to calm his panic',
          complexity: 'basic',
          check: null,
          successStory: [
            'You offer a clean bamboo vessel filled with fresh spring water. The parched soldier gratefully accepts it, drinking deeply before wiping his mouth.',
            '"Gracias, friend... I am Gil Pérez, guard of the Governor\'s Palace in Manila. But I swear by the Saints, I do not know how I arrived in this wilderness!"'
          ],
          onSuccess: { emitTags: ['met_gil_perez', 'helped_gil_perez'] }
        }
      ]
    },

    // ==========================================
    // ACT 2: BACK-AND-FORTH DIALOGUE (EARLY_GAME)
    // ==========================================
    {
      id: 'scn_gil_perez_02_dialogue',
      phase: 'EARLY_GAME',
      locationLabel: 'Bamboo Ridge Campsite',
      environment: 'FOREST',
      weather: 'SPIRIT FOG',
      timeOfDay: 'NIGHT',
      baseWeight: 0.1,
      intrinsicTags: ['special_quest', 'intel_gathering', 'time_travel_lore'],
      affinityWeights: {
        met_gil_perez: 100.0
      },
      seamlessHooks: {
        default: 'Night falls over the ridge as Gil Pérez sits by your small campfire, staring at his iron helmet in disbelief.'
      },
      prompt: [
        'Gil Pérez rubs his temples, his voice shaking as he recounts his story. "It was October 24th, 1593. The night before, Governor-General Gómez Pérez Dasmariñas was assassinated at sea by Chinese rowers! We were standing guard at the Palacio del Gobernador in Manila, waiting for news."',
        '"I felt terribly dizzy... leaned my back against the stone wall, and closed my eyes for a single second. When I opened them, the stone palace was gone, replaced by these giant trees!"'
      ],
      choices: [
        {
          text: 'Ask him details about the assassination of Governor Dasmariñas and his life in 1593 Manila',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'WIS', dc: 10 },
          successStory: [
            'You lean close across the embers and ask Gil Pérez about the fall of Governor Dasmariñas.',
            'Gil describes the royal fleet setting sail for the Moluccas and the sudden betrayal off the coast. His detailed knowledge of colonial politics matches nothing a local villager could fabricate, proving his impossible displacement across time.'
          ],
          failStory: [
            'You ask Gil Pérez about his home, but the overwhelming shock of his situation makes him bow his head in quiet sorrow, clutching a small brass rosary.'
          ],
          onSuccess: {
            discoverLocation: 'loc_ancient_manila_palace',
            emitTags: ['knows_dasmarinas_death', 'gil_perez_time_explained']
          },
          onFail: {
            heatDelta: -10,
            emitTags: ['gil_perez_time_explained']
          }
        },
        {
          text: '[INTELLIGENCE] Explain to him that he has been transported backward in time before the Spanish arrival',
          complexity: 'advanced',
          minInt: 12,
          check: { stat: 'INT', dc: 12 },
          successStory: [
            'You point to the unpaved forest trails and explain that no stone fortresses, churches, or Spanish ships exist in this era.',
            'Gil Pérez stares at the virgin wilderness in stunned realization. "Transported not across oceans... but across centuries? Holy Mother of God..."'
          ],
          failStory: [
            'You attempt to explain the time shift, but Gil shakes his head in confusion, struggling to grasp the supernatural nature of his situation.'
          ],
          onSuccess: { emitTags: ['gil_perez_time_explained', 'steady_nerves'] },
          onFail: { emitTags: ['gil_perez_time_explained'] }
        },
        {
          text: 'Offer to guide him to a local Baliana priestess at an Anito shrine to investigate this spatial rift',
          complexity: 'basic',
          check: null,
          successStory: [
            'You propose leading Gil Pérez to a sacred Baliana shrine nearby, where an elder priestess can read the spirit currents.',
            'Gil nods slowly, picking up his matchlock musket. "Lead the way, friend. Any sanctuary is better than remaining lost in the dark."'
          ],
          onSuccess: { emitTags: ['guided_gil_perez', 'gil_perez_time_explained'] }
        }
      ]
    },

    // ==========================================
    // ACT 3: BALIANA SANCTUARY (EARLY_GAME)
    // ==========================================
    {
      id: 'scn_gil_perez_03_investigation',
      phase: 'EARLY_GAME',
      locationLabel: 'Sacred Anito Grove - Baliana Altar',
      environment: 'BALETE',
      weather: 'CLEAR',
      timeOfDay: 'NIGHT',
      baseWeight: 0.1,
      intrinsicTags: ['special_quest', 'sacred_grove', 'spirit_investigation'],
      affinityWeights: {
        gil_perez_time_explained: 100.0
      },
      seamlessHooks: {
        default: 'Guiding Gil Pérez down the winding stone path, the scent of burning resin and ginger leads you to Baliana Mayumi\'s sacred shrine.'
      },
      prompt: [
        'Baliana Mayumi circles the Spanish soldier, chanting in low verses while holding a polished coconut shell filled with Blessed Lana oil and volcanic ash.',
        '"A deep tear in the spirit veil clings to his iron armor," Baliana Mayumi observes, touching her oil-stained fingers to Gil\'s breastplate. "An ancestral rift opened during the violent death of his leader, hurling him through time like a leaf in a typhoon."'
      ],
      choices: [
        {
          text: 'Assist Baliana Mayumi in performing a Santigwar cleansing ritual with coarse salt and blessed oil',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'WIS', dc: 12 },
          allowedConsumables: ['blessed_lana_vial', 'coarse_salt_pouch'],
          consumableEffect: {
            blessed_lana_vial: {
              bonusModifier: 3,
              consumeQuantity: 1,
              narrative: 'You pour consecrated oil over the altar, stabilizing the spirit aura.'
            }
          },
          successStory: [
            'You assist the Baliana by scattering coarse sea salt around Gil Pérez while she anoints his forehead with Blessed Lana oil.',
            'A soothing warmth surges through the shrine as the chaotic temporal static surrounding Gil dissipates, anchoring his spirit safely.'
          ],
          failStory: [
            'Your hand slips while handling the ritual incense, causing a minor spirit spark that startles the soldier.'
          ],
          onSuccess: {
            hp: 4,
            heatDelta: -20,
            emitTags: ['gil_sanctuary_reached', 'rep_babaylan_ally', 'cleansed']
          },
          onFail: {
            emitTags: ['gil_sanctuary_reached']
          }
        },
        {
          text: '[CHARISMA] Reassure the Baliana priestess that Gil Pérez poses no threat to her sacred shrine',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'CHA', dc: 11 },
          successStory: [
            'You speak warmly on Gil\'s behalf, assuring Baliana Mayumi that he is merely a lost traveler seeking guidance.',
            'Nodding in agreement, the priestess agrees to perform the midnight moonrise ritual when the stars align.'
          ],
          onSuccess: { emitTags: ['gil_sanctuary_reached', 'rep_babaylan_ally'] }
        }
      ]
    },

    // ==========================================
    // ACT 4: NOCTURNAL AMBUSH (EARLY_GAME)
    // ==========================================
    {
      id: 'scn_gil_perez_04_ambush',
      phase: 'EARLY_GAME',
      locationLabel: 'Misty Trail Below the Shrine',
      environment: 'FOREST',
      weather: 'SPIRIT FOG',
      timeOfDay: 'NIGHT',
      baseWeight: 0.1,
      intrinsicTags: ['special_quest', 'combat_encounter', 'night_stalker'],
      affinityWeights: {
        gil_sanctuary_reached: 100.0
      },
      seamlessHooks: {
        default: 'Leaving the sacred shrine grounds, an eerie inverted whisper echoes overhead as dark shadows gather in the fog.'
      },
      passive: {
        stat: 'DEX',
        dc: 12,
        success: 'You spot two backward-walking Sigbin hounds lurking in the underbrush, drawn by the smell of bloodied steel.',
        fail: 'A sudden screech from the treetops startles Gil Pérez as he levels his matchlock.'
      },
      prompt: [
        'Drawn by the residual temporal magic, a feral Wakwak scout shrieks from the high branches while two Sigbin hounds circle the trail with glowing red eyes!',
        'Gil Pérez cocks his matchlock musket, standing shoulder-to-shoulder with you in the fog. "In the name of Santiago! We fight together, friend!"'
      ],
      choices: [
        {
          text: '[DEXTERITY] Coordinate your attack - time your spear strike right as Gil fires his matchlock musket',
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'DEX', dc: 13 },
          successStory: [
            'You thrust your Bagacay Bamboo Spear at the charging Sigbin while Gil Pérez pulls his matchlock trigger! The deafening thunder of gunpowder smoke shatters the night, driving the creatures off in terror!'
          ],
          failStory: [
            'Gil\'s matchlock misfires in the damp mist! A Sigbin hound lunges at your arm before you manage to beat it back.'
          ],
          onSuccess: {
            piloncitos: 8,
            heatDelta: -10,
            discoverCreature: ['wakwak', 'sigbin'],
            emitTags: ['survived_temporal_ambush', 'clear_sky']
          },
          onFail: {
            hp: -3,
            emitTags: ['survived_temporal_ambush', 'wounded']
          }
        },
        {
          text: 'Fling Coarse Sea Salt into the air to blind the Wakwak while Gil readies his sidearm',
          allowedConsumables: ['coarse_salt_pouch'],
          complexity: 'tactical',
          minInt: 10,
          check: { stat: 'WIS', dc: 12 },
          successStory: [
            'You hurl a handful of coarse sea salt straight into the Wakwak feathers! Scorched by the salt ward, the demon bird shrieks and flees into the canopy.'
          ],
          onSuccess: {
            piloncitos: 6,
            discoverCreature: 'wakwak',
            emitTags: ['survived_temporal_ambush', 'salt_ward']
          }
        }
      ]
    },

    // ==========================================
    // ACT 5: THE MID-GAME CLIMAX & 3-WAY CHOICE (MID_GAME)
    // ==========================================
    {
      id: 'scn_gil_perez_05_decision',
      phase: 'MID_GAME', // CROSS-PHASE TRANSITION TO MID_GAME!
      locationLabel: 'High Moonlit Ridge Altar',
      environment: 'BALETE',
      weather: 'CLEAR',
      timeOfDay: 'MIDNIGHT',
      baseWeight: 0.1,
      intrinsicTags: ['special_quest', 'climax_node', 'moral_choice', 'time_portal'],
      affinityWeights: {
        survived_temporal_ambush: 100.0
      },
      seamlessHooks: {
        default: 'Months of wilderness travel lead you into the high mountain ridges, where Baliana Mayumi prepares the midnight spirit circle under an eclipse sky.'
      },
      prompt: [
        'Baliana Mayumi completes the ritual chalk lines on the stone altar. Over the ridge, a crackling rift of swirling indigo spirit light tears open, humming with raw temporal power.',
        '"The rift is open," Baliana Mayumi calls out over the wind. "Gil Pérez may step through to return to his distant era, or remain as an honored Bagani warrior in Kota Dula."',
        'However, as you gaze into the swirling vortex of time, you realize its power could tear your own consciousness back to the very beginning of your journey...'
      ],
      choices: [
        {
          text: 'Convince Gil Pérez to stay in this era and lend his martial expertise as a Bagani',
          complexity: 'basic',
          check: null,
          successStory: [
            'You speak warmly to Gil, inviting him to build a new life as an honored Bagani in Kota Dula rather than risking the void of time.',
            'Gil Pérez unbuckles his heavy iron breastplate and sets down his helmet with a deep sigh of relief. "You speak with wisdom, my friend. I shall make this land my home."'
          ],
          onSuccess: {
            piloncitos: 15,
            addItem: 'spanish_morion_helmet',
            emitTags: ['gil_perez_stayed_bagani', 'rep_rajahnate_ally', 'gil_perez_quest_resolved']
          }
        },
        {
          text: 'Assist Baliana Mayumi in sending Gil Pérez back to his 1593 timeline',
          complexity: 'basic',
          check: null,
          successStory: [
            'You help Baliana Mayumi chant the sacred verses as Gil steps into the swirling indigo rift.',
            'Gil Pérez grips your hand tightly in gratitude before stepping boldly into the glowing light. "May God and the Anito bless you, hero of the Philippines!" he calls out before vanishing into time.'
          ],
          onSuccess: {
            piloncitos: 15,
            addItem: 'spanish_steel_cuirass',
            emitTags: ['gil_perez_returned_time', 'hero_of_time', 'gil_perez_quest_resolved']
          }
        },
        
        // ==========================================
        // PATH C: TEMPORAL RESET LOOP (NEW GAME+ REWIND)
        // ==========================================
        {
          text: '[TEMPORAL RIFT] Step into the time rift yourself to rewind history back to Early Game with all your gear and knowledge',
          complexity: 'advanced',
          minInt: 14,
          check: null,
          successStory: [
            'You step boldly into the center of the swirling temporal rift, allowing the blinding indigo currents to envelop your soul!',
            'The world around you dissolves into a roaring vortex of time. You feel yourself hurtled backward through the age! You retain all your weapons, gold piloncitos, level stats, and Bestiary knowledge - yet the world resets around you, allowing you to alter past tragedies, save fallen allies, and rewrite history!'
          ],
          onSuccess: {
            triggerTimeLoop: true,
            resetPhase: 'EARLY_GAME',
            resetFactions: true,
            resetQuests: true,
            retainInventory: true,
            retainBestiary: true,
            piloncitos: 25,
            addItem: 'spanish_steel_cuirass',
            emitTags: ['time_loop_rewind', 'temporal_traveler', 'knows_future_events', 'reset_world_state']
          }
        }
      ]
    },

    // ==========================================
    // ACT 6: RESOLUTION & FACTION IMPACT (MID_GAME)
    // ==========================================
    {
      id: 'scn_gil_perez_06_resolution',
      phase: 'MID_GAME', // CROSS-PHASE RESOLUTION IN MID_GAME
      locationLabel: 'Kota Dula Audience Hall',
      environment: 'VILLAGE',
      weather: 'CLEAR',
      timeOfDay: 'DAY',
      baseWeight: 0.1,
      intrinsicTags: ['special_quest', 'quest_reward', 'human_settlement'],
      affinityWeights: {
        gil_perez_quest_resolved: 100.0
      },
      seamlessHooks: {
        gil_perez_stayed_bagani: 'Bright morning sunlight washes over Kota Dula as you walk alongside Gil Pérez, now wearing a finely woven abaca tunic.',
        default: 'You stand before the high palisade gates of Kota Dula.'
      },
      prompt: [
        'Datu Dula welcomes you at the high palisade hall, surrounded by Bagani warriors and Baliana priestesses.',
        'Word of the strange temporal soldier and your brave actions at the Anito shrine has reached the Rajahnate.'
      ],
      choices: [
        {
          text: 'Present Gil Pérez as a new Bagani military advisor to Datu Dula',
          requiredTag: 'gil_perez_stayed_bagani',
          complexity: 'basic',
          check: null,
          successStory: [
            'You introduce Gil Pérez to Datu Dula. Impressed by the soldier\'s discipline and military tactics, the Datu welcomes him with open arms.',
            'Datu Dula hands you a pouch of gold piloncitos and grants you permanent safe passage through Kota Dula.'
          ],
          onSuccess: {
            piloncitos: 20,
            emitTags: ['rep_rajahnate_ally', 'kota_dula_hero', 'cleansed']
          }
        },
        {
          text: 'Report the successful spirit portal ritual to Datu Dula and receive his blessing',
          requiredTag: 'gil_perez_returned_time',
          complexity: 'basic',
          check: null,
          successStory: [
            'You relate how you helped the displaced soldier return to his distant realm through the grace of the Anito.',
            'Datu Dula praises your honor and spiritual wisdom, awarding you a pouch of gold piloncitos.'
          ],
          onSuccess: {
            piloncitos: 20,
            emitTags: ['rep_rajahnate_ally', 'kota_dula_hero', 'cleansed']
          }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstorySpecialGilPerez);
