import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createRequire } from "node:module";

const requireFromFoundry = createRequire(import.meta.url);
const { ClassicLevel } = requireFromFoundry("/Applications/Foundry Virtual Tabletop.app/Contents/Resources/app/node_modules/classic-level");

const SORT_DENSITY = 100000;

const PACKS = [
  "packs/macros.db",
  "packs/macros"
];

const DRAW_BETWEENTIMES_CARD_COMMAND = String.raw`const PREFERRED_DECKS = ["Poker Deck - Light", "Poker Deck - Dark"];
const HAND_NAME = "Poker Hand";
const DECK_IMG = "icons/svg/card-joker.svg";
const BETWEENTIMES_RESULTS = {
  "King of Clubs": "Someone new arrived in the neighborhood specifically to see you. Who are they? Why did they visit you? Did they need something, want to tell you something, or give you something? How long did they stay? Did they stay with you, elsewhere on the River Bank, or at the Beehive Inn in the Village?",
  "Queen of Clubs": "Suddenly it seemed as though everyone wanted to be with you. What changed that made you so interesting? Do you have a skill that improved, or did you add a new skill? Is there a story going around about you? Did you do something exceptionally kind?",
  "Jack of Clubs": "You received a small inheritance from a distant relative you didn’t know about. What was it? Was it delivered to you? How? What did you do with it? Is it a good thing or a white elephant?",
  "Ten of Clubs": "You learned a new story about the River Bank, a ghost story. Where did you read it or hear it? Is it about a place? Did you share it? What did other people think? Are you curious to learn more?",
  "Nine of Clubs": "Ordinary mice got into your pantry! What did you do about it? What was the result? Did your friends help you? How? Have the mice come back? What’s your new solution for storing food?",
  "Eight of Clubs": "You found a piece of machinery that isn’t working. What is it: a bicycle, an apple-peeler, a Franklin stove? Did you repair it or find someone else to do so? Did you give it away? Did you sell it? To whom? What did you do with the proceeds?",
  "Seven of Clubs": "A friend, cousin, sibling, or parent asked you for a favor. Who was it? How did they reach out to you? What was the favor? How hard is it? Did you say yes? What were the consequences? Have you finished it yet?",
  "Six of Clubs": "You saw a good omen. What was it? Was anyone with you? What did they think of it? What do you think it means? Did you talk to anyone about it?",
  "Five of Clubs": "You saw a bad omen. What was it? Was anyone with you? What did they think of it? What do you think it means? Did you talk to anyone about it?",
  "Four of Clubs": "You saw something exceptionally beautiful. What was it? Was anyone with you? What did it change for you?",
  "Three of Clubs": "You discovered something that had been underground. What is it? Is it something lost or hidden? Was it in a cave or burrow, or buried? How did you get it clean? What have you done with it?",
  "Two of Clubs": "In a book you found an old unopened letter. Did you write it and forget to send it? Did someone send it to you and you didn’t open it? Is it directed to someone else? What does it say?",
  "Ace of Clubs": "You ignored something to do with your house, and now it’s a problem. Is it a leak in the roof, a window that won’t latch, a cracked pane of glass? Do you need help to fix it?",
  "King of Diamonds": "You heard that one of your siblings living in the Hills had babies. You are an aunt or uncle. How many babies did they have? Did you make and send a gift? Did you visit or plan to visit?",
  "Queen of Diamonds": "Someone stole or “borrowed” something odd from your pantry or garden. Did they sneak in? Was it a person or an ordinary animal? Was it important? Did they leave something in exchange?",
  "Jack of Diamonds": "The (Human) Constable thought you might be a witness to a minor crime. Did they come to your house or ask you to visit them in the Village? Was the crime a prank? Did you really see anything?",
  "Ten of Diamonds": "You sprained a paw or wing. Did you have to stay home? Did you need help doing things? Did friends bring you gifts or entertain you? Is it better now?",
  "Nine of Diamonds": "You sprained a paw or wing, and your Appalling Relative tried to send a cousin to look after you. Did they warn you or send them unexpectedly? Who were they? Are they still here?",
  "Eight of Diamonds": "You got caught up in the feud between Madame Sansonnet and Madame Anthemia. Why did you get sucked into it? Have you tried to help, avoid it, or something else?",
  "Seven of Diamonds": "You discovered a new hobby. What was it? Is it indoors or outdoors? Are you excited about it? Have you kept it secret from your friends?",
  "Six of Diamonds": "You got over something you have always been self-conscious about. What was it? Did you change it or learn to accept it?",
  "Five of Diamonds": "You ran out of something important that you can purchase only through the mail or by going to Town. What was it? Did you manage to get it?",
  "Four of Diamonds": "An animal wrought havoc in your garden. Was it a pet, a wild animal, or an escaped farm animal? What damage did it do? Has it been stopped?",
  "Three of Diamonds": "Your friends surprised you with something. Why? Was it a gift, event, or action? How did you react?",
  "Two of Diamonds": "You surprised someone you know. Why? Was it for an event, an act, or something else? Did it go as hoped?",
  "Ace of Diamonds": "It’s time for an annual event. What seasonal or social event? What did you do for it? Was it a tradition or something new?",
  "King of Hearts": "You found a document that looks important but you can’t read it. Is it in a foreign language or damaged? Who helped you try to understand it?",
  "Queen of Hearts": "You found out about a relative you didn’t know you had. Why didn’t you know about them? Did you meet them?",
  "Jack of Hearts": "Someone left something with you for safekeeping, but it’s turning out to be difficult. What is it and why is it challenging?",
  "Ten of Hearts": "You started work on an improvement to your home. What are you improving? Did you need supplies or help?",
  "Nine of Hearts": "You’ve grown closer to one of your friends. What brought you closer? What do you do together?",
  "Eight of Hearts": "You received a telegram with news about a far-away relative. Is the news good or bad? Does it affect you?",
  "Seven of Hearts": "You got into a minor disagreement with a neighbor. Who was it? What caused it? Have you resolved it?",
  "Six of Hearts": "You began a major new project such as writing a novel, making pottery, or starting a garden. How hard are you working at it?",
  "Five of Hearts": "You discovered a new plant or mushroom. Where was it? Is it beautiful or useful?",
  "Four of Hearts": "A friend or family member from out of the area came for a short visit. Why were they here? What did you do together?",
  "Three of Hearts": "You decided to perform a charitable action. Did you raise money, make something, or do something else?",
  "Two of Hearts": "Tibbles the cat became obsessed with you for a few days. Why did Tibbles fixate on you? What happened?",
  "Ace of Hearts": "You found where Satan the goat was bedding down. What did you do? Was the goat there?",
  "King of Spades": "You went boating or rambling. Where did you go? What did you see? Did anything go wrong?",
  "Queen of Spades": "You went fishing. Did you catch anything? What did you do with it?",
  "Jack of Spades": "You planned a party for your friends. Why did you host it? Did anything go wrong?",
  "Ten of Spades": "You made something as a gift for a friend. What was it? How long did it take?",
  "Nine of Spades": "You did something to make your home extra cozy. What did you add or build?",
  "Eight of Spades": "You did something unexpected for a friend or neighbor. Was it kindness or a prank?",
  "Seven of Spades": "You found something interesting while rambling and brought it home. What was it?",
  "Six of Spades": "You had a scary dream. What was it about? How did you deal with it?",
  "Five of Spades": "You had a conversation with a Human stranger. Where did you meet them and what did you talk about?",
  "Four of Spades": "You think you saw something strange. Was it a ghost, fairy, or something else?",
  "Three of Spades": "You rescued someone or something. What happened?",
  "Two of Spades": "Someone had to rescue you. What went wrong?",
  "Ace of Spades": "You found a new favorite food or drink. How did you discover it?"
};

async function ensureHand(name) {
  let stack = game.cards.find((cards) => cards.type === "hand" && cards.name === name);
  if ( stack ) return stack;

  [stack] = await Cards.createDocuments([{
    name,
    type: "hand",
    img: DECK_IMG,
    description: name + " created by the Draw Betweentimes Card macro.",
    width: 1,
    height: 1,
    rotation: 0,
    displayCount: true,
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    cards: []
  }]);

  return stack;
}

const deck = PREFERRED_DECKS.map((name) => game.cards.find((cards) => cards.type === "deck" && cards.name === name)).find(Boolean);
const hand = await ensureHand(HAND_NAME);

if ( !deck ) {
  ui.notifications.warn("No poker deck was found. Create Poker Deck - Light or Poker Deck - Dark first.");
  await ChatMessage.create({
    content: "<p><strong>No poker deck was found.</strong> Create <em>Poker Deck - Light</em> or <em>Poker Deck - Dark</em> first.</p>"
  });
  return;
}

if ( !deck.availableCards.length ) {
  ui.notifications.warn(deck.name + " has no cards available to draw.");
  ChatMessage.create({
    content: "<p><strong>" + foundry.utils.escapeHTML(deck.name) + "</strong> exists, but it has no cards to draw yet.</p>"
  });
  return;
}

const [card] = await hand.draw(deck, 1, { chatNotification: false });
await ChatMessage.create({
  content:
    '<section class="riverbank-roll-shell">'
    + '<div class="riverbank-roll-shell__ability">Betweentimes Card</div>'
    + '<div class="riverbank-roll-shell__side-effect-label">' + foundry.utils.escapeHTML(card.name) + '</div>'
    + '<div class="riverbank-roll-shell__side-effect-text">' + foundry.utils.escapeHTML(BETWEENTIMES_RESULTS[card.name] ?? "No Betweentimes result is mapped for this card yet.") + '</div>'
    + '</section>'
});`;

