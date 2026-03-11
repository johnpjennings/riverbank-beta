import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ClassicLevel } = require("/Applications/Foundry Virtual Tabletop.app/Contents/Resources/app/node_modules/classic-level");

function parseArgs(argv) {
  const args = {};
  for ( let i = 0; i < argv.length; i += 1 ) {
    const arg = argv[i];
    if ( !arg.startsWith("--") ) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    if ( (value == null) || value.startsWith("--") ) {
      args[key] = true;
      continue;
    }
    args[key] = value;
    i += 1;
  }
  return args;
}

async function readWorldJournalNames(dbPath) {
  const db = new ClassicLevel(dbPath, { keyEncoding: "utf8", valueEncoding: "json" });
  const namesById = new Map();
  try {
    await db.open();
    for await (const [key, value] of db.iterator()) {
      if ( key.startsWith("!journal!") ) namesById.set(value._id, value.name);
    }
  } finally {
    await db.close();
  }
  return namesById;
}

async function readCompendiumJournalIds(dbPath) {
  const db = new ClassicLevel(dbPath, { keyEncoding: "utf8", valueEncoding: "json" });
  const idsByName = new Map();
  try {
    await db.open();
    for await (const [key, value] of db.iterator()) {
      if ( key.startsWith("!journal!") ) idsByName.set(value.name, value._id);
    }
  } finally {
    await db.close();
  }
  return idsByName;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const scenePath = args["scene-json"];
  const worldJournalPath = args["world-journal"];
  const compendiumPath = args["compendium-pack"];
  const background = args.background;
  const thumb = args.thumb;

  if ( !scenePath || !worldJournalPath || !compendiumPath ) {
    throw new Error("Usage: node scripts/remap-scene-export.mjs --scene-json <path> --world-journal <path> --compendium-pack <path> [--background <path>] [--thumb <path>]");
  }

  const [sceneRaw, worldNamesById, compendiumIdsByName] = await Promise.all([
    fs.readFile(scenePath, "utf8"),
    readWorldJournalNames(worldJournalPath),
    readCompendiumJournalIds(compendiumPath)
  ]);

  const scene = JSON.parse(sceneRaw);
  const unresolved = [];
  let remapped = 0;

  if ( background ) {
    scene.background ??= {};
    scene.background.src = background;
  }
  if ( thumb ) scene.thumb = thumb;

  for ( const note of scene.notes ?? [] ) {
    if ( !note.entryId ) continue;
    const worldName = worldNamesById.get(note.entryId);
    if ( !worldName ) {
      unresolved.push({ noteId: note._id, worldEntryId: note.entryId, reason: "Missing world journal" });
      continue;
    }
    const compendiumId = compendiumIdsByName.get(worldName);
    if ( !compendiumId ) {
      unresolved.push({ noteId: note._id, worldEntryId: note.entryId, worldName, reason: "Missing compendium journal" });
      continue;
    }
    if ( note.entryId !== compendiumId ) {
      note.entryId = compendiumId;
      remapped += 1;
    }
    note.pageId = null;
  }

  await fs.writeFile(scenePath, `${JSON.stringify(scene, null, 2)}\n`);

  console.log(JSON.stringify({
    scene: path.basename(scenePath),
    remapped,
    background: scene.background?.src ?? null,
    thumb: scene.thumb ?? null,
    unresolved
  }, null, 2));
}

await main();
