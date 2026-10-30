/**
 * ScenarioData.js
 * Registers the primary EARLY_GAME substory arc ("The Drowned Salt Trail")
 * using NarrativeRegistry.registerSubstory.
 * Features item-unlocked actions (Cloth Sheets, Prybar, Torch, Inside-Out
 * Baliktad clothing folklore), pure story choices, and entity-memory callbacks.
 */

import { NarrativeRegistry } from '../../narrative/NarrativeDirector.js';

export const ScenarioData = {
  substoryId: 'sub_early_01_salt_trail',
  mainLoopId: 'loop_eclipse_bakunawa',
  phase: 'EARLY_GAME',
  internalName: 'The Drowned Salt Trail',
  targetScenarioCount: 12,
  scenarios: [
    {
      id: 'scn_salt_01',
      phase: 'EARLY_GAME',
      locationLabel: 'Flooded Salt Flats',
      weather: 'DRIZZLE',
      baseWeight: 1.5,
      intrinsicTags: ['rain_stopping', 'muddy_ground'],
      affinityWeights: {
        raining: 3.5,
        status_poor: 1.5
      },
      seamlessHooks: {
        raining:
          'The relentless downpour finally thins into a drifting mist, leaving the salt pans brimming with gray rainwater.',
        clear_sky:
          'Low clouds roll in off the Mindanao current, dampening the crusted salt beneath your heels.',
        fog_gathering:
          'The sea fog settles low over the diked evaporation beds, turning the brine pools into pale mirrors.',
        default: 'You follow the sunken markers along the edge of the tidal flats.'
      },
      passive: {
        stat: 'WIS',
        dc: 13,
        success:
          'Beneath the surface of the flooded pans, you spot offerings of cracked crab shells arranged in a deliberate warning spiral.',
        fail:
          'The abandoned salt baskets floating in the brine seem merely swept loose by the rising tide.'
      },
      prompt: [
        'Rows of bamboo evaporation troughs stretch across the coastal marsh, deserted before the harvest could be scraped dry. Half-submerged in the brine beside a broken sluice-gate rests a rusted iron overseer lockbox, its heavy clasp still shut.',
        'A few paces away, crouched inside an overturned salt-vat, a shivering apprentice boy clutches a gashed ankle. His voice is nearly gone from terror after watching something drag the overseer into the mangroves, leaving you to decide whether to help him, pry the lockbox, or skirt the flooded pans entirely.'
      ],
      choices: [
        {
          text: 'Bind the apprentice boy bleeding ankle with a Ripped Cloth Sheet from your pack',
          requiredItem: 'ripped_sheets',
          itemActionTag: 'Item // Ripped Cloth Sheet',
          check: null,
          successStory: [
            'You tear a clean knot around his gashed ankle. Able to walk again, the grateful boy presses his woven Salakot hat into your hands and sketches a secret scout-mark before hurrying home.'
          ],
          onSuccess: {
            removeItem: 'ripped_sheets',
            addItem: 'salakot_hat',
            emitTags: ['helped_salt_boy', 'fog_gathering', 'cautious']
          }
        },
        {
          text: 'Kneel by the vat and calm the boy with steady words so he points out the creature path',
          check: { stat: 'CHA', dc: 13 },
          successStory: [
            'The boy stops trembling long enough to sketch a three-toed track in the wet salt and point toward a hidden safe causeway through the mangroves before limping back toward the village.',
            'Nothing material changes hands, yet his gratitude and warning linger with you.'
          ],
          failStory: [
            'Panicked by your approach, the boy bolts blindly across the dike, accidentally kicking a rotten sluice-beam down onto your shin!'
          ],
          onSuccess: { emitTags: ['helped_salt_boy', 'fog_gathering', 'cautious'] },
          onFail: { hp: -3, emitTags: ['raining', 'muddy_ground', 'wounded'] }
        },
        {
          text: 'Use your Iron Prybar to crack open the submerged overseer lockbox effortlessly',
          requiredTag: 'pry_tool',
          itemActionTag: 'Tool // Iron Prybar',
          check: null,
          successStory: [
            'Wedging the shipwright prybar under the rusted iron hasp, you snap the lock with a single heave and recover the salt-tax remnants and a coil of blessed oil without risking the sharp coral.'
          ],
          onSuccess: {
            remnants: 5,
            addItem: 'blessed_lana_vial',
            emitTags: ['abandoned_salt_boy', 'clear_sky']
          }
        },
        {
          text: 'Ignore the survivor and wrench the submerged lockbox open with bare hands',
          check: { stat: 'STR', dc: 14 },
          successStory: [
            'Muscles corded with effort, you wrench the rusted iron clasp apart under the cold brine and pocket the salt-tax remnants while the boy watches in silent dread.'
          ],
          failStory: [
            'The iron clasp snaps your grip and slices your palm open in the stinging salt water as a venomous stonefish spines your ankle!'
          ],
          onSuccess: { remnants: 5, emitTags: ['abandoned_salt_boy', 'clear_sky'] },
          onFail: { hp: -5, emitTags: ['abandoned_salt_boy', 'raining', 'wounded'] }
        },
        {
          text: 'Avoid the flooded vats altogether and follow the dry stone seawall around the marsh',
          check: null,
          successStory: [
            'Keeping to the firm stones of the outer seawall, you leave both the frightened apprentice and the sunken lockbox behind, advancing dry-shod toward the mangrove line.'
          ],
          onSuccess: { emitTags: ['cautious', 'high_ground'] }
        }
      ]
    },
    {
      id: 'scn_salt_02',
      phase: 'EARLY_GAME',
      locationLabel: 'Mangrove Bone-Rack',
      weather: 'SPIRIT FOG',
      baseWeight: 1.2,
      intrinsicTags: ['forest_edge', 'spirit_ward'],
      affinityWeights: {
        fog_gathering: 3.0,
        cautious: 1.5,
        muddy_ground: 1.2
      },
      seamlessHooks: {
        raining:
          'As you step beneath the dense mangrove arch, the rain turns into a slow, echoing drip from salt-crusted leaves.',
        fog_gathering:
          'The pale mist thickens between the stilt roots until the bleached rib-bones of dugong charms rattle just ahead.',
        clear_sky:
          'Even the bright sky cannot pierce the tangled canopy where the salt-trail enters the tidal swamp.',
        default:
          'You wade through ankle-deep brackish water into the shadow of the old mangrove ward-posts.'
      },
      passive: {
        stat: 'INT',
        dc: 13,
        success:
          'A lesser Mangrove Anito has been cruelly bound to the central root with rusted iron nails, trapping it in torment.',
        fail:
          'Wind chimes of oyster shell clatter above your head in a frantic, unnatural rhythm.'
      },
      prompt: [
        'Suspended from the arching roots are dozens of woven rattan cages stuffed with black feathers. At the heart of the tangle, a translucent mud-spirit writhes silently where iron spikes pin its shadowy mantle to the bark.',
        'A narrow bamboo footbridge spans the black channel ahead, half-swallowed by creeping mist.'
      ],
      choices: [
        {
          text: 'Lever the iron spikes out cleanly using your equipped Blade or Prybar',
          requiredTag: 'armed_blade',
          itemActionTag: 'Equipped // Blade Leverage',
          check: null,
          successStory: [
            'Sliding your tempered steel flat beneath the nail-heads, you pry the spikes from the bark without touching the cursed iron directly. The freed Mangrove Anito circles your shoulders in bioluminescent gratitude before vanishing upstream, leaving a Bent Coffin-Iron Ring in the moss.'
          ],
          onSuccess: {
            addItem: 'iron_nail_ring',
            emitTags: ['unbound_mangrove_anito', 'spirit_respect', 'clear_sky']
          }
        },
        {
          text: 'Wrench the rusted iron nails from the bark with your bare hands to free the Anito',
          check: { stat: 'STR', dc: 13 },
          successStory: [
            'You pull the cold iron spikes free one by one. The spirit dissolves into a swirl of bioluminescent green motes that circle your head thrice before vanishing upstream.',
            'You claim no loot here, but the spirit of the tide-creek now owes you a life-debt.'
          ],
          failStory: [
            'As you struggle with the final spike, the tormented spirit lashes out in blind agony, searing your forearms with graveyard frost!'
          ],
          onSuccess: { emitTags: ['unbound_mangrove_anito', 'spirit_respect', 'clear_sky'] },
          onFail: { hp: -4, emitTags: ['spirit_hexed', 'fog_gathering', 'wounded'] }
        },
        {
          text: 'Leave the bound spirit to its fate and cross the slick bamboo footbridge in silence',
          check: { stat: 'DEX', dc: 13 },
          successStory: [
            'Keeping your balance on the moss-slick culms, you cross the channel without looking back at the pleading eyes in the bark.'
          ],
          failStory: [
            'The bound spirit whispers a curse that makes your vision swim; your foot slips through the rotten lashings, tearing your calf on barnacles!'
          ],
          onSuccess: { emitTags: ['ignored_mangrove_anito', 'high_ground'] },
          onFail: { hp: -3, emitTags: ['ignored_mangrove_anito', 'raining', 'wounded'] }
        },
        {
          text: 'Murmur a quiet "Tabi-tabi po" and wade the shallow gravel bar upstream away from both the bridge and the bound spirit',
          check: null,
          successStory: [
            'Refusing to meddle with the iron-bound ward or trust the rotting bridge, you detour along a firm gravel bar upstream and rejoin the trail unharmed.'
          ],
          onSuccess: { emitTags: ['cautious', 'muddy_ground'] }
        }
      ]
    },
    {
      id: 'scn_salt_03',
      phase: 'EARLY_GAME',
      locationLabel: 'Spatial Loop of the Bakawan Thicket',
      weather: 'SPIRIT FOG',
      baseWeight: 1.0,
      intrinsicTags: ['mangrove_swamp', 'spatial_loop', 'skinless_grin', 'coastal_mud'],
      affinityWeights: {
        fog_gathering: 2.5,
        knows_reed_warning: 2.8,
        helped_salt_boy: 2.0
      },
      seamlessHooks: {
        raining:
          'Through the curtain of rain, you pass the exact same notched bakawan root for the third time as a wet, rasping chuckle echoes from the coastal underbrush.',
        fog_gathering:
          'Out of the choking white vapor, the mangrove trail loops back upon itself where a lanky silhouette squats atop an arching stilt-root.',
        clear_sky:
          'Even under the open sky, the shadows among the bakawan mangroves twist the footpath into an inescapable circle.',
        default:
          'A hollow, wheezing laugh echoes from the coastal mud as the dike loops back to the exact milestone you left behind.'
      },
      passive: {
        stat: 'WIS',
        dc: 15,
        success:
          'You steel your nerves against the spatial distortion and recognize the Bicolano and Visayan mangrove trickster: a Tambaluslos. Wearing a garment inside-out will make it laugh until its own lips blind its eyes.',
        fail:
          'Panic tightens around your chest as every turn through the bakawan roots leads back to the same black pool.'
      },
      prompt: [
        'Blocking the sunken causeway is a Tambaluslos: a dark, lanky humanoid demon with spindly long legs and huge, ape-like protruding lips. It stretches its wide, skinless mouth from ear to ear, waiting for disorientation to drive you into its jaws.',
        'The fog loops endlessly around the mangrove roots; according to archipelagic lore, wearing your garment inside-out ("Baliktad") exploits the creature bizarre humor to blind it.'
      ],
      choices: [
        {
          text: 'Step forward with your garment worn Inside-Out so the Tambaluslos laughs itself blind',
          requiredTag: 'clothing_inside_out',
          itemActionTag: 'Folklore Ward // Garment Worn Inside-Out',
          check: null,
          successStory: [
            'Catching sight of your reversed seams, the Tambaluslos erupts into such violent, roaring laughter that its huge floppy upper lip folds completely over its eyes! Blinded by its own mirth, its spatial loop shatters and you stride past to claim a Tanso Agimat snagged on the roots.'
          ],
          onSuccess: {
            addItem: 'tanso_agimat',
            emitTags: ['outwitted_tambaluslos', 'clear_sky']
          }
        },
        {
          text: 'Hold your burning Resin Torch high to sear the mangrove demon back into the underbrush',
          requiredTag: 'has_light_source',
          itemActionTag: 'Equipped // Resin Torch',
          check: null,
          successStory: [
            'The sputtering sahing-resin flame scorches the demon skinless grin, breaking its concentration over the mangrove loop and forcing it to retreat into the mud!'
          ],
          onSuccess: {
            remnants: 4,
            emitTags: ['outwitted_tambaluslos', 'clear_sky']
          }
        },
        {
          text: 'Resist panic when confronted by its ear-to-ear skinless grin and break the spatial illusion',
          check: { stat: 'WIS', dc: 15 },
          successStory: [
            'Refusing to flinch before its cavernous, skinless maw, you fix your gaze on the true tidal current and walk straight through the illusionary wall of roots.'
          ],
          failStory: [
            'The hideous ear-to-ear grin freezes your blood; as you stumble backward into the coastal mud, its long claws rake across your shoulder!'
          ],
          onSuccess: { emitTags: ['outwitted_tambaluslos', 'clear_sky'] },
          onFail: { hp: -4, emitTags: ['spirit_hexed', 'fog_gathering'] }
        },
        {
          text: 'Sprint across the slick, muddy mangrove roots to outrun its reach',
          check: { stat: 'DEX', dc: 13 },
          successStory: [
            'Leaping from prop-root to prop-root above the sucking mire, you burst free of the spatial loop and scoop up a pouch of remnants dropped by a previous traveler!'
          ],
          failStory: [
            'Your heel slips on the wet bakawan bark, plunging you into the mud where the demon grazing lunge tears your forearm before you scramble free!'
          ],
          onSuccess: { remnants: 6, emitTags: ['outwitted_tambaluslos', 'high_ground'] },
          onFail: { hp: -5, emitTags: ['wounded', 'raining', 'muddy_ground'] }
        },
        {
          text: 'Keep your eyes fixed on your own boots and retrace your exact footprints backward out of the thicket',
          check: null,
          successStory: [
            'Refusing to look up at the grinning trickster or play its game, you step backward along your own boot-prints in the mud until the spatial haze thins and the true trail reappears.'
          ],
          onSuccess: { emitTags: ['cautious', 'steady_nerves'] }
        }
      ]
    },
    {
      id: 'scn_salt_04',
      phase: 'EARLY_GAME',
      locationLabel: 'Swamp Riverbank of the Angongolood',
      weather: 'MONSOON',
      baseWeight: 1.1,
      intrinsicTags: ['raining', 'muddy_ground', 'swamp_ambush', 'riverbank_stalker'],
      affinityWeights: {
        unbound_mangrove_anito: 4.0,
        diwata_remembered: 3.0,
        raining: 2.5
      },
      seamlessHooks: {
        raining:
          'The downpour swells the swampy riverbank ahead into a churning brown channel where an overturned dugout canoe and salt-sled cling to the mud.',
        fog_gathering:
          'Heavy rain shears through the fog at the riverbank crossing, where gnarled trees shaped suspiciously like petrified men line the water edge.',
        clear_sky:
          'Flash-flood waters from the interior mountains turn the swamp river channel into a roaring wall of mud and timber.',
        default:
          'You descend to the shadowed swamp riverbank where an overturned wooden dugout rests beside the crossing.'
      },
      passive: {
        stat: 'WIS',
        dc: 13,
        success:
          'The twisted trunks along the bank are victims of an Angongolood, the gorilla-like Bicolano swamp beast whose embrace petrifies mortals into wood. Pounding loudly on a wooden boat hull terrifies it!',
        fail:
          'You mistake the hulking, mud-matted silhouette crouching on the overhanging bank for a fallen boulder until it shifts.'
      },
      prompt: [
        'Ahead at the narrow river crossing, a massive, gorilla-like Angongolood coated in black swamp mud and hanging moss crouches on the overhanging bank, waiting to pounce on anything that steps into the shallows! Those caught in its dark, hairy arms are petrified into gnarled timber.',
        'Half-submerged beside your boots is the hollow hardwood hull of an overturned dugout canoe and salt-sled, while a thorny but passable bamboo ridge winds upstream out of the beast reach.'
      ],
      choices: [
        {
          text: 'Beat the hollow wooden hull of the overturned canoe repeatedly to terrify the Angongolood',
          check: { stat: 'STR', dc: 12 },
          successStory: [
            'You slam your weapon pommel and fists against the hollow hardwood hull! The booming acoustic thuds reverberate through the swamp water, terrifying the Angongolood into retreating deep into the mud while you salvage a Waxed Rain-Cape from the sled.'
          ],
          failStory: [
            'Your first strike slips on the wet timber; the beast lunges down and clips your shoulder with a numbing, bark-stiffening blow before the echoing hull-thuds finally drive it off!'
          ],
          onSuccess: {
            addItem: 'waxed_rain_cape',
            emitTags: ['high_ground', 'clear_sky']
          },
          onFail: { hp: -3, emitTags: ['muddy_ground'] }
        },
        {
          text: 'Right the dugout skiff and paddle swiftly across outside the Angongolood pouncing radius',
          check: { stat: 'DEX', dc: 13 },
          successStory: [
            'Righting the light skiff in one fluid motion, you push off the bank just as the Angongolood splashes harmlessly behind the stern, carrying you safely across with the sled remnants!'
          ],
          failStory: [
            'The swamp monster lunges into the shallows and capsizes the skiff, bruising your ribs against the roots before you scramble up the far bank!'
          ],
          onSuccess: { remnants: 5, emitTags: ['clear_sky', 'high_ground'] },
          onFail: { hp: -4, emitTags: ['raining', 'wounded'] }
        },
        {
          text: 'Charge the crossing directly and wrestle past the Angongolood through raw Strength',
          check: { stat: 'STR', dc: 15 },
          successStory: [
            'Even as grey bark begins to creep over your forearms, you roar and wrench the beast hairy limbs apart, hurling it backward into the torrent and climbing to high ground!'
          ],
          failStory: [
            'Its crushing embrace nearly turns your ribs to rigid timber before a collapsing bank forces the beast to release its grip!'
          ],
          onSuccess: { remnants: 6, emitTags: ['high_ground', 'steady_nerves'] },
          onFail: { hp: -5, emitTags: ['wounded', 'muddy_ground'] }
        },
        {
          text: 'Do not approach the crossing; detour upstream through the bamboo ridge away from the riverbank',
          check: null,
          successStory: [
            'Giving the mud-draped beast a wide berth, you hike upstream along the high bamboo bank and cross over a fallen trunk far beyond its territory.'
          ],
          onSuccess: { emitTags: ['cautious', 'high_ground'] }
        }
      ]
    },
    {
      id: 'scn_salt_05',
      phase: 'EARLY_GAME',
      locationLabel: 'Coral Shelf of the Magindara',
      weather: 'CLEAR',
      baseWeight: 0.9,
      intrinsicTags: ['high_ground', 'coastal_surf', 'sea_singing', 'coral_reef'],
      affinityWeights: {
        helped_salt_boy: 3.8,
        clear_sky: 2.0,
        high_ground: 2.0
      },
      seamlessHooks: {
        raining:
          'Climbing out of the swamp onto the coastal ridge, the rain clouds part as an enchanting polyphonic song rises from the sea caves below.',
        fog_gathering:
          'Your ascent carries you onto a limestone trail overlooking a deep tidal channel where a haunting melody drifts through the mist.',
        clear_sky:
          'The trail climbs above the turquoise reef caves where a hauntingly beautiful singing voice echoes over the seashore.',
        default:
          'You follow the wind-scoured inland trail above a coral headland where a breathtaking song rises from the seashore.'
      },
      passive: {
        stat: 'WIS',
        dc: 14,
        success:
          'You recognize the hypnotic song of the Sirena and Magindara rising from the reef below. You are still safely back on the ridge trail: approaching the cliffside scout cairn will expose you to their charm unless you are warded or prepared, or you can simply ignore the voices and stay on the inland path.',
        fail:
          'The singing from the seashore below is so enchanting that it tugs at your curiosity, inviting you to leave the safe trail and look over the cliff edge.'
      },
      prompt: [
        'From the turquoise sea caves and coral shelf below the headland rises a hauntingly beautiful singing voice, weaving a melody of longing over the crash of the surf. You stand safely back on the inland ridge trail, where the song has not yet claimed your steps.',
        'Out near the spray-slick cliff edge stands an ancient stone watch-cairn holding a scout supply cache, directly above the reef where three Magindara merfolk gleam in the tide. You can ignore the singing and keep to the inland road, or risk approaching the shore.'
      ],
      choices: [
        {
          text: 'Ignore the singing voices by the seashore and continue steadily along the inland ridge trail',
          check: null,
          successStory: [
            'Knowing better than to answer a siren call by the sea, you keep your eyes on the inland mountain path and walk on until the enchanting melody fades harmlessly behind the surf.'
          ],
          onSuccess: {
            emitTags: ['cautious', 'steady_nerves', 'high_ground']
          }
        },
        {
          text: 'Approach the cliff cairn protected by your consecrated Agimat or Anito ward to claim the cache',
          requiredTag: 'spirit_ward_item',
          itemActionTag: 'Blessed Ward // Immune to Siren Charm',
          check: null,
          successStory: [
            'Your consecrated talisman hums with a warm golden note that parts the hypnotic glamour completely. Seeing your sacred ward, the Magindara bow in the surf and toss a cluster of sea-pearls onto the ledge as you recover the Sterilized Bayabas Poultice!'
          ],
          onSuccess: {
            remnants: 6,
            addItem: 'herbal_poultice',
            emitTags: ['clear_sky', 'well_rested', 'spirit_respect']
          }
        },
        {
          text: 'Step toward the shore and answer the Magindara with a respectful counter-song matching their cadence',
          check: { stat: 'CHA', dc: 15 },
          successStory: [
            'Your voice rings clear and steady across the tidal cavern, harmonizing with the coral guardians. Charmed by your courtesy, the Sirena calm the undertow and guide your hand to the cairn cache containing a Sterilized Bayabas Poultice and remnants!'
          ],
          failStory: [
            'Your voice cracks on the high cadence; displeased, the Magindara summon a rogue wave that crashes over the ledge, soaking your gear and battering you against the coral!'
          ],
          onSuccess: {
            remnants: 6,
            addItem: 'herbal_poultice',
            emitTags: ['clear_sky', 'well_rested']
          },
          onFail: { hp: -4, emitTags: ['wounded', 'raining'] }
        },
        {
          text: 'Stop your ears against the siren song and steel your Wisdom to retrieve the cliffside cairn supplies',
          check: { stat: 'WIS', dc: 14 },
          successStory: [
            'Focusing on the three-toed scout cipher rather than the alluring melody in the surf, you lift the false keystone, secure the Bayabas Poultice, and withdraw safely inland.'
          ],
          failStory: [
            'Entranced for a heartbeat too long after stepping near the cliff lip, you slip on the spray-soaked coral and gash your shin before tearing your mind free of the song!'
          ],
          onSuccess: {
            remnants: 4,
            addItem: 'herbal_poultice',
            emitTags: ['clear_sky', 'cautious']
          },
          onFail: { hp: -4, emitTags: ['wounded', 'fog_gathering'] }
        }
      ]
    }
  ]
};

NarrativeRegistry.registerSubstory(ScenarioData);

