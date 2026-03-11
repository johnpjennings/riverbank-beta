import { BoilerplateActorSheet } from './actor-sheet.mjs';

export class BoilerplateNPCSheet extends BoilerplateActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['riverbank', 'sheet', 'actor', 'npc-sheet'],
      width: 500,
      height: 760,
    });
  }

  get template() {
    return 'systems/riverbank/templates/actor/actor-npc-sheet.hbs';
  }

  async getData() {
    const context = await super.getData();
    const category = this._inferNpcCategory();

    context.npcCategory = category;
    context.isAnimalNpc = category === 'animal';
    context.isHumanNpc = category === 'human';
    context.isOrdinaryAnimalNpc = category === 'ordinary-animal';

    return context;
  }

  _inferNpcCategory() {
    const stored = String(this.actor.system?.npcCategory ?? '').trim().toLowerCase();
    if (stored) return stored;

    if (this.actor.system?.attitudeTowardAnimals) return 'human';
    if (this.actor.system?.attitude || this.actor.system?.size || this.actor.system?.variety) return 'ordinary-animal';
    return 'animal';
  }
}
