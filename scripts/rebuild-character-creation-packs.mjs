import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("/Applications/Foundry Virtual Tabletop.app/Contents/Resources/app/node_modules/classic-level");

const SORT_DENSITY = 100000;
const PACK_PATHS = [
  "packs/sorts.db",
  "packs/sorts",
  "packs/peculiarities.db",
  "packs/peculiarities",
  "packs/knacks.db",
  "packs/knacks",
  "packs/insufficiencies.db",
  "packs/insufficiencies",
  "packs/pets.db",
  "packs/pets",
  "packs/objects-of-desire.db",
  "packs/objects-of-desire",
  "packs/homes.db",
  "packs/homes",
  "packs/npc-animals.db",
  "packs/npc-animals",
  "packs/npc-humans.db",
  "packs/npc-humans",
  "packs/npc-ordinary-animals.db",
  "packs/npc-ordinary-animals",
  "packs/npc-generic-ordinary-animals.db",
  "packs/npc-generic-ordinary-animals",
  "packs/insufficiency-rolltables.db",
  "packs/insufficiency-rolltables",
  "packs/appalling-relatives.db",
  "packs/appalling-relatives",
  "packs/betweentimes-tables.db",
  "packs/betweentimes-tables"
];

const SINGLE_SORTS = ["Badger", "Bat", "Fox", "Hedgehog", "Mole", "Otter", "Owl", "Squirrel"];
const CATEGORY_FOLDERS = ["Corvids", "Amphibians", "Lagomorphs", "Reptiles", "Mustelids", "Columbids", "Rodents", "Waterfowl"];
const PET_FOLDERS = ["Beetles", "Butterflies", "Moths"];
const HOME_FOLDERS = ["Type", "Size"];
const LOCATIONS = [
  {
    name: "The River and Other Waterways",
    content: `<p>The River is the heart of the River Bank. Many miles downstream, it widens, fills with boats, and passes cities and docklands before pouring at last into the sea, but it is younger here, expanding with every stream that enters as it flows from the northwest in a great loop to the northeast. It varies between fifteen and thirty feet wide, edged with water meadows and wetland woods, low banks, and occasional small retaining walls. The depth varies from sandy shallows to deep holes where the water stays cold, even in August. In the summer, it slows and turns cloudy; in most winters it freezes over for at least a week or two, except close to the locks.</p><p>Farther downstream, the River is busy with canalboats or small motorized or sail boats, but the Village lock is the final navigation lock, though only the smallest boats come this far, as there is no convenient turning-around point. Stone retaining walls about six feet high keep the River from wandering as it passes through the Village. Boxwood bushes planted at intervals along the edges give it a decorative look. The walls end at the juncture where Mill Beck joins the River.</p><p>A mile or so west, by the Island and weir, there is a second, very small, self-operated lock called the Wee Lock, created by a clever local inventor of the last century. A boat's pilot can operate it to gain access to the River's upper reaches without portage.</p><p>There are a few wooden docks and many informal landings, muddy pull-outs worn smooth with use. Most people in the area, Animal or Human, feel comfortable in boats, as the River can be the easiest way to get from place to place. An Animal out for a row seeing a friend strolling along the River walk might well offer to take them up the River or down to the Village.</p>`
  },
  {
    name: "Curl Brook/the Run",
    content: `<p>Curl Brook enters the River between the lock and the King's Bridge, but for the northernmost quarter-mile, it has been channeled into a straight, stone-lined watercourse about eight feet wide and six feet deep. Historically, the Run served the Village as an open kennel, or sewer, but has been cleaned up in recent years. The water is not deep, and in the summer it is almost hidden by lush reeds that grow as high as the stone walls of the channel. Lanes of pounded earth, called East Lane and West Lane, follow on either side of the Run, accessible to carriages and horses as well as pedestrians.</p><p>A few planks cross the Run, all inadequately fenced; horses, carriages, and folks with bad balance must cross where the lanes meet the Oxford Road at the north end of the Village, or go south, where the train-tracks go over a bridge.</p>`
  },
  {
    name: "Downstream",
    content: `<p>Downstream past the Village, the River grows wider. If one floats on and on to the east, one encounters locks and dams, mills, waterfront pubs, villages and towns, until it flows past wharves and ocean-going ships waiting in port basins, to decant at last into the sea. Along its length, the River becomes ever more frequented by boats: the small boats common to the area, but motor-boats and sailing boats as well; day-tripper steam-boats, and long, slender canalboats towed along the River's edge by horses or Humans paid by the mile. If one walks or floats long enough, one finds oneself in Town.</p>`
  },
  {
    name: "Island",
    content: `<p>Animals refer to this area generally as "the Island," but there is much more to it. The Island itself is a brush-choked sliver of land between a small weir, in this case a sort of dam made of concrete and pebbles, and the Wee Lock. The wetland wood has grown up around it, hiding almost everything. The woods also fill the curve of the Wendle where it joins the River. Pook's Hole is here. While the River boasts other small islands, this is the Island, for reasons no one can quite express. Madame Anthemia claims there are ancient powers at play.</p><p>Small as it is, the weir proves very dangerous if an Animal boater or swimmer gets caught by the current and forced against the weir on the upstream side, or is taken over it into the churning, circular currents on the downstream side.</p>`
  }
];
const LOCATION_ORDER = LOCATIONS.map((entry) => entry.name);

const SORTS = [
  {
    name: "Badger",
    folder: null,
    size: "Large",
    timeOfDay: "Nocturnal",
    sociability: "Solitary; some collect in groups called clans",
    preliminaryStats: { charm: 4, intrepidity: 3, pother: 2, sense: 6 },
    innatePeculiarities: ["Digging", "Thrives Underground", "Weak Vision"],
    riverbankSortDescription: "Badgers take a proprietary interest in the doings of their smaller Mustelid cousins, the Stoats and Weasels, and often make friends with Foxes and Otters. They prefer homes a little out of the general way. Badgers have a black-and-white striped muzzle, heavy forepaws, a flecked grey coat, and a short white-tipped tail. Their ears are edged with white.",
    ordinarySortDescription: "European badgers belong to the Mustelidae family. Ordinary badgers always live underground in woodlands, in extensive tunnel complexes called setts or cetes. They are omnivores, eating berries, worms, beetles, and occasional small mammals. They have very long, strong claws for digging, which they sharpen on trees. They are inquisitive and often quite gregarious, playing or grooming together. Males are boars; females are sows; and babies are cubs or kits, born in litters of two or three.",
    notes: "Common Badger surnames: Badger, Baggard, Brock, Brockson, Dasse, Grey, Meles, Melies, Sett, Tasson."
  },
  {
    name: "Bat",
    folder: null,
    size: "Diminutive to small, but with a very impressive wingspan",
    timeOfDay: "Nocturnal",
    sociability: "Colony",
    preliminaryStats: { charm: 2, intrepidity: 4, pother: 3, sense: 6 },
    innatePeculiarities: ["Exceptional Hearing", "Head for Heights", "Speediness", "Weak Vision", "Wings"],
    riverbankSortDescription: "Many species of bat call England home, and the RiverBank Bats reflect this variety. They love the company of their sort, and it is not unusual to find Bats collected in single-sort villages with shared flats and public spaces. Most Bats have adapted their schedules to suit the larger Animal and Human communities, but they remain happiest at night. Bats are round-bodied with short tails and thin legs, and their wings are forepaws that have evolved to support a fur-covered skin membrane.",
    ordinarySortDescription: "The thirteen types of bat native to England come from two families, differentiated by general conformation, ear shapes, and noses. They sleep in groups hanging from the ceilings of cellars, caves, and other unfrequented locations. All English bats eat insects and therefore hibernate in the winter, when insects are rare. Infant bats are called pups.",
    notes: "Common Bat surnames: Bakke, Bat, Black, Blake, Chase, Chaucer, Flittermouse, Horseshoe, Leatherblake, Solea, Vesper, Venger. RiverBank Bats also often use Human-cataloguer names such as Barbastelle, Bechstein, Daubenton, Liersler, Natterer, Noctule, Pipistrelle, and Serotine. Notes: All Bats have Wings, but not every Bat chooses to fly."
  },
  {
    name: "Fox",
    folder: null,
    size: "Large",
    timeOfDay: "Crepuscular or nocturnal",
    sociability: "Small family group",
    preliminaryStats: { charm: 5, intrepidity: 5, pother: 2, sense: 3 },
    innatePeculiarities: ["Exceptional Hearing", "Speediness", "Trickiness"],
    riverbankSortDescription: "Foxes number among the largest Animals of the River Bank. In the country, they prefer to live in underground burrows or bermed cottages or houses, but they also thrive in urban environments with an Animal population. They are partial to the dawn and dusk, and Foxes often make friends with Badgers, Corvids, and Mustelids.",
    ordinarySortDescription: "Foxes are opportunists, living in everything from abandoned badger setts to unused gardening sheds. Primarily predators of small mammals, they scavenge as well. One sees them most often in the dawn, dusk, and evening hours. The male is a dog fox, the female a vixen, and babies are cubs or kits.",
    notes: "Common Fox surnames: Fawcett, Fox, Fuchs, Goupple, Le Reynard, Reynard, Rott, Rufus, Russell, Todd."
  },
  {
    name: "Hedgehog",
    folder: null,
    size: "Medium",
    timeOfDay: "Nocturnal",
    sociability: "Solitary",
    preliminaryStats: { charm: 6, intrepidity: 2, pother: 4, sense: 3 },
    innatePeculiarities: ["Climbing", "Spines", "Winter Torpor"],
    riverbankSortDescription: "Though usually greyish-brown with cream-tipped dark spines and black noses, pale and albino hedgehogs are not uncommon. A Hedgehog's spines usually lie flat, but when they feel threatened or frightened, the spines rise. They prefer conventional aboveground houses to burrows and often are friendly and chatty despite their preference for solitude.",
    ordinarySortDescription: "As nocturnal omnivores, ordinary hedgehogs cover miles each night in quest of invertebrates, frogs and toads, snakes, birds' eggs, mushrooms, roots, berries, and carrion, which they find with their excellent sense of smell. Hedgehogs are one of the few English mammals that truly hibernate.",
    notes: "Common Hedgehog surnames: Eggle, Errin, Hedgehog, Hedgepig, Hegge, Herrisson, Iggle, Penn, Pinn, Pinsvine, Urchin."
  },
  {
    name: "Mole",
    folder: null,
    size: "Small",
    timeOfDay: "Nocturnal",
    sociability: "Solitary",
    preliminaryStats: { charm: 5, intrepidity: 3, pother: 2, sense: 5 },
    innatePeculiarities: ["Digging", "Thrives Underground", "Weak Vision"],
    riverbankSortDescription: "Moles prefer underground homes. Their sensitivity to light leads them to take precautions on daytime expeditions, carrying green silk parasols or wearing dark sunglasses. Their soft fur ranges from light fawn to velvety black, and Moles usually have a few very close friends.",
    ordinarySortDescription: "Ordinary moles spend most of their lives underground in a network of tunnels that serves as a trap for earthworms and other invertebrates. They have strong, paddle-like forepaws, compact sturdy bodies, and very small eyes and ears. Males are boars, females are sows, and babies are pups.",
    notes: "Common Mole surnames: Fellar, Loam, Moldwarp, Mole, Moll, Mouldiwarp, Tallby, Talpiddy, Taupe, Topp."
  },
  {
    name: "Otter",
    folder: null,
    size: "Large",
    timeOfDay: "Either nocturnal or diurnal",
    sociability: "Solitary or family groups",
    preliminaryStats: { charm: 4, intrepidity: 6, pother: 2, sense: 3 },
    innatePeculiarities: ["Aquatic", "Deft", "Playfulness"],
    riverbankSortDescription: "Otters are large Animals who prefer river- or lakeside homes, ideally burrows or cottages of stone or brick. Many Otters have Scottish connections and are notable for exceptionally lush fur. Dinner or tea at an Otter's house may include fish in every course.",
    ordinarySortDescription: "Ordinary otters live in moss- or grass-lined dens called holts under stones or at the roots of trees on the banks of lakes, rivers, and streams, especially in areas with heavy cover. They have thick, tapered tails and dense waterproof fur. Male otters are called boars or dogs; females are sows or bitches; babies are pups or cubs.",
    notes: "Common Otter surnames: Couch, Dratsie, Holt, Hiver, Hover, Lutter, Luttren, Otterley, Store, Trask, Waters. Notes: Ordinary otters like slides, and RiverBank Otters often start them for their friends."
  },
  {
    name: "Owl",
    folder: null,
    size: "Medium; Little Owls are small",
    timeOfDay: "Nocturnal",
    sociability: "Solitary",
    preliminaryStats: { charm: 3, intrepidity: 2, pother: 4, sense: 6 },
    innatePeculiarities: ["Exceptional Eyesight", "Exceptional Hearing", "Head for Heights", "Speediness", "Stealthiness", "Wings"],
    riverbankSortDescription: "While they have a reputation for wisdom that has spread into Human lore, Owls are actually just very sensible. They live in cottages and houses on the ground and in trees, but their treehouses often rise only five or ten feet above the ground, with wooden staircases for the comfort of guests.",
    ordinarySortDescription: "All ordinary owls in England are nocturnal. They make their nests in tree boles, steeples, barns, and cliffs. Their wings have evolved to make them almost silent in flight, which helps them catch small mammals, birds, frogs, invertebrates, and even fish. Male owls are cocks, female owls are hens, and nestlings and fledglings are called owlets.",
    notes: "Common Owl surnames: Cowell, Cowett, Euell, Hibble, Highbough, Ollie, Owl, Owling, Uggles, Wall, Well, Wills. Notes: All Owls have Wings, but not every Owl chooses to fly."
  },
  {
    name: "Squirrel",
    folder: null,
    size: "Small",
    timeOfDay: "Diurnal",
    sociability: "Family groups",
    preliminaryStats: { charm: 3, intrepidity: 5, pother: 5, sense: 2 },
    innatePeculiarities: ["Climbing", "Head for Heights", "Nibbly", "Speediness"],
    riverbankSortDescription: "Squirrels are small, but their dramatic tails can make them seem much larger. They are rich chestnut in color with long ear-tufts, and they have a reputation for gossip that is not entirely unearned.",
    ordinarySortDescription: "Red squirrels live in wooded areas and eat tree seeds, though they also eat insects, flowers, vegetables, and other foods. They build large shaggy nests called dreys. Males are boars, females are sows, and babies are kits or kittens.",
    notes: "Common Squirrel surnames: Curry, Dray, Drey, Jaunt, Oaktree, Rout, Scurry, Tusk. Notes: RiverBank Squirrels derive from red squirrels, and like other nibbling sorts they are susceptible to dental problems."
  },
  {
    name: "Crow",
    folder: "Corvids",
    size: "Medium",
    timeOfDay: "Diurnal",
    sociability: "Social and flocking",
    preliminaryStats: { charm: 4, intrepidity: 6, pother: 3, sense: 2 },
    innatePeculiarities: ["Head for Heights", "Playfulness", "Trickiness", "Wings"],
    riverbankSortDescription: "Corvids are supremely adaptable and thrive as well in cities as rural areas. They prefer to live near other Animals, love knick-knacks, and will stay up all night for a party despite preferring the daylight hours.",
    ordinarySortDescription: "Crows are familiar, heavy-beaked, all-black scavengers that adapt to most environments. Ordinary corvids are opportunistic eaters and excellent problem-solvers with a reputation for stealing and hiding small objects.",
    notes: "Common Corvid surnames: Benedict, Branny, Crack, Kurrack, Montmorency, Shade, Waldron. For Crows: Brannock, Corbey, Corbie, Crawford, Crowe, Kerbow. Notes: All Corvids have Wings, but not every Crow chooses to fly."
  },
  {
    name: "Magpie",
    folder: "Corvids",
    size: "Medium",
    timeOfDay: "Diurnal",
    sociability: "Some Magpies collect in flocks and others keep to themselves or small groups",
    preliminaryStats: { charm: 4, intrepidity: 6, pother: 3, sense: 2 },
    innatePeculiarities: ["Head for Heights", "Playfulness", "Trickiness", "Wings"],
    riverbankSortDescription: "Corvids are supremely adaptable and thrive as well in cities as rural areas. They prefer to live near other Animals, love knick-knacks, and will stay up all night for a party despite preferring the daylight hours.",
    ordinarySortDescription: "Magpies prefer mature pastures and hedgerows. They have distinctive plumage with a black head, iridescent dark feathers, white shoulders and belly, and an extremely long tail. They are more solitary than other corvids.",
    notes: "Common Corvid surnames: Benedict, Branny, Crack, Kurrack, Montmorency, Shade, Waldron. For Magpies: Casse, Jocasse, Peste, Pica, Pye, Skade. Notes: All Corvids have Wings, but not every Magpie chooses to fly."
  },
  {
    name: "Frog",
    folder: "Amphibians",
    size: "Diminutive",
    timeOfDay: "Crepuscular",
    sociability: "Solitary except when they collect seasonally at the pond",
    preliminaryStats: { charm: 2, intrepidity: 5, pother: 6, sense: 2 },
    innatePeculiarities: ["Amphibious", "Aquatic", "Climbing", "Winter Torpor"],
    riverbankSortDescription: "Frogs are round with long muscular legs. They prefer to live near water in burrows beside rivers and ponds, homes carved into the bases of tree trunks, and free-standing cottages. Frogs have smooth skin in colors ranging from dark green-grey to chestnut and yellow.",
    ordinarySortDescription: "The only native amphibians of central and southern England are the common frog and common toad. Frogs hunt insects, slugs, snails, and worms, spawn in spring breeding ponds, hibernate in winter, and rest in the shade during hot days so as not to overheat.",
    notes: "Common Amphibian surnames: Brown, Greene, Dingle, Tosskey, Tigglemarch, Paranelle, La Molaire, Jingerypingery, Sporgle. For Frogs: Frog, Frogge, Frosch, La Grenouille, Rand, Rayne. Notes: Frogs return pleased with life after the late-March pond pilgrimage."
  },
  {
    name: "Toad",
    folder: "Amphibians",
    size: "Diminutive",
    timeOfDay: "Crepuscular",
    sociability: "Solitary except when they collect seasonally at the pond",
    preliminaryStats: { charm: 2, intrepidity: 5, pother: 6, sense: 2 },
    innatePeculiarities: ["Amphibious", "Aquatic", "Climbing", "Sticky Tongue", "Winter Torpor"],
    riverbankSortDescription: "Toads are round with long muscular legs and prefer to live near water in burrows beside rivers and ponds, homes carved into the bases of tree trunks, and free-standing cottages. Toads have bumpy speckled golden-brown skin and a paler flecked belly.",
    ordinarySortDescription: "The only native amphibians of central and southern England are the common frog and common toad. Toads hunt insects, slugs, snails, and worms, spawn in spring breeding ponds, hibernate in winter, and rest in the shade during hot days so as not to overheat.",
    notes: "Common Amphibian surnames: Brown, Greene, Dingle, Tosskey, Tigglemarch, Paranelle, La Molaire, Jingerypingery, Sporgle. For Toads: Crapaud, Croope, Croot, Lilypad, Natter, Natterjack, Toad. Notes: Toads use different ancestral ponds from Frogs and also celebrate Old Greenie's Day on 21 October."
  },
  {
    name: "Hare",
    folder: "Lagomorphs",
    size: "Medium",
    timeOfDay: "Crepuscular",
    sociability: "Solitary",
    preliminaryStats: { charm: 5, intrepidity: 3, pother: 5, sense: 2 },
    innatePeculiarities: ["Exceptional Hearing", "Nibbly", "Playfulness", "Speediness"],
    riverbankSortDescription: "The more solitary Hares build aboveground houses in open areas. Like Rabbits, they have long ears and twitchy noses, but Hares are more independent and often associated with open country.",
    ordinarySortDescription: "Hares are larger and leaner-looking than rabbits, with wider-set eyes. They live in open areas such as meadows, fields, and downs, where they sleep crouched in grass or a furrow during the day and feed in the evenings and mornings.",
    notes: "For Hares: Downs, Hare, Hasen, Hasson, Husk, Leaper, Lever, Murchen, Marchen. Notes: Mad as a March hare is rooted in their leaping, chasing, and boxing behavior."
  },
  {
    name: "Rabbit",
    folder: "Lagomorphs",
    size: "Medium",
    timeOfDay: "Crepuscular",
    sociability: "Communal",
    preliminaryStats: { charm: 5, intrepidity: 3, pother: 5, sense: 2 },
    innatePeculiarities: ["Exceptional Hearing", "Nibbly", "Speediness", "Thrives Underground"],
    riverbankSortDescription: "Rabbits love having housemates and generally prefer underground or bermed homes. They are highly sociable and use the long ears and twitchy noses of their ordinary relatives.",
    ordinarySortDescription: "Ordinary rabbits live in underground colonies called warrens in open country. They eat grasses, seeds, twigs, and plants and have short black-and-white tails they raise when running.",
    notes: "For Rabbits: Bunny, Caney, Cannon, Coney, Court, Grandry, Rabbit, Radder, Taggert. Notes: Threatened Rabbits may start to thump before they are even aware of it and, like other nibbling sorts, can need their incisors filed."
  },
  {
    name: "Lizard",
    folder: "Reptiles",
    size: "Small",
    timeOfDay: "Diurnal",
    sociability: "Solitary",
    preliminaryStats: { charm: 3, intrepidity: 2, pother: 6, sense: 4 },
    innatePeculiarities: ["Climbing", "Detachable Tail", "Winter Torpor"],
    riverbankSortDescription: "Lizards are small and prefer houses aboveground. They are rough-skinned and medium brown but vividly patterned with dark stripes and spots of yellow, orange, green, and grey. They are larger and stockier than Newts.",
    ordinarySortDescription: "Ordinary lizards are diurnal and live on heaths, moors, and grassy or scrub-covered banks where they can bask on sunny days. A young lizard is a hatchling.",
    notes: "Common Lizard and Newt surnames often trend exotic or faddish. For Lizards: Cadmus, Ides, Ives, Lacerta, Nettle, Ogle, Orange, Sabor."
  },
  {
    name: "Newt",
    folder: "Reptiles",
    size: "Small",
    timeOfDay: "Nocturnal",
    sociability: "Solitary",
    preliminaryStats: { charm: 3, intrepidity: 2, pother: 6, sense: 4 },
    innatePeculiarities: ["Amphibious", "Climbing", "Detachable Tail", "Sticky Tongue", "Winter Torpor"],
    riverbankSortDescription: "Newts are small and prefer houses aboveground. They are smooth-skinned in shades of gold and olive, with irregular parallel stripes running the length of their bodies.",
    ordinarySortDescription: "Ordinary newts are slower-moving and nocturnal, preferring lush pastures and open woodland near breeding ponds. A young newt is an eft.",
    notes: "Common Lizard and Newt surnames often trend exotic or faddish. For Newts: Daubeney, Flick, Molk, Padgett, Pook, Shelby, Triton, Tritony, Zouche."
  },
  {
    name: "Stoat",
    folder: "Mustelids",
    size: "Small",
    timeOfDay: "Any time, though individuals have personal preferences",
    sociability: "Solitary",
    preliminaryStats: { charm: 2, intrepidity: 4, pother: 6, sense: 3 },
    innatePeculiarities: ["Climbing", "Ferocity", "Speediness"],
    riverbankSortDescription: "Stoats build homes in or near woodlands, but they also claim abandoned huts and outbuildings, adapting them into comfortable if unconventional homes. Their reputation for troublemaking haunts even the most virtuous of their sort.",
    ordinarySortDescription: "Stoats are small but fierce predators that hunt mostly rodents and can kill rabbits and other animals twice their size. They thrive in open country, where they live in rock crevices, holes, and abandoned rabbit burrows.",
    notes: "Common Mustelid surnames: Ballett, Bellet, Easy, Eezle, Herman, Hermeline, Hobbe, Jack, Mostell, Stott, Stout. Stoats casually take on larger mustelid surnames as well."
  },
  {
    name: "Weasel",
    folder: "Mustelids",
    size: "Small",
    timeOfDay: "Any time, though individuals have personal preferences",
    sociability: "Solitary",
    preliminaryStats: { charm: 2, intrepidity: 4, pother: 6, sense: 3 },
    innatePeculiarities: ["Climbing", "Ferocity", "Speediness"],
    riverbankSortDescription: "Weasels build homes in or near woodlands, but they also claim abandoned huts and outbuildings, adapting them into comfortable if unconventional homes. Their reputation for troublemaking haunts even the most virtuous of their sort.",
    ordinarySortDescription: "Weasels are small but fierce predators that hunt mostly rodents and can kill rabbits and other animals twice their size. They thrive in open country, where they live in rock crevices, holes, and abandoned rabbit burrows.",
    notes: "Common Mustelid surnames: Ballett, Bellet, Easy, Eezle, Herman, Hermeline, Hobbe, Jack, Mostell, Stott, Stout. Weasels casually take on larger mustelid surnames as well."
  },
  {
    name: "Dove",
    folder: "Columbids",
    size: "Medium-sized",
    timeOfDay: "Diurnal",
    sociability: "Flocking but nesting separately",
    preliminaryStats: { charm: 6, intrepidity: 2, pother: 4, sense: 3 },
    innatePeculiarities: ["Head for Heights", "Speediness", "Wings"],
    riverbankSortDescription: "Doves are gregarious and love company. They usually live in cottages or tree houses, but there was a Victorian Columbid fad for stilt houses with beautifully tended gardens beneath them.",
    ordinarySortDescription: "Doves are widespread throughout the British Isles. They are ground foragers who prefer grains, young leaves, and vegetables, but they eat a wide variety of foods. Both parents are involved in raising their young, called squabs.",
    notes: "Common Columbid surnames: Aster, Columbia, Culver, Dewer, Dove, Dule, Lavender, Pellis, Pigeon, Pidgeon, Tauber, Touffle. Notes: All Columbids have Wings, but not every Dove chooses to fly."
  },
  {
    name: "Pigeon",
    folder: "Columbids",
    size: "Medium-sized, slightly larger than a Dove",
    timeOfDay: "Diurnal",
    sociability: "Flocking but nesting separately",
    preliminaryStats: { charm: 6, intrepidity: 2, pother: 4, sense: 3 },
    innatePeculiarities: ["Head for Heights", "Speediness", "Wings"],
    riverbankSortDescription: "Pigeons are gregarious and love company. They usually live in cottages or tree houses, but there was a Victorian Columbid fad for stilt houses with gardens beneath them, some now replaced with cheerful heaps of jetsam.",
    ordinarySortDescription: "Pigeons are widespread throughout the British Isles. The common pigeon, stock dove, collared dove, and wood-pigeon all appear in southern and central England, and both parents help raise their squabs.",
    notes: "Common Columbid surnames: Aster, Columbia, Culver, Dewer, Dove, Dule, Lavender, Pellis, Pigeon, Pidgeon, Tauber, Touffle. Notes: All Columbids have Wings, but not every Pigeon chooses to fly."
  },
  {
    name: "Dormouse",
    folder: "Rodents",
    size: "Small",
    timeOfDay: "Usually nocturnal",
    sociability: "Solitary",
    preliminaryStats: { charm: 2, intrepidity: 5, pother: 4, sense: 4 },
    innatePeculiarities: ["Deft", "Climbing", "Nibbly", "Thrives Underground", "Winter Torpor"],
    riverbankSortDescription: "Most sorts of Rodent prefer the habitat associated with their ordinary cousins, but all seem happy in small houses and cottages, whether bermed or not. Everyone prefers evenings and the nighttime, though that mostly manifests as needing more tea or coffee in the mornings.",
    ordinarySortDescription: "Dormice look like oversized mice, pale grey with large black eyes. They are forest dwellers and purely herbivorous. Ordinary dormice hibernate during the winter.",
    notes: "For Mice and Dormice: Boxwood, Buttercup, Fennel, Hollyhock, Ivy, Lavender, Nettle, Rose, Snowdrop, Tearose. Notes: Rodents are susceptible to dental problems, and dormice are especially prone to winter sluggishness outdoors."
  },
  {
    name: "Mouse",
    folder: "Rodents",
    size: "Small",
    timeOfDay: "Usually nocturnal",
    sociability: "Colonies",
    preliminaryStats: { charm: 2, intrepidity: 5, pother: 4, sense: 4 },
    innatePeculiarities: ["Deft", "Climbing", "Ferocity", "Nibbly", "Thrives Underground"],
    riverbankSortDescription: "Most sorts of Rodent prefer the habitat associated with their ordinary cousins, but all seem happy in small houses and cottages, whether bermed or not. Everyone prefers evenings and the nighttime, though that mostly manifests as needing more tea or coffee in the mornings.",
    ordinarySortDescription: "House mice, wood mice, and field mice each prefer the habitat to which their name refers. House mice are grey; their country cousins are golden-brown. They live in colonies and adapt to houses, fields, and barns with ease.",
    notes: "For Mice and Dormice: Boxwood, Buttercup, Fennel, Hollyhock, Ivy, Lavender, Nettle, Rose, Snowdrop, Tearose. Notes: Rodents are susceptible to dental problems."
  },
  {
    name: "Rat",
    folder: "Rodents",
    size: "Small",
    timeOfDay: "Usually nocturnal",
    sociability: "Colonies",
    preliminaryStats: { charm: 2, intrepidity: 5, pother: 4, sense: 4 },
    innatePeculiarities: ["Deft", "Climbing", "Ferocity", "Nibbly", "Thrives Underground"],
    riverbankSortDescription: "Most sorts of Rodent prefer the habitat associated with their ordinary cousins, but all seem happy in small houses and cottages, whether bermed or not. Everyone prefers evenings and the nighttime, though that mostly manifests as needing more tea or coffee in the mornings.",
    ordinarySortDescription: "Brown rats live in tunnel systems called colonies in and near towns and farms. They have coarse grey-brown fur and a thick bare tail, and many RiverBank Rats adopt Norwegian surnames because Brown Rats arrived after earlier Black Rats.",
    notes: "For Rats: Asker, Bang, Eikrem, Fjellheim, Haland, Maurtviet, Skelly, Tyrie. Notes: Rodents are susceptible to dental problems."
  },
  {
    name: "Water Rat",
    folder: "Rodents",
    size: "Small",
    timeOfDay: "Usually nocturnal",
    sociability: "Solitary",
    preliminaryStats: { charm: 2, intrepidity: 5, pother: 4, sense: 4 },
    innatePeculiarities: ["Aquatic", "Deft", "Climbing", "Nibbly", "Thrives Underground"],
    riverbankSortDescription: "Most sorts of Rodent prefer the habitat associated with their ordinary cousins, but all seem happy in small houses and cottages, whether bermed or not. Everyone prefers evenings and the nighttime, though that mostly manifests as needing more tea or coffee in the mornings.",
    ordinarySortDescription: "Water rats live in reed beds and burrows beside slow, clear rivers and lakes, sometimes with an underwater entrance. They have glossy dark-brown fur and a fur-covered tail.",
    notes: "For Water Rats: Campagnol, Campbell, Estampe, Harvey, Livermore, Wilmouse. Notes: Rodents are susceptible to dental problems."
  },
  {
    name: "Duck",
    folder: "Waterfowl",
    size: "Medium or small, depending on the duck",
    timeOfDay: "Crepuscular",
    sociability: "Flock",
    preliminaryStats: { charm: 3, intrepidity: 3, pother: 6, sense: 3 },
    innatePeculiarities: ["Aquatic", "Head for Heights", "Wings"],
    riverbankSortDescription: "Waterfowl prefer houses above ground near water, and their appearance generally reflects that of their ordinary counterparts. Ducks in particular range from small to medium-sized and gather readily in flocks.",
    ordinarySortDescription: "Wild ducks are most prevalent, especially in winter; teals, mallards, and pintails are commonest in south and central England. Ducks prefer living near calm water and graze or dabble for seeds and water plants.",
    notes: "For Ducks: Cane, Dibble, Dabble, Duck, Ende, Entler, Green, Tieche. Notes: All Waterfowl have Wings, but not every Duck chooses to fly."
  },
  {
    name: "Goose",
    folder: "Waterfowl",
    size: "Large",
    timeOfDay: "Diurnal",
    sociability: "Flock",
    preliminaryStats: { charm: 3, intrepidity: 3, pother: 6, sense: 3 },
    innatePeculiarities: ["Aquatic", "Ferocity", "Head for Heights", "Wings"],
    riverbankSortDescription: "Waterfowl prefer houses above ground near water, and their appearance generally reflects that of their ordinary counterparts. Geese are large, sociable, and happy near calm water.",
    ordinarySortDescription: "Only one wild goose frequents the south of England in this period: the Canada goose, introduced in the seventeenth century. Canada geese are large black-and-white birds with long necks and they eat plants, grasses, seeds, and berries.",
    notes: "For Geese: Gansett, Hannay, Neckan, Ovey, Whey, Waywand. Notes: All Waterfowl have Wings, but not every Goose chooses to fly."
  },
  {
    name: "Heron",
    folder: "Waterfowl",
    size: "Large",
    timeOfDay: "Diurnal",
    sociability: "Flock",
    preliminaryStats: { charm: 3, intrepidity: 3, pother: 6, sense: 3 },
    innatePeculiarities: ["Aquatic", "Head for Heights", "Wings"],
    riverbankSortDescription: "Waterfowl prefer houses above ground near water, and their appearance generally reflects that of their ordinary counterparts. Herons are large and dramatic, with the dignified bearing of their ordinary cousins.",
    ordinarySortDescription: "Herons are large grey birds with exceptionally long necks and legs. Dramatic black stripes lead from their eyes back to a crest they raise when threatened or protecting their nest. These carnivores eat what they can catch near calm water.",
    notes: "For Herons: Ardea, Eager, Eger, Grey, Langhalsey, Rider. Notes: All Waterfowl have Wings, but not every Heron chooses to fly."
  }
];

