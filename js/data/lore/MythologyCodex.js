/**
 * MythologyCodex.js
 * Encyclopedia of Philippine mythological creatures, spirits, deities,
 * and cultural folklore relics featured in "Mytholohiya".
 * Provides keyword annotation for narrative text so terms are hoverable
 * (floating tooltip preview) and clickable (full lore modal with attributes,
 * known attitude, origin, wards, and description).
 */

export const MYTHOLOGY_CODEX = Object.freeze({
  bakunawa: {
    id: 'bakunawa',
    name: 'Bakunawa',
    title: 'The Moon-Devouring Eclipse Serpent',
    category: 'Aquatic Leviathan',
    origin: 'Visayan & Bicolano Mythology',
    attitude: 'Cataclysmic & World-Devouring',
    attitudeTone: 'hostile',
    attributes: [
      'Colossal Abyssal Sea-Serpent Dragon',
      'Swallows Celestial Moons During Alignments',
      'Primary Biomes: AbyssalOcean, CoastalReef, EclipseNight',
      'Checks: STR (DC 17 Gong Impact) & INT (DC 16 Eclipse Timing)'
    ],
    wards:
      'Acoustic Shock Wave: Beating brass agung gongs, iron pots, or bamboo clappers with maximum force while aligning Babaylan chants.',
    shortSummary:
      'A colossal sea-serpent dragon of the abyssal ocean depths that rises during cosmic alignments to swallow the moon.',
    description:
      'In Visayan and Bicolano cosmology, the Bakunawa is a colossal sea-serpent dragon residing in the abyssal ocean depths. Enraptured by the luminous beauty of the celestial moons, the Bakunawa rises during cosmic alignments to swallow the last moon, plunging the archipelago into lunar eclipses and cosmic chaos. Only an acoustic shock wave of beaten brass gongs, iron pots, and Babaylan chants can disrupt its swallowing trance and force it to regurgitate the moon.',
    keywords: ['Bakunawa', 'bakunawa']
  },

  tikbalang: {
    id: 'tikbalang',
    name: 'Tikbalang / Tayho',
    title: 'The Forest Bander',
    category: 'Woodland Guardian',
    origin: 'Tagalog & Bicolano (Tayho) Folklore',
    attitude: 'Trickster & Territorial Spatial Bender',
    attitudeTone: 'neutral',
    attributes: [
      'Towering Bony Humanoid with Ironwood Horse Head & Hooves',
      'Knees Rise Above Head When Squatting in Canopy',
      'Warps Forest Geometry into Endless Spatial Loops',
      'Checks: WIS (DC 14 Pierce Illusions) & STR (DC 16 Grapple Mane)'
    ],
    wards:
      'Inverted Garment Ward (wearing abaca garments inside-out shatters the spatial loop) or plucking a golden hair from its mane.',
    shortSummary:
      'A towering horse-headed humanoid (known as Tayho in Bicol) that traps travelers in spatial loops while puffing acrid cigar smoke.',
    description:
      'Documented across Tagalog and Bicolano (Tayho) traditions, the Tikbalang is a towering, bony humanoid beast with the head and hooves of an ironwood stallion and elongated limbs whose knees rise above its head when squatting. Puffing acrid tobacco smoke among bamboo thickets and balete groves, it manipulates forest geometry to trap travelers in endless circular trails. Turning a garment inside-out immediately shatters its spatial distortion, while grappling the beast to pluck a golden strand from its mane subjugates it into yielding piloncitos and offerings.',
    keywords: ['Tikbalang', 'tikbalang', 'Tayho', 'tayho']
  },

  kapre: {
    id: 'kapre',
    name: 'Kapre / Agta',
    title: 'The Smoke-Shrouded Tree Titan',
    category: 'Woodland Guardian',
    origin: 'Tagalog & Central Luzon (Kapre) / Eastern Visayan (Agta) Domains',
    attitude: 'Territorial Nature Guardian (Placated by Courtesy)',
    attitudeTone: 'neutral',
    attributes: [
      'Tree Titan & Giant: Nine-Foot Dark-Skinned Hairy Canopy Dweller',
      'Eastern Visayan Agta Carries a Rattan Cane Through the Mangroves',
      'Primary Biomes: KapreAcacia, BaleteGrove, MangroveSwamp',
      'Checks: CHA (DC 13 Negotiate/Barter) & DEX (DC 15 Root Stealth)'
    ],
    wards:
      'Respectful greetings ("Tabi-tabi po") and offerings of unsmoked tobacco leaves.',
    shortSummary:
      'A hairy tree titan perched in ancient Balete or Acacia trees (or Eastern Visayan mangroves, as the Agta) whose huge cigar fills the canopy with Spirit Fog.',
    description:
      'In Tagalog and Central Luzon lore the Kapre is a hairy, dark-skinned giant perched in ancient Balete, Banyan, Acacia, and Kapok canopies, smoking a massive cigar whose glowing embers pierce the night and generate thick Hamog (Spirit Fog). In Eastern Visayas the same titan is the Agta: a tall, black tree-dweller who walks the mangroves leaning on a rattan cane, cigar ever lit. Though territorial toward disrespectful trespassers, it can be appeased with a respectful "Tabi-tabi po" and an offering of unsmoked tobacco, granting protective forest boons.',
    keywords: ['Kapre', 'kapre', 'Agta', 'agta']
  },

  engkanto: {
    id: 'engkanto',
    name: 'Balete Spirits & Engkanto',
    title: 'Woodland Realm Wardens',
    category: 'Woodland Guardian',
    origin: 'Visayan (Dalakitnon / Aghoy) & Tagalog Lore',
    attitude: 'Strict Ecological Wardens (Dili Ingun Natu)',
    attitudeTone: 'neutral',
    attributes: [
      'Inhabit Glittering Arboreal Castles Inside Balete Trees',
      'Enforce Strict Ecological Etiquette (Tabi-tabi po)',
      'Inflict Sudden Fever Curses Upon Taboo Violators',
      'Checks: WIS (DC 14 Supplication) & INT (DC 15 Spirit Pacts)'
    ],
    wards:
      'Murmuring "Tabi-tabi po", carrying Blessed Balete bark amulets, and performing the Babaylan Santigwar healing ritual.',
    shortSummary:
      'Ethereal woodland wardens (Engkanto, Dalakitnon, Aghoy) dwelling within massive strangler fig trees who punish ecological taboo violations.',
    description:
      'Known variously as Engkanto, Dalakitnon, or Aghoy ("those not like us"), these ethereal nature spirits inhabit massive Balete strangler figs, sacred springs, and mountain shrines. To mortal eyes their hollow tree-caverns appear as glittering palaces. Cutting sacred branches or trespassing without uttering "Tabi-tabi po" brings a feverish curse that only a Babaylan Santigwar ritual or consecrated amulet can lift.',
    keywords: ['Engkanto', 'engkanto', 'Dalakitnon', 'dalakitnon', 'Aghoy', 'aghoy']
  },

  tambaluslos: {
    id: 'tambaluslos',
    name: 'Tambaluslos',
    title: 'The Mangrove Laugher',
    category: 'Woodland / Mangrove Demon',
    origin: 'Bicolano & Visayan Folklore',
    attitude: 'Predatory Spatial Trickster',
    attitudeTone: 'hostile',
    attributes: [
      'Lanky Mangrove Demon (Named from the root "luslos")',
      'Wide Skinless Grin & Prominent Oversized Phallus',
      'Traps Travelers in Mangrove Spatial Loops',
      'Checks: DEX (DC 13 Root Sprint) & WIS (DC 15 Panic Resistance)'
    ],
    wards:
      'Garment Inversion Exploitation: Wearing clothes inside-out (ItemConditionFlags.Inverted) makes the Tambaluslos laugh so hard its floppy lips flip upward over its eyes, blinding it.',
    shortSummary:
      'A lanky Bicolano and Visayan mangrove demon (Tambaluslos / Tambalosos / Tambaluslus) with a wide skinless grin that blinds itself laughing when it sees an inside-out garment.',
    description:
      'Native to Bicolano and Visayan mangrove swamps and coastal thickets, the Tambaluslos (also recorded as Tambalosos or Tambaluslus) is a tall, skinny dark demon named from the root luslos. Authentic archipelagic lore identifies its trademarks as a wide skinless grin, long crooked limbs, and an oversized phallus or scrotum. It warps coastal pathways into endless spatial loops to exhaust travelers. However, if a traveler inverts their clothing (wearing garments inside-out), the Tambaluslos bursts into such hysterical laughter that its floppy upper lip flips upward to completely cover its eyes, blinding the demon and breaking the spatial illusion.',
    keywords: [
      'Tambaluslos',
      'tambaluslos',
      'Tambalosos',
      'tambalosos',
      'Tambaluslus',
      'tambaluslus'
    ]
  },

  batibat: {
    id: 'batibat',
    name: 'Batibat',
    title: 'The Night-Pressing Tree Hag',
    category: 'Nocturnal Tree Spirit',
    origin: 'Ilocano & Northern Luzon Folklore',
    attitude: 'Vengeful Haunter of Felled Timber',
    attitudeTone: 'hostile',
    attributes: [
      'Immense Vengeful Spirit of a Felled Ancient Tree',
      'Haunts House Posts & Bamboo Bedframes Cut from Her Trunk',
      'Sits on Sleeping Victims to Induce Bangungot Suffocation',
      'Checks: CON (DC 16 Maintain Breathing) & INT (DC 14 Wood Origin)'
    ],
    wards:
      'Toe-Wiggling & Thumb-Biting Counter: Targeted micro-movements break her sleep paralysis spell, or relocating the bed away from the haunted house post.',
    shortSummary:
      'An obese, vengeful Ilocano tree hag that haunts house posts cut from her tree and suffocates sleepers in nocturnal paralysis (bangungot).',
    description:
      'In Ilocano folklore, the Batibat is a vengeful female spirit who once inhabited an ancient forest tree. When woodcutters fell her tree and shape its timber into house posts or bedframes, she follows the wood indoors. At night she assumes her crushing, obese form and sits directly upon the chest of anyone sleeping near her post, inducing suffocating sleep paralysis (bangungot). Focusing all willpower on wiggling one big toe or biting the thumb shatters her paralysis immediately.',
    keywords: ['Batibat', 'batibat', 'Bangungot', 'bangungot']
  },

  aswang: {
    id: 'aswang',
    name: 'Aswang / Ungo',
    title: 'The Shape-Shifting Flesh Stalker',
    category: 'Weredog & Flesh Stalker',
    origin: 'Pan-Archipelagic (Bicolano, Visayan & Tagalog Domains)',
    attitude: 'Predatory, Cunning & Blood-Drawn',
    attitudeTone: 'hostile',
    attributes: [
      'Core Predatory Complex: Vampire, Viscera-Sucker, Weredog, Ghoul & Witch',
      'Quiet Villager by Day; Ferocious Black Dog (Aso) or Fiend by Night',
      'Primary Biomes: VillageOutskirts, Swamp, Roadside Ditches',
      'Checks: DEX (DC 14 Evade Ambush) & CON (DC 15 Resist Infection)'
    ],
    wards:
      'Coarse salt, garlic, Buntot Pagi stingray tail, sharpened Bagacay bamboo spears, and bandaging wounds to remove the Bloodied scent that raises ambush rates.',
    shortSummary:
      'The central shapeshifting flesh-stalker of archipelagic lore, drawn to blood scent and repelled by salt, stingray tail, and Bagacay bamboo.',
    description:
      'The Aswang is less a single creature than a predatory complex spanning the whole archipelago: vampire, viscera-sucker, weredog, ghoul, and witch. Known as Ungo in the Visayas, it lives as an ordinary villager by day and becomes a ferocious black dog or fiend by night. Bicolano lore names the walking stalker the Asuwang na Lakaw, while Hiligaynon villages dread the Bag-ong Yanggaw, a newly infected Aswang made reckless by hunger near the rivers. Weapons or garments soaked in blood sharply raise ambush rates, while Bagacay bamboo, salt, garlic, and cured stingray tails sear its flesh.',
    keywords: [
      'Aswang',
      'aswang',
      'Ungo',
      'ungo',
      'Asuwang na Lakaw',
      'Asuwang',
      'Bag-ong Yanggaw',
      'Weredog',
      'weredog'
    ]
  },

  manananggal: {
    id: 'manananggal',
    name: 'Manananggal / Anananggal / Abat',
    title: 'The Viscera-Trailing Nightmare',
    category: 'Viscera Sucker & Vampire',
    origin: 'Bicolano (Anananggal), Waray (Abat) & Tagalog Domains',
    attitude: 'Vampiric Aerial Hunter',
    attitudeTone: 'hostile',
    attributes: [
      'Detaches Upper Torso at Moonrise on Leathery Bat-Like Wings',
      'Waray Abat: Bulging Red Eyes & Disheveled Hair',
      'Thread-Like Tongue Targets Pregnant Women & Unborn Infants',
      'Checks: INT (DC 15 Track Lower Torso) & STR (DC 14 Spear Thrust)'
    ],
    wards:
      'Scattering coarse salt, crushed garlic, or volcanic ash onto its hidden lower torso so it cannot rejoin before sunrise. Avoids saringsing bamboo and marurugi thorns.',
    shortSummary:
      'A flying viscera-sucker that leaves its lower body behind at night and hunts from rooftops with a long, thread-like tongue.',
    description:
      'Called Anananggal in Bicol and Abat among the Waray, this dreaded viscera-sucker severs its upper torso at moonrise, sprouting huge leathery wings while its lower waist stays hidden among Balete roots or banana groves. The Abat is known by its bulging red eyes and wild, disheveled hair. Trailing viscera through the monsoon sky, it perches on nipa thatch and lowers a thread-like tongue toward pregnant women and sleepers. Salt, garlic, or ash packed onto the abandoned lower body prevents it from rejoining before dawn. It must not be confused with the Asuwang na Layog, which flies with its whole body intact.',
    keywords: [
      'Manananggal',
      'manananggal',
      'Anananggal',
      'anananggal',
      'Abat',
      'abat'
    ]
  },

  aswang_na_layog: {
    id: 'aswang_na_layog',
    name: 'Aswang na Layog',
    title: 'The Whole-Bodied Night Flyer',
    category: 'Viscera Sucker & Vampire',
    origin: 'Bicolano Domain',
    attitude: 'Swift Aerial Predator',
    attitudeTone: 'hostile',
    attributes: [
      'Flies Through the Night with Its Full Body Intact',
      'Unlike the Anananggal, Leaves No Lower Torso Behind',
      'Primary Biomes: MonsoonSky, Village Rooftops',
      'Checks: DEX (DC 14 Evade Swoop)'
    ],
    wards:
      'Sharpened Bagacay bamboo spears thrust upward at the moment of its swoop.',
    shortSummary:
      'A Bicolano flying Aswang that soars with its entire body intact, so it has no hidden torso to salt.',
    description:
      'Bicolano lore separates the Aswang na Layog ("flying aswang") from the detaching Anananggal. The Layog takes to the night sky whole, so there is no abandoned lower torso to hunt down and salt. Travelers must instead meet its diving swoop head-on, bracing a sharpened Bagacay bamboo spear against the rooftops it descends from.',
    keywords: ['Aswang na Layog', 'Asuwang na Layog', 'Layog']
  },

  sigbin: {
    id: 'sigbin',
    name: 'Sigbin',
    title: 'The Shadow-Mire Hound',
    category: 'Nocturnal Cryptid',
    origin: 'Visayan & Mindanaoan Folklore',
    attitude: 'Shadow-Feeding Swamp Stalker',
    attitudeTone: 'hostile',
    attributes: [
      'Hornless Goat-Like Hound with Oversized Ears & Whip Tail',
      'Walks Backward with Head Tucked Between Hind Legs',
      'Drains Human Blood Directly Through Victim Shadows',
      'Checks: DEX (DC 14 Vault Roots) & CON (DC 13 Endure Stench)'
    ],
    wards:
      'Keeping to high ground, holding bright resin torches to erase cast shadows, and avoiding deep mud while Soaked.',
    shortSummary:
      'A hornless, backward-walking swamp hound with a whip-like tail that drinks blood by biting a traveler shadow.',
    description:
      'Gliding through mangrove swamps, bakawan thickets, and flooded flats, the Sigbin is a hornless, goat-like hound with oversized ears and a long whip-like tail. It walks backward with its head tucked low between its hind legs, exuding a suffocating swamp stench. Rather than needing to tear flesh directly, a Sigbin can drain a victim vitality by sinking its fangs into their shadow across the mud.',
    keywords: ['Sigbin', 'sigbin']
  },

  tiyanak: {
    id: 'tiyanak',
    name: 'Tiyanak / Patiyanak',
    title: 'The Infant Mimic',
    category: 'Nocturnal Ambush Demon',
    origin: 'Archipelago-Wide Folklore',
    attitude: 'Deceptive & Vicious Ambush Predator',
    attitudeTone: 'hostile',
    attributes: [
      'Mimics the Helpless Crying of an Abandoned Infant in Brush',
      'Transforms into a Clawed Demon with the Face of an Old Man',
      'Lock-Jaw Fangs & Sudden Brush Ambush',
      'Checks: WIS (DC 15 Detect Mimic Cry) & DEX (DC 14 Break Bite)'
    ],
    wards:
      'Garment Inversion Ward: Wearing clothes inside-out confuses the Tiyanak, shattering its mimicry spell and forcing it to vanish.',
    shortSummary:
      'A vampiric brush demon that mimics a crying infant until picked up, transforming into a clawed fiend with a wizened face.',
    description:
      'Lurking in bamboo thickets, overgrown forest paths, and abandoned camps, the Tiyanak (or Patiyanak) projects the pitiful crying of a newborn infant left in the rain. When a compassionate traveler parts the brush to cradle it, the creature transforms into a sharp-toothed demon with the wrinkled face of an old man and locks its jaws onto the victim. Wearing an inside-out garment (Baliktad) disrupts its glamour and drives it back into the undergrowth.',
    keywords: ['Tiyanak', 'tiyanak', 'Patiyanak', 'patiyanak']
  },

  amalanhig: {
    id: 'amalanhig',
    name: 'Amalanhig',
    title: 'The Stiff-Limbed Revenant',
    category: 'Undead Revenant',
    origin: 'Visayan Folklore',
    attitude: 'Relentless Straight-Line Pursuer',
    attitudeTone: 'hostile',
    attributes: [
      'Risen Aswang Who Died Without Transferring Its Curse',
      'Rigid, Unbending Knees & Corpse-Cold Grip',
      'Pursues Living Humans to Bite the Neck & Pass the Curse',
      'Checks: DEX (DC 12 Outmaneuver Charge) & INT (DC 13 Recall Weakness)'
    ],
    wards:
      'Rigid Joint Limitation: Because its knees cannot bend, zig-zagging around crooked trees, climbing high branches, or wading across deep water stops its pursuit.',
    shortSummary:
      'A stiff-jointed Visayan revenant risen from the grave that charges in straight lines but cannot bend its knees, climb crooked trees, or cross rivers.',
    description:
      'When an Aswang dies without passing the dark chick in its throat to a living relative, its corpse rises from the earth as an Amalanhig. Driven by a frantic compulsion to bite a human neck and transfer its curse, the revenant lurches forward with terrifying strength. However, rigor mortis locks its joints completely stiff: a clever traveler can escape by weaving around crooked trunks, climbing a slanted tree, or crossing open water.',
    keywords: ['Amalanhig', 'amalanhig']
  },

  wakwak: {
    id: 'wakwak',
    name: 'Wakwak / Kikik',
    title: 'The Vampiric Bird Emissary',
    category: 'Nocturnal Creature / Scout',
    origin: 'Visayan, Bicolano & Mindanaoan Folklore',
    attitude: 'Acoustically Deceptive Night Scout',
    attitudeTone: 'hostile',
    attributes: [
      'Giant Winged Nocturnal Bird-Fiend & Aswang Familiar',
      'Acoustically Inverted Call (Loud = Far, Faint Whisper = Overhead)',
      'Razor Beak & Hooked Roof-Tearing Talons',
      'Checks: WIS (DC 14 Acoustic Distance) & DEX (DC 13 Seal Roof)'
    ],
    wards:
      'Salt Announcement: Shouting "Adi an asin!" ("Here is the salt!"), displaying coarse sea salt, or cracking a Buntot Pagi whip.',
    shortSummary:
      'A nocturnal vampiric bird and Aswang scout whose "wak-wak" or "kikik" cry sounds faintest when perched directly overhead.',
    description:
      'Serving as an aerial scout for Aswangs or hunting alone across village rooftops, the Wakwak (or Kikik) slices through night fog on giant leathery wings. Its call is acoustically inverted to deceive prey: a booming cry means the creature is leagues away, whereas a faint, raspy whisper means its talons are poised directly above your head. Shouting "Adi an asin!" while holding coarse salt drives the scout from the eaves.',
    keywords: ['Wakwak', 'wakwak', 'Kikik', 'kikik']
  },

  sirena: {
    id: 'sirena',
    name: 'Sirena / Magindara',
    title: 'The Coral Shelf Siren',
    category: 'Aquatic Warden',
    origin: 'Bicolano (Magindara) & Visayan Lore',
    attitude: 'Enchanting & Perilous Marine Guardians',
    attitudeTone: 'neutral',
    attributes: [
      'Hypnotic Merfolk of Coral Reefs & Deep Tidal Channels',
      'Enchanting Song Guides Fishermen or Lures Sailors into Undertows',
      'Summons Rogue Waves that Soak Gear on Failed Checks',
      'Checks: CHA (DC 15 Counter-Sing) & WIS (DC 14 Resist Charm)'
    ],
    wards:
      'Blessed Talisman Protection (wearing a consecrated Agimat or clay amulet) or matching their musical cadence in respectful counter-song.',
    shortSummary:
      'Bicolano (Magindara) and Visayan coral-shelf sirens whose hypnotic songs can bless coastal travelers or drag them into crashing undertows.',
    description:
      'Inhabiting coral reefs, sea caverns, and deep river mouths, the Magindara of Bicolano myth and the Sirena of Visayan lore are fiercely protective guardians of marine life. Their polyphonic songs echo across the surf at dusk, capable of luring unwary travelers into razor-sharp coral undertows. Those who wear a Blessed talisman or answer their melody with a reverent counter-song earn safe passage and pearls from the reef. Cebuano boatmen also fear the Kataw, a shiny-scaled siren who lures craft onto the rocks to sink them.',
    keywords: ['Sirena', 'sirena', 'Magindara', 'magindara', 'Kataw', 'kataw']
  },

  angongolood: {
    id: 'angongolood',
    name: 'Angongolood',
    title: 'The Swamp-Squeeze Beast',
    category: 'Aquatic / Swamp Monster',
    origin: 'Bicolano Epic & Riverbank Lore',
    attitude: 'Territorial Riverbank Ambush Brute',
    attitudeTone: 'hostile',
    attributes: [
      'Massive Gorilla-Like Swamp Monster with Dark Matted Fur',
      'Pounces on Passing Canoes & Wading Travelers',
      'Crushing Embrace Petrifies Victims into Rigid Trees',
      'Checks: STR (DC 15 Break Crush) & DEX (DC 13 Evade Pounce)'
    ],
    wards:
      'Boat Hull Acoustic Counter: Striking the wooden hull of a canoe or salt-sled repeatedly produces hollow thuds that terrify the Angongolood.',
    shortSummary:
      'A massive gorilla-like Bicolano riverbank monster whose crushing embrace turns victims into rigid trees unless driven off by thumping wooden boat hulls.',
    description:
      'Recorded in Bicolano folklore along shadowed riverbanks and mangrove channels, the Angongolood is a hulking, ape-like swamp beast coated in river mud and hanging moss. It lies in wait beside narrow fords to pounce on passing dugouts, wrapping its muscular arms around victims until they petrify into gnarled riverbank trees. Pounding rhythmically against a hollow wooden boat hull or sled plank mimics thunder under the water, terrifying the beast into retreating.',
    keywords: ['Angongolood', 'angongolood']
  },

  berbalang: {
    id: 'berbalang',
    name: 'Berbalang',
    title: 'The Astral Marsh Ghoul',
    category: 'Astral Ghoul / Fiend',
    origin: 'Southern Philippine & Sulu / Marshland Lore',
    attitude: 'Astral Flesh-Hunter',
    attitudeTone: 'hostile',
    attributes: [
      'Enters Deep Trance in Hidden Stagnant Reed Beds',
      'Projects Winged Astral Form to Hunt While Body Lies Vulnerable',
      'Cat-Like Vertical Pupils & Piercing Spirit Screech',
      'Checks: INT (DC 16 Trace Physical Shell) & WIS (DC 14 Resist Screech)'
    ],
    wards:
      'Physical Shell Vulnerability: Tracing the astral cord back to the reeds and coating its entranced body with coarse salt or lime.',
    shortSummary:
      'A marshland ghoul that leaves its physical body entranced in reed beds while projecting a winged astral form to hunt.',
    description:
      'Dwelling in stagnant marshlands and sunken ruins, the Berbalang hunts not with its physical body, but by entering a death-like trance among tall reeds and projecting a winged, shadowy astral form into the night. While its spirit form screeches overhead with glowing cat-like eyes, its physical shell lies helpless in the sedge. A perceptive traveler who traces the astral tether back to the reeds and rubs coarse salt or lime over the entranced body forces the Berbalang to surrender its hoarded grave relics.',
    keywords: ['Berbalang', 'berbalang']
  },

  rabot: {
    id: 'rabot',
    name: 'Rabot',
    title: 'The Petrifying Terror',
    category: 'Epic Monster (Ibalong)',
    origin: 'Bicolano Ibalong Epic',
    attitude: 'Ferocious & Petrifying',
    attitudeTone: 'hostile',
    attributes: [
      'Savage Half-Man, Half-Lizard Beast of Cavern Lairs',
      'Bushy Black Eyebrows, Droop Ears & Thunderous Voice',
      'Line-of-Sight Gaze Turns Living Flesh into Solid Stone',
      'Checks: CON (DC 17 Resist Petrification) & DEX (DC 15 Blindside Flank)'
    ],
    wards:
      'Polished Bronze Reflection (reflecting its gaze with a bronze shield or mirror) or striking from its blind flank while its eyes are averted.',
    shortSummary:
      'A terrifying half-man, half-lizard monster from the Bicolano Ibalong epic whose thunderous roar shakes caverns and whose gaze turns creatures to stone.',
    description:
      'Immortalized in the Bicolano epic of Ibalong, Rabot is a monstrous half-human, half-lizard terror dwelling in rocky highland caverns and sunken stone ruins. With bristling black eyebrows, pendulous ears, and a voice that shakes cliff walls like thunder, Rabot turns any living creature that meets its direct gaze into solid stone. Only by reflecting its gaze off polished bronze or flanking it from behind stone pillars can a warrior strike it down.',
    keywords: ['Rabot', 'rabot']
  },

  oryol: {
    id: 'oryol',
    name: 'Oryol',
    title: 'The Serpent Enchantress',
    category: 'Demi-Goddess / Epic Being',
    origin: 'Bicolano Ibalong Epic',
    attitude: 'Cunning, Seductive & Proud',
    attitudeTone: 'neutral',
    attributes: [
      'Daughter of Asuang; Half-Maiden & Half-Glistening Serpent',
      'Seductive Voice Hypnotizes Men and Wild Beasts Alike',
      'Master Shapeshifter of Mist Forests & Serpent Grottos',
      'Checks: WIS (DC 16 Pierce Disguise) & CHA (DC 15 Forge Alliance)'
    ],
    wards:
      'Diplomatic Reciprocity: Matching her wits with high Charisma or offering rare gems, silver ornaments, or gold piloncitos to win her guidance.',
    shortSummary:
      'A cunning half-maiden, half-serpent demi-goddess from the Bicolano Ibalong epic whose hypnotic voice enchants the highland mists.',
    description:
      'In the Bicolano epic of Ibalong, Oryol is the cunning daughter of the dark god Asuang: a radiant maiden from the waist up and a glistening, iridescent serpent below. Able to shift her form and weave hypnotic melodies that bend both warriors and forest beasts to her will, she cannot be bested by brute force alone. Those who see through her illusion and appeal to her regal pride with silver ornaments or eloquent respect can turn her from a deadly adversary into an invaluable guide.',
    keywords: ['Oryol', 'oryol']
  },

  santelmo: {
    id: 'santelmo',
    name: 'Santelmo / Bonggo',
    title: 'The Flame-Spewing Wanderer',
    category: 'Demon & Nightmare Hag (Fire)',
    origin: 'Pan-Archipelagic (Santelmo), Ilokano (Allawig) & Bicolano (Bonggo) Domains',
    attitude: 'Relentless Soul-Searching Flame',
    attitudeTone: 'hostile',
    attributes: [
      'Floating Ball of Supernatural Fire Born from Tragic Deaths',
      'Bicolano Bonggo: Fire-Spewing Monster Hunting for Its Lost Wife',
      'Primary Biomes: RainyCrossroads, Plains, Open Fields',
      'Checks: DEX (DC 14 Dodge Burst Flames) & CON (DC 13 Heat Resistance)'
    ],
    wards:
      'Soaked gear and open water: the flame cannot cross running streams, and a Bonggo dies outright if doused in water.',
    shortSummary:
      'A floating ball of soul-fire (Santelmo / Allawig) or the fire-spewing Bicolano Bonggo searching for its lost wife; all are undone by water.',
    description:
      'Born where blood was spilled on rain-soaked ground, the Santelmo (or Santilmo) drifts above muddy crossroads and marshes as a blazing orb of supernatural fire; Ilokanos call the same wandering flame Allawig or Silew-Silew, a fireball that rolls across open fields without igniting the grass. The Bicolano Bonggo is crueler: a fire-spewing monster forever hunting for the wife it lost, scorching any traveler it mistakes for her captor. Every form of the flame fears water. It cannot cross running streams, Soaked gear smothers its touch, and a Bonggo doused in water dies outright.',
    keywords: [
      'Santelmo',
      'santelmo',
      'Santilmo',
      'santilmo',
      'Bonggo',
      'bonggo',
      'Allawig',
      'Silew-Silew'
    ]
  },

  // ===================================================================
  // BESTIARY v3: Tagalog & Central Luzon Domain
  // ===================================================================
  bungisngis: {
    id: 'bungisngis',
    name: 'Bungisngis',
    title: 'The One-Eyed Laughing Giant',
    category: 'Tree Titan & Giant',
    origin: 'Tagalog & Central Luzon Domain',
    attitude: 'Boisterous, Brutal & Easily Fooled',
    attitudeTone: 'hostile',
    attributes: [
      'Cyclopean Giant Whose Huge Upper Lip Flops Over Its Face When It Laughs',
      'Immense Strength: Lifts Carabao Overhead',
      'Primary Biomes: ForestPath, Highland Clearings',
      'Checks: STR (DC 16 Wrestling) & DEX (DC 14 Evasion)'
    ],
    wards:
      'Trickery: luring it into a giggling fit until its upper lip covers its eye, then tripping it over exposed roots.',
    shortSummary:
      'A one-eyed Tagalog giant whose cackling laughter flips its enormous upper lip over its face, leaving it blind and easy to trip.',
    description:
      'The Bungisngis is a one-eyed giant of the Tagalog forests, forever grinning and cackling. Its strength is immense, enough to wrestle a carabao to the ground, but its own humor is its undoing: when it laughs hard, its huge upper lip flops over its face and covers its single eye. Clever travelers goad it into laughter and lead it stumbling over roots and ravine edges rather than meeting its strength head-on.',
    keywords: ['Bungisngis', 'bungisngis']
  },

  kumakatok: {
    id: 'kumakatok',
    name: 'Kumakatok',
    title: 'The Hooded Knockers of Death',
    category: 'Death Omen Spirit',
    origin: 'Tagalog & Central Luzon Domain',
    attitude: 'Solemn Heralds of Impending Death',
    attitudeTone: 'hostile',
    attributes: [
      'Trio of Cloaked, Hooded Figures Who Walk by Night',
      'Knock on Doors to Announce a Death Within the Household',
      'Primary Biomes: Village, Shuttered Huts',
      'Checks: WIS (DC 14 Sense the Omen)'
    ],
    wards:
      'A white chalk cross painted on the door, and never opening to an unseen knock after dark.',
    shortSummary:
      'Three hooded spirits whose knocking at a door after dark heralds a death within that house.',
    description:
      'The Kumakatok walk the village lanes in threes, cloaked and hooded so no face can be seen. When they stop before a house and knock, someone inside will die before long. Elders paint a white chalk cross across the door to turn them away, and teach children never to answer a knock that comes after dark without a voice behind it.',
    keywords: ['Kumakatok', 'kumakatok']
  },

  // ===================================================================
  // BESTIARY v3: Cordillera Mountain & Northern Luzon Domain
  // ===================================================================
  pugot: {
    id: 'pugot',
    name: 'Pugot',
    title: 'The Headless Fire-Spitter',
    category: 'Demon & Nightmare Hag (Fire)',
    origin: 'Ilokano & Pampangan Domains',
    attitude: 'Mocking, Shape-Shifting Terror',
    attitudeTone: 'hostile',
    attributes: [
      'Headless Black Giant that Spits Fire from Its Neck Stump',
      'Shifts Size from Infant to Acacia-Tree Height',
      'Primary Biomes: Abandoned Huts, Old Trees',
      'Checks: DEX (DC 14 Dodge Fire) & WIS (DC 13 Resist Illusion)'
    ],
    wards: 'Coarse salt and iron blades.',
    shortSummary:
      'A headless Ilokano giant that lurks in trees and abandoned huts, spitting fire and shifting from babe-sized to acacia-tall.',
    description:
      'The Pugot is a headless, coal-black giant that haunts tall trees and abandoned huts in the north. Fire gouts from the stump where its head should be, and it delights in frightening travelers by swelling from the size of a babe to the height of an acacia in a heartbeat. It is repelled by coarse salt and by iron, and wise wayfarers carry both when passing an empty house at night.',
    keywords: ['Pugot', 'pugot']
  },

  alan: {
    id: 'alan',
    name: 'Alan',
    title: 'The Upside-Down Ghouls',
    category: 'Ghoul & Corpse Thief',
    origin: 'Kalinga & Tingguian Domains',
    attitude: 'Cannibalistic Forest Ghouls',
    attitudeTone: 'hostile',
    attributes: [
      'Bat-Winged (Sometimes Ten-Headed) Ghouls',
      'Reversed Toes & Fingers; Hang Upside-Down from Branches',
      'Primary Biomes: CordilleraForest, Trees',
      'Checks: DEX (DC 15 Stealth) & INT (DC 14 Ghoul Lore)'
    ],
    wards: 'Burning embers and iron weapons.',
    shortSummary:
      'Bat-winged Cordillera ghouls with reversed toes and fingers who hang upside-down in the canopy waiting for prey.',
    description:
      'In Kalinga and Tingguian tales, the Alan are winged ghouls with fingers and toes that point backward, letting them hang upside-down from high branches like great fruit bats. Some are told to bear as many as ten heads. They feed on the dead and the unwary, but they fear burning embers and iron, and a traveler who walks beneath their trees with a torch held high and a blade drawn is seldom taken.',
    keywords: ['Alan']
  },

  akop: {
    id: 'akop',
    name: 'Akop',
    title: 'The Embracer of Widows',
    category: 'Demon & Nightmare Hag',
    origin: 'Tingguian Domain',
    attitude: 'Grief-Hungry Bodiless Spirit',
    attitudeTone: 'hostile',
    attributes: [
      'Bodiless Spirit with Long, Slimy Arms',
      'Embraces Grieving Widows and Widowers to Draw Them into Death',
      'Primary Biomes: Mourning Houses, Village',
      'Checks: DEX (DC 15 Evasion) & WIS (DC 14 Protection)'
    ],
    wards: 'Sleeping beneath fish nets and wearing seed necklaces during mourning.',
    shortSummary:
      'A bodiless Tingguian spirit with long slimy arms that embraces grieving widows until they follow their dead.',
    description:
      'The Akop has no body at all, only long, cold, slime-slick arms that reach out of the dark of a mourning house. It seeks the newly widowed, wrapping them in an embrace that pulls them after their dead spouse. Tingguian mourners sleep beneath fish nets and wear strings of seeds until the mourning period ends, for the Akop cannot reach through a net nor abide the rattle of seeds.',
    keywords: ['Akop', 'akop']
  },

  bannog: {
    id: 'bannog',
    name: 'Bannog',
    title: 'The Boar-Carrying Raptor',
    category: 'Giant Beast',
    origin: 'Ilokano & Tingguian Domains',
    attitude: 'Apex Aerial Predator',
    attitudeTone: 'hostile',
    attributes: [
      'Colossal Raptor Bird of the Northern Peaks',
      'Talons Large Enough to Carry Off Hunters & Wild Boars',
      'Primary Biomes: HighPeaks, Open Ridges',
      'Checks: DEX (DC 16 Dodge Dive) & STR (DC 15 Talon Struggle)'
    ],
    wards: 'Spear thrusts braced upward against its dive.',
    shortSummary:
      'A colossal northern raptor whose talons can carry off a hunter or a full-grown wild boar.',
    description:
      'The Bannog circles the northern peaks on wings that throw shadows across whole valleys. It dives on hunters and wild boars alike, seizing them in talons the size of plow-blades and bearing them away to its aerie. A hunter who hears the rush of its dive must throw themselves flat or brace a spear upward, for the only thing that turns a Bannog is a point driven into its breast.',
    keywords: ['Bannog', 'bannog']
  },

  // ===================================================================
  // BESTIARY v3: Mindanawon & Sulu Archipelago Domain
  // ===================================================================
  buso: {
    id: 'buso',
    name: 'Buso / Tigbanua',
    title: 'The One-Eyed Corpse Gnawers',
    category: 'Ghoul & Corpse Thief',
    origin: 'Bagobo Domain (Mount Apo)',
    attitude: 'Ravenous Graveyard Fiends',
    attitudeTone: 'hostile',
    attributes: [
      'Hirsute, One-Eyed Fiends with Curly Hair & Long Teeth',
      'Gnaw Corpses in the Deep Forests of Mount Apo',
      'Primary Biomes: Burial Grounds, Deep Forest',
      'Checks: CON (DC 15 Fright Resistance) & STR (DC 16 Combat)'
    ],
    wards: 'Brass gongs and spoken magic formulae.',
    shortSummary:
      'Hairy, one-eyed Bagobo fiends of the Mount Apo forests that feed on corpses and flee the sound of brass gongs.',
    description:
      'Among the Bagobo, the Buso (also called Tigbanua) are hairy fiends with a single eye, curly hair, and long, yellowed teeth. They gather wherever someone has died, waiting to gnaw the corpse, and they haunt the deep forests on the slopes of Mount Apo. The ringing of brass gongs and the recitation of protective formulae drive them away from the dead.',
    keywords: ['Buso', 'buso', 'Tigbanua', 'tigbanua']
  },

  minokawa: {
    id: 'minokawa',
    name: 'Minokawa',
    title: 'The Steel-Feathered Eclipse Bird',
    category: 'Celestial Leviathan',
    origin: 'Bagobo Domain (Mindanao)',
    attitude: 'Cataclysmic Sky-Devourer',
    attitudeTone: 'hostile',
    attributes: [
      'Colossal Bird with Steel Feathers, Steel Claws & Mirror Eyes',
      'Swallows the Sun and Moon, Causing Eclipses',
      'Primary Biomes: HighPeaks, EclipseSky',
      'Checks: STR (DC 17 Gong Impact) & INT (DC 15 Celestial Tracking)'
    ],
    wards: 'Acoustic noise: beating brass gongs and shouting until it spits out the moon.',
    shortSummary:
      'The Bagobo eclipse bird, a steel-feathered giant that swallows the sun and moon until driven off by gong-beating.',
    description:
      'The Minokawa is the Bagobo counterpart of the Bakunawa: a bird so vast it could swallow the moon whole, with feathers of steel, claws of steel, and eyes like mirrors. When it leaves its perch beyond the eastern sky to devour the sun or moon, villagers rush out to beat gongs and cry aloud until the startled bird spits the light back into the heavens.',
    keywords: ['Minokawa', 'minokawa']
  },

  kurita: {
    id: 'kurita',
    name: 'Kurita',
    title: 'The Multi-Limbed Terror of Kabalalan',
    category: 'Giant Beast',
    origin: 'Maguindanao Domain',
    attitude: 'Ravenous Land & Sea Devourer',
    attitudeTone: 'hostile',
    attributes: [
      'Many-Limbed Amphibious Monster of Mount Kabalalan',
      'Extirpated Nearly All Animal Life Around Its Lair',
      'Primary Biomes: MountKabalalan, Reefs',
      'Checks: STR (DC 16 Break Grip) & DEX (DC 14 Evasion)'
    ],
    wards: 'Tempered blades and fire.',
    shortSummary:
      'A multi-limbed amphibious monster from Mount Kabalalan that devoured nearly every living creature around it.',
    description:
      'In the Maguindanao epic of Indarapatra and Sulayman, the Kurita lived on Mount Kabalalan, equally at home on land and in the sea. It had many limbs and devoured so many creatures that the land around its lair fell silent. Only tempered blades and fire could break the grip of its limbs.',
    keywords: ['Kurita', 'kurita']
  },

  tarabusaw: {
    id: 'tarabusaw',
    name: 'Tarabusaw',
    title: 'The Man-Eating Ape of Matutum',
    category: 'Giant Beast',
    origin: 'Maguindanao Domain',
    attitude: 'Savage Man-Eater',
    attitudeTone: 'hostile',
    attributes: [
      'Hulking Humanoid Ape Monster of Mount Matutum',
      'Devours Travelers Who Cross Its Mountain',
      'Primary Biomes: Mountain Slopes, Highland Forest',
      'Checks: STR (DC 16 Grapple) & CON (DC 14 Endurance)'
    ],
    wards: 'Heavy melee combat; it fears no trick, only a stronger arm.',
    shortSummary:
      'A man-eating ape monster from Mount Matutum, slain in the Maguindanao epic only through brute combat.',
    description:
      'The Tarabusaw prowled the slopes of Mount Matutum in the Maguindanao epic, a towering creature shaped like a man but with the strength and appetite of a beast. It devoured anyone who climbed its mountain. No ward or charm deterred it; the hero Indarapatra had to meet it in a long, bruising struggle of grapples and blows.',
    keywords: ['Tarabusaw', 'tarabusaw']
  },

  biraddali: {
    id: 'biraddali',
    name: 'Biraddali',
    title: 'The Rainbow Skymaidens',
    category: 'Elf & Nature Warden',
    origin: 'Tausug / Sulu Domain',
    attitude: 'Graceful Celestial Visitors',
    attitudeTone: 'benevolent',
    attributes: [
      'Winged Skymaidens with Detachable Silver Wings',
      'Their Bathing in Mountain Springs Paints Rainbows Across the Sky',
      'Primary Biomes: Mountain Springs, Rainbow Bridges',
      'Checks: CHA (DC 14 Diplomacy) & DEX (DC 15 Wing Theft)'
    ],
    wards: 'Respectful conduct; stealing their wings brings a lifetime of sorrow.',
    shortSummary:
      'Silver-winged Sulu skymaidens who descend on rainbows to bathe in mountain springs.',
    description:
      'The Biraddali of Tausug lore are skymaidens who descend along rainbows to bathe in hidden mountain springs, setting aside their silver wings on the rocks. Tales warn of men who hid a maiden wing to keep her earthbound; such unions always end in grief when she finds the wings and flies home. Those who keep a respectful distance may be granted a blessing before the rainbow fades.',
    keywords: ['Biraddali', 'biraddali']
  },

  // ===================================================================
  // BESTIARY v3: Additional Archipelagic Entities
  // ===================================================================
  haliya: {
    id: 'haliya',
    name: 'Haliya',
    title: 'The Masked Moon Goddess',
    category: 'Deity / Spirit',
    origin: 'Bicolano Domain',
    attitude: 'Protector of the Moon & Foe of the Bakunawa',
    attitudeTone: 'benevolent',
    attributes: [
      'Masked Goddess of Moonlight Wielding a Golden Blade',
      'Eternal Adversary of the Bakunawa',
      'Honored Through Ritual Moon Dances (Halirang)',
      'Checks: CHA (DC 16 Invocation) & WIS (DC 15 Moon Omens)'
    ],
    wards: 'Ritual moon dances and golden masks worn in her honor.',
    shortSummary:
      'The masked Bicolano moon goddess who battles the Bakunawa with a golden blade to protect the moon.',
    description:
      'Haliya is the Bicolano goddess of moonlight, who hides her face behind a golden mask and wields a golden blade against the Bakunawa whenever the serpent rises to swallow the moon. Bicolano women once performed moon dances in her honor during eclipses, adding their voices to the clamor of gongs. Golden masks crafted in her image are said to carry a fragment of her protection.',
    keywords: ['Haliya', 'haliya']
  },

  siyokoy: {
    id: 'siyokoy',
    name: 'Ukoy / Siyokoy',
    title: 'The Net-Tearing Merfolk',
    category: 'Merfolk & Water Wraith',
    origin: 'Cebuano (Ukoy) & Tagalog (Siyokoy) Domains',
    attitude: 'Hostile to Fishermen',
    attitudeTone: 'hostile',
    attributes: [
      'Green-Scaled, Gill-Breathing Humanoid with Webbed Hands & Feet',
      'Tears Fishing Nets and Capsizes Boats',
      'Primary Biomes: CoastalReef, River Mouths',
      'Checks: STR (DC 15 Hold the Boat) & DEX (DC 14 Evade Grab)'
    ],
    wards: 'Respecting the sea; it rises in fury against dynamite and greedy fishing.',
    shortSummary:
      'Green-scaled, web-footed merfolk that shred fishing nets and drag boats under.',
    description:
      'Unlike the alluring Sirena, the Ukoy or Siyokoy is a scaled, green-skinned humanoid with gills, webbed hands, and webbed feet. It shreds fishing nets, rocks outriggers until they capsize, and drags careless fishermen beneath the waves. It is said to grow most violent against those who fish greedily or poison the reefs.',
    keywords: ['Siyokoy', 'siyokoy', 'Ukoy', 'ukoy']
  },

  amomongo: {
    id: 'amomongo',
    name: 'Amomongo',
    title: 'The Long-Nailed Cave Ape',
    category: 'Giant Beast',
    origin: 'Visayan Domain (Mount Kanlaon)',
    attitude: 'Savage Livestock Killer',
    attitudeTone: 'hostile',
    attributes: [
      'Wild, Hairy Cave-Dwelling Ape with Long Nails',
      'Haunts the Slopes of Mount Kanlaon',
      'Primary Biomes: Caves, Volcanic Slopes',
      'Checks: STR (DC 15 Grapple) & DEX (DC 14 Evade Claws)'
    ],
    wards: 'Torch fire.',
    shortSummary:
      'A hairy, long-nailed ape beast that lairs in caves on the slopes of Mount Kanlaon and fears fire.',
    description:
      'Negrense villagers on the slopes of Mount Kanlaon speak of the Amomongo, a man-sized, hairy ape with long, hooked nails that lairs in caves and comes down at night to disembowel goats and chickens. It is quick and brutally strong, but it shies from the light of a burning torch.',
    keywords: ['Amomongo', 'amomongo']
  },

  tigmamanukan: {
    id: 'tigmamanukan',
    name: 'Tigmamanukan',
    title: 'The Omen Bird of Safe Passage',
    category: 'Omen Spirit',
    origin: 'Tagalog Domain',
    attitude: 'Messenger of Fate',
    attitudeTone: 'benevolent',
    attributes: [
      'Sacred Omen Bird Sent by the Supreme Deity',
      'Flight to the Right Foretells Safe Travel; to the Left, Misfortune',
      'Primary Biomes: Forest Trails, Crossroads',
      'Checks: WIS (DC 13 Read the Flight Path)'
    ],
    wards: 'Observing its flight before setting out, and turning back if it flies left.',
    shortSummary:
      'A sacred Tagalog omen bird whose flight direction tells travelers whether their road is safe.',
    description:
      'The Tigmamanukan was the messenger bird of the Tagalog supreme deity. Before a journey, travelers watched for it: if it crossed the path flying to the right, the road was blessed; if it flew to the left, the wise turned back and waited for another day.',
    keywords: ['Tigmamanukan', 'tigmamanukan']
  },

  nuno_sa_punso: {
    id: 'nuno_sa_punso',
    name: 'Nuno sa Punso',
    title: 'Ancient Elder of the Earthen Mound',
    category: 'Earth Spirit',
    origin: 'Tagalog, Ilokano & Lowland Folklore',
    attitude: 'Territorial & Reciprocal (Vengeful if Disrespected)',
    attitudeTone: 'neutral',
    attributes: [
      'Dwarf & Earth Spirit: Diminutive Bearded Elder (Duwende)',
      'Command over Termite & Clay Mounds (Punso)',
      'Inflicts Bati / Unexplained Skin Swelling on Trespassers',
      'Checks: CON (DC 14 Resist Swelling Hex)'
    ],
    wards:
      'Uttering "Tabi-tabi po" (asking permission to pass), never stepping on mounds, and never putting salt in offerings.',
    shortSummary:
      'A tiny, ancient bearded spirit dwelling inside red clay anthills and termite mounds.',
    description:
      'Literally meaning "Ancestor of the Mound," the Nuno sa Punso is a venerable dwarf-like earth spirit who resides beneath large red-clay anthills, tree roots, and undisturbed rocks. Though small in stature, a Nuno possesses immense spiritual authority over its domain. Travelers who carelessly kick or tread upon a punso without saying "Tabi-tabi po" suffer sudden illness or curses, while those who show courtesy or aid the elder are rewarded with warnings against unseen dangers.',
    keywords: ['Nuno sa Punso', 'Nuno', 'Punso', 'punso', 'Duwende', 'duwende']
  },

  diwata: {
    id: 'diwata',
    name: 'Diwata',
    title: 'Sacred Guardian Deity of Nature',
    category: 'Deity / Spirit',
    origin: 'Pre-Colonial Philippine Cosmology',
    attitude: 'Benevolent to Stewards / Wrathful to Despoilers',
    attitudeTone: 'benevolent',
    attributes: [
      'Sovereignty over Rivers, Peaks & Wildlife',
      'Heralded by White Butterflies & Golden Mist',
      'Bestows Clarity and Healing Blessings',
      'Punishes Poachers and Shrine Defilers'
    ],
    wards: 'Reverent silence, offerings of clean water or flowers, and protecting wild creatures.',
    shortSummary:
      'Ancient guardian deities of sacred waterfalls, mountain peaks, and untouched forests.',
    description:
      'Revered long before colonial contact, Diwata are sacred tutelary spirits and lesser deities watching over specific mountains, cataracts, reefs, and forests. Unlike petty trickster spirits, a Diwata embodies the living balance of the land. Travelers who free snared beasts or bow in quiet reverence at their headwaters may receive subtle protection along their journey.',
    keywords: ['Diwata', 'diwata']
  },

  anito: {
    id: 'anito',
    name: 'Anito',
    title: 'Ancestral & Tutelary Spirit',
    category: 'Ancestral Spirit',
    origin: 'Austronesian & Pre-Colonial Philippine Belief',
    attitude: 'Watchful & Bound by Ancient Pacts',
    attitudeTone: 'neutral',
    attributes: [
      'Inhabits Carved Wood/Stone Likha & Nature Shrines',
      'Responds to Blood, Salt & Rice-Wine Offerings',
      'Communicates Through Omens and Dreams'
    ],
    wards: 'Honoring boundary cairns and fulfilling ancestral vows.',
    shortSummary:
      'Spirits of departed ancestors and ancient forces of the land, venerated through carved wooden idols and shrines.',
    description:
      'Anito refers both to the spirits of departed ancestors and the primordial spirits inhabiting waterways, mangroves, and stone cairns. Communities carve wooden or coral figures (likha or taotao) as vessels for the Anito, consulting them before voyages, harvests, or war.',
    keywords: ['Anito', 'anito']
  },

  bulul: {
    id: 'bulul',
    name: 'Bulul',
    title: 'Carved Ifugao Granary Guardian',
    category: 'Sacred Idol / Spirit Vessel',
    origin: 'Cordillera Highlands (Ifugao)',
    attitude: 'Solemn & Protective of the Harvest',
    attitudeTone: 'benevolent',
    attributes: [
      'Carved from Narra or Naga Hardwood',
      'Consecrated in Rice Wine (Bayah) and Sacrificial Blood',
      'Anchors Highland Terrace Wards Against Blight & Ash'
    ],
    wards: 'Offerings of fermented rice wine and chants of the Mumbaki.',
    shortSummary:
      'Sacred carved wooden figures of the Cordillera highlands that house ancestral spirits guarding the rice terraces.',
    description:
      'In the stone-walled rice terraces of Ifugao, Bulul are anthropomorphic hardwood carvings consecrated through elaborate rituals led by a Mumbaki. Once awakened, the Bulul houses an ancestral spirit that protects the granaries, wards off pestilence, and maintains the sacred covenant between the mountain carvers and the skyworld.',
    keywords: ['Bulul', 'bulul']
  },

  tamaraw: {
    id: 'tamaraw',
    name: 'Tamaraw',
    title: 'Fierce Dwarf Buffalo of the Ridges',
    category: 'Sacred Beast',
    origin: 'Mindoro & Highland Forests',
    attitude: 'Fiercely Independent & Loyal to Rescuers',
    attitudeTone: 'neutral',
    attributes: [
      'V-Shaped Backward-Swept Horns',
      'Dense Hide Resistant to Thorns & Fangs',
      'Relentless Charge Against Ambush Predators'
    ],
    wards: 'Giving wide berth and cutting poacher snares.',
    shortSummary:
      'A solitary, V-horned wild dwarf buffalo famed for its ferocity and unyielding charge.',
    description:
      'Smaller and far more aggressive than the domesticated lowland carabao, the wild Tamaraw roams bamboo thickets and misty mountain ridges. Its stout V-shaped horns can gore hunting hounds and shatter wooden shields. In local lore, the Tamaraw is favored by mountain Diwata and remembers any mortal who frees it from iron traps.',
    keywords: ['Tamaraw', 'tamaraw']
  },

  balete: {
    id: 'balete',
    name: 'Balete',
    title: 'Strangler Fig Gateway of the Unseen',
    category: 'Sacred / Haunted Flora',
    origin: 'Archipelago-Wide Folklore',
    attitude: 'Threshold Between Mortal & Spirit Realms',
    attitudeTone: 'neutral',
    attributes: [
      'Labyrinth of Hanging Aerial Roots',
      'Hollow Core Chamber Overwhelming to Senses',
      'Gathering Place of Tikbalang, Engkanto, and Wakwak'
    ],
    wards: 'Never cutting its bark, asking permission before passing, and wearing clothes inside-out.',
    shortSummary:
      'A massive strangler fig tree whose hanging curtains of aerial roots serve as doorways to the spirit world.',
    description:
      'The Balete tree begins life as a seed dropped in the canopy of a host tree, sending down thick curtains of aerial roots that eventually encase and replace the host, leaving a hollow cathedral-like cavern inside. Across Philippine folklore, old-growth Balete trees are treated as sacred portals inhabited by Engkanto, Tikbalang, and nocturnal monsters.',
    keywords: ['Balete', 'balete']
  },

  buntot_pagi: {
    id: 'buntot_pagi',
    name: 'Buntot Pagi',
    title: 'Cured Stingray-Tail Whip',
    category: 'Folklore Weapon',
    origin: 'Visayan & Coastal Hunter Tradition',
    attitude: 'Bane of Shapeshifters',
    attitudeTone: 'benevolent',
    attributes: [
      'Venom-Grooved Cartilage Barbs',
      'Cured in Cane Vinegar, Garlic, and Blessed Ash',
      'Sears Aswang and Wakwak Flesh on Contact'
    ],
    wards: 'Wielded by Babaylan and seasoned night-watchmen.',
    shortSummary:
      'A dried, barbed stingray tail treated with vinegar and prayers, feared by all Aswang and flying night-fiends.',
    description:
      'Harvested from large coastal stingrays and cured in spiced vinegar and smoke, the Buntot Pagi is the quintessential weapon against supernatural predators in Philippine folklore. Its serrated spines lacerate both physical flesh and spirit glamour, forcing shapeshifters to flee or reveal their true form.',
    keywords: ['Buntot Pagi', 'buntot pagi']
  },

  agimat: {
    id: 'agimat',
    name: 'Agimat',
    title: 'Inscribed Talisman of Warding',
    category: 'Folklore Relic',
    origin: 'Tagalog & Visayan Esoteric Tradition',
    attitude: 'Protective Vessel',
    attitudeTone: 'benevolent',
    attributes: [
      'Cast from Tanso (Bronze), Stone, or Seed-Pearls',
      'Grows Warm or Hums Near Malevolent Spirits',
      'Shields the Wearer Against Bati Hexes'
    ],
    wards: 'Must be kept from defilement and renewed during holy vigils or eclipses.',
    shortSummary:
      'A sacred amulet or talisman inscribed with esoteric symbols that warns of nearby spirits and deflects curses.',
    description:
      'Known variously as Agimat or Anting-Anting, these talismans are forged from bronze, crocodile teeth, or rare stones found at midnight. Worn around the neck or bound to the waist, an Agimat attunes its bearer to the unseen world, humming faintly when an Anito or Aswang approaches.',
    keywords: ['Agimat', 'agimat']
  },

  babaylan: {
    id: 'babaylan',
    name: 'Babaylan',
    title: 'Spiritual Medium, Healer & Lorekeeper',
    category: 'Cultural Calling',
    origin: 'Visayan & Pre-Colonial Archipelago',
    attitude: 'Mediator Between Mortals and Spirits',
    attitudeTone: 'benevolent',
    attributes: [
      'Mastery of Herbal Poultices & Lana Oil',
      'Spirit-Trance Negotiation with Anito & Diwata',
      'Preserver of Oral Epics and Eclipse Rites'
    ],
    wards: 'Carries ritual porcelain plates, ginger, and bronze bells.',
    shortSummary:
      'Pre-colonial spiritual leaders, healers, and ritualists who mediate between the barangay and the spirit realm.',
    description:
      'Second only to the Datu in community authority, the Babaylan serves as healer, diviner, and mediator with the unseen world. They diagnose spirit-inflicted illnesses, prepare blessed coconut oil (lana) and bayabas poultices, and lead the gong-beating rituals during lunar eclipses.',
    keywords: ['Babaylan', 'babaylan']
  },

  mumbaki: {
    id: 'mumbaki',
    name: 'Mumbaki',
    title: 'Highland Ancestral Chant-Priest',
    category: 'Cultural Calling',
    origin: 'Ifugao & Cordillera Highlands',
    attitude: 'Keeper of Sacred Genealogies',
    attitudeTone: 'benevolent',
    attributes: [
      'Recites Hours-Long Baki Invocations from Memory',
      'Consecrates Bulul Guardians with Rice Wine',
      'Reads Auguries in Bile and Ash'
    ],
    wards: 'Honored across mountain truces and headhunter canyons.',
    shortSummary:
      'Traditional Ifugao ritual specialists who commune with mountain ancestors and consecrate the Bulul idols.',
    description:
      'In the cloud-wrapped terraces of the Cordillera, the Mumbaki is a revered ritual specialist who memorizes vast ancestral genealogies and sacred chants (baki). Through offerings of rice wine and sacrificial blood, the Mumbaki calls upon ancestral spirits to guard the terraces and guide travelers through highland perils.',
    keywords: ['Mumbaki', 'mumbaki']
  },

  bagani: {
    id: 'bagani',
    name: 'Bagani',
    title: 'Sworn Warrior-Protector of the Realm',
    category: 'Cultural Calling',
    origin: 'Mindanao (Mandaya / Manobo) & Visayan Tradition',
    attitude: 'Fearless Vanguard',
    attitudeTone: 'benevolent',
    attributes: [
      'Wields the Kampilan, Bolo, and Kalasag Shield',
      'Clad in Red Tangar Headcloth of Valor',
      'Sworn to Defend the Community from Raiders & Monsters'
    ],
    wards: 'Iron discipline and ancestral war-oaths.',
    shortSummary:
      'An elite warrior class sworn to defend their settlement against both human raiders and monsters of the dark.',
    description:
      'Earned only through proven courage and defense of the community, the title of Bagani marks a warrior who stands at the front line when the war-horns sound. Armed with kampilan swords or heavy bolos and hardwood kalasag shields, they guard river fords and stockades when the eclipse darkens the land.',
    keywords: ['Bagani', 'bagani']
  },

  baybayin: {
    id: 'baybayin',
    name: 'Baybayin',
    title: 'Ancient Syllabic Script of the Islands',
    category: 'Cultural Lore',
    origin: 'Pre-Colonial Philippine Archipelago',
    attitude: 'Sacred Written Memory',
    attitudeTone: 'benevolent',
    attributes: [
      'Incised into Bamboo Slats, Copper, and Stone',
      'Used for Chronicles, Navigation, and Warding Seals'
    ],
    wards: 'Preserves survival warnings left by fallen chroniclers.',
    shortSummary:
      'The pre-colonial alpha-syllabic writing system carved into bamboo tubes, rings, and boundary stones.',
    description:
      'Written with an iron stylus or knife tip onto green bamboo cylinders and rubbed with ash for contrast, Baybayin records poetry, trade pacts, and sacred wards. In the wake of the Bakunawa eclipse, bamboo journals carved in Baybayin preserve vital survival warnings left behind by travelers.',
    keywords: ['Baybayin', 'baybayin']
  }
});

