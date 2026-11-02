/**
 * js/data/lore/CreatureTales.js
 *
 * Immersive campfire and hearth storytelling system for Mytholohiya.
 * When players encounter and survive an undiscovered mythological entity in the wild,
 * the memory is etched into their minds as an unidentified adventure tale.
 *
 * In later scenarios during chill moments (resting at a campfire, sharing salabat
 * with village elders, sheltering from storms, or talking by a forge),
 * the player can recount their adventures to companions, unraveling the creature's
 * true identity, lore, and folkloric weaknesses.
 */

import { CREATURE_OBSCURATION_MAP, getMythologyEntry } from './MythologyCodex.js';

export const CREATURE_TALE_DATA = Object.freeze({
  tikbalang: {
    creatureId: 'tikbalang',
    trueName: 'Tikbalang',
    topic: 'the horse-headed forest phantom that trapped you in looping bamboo trails',
    whisperTag: 'Tale of the Trail // Horse-Headed Phantom',
    elderReaction:
      'Ay, traveler... you met none other than a Tikbalang! That was no trick of the mountain mist, but the towering trickster guardian of old bamboo groves!',
    loreExplanation:
      'Reversing your garments (baliktad) is the only ancient folkloric ward that shatters its spatial loop. Our elders teach that three golden hairs gleam in its mane; any warrior bold enough to pluck one can compel the stallion-spirit into a sacred oath of servitude.'
  },
  kapre: {
    creatureId: 'kapre',
    trueName: 'Kapre',
    topic: 'the colossal tree-dwelling giant smoking an iron pipe in the old Balete boughs',
    whisperTag: 'Tale of the Trail // Tree-Dwelling Giant',
    elderReaction:
      'Narra and Balete roots... you gazed upon a Kapre! A solitary giant who hoards pipe tobacco and sits high in the boughs watching lonely crossroads.',
    loreExplanation:
      'They rarely harm without provocation, but their heavy pipe smoke disorients the soul and twists forest trails. Carrying white river stones or striking a brass war-gong startles them into dropping gifts.'
  },
  manananggal: {
    creatureId: 'manananggal',
    trueName: 'Manananggal',
    topic: 'the severed winged horror you tracked through the rafters and roof eaves',
    whisperTag: 'Tale of the Trail // Severed Winged Horror',
    elderReaction:
      'Lord of heaven shield us... you encountered an Anananggal, the torso-severing viscera hunter of the Aswang line!',
    loreExplanation:
      'By night its torso sprouts bat wings and hunts with a hollow thread-tongue, while its lower waist remains hidden among buttress roots. Scattering coarse salt, crushed garlic, or volcanic ash onto its exposed lower torso prevents reunion before sunrise, turning it to ash.'
  },
  wakwak: {
    creatureId: 'wakwak',
    trueName: 'Wakwak (Kikik)',
    topic: 'the vampiric scout bird whose cry was a faint whisper directly overhead',
    whisperTag: 'Tale of the Trail // Inverted Night Bird',
    elderReaction:
      'You heard the acoustically inverted call of a Wakwak! Its trick is cunning: when its screech sounds leagues distant, the demon bird is perched right above your scalp!',
    loreExplanation:
      'It acts as an aerial scout for winged stalkers. Shouting "Adi an asin!" while flinging coarse rock salt into the eaves burns its feathers and scatters its hunt.'
  },
  batibat: {
    creatureId: 'batibat',
    trueName: 'Batibat (Bangungot)',
    topic: 'the suffocating night hag that pressed down upon your chest during sleep',
    whisperTag: 'Tale of the Trail // Suffocating Night Hag',
    elderReaction:
      'That was a Batibat, the ancient spirit of felled forest timber! When men carve beds or build huts from old narra trees without asking leave, she sits upon their chests in the night, stealing their breath in Bangungot.',
    loreExplanation:
      'To break her paralyzing weight, you must fight through the nightmare panic and wiggle your big toes or bite your thumb until the spirit spell shatters.'
  },
  tambaluslos: {
    creatureId: 'tambaluslos',
    trueName: 'Tambaluslos',
    topic: 'the wide-mouthed laughing giant whose enormous lips concealed the forest trail',
    whisperTag: 'Tale of the Trail // Grinning Mangrove Demon',
    elderReaction:
      'Ha! You ran into a Tambaluslos! A bizarre mangrove trickster whose lower lip droops past its chest, laughing continuously to confuse weary wanderers.',
    loreExplanation:
      'Strip off your shirt or wear your clothing inside-out, and the creature will burst into embarrassed laughter until it trips over its own lips and tumbles into the creek.'
  },
  angongolood: {
    creatureId: 'angongolood',
    trueName: 'Angongolood',
    topic: 'the gorilla-like swamp beast that lurked among muddy river channels',
    whisperTag: 'Tale of the Trail // Gorilla-Like Swamp Beast',
    elderReaction:
      'Beware the Angongolood of the brackish swales! A terrifying brute that looks like a mossy ape or rotting tree trunk, seizing passing river canoes and turning travelers to stone.',
    loreExplanation:
      'It fears the sharp clatter of iron tools and fire. Staying low in the current and smearing your skin with river silt hides you from its predatory stare.'
  },
  sirena: {
    creatureId: 'sirena',
    trueName: 'Sirena / Magindara',
    topic: 'the predatory sea siren singing sweet melodies along the reef waters',
    whisperTag: 'Tale of the Trail // Predatory Sea Siren',
    elderReaction:
      'You heard the Magindara or Sirena of the coral depths! Their songs entice lonely fishermen and boatmen into deep whirlpools to drown them for food or sacrifice.',
    loreExplanation:
      'Plugging your ears with beeswax or gripping an iron dagger prevents their hypnotic underwater melodies from stealing your will.'
  },
  tiyanak: {
    creatureId: 'tiyanak',
    trueName: 'Tiyanak',
    topic: 'the weeping child in the dark woods that transformed into a mud demon',
    whisperTag: 'Tale of the Trail // Wailing Mud Demon',
    elderReaction:
      'A Tiyanak! An unbaptized earth-demon that mimics the plaintive cry of a lost infant to lure kindhearted travelers off the trail, then tears at them with muddy talons.',
    loreExplanation:
      'Turning your upper garments inside-out confounds its illusions just like with a Tikbalang, exposing its true wrinkly shape and breaking its hold over the trail.'
  },
  aswang: {
    creatureId: 'aswang',
    trueName: 'Aswang',
    topic: 'the feral black hound that stalked your scent into the village outskirts',
    whisperTag: 'Tale of the Trail // Shapeshifting Stalker',
    elderReaction:
      'An Aswang na Lakaw... a shapeshifting flesh-hunter walking among peaceful men by day and prowling as a blood-eyed beast by night.',
    loreExplanation:
      'A stingray tail whip (Buntot Pagi), coarse rock salt, and blessed Lana coconut oil are the sovereign banes of its bloodline. It cannot bear the sting of consecrated stingray thorns.'
  },
  sigbin: {
    creatureId: 'sigbin',
    trueName: 'Sigbin',
    topic: 'the shadow-walking cryptid that hopped backwards with its head between its legs',
    whisperTag: 'Tale of the Trail // Shadow-Walking Cryptid',
    elderReaction:
      'A Sigbin! The nocturnal blood-scavenger of dark warlocks, walking backward with its snout between its hind legs and clapping its broad ears to startle prey!',
    loreExplanation:
      'They crave human shadows during holy week and new moons. Burning coarse salt and hanging dried wild garlic along the camp perimeter drives them back into the deep brush.'
  },
  amalanhig: {
    creatureId: 'amalanhig',
    trueName: 'Amalanhig',
    topic: 'the stiff-legged revenant that pursued you along the shallow riverbed',
    whisperTag: 'Tale of the Trail // Stiff-Legged Revenant',
    elderReaction:
      'An Amalanhig! A walking corpse whose soul failed to pass its dark powers before dying, forced to rise from the grave and chase anyone it hears.',
    loreExplanation:
      'Because its joints are rigid as petrified wood, it cannot bend its knees. Climbing a tall tree or wading across deep rivers causes it to lose your scent and wander aimlessly.'
  },
  berbalang: {
    creatureId: 'berbalang',
    trueName: 'Berbalang',
    topic: 'the winged grave fiend with glowing feline eyes feasting in the darkness',
    whisperTag: 'Tale of the Trail // Winged Grave Fiend',
    elderReaction:
      'The Berbalang of the southern isles! A ghoul that sends its astral double or leathery wings to feed upon the recently buried.',
    loreExplanation:
      'Their eyes glow like green embers in the dark. An iron kampilan blade warded with coconut oil pierces their astral double, forcing the creature back into its physical form.'
  },
  santelmo: {
    creatureId: 'santelmo',
    trueName: 'Santelmo',
    topic: 'the wandering fireball dancing across the marshes and drowned reefs',
    whisperTag: 'Tale of the Trail // Wandering Spirit Fireball',
    elderReaction:
      'Santelmo! The wandering Saint Elmo fire born from the restless souls of sailors and travelers drowned during sudden typhoons.',
    loreExplanation:
      'Do not run from it or shout in panic. Offer a quiet prayer, cast a pinch of hearth ash, and the lost fire will sink peacefully back into the damp soil.'
  },
  bungisngis: {
    creatureId: 'bungisngis',
    trueName: 'Bungisngis',
    topic: 'the one-eyed laughing giant with massive tusks and thunderous laughter',
    whisperTag: 'Tale of the Trail // One-Eyed Laughing Giant',
    elderReaction:
      'A Bungisngis! A colossal one-eyed cyclops of the southern valleys that laughs boisterously at everything it sees.',
    loreExplanation:
      'It has tremendous strength that can uproot narra trees, but very little wit. Tricking it into charging toward a covered pit trap or a wild hornets nest is the traditional way to escape.'
  },
  nuno_sa_punso: {
    creatureId: 'nuno_sa_punso',
    trueName: 'Nuno sa Punso',
    topic: 'the tiny bearded elder watching from the red earthen anthill mound',
    whisperTag: 'Tale of the Trail // Tiny Earth Mound Dweller',
    elderReaction:
      'The Nuno of the Punso! An ancient earthen ancestor spirit who guards the red clay mounds of the forest floor.',
    loreExplanation:
      'Never step over an earthen mound without murmuring "Tabi-tabi po". Honor his mound with a leaf of tobacco, and his blessing will protect your steps from sudden illness.'
  },
  diwata: {
    creatureId: 'diwata',
    trueName: 'Diwata',
    topic: 'the radiant forest guardian watching over the sacred headwaters',
    whisperTag: 'Tale of the Trail // Radiant Forest Guardian',
    elderReaction:
      'A true Diwata... guardian priestess of mountain headwaters, crystal falls, and untamed glens.',
    loreExplanation:
      'Treat her waterfalls with reverence and take no game or fruit without humble supplication, and her spirit light will guide your vessel through dark storms.'
  },
  bakunawa: {
    creatureId: 'bakunawa',
    trueName: 'Bakunawa',
    topic: 'the colossal sea serpent rising to swallow the moon in eclipse',
    whisperTag: 'Tale of the Trail // Colossal Sea Serpent',
    elderReaction:
      'The Bakunawa... the primordial cosmic dragon of the abyssal deep that seeks to swallow the sacred moons of Bathala!',
    loreExplanation:
      'When the sky turns blood-red during an eclipse, only the deafening clamor of brass Lantaka cannons, war-gongs, and wooden mortars can startle the great serpent into spitting the moon back to the sky.'
  },
  oryol: {
    creatureId: 'oryol',
    trueName: 'Oryol',
    topic: 'the serpentine maiden of the karst ridges whose voice charmed the forest',
    whisperTag: 'Tale of the Trail // Serpentine Maiden',
    elderReaction:
      'Oryol, the legendary shape-shifting serpent princess of the Mount Isarog limestone ridges!',
    loreExplanation:
      'Half cunning serpent and half captivating maiden, she tests the integrity of wandering warriors. Speak to her with honest courage without drawing iron, and she will guide you safely through the labyrinthine karst cliffs.'
  },
  rabot: {
    creatureId: 'rabot',
    trueName: 'Rabot',
    topic: 'the half-lizard brute with stone-like scales and petrifying breath',
    whisperTag: 'Tale of the Trail // Half-Lizard Brute',
    elderReaction:
      'Rabot, the monstrous earth-beast of ancient Ibalon lore with scales harder than volcanic granite!',
    loreExplanation:
      'Its stony breath can stiffen a warrior limbs like petrified wood, but it cannot maneuver swiftly on open river rocks in full daylight.'
  }
});