const SORT_ORDER = SORTS.map((sort) => sort.name);
const PETS = [
  {
    name: "Bee",
    folder: null,
    description: "Body length two to four inches. Pet bees are gregarious and deeply affectionate. They pine if left alone for long, so rich bee-owners often hire bee-maids to keep them company. If you let them off their leash outside, pet bees bring pollens back to their beds and build small wax hives there, producing a bit of honey, though no loving bee-owner would consider removing the wax or the honey. Compare to a bichon frise dog.",
    traits: [
      "Flying: Bees can fly.",
      "Hive-building: Given the opportunity, bees create a small beehive and make honey. A hive can be an attractive and sweet-smelling feature in the corner of a room."
    ]
  },
  {
    name: "Cricket",
    folder: null,
    description: "Body length three to four inches. Ancient and well-loved pets, crickets are plump and black with prominent feelers and hind legs. People say their singing brings luck to a household. Compare to a talkative tabby cat.",
    traits: [
      "Chirping: Once per session, when the gamemaster determines, roll 1d6. On a 1-2, the cricket begins singing and does not stop until a cloth is placed over it or its cage."
    ]
  },
  {
    name: "Damselfly",
    folder: null,
    description: "Wingspan five inches. Damselflies look quite like dragonflies, with extremely long, slender bodies, four narrow wings mounted toward the front, and large, widely spaced eyes. They are not very good fliers but nevertheless hunt other insects; they sometimes stray from their owners if they see a really juicy-looking ant. However, they can be quite protective. Compare to a greyhound or deerhound.",
    traits: [
      "Diurnal: If night falls when a damselfly is out and about, it collapses and has to be carried or put to bed somewhere.",
      "Fluttering: Damselflies can flutter.",
      "Water averse: If they are caught in rain or snow, roll 1d6. On a 1-2 they manage to pull out of their leash or otherwise escape somewhere nearby out of the weather, such as the branches of a tree."
    ]
  },
  {
    name: "Millipede",
    folder: null,
    description: "Body length one to six inches. Long and shiny black, millipedes have many, many legs that give them a rippling motion as they walk. When frightened, they curl up into a spiral to protect their bellies; if they are further bothered, they eject a nasty and very smelly fluid. Millipedes make no emotional connections, but their owners cannot be convinced of this and all too often dote on them and bring them everywhere. Compare to, well, millipedes.",
    traits: [
      "Noxious smells: When the gamemaster thinks something has risen to the level of bothering a millipede, roll 1d6. On a 1-3, the millipede curls up tightly for ten minutes. If someone moves or jostles the millipede during this period, it expels a vile-smelling liquid or vapor that gives everyone within a few feet a -1 penalty on all Sway deeds and deeds of Discretion until they can bathe; if they are preparing food, the smell affects the flavor."
    ]
  },
  {
    name: "Pill Bug",
    folder: null,
    description: "Body length three to four inches. Pill bugs, also known in England as woodlice, potato bugs, and Parson's pigs, and elsewhere as roly-polies and doodlebugs, are tiny terrestrial crustaceans. They are best known for rolling their bodies into tight balls. They are an intellectual's pet and a special favorite of paleontologically minded Animals. Many pill bug owners train them to curl up, then roll them gently, an activity the pill bugs seem to enjoy and even encourage. Compare to rabbits, especially rabbits trained to run obstacle courses.",
    traits: [
      "Conglobulation: When the gamemaster thinks something has risen to the level of bothering a pill bug, roll 1d6. On a 1-3, the pill bug curls up tightly for ten minutes."
    ]
  },
  {
    name: "Snail",
    folder: null,
    description: "Shell measures up to four inches high. Developed from the common garden snail, pet snails have been bred to improve the beauty of their shells, and shades of green, purple, blue, grey, and cream are common. They move extremely slowly, so most snail owners invest in charming snail-baskets and carry them about. Compare to any small dog carried around all the time, or a ragdoll cat.",
    traits: [
      "Slime trail: Snails can leave an embarrassing trail of slime, so many owners carry slime-linens, beautifully embroidered whitework cloths, for tidying up."
    ]
  },
  {
    name: "Spider",
    folder: null,
    description: "Body length one to two inches. Four-spotted orb spiders have become the most common novelty pets among Animals, the equivalent of a hamster or guinea pig. They have round, reddish bodies with white dots and lines, and build what most of us think of as the classic spider web. They are the least creepy-looking of the British spiders.",
    traits: [
      "Webs: Owners should find an outdoor space for their orb spider, so it can spin its web somewhere other than the parlor."
    ]
  },
  {
    name: "Cockchafer",
    folder: "Beetles",
    description: "Body length three to four inches. This chunky and clumsy but pleasant-looking beetle has fanlike antennae, chestnut-brown wing covers, and a black body. The cockchafer is not for everyone, because when surprised or annoyed it makes an extremely loud buzzing sound. Compare to any medium-sized noisy mutt.",
    traits: [
      "Buzz: Whenever the gamemaster thinks something has risen to the level of bothering a cockchafer, roll 1d6. On a 1-2, the cockchafer begins a deafening buzz and does not stop until someone placates it or removes it from the area.",
      "Flying: Beetles can fly."
    ]
  },
  {
    name: "Ladybird",
    folder: "Beetles",
    description: "Body length two to three inches. The ladybird, or ladybug, is one of the most popular pets of all, and there was a time not so many years ago when every young Animal miss had a ladybird companion, with leashes coordinated to every gown. They have a wide variety of spot-patterns. Compare to a King Charles spaniel or cocker spaniel.",
    traits: [
      "Flying: Beetles can fly."
    ]
  },
  {
    name: "Stag Beetle",
    folder: "Beetles",
    description: "Body length five to eight inches. Stag beetles are the mastiffs of the insect world: large, dark, intimidating-looking beetles with massive, antler-shaped jaws, but they are calm, amiable companions. The gigantic jaws look impressive, but the beetles do not have enough strength to injure anyone with them. Compare to an English bulldog raised as a pet.",
    traits: [
      "Flying: Beetles can fly."
    ]
  },
  {
    name: "Fritillary",
    folder: "Butterflies",
    description: "Wingspan three to four inches. A fritillary is a small butterfly with vivid orange, yellow, and white wings, and lavish black, sometimes white, speckling that can produce a surprising stained-glass effect. They are fast, busy, and active. Compare to a Shetland sheepdog or Australian shepherd.",
    traits: [
      "Diurnal: If night falls when a butterfly is out and about, it collapses and has to be carried or put to bed somewhere.",
      "Fluttering: Butterflies can flutter.",
      "Water averse: If they are caught in rain or snow, roll 1d6. On a 1-2 they manage to pull out of their leash or otherwise escape somewhere nearby out of the weather, such as the branches of a tree."
    ]
  },
  {
    name: "Monarch",
    folder: "Butterflies",
    description: "Wingspan six inches. An American import, the monarch is one of the few foreign pets common among British Animals. This large butterfly has black veins and white spots over an orange base color. They are extremely expensive and scarce. As pets, they are not over-bright. Compare to a golden Lab.",
    traits: [
      "Diurnal: If night falls when a butterfly is out and about, it collapses and has to be carried or put to bed somewhere.",
      "Fluttering: Butterflies can flutter.",
      "Water averse: If they are caught in rain or snow, roll 1d6. On a 1-2 they manage to pull out of their leash or otherwise escape somewhere nearby out of the weather, such as the branches of a tree."
    ]
  },
  {
    name: "Skipper",
    folder: "Butterflies",
    description: "Wingspan three inches. A skipper is a compact butterfly, usually in shades of orange, gold, and brown with black and white flecks and black wing edges. They are quite aggressive. Compare to a Jack Russell terrier.",
    traits: [
      "Diurnal: If night falls when a butterfly is out and about, it collapses and has to be carried or put to bed somewhere.",
      "Fluttering: Butterflies can flutter.",
      "Water averse: If they are caught in rain or snow, roll 1d6. On a 1-2 they manage to pull out of their leash or otherwise escape somewhere nearby out of the weather, such as the branches of a tree."
    ]
  },
  {
    name: "The Aristocrats",
    folder: "Butterflies",
    description: "Wingspan four to five inches. The Aristocrats are Britain's largest and most beautiful butterflies. They can have dramatic eyespots, bands of color, and elaborate wing edges. Perhaps the most popular as a pet is the Camberwell beauty, which has chocolate-brown wings fringed with white and a line of blue dots. Compare to glamorous dogs such as the Afghan hound and saluki, or a Persian cat.",
    traits: [
      "Diurnal: If night falls when a butterfly is out and about, it collapses and has to be carried or put to bed somewhere.",
      "Fluttering: Butterflies can flutter.",
      "Water averse: If they are caught in rain or snow, roll 1d6. On a 1-2 they manage to pull out of their leash or otherwise escape somewhere nearby out of the weather, such as the branches of a tree."
    ]
  },
  {
    name: "Emerald",
    folder: "Moths",
    description: "Wingspan four inches. The emerald is an exceptionally beautiful geometer moth of pale blue-green laced with delicate white traceries. It flies in loops, tipping over entirely as it advances. Compare to a shih tzu or other ornamental lapdog.",
    traits: [
      "Fluttering: Moths can flutter.",
      "Water averse: If they are caught in rain or snow, roll 1d6. On a 1-2 they manage to pull out of their leash or otherwise escape somewhere nearby out of the weather, such as the branches of a tree."
    ]
  },
  {
    name: "Hawkmoth",
    folder: "Moths",
    description: "Wingspan six inches. All the many varieties of hawkmoth have fat pointed bodies and comparatively narrow wings. Animal readers of Mary Shelley and the Gothics have a special preference for the death's-head hawkmoth, which has actual claws and quite an exciting skull pattern on its back, though most varieties are not nearly so dramatic. As pets, they are friendly, if a little stubborn. Compare to a Dobermann pinscher or Rottweiler.",
    traits: [
      "Fluttering: Moths can flutter.",
      "Squeaks: Many varieties of hawkmoth make audible squeaks when they feed. When characters are eating, roll 1d6. On a 1-3, the moth starts squeaking and will not stop until either someone removes it from the area or gives it honey as a treat.",
      "Water averse: If they are caught in rain or snow, roll 1d6. On a 1-2 they manage to pull out of their leash or otherwise escape somewhere nearby out of the weather, such as the branches of a tree."
    ]
  }
];
const PET_ORDER = PETS.map((pet) => pet.name);
const OBJECTS_OF_DESIRE = [
  ["Bicycle", "This makes you faster when running errands, visiting friends, and similar errands.", 1],
  ["Camera", "A nice Animal-sized camera, plus the materials and space for a small darkroom.", 1],
  ["Coal Stove for Heating", "A closed iron stove can replace an open woodfire in your hearth. It is much cleaner, warmer, and easier to keep lit, but you do lose a little charm.", 1],
  ["Flight", "You can fly only if you have the Wings innate peculiarity, the Flying knack, and spend a token. Many winged Animals choose not to fly, considering it a bit low class.", 1],
  ["Gas Laid In", "You have gas in the kitchen and even gas-jet lighting in your home. If you do not have this, you are probably using wood- and coal-fires, lamps, and candles. Gas grants a +1 bonus to cooking and baking and nighttime Clever Paws deeds in your house.", 3],
  ["Gramophone", "You have a stack of records, selected from classical, dance-band, opera, popular sentimental songs, ragtime, or spoken word, and a wind-up Victrola phonograph with a beautiful flower-shaped horn to play them.", 1],
  ["In-house Telephone", "If you do not have a telephone, you can always make and receive telephone calls at the Postal Service/Stores, or rely instead on letters and telegrams.", 3],
  ["Motor-boat (Very Small)", "This makes it easier to cross the River and much faster to travel along it. For more information, see the Boats sidebar in Chapter Four.", 5],
  ["Motor-cycle", "This makes you much faster when running errands, visiting friends, and similar tasks. This motor-cycle is smaller than a Human one but will seem large proportionally to the Animal riding it. One can ride it along some, but not all, rights of way depending on the gamemaster's assessment of the path and recent weather, though this would be illegal.", 5],
  ["Musical Instrument (Large)", "Animal-scaled spinet piano, harpsichord, pump-organ, harp, and similar instruments.", 2],
  ["Musical Instrument (Odd)", "Animal-scaled tympani, koto, Hardanger fiddle, and similar instruments.", 2],
  ["Musical Instrument (Small)", "Animal-scaled lute, guitar, recorder, and similar instruments.", 1],
  ["No Appalling Relative", "Rather than adding a thing to your life, this choice removes one: you have one fewer Appalling Relative. However, if you have the Is Dependent peculiarity, you must retain at least one. You can select this option only during character generation; after this, you have no power to remove Appalling Relatives.", 4],
  ["Pet", "If you have the Has a Pet peculiarity, you must expend a token to acquire a pet.", 1],
  ["Postal Home Delivery", "Your mail is delivered to your home up to twice a day, before nine in the morning and in the early evening. Otherwise, you pick up your mail at the Postal Service/Stores or from a neighbor who has home delivery.", 1],
  ["Rowboat or Punt", "This small boat makes it easy to cross the River and faster to travel along it. For more information, see the Boats sidebar in Chapter Four.", 3],
  ["Sailing Boat", "This very small ketch or catboat makes it easy to cross the River and faster to travel along it. See the Boats sidebar in Chapter Four.", 3],
  ["Sewing Machine", "This device makes you faster and better at sewing clothes, sails, and things for the home and elsewhere, giving you a +1 bonus to sewing deeds when you use the machine.", 1],
  ["Typewriter", "This device makes you faster and better at writing letters and writing in general, giving you a +1 bonus to deeds involving writing when you use the typewriter.", 1],
  ["Vision Aids", "You have spectacles, eyeglasses, a pince-nez, or monocle that improves your eyesight and negates any negative effects of the Weak Vision innate peculiarity.", 1],
  ["Wardrobe of Exceptional Nattiness", "You have acquired a beautiful collection of flattering clothing that gives you a +1 bonus on Sway deeds involving strangers and Humans.", 1],
  ["Well-stocked Workroom", "Select a type of workroom: boating, ceramic, garage, home-owning, kitchen, machinery, metalworking, painting, sculpture, woodworking, and similar specialties. This includes not just tools but also the bits and bobs that can prove useful for improvising: cogs, old iron, extra canvas, planking, glass panes, unusual spices, or whatever kinds of stuff your particular type of workroom needs.", 2]
].map(([name, description, tokenCost]) => ({ name, description, tokenCost }));
const OBJECTS_OF_DESIRE_ORDER = OBJECTS_OF_DESIRE.map((entry) => entry.name);
const HOMES = [
  {
    name: "Underground Burrow",
    folder: "Type",
    description: "Some Animals prefer living underground, though still with amenities. These burrows are almost invariably comfortable, dry holes with multiple rooms connected by meandering corridors. Animals living underground take care to make their home as welcoming and pleasant for their aboveground friends as it is for themselves, with high ceilings, good lighting, and pleasant inglenooks."
  },
  {
    name: "Bermed",
    folder: "Type",
    description: "Many Animals whose ordinary counterparts prefer underground living have found a pleasant compromise in half-buried homes. The lower portion of the house is surrounded by ramped earth or dug into the ground, with a conventionally constructed upper portion above. Floors are usually stone, and sometimes the lower walls are as well, though the owner can cover them with wainscoting or paint them a cheerful white. The windows of a bermed home usually open at waist height for those inside but at ground level on the outside, which makes for a never-ending battle against insects and ordinary mice sneaking in."
  },
  {
    name: "Conventional/Aboveground",
    folder: "Type",
    description: "The basic construction of these Animal homes strongly resembles Human buildings, just smaller. Cottages or houses, though usually stone, can be brick or half-timber and plaster, with slate or thatch roofs."
  },
  {
    name: "Tree House",
    folder: "Type",
    description: "Some Animals prefer living among the boughs and construct charming cottages around the trunks of trees, relying on the major boughs for support. Tree houses often have fewer rooms than underground, bermed, or conventional houses; expansion consists of adding individual rooms as separate structures scattered elsewhere in the tree, with ladders and stairs connecting them. Animals living in tree houses often have a secure staircase or ladder leading to their front door, to help their ground-dwelling friends feel welcome."
  },
  {
    name: "Stilt House",
    folder: "Type",
    description: "Stilt houses were quite common in earlier centuries, especially among Waterfowl and woodland Animals concerned about wolves and wildcats, back when such beasts still roamed Britain's forests. The houses typically stood six feet off the ground, often with an ornamental moss- or rock-garden beneath them. They are almost always no more than a room or two, constructed of stone or wood. Historically, they had a ladder that the owner could raise for safety when at home, but stairs have replaced them. A new-built stilt house would be seen as nostalgic and quite odd."
  },
  {
    name: "Bole House",
    folder: "Type",
    description: "The least common house type because it is the least convenient, a bole house is built into the trunk, or bole, of an oak, elm, chestnut, or other large tree. Often these are the trunks of dead trees, sometimes left artistically jagged at the top; in other cases, rooms, windows, and doors are carved carefully into the heartwood of a living tree. The largest bole houses are only a few small rooms, but a single room or two with a kitchen outbuilding on the ground nearby is more common."
  },
  {
    name: "Cottage/Cot",
    folder: "Size",
    description: "Cottages or cots are at most three rooms: a kitchen, a sitting room, and a bedroom, which is sometimes at the top of a ladder or staircase, under the eaves."
  },
  {
    name: "House",
    folder: "Size",
    description: "Houses are one or two stories high with four to six rooms: a kitchen, a dining room, a parlor, perhaps a library or study, and a few bedrooms, one dedicated to guests. The term can also be used to mean homes in general."
  },
  {
    name: "Manse/Hall",
    folder: "Size",
    description: "Manses and halls can be very large indeed, with everything from butler's pantries, where the silver is kept, to muniment rooms. They require a large staff to maintain and are uncommon for Animals, who usually do not want servants. A character with a manse or hall needs the Is Comfortably Off peculiarity; they will find that Things Going Wrong with the House inspires a steady stream of troublesome situations and Betweentimes problems."
  },
  {
    name: "Room/Flat",
    folder: "Size",
    description: "Rooms or flats are uncommon for Animals on the River Bank, though not for London Animals. Rooms are available at the Chestnut, the Cote, and the Nose & Tail. It is possible that a character might let, or rent, a room in their home. Appalling Relatives, who are always rich, and other nonplayer characters may have enormous Stately Homes and castles complete with butlers, head gardeners, chauffeurs, and the rest."
  }
];
const HOME_ORDER = HOMES.map((entry) => entry.name);
const KNACK_DEFAULTS = [
  {
    name: "Useful",
    category: "knack",
    description: "Useful. +1 to deeds that make things directly easier for others; unlocking a door for someone with their paws full, making tea for an aged relation, etc."
  }
];
const NPC_ANIMALS = [
  {
    name: "Madame Anthemia (Anna Flittermouse)",
    npcCategory: "animal",
    description: "Middle-aged Bat",
    role: "Spiritualist and fortune-teller; gives seances, cartomancy, aura readings, and the like.",
    foeLevel: "Tiresome (+2)",
    homeLife: "Lives at Reed Cottage with her dear Mouse friend Erminia Cupcookie.",
    particulars: "Spooooky; above practical matters; kind; calls her spiritualist work her \"studies\"; wears dramatic kaftans in reds and purples, a turban, and arcane jewelry. Bats generally have exceptional hearing and weak eyesight. While she has wings, she would never consider flying.",
    notes: "Madame Anthemia, perhaps the most eccentric member of a neighborhood notable for its eccentrics, is a popular speaker on spiritualism, astrology, and anomalous phenomena, and feels convinced that she once spoke to the ghost of Cleopatra, who was actually a Rabbit. In encounters with characters, she always senses auras, \"sees\" spirits and passes on their comments, and the like. When out and about, she has a tendency to stop dramatically and say things like, \"I sense a great power ...\"\n\nUntil a few years ago, Madame Anthemia was Miss Anna Flittermouse, fifth daughter of a London porter. Madame Anthemia and Madame Sansonnet hate one another, each feeling they have sole right to the honorific."
  },
  {
    name: "Mrs Derrina Fiddlefie Arbus (Mrs Howard Arbus)",
    npcCategory: "animal",
    description: "Middle-aged Squirrel",
    role: "Proprietress of the Stores at the Chestnut",
    foeLevel: "Tiresome (+2) about costs and the paying of bills",
    homeLife: "Mrs Arbus lives in the Chestnut, a rambling tree house around which the Postal Service/Stores was constructed, with her husband, the likable but feckless Howard, an obsessed fly-fisher and tier of flies, and an ever-changing number of offspring, relatives, and family friends.",
    particulars: "Rude, but with a heart of gold; quick and efficient; wears tinted spectacles at all times but no one knows why; heavyset.",
    notes: "Together, Derrina and Howard run the Stores, but she and several of the younger Squirrels operate the shop, while he manages the money and finds sources for Animal-sized pins and scranlets and such. She leaves every summer for two weeks to visit the seaside with her Fiddlefie sisters and get her teeth filed, as they are always growing crooked. Mrs Arbus comes from the Hills: Any character who wants to know anything about the Hills likely can get the answer here."
  },
  {
    name: "Mr Jerome K. Fennel",
    npcCategory: "animal",
    description: "Getting on a bit, Dormouse",
    role: "House-proud, very good with Humans",
    foeLevel: "Commonplace (+1) for most things, but tiresome (+2) to avoid him talking about the house for much too long or to avoid being roped into a card game when he is on the prowl for players.",
    homeLife: "Lives at the delightfully Gothic Hatta House with his friend, Miss Ina Haigha. They also have a foot-Mouse, Sammy, and a cook, Mrs. Streeg.",
    particulars: "Pompous; exuberant; obsessed with Hatta House and can talk about it endlessly; very properly attired except for his rather loud waistcoats and ties.",
    notes: "Jerome plays a lot of Auction Bridge. Miss Haigha loves to summon Animals to the house for an afternoon of cards; Jerome participates willingly because, once they have arrived, he can tell the guests all about the house. If Miss Haigha has trouble finding enough players for a foursome, he scours the countryside for players.\n\nIf Animals need to conduct negotiations with Villagers or other Humans, Jerome is very deft in his interactions with them.\n\nJerome has Winter Torpor, as Dormouse characters do. During the winter season, he can be found asleep in the most unlikely places.\n\nNear the start of a session, the gamemaster rolls 1d10 for random encounters. On the roll of a 3, Jerome encounters the characters at some point in the session and demands that one of them come to Hatta House immediately, as a tiresome foe; if the first character dodges the demand, Jerome asks each character until someone either agrees or fails the deed challenge and gets dragged away from the group. Should everyone succeed, he leaves in a dudgeon, but there is a twenty-five percent chance Miss Haigha herself comes out to find you."
  },
  {
    name: "Mr Timple Arbus",
    npcCategory: "animal",
    description: "Quite young Squirrel",
    role: "Assists Miss Tasson at the Postal Service in managing the telephone and telegraph systems.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Nephew of Mrs Derrina Fiddlefie Arbus. Staying at the Chestnut's treehouse near his cousins.",
    particulars: "Outdoorsy; wears a vest ingeniously covered with pockets; proud of his luxurious ear-tufts and tail; comes from the North.",
    notes: "Often seems to have the perfect item for any task in one of his many pockets; a character approaching Timple with a request to borrow a random small item has a fifty percent chance of him having it ready to hand.\n\nNear the start of a session, the gamemaster rolls 1d10 for random encounters. On the roll of a 4, Timple or one of his Arbus cousins encounters the characters at some point in the session on the way to deliver a telegram and tries to derail them with new gossip."
  },
  {
    name: "Miss Erminia Cupcookie",
    npcCategory: "animal",
    description: "Adult Mouse",
    role: "The best seamstress in the area; quite famous for her tatting",
    foeLevel: "Commonplace (+1)",
    homeLife: "Lives at Reed Cottage with her dear Bat friend Madame Anthemia and a pet millipede.",
    particulars: "Makes and mends; nearsighted; easily upset; passionate about gardening.",
    notes: "Miss Cupcookie has an entirely modern sewing machine, the Sandle Dressmaker, which she delights in showing off. She is always out and about, hanging flyers for Madame Anthemia's seances, doing the shopping, and delivering her beautiful lace to buyers in the Village and even Town.\n\nMiss Cupcookie's loyal pet millipede, Flush, goes everywhere with her. A character approaching her has a fifty percent chance of getting bitten, causing the character to feel a bit off and take a -1 penalty to all deeds until the next Haphazardry cycle."
  },
  {
    name: "Mr Albus Grandry",
    npcCategory: "animal",
    description: "Getting on a bit, Rabbit",
    role: "Owner of one of the most important houses in the area; a fusspot, always complaining in the most entertaining way.",
    foeLevel: "Dire (+3).",
    homeLife: "Lives at Littus House, the site of an ancient Roman landing-place. His staff includes a maid, Mary Ann Persimmon, and the gardener and odd-jobs Lizard, Bill. From November to February, he is tormented by an extended visit from his horrid great-aunt, Dame Fina Grandry.",
    particulars: "Absent-minded; very nearsighted and refuses to wear spectacles; old-fashioned and formal; a combination of amiable and domineering; exceptionally proud of his Human-sized pocket watch, said to have been a gift to his many-times-great-grandfather by a grateful Prince Regent. Rabbits are generally noted for their exceptional hearing and their speediness, but it has been many years since he has run anywhere.",
    notes: "When out for his regular round of formal calls on his posher neighbors, Mr Grandry is forever leaving things behind and sending random Animals, and even Humans, to fetch them, without noticing that they are not Mary Ann. He often goes into Town for a stay at his club, the Lapine."
  },
  {
    name: "Mrs Celestine Grey",
    npcCategory: "animal",
    description: "Middle-aged Pigeon",
    role: "Respectable widow, calm and elegant",
    foeLevel: "Tiresome (+2)",
    homeLife: "Lives at the Cote with Mrs Jammy Porlock, a busybody Goose.",
    particulars: "Frequent correspondent with her brother in Bath and daughters in Canada.",
    notes: "Mrs Grey can fly, but she does not like to be seen doing so, as she considers it not entirely respectable."
  },
  {
    name: "Miss Ina Haigha",
    npcCategory: "animal",
    description: "Elderly Hare",
    role: "Resident of that really very odd place, Hatta House. It's surprising that she isn't afraid to live so close to the Wild Wood!",
    foeLevel: "Miss Haigha is someone's Appalling Relative, her hapless great-niece Georgina Marris, but Georgina does not live here. Locally, Miss Haigha is a tiresome (+2) foe, unless you have rejected her invitation to play cards; then she becomes dire (+3).",
    homeLife: "Lives at Hatta House with her friend, Mr Jerome K. Fennel, a foot-Mouse, Sammy, and a cook, Mrs. Streeg.",
    particulars: "Very thin and tall, even for a Hare; prides herself on her rudeness; obsessed with her pet luna moths Anacreon, Damon, Enkidu, Nimrod, Pyramus, Pythias, and Thisbe; dresses like a mid-Victorian; wears pince-nez.",
    notes: "Miss Haigha feels passionate about Auction Bridge, but it annoys her that she has so much trouble coming up with a foursome. She often summons Georgina to stay, but this is still insufficient, so on most days, she sends Mr Fennel or Sammy around to anyone she can think of, ordering them to appear for cards and tea. If you do not appear, she may track you down herself."
  },
  {
    name: "Miss Eliza van der Hedgepig",
    npcCategory: "animal",
    description: "Adult Hedgehog",
    role: "A very proper Animal not accustomed to madcap goings-on.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Lives alone at Destiny!, except when visited by her various relations.",
    particulars: "Dainty and enormously polite; always busy sewing, knitting, fixing things, gardening, making jams to sell, &c.",
    notes: "If present when a character succeeds at a deed by three points or more above its target number, Miss van der Hedgepig swoons with excitement. She recovers in a few minutes, or immediately if a character uses the First Aid knack; until then she remains dead to the world.\n\nMiss Eliza has Winter Torpor, as Hedgehog characters do. During the winter season, one might find her sleeping in random places, having dropped off in the middle of a task."
  },
  {
    name: "Comrade Hiver (Mr Clive Hiver)",
    npcCategory: "animal",
    description: "Adult Otter",
    role: "Local oddity. Animals tend to take people as they come, so folks treat his Socialism as a minor eccentricity, on par with always wearing a flower in one's buttonhole or using Elizabethan English in everyday discourse.",
    foeLevel: "Tiresome in Sway deeds, as he talks endlessly.",
    homeLife: "Comrade Hiver lives alone at Red Square Pen up the River, but spends most of his waking hours either at the boozing ken in the Wild Wood, or at By-the-water, his sister Jane Hiver's cottage.",
    particulars: "Never stops talking; speaks of himself in the third person; obsessed with Socialism, but personally idle; always wears a floppy red bow instead of a cravat and a flat cap.",
    notes: "Comrade Hiver loves to say he's a Communist based on his fundamental misunderstanding of the philosophy, which is that no one has to work, ever.\n\nIf a character attempts any Sway deed in Comrade Hiver's vicinity, whether directed at him or not, he inserts himself into the interaction, increasing the difficulty of the deed from easy to middling, middling to hard, or adding a +2 modifier to a hard deed. In addition, it requires a hard Sway deed to get rid of him; otherwise, he follows characters around until the Haphazardry cycle ends, offering erroneous advice and explaining how Socialism would make all this so much better."
  },
  {
    name: "Miss Jane Hiver",
    npcCategory: "animal",
    description: "Adult Otter",
    role: "Laundry, odd jobs: you can ask Jane to do anything, and she does it beautifully. Refreshingly normal sister to that odd Communist chap, Comrade Hiver.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Jane Hiver has a lovely low rambling home, By-the-water, on the south side of the River. Most of the time, several young female Animals live with her, called Jane Hiver's girls, town Animals who have fallen afoul of the law and been remanded to Jane for rehabilitation.",
    particulars: "Hard-working; of a planning disposition; usually seen in a neat blue-and-white striped pinafore; exceptionally clean and smelling always of lavender; quite small for her sort.",
    notes: "Jane Hiver's girls are usually petty thieves from London sent to her to learn a new trade. Jane almost always succeeds at training them, but for the first few weeks, the young thieves may steal from River Bankers or the Village if they have the chance. This thievery turns up in Betweentimes cards or as the gamemaster wishes. Characters can address it by talking directly to Jane and the thief in question, who generally repents."
  },
  {
    name: "Bill (Mr William Ives)",
    npcCategory: "animal",
    description: "Middle-aged Lizard",
    role: "Gardener and odd-jobs Lizard for Mr Albus Grandry; can be relied on to help out with almost anything, as he is incapable of saying no.",
    foeLevel: "Tiresome (+2) in the wintertime, as he often falls asleep in the middle of tasks and wakes up combative.",
    homeLife: "Bill works at Littus House, living in what used to be a Human storage shed, now a cottage.",
    particulars: "Speaks very slowly and reluctantly; gloomy; always tries to sidle away before anyone can ask him to do anything; however, he is highly competent at most tasks to do with gardening, light construction, and stone-laying.",
    notes: "Bill has Winter Torpor, as Lizard characters do. During the winter season, one might find him sleeping in random places, having dropped off in the middle of a task."
  },
  {
    name: "Mr Tom Marten",
    npcCategory: "animal",
    description: "Adult Weasel",
    role: "A hard-working farmer; if you are partial to a particular vegetable, he'll try to grow it for you.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Tom owns Musty Farm, where he lives and works with his wife, Rosey; three kits, Buttercup, Poppy, and Centaury; and three farm workers, Jem, Mike, and Colly.",
    particulars: "Pleasant but no-nonsense; industrious; a bit clumsy; good with equipment and machinery; very pale fur; spends more time interacting with Humans than most Animals.",
    notes: "Animals do not normally take to farming, but usually prefer their own gardens, ordering kippers and tinned hams and such from Human vendors; Tom is an exception. He has a successful small orchard and raises turnips, corn, maize, and hops. He experiments with raising common quail, which at seven inches long are about the size of farmyard geese to a small Human, but thus far Animals have been interested only in the eggs.\n\nTom owns a small motor-tractor, his pride and joy, the first in the neighborhood for Animals or Humans.\n\nIn the fall, Tom hosts a Harvesthome celebration for the Animals of the River Bank; by now this has evolved into an informal competition, as each Animal brings their best dish to share."
  },
  {
    name: "Mr Octavian Melius",
    npcCategory: "animal",
    description: "Getting on a bit, Heron",
    role: "Genial publican and co-proprietor of the Nose & Tail pub",
    foeLevel: "Tiresome (+2) if you fail to pay your tab off every month or if you get involved in loud arguments, a Sway deed, or fisticuffs, a deed of Valor, at the Nose & Tail.",
    homeLife: "Lives with his sister, Mrs Tivolia Miggle, in rooms upstairs from the Nose & Tail's taproom, along with their Hedgehog maid, Penny Plain.",
    particulars: "Goes along with whatever is said and changes his opinion according to his company; has delicate health he loves to talk about, which characters can counter by offering to buy him a hot-gin-and-lemonade; writes lyrics for comic operettas he sends to various composers and musical comedy troupes, so far without result. Always dressed neatly, with a green apron covering his clothing. Octavian has wings and has been known to fly, though his sister disapproves of it.",
    notes: "If you participate in any sort of verbal or physical altercation at the Nose & Tail, regardless of who started it, Octavian expels you as a tiresome foe. If you counter this, he summons as many staff and patrons as needed to outnumber your party by two to one, modifying your deed of avoiding the ejection, a deed of Discretion, with the as many again group foe modifier (+3); add a +1 modifier for extreme awfulness if Tivolia gets involved."
  },
  {
    name: "Mrs Tivolia Miggle",
    npcCategory: "animal",
    description: "Getting on a bit, Heron",
    role: "Co-proprietress and cook of the Nose & Tail pub",
    foeLevel: "Dire (+3) if you cause a ruckus or damage anything to do with the Nose & Tail",
    homeLife: "Lives with her brother, Mr Octavian Melius, in rooms upstairs from the Nose & Tail's taproom, along with their Hedgehog maid, Penny Plain.",
    particulars: "Rude; combative; stout, for a Heron, with slightly straggly feathers. Tivolia has wings but does not fly.",
    notes: "Tivolia seems a hard nut, but she is also a very successful poet who publishes her sentimental lyrics under multiple pseudonyms in ladies' journals and weekly magazines. When invited to give tea talks and lectures across England, she dons an outrageous and outmoded hat rather overwhelmed with bird-of-paradise feathers.\n\nIf you participate in any sort of verbal or physical altercation at the Nose & Tail and Octavian is unable to expel you, Tivolia joins in the effort, adding a +1 modifier for extreme awfulness to the group foe deed."
  },
  {
    name: "Miss Dahlia P. Mole",
    npcCategory: "animal",
    description: "Adult Mole",
    role: "A sensible and reliable friend to all; her neighbors are quite proud of her successful writing career.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Lives at Sunflower Cottage with Miss Laetitia Rabbit.",
    particulars: "A Lady Novelist with more than a dozen successful books to her name, all of the swashbuckling variety; moved here from the Hills; intelligent, practical, and somewhat impatient.",
    notes: "Many afternoons when the weather is fine, Miss Mole takes a jaunt around the River Bank environs on her bicycle. Characters might hear the latest news from encountering her, as the means to trigger a situation."
  },
  {
    name: "Peder Norgaard",
    npcCategory: "animal",
    description: "Adult Duck",
    role: "Famous landscape painter, jolly boater",
    foeLevel: "Commonplace (+1)",
    homeLife: "Lives at Klippehus, not far from Parlement Hill, where he is looked after by Emil Emilson. Foreign Animals often visit him.",
    particulars: "Danish and new to the neighborhood; would rather talk than listen, especially about Art; laughs a lot; loves bad weather and always goes out in it; exceptionally tall and thin, for a Mallard.",
    notes: "A famous artist, Peder came to England to paint the landscape beloved of the nineteenth-century painter John Constable; he packages up his work twice a year and takes it to a gallery in Town. He is well-liked in the area, as he seems ever cheerful and polite, even if you disturb him at his work. He gets more telegrams and letters than most Animals.\n\nHe often goes out painting or walking in the area, but he can be gone for days or weeks in his tiny sailboat, the Magge, which he keeps at the landing just upstream from the Wee Lock by the weir."
  },
  {
    name: "Miss Penny Plain",
    npcCategory: "animal",
    description: "Quite young Hedgehog",
    role: "Extremely nice and hardworking cook, and maid-of-all-work, at the Nose & Tail.",
    foeLevel: "Penny Plain's spines make her a dire foe if attacked in a deed of Valor or surprised.",
    homeLife: "Penny has a room upstairs at the pub but usually sleeps in the kitchen with an apron over her face, to keep an eye on the pantry.",
    particulars: "Never listens to what is said, even if she asked for information; quietly cynical; often picks up objects to put them away and then leaves them somewhere else absentmindedly; an avid bicyclist.",
    notes: "Penny is a really excellent cook; whenever regular cook Tivolia Miggles is gone, the Nose & Tail's food gets much better. The consequent surges in custom have not escaped the notice of publican Octavian Melius.\n\nPenny has Winter Torpor, as Hedgehog characters do. During the winter season, one sometimes finds her sleeping in random places, where she dropped off in the middle of a task."
  },
  {
    name: "Old Pook (Mr Elmerie Pook)",
    npcCategory: "animal",
    description: "Ancient Newt",
    role: "The oldest inhabitant of the River Bank; knows everything there is to know about boats and the River.",
    foeLevel: "Dire (+3) for getting rid of him in any way.",
    homeLife: "Elmerie lives in Pook's Hole, a surprisingly large burrow half underwater, in the water meadow by the weir.",
    particulars: "Interrupts himself and loses his train of thought; sly; walks slowly and carries a cane that makes things easier; clothes are all much mended in red thread.",
    notes: "Pook is so old that no one knows quite how old he is. He claims to have been around when Victoria were a lass, and that may even be true. He spends every waking hour on or beside his beloved River, and knows the best fishing holes, bathing spots, and picnic-meadows, if you can just keep him on the topic. He claims that part of Bonny Prince Charlie's treasury lies buried somewhere near Peder Norgaard's place but remains maddeningly vague as to specifics.\n\nNear the start of a session, the gamemaster rolls 1d10 for random encounters. On the roll of a 2, Pook appears at some point in the session and attaches himself to your group. He has no useful skills and proves almost impossible to dislodge.\n\nAny time you take a boat of any sort out on the river, roll 1d6: On a 1 or 2, Old Pook appears, as if by magic, and settles himself in the boat unless physically restrained. If you argue, a Sway deed, or attempt to physically oust him, a deed of Valor, another nonplayer-character Animal turns up and tut-tuts a bit before heading off to tell everyone; for the rest of that session, when any nonplayer-character Animal is present, you receive a -1 penalty to all deeds."
  },
  {
    name: "Mrs Jammy Porlock (Mabel)",
    npcCategory: "animal",
    description: "Getting on a bit, Goose",
    role: "Organizer of everything",
    foeLevel: "Dire (+3)",
    homeLife: "The Cote, where she lives with Mrs Celestine Grey.",
    particulars: "Abrupt; stubborn; selfless; always harried. Geese are generally noted for their fierceness, which manifests in Mrs Porlock as demanding your help with Causes. She has wings but would never think of flying, and has put on enough weight in recent years that perhaps she could not.",
    notes: "Mrs Porlock is the relict of Jammy Porlock, who ran a very successful ferry service on the Severn, but she always tries to seem posher than her past. She lives now with Mrs Grey, a calm and very elegant Pigeon who is gentry of the highest order among Animals; this seems an odd mix, but they suit very well.\n\nNear the start of a session, the gamemaster rolls 1d10 for random encounters. On a roll of 1, Mrs Porlock appears at some point to demand the immediate assistance of one or more characters to help with a project. If they refuse, she argues with each member of the party individually, as a dire foe, until someone fails the deed or agrees to help; then she drags them away for a few moments, in fact until the end of the Haphazardry cycle. Projects include things like handing out bills for Animal Suffragism at the Village, carrying a package of flyers to the Village train station, collecting for a new roof for St Aldwin's, or listening to an Important Speech she hopes to make to the Human House of Commons."
  },
  {
    name: "Mrs Poppy Rabbit",
    npcCategory: "animal",
    description: "Middle-aged Rabbit",
    role: "Widow of Barnaby Rabbit",
    foeLevel: "Commonplace (+1)",
    homeLife: "Mrs Rabbit lives at Connett Hole with her four children: Flopsy, Mopsy, Cotton-tail, known as Kitty, and Peter.",
    particulars: "Domestic and careful of her children, always calm.",
    notes: "Mrs Rabbit lost her husband under suspicious circumstances some years ago, and has been raising her four offspring alone since. She inherited money from an Appalling Relative, proof there is a reason for trying not to antagonize them, but she still gives lessons in the Italian tongue to anyone who asks."
  },
  {
    name: "Madame Sansonnet (Miss Jillinella Samson)",
    npcCategory: "animal",
    description: "Middle-aged Owl",
    role: "Owner and gossipy hostess of Madame Sansonnet's Tea Shoppe, by the old Roman road.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Madame Sansonnet lives upstairs from her Tea Shoppe. She hires various Animals to cook, clean, and serve for her in the shop, many of them Jane Hiver's girls.",
    particulars: "So very, very gossipy; sedate; famous for her jam, which can be enjoyed only at the Tea Shoppe, no bribe or threat has ever gotten the recipe from her, but there is always the chance that one of the girls might succumb to temptation and steal a jar, or the recipe. Dresses as she imagines a French shoplady would dress, which means black bombazin, a white lace collar, and a very long gold chain attached to a lorgnette, which she does not need.",
    notes: "Madame Sansonnet is almost always at her Tea Shoppe, though she no longer does all the labor herself. She personally greets any visitor, deftly pulling from them any news or gossip. A character encountering Madame in the middle of a situation must succeed at a Sway deed against a tiresome foe not to get stuck speaking with her until the next Haphazardry cycle.\n\nMadame Anthemia and Madame Sansonnet hate one another, each feeling they have sole right to the honorific."
  },
  {
    name: "Scuffles (Mr Samuel T. Eezle)",
    npcCategory: "animal",
    description: "Adult Weasel",
    role: "Most think of Scuffles as the best of the bad lot that live in the Wild Wood, if one sets aside Mr Badger at The Salts; does odd jobs as needed.",
    foeLevel: "Commonplace (+1) for most things, but dire (+3) in a fighting deed of Valor or in Sway deeds, as he is very charismatic.",
    homeLife: "An unnamed bole house in the Wild Wood, not too far from the Hive.",
    particulars: "Witters on about himself and his interests; works to invent a ghost-detector; wears wooden clogs when it rains and forgets to take them off when he enters a structure.",
    notes: "Scuffles is a surprisingly helpful and honest Weasel and conveys an aura of trustworthiness unusual in Wild Wooders. While he spends time with the other Wild Wooders at the Hive and the boozing ken, he gets along just as well with even the most timid of River Bankers; in fact, he may be the only person in the area well-regarded by both groups.\n\nHe often strays away from home, performing odd jobs across the River Bank and Wild Woods. If you are looking for him, there is a thirty percent chance on any day that he is helping someone nearby. He cannot read well, and there is no reliable way to leave him a message except at the boozing ken.\n\nFinding Scuffles, roll 1d6: 1 Musty Farm, 2 Boozing ken, 3 Nose & Tail, 4 Cote, 5 Toad Hall, 6 Running an errand in the Village."
  },
  {
    name: "Master Musician Miss Dana St Andrews",
    npcCategory: "animal",
    description: "Adult Fox",
    role: "Sings and plays the fiddle well, and is much in demand for social gatherings, dances, and general romps.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Lives at Strawberry Vale with her brother, Edmund St Andrew.",
    particulars: "Sunny-tempered; self-confident; devoted to her brother; unsettlingly good at cards because of her excellent memory; cooks poorly but is famous for her omelets. She has an Appalling Relative, Miss Sophronia Lachesis Esther Ruff.",
    notes: "Miss Dana has a small pump organ, a pianello, and several Animal-scaled violins, on which she gives lessons to interested Animals of any age. A musician of such note that she has been accorded Master status, the River Bank's highest accolade, Miss Dana studied at a famous conservatory in Sweden and can play most instruments, if they are small enough.\n\nShe and Mr Badger, who lives at The Salts, are good friends and often go on rambles together through the Wild Wood and even as far away as the Forest.\n\nMiss Dana often spends January at the Forest, enjoying the Foxes' short social Season, a whirlwind of dances, tea parties, Venetian breakfasts, and the like."
  },
  {
    name: "Mr Edmund St Andrews",
    npcCategory: "animal",
    description: "Adult Fox",
    role: "Charming and sociable gentle-Fox whose supper-parties are always much anticipated.",
    foeLevel: "Commonplace (+1)",
    homeLife: "This bachelor lives with his sister, Miss Dana St Andrews, at Strawberry Vale.",
    particulars: "Loves the outdoors: climbing mountains, fishing, sleeping under the stars; plays the fiddle and sings well enough to accompany his sister at evening parties.",
    notes: "Some days when the weather is fine, Mr Edmund takes his small single-masted sailboat out on the River or on downstream lakes. Characters might be invited to join him in these outings.\n\nMr Edmund often spends January at the Forest, enjoying the Foxes' short social Season, a whirlwind of dances, tea parties, Venetian breakfasts, and the like."
  },
  {
    name: "Miss Dermott Tasson",
    npcCategory: "animal",
    description: "Quite young Badger",
    role: "Postmistress to the Animals",
    foeLevel: "Commonplace (+1)",
    homeLife: "Lives in a room behind the Postal Service at the Chestnut.",
    particulars: "Speaks quietly; new to the neighborhood; delighted with her life; tidy and organized; everything she wears is clean and well-mended.",
    notes: "Miss Tasson grew up in a not-very-nice part of Town and still feels humbled by her luck in ending up here, as a valued part of the community. She works very hard and spends her free time minding the dwarf-rose garden she has started beside the Postal Service. She enjoys cycling everywhere she can reach on her shining new Dauphiness bicycle, carrying a picnic lunch. She is starting to write poetry."
  },
  {
    name: "Mr Wim Wallpaper Wassleford",
    npcCategory: "animal",
    description: "Adult Lizard",
    role: "Oft-absent proprietor of Ye Nook, a shop filled with unusual merchandise from far and wide.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Lives in the flat above his shop with his pet cockchafer, Jam-Jar.",
    particulars: "Belongs to the Junior Bluebottle, a private club in Town, where he travels often. Can always be counted upon to share the latest news; elegant, debonair, and a sharp dresser.",
    notes: "Wim has Winter Torpor, as Lizard characters do. During the winter season, one can find him asleep in the most unlikely places."
  },
  {
    name: "Mr Diodorus Thrale Winter",
    npcCategory: "animal",
    description: "Quite young Crow",
    role: "We are all so very proud of young Winter, who is at University.",
    foeLevel: "Commonplace (+1)",
    homeLife: "Diodorus lives at Winterhome near Parlement Hill with his parents, Dr Antonius Winter and Mrs Dinah Winter. His younger sister, Polyhymnia, is as intelligent as he.",
    particulars: "Studious; very absent-minded about errands and promises; a little awkward in ordinary conversation; always has an opinion about what to do but is seldom right.",
    notes: "Diodorus remains one of the very few Animals to attend University, at St Francis's College, established for Animals in 1869. He has an enormous base of information on whatever topic the gamemaster wishes for him."
  }
];