// Precompute sorted keyword matcher (longest phrases first to avoid partial overlaps)
const KEYWORD_MAP = [];
for (const entry of Object.values(MYTHOLOGY_CODEX)) {
  for (const kw of entry.keywords) {
    KEYWORD_MAP.push({
      keyword: kw,
      lower: kw.toLowerCase(),
      id: entry.id
    });
  }
}
KEYWORD_MAP.sort((a, b) => b.keyword.length - a.keyword.length);

const escapedPatterns = KEYWORD_MAP.map((k) =>
  k.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);
const MYTH_REGEX = new RegExp(`\\b(${escapedPatterns.join('|')})\\b`, 'gi');

/**
 * Set of entity IDs that represent mythological creatures, cryptids, and spirits
 * whose knowledge and weaknesses must be earned through encounters.
 * Relics, cultural roles, and general lore (e.g. babaylan, agimat) are not creatures.
 */
export const CREATURE_IDS = new Set([
  'bakunawa',
  'tikbalang',
  'kapre',
  'engkanto',
  'tambaluslos',
  'batibat',
  'aswang',
  'manananggal',
  'aswang_na_layog',
  'sigbin',
  'tiyanak',
  'amalanhig',
  'wakwak',
  'sirena',
  'angongolood',
  'berbalang',
  'rabot',
  'oryol',
  'santelmo',
  'bungisngis',
  'kumakatok',
  'pugot',
  'alan',
  'akop',
  'bannog',
  'buso',
  'minokawa',
  'kurita',
  'tarabusaw',
  'biraddali',
  'haliya',
  'siyokoy',
  'amomongo',
  'tigmamanukan',
  'nuno_sa_punso',
  'diwata',
  'anito',
  'tamaraw'
]);

