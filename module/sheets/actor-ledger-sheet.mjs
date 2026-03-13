import { BoilerplateActorSheet } from './actor-sheet.mjs';

/**
 * Alternate character sheet presentation with the same Riverbank mechanics.
 */
export class RiverbankLedgerActorSheet extends BoilerplateActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [...super.defaultOptions.classes, 'riverbank-character-ledger'],
    });
  }

  /** @override */
  async getData() {
    const context = await super.getData();
    context.isModernSheet = true;
    return context;
  }
}