/**
 * Get tale data for a creature ID.
 * Falls back to generic information from CREATURE_OBSCURATION_MAP if not specifically configured.
 * @param {string} creatureId
 * @returns {Object}
 */
export function getCreatureTaleData(creatureId) {
  if (CREATURE_TALE_DATA[creatureId]) {
    return CREATURE_TALE_DATA[creatureId];
  }

  const obscuration = CREATURE_OBSCURATION_MAP[creatureId] || {
    obscuredName: 'strange woodland phantom',
    nameCapitalized: 'Strange Woodland Phantom'
  };

  const codexEntry = getMythologyEntry(creatureId);
  const trueName = codexEntry ? codexEntry.name : creatureId;

  return {
    creatureId,
    trueName,
    topic: `facing the ${obscuration.obscuredName} in the wilderness`,
    whisperTag: `Tale of the Trail // ${obscuration.nameCapitalized}`,
    elderReaction:
      `Traveler, you spoke of the ${obscuration.obscuredName}... you crossed paths with an ancient spirit known in folklore as the ${trueName}!`,
    loreExplanation:
      `Our elders teach that encountering a ${trueName} is a rare omen. Surviving its presence proves your instincts are keen.`
  };
}

/**
 * Build contextual storytelling paragraph text tailored to the listener and scenario.
 * @param {string} creatureId
 * @param {Object} scenario
 * @returns {string[]}
 */
