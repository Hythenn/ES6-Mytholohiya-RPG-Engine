/**
 * js/data/scenarios/early/EarlyGameKotaHub.js
 * Multi-node, ambient "City Hub & Cultural Exploration" scenario chain set in Kota Dula:
 * - Node 1: Central Plaza Hub (Navigation nexus connecting all districts)
 * - Node 2: Riverside Market (Barter, Kudlong epic chanting, foreign trade wares)
 * - Node 3: Longhouse Tavern (Resting on abaca mats, sweet Tuba wine, Sungka games, Timawa rumors)
 * - Node 4: Ancestral Dambana & Lantaka Forge (Panday metalcraft, Atang offerings, Santigwar cleansing)
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

export const SubstoryKotaHub = {
  substoryId: 'sub_early_kota_hub',
  mainLoopId: 'loop_human_intrigue',
  phase: 'EARLY_GAME',
  internalName: 'The Sunlit Market of Kota Dula',
  targetScenarioCount: 4,
  scenarios: [
    // NODE 1: CENTRAL KOTA HUB
    {
      id: 'scn_kota_hub_01',
      phase: 'EARLY_GAME',
      locationLabel: 'Kota Dula: Central Plaza',
      environment: 'VILLAGE',
      weather: 'CLEAR',
      timeOfDay: 'DAY',
      baseWeight: 1.0,
      intrinsicTags: ['human_settlement', 'safe_haven', 'city_hub'],
      affinityWeights: {
        inside_kota: 100.0,
        knows_kota_dula_gatecode: 4.0,
        rep_rajahnate_trusted: 3.0,
        clear_sky: 1.5
      },
      seamlessHooks: {
        default: 'Sunlight washes over the ironwood palisades of Kota Dula as the smells of roasting wild boar and coconut charcoal drift through the warm morning air.'
      },
      passive: {
        stat: 'WIS',
        dc: 10,
        success:
          'The rhythmic clinking of brass gongs and the melodic banter of Visayan and Tagalog river traders fill the wide earthen plaza.',
        fail:
          'A colorful crowd of Bagani warriors, textile weavers, and river traders wanders past the carved wooden gateway.'
      },
      prompt: [
        'Behind the sturdy, bronze-braced palisade walls of Kota Dula, archipelagic life thrives unthreatened by the shadows of the wild. Children play with cowrie shells near carved wooden Anito posts, while women weave intricate abaca cloth under shaded palm thatch.',
        'To the east, the riverside market hums with lively barter; to the west, laughter and gong music echo from a communal bamboo longhouse tavern; further up the limestone terrace steps sits a peaceful ancestral Dambana shrine and the smoking forge of master metalworkers.'
      ],
      choices: [
        {
          text: 'Wander down toward the bustling Riverside Market to browse regional trade wares',
          complexity: 'basic',
          whisperTag: 'District // Riverside Trading Post',
          check: null,
          successStory: [
            'You weave through the friendly crowds toward the riverbank where bamboo outriggers lie moored, laden with dried mountain spices, sea pearls, salt blocks, and cast bronze bells.'
          ],
          onSuccess: {
            emitTags: ['at_kota_market']
          }
        },
        {
          text: 'Enter the Longhouse Tavern to rest, drink sweet Tuba wine, and listen to travelers',
          complexity: 'basic',
          whisperTag: 'District // Longhouse Communal Hearth',
          check: null,
          successStory: [
            'You step under the cool, shaded thatch roof of the longhouse where gentle breezes blow off the water, bringing the sweet aroma of fermented palm nectar.'
          ],
          onSuccess: {
            emitTags: ['at_kota_tavern']
          }
        },
        {
          text: 'Ascend the limestone steps toward the Ancestral Dambana Shrine and Lantaka Forge',
          complexity: 'basic',
          whisperTag: 'District // Sacred Terrace and Bronze Forge',
          check: null,
          successStory: [
            'Climbing the hand-carved stone steps, the scent of burning beeswax candles and incense mingles with the rhythmic metallic clanging of the blacksmith hammer.'
          ],
          onSuccess: {
            emitTags: ['at_kota_shrine']
          }
        },
        {
          text: 'Leave the safety of Kota Dula and venture back out onto the wilderness trails',
          complexity: 'basic',
          whisperTag: 'Travel // Depart Palisade Gate',
          check: null,
          successStory: [
            'Nodding respectfully to the Bagani sentries posted atop the wooden watchtower, you pass beneath the heavy ironwood gate and step back out onto the open mountain trail.'
          ],
          onSuccess: {
            emitTags: ['departed_kota', 'clear_sky']
          }
        }
      ]
    },

    // NODE 2: RIVERSIDE MARKET (Chained via at_kota_market)
    {
      id: 'scn_kota_market_01',
      phase: 'EARLY_GAME',
      locationLabel: 'Kota Dula: Riverside Market',
      environment: 'VILLAGE',
      weather: 'CLEAR',
      timeOfDay: 'DAY',
      baseWeight: 0.1,
      intrinsicTags: ['trade_node', 'cultural_ambient', 'safe_haven'],
      affinityWeights: {
        at_kota_market: 100.0
      },
      seamlessHooks: {
        default: 'You arrive at the river market stalls where foreign junk traders and local barters haggle over woven pandan mats and earthen fermentation jars.'
      },
      prompt: [
        'Merchants from across the sea and inland hills lay out their wares on freshly cut banana leaves: fragrant honeycomb, bundles of straight Bagacay bamboo, blocks of coarse sea salt, and jars of pungent bagoong.',
        'An elder bard sits cross-legged on a polished narra stool nearby, softly plucking a two-stringed boat lute (Kudlong) while chanting verses of an ancient pre-colonial epic.'
      ],
      choices: [
        {
          text: 'Sit quietly and listen to the epic chanter recite the legends of Haliya and the lunar tides',
          complexity: 'basic',
          whisperTag: 'Oral Tradition // Kudlong Epic Chanting',
          check: null,
          successStory: [
            'The gentle rhythm of the Kudlong lute and the chanter\'s resonant voice transport your mind into the timeless mythos of the archipelagic deities.',
            'Listening to verses detailing how Haliya\'s lunar mask wards off nocturnal terrors, your spirit settles into calm equilibrium. Lingering fear and tension wash away completely.',
            '"Honor the silver moon, traveler," the chanter whispers with a warm nod, "and the shadows of the forest shall never claim your senses."'
          ],
          onSuccess: {
            heatDelta: -20,
            emitTags: ['at_kota_market', 'learned_moon_lore', 'steady_nerves']
          }
        },
        {
          text: 'Trade 4 Piloncitos for a pouch of Coarse Sea Salt and dried Bayabas Medicinal Herbs',
          complexity: 'basic',
          whisperTag: 'Barter // Market Vendor Provisions',
          check: null,
          successStory: [
            'You exchange four gleaming gold Piloncitos with a friendly river merchant for a tightly woven pouch of coarse sea salt and a bundle of dried, antiseptic bayabas leaves.',
            '"May the tides favor your paddle, friend," the vendor beams, tucking the gold into his waistband.'
          ],
          onSuccess: {
            piloncitos: -4,
            addItem: ['coarse_salt_pouch', 'bayabas_herbs'],
            emitTags: ['at_kota_market']
          }
        },
        {
          text: 'Examine imported porcelain curios and trade 6 Piloncitos for a polished brass pendant',
          complexity: 'tactical',
          whisperTag: 'Barter // Foreign Trade Curio',
          check: null,
          successStory: [
            'Browsing a chest of Song Dynasty ceramic bowls and brass baubles, you spot a finely cast triangular brass pendant warded with ancient geometric engravings.',
            'You trade six Piloncitos for the talisman, feeling its reassuring weight against your collarbone.'
          ],
          onSuccess: {
            piloncitos: -6,
            addItem: 'anting_anting_brass_pendant',
            emitTags: ['at_kota_market']
          }
        },
        {
          text: 'Return to the Central Plaza of Kota Dula',
          complexity: 'basic',
          whisperTag: 'Navigation // Back to Plaza',
          check: null,
          successStory: [
            'Stepping away from the noisy river stalls, you make your way back up the earthen lane toward the open plaza.'
          ],
          onSuccess: {
            emitTags: ['inside_kota']
          }
        }
      ]
    },

    // NODE 3: LONGHOUSE TAVERN (Chained via at_kota_tavern)
    {
      id: 'scn_kota_tavern_01',
      phase: 'EARLY_GAME',
      locationLabel: 'Kota Dula: Longhouse Tavern',
      environment: 'VILLAGE',
      weather: 'CLEAR',
      timeOfDay: 'DAY',
      baseWeight: 0.1,
      intrinsicTags: ['safe_haven', 'resting_node', 'cultural_ambient'],
      affinityWeights: {
        at_kota_tavern: 100.0
      },
      seamlessHooks: {
        default: 'Inside the cool, elevated bamboo longhouse, warriors and riverfarers share bamboo tubes of sweet, effervescent Tuba palm wine.'
      },
      prompt: [
        'Elders sit in a relaxed circle chewing betel nut (nganga), their teeth stained an honorable reddish-black as they debate harvest moon cycles and river tides. A tavern maiden offers bamboo cups of freshly tapped palm wine.',
        'Here in the cool breeze beneath the high thatched roof, your tired limbs unwind and the creeping dread of the wilderness evaporates completely.'
      ],
      choices: [
        {
          text: 'Pay 3 Piloncitos to drink fresh fermented Tuba wine and rest on a clean abaca mat',
          complexity: 'basic',
          whisperTag: 'Recovery // Rest and Refreshment',
          check: null,
          successStory: [
            'The sweet, slightly tart palm nectar warms your throat as you stretch out across a fragrant woven abaca cot.',
            'You drift into a deep, uninterrupted slumber for several hours, waking up thoroughly rejuvenated with refreshed vigor and total peace of mind.'
          ],
          onSuccess: {
            hp: 8,
            piloncitos: -3,
            heatDelta: -30,
            emitTags: ['at_kota_tavern', 'well_rested', 'cleansed']
          }
        },
        {
          text: 'Offer nganga betel nut to the Timawa veteran warriors and ask about dangerous backcountry routes',
          complexity: 'tactical',
          whisperTag: 'Social // Share Betel Nut and Gather Rumors',
          check: { stat: 'CHA', dc: 11 },
          successStory: [
            'The weathered warriors welcome your offering with appreciative nods, passing a brass lime box in return. Over shared chews, they point out a hidden highland trail: "If you must trek through the southern limestone ridge, watch the karst crevices: the mountain headhunters set bamboo punji pits along the main defile. Take the higher goat path instead."',
            'Their advice is permanently etched into your memory, unlocking knowledge of the highland passes.'
          ],
          failStory: [
            'The old fighters politely accept your betel nut, but their discussion remains focused on municipal rice tithes and river fishing rights.'
          ],
          onSuccess: {
            discoverLocation: 'loc_mountain_headhunter_pass',
            emitTags: ['at_kota_tavern', 'knows_secret_pass', 'timawa_drinking_bond']
          },
          onFail: {
            emitTags: ['at_kota_tavern']
          }
        },
        {
          text: 'Sit at a wooden table and play a friendly game of Sungka against a river traveler',
          complexity: 'basic',
          whisperTag: 'Leisure // Traditional Mancala Board Game',
          check: { stat: 'INT', dc: 11 },
          successStory: [
            'Scooping polished cowrie shells into the carved hollows of the wooden boat-board, your sharp mental arithmetic outmaneuvers your opponent!',
            'Laughing heartily, the traveler congratulates your tactical skill and hands over a modest purse of 3 Piloncitos as the winner\'s share.'
          ],
          failStory: [
            'The river traveler traps your shells in a clever pit sequence, taking the game with a good-natured grin. Still, the mental exercise sharpens your focus.'
          ],
          onSuccess: {
            piloncitos: 3,
            emitTags: ['at_kota_tavern', 'quick_wits']
          },
          onFail: {
            emitTags: ['at_kota_tavern']
          }
        },
        {
          text: 'Return to the Central Plaza of Kota Dula',
          complexity: 'basic',
          whisperTag: 'Navigation // Back to Plaza',
          check: null,
          successStory: [
            'Thanking the longhouse hosts, you step back out into the sun-drenched center of the settlement.'
          ],
          onSuccess: {
            emitTags: ['inside_kota']
          }
        }
      ]
    },

    // NODE 4: ANCESTRAL DAMBANA & LANTAKA FORGE (Chained via at_kota_shrine)
    {
      id: 'scn_kota_shrine_01',
      phase: 'EARLY_GAME',
      locationLabel: 'Kota Dula: Ancestral Dambana and Forge',
      environment: 'VILLAGE',
      weather: 'CLEAR',
      timeOfDay: 'DAY',
      baseWeight: 0.1,
      intrinsicTags: ['sacred_shrine', 'crafting_node', 'safe_haven'],
      affinityWeights: {
        at_kota_shrine: 100.0
      },
      seamlessHooks: {
        default: 'At the terrace crest, the sweet scent of burning almaciga copal resin drifts past hand-carved wooden Larawan idols, while sparks fly from the open charcoal forge nearby.'
      },
      prompt: [
        'Here stands the sacred heart and defensive armory of the Kota. Beneath an open-sided balete-wood dambana, carved ancestral figures (Larawan) look out over the settlement, draped with white cotton ribbons and fresh wild sampaguita garlands.',
        'A short walk away, master Panday blacksmiths pump twin bamboo bellows, heating charcoal to melt bronze for swivel cannons (Lantaka) and hammer high-carbon iron into single-edged Kampilan blades.'
      ],
      choices: [
        {
          text: 'Place an offering (Atang) of 2 Piloncitos and beeswax candles before the ancestral Larawan idols',
          complexity: 'basic',
          whisperTag: 'Ritual // Atang Ancestral Devotion',
          check: null,
          successStory: [
            'You light yellow beeswax candles and respectfully place two gold coins inside a polished coconut shell at the altar base.',
            'A gentle breeze stirs the cotton streamers. An unmistakable aura of spiritual warmth washes over you, purging any lingering spirit hexes or fevers from your body.'
          ],
          onSuccess: {
            piloncitos: -2,
            heatDelta: -25,
            cureCondition: ['spirit_fever', 'infected_aswang_bite'],
            emitTags: ['at_kota_shrine', 'anito_blessed', 'cleansed']
          }
        },
        {
          text: 'Consult with the master Panday blacksmith to observe bronze casting and buy a whetstone',
          complexity: 'tactical',
          whisperTag: 'Craft // Blacksmith Guidance and Gear',
          check: { stat: 'WIS', dc: 11 },
          successStory: [
            'The muscular smith wipes soot from his brow and shows you the intricate beeswax molds used to cast brass Lantaka cannons and balance Kampilan blades.',
            '"A sharp edge is your best friend when forest stalkers close in," he advises, gifting you a fine river whetstone and sharing trade secrets on maintaining weapon integrity.'
          ],
          failStory: [
            'The forge is in the middle of pouring molten bronze; the smith nods politely but asks you to keep a safe distance from the sparks.'
          ],
          onSuccess: {
            addItem: 'whetstone',
            piloncitos: -3,
            emitTags: ['at_kota_shrine', 'blacksmith_patron']
          },
          onFail: {
            emitTags: ['at_kota_shrine']
          }
        },
        {
          text: 'Speak with an elder Babaylan priestess seated by the shrine for a Santigwar diagnosis',
          complexity: 'advanced',
          whisperTag: 'Healing // Babaylan Water-Reading',
          check: { stat: 'INT', dc: 12 },
          successStory: [
            'The priestess drops molten wax into a shallow water bowl, studying the cooling shapes with sharp discernment: "The shadows have brushed against your journey, but your spirit cord remains unbroken."',
            'She murmurs ancient chants and rubs blessed coconut oil onto your temples, soothing your physical ailments and clearing your mind.'
          ],
          failStory: [
            'The priestess blesses you with holy water from a bamboo cup, offering a quiet prayer for your safety.'
          ],
          onSuccess: {
            hp: 6,
            cureCondition: 'bleeding_wound',
            emitTags: ['at_kota_shrine', 'santigwar_cleansed']
          },
          onFail: {
            hp: 2,
            emitTags: ['at_kota_shrine']
          }
        },
        {
          text: 'Return to the Central Plaza of Kota Dula',
          complexity: 'basic',
          whisperTag: 'Navigation // Back to Plaza',
          check: null,
          successStory: [
            'You descend the stone terrace steps and return to the bustling center of the plaza.'
          ],
          onSuccess: {
            emitTags: ['inside_kota']
          }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(SubstoryKotaHub);

