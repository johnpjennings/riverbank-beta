/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BoilerplateActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;
    const stats = systemData.stats ?? {};
    const statKeys = ['charm', 'intrepidity', 'pother', 'sense'];

    systemData.animalityPoetryRange = Number(systemData.animalityPoetryRange) || 0;
    systemData.animalityPoetryRange = Math.max(-8, Math.min(8, systemData.animalityPoetryRange));

    for (const key of statKeys) {
      const stat = stats[key];
      if (!stat) continue;

      stat.sort = Number(stat.sort) || 0;
      stat.peculiarity = Number(stat.peculiarity) || 0;
      stat.elective = Number(stat.elective) || 0;
      stat.computed = stat.sort + stat.peculiarity + stat.elective;
      stat.final = stat.computed;
      stat.delta = 0;
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = systemData.cr * systemData.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const data = { ...this.system };

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Expose each stat at top-level for compact formulas like @charm.final.
    if (data.stats) {
      for (let [k, v] of Object.entries(data.stats)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    this._applyAnimalityPoetryRollPenalties(data);
  }

  /**
   * Apply Animality/Poetry milestone penalties to roll-only data.
   * ±6: -1 Charm, ±4: -1 Sense.
   * @param {object} data
   * @private
   */
  _applyAnimalityPoetryRollPenalties(data) {
    const range = Math.abs(Number(this.system?.animalityPoetryRange) || 0);
    const sensePenalty = range >= 4 ? 1 : 0;
    const charmPenalty = range >= 6 ? 1 : 0;

    if (data.stats?.sense) {
      data.stats.sense.final = (Number(data.stats.sense.final) || 0) - sensePenalty;
    }
    if (data.stats?.charm) {
      data.stats.charm.final = (Number(data.stats.charm.final) || 0) - charmPenalty;
    }
    if (data.sense) {
      data.sense.final = (Number(data.sense.final) || 0) - sensePenalty;
    }
    if (data.charm) {
      data.charm.final = (Number(data.charm.final) || 0) - charmPenalty;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }
}