/**
 * Check whether a codex entity ID represents an encounterable creature or spirit.
 * @param {string} id
 * @returns {boolean}
 */
export function isCreature(id) {
  return CREATURE_IDS.has(id);
}

/**
 * Mapping of creature IDs to atmospheric, descriptive terms used when
 * the creature has not yet been discovered by the player.
 */
export const CREATURE_OBSCURATION_MAP = Object.freeze({
  bakunawa: {
    obscuredName: 'colossal sea serpent',
    nameCapitalized: 'Colossal Sea Serpent',
    keywords: ['Bakunawa', 'bakunawa']
  },
  tikbalang: {
    obscuredName: 'horse-headed forest phantom',
    nameCapitalized: 'Horse-Headed Forest Phantom',
    keywords: ['Tikbalang', 'tikbalang', 'Tayho', 'tayho']
  },
  kapre: {
    obscuredName: 'tree-dwelling giant',
    nameCapitalized: 'Tree-Dwelling Giant',
    keywords: ['Kapre', 'kapre', 'Agta', 'agta']
  },
  engkanto: {
    obscuredName: 'pale otherworldly spirit',
    nameCapitalized: 'Pale Otherworldly Spirit',
    keywords: ['Engkanto', 'engkanto', 'Dalakitnon', 'dalakitnon']
  },
  tambaluslos: {
    obscuredName: 'grinning mangrove demon',
    nameCapitalized: 'Grinning Mangrove Demon',
    keywords: ['Tambaluslos', 'tambaluslos']
  },
  angongolood: {
    obscuredName: 'gorilla-like swamp beast',
    nameCapitalized: 'Gorilla-Like Swamp Beast',
    keywords: ['Angongolood', 'angongolood']
  },
  sirena: {
    obscuredName: 'predatory sea siren',
    nameCapitalized: 'Predatory Sea Siren',
    keywords: ['Sirena', 'sirena', 'Magindara', 'magindara']
  },
  batibat: {
    obscuredName: 'suffocating night hag',
    nameCapitalized: 'Suffocating Night Hag',
    keywords: ['Batibat', 'batibat', 'Bangungot', 'bangungot']
  },
  aswang: {
    obscuredName: 'shapeshifting flesh stalker',
    nameCapitalized: 'Shapeshifting Flesh Stalker',
    keywords: ['Aswang', 'aswang']
  },
  manananggal: {
    obscuredName: 'winged viscera hunter',
    nameCapitalized: 'Winged Viscera Hunter',
    keywords: ['Manananggal', 'manananggal', 'Anananggal', 'anananggal']
  },
  aswang_na_layog: {
    obscuredName: 'flying nocturnal stalker',
    nameCapitalized: 'Flying Nocturnal Stalker',
    keywords: ['Aswang na Layog', 'aswang na layog']
  },
  sigbin: {
    obscuredName: 'shadow-walking cryptid',
    nameCapitalized: 'Shadow-Walking Cryptid',
    keywords: ['Sigbin', 'sigbin']
  },
  tiyanak: {
    obscuredName: 'wailing mud demon',
    nameCapitalized: 'Wailing Mud Demon',
    keywords: ['Tiyanak', 'tiyanak']
  },
  amalanhig: {
    obscuredName: 'stiff-legged revenant',
    nameCapitalized: 'Stiff-Legged Revenant',
    keywords: ['Amalanhig', 'amalanhig']
  },
  wakwak: {
    obscuredName: 'nocturnal clawed scavenger',
    nameCapitalized: 'Nocturnal Clawed Scavenger',
    keywords: ['Wakwak', 'wakwak', 'Wak-wak', 'wak-wak', 'Kikik', 'kikik']
  },
  berbalang: {
    obscuredName: 'winged grave fiend',
    nameCapitalized: 'Winged Grave Fiend',
    keywords: ['Berbalang', 'berbalang']
  },
  rabot: {
    obscuredName: 'half-lizard brute',
    nameCapitalized: 'Half-Lizard Brute',
    keywords: ['Rabot', 'rabot']
  },
  oryol: {
    obscuredName: 'serpentine maiden',
    nameCapitalized: 'Serpentine Maiden',
    keywords: ['Oryol', 'oryol']
  },
  santelmo: {
    obscuredName: 'wandering spirit fireball',
    nameCapitalized: 'Wandering Spirit Fireball',
    keywords: ['Santelmo', 'santelmo']
  },
  bungisngis: {
    obscuredName: 'one-eyed laughing giant',
    nameCapitalized: 'One-Eyed Laughing Giant',
    keywords: ['Bungisngis', 'bungisngis']
  },
  kumakatok: {
    obscuredName: 'hooded death omen',
    nameCapitalized: 'Hooded Death Omen',
    keywords: ['Kumakatok', 'kumakatok']
  },
  pugot: {
    obscuredName: 'headless shadow giant',
    nameCapitalized: 'Headless Shadow Giant',
    keywords: ['Pugot', 'pugot']
  },
  alan: {
    obscuredName: 'backward-footed forest ghoul',
    nameCapitalized: 'Backward-Footed Forest Ghoul',
    keywords: ['Alan', 'alan']
  },
  akop: {
    obscuredName: 'shadowy head-snatching hag',
    nameCapitalized: 'Shadowy Head-Snatching Hag',
    keywords: ['Akop', 'akop']
  },
  bannog: {
    obscuredName: 'giant raptor of the crags',
    nameCapitalized: 'Giant Raptor of the Crags',
    keywords: ['Bannog', 'bannog']
  },
  buso: {
    obscuredName: 'grave-eating ghoul',
    nameCapitalized: 'Grave-Eating Ghoul',
    keywords: ['Buso', 'buso']
  },
  minokawa: {
    obscuredName: 'sun-swallowing dragon-bird',
    nameCapitalized: 'Sun-Swallowing Dragon-Bird',
    keywords: ['Minokawa', 'minokawa']
  },
  kurita: {
    obscuredName: 'multi-limbed amphibious horror',
    nameCapitalized: 'Multi-Limbed Amphibious Horror',
    keywords: ['Kurita', 'kurita']
  },
  tarabusaw: {
    obscuredName: 'ape-man maneater of the mountains',
    nameCapitalized: 'Ape-Man Maneater of the Mountains',
    keywords: ['Tarabusaw', 'tarabusaw']
  },
  biraddali: {
    obscuredName: 'winged water maiden',
    nameCapitalized: 'Winged Water Maiden',
    keywords: ['Biraddali', 'biraddali']
  },
  haliya: {
    obscuredName: 'masked moon maiden',
    nameCapitalized: 'Masked Moon Maiden',
    keywords: ['Haliya', 'haliya']
  },
  siyokoy: {
    obscuredName: 'gilled green water predator',
    nameCapitalized: 'Gilled Green Water Predator',
    keywords: ['Siyokoy', 'siyokoy']
  },
  amomongo: {
    obscuredName: 'white-furred mountain ape',
    nameCapitalized: 'White-Furred Mountain Ape',
    keywords: ['Amomongo', 'amomongo']
  },
  tigmamanukan: {
    obscuredName: 'blue-feathered omen bird',
    nameCapitalized: 'Blue-Feathered Omen Bird',
    keywords: ['Tigmamanukan', 'tigmamanukan']
  },
  nuno_sa_punso: {
    obscuredName: 'tiny earth mound dweller',
    nameCapitalized: 'Tiny Earth Mound Dweller',
    keywords: ['Nuno sa Punso', 'nuno sa punso', 'Nuno', 'nuno']
  },
  diwata: {
    obscuredName: 'radiant forest guardian',
    nameCapitalized: 'Radiant Forest Guardian',
    keywords: ['Diwata', 'diwata']
  },
  anito: {
    obscuredName: 'ancient ancestral spirit',
    nameCapitalized: 'Ancient Ancestral Spirit',
    keywords: ['Anito', 'anito']
  },
  tamaraw: {
    obscuredName: 'horn-crowned wild beast',
    nameCapitalized: 'Horn-Crowned Wild Beast',
    keywords: ['Tamaraw', 'tamaraw']
  }
});