const NPC_ANIMAL_ORDER = NPC_ANIMALS.map((entry) => entry.name);
const NPC_HUMANS = [
  {
    name: "Miss Mary Baines",
    npcCategory: "human",
    description: "Middle-aged Human",
    role: "Preceptress, teacher, at the Lesser Cantrip Grammar School. Owner of Tibbles the cat.",
    foeLevel: "Tiresome (+2)",
    particulars: "Impatient but a heart of gold; snooty; energetic; wears spectacles. Very interested in historical folklore.",
    attitudeTowardAnimals: "\"I should know more about all my neighbors, so naturally I converse with an Animal any time I see one. I'm not rude; it's for the sake of the children's education!\"",
    notes: "Lives alone in one of the Deed Cottages. Miss Baines teaches Human children ages five to twelve; when school is out, she bustles about the Village and environs in search of her loathsome cat, Tibbles, or trying to convince the villagers to revive a Morris side she claims they used to have."
  },
  {
    name: "The Captain (Jeremiah Cavendish)",
    npcCategory: "human",
    description: "Elderly Human",
    role: "Retired ship's captain, now a mainstay at the Green Man. Owner of the parrot Cato.",
    foeLevel: "Tiresome (+2)",
    particulars: "Stubborn, very independent, hard of hearing.",
    attitudeTowardAnimals: "\"Animals is good people; I onc't knew a Sloth 'ut was my best friend, just about. Always happy to have them little visitors.\"",
    notes: "Lives at Land's End. No family, but retired sailor Preserved McKittrick, an elderly Human and tiresome foe who is contrarian and impudent but has a heart of gold, keeps house for him. Very helpful with anything to do with boats. Sits outside in all weathers smoking a pipe. Loves to tell stories of his sailing days on his ship, Sea Cat, and travel in general. Makes ships in bottles."
  },
  {
    name: "Dr Christie (James Christie, M.D., F.R.S.)",
    npcCategory: "human",
    description: "Adult Human",
    role: "General practitioner, G.P., for the area",
    foeLevel: "Commonplace (+1)",
    particulars: "Socially adroit and diplomatic; brisk; has a dog that is always getting away from him; dresses more like a Town doctor than a country doctor.",
    attitudeTowardAnimals: "\"There doesn't seem to have been any systematic study of Animal medicine! And yet they all seem well enough. Curious.\"",
    notes: "Lives in the Doctor's House, with the Surgery, the doctor's office, on the ground story. Nurse is Miss Ellen Taylor, an adult Human who is very quiet and efficient and endlessly knits stockings for the missions, and lives in a room she lets at one of the Deed Cottages. Housekeeper is Sophia Tatt, a getting-on-a-bit Human and tiresome foe who would rather talk than listen and is lugubrious and protective of the doctor's time, sister to Ben Tatt. The Doctor's dog is an Afghan hound, Ulugh Beg."
  },
  {
    name: "Mr Jack Eliot",
    npcCategory: "human",
    description: "Quite young Human",
    role: "Runs Eliot's Garage; mechanic and chauffeur-for-hire",
    foeLevel: "Commonplace (+1)",
    particulars: "Terse; calm no matter what's happening; sings or whistles absentmindedly and plays the harmonium if you ask him; fond of the color blue.",
    attitudeTowardAnimals: "\"I treat 'em same as I treat everyone: polite but brief.\"",
    notes: "Jack inherited Eliot's Livery from his Da a few years back and converted it to a garage and mechanic's shop, which makes enough money to support his grandmother, Nana Francesca, an elderly Human largely housebound and originally from Town, and his sister Sally, a quite young Human eager to help but not very good at it, who loves food and cooking and has exceptionally large hands and feet. Last year, he purchased a motor-car, a Poursuivant, which he hires out to drive people places. He is trying to invent a new carburetor system and has struck up a friendship with Bill, the Lizard who works at Littus House. Jack lives in a cottage across the lane from the garage."
  },
  {
    name: "Ferret Joe",
    npcCategory: "human",
    description: "Elderly Human",
    role: "Poacher who lives off the land",
    foeLevel: "Commonplace (+1)",
    particulars: "Very shy, quiet, and patient; cautious; clothing is ancient and the color of dirt, which may be a choice or may just be dirt.",
    attitudeTowardAnimals: "\"Animals is summat like you an' me, see, but also summat like beasts; but they're not for bein' et, any more'n you an' me. Nice little folks, an' they don't come a-harassin' a chap when he's tryin' to make a livin' like some.\"",
    notes: "Lives somewhere in Miller's Wood. Rumors claim he was the old gamekeeper for the Squire's grandfather; that he was a highwayman; that he has hidden treasure somewhere in the Wild Wood or under Tippee Connett; and that he was touched by fairies."
  },
  {
    name: "Old Mrs Grundy (Pearl)",
    npcCategory: "human",
    description: "Elderly Human",
    role: "Gossipy neighbor, well-meaning busybody. Owner of the Visigoths.",
    foeLevel: "Tiresome (+2)",
    particulars: "Would rather talk than listen; bossy; full of advice, usually bad; wears perfectly mended Victorian clothes that used to belong to her mother.",
    attitudeTowardAnimals: "\"Really, they need a bit of looking after sometimes! How do they manage?\"",
    notes: "Widow of Dan Grundy, who had a farm. Lives in Pansy Cottage. Very interested in her grandchildren and wants to tell you about them all; if you antagonize her, she gets huffy and sends you off; if you do not, she becomes overly affectionate."
  },
  {
    name: "Mr Hosea Harbour",
    npcCategory: "human",
    description: "Getting on a bit, Human",
    role: "Stationmaster at the railroad station",
    foeLevel: "Tiresome (+2)",
    particulars: "Attentive, pessimistic, sociable.",
    attitudeTowardAnimals: "\"Animals're fine.\"",
    notes: "Lives in an almost perfectly cubical home across the lane from the station, the Stationmaster's House, along with his wife, Faith, a middle-aged Human and tiresome foe obsessed with cleanliness who has formed a local choir; sister Agnes, a middle-aged Human who loves to chat with Animals but whose conversation is nothing but non sequiturs and is often found killing time at Tatt's; mother-in-law Joy-through-service, an elderly Human and tiresome foe who is a tireless walker and never fails to harangue anyone she finds, even Animals, about how her son-in-law is underpaid and unappreciated; and four rowdy children, three boys ages twelve, ten, and nine and a girl of six, collectively called the Harbour Express, Human children and dire foes. Mr Harbour always assumes the worst and will happily tell horror stories about train wrecks and weather disasters until you sidle away."
  },
  {
    name: "Mr McGregor (Actaeus)",
    npcCategory: "human",
    description: "Getting on a bit, Human",
    role: "Animal-hating gardener",
    foeLevel: "Dire (+3)",
    particulars: "Rude; mean-spirited; does not mind the cold or rain; shorter than most Humans.",
    attitudeTowardAnimals: "\"Animals 'at dress up a'n't hardly better nor animals 'at don't, an' they're all arter my carrots, see?\"",
    notes: "Lives at McGregor's Farm, where he grows produce to be sold in a nearby town or at Tatt's. His wife Jane, a getting-on-a-bit Human and dire foe, is as awful as he is. No Animal really believes he has ever eaten a Rabbit in a stew, but the rumors linger, making him the River Bank's bogeyman.\n\nMr McGregor hates all Animals so much that he will initiate a confrontation with them any time he encounters them. Any response but flight, a deed of Discretion, he opposes as a dire foe, but flight makes him only tiresome, as he seems more inclined to wave a pitchfork and curse than to pursue. He keeps a number of articles of clothing lost by fleeing Animals nailed to the door of his garden shed."
  },
  {
    name: "Mr Edward Parker (Ned)",
    npcCategory: "human",
    description: "Middle-aged Human",
    role: "The Village lockkeeper",
    foeLevel: "Commonplace (+1)",
    particulars: "Extroverted with everyone; usually in his garden when not working the lock.",
    attitudeTowardAnimals: "\"I don't see too many of them in the order of business, they mostly keep their boats upstream o' the lock. But they always pay their lock fees like decent folks, which not everyone does.\"",
    notes: "Ned lives at the lockhouse with his wife, Mrs Elizabeth Tibby Parker, a middle-aged Human fixated on her only child, and their daughter Lilian, a Human five-year-old child and dire foe who sees Animals as glorified stuffed toys."
  },
  {
    name: "Mr Thom Pennant",
    npcCategory: "human",
    description: "Middle-aged Human",
    role: "Innkeeper at the Beehive Inn",
    foeLevel: "Commonplace (+1)",
    particulars: "Gossipy; dramatic; easily distracted when he sees someone else; wears a striped velveteen waistcoat.",
    attitudeTowardAnimals: "\"Sometimes it's hard to take them seriously when they're so charming and little.\"",
    notes: "Thom Pennant runs the Beehive by the Oxford road with his sister Penelope, a middle-aged Human and tiresome foe who is abrupt and vague and always worried about improbable natural disasters such as volcanoes and tornadoes; a friend, George Lefevre, a middle-aged Human socially adroit with an opinion about everything and very freckled; and a loyal staff. There is a special suite of rooms scaled for Animals; occasionally a guest of one of the River Bank Animals will stay here. His arch-foe is Will Clark, an elderly Human humorous but hard-of-hearing, who always wears the same loud suit grown very grubby, and runs the Green Man."
  },
  {
    name: "The Squire (Sir John Frondlich, Bart., JP)",
    npcCategory: "human",
    description: "Getting on a bit, Human",
    role: "The main social force of the area; local justice of the peace. Owns Diana the mare.",
    foeLevel: "Commonplace (+1)",
    particulars: "Conscientious; outdoorsy; slow-thinking, but not stupid; moves a little clumsily but never drops things or falls.",
    attitudeTowardAnimals: "\"I try to do my best for everyone in my district. The Animals take good care of themselves and the land in their charge.\"",
    notes: "Lives at Frondlich Manor, also known as the Big House, with an indoor staff of eleven and outdoor staff of thirteen. Has a young son, Stephen, a Human child and dire foe who is mad about cricket and fossils and currently at Eton, and beloved twin daughters of marriageable age, Sarah and Susan, quite young Humans; each is energetic, outdoorsy, and beautiful, and neither cares to give up their pleasant home life for marriage. Sarah is a poet, and Susan an accomplished pianist.\n\nSpends April through June in Town introducing his daughters to marriageable young men, but his heart is on the River Bank. Likes to go hunting, but in fact, he just likes rambling and hardly ever brings anything back.\n\nThe Squire's is an interesting role in English rural life, though it is not a legally defined title. The Squire is usually the principal landowner for an area, often serving as a Justice of the Peace, with judicial power over some civil cases for local residents. While other gentry and nobility may live nearby, the Squire belongs to the district in ways they do not."
  },
  {
    name: "Mr Ben Tatt",
    npcCategory: "human",
    description: "Adult Human",
    role: "Owner and proprietor of Tatt's Stores, a shop that carries everything from curry powder and rubber boots to black cotton gloves and armbands for mourners.",
    foeLevel: "Tiresome (+2)",
    particulars: "Tenacious, shrewd, fixated on money.",
    attitudeTowardAnimals: "\"Their money's as good as anyone's! An' that needlework they do is just sweet as sweet.\"",
    notes: "Lives behind the shop with his wife, Margaret, an adult Human vigorous and pragmatic who wears pince-nez that she always loses; and two small, rather pleasant children, Little Ben age eight and Maggie seven, Human children and dire foes who are active and adventurous. Ben follows Animals home from the shop, spying on them; Maggie initiates long conversations with them about school and her interests, hoping to be invited home with them.\n\nBen inherited the shop from his father; he is the eighth Tatt to run it. No one sees him without his shopkeeper's apron except in church. An avid Village cricket player, Ben has a sister, Sophia Tatt, a getting-on-a-bit Human and tiresome foe who would rather talk than listen and is lugubrious and protective of the doctor's time, who also lives with him but works for Dr Christie."
  },
  {
    name: "Miss Flora Thompson",
    npcCategory: "human",
    description: "Quite young Human",
    role: "Postmistress to the Village",
    foeLevel: "Tiresome (+2)",
    particulars: "New to the neighborhood; talks very quickly; excitable and nervous about doing her job properly; wears spectacles she is always taking off and putting somewhere; extremely tall and lanky.",
    attitudeTowardAnimals: "\"I get flustered because I am afraid they will ask me a question I can't answer yet, and I don't want to seem rude!\"",
    notes: "Miss Thompson is young and new to town, sent to manage the postal office at Tatt's. She lives in a room she rents from Ben Tatt. She always seems reluctant to sell postage stamps or hand over parcels, which she treats as cherished personal possessions. Animals usually use their own Postal Service at the Chestnut, but larger packages often must be brought here."
  },
  {
    name: "The Reverend Mr Galen White",
    npcCategory: "human",
    description: "Getting on a bit, Human",
    role: "Vicar of St Aldwin's, ardent naturalist",
    foeLevel: "Commonplace (+1)",
    particulars: "Absent-minded; bookish; working on a history of St. Cuthbert; leaves behind gloves, umbrellas, and packages; exceptionally tall; a chess player.",
    attitudeTowardAnimals: "\"I should love to know them better, but they seem to want to keep themselves to themselves, and I don't want to encroach.\"",
    notes: "Lives in the Vicarage next door to St Aldwin's church. Mr White remains unmarried; the Vicarage is kept for him by his widowed older sister, Mrs Edwina Collins, a getting-on-a-bit Human who is easy-going, an avid gardener, and does fine needlework, and a formidable housekeeper and cook, Mrs Underwood, a getting-on-a-bit Human and tiresome foe when she thinks she is defending Mr White's time and attention and is utterly focused on service.\n\nThough deeply knowledgeable about the history of the area and about ordinary animals, Mr White can be hilariously wrong sometimes; for instance, he thinks that swallows hibernate for the winter in ponds."
  }
];
const NPC_HUMAN_ORDER = NPC_HUMANS.map((entry) => entry.name);
const NPC_ORDINARY_ANIMALS = [
  {
    name: "Busy, the Edwards bull",
    npcCategory: "ordinary-animal",
    foeLevel: "Dire (+3)",
    attitude: "Belligerent",
    size: "Huge",
    variety: "Aberdeen-Angus",
    notes: "Busy lives in a small curved pasture known as Busy's field, which, most unfortunately, is the fastest route from the heart of the Animals' domain to the Village, via a right of way path across the pasture that cuts minutes from the journey.\n\nIf Busy is asleep or grazing at the opposite end of the field, it is reasonably safe to cross. But if he notices you, getting across the field without being terrorized is a hard deed of Discretion against a dire foe. Busy occasionally frees himself, especially in the fall and winter."
  },
  {
    name: "Cato, the Captain's parrot",
    npcCategory: "ordinary-animal",
    foeLevel: "Dire (+3)",
    attitude: "Observant or belligerent",
    size: "Same",
    variety: "Male African grey parrot",
    notes: "For some reason, Cato hates Animals, and if he sees one passing, he launches forth with a quite embarrassing stream of invective. This could be traditional cursing, but it might be more entertaining for a gamemaster to seek out an online random Shakespearean-curse generator. When the Captain is out and about, Cato often rides on his shoulder. The Captain believes in fresh air, so unless there is a gale blowing or he has gone out, he hangs Cato's cage under the eaves of the front door of his cottage, Land's End, and Cato seems to thrive in these conditions. The only damage Cato usually inflicts is to a character's self-respect."
  },
  {
    name: "Diana, the Squire's mare",
    npcCategory: "ordinary-animal",
    foeLevel: "Commonplace (+1)",
    attitude: "Agog",
    size: "Huge",
    variety: "Irish riding mare, blood bay",
    notes: "At some point, Diana decided that Animals need looking after and has been attempting to do so in her own way ever since. She lives in Frondlich Manor's stables or a nearby pasture, but is an excellent jumper and escapes frequently. Freed, she makes an immediate beeline for the heart of the River Bank, the meadows and woodlands stretching between the Nose & Tail and the Postal Service/Stores. There she tries to get her nose into Animal cottages and burrows, or to chivvy them back to her pasture. If she does any damage to an Animal's home or business, the Squire apologizes profusely and pays for repairs; a week later, she is back at it.\n\nCharacters anywhere east of the Chumham Road or in the Village roll 1d10: On a 1, at some point Diana appears and begins trailing the character, trying to nudge them toward her own stable at Frondlich Manor, where she can take care of them properly."
  },
  {
    name: "Hatta House flock of sheep",
    npcCategory: "ordinary-animal",
    foeLevel: "Individually tiresome (+2); as a group too many (+8)",
    attitude: "Agog",
    size: "Much larger",
    variety: "Wiltshire sheep",
    notes: "The ten to twenty members of this flock seem fascinated by Humans and Animals and approach them relentlessly whenever possible; treat as too many foes (+8), except that locals know to bribe the flock to leave them alone by throwing buns, which the sheep will pursue."
  },
  {
    name: "Satan (the Old Man), a feral goat",
    npcCategory: "ordinary-animal",
    foeLevel: "Dire (+3)",
    attitude: "Belligerent",
    size: "Larger (about three feet tall)",
    variety: "Anglo-Nubian goat, white with many small black spots, like a Dalmatian",
    notes: "Satan, called the Old Man by anyone nervous about invoking the Devil, has been a hissing and a byword for many years: a male goat that escaped a farm miles to the northeast and eventually made his way to the River Bank, where he beds down in the Wild Wood or Miller's Wood and terrorizes roving dogs, cats, and anyone caught at a disadvantage outside. Demonically cunning, Satan has remained uncatchable.\n\nOne can startle Satan by opening an umbrella or parasol in his face, or doing something equally unexpected, but otherwise it requires a deed of Valor to scare him off. If he succeeds in getting an Animal down, he eats any loose fabric on them: a scarf, loose sleeves, skirts, and so forth.\n\nWhen characters are in a situation that brings them outside for extended periods, roll 1d6 when the Haphazardry timer goes off: On a 1, Satan rushes the party from the nearest cover, prepared to butt the closest character. In addition, near the start of a session, the gamemaster rolls 1d10 for random encounters; on a roll of 5, the characters will meet Satan before the end of the session."
  },
  {
    name: "Tibbles, Miss Baines's cat",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2)",
    attitude: "Agog",
    size: "Same",
    variety: "Tibbles is a ginger tom, and that explains everything you need to know about him",
    notes: "While plenty of cats and dogs wander about unsupervised, Tibbles is the most annoying. Animals fascinate him; whenever he sees one, he follows it everywhere until another Animal distracts him or his owner summons him home.\n\nIf a character is within a quarter mile of the Village, roll 1d10: On a 1, at some point Tibbles appears and begins trailing the character, which is a bit like being followed by a puma as far as comparative sizes go. Tibbles does not attack, but at the gamemaster's discretion may decide that playing with a character is a dandy idea. Then, at the end of the current Haphazardry cycle, roll 1d6 and see the Tibbles Encounter table.\n\nTibbles Encounter, 1d6 result: 1 Tibbles continues trailing the character for the next cycle. 2 Tibbles approaches the character, motives to be determined by the gamemaster. 3 Tibbles turns his attention to another Animal or, failing that, an ordinary animal in the vicinity. 4 Miss Baines calls Tibbles home. 5 Miss Baines comes looking for Tibbles and, finding him, strikes up a conversation with any characters present. 6 Tibbles gives up and wanders off."
  }
];
const NPC_ORDINARY_ANIMAL_ORDER = NPC_ORDINARY_ANIMALS.map((entry) => entry.name);
const NPC_GENERIC_ORDINARY_ANIMALS = [
  {
    name: "Horse",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2); Stallions: dire (+3)",
    attitude: "Observant or aloof; Stallions: aloof or belligerent",
    size: "Much larger to huge",
    variety: "Specialized breeds for various labor and transportation needs: draft horses, carriage horses and cart horses, riding horses and hunters",
    notes: "Herd, diurnal. Overwhelmingly large and unfortunately curious about you. Beware of hunts, when horses come out of nowhere. Evade them by escaping or spooking them."
  },
  {
    name: "Mule",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2)",
    attitude: "Observant or aloof",
    size: "Much larger",
    variety: "Specialized breeds for various labor and transportation needs",
    notes: "Herd, diurnal. Overwhelmingly large and unfortunately curious about you. Evade them by escaping or spooking them."
  },
  {
    name: "Pony",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2)",
    attitude: "Observant or aloof",
    size: "Much larger",
    variety: "Specialized breeds for various labor and transportation needs: ponies",
    notes: "Herd, diurnal. Overwhelmingly large and unfortunately curious about you. Beware of hunts, when horses come out of nowhere. Evade them by escaping or spooking them."
  },
  {
    name: "Donkey",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2)",
    attitude: "Observant or aloof",
    size: "Much larger",
    variety: "Specialized breeds for various labor and transportation needs",
    notes: "Herd, diurnal. Overwhelmingly large and unfortunately curious about you. Evade them by escaping or spooking them."
  },
  {
    name: "Cow",
    npcCategory: "ordinary-animal",
    foeLevel: "Commonplace (+1)",
    attitude: "Aloof, observant, or evasive",
    size: "Huge",
    variety: "Specialized breeds raised for milk, meat, hides, and labor: Shorthorn, Hereford, Friesian, Jersey, British White, Devon",
    notes: "Herd, diurnal. Incredibly large but only the bulls usually pose a problem. If you try to cross their pasture they will chase you. You can flee."
  },
  {
    name: "Ox",
    npcCategory: "ordinary-animal",
    foeLevel: "Commonplace (+1)",
    attitude: "Aloof, observant, or evasive",
    size: "Huge",
    variety: "Specialized breeds raised for milk, meat, hides, and labor: Shorthorn, Hereford, Friesian, Jersey, British White, Devon",
    notes: "Herd, diurnal. Incredibly large but only the bulls usually pose a problem. If you try to cross their pasture they will chase you. You can flee."
  },
  {
    name: "Bull",
    npcCategory: "ordinary-animal",
    foeLevel: "Dire (+3)",
    attitude: "Belligerent",
    size: "Huge",
    variety: "Specialized breeds raised for milk, meat, hides, and labor: Shorthorn, Hereford, Friesian, Jersey, British White, Devon",
    notes: "Herd, diurnal. Incredibly large and dangerous if you try to cross their pasture. They will chase you. You cannot spook a bull but can flee."
  },
  {
    name: "Sheep",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2)",
    attitude: "Aloof or agog",
    size: "Much larger",
    variety: "Blackface, Suffolk, Wiltshire",
    notes: "Herd, diurnal. Mutton is delicious; goat, less so. Watch out for horns and sheepdogs. Evade by escaping or spooking them."
  },
  {
    name: "Goat",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2)",
    attitude: "Agog or belligerent",
    size: "Much larger",
    variety: "Anglo-Nubian, Saanen",
    notes: "Herd, diurnal. Mutton is delicious; goat, less so. Watch out for horns and sheepdogs. Evade by escaping or spooking them; it is tougher with goats."
  },
  {
    name: "Pig",
    npcCategory: "ordinary-animal",
    foeLevel: "Dire (+3)",
    attitude: "Generally agog; occasionally belligerent",
    size: "Much larger",
    variety: "Large White, Essex and Wessex, Saddleback",
    notes: "Solitary, diurnal. Ironically sausage-shaped, pigs will attack if you fall into their sty. You may see them foraging in the woods in fall."
  },
  {
    name: "Goose",
    npcCategory: "ordinary-animal",
    foeLevel: "Dire (+3)",
    attitude: "Agog or belligerent",
    size: "Larger",
    variety: "Embler, Greylag",
    notes: "Flock, diurnal. Clipped wing feathers prevent their flying. Geese offer eggs and sometimes decorative feathers but get locked up at night. Evade geese by running for your life; they can jump fences."
  },
  {
    name: "Turkey",
    npcCategory: "ordinary-animal",
    foeLevel: "Dire (+3)",
    attitude: "Agog or belligerent",
    size: "Larger",
    variety: "Norfolk Black, Cambridge Bronze; turkeys are rare",
    notes: "Flock, diurnal."
  },
  {
    name: "Peafowl",
    npcCategory: "ordinary-animal",
    foeLevel: "Commonplace (+1)",
    attitude: "Aloof or evasive",
    size: "Larger",
    variety: "Peafowl varieties kept for display",
    notes: "Flock, diurnal. Peafowl offer decorative feathers and are often kept around estates."
  },
  {
    name: "Chicken",
    npcCategory: "ordinary-animal",
    foeLevel: "Any; Most males: dire (+3)",
    attitude: "Any; Most males: belligerent",
    size: "Same",
    variety: "Countless types",
    notes: "Flock, diurnal. Clipped wing feathers prevent their flying. You can evade these smaller birds by acting threatening, though this does not always work."
  },
  {
    name: "Duck",
    npcCategory: "ordinary-animal",
    foeLevel: "Any; Most males: dire (+3)",
    attitude: "Any; Most males: belligerent",
    size: "Same",
    variety: "Aylesbury, Gressingham, Silver Appleyard, Pekin, Barbary",
    notes: "Flock, diurnal. Clipped wing feathers prevent their flying. You can evade these smaller birds by acting threatening, though this does not always work."
  },
  {
    name: "Bantam",
    npcCategory: "ordinary-animal",
    foeLevel: "Any; Most males: dire (+3)",
    attitude: "Any; Most males: belligerent",
    size: "Same",
    variety: "Old English Game Bantam",
    notes: "Flock, diurnal. Clipped wing feathers prevent their flying. You can evade these smaller birds by acting threatening, though this does not always work."
  },
  {
    name: "Crow",
    npcCategory: "ordinary-animal",
    foeLevel: "Negligible foe except when mobbing, then dire (+3)",
    attitude: "Agog, observant, or aloof",
    size: "Same size",
    variety: "",
    notes: "Solitary or small groups in the daytime but collect in flocks at dusk and dawn."
  },
  {
    name: "Deer",
    npcCategory: "ordinary-animal",
    foeLevel: "Negligible foe except a stag protecting its herd, then tiresome (+2)",
    attitude: "Observant or aloof",
    size: "Larger or much larger",
    variety: "",
    notes: "Crepuscular; herds; bed down in groves and hedgerows."
  },
  {
    name: "Fox",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome foe (+2)",
    attitude: "Observant",
    size: "Same size",
    variety: "",
    notes: "Crepuscular; solitary or family structure; live in holes; found anywhere. Very curious and clever at stealing chickens, eggs, or other foods. Will eat Animals' pets."
  },
  {
    name: "Golden Eagle",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome foe (+2)",
    attitude: "Aloof",
    size: "Same size",
    variety: "",
    notes: "Diurnal; mated pairs and otherwise very territorial, nesting in cliffs. In January or February, golden eagles may harass Crows, Rooks, Owls, Geese, and Herons, perhaps in the mistaken belief that they are competing for territory. Will eat Animals' pets."
  },
  {
    name: "Mouse (House Mouse)",
    npcCategory: "ordinary-animal",
    foeLevel: "Negligible foe except when attacking foodstuffs, then tiresome (+2) or dire (+3)",
    attitude: "Evasive",
    size: "Smaller",
    variety: "",
    notes: "Family groups; live in walls and outbuildings. Can infest pantries, etc."
  },
  {
    name: "Mouse (Field Mouse)",
    npcCategory: "ordinary-animal",
    foeLevel: "Negligible foe except in masses when they come into barns by the thousands as part of bringing in hay or crops, then dire (+3)",
    attitude: "Evasive",
    size: "Smaller",
    variety: "",
    notes: "While not pack animals, they do swarm; live in barns and hay ricks."
  },
  {
    name: "Raptor",
    npcCategory: "ordinary-animal",
    foeLevel: "Commonplace foe (+1)",
    attitude: "Aloof or evasive unless tampered with, then belligerent",
    size: "Smaller or same size",
    variety: "Hawk, falcon, etc.",
    notes: "While no wild raptor is a direct threat, many Animals fear them, the consequence of kitten- and puphoods spent listening to sensational tales about bloodthirsty raptors stealing hapless infants to feed to their offspring."
  },
  {
    name: "Snake",
    npcCategory: "ordinary-animal",
    foeLevel: "Negligible foe except for an adder's poisonous bite",
    attitude: "Evasive",
    size: "Smaller",
    variety: "",
    notes: "Diurnal; solitary; live in holes. An adder's bite is very dangerous to a Human, but Animals have more resistance; if bitten, an Animal takes a point of Animality and receives a -1 penalty on all deeds until healed with the First Aid knack or the session ends, when they can rest and recover."
  },
  {
    name: "Dog",
    npcCategory: "ordinary-animal",
    foeLevel: "Commonplace (+1); Working dogs and terriers: dire (+3)",
    attitude: "Observant or agog; working dogs will not approach",
    size: "Smaller to much larger",
    variety: "Varieties include sporting dogs, hounds, working dogs, terriers, herders, toys, and non-working dogs, weighing 6-200 lbs.",
    notes: "Pack, diurnal. Familiarize yourself with local dogs. Some hunting breeds and all puppies may misbehave; even friendly dogs can knock you over. A firm 'No' might work. Evade them by climbing a tree or going underground."
  },
  {
    name: "Cat",
    npcCategory: "ordinary-animal",
    foeLevel: "Tiresome (+2), but will flee if cornered",
    attitude: "Agog; may follow Animals around",
    size: "Smaller to same",
    variety: "Most cats are generic shorthairs, but some people have long-haired Persians or Siamese",
    notes: "Solitary, diurnal. Be aware of feral cats in fields and woods, but they are not dangerous to healthy Animals. Cats can climb but avoid water."
  }
];
const NPC_GENERIC_ORDINARY_ANIMAL_ORDER = NPC_GENERIC_ORDINARY_ANIMALS.map((entry) => entry.name);
const DESIRED_INNATES = [
  ["Badger", "Digging", "Badgers are exceptionally good at digging and maintaining holes, tunnels, and underground chambers. They receive a +1 bonus to deeds involving digging or performing any needed minor repairs while moving through underground passages."],
  ["Badger", "Thrives Underground", "Badgers take no Animality points for being underground."],
  ["Badger", "Weak Vision", "Badgers receive a -1 penalty to deeds concerning seeing things at a distance, usually Attention deeds, if they do not wear corrective spectacles, a monocle, or similar aids."],
  ["Bat", "Exceptional Hearing", "Bats receive a +1 bonus to deeds with an auditory component: listening in on a distant conversation, hearing someone approach, and similar tasks."],
  ["Bat", "Head for Heights", "Bats take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Bat", "Speediness", "Bats receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Bat", "Weak Vision", "Bats receive a -1 penalty to deeds concerning seeing things at a distance, usually Attention deeds, if they do not wear corrective spectacles, a monocle, or similar aids."],
  ["Bat", "Wings", "Bats have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Fox", "Exceptional Hearing", "Foxes receive a +1 bonus to deeds with an auditory component: listening in on a distant conversation, hearing someone approach, and similar tasks."],
  ["Fox", "Speediness", "Foxes receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Fox", "Trickiness", "Foxes receive a +1 bonus to deeds involving sleight of claw, persuasion, sneaking or escaping, or playing tricks. Also, any time they attempt a Sway deed, roll 1d6: on a 1-3 they receive a -1 penalty; on a 4-6 they receive a +1 bonus."],
  ["Crow", "Head for Heights", "Corvids take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Crow", "Playfulness", "Corvids receive a +1 bonus to deeds related to games and play, such as playing Charades or cricket."],
  ["Crow", "Trickiness", "Corvids receive a +1 bonus to deeds involving sleight of claw, persuasion, sneaking or escaping, or playing tricks. Also, any time they attempt a Sway deed, roll 1d6: on a 1-3 they receive a -1 penalty; on a 4-6 they receive a +1 bonus."],
  ["Crow", "Wings", "Corvids have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Magpie", "Head for Heights", "Corvids take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Magpie", "Playfulness", "Corvids receive a +1 bonus to deeds related to games and play, such as playing Charades or cricket."],
  ["Magpie", "Trickiness", "Corvids receive a +1 bonus to deeds involving sleight of claw, persuasion, sneaking or escaping, or playing tricks. Also, any time they attempt a Sway deed, roll 1d6: on a 1-3 they receive a -1 penalty; on a 4-6 they receive a +1 bonus."],
  ["Magpie", "Wings", "Corvids have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Dormouse", "Deft", "Rodents receive a +1 bonus to Clever Paws deeds."],
  ["Dormouse", "Climbing", "Rodents receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Dormouse", "Nibbly", "Rodents have teeth that never stop growing, which encourages them to eat frequently. Someone with Nibbly always carries a few snacks, useful for food emergencies."],
  ["Dormouse", "Thrives Underground", "Rodents take no Animality points for being underground."],
  ["Dormouse", "Winter Torpor", "Dormice do not hibernate like their ordinary cousins, but they remain prone to sluggishness in the winter months, especially outdoors and when not properly dressed. They receive a -1 penalty to wintertime deeds performed outside a heated environment."],
  ["Mouse", "Deft", "Rodents receive a +1 bonus to Clever Paws deeds."],
  ["Mouse", "Climbing", "Rodents receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Mouse", "Ferocity", "Mice and Rats receive a +1 bonus to Sway deeds that involve intimidation and to deeds of Valor that involve fighting."],
  ["Mouse", "Nibbly", "Rodents have teeth that never stop growing, which encourages them to eat frequently. Someone with Nibbly always carries a few snacks, useful for food emergencies."],
  ["Mouse", "Thrives Underground", "Rodents take no Animality points for being underground."],
  ["Rat", "Deft", "Rodents receive a +1 bonus to Clever Paws deeds."],
  ["Rat", "Climbing", "Rodents receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Rat", "Ferocity", "Mice and Rats receive a +1 bonus to Sway deeds that involve intimidation and to deeds of Valor that involve fighting."],
  ["Rat", "Nibbly", "Rodents have teeth that never stop growing, which encourages them to eat frequently. Someone with Nibbly always carries a few snacks, useful for food emergencies."],
  ["Rat", "Thrives Underground", "Rodents take no Animality points for being underground."],
  ["Water Rat", "Aquatic", "Water Rats feel comfortable in the water and receive a +1 bonus to deeds taking place in or on it: swimming, rowing, poling, sailing, fishing, and similar tasks. This does not affect maintenance or repairs on watercraft, fishing poles, and similar gear."],
  ["Water Rat", "Deft", "Rodents receive a +1 bonus to Clever Paws deeds."],
  ["Water Rat", "Climbing", "Rodents receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Water Rat", "Nibbly", "Rodents have teeth that never stop growing, which encourages them to eat frequently. Someone with Nibbly always carries a few snacks, useful for food emergencies."],
  ["Water Rat", "Thrives Underground", "Rodents take no Animality points for being underground."],
  ["Dove", "Head for Heights", "Columbids take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Dove", "Speediness", "Columbids receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Dove", "Wings", "Columbids have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Pigeon", "Head for Heights", "Columbids take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Pigeon", "Speediness", "Columbids receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Pigeon", "Wings", "Columbids have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Duck", "Aquatic", "Waterfowl feel comfortable in the water and receive a +1 bonus to deeds taking place in or on it: swimming, rowing, poling, sailing, fishing, and similar tasks. In addition, they take no Animality points when immersed in water."],
  ["Duck", "Head for Heights", "Waterfowl take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Duck", "Wings", "Waterfowl have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Goose", "Aquatic", "Waterfowl feel comfortable in the water and receive a +1 bonus to deeds taking place in or on it: swimming, rowing, poling, sailing, fishing, and similar tasks. In addition, they take no Animality points when immersed in water."],
  ["Goose", "Ferocity", "Geese receive a +1 bonus to Sway deeds that involve intimidation and to deeds of Valor that involve fighting."],
  ["Goose", "Head for Heights", "Waterfowl take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Goose", "Wings", "Waterfowl have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Heron", "Aquatic", "Waterfowl feel comfortable in the water and receive a +1 bonus to deeds taking place in or on it: swimming, rowing, poling, sailing, fishing, and similar tasks. In addition, they take no Animality points when immersed in water."],
  ["Heron", "Head for Heights", "Waterfowl take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Heron", "Wings", "Waterfowl have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Frog", "Amphibious", "Frogs can breathe both air and water, which makes underwater actions feasible. A Frog can attempt tasks that require extended time underwater as easy, middling, or hard deeds, even though these would be impossible for other sorts without specialized aids."],
  ["Frog", "Aquatic", "Amphibians feel comfortable in the water and receive a +1 bonus to deeds taking place in or on it: swimming, rowing, poling, sailing, fishing, and similar tasks. In addition, they take no Animality points when immersed in water."],
  ["Frog", "Climbing", "Amphibians receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Frog", "Winter Torpor", "Frogs do not hibernate like their ordinary cousins, but they remain prone to sluggishness in the winter months, especially outdoors and when not properly dressed. They receive a -1 penalty to wintertime deeds performed outside a heated environment."],
  ["Toad", "Amphibious", "Toads can breathe both air and water, which makes underwater actions feasible. A Toad can attempt tasks that require extended time underwater as easy, middling, or hard deeds, even though these would be impossible for other sorts without specialized aids."],
  ["Toad", "Aquatic", "Amphibians feel comfortable in the water and receive a +1 bonus to deeds taking place in or on it: swimming, rowing, poling, sailing, fishing, and similar tasks. In addition, they take no Animality points when immersed in water."],
  ["Toad", "Climbing", "Amphibians receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Toad", "Sticky Tongue", "Toads have a long sticky tongue they can use to pick up, catch, or retrieve things. This may add a +1 bonus to certain deeds, at the gamemaster's discretion."],
  ["Toad", "Winter Torpor", "Toads do not hibernate like their ordinary cousins, but they remain prone to sluggishness in the winter months, especially outdoors and when not properly dressed. They receive a -1 penalty to wintertime deeds performed outside a heated environment."],
  ["Hare", "Exceptional Hearing", "Lagomorphs receive a +1 bonus to deeds with an auditory component: listening in on a distant conversation, hearing someone approach, and similar tasks."],
  ["Hare", "Nibbly", "Lagomorphs have teeth that never stop growing, which encourages them to eat frequently. Someone with Nibbly always carries a few snacks, useful for food emergencies."],
  ["Hare", "Playfulness", "Hares receive a +1 bonus to deeds related to games and play, such as playing Charades or cricket."],
  ["Hare", "Speediness", "Lagomorphs receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Rabbit", "Exceptional Hearing", "Lagomorphs receive a +1 bonus to deeds with an auditory component: listening in on a distant conversation, hearing someone approach, and similar tasks."],
  ["Rabbit", "Nibbly", "Lagomorphs have teeth that never stop growing, which encourages them to eat frequently. Someone with Nibbly always carries a few snacks, useful for food emergencies."],
  ["Rabbit", "Speediness", "Lagomorphs receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Rabbit", "Thrives Underground", "Rabbits take no Animality points for being underground."],
  ["Hedgehog", "Climbing", "Hedgehogs receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Hedgehog", "Spines", "Hedgehogs receive a +1 bonus to defending against physical attacks of any sort; the foe is injured and receives a -1 penalty to any attacks after the first in the same encounter. In stressful moments the spines involuntarily start to rise."],
  ["Hedgehog", "Winter Torpor", "Hedgehogs do not hibernate like their ordinary cousins, but they remain prone to sluggishness in the winter months, especially outdoors and when not properly dressed. They receive a -1 penalty to wintertime deeds performed outside a heated environment."],
  ["Lizard", "Climbing", "Lizards receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Lizard", "Detachable Tail", "A Lizard's tail or other limb can break off and grow back, useful if you are being pursued or if you need a distraction. The limb grows back after two weeks."],
  ["Lizard", "Winter Torpor", "Lizards do not hibernate like their ordinary cousins, but they remain prone to sluggishness in the winter months, especially outdoors and when not properly dressed. They receive a -1 penalty to wintertime deeds performed outside a heated environment."],
  ["Newt", "Amphibious", "Newts can breathe both air and water, which makes underwater actions feasible. A Newt can attempt tasks that require extended time underwater as easy, middling, or hard deeds, even though these would be impossible for other sorts without specialized aids."],
  ["Newt", "Climbing", "Newts receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Newt", "Detachable Tail", "A Newt's tail or other limb can break off and grow back, useful if you are being pursued or if you need a distraction. The limb grows back after two weeks."],
  ["Newt", "Sticky Tongue", "Newts have a long sticky tongue they can use to pick up, catch, or retrieve things. This may add a +1 bonus to certain deed challenges, at the gamemaster's discretion."],
  ["Newt", "Winter Torpor", "Newts do not hibernate like their ordinary cousins, but they remain prone to sluggishness in the winter months, especially outdoors and when not properly dressed. They receive a -1 penalty to wintertime deeds performed outside a heated environment."],
  ["Mole", "Digging", "Moles are exceptionally good at digging and maintaining holes, tunnels, and underground chambers. They receive a +1 bonus to deeds involving digging or performing any needed minor repairs while moving through underground passages."],
  ["Mole", "Thrives Underground", "Moles take no Animality points for being underground."],
  ["Mole", "Weak Vision", "Moles receive a -1 penalty to deeds concerning seeing things at a distance, usually Attention deeds, if they do not wear corrective spectacles, a monocle, or similar aids."],
  ["Otter", "Aquatic", "Otters feel comfortable in the water and receive a +1 bonus to deeds taking place in or on it: swimming, rowing, poling, sailing, fishing, and similar tasks. In addition, they take no Animality points when immersed in water."],
  ["Otter", "Deft", "Otters receive a +1 bonus to Clever Paws deeds."],
  ["Otter", "Playfulness", "Otters receive a +1 bonus to deeds related to games and play, such as playing Charades or cricket."],
  ["Owl", "Exceptional Eyesight", "Owls receive a +1 bonus to Attention deeds with a visual component. They take no Animality points from being in extreme darkness."],
  ["Owl", "Exceptional Hearing", "Owls receive a +1 bonus to deeds with an auditory component: listening in on a distant conversation, hearing someone approach, and similar tasks."],
  ["Owl", "Head for Heights", "Owls take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Owl", "Speediness", "Owls receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Owl", "Stealthiness", "Owls receive a +1 bonus to deeds involving sneaking."],
  ["Owl", "Wings", "Owls have Wings; if they take the Flying knack and pay a character-building token for flight, they can fly."],
  ["Squirrel", "Climbing", "Squirrels receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Squirrel", "Head for Heights", "Squirrels take no Animality points for spending time in trees, high in buildings, at the edges of cliffs, and similar heights."],
  ["Squirrel", "Nibbly", "Squirrels have teeth that never stop growing, which encourages them to eat frequently. Someone with Nibbly always carries a few snacks, useful for food emergencies."],
  ["Squirrel", "Speediness", "Squirrels receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Stoat", "Climbing", "Mustelids receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Stoat", "Ferocity", "Mustelids receive a +1 bonus to Sway deeds that involve intimidation and to deeds of Valor that involve fighting."],
  ["Stoat", "Speediness", "Mustelids receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."],
  ["Weasel", "Climbing", "Mustelids receive a +1 bonus for deeds involving climbing or scrambling, usually deeds of Valor or Discretion. They take no Animality points from heights."],
  ["Weasel", "Ferocity", "Mustelids receive a +1 bonus to Sway deeds that involve intimidation and to deeds of Valor that involve fighting."],
  ["Weasel", "Speediness", "Mustelids receive a +1 bonus to deeds involving moving at speed, such as escaping or running errands."]
].map(([sortName, name, description]) => ({ sortName, name, description }));

