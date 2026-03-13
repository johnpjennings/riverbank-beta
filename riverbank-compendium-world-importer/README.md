# Riverbank Compendium World Importer

Standalone Foundry VTT module that imports compendium packs from a package into native world documents.

## What it does

- Imports Actors, Items, Journal Entries, Macros, Playlists, Roll Tables, Scenes, and Cards.
- Places documents in their native sidebar tab.
- Creates one top-level folder per compendium pack, then recreates that pack's internal folder tree beneath it.
- Uses module flags so re-running updates existing imported documents instead of duplicating them.

## How to use

1. Install or move this folder into Foundry's `modules/` directory.
2. Enable the module in your world.
3. Set the module's `Source Package` setting to the system or module ID whose compendiums you want to import.
4. Open the Settings sidebar and click `Import Package Compendiums`.

## API

You can also run the importer from the browser console or a script macro:

```js
await game.modules.get("riverbank-compendium-world-importer").api.importPackageToWorld({
  sourcePackage: "riverbank"
});
```
