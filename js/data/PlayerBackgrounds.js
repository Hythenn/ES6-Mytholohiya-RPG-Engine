/**
 * PlayerBackgrounds.js
 * Baldur's Gate style attributes (Strength, Dexterity, Constitution,
 * Intelligence, Wisdom, Charisma), pre-colonial Philippine Mythos archetypes,
 * starting equipment/items, and dynamic Prologue scenarios.
 */

export const STAT_DEFINITIONS = Object.freeze({
  STR: {
    name: 'Strength',
    code: 'STR',
    subtitle: 'Physical Power & Might',
    description: 'Measures bodily power, athletic training, and force with heavy weapons.'
  },
  DEX: {
    name: 'Dexterity',
    code: 'DEX',
    subtitle: 'Agility & Reflexes',
    description: 'Measures agility, balance, stealth, and precision with ranged or finesse weapons.'
  },
  CON: {
    name: 'Constitution',
    code: 'CON',
    subtitle: 'Endurance & Vitality',
    description: 'Measures health, stamina, and resistance to poison, disease, and exhaustion.'
  },
  INT: {
    name: 'Intelligence',
    code: 'INT',
    subtitle: 'Memory & Arcane Lore',
    description: 'Measures mental acuity, Baybayin scholarship, alchemy, and deductive reasoning.'
  },
  WIS: {
    name: 'Wisdom',
    code: 'WIS',
    subtitle: 'Perception & Spirit Sight',
    description: 'Measures attunement to the unseen Anito realm, willpower, and survival instinct.'
  },
  CHA: {
    name: 'Charisma',
    code: 'CHA',
    subtitle: 'Force of Personality',
    description: 'Measures leadership, persuasion, and bargaining with mortal datus or Diwatas.'
  }
});

export const PRECOLONIAL_NAMES = [
  'Bagani',
  'Lakan Dula',
  'Mayari',
  'Humabon',
  'Urduja',
  'Kudarat',
  'Tala',
  'Sikatuna',
  'Amihan',
  'Bantugan',
  'Liwayway',
  'Handiong',
  'Alunsina',
  'Sumakwel',
  'Bulan',
  'Magat',
  'Dayang Sima',
  'Gat Pulintang',
  'Haliya',
  'Bangkaya'
];

export const EPITHETS = [
  'of the Ash River',
  'of the Sunken Reef',
  'the Storm-Born',
  'of Mount Madja-as',
  'the Night-Walker',
  'of the Red Mangrove',
  'the Iron-Tongued',
  'of the Broken Moon'
];

export function generateRandomName() {
  const first = PRECOLONIAL_NAMES[Math.floor(Math.random() * PRECOLONIAL_NAMES.length)];
  const normalized = first.charAt(0).toUpperCase() + first.slice(1);
  if (Math.random() < 0.45) {
    const ep = EPITHETS[Math.floor(Math.random() * EPITHETS.length)];
    return `${normalized} ${ep}`;
  }
  return normalized;
}

export const EXPERTISE_OPTIONS = [
  {
    id: 'exp_orasyon',
    name: 'Orasyon & Spirit-Binding',
    description: 'Trained in whispered incantations that appease or bind restless Anito.',
    statBonus: { WIS: 2, CHA: 1 },
    tag: 'expertise_orasyon',
    bonusItems: ['blessed_lana_vial', 'babaylan_sash']
  },
  {
    id: 'exp_kali',
    name: 'Kampilan & Kali Blade-Craft',
    description: 'Deadly flow with twin rattan sticks, kris daggers, and heavy iron.',
    statBonus: { STR: 2, DEX: 1 },
    tag: 'expertise_kali',
    bonusItems: ['brass_vambraces', 'abaca_hand_wraps']
  },
  {
    id: 'exp_albularyo',
    name: 'Root-Lore & Venom Alchemy',
    description: 'Distills antidotes, glowing salves, and paralyzing blowpipe saps.',
    statBonus: { INT: 2, CON: 1 },
    tag: 'expertise_alchemy',
    bonusItems: ['bayabas_herbs', 'ripped_sheets', 'coarse_salt_pouch']
  },
  {
    id: 'exp_baybayin',
    name: 'Baybayin & Star Navigation',
    description: 'Reads ancient bamboo chronicles, tidal charts, and eclipse omens.',
    statBonus: { INT: 2, WIS: 1 },
    tag: 'expertise_scholar',
    bonusItems: ['black_coral_ring']
  },
  {
    id: 'exp_bantay',
    name: 'Jungle Stalking & Deadfalls',
    description: 'Moves without sound across wet foliage and spots ambushes early.',
    statBonus: { DEX: 2, WIS: 1 },
    tag: 'expertise_tracker',
    bonusItems: ['abaca_face_wrap', 'abaca_hand_wraps']
  }
];