const APPALLING_RELATIVES_TABLES = [
  {
    name: "1 - How many Appalling Relatives?",
    formula: "1d6",
    results: [
      "None. (If you have the Is Dependent peculiarity, you still have one.)",
      "One. (If you have the Is Dependent peculiarity, you now have two. If you have two, roll twice on the subsequent tables for the details of each.)",
      "One. (If you have the Is Dependent peculiarity, you now have two. If you have two, roll twice on the subsequent tables for the details of each.)",
      "One. (If you have the Is Dependent peculiarity, you now have two. If you have two, roll twice on the subsequent tables for the details of each.)",
      "One. (If you have the Is Dependent peculiarity, you now have two. If you have two, roll twice on the subsequent tables for the details of each.)",
      "Two. (If you have the Is Dependent peculiarity, you now have three.) If you have two or more, roll the appropriate number of times on the subsequent tables."
    ]
  },
  {
    name: "2 - What's their relationship to you?",
    formula: "1d6",
    results: [
      "Great-aunt or great-uncle",
      "Grandparent",
      "Aunt or uncle",
      "Cousin",
      "Distant or adoptive relative who has taken an interest in you",
      "Unrelated Animal who raised you or helped raise you; you call them by a family term"
    ]
  },
  {
    name: "3 - On which side?",
    formula: "1d6",
    results: [
      "Mother's side",
      "Mother's side",
      "Mother's side",
      "Father's side",
      "Father's side",
      "Father's side"
    ]
  },
  {
    name: "4 - How old are they?",
    formula: "1d6",
    results: [
      "Of middling age (the equivalent of Edwardian-era Humans in their later thirties and forties)",
      "Getting on a bit (... in their fifties to early sixties)",
      "Getting on a bit (... in their fifties to early sixties)",
      "Elderly (... over the age of sixty-five)",
      "Elderly (... over the age of sixty-five)",
      "Ancient (... over the age of eighty)"
    ]
  },
  {
    name: "5 - What are some particulars?",
    formula: "1d100",
    results: [
      "At death's door, so they claim",
      "At death's door, so they claim",
      "Bad eyesight",
      "Bad eyesight",
      "Bad-tempered and cranky",
      "Bad-tempered and cranky",
      "Batty",
      "Batty",
      "Caustic",
      "Caustic",
      "Changes their mind a lot",
      "Changes their mind a lot",
      "Clingy",
      "Clingy",
      "Contrarian",
      "Contrarian",
      "Dithers",
      "Dithers",
      "Doesn't act their age",
      "Doesn't act their age",
      "Domineering",
      "Domineering",
      "Dotes (probably not on you)",
      "Dotes (probably not on you)",
      "Drones on and on",
      "Drones on and on",
      "Early to bed, early to rise",
      "Early to bed, early to rise",
      "Emotionally needy",
      "Emotionally needy",
      "Erratic",
      "Erratic",
      "Fidgety",
      "Fidgety",
      "Forgetful",
      "Forgetful",
      "Formal",
      "Formal",
      "Full of odd theories about food",
      "Full of odd theories about food",
      "Gloomy and full of dire predictions",
      "Gloomy and full of dire predictions",
      "Hard of hearing and doesn't admit it",
      "Hard of hearing and doesn't admit it",
      "Has a cane and threatens people with it",
      "Has a cane and threatens people with it",
      "Has an adored pet",
      "Has an adored pet",
      "Has a terrible pet, like a wasp or poisonous centipede",
      "Has a terrible pet, like a wasp or poisonous centipede",
      "Has a weirdly inappropriate pet, like an ordinary chicken",
      "Has a weirdly inappropriate pet, like an ordinary chicken",
      "Has multiple pets",
      "Has multiple pets",
      "Indolent",
      "Indolent",
      "Judgmental",
      "Judgmental",
      "Loves to talk about their Will",
      "Loves to talk about their Will",
      "Muddled",
      "Muddled",
      "Nervous",
      "Nervous",
      "Nods off at inopportune times",
      "Nods off at inopportune times",
      "Nosy",
      "Nosy",
      "Not angry, just very disappointed in you",
      "Not angry, just very disappointed in you",
      "Not at all well, but doctors Just Don't Understand",
      "Not at all well, but doctors Just Don't Understand",
      "Obsessed with ancestry",
      "Obsessed with ancestry",
      "Obsessed with cleanliness",
      "Obsessed with cleanliness",
      "Obsessed with gardening",
      "Obsessed with gardening",
      "Obsessed with what's beyond the veil",
      "Obsessed with what's beyond the veil",
      "Obsessively saves something; roll 1d6: 1 = string, 2 = paper, 3 = bottlecaps34, 4 = hair, 5 = coins, 6 = objects found on walks",
      "Obsessively saves something; roll 1d6: 1 = string, 2 = paper, 3 = bottlecaps34, 4 = hair, 5 = coins, 6 = objects found on walks",
      "Physically sprightly",
      "Physically sprightly",
      "Picky",
      "Picky",
      "Prefers the way it was in Victoria's day",
      "Prefers the way it was in Victoria's day",
      "Quarrelsome",
      "Quarrelsome",
      "Rude",
      "Rude",
      "Talks about their past all the time",
      "Talks about their past all the time",
      "Wildly irresponsible",
      "Wildly irresponsible",
      "Writing their Memoirs, which are red-hot",
      "Writing their Memoirs, which are red-hot",
      "Writing their Memoirs, which are very dull",
      "Writing their Memoirs, which are very dull"
    ]
  },
  {
    name: "6 - Greatest Weapon",
    formula: "1d10",
    results: [
      "Acts as though you have already agreed.",
      "Puts you into a situation where you can't say no: showing up uninvited, forcing younger relatives on you without warning, tricking you into a day trip to London that turns into two months in the south of France.",
      "Explains to you, endlessly, why you are wholly wrong not to see things their way.",
      "Promises you something you want: their cook's recipe for cream scones, that tea set you have always admired. You don't always receive it.",
      "Threatens to tell people about the deeply embarrassing things you did in your youth. They have a picture of you, quite unclad, on a furry rug.",
      "Threatens to come and stay. Sometimes they do.",
      "Starts to act feeble: tremulous paws, palpitations, fainting spells, recourse to smelling salts and hartshorn-and-water. They may mention their advancing years.",
      "Starts to talk about their Will and whether you or anyone else will be in it.",
      "Tries to make you feel guilty, either about their own advanced years, your obligations to The Family, or another higher power.",
      "Droops about, acting weepy and dramatic."
    ]
  },
  {
    name: "7 - When they summon you, where are you going?",
    formula: "1d10",
    results: [
      "Their remote cottage some miles from the nearest train station. They don't have gas or electricity, and everyone goes to bed as soon as it gets dark. You'll be sleeping in the room where they stash the broken furniture.",
      "Their remote castle, perhaps in Scotland. There are fifty-four rooms, and forty-eight of them are damp and have water stains on the ceiling, but it is the Ancestral Home, so nothing must change.",
      "Their remote stately home. They inherited or married money so it is all very nice, but they have quarreled with all their neighbors, and you receive the cut direct from everyone on the street.",
      "A tiny convenience flat in London. They have a guest bedroom, but since you're going to be there, they might as well put you to use, so they let the maid go during your stay. Also, you may find yourself in charge of their pet.",
      "The Rackham House in London. Wherever they normally live, they have just decided a trip to Town is in order, perhaps to visit a medical specialist, update their wardrobe, meet friends, or get into the sorts of trouble that they can't manage at home.",
      "They are great travelers and you will be coming with them: planning itineraries, carrying bags, making sure the sheets in the inns are not damp, negotiating with chauffeurs, and the like.",
      "A health spa. They have been ordered to Bath or Tunbridge Wells to drink the waters. You will enter their name in the Pump Room rolls, and then it will be your task to escort them to whatever valetudinarian activity is on the slate for the day.",
      "It is not their house but someone else's. They make engagements for you at the houses of friends who need a useful younger Animal about for a bit. Or they send you to a remote relative who needs a cataloguer for their library or a secretary to get their Memoirs in order. Or they find you a job in a bank or a fishmonger's, where you are expected to learn the business from the ground up and perhaps in time become less of a fritterer and more a productive member of society.",
      "Their bedside. They know they are dying, and you must come to them At Once to hear their last, lingering words. This may be a sincere request, but it's far more likely to be a cunning ruse.",
      "Their wedding in London. They surely should know better, but they have decided to marry someone entirely unsuitable. This happens every so often, and the affianced one invariably turns out to be a terrible choice; the reasons why vary according to the Appalling Relative in question."
    ]
  }
];

