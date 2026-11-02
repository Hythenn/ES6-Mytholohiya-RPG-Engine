/**
 * js/data/scenarios/misc/MiscScenarios.js
 * Miscellaneous scenarios across the archipelago:
 * - Forest groves, bamboo labyrinths, and cryptids (Tikbalang, Kapre, Tamaraw, Nuno)
 * - Sacred water cascades, river spirits, and ancestral stone altars
 * - Grave mounds, night hags, and nocturnal horrors (Batibat, Tiyanak, Amalanhig)
 * - Roadside tapahan shelters, scout posts, and kedatuan river markets
 */

import { NarrativeRegistry } from '../../../narrative/NarrativeDirector.js';

NarrativeRegistry.registerMiscScenario({
  id: 'misc_nuno_punso_01',
  creatureId: 'nuno_sa_punso',
  locationLabel: 'Red Clay Anthill',
  weather: 'ANY',
  baseWeight: 0.05,
  intrinsicTags: ['spice_of_life', 'spirit_encounter', 'punso_mound'],

  affinityWeights: {
    fog_gathering: 0.25,
    cautious: 0.2,
    forest_edge: 0.15
  },

  seamlessHooks: {
    raining:
      'Seeking brief shelter beneath a canopy of giant elephant-ear leaves as the rain drums down, you nearly step onto a tall, rain-slicked mound of red earth.',
    fog_gathering:
      'As the pale mist curls around your ankles, a weathered clay anthill looms out of the vapor beside the twisted roots of a balete sapling.',
    clear_sky:
      'Sunlight filters through the bamboo grove, glinting off a curious ring of white river pebbles arranged around a towering red-clay anthill.',
    default:
      'Your sandal brushes against a hardened mound of red earth rising beside the narrow footpath.'
  },

  passive: {
    stat: 'WIS',
    dc: 12,
    success:
      'You remember the ancient animist etiquette of the red mounds: murmuring "Tabi-tabi po" to the punso respectfully begs pardon of the earth-elder, warding off spiteful swelling and spirit curses.',
    fail:
      'The anthill looks entirely ordinary until a dry pebble bounces off your knuckle, and you struggle to recall any proper etiquette for the red clay.'
  },

  prompt: [
    'Perched atop the sun-baked crest of the punso sits a tiny, white-bearded figure no taller than your knee, wearing a woven salakot hat shaped from a dried mushroom cap. The Nuno sa Punso squints up at you with eyes like dark tamarind seeds, struggling to untangle his long beard from a thorny rattan briar.',
    'He mutters curses in an archaic dialect, too proud to ask a passing mortal for help.'
  ],

  choices: [
    {
      text: 'Use your equipped Blade to delicately sever the rattan thorns without touching his beard',
      requiredTag: 'armed_blade',
      complexity: 'tactical',
      minInt: 10,
      itemActionTag: 'Equipped // Blade Precision',
      check: null,
      successStory: [
        'With a flick of your keen edge, the briar falls away cleanly. The tiny elder straightens his mushroom cap, nods in gruff respect at your blade-work, and sinks into the red clay.',
        'You gain no gold nor salve today, only the quiet certainty that the earth-elder remembers your courtesy.'
      ],
      onSuccess: { addItem: 'tanso_agimat', emitTags: ['helped_nuno', 'spirit_respect', 'clear_sky'] }
    },
    {
      text: 'Kneel respectfully, murmur "Tabi-tabi po," and carefully untangle his beard by hand',
      passiveRequirement: { stat: 'WIS', dc: 12 },
      hiddenFailNarrative: 'You search your memory for the proper rites to appease the earth-dweller, but the sacred greetings remain lost to you.',
      itemActionTag: 'Folklore Etiquette // Tabi-tabi po',
      check: { stat: 'DEX', dc: 12 },
      successStory: [
        'With patient fingers, you part the barbed briar without pulling a single white hair. The tiny elder straightens his mushroom cap, points a crooked finger at your face as if memorizing your features, and sinks into the red clay without a word.'
      ],
      failStory: [
        'Your thumb slips on a wet thorn and tugs his beard sharply. The Nuno hisses like a scalded cat, spits a curse on your shadow, and vanishes into a crack in the mound.'
      ],
      onSuccess: { addItem: 'tanso_agimat', emitTags: ['helped_nuno', 'spirit_respect', 'clear_sky'] },
      onFail: { hp: -2, emitTags: ['slighted_nuno', 'spirit_hexed', 'fog_gathering'] }
    },
    {
      text: 'Reach forward bluntly to yank the barbed briar free from his white beard',
      complexity: 'basic',
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Moving swiftly, you tear the thorny vine away before he can snap his jaws! The tiny elder rubs his chin with a scowl, begrudgingly tossing a copper charm into the dust before vanishing into the mound.'
      ],
      failStory: [
        'Your rough tug jerks his beard painfully! Offended by your insolence, the Nuno spits on your boots and invokes a spiteful swelling on your limbs!'
      ],
      onSuccess: { addItem: 'tanso_agimat', emitTags: ['helped_nuno', 'spirit_respect', 'clear_sky'] },
      onFail: { hp: -3, emitTags: ['slighted_nuno', 'spirit_hexed', 'fog_gathering'] }
    },
    {
      text: 'Avert your gaze and walk wide around the mound without interfering',
      complexity: 'basic',
      check: null,
      successStory: [
        'Knowing how easily earth-spirits take offense, you give the red anthill a wide berth. Behind you, the dry rustle of thorns continues in the silence of the grove.'
      ],
      onSuccess: { emitTags: ['cautious'] }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_abandoned_loom_01',
  locationLabel: 'Overgrown Habihan Shelter',
  environment: 'TENT',
  weather: 'ANY',
  baseWeight: 0.05,
  intrinsicTags: ['spice_of_life', 'ruins', 'ancestral_craft'],

  affinityWeights: {
    clear_sky: 0.25,
    rain_stopping: 0.2,
    reflective: 0.15
  },

  seamlessHooks: {
    raining:
      'Ducking under the sagging nipa eaves of a collapsed stilt-hut to escape the rain, your eyes adjust to a striking burst of crimson and gold thread.',
    fog_gathering:
      'Through the drifting veil of vapor, the skeletal bamboo frame of an old roadside weaving shed appears, still holding an unfinished tapestry.',
    clear_sky:
      'A shaft of golden afternoon light pierces the forest canopy, illuminating a vibrant geometric textile stretched across a decaying backstrap loom.',
    default:
      'Beside the overgrown trail stands a half-collapsed bamboo lean-to sheltering an abandoned backstrap loom.'
  },

  passive: {
    stat: 'INT',
    dc: 13,
    success:
      'You recognize the intricate binakul whirlwind motif woven into the abaca fibers, a pattern meant to dizzy and confuse malevolent spirits when worn.',
    fail:
      'Though you cannot read the tribal symbolism of the cloth, the craftsmanship is hauntingly beautiful even in decay.'
  },

  prompt: [
    'Wild orchids have colonized the rotting hardwood beams of the loom, their purple blossoms tangling with taut threads of dyed abaca and pineapple silk. Whoever sat here left years ago, yet a finished Woven Abaca Baro Tunic hangs folded over the crossbeam beside the unfinished warp.',
    'The cloth depicts celestial serpents coiled around river stars, preserved by beeswax rubbed into the fibers.'
  ],

  choices: [
    {
      text: 'Pass the wooden shuttle through one final row to honor the weaver, then claim the folded Abaca Tunic',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'With steady fingers, you guide the shuttle cleanly through the warp and beat the row into place. The wind chimes hanging from the eaves ring a clear note of approval as you pack the sturdy Woven Abaca Tunic (which can be worn inside-out or ripped into sheets).'
      ],
      failStory: [
        'Age-brittle fibers snap under your tension with a mournful sigh, and a rusted weaving needle buried in the warp pricks your palm deeply, though you salvage a Ripped Cloth Sheet from the scraps.'
      ],
      onSuccess: {
        addItem: 'abaca_tunic',
        emitTags: ['weaver_omen', 'reflective', 'clear_sky']
      },
      onFail: {
        hp: -2,
        addItem: 'ripped_sheets',
        emitTags: ['wistful', 'fog_gathering']
      }
    },
    {
      text: 'Leave the tapestry and garments untouched as a monument to what once lived here',
      check: null,
      successStory: [
        'You stand in silence for a long breath, memorizing the serpent pattern before stepping back onto the mud of the road.'
      ],
      onSuccess: { emitTags: ['reflective'] }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_wild_tamaraw_01',
  creatureId: 'tamaraw',
  locationLabel: 'Sunken Bamboo Thicket',
  weather: 'ANY',
  baseWeight: 0.05,
  intrinsicTags: ['spice_of_life', 'wildlife', 'nature_omen'],

  affinityWeights: {
    raining: 0.25,
    muddy_ground: 0.25,
    high_ground: 0.15
  },

  seamlessHooks: {
    raining:
      'Above the hiss of the downpour, the heavy, rhythmic snapping of wet bamboo stalks echoes from the ravine to your right.',
    fog_gathering:
      'A massive, steaming silhouette materializes out of the rolling fog less than ten paces ahead, its V-shaped horns gleaming like wet slate.',
    clear_sky:
      'Flocks of white egrets suddenly burst from the cogon grass ahead as heavy hooves drum across the sun-baked trail.',
    default:
      'The brush beside the path parts with a sudden crash of snapping twigs and deep, labored breathing.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'You notice a rusted iron cable-snare biting into the beast left foreleg, trailing a snapped wooden stake.',
    fail:
      'Your heart leaps into your throat at the sheer muscular bulk of the dwarf buffalo blocking the path.'
  },

  prompt: [
    'A solitary wild tamaraw stands across the trail, its glossy black coat steaming in the humid air and white cheek-markings vivid against the dark hide. A poacher twisted wire snare drags from its foreleg, though the beast shows no weakness.',
    'It lowers its backward-swept horns, fixing you with one dark, intelligent eye.'
  ],

  choices: [
    {
      text: 'Calm the bull and slice the wire snare cleanly with your equipped Blade',
      requiredTag: 'armed_blade',
      itemActionTag: 'Equipped // Keen Blade',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'WIS', dc: 12 },
      successStory: [
        'Moving with slow deliberation, you hook your blade under the wire and shear it in one stroke. The great bull exhales warm vapor against your shoulder, stamps once on the mud, and bounds into the highland mist.'
      ],
      failStory: [
        'Startled by the glint of your steel, the tamaraw lashes out with a grazing horn-swipe before thundering away!'
      ],
      onSuccess: { emitTags: ['tamaraw_kinship', 'steady_nerves', 'clear_sky'] },
      onFail: { hp: -4, emitTags: ['wounded', 'muddy_ground'] }
    },
    {
      text: 'Analyze the iron wire ratchet tension and trip the release pin with mechanical precision',
      complexity: 'advanced',
      minInt: 12,
      check: { stat: 'INT', dc: 13 },
      successStory: [
        'Deducing the exact spring counter-weight of the poacher ratchet, you slip a bamboo sliver beneath the release pawl and pop the cable open in a single silent motion! The magnificent tamaraw acknowledges your intellect with a low snort before trotting into the highland brush.'
      ],
      failStory: [
        'The rusted ratchet snaps back under tension, pinching your palm sharply before releasing the beast!'
      ],
      onSuccess: { emitTags: ['tamaraw_kinship', 'steady_nerves', 'clear_sky'] },
      onFail: { hp: -3, emitTags: ['wounded', 'muddy_ground'] }
    },
    {
      text: 'Approach slowly with bare hands to twist the wire snare loose',
      complexity: 'basic',
      check: { stat: 'WIS', dc: 14 },
      successStory: [
        'Murmuring low, rhythmic syllables, you ease close enough to untwist the rusted wire. The great bull exhales warm vapor against your shoulder and bounds into the highland mist.'
      ],
      failStory: [
        'The rusted wire cuts your fingers and startles the bull into a grazing horn-swipe that sends you crashing into the bamboo!'
      ],
      onSuccess: { emitTags: ['tamaraw_kinship', 'steady_nerves', 'clear_sky'] },
      onFail: { hp: -4, emitTags: ['wounded', 'muddy_ground'] }
    },
    {
      text: 'Stand motionless beside the bamboo until the sovereign of the ridge passes on its own',
      complexity: 'basic',
      check: null,
      successStory: [
        'You lower your eyes and yield the road. After a tense silence, the tamaraw trots past you into the cogon grass without incident.'
      ],
      onSuccess: { emitTags: ['cautious', 'high_ground'] }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_lost_journal_01',
  locationLabel: 'Hollowed Balete Root',
  weather: 'ANY',
  baseWeight: 0.05,
  intrinsicTags: ['spice_of_life', 'lore_discovery', 'baybayin_script'],

  affinityWeights: {
    fog_gathering: 0.25,
    status_poor: 0.2,
    muddy_ground: 0.15
  },

  seamlessHooks: {
    raining:
      'While stepping over a rain-swollen rivulet, you notice an oilskin-wrapped bundle wedged dry inside the crook of a buttress root.',
    fog_gathering:
      'The creeping mist parts around a mossy milestone where a leather-bound bamboo cylinder lies half-buried in fallen leaves.',
    clear_sky:
      'A glint of brass wire catches the sunlight inside the hollow of a lightning-split mango tree beside the road.',
    default:
      'Half-hidden beneath a pile of broad talisay leaves, you spot a weatherproofed cylinder left behind by a previous wayfarer.'
  },

  passive: {
    stat: 'INT',
    dc: 13,
    success:
      'The Baybayin characters incised into the bamboo slats warn of a weeping spirit in the reeds that can be foiled by turning your shirt inside-out.',
    fail:
      'Many of the archaic ligatures are smeared by dampness, leaving only fragments legible.'
  },

  prompt: [
    'Inside the waxed boar-hide wrapper rests a travel journal fashioned from polished bamboo slats strung together with braided hemp. There are no coins inside, only the hurried testimony of a runner who walked this road before the eclipse.',
    'One line is underscored three times with a knife point: "When the mist loops back upon itself, turn your baro inside-out and do not answer the voice that calls your birth-name."'
  ],

  choices: [
    {
      text: 'Commit the Baybayin folklore warnings to memory and gather the wild bayabas leaves growing by the root',
      check: { stat: 'INT', dc: 13 },
      successStory: [
        'You memorize the runner notes, tuck the cylinder back into the dry hollow for whoever follows, and harvest a handful of medicinal bayabas leaves.'
      ],
      failStory: [
        'As you strain to decipher the cramped script in the dim light, a centipede nesting in the bamboo cylinder bites your wrist!'
      ],
      onSuccess: {
        addItem: 'bayabas_herbs',
        emitTags: ['lore_enriched', 'knows_reed_warning']
      },
      onFail: { hp: -3, emitTags: ['wounded', 'fog_gathering'] }
    },
    {
      text: 'Etch your own name onto the final blank slat and move on',
      check: null,
      successStory: [
        'You leave proof that you walked this road alive, tying the hemp cord tight before continuing your march.'
      ],
      onSuccess: { emitTags: ['kapwa_bond'] }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_nuno_return_02',
  creatureId: 'nuno_sa_punso',
  locationLabel: 'Whispering Sinkhole',
  weather: 'ANY',
  baseWeight: 0.05,
  requiredTags: ['helped_nuno'],
  intrinsicTags: ['entity_callback', 'punso_mound'],

  affinityWeights: {
    helped_nuno: 2.5,
    muddy_ground: 0.5
  },

  seamlessHooks: {
    raining:
      'As the rain turns the trail into treacherous mire, a sharp whistle from a roadside anthill stops your boot an inch before the ground gives way.',
    fog_gathering:
      'Through the blinding fog, a familiar mushroom-cap hat bobs urgently atop a mossy stone just ahead.',
    clear_sky:
      'A tiny pebble strikes your shin with uncanny accuracy, halting you right at the lip of a concealed sinkhole.',
    default:
      'A dry, raspy throat-clearing stops you in your tracks beside a hollow of red clay.'
  },

  passive: {
    stat: 'WIS',
    dc: 12,
    success:
      'It is the exact same white-bearded Nuno sa Punso whose beard you freed from the rattan briar.',
    fail:
      'A tiny earth-elder stands atop a root, pointing his staff at the disguised pitfall ahead.'
  },

  prompt: [
    'The ground two paces ahead collapses into a deep mud-funnel lined with sharpened bamboo stakes left by raiders. Sitting cross-legged on a dry root above the pit is the Nuno sa Punso you aided earlier, puffing calmly on a rolled leaf.',
    '"A debt of the soil is paid in the soil, tall-one," the elder rasps, gesturing toward a hidden deer-track winding safely around the chasm where a fallen raider pack lies.'
  ],

  choices: [
    {
      text: 'Thank the Nuno and follow his secret deer-track around the sinkhole',
      check: null,
      successStory: [
        'You bow low to the earth-elder and take the firm path he revealed, recovering a pouch of ancestral piloncitos and a Sterilized Bayabas Poultice from the fallen pack on the far ridge.'
      ],
      onSuccess: {
        piloncitos: 7,
        addItem: 'herbal_poultice',
        emitTags: ['clear_sky', 'high_ground']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_tamaraw_return_02',
  creatureId: 'tamaraw',
  locationLabel: 'Ambush in the Cogon Ravine',
  weather: 'ANY',
  baseWeight: 0.05,
  requiredTags: ['tamaraw_kinship'],
  intrinsicTags: ['entity_callback', 'wildlife'],

  affinityWeights: {
    tamaraw_kinship: 2.6,
    wounded: 0.8
  },

  seamlessHooks: {
    raining:
      'Low growls rise beneath the drum of the rain as three ash-gray Sigbin hounds circle you backward in the narrow ravine.',
    fog_gathering:
      'Red eyes ignite between crooked hind legs in the fog as nocturnal Sigbin close their jaws toward your shadow.',
    clear_sky:
      'The tall cogon grass rustles violently as a pack of hornless, goat-like Sigbin lunges backward to bite at your shadow.',
    default:
      'Predatory silhouettes with oversized ears and heads tucked beneath their hind legs drop into the sunken gorge.'
  },

  passive: {
    stat: 'WIS',
    dc: 12,
    success:
      'Before the shadow-drinking Sigbin can snap their jaws on your silhouette, the earth trembles with the unmistakable hoofbeats of a massive dwarf buffalo.',
    fail:
      'You brace for a desperate fight against the backward-stalking Sigbin when a deafening bellow shakes the ravine walls.'
  },

  prompt: [
    'Crashing through the bamboo wall comes the scarred wild tamaraw whose foreleg you freed from the poacher snare! With V-shaped horns lowered like twin iron plowshares, the bull tramples through the pack of Sigbin shadow-hounds, scattering their broken forms into the brush before they can drain a drop of blood from your shadow.',
    'The great beast pauses briefly beside you, steam billowing from its nostrils, before clearing a wide path up the hillside.'
  ],

  choices: [
    {
      text: 'Salute the great bull with your weapon and ascend the cleared ridge',
      check: null,
      successStory: [
        'Spared a bloody battle in the ravine, you salute the valiant horned guardian and climb safely to high ground.'
      ],
      onSuccess: { emitTags: ['high_ground', 'clear_sky'] }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_tikbalang_grove_01',
  creatureId: 'tikbalang',
  locationLabel: 'Bamboo Crossroads of the Tikbalang',
  weather: 'SPIRIT FOG',
  baseWeight: 0.14,
  intrinsicTags: ['spice_of_life', 'spirit_encounter', 'spatial_loop'],

  affinityWeights: {
    fog_gathering: 0.4,
    knows_reed_warning: 0.45,
    forest_edge: 0.3
  },

  seamlessHooks: {
    raining:
      'Though a warm sunbeam pierces the canopy, rain continues to patter on the bamboo leaves: the classic omen of a Tikbalang wedding.',
    fog_gathering:
      'For the third time in ten minutes, you pass the exact same lightning-split bamboo culm in the curling mist.',
    default:
      'The heavy smell of burning pipe-weed and wet stallion hair hangs over a crossroads where the trail loops back upon itself.'
  },

  passive: {
    stat: 'WIS',
    dc: 14,
    success:
      'You realize you are trapped in a Tikbalang spatial loop; high in the bamboo canopy, two disproportionately long knees rise above a horse-headed silhouette!',
    fail:
      'Every footpath ahead looks identical, and dry, equine laughter echoes from the crown of the bamboo grove.'
  },

  prompt: [
    'Dropping silently from the canopy lands a towering humanoid with the long, bony skull of a stallion and legs so gangly that when it crouches on a boulder, its knees rise higher than its crown. Three spines of spun gold gleam amid the coarse bristles of its stallion mane.',
    'An uncanny equine glamour twists the bamboo grove into an endless maze where every trail loops upon itself.'
  ],

  choices: [
    {
      text: 'Walk forward with your Upper Torso garment worn Inside-Out (Baliktad) to shatter the spatial loop',
      passiveRequirement: { stat: 'WIS', dc: 12 },
      requireFlag: 4,
      requiredTag: 'clothing_inside_out',
      itemActionTag: 'Folklore // Inverted Garment Ward',
      check: null,
      successStory: [
        'Seeing your reversed seams, the Tikbalang snorts in startled amusement. Its spatial illusion dissolves around you like morning dew, revealing the true mountain road.'
      ],
      onSuccess: {
        addItem: 'cotton_bahag_leggings',
        emitTags: ['clear_sky', 'spirit_respect']
      }
    },
    {
      text: 'Deduce the true direction of the prevailing wind through the bamboo canopy to break the spatial distortion',
      complexity: 'advanced',
      minInt: 13,
      check: { stat: 'INT', dc: 13 },
      successStory: [
        'Disregarding the looping phantom footpaths, you calculate the angle of wind shearing through the highest culms and march steadily against the illusion until the crossroads snap back to reality.'
      ],
      failStory: [
        'A sudden gust across the ravine scatters your calculations, sending you tumbling into a thorny ravine before the trail straightens.'
      ],
      onSuccess: {
        addItem: 'tanso_agimat',
        emitTags: ['steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -3,
        emitTags: ['fog_gathering', 'wounded']
      }
    },
    {
      text: 'Leap onto the phantom shoulders and grapple its neck to pluck one of its three golden mane hairs!',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'STR', dc: 16 },
      successStory: [
        'You hold fast as the stallion-spirit bucks across the bamboo tops! Plucking a single golden spine from its mane, you force the Tikbalang to kneel and swear an oath of servitude before guiding you out of the wilds.'
      ],
      failStory: [
        'The Tikbalang hurls you into a thorny bamboo clump with bone-rattling force before vanishing in a cloud of pipe smoke!'
      ],
      onSuccess: {
        piloncitos: 10,
        addItem: 'mutya_ng_saging',
        emitTags: ['tamed_tikbalang', 'high_ground', 'clear_sky']
      },
      onFail: {
        hp: -5,
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Focus your senses to see through the looping footprints and orient yourself by the moss on the stones',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'WIS', dc: 14 },
      successStory: [
        'Refusing to follow the false phantom trails, you step backward through the bamboo arch and break free of the Tikbalang labyrinth.'
      ],
      failStory: [
        'You wander in exhausting circles until dusk, scratching your arms on rattan thorns before the spirit grows bored and releases the path.'
      ],
      onSuccess: {
        piloncitos: 4,
        emitTags: ['steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -3,
        emitTags: ['fog_gathering']
      }
    },
    {
      text: 'Back away slowly with lowered eyes, keeping your boots firmly on the mud to retreat out of the grove',
      isAvoidance: true,
      complexity: 'basic',
      check: null,
      successStory: [
        'Refusing to look upon the gangly stallion-spirit or step into its maze, you slowly retreat backward step by step until the bamboo canopy thins and normal sunlight returns.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'steady_nerves']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_kapre_bough_01',
  creatureId: 'kapre',
  locationLabel: 'Ancient Acacia of the Kapre',
  weather: 'SPIRIT FOG',
  baseWeight: 0.14,
  intrinsicTags: ['spice_of_life', 'spirit_encounter', 'hamog_fog'],

  affinityWeights: {
    fog_gathering: 0.4,
    spirit_respect: 0.35
  },

  seamlessHooks: {
    entering_deep_forest:
      'The overgrown path leads toward the roots of a colossal, gnarled acacia tree whose sprawling branches blot out the sky in twilight gloom.',
    spirit_fog_rising:
      'Thick, pungent tobacco smoke rolls down from the massive horizontal boughs of a centuries-old acacia tree, turning the air into blinding Hamog spirit fog.',
    dusk_falling:
      'As dusk darkens the forest trail, a glowing red ember flares rhythmically high within the shadow of a massive acacia bough.',
    default:
      'Thick, pungent tobacco smoke rolls down from the massive horizontal boughs of a centuries-old acacia tree, turning the air into blinding Hamog spirit fog.'
  },

  passive: {
    stat: 'WIS',
    dc: 13,
    success:
      'High above, an ember the size of a clay hearth-pot glows red as a nine-foot tree giant draws on a hand-rolled tabako cigar.',
    fail:
      'You think the glowing red circle in the canopy is a lantern until it exhales a thundercloud of gray smoke.'
  },

  prompt: [
    'Sitting astride the lowest limb of the great acacia is a Kapre, known in the Visayas as an Agta: a dark-skinned, muscular giant covered in coarse hair, wearing an indigenous bahag loincloth. Its massive cigar never burns shorter, filling the glade with disorienting Hamog fog.',
    'The giant rumbles in a bass voice that vibrates in your chest, testing whether you trespass with arrogance or respect.'
  ],

  choices: [
    {
      text: 'Address the Kapre with formal courtesy and offer a share of your road provisions at the roots',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'CHA', dc: 13 },
      successStory: [
        'Pleased by your manners, the tree-giant blows a warm ring of smoke that parts the Hamog mist and drops a pouch of ancient gold piloncitos from the bough.'
      ],
      failStory: [
        'Unimpressed by your hurried greeting, the Kapre exhales a choking cloud of cigar ash that leaves you coughing blindly along the ditch.'
      ],
      onSuccess: {
        piloncitos: 8,
        addItem: 'bamboo_torch',
        emitTags: ['kapre_boon', 'spirit_respect', 'clear_sky']
      },
      onFail: {
        hp: -2,
        emitTags: ['fog_gathering']
      }
    },
    {
      text: 'Roll clear as the irritated giant shakes a dead hardwood bough down into the fog!',
      complexity: 'basic',
      check: { stat: 'DEX', dc: 15 },
      successStory: [
        'You dive clear fractions of a second before the massive timber crushes the mud where you stood, escaping into the clear trail beyond!'
      ],
      failStory: [
        'Splintering branches clip your shoulder as the bough crashes down through the smoke!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Quietly bow your head, murmur "Tabi po, Ginoo," and skirt the acacia drip-line',
      isAvoidance: true,
      complexity: 'basic',
      check: null,
      successStory: [
        'Offering quiet respect without challenging the tree-giant domain, you edge around the shadow of the canopy and continue safely on your way.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'steady_nerves']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_diwata_waterfall_01',
  creatureId: 'diwata',
  locationLabel: 'Cascades of Tinago',
  weather: 'ANY',
  baseWeight: 0.05,
  intrinsicTags: ['spice_of_life', 'diwata_sighting', 'sacred_waters'],

  affinityWeights: {
    clear_sky: 0.3,
    fog_gathering: 0.25,
    raining: 0.15
  },

  seamlessHooks: {
    raining:
      'The warm rain parts like a silver curtain across the gorge, revealing a thunderous waterfall plunging into a jade basin below.',
    fog_gathering:
      'Luminous mist rises from a recessed canyon beside the cliff trail, glowing with an inner pearl-white radiance.',
    clear_sky:
      'A brilliant double rainbow arches across the gorge ahead where a high mountain cataract crashes into a pool of turquoise water.',
    default:
      'The sound of rushing water draws your gaze through a gap in the tree ferns toward a secluded canyon basin.'
  },

  passive: {
    stat: 'WIS',
    dc: 14,
    success:
      'Every cicada in the gorge has fallen reverently silent; to intrude upon an immortal here would invite a swift curse.',
    fail:
      'The sheer beauty of the hidden cascade makes you pause in your tracks before you notice the figure in the spray.'
  },

  prompt: [
    'Far below on a moss-covered boulder at the edge of the plunge pool, a luminous figure combs hair that spills like spun moonlight into the swirling current. White butterflies circle her shoulders in slow, effortless orbits, and wherever her fingertips touch the water, golden lotus buds unfurl and drift downstream.',
    'She has not yet looked up toward the cliff trail, though the wind shifts in your direction.'
  ],

  choices: [
    {
      text: 'Withdraw in utter silence without taking a single drop from her sacred basin',
      check: { stat: 'DEX', dc: 13 },
      successStory: [
        'Not a fern-frond trembles as you step backward and bow your head. A single white butterfly detaches from the cascade and alights briefly upon your shoulder before rising into the canopy.',
        'Nothing material is gained, yet the unseen court of the headwaters knows your restraint.'
      ],
      failStory: [
        'Your heel dislodges a stone down the ravine. Below, the water turns dark as iron and a piercing chill lances through your chest before the figure vanishes in a flash of spray.'
      ],
      onSuccess: { hp: 4, addItem: 'black_coral_ring', emitTags: ['diwata_remembered', 'clear_sky'] },
      onFail: { hp: -3, emitTags: ['diwata_displeased', 'fog_gathering'] }
    },
    {
      text: 'Remain motionless among the ferns and simply watch until the mist closes the view',
      check: null,
      successStory: [
        'Silver vapor rolls across the gorge, hiding the pool once more and leaving only the distant roar of falling water.'
      ],
      onSuccess: { emitTags: ['awestruck', 'fog_gathering'] }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_santelmo_fire_01',
  creatureId: 'santelmo',
  locationLabel: 'Blood-Stained River Ford',
  weather: 'MONSOON',
  baseWeight: 0.14,
  intrinsicTags: ['spice_of_life', 'spirit_encounter', 'santelmo_fire'],

  affinityWeights: {
    raining: 0.4,
    muddy_ground: 0.35
  },

  seamlessHooks: {
    approaching_coastal_marsh:
      'Following the dark edge of the marshland where old warriors fell, the damp air crackles with ozone and the faint smell of burning phosphorus.',
    midnight_darkness:
      'In the pitch black of midnight, a floating orb of blue-white spectral fire ignites above the tall grasses, hovering without a sound.',
    raining:
      'Rain hisses against an ethereal, floating sphere of electrical fire dancing lazily above the waterlogged stones.',
    default:
      'Above the rain-lashed stones where an ancient skirmish spilled blood, a blinding sphere of blue-white electrical fire dances across the air!'
  },

  passive: {
    stat: 'INT',
    dc: 13,
    success:
      'It is a Santelmo born of the old bloodshed here, and behind it strides a Bonggo, the fire-spewing Bicolano fiend forever hunting for its lost wife. Neither can cross open running water, and a doused Bonggo dies outright!',
    fail:
      'The crackling ball of spirit-lightning arcs toward the iron and brass on your gear!'
  },

  prompt: [
    'Hissing against the monsoon rain, the Santelmo flares into a roaring orb of blue-white plasma that sears the cogon grass to ash. Drawn to the warmth of living blood, the fiery soul-sphere streaks straight toward you across the muddy bank!',
    'Ten paces to your left, a waist-deep channel of rushing river water cuts across the ford.'
  ],

  choices: [
    {
      text: 'Vault into the open river current where the Santelmo cannot follow, or douse the sparks with soaked cloth!',
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'You plunge across the rushing ford just as the blue-white fire-orb hisses violently at the water edge! Unable to cross the running stream, the Santelmo spirals upward into the storm clouds and vanishes.'
      ],
      failStory: [
        'A burst of electrical spirit-flame singes your cloak before you splash into the safety of the current!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -3,
        emitTags: ['wounded']
      }
    },
    {
      text: 'Endure the searing wave of spirit-heat as the Bonggo arcs past your stance',
      check: { stat: 'CON', dc: 13 },
      successStory: [
        'Grounding your feet in the wet clay, you withstand the blistering wash of ozone and heat until the restless soul-fire burns itself out!'
      ],
      failStory: [
        'Blistering spirit-fire scorches your forearms before the orb dissipates in a clap of thunder!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_anito_shrine_atang_01',
  creatureId: 'anito',
  locationLabel: 'Ancestral Anito Shrine of the River Spring',
  weather: 'ANY',
  baseWeight: 0.16,
  intrinsicTags: ['spice_of_life', 'anito_shrine', 'sanctuary_rest', 'chill_story'],

  affinityWeights: {
    heat_panganib: 0.5,
    heat_amoy_dugo: 0.4,
    clear_sky: 0.2
  },

  seamlessHooks: {
    raining:
      'Dripping wet from the rain, you push through wide taro leaves to discover a quiet stone alcove shielded from the downpour.',
    fog_gathering:
      'The curling river fog recedes around a ring of smoothed limestone markers bathed in pale, comforting light.',
    clear_sky:
      'Sunlight streams through the high canopy, sparkling across a crystal-clear spring bubbling beside a mossy river shrine.',
    default:
      'A quiet, consecrated clearing opens beside the rushing river, centered around a hand-carved stone Anito altar.'
  },

  passive: {
    stat: 'WIS',
    dc: 11,
    success:
      'The scent of wild ginger and burnt beeswax marks this as a consecrated Anito sanctuary: nocturnal predators and shadow-hounds will not dare cross the perimeter stones.',
    fail:
      'The small wooden figurines carved from molave wood stare impassively out toward the mist.'
  },

  prompt: [
    'Sheltered beneath colossal wild ginger fronds sits a tiered stone altar bearing dried betel nut, polished river shells, and small clay saucers for tobacco. The water bubbling from the spring beside it is pure and ice-cold.',
    'A carved wooden Anito effigy with abalone-shell eyes gazes serenely over the spring pool, waiting to see how the traveler approaches.'
  ],

  choices: [
    {
      text: 'Approach the tiered stone altar and make an Atang offering (Open Ancestral Boons)',
      openModal: 'dambana',
      complexity: 'basic',
      itemActionTag: 'Ancestral Rite // Atang Offering',
      check: null,
      successStory: [
        'You approach the tiered stone altar, bowing your head in reverence as you lay your offering before the molave carvings.',
        'A soothing warmth spreads across the clearing; the ancient Anito guardians recognize your respect and open their sanctuary blessings to your journey.'
      ],
      onSuccess: {
        heatDelta: -25,
        emitTags: ['spirit_respect', 'ancestral_communion']
      }
    },
    {
      text: 'Perform a reverent Atang offering of betel chew or dried tobacco at the altar',
      check: { stat: 'WIS', dc: 11 },
      applicableItems: ['blessed_lana_vial', 'coarse_salt_pouch', 'ripped_sheets'],
      successStory: [
        'Kneeling respectfully with head lowered, you present your offering on the flat stone. A gentle warmth washes over your limbs; the oppressive weight of unseen eyes lifts from your shoulders, and the spirits whisper safe passage.'
      ],
      failStory: [
        'Your offering is hurried and clumsy, but the guardian spirits accept your gesture with quiet tolerance.'
      ],
      onSuccess: {
        addItem: 'anito_wood_mask',
        heatDelta: -35,
        emitTags: ['spirit_respect', 'blessed_by_anito', 'clear_sky']
      },
      onFail: {
        heatDelta: -20,
        emitTags: ['spirit_respect']
      }
    },
    {
      text: 'Wash your bloodied gear, bandages, and face in the consecrated spring shallows',
      check: null,
      successStory: [
        'Plunging your hands and equipment into the mineral-rich pool, you scrub away trail mud, sweat, and the pungent tang of dried blood. The water rinses away the spirit scent, leaving your garments clean and your spirit renewed.'
      ],
      onSuccess: {
        hp: 3,
        heatDelta: -25,
        emitTags: ['steady_nerves']
      }
    },
    {
      text: 'Rest quietly against the shrine stones and listen to the murmur of the spring',
      check: { stat: 'CON', dc: 10 },
      successStory: [
        'Sitting with your back against the cool limestone, you draw several slow, restorative breaths. Your heartbeat slows, and your vitality knits itself together in the peaceful stillness.'
      ],
      failStory: [
        'The cold stone chills your back, but you still manage to catch a brief, restful respite.'
      ],
      onSuccess: {
        hp: 4,
        heatDelta: -15,
        emitTags: ['rest_hearth']
      },
      onFail: {
        hp: 2,
        heatDelta: -10,
        emitTags: ['rest_hearth']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_ancestral_altar_01',
  locationLabel: 'Ancestral Stone Altar',
  phase: 'ANY',
  repeatable: true,
  weather: 'ANY',
  baseWeight: 0.05,
  intrinsicTags: ['spice_of_life', 'anito_shrine', 'sanctuary_rest', 'chill_story', 'dambana_altar'],

  affinityWeights: {
    fog_gathering: 0.1,
    clear_sky: 0.1,
    night_falling: 0.1
  },

  seamlessHooks: {
    raining:
      'Rain drums steadily against ancient moss-grown stone slabs rising beside the trail, cloaked in sweet copal smoke that defies the downpour.',
    fog_gathering:
      'Through the curling vapor, the sacred silhouette of a tiered stone dolmen altar materializes, watched over by silent wooden effigies.',
    clear_sky:
      'Golden sunlight filters through the bamboo canopy, illuminating a sacred stone altar where wild orchids and fresh offerings rest upon ancient slabs.',
    default:
      'The winding path opens into a quiet, consecrated clearing dominated by a weathered stone dolmen altar.'
  },

  passive: {
    stat: 'WIS',
    dc: 10,
    success:
      'You recognize the consecrated stone altar as an ancestral Dambana: a dolmen erected by ancient babaylan where offerings of betel chew, oil, or gold piloncitos summon the favor of the anito.',
    fail:
      'The mossy stone dolmen radiates a profound, reverent stillness amid the rustling wilderness.'
  },

  prompt: [
    'Before you stands an ancient Ancestral Stone Altar (Dambana ng mga Ninuno). Weathered dolmen slabs blackened by centuries of beeswax torches support shallow clay saucers for Atang offerings.',
    'Carved wooden anito effigies with polished abalone-shell eyes peer quietly through sweet copal smoke, waiting to receive offerings from passing travelers seeking boons before braving darker paths.'
  ],

  choices: [
    {
      text: 'Make an Atang offering at the stone altar to commune with the Ancestors (Open Ancestral Boons)',
      openModal: 'dambana',
      complexity: 'basic',
      itemActionTag: 'Ancestral Rite // Atang Offering',
      check: null,
      successStory: [
        'You kneel before the moss-grown dolmen altar, placing your hands upon the cool stone as you recite the ancient names of your ancestors.',
        'The air grows fragrant with wild honey and mountain copal; the spirits accept your devotion, granting peace and clarity to your mind.'
      ],
      onSuccess: {
        heatDelta: -20,
        emitTags: ['spirit_respect', 'ancestral_communion']
      }
    },
    {
      text: 'Conclude your prayers with a reverent bow and step back onto the winding trail',
      complexity: 'basic',
      check: null,
      successStory: [
        'You bow your head before the ancient stone dolmen, murmuring words of respect to the unseen guardians of the islands.',
        'A soothing breeze sweeps through the bamboo canopy, carrying away the scent of copal smoke as you resume your journey with steady resolve.'
      ],
      onSuccess: {
        emitTags: ['spirit_respect', 'reflective']
      }
    },
    {
      text: 'Scoop pure consecrated rainwater from the altar hollow to soothe your fatigue',
      complexity: 'tactical',
      minInt: 9,
      check: { stat: 'CON', dc: 10 },
      successStory: [
        'The cool, consecrated water collected in the ancient stone hollow soothes your parched throat, washing away exhaustion and dispersing the predatory spirit scent clinging to your garments.'
      ],
      failStory: [
        'You drink hastily from the stone basin, swallowing bitter fallen leaves, yet the cold mountain water still calms your racing pulse.'
      ],
      onSuccess: {
        hp: 4,
        heatDelta: -20,
        emitTags: ['steady_nerves', 'sanctuary_rest']
      },
      onFail: {
        hp: 2,
        heatDelta: -10
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_batibat_nightmare_01',
  creatureId: 'batibat',
  locationLabel: 'Wayfarer Hut of the Cursed Molave Post',
  environment: 'CABIN',
  weather: 'ANY',
  baseWeight: 0.12,
  intrinsicTags: ['spice_of_life', 'spirit_encounter', 'bangungot_hazard'],

  affinityWeights: {
    wounded: 0.35,
    well_rested: 0.25
  },

  seamlessHooks: {
    entering_deep_forest:
      'Ducking into an abandoned hardwood logging hut deep in the forest, the oppressive stillness inside weighs instantly upon your chest.',
    midnight_darkness:
      'At the dead hour of midnight, the central timber pillar of the shelter creaks with heavy, malevolent mass.',
    spirit_fog_rising:
      'Damp night fog slips beneath the floorboards as an icy, suffocating pressure settles over the room.',
    default:
      'Resting your back against the central molave support post of an old timber shelter, a sudden, unnatural leaden drowsiness pins your limbs to the bamboo floor.'
  },

  passive: {
    stat: 'INT',
    dc: 14,
    success:
      'The knots in the hardwood house-post are bleeding sap: a vengeful Batibat tree-spirit still inhabits this felled timber!',
    fail:
      'The air in the cabin grows suffocatingly heavy as the grain of the wooden post begins to bulge outward.'
  },

  prompt: [
    'Out of the central timber support post oozes the Batibat: a huge, wrathful crone who once dwelled within the living tree before it was cut down. As your eyelids lock shut in waking sleep paralysis, she drops her crushing bulk directly onto your chest to induce bangungot suffocation!',
    'Your lungs burn for air as your arms refuse to obey your will.'
  ],

  choices: [
    {
      text: 'Recall Ilocano folklore: focus all your mind on biting your thumb and wiggling your big toe!',
      passiveRequirement: { stat: 'INT', dc: 12 },
      complexity: 'clever',
      minInt: 11,
      check: { stat: 'INT', dc: 14 },
      successStory: [
        'With a fierce spark of concentration, you twitch your big toe and bite down hard on your thumb! The micro-movement shatters the bangungot sleep-trance instantly; the Batibat shrieks and retreats back into the grain of the molave post!'
      ],
      failStory: [
        'Panic clouds your focus for agonizing seconds before your teeth finally graze your thumb, leaving you gasping and bruised on the floorboards!'
      ],
      onSuccess: {
        emitTags: ['lore_enriched', 'steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded']
      }
    },
    {
      text: 'Fight the crushing weight on your ribs through sheer physical endurance until the trance breaks',
      complexity: 'basic',
      check: { stat: 'CON', dc: 16 },
      successStory: [
        'Straining every muscle in your ribcage against the suffocating weight, you force a roar from your throat and throw off the nightmare crone!'
      ],
      failStory: [
        'Black spots swim across your vision as the Batibat nearly crushes the breath from your lungs before dawn light cracks through the shutters!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -5,
        emitTags: ['wounded']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_batibat_bangungot_01',
  minLevel: 2,
  creatureId: 'batibat',
  locationLabel: 'Ancient Narra Bedchamber of the Abandoned Torogan',
  environment: 'CABIN',
  weather: 'ANY',
  timeOfDay: 'NIGHT',
  baseWeight: 0.15,
  intrinsicTags: ['spice_of_life', 'spirit_encounter', 'batibat_bangungot'],

  affinityWeights: {
    night_stalker: 0.4,
    fog_gathering: 0.3
  },

  seamlessHooks: {
    entering_deep_forest:
      'Seeking sanctuary within a deserted timber lodge, the scent of aged narra wood masks the ancient spirit slumbering inside the timbers.',
    midnight_darkness:
      'As midnight claims the cabin, your eyelids grow impossibly heavy, and the air turns stiflingly thick with the terror of Bangungot sleep paralysis.',
    default:
      'Seeking shelter from the night, you collapsed into an antique four-poster bedstead carved from a single massive Narra trunk.'
  },

  passive: {
    stat: 'INT',
    dc: 12,
    success:
      'You recognize the folklore danger: Ilocano lore warns never to sleep upon felled Narra wood, lest the displaced tree-demon Batibat squat upon your chest in your sleep.',
    fail:
      'The ancient carved wooden headboard creaks with unnatural heaviness in the dead of midnight.'
  },

  prompt: [
    'In the deepest hour of the night, you wake gasping for breath. Straddling your ribcage sits a grotesque, obese hag with stringy moss-green hair and eyes like burned coal: a Batibat, enraged that a mortal dares sleep upon furniture carved from her sacred Narra tree.',
    'Her suffocating bulk pins your lungs flat against your spine. Your arms and legs are completely immobilized by the supernatural slumber-lock of Bangungot!'
  ],

  choices: [
    {
      text: 'Violently wiggle your big toes and concentrate your willpower to break the slumber-lock',
      check: { stat: 'CON', dc: 12 },
      applicableItems: ['blessed_lana_vial'],
      successStory: [
        'Channeling all your neural focus into your extremities, your great toes twitch violently! A jolt of adrenaline surges through your limbs; you roll sideways off the Narra planks as the Batibat topples with a furious croak and dissolves into foul smoke.'
      ],
      failStory: [
        'Your muscles remain like lead. The Batibat chuckles deep in her throat as darkness edges your vision before she slips away into the wood grain.'
      ],
      onSuccess: {
        cureCondition: 'bangungot_paralysis',
        emitTags: ['steady_nerves', 'clear_sky']
      },
      onFail: {
        hp: -3,
        applyCondition: { id: 'bangungot_paralysis', bodyPart: 'Chest / Limbs' },
        emitTags: ['wounded']
      }
    },
    {
      text: 'Murmur a sacred whisper to the Anito or invoke Tala with your tongue',
      check: { stat: 'WIS', dc: 12 },
      applicableItems: ['blessed_lana_vial', 'coarse_salt_pouch'],
      successStory: [
        'Though your limbs are pinned, your lips shape an ancient reverence to the ancestors. A pale golden luminescence ripples across your skin; hissing in terror, the Batibat leaps backward and vanishes into the rafters!'
      ],
      failStory: [
        'The hag presses a calloused thumb across your lips, choking your prayer into a muffled gasp.'
      ],
      onSuccess: {
        cureCondition: 'bangungot_paralysis',
        emitTags: ['spirit_respect', 'clear_sky']
      },
      onFail: {
        hp: -3,
        applyCondition: { id: 'bangungot_paralysis', bodyPart: 'Chest / Limbs' },
        emitTags: ['spirit_hexed']
      }
    },
    {
      text: 'Throw the demon off with sheer brute strength (Physical Struggle)',
      abstractLabel: 'Attempt to force your pinned limbs and heave the crushing weight off',
      check: { stat: 'STR', dc: 16 },
      physical: true,
      successStory: [
        'Defying the supernatural paralysis through pure mortal adrenaline, you heave your shoulders upward and hurl the obese hag clean across the room!'
      ],
      failStory: [
        'Your paralyzed muscles cannot overcome the demon weight; the Batibat crushes the air from your lungs!'
      ],
      onSuccess: {
        cureCondition: 'bangungot_paralysis',
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -4,
        applyCondition: { id: 'bangungot_paralysis', bodyPart: 'Chest / Limbs' },
        emitTags: ['wounded']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_tiyanak_cry_01',
  creatureId: 'tiyanak',
  locationLabel: 'Weeping Hollow in the Cogon',
  weather: 'SPIRIT FOG',
  baseWeight: 0.14,
  ambush: true,
  pressureTimer: 5000,
  reactionTimer: 5,
  intrinsicTags: ['spice_of_life', 'aswang_complex', 'tiyanak_ambush'],

  affinityWeights: {
    fog_gathering: 0.4,
    raining: 0.3
  },

  seamlessHooks: {
    default:
      'From a clump of wild banana leaves twenty paces off the main trail comes the thin, heartbreaking wail of an abandoned newborn infant.'
  },

  passive: {
    stat: 'WIS',
    dc: 15,
    success:
      'The crying never pauses to draw breath, and the shadow beneath the banana leaf has one leg noticeably longer than the other: it is a Tiyanak!',
    fail:
      'In the driving mist, the sound seems to come from a helpless swaddled child left behind by fleeing villagers.'
  },

  prompt: [
    'Wrapped in damp banana leaves lies what appears to be a crying babe, luring sympathetic travelers off the road. Yet as you step closer, its eyes flash crimson, its skin turns leathery, and its jaw unhinges to reveal rows of needle-sharp fangs!',
    'The Tiyanak, feared also as the Patiyanak, coils its mismatched legs to spring directly at your ankle!'
  ],

  choices: [
    {
      text: 'Present your garment worn Inside-Out (Baliktad) to confuse the Tiyanak before it can leap',
      passiveRequirement: { stat: 'WIS', dc: 12 },
      requireFlag: 4,
      requiredTag: 'clothing_inside_out',
      itemActionTag: 'Folklore // Inverted Garment Ward',
      check: null,
      successStory: [
        'Baffled by your reversed threads, the fanged mimic loses its sense of direction and hisses furiously as it scrambles away into the thorns.'
      ],
      onSuccess: {
        emitTags: ['steady_nerves', 'clear_sky']
      }
    },
    {
      text: 'Discern the unnatural cadence of its cry early and strike the brush before it springs',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'WIS', dc: 15 },
      successStory: [
        'Refusing to be drawn into arms reach, you lash the banana fronds first! Startled out of its ambush, the Tiyanak shrieks and flees into the undergrowth.'
      ],
      failStory: [
        'You hesitate for a split second out of pity, allowing the fanged imp to slash your shin before you kick it into the reeds!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded']
      }
    },
    {
      text: 'Wrench your boot free and break the Tiyanak jaw-lock with a swift reflex kick',
      complexity: 'basic',
      check: { stat: 'DEX', dc: 14 },
      successStory: [
        'Pivoting on your heel as its fangs snap shut on your gaiter leather, you launch the creature into a mud-pit before its teeth can pierce flesh!'
      ],
      failStory: [
        'Needle-sharp teeth sink into your ankle before you pry its jaws apart!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_amalanhig_chase_01',
  creatureId: 'amalanhig',
  locationLabel: 'Grave-Mound by the Crooked Mango Tree',
  weather: 'ANY',
  baseWeight: 0.14,
  intrinsicTags: ['spice_of_life', 'aswang_complex', 'amalanhig_revenant'],

  affinityWeights: {
    fog_gathering: 0.35,
    muddy_ground: 0.35
  },

  seamlessHooks: {
    entering_deep_forest:
      'Passing an ancient burial hollow beneath the ferns, the sound of splintering bamboo and rigid, unbending footsteps echoes from the dark trail.',
    dusk_falling:
      'As twilight bleeds from the sky, a freshly turned mound of red earth breaks open beside the road with a sickening gasp.',
    spirit_fog_rising:
      'Cold graveyard mist rolls across the path, through which a stiff-legged silhouette hops with relentless, mechanical speed.',
    default:
      'Out of a disturbed shallow grave beside the trail rises a pale, stiff-limbed corpse that failed to pass on its dungan monster-curse before dying.'
  },

  passive: {
    stat: 'INT',
    dc: 13,
    success:
      'You recognize a Visayan Amalanhig: its undead knee and elbow joints are locked completely stiff, forcing it to charge only in straight lines!',
    fail:
      'The risen ghoul fixes its dead eyes on your throat, lunging forward with terrifying speed.'
  },

  prompt: [
    'The Amalanhig lurches down the trail with arms outstretched, driven to bite your neck or tickle you to death so it does not perish a second time. Though possessing fierce undead strength, its rigor-mortis joints cannot bend cleanly around sharp corners.',
    'Beside the path stands a crooked old mango tree overlooking a deep, rushing stream.'
  ],

  choices: [
    {
      text: 'Recall Visayan lore: climb the crooked mango tree or splash across the deep stream!',
      passiveRequirement: { stat: 'INT', dc: 13 },
      complexity: 'advanced',
      minInt: 12,
      check: { stat: 'INT', dc: 13 },
      successStory: [
        'Vaulting onto the twisted mango bough above the stream, you watch as the stiff-jointed Amalanhig fails to bend its knees to climb and tumbles headfirst into the deep rushing current, where its undead animation instantly dissolves!'
      ],
      failStory: [
        'You slip on the muddy bank while crossing, taking a bruising blow from the revenant stiff arm before the deep water claims it!'
      ],
      onSuccess: {
        emitTags: ['lore_enriched', 'clear_sky']
      },
      onFail: {
        hp: -3,
        emitTags: ['wounded']
      }
    },
    {
      text: 'Juke sharply in a zigzag pattern to make the straight-charging Amalanhig slam into a boulder',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'DEX', dc: 12 },
      successStory: [
        'Stepping aside at the last heartbeat, you send the rigid revenant crashing headlong into a basalt outcrop and escape unharmed!'
      ],
      failStory: [
        'Your heel catches on a root during the turn, and the Amalanhig rakes your shoulder before overshooting into the ditch!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded']
      }
    },
    {
      text: 'Sprint down the path and hurdle the low boulders to outpace the charging corpse',
      complexity: 'basic',
      check: { stat: 'CON', dc: 12 },
      successStory: [
        'Pumping your legs with desperate vigor, you outdistance the rigid revenant until its decaying muscles seize up and it collapses into the ditch.'
      ],
      failStory: [
        'Your stamina flags on the muddy incline; the cold fingers of the revenant graze your shoulder before you break free!'
      ],
      onSuccess: {
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -3,
        emitTags: ['wounded', 'muddy_ground']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_berbalang_astral_01',
  creatureId: 'berbalang',
  locationLabel: 'Firefly Reeds of the Berbalang',
  weather: 'SPIRIT FOG',
  baseWeight: 0.12,
  intrinsicTags: ['spice_of_life', 'astral_ghoul', 'berbalang_hunt'],

  affinityWeights: {
    fog_gathering: 0.4,
    salt_ward: 0.35
  },

  seamlessHooks: {
    entering_deep_forest:
      'The forest trail gives way to an eerie clearing surrounded by whispering reeds, where millions of emerald fireflies pulse in unsettling unison.',
    midnight_darkness:
      'In the eerie hush of midnight, a swarm of glowing green fireflies rises from the tall marsh reeds ahead, coalescing into a winged spectral silhouette!',
    spirit_fog_rising:
      'Phosphorescent green mist coils above the stagnant water as the astral projection of the ghoul detaches from its hidden shell.',
    default:
      'A swarm of eerie green fireflies rises from the tall marsh reeds ahead, coalescing into a winged, cat-eyed spectral silhouette!'
  },

  passive: {
    stat: 'INT',
    dc: 16,
    success:
      'This is the astral projection of a Berbalang! Striking the flying phantom is useless while its entranced physical body lies hidden in the reeds nearby.',
    fail:
      'The slit-pupiled phantom swoops down with a mind-numbing shriek that makes your weapon hand tremble.'
  },

  prompt: [
    'The spectral Berbalang hovers above the marsh, its vertical cat-pupils blazing like twin moons as it unleashes a paralyzing spirit-screech. Somewhere in the dark sedge grass within fifty paces lies its motionless, entranced human shell.',
    'Unless you resist its shriek or trace its astral tether back to the body, its spectral talons will tear at your life-force.'
  ],

  choices: [
    {
      text: 'Trace the faint luminous cord through the reeds to locate and salt the Berbalang physical shell!',
      passiveRequirement: { stat: 'INT', dc: 15 },
      complexity: 'advanced',
      minInt: 13,
      check: { stat: 'INT', dc: 16 },
      successStory: [
        'Ignoring the swooping phantom overhead, you follow the hairline thread of green light into a reed hollow where the ghoul rigid body lies in trance. Scattering coarse salt and lime across its chest and turning the body over, you sever the astral return and banish the Berbalang forever!'
      ],
      failStory: [
        'The reeds obscure the tether until the astral projection rakes your back with freezing spectral claws!'
      ],
      onSuccess: {
        piloncitos: 8,
        emitTags: ['lore_enriched', 'clear_sky']
      },
      onFail: {
        hp: -5,
        emitTags: ['wounded', 'fog_gathering']
      }
    },
    {
      text: 'Steel your mind against the paralyzing spirit-screech and ward the phantom back',
      complexity: 'tactical',
      minInt: 10,
      check: { stat: 'WIS', dc: 14 },
      successStory: [
        'Anchoring your breathing against the psychic wail, you hold your ground until the astral hunter exhausts its trance and snaps back into the distant swamp!'
      ],
      failStory: [
        'The screech locks your muscles in terror for a heartbeat as spectral talons sear your chest!'
      ],
      onSuccess: {
        piloncitos: 5,
        emitTags: ['steady_nerves']
      },
      onFail: {
        hp: -4,
        emitTags: ['wounded']
      }
    },
    {
      text: 'Drop low into the marsh mud and crawl beneath the dense reeds to evade the swooping phantom',
      complexity: 'basic',
      check: null,
      successStory: [
        'Submerging yourself up to your chin in the thick marsh silt, you allow the reed canopy to conceal you until the green fireflies fade and the spectral screech echoes far to the west.'
      ],
      onSuccess: {
        emitTags: ['cautious', 'muddy_ground']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_kubo_tapahan_01',
  locationLabel: 'Roadside Tapahan Bahay Kubo',
  environment: 'CABIN',
  weather: 'ANY',
  baseWeight: 0.24,
  intrinsicTags: ['spice_of_life', 'kubo_hearth'],

  affinityWeights: {
    raining: 0.45,
    fog_gathering: 0.35,
    wounded: 0.4
  },

  seamlessHooks: {
    raining:
      'Driven by the lashing rain, you spot the warm amber glow of a clay hearth shining through the capiz-and-bamboo shutters of a roadside Bahay Kubo.',
    fog_gathering:
      'Through the cold spirit-mist, the fragrant scent of burning kamagong wood and roasted ginger draws you up the bamboo ladder of a wayfarer tapahan hut.',
    default:
      'At a crossroads beneath a tamarind tree stands a sturdy Bahay Kubo smokehouse, its clay dapugan hearth crackling with dry coconut husks.'
  },

  passive: {
    stat: 'WIS',
    dc: 12,
    success:
      'Bundles of blessed palaspas and dried bayabas hang above the hearth rafters, keeping night-spirits far from the warm bamboo floorboards.',
    fail:
      'The sudden warmth of the crackling fire after the damp road makes your eyelids heavy.'
  },

  prompt: [
    'Inside the cozy woven-sawali walls of the Bahay Kubo, an old innkeeper tends a sunken clay hearth where strips of smoked boar meat sizzle over glowing narra coals. The dry rustle and pop of the fire fill the room as rain and wind patter harmlessly against the nipa thatch outside.',
    'A clay pot of steaming salabat ginger tea bubbles beside the embers, offered to any traveler brave enough to walk the eclipse road.'
  ],

  choices: [
    {
      text: 'Sit by the crackling dapugan hearth, drink the hot ginger salabat, and dry your gear',
      check: null,
      successStory: [
        'The fiery ginger broth and the radiating heat of the bamboo-framed hearth restore the warmth to your bones before you step back onto the trail.'
      ],
      onSuccess: {
        hp: 3,
        emitTags: ['well_rested', 'kapwa_bond']
      }
    },
    {
      text: 'Trade tales of the road with the innkeeper in exchange for a bundle of dried herbs',
      check: { stat: 'CHA', dc: 12 },
      successStory: [
        'Pleased by your courtesy beside the fire, the elder presses a bundle of wild bayabas leaves into your palm and blesses your journey.'
      ],
      failStory: [
        'Your grim account of the eclipse frightens the other wayfarers by the hearth, and you depart in uneasy silence.'
      ],
      onSuccess: {
        addItem: 'bayabas_herbs',
        emitTags: ['kapwa_bond', 'spirit_respect']
      },
      onFail: {
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_windy_scout_tent_01',
  locationLabel: 'Wind-Lashed Scout Tent on the Ridge',
  environment: 'TENT',
  weather: 'ANY',
  baseWeight: 0.24,
  intrinsicTags: ['spice_of_life', 'field_tent'],

  affinityWeights: {
    high_ground: 0.45,
    raining: 0.35,
    cautious: 0.3
  },

  seamlessHooks: {
    raining:
      'Fighting against the gale on the exposed ridge, you duck beneath the flapping oilskin flaps of a staked watch-tent.',
    fog_gathering:
      'A solitary brass storm-lantern sways inside a pitched abaca-canvas tent anchored to the rocks ahead.',
    default:
      'Where the trail narrows along a windy saddle, barangay lookouts have pitched a low woven-mat and oilskin field tent.'
  },

  passive: {
    stat: 'CON',
    dc: 12,
    success:
      'Though the mountain gusts whistle fiercely through the guy-ropes and make the canvas walls billow inward, the bamboo ridgepole is lashed tight.',
    fail:
      'Every howl of the wind against the taut tent cloth sounds like wings beating just outside.'
  },

  prompt: [
    'Inside the field tent, the wind roars continuously against the waxed abaca canvas, making the hanging brass lamp swing in wide arcs across a crate of scout supplies. Hemp guy-lines creak under the strain as dry cogon grass whips beneath the lower hem.',
    'The lookouts departed in haste, leaving their map-slats pinned down with river stones and a spare cloth wrap on the cot.'
  ],

  choices: [
    {
      text: 'Tighten the hemp guy-ropes against the howling wind and salvage the Ripped Cloth Sheets',
      check: { stat: 'DEX', dc: 12 },
      successStory: [
        'Bracing against the flapping canvas, you secure the windward stakes and pack the clean cloth sheets before continuing along the ridge.'
      ],
      failStory: [
        'A sudden gust snaps a bamboo tent-peg against your knuckles as the canvas whips violently, though you manage to grab the cloth.'
      ],
      onSuccess: {
        addItem: 'ripped_sheets',
        emitTags: ['steady_nerves', 'high_ground']
      },
      onFail: {
        hp: -2,
        addItem: 'ripped_sheets',
        emitTags: ['high_ground']
      }
    },
    {
      text: 'Shelter briefly behind the billowing tent flaps to catch your breath out of the gale',
      check: null,
      successStory: [
        'Listening to the rhythmic rush of wind over the woven canvas, you steady your breathing and study the scout markings before moving on.'
      ],
      onSuccess: {
        hp: 2,
        emitTags: ['cautious']
      }
    }
  ]
});

NarrativeRegistry.registerMiscScenario({
  id: 'misc_crowded_kedatuan_market_01',
  locationLabel: 'Bustling Night-Bazaar of the River Kedatuan',
  environment: 'CITY',
  weather: 'ANY',
  baseWeight: 0.24,
  intrinsicTags: ['spice_of_life', 'crowded_settlement'],

  affinityWeights: {
    clear_sky: 0.4,
    status_royal: 0.4,
    status_rich: 0.4,
    status_well_known: 0.4
  },

  seamlessHooks: {
    entering_village_gates:
      'Passing beneath the carved timber archways of the river settlement, the tranquil forest yields to hundreds of glowing lanterns and the bustling din of commerce.',
    dusk_falling:
      'Sunset paints the river settlement in copper hues as dockworkers haul cargo bales onto the packed boardwalks under the evening breeze.',
    raining:
      'Rounding the river bend, the dark wilderness gives way to hundreds of oiled-paper lanterns and the bustling murmur of a fortified port settlement.',
    fog_gathering:
      'Warm golden light pierces the mist ahead where a walled river-kingdom crowds its wharf with refugees, traders, and palace guards.',
    default:
      'The solitary trail opens onto the timbered boardwalks of a thriving river Kedatuan, alive with the hum of hundreds of voices.'
  },

  passive: {
    stat: 'INT',
    dc: 13,
    success:
      'Beneath the constant murmur of bartering merchants and clinking brass weights, town criers are trading news of safe paths through the eclipse.',
    fail:
      'After hours in the quiet wilds, the sheer press of shoulders, lantern smoke, and overlapping chatter is almost overwhelming.'
  },

  prompt: [
    'Hundreds of townsfolk, Visayan oarsmen, and highland traders crowd the lantern-lit boardwalks between towering stilt-houses and the Datu stockade. The air hums with subtle background chatter: goldsmiths weighing piloncitos, apothecaries grinding herbs, and families whispering prayers against the Bakunawa.',
    'At a corner stall draped in woven textiles, an apothecary calls out over the murmur of the crowd.'
  ],

  choices: [
    {
      text: 'Navigate the crowded boardwalks and trade with the apothecary for a Sterilized Poultice',
      check: { stat: 'CHA', dc: 12 },
      successStory: [
        'Moving smoothly through the press of villagers and merchants, you strike a fair bargain in the lantern light and secure a fresh herbal poultice.'
      ],
      failStory: [
        'Jostled by a panicked caravan guard in the dense crowd, you drop a few piloncitos between the boardwalk planks before reaching the stall.'
      ],
      onSuccess: {
        addItem: 'herbal_poultice',
        emitTags: ['kapwa_bond']
      },
      onFail: {
        piloncitos: -2,
        emitTags: ['cautious']
      }
    },
    {
      text: 'Blend into the murmuring crowd by the harbor lanterns and listen for rumors of the road',
      check: null,
      successStory: [
        'Letting the warm wash of human voices and distant agung chimes steady your spirit, you glean vital bearings from the harbor oarsmen before departing the gates.'
      ],
      onSuccess: {
        emitTags: ['lore_enriched', 'steady_nerves']
      }
    }
  ]
});