const DRAW_HAPHAZARDRY_CARD_COMMAND = String.raw`const PREFERRED_DECKS = ["Poker Deck - Light", "Poker Deck - Dark"];
const HAND_NAME = "Poker Hand";
const DECK_IMG = "icons/svg/card-joker.svg";
const HAPHAZARDRY_RESULTS = {
  "King of Clubs": "It starts to rain or snow and stays that way. For the rest of the session, +1 modifier to deed difficulty for deeds performed outside.",
  "Queen of Clubs": "The weather gets abruptly better and stays that way. For the rest of the session, -1 modifier to deed difficulty for deeds performed outside.",
  "Jack of Clubs": "It gets blustery. For the rest of the session, +1 modifier to deed difficulty for Attention deeds and any deeds performed outside.",
  "Ten of Clubs": "Everyone gets itchy or uncomfortable. Something in the environment causes physical discomfort. +1 modifier to deed difficulty for all deeds until the coming Haphazardry cycle ends.",
  "Nine of Clubs": "There are pests. Annoying or intimidating insects bother the characters. +1 modifier to deed difficulty for all deeds until the coming Haphazardry cycle ends.",
  "Eight of Clubs": "Something weird happens. A character glimpses or hears something mysterious and unsettling. The group becomes uneasy, adding +1 modifier to deed difficulty for all deeds until the coming cycle ends.",
  "Seven of Clubs": "Everyone gets hungry. If characters stop to eat, deeds for the next hour or two receive +1 difficulty for urgency. If they do not eat, each deed requires rolling 1d6; on a 1 they must summon Pother as their challenge stat.",
  "Six of Clubs": "Time of day matters. Daytime: Diurnal animals +1 to all deeds, nocturnal -1, crepuscular unaffected. Nighttime: Nocturnal +1, diurnal -1, crepuscular unaffected. Dawn/Dusk: Crepuscular +1, others -1.",
  "Five of Clubs": "Things are working out. If someone was performing a deed when the timer went off, they succeed automatically (unless impossible). Otherwise the group stores the benefit and can later reduce one deed's difficulty by one step.",
  "Four of Clubs": "Friendship helps. Until the coming cycle ends, deeds performed alone increase in difficulty. Collaborative deeds become easier.",
  "Three of Clubs": "Let me try first. Until the coming cycle ends, whenever a character attempts a deed, the player to their left must attempt an action first.",
  "Two of Clubs": "All for one. Until the coming cycle ends, all deeds must be collaborative with at least two players.",
  "Ace of Clubs": "Everyone gets flustered. Until the end of the session each character cannot perform one deed category. Roll 1d6: 1 Attention, 2 Braininess, 3 Clever Paws, 4 Discretion, 5 Sway, 6 Valor.",
  "King of Diamonds": "Everyone's a little smelly. Until the end of the session (or until cleaned), Sway deeds and concealment-related deeds increase in difficulty.",
  "Queen of Diamonds": "Something beautiful is seen. The group is distracted by a lovely sight. Everyone gains one Poetry point on the A/P range.",
  "Jack of Diamonds": "Something beautiful is heard. The group hears something moving (birdsong, singing, etc.). Everyone gains one Poetry point on the A/P range.",
  "Ten of Diamonds": "Something unsettles everyone. A startling event frightens the group. Everyone gains one Animality point on the A/P range.",
  "Nine of Diamonds": "Everyone takes a deep breath. Everyone's A/P range resets to 0.",
  "Eight of Diamonds": "Someone is inspired. Characters with Sense 5 or lower must use Poetry points when making A/P range rolls.",
  "Seven of Diamonds": "Someone gets antsy. Characters with Intrepidity 7 or higher must use Animality points when making A/P range rolls.",
  "Six of Diamonds": "Everyone needs a break. If characters rest, future deeds receive urgency penalties. If they do not rest, they gain Animality points each time they perform deeds until resting.",
  "Five of Diamonds": "No one can buy Animality/Poetry points until the coming cycle ends.",
  "Four of Diamonds": "Characters can buy only Animality points until the coming cycle ends.",
  "Three of Diamonds": "Characters can buy only Poetry points until the coming cycle ends.",
  "Two of Diamonds": "Another Animal attaches themselves. An NPC becomes a distraction and lingers until removed or the cycle ends.",
  "Ace of Diamonds": "Another Animal is nosy. An NPC appears and interferes by asking questions and offering unwanted help.",
  "King of Hearts": "Another Animal requires assistance. An NPC arrives needing help with a problem.",
  "Queen of Hearts": "There's a Human. The characters observe or interact with a Human (lost walker, villager, child, or stranger).",
  "Jack of Hearts": "There are many Humans. A group of 2d10 Humans appears nearby (tourists, locals gathering, etc.).",
  "Ten of Hearts": "A pet gets away. A character's pet runs loose and causes chaos. If none have pets, Flurry the millipede escapes.",
  "Nine of Hearts": "Ordinary animals interfere. Livestock, birds, dogs, or other animals disrupt the scene.",
  "Eight of Hearts": "Busy the bull is loose. The bull rampages briefly before being captured.",
  "Seven of Hearts": "The cat comes back. Tibbles the cat becomes a disruptive presence.",
  "Six of Hearts": "Something breaks or spills. An important object breaks or spills and must be replaced or repaired.",
  "Five of Hearts": "Something is lost or mislaid. An object needed for the current activity goes missing.",
  "Four of Hearts": "Someone worries. A character becomes distracted by worry and takes a -1 penalty to deeds until reassured.",
  "Three of Hearts": "Someone has a fit. A character throws a dramatic tantrum or breakdown.",
  "Two of Hearts": "This won't take a minute. A character becomes distracted fixing or investigating something trivial.",
  "Ace of Hearts": "Everyone dodges the consequences of failure. Until the coming cycle ends, failed deeds do not roll on the Failure Side Effects table.",
  "King of Spades": "Everyone knows better. Until the coming cycle ends, characters can perform only Braininess or Discretion deeds.",
  "Queen of Spades": "Deeds, not words. Until the coming cycle ends, characters can perform only Valor or Discretion deeds.",
  "Jack of Spades": "Everyone uses their words. Until the coming cycle ends, characters can perform only Sway deeds.",
  "Ten of Spades": "Challenge stats are predetermined. All deeds use the same challenge stat. Roll 1d4: 1 Charm, 2 Intrepidity, 3 Pother, 4 Sense.",
  "Nine of Spades": "Everyone gets hold of themselves. Everyone's Pother score receives -1 for the rest of the session.",
  "Eight of Spades": "Everyone is frazzled. Everyone's Charm score receives -1 for the rest of the session.",
  "Seven of Spades": "Everyone is cautious. Everyone's Intrepidity score receives -1 for the rest of the session.",
  "Six of Spades": "Everyone is a little imprudent. Everyone's Sense score receives -1 for the rest of the session.",
  "Five of Spades": "Everyone summons Pother. Until the coming cycle ends, all deeds must summon Pother.",
  "Four of Spades": "No one summons Pother until the coming cycle ends.",
  "Three of Spades": "Target numbers are hidden. Players learn the exact target number only after setting their challenge number.",
  "Two of Spades": "Previous Haphazardry effects continue through the next cycle as well.",
  "Ace of Spades": "Knacks do not reset this cycle."
};

async function ensureHand(name) {
  let stack = game.cards.find((cards) => cards.type === "hand" && cards.name === name);
  if ( stack ) return stack;

  [stack] = await Cards.createDocuments([{
    name,
    type: "hand",
    img: DECK_IMG,
    description: name + " created by the Draw Haphazardry Card macro.",
    width: 1,
    height: 1,
    rotation: 0,
    displayCount: true,
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {},
    cards: []
  }]);

  return stack;
}

const deck = PREFERRED_DECKS.map((name) => game.cards.find((cards) => cards.type === "deck" && cards.name === name)).find(Boolean);
const hand = await ensureHand(HAND_NAME);

if ( !deck ) {
  ui.notifications.warn("No poker deck was found. Create Poker Deck - Light or Poker Deck - Dark first.");
  await ChatMessage.create({
    content: "<p><strong>No poker deck was found.</strong> Create <em>Poker Deck - Light</em> or <em>Poker Deck - Dark</em> first.</p>"
  });
  return;
}

if ( !deck.availableCards.length ) {
  ui.notifications.warn(deck.name + " has no cards available to draw.");
  ChatMessage.create({
    content: "<p><strong>" + foundry.utils.escapeHTML(deck.name) + "</strong> exists, but it has no cards to draw yet.</p>"
  });
  return;
}

const [card] = await hand.draw(deck, 1, { chatNotification: false });
await ChatMessage.create({
  content:
    '<section class="riverbank-roll-shell">'
    + '<div class="riverbank-roll-shell__ability">Haphazardry Card</div>'
    + '<div class="riverbank-roll-shell__side-effect-label">' + foundry.utils.escapeHTML(card.name) + '</div>'
    + '<div class="riverbank-roll-shell__side-effect-text">' + foundry.utils.escapeHTML(HAPHAZARDRY_RESULTS[card.name] ?? "No Haphazardry result is mapped for this card yet.") + '</div>'
    + '</section>'
});`;