const INSUFFICIENCY_ROLLTABLES_PACK = [
  {
    name: "Creature/Item",
    formula: "1d10",
    results: [
      "Corvid nonplayer characters",
      "Fox nonplayer characters",
      "Ordinary dogs or cats",
      "Ordinary farm geese",
      "Ordinary animals larger than small or same size",
      "Humans in uniform: postal workers, constables, vicars in vestments, judges, people in academic robes, etc.",
      "Human children",
      "Motor-cars",
      "Electrical lights or power",
      "String"
    ]
  },
  {
    name: "Insufficiency Roll Table",
    formula: "1d10",
    results: [
      "Aesthetically Inclined",
      "Fascinating to Ordinary Animals",
      "Gawky",
      "Inclined to Growl",
      "Overfond of Drink",
      "Prone to Gossip",
      "Swooning",
      "Timid",
      "Touchy",
      "Weak Constitution"
    ]
  }
];

const BETWEENTIMES_TABLES_PACK = [
  {
    name: "Betweentimes Environment",
    formula: "1d100",
    results: [
            { range: [1, 3], description: "There was an odd weather phenomenon such as sun dogs or summer hail, and everyone is still talking about it." },
            { range: [4, 6], description: "Beautiful auroras appeared in the northern sky one night, and everyone spent the next day extremely tired. Every time folks got together, that's what they talked about." },
            { range: [7, 9], description: "A coin of great antiquity was found in a field. It might be Roman or Mercian, or from somewhere more distant." },
            { range: [10, 12], description: "Spooky lights appeared in the Wild Wood. Were they will-o'-the-wisps, the campfires of ruffians, or something eerier?" },
            { range: [13, 15], description: "It has been unseasonably cold." },
            { range: [16, 18], description: "It has been unseasonably hot." },
            { range: [19, 21], description: "It has been very wet, and people have worried about flooding, but it seems to have inundated only the water meadows. A burrow or two got wet." },
            { range: [22, 24], description: "There has been flooding. Homes near the River got a bit wet, and everyone's still cleaning up afterward." },
            { range: [25, 27], description: "It is dry enough that folks are worrying about this year's, or next year's, crops." },
            { range: [28, 30], description: "It's been overcast for ages, and everyone is getting tired of it." },
            { range: [31, 33], description: "A windstorm blew through, and a lot of trees lost branches. A few Animal tree houses were damaged." },
            { range: [34, 36], description: "There has been a sudden massive influx of some ordinary animal appropriate to the season: caterpillars or mayflies (spring), cicadas or locusts (summer), beetles or starlings (fall), crows (winter). They're everywhere." },
            { range: [37, 39], description: "Many Animals have had a runny nose for a few days. Alarmists and hypochondriacs fear it is serious, but it doesn't seem to be." },
            { range: [40, 42], description: "There's a cough running through the Village. Alarmists and hypochondriacs fear that it is serious, but no one else worries." },
            { range: [43, 45], description: "The Village church roof is leaking again. Scaffolding is going up and funds are being solicited." },
            { range: [46, 48], description: "Busy the bull (see Chapter Three) got out and went on a bit of a rampage. A chase ensued, causing slight property damage." },
            { range: [49, 51], description: "An unfamiliar ordinary animal showed up for a few days, escaped from a zoologically minded peer some distance away. It might have been a kangaroo, a bison, a capybara, a wildcat, or something else." },
            { range: [52, 54], description: "A minor fire in the Village did a bit of damage, and everyone's been talking about it ever since." },
            { range: [55, 57], description: "Something happened to the telegraph or telephone wires, so telegrams and/or telephone calls were unavailable for a few days." },
            { range: [58, 60], description: "A family of ordinary foxes moved into the River Bank and were haunting the river walk, frightening the more timid Animals." },
            { range: [61, 63], description: "Something mysterious or unknown was carried down the River, to the curiosity of all." },
            { range: [64, 66], description: "A rare celestial event occurred, such as a comet or a lunar eclipse. Everyone wanted to see it, and there was hot competition for the few telescopes and the best spots for viewing. A few tempers flared." },
            { range: [67, 69], description: "A seasonally appropriate plant, lichen, or mushroom grew in enormous quantity this year. It's being used in new jams and jellies, dyes for clothing, and so forth. People are starting to get tired of it." },
            { range: [70, 72], description: "There was a problem with the lock in the Village, so no Human boats have ventured above the lock." },
            { range: [73, 75], description: "Due to a strike among brewers, there have been no deliveries for a little while. The only beer still available in the area is the unlicensed ale made at the boozing ken in the Wild Wood." },
            { range: [76, 78], description: "It seemed that someone stole a pruning snoot from Miss Grundy's garden (see Chapter Three). For a day or two constables got in the way everywhere, even in the River Bank. Then she found it where it had fallen behind the rain barrel, and they went away." },
            { range: [79, 81], description: "The Postal Service roof at the Chestnut started leaking." },
            { range: [82, 84], description: "Ordinary mice or beetles overran the Stores at the Chestnut, and for a while you couldn't buy flour or sugar." },
            { range: [85, 86], description: "One of the ferry mutts (see \"Crossing the River\" sidebar in Chapter Four) went missing for days and days. No one could figure out what happened until it reappeared at the ferry crossing. Animals have been giving one another the side eye about hogging it for themselves." },
            { range: [87, 88], description: "Ordinary moles were digging up the Stick Green. Everyone argued about how to get rid of them since no one wanted to actually hurt them." },
            { range: [89, 90], description: "A fairy ring, a circle of mushrooms, appeared in the middle of the cricket pitch south of Stick Green. Everyone argued about how to get rid of it. A few lovers of the unexplained think doing so might summon angry fairies, though no one else believes in fairies." },
            { range: [91, 92], description: "An Animal claims they saw a hoopoe, a very rare bird indeed. Animal and Human birdwatchers have been flocking." },
            { range: [93, 94], description: "A local Animal discovered a new cave up past Klippehus and has been eager to show it to interested Animals." },
            { range: [95, 96], description: "A wagon that broke an axle on the Oxford Road managed to block the entire roadway for a full day until it was repaired. Local Animals enjoyed the spectacle of vehicles trying to skirt the obstacle or turn around in the narrow roadway." },
            { range: [97, 98], description: "An Animal walking by the river found an expensive-looking object such as a fancy wallet or gold pencil. No one knows whose it is, so it is now on the wall behind the register at the Postal Service/Stores." },
      { range: [99, 99], description: "A very loud and mysterious sound was heard in the distance. It's the talk of the neighborhood, Animals and Humans." },
      { range: [100, 100], description: "Lightning struck an abandoned shed in the area. All a-twitter, the Animals have begun installing lightning rods around their own homes." }
    ]
  },
  {
    name: "Betweentimes Denizens",
    formula: "1d100",
    results: [
            { range: [1, 2], description: "An NPC got a new pet, which is still being trained and likes to hide in other houses and misbehave." },
            { range: [3, 4], description: "An NPC lost their pet, and everyone went out to find it, which took 1d6 days." },
            { range: [5, 6], description: "A pet in the neighborhood died of old age, and there was some discussion of a tasteful funeral." },
            { range: [7, 8], description: "An NPC has hosted a long-term guest for 1d4 months. The NPC has been arranging events to keep them amused, which may have involved the characters." },
            { range: [9, 10], description: "An NPC started a new club such as a book club, savings club, painting club, etc. They invited characters to join. The club may or may not be thriving." },
            { range: [11, 12], description: "An NPC went to Town for 1d10 days. When they came back, everyone wanted to hear the latest news, fashions, and so forth." },
            { range: [13, 14], description: "An NPC went to Tunbridge Wells for 1d10 days to drink the waters for their health. When they came back, everyone wanted to hear the latest news, fashions, and so forth." },
            { range: [15, 16], description: "Two NPCs had rather a disagreement about something. Each has been bustling about the River Bank trying to convince people they are on the side of right." },
            { range: [17, 18], description: "An NPC's house in the neighborhood lost part of its roof, and everyone has been busy trying to help with repairs." },
            { range: [19, 20], description: "The latest of Jane Hiver's girls was found to have stolen a book from the lending library at Sunflower Cottage." },
            { range: [21, 22], description: "Old Pook vanished for a few days. It turns out he had stowed away on a canal boat south of the Village lock; it took more than a few days to get him home again." },
            { range: [23, 24], description: "Mrs. Tivolia Miggle went away to give one of her talks on Poetry. She returned with quite an exciting new hat." },
            { range: [25, 26], description: "Peder Norgaard has a foreign guest who doesn't speak any English at all. He keeps wandering around the neighborhood and getting lost." },
            { range: [27, 28], description: "An Appalling Relative summoned an NPC for a visit lasting 2d20 days." },
            { range: [29, 30], description: "An Appalling Relative came to visit an NPC for 2d20 days. The NPC has been arranging events to try to amuse them, which may have involved the characters." },
            { range: [31, 32], description: "An Appalling Relative has given money to an NPC. They are excited and telling everyone about their plans for the money." },
            { range: [33, 34], description: "A conflict has erupted in a local club, such as a book club, savings club, painting club, etc. While it is primarily between two NPCs, it has expanded to touch many." },
            { range: [35, 36], description: "A sporting event such as a darts competition, cricket match, rowing contest, etc., dominated the River Bank's attention for a bit. If it took place, the results were not to everyone's liking." },
            { range: [37, 38], description: "Satan the goat came into the Postal Service/Stores and terrorized everyone." },
            { range: [39, 40], description: "A new Animal moved to the River Bank. Everyone is excited." },
            { range: [41, 42], description: "Someone in the Village got a new dog, which frequently gets loose." },
            { range: [43, 44], description: "Everyone has been feeling exceptionally cheerful and sprightly." },
            { range: [45, 46], description: "An Animal was lost for a while, causing much worry, but they turned out to have been summoned by their Appalling Relative." },
            { range: [47, 48], description: "An NPC started a new business of some sort." },
            { range: [49, 50], description: "An NPC sprained a paw or became quite ill." },
            { range: [51, 52], description: "A Human in the Village had a baby and everyone was talking about it." },
            { range: [53, 54], description: "Everyone has been a bit bored, which has caused some odd arguments." },
            { range: [55, 56], description: "Someone long gone from the River Bank returned for a visit." },
            { range: [57, 58], description: "Madame Anthemia made a dire prediction for the future, which all the Animals have been talking about." },
            { range: [59, 60], description: "An NPC went off visiting. When they came back, they brought a new piece of technology or another person." },
            { range: [61, 62], description: "A visiting inventor, Animal or Human, has come to the area to test some new contraption far away from competitors' prying eyes, requiring lots of open spaces." },
            { range: [63, 64], description: "The Squire, a Human, has been on an improving kick, rebuilding cottages here and there." },
            { range: [65, 66], description: "The Squire, a Human, hosted a Public Day. Everyone local, Animal and Human alike, was rather expected to visit." },
            { range: [67, 68], description: "The oldest Human inhabitant of the Village died, and everyone was talking about it." },
            { range: [69, 70], description: "A new Human moved to the Village. Everyone seems suspicious." },
            { range: [71, 72], description: "When the Vicarage attic was cleared out, some secret came to light that has all the Village's Humans in a kerfuffle." },
            { range: [73, 74], description: "A Human spiritualist came to the area and gave seances. Some Animals attended." },
            { range: [75, 76], description: "A Human naturalist, painter, or poet came to the region for art or science and has been getting in everyone's way." },
            { range: [77, 78], description: "The Village lending library, inside Tatt's, received a bequest of books. One is said to be a thousand years old." },
            { range: [79, 80], description: "Human horse-caravan travelers came to the Village and set up in the green for a while." },
            { range: [81, 82], description: "The Village has suddenly come to the attention of the Wide World as an example of charming gardens, architecture, or landscape. A flurry of visitors arrived from Town and even farther abroad." },
            { range: [83, 84], description: "A Human from the Village was lost, and there was a great search for them." },
            { range: [85, 86], description: "A local Animal claims to have seen fairies up in Strawberry Vale." },
            { range: [87, 88], description: "Someone has had a dream predicting the future." },
            { range: [89, 90], description: "A space opened up on the planning committee for an upcoming festival or event. Two NPCs have been jockeying for the post." },
            { range: [91, 92], description: "A former resident of the River Bank has written a book. Local Animals have all been trying to get their paws on a copy to see whether anyone they know is in it." },
            { range: [93, 94], description: "Madame Sansonnet is developing a new recipe for her Tea Shoppe. Lots of smoke and strange aromas have been coming from there." },
            { range: [95, 96], description: "A local Animal has mislaid a (purportedly) valuable stamp collection. After making wild accusations of theft, the owner found it up in a closet." },
      { range: [97, 98], description: "An NPC fell from a ladder and hit their head and now suffers from amnesia, causing quite the stir." },
      { range: [99, 100], description: "A large, extremely heavy pottery urn decorating the veranda at Toad Hall has gone missing, causing quite the stir." }
    ]
  }
];