export function buildTaleResolutionStory(creatureId, scenario = null) {
  const data = getCreatureTaleData(creatureId);
  const scnId = (scenario && scenario.id) || '';

  let listenerIntro = 'Your companion listens with rapt attention, eyes widening as the pieces fall into place:';
  if (scnId.includes('hunter') || scnId.includes('kiko')) {
    listenerIntro = 'The Mangyan hunter Kiko pauses, lowering his steaming cup of ginger broth as his eyes widen:';
  } else if (scnId.includes('potter') || scnId.includes('simeon')) {
    listenerIntro = 'Tandang Simeon rests his hands upon the clay wheel, his sightless eyes reflecting the warm kiln fire:';
  } else if (scnId.includes('stargazer')) {
    listenerIntro = 'The celestial navigator lowers his ivory sighting stick, turning slowly with deep solemnity:';
  } else if (scnId.includes('taboan') || scnId.includes('hearth')) {
    listenerIntro = 'The old grandmother stirs the simmering ginger tea with her wooden paddle, gasping in recognition:';
  } else if (scnId.includes('blacksmith') || scnId.includes('pandak')) {
    listenerIntro = 'Panday Pandak pauses his iron hammer above the anvil, nodding gravely with veteran respect:';
  } else if (scnId.includes('baliana') || scnId.includes('grove')) {
    listenerIntro = 'Baliana Alunsina sprinkles scented spring water over the burning copal resin, nodding with sacred insight:';
  }

  const topicText = data.topic.startsWith('the ') ? data.topic : `the ${data.topic}`;

  return [
    `Sitting by the warmth of the fire, you recount your harrowing encounter with ${topicText}. You describe the eerie signs, the strange atmospheric distortion, and how you managed to survive and break free.`,
    `${listenerIntro} "${data.elderReaction}"`,
    `"${data.loreExplanation}" With the mystery solved, the true nature of the ${data.trueName} is permanently recorded in your Mythos Codex.`
  ];
}
