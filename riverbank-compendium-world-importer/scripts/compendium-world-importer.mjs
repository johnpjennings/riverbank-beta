const MODULE_ID = "riverbank-compendium-world-importer";
const ROOT_FOLDER_FLAG = "__pack_root__";
const IMPORTABLE_DOCUMENT_TYPES = new Set([
  "Actor",
  "Cards",
  "Item",
  "JournalEntry",
  "Macro",
  "Playlist",
  "RollTable",
  "Scene"
]);

Hooks.once("init", () => {
  const defaultSourcePackage = game.system?.id ?? "";

  game.settings.register(MODULE_ID, "sourcePackage", {
    name: "Source Package",
    hint: "System or module ID whose compendium packs should be imported into the world.",
    scope: "world",
    config: true,
    type: String,
    default: defaultSourcePackage
  });

  const activeModule = game.modules.get(MODULE_ID);
  if (activeModule) {
    activeModule.api = {
      importPackageToWorld,
      importPackToWorld,
      promptImport
    };
  }
});

Hooks.on("renderSettings", (_app, html) => {
  if (!game.user?.isGM) return;
  if (html[0]?.querySelector(`[data-action="${MODULE_ID}"]`)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = MODULE_ID;
  button.innerHTML = `<i class="fas fa-file-import"></i> Import Package Compendiums`;
  button.addEventListener("click", () => {
    promptImport().catch((error) => {
      console.error(`${MODULE_ID} | Import prompt failed`, error);
      ui.notifications.error("Compendium import failed. Check the console for details.");
    });
  });

  const footer = html[0]?.querySelector("#settings-documentation")
    || html[0]?.querySelector("#settings-game")
    || html[0]?.querySelector(".tab[data-tab='settings']");

  if (!footer) return;
  footer.appendChild(button);
});

async function promptImport() {
  const sourcePackage = game.settings.get(MODULE_ID, "sourcePackage")?.trim();
  if (!sourcePackage) {
    ui.notifications.warn("Set a Source Package in module settings before importing.");
    return;
  }

  const packs = getImportablePacks(sourcePackage);
  if (!packs.length) {
    ui.notifications.warn(`No importable compendium packs were found for package "${sourcePackage}".`);
    return;
  }

  const packCount = packs.length;
  const skippedPacks = getSkippedPacks(sourcePackage);
  const skippedContent = skippedPacks.length
    ? `<p>Skipping ${skippedPacks.length} unsupported pack${skippedPacks.length === 1 ? "" : "s"}: ${skippedPacks.map((pack) => foundry.utils.escapeHTML(pack.metadata.label ?? pack.collection)).join(", ")}.</p>`
    : "";

  return Dialog.confirm({
    title: "Import Package Compendiums",
    content: `
      <p>Import <strong>${packCount}</strong> compendium pack${packCount === 1 ? "" : "s"} from <strong>${foundry.utils.escapeHTML(sourcePackage)}</strong> into this world?</p>
      <p>Each pack will be placed under its own top-level folder in the correct sidebar tab. Re-running the importer updates existing entries instead of duplicating them.</p>
      ${skippedContent}
    `,
    yes: () => importPackageToWorld({ sourcePackage }),
    defaultYes: true
  });
}

async function importPackageToWorld({ sourcePackage } = {}) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can import compendium entries into the world.");
    return null;
  }

  const packageId = (sourcePackage ?? game.settings.get(MODULE_ID, "sourcePackage") ?? "").trim();
  if (!packageId) {
    ui.notifications.warn("No source package is configured for compendium import.");
    return null;
  }

  const packs = getImportablePacks(packageId);
  if (!packs.length) {
    ui.notifications.warn(`No importable compendium packs were found for package "${packageId}".`);
    return null;
  }

  const summary = {
    packageId,
    packsProcessed: 0,
    foldersCreated: 0,
    foldersUpdated: 0,
    documentsCreated: 0,
    documentsUpdated: 0,
    skippedPacks: getSkippedPacks(packageId).map((pack) => ({
      pack: pack.collection,
      type: pack.documentName
    }))
  };

  ui.notifications.info(`Starting compendium import for "${packageId}".`);

  for (const pack of packs.sort((left, right) => {
    const leftLabel = left.metadata.label ?? left.collection;
    const rightLabel = right.metadata.label ?? right.collection;
    return leftLabel.localeCompare(rightLabel);
  })) {
    await importPackToWorld(pack, summary);
    summary.packsProcessed += 1;
  }

  const message = [
    `Imported ${summary.packsProcessed} pack${summary.packsProcessed === 1 ? "" : "s"}.`,
    `${summary.documentsCreated} created`,
    `${summary.documentsUpdated} updated`,
    `${summary.foldersCreated} folders created`,
    `${summary.foldersUpdated} folders updated`
  ].join(" ");

  console.info(`${MODULE_ID} | Import summary`, summary);
  ui.notifications.info(message);
  return summary;
}