export const SOCIAL_STATUS_TIERS = [
  {
    id: 'poor',
    label: 'Poor (Outcast Namamahay)',
    tag: 'status_poor',
    wealthLabel: 'Destitute',
    remnantsBonus: 1,
    hpMod: 0,
    badgeColor: '#8b7e74',
    bonusItems: ['abaca_tunic', 'ripped_sheets', 'coarse_salt_pouch'],
    description:
      'Born at the muddy fringe of the barangay with patched abaca garments, calloused hands, and an empty belly.'
  },
  {
    id: 'well_known',
    label: 'Well-Known (Folk Champion)',
    tag: 'status_well_known',
    wealthLabel: 'Modest',
    remnantsBonus: 5,
    hpMod: 1,
    badgeColor: '#529985',
    bonusItems: ['abaca_tunic', 'salakot_hat', 'anahaw_rain_cape'],
    description:
      'Songs of your deeds travel from river-market to campfire; elders greet you by name and offer shelter.'
  },
  {
    id: 'rich',
    label: 'Rich (Gold-Scale Merchant)',
    tag: 'status_rich',
    wealthLabel: 'Affluent',
    remnantsBonus: 14,
    hpMod: -1,
    badgeColor: '#d4af63',
    bonusItems: ['ceremonial_malong', 'anahaw_rain_cape', 'gold_calamansanay_band', 'herbal_poultice'],
    description:
      'Your belt-pouch clinks with barter remnants, Chinese celadon shards, and hammered piloncitos gold.'
  },
  {
    id: 'powerful',
    label: 'Powerful (Warlord Lineage)',
    tag: 'status_powerful',
    wealthLabel: 'Commanding',
    remnantsBonus: 9,
    hpMod: 3,
    badgeColor: '#c9594e',
    bonusItems: ['carabao_hide_cuirass', 'kalasag_wooden_shield', 'kris_blade'],
    description:
      'Feared in council and sworn by blood-compact to high chiefs; lesser warriors step aside when your shadow falls.'
  },
  {
    id: 'royal',
    label: 'Royal (Heir of the Kedatuan)',
    tag: 'status_royal',
    wealthLabel: 'Dynastic Gold',
    remnantsBonus: 18,
    hpMod: 1,
    badgeColor: '#e29547',
    bonusItems: ['batuani_brass_breastplate', 'haliya_golden_mask', 'gold_calamansanay_band', 'herbal_poultice'],
    description:
      'Raised inside the carved Torogan palace on woven silk mats, wearing the sacred golden mask and heirloom regalia of a paramount Datu.'
  }
];

export function rollRandomSocialStatus() {
  const weights = [
    { tier: SOCIAL_STATUS_TIERS[0], w: 28 },
    { tier: SOCIAL_STATUS_TIERS[1], w: 26 },
    { tier: SOCIAL_STATUS_TIERS[2], w: 20 },
    { tier: SOCIAL_STATUS_TIERS[3], w: 15 },
    { tier: SOCIAL_STATUS_TIERS[4], w: 11 }
  ];
  const total = weights.reduce((acc, item) => acc + item.w, 0);
  let roll = Math.random() * total;
  for (const item of weights) {
    roll -= item.w;
    if (roll <= 0) return item.tier;
  }
  return weights[0].tier;
}