const CALCULATE_TARGET_NUMBER_COMMAND = `game.riverbank.openTargetNumberCalculator();`;
const HAPHAZARD_TIMER_COMMAND = `game.riverbank.openHaphazardTimer();`;

const MACROS = [
  {
    name: "Draw Betweentimes Card",
    type: "script",
    img: "icons/svg/card-joker.svg",
    scope: "global",
    command: DRAW_BETWEENTIMES_CARD_COMMAND
  },
  {
    name: "Draw Haphazardry Card",
    type: "script",
    img: "icons/svg/card-joker.svg",
    scope: "global",
    command: DRAW_HAPHAZARDRY_CARD_COMMAND
  },
  {
    name: "Calculate Target Number",
    type: "script",
    img: "icons/svg/dice-target.svg",
    scope: "global",
    command: CALCULATE_TARGET_NUMBER_COMMAND
  },
  {
    name: "Haphazard Timer",
    type: "script",
    img: "icons/svg/clockwork.svg",
    scope: "global",
    command: HAPHAZARD_TIMER_COMMAND
  }
];

function randomId(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for ( let i = 0; i < length; i += 1 ) out += chars[bytes[i] % chars.length];
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
  await fs.mkdir(packPath, { recursive: true });
  const db = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
  try {
    await db.open();
    return db;
  } catch (error) {
    if ( error?.cause?.code !== "LEVEL_LOCKED" ) throw error;
    await fs.rm(`${packPath}/LOCK`, { force: true });
    const retryDb = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "utf8" });
    await retryDb.open();
    return retryDb;
  }
}