async function importPackToWorld(pack, summary = null) {
  if (!IMPORTABLE_DOCUMENT_TYPES.has(pack.documentName)) {
    return null;
  }

  const worldCollection = getWorldCollection(pack.documentName);
  if (!worldCollection) {
    console.warn(`${MODULE_ID} | No world collection found for ${pack.documentName}. Skipping ${pack.collection}.`);
    return null;
  }

  const documents = await pack.getDocuments();
  const rootFolder = await ensurePackRootFolder(pack, summary);
  const folderMap = await ensurePackFolders(pack, rootFolder, summary);
  const existingDocuments = getExistingDocumentMap(worldCollection, pack.collection);

  for (const document of documents) {
    const targetFolderId = resolveTargetFolderId(document, rootFolder, folderMap);
    const preparedData = prepareDocumentData(document, pack, targetFolderId);
    const existing = existingDocuments.get(document.id);

    if (existing) {
      await existing.update(preparedData);
      if (summary) summary.documentsUpdated += 1;
      continue;
    }

    const documentClass = getDocumentClass(pack.documentName);
    const created = await documentClass.create(preparedData);
    existingDocuments.set(document.id, created);
    if (summary) summary.documentsCreated += 1;
  }

  return {
    pack: pack.collection,
    imported: documents.length
  };
}

function getImportablePacks(sourcePackage) {
  return game.packs.filter((pack) => {
    return getPackPackageId(pack) === sourcePackage && IMPORTABLE_DOCUMENT_TYPES.has(pack.documentName);
  });
}

function getSkippedPacks(sourcePackage) {
  return game.packs.filter((pack) => {
    return getPackPackageId(pack) === sourcePackage && !IMPORTABLE_DOCUMENT_TYPES.has(pack.documentName);
  });
}

function getPackPackageId(pack) {
  return pack.metadata.packageName
    ?? pack.metadata.package
    ?? pack.metadata.packageId
    ?? pack.collection.split(".")[0];
}

function getWorldCollection(documentName) {
  const collections = {
    Actor: game.actors,
    Cards: game.cards,
    Item: game.items,
    JournalEntry: game.journal,
    Macro: game.macros,
    Playlist: game.playlists,
    RollTable: game.tables,
    Scene: game.scenes
  };

  return collections[documentName] ?? null;
}

function getExistingDocumentMap(worldCollection, sourcePack) {
  const map = new Map();
  for (const document of worldCollection.contents ?? []) {
    const sourceId = document.getFlag(MODULE_ID, "sourceId");
    const flaggedPack = document.getFlag(MODULE_ID, "sourcePack");
    if (!sourceId || flaggedPack !== sourcePack) continue;
    map.set(sourceId, document);
  }
  return map;
}