function randomId(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i += 1) out += chars[bytes[i] % chars.length];
  return out;
}

function baseStats(base = {}) {
  return {
    compendiumSource: null,
    duplicateSource: null,
    exportSource: null,
    coreVersion: "13.351",
    systemId: "riverbank",
    systemVersion: "2.0.0",
    ...base
  };
}

function baseSortSystem() {
  return {
    description: "",
    category: "sort",
    sort: "",
    peculiarityType: "",
    usedThisCycle: false,
    bonuses: [],
    choiceBonuses: [],
    selectedChoices: [],
    otherEffects: "",
    size: "",
    timeOfDay: "",
    sociability: "",
    preliminaryStats: { charm: 0, intrepidity: 0, pother: 0, sense: 0 },
    innatePeculiarities: "",
    riverbankSortDescription: "",
    ordinarySortDescription: "",
    notes: ""
  };
}

function baseFeatureSystem() {
  return {
    description: "",
    category: "",
    sort: "",
    peculiarityType: "",
    usedThisCycle: false,
    bonuses: [],
    choiceBonuses: [],
    selectedChoices: [],
    otherEffects: "",
    tokenCost: 0,
    size: "",
    timeOfDay: "",
    sociability: "",
    preliminaryStats: { charm: 0, intrepidity: 0, pother: 0, sense: 0 },
    innatePeculiarities: "",
    riverbankSortDescription: "",
    ordinarySortDescription: "",
    notes: ""
  };
}

