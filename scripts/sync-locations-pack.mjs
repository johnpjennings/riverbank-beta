import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("/Applications/Foundry Virtual Tabletop.app/Contents/Resources/app/node_modules/classic-level");

const SORT_DENSITY = 100000;
const PACK_PATHS = ["packs/locations.db", "packs/locations"];

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
  },
  {
    name: "King's Bridge (and Jubilee Monument)",
    content: `<p>A grey stone span across the River at the Village, the King's Bridge is wide enough for two carriages to pass. Built in the time of George III, the south end debouches into the joining of the Chumham, Oxford, and Salt Roads, which head north, east, and south-southwest, respectively. The Jubilee Monument stands inconveniently at the exact center of the intersection: a Gothic spire about twenty feet tall, erected in celebration of Queen Victoria's Golden Jubilee.</p>`
  },
  {
    name: "Mill Beck",
    content: `<p>A local stream was redirected for several centuries to operate a mill, but when the mill burned down, the stream returned to its older bed. As the Beck approaches the Linewood, it breaks into several streams. One of them, between the modern-day locations of Hatta House and Musty Farm, was rerouted in Roman times to expedite the construction of the old Roman road. But even now the Mire, as the ground between the two residences is called, remains marshy, blooming with lady's smock flowers in the spring.</p>`
  },
  {
    name: "Pook's Hole",
    content: `<p>The stone entranceway to this one-roomed burrow home overlooks the weir. Old Pook, an ancient Newt, lives as much like an ordinary newt as an Animal can without the concerned intervention of their friends. Furnishings are primitive, and contrary to the conventions of Animal hospitality, Pook never invites anyone inside.</p>`
  },
  {
    name: "River Walk",
    content: `<p>A well-trodden pedestrian right of way, the River walk follows the River's course. The path traces the entire length of the River from source to sea, changing in character as it goes. In this area, it is cindered, pounded dirt, technically a towpath where horses and people can pull ropes that haul a canalboat along, as it comes upstream to the Village; west of this, it follows the Village lane past Land's End before transforming into beaten earth. Then it follows the River's south bank until it climbs the hills west of the Island, to get above the deeper banks and gorge upstream.</p>`
  },
  {
    name: "South Wade",
    content: `<p>This small trout stream enters the River at By-the-water. Very small boats can navigate it for a quarter-mile or so south, where a pile of rubble marks a onetime Mercian cot; south of that, fisherfolk wade or angle for trout from the shore. The stream wanders south of the River Bank area, but its source is very close, at the top of Robin's Dun.</p>`
  },
  {
    name: "Wee Lock",
    content: `<p>The Wee Lock is small enough that a boater can move their craft into the lock, climb out, and operate the two doors as needed, before getting back into their boat and floating off. It was built by an inventive Victorian Rabbit ancestor from Littus House, who used concrete and brightly colored pebbles for construction, giving it an oddly piecemeal look.</p>`
  },
  {
    name: "Wendle",
    content: `<p>A charming stream that leads south from the River just by the Island, the Wendle is quite narrow for its flow, because it goes surprisingly deep. One can fish for trout here.</p>`
  },
  {
    name: "Upstream",
    content: `<p>Immediately upstream from the Island, the River gets quite silty, but farther still it clears, narrows, and quickens, passing northwest through steeper banks that become a small gorge. It continues through steep, rough country to end some leagues away in a lake of no particular interest. Following its route becomes quite difficult, but each summer, a number of Humans and Animals set out to walk the River from its mouth to its source, or vice versa.</p><p>Various limestone caves lie upstream of Klippehus.</p>`
  },
  {
    name: "The Triangle",
    content: `<p>The heart of Animal life on the River Bank centers in a roughly triangular area bounded by the Chumham Road on the east, the River on the south, and the old Roman road between the two. From above, one can see the triangle is fringed by the Linewood, a narrow forest that borders the Roman road, as well as the woodlands and water meadows of the River and Mill Beck. Except for the Tippee Connett hill, the land rolls gently, rising to the north in a mix of pastures, tended greens, hardwood coppices, and hedgerows.</p><p>The triangle encloses the Postal Service/Stores, the Nose & Tail pub, Stick Green, and a number of cottages and houses above- and below-ground. The triangle also includes at least one Human settlement: Edwards Farm, which owns a large part of the nearby landsettlery. Humans here see Animals more often than their counterparts in the Village but do not interact much with them. Much of this land is landsettlery, so even fields owned by Humans are used as pasturage, if anything, or left to the Animals' stewardship. Stone fences marking field boundaries accumulate bushes and trees, and hedgerows can grow to five or ten feet across, tiny strip woodlands with their own hidden cottages and paths.</p>`
  },
  {
    name: "Busy's Field",
    content: `<p>Busy is the Edwards's bull, kept in a pasture just south of Edwards Farm. The field lies right in the middle of the most convenient path between the Village and most of the Triangle, and a right of way crosses the pasture while another safer, but slower, one skirts the fences. There has been talk of moving Busy, but the last time anyone attempted this, Busy broke free from the new pasturage and returned to his familiar haunts, destroying three gates and a 1908 Hugo Skedaddle motor-car.</p>`
  },
  {
    name: "Chestnut",
    content: `<p>The Chestnut is a very old sweet chestnut tree that stands alone near the old Roman road. Several Animals make their homes in its branches, the gamemaster is invited to add them, but the most prominent residence, a rambling treehouse, belongs to the Arbus clan: the matriarch, Derrina Fiddlefie Arbus, her husband Howard, and various offspring, cousins, and friends. Distant cousin Timple Arbus is a perennial guest.</p><p>The treehouse comprises seven one-room wooden structures connected with suspended walkways protected from the rain by cedar shingles from a tree in the Wild Wood. The largest space is the kitchen, which has ten-inch Delftware tiles under the iron stove for safety. A spiraling walkway, in steepness somewhere between a ramp and a ladder, encourages visits from Animals who don't climb or fly.</p>`
  },
  {
    name: "Connett Hole",
    content: `<p>A cozy underground home for the Rabbit family, the widowed Mrs Poppy Rabbit and her four kits, lies on the north end of Tippee Connett hill. The lost and much-lamented Mr Rabbit had old-fashioned taste in architecture, so rooms are round or oval with pounded earth floors and walls; Mrs Rabbit does not feel she can entirely displace her husband's careful work, but modernity creeps in, a little each year, as she wallpapers, carpets, and furnishes the space. She takes special pride in her front parlor, decorated with mahogany furniture some centuries old, where she gives lessons in Italian to interested Animals.</p><p>Most socializing with the Connett Hole Rabbits takes place in an open-sided arbor just outside their front door.</p>`
  },
  {
    name: "Cote",
    content: `<p>The Cote is the home of two dowager ladies: the stately Pigeon Mrs Celestine Grey and her busybody Goose friend, Mrs Jammy Porlock. The Cote is a tree house, in that it is a house built in proximity to a tree, but neither Mrs Grey nor Mrs Porlock seems eager to ascend great heights; the Cote is built only about six feet up in an ancient common beech, supported by the lowest of its spreading branches and a robust array of support beams. The six-roomed house has been around since the eighteenth century, only changing as the growing tree has required.</p><p>The Cote is notable for its surprisingly large drawing room, where Mrs Porlock hosts regular gatherings for the many, many Causes she supports. As with most Animals, the Cote does not have servants: Mrs Grey and Mrs Porlock do for themselves, with occasional assistance from Jane Hiver or one of her girls, or one of the Arbuses.</p>`
  },
  {
    name: "Edwards Farm",
    content: `<p>The Edwards Farm, just north of Miller's Wood and the old mill race, is chiefly relevant to Animals for two reasons: the lane connecting the farm with the Chumham Road is part of the easiest, if not the shortest, right of way to the Triangle that keeps your paws dry, and the Edwards's own Busy, a gigantic bull and dire foe, usually to be found, in the most inconvenient way, in Busy's Field, which intersects the direct path between the farm lane and the neighborhood's southern area.</p>`
  },
  {
    name: "Ferry Landing",
    content: `<p>No true ferry uses this landing at the end of Chestnut Walk on the River's north bank, but it has been called the ferry landing for centuries, so perhaps there was one, long ago. The landing is a small wooden dock with a boat pullout a few feet downstream. Often one can find one or more ferry mutts available for use here, though they are as likely to be on the Willows side.</p>`
  },
  {
    name: "Destiny!",
    content: `<p>Destiny!, on no account should you forget the exclamation mark, is a two-room bermed cottage built into the southwest face of Tippee Connett hill, of whitewashed Cotswold stone with a stone roof, a bright red door, and shutters painted with what the owner, Miss Eliza van der Hedgepig, thinks of as Arts-and-Crafts flowers. She's decorated the rooms in a multiplicity of florals scaled for Human residences, which means they are almost unrecognizably large in her small chambers.</p><p>Miss van der Hedgepig lives alone, except when a younger sibling or cousin comes for an extended visit. She keeps her large garden beautifully tended and has won the ribbon for Best Zinnia three years running at the St Aldwin's Day fete. Destiny! is hardly the first name for her cottage; she changes it every few years, most recently from Walden.</p>`
  },
  {
    name: "Littus House",
    content: `<p>One of the larger Animal houses in the area, Littus House lies just across the River from Toad Hall and backs directly onto the old Roman road. The current dweller's doting grandfather constructed this lavish Victorian structure seventy years ago for his wife, with multicolored brick walls, a multiplicity of chimney stacks, and far too many peculiarly shaped windows. Inside there is a music room with quite a number of musical instruments scaled for Animals, the result of the builder's musical leanings, and the only billiards table in the region scaled to Animals.</p><p>A glass and iron conservatory extends from the rear almost to the old Roman road close behind; the owner, Mr Albus Grandry, an older Rabbit, is partial to orchids, about which he corresponds with strangers across the world, exchanging unpleasant-looking scraps of vegetable matter said to be the seeds or dried roots of exotic epiphytes. He hopes to discover a truly new orchid.</p><p>Two staff members keep Littus House for Mr Grandry: a housemaid and cook, Mary Ann Persimmon, and Bill, an odd-jobs Lizard.</p>`
  },
  {
    name: "Miller's Wood",
    content: `<p>The slice of land between the Chumham Road and Mill Beck known as Miller's Wood includes a number of features. The most notable is the old mill race, where the stream was rerouted into a straight sluiceway to more efficiently run the mill built there in medieval times. The mill race was lined in stone and lead, with the old mill about halfway along. In Tudor times, the wood portions of the mill burned down and were never replaced, and the mill race returned to its old channel, leaving a damp strip of land that eventually returned to woodland.</p><p>Mill Beck makes a semicircular curve just before it joins the River, half enclosing a few acres of flat land. It's too low to be useful for farming or husbandry, so it has become a water meadow, with heavy alder and willow as you approach the mill race. Ferret Joe lives somewhere here, though one can find him almost anywhere in the district. A right-of-way passes through this meadow from near the King's Bridge to a plank laid across the Beck, leading to the pubwalk.</p>`
  },
  {
    name: "Mire",
    content: `<p>Once called Caesar's Mire, now just the Mire, this swampy bit of lowland straddles the old Roman road where a stream was rerouted. The lovely-looking woodland of alder and lady's smock has soggy ground and is occasionally haunted by the feral goat known as Satan.</p>`
  },
  {
    name: "Musty Farm",
    content: `<p>Animals usually do not run their own farms: for one thing, they are reluctant to keep livestock, though most Animals eat meat and wear woolens. For another, Humans already do the job so well, so why not just purchase or barter for the things you or your friends can't grow in a garden? Musty Farm is owned by Tom Marten, an adult Weasel who manages his fields and farmyard with the aid of his wife, Rosey, and three farmworkers: Jem, Mike, and Colly. The Martens have three small children, Buttercup, Poppy, and Centaury, all still too small to do more than pull weeds and play.</p><p>A forward-thinking fellow, Tom has outfitted the farm with a small combustion-engine tractor and electrical power for the house and buildings, with a generator. Both break down often and need to be tinkered with. Musty Farm raises a bit of everything the climate permits, but most notably corn, that is, wheat, and a row of hops for the boozing ken. The farmyard is bordered by a small two-story, four-room farmhouse of stone and thatch dating back to Tudor days, with many outbuildings, including a granary and sheds for farm implements. Tom is experimenting with raising quail as poultry, so one always sees ten or twenty of them bustling about the yard, the comparative size of ordinary geese to Humans.</p><p>Musty Farm has a lovely orchard of apples, pears, quinces, and plums, pruned to be accessible to Animals. In August and September, Animals are invited to help collect the fruit, bartering their time for a half of what they collect. In September, as the robins begin to leave for warmer climes, Tom and Rosey host a Harvesthome feast for the Animals of the area.</p>`
  },
  {
    name: "Northern Bank",
    content: `<p>Most of the River's northern bank is a narrow willow-and-alder forest and water meadow continuing west from Mill Beck as far as the Nose & Tail. Paths threaded through this bank lead to informal boat landings. In the summer, the trees and underbrush effectively block the River from view in most of the Triangle. The ferry landing holds a small dock.</p>`
  },
  {
    name: "Nose & Tail",
    content: `<p>No rural English neighborhood is without its pub. The Nose & Tail, a rambling whitewashed-stone public house, stands two stories high at one end. It looks pleasant and familiar, embedded in our cultural DNA, but there are some differences from the BBC mysteries playlist. Most notably, a lot of the wine and beer at the Nose & Tail is packaged for a Human-sized audience, a wine bottle can be almost as tall as a smaller Animal. These huge bottles are kept in a special back room and tapped as kegs would be.</p><p>The taproom is the largest space, paneled in dark walnut and hung with sporting prints and horse brasses, which are very large in an Animal-scaled environment. Ales, wine, and snorts of this or that, usually whiskey or gin, are served from behind the counter. Pub food is also available.</p><p>In a Human pub, the taproom may be traditionally a male domain, not so in Animal pubs. Still, there are cases where an Animal may not wish to be seen drinking, and for them, there is the snuggery. In the Nose & Tail, these are two smaller rooms that open into the taproom, with high frosted glass windows for light. Four Animals can barely squeeze in, with a wooden bench around the walls and a table in the center. A snuggery is seen as slightly fancier than a taproom, so friends celebrating a birthday might choose to eat there.</p><p>The cellars contain an interesting mix of casks and Animal- and Human-sized bottles of beer, wine, and harder liquors.</p><p>The garden is an outdoor space where Animals can sit on long benches or at tables and drink under the stars. A wisteria arbor offers shelter from the summer sun, but when the weather is wet, the garden empties into the taproom.</p><p>The Nose & Tail is managed by Mr Octavian Melius and Mrs Tivolia Miggle, older Heron siblings who inherited the pub from their great-uncle, proof that not every relative is invariably evil. But the real power of the establishment is their young Hedgehog-of-all-work, Penny Plain, who for most of the year cooks, cleans, and serves ale with a sweet enthusiasm that makes up for her tendency to fall asleep in the middle of dinner during the winter months.</p><p>The Nose & Tail opens for limited hours: eleven to three, for luncheon, and six to eleven in the evenings; on Sundays from noon to two, and six to ten. Beers, bitter, mild, porter, stout, and lager, cost fourpence; because almost no imported wine is bottled for Animal scale, only a bottle or two are open at any time, generally a red and a white. Harder tipples also are available. The Nose & Tail, Postal Service/Stores, and Madame Sansonnet's Tea Shoppe are the three interior public spaces where a character is most likely to encounter neighbors.</p>`
  },
  {
    name: "Old Mill",
    content: `<p>One can still see the ruins of the old mill at a turning in the dirt lane that parallels, and predates, the Chumham Road. For modern viewers, it would seem a paltry thing, barely larger than a house, and only the undershot waterwheel gives its purpose away. It has been largely gutted for the stone, but a pile of interesting rubble still remains, along with a cellar that Humans cannot enter, but burrowing Animals can easily access.</p>`
  },
  {
    name: "Old Mill Farm",
    content: `<p>Old Mill Farm has been around as long as there has been a mill. The original miller was a prosperous farmer whose wife decided he could make much more money if he milled his own flour. This turned out to be true, and soon he, then his descendants, were milling everyone else's flour as well. Old Mill Farm is still a working farm, but it has been in the middle of a legal dispute for the last 114 years, so it is run by local laborers overseen by the Squire's steward, just until it gets sorted out.</p>`
  },
  {
    name: "Old Roman Road and the Linewood",
    content: `<p>When the Romans held Britain, they built roads according to their impressive standards, twenty or thirty feet wide and nested in broad ditches, narrowing through the countryside between camps and towns. They rose or fell with the landscape but did not swerve. When the Romans left Britain in 410 AD, the roads remained. Many stayed in use; others were abandoned to the countryside, replaced by routes gentler for wagons and carts, and, later, trains. This section of an old Roman road between Lincoln and Exeter is one of these, used through the first millennium but eventually forgotten except as a pedestrian right of way and bridle path.</p><p>The road through here is intact, twenty feet wide, fashioned of irregular grey flags a foot or so across and edged with a curb. Originally, ditches extended twenty feet on either side, but they have filled in with the centuries to become the Linewood, a double stripe of maples, elm, buckthorn, and elder. Walking along the Roman road can feel very isolated and private, with only glimpses through the underbrush of the hills to the north or the Triangle and River beyond. The Roman road is a popular ramble for Humans; one may see as many as a dozen a day in the summers, carrying rucksacks and even camping in the Linewood. Animals frequent it less often, instead staying on the woodland paths that parallel it.</p>`
  },
  {
    name: "Paths and Rights of Way",
    content: `<p>The Triangle is crisscrossed with informal paths shaped by use and formal rights of way. These are all just trodden earth or trampled grass, following the property lines between fields and often sheltered by a hedgerow, or proceeding across a field at an angle as the shortest distance between two points. The most-used of these paths are the hedgerow lane that runs directly from the ferry landing to the Chestnut, called Chestnut Walk, and the pubwalk, which starts at the Nose & Tail, follows the northern bank, and angles across Busy's Field to connect with the Chumham Road.</p>`
  },
  {
    name: "Postal Service/Stores",
    content: `<p>The Chestnut is partially girdled by half a dozen tiny Tudor and Stuart cottages combined into a single rambling shop, made hazardous by much-worn steps between rooms, abrupt shifts in ceiling height, and very few windows. The Stores takes up the majority of the space, run by Derrina Fiddlefie Arbus with occasional assistance from her husband, Howard, and the younger Arbuses, who handle deliveries, run errands, and generally make themselves useful. A character would find most needs that cannot be met by one's own garden here, everything from lengths of linen and wool, if you do not want to order from Town, to Scottish toffees. The gamemaster can decide how likely the Stores is to have what a character seeks, or whether they will be obliged to try Ye Nook or Tatt's in the Village, or even to order it from elsewhere.</p><p>The Postal Service is an official General Post Office, which sounds very grand but is in fact a short oakwood counter tucked in a corner, with a few dozen pigeonholes for letters on the wall behind. Sending a letter costs a penny. Postmistress Miss Dermott Tasson is quite a young Badger for so great a responsibility, but she performs her duties assiduously and has even learned Morse code so she can take telegrams herself, instead of relying on one of the Arbuses to do it.</p><p>The Postal Service/Stores is the primary nexus for communication between the Animals of the River Bank and the rest of the world: mail and parcels come here, to be delivered on twice-daily rounds by Miss Tasson or one of the Arbuses, if Animals have paid for the convenience with a character-building token. Telegrams are delivered immediately on being received, usually by a younger Arbus, who goes to all lengths to track down the recipient in hopes of a tip. Most notably, the Postal Service/Stores has a new telephone, the only one accessible to all Animals. While not in common use, it does give Appalling Relatives one more way to invade a peace-loving character's life.</p><p>The Postal Service/Stores, the Nose & Tail, and Madame Sansonnet's Tea Shoppe are the three interior public spaces where a character is most likely to encounter neighbors.</p>`
  },
  {
    name: "Stick Green",
    content: `<p>A large open green space, Stick Green is bounded by the River and a short unnamed waterway, the old Roman road, and Chestnut Walk. It is scattered with single trees and small copses, one of them home to the Cote. A crooked path leads from the Nose & Tail to a popular crossing of the old Roman road.</p><p>Residents carefully tend the area closest to the Chestnut, which is used for public fetes and festivals such as the Stick Fair or the King's Official Birthday. Socially minded Animals collect here on pleasant days, gossiping as they stroll.</p><p>South of this area is a treeless space called the cricket pitch, though how well it is tended depends on how the Animals feel about their chances against the Hills eleven in the annual match: if confidence is low, it tends to get overrun with weeds and rugby players.</p>`
  },
  {
    name: "Sunflower Cottage and Private Lending Library",
    content: `<p>This five-room Arts-and-Crafts stone cottage was designed so beautifully to fit in with the landscape that one can hardly distinguish it from its inspirations, except for the comfortable and modern interior. The very pleasant home features two bedrooms upstairs and a sitting room and kitchen down; a spanking-new library, nearly as large as the house, has been added to one side.</p><p>Sunflower Cottage is just a few steps from the ferry landing, on Chestnut Walk. The substantial cottage garden in front remains notably beautiful in all seasons, half concealed by the double row of sunflowers that tower many feet above the cottage's roof. A large vegetable garden behind a withy fence in the back leads to a single glorious oak tree standing alone.</p><p>The inhabitants are Miss Dahlia P. Mole, a Lady Novelist of repute, and her companion, Miss Laetitia Rabbit. Miss Mole always keeps quite busy, but when Miss Rabbit is about, she lends out books for a penny at a time, the total to be paid off once a year, on April 1st.</p>`
  },
  {
    name: "Tippee Connett",
    content: `<p>A small but steep-sided hill rises in the eastern part of the Triangle, girdled by woodlands and topped with a single standing stone more than eight feet in height. Everyone calls the hill, woods, and stone by the stone's proper name: the Tippee Connett. There is absolutely no telling what this name means, though the Rabbits of the area claim it is an ancient reference to their sort.</p><p>The hill has several ancient burrows that Animals can still access, and kits and pups, and adult Animals who ought to know better, like to dare one another to go exploring. Theories abound about what they might hold, an Animal druid's lost temple, a cursed tombyard, ordinary but interesting warrens from centuries past, the last wolf of England, hungry for blood, but to date, no one has found anything.</p>`
  },
  {
    name: "Ye Nook",
    content: `<p>A two-storied house with a ground-story shopfront, this Georgian structure is built of stone, even the gabled roofs. The shopfront has been expanded with a Gothic Revival bay window large enough to contain a bright red Animal-scaled bicycle, a Corbeau Darter. A row of ornamental hedges extends for some yards to either side of the shop, sheltering the impressive herb garden laid out according to Italian principles. Upstairs is a comfortable small flat decorated with the rich colors and flowing lines of Art Nouveau. The shop interior is an Aladdin's cave of odd wonders.</p><p>While one can find everyday needs like yarn, pipe cleaners, and tinned hams in the Postal Service/Stores just a few steps away, Ye Nook contains uncommon or unique objects: antique brocades, bicycles, tins of caviar, toboggan sleds, patent toasters, porcelain mantel ornaments, and fossilized dinosaur bones. If a character is looking for something, it is worthwhile to check here; the gamemaster can determine the likelihood of finding it at Ye Nook.</p><p>The biggest issue with Ye Nook is its debonair Newt proprietor, Wim Wallpaper Wassleford. The shop is his way of proving to his ferocious great-uncle that he is not the wastrel that the old terror seems to think. However, since Great-Uncle Gerbery lives in the westlands somewhere, Wim remains quite casual about things like shop hours and locking the front door. In fact, you are invited to try the door and, if it is open, to help yourself to whatever you were looking for, if he has it, leaving a note. In due time, a bill will arrive. Wim has a pet cockchafer, Jam-Jar, which he sometimes leaves behind in the shop while out and about. If you enter the shop, roll 1d6 to see who is at Ye Nook and what happens.</p><p><strong>Who Is at Ye Nook and What Happens</strong></p><p><strong>1:</strong> Wim is present and will buttonhole you to show you the last ten things he acquired.</p><p><strong>2:</strong> Wim is present but wanders off to leave you to it; he will be hard to retrieve.</p><p><strong>3:</strong> Wim is not present, but Jam-Jar is, and jumps on you, making its deafening buzz; even the simplest activity becomes a middling deed as you attempt to cope with Jam-Jar and the staggering sound. There is a ten percent chance that you will knock over something breakable, and be billed for it.</p><p><strong>4:</strong> Wim is not present, but Jam-Jar is, and flies out the door when you open it. Will you leave Jam-Jar to the depredations of the birds?</p><p><strong>5:</strong> Neither Wim nor Jam-Jar is present.</p><p><strong>6:</strong> The front door is locked, but the back door is not.</p>`
  },
  {
    name: "North of the Linewood",
    content: `<p>North of the old Roman road the land rises more quickly and breaks into wooded hills; if you go far enough to the north and west, you will find yourself in Wales. The Linewood forms a visual boundary between the Triangle's mannerly greens and these wilder uplands, but practically speaking, the homes and businesses here are part of the daily life of the River Bank. Much of this area is also under landsettlery, dominated by sheepwalks: Hatta House, for instance, lies in the center of a sheep pasture and can be reached only by braving the curious herd.</p><p>What the River Bank Animals think of as the neighborhood ends at the Wild Wood, though Animals live there as well. Several small streams start here before they unite into Mill Beck.</p>`
  },
  {
    name: "Hatta House",
    content: `<p>Hatta House is a picture-perfect Gothic Revival building facing southeast, beside a yew-edged pond. Inside, the nine-room, two-story house has a hall, drawing room, study, dining room, and kitchen downstairs, and four bedrooms upstairs, but it was built more than a century ago by a passionate reader of Gothic novels, so everything inside and out is gloriously over the top. The interior boasts masses of carved oak, oversized hearths of exotic stones, hidden passages, medieval-style furnishings, and a series of tapestries woven especially for Hatta House, depicting some of the more exciting scenes from <em>The Castle of Otranto</em>.</p><p>The exterior is a hash of neo-Gothic elements in red brick and the local stone, including a crenellation around the flat roof, towers shaped like everything from castle keeps and church spires to Moorish domes, and windows of various shapes scattered across the facades apparently at random. There is no other Animal home in all of England quite like this, so it is not uncommon for interested Humans or Animals to walk the old Roman road especially to view it or even to paint or draw it. However, no Human would approach, as this would be rude and perhaps subject to criminal charges.</p><p>In any case, Hatta House is shielded by the flock of sheep inhabiting the pasture that surrounds the grounds, known as the Hatta House flock and notable for its persistence and curiosity.</p><p>Hatta House has two occupants: Miss Ina Haigha, an elderly Hare who prides herself on her rudeness and possesses an ever-changing number of pet luna moths, and her Dormouse housemate, Mr Jerome K. Fennel. She obsesses over Auction Bridge and frequently summons characters and nonplayer characters to Hatta House to play, sometimes by sending Mr Fennel to round up anyone in reach. Hatta House also has two staff Animals: the foot-Mouse, Sammy, and the cook, Mrs Streeg, who makes what are incontestably the best seedcakes in the River Bank. Animals are always trying to get her recipe, by hook or by crook, Madame Sansonnet in particular would love to have it.</p>`
  },
  {
    name: "Klippehus",
    content: `<p>The Danish Mallard Peder Norgaard lives at Klippehus, Danish for stone house, pronounced KLEEP-hoos by Peder and Clippy-house by everyone else. A famous artist who came to England years ago to paint landscapes, Peder ended up settling down semi-permanently. Klippehus began life as a Human structure, a cramped two-room cottage that was taken apart, moved, and reassembled on a hillside above the River into a high-ceilinged and spacious Animal cottage. Since then, various additions have arisen: a painting studio with long, very narrow windows contrived from glass left over from a Human greenhouse a mile to the south; a separate kitchen and bakehouse; and a cozy bed-sitting room for Peder's Rat-of-all-work, Emil Emilson.</p><p>Because of Klippehus's comparative remoteness, Peder and Emil often use small boats to visit locations in the Triangle or the Village: Peder uses his small catboat, the Magge, with the mast lowered, and Emil uses a bright blue rowboat that always seems to leak. If the river freezes over, they skate with actual ice skates instead of just sliding along on their paws as other Animals do.</p>`
  },
  {
    name: "Madame Sansonnet's Tea Shoppe",
    content: `<p>The Tea Shoppe is a few chains up Mill Beck from the old Roman road, on a well-beaten path that leads past Reed Cottage. The Tea Shoppe fills the three front rooms of a single-storied cottage of stone. The owner pushed bay windows out from the facade a few years back, in the most elevated Art Nouveau style, and various elegantly drooping trees line the pathway. The worthy proprietress, Madame Sansonnet, a middle-aged Owl, lives in a pleasant single room in the back, absolutely crowded with her mother's collection of china dogs, some of them Human-scaled and therefore very large.</p><p>Years back, Madame Sansonnet, then plain old Jillinella Samson, came from the Hills to start the shop, and it has proven a fabulous success. Aided by a revolving staff of Jane Hiver's girls, she serves luncheons and teas, and caters for Animals who would prefer not to do their own cooking for parties.</p><p>The Tea Shoppe, Postal Service/Stores, and the Nose & Tail are the three interior public spaces where a character is most likely to encounter neighbors.</p>`
  },
  {
    name: "Medieval Tower",
    content: `<p>A small Human castle once stood on Parlement Hill to protect the area during the many wrangles between the English and the Welsh. Now only its keep remains: a tower still more than thirty feet high and about twenty feet square. The door and wooden internal structures have disappeared, but a stone staircase leads up the inside of the walls, past arrow slits, to emerge at last at the rooftop, sheltered by a crenellation a bit too high for Animals to see past without a box to stand on. Still, the tower remains a popular destination for hikes and expeditions. It is not uncommon in the summer to encounter a Human party with an interest in antiquities or the scenery.</p>`
  },
  {
    name: "Old Barn",
    content: `<p>This stone and stone-roofed Human-scaled barn from medieval times, actually a multi-purpose barn and cart-shed, once upon a time, has large doorways on either end, and two bays with the decaying remnants of pre-industrial farm equipment. It is huge by Animal standards: about twenty by fifty feet, with a twenty-foot roof peak.</p><p>The old barn has been largely abandoned by its owner, a Human farmer living a mile or two down the old Roman road. He holds the strip of land bordering the Linewood between Mill Beck and the River, but the Winterses, a Crow family, have landsettlery, so he only uses it as a sheep walk, and leaves the barn open to shelter his flock in inclement weather. Animals occasionally collect there for parties, as it remains delightfully cool and shady on the hottest days; in colder weather, it protects a bonfire from rain. When there is bad weather for the Stick Fair or other events on Stick Green, booths collect here.</p><p>The eaves are a common bad-weather socializing space for Bats and Corvids, even though many of them do not publicly admit to flying.</p>`
  },
  {
    name: "Parlement Hill",
    content: `<p>Parlement Hill is the name for a promontory hill that extends southeast from the northern hills. A medieval tower, built for Humans, stands mostly intact at the highest point. After its collapse and abandonment, the original castle was gutted for dressed stone, but piles of rubble remain, even carved lintels and such that one could dig out. On three sides of the tower, the hill drops off sharply to a U-shaped flat space a few rods wide. Trees grow here in a fringe, and large stones have been dug up and arranged in rows to serve as seating.</p><p>For many centuries, this has been the location of the Parlement of the Birds, where the Animals of the River Bank and environs collect on the 23rd of June to discuss matters relevant to the community. The Parlement has turned into yet another fete, in this case a chance for the different sorts to celebrate their identities with small parades, booths, and competitions.</p><p>A right of way wanders to the tower from the Roman villa to the north, but the most direct route for visitors is the walk up from what is called the tower landing, above the Wee Lock. It is very difficult to climb the irregular terrain of the hill's southern face.</p>`
  },
  {
    name: "Red Square Pen",
    content: `<p>Across the River, on the hill facing Klippehus, Comrade Clive Hiver makes his home in Red Square Pen, a largely unaltered Human one-room cottage. The cottage inglenook, hearth, and windows are scaled for Humans, which means Comrade Hiver's table, comfortable chairs, and feather bed seem a bit overwhelmed even in so small a space; he has remedied this by painting one of the walls with what he claims is a Cubist interpretation of Marx, though no one else in the area knows what he means by either word.</p><p>Comrade Hiver is an adult Stoat rather inclined to poorly understood enthusiasms; Socialism is the latest and greatest of these. He likes people to think of him as a Worker and wears a red scarf in lieu of a tie, but his general theory of Socialism is that other chaps do the work, and he shares in the results. He tries this on regularly with his hard-working sister, Jane Hiver, whose usual response is to send him to Town to get him out from underpaw. Comrade Hiver is only seldom at Red Square Pen, preferring to hover at the Nose & Tail or the Postal Service/Stores, looking for hapless characters to buttonhole about the Cause.</p>`
  },
  {
    name: "Reed Cottage",
    content: `<p>Tucked into the Linewood just north of the old Roman road is Reed Cottage, a five-room home east of where Mill Beck crosses under the road, with two cozy bedrooms under the new-thatched roof. The ground here feels slightly damp; to the west lies an iris garden and the patch of reeds that gives the cottage its name. Reed Cottage is home to Miss Erminia Cupcookie, an adult Mouse; her dear friend, Madame Anthemia, a middle-aged Bat; and her troublesome pet millipede, Flush.</p><p>Madame Anthemia, a seer who can sense the Things That Cannot Be Seen, is famous for her seances and fortune-telling. On the last night of October, she hosts what she calls The Great Seance, always highly entertaining; invitations are hotly pursued. Each December and January, she Goes on Tour, leaving Miss Cupcookie and Flush to their own devices. No one has ever seen any evidence of the tour: she may simply have an Appalling Relative who summons her for the Yule season.</p>`
  },
  {
    name: "Roman Villa",
    content: `<p>The ruins of a Romano-British villa, for Humans, peek out from the edge of the Wild Wood at the end of Strawberry Vale. The villa was built in a U shape that enclosed a lawn facing southeast, with public rooms in the central section, the family's rooms in the north wing, and the kitchen, storage, and servants' quarters in the south wing. It remained in use for some centuries after the Romans withdrew but eventually was abandoned entirely to the grass and ordinary animals, its stones pried out of their concrete and used elsewhere. That said, a great deal of stonework still remains.</p><p>The central and northern sections were heated by a hypocaust, and irregular pillars of mortared stone supported the flagstone floors. Much of the hypocaust has collapsed over the centuries, but adventurous young Animals with the Thrives Underground innate peculiarity go exploring there, digging out parts of the fallen hypocaust to make mazes.</p><p>Several walls still stand, the floorplans evident in the ridges and depressions left in the weed-choked grass. The villa is fenced off from the rest of Strawberry Vale and the Wild Wood to keep grazing sheep from falling into the holes that appear from time to time. A right of way wanders up the east side of the vale and then down its west side, directly to the medieval tower on Parlement Hill. This is a popular ramble for Humans that takes them very close to Reed Cottage and Madame Sansonnet's Tea Shoppe.</p><p>The villa is a favorite summer picnicking spot, but Animals and Humans tell many stories about an ancient beast that sleeps the months away and rises with the new moon to eat anyone foolish enough to stay there overnight. This is nonsense, of course, yet the legend lingers.</p>`
  },
  {
    name: "Strawberry Vale",
    content: `<p>This red-brick-and-stone single-story home looks like a cottage version of the stately homes of eighteenth-century France: a tiny portico of white stone, two tall multi-paned windows on either side, and a white-stone cornice supporting a small false mansard roof, with two chimneys visible above. The structure manages to look elegant, but the interior feels much more comfortable than the architecture implies: five rooms, mostly with golden-oak wainscoting or paneling and various William Morris wallpapers, and worn Victorian furniture draped in burgundy Paisley shawls.</p><p>The house is named for the vale of mixed woodlands that extends from the old Roman road to the ruined Roman villa, a popular place in spring for berrying.</p><p>The inhabitants are Master Musician Miss Dana St Andrews and her brother, Mr Edmund St Andrews, devoted siblings who nevertheless spend most of their time apart. The music room contains a number of instruments scaled for Animals, on which Miss Dana invites interested Animals to practice. When not composing music or playing, she enjoys long rambles in all weather, sometimes with her friend, Mr Badger of The Salts.</p><p>Mr Edmund is also a rambler and very well liked. River Bankers sometimes ask for his aid with unruly Wild Wooders, as everyone knows that Foxes are brave about these sorts of things.</p>`
  },
  {
    name: "Winterhome",
    content: `<p>The Winter family of Crows lives here in a stilt house between three alders. The five-room house is local stone, raised about four feet above the damp ground on pillars. Residents are Dr Antonius Winter; his good wife, Dinah; their son, Diodorus Thrale Winter; and daughter, Miss Polyhymnia Winter. Polyhymnia has a pet bumblebee named Lucian that requires long walks.</p>`
  },
  {
    name: "Wild Wood",
    content: `<p>North of the sheep pastures and hills beyond the Linewood, the Wild Wood is one of the last remnants of England's ancient forests. Many of the oak and ash trees are centuries old. Several rights of way traverse the Wood, but much more is untracked, scattered with bluebell vales, fairy rings, and the barren patches that charcoal burners once used. The Wild Wood considers itself a unique community, with its own pub, the unnamed, because unlicensed, boozing ken, and a cluster of semipermanent homes, called collectively the Hive.</p><p>The wood can seem a bit frightening even during the day, but most Animals and Humans avoid it at night as dangerous. The exceptions are the folks who actually live there, where they remain largely safe from annoying interference by fun-hating members of society, a category not limited to the Law.</p>`
  },
  {
    name: "Boozing Ken",
    content: `<p>This unlicensed tavern operates out of the shattered stump, almost thirty feet in girth, of an enormous oak that blew down some fifty years ago. The walls of the three interior rooms, there is also a beer garden outside, are soft with wood rot and glow slightly.</p><p>The proprietress, a Rook known only as Mrs Lovett, manages her unruly patrons with aplomb, occasionally aided by her pet stag beetle, Brutus; he is large even by the standards of his kind, almost nine inches from his hind feet to the tips of his impressive mandibles. Being unlicensed, Mrs Lovett cannot purchase beer or wine to sell as the Nose & Tail does, so she brews her own ale with hops grown for her at Musty Farm. She also makes wine from brambleberries and blackthorns, and distills brandy and gin, identifiable as such because brandy is the brown fluid and gin the clear. These beverages are all quite terrible, yet the younger Animals harbor a certain fascination with them, and a bottle of Lovett often turns up as part of the gear for a boating expedition or hiking trip.</p>`
  },
  {
    name: "Hive",
    content: `<p>The Hive is not a single residence so much as a cluster of huts, pens, and cots where 1d4+3 Wild Wooders have come to live away from fun-hating River Bankers and Humans. They are not all criminals, but anyone who lives at the Hive is at least crime-adjacent, an aider and abetter. Sadly for the reputations of Corvids and Mustelids everywhere, Crows, Rooks, Stoats, and Weasels seem disproportionately represented at the Hive.</p><p>Any respectable character or nonplayer-character Animal who approaches the Hive is recognized immediately as an outsider. Characters roll 1d10 and refer to the table to learn the consequences of approaching the Hive.</p><p><strong>Consequences of Approaching the Hive</strong></p><p><strong>1-2:</strong> Every inhabitant of the Hive vanishes into the Woods; they do not return until the stranger has departed.</p><p><strong>3-4:</strong> Every Wild Wooder is mysteriously absent without any sign of why.</p><p><strong>5:</strong> All but one inhabitant is gone. The remaining inhabitant, an impudent, quite young Weasel lass named Mimi, takes messages or supplies minimal information. If needed, she whistles and summons back 1d4 Wild Wooders.</p><p><strong>6-7:</strong> 1d4 inhabitants are about, drinking from mysterious square brown bottles.</p><p><strong>8-9:</strong> 1d4 inhabitants are about and act quite fierce and intimidating, trying to frighten characters away.</p><p><strong>10:</strong> 1d4 inhabitants are about and enthusiastically discuss holding any character or characters to ransom. This may just be their little joke, or it may not.</p>`
  },
  {
    name: "The Salts",
    content: `<p>Mr Badger is the only respectable Animal to live within the bounds of the Wild Wood, in a vast burrow halfway up a hill facing south across the Triangle to the River. His family has claimed The Salts for hundreds of years, each generation adding a bedroom here, a new kitchen there, until not even Mr Badger seems entirely sure how many rooms it has. There is no telling how far back into the hill it goes, either; rumors say runs may reach as far as the woods above Hatta House to the east and the Roman villa to the west.</p><p>One story claims The Salts has a ballroom large enough for thirty couples to stand up, but this seems quite unlikely, as there have never been that many River Bank Animals of a dancing age and temperament. This rumor is true, however, perhaps someone might encourage Mr Badger to host a ball.</p>`
  },
  {
    name: "Scuffles's Place",
    content: `<p>Scuffles, actually Samuel T. Eezle, lives in a bole house, quite a snug little pair of rooms stacked one atop the other with a ladder between, filled with furniture he has cobbled together using bits of other, broken, furnishings that householders have asked him to get rid of. A friendly soul, he entertains, whenever someone braves the Wild Wood, by sharing his homemade berry wines at a nearby fairy garden: a circle of stumps carved into the shapes of mushrooms, with a mushroom table at the center.</p>`
  },
  {
    name: "Southern Bank",
    content: `<p>While most River Bank activity happens on the north side of the River, the River walk is on the southern shore, along with several residences, including that stateliest of Animal homes, Toad Hall. The Human Village also lies on the south bank.</p><p>The two banks differ quite a bit. For most of the Triangle, the northern bank is water meadow and wet-loving trees, which conceal the River for much of the distance between the Chumham Road and the old Roman road. The south shore is a few feet higher and thus drier; the only wetlands are upstream by the Island and the Tangle at the ferry landing. However, bands of trees or shrubs do grow alongside the River walk, a few feet wide and often planted in regular rows to make a hedge.</p>`
  },
  {
    name: "By-the-water",
    content: `<p>By-the-water sits at the damp confluence of South Wade and the River, a collection of Tudor and eighteenth-century stone structures attached by covered walkways, which include a large burrow, a bermed three-roomed stone cottage serving as a workshop, and two stilt cottages raised two or three feet above the ground serving as dormitories for Jane Hiver and her girls. Just to the west lie extensive vegetable gardens, a small staddle barn, and a laundry house.</p><p>Everything is spotlessly clean, if overfull of fancy ruffled curtains, handwoven table runners, embroidered linens, painted side tables, and such, all the products of Jane Hiver's girls. The girls are usually petty thieves sent to her by a Human judge with advanced ideas about criminal justice. In Jane's custody, they learn useful domestic skills such as housekeeping, cookery, needlework, and laundry, and many Animals rely on By-the-water's residents for daily help. The girls sometimes pilfer small objects, but only in their first weeks, and they always return them if you tell Jane.</p>`
  },
  {
    name: "Robin's Dun",
    content: `<p>This hill south of the River is tall and steep. A Human farmer on the north side owns the Dun, but from time immemorial, it has been understood that anyone may climb to the top, where a most unusual spring seems to burst from a cleft rock near several pink granitic boulders of unknown origin. The view south from Robin's Dun is spectacular: to the east, the Village and the widening curves of the River downstream; to the south and west, swelling hills visible perhaps as far as Wales; and to the north, the River Bank neighborhood.</p>`
  },
  {
    name: "Tangle",
    content: `<p>As one proceeds upstream from South Wade and By-the-water, the River gives a little jog, leaving a bulge on the south bank between the water's edge and the River walk. This bulge is covered by the Tangle, a small willow wood. A single path leads down to the Willows and a dock, where you can often find a ferry mutt; the end of the dock is visible coming from either direction on the River walk.</p><p>The Tangle is largely white willow, a pale-leafed variety with long, flexible wands that droop to give the distinctive weeping effect. Locals use the wands for withy fences and baskets; Tangle wood is used for the Animals' cricket bats, which they carve themselves.</p>`
  },
  {
    name: "Toad Hall",
    content: `<p>In RiverBank, what tourists like to think of as stately homes can belong to either Humans or Animals, though most are Human. Toad Hall is very stately indeed, a neo-Classical Georgian edifice purportedly designed by the Human architect Isaac Ware for some remote Toad ancestor. The Hall is situated to face the River just where it passes beneath the old Roman road on one long side and, on the other, to have an excellent view of Robin's Dun to the southeast.</p><p>Toad Hall is much too extensive to detail here: suffice to say that the author of a mid-Victorian commissioned history of the venerable Toad family reported nine bedrooms with dressing rooms, a Marble Hall, a powdering room, now a snuggery, and a sweetmeat closet. The extensive gardens include a hedge maze designed for Animals, and thus only waist-high to Humans, and a formal lime, that is, linden, alley that leads down to the River's edge with a boat house and dock.</p><p>The current master of Toad Hall is Mr Toad, supported by a staff of Animals hired from Town, who keep very much to themselves. One sees Mr Toad out and about more often than any of the staff, for he is not at all snobbish. The various outbuildings include several that are Human-scaled: a stable and coach-house, Georgian and Victorian Toads often rode in carriages, a barn, and a dairy and butterhouse. In earlier days, Human workers managed the livestock and lived largely separate lives; now Toad has given up his agriculture and the spaces stand empty.</p>`
  },
  {
    name: "The Willows",
    content: `<p>The Willows, a snug burrow just at the water's edge, lies at the end of a path through the Tangle. It is the home of two Animals: Ratty and his inseparable friend, the Mole. The burrow's main room is a kitchen, sitting room, and pantry, with a flagstone floor and walls and red-curtained windows that open directly over the water. The home's several small bedchambers each has a cupboard bed and a little table and chair, in case creative inspiration comes in the night.</p><p>A small dock just outside the Willows's door allows Ratty to keep his beloved rowing boat ready to traverse or navigate the River at a moment's notice. One commonly finds ferry mutts or other small boats there as well, where Animals have left them for a ramble up Robin's Dun or along the River walk.</p>`
  },
  {
    name: "North of the King's Bridge",
    content: `<p>The area north of the Village and east of the Chumham Road is a Human space, and Animals do not spend much time there in their everyday lives. However, they visit Frondlich Manor each Squiresday (4th October) for a ritual with deep history, when the River Bank Animals acknowledge their ancient connections with the Human world.</p>`
  },
  {
    name: "Frondlich Manor",
    content: `<p>Across the River from the Village stands the residence of Sir John Frondlich, the local Squire; his young son, Stephen, and his twin daughters of marriageable age, Sarah and Susan. The Frondlichs have lived in the district for more than a thousand years, an Anglo-Saxon family that weathered the Norman invasion to retain their importance in the region.</p><p>The remnants of a Norman manor house lie buried somewhere in the aggregation of more recent additions and extensions. The house and its many outbuildings are surrounded by a large park of artistically planted coppices and open green lawns, all fenced in with a low stone wall. The park includes most of nearby Frondlich Hill, which features at its crest a "Grecian temple" in the Baroque manner. A graveled drive leads from the manor's lodge by the Chumham Road.</p><p>Sir John is an easygoing man, especially with Animals. While the wall indicates that this is private property, he never objects to Animals climbing Frondlich Hill or even picnicking. He sees them all as gentry, like himself, and accords them the courtesies he would any Human of a certain social standing. His mare, Diana, breaks free of her pasture often to check on the local Animals.</p>`
  },
  {
    name: "McGregor's Farm",
    content: `<p>While Mr McGregor does farm, raising barley and wheat, locals know him better for his excellent vegetables, which they buy directly from him or in the Village. This Human matters to Animals because of his absolute animosity toward them. Crossing any part of McGregor's Farm is a fifty-fifty proposition; half the time he or his wife, Jane, observes the breach and comes out to pick a fight. Running away is the best response.</p>`
  },
  {
    name: "Quarry Farm and the Quarry",
    content: `<p>The Squire's park encloses the crest of Frondlich Hill but does not come down the western side, perhaps because there is no far side: the western face has for more than a millennium been the site of a stone quarry, and a giant crescent has been gouged from the local rock, leaving cliffs more than eighty feet high at the center. It is still used, though not as much as in earlier centuries.</p><p>The quarry overhangs Quarry Farm, abutting the Chumham Road.</p>`
  },
  {
    name: "The Village",
    content: `<p>The Village does have a name, Lesser Cantrip, but no one calls it this locally: it is the Village. According to the most recent census, the Village and its immediate environs had one hundred eight Human inhabitants. It is as charming as Villages in this part of England usually are: buildings are mostly of local stone or brickwork, with a few half-timbered structures, and roofs are invariably stone or thatch. Most homes or places of business are tucked behind a stone wall, a willow-withy fence wound with flowering vines, or a neatly trimmed hedge. Well-grown trees are found alone or in stands, all with a history of why they are there.</p><p>The Village centers around the Village green, a trapezoid of trimmed grass somewhat encroached upon by buildings and trees, and the Run, a stone-lined ditch that constrains the lowest section of Curl Brook. Three roads meet at the Jubilee Monument at the King's Bridge: the Chumham Road, going north; the Oxford Road, going east; and Salt Road, headed south-southwest. At the south edge of the Village stands the railroad station, which connects the locals to Town to the east, and the Hills to the southwest.</p>`
  },
  {
    name: "Beehive Inn",
    content: `<p>The Beehive is the very model of a modern public inn, providing food and lodging for Humans (and even an Animal-scaled suite), stabling and fodder for horses, and garaging for those with motor-cars or cycles. The ground floor holds a taproom, several private rooms or snuggeries, a dining room, and a kitchen, and upstairs features a handful of guest rooms and the owner's suite. One can access an enclosed paved yard behind the Beehive through an arched gate; a separate building on the other side of the yard houses the stables.</p><p>A very narrow beer garden lies just across the Oxford Road, where regulars can sit under the wisteria arbor and watch passers-by on the road only a few feet to the south, and the River, just to the north. The Beehive has a dock at a slight widening in the River with a green-glass lantern lit during taproom hours (eleven in the morning to three in the afternoon and six to eleven at night; noon to two and six to ten on Sundays). The gregarious innkeeper, Thom Pennant, loves to see Animals, whom he always greets as though they are former regulars only needing a little encouragement to return to their usual seats. It's also common to see his sister, Penelope Pennant, and his dear friend, George Lefevre, at the inn. The Beehive is the Village's respectable drinking establishment; others prefer the Green Man's free-and-loose attitude toward closing times.</p>`
  },
  {
    name: "Deed Cottages",
    content: `<p>The Deed Cottages form a terrace of two-storied row houses, each with four very small rooms. A public-minded Frondlich built them in the early nineteenth century. One is always saved for the postmaster or postmistress (in this case, Miss Flora Thompson); the rest are let to Humans of unimpeachable gentility but small income. The terrace is at an angle, set back from the lane along the east side of the Run.</p>`
  },
  {
    name: "Eliot's Garage/Blacksmith's Forge",
    content: `<p>Only a year or two ago, Jack Eliot took over the forge just beyond where the lane past Land's End leaves Salt Road, a stone's throw from Pansy Cottage. The site has been a smithy for hundreds of years, and Jack still shoes horses and repairs pruning snoots. He recently purchased a motor-car and taught himself to drive and maintain it, as he feels confident that motorized vehicles will replace horses.</p><p>The roofed forge is open-sided, with easy access for horses. At an angle behind it lies the garage, formerly a small Dutch barn, its bays converted for motor-cars. Jack has a petrol tank and occasionally sells fuel to travelers passing through. Across the lane is his house, where he lives with his grandmother, Nana Francesca, and sister Sally.</p>`
  },
  {
    name: "Grammar School",
    content: `<p>The Lesser Cantrip Grammar School teaches reading, writing, arithmetic, moral precepts, and physical education to children between the ages of five and twelve, at which point a child is allowed to leave school forever. The school was purpose-built after an act of Parliament made attendance compulsory in 1880, so it is one of the newest buildings in the Village: plain brick with a peaked roof, large windows, and a phrase carved into the stone lintel of the main entrance: <em>the fate of empires depends on the education of youth</em>.</p><p>What goes on inside the grammar school remains a mystery to all Animals and most adult Humans, but whatever-it-is goes on from early morning to the middle of the afternoon for six days a week, with long breaks at Yule, Easter, and summertime. Currently, seventeen children attend school, sharing a single classroom and teacher, Miss Mary Baines, who has taught Village children for twenty years. Despite her age and the rigors of her profession, she remains endlessly energetic.</p><p>On most school days, the children are escorted across Salt Road to the Village green, where Miss Baines leads them through various physical activities and games. If the children see an Animal during physical-education time, 1d10 of them leave their game to rush to that part of the green closest to the Animal; they do not approach, as Miss Baines's rules are very clear on this point, but it can annoy the Animal.</p>`
  },
  {
    name: "Green Man",
    content: `<p>This is not an inn with rooms for visitors: it is a single taproom (with the same hours as the Beehive) and a room behind, which serves as the tavern's kitchen and residence for publican Will Clark. The Green Man is next door to the Grammar School, which originally was seen as a problem. Some Villagers sought an excuse to shut down the reprehensible gin-mill, but it came to nothing; the school and tavern rigorously ignore one another.</p><p>There is not a garden as such behind the Green Man, but patrons who wish to quaff their ale under the stars drape themselves on the odd bits of wood, broken handcarts, and rubble that Will Clark hoards there. The Beehive, run by Thom Pennant, and the Green Man have a long enmity that manifests in an annual cricket match and the occasional fistfight between patrons.</p>`
  },
  {
    name: "Icehouse",
    content: `<p>The icehouse is a sort of Human burrow, a man-made cave dug into the unnamed hill west of the Village, fronted by a thick stone wall with a single small hatch. During the winter, suppliers bring ice from nearby lakes (the River is not deemed clear enough) and stockpile it. The Beehive Inn, Tatt's, and Frondlich Manor all purchase ice from here. Jack Eliot from Eliot's Garage owns it.</p>`
  },
  {
    name: "Land's End",
    content: `<p>Jeremiah Cavendish, known as the Captain, retired from the sea more than two decades ago to settle in a three-roomed cottage, which he poetically but inaccurately named Land's End. Since then, the cottage has been expanded with a new kitchen, pointed like a ship's bow; the total effect is startling. A former crew member, Preserved McKittrick, keeps it all in apple-pie order.</p><p>The Captain possesses an ordinary African grey parrot, Cato. Cato impresses with a spoken vocabulary composed almost entirely of invective. The Captain always takes Cato with him on his long daily walks; he leaves him outside the door of the Green Man, a favorite haunt, as Cato is banned due to some misbehavior in a bygone year.</p>`
  },
  {
    name: "Lock and Lockhouse",
    content: `<p>The Village's small dam and twenty-foot lock is overlooked by an extremely narrow four-roomed house and its garden. The lockhouse rests on a fifteen-foot-wide sliver of land between the River's stone retaining wall and the Oxford Road. Everything is Cotswold stone; the house has a stone roof.</p><p>The lockkeeper, Ned Parker, never ventures farther away than the Beehive. His wife, Tibby, can run the locks, as well. Their daughter, Lilian, one of the Village's main hazards for Animals, keeps her eye on the King's Bridge and local lanes, pursuing any Animals she sees whenever she can get away from her doting mother.</p><p>Human boaters often lose small articles in the locks: spectacles, purses, metal kettles, and the like. A resourceful Frog, Toad, or Newt, able to breathe underwater, can make large tips by retrieving these objects at the lockkeeper's or boat-owner's request.</p>`
  },
  {
    name: "Old Tithe Barn",
    content: `<p>This medieval barn is the last standing remnant of a Benedictine priory dissolved (then destroyed) in the sixteenth century. Thom Pennant of the Beehive Inn now owns it and uses it to store carriages, motor-cars, and the like. To Animals it seems absolutely gigantic, almost fifty feet high at the roof ridge; quite young Animals that can fly often dare one another to visit the cupola, but the barn's infestation of ordinary bats makes this smelly and not at all fun.</p>`
  },
  {
    name: "Pansy Cottage",
    content: `<p>This three-roomed stone cottage (actually a converted stable), low-ceilinged and whitewashed, is almost hidden behind a yew hedge and a tall stone fence, just where the Salt Road turns south. Old Mrs Grundy lives here with a flock of geese notable for their ferocity and focus, known as the Visigoths. Passers-by can hear their bloodcurdling honks if they are present, but the Visigoths manage to escape their yard several times a week to terrorize Village visitors and inhabitants.</p>`
  },
  {
    name: "Railroad Station, Shed, and Stationmaster's House",
    content: `<p>The railroad station was built some decades ago: a small brick edifice constructed along a standard plan, with a waiting room, ticket office, and baggage room. Several times a day, a branch of the Great Western Railway stops here; the rest of the time, expresses run through at speed. The Stationmaster's house, just across a frontage lane, is almost a perfect cube of the same brick.</p><p>The Stationmaster, Mr Hosea Harbour, has a large family to fill the house: his wife, Mrs Faith Harbour; sister, Mrs Agnes Harbour; mother-in-law Mrs Joy-through-service Abrams; and four Human children (three boys and a girl) known as the Harbour Express.</p><p>A short distance from the station on the other side of the frontage lane stands the station shed, actually a stone barn converted for storing whatever bits and bobs accumulate at a country train station: broken hand-carts, empty discarded crates, and so forth.</p>`
  },
  {
    name: "St Aldwin's, Churchyard, and Vicarage",
    content: `<p>Just south of the crossroad between Salt Road and the Run stands St Aldwin's church, a classic English village church with a belltower and a nave that seats fifty in a pinch. The doors are never locked. The altar piece, a very dramatic Baroque carving of the Crucifixion, is a source of great pride for the Vicar. The churchyard just to the east is small and crowded with the sleeping dead and quite a number of yews.</p><p>The Vicarage south of the church is a Tudor house with a large garden: the Vicar, the Reverend Mr Galen White, feels passionate about hollyhocks and loves experimenting with new strains. He has an ancient spur-thighed ordinary tortoise named Timothea that lives in the garden year-round, and has for as long as he has been here. His widowed sister, Mrs Edwina Collins, keeps house for him with the help of Mrs Underwood, his housekeeper and cook. There are a few Nonconformists in the Village who attend services in Greater Cantrip, most notably Mr Eliot and his family.</p>`
  },
  {
    name: "Surgery/Doctor's House",
    content: `<p>Dr James Christie lives in a two-storied Victorian house with a stone roof next to the Deed Cottages. He's converted the front two rooms into a surgery (what Americans would call the doctor's office) and a waiting room. Anyone who feels under the weather may walk in during surgery hours, between nine and ten in the morning, and five and six in the afternoon, though one also can contact him at any other time, and he will come immediately if not already tending someone else.</p><p>The surgery would seem quite odd to visitors from a later time, outfitted with ordinary Victorian-era furniture; patients are examined on a leather chaise longue. The doctor makes house calls in his gig; he is waiting to purchase a motor-car until the back-roads and lanes are better adapted for them, and until he can afford it, as country doctors make very little.</p><p>Dr Christie lives alone except for his Afghan hound, Ulugh Beg. Ben Tatt's sister, Sophia, keeps house for him, though she stays with her brother across the Run. His nurse and factotum for the practice is Miss Ellen Taylor. Animals stay generally healthy and address most of their ills themselves, but every year or two, they call in the doctor for a serious injury, such as a compound fracture.</p>`
  },
  {
    name: "Tatt's Stores",
    content: `<p>This stone Tudor house has been a shop for more than three hundred years. In the late eighteenth century, an ambitious Tatt pushed out the front of the structure into a large bay with large, many-paned windows, and had the shop name, Tatt's Stores, carved above the lintel. Like the Animals' Postal Service/Stores, Tatt's sells almost anything you can imagine, provided you are not too selective. Tatt's is run by Ben Tatt and his wife Margaret. They have two small children who attend the grammar school: Little Ben, aged eight, and Maggie, seven. His sister, Sophia Tatt, also lives with him in this rambling building, but she works for Dr Christie.</p><p>A corner of the shop serves as the postal office. The postmistress, Miss Flora Thompson, has come to the Village only in the last year and seems delighted to have found herself here. She delivers mail in person, and when parcels for Animals come to the Village instead of the Postal Service/Stores (as occasionally happens), she attempts to track down the sendee and deliver the package directly. She spends her free days tramping about the region. She also has started a lending library for books, collecting unwanted volumes from cottages and homes in the area and investing her small pay in books she thinks others might pay a penny to read, once she is done with them. All Human-scaled, these books can prove very large indeed for an Animal.</p>`
  },
  {
    name: "Village Green and Upper Green",
    content: `<p>Originally the land between the Run and the hill west of the Village, and from the River to what is now the railroad, was all commons, where poor locals without land could graze a cow or two, or raise poultry and other small livestock. In recent centuries, the commons were enclosed, divided, and given new purposes; what remains is a large pasture west of Salt Road that folks still commonly use for livestock, plus some gardening allotments, and the two greens.</p><p>The Village green (also known just as the green; the upper green is always identified as such) is a trapezoid of grass somewhat encroached upon by structures built along the lanes. It is kept mowed, in the summer at any rate, and serves as the locale for many annual events, including the King's Birthday, the St Aldwin's Day fete, and the Mop Fair. Various houses and places of business back onto the green, including Tatt's.</p><p>The upper green, up a gradual slope from the River, is used as well, but more usually for cricket matches and the like. It is not a very good pitch, but then, the Village does not have a very good cricket eleven.</p><p>At the very southern end of the Village green stands a centuries-old red oak, called the King's Oak. Local legend has it that Charles II did not in fact hide from Roundhead soldiers in the Royal Oak in Boscobel Wood some miles to the north, but instead was here. This tale persists despite all testimony to the contrary, including Charles's.</p>`
  },
  {
    name: "The Hills",
    content: `<p>Some miles to the southwest lie the Hills, a region of large downs, with fewer trees than the River Bank. The two areas enjoy many family connections; it's quite common to see Animals on the train, on their way to or from a visit with relatives, or, if someone has the time, to take a week's ramble afoot. The Hills are especially popular for Rabbits and Hares, Birds of every sort (including some Songbirds not described in Chapter One), Foxes, and Stoats. The Animals of the Hills center their life around a hamlet called Heverley Green and rather look down on the River Bankers, who do not have a village of their own.</p><p>Other features of the area include an Iron-Age hill-fort, a double row of standing stones, and an ancient stone shaped like a hexagonal nut, said to act as a passage to fairyland, though sensible Animals are disinclined to give this credence.</p>`
  },
  {
    name: "The Forest",
    content: `<p>The Forest is a very large woodland some distance northeast of the River Bank. It has been Royal land since the sixteenth century, and for centuries it has been restricted to the exclusive use of the King (or Queen). In practice, this means it was used in hunting for sport or meat for the Royal table, and in felling timber for shipbuilding and construction. But it is older even than English Kings, here before the Romans came two thousand years ago. It is one of the last places in England where one might find wild boars, and rumors linger about wolves and bears.</p><p>By ancient tradition and an elaborate set of medieval laws, Animals may use the Forest for certain narrowly defined benefits, such as ye gatherynge dropt limbes of Oke and Asch but no other Tre. In 1779, the Foxes of England sought and gained the right to collect in the Forest in January to more easily meet appropriate partners. Since permanent structures were not permitted, the Foxes built booths, earth-walled enclosures over which one can stretch a canvas roof. Entrepreneurial Foxes outfit the booths for the duration of the short Season; at the end they whisk away all the furnishings until the next year.</p><p>In the last century or so, many Foxes have preferred the relative comforts of spending their Season in Town; but for others, the only correct place to find a mate is the Forest.</p>`
  },
  {
    name: "Town (London)",
    content: `<p>There are many towns in England, of course, but Town almost always means London. Before the trains, most Animals (and Humans) never got more than a few miles from where they were born, and then almost always by walking or riding; with the trains, it became immeasurably easier to travel long distances. Once, Town would have required weeks of travel; now it takes a few hours and a pasteboard ticket.</p><p>Many Animals live in Town. They cluster in London's backwaters, quiet dead-ends, and lanes too narrow for Humans. Their neighborhoods are separated, sometimes by miles, so Town Animals seem quite comfortable with Humans in large numbers, well able to navigate streets and Underground stations teeming with Humans more than twice their size.</p><p>London at this time is one of the great cities of the world, explored by many thousands of works of art, fiction, and nonfiction. It is outside the scope of this book to capture more than a fragment of its possibilities for a roleplaying game, but the Animals of the River Bank do visit when there is a particular reason. The most common reasons are professional (for instance, visiting one's publisher if one is a Famous Novelist, or researching a topic at the British Library), medical (seeing a specialist for an issue that cannot be addressed at home), and shopping (buying things unavailable locally at the desired quality). Here are a few details about places and activities in Town, but much is left for the gamemaster to finesse, based on their own readings and interests. A gamemaster might develop this part of RiverBank with the reading of worthy tomes of history and lore, or they might instead turn to novels and plays set in or about the time. This is a game with talking Animals that can operate motor-cars and write vers libre: surely it is not our place to be pedantic, for all love.</p>`
  },
  {
    name: "Book Shops",
    content: `<p>Many Animals nurture a great passion for reading; a visit to a truly great bookstore can feel like a holy pilgrimage. While most larger bookshops in Town have a section scaled for Animals, several shops cater exclusively to them. The queen of these is Kidderminster's near Charing Cross Road, also the primary publisher for Animal books.</p>`
  },
  {
    name: "Medical Advice",
    content: `<p>Animals seldom need medical care they cannot supply for themselves, and when they do, they usually ask for help from a local Human in general practice, who can set a bone or file a tooth if called upon to do so. But many Animals prefer to be seen by a specialist, and specialists collect in Town like flies on a picnic. Some Human physicians specialize in conditions unique to Animals, like balloon syndrome in Hedgehogs, or hysteria in Hares. There are only a handful of Animal physicians; at the moment only a single school, in Sweden, certifies Animal medical practitioners.</p>`
  },
  {
    name: "Private Clubs",
    content: `<p>Private clubs for Animals are scattered about the posher parts of Town, where members may dine, read, and socialize at their leisure, and where country members may stay while visiting. Class can be as dominant a factor in membership as what sort of Animal you are. Guests of members may be any sort of Animal, but members are usually restricted in some way. These are a few of the Animal clubs in Town:</p><p>The Fauna: Animals of the female persuasion.<br>Guffey's: Gambling club that caters to all sorts.<br>Haver's: Nonraptor Birds.<br>The Lapine Club: Hares and Rabbits.<br>The Mustela Club: Mustelids, including Badgers and Otters, but Foxes may also join.<br>The Nut Club: Squirrels.<br>The Pen &amp; Paw Club: Writers and artists.<br>The Senior Bluebottle and Junior Bluebottle: Amphibians and Reptiles.</p>`
  },
  {
    name: "The Rackham House",
    content: `<p>One of the poshest hotels in Town, the Rackham House is also notable for its accommodations for Animals, with properly scaled rooms, several public rooms, and even some Animal staff. Appalling Relatives who come to Town often end up here, unless they belong to a private club. The Rackham House's three restaurants are very popular.</p>`
  },
  {
    name: "Transport",
    content: `<p>Animals taking the train into Town transfer at Reading and arrive at Paddington Station. At this time, there are many options for getting from place to place across town, all owned by different organizations and with all sorts of overlap:</p><p>Cabs and taxis: Horse-drawn hackney cabs were in use from the seventeenth century on, but in the last decade, motorized taximeter cabs have come into ever-greater use. At the moment, motor-taxis substantially outnumber hackney cabs.</p><p>Omnibuses are London's oldest form of mass transport, nearly a century old by the time of RiverBank. One sees only motor-buses by now, but as recently as a decade ago, horse-drawn omnibuses were common.</p><p>Tramways (cars carried along rails inset into the streets) are mostly electric by now, but a few horse-drawn trams remain in outlying areas.</p><p>The Underground (an electric traction railway that runs underground only in the central parts of London) is commonly used by Animals and Humans. The very first escalators have just been installed, but many travelers remain dubious and take the elevators or the stairs.</p>`
  },
  {
    name: "Zoo",
    content: `<p>It is an ongoing mystery why so many Animals visiting Town like to see the Zoo in Regent's Park, and yet, there they are, eyeing the hooded cobras and the moose, the polar bears in their pond, and the elephants in their house. The Zoological Gardens, which have been around for a century, have just started building outdoor enclosures for their animals, an exciting innovation. Monkey Hill does not even have bars.</p>`
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

async function openDb(packPath) {
  const db = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
  try {
    await db.open();
    return db;
  } catch (error) {
    if (error?.cause?.code !== "LEVEL_LOCKED") throw error;
    await fs.rm(`${packPath}/LOCK`, { force: true });
    const retryDb = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
    await retryDb.open();
    return retryDb;
  }
}

for (const packPath of PACK_PATHS) {
  const db = await openDb(packPath);
  try {
    const journal = [];
    const pages = [];
    for await (const [key, value] of db.iterator()) {
      const doc = JSON.parse(value);
      if (key.startsWith("!journal!")) journal.push(doc);
      else if (key.startsWith("!journal.pages!")) {
        const [, entryId, pageId] = key.match(/^!journal\.pages!([^.]+)\.(.+)$/) ?? [];
        doc._entryId = entryId;
        doc._pageKey = key;
        doc._id = doc._id || pageId;
        pages.push(doc);
      }
    }

    const existingByName = new Map(journal.map((entry) => [entry.name, entry]));
    const desiredJournal = [];
    const desiredPages = [];

    for (const [index, entry] of LOCATIONS.entries()) {
      const existing = existingByName.get(entry.name) ?? {
        name: entry.name,
        pages: [],
        folder: null,
        categories: [],
        sort: 0,
        ownership: { default: 0 },
        flags: {},
        _stats: baseStats(),
        _id: randomId()
      };

      const existingPageId = Array.isArray(existing.pages) ? existing.pages[0] : null;
      const page = pages.find((p) => p._entryId === existing._id && p._id === existingPageId) ?? {
        sort: SORT_DENSITY,
        name: "Description",
        type: "text",
        _id: randomId(),
        system: {},
        title: { show: true, level: 1 },
        image: {},
        text: { format: 1, content: entry.content },
        video: { controls: true, volume: 0.5 },
        src: null,
        category: null,
        ownership: { default: -1 },
        flags: {},
        _stats: baseStats(),
        _entryId: existing._id
      };

      existing.name = entry.name;
      existing.pages = [page._id];
      existing.folder = null;
      existing.categories = [];
      existing.sort = (index + 1) * SORT_DENSITY;
      existing.ownership = existing.ownership ?? { default: 0 };
      existing.flags = existing.flags ?? {};
      existing._stats = baseStats(existing._stats ?? {});

      page.name = "Description";
      page.type = "text";
      page.system = {};
      page.title = { show: true, level: 1 };
      page.image = {};
      page.text = { format: 1, content: entry.content };
      page.video = { controls: true, volume: 0.5 };
      page.src = null;
      page.category = null;
      page.sort = SORT_DENSITY;
      page.ownership = page.ownership ?? { default: -1 };
      page.flags = page.flags ?? {};
      page._stats = baseStats(page._stats ?? {});
      page._entryId = existing._id;

      desiredJournal.push(existing);
      desiredPages.push(page);
    }

    const desiredJournalIds = new Set(desiredJournal.map((entry) => entry._id));
    const desiredPageKeys = new Set(desiredPages.map((page) => `!journal.pages!${page._entryId}.${page._id}`));

    const batch = db.batch();
    for (const entry of desiredJournal) batch.put(`!journal!${entry._id}`, JSON.stringify(entry));
    for (const page of desiredPages) {
      const copy = { ...page };
      delete copy._entryId;
      delete copy._pageKey;
      batch.put(`!journal.pages!${page._entryId}.${page._id}`, JSON.stringify(copy));
    }
    for (const entry of journal) {
      if (!desiredJournalIds.has(entry._id)) batch.del(`!journal!${entry._id}`);
    }
    for (const page of pages) {
      const key = page._pageKey ?? `!journal.pages!${page._entryId}.${page._id}`;
      if (!desiredPageKeys.has(key)) batch.del(key);
    }
    await batch.write();
    console.log(`Synchronized locations pack: ${packPath}`);
  } finally {
    await db.close();
  }
}