async function ensurePackRootFolder(pack, summary) {
  const existingRoot = game.folders.contents.find((folder) => {
    return folder.type === pack.documentName
      && folder.getFlag(MODULE_ID, "sourcePack") === pack.collection
      && folder.getFlag(MODULE_ID, "sourceFolderId") === ROOT_FOLDER_FLAG;
  });

  const data = {
    name: pack.metadata.label ?? pack.title ?? pack.collection,
    type: pack.documentName,
    folder: null,
    sorting: "a",
    color: null,
    flags: buildFolderFlags(pack, ROOT_FOLDER_FLAG)
  };

  if (existingRoot) {
    await existingRoot.update(data);
    if (summary) summary.foldersUpdated += 1;
    return existingRoot;
  }

  const created = await Folder.create(data);
  if (summary) summary.foldersCreated += 1;
  return created;
}

async function ensurePackFolders(pack, rootFolder, summary) {
  const folderMap = new Map();
  const existingFolders = getExistingFolderMap(pack.collection, pack.documentName);
  const packFolders = [...(pack.folders?.contents ?? [])];

  packFolders.sort((left, right) => {
    return getFolderDepth(left, pack.folders) - getFolderDepth(right, pack.folders);
  });

  for (const packFolder of packFolders) {
    const sourceFolderId = packFolder.id;
    const parentId = packFolder.folder?._id ?? packFolder.folder?.id ?? packFolder.folder ?? null;
    const worldParentId = parentId ? folderMap.get(parentId) ?? rootFolder.id : rootFolder.id;
    const data = {
      name: packFolder.name,
      type: pack.documentName,
      folder: worldParentId,
      sorting: packFolder.sorting ?? "a",
      color: packFolder.color ?? null,
      sort: packFolder.sort ?? 0,
      flags: buildFolderFlags(pack, sourceFolderId)
    };

    const existing = existingFolders.get(sourceFolderId);
    if (existing) {
      await existing.update(data);
      if (summary) summary.foldersUpdated += 1;
      folderMap.set(sourceFolderId, existing.id);
      continue;
    }

    const created = await Folder.create(data);
    if (summary) summary.foldersCreated += 1;
    existingFolders.set(sourceFolderId, created);
    folderMap.set(sourceFolderId, created.id);
  }

  return folderMap;
}

function getExistingFolderMap(sourcePack, documentType) {
  const map = new Map();
  for (const folder of game.folders.contents) {
    if (folder.type !== documentType) continue;
    if (folder.getFlag(MODULE_ID, "sourcePack") !== sourcePack) continue;
    const sourceFolderId = folder.getFlag(MODULE_ID, "sourceFolderId");
    if (!sourceFolderId || sourceFolderId === ROOT_FOLDER_FLAG) continue;
    map.set(sourceFolderId, folder);
  }
  return map;
}

function getFolderDepth(folder, folderCollection) {
  let depth = 0;
  let current = folder;

  while (current?.folder) {
    const parentId = current.folder?._id ?? current.folder?.id ?? current.folder;
    current = folderCollection?.get(parentId) ?? null;
    depth += 1;
  }

  return depth;
}

function resolveTargetFolderId(document, rootFolder, folderMap) {
  const sourceFolderId = document.folder?._id ?? document.folder?.id ?? document.folder ?? null;
  if (!sourceFolderId) return rootFolder.id;
  return folderMap.get(sourceFolderId) ?? rootFolder.id;
}

function prepareDocumentData(document, pack, folderId) {
  const documentClass = getDocumentClass(pack.documentName);
  const importedData = typeof documentClass.fromCompendium === "function"
    ? documentClass.fromCompendium(document, {
      keepId: false
    })
    : document.toObject();

  delete importedData._id;
  delete importedData.folder;
  delete importedData.sort;

  importedData.folder = folderId;
  importedData.flags = foundry.utils.mergeObject(
    importedData.flags ?? {},
    buildDocumentFlags(pack, document.id),
    { inplace: false }
  );

  return importedData;
}

function buildFolderFlags(pack, sourceFolderId) {
  return {
    [MODULE_ID]: {
      sourcePack: pack.collection,
      sourceFolderId
    }
  };
}

function buildDocumentFlags(pack, sourceId) {
  return {
    [MODULE_ID]: {
      sourcePack: pack.collection,
      sourceId
    }
  };
}