function setSorts(list) {
  list.forEach((doc, index) => {
    doc.sort = (index + 1) * SORT_DENSITY;
  });
}

function buildSortItem(sort, folderId) {
  return {
    name: sort.name,
    type: "feature",
    img: "icons/svg/book.svg",
    system: {
      ...baseSortSystem(),
      size: sort.size,
      timeOfDay: sort.timeOfDay,
      sociability: sort.sociability,
      preliminaryStats: sort.preliminaryStats,
      innatePeculiarities: sort.innatePeculiarities.join("; "),
      riverbankSortDescription: sort.riverbankSortDescription,
      ordinarySortDescription: sort.ordinarySortDescription,
      notes: sort.notes
    },
    _id: randomId(),
    effects: [],
    folder: folderId,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildInnateItem(def, folderId) {
  return {
    name: def.name,
    type: "feature",
    img: "icons/svg/book.svg",
    system: {
      ...baseFeatureSystem(),
      description: def.description,
      category: "innate",
      sort: def.sortName,
      peculiarityType: "innate"
    },
    _id: randomId(),
    effects: [],
    folder: folderId,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildPetItem(pet, folderId) {
  return {
    name: pet.name,
    type: "feature",
    img: "icons/svg/book.svg",
    system: {
      ...baseFeatureSystem(),
      category: "pet",
      description: pet.description,
      notes: pet.traits.join("\n")
    },
    _id: randomId(),
    effects: [],
    folder: folderId,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildObjectOfDesireItem(entry) {
  return {
    name: entry.name,
    type: "feature",
    img: "icons/svg/book.svg",
    system: {
      ...baseFeatureSystem(),
      category: "objectofdesire",
      description: entry.description,
      tokenCost: entry.tokenCost
    },
    _id: randomId(),
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildHomeItem(entry, folderId) {
  return {
    name: entry.name,
    type: "feature",
    img: "icons/svg/book.svg",
    system: {
      ...baseFeatureSystem(),
      category: "home",
      description: entry.description
    },
    _id: randomId(),
    effects: [],
    folder: folderId,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildFeatureItem(entry, folderId = null) {
  return {
    name: entry.name,
    type: "feature",
    img: "icons/svg/book.svg",
    system: {
      ...baseFeatureSystem(),
      category: entry.category ?? "",
      description: entry.description ?? "",
      peculiarityType: entry.peculiarityType ?? ""
    },
    _id: randomId(),
    effects: [],
    folder: folderId,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildNpcActor(entry) {
  const crMatch = entry.foeLevel.match(/\+(\d+)/);
  const cr = crMatch ? Number(crMatch[1]) : 0;
  return {
    name: entry.name,
    type: "npc",
    img: "icons/svg/mystery-man.svg",
    system: {
      npcCategory: entry.npcCategory ?? "",
      health: { value: 10, min: 0, max: 10 },
      power: { value: 5, min: 0, max: 5 },
      biography: "",
      cr,
      xp: cr * cr * 100,
      description: entry.description ?? "",
      role: entry.role ?? "",
      foeLevel: entry.foeLevel,
      attitude: entry.attitude ?? "",
      homeLife: entry.homeLife ?? "",
      attitudeTowardAnimals: entry.attitudeTowardAnimals ?? "",
      size: entry.size ?? "",
      variety: entry.variety ?? "",
      particulars: entry.particulars ?? "",
      notes: entry.notes
    },
    prototypeToken: {
      name: entry.name,
      texture: { src: "icons/svg/mystery-man.svg" }
    },
    _id: randomId(),
    items: [],
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildJournalEntry(entry) {
  const pageId = randomId();
  return {
    name: entry.name,
    pages: [pageId],
    folder: null,
    categories: [],
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats(),
    _id: randomId()
  };
}

function buildJournalPage(entry, journalId, existingStats = {}) {
  return {
    sort: SORT_DENSITY,
    name: entry.name,
    type: "text",
    _id: randomId(),
    system: {},
    title: { show: true, level: 1 },
    image: {},
    text: {
      format: 1,
      content: entry.content
    },
    video: {
      controls: true,
      volume: 0.5
    },
    src: null,
    category: null,
    ownership: { default: -1 },
    flags: {},
    _stats: baseStats(existingStats),
    _entryId: journalId
  };
}

async function loadDb(packPath) {
  const db = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
  await db.open();
  const folders = [];
  const items = [];
  for await (const [key, value] of db.iterator()) {
    const doc = JSON.parse(value);
    if (key.startsWith("!folders!")) folders.push(doc);
    else if (key.startsWith("!items!")) items.push(doc);
  }
  return { db, folders, items };
}

async function loadJournalDb(packPath) {
  const db = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
  await db.open();
  const folders = [];
  const journal = [];
  const pages = [];
  for await (const [key, value] of db.iterator()) {
    const doc = JSON.parse(value);
    if (key.startsWith("!folders!")) folders.push(doc);
    else if (key.startsWith("!journal!")) journal.push(doc);
    else if (key.startsWith("!journal.pages!")) {
      const [, entryId, pageId] = key.match(/^!journal\.pages!([^.]+)\.(.+)$/) ?? [];
      if (entryId && pageId) {
        doc._entryId = entryId;
        doc._pageKey = key;
      }
      pages.push(doc);
    }
  }
  return { db, folders, journal, pages };
}

async function loadActorDb(packPath) {
  const db = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
  await db.open();
  const folders = [];
  const actors = [];
  for await (const [key, value] of db.iterator()) {
    const doc = JSON.parse(value);
    if (key.startsWith("!folders!")) folders.push(doc);
    else if (key.startsWith("!actors!")) actors.push(doc);
  }
  return { db, folders, actors };
}

async function loadRollTableDb(packPath) {
  const db = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
  await db.open();
  const folders = [];
  const tables = [];
  const results = [];
  for await (const [key, value] of db.iterator()) {
    const doc = JSON.parse(value);
    if (key.startsWith("!folders!")) folders.push(doc);
    else if (key.startsWith("!tables!")) tables.push(doc);
    else if (key.startsWith("!tables.results!")) {
      const [, tableId, resultId] = key.match(/^!tables\.results!([^.]+)\.(.+)$/) ?? [];
      if (tableId && resultId) {
        doc._tableId = tableId;
        doc._resultKey = key;
      }
      results.push(doc);
    }
  }
  return { db, folders, tables, results };
}

async function writeDb(db, folders, items, deletedFolderIds = [], deletedItemIds = []) {
  const batch = db.batch();
  for (const folder of folders) batch.put(`!folders!${folder._id}`, JSON.stringify(folder));
  for (const item of items) batch.put(`!items!${item._id}`, JSON.stringify(item));
  for (const folderId of deletedFolderIds) batch.del(`!folders!${folderId}`);
  for (const itemId of deletedItemIds) batch.del(`!items!${itemId}`);
  await batch.write();
  await db.close();
}

async function writeActorDb(db, folders, actors, deletedFolderIds = [], deletedActorIds = []) {
  const batch = db.batch();
  for (const folder of folders) batch.put(`!folders!${folder._id}`, JSON.stringify(folder));
  for (const actor of actors) batch.put(`!actors!${actor._id}`, JSON.stringify(actor));
  for (const folderId of deletedFolderIds) batch.del(`!folders!${folderId}`);
  for (const actorId of deletedActorIds) batch.del(`!actors!${actorId}`);
  await batch.write();
  await db.close();
}

async function writeRollTableDb(db, folders, tables, results, deletedFolderIds = [], deletedTableIds = [], deletedResultKeys = []) {
  const batch = db.batch();
  for (const folder of folders) batch.put(`!folders!${folder._id}`, JSON.stringify(folder));
  for (const table of tables) batch.put(`!tables!${table._id}`, JSON.stringify(table));
  for (const result of results) batch.put(`!tables.results!${result._tableId}.${result._id}`, JSON.stringify(stripInternalResultFields(result)));
  for (const folderId of deletedFolderIds) batch.del(`!folders!${folderId}`);
  for (const tableId of deletedTableIds) batch.del(`!tables!${tableId}`);
  for (const resultKey of deletedResultKeys) batch.del(resultKey);
  await batch.write();
  await db.close();
}

async function writeJournalDb(db, folders, journal, pages, deletedFolderIds = [], deletedJournalIds = [], deletedPageKeys = []) {
  const batch = db.batch();
  for (const folder of folders) batch.put(`!folders!${folder._id}`, JSON.stringify(folder));
  for (const entry of journal) batch.put(`!journal!${entry._id}`, JSON.stringify(entry));
  for (const page of pages) batch.put(`!journal.pages!${page._entryId}.${page._id}`, JSON.stringify(stripInternalJournalPageFields(page)));
  for (const folderId of deletedFolderIds) batch.del(`!folders!${folderId}`);
  for (const journalId of deletedJournalIds) batch.del(`!journal!${journalId}`);
  for (const pageKey of deletedPageKeys) batch.del(pageKey);
  await batch.write();
  await db.close();
}

function stripInternalJournalPageFields(page) {
  const copy = { ...page };
  delete copy._entryId;
  delete copy._pageKey;
  return copy;
}

function ensureFolder(existingFolders, name) {
  const folder = existingFolders.find((entry) => entry.name === name && entry.folder == null) ?? {
    _id: randomId()
  };
  folder.name = name;
  folder.type = "Item";
  folder.sorting = "a";
  folder.folder = null;
  folder.description = folder.description ?? "";
  folder.sort = 0;
  folder.color = folder.color ?? null;
  folder.flags = folder.flags ?? {};
  folder._stats = baseStats(folder._stats ?? {});
  return folder;
}

function ensureRollTableFolder(existingFolders, name) {
  const folder = existingFolders.find((entry) => entry.name === name && entry.folder == null) ?? {
    _id: randomId()
  };
  folder.name = name;
  folder.type = "RollTable";
  folder.sorting = "a";
  folder.folder = null;
  folder.description = folder.description ?? "";
  folder.sort = 0;
  folder.color = folder.color ?? null;
  folder.flags = folder.flags ?? {};
  folder._stats = baseStats(folder._stats ?? {});
  return folder;
}

function buildRollTable(definition) {
  return {
    name: definition.name,
    description: "",
    formula: definition.formula,
    replacement: true,
    displayRoll: true,
    results: [],
    _id: randomId(),
    img: "icons/svg/d20-grey.svg",
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    _stats: baseStats()
  };
}

function buildRollTableResult(description, roll, tableId) {
  return {
    type: "text",
    weight: 1,
    range: [roll, roll],
    drawn: false,
    description,
    _id: randomId(),
    _tableId: tableId,
    name: "",
    img: null,
    flags: {},
    _stats: baseStats()
  };
}

function normalizeRollTableResult(definition, index) {
  if (typeof definition === "string") return { range: [index + 1, index + 1], description: definition };
  return {
    range: definition.range,
    description: definition.description
  };
}

function stripInternalResultFields(result) {
  const copy = { ...result };
  delete copy._tableId;
  delete copy._resultKey;
  return copy;
}

function rebuildSortsPack(folders, items) {
  const desiredFolders = CATEGORY_FOLDERS.map((name) => ensureFolder(folders, name));
  const desiredFolderIds = new Set(desiredFolders.map((folder) => folder._id));
  const folderByName = new Map(desiredFolders.map((folder) => [folder.name, folder]));

  const existingByName = new Map(items.map((item) => [item.name, item]));
  const desiredItems = SORTS.map((sort) => {
    const existing = existingByName.get(sort.name) ?? buildSortItem(sort, sort.folder ? folderByName.get(sort.folder)._id : null);
    existing.type = "feature";
    existing.img = existing.img || "icons/svg/book.svg";
    existing.effects = existing.effects ?? [];
    existing.folder = sort.folder ? folderByName.get(sort.folder)._id : null;
    existing.ownership = existing.ownership ?? { default: 0 };
    existing.flags = existing.flags ?? {};
    existing._stats = baseStats(existing._stats ?? {});
    existing.system = {
      ...baseSortSystem(),
      ...(existing.system ?? {}),
      size: sort.size,
      timeOfDay: sort.timeOfDay,
      sociability: sort.sociability,
      preliminaryStats: sort.preliminaryStats,
      innatePeculiarities: sort.innatePeculiarities.join("; "),
      riverbankSortDescription: sort.riverbankSortDescription,
      ordinarySortDescription: sort.ordinarySortDescription,
      notes: sort.notes
    };
    return existing;
  });

  const deletedFolderIds = folders
    .filter((folder) => !desiredFolderIds.has(folder._id))
    .map((folder) => folder._id);
  const desiredItemIds = new Set(desiredItems.map((item) => item._id));
  const deletedItemIds = items
    .filter((item) => !desiredItemIds.has(item._id))
    .map((item) => item._id);

  setSorts(desiredFolders);
  const singles = desiredItems.filter((item) => item.folder == null).sort((a, b) => SINGLE_SORTS.indexOf(a.name) - SINGLE_SORTS.indexOf(b.name));
  setSorts(singles);
  for (const folderName of CATEGORY_FOLDERS) {
    const folder = folderByName.get(folderName);
    const folderItems = desiredItems
      .filter((item) => item.folder === folder._id)
      .sort((a, b) => SORT_ORDER.indexOf(a.name) - SORT_ORDER.indexOf(b.name));
    setSorts(folderItems);
  }

  return { folders: desiredFolders, items: desiredItems, deletedFolderIds, deletedItemIds };
}

function rebuildPeculiaritiesPack(folders, items) {
  const innateFolder = ensureFolder(folders, "Innate Peculiarities");
  const personalFolder = ensureFolder(folders, "Personal Peculiarities");
  const desiredFolders = [innateFolder, personalFolder];
  const desiredFolderIds = new Set(desiredFolders.map((folder) => folder._id));

  const personalItems = items
    .filter((item) => (item.system?.peculiarityType || item.system?.category) === "personal")
    .map((item) => {
      item.type = "feature";
      item.img = item.img || "icons/svg/book.svg";
      item.effects = item.effects ?? [];
      item.folder = personalFolder._id;
      item.ownership = item.ownership ?? { default: 0 };
      item.flags = item.flags ?? {};
      item._stats = baseStats(item._stats ?? {});
      item.system = { ...baseFeatureSystem(), ...(item.system ?? {}), category: "personal", peculiarityType: "personal" };
      return item;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a._id.localeCompare(b._id));

  const desiredInnates = DESIRED_INNATES.map((def) => {
    const existing = items.find((item) =>
      (item.system?.peculiarityType || item.system?.category) === "innate"
      && item.name === def.name
      && item.system?.sort === def.sortName
    ) ?? buildInnateItem(def, innateFolder._id);
    existing.type = "feature";
    existing.img = existing.img || "icons/svg/book.svg";
    existing.effects = existing.effects ?? [];
    existing.folder = innateFolder._id;
    existing.ownership = existing.ownership ?? { default: 0 };
    existing.flags = existing.flags ?? {};
    existing._stats = baseStats(existing._stats ?? {});
    existing.system = {
      ...baseFeatureSystem(),
      ...(existing.system ?? {}),
      description: def.description,
      category: "innate",
      sort: def.sortName,
      peculiarityType: "innate"
    };
    return existing;
  }).sort((a, b) => {
    const sortDelta = SORT_ORDER.indexOf(a.system.sort) - SORT_ORDER.indexOf(b.system.sort);
    if (sortDelta) return sortDelta;
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a._id.localeCompare(b._id);
  });

  const desiredItems = [...desiredInnates, ...personalItems];
  const desiredItemIds = new Set(desiredItems.map((item) => item._id));
  const deletedFolderIds = folders
    .filter((folder) => !desiredFolderIds.has(folder._id))
    .map((folder) => folder._id);
  const deletedItemIds = items
    .filter((item) => !desiredItemIds.has(item._id))
    .map((item) => item._id);

  setSorts(desiredFolders);
  setSorts(desiredInnates);
  setSorts(personalItems);

  return { folders: desiredFolders, items: desiredItems, deletedFolderIds, deletedItemIds };
}

function rebuildPetsPack(folders, items) {
  const desiredFolders = PET_FOLDERS.map((name) => ensureFolder(folders, name));
  const desiredFolderIds = new Set(desiredFolders.map((folder) => folder._id));
  const folderByName = new Map(desiredFolders.map((folder) => [folder.name, folder]));

  const existingByName = new Map(items.map((item) => [item.name, item]));
  const desiredItems = PETS.map((pet) => {
    const existing = existingByName.get(pet.name) ?? buildPetItem(pet, pet.folder ? folderByName.get(pet.folder)._id : null);
    existing.type = "feature";
    existing.img = existing.img || "icons/svg/book.svg";
    existing.effects = existing.effects ?? [];
    existing.folder = pet.folder ? folderByName.get(pet.folder)._id : null;
    existing.ownership = existing.ownership ?? { default: 0 };
    existing.flags = existing.flags ?? {};
    existing._stats = baseStats(existing._stats ?? {});
    existing.system = {
      ...baseFeatureSystem(),
      ...(existing.system ?? {}),
      category: "pet",
      description: pet.description,
      notes: pet.traits.join("\n")
    };
    return existing;
  });

  const deletedFolderIds = folders
    .filter((folder) => !desiredFolderIds.has(folder._id))
    .map((folder) => folder._id);
  const desiredItemIds = new Set(desiredItems.map((item) => item._id));
  const deletedItemIds = items
    .filter((item) => !desiredItemIds.has(item._id))
    .map((item) => item._id);

  setSorts(desiredFolders);
  const singles = desiredItems
    .filter((item) => item.folder == null)
    .sort((a, b) => PET_ORDER.indexOf(a.name) - PET_ORDER.indexOf(b.name));
  setSorts(singles);
  for (const folderName of PET_FOLDERS) {
    const folder = folderByName.get(folderName);
    const folderItems = desiredItems
      .filter((item) => item.folder === folder._id)
      .sort((a, b) => PET_ORDER.indexOf(a.name) - PET_ORDER.indexOf(b.name));
    setSorts(folderItems);
  }

  return { folders: desiredFolders, items: desiredItems, deletedFolderIds, deletedItemIds };
}

function rebuildObjectsOfDesirePack(folders, items) {
  const existingByName = new Map(items.map((item) => [item.name, item]));
  const desiredItems = OBJECTS_OF_DESIRE.map((entry) => {
    const existing = existingByName.get(entry.name) ?? buildObjectOfDesireItem(entry);
    existing.type = "feature";
    existing.img = existing.img || "icons/svg/book.svg";
    existing.effects = existing.effects ?? [];
    existing.folder = null;
    existing.ownership = existing.ownership ?? { default: 0 };
    existing.flags = existing.flags ?? {};
    existing._stats = baseStats(existing._stats ?? {});
    existing.system = {
      ...baseFeatureSystem(),
      ...(existing.system ?? {}),
      category: "objectofdesire",
      description: entry.description,
      tokenCost: entry.tokenCost
    };
    return existing;
  }).sort((a, b) => OBJECTS_OF_DESIRE_ORDER.indexOf(a.name) - OBJECTS_OF_DESIRE_ORDER.indexOf(b.name));

  setSorts(desiredItems);
  const desiredItemIds = new Set(desiredItems.map((item) => item._id));
  const deletedItemIds = items.filter((item) => !desiredItemIds.has(item._id)).map((item) => item._id);

  return {
    folders: [],
    items: desiredItems,
    deletedFolderIds: folders.map((folder) => folder._id),
    deletedItemIds
  };
}

function rebuildHomesPack(folders, items) {
  const desiredFolders = HOME_FOLDERS.map((name) => ensureFolder(folders, name));
  const desiredFolderIds = new Set(desiredFolders.map((folder) => folder._id));
  const folderByName = new Map(desiredFolders.map((folder) => [folder.name, folder]));

  const existingByName = new Map(items.map((item) => [item.name, item]));
  const desiredItems = HOMES.map((entry) => {
    const existing = existingByName.get(entry.name) ?? buildHomeItem(entry, folderByName.get(entry.folder)._id);
    existing.type = "feature";
    existing.img = existing.img || "icons/svg/book.svg";
    existing.effects = existing.effects ?? [];
    existing.folder = folderByName.get(entry.folder)._id;
    existing.ownership = existing.ownership ?? { default: 0 };
    existing.flags = existing.flags ?? {};
    existing._stats = baseStats(existing._stats ?? {});
    existing.system = {
      ...baseFeatureSystem(),
      ...(existing.system ?? {}),
      category: "home",
      description: entry.description
    };
    return existing;
  });

  const deletedFolderIds = folders
    .filter((folder) => !desiredFolderIds.has(folder._id))
    .map((folder) => folder._id);
  const desiredItemIds = new Set(desiredItems.map((item) => item._id));
  const deletedItemIds = items
    .filter((item) => !desiredItemIds.has(item._id))
    .map((item) => item._id);

  setSorts(desiredFolders);
  for (const folderName of HOME_FOLDERS) {
    const folder = folderByName.get(folderName);
    const folderItems = desiredItems
      .filter((item) => item.folder === folder._id)
      .sort((a, b) => HOME_ORDER.indexOf(a.name) - HOME_ORDER.indexOf(b.name));
    setSorts(folderItems);
  }

  return { folders: desiredFolders, items: desiredItems, deletedFolderIds, deletedItemIds };
}

function rebuildNpcAnimalsPack(folders, actors) {
  return rebuildNpcPack(folders, actors, NPC_ANIMALS, NPC_ANIMAL_ORDER);
}

function rebuildNpcHumansPack(folders, actors) {
  return rebuildNpcPack(folders, actors, NPC_HUMANS, NPC_HUMAN_ORDER);
}

function rebuildNpcOrdinaryAnimalsPack(folders, actors) {
  return rebuildNpcPack(folders, actors, NPC_ORDINARY_ANIMALS, NPC_ORDINARY_ANIMAL_ORDER);
}

function rebuildNpcGenericOrdinaryAnimalsPack(folders, actors) {
  return rebuildNpcPack(folders, actors, NPC_GENERIC_ORDINARY_ANIMALS, NPC_GENERIC_ORDINARY_ANIMAL_ORDER);
}

function rebuildLocationsPack(folders, journal, pages) {
  const existingByName = new Map(journal.map((entry) => [entry.name, entry]));
  const desiredJournal = [];
  const desiredPages = [];

  for (const entry of LOCATIONS) {
    const existing = existingByName.get(entry.name) ?? buildJournalEntry(entry);
    const existingPageId = Array.isArray(existing.pages) ? existing.pages[0] : null;
    const existingPage = pages.find((page) => page._entryId === existing._id && page._id === existingPageId)
      ?? pages.find((page) => page._entryId === existing._id)
      ?? buildJournalPage(entry, existing._id);

    existingPage.name = entry.name;
    existingPage.type = "text";
    existingPage.system = existingPage.system ?? {};
    existingPage.title = existingPage.title ?? { show: true, level: 1 };
    existingPage.image = existingPage.image ?? {};
    existingPage.text = {
      ...(existingPage.text ?? {}),
      format: 1,
      content: entry.content
    };
    existingPage.video = {
      ...(existingPage.video ?? {}),
      controls: true,
      volume: 0.5
    };
    existingPage.src = existingPage.src ?? null;
    existingPage.category = existingPage.category ?? null;
    existingPage.sort = SORT_DENSITY;
    existingPage.ownership = existingPage.ownership ?? { default: -1 };
    existingPage.flags = existingPage.flags ?? {};
    existingPage._stats = baseStats(existingPage._stats ?? {});
    existingPage._entryId = existing._id;

    existing.pages = [existingPage._id];
    existing.folder = null;
    existing.categories = existing.categories ?? [];
    existing.sort = 0;
    existing.ownership = existing.ownership ?? { default: 0 };
    existing.flags = existing.flags ?? {};
    existing._stats = baseStats(existing._stats ?? {});
    desiredJournal.push(existing);
    desiredPages.push(existingPage);
  }

  desiredJournal.sort((a, b) => LOCATION_ORDER.indexOf(a.name) - LOCATION_ORDER.indexOf(b.name));

  setSorts(desiredJournal);
  const desiredIds = new Set(desiredJournal.map((entry) => entry._id));
  const deletedJournalIds = journal
    .filter((entry) => !desiredIds.has(entry._id))
    .map((entry) => entry._id);
  const desiredPageKeys = new Set(desiredPages.map((page) => `!journal.pages!${page._entryId}.${page._id}`));
  const deletedPageKeys = pages
    .map((page) => page._pageKey ?? `!journal.pages!${page._entryId}.${page._id}`)
    .filter((key) => !desiredPageKeys.has(key));

  return {
    folders: [],
    journal: desiredJournal,
    pages: desiredPages,
    deletedFolderIds: folders.map((folder) => folder._id),
    deletedJournalIds,
    deletedPageKeys
  };
}

function rebuildNpcPack(folders, actors, entries, order) {
  const existingByName = new Map(actors.map((actor) => [actor.name, actor]));
  const desiredActors = entries.map((entry) => {
    const existing = existingByName.get(entry.name) ?? buildNpcActor(entry);
    const crMatch = entry.foeLevel.match(/\+(\d+)/);
    const cr = crMatch ? Number(crMatch[1]) : 0;
    existing.type = "npc";
    existing.img = existing.img || "icons/svg/mystery-man.svg";
    existing.items = existing.items ?? [];
    existing.effects = existing.effects ?? [];
    existing.folder = null;
    existing.sort = 0;
    existing.ownership = existing.ownership ?? { default: 0 };
    existing.flags = existing.flags ?? {};
    existing._stats = baseStats(existing._stats ?? {});
    existing.prototypeToken = {
      ...(existing.prototypeToken ?? {}),
      name: entry.name,
      texture: {
        src: existing.prototypeToken?.texture?.src || "icons/svg/mystery-man.svg"
      }
    };
    existing.system = {
      ...(existing.system ?? {}),
      health: existing.system?.health ?? { value: 10, min: 0, max: 10 },
      power: existing.system?.power ?? { value: 5, min: 0, max: 5 },
      biography: existing.system?.biography ?? "",
      npcCategory: entry.npcCategory ?? "",
      cr,
      xp: cr * cr * 100,
      description: entry.description ?? "",
      role: entry.role ?? "",
      foeLevel: entry.foeLevel,
      attitude: entry.attitude ?? "",
      homeLife: entry.homeLife ?? "",
      attitudeTowardAnimals: entry.attitudeTowardAnimals ?? "",
      size: entry.size ?? "",
      variety: entry.variety ?? "",
      particulars: entry.particulars ?? "",
      notes: entry.notes
    };
    return existing;
  }).sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

  setSorts(desiredActors);
  const desiredActorIds = new Set(desiredActors.map((actor) => actor._id));
  const deletedActorIds = actors
    .filter((actor) => !desiredActorIds.has(actor._id))
    .map((actor) => actor._id);

  return {
    folders: [],
    actors: desiredActors,
    deletedFolderIds: folders.map((folder) => folder._id),
    deletedActorIds
  };
}

function rebuildSimplePack(folders, items, defaults = []) {
  const existingByName = new Map(items.map((item) => [item.name, item]));
  const desiredItems = [
    ...items,
    ...defaults.filter((entry) => !existingByName.has(entry.name)).map((entry) => buildFeatureItem(entry))
  ];

  const orderedItems = desiredItems
    .map((item) => {
      item.folder = null;
      item.flags = item.flags ?? {};
      item.effects = item.effects ?? [];
      item.ownership = item.ownership ?? { default: 0 };
      item._stats = baseStats(item._stats ?? {});
      return item;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a._id.localeCompare(b._id));

  setSorts(orderedItems);
  return {
    folders: [],
    items: orderedItems,
    deletedFolderIds: folders.map((folder) => folder._id),
    deletedItemIds: []
  };
}

function rebuildRollTablePack(folders, tables, results, packDefinition) {
  const rootDefinitions = packDefinition.rootTables ?? packDefinition;
  const folderGroups = packDefinition.folderGroups ?? [];
  const existingTablesByName = new Map(tables.map((table) => [table.name, table]));
  const existingFoldersByName = new Map(folders.map((folder) => [folder.name, folder]));
  const desiredFolders = [];
  const desiredTables = [];
  const desiredResults = [];

  const addTable = (definition, folderId = null) => {
    const table = existingTablesByName.get(definition.name) ?? buildRollTable(definition);
    const existingResults = results
      .filter((result) => result._tableId === table._id)
      .sort((a, b) => (a.range?.[0] ?? 0) - (b.range?.[0] ?? 0) || a._id.localeCompare(b._id));

    table.name = definition.name;
    table.description = "";
    table.formula = definition.formula;
    table.replacement = true;
    table.displayRoll = true;
    table.img = table.img || "icons/svg/d20-grey.svg";
    table.folder = folderId;
    table.ownership = table.ownership ?? { default: 0 };
    table.flags = table.flags ?? {};
    table._stats = baseStats(table._stats ?? {});

    const resultIds = [];
    definition.results.forEach((resultDefinition, index) => {
      const normalized = normalizeRollTableResult(resultDefinition, index);
      const result = existingResults[index] ?? buildRollTableResult(normalized.description, normalized.range[0], table._id);
      result.type = "text";
      result.weight = 1;
      result.range = normalized.range;
      result.drawn = false;
      result.description = normalized.description;
      result._tableId = table._id;
      result.name = result.name ?? "";
      result.img = result.img ?? null;
      result.flags = result.flags ?? {};
      result._stats = baseStats(result._stats ?? {});
      resultIds.push(result._id);
      desiredResults.push(result);
    });

    table.results = resultIds;
    desiredTables.push(table);
  };

  rootDefinitions.forEach((definition) => addTable(definition, null));

  for (const group of folderGroups) {
    const folder = existingFoldersByName.get(group.name) ?? ensureRollTableFolder(folders, group.name);
    folder.name = group.name;
    folder.type = "RollTable";
    folder.folder = null;
    folder.sorting = "a";
    folder.description = folder.description ?? "";
    folder.color = folder.color ?? null;
    folder.flags = folder.flags ?? {};
    folder._stats = baseStats(folder._stats ?? {});
    desiredFolders.push(folder);
    group.tables.forEach((definition) => addTable(definition, folder._id));
  }

  setSorts(desiredFolders);
  const rootTables = desiredTables.filter((table) => table.folder == null);
  const tablesByFolder = new Map();
  for (const table of desiredTables) {
    if (table.folder == null) continue;
    const bucket = tablesByFolder.get(table.folder) ?? [];
    bucket.push(table);
    tablesByFolder.set(table.folder, bucket);
  }
  setSorts(rootTables);
  for (const bucket of tablesByFolder.values()) setSorts(bucket);

  const desiredFolderIds = new Set(desiredFolders.map((folder) => folder._id));
  const desiredTableIds = new Set(desiredTables.map((table) => table._id));
  const desiredResultKeys = new Set(desiredResults.map((result) => `!tables.results!${result._tableId}.${result._id}`));

  return {
    folders: desiredFolders,
    tables: desiredTables,
    results: desiredResults,
    deletedFolderIds: folders.filter((folder) => !desiredFolderIds.has(folder._id)).map((folder) => folder._id),
    deletedTableIds: tables.filter((table) => !desiredTableIds.has(table._id)).map((table) => table._id),
    deletedResultKeys: results
      .map((result) => result._resultKey ?? `!tables.results!${result._tableId}.${result._id}`)
      .filter((key) => !desiredResultKeys.has(key))
  };
}

async function rebuildPack(packPath) {
  if (!fs.existsSync(packPath)) return;
  const packName = packPath.replace(/^packs\//, "").replace(/\.db$/, "");
  if (packName === "appalling-relatives") {
    const { db, folders, tables, results } = await loadRollTableDb(packPath);
    const rebuilt = rebuildRollTablePack(folders, tables, results, APPALLING_RELATIVES_TABLES);
    await writeRollTableDb(db, rebuilt.folders, rebuilt.tables, rebuilt.results, rebuilt.deletedFolderIds, rebuilt.deletedTableIds, rebuilt.deletedResultKeys);
    console.log(`Rebuilt ${packPath}`);
    return;
  }
  if (packName === "insufficiency-rolltables") {
    const { db, folders, tables, results } = await loadRollTableDb(packPath);
    const rebuilt = rebuildRollTablePack(folders, tables, results, INSUFFICIENCY_ROLLTABLES_PACK);
    await writeRollTableDb(db, rebuilt.folders, rebuilt.tables, rebuilt.results, rebuilt.deletedFolderIds, rebuilt.deletedTableIds, rebuilt.deletedResultKeys);
    console.log(`Rebuilt ${packPath}`);
    return;
  }
  if (packName === "betweentimes-tables") {
    const { db, folders, tables, results } = await loadRollTableDb(packPath);
    const rebuilt = rebuildRollTablePack(folders, tables, results, BETWEENTIMES_TABLES_PACK);
    await writeRollTableDb(db, rebuilt.folders, rebuilt.tables, rebuilt.results, rebuilt.deletedFolderIds, rebuilt.deletedTableIds, rebuilt.deletedResultKeys);
    console.log(`Rebuilt ${packPath}`);
    return;
  }

  if (packName === "npc-animals") {
    const { db, folders, actors } = await loadActorDb(packPath);
    const rebuilt = rebuildNpcAnimalsPack(folders, actors);
    await writeActorDb(db, rebuilt.folders, rebuilt.actors, rebuilt.deletedFolderIds, rebuilt.deletedActorIds);
    console.log(`Rebuilt ${packPath}`);
    return;
  }
  if (packName === "npc-humans") {
    const { db, folders, actors } = await loadActorDb(packPath);
    const rebuilt = rebuildNpcHumansPack(folders, actors);
    await writeActorDb(db, rebuilt.folders, rebuilt.actors, rebuilt.deletedFolderIds, rebuilt.deletedActorIds);
    console.log(`Rebuilt ${packPath}`);
    return;
  }
  if (packName === "npc-ordinary-animals") {
    const { db, folders, actors } = await loadActorDb(packPath);
    const rebuilt = rebuildNpcOrdinaryAnimalsPack(folders, actors);
    await writeActorDb(db, rebuilt.folders, rebuilt.actors, rebuilt.deletedFolderIds, rebuilt.deletedActorIds);
    console.log(`Rebuilt ${packPath}`);
    return;
  }
  if (packName === "npc-generic-ordinary-animals") {
    const { db, folders, actors } = await loadActorDb(packPath);
    const rebuilt = rebuildNpcGenericOrdinaryAnimalsPack(folders, actors);
    await writeActorDb(db, rebuilt.folders, rebuilt.actors, rebuilt.deletedFolderIds, rebuilt.deletedActorIds);
    console.log(`Rebuilt ${packPath}`);
    return;
  }
  if (packName === "locations") {
    const { db, folders, journal, pages } = await loadJournalDb(packPath);
    const rebuilt = rebuildLocationsPack(folders, journal, pages);
    await writeJournalDb(
      db,
      rebuilt.folders,
      rebuilt.journal,
      rebuilt.pages,
      rebuilt.deletedFolderIds,
      rebuilt.deletedJournalIds,
      rebuilt.deletedPageKeys
    );
    console.log(`Rebuilt ${packPath}`);
    return;
  }

  const { db, folders, items } = await loadDb(packPath);

  let rebuilt;
  if (packName === "sorts") rebuilt = rebuildSortsPack(folders, items);
  else if (packName === "pets") rebuilt = rebuildPetsPack(folders, items);
  else if (packName === "objects-of-desire") rebuilt = rebuildObjectsOfDesirePack(folders, items);
  else if (packName === "homes") rebuilt = rebuildHomesPack(folders, items);
  else if (packName === "peculiarities") rebuilt = rebuildPeculiaritiesPack(folders, items);
  else if (packName === "knacks") rebuilt = rebuildSimplePack(folders, items, KNACK_DEFAULTS);
  else if (packName === "insufficiencies") rebuilt = rebuildSimplePack(folders, items);
  else {
    await db.close();
    return;
  }

  await writeDb(db, rebuilt.folders, rebuilt.items, rebuilt.deletedFolderIds, rebuilt.deletedItemIds);
  console.log(`Rebuilt ${packPath}`);
}

const requested = new Set(process.argv.slice(2));
for (const packPath of PACK_PATHS) {
  const packName = packPath.replace(/^packs\//, "").replace(/\.db$/, "");
  if (requested.size > 0 && !requested.has(packName)) continue;
  await rebuildPack(packPath);
}