async function syncPack(packPath) {
  const db = await openDb(packPath);
  try {
    const existing = [];
    for await (const [key, value] of db.iterator()) {
      if ( !key.startsWith("!macros!") ) continue;
      existing.push(JSON.parse(value));
    }

    const existingByName = new Map(existing.map((macro) => [macro.name, macro]));
    const desired = [];

    for ( const [index, source] of MACROS.entries() ) {
      const macro = existingByName.get(source.name) ?? {
        _id: randomId(),
        author: null,
        folder: null,
        ownership: { default: 0 },
        flags: {},
        _stats: baseStats()
      };

      desired.push({
        ...macro,
        name: source.name,
        type: source.type,
        img: source.img,
        scope: source.scope,
        command: source.command,
        folder: null,
        sort: (index + 1) * SORT_DENSITY,
        ownership: macro.ownership ?? { default: 0 },
        flags: macro.flags ?? {},
        _stats: baseStats(macro._stats ?? {})
      });
    }

    const keepKeys = new Set(desired.map((macro) => `!macros!${macro._id}`));
    const operations = [];
    for await (const [key] of db.iterator()) {
      if ( key.startsWith("!macros!") && !keepKeys.has(key) ) operations.push({ type: "del", key });
    }
    for ( const macro of desired ) {
      operations.push({
        type: "put",
        key: `!macros!${macro._id}`,
        value: JSON.stringify(macro)
      });
    }

    if ( operations.length ) await db.batch(operations);
  } finally {
    await db.close();
  }
}

for ( const packPath of PACKS ) await syncPack(packPath);
console.log("Synchronized macros pack.");