export const PlayerBackgrounds = [
  {
    id: 'babaylan_acolyte',
    name: 'Babaylan Acolyte',
    tag: 'Speaker to the Anito',
    defaultExpertiseId: 'exp_orasyon',
    quote: '"Every stone and river-bend remembers the name of the spirit that shaped it."',
    description:
      'Initiated in the highland shrines of Panay, you walk between mortal barangays and the unseen realm of Diwatas, carrying offerings of betel nut and red thread.',
    stats: {
      STR: 9,
      DEX: 11,
      CON: 11,
      INT: 13,
      WIS: 15,
      CHA: 14
    },
    maxVitality: 16,
    startingRemnants: 3,
    startingEquipment: [
      'anting_anting_brass_pendant',
      'bagacay_bamboo_spear',
      'woven_bahag_loincloth',
      'carabao_leather_sandals',
      'blessed_lana_vial'
    ],
    startingFlags: ['raining', 'spirit_sensitive']
  },
  {
    id: 'mandigma_outcast',
    name: 'Pintados Mandigma',
    tag: 'Tattooed Blade of the Coast',
    defaultExpertiseId: 'exp_kali',
    quote: '"My skin holds the chronicle of every beast and raider I have survived."',
    description:
      'Bearing indigo serpent tattoos from ankle to throat, you are a seasoned warrior-scout sworn to hunt the creatures multiplying under the shadow of the Bakunawa.',
    stats: {
      STR: 15,
      DEX: 13,
      CON: 14,
      INT: 10,
      WIS: 11,
      CHA: 10
    },
    maxVitality: 21,
    startingRemnants: 2,
    startingEquipment: [
      'kampilan_sword',
      'brass_vambraces',
      'woven_bahag_loincloth',
      'carabao_leather_sandals',
      'ripped_sheets'
    ],
    startingFlags: ['raining', 'bloodied_blade']
  },
  {
    id: 'panday_chronicler',
    name: 'Baybayin Wayfarer',
    tag: 'Keeper of Bamboo Scrolls',
    defaultExpertiseId: 'exp_baybayin',
    quote: '"Before the eclipse swallows the moon, someone must record how the old pacts broke."',
    description:
      'A scholar-artisan skilled in ritual metallurgy, ancient trade scripts, and navigating the treacherous salt trails linking coastal kedatuans.',
    stats: {
      STR: 10,
      DEX: 12,
      CON: 11,
      INT: 15,
      WIS: 13,
      CHA: 12
    },
    maxVitality: 17,
    startingRemnants: 4,
    startingEquipment: [
      'kris_blade',
      'bamboo_torch',
      'babaylan_sash',
      'woven_bahag_loincloth',
      'carabao_leather_sandals'
    ],
    startingFlags: ['clear_sky', 'lore_enriched']
  },
  {
    id: 'mangangayaw_corsair',
    name: 'Balangay Sea-Raider',
    tag: 'Navigator of the Black Current',
    defaultExpertiseId: 'exp_bantay',
    quote: '"The sea takes everything eventually; I just collect the toll early."',
    description:
      'Hardened by typhoon crossings and midnight boarding actions across the archipelago, equally at home on a rolling outrigger deck or a flooded marsh.',
    stats: {
      STR: 13,
      DEX: 15,
      CON: 12,
      INT: 11,
      WIS: 12,
      CHA: 10
    },
    maxVitality: 19,
    startingRemnants: 3,
    startingEquipment: [
      'bagacay_bamboo_spear',
      'kalasag_wooden_shield',
      'woven_bahag_loincloth',
      'carabao_leather_sandals',
      'coarse_salt_pouch'
    ],
    startingFlags: ['fog_gathering', 'coastal_wind']
  },
  {
    id: 'mumbaki_warden',
    name: 'Cordillera Mumbaki',
    tag: 'Keeper of the Bulul Chants',
    defaultExpertiseId: 'exp_albularyo',
    quote: '"We carved our prayers into the mountain stone long before the sea rose."',
    description:
      'A highland chant-priest and herbalist from the cloud-carved terraces of Ifugao, versed in ancestral baki invocations, blood augury, and consecrating wooden Bulul guardians.',
    stats: {
      STR: 11,
      DEX: 10,
      CON: 14,
      INT: 13,
      WIS: 15,
      CHA: 11
    },
    maxVitality: 20,
    startingRemnants: 3,
    startingEquipment: [
      'bagacay_bamboo_spear',
      'brass_agung_gong',
      'woven_bahag_loincloth',
      'carabao_leather_sandals',
      'bayabas_herbs'
    ],
    startingFlags: ['high_ground', 'spirit_respect']
  }
];

/**
 * Build a personalized Prologue scenario sequence tailored to the player's
 * randomized Social Status & Wealth tier, Background, and Expertise.
 */
