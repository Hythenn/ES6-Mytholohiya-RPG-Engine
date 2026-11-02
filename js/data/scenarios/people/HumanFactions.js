/**
 * js/data/scenarios/HumanFactions.js
 *
 * Scenarios and Hubs for the 5 Core Human Factions of Mytholohiya:
 * 1. The Kota Rajahnate (Palisade Forts, Datus, Blacksmiths, Bounty Hunters)
 * 2. The Sisterhood of the Baliana / Babaylan (Santigwar Cleansing, Anito Shrines, Spirit Wrath)
 * 3. The Karakoa Sea-Raider Brotherhood (Timawa Pirates, Smuggling Contracts, Slave Liberations)
 * 4. The Secret Lineage of the Night (Barrio Silim, Daytime Village, Nocturnal Raids)
 * 5. The Mountain Headhunters (Cordillera Braves, Karst Ridges, Punji Traps)
 *
 * Integrates dynamic tag routing, moral alignment consequences, and faction agency.
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

// ============================================================================
// 1. THE KOTA RAJAHNATE (COASTAL PALISADE FORTS & DATUS)
// ============================================================================

// 1.1 Palisade Gate of Kota Dula
NarrativeRegistry.registerMiscScenario({
  id: 'faction_kota_dula_gate_01',
  locationLabel: 'The Palisade Gate of Kota Dula',
  environment: 'VILLAGE',
  weather: 'ANY',
  baseWeight: 0.28,
  intrinsicTags: ['spice_of_life', 'kota_hub', 'settlement_edge', 'rajahnate_fort'],

  affinityWeights: {
    rep_rajahnate_ally: 3.5,
    rep_rajahnate_enemy: 3.0,
    bounty_on_head: 3.5,
    clear_sky: 0.4
  },

  seamlessHooks: {
    raining:
      'Torches hiss in the coastal downpour along the ironwood battlements of Kota Dula as water streams from heavy brass Lantaka cannons.',
    fog_gathering:
      'Through swirling coastal mist rises the formidable palisade wall of Kota Dula, bristling with sharpened bamboo stakes.',
    clear_sky:
      'Sunlight gleams off the polished brass cannons and red cotton pennants fluttering above the palisade of Kota Dula.',
    default:
      'You stand before the heavy ironwood gates of Kota Dula, the primary fortified trading haven of the coastal Rajahnate.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'You spot Bagani marksmen with drawn horn-bows positioned behind the firing slits of the upper ramparts.',
    fail:
      'The rhythmic beat of a brass war-gong rings out from within the inner courtyard.'
  },

  prompt: [
    'A massive double-layered palisade of petrified ironwood trunk logs spans the riverbank, fortified with swivel-mounted brass Lantaka cannons and guarded by disciplined Bagani warriors in carabao-hide armor.',
    'Datu Dula maintains strict order over this trading fortress: Chinese merchant junks barter porcelain along the docks, while palisade sentries inspect every traveler seeking entrance.'
  ],

  choices: [
    {
      text: 'Present your Bagani alliance credentials to enter freely as an honored ally of the Rajahnate',
      requiredTag: 'rep_rajahnate_ally',
      itemActionTag: 'Alliance // Kota Rajahnate',
      blockedByTag: 'rep_rajahnate_enemy',
      lockReason: 'Requires allied standing with the Kota Rajahnate',
      check: null,
      successStory: [
        'The watch commander recognizes your credentials and shouts an order down the wall! The heavy ironwood drawbridge lowers smoothly over the ditch, granting you safe haven within the trading hub and full access to the royal blacksmith.'
      ],
      onSuccess: {
        heatDelta: -25,
        emitTags: ['inside_kota', 'steady_nerves', 'well_rested']
      }
    },
    {
      text: 'Pay the standard anchorage toll of 5 Piloncitos to the gate officer for peaceful trading entry',
      requiredPiloncitos: 5,
      blockedByTag: 'rep_rajahnate_enemy',
      lockReason: 'Barred from entry: The Rajahnate has declared you an enemy',
      check: null,
      successStory: [
        'The gate officer accepts your 5 piloncitos with a nod, stamping your arm with vegetable dye. The heavy timbers groan open, allowing you entrance into the fortified streets of Kota Dula.'
      ],
      onSuccess: {
        remnants: -5,
        heatDelta: -15,
        emitTags: ['inside_kota', 'peaceful_trade']
      }
    },
    {
      text: 'Negotiate entry by sharing valuable tactical intelligence regarding inland spirit omens',
      complexity: 'tactical',
      minInt: 10,
      blockedByTag: 'rep_rajahnate_enemy',
      check: { stat: 'CHA', dc: 13 },
      successStory: [
        'Your eloquent explanation of the inland omens impresses the watch captain! Convinced of your strategic worth to Datu Dula, he welcomes you inside as a trusted ally of the Kota.',
        'The gates open wide, and you are granted the protection of the palisade.'
      ],
      failStory: [
        'The captain scoffs at your words, suspecting you of being a spy for coastal pirates: "Save your tall tales! Pay the toll or turn back before our archers take your pack!"'
      ],
      onSuccess: {
        remnants: 3,
        emitTags: ['rep_rajahnate_ally', 'inside_kota', 'steady_nerves']
      },
      onFail: {
        heatDelta: 10,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Scale the rear moat-drainage ditch under cover of dusk to slip inside undetected',
      complexity: 'clever',
      minInt: 11,
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Timing your movement between torch sweeps, you scale the slick river-culvert and drop soundlessly into the shadowy alleys behind the merchant warehouses.'
      ],
      failStory: [
        'A loose river rock clatters beneath your boot! An iron crossbow bolt clangs off the stones inches from your ear, forcing you to dive into the river muck!'
      ],
      onSuccess: {
        remnants: 4,
        emitTags: ['inside_kota', 'high_ground']
      },
      onFail: {
        hp: -3,
        heatDelta: 20,
        emitTags: ['wounded', 'rep_rajahnate_enemy', 'bounty_on_head']
      }
    }
  ]
});

// 1.2 The Foundry of Panday Pandak (Blacksmith)
NarrativeRegistry.registerMiscScenario({
  id: 'faction_kota_blacksmith_01',
  locationLabel: 'The Foundry of Panday Pandak',
  environment: 'CABIN',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'blacksmith_forge', 'inside_kota'],

  affinityWeights: {
    inside_kota: 5.0,
    rep_rajahnate_ally: 2.5
  },

  seamlessHooks: {
    default:
      'The clang of hammer against anvil and the roar of charcoal bellows lead you to the open-air iron foundry of Kota Dula.'
  },

  passive: {
    stat: 'INT',
    dc: 12,
    success:
      'You admire the folded Damascus-like pattern of the iron ingots: Panday Pandak tempers steel with volcanic river ash.',
    fail:
      'Racks of glowing curved daggers and heavy iron spearheads line the smoky hearth.'
  },

  prompt: [
    'Inside the stone-walled foundry, veteran weaponsmith Panday Pandak plunges a glowing red blade into a trough of brine, sending plumes of hissing steam toward the narra roofbeams.',
    '"Steel does not lie," Pandak grunts, wiping soot from his scarred brow. "Whether you hunt wild boar or nocturnal ghouls, a dull blade makes you a corpse."'
  ],

  choices: [
    {
      text: 'Request free alloy maintenance and weapon honing as an ally of Datu Dula',
      requiredTag: 'rep_rajahnate_ally',
      itemActionTag: 'Ally Privilege // Kota Blacksmith',
      blockedByTag: 'rep_rajahnate_enemy',
      lockReason: 'Requires allied standing with the Kota Rajahnate',
      check: null,
      successStory: [
        'Honoring the alliance between you and Datu Dula, Panday Pandak takes your weapon and hones its edge to razor sharpness on his waterstone, while gifting you a pair of polished Brass Vambraces from his royal reserves!'
      ],
      onSuccess: {
        addItem: 'brass_vambraces',
        emitTags: ['blacksmith_tuned', 'steady_nerves']
      }
    },
    {
      text: 'Pay 8 Piloncitos to purchase a tempered steel weapon and sturdy armor reinforcement',
      requiredPiloncitos: 8,
      blockedByTag: 'rep_rajahnate_enemy',
      check: null,
      successStory: [
        'Pandak counts your 8 piloncitos, spits on his palm, and hands you a finely balanced single-edged Kampilan sword forged from layered archipelagic steel.'
      ],
      onSuccess: {
        remnants: -8,
        addItem: 'kampilan_sword',
        emitTags: ['blacksmith_tuned']
      }
    },
    {
      text: 'Offer to assist with the high-heat bellows to learn the secret of volcanic steel tempering',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'STR', dc: 13 },
      successStory: [
        'Heaving the heavy double-piston bamboo bellows with tireless strength, you maintain the white-hot furnace heat! Impressed by your grit, Pandak rewards your sweat with an iron-rimmed Salakot Hat and 4 Piloncitos.'
      ],
      failStory: [
        'The intense furnace blast scorches your forearms, causing you to lose your rhythm on the bellows and ruin the batch.'
      ],
      onSuccess: {
        remnants: 4,
        addItem: 'salakot_hat',
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -2,
        emitTags: ['wounded']
      }
    }
  ]
});

// 1.3 The Rajahnate Bounty Ambush
NarrativeRegistry.registerMiscScenario({
  id: 'faction_rajahnate_bounty_ambush_01',
  locationLabel: 'Tidal Mangrove Ambush Post',
  environment: 'MANGROVE',
  weather: 'ANY',
  baseWeight: 0.15,
  ambush: true,
  pressureTimer: 5000,
  reactionTimer: 5,
  intrinsicTags: ['spice_of_life', 'bounty_hunter', 'rajahnate_patrol', 'ambush_danger'],

  affinityWeights: {
    rep_rajahnate_enemy: 4.0,
    bounty_on_head: 4.5
  },

  seamlessHooks: {
    default:
      'A horn-blast echoes from the mangrove trees as armored figures leap out across the muddy tidal channel!'
  },

  passive: {
    stat: 'WIS',
    dc: 14,
    success:
      'You spot the flash of polished brass Lantaka barrels mounted on a river raft just before the ambush springs!',
    fail:
      'Heavy ironwood nets splash into the water all around you before you can draw steel.'
  },

  prompt: [
    'A squad of armored Bagani bounty trackers sent by Datu Dula emerges from the dense mangrove roots, wielding barbed polearms and heavy weighted nets.',
    '"Outlaw!" the lead officer roars, brandishing an iron warrant seal. "By order of the Kota Rajahnate, you return in chains or in pieces!"'
  ],

  choices: [
    {
      text: 'Shatter their encirclement with a ferocious counter-charge before their nets deploy',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'STR', dc: 14 },
      successStory: [
        'With a deafening battle cry, you crash through the forward line, shattering their wooden shields and scattering the bounty hunters into the coastal mud before taking their dropped purse of 6 Piloncitos!'
      ],
      failStory: [
        'A lead-weighted net wraps around your shoulders, dragging you into the brackish mire while iron blades strike your ribs!'
      ],
      onSuccess: {
        remnants: 6,
        addItem: 'carabao_hide_cuirass',
        emitTags: ['steady_nerves', 'high_ground']
      },
      onFail: {
        hp: -4,
        heatDelta: 20,
        applyCondition: { id: 'bleeding_wound', bodyPart: 'Ribs / Shoulder' },
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Dive into the swift tidal current and navigate the underwater mangrove roots to escape',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'You vanish beneath the dark brackish water, swimming between petrified stilt roots and leaving the confused trackers searching empty mud flats.'
      ],
      failStory: [
        'Sharp barnacles gash your legs as you swim, leaving a trail of red in the water as you scramble ashore.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'clear_sky']
      },
      onFail: {
        hp: -3,
        heatDelta: 10,
        emitTags: ['wounded', 'muddy_ground']
      }
    },
    {
      text: 'Throw a heavy pouch of 10 Piloncitos to buy off the squad captain and clear your immediate trail',
      requiredPiloncitos: 10,
      check: null,
      successStory: [
        'The captain catches the coin pouch, weighs it with a sly grin, and signals his men to lower their spears: "We never saw you, traveler. But do not show your face near the Kota gates again."'
      ],
      onSuccess: {
        remnants: -10,
        heatDelta: -20,
        emitTags: ['cautious']
      }
    }
  ]
});

// ============================================================================
// 2. THE SISTERHOOD OF THE BALIANA / BABAYLAN
// ============================================================================

// 2.1 The Sacred Water-Lily Grotto of Baliana Alunsina
NarrativeRegistry.registerMiscScenario({
  id: 'faction_baliana_sacred_grove_01',
  locationLabel: 'The Sacred Water-Lily Grotto of Baliana Alunsina',
  environment: 'OUTDOOR',
  weather: 'ANY',
  baseWeight: 0.26,
  intrinsicTags: ['spice_of_life', 'baliana_grove', 'anito_shrine', 'sanctuary'],

  affinityWeights: {
    rep_babaylan_ally: 3.5,
    cursed_by_anito: 3.0,
    wounded: 2.0,
    fog_gathering: 0.5
  },

  seamlessHooks: {
    fog_gathering:
      'The scent of smoldering bayabas leaves and beeswax candles cuts through the spirit fog, guiding you to a serene limestone grotto.',
    raining:
      'Rain whispers against floating water-lily pads in a secluded spring where soft chanting echoes from a rock-shelter.',
    default:
      'A serene limestone spring surrounded by blooming lotus flowers shelters the sacred dambana of the Baliana priestesses.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'You sense the tranquil aura of ancestral protection warding off foul night-stalkers from this sacred hollow.',
    fail:
      'Soft chime of bronze bells vibrates in harmony with the chanting voices of the priestesses.'
  },

  prompt: [
    'Deep within the limestone grotto, high priestess Baliana Alunsina and her acolytes conduct solemn Santigwar rituals over an earthen basin filled with warmed coconut oil and crushed herbs.',
    'Before an ancient stone anito idol rests an offering bowl brimming with gleaming Piloncitos and gold leaf, placed there by grateful villagers in exchange for spiritual healing.'
  ],

  choices: [
    {
      text: 'Kneel reverently before Baliana Alunsina and request the sacred Santigwar cleansing ritual',
      blockedByTag: 'rep_babaylan_enemy',
      lockReason: 'The Sisterhood has branded you an enemy of the spirits and bars you from healing',
      check: null,
      successStory: [
        'Baliana Alunsina drizzles consecrated oil across your brow, chanting ancient Orasyon verses that banish all spirit hexes and venom from your blood! Your wounds knit clean, and she gifts you a consecrated Vial of Blessed Lana Oil.'
      ],
      onSuccess: {
        hp: 6,
        heatDelta: -30,
        addItem: 'blessed_lana_vial',
        clearCondition: ['bleeding_wound', 'infected_aswang_bite', 'fever_usog'],
        emitTags: ['rep_babaylan_ally', 'rep_babaylan_blessed', 'steady_nerves']
      }
    },
    {
      text: 'Place 3 Piloncitos upon the anito altar and chant a respectful prayer to the ancestors',
      requiredPiloncitos: 3,
      blockedByTag: 'rep_babaylan_enemy',
      check: null,
      successStory: [
        'Your offering hums with bioluminescent warmth as the ancestors accept your tribute. A wave of profound calm washes over your mind, lifting any lurking spirit fatigue.'
      ],
      onSuccess: {
        remnants: -3,
        heatDelta: -20,
        emitTags: ['rep_babaylan_ally', 'spirit_respect', 'clear_sky']
      }
    },
    {
      text: 'Desecrate the shrine: plunder the 15 Piloncitos of gold offerings while the priestesses chant in trance',
      complexity: 'clever',
      minInt: 10,
      check: null,
      successStory: [
        'Seizing the unguarded offering bowl, you scoop 15 gleaming piloncitos into your pack! As you turn to flee, a cold wind extinguishes the sacred candles, and a terrifying spectral wail chills your bones: the ancestral anito have witnessed your greed!'
      ],
      onSuccess: {
        remnants: 15,
        heatDelta: 30,
        emitTags: ['stole_shrine_gold', 'cursed_by_anito', 'rep_babaylan_enemy', 'fog_gathering']
      }
    }
  ]
});

// 2.2 The Anito Spirit Wrath
NarrativeRegistry.registerMiscScenario({
  id: 'faction_babaylan_curse_encounter_01',
  locationLabel: 'Haunted Trail of the Grieving Anito',
  environment: 'OUTDOOR',
  weather: 'SPIRIT FOG',
  timeOfDay: 'NIGHT',
  baseWeight: 0.16,
  intrinsicTags: ['spice_of_life', 'anito_curse', 'spirit_wrath', 'supernatural_omen'],

  affinityWeights: {
    cursed_by_anito: 4.5,
    stole_shrine_gold: 4.0,
    rep_babaylan_enemy: 3.5
  },

  seamlessHooks: {
    default:
      'The stolen gold in your pack burns like boiling pitch against your ribs as the trees around you begin to wail with ancestral sorrow.'
  },

  passive: {
    stat: 'WIS',
    dc: 14,
    success:
      'You recognize the spectral manifestation of an offended Anito warden seeking vengeance for the looted shrine!',
    fail:
      'A dizzying phantom mist numbs your fingertips and fills your ears with weeping.'
  },

  prompt: [
    'Translucent, weeping apparitions rise from the mossy roots, barring your path forward. The air turns freezing cold as the wrath of the desecrated ancestors manifests in swirling spirit vortexes.',
    'Every coin plundered from the shrine weighs down your spirit like lead.'
  ],

  choices: [
    {
      text: 'Bury the stolen gold in the earth and plead with tears for ancestral forgiveness',
      requiredTag: 'stole_shrine_gold',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'WIS', dc: 14 },
      successStory: [
        'Kneeling in the soil, you return the gold with sincere humility. The wailing spirits soften into gentle whispering lights that circle your head once before fading into the night: the ancestral curse is lifted!'
      ],
      failStory: [
        'Your apology rings hollow in the cold mist; the vengeful spirits lash your mind with phantom frost!'
      ],
      onSuccess: {
        remnants: -10,
        heatDelta: -25,
        emitTags: ['atoned_shrine', 'steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -4,
        heatDelta: 15,
        applyCondition: { id: 'spirit_hexed', bodyPart: 'Mind / Chest' },
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Brace your will with sheer mental fortitude and march through the shrieking apparitions',
      check: { stat: 'CON', dc: 15 },
      successStory: [
        'Gritting your teeth against the psychic chills and terrifying shrieks, you endure the spectral fury and break through the ghost-ring unharmed!'
      ],
      failStory: [
        'The supernatural frost seeps into your chest, leaving you shuddering with spirit-induced ague.'
      ],
      onSuccess: {
        emitTags: ['steady_nerves', 'high_ground']
      },
      onFail: {
        hp: -4,
        applyCondition: { id: 'spirit_hexed', bodyPart: 'Mind / Chest' },
        emitTags: ['wounded', 'raining']
      }
    }
  ]
});

// ============================================================================
// 3. THE KARAKOA SEA-RAIDER BROTHERHOOD (TIMAWA PIRATES)
// ============================================================================

// 3.1 The Hidden Cove of the Black Karakoa
NarrativeRegistry.registerMiscScenario({
  id: 'faction_karakoa_pirate_cove_01',
  locationLabel: 'Hidden Sea-Cave of the Black Karakoa',
  environment: 'CAVE',
  weather: 'CLEAR',
  baseWeight: 0.24,
  intrinsicTags: ['spice_of_life', 'karakoa_cove', 'pirate_haven', 'smuggling_contract'],

  affinityWeights: {
    rep_karakoa_ally: 3.5,
    rep_karakoa_enemy: 3.0,
    clear_sky: 0.3
  },

  seamlessHooks: {
    default:
      'Tucked behind a curtain of hanging sea-vines, the smell of salted fish, gunpowder, and roasted pork reveals the pirate hideout.'
  },

  passive: {
    stat: 'INT',
    dc: 12,
    success:
      'You spot two 30-oared Karakoa war-boats moored in the turquoise water, their carved dragon-like prows bristling with Lantaka swivel guns.',
    fail:
      'Tattooed raiders in red sarongs eye you warily from around a roaring fire-pit.'
  },

  prompt: [
    'In this secluded tidal cove, Timawa sea-raiders drink strong palm wine and divide plunder taken from foreign merchant junks. At the center sits Datu Magat, an imposing warrior whose tattooed torso tells of forty coastal raids.',
    'Beside the mooring stakes, three captured Alipin slaves sit bound with abaca rope, awaiting auction.'
  ],

  choices: [
    {
      text: 'Accept Datu Magat lucrative mercenary contract to smuggle contraband gunpowder past the coastal fort',
      complexity: 'tactical',
      minInt: 10,
      blockedByTag: 'rep_karakoa_enemy',
      lockReason: 'The Karakoa Brotherhood has marked you as an enemy and refuses to contract you',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'You accept the iron contract token and successfully guide the cargo past the coastal palisade line! Datu Magat roars with laughter, rewarding you with 12 Piloncitos and an authentic single-edged Kampilan sword!'
      ],
      failStory: [
        'You botch the navigation through the tidal breakers, losing half the kegs in the surf. Datu Magat docks your pay and threatens your life if you return empty-handed.'
      ],
      onSuccess: {
        remnants: 12,
        addItem: 'kampilan_sword',
        emitTags: ['merc_contract_fulfilled', 'rep_karakoa_ally', 'karakoa_smuggler']
      },
      onFail: {
        hp: -2,
        heatDelta: 15,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Moral Choice: Sever the ropes of the captured slaves while the pirates are in a drunken stupor',
      complexity: 'clever',
      minInt: 11,
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Slicing the abaca bonds with deft speed, you guide the captives into the sea-vines and help them flee into the mangroves! The freed souls promise to sing your praises to the coastal Rajahnate, though Datu Magat swears eternal vengeance!'
      ],
      failStory: [
        'A drunken sentry drops his coconut bowl and shouts the alarm! A thrown spear grazes your thigh as you sprint into the dark mangroves!'
      ],
      onSuccess: {
        remnants: 6,
        emitTags: ['defied_sea_raiders', 'rep_karakoa_enemy', 'rep_rajahnate_ally', 'steady_nerves']
      },
      onFail: {
        hp: -4,
        heatDelta: 25,
        applyCondition: { id: 'bleeding_wound', bodyPart: 'Leg / Thigh' },
        emitTags: ['wounded', 'defied_sea_raiders', 'rep_karakoa_enemy']
      }
    },
    {
      text: 'Trade with the pirate quartermaster for black-market goods and rare supplies',
      blockedByTag: 'rep_karakoa_enemy',
      requiredPiloncitos: 6,
      check: null,
      successStory: [
        'Exchanging 6 piloncitos with the quartermaster, you acquire a sturdy Hemp Utility Belt and two bundles of sharpened bamboo stakes.'
      ],
      onSuccess: {
        remnants: -6,
        addItem: 'hemp_utility_belt',
        emitTags: ['peaceful_trade']
      }
    }
  ]
});

// 3.2 The Karakoa River Blockade
NarrativeRegistry.registerMiscScenario({
  id: 'faction_karakoa_river_blockade_01',
  locationLabel: 'The Outrigger Barricade at the Mangrove Bend',
  environment: 'MANGROVE',
  weather: 'ANY',
  baseWeight: 0.16,
  ambush: true,
  pressureTimer: 5000,
  reactionTimer: 5,
  intrinsicTags: ['spice_of_life', 'pirate_ambush', 'river_blockade', 'timawa_corsair'],

  affinityWeights: {
    rep_karakoa_enemy: 4.5,
    defied_sea_raiders: 4.0
  },

  seamlessHooks: {
    default:
      'A sleek black war-boat surges across the river bend, its outriggers slamming shut against your route!'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'You spot thorn-weighted drag nets submerged just below the water line before you step into them.',
    fail:
      'Rattan ropes snap tight across the river current, pinning you against the muddy bank.'
  },

  prompt: [
    'Timawa sea-raiders leap from their outriggers brandishing double-handed Kampilan swords and bamboo shields. "You crossed the Karakoa Brotherhood!" their leader snarls. "Your gear belongs to the deep!"'
  ],

  choices: [
    {
      text: 'Engage their master swordsman in single combat and shatter his wooden shield',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'STR', dc: 14 },
      successStory: [
        'Parrying his fierce downward chop, you smash your hilt across his helm! The pirate champion falls into the river, and the rest of the crew scrambles back onto their boat in terror, dropping 5 Piloncitos!'
      ],
      failStory: [
        'The curved Kampilan hacks through your guard, slicing across your shoulder before you tumble into the river mud!'
      ],
      onSuccess: {
        remnants: 5,
        addItem: 'rattan_staff',
        emitTags: ['steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -4,
        heatDelta: 15,
        applyCondition: { id: 'bleeding_wound', bodyPart: 'Shoulder' },
        emitTags: ['wounded', 'muddy_ground']
      }
    },
    {
      text: 'Sever the barricade ropes and maneuver swiftly downstream through the narrow shallows',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'Slashing the net ropes in one fluid swipe, you vault across their outrigger and speed downstream, leaving the lumbering war-boat trapped in the tangled mangrove roots.'
      ],
      failStory: [
        'Your foot catches in a submerged net line, dragging you underwater as the pirates rain spears down into the foam!'
      ],
      onSuccess: {
        emitTags: ['cautious', 'high_ground']
      },
      onFail: {
        hp: -3,
        heatDelta: 10,
        emitTags: ['wounded', 'soaked_gear']
      }
    }
  ]
});

// ============================================================================
// 4. THE SECRET LINEAGE OF THE NIGHT (ASWANG-INFILTRATED SETTLEMENT)
// ============================================================================

// 4.1 Barrio Silim at Twilight
NarrativeRegistry.registerMiscScenario({
  id: 'faction_aswang_village_dusk_01',
  locationLabel: 'Barrio Silim at Twilight',
  environment: 'VILLAGE',
  weather: 'ANY',
  timeOfDay: 'DUSK',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'aswang_village_dusk', 'settlement_edge', 'dark_lineage'],

  affinityWeights: {
    rep_aswang_cult_ally: 3.5,
    rep_aswang_cult_enemy: 3.0,
    night_lineage_initiate: 4.0
  },

  seamlessHooks: {
    default:
      'Smoke curls from clay stoves in Barrio Silim as villagers gather around the communal rice-threshing floor at dusk.'
  },

  passive: {
    stat: 'WIS',
    dc: 15,
    success:
      'You notice that none of the cooked pork or rice on the feast tables contains salt, and the village elders cast inverted pupil reflections in the water jars: this entire settlement secretly shares the Aswang blood-lineage!',
    fail:
      'The villagers smile warmly and urge you to share in their evening supper.'
  },

  prompt: [
    'By all appearances, Barrio Silim is a peaceful agricultural settlement of friendly farmers and weavers. Yet beneath the hospitable smiles of elder Datu Lando and his kin lies a guarded secret: the entire clan practices nocturnal severed-torso and weredog transformations once the full moon rises.',
    'Datu Lando invites you to his veranda: "We value discretion, wanderer. Those who walk in harmony with the night never lack for wealth or safety."'
  ],

  choices: [
    {
      text: 'Privately murmur the covert lineage password and offer 6 Piloncitos for forbidden alchemical secrets',
      complexity: 'clever',
      minInt: 11,
      requiredPiloncitos: 6,
      blockedByTag: 'rep_aswang_cult_enemy',
      lockReason: 'Barred: The Secret Lineage has marked you for nocturnal harvest',
      check: null,
      successStory: [
        'Datu Lando smiles, revealing needle-sharp canines, and clasps your wrist in dark kinship. He gifts you a flask of dark alchemical coconut oil and promises that nocturnal hunters will spare your camp during your journey!'
      ],
      onSuccess: {
        remnants: -6,
        addItem: 'blessed_lana_vial',
        heatDelta: -30,
        emitTags: ['rep_aswang_cult_ally', 'night_lineage_initiate', 'dark_alchemy_access']
      }
    },
    {
      text: 'Politely decline their feast and slip away quietly into the banana groves before moonrise',
      complexity: 'basic',
      check: null,
      successStory: [
        'Making a courteous excuse about night errands, you back away with hand on hilt and melt into the roadside banana groves before the sunset fade is complete.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'steady_nerves']
      }
    },
    {
      text: 'Moral Choice: Scatter coarse salt across the feast table and denounce the clan as nocturnal predators!',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'WIS', dc: 13 },
      successStory: [
        'Hurls a fistful of coarse sea salt straight across the communal food! Screaming in demonic agony as the salt burns their disguised skin, the elders hiss and scramble up into the rafters! You grab a dropped purse of 7 Piloncitos, but the clan marks your scent forever!'
      ],
      failStory: [
        'Before your salt can strike, Datu Lando whips around with supernatural speed, raking your shoulder with razor talons before you can break free!'
      ],
      onSuccess: {
        remnants: 7,
        heatDelta: 25,
        emitTags: ['rep_aswang_cult_enemy', 'marked_for_harvest', 'clear_sky']
      },
      onFail: {
        hp: -4,
        heatDelta: 30,
        applyCondition: { id: 'bleeding_wound', bodyPart: 'Shoulder' },
        emitTags: ['wounded', 'rep_aswang_cult_enemy', 'marked_for_harvest']
      }
    }
  ]
});

// 4.2 The Midnight Stalkers of Barrio Silim
NarrativeRegistry.registerMiscScenario({
  id: 'faction_aswang_cult_night_raid_01',
  locationLabel: 'The Midnight Stalkers of Barrio Silim',
  environment: 'OUTDOOR',
  weather: 'ANY',
  timeOfDay: 'NIGHT',
  baseWeight: 0.16,
  ambush: true,
  pressureTimer: 5000,
  reactionTimer: 5,
  intrinsicTags: ['spice_of_life', 'cult_night_raid', 'aswang_complex', 'midnight_stalker'],

  affinityWeights: {
    rep_aswang_cult_enemy: 4.5,
    marked_for_harvest: 4.0
  },

  seamlessHooks: {
    default:
      'Leathery wingbeats and guttural canine snarls surround your night trail as the moon breaks through the clouds.'
  },

  passive: {
    stat: 'WIS',
    dc: 14,
    success:
      'You spot two black-hound Ungo weredogs flanking your rear while a winged matriarch hovers overhead!',
    fail:
      'Red glowing eyes ignite in the darkness of the banana grove seconds before the assault.'
  },

  prompt: [
    'Under the moonlight, the elders and warriors of Barrio Silim reveal their true monstrous nature! Viscera-trailing flyers and black-furred beasts lunge simultaneously to harvest your flesh for defying their secret.'
  ],

  choices: [
    {
      text: 'Brandish your burning Resin Torch and scatter coarse salt in a defensive ring',
      requiredTag: 'has_light_source',
      itemActionTag: 'Equipped // Fire & Salt Ward',
      check: null,
      successStory: [
        'Fire and salt create an impassable folkloric barrier! Shrieking in pain as the flames scorch their wings and salt burns their fur, the transformed cultists break off the attack and scatter into the dark!'
      ],
      onSuccess: {
        remnants: 5,
        addItem: 'coarse_salt_pouch',
        emitTags: ['steady_nerves', 'salt_ward']
      }
    },
    {
      text: 'Stand your ground with an Aswang-bane spear and pierce the lead weredog heart',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'STR', dc: 14 },
      successStory: [
        'With unflinching resolve, you thrust your spear through the lunging beast! It howls in agony and crashes into the underbrush, sending the rest of the pack fleeing in terror!'
      ],
      failStory: [
        'The hound slams through your guard, tearing your forearm before you drive it back with a pommel strike!'
      ],
      onSuccess: {
        remnants: 6,
        addItem: 'boar_hide_gloves',
        emitTags: ['steady_nerves', 'high_ground']
      },
      onFail: {
        hp: -4,
        heatDelta: 15,
        applyCondition: { id: 'infected_aswang_bite', bodyPart: 'Forearm' },
        emitTags: ['wounded', 'raining']
      }
    }
  ]
});

// ============================================================================
// 5. THE MOUNTAIN HEADHUNTERS (CORDILLERA / INLAND BRAVES)
// ============================================================================

// 5.1 The Painted Skull Marker of Mount Pulag Ridge
NarrativeRegistry.registerMiscScenario({
  id: 'faction_headhunters_karst_pass_01',
  locationLabel: 'The Painted Skull Marker of Mount Pulag Ridge',
  environment: 'OUTDOOR',
  weather: 'ANY',
  baseWeight: 0.24,
  intrinsicTags: ['spice_of_life', 'mountain_pass_safe', 'inland_braves_trade', 'cordillera_truce'],

  affinityWeights: {
    rep_headhunters_ally: 3.5,
    rep_headhunters_enemy: 3.0,
    mountain_truce: 4.0
  },

  seamlessHooks: {
    default:
      'High above the clouds along the razor karst ridge stands a carved narra pole crowned with a boar skull painted in red ochre.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'You spot three inland braves wearing dyed bark-cloth and boar-tusk collars watching you silently from the limestone pinnacles.',
    fail:
      'The faint smell of wild ginger and mountain tobacco drifts down from the rocks.'
  },

  prompt: [
    'The mountain braves of the Cordillera peaks stand guard over the sacred copper trails and cloud passes. Fiercely protective of their ancestral territory, their brass-tipped headhunter axes and horn-bows command respect across the high highlands.',
    'Their leader steps forward onto the rock, raising his palm in an ancient territorial challenge.'
  ],

  choices: [
    {
      text: 'Perform the sacred Blood-Truce ritual by offering mountain salt and unsmoked tobacco',
      complexity: 'tactical',
      minInt: 10,
      blockedByTag: 'rep_headhunters_enemy',
      lockReason: 'The Mountain Headhunters have marked you for trophy-taking and refuse all truce',
      check: { stat: 'CON', dc: 13 },
      successStory: [
        'You endure the solemn blood-token ritual without flinching, exchanging tobacco and salt with the mountain braves. They clasp your shoulders as a brother of the heights, granting safe passage and gifting rare medicinal Bayabas Herbs!'
      ],
      failStory: [
        'Your unsteady hands reveal hesitation; the braves judge your spirit unworthy and demand a hefty toll of coins to pass.'
      ],
      onSuccess: {
        addItem: 'bayabas_herbs',
        emitTags: ['rep_headhunters_ally', 'mountain_truce', 'steady_nerves']
      },
      onFail: {
        remnants: -4,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Display your warrior battle scars and recount deeds of slaying predatory beasts',
      complexity: 'tactical',
      minInt: 10,
      blockedByTag: 'rep_headhunters_enemy',
      check: { stat: 'CHA', dc: 13 },
      successStory: [
        'Your tale of slaying archipelagic horrors stirs their warrior spirit! The braves salute your courage, gift you a pair of Boar-Hide Gloves, and guide you past their hidden punji pits.'
      ],
      failStory: [
        'They scoff at your boasting, deeming you an arrogant lowlander, and warn you to tread with care.'
      ],
      onSuccess: {
        addItem: 'boar_hide_gloves',
        emitTags: ['rep_headhunters_ally', 'high_ground']
      },
      onFail: {
        emitTags: ['cautious']
      }
    },
    {
      text: 'Draw your weapon aggressively and trespass across their sacred boundary pole',
      complexity: 'basic',
      check: null,
      successStory: [
        'You shove past the boundary skull with naked steel held high! The braves leap backward into the mist with fierce war cries, vanishing into the cliffs: you have made a lethal blood-enemy of the mountain clans!'
      ],
      onSuccess: {
        heatDelta: 25,
        emitTags: ['rep_headhunters_enemy', 'marked_for_headhunting', 'fog_gathering']
      }
    }
  ]
});

// 5.2 The Punji Ravine of the Cloud Spire
NarrativeRegistry.registerMiscScenario({
  id: 'faction_headhunters_punji_ambush_01',
  locationLabel: 'The Punji Ravine of the Cloud Spire',
  environment: 'OUTDOOR',
  weather: 'SPIRIT FOG',
  baseWeight: 0.16,
  ambush: true,
  pressureTimer: 5000,
  reactionTimer: 5,
  intrinsicTags: ['spice_of_life', 'headhunter_ambush', 'punji_trap', 'mountain_raider'],

  affinityWeights: {
    rep_headhunters_enemy: 4.5,
    marked_for_headhunting: 4.5
  },

  seamlessHooks: {
    default:
      'A concealed rattan tripwire twangs against your boot as poisoned blowdarts hiss from the bamboo canopy!'
  },

  passive: {
    stat: 'WIS',
    dc: 14,
    success:
      'You spot the camouflaged fern cover concealing a deadly pit of fire-hardened bamboo punji stakes!',
    fail:
      'The false earth crumbles beneath your feet as poison darts whistle past your cheek.'
  },

  prompt: [
    'The mountain headhunters have laid a lethal ambush along the narrow cliff ledge! A pit of fire-hardened bamboo spikes yawns beneath the crumbling trail while concealed blowdart snipers target your vitals from the misty rocks above.'
  ],

  choices: [
    {
      text: 'Vault across the hidden punji pit onto high solid bedrock with acrobatic precision',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Leaping with mountain agility, you clear the punji trap cleanly and take cover behind solid limestone, forcing the snipers to retreat into the higher clouds!'
      ],
      failStory: [
        'Your foot slips on the crumbling ledge! You tumble into the edge of the pit; sharp bamboo spikes tear into your calf before you drag yourself free!'
      ],
      onSuccess: {
        remnants: 5,
        addItem: 'carabao_leather_sandals',
        emitTags: ['steady_nerves', 'high_ground']
      },
      onFail: {
        hp: -4,
        heatDelta: 15,
        applyCondition: { id: 'bleeding_wound', bodyPart: 'Leg / Calf' },
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Brace your Salakot hat and shield against the darts and spot the sniper firing positions',
      check: { stat: 'WIS', dc: 13 },
      successStory: [
        'Deflecting the poisonous darts off your shield, your keen eyes pinpoint the sniper positions and you drive them back with well-aimed stones!'
      ],
      failStory: [
        'A poisoned dart pierces through your sleeve, sending a sickening wave of mountain venom through your veins!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves', 'high_ground']
      },
      onFail: {
        hp: -3,
        heatDelta: 20,
        applyCondition: { id: 'infected_aswang_bite', bodyPart: 'Forearm' },
        emitTags: ['wounded']
      }
    }
  ]
});

