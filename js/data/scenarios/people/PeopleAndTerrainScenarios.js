/**
 * js/data/scenarios/people/PeopleAndTerrainScenarios.js
 * People, encounters, hearth tales, and hazardous terrain scenarios:
 * - Skilled craftsmen, salt gatherers, and rescued weavers
 * - Highway bandits, slick peddlers, and suspicious elders
 * - Campfires, starlit lookouts, and hearth storytelling chill moments
 * - Rattan chasm bridges, mangrove mires, and razor karst needles
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

NarrativeRegistry.registerMiscScenario({
  id: 'misc_blind_potter_01',
  locationLabel: 'Smoking Clay Kiln by the Bamboo Grove',
  environment: 'CABIN',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'social_encounter', 'settlement_edge'],

  affinityWeights: {
    clear_sky: 0.3,
    raining: 0.25,
    cautious: 0.2
  },

  seamlessHooks: {
    raining:
      'The scent of baking red earth and wet woodsmoke cuts through the chill rain, drawing you to the thatched shed of a hillside clay kiln.',
    fog_gathering:
      'Warm orange light spills from a domed earth oven into the curling river fog.',
    clear_sky:
      'Sunlight warms rows of burnished terracotta cooking pots cooling outside a humble bamboo shed.',
    default:
      'A low smokehouse and potter wheel stand beside the road, where an old artisan shapes river clay with rhythmic hands.'
  },

  passive: {
    stat: 'WIS',
    dc: 12,
    success:
      'You note the artisan milky white eyes and calm, deliberate breathing; though blind, his ears track your footsteps on the gravel.',
    fail:
      'The rhythmic scrape of the wooden shaping tool against wet clay echoes through the warm shed.'
  },

  prompt: [
    'Inside the open-sided kiln shed, an elderly potter named Tandang Simeon shapes a graceful clay water jar upon a foot-spun wooden wheel. His sightless eyes gaze peacefully toward the rafters, guided entirely by touch and years of craft.',
    '"Step into the dry, traveler," Simeon calls out gently over the crackle of the wood fire. "The roads are cruel under the darkening sky. Come warm your hands, or share a cup of clean rainwater before you move on."'
  ],

  choices: [
    {
      text: 'Sit respectfully by the warm kiln, share news of the trail, and accept a drink of fresh water',
      check: null,
      successStory: [
        'Sitting on a low bamboo bench, you drink cold rainwater from a freshly fired clay bowl and tell Simeon of the swollen rivers behind you. Touched by your unhurried courtesy, the old craftsman presses a small fired clay hearth-talisman into your sash, imparting a quiet calm.'
      ],
      onSuccess: {
        hp: 3,
        emitTags: ['well_rested', 'kapwa_bond', 'clear_sky']
      }
    },
    {
      text: 'Offer to fetch dry hardwood logs from the woodpile to replenish his kiln fire',
      check: { stat: 'STR', dc: 12 },
      successStory: [
        'You haul three heavy bundles of seasoned kamagong logs under the dry eaves before the dampness spoils them. Simeon smiles warmly, handing you a jar of soothing river-clay ointment that knits your trail scrapes.'
      ],
      failStory: [
        'A rotten cord on the woodpile snaps, spilling split logs across your shin, though you still manage to stack enough fuel for his evening firing.'
      ],
      onSuccess: {
        addItem: 'herbal_poultice',
        emitTags: ['kapwa_bond', 'steady_nerves']
      },
      onFail: {
        hp: -2,
        emitTags: ['kapwa_bond', 'cautious']
      }
    },
    {
      text: 'Politely thank the potter from the threshold and continue along your road',
      check: null,
      successStory: [
        'You offer a courteous greeting, let the warm air of the kiln refresh your senses, and continue along the gravel track.'
      ],
      onSuccess: {
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_salt_widow_01',
  locationLabel: 'Brine Pools of the Coastal Marsh',
  weather: 'ANY',
  baseWeight: 0.2,
  intrinsicTags: ['spice_of_life', 'social_encounter', 'salt_ward'],

  affinityWeights: {
    clear_sky: 0.25,
    status_poor: 0.25,
    muddy_ground: 0.2
  },

  seamlessHooks: {
    raining:
      'Wading past the salt pans, you see a lone woman frantically covering bamboo crystallization troughs with woven mats against the rain.',
    default:
      'Beside the tidal salt pans, a sun-weathered woman scrapes coarse gray crystals into flat woven baskets.'
  },

  passive: {
    stat: 'INT',
    dc: 12,
    success:
      'The coarse sea salt she gathers is naturally dense and mineral-rich, prized across the islands for cooking and spirit-warding alike.',
    fail:
      'The sharp brine stinging your nostrils masks the faint rustle of the coastal wind.'
  },

  prompt: [
    'A solitary fisher-widow named Manang Elena works tirelessly beneath a frayed nipa sun-shade, raking coarse salt crystals into woven panniers. The brine has cracked her palms, yet she works with steady resolve to feed her grandchildren in the settlement upriver.',
    'She glances up from her troughs with tired but welcoming eyes, offering to trade or speak with anyone passing the tidal dike.'
  ],

  choices: [
    {
      text: 'Help Manang Elena rake and bag her salt before the tide floods the lower troughs',
      check: { stat: 'CON', dc: 12 },
      successStory: [
        'Working shoulder to shoulder under the heavy salt air, you help her fill three heavy panniers and drag them to high ground. In deep gratitude, she ties a pouch of consecrated coarse sea salt into your sash and sketches a protective blessing.'
      ],
      failStory: [
        'The stinging salt dust and heavy panniers strain your back, though Elena thanks you warmly and hands you a small handful of clean coarse crystals.'
      ],
      onSuccess: {
        addItem: 'coarse_salt_pouch',
        emitTags: ['salt_ward', 'kapwa_bond', 'clear_sky']
      },
      onFail: {
        hp: -2,
        addItem: 'coarse_salt_pouch',
        emitTags: ['salt_ward', 'cautious']
      }
    },
    {
      text: 'Exchange 2 Piloncitos for a pouch of fresh coarse sea salt for your journey',
      check: null,
      successStory: [
        'You hand over a pair of gold piloncitos; Manang Elena blesses your coins and hands you a tightly bound abaca pouch of dry coarse salt.'
      ],
      onSuccess: {
        piloncitos: -2,
        addItem: 'coarse_salt_pouch',
        emitTags: ['salt_ward', 'kapwa_bond']
      }
    },
    {
      text: 'Offer a respectful nod and keep your stride along the raised dike',
      check: null,
      successStory: [
        'You leave the salt gatherer to her work, keeping your boots on the dry ridge of the causeway.'
      ],
      onSuccess: {
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_captive_weavers_01',
  locationLabel: 'Overgrown Ravine Camp of the Forest Raiders',
  environment: 'TENT',
  weather: 'ANY',
  baseWeight: 0.18,
  intrinsicTags: ['spice_of_life', 'people_in_need', 'captive_rescue'],

  affinityWeights: {
    fog_gathering: 0.3,
    cautious: 0.25,
    forest_edge: 0.2
  },

  seamlessHooks: {
    default:
      'Following a faint trail of severed abaca threads, you stumble upon a concealed ravine camp where two bound captives kneel in the dirt.'
  },

  passive: {
    stat: 'INT',
    dc: 13,
    success:
      'The raiders have stepped away to track a deer, leaving their captives bound to a sled with coarse rattan cordage.',
    fail:
      'The quiet in the ravine feels fragile, like a tripwire waiting to snap.'
  },

  prompt: [
    'Tied back-to-back to the runners of a heavy timber cargo sled are two village abaca weavers, their wrists bruised by coarse green rattan cords. The raiders bedrolls are still warm around an unbanked fire pit, but the lookouts seem momentarily distracted down the ravine.',
    'The younger weaver catches your eye through the ferns, shaking her head urgently toward the ridge to warn of returning footsteps.'
  ],

  choices: [
    {
      text: 'Slice the rattan bonds in one clean stroke with your equipped Blade',
      requiredTag: 'armed_blade',
      itemActionTag: 'Equipped // Blade Severance',
      check: null,
      successStory: [
        'Stepping through the brush without a sound, you flick your keen blade across the rattan cord. The grateful weavers slip their bonds, hand you a tightly rolled Woven Abaca Baro Tunic from their stolen cargo, and vanish into the underbrush with you!'
      ],
      onSuccess: {
        addItem: 'abaca_tunic',
        emitTags: ['steady_nerves', 'high_ground', 'clear_sky']
      }
    },
    {
      text: 'Creep into the camp and carefully untie the complex knots before the raiders return',
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Working with rapid, silent precision, you loosen the hemp hitches and lead both captives up the ridge path seconds before rough voices echo below!'
      ],
      failStory: [
        'A snapped dry branch alerts a returning raider scout; an arrow grazes your shoulder as you hustle the weavers into the ferns!'
      ],
      onSuccess: {
        addItem: 'ripped_sheets',
        emitTags: ['cautious', 'high_ground']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded', 'cautious']
      }
    },
    {
      text: 'Slip back into the brush and do not intervene in the raider affairs',
      check: null,
      successStory: [
        'Recognizing the danger of an outnumbered skirmish, you back away silently and leave the ravine behind.'
      ],
      onSuccess: {
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_slick_peddler_01',
  locationLabel: 'Crossroads of the Hanging Balete',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'social_encounter', 'shady_merchant'],

  affinityWeights: {
    clear_sky: 0.25,
    status_rich: 0.35,
    status_well_known: 0.2
  },

  seamlessHooks: {
    default:
      'At a three-way trail crossing, a traveler with a polished smile and a velvet-lined wooden tray beckons from beneath an umbrella tree.'
  },

  passive: {
    stat: 'INT',
    dc: 14,
    success:
      'You spot the faint seam lines on his "sacred brass mutya" medallions: they are cheap cast lead dipped in brass wash, entirely devoid of spiritual resonance.',
    fail:
      'The brass baubles gleam temptingly in the afternoon light, their etched symbols looking convincingly archaic.'
  },

  prompt: [
    'A charismatic wanderer dressed in dyed cotton wraps introduces himself as Maestro Gorio, claiming to have studied under the mountain hermits of Mount Banahaw. He displays an array of gleaming "authentic" Anting-Anting talismans, claiming they render the wearer immune to aswang teeth and lightning alike.',
    '"Only 4 Remnants for the protection of the high gods, traveler!" Gorio purrs, adjusting the velvet cloth over his wares with practiced grace.'
  ],

  choices: [
    {
      text: 'Call out his fraudulent lead trinkets using your knowledge of real metallurgy and folklore',
      check: { stat: 'INT', dc: 13 },
      successStory: [
        'You point out the soft lead edges and the upside-down Baybayin lettering on his amulets. Pale and stammering, Gorio realizes he has met someone who knows the craft; to keep you quiet, he hands over a genuine pouch of medicinal herbs and scuttles down the road!'
      ],
      failStory: [
        'Your argument stumbles over regional dialect terms; Gorio loudly turns the nearby wayfarers against you with mocking laughter, leaving you to depart in irritation.'
      ],
      onSuccess: {
        addItem: 'bayabas_herbs',
        emitTags: ['steady_nerves', 'lore_enriched']
      },
      onFail: {
        emitTags: ['cautious']
      }
    },
    {
      text: 'Out-talk the peddler with silver-tongued charm and barter for his real personal supply pouch',
      check: { stat: 'CHA', dc: 14 },
      successStory: [
        'Matching his banter word for word, you flatter his salesmanship while subtly cornering his trade terms. Laughing in defeat, Gorio trades a real roll of Waxed Rain-Cape fabric for a mere single remnant!'
      ],
      failStory: [
        'He talks circles around your offer, slickly pocketing 3 of your remnants for a trinket that rubs off black on your fingers.'
      ],
      onSuccess: {
        piloncitos: -1,
        addItem: 'waxed_rain_cape',
        emitTags: ['kapwa_bond', 'clear_sky']
      },
      onFail: {
        piloncitos: -3,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Pay 4 Piloncitos for what he claims is a blessed brass talisman',
      check: null,
      successStory: [
        'You hand over 4 piloncitos and pocket the brass piece. It feels heavy and cool in your hand, though you suspect its greatest power is the confidence it lends your stride.'
      ],
      onSuccess: {
        piloncitos: -4,
        addItem: 'tanso_agimat',
        emitTags: ['cautious']
      }
    },
    {
      text: 'Ignore the fast-talking merchant completely and walk past without a word',
      check: null,
      successStory: [
        'Keeping your hands on your money pouch, you walk past the crossroads without breaking your stride.'
      ],
      onSuccess: {
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_weeping_orphan_pickpocket_01',
  locationLabel: 'Dusty Roadside Milestone',
  weather: 'ANY',
  baseWeight: 0.18,
  intrinsicTags: ['spice_of_life', 'social_encounter', 'deceptive_street'],

  affinityWeights: {
    status_rich: 0.3,
    status_well_known: 0.25,
    clear_sky: 0.2
  },

  seamlessHooks: {
    default:
      'Beside a carved milestone, a ragged youth in tattered abaca sits sobbing into his knees, holding an empty woven basket.'
  },

  passive: {
    stat: 'WIS',
    dc: 14,
    success:
      'You notice the boy eyes darting repeatedly toward your waist sash, and his tears dry the instant someone looks away: this is an apprentice pickpocket.',
    fail:
      'The sight of a motherless child shivering alone by the milestone tugs painfully at your conscience.'
  },

  prompt: [
    'A disheveled boy no older than twelve rubs his red eyes, sobbing that wild hogs raided his family garden cart and left him with nothing to take back to his sick grandmother. As you slow your pace, he stumbles toward you with outstretched hands as if seeking comfort.',
    'His quick fingers hover inches from the ties of your pack.'
  ],

  choices: [
    {
      text: 'Catch the boy wrist mid-swipe and firmly lecture him without resorting to violence',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'Your hand snaps out like iron, clamping around his wrist before his fingers can touch your sash! Caught red-handed, the boy bursts into genuine tears, admits he was sent by older thieves up the road, and hands over a stolen brass knife ring to buy your mercy.'
      ],
      failStory: [
        'You swat at his hand a second too late; the nimble street-urchin slips 2 of your piloncitos into his palm and dashes like a lizard into the thicket!'
      ],
      onSuccess: {
        addItem: 'iron_nail_ring',
        emitTags: ['steady_nerves', 'cautious']
      },
      onFail: {
        piloncitos: -2,
        hp: 0,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Offer the boy food and gentle guidance, showing him you see through his act with compassion',
      check: { stat: 'CHA', dc: 13 },
      successStory: [
        'Looking him square in the eye, you share a handful of dried fruit and tell him you know how hard survival is on the roads. Stunned by your kindness, the boy pulls his hands back in shame, warns you of a bandit toll-gate half a league ahead, and bows deeply.'
      ],
      failStory: [
        'While your eyes soften in sympathy, his sly fingers snatch 2 piloncitos from your side before he runs into the ditch!'
      ],
      onSuccess: {
        emitTags: ['kapwa_bond', 'cautious', 'steady_nerves']
      },
      onFail: {
        piloncitos: -2,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Step wide around the boy and give the milestone a broad berth',
      check: null,
      successStory: [
        'Sensing trouble of one kind or another, you keep to the far side of the road and walk on without pausing.'
      ],
      onSuccess: {
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_ridge_bandits_01',
  locationLabel: 'Felled Narra Trunk across the Mountain Pass',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'bandit_ambush', 'perilous_road'],

  affinityWeights: {
    status_rich: 0.3,
    status_powerful: 0.25,
    cautious: 0.2
  },

  seamlessHooks: {
    raining:
      'Rain streams off a colossal felled tree blocking the narrow pass, where three armed figures step out from beneath oilskin canopies.',
    fog_gathering:
      'Shapes armed with jagged bolos and rattan shields coalesce out of the thick mountain mist.',
    default:
      'A massive hardwood log blocks the mountain cutting, manned by three rough-looking highwaymen with bared blades.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'You notice their bolos are nicked from clearing brush rather than killing, and their eyes show more hunger than malice: these are desperate deserters, not bloodthirsty assassins.',
    fail:
      'The glint of three heavy machetes in the narrow defile makes your blood run cold.'
  },

  prompt: [
    'Three rugged outlaws in ragged woven vests stand astride the fallen narra trunk. Their leader, a scarred man holding a notched bolo, raises his palm.',
    '"No one takes the ridge road without paying the Datu toll, traveler," he rasps, nodding to his companions who ready their rattan bucklers. "Five Remnants, or you leave your pack behind."'
  ],

  choices: [
    {
      text: 'Draw your weapon with authority and intimidate the bandits into standing down',
      check: { stat: 'STR', dc: 14 },
      successStory: [
        'You step forward with thunderous poise and drive your steel into the fallen log with a crack that shakes the wood! Seeing your battle-hardened resolve, the outlaws exchange nervous glances, step off the trunk, and wave you past with muttered apologies.'
      ],
      failStory: [
        'They refuse to be bluffed; a fierce scuffle erupts in the mud, and though you fight your way past the log, a grazing blade leaves a gash across your forearm.'
      ],
      onSuccess: {
        emitTags: ['status_powerful', 'steady_nerves', 'high_ground']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded', 'cautious']
      }
    },
    {
      text: 'Offer 3 Piloncitos calmly, bargaining down their toll as a contribution between travelers',
      check: { stat: 'CHA', dc: 13 },
      successStory: [
        'Treating the leader with respectful dignity, you toss him 3 piloncitos and wish him dry weather. Surprised by your calm honor, the leader accepts the coins, points out an upcoming washed-out bridge, and clears the log for you.'
      ],
      failStory: [
        'They sneer at your offer and demand the full 5 remnants, shoving you roughly as you hand over the silver.'
      ],
      onSuccess: {
        piloncitos: -3,
        emitTags: ['kapwa_bond', 'high_ground']
      },
      onFail: {
        piloncitos: -5,
        hp: -1,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Vault over the ditch and sprint past their flank before they can close ranks',
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Using the log branch as a springboard, you leap clear over the ambush line in a flash of speed, landing lightly on the road ahead and outdistancing their pursuit effortlessly!'
      ],
      failStory: [
        'Your foot slips on the wet bark; an outlaw club catches your shoulder before you tumble into the brush and scramble free down the road!'
      ],
      onSuccess: {
        emitTags: ['high_ground', 'steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded']
      }
    },
    {
      text: 'Turn on your heel and take a steep rocky goat-path around the mountain cutting',
      check: null,
      successStory: [
        'Refusing to pay extortion or risk battle, you take a slow, arduous detour over the rocky upper slopes, bypassing the roadblock entirely.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'high_ground']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_aswang_elder_well_01',
  locationLabel: 'Mossy Village Well at Twilight',
  environment: 'CABIN',
  weather: 'ANY',
  baseWeight: 0.16,
  intrinsicTags: ['spice_of_life', 'aswang_complex', 'mimic_encounter'],

  affinityWeights: {
    fog_gathering: 0.35,
    cautious: 0.25
  },

  seamlessHooks: {
    default:
      'At an abandoned stone water-well outside a cluster of deserted huts, a lone grandmother sits on a wooden stool peeling ginger roots.'
  },

  passive: {
    stat: 'WIS',
    dc: 15,
    success:
      'You notice her pupil reflections are upside-down in the water bucket, and she casts no shadow toward the wall: this is an Aswang weredog mimic testing your guard!',
    fail:
      'The hunched old woman looks fragile and harmless as she hums a lullaby by the well.'
  },

  prompt: [
    'The sweet smell of boiled ginger hangs around the mossy well curb where an elderly woman smiles toothlessly at you. "Rest your weary legs, grandchild," she murmurs, gesturing toward a low rattan stool beside her. "Drink from my ladle before the night cold takes your throat."',
    'Beside her bucket lies a bundle of wild garlic and a hollow bamboo stake, left behind by whoever lived here before the village emptied.'
  ],

  choices: [
    {
      text: 'Expose the mimic by flinging coarse salt and crushed garlic from your pack directly into her face',
      requiredItem: 'coarse_salt_pouch',
      itemActionTag: 'Item // Coarse Salt Ward',
      check: null,
      successStory: [
        'The moment the consecrated salt grains strike her skin, the sweet illusion melts away with a sickening hiss! Screeching in demonic agony, the weredog twists into a feral black canine form and flees howling into the bamboo thicket, leaving behind a dropped pouch of 6 piloncitos!'
      ],
      onSuccess: {
        piloncitos: 6,
        emitTags: ['salt_ward', 'steady_nerves', 'clear_sky']
      }
    },
    {
      text: 'Test her reflection in the well water and brandish your weapon the moment her facade slips',
      check: { stat: 'WIS', dc: 14 },
      successStory: [
        'Catching her inverted reflection in the bucket, you immediately draw steel! Startled that her glamour failed, the creature recoils, snarls with yellow fangs, and scuttles over the stockade wall into the dark.'
      ],
      failStory: [
        'You step too close before verifying her eyes; razor-sharp claws erupt from her wrinkled hands, tearing your forearm before you drive her back with your blade!'
      ],
      onSuccess: {
        piloncitos: 4,
        emitTags: ['steady_nerves', 'cautious']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Lunge for the bundle of wild garlic and brandish the sharpened bamboo stake to ward off the mimic while backing away',
      complexity: 'tactical',
      check: { stat: 'DEX', dc: 12 },
      successStory: [
        'You feign moving toward the stool, then swiftly scoop up the wild garlic and level the sharpened bamboo stake at her throat! Sickened by the pungent garlic and wary of the puncturing bamboo, the creature hisses with a voice of tearing hide and retreats backward into the dark well-shadows, allowing you to withdraw safely.'
      ],
      failStory: [
        'You dive for the garlic bundle, but your fingers slip on the mossy flagstones. Before you can recover, the creature swats your arm aside with sudden monstrous strength, claws drawing blood before you roll backward and scramble clear into the mist!'
      ],
      onSuccess: {
        addItem: 'bagacay_bamboo_spear',
        heatDelta: -10,
        emitTags: ['steady_nerves', 'cautious']
      },
      onFail: {
        hp: -3,
        heatDelta: 15,
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Politely decline, murmur "Tabi-tabi po," and bow your head to the fragile-looking elder',
      complexity: 'basic',
      autoFail: true,
      folkloreTag: 'Animist Etiquette // Tabi-tabi po',
      failureTag: 'Misapplied Folklore',
      failStory: [
        'A raspy, guttural snicker curdles the evening air as the old woman\'s grin splits impossibly wide: "Tabi-tabi po? Do I look like a dirt-dwelling dwarf under a termite mound to you?!" Flesh-eating Aswang and cursed mimics feel only contempt for earth-spirit apologies. As you bow your head, razor talons slash across your chest, and the creature leaps into the mist with your blood on its claws!'
      ],
      onFail: {
        hp: -4,
        heatDelta: 15,
        applyCondition: { id: 'infected_aswang_bite', bodyPart: 'Chest / Ribs' },
        emitTags: ['wounded', 'careless', 'aswang_hunted']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_hunter_campfire_01',
  locationLabel: 'Sheltered Fire-Circle of the Dao Tree',
  environment: 'CABIN',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'chill_story', 'rest_hearth'],

  affinityWeights: {
    raining: 0.35,
    fog_gathering: 0.3,
    wounded: 0.35
  },

  seamlessHooks: {
    raining:
      'Seeking cover from the torrential rain, you find the colossal buttress roots of an ancient Dao tree sheltering a glowing campfire.',
    fog_gathering:
      'Warm woodsmoke curls through the fog where a hunter has banked a bed of coals between the tree roots.',
    default:
      'Between the massive flying buttresses of an ancient Dao tree, a peaceful campfire flickers against the dusk.'
  },

  passive: {
    stat: 'WIS',
    dc: 12,
    success:
      'Skulls of wild boar hang respectfully from the bark as offerings to the forest Anito, ensuring peace around the flames.',
    fail:
      'The quiet crackle of burning hardwood and roasting root-crops warms the evening air.'
  },

  prompt: [
    'A lone Mangyan hunter named Kiko sits cross-legged between the towering buttress roots of a giant Dao tree, tending a small iron kettle of boiling sweet potato tubers. Beside him rests a strung bamboo bow and bundles of dry palm thatch keeping the fire pit dry.',
    '"Come, sit," Kiko says quietly, gesturing toward an empty river stone by the hearth. "The forest is wide, but by the fire we are all brothers under the same sky. Tell me where your journey leads, or simply rest your feet."'
  ],

  choices: [
    {
      text: 'Sit by the flames, share a roasted tuber, and listen to the hunter tales of the forest spirits',
      check: null,
      successStory: [
        'You eat hot camote with Kiko as he tells ancient legends of the mountain diwatas who walk the ridge when the moon is thin. The warmth of the fire and the unhurried companionship restore your weary vitality completely.'
      ],
      onSuccess: {
        hp: 4,
        emitTags: ['well_rested', 'kapwa_bond', 'clear_sky']
      }
    },
    {
      text: 'Recite verses of your own lineage and background to honor the hunter campfire',
      check: { stat: 'CHA', dc: 12 },
      successStory: [
        'Your words ring true in the quiet grove. Pleased to hear honest song, Kiko gives you a bundle of dried wild bayabas tea leaves and shows you a safe trail through the upper pass.'
      ],
      failStory: [
        'Your voice falters under the weight of road exhaustion, but the hunter still smiles warmly and pours you a steaming cup of herbal broth.'
      ],
      onSuccess: {
        hp: 2,
        addItem: 'bayabas_herbs',
        emitTags: ['well_rested', 'kapwa_bond']
      },
      onFail: {
        hp: 2,
        emitTags: ['kapwa_bond']
      }
    },
    {
      text: 'Rest silently in the warmth of the buttress roots before stepping back into the night',
      check: null,
      successStory: [
        'Without words, you warm your hands, check your gear, and set out with renewed calm.'
      ],
      onSuccess: {
        hp: 2,
        emitTags: ['steady_nerves']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_stargazer_bluff_01',
  locationLabel: 'Bamboo Lookout Platform on the Coastal Bluff',
  environment: 'TENT',
  weather: 'CLEAR',
  baseWeight: 0.18,
  intrinsicTags: ['spice_of_life', 'chill_story', 'cosmic_lore'],

  affinityWeights: {
    clear_sky: 0.45,
    high_ground: 0.35
  },

  seamlessHooks: {
    clear_sky:
      'The storm clouds sweep away out to sea, unveiling a dazzling blanket of tropical stars reflected in the calm ocean below.',
    default:
      'A bamboo watch-platform rises on the cliff edge, open to the vast arch of the night sky.'
  },

  passive: {
    stat: 'INT',
    dc: 13,
    success:
      'The constellations overhead map out ancient Tagalog sea routes: Moroporo (the Pleiades) and Balatik (Orion) guide the seasonal voyagers.',
    fail:
      'The sea wind is cool and fragrant with salt, rustling the bamboo floor of the platform.'
  },

  prompt: [
    'An aged celestial navigator sits wrapped in an abaca malong atop the high cliff platform, tracing the stars with a notched ivory sighting stick. Below, the surf breaks softly against the coral headland in glowing ribbons of phosphorescence.',
    '"Look upward, traveler," the navigator whispers without turning. "The Bakunawa stirs in the ocean trench, yet the constellations still hold their course. Sit with me and watch the world turn."'
  ],

  choices: [
    {
      text: 'Sit quietly on the bamboo floorboards and contemplate the star-paths of the ancestors',
      check: null,
      successStory: [
        'In the peaceful hush above the ocean, you watch Moroporo climb above the eastern horizon. The quiet grandeur clears the fatigue from your mind and settles your spirit with deep fortitude.'
      ],
      onSuccess: {
        hp: 3,
        emitTags: ['well_rested', 'steady_nerves', 'clear_sky', 'high_ground']
      }
    },
    {
      text: 'Ask the navigator to teach you the signs of Balatik and the seasonal winds',
      check: { stat: 'INT', dc: 13 },
      successStory: [
        'The elder points out the celestial markers that warn of approaching squalls and spirit tides. The knowledge sharpens your survival instincts for the road ahead.'
      ],
      failStory: [
        'The complex stellar alignments swim in your tired vision, but the soothing rhythm of the ocean still calms your thoughts.'
      ],
      onSuccess: {
        emitTags: ['lore_enriched', 'steady_nerves', 'high_ground']
      },
      onFail: {
        hp: 1,
        emitTags: ['steady_nerves', 'high_ground']
      }
    },
    {
      text: 'Take in the view for a quiet breath and descend to the coastal path',
      check: null,
      successStory: [
        'You pause for a moment under the vast arch of stars, shoulder your pack, and continue your trek.'
      ],
      onSuccess: {
        emitTags: ['high_ground']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_overturned_cart_01',
  locationLabel: 'Muddy Gully at the Bamboo Bridge',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'people_in_need', 'muddy_ground'],

  affinityWeights: {
    raining: 0.35,
    muddy_ground: 0.3,
    status_poor: 0.2
  },

  seamlessHooks: {
    raining:
      'Through the downpour, a desperate shout and the pained snort of a beast echo from a washed-out ditch beside the collapsed culvert.',
    fog_gathering:
      'Out of the mist rises the silhouette of an overturned wooden cart tilted dangerously into a rushing mud creek.',
    default:
      'Beside a treacherous dip in the road, an axle-broken freight cart lies half-sunk in red clay mud.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'The farmer leg is pinned under the wooden cart-bed, and the harnessed water buffalo is panicking, threatening to roll the cart further into the creek.',
    fail:
      'Mud splashes in every direction as the trapped farmer groans beneath splintered timber.'
  },

  prompt: [
    'A freight cart loaded with sacks of camote sweet potatoes and dried fish has slid into a gully, its left axle splintered against the rocks. The farmer, a young father named Danas, is pinned at the thigh under the heavy oak cart-rail.',
    'His tethered carabao is stamping its hooves in terror at the edge of the swollen creek. If the beast lurches, the full weight of the freight will crush the man leg.'
  ],

  choices: [
    {
      text: 'Use your Iron Prybar as a lever to hoist the cart-rail off the farmer leg',
      requiredTag: 'pry_tool',
      itemActionTag: 'Tool // Iron Prybar Lever',
      check: null,
      successStory: [
        'Wedging the cold iron prybar over a sturdy river stone, you lever the heavy cart-rail upward with clean mechanical force. Danas drags his leg free without further injury and weeps in gratitude, pressing a bundle of dried healing herbs into your hands!'
      ],
      onSuccess: {
        addItem: 'bayabas_herbs',
        emitTags: ['kapwa_bond', 'steady_nerves', 'high_ground']
      }
    },
    {
      text: 'Brace your back beneath the cart-bed and heave the timber upward with raw Strength',
      check: { stat: 'STR', dc: 14 },
      successStory: [
        'Muscles corded with straining effort, you lift the splintered cart frame just high enough for Danas to roll clear onto the grass! Relieved beyond words, the farmer rewards your courage with fresh healing herbs and helps you back to the high road.'
      ],
      failStory: [
        'The wet oak slips against your shoulder, bruising your collarbone deeply before Danas manages to wrench his boot free from the mud.'
      ],
      onSuccess: {
        addItem: 'bayabas_herbs',
        emitTags: ['kapwa_bond', 'steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded', 'muddy_ground']
      }
    },
    {
      text: 'Calm the panicked carabao first, whispering to soothe the beast before untying its harness',
      check: { stat: 'WIS', dc: 13 },
      successStory: [
        'Gently stroking the great buffalo muzzle and murmuring ancient herder calls, you calm the beast until it stands rock-still. With the tension released from the traces, the cart settles gently, letting you pull the farmer free without resistance.'
      ],
      failStory: [
        'The frightened beast thrashes its horns, clipping your arm and knocking you into the mud before you manage to slip the trace-ropes loose.'
      ],
      onSuccess: {
        addItem: 'bayabas_herbs',
        emitTags: ['kapwa_bond', 'cautious']
      },
      onFail: {
        hp: -3,
        emitTags: ['wounded', 'muddy_ground']
      }
    },
    {
      text: 'Ignore the ditch and hurry past before the rain worsens the road',
      check: null,
      successStory: [
        'Hardening your heart to the farmer shouts, you keep your eyes locked on the road ahead and leave the gully behind.'
      ],
      onSuccess: {
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_roadside_taboan_hearth_01',
  locationLabel: 'Roadside Taboan Hearth of Barrio Silang',
  environment: 'VILLAGE',
  weather: 'ANY',
  timeOfDay: ['DUSK', 'NIGHT', 'DAY'],
  baseWeight: 0.28,
  intrinsicTags: ['spice_of_life', 'chill_story', 'rest_hearth', 'social_encounter', 'village_hearth'],

  affinityWeights: {
    has_pending_creature_tales: 3.8,
    raining: 0.35,
    fog_gathering: 0.3,
    wounded: 0.35
  },

  seamlessHooks: {
    raining:
      'Rain streams from the broad nipa eaves of a roadside Taboan rest-station, where a smoky hearth fire casts a welcoming amber glow.',
    fog_gathering:
      'Drifting mountain mist parts around the cheerful amber lanterns of a roadside rest-pavilion, where tired travelers huddle around hot coals.',
    clear_sky:
      'As the sun dips behind the western ridge, travelers gather beneath the palm thatch of the barrio Taboan to boil evening tea.',
    default:
      'A humble roadside rest-shelter (Taboan) stands beside the river crossing, filled with the comforting aroma of boiling ginger root.'
  },

  passive: {
    stat: 'WIS',
    dc: 11,
    success:
      'You note the peaceful, communal rhythm of the hearth: traders and weavers leaving their spears at the entrance post to honor the sacred peace of the Taboan.',
    fail:
      'The bubbling pot of ginger tea and the aroma of roasted sweet potatoes warm the evening breeze.'
  },

  prompt: [
    'Beside the dusty provincial crossroads stands an open-sided bamboo Taboan pavilion. An elderly grandmother named Lola Elena stirs a bubbling black iron kettle of fragrant ginger tea (Salabat), sweetened with dark coconut molasses.',
    'Tired salt-traders, basket-weavers, and wandering couriers sit shoulder-to-shoulder on woven pandan mats, unlacing their muddy sandals and sharing news of the lonely mountain passes. "Come in from the damp road, child," Lola Elena calls with a warm smile, pouring a steaming coconut-shell bowl of salabat. "Sit by the embers and rest your spirit."'
  ],

  choices: [
    {
      text: 'Kneel by the warm fire, accept a bowl of hot ginger salabat, and listen to the travelers trade road gossip',
      check: null,
      successStory: [
        'You kneel by the warm fire, accepting a steaming coconut bowl of hot ginger salabat from Lola Elena, and sit back to listen as the weary travelers trade road gossip.',
        'You cradle the warm cup in both hands, savoring the spicy heat of fresh ginger and dark palm sugar. Resting on the clean pandan mats among gentle folk, the ache in your muscles fades, and the lingering dread of the road is washed clean by shared laughter and quiet hospitality.'
      ],
      onSuccess: {
        hp: 4,
        heatDelta: -25,
        emitTags: ['well_rested', 'kapwa_bond', 'steady_nerves']
      }
    },
    {
      text: 'Offer to fetch dry river driftwood and split firewood to keep Lola Elena hearth burning bright',
      complexity: 'basic',
      check: { stat: 'STR', dc: 12 },
      successStory: [
        'With clean, rhythmic chops of a heavy bolo, you split a stack of dry ironwood logs and pile them neatly beneath the dry thatch. Touched by your helpful diligence, Lola Elena smiles with grandmotherly gratitude and presses a bundle of healing herbs and warm roasted camote into your pack: "May the ancestors walk before you, industrious one."'
      ],
      failStory: [
        'A knot of tough kamagong wood jars your wrists, but you still manage to split enough kindling for the evening tea kettle. Lola Elena pats your forearm with grandmotherly warmth and refills your cup with sweet ginger broth.'
      ],
      onSuccess: {
        hp: 2,
        addItem: 'herbal_poultice',
        heatDelta: -15,
        emitTags: ['kapwa_bond', 'well_rested']
      },
      onFail: {
        hp: 2,
        heatDelta: -10,
        emitTags: ['kapwa_bond']
      }
    },
    {
      text: 'Ask Lola Elena and the seasoned travelers about ancient barrio folklore regarding the strange phantoms of the wilderness',
      complexity: 'folklore',
      folkloreTag: 'Barrio Lore',
      check: null,
      resolve: (world) => {
        const isMythicalCreature = Math.random() < 0.5;

        if (isMythicalCreature) {
          // 50% Chance: Useful tactical information about a mythical creature
          const creaturePool = [
            {
              id: 'tikbalang',
              name: 'Tikbalang',
              advice: 'Should the bamboo trails twist into repeating loops and the road folds back on itself, do not panic or sprint: pull off your tunic, invert its seams inside-out, and wear it reversed. The horse-headed trickster snorts in utter disorientation at inverted clothes, dissolving its spatial illusion like morning mist.'
            },
            {
              id: 'manananggal',
              name: 'Manananggal',
              advice: 'When the night cry of the viscera bird sounds faint and far away, remember the acoustics of the night: the hunter is perched directly above your thatch roof. If you hunt one, track the trail of fermented coconut oil to find where she hid her severed lower waist, and cover the raw wound in coarse rock salt and crushed garlic before the pre-dawn cockcrows.'
            },
            {
              id: 'sigbin',
              name: 'Sigbin',
              advice: 'The shadow-eating hound walks with its snout tucked low between its hind legs, sniffing out human shadows when the moon is new. A Sigbin cannot cross moving water without losing its track, and it recoils in dread from the fierce golden crackle of bamboo resin torches.'
            },
            {
              id: 'nuno_sa_punso',
              name: 'Nuno sa Punso',
              advice: 'The ancient mound-dwellers are not ravenous fiends, but proud elder landlords of the deep soil. Whenever your sandals pass near an earthen termite punso, whisper "Tabi-tabi po, makikiraan lamang" with lowered eyes. Respect their ancestral domain, and the earth itself will keep your footing sure.'
            }
          ];

          const unlearned = creaturePool.filter((c) => !world || !world.hasCreatureKnowledge(c.id));
          const selected = unlearned.length > 0
            ? unlearned[Math.floor(Math.random() * unlearned.length)]
            : creaturePool[Math.floor(Math.random() * creaturePool.length)];

          return {
            story: [
              'You lean in toward the crackling fire and ask Lola Elena and the seasoned travelers about ancient barrio folklore regarding the strange phantoms that haunt the wilderness paths.',
              `Lola Elena sets her bamboo ladle down against the iron kettle, folding her calloused hands over her cotton apron as the other travelers quiet down to listen. "Listen well, wanderer," she speaks softly over the glowing coals. "The wild trails are alive with watchful eyes, especially the ${selected.name}."`,
              `"${selected.advice}"`,
              'Her seasoned counsel settles deep in your memory, granting sharp insight into the unseen perils of the archipelago.'
            ],
            effects: {
              discoverCreature: selected.id,
              heatDelta: -20,
              emitTags: ['steady_nerves', 'lore_enriched', `folklore_${selected.id}`]
            }
          };
        } else {
          // 50% Chance: A simple, heartwarming story about her life
          return {
            story: [
              'You sit closer to the warm embers and ask Lola Elena about ancient barrio folklore, hoping for eerie tales of monsters in the dark.',
              'Lola Elena chuckles softly, her wrinkles crinkling with grandmotherly warmth as she refills your coconut cup with sweet ginger salabat. "Ah, you young travelers are always hunting for fangs and shadows in the woods," she muses, resting her chin in one hand as she gazes affectionately into the dancing coals.',
              '"Fifty harvests ago, my late husband Datu Berto and I arrived at this crossing with only two woven baskets, an iron pot, and three young children to feed. There were no trading caravans or wooden palisades here then, only wild river reed and hungry mud. We cleared this corner with our bare hands, split bamboo for the rafters, and brewed hot ginger tea for every drenched traveler who wandered past. We never took more than we needed from the river or the soil, and in all those fifty years, the spirits never harmed a hair on our heads."',
              'The salt-traders and weavers around the hearth smile softly, humming along to the crackle of the ironwood. The gentle warmth of her life story dispels the cold dread of the trail, leaving your soul profoundly peaceful.'
            ],
            effects: {
              hp: 3,
              heatDelta: -30,
              emitTags: ['well_rested', 'kapwa_bond', 'hearth_comfort']
            }
          };
        }
      },
      successStory: [
        'You lean in toward the crackling fire and ask Lola Elena and the seasoned travelers about ancient barrio folklore regarding the strange phantoms that haunt the wilderness paths.',
        'Lola Elena sets her ladle down, folding her hands over her cotton apron as the other travelers lean in close. "Listen well, wanderer," she speaks softly over the crackling embers. "The forests and rivers of our ancestors are alive with watchful spirits. When you face the unknown, never trust mere eyesight: remember the ancient etiquette of our people, and no shadow shall swallow your heart." Her seasoned counsel settles deep in your soul, granting great clarity.'
      ],
      onSuccess: {
        heatDelta: -20,
        emitTags: ['steady_nerves', 'lore_enriched']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_rattan_bridge_chasm_01',
  locationLabel: 'Swaying Bridge of the Cloud Chasm',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'terrain_navigation', 'chasm_hazard'],

  affinityWeights: {
    high_ground: 0.35,
    raining: 0.3,
    cautious: 0.25
  },

  seamlessHooks: {
    raining:
      'Rain-slicked stones lead to the edge of a sheer cliff where a frayed rattan suspension bridge groans in the gorge winds.',
    fog_gathering:
      'The footpath ends abruptly at a yawning ravine where ancient cable ropes vanish into the white abyss.',
    default:
      'A deep mountain chasm divides the trail, spanned only by a narrow suspension bridge woven from wild mountain rattan.'
  },

  passive: {
    stat: 'DEX',
    dc: 13,
    success:
      'You spot two rotted foot-slats halfway across that will snap under full body weight, but the main upper guide-cables remain thick and solid.',
    fail:
      'The dizzying drop into the foaming river hundreds of feet below makes your stomach lurch.'
  },

  prompt: [
    'A hundred paces of woven rattan bridge span the misty chasm between two limestone spires. Wind howls through the gorge, causing the entire footbridge to twist and sway like a suspended hammock.',
    'Several bamboo cross-slats have rotted away, exposing the roaring canyon depths below. A sheer rocky goat-trail descends down into the gorge on the left, offering a slow alternative.'
  ],

  choices: [
    {
      text: 'Cross the swaying bridge with nimble footwork, skipping the rotten slats with perfect balance',
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Light on your feet and trusting the guide-ropes, you glide across the swinging bridge with rhythmic grace, landing safely on the far cliff edge with adrenaline singing in your veins!'
      ],
      failStory: [
        'A damp slat crumbles beneath your boot! You catch yourself on the upper cable with bruised forearms, hanging over the abyss before hauling yourself onto the far rock.'
      ],
      onSuccess: {
        emitTags: ['high_ground', 'steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded', 'high_ground']
      }
    },
    {
      text: 'Test every single lashing and anchor-stake before inching across with deliberate care',
      check: { stat: 'WIS', dc: 13 },
      successStory: [
        'Distributing your weight carefully along the main cables and testing each foothold, you cross without incident and reach the other side dry and composed.'
      ],
      failStory: [
        'A sudden gust twists the bridge sideways while you hesitate, wrenching your shoulder against the rattan cables before you scramble to safety.'
      ],
      onSuccess: {
        emitTags: ['high_ground', 'cautious']
      },
      onFail: {
        hp: -3,
        emitTags: ['high_ground', 'cautious']
      }
    },
    {
      text: 'Avoid the treacherous bridge entirely and hike the winding switchback trail down into the gorge',
      check: null,
      successStory: [
        'Choosing safety over speed, you spend two grueling hours climbing the rocky switchbacks down to the river stones and back up the opposite ridge, unharmed but fatigued.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'muddy_ground']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_mangrove_mire_sluice_01',
  locationLabel: 'Sucking Mud of the Tidal Mangrove Channel',
  weather: 'ANY',
  baseWeight: 0.22,
  intrinsicTags: ['spice_of_life', 'terrain_navigation', 'muddy_ground'],

  affinityWeights: {
    raining: 0.35,
    muddy_ground: 0.4,
    status_poor: 0.2
  },

  seamlessHooks: {
    raining:
      'Torrential rains swell the mangrove slough into a treacherous expanse of knee-deep black mud and tangled prop-roots.',
    default:
      'The coastal causeway sinks beneath a belt of black tidal mud where stilt-roots arch over murky, brackish pools.'
  },

  passive: {
    stat: 'CON',
    dc: 13,
    success:
      'You spot firm oyster-crusted root clusters that can support your weight if you avoid the deep sucking silt in between.',
    fail:
      'The rotten-egg stench of swamp gas bubbles up around your boots with every step.'
  },

  prompt: [
    'The trail drops into a low tidal basin where the rising sea has turned the path into a knee-deep bog of sucking black mire. Gnarled bakawan stilt-roots twist across the slough like spider legs, encrusted with razor-sharp barnacles.',
    'Traversing the mire requires either muscle to power through the mud or agile footing along the root tops.'
  ],

  choices: [
    {
      text: 'Wade straight through the sucking mire with raw physical power and stamina',
      check: { stat: 'CON', dc: 14 },
      successStory: [
        'Heaving your boots out of the heavy mud with relentless determination, you power through the tidal channel without slowing down, reaching the solid root-bank with stamina to spare!'
      ],
      failStory: [
        'The deep silt sucks off your footing; you take a hard tumble into the brackish sludge, scraping your knee on submerged barnacles before dragging yourself to firm ground.'
      ],
      onSuccess: {
        emitTags: ['steady_nerves', 'muddy_ground']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded', 'muddy_ground']
      }
    },
    {
      text: 'Leap and balance along the arching stilt-roots to keep your boots out of the silt',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'Skipping from prop-root to prop-root like an egret, you cross the entire mangrove basin dry-shod and emerge onto the sandy beach beyond!'
      ],
      failStory: [
        'A slime-slick root slips under your heel; you crash into the mire with a bruised shin before scrambling to the bank.'
      ],
      onSuccess: {
        emitTags: ['high_ground', 'clear_sky']
      },
      onFail: {
        hp: -3,
        emitTags: ['wounded', 'muddy_ground']
      }
    },
    {
      text: 'Cut a long sounding pole from a dead bamboo stalk to test the mud depth step by step',
      check: null,
      successStory: [
        'Probing ahead with your bamboo staff, you navigate safely around the deep mud-holes and reach the far bank without risking a fall.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'muddy_ground']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_karst_limestone_scree_01',
  locationLabel: 'Razor Karst Needles of the Ridge Crest',
  weather: 'ANY',
  baseWeight: 0.2,
  intrinsicTags: ['spice_of_life', 'terrain_navigation', 'karst_hazard'],

  affinityWeights: {
    high_ground: 0.35,
    clear_sky: 0.3,
    cautious: 0.2
  },

  seamlessHooks: {
    default:
      'The trail climbs onto a treacherous spine of razor-sharp limestone karst needles weathered into blade-like edges by centuries of rain.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'You note the chalky white stone is brittle, but patches blackened by wild orchid moss offer secure grip.',
    fail:
      'The blinding glare off the white stone needles hides the loose scree underfoot.'
  },

  prompt: [
    'The mountain ridge narrows to a razor spine of fluted limestone pinnacles, known to the locals as the Teeth of the Mountain. A single slip could shred leather gaiters or slice palms against the flint-hard mineral edges.',
    'A high wind whips across the ridge crest, testing the nerve of any climber.'
  ],

  choices: [
    {
      text: 'Navigate the razor limestone spine with measured footsteps and keen body control',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'Placing each step with mountain precision, you traverse the karst needles without a scratch, finding an ancient offerings cache tucked in a rock fissure containing 5 piloncitos!'
      ],
      failStory: [
        'A limestone needle crumbles beneath your palm, slicing a deep cut into your hand before you catch your footing.'
      ],
      onSuccess: {
        piloncitos: 5,
        emitTags: ['high_ground', 'steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -3,
        emitTags: ['wounded', 'high_ground']
      }
    },
    {
      text: 'Wrap your hands in Cloth Wraps to grip the sharp stone edges safely',
      requiredTag: 'clothing_inside_out',
      itemActionTag: 'Gear // Wrapped Hands & Gaiters',
      check: null,
      successStory: [
        'With your hands protected against the razor edges, you haul yourself confidently across the karst pinnacles and arrive at the summit ridge completely unscathed.'
      ],
      onSuccess: {
        emitTags: ['high_ground', 'steady_nerves']
      }
    },
    {
      text: 'Descend slightly into the leeward scrub forest to bypass the knife-edge crest',
      check: null,
      successStory: [
        'Choosing the slower forested slope below the ridge, you scramble through tough bamboo brush and rejoin the trail beyond the limestone teeth.'
      ],
      onSuccess: {
        emitTags: ['cautious']
      }
    }
  ]
});