export function buildPrologueScenarios(identity) {
  const {
    characterName,
    backgroundName,
    expertiseName,
    socialStatus
  } = identity;

  const statusId = socialStatus ? socialStatus.id : 'poor';

  const templates = {
    royal: [
      {
        id: 'prologue_royal_01',
        isPrologue: true,
        locationLabel: 'Gilded Torogan Palace of the Kedatuan',
        environment: 'CITY',
        weather: 'SPIRIT FOG',
        prompt: [
          `Silk banners embroidered with golden sarimanok feathers billow inside the towering Torogan royal longhouse. As ${characterName}, born of Royal blood and trained as a ${backgroundName} in ${expertiseName}, you have known only carved narra pillars, brass agung gongs, and servants bearing porcelain platters.`,
          'Tonight, however, the ancestral gold masks along the throne dais weep black brine. Outside the palace compound, the moon turns the color of clotted blood as a monstrous shadow coils across the clouds.',
          'Your aging uncle, the Paramount Datu, presses a sealed bamboo edict into your jewel-ringed hand. "The coastal salt-wards have collapsed," he whispers over the trembling floorbeams. "If the royal line cowers behind palace walls, the Kedatuan falls before dawn."'
        ],
        passive: {
          stat: 'WIS',
          dc: 13,
          success: 'You sense the palace guardian spirits retreating from the eaves in terror.',
          fail: 'The cold draft extinguishes the perfumed beeswax lamps one by one.'
        },
        choices: [
          {
            text: 'Claim the carved Anito mask from the royal dais and swear a silent oath before departing',
            check: null,
            successStory: [
              'You lift the charred kamagong Anito mask from its hook above the throne, fasten it to your pack, and descend the carved panolong stairs into the mist.'
            ],
            onSuccess: {
              addItem: 'anito_wood_mask',
              emitTags: ['status_royal', 'spirit_respect', 'fog_gathering']
            }
          },
          {
            text: 'Slip out unseen through the flooded postern canal to avoid the eyes of the court',
            check: { stat: 'DEX', dc: 13 },
            successStory: [
              'Shedding your court mantle, you ghost past the palace guards and drop into the mist-shrouded canal leading toward the coast.'
            ],
            failStory: [
              'Your boot slips on the wet stone steps of the water-gate, gashing your knee against a submerged bronze grate before you haul yourself out into the night.'
            ],
            onSuccess: { emitTags: ['status_royal', 'cautious', 'fog_gathering'] },
            onFail: { hp: -3, emitTags: ['status_royal', 'wounded', 'raining'] }
          },
          {
            text: 'Decline the ceremonial drama, consult the palace map-slats briefly, and depart at your own pace',
            check: null,
            successStory: [
              'Setting aside courtly panic, you study the coastal bearings on the bamboo map-table and walk calmly out the main compound gates.'
            ],
            onSuccess: {
              emitTags: ['status_royal', 'steady_nerves', 'clear_sky']
            }
          }
        ]
      }
    ],

    powerful: [
      {
        id: 'prologue_powerful_01',
        isPrologue: true,
        locationLabel: 'Fortified Hilltop Kota War-Hall',
        environment: 'CABIN',
        weather: 'MONSOON',
        prompt: [
          `Torchlight glints off hundreds of iron kampilan blades mounted along the stockade walls of the High Kota. You are ${characterName}, scion of a Powerful warlord bloodline, honed as a ${backgroundName} with mastery in ${expertiseName}.`,
          'Around the sunken fire-pit, tattooed sub-chiefs argue in hushed, furious tones over reports of missing coastal patrols. An open chest of field supplies rests beside the war-bench.',
          'When you rise from your seat, the council looks to see what course you will take.'
        ],
        passive: {
          stat: 'INT',
          dc: 13,
          success: 'The map etched in the ash shows the disturbances clustering along the Drowned Salt Trail.',
          fail: 'Thunder shakes the heavy molave timbers of the fortress roof.'
        },
        choices: [
          {
            text: 'Strike your weapon against the hearth-stone and vow to scout the coastal trail yourself',
            check: null,
            successStory: [
              'The sub-chiefs bow their heads in respect as the stockade gates groan open, letting you stride out into the monsoon.'
            ],
            onSuccess: { emitTags: ['status_powerful', 'steady_nerves', 'raining'] }
          },
          {
            text: 'Command the arguing sub-chiefs to yield a herbal poultice from the war-chest for your march',
            check: { stat: 'STR', dc: 13 },
            successStory: [
              'Your commanding presence silences the dispute at once; the quartermaster hands over a fresh herbal poultice before you march into the storm.'
            ],
            failStory: [
              'In your haste to slam the war-chest shut, a jagged iron hasp slices your palm before you stride out the gate.'
            ],
            onSuccess: { addItem: 'herbal_poultice', emitTags: ['status_powerful', 'raining'] },
            onFail: { hp: -2, emitTags: ['status_powerful', 'wounded', 'raining'] }
          },
          {
            text: 'Leave the sub-chiefs to their arguments and slip out quietly through the watchtower postern',
            check: null,
            successStory: [
              'Preferring action over war-hall speeches, you shoulder your pack and take the quiet ridge path down from the Kota.'
            ],
            onSuccess: { emitTags: ['status_powerful', 'cautious', 'high_ground'] }
          }
        ]
      }
    ],

    rich: [
      {
        id: 'prologue_rich_01',
        isPrologue: true,
        locationLabel: 'Lantern-Lit Balangay Merchant Wharf',
        environment: 'CITY',
        weather: 'DRIZZLE',
        prompt: [
          `Inside the teakwood cabin of your family flagship trading vessel, brass scales gleam beside jars of Ming celadon, camphor, and pearls. You are ${characterName}, born into Rich mercantile privilege yet trained as a ${backgroundName} versed in ${expertiseName}.`,
          'Outside on the wharf, the harbor bell tolls a warning as port guards draw a quarantine chain across the bay. The salt-caravans that owed your house a fortune have gone silent along the coast road.',
          'You can step ashore now to investigate the trade route, bargain for a private skiff, or take the quiet inland road.'
        ],
        passive: {
          stat: 'WIS',
          dc: 13,
          success: 'You spot deep claw-marks gouged into the mahogany rudder-post below the waterline.',
          fail: 'The scent of wet cinnamon and river-rot mingles on the deck.'
        },
        choices: [
          {
            text: 'Take a shipwright iron prybar from the cargo hold and step ashore dressed as a common traveler',
            check: null,
            successStory: [
              'Knowing that fine silk attracts both bandits and hungry spirits, you tuck a heavy iron prybar into your sash and walk down the gangplank into the coastal mist.'
            ],
            onSuccess: {
              addItem: 'iron_prybar',
              emitTags: ['status_rich', 'cautious', 'fog_gathering']
            }
          },
          {
            text: 'Pay a harbor oarsman 3 Remnants to row you past the quarantined wharf',
            check: { stat: 'CHA', dc: 13 },
            successStory: [
              'Parting with a share of your remnants, you convince the boatman to drop you dry-shod beyond the harbor chain.'
            ],
            failStory: [
              'The nervous boatman shoves his skiff off too early in the dark, dumping you knee-deep into barnacle-encrusted pilings!'
            ],
            onSuccess: { remnants: -3, emitTags: ['status_rich', 'clear_sky'] },
            onFail: { remnants: -3, hp: -3, emitTags: ['status_rich', 'wounded', 'raining'] }
          },
          {
            text: 'Keep your remnants tied tight and walk the upper cliff road around the harbor at your own pace',
            check: null,
            successStory: [
              'You lock your cabin chest, bypass the crowded wharf altogether, and follow the quiet lantern-posts up the coastal bluff.'
            ],
            onSuccess: { emitTags: ['status_rich', 'steady_nerves', 'high_ground'] }
          }
        ]
      }
    ],

    well_known: [
      {
        id: 'prologue_well_known_01',
        isPrologue: true,
        locationLabel: 'Banyan Feast-Circle of Barangay Malandog',
        environment: 'CITY',
        weather: 'CLEAR',
        prompt: [
          `Coconut-shell bowls of palm wine pass from hand to hand around the communal bonfire as villagers greet you by name. You are ${characterName}, a Well-Known figure across the river settlements, respected as a ${backgroundName} practiced in ${expertiseName}.`,
          'The music falters when a mud-spattered runner stumbles into the firelight from the tidal road, reporting that a strange mist has swallowed the coastal salt pans.',
          'The village elders turn toward you, waiting to see how you will respond.'
        ],
        passive: {
          stat: 'CHA',
          dc: 13,
          success: 'The villagers trust your judgment implicitly, whatever path you choose.',
          fail: 'Unease ripples through the crowd as the bonfire flames dip low.'
        },
        choices: [
          {
            text: 'Take a burning resin torch from the watchfire and set out along the tidal road',
            check: null,
            successStory: [
              'You clasp the elder forearm in reassurance, lift a burning resin torch from the rack, and stride out beyond the circle of huts.'
            ],
            onSuccess: {
              addItem: 'bamboo_torch',
              emitTags: ['status_well_known', 'kapwa_bond', 'clear_sky']
            }
          },
          {
            text: 'Sit the runner down by the fire and question him calmly about what he heard in the mist',
            check: { stat: 'WIS', dc: 13 },
            successStory: [
              'Your steady voice calms the runner enough to learn a vital piece of folklore: turning your shirt inside-out prevents the mist-spirits from leading you in circles.'
            ],
            failStory: [
              'The runner shivers in feverish exhaustion, able only to mutter warnings of shadows in the mangroves before you set out.'
            ],
            onSuccess: { emitTags: ['status_well_known', 'knows_reed_warning', 'cautious', 'fog_gathering'] },
            onFail: { emitTags: ['status_well_known', 'fog_gathering'] }
          },
          {
            text: 'Urge the elders to bar their gates for the night while you circle wide along the dry ridge',
            check: null,
            successStory: [
              'Seeing the villagers safely behind their bamboo stockade, you take the elevated ridge trail overlooking the coast.'
            ],
            onSuccess: { emitTags: ['status_well_known', 'cautious', 'high_ground'] }
          }
        ]
      }
    ],

    poor: [
      {
        id: 'prologue_poor_01',
        isPrologue: true,
        locationLabel: 'Sunken Nipa Shack at the Ditch-Edge',
        environment: 'CABIN',
        weather: 'MONSOON',
        prompt: [
          `Cold rainwater drips through the patched palm-thatch of your leaning Bahay Kubo on the muddy edge of the settlement. You are ${characterName}, born Poor with neither gold nor noble title, surviving by your wits as a self-taught ${backgroundName} skilled in ${expertiseName}.`,
          'Inside the dimly lit hut, a bundle of dried bayabas leaves hangs from the bamboo rafters above your small clay hearth. Outside in the flooded ditch below, something heavy scrapes against the bamboo stilts of your kubo, sniffing at the gaps in the split-bamboo floorboards.',
          'The inner stockade gates of the settlement are barred for the night, leaving you to decide how to leave your hut.'
        ],
        passive: {
          stat: 'CON',
          dc: 13,
          success: 'Years of hardship steady your breathing as you watch the floorboards flex above the dark ditch.',
          fail: 'A cold draft rises through the gaps in the bamboo floor, carrying the stench of wet fur and swamp mud.'
        },
        choices: [
          {
            text: 'Take the dried bayabas leaves from the rafters, bar the floor-hatch, and slip out the back window onto the raised dike',
            check: null,
            successStory: [
              'Moving without a sound inside the kubo, you tuck the dried bayabas leaves into your pack, wedge the floor-hatch shut, and step out the rear shutter onto the high mud-dike away from the ditch.'
            ],
            onSuccess: {
              addItem: 'bayabas_herbs',
              emitTags: ['status_poor', 'cautious', 'raining']
            }
          },
          {
            text: 'Scoop glowing hearth-embers and drop them through the gaps in the bamboo floor to drive off whatever lurks under the stilts',
            check: { stat: 'WIS', dc: 12 },
            successStory: [
              'Showering red-hot coals through the floor-slats, you hear a startled yelp and a splash as the nocturnal stalker bolts from beneath your stilts, leaving the path outside clear as you grab your bayabas herbs and depart!'
            ],
            failStory: [
              'As you dump the embers through the floor-slats, a clawed paw lashes upward between the bamboo strips, scratching your ankle before the creature flees into the rain!'
            ],
            onSuccess: {
              addItem: 'bayabas_herbs',
              remnants: 2,
              emitTags: ['status_poor', 'steady_nerves', 'raining']
            },
            onFail: {
              hp: -3,
              emitTags: ['status_poor', 'wounded', 'raining', 'muddy_ground']
            }
          },
          {
            text: 'Vault from the front bamboo ladder across the ditch to reach the coastal trail at a dead run',
            check: { stat: 'DEX', dc: 13 },
            successStory: [
              'Kicking open the shutter, you leap clear over the flooded ditch before the shadow beneath the stilts can react, landing cleanly on the salt trail!'
            ],
            failStory: [
              'Your heel slips on the rain-slick bamboo rung as you leap, bruising your ribs against the ditch bank before you scramble onto the trail!'
            ],
            onSuccess: { emitTags: ['status_poor', 'high_ground', 'raining'] },
            onFail: { hp: -3, emitTags: ['status_poor', 'wounded', 'muddy_ground'] }
          }
        ]
      }
    ]
  };

  return templates[statusId] || templates.poor;
}