/**
 * Replace occurrences of undiscovered creature names with generic, atmospheric descriptors.
 * @param {string} text
 * @param {Function} isKnownFn
 * @returns {string}
 */
export function obscureCreatureReferences(text, isKnownFn) {
  if (typeof text !== 'string' || !text) return text;
  let result = text;
  for (const [creatureId, info] of Object.entries(CREATURE_OBSCURATION_MAP)) {
    if (typeof isKnownFn === 'function' && isKnownFn(creatureId)) {
      continue;
    }
    for (const kw of info.keywords) {
      // 1. Article + keyword (e.g. "a Tambaluslos", "the Tambaluslos", "an Angongolood")
      const articlePattern = new RegExp(`\\b(a|an|the)\\s+${kw}\\b`, 'gi');
      result = result.replace(articlePattern, (match, article) => {
        const isCap = match[0] === match[0].toUpperCase();
        const art = article.toLowerCase();
        const obs = info.obscuredName;
        let chosenArticle;
        if (art === 'the') {
          chosenArticle = isCap ? 'The' : 'the';
        } else {
          const startsVowel = /^[aeiou]/i.test(obs);
          chosenArticle = startsVowel ? (isCap ? 'An' : 'an') : (isCap ? 'A' : 'a');
        }
        return `${chosenArticle} ${obs}`;
      });

      // 2. Standalone keyword (e.g. "Tambaluslos")
      const kwPattern = new RegExp(`\\b${kw}\\b`, 'g');
      result = result.replace(kwPattern, (match) => {
        return match[0] === match[0].toUpperCase()
          ? info.nameCapitalized
          : info.obscuredName;
      });
    }
  }
  return result;
}

let globalCodexKnowledgeChecker = null;

/**
 * Register a global knowledge checking function for the codex.
 * @param {Function} fn
 */
export function setGlobalCodexKnowledgeChecker(fn) {
  globalCodexKnowledgeChecker = fn;
}

/**
 * Look up a Mythology Codex entry by id or matched keyword text.
 * @param {string} idOrText
 * @returns {Object|null}
 */
export function getMythologyEntry(idOrText) {
  if (!idOrText) return null;
  if (MYTHOLOGY_CODEX[idOrText]) return MYTHOLOGY_CODEX[idOrText];
  const lower = idOrText.toLowerCase();
  const found = KEYWORD_MAP.find((k) => k.lower === lower);
  return found ? MYTHOLOGY_CODEX[found.id] : null;
}

/**
 * Safely annotate a DOM element's text content by wrapping recognized
 * Philippine mythological terms in interactive `.myth-term` spans.
 * Undiscovered creatures are rendered as plain text without interactive markup.
 * @param {HTMLElement} element
 * @param {Function|null} isKnownFn
 */
export function annotateMythologyTerms(element, isKnownFn = null) {
  if (!element) return;
  const rawText = element.textContent || '';
  if (!rawText) return;

  MYTH_REGEX.lastIndex = 0;
  if (!MYTH_REGEX.test(rawText)) return;

  MYTH_REGEX.lastIndex = 0;
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;

  const checker = typeof isKnownFn === 'function' ? isKnownFn : globalCodexKnowledgeChecker;

  while ((match = MYTH_REGEX.exec(rawText)) !== null) {
    const matchedText = match[0];
    const start = match.index;

    if (start > lastIndex) {
      fragment.appendChild(document.createTextNode(rawText.slice(lastIndex, start)));
    }

    const entry = getMythologyEntry(matchedText);
    const isKnown = entry
      ? (!isCreature(entry.id) || (typeof checker === 'function' ? checker(entry.id) : false))
      : false;

    if (entry && isKnown) {
      const span = document.createElement('span');
      span.className = 'myth-term';
      span.setAttribute('data-myth-id', entry.id);
      span.setAttribute('role', 'button');
      span.setAttribute('tabindex', '0');
      span.textContent = matchedText;
      fragment.appendChild(span);
    } else {
      fragment.appendChild(document.createTextNode(matchedText));
    }

    lastIndex = start + matchedText.length;
  }

  if (lastIndex < rawText.length) {
    fragment.appendChild(document.createTextNode(rawText.slice(lastIndex)));
  }

  element.innerHTML = '';
  element.appendChild(fragment);
}
