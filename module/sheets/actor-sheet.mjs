import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BoilerplateActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['riverbank', 'sheet', 'actor'],
      width: 980,
      height: 760,
    });
  }

  /** @override */
  get template() {
    return `systems/riverbank/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.playerDisplay = game.users
      .filter((u) => this.actor.testUserPermission(u, "OWNER"))
      .map((u) => u.name)
      .join(", ");

    // Adding a pointer to CONFIG.RIVERBANK
    context.config = CONFIG.RIVERBANK;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    context.characterFeatures = context.characterFeatures ?? {
      innate: [],
      personal: [],
      knack: [],
      insufficiency: [],
      uncategorized: [],
    };
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };
    const characterFeatures = {
      innate: [],
      personal: [],
      knack: [],
      insufficiency: [],
      pet: [],
      uncategorized: [],
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
        const category = this._normalizeFeatureCategory(i.system?.category);
        if (category === 'personal') {
          i.system = i.system ?? {};
          i.system.sheetDescription = this._buildPersonalPeculiarityDescription(i);
        }
        if (category === 'pet') {
          i.system = i.system ?? {};
          i.system.sheetDescription = this._buildPetDescription(i);
        }
        (characterFeatures[category] ?? characterFeatures.uncategorized).push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.characterFeatures = characterFeatures;
  }

  /**
   * Normalize feature categories so legacy values still map to sheet sections.
   *
   * @param {string} rawCategory Potential category value from item system data
   * @returns {'innate'|'personal'|'knack'|'insufficiency'|'pet'|'sort'|'uncategorized'}
   */
  _normalizeFeatureCategory(rawCategory) {
    const value = String(rawCategory ?? '')
      .trim()
      .toLowerCase();

    if (value === 'innate' || value === 'innatepeculiarity') return 'innate';
    if (value === 'personal' || value === 'personalpeculiarity') return 'personal';
    if (value === 'knack' || value === 'knacks') return 'knack';
    if (value === 'insufficiency' || value === 'insufficiencies') return 'insufficiency';
    if (value === 'pet' || value === 'pets') return 'pet';
    if (value === 'sort' || value === 'sorts') return 'sort';
    return 'uncategorized';
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      await this._removeFeatureBonusesFromCharacter(item);
      await item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));
    html.on('change', '.rb-knack-used', this._onKnackUsedChange.bind(this));
    html.on('click', '.rb-feature-toggle', this._onFeatureToggle.bind(this));
    html.on('input change', '.rb-ap-slider', this._onAnimalityPoetrySliderInput.bind(this));
    html.find('[data-sort-drop-zone]').each((_, element) => {
      element.addEventListener('dragover', this._onSortDropZoneDragOver.bind(this));
      element.addEventListener('dragenter', this._onSortDropZoneDragOver.bind(this));
      element.addEventListener('drop', this._onSortDropZoneDrop.bind(this));
    });

    html.find('.rb-ap-slider').each((_, element) => this._syncAnimalityPoetryIndicator(element));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    let name = `New ${type.capitalize()}`;
    if (type === 'feature' && data.category) {
      name = `New ${String(data.category).capitalize()}`;
    }
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];
    if (Object.hasOwn(itemData.system, 'usedThisCycle')) {
      itemData.system.usedThisCycle = itemData.system.usedThisCycle === 'true';
    }

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Intercept sort drops on explicit sort zones before the default ActorSheet
   * item-drop workflow creates embedded items.
   * @param {DragEvent} event
   * @returns {Promise<void>}
   * @override
   */
  async _onDrop(event) {
    if (this.actor.type === 'character') {
      const item = await this._resolveDroppedItem(event);
      if (item?.type === 'feature') {
        const category = this._normalizeFeatureCategory(
          item.system?.category ?? item.system?.peculiarityType
        );
        if (category === 'sort') {
          event.preventDefault();
          event.stopPropagation();
          await this._applySortToCharacter(item);
          await this._replaceInnatePeculiaritiesForSort(item.name);
          this.render(false);
          return;
        }

        if (item.parent?.id !== this.actor.id) {
          event.preventDefault();
          event.stopPropagation();
          const createdItem = await this._createDroppedFeatureItem(item);
          if (!createdItem) return;

          if (category === 'personal' || category === 'innate') {
            await this._applyFeatureBonusesToCharacter(createdItem);
          }

          this.render(false);
          return;
        }
      }
    }

    return super._onDrop(event);
  }

  /**
   * Handle dropping an Item onto the actor.
   * If the dropped item is a Sort, auto-apply core fields and innate peculiarities.
   * @override
   */
  async _onDropItem(event, data) {
    const created = await super._onDropItem(event, data);

    const droppedItem = Array.isArray(created) ? created[0] : created;
    if (!droppedItem) return created;
    if (this.actor.type !== 'character') return created;
    const droppedId = droppedItem.id ?? droppedItem._id ?? null;
    if (droppedId) await new Promise((resolve) => setTimeout(resolve, 0));
    const actorItem = (droppedId && this.actor.items.get(droppedId))
      || this.actor.items.find((item) => item.name === droppedItem.name && item.type === droppedItem.type)
      || droppedItem;
    if (actorItem.type !== 'feature') return created;
    const category = this._normalizeFeatureCategory(
      actorItem.system?.category ?? actorItem.system?.peculiarityType
    );
    if (category !== 'sort') {
      if (category === 'personal' || category === 'innate') {
        await this._applyFeatureBonusesToCharacter(actorItem);
      }
      this.render(false);
      return created;
    }

    await this._applySortToCharacter(actorItem);
    await this._replaceInnatePeculiaritiesForSort(actorItem.name);
    await actorItem.delete();

    return created;
  }

  /**
   * Create a new embedded feature item from a dropped source item.
   * Used to avoid compendium-drop timing issues before choice dialogs render.
   * @param {Item} item
   * @returns {Promise<Item|null>}
   * @private
   */
  async _createDroppedFeatureItem(item) {
    if (!item || item.type !== 'feature') return null;
    const itemData = item.toObject ? item.toObject() : foundry.utils.deepClone(item);
    delete itemData._id;
    itemData.folder = null;
    itemData.sort = 0;
    itemData.flags = itemData.flags ?? {};
    itemData.effects = Array.isArray(itemData.effects) ? itemData.effects : [];
    const created = await this.actor.createEmbeddedDocuments('Item', [itemData]);
    return Array.isArray(created) ? created[0] ?? null : created ?? null;
  }

  /**
   * Allow explicit sort-drop zones to accept dragged compendium items.
   * @param {DragEvent} event
   * @private
   */
  _onSortDropZoneDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  /**
   * Apply a dropped Sort directly when it lands on a sort-specific sheet zone.
   * This avoids browser input drops swallowing the actor sheet drop flow.
   * @param {DragEvent} event
   * @private
   */
  async _onSortDropZoneDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.actor.type !== 'character') return;

    const item = await this._resolveDroppedItem(event);
    if (!item || item.type !== 'feature') return;

    const category = this._normalizeFeatureCategory(
      item.system?.category ?? item.system?.peculiarityType
    );
    if (category !== 'sort') return;

    await this._applySortToCharacter(item);
    await this._addInnatePeculiaritiesForSort(item.name);
    this.render(false);
  }

  /**
   * Resolve dropped item data from actor items, compendium entries, or raw UUID drag payloads.
   * @param {DragEvent} event
   * @returns {Promise<Item|null>}
   * @private
   */
  async _resolveDroppedItem(event) {
    let dropData = null;

    try {
      dropData = TextEditor.getDragEventData(event);
    } catch {
      dropData = null;
    }

    if (!dropData) {
      const raw = event.dataTransfer?.getData('text/plain');
      if (raw) {
        try {
          dropData = JSON.parse(raw);
        } catch {
          dropData = null;
        }
      }
    }

    if (!dropData) return null;

    const itemClass = getDocumentClass('Item');
    return itemClass.fromDropData(dropData).catch(async () => {
      if (dropData?.uuid) {
        const doc = await fromUuid(dropData.uuid).catch(() => null);
        return doc?.documentName === 'Item' ? doc : null;
      }
      return null;
    });
  }

  /**
   * Apply a dropped Sort item to actor profile and preliminary stats.
   * @param {Item} sortItem
   * @private
   */
  async _applySortToCharacter(sortItem) {
    const sourceSystem = await this._resolveSortSystem(sortItem);
    const stats = sourceSystem?.preliminaryStats ?? {};
    await this.actor.update({
      "system.profile.sort": sortItem.name,
      "system.profile.size": sourceSystem?.size ?? '',
      "system.profile.bestTimeOfDay": sourceSystem?.timeOfDay ?? '',
      "system.profile.sociability": sourceSystem?.sociability ?? '',
      "system.stats.charm.sort": Number(stats.charm) || 0,
      "system.stats.intrepidity.sort": Number(stats.intrepidity) || 0,
      "system.stats.pother.sort": Number(stats.pother) || 0,
      "system.stats.sense.sort": Number(stats.sense) || 0,
    });
  }

  /**
   * Resolve a Sort's system data, preferring dropped item data and falling back
   * to the Sorts compendium entry by name.
   * @param {Item} sortItem
   * @returns {Promise<object>}
   * @private
   */
  async _resolveSortSystem(sortItem) {
    const dropped = sortItem.system ?? {};
    const resolved = foundry.utils.deepClone(this._getSortFallbackData(sortItem.name));

    const pack = game.packs.get('riverbank.sorts');
    let compendiumSystem = {};
    if (pack) {
      const docs = await pack.getDocuments();
      const match = docs.find(
        (doc) =>
          doc.type === 'feature' &&
          String(doc.name).toLowerCase() === String(sortItem.name).toLowerCase()
      );
      compendiumSystem = match?.system ?? {};
    }

    const sources = [compendiumSystem, dropped];
    for (const source of sources) {
      const size = String(source?.size ?? '').trim();
      if (size) resolved.size = size;

      const timeOfDay = String(source?.timeOfDay ?? '').trim();
      if (timeOfDay) resolved.timeOfDay = timeOfDay;

      const sociability = String(source?.sociability ?? '').trim();
      if (sociability) resolved.sociability = sociability;

      const prelim = source?.preliminaryStats ?? {};
      for (const key of ['charm', 'intrepidity', 'pother', 'sense']) {
        if (Number.isFinite(Number(prelim[key]))) {
          resolved.preliminaryStats[key] = Number(prelim[key]);
        }
      }
    }

    return resolved;
  }

  /**
   * Built-in fallback seed for known first-batch sorts.
   * @param {string} sortName
   * @returns {object}
   * @private
   */
  _getSortFallbackData(sortName) {
    const table = {
      badger: {
        size: 'Large',
        timeOfDay: 'Nocturnal',
        sociability: 'Solitary',
        preliminaryStats: { charm: 4, intrepidity: 3, pother: 2, sense: 6 },
      },
      bat: {
        size: 'Diminutive to Small (impressive wingspan)',
        timeOfDay: 'Nocturnal',
        sociability: 'Colony or Flock',
        preliminaryStats: { charm: 2, intrepidity: 4, pother: 3, sense: 6 },
      },
      crow: {
        size: 'Medium',
        timeOfDay: 'Diurnal',
        sociability: 'Colony or Flock',
        preliminaryStats: { charm: 4, intrepidity: 6, pother: 3, sense: 2 },
      },
      magpie: {
        size: 'Medium',
        timeOfDay: 'Diurnal',
        sociability: 'Colony or Flock',
        preliminaryStats: { charm: 4, intrepidity: 6, pother: 3, sense: 2 },
      },
      fox: {
        size: 'Large',
        timeOfDay: 'Crepuscular or Nocturnal',
        sociability: 'Small Group',
        preliminaryStats: { charm: 5, intrepidity: 5, pother: 2, sense: 3 },
      },
      frog: {
        size: 'Diminutive',
        timeOfDay: 'Crepuscular',
        sociability: 'Seasonal Flocking',
        preliminaryStats: { charm: 2, intrepidity: 5, pother: 6, sense: 2 },
      },
      toad: {
        size: 'Diminutive',
        timeOfDay: 'Crepuscular',
        sociability: 'Seasonal Flocking',
        preliminaryStats: { charm: 2, intrepidity: 5, pother: 6, sense: 2 },
      },
      hare: {
        size: 'Medium',
        timeOfDay: 'Crepuscular',
        sociability: 'Small Group',
        preliminaryStats: { charm: 3, intrepidity: 4, pother: 4, sense: 4 },
      },
      rabbit: {
        size: 'Medium',
        timeOfDay: 'Crepuscular',
        sociability: 'Small Group',
        preliminaryStats: { charm: 3, intrepidity: 4, pother: 4, sense: 4 },
      },
      hedgehog: {
        size: 'Medium',
        timeOfDay: 'Nocturnal',
        sociability: 'Solitary',
        preliminaryStats: { charm: 2, intrepidity: 4, pother: 3, sense: 5 },
      },
      lizard: {
        size: 'Small',
        timeOfDay: 'Diurnal',
        sociability: 'Solitary',
        preliminaryStats: { charm: 2, intrepidity: 4, pother: 3, sense: 5 },
      },
      newt: {
        size: 'Small',
        timeOfDay: 'Diurnal',
        sociability: 'Solitary',
        preliminaryStats: { charm: 2, intrepidity: 4, pother: 3, sense: 5 },
      },
      mole: {
        size: 'Small',
        timeOfDay: 'Diurnal or Nocturnal',
        sociability: 'Solitary',
        preliminaryStats: { charm: 3, intrepidity: 3, pother: 2, sense: 6 },
      },
      otter: {
        size: 'Large',
        timeOfDay: 'Diurnal or Crepuscular',
        sociability: 'Small Group',
        preliminaryStats: { charm: 3, intrepidity: 5, pother: 4, sense: 3 },
      },
      owl: {
        size: 'Small to Medium',
        timeOfDay: 'Nocturnal',
        sociability: 'Solitary',
        preliminaryStats: { charm: 3, intrepidity: 3, pother: 2, sense: 6 },
      },
      squirrel: {
        size: 'Small',
        timeOfDay: 'Diurnal',
        sociability: 'Small Group',
        preliminaryStats: { charm: 3, intrepidity: 4, pother: 4, sense: 3 },
      },
      stoat: {
        size: 'Small',
        timeOfDay: 'Diurnal or Crepuscular',
        sociability: 'Small Group',
        preliminaryStats: { charm: 3, intrepidity: 5, pother: 4, sense: 2 },
      },
      weasel: {
        size: 'Small',
        timeOfDay: 'Diurnal or Crepuscular',
        sociability: 'Small Group',
        preliminaryStats: { charm: 3, intrepidity: 5, pother: 4, sense: 2 },
      },
    };
    return table[String(sortName ?? '').toLowerCase()] ?? {
      size: '',
      timeOfDay: '',
      sociability: '',
      preliminaryStats: { charm: 0, intrepidity: 0, pother: 0, sense: 0 },
    };
  }

  /**
   * Apply feature bonuses to actor stats when a peculiarity is dropped.
   * Supports static bonuses and choice-based bonus dialogs.
   * @param {Item} featureItem
   * @returns {Promise<void>}
   * @private
   */
  async _applyFeatureBonusesToCharacter(featureItem) {
    const choiceBonuses = Array.isArray(featureItem.system?.choiceBonuses)
      ? featureItem.system.choiceBonuses
      : [];
    const selectedChoices = [];

    for (const choice of choiceBonuses) {
      const selected = await this._promptChoiceBonus(featureItem, choice);
      if (selected === null) {
        await featureItem.delete();
        return;
      }
      selectedChoices.push(selected.label ?? 'Choice');
    }

    await this._syncPersonalFeatureState(featureItem, selectedChoices);
  }

  /**
   * Remove personal peculiarity bonuses from actor stats when the item is deleted.
   * @param {Item} item
   * @returns {Promise<void>}
   * @private
   */
  async _removeFeatureBonusesFromCharacter(item) {
    if (!item || item.type !== 'feature') return;
    const category = this._normalizeFeatureCategory(
      item.system?.category ?? item.system?.peculiarityType
    );
    if (category !== 'personal') return;

    const appliedBonuses = this._getAppliedBonuses(item);
    if (appliedBonuses.length === 0) return;

    const system = foundry.utils.deepClone(this.actor.system);
    system.stats = system.stats ?? {};
    for (const key of ['charm', 'intrepidity', 'pother', 'sense']) {
      system.stats[key] = system.stats[key] ?? {};
      system.stats[key].peculiarity = Number(system.stats[key].peculiarity) || 0;
    }

    for (const bonus of appliedBonuses) {
      const statKey = this._normalizeStatKey(bonus?.stat);
      if (!statKey) continue;
      const value = Number(bonus?.value);
      if (!Number.isFinite(value)) continue;
      system.stats[statKey].peculiarity -= value;
    }

    await this.actor.update({ system });
  }

  /**
   * Recalculate a personal peculiarity's applied bonuses and keep the actor/item in sync.
   * @param {Item} featureItem
   * @param {string[]|null} nextSelectedChoices
   * @returns {Promise<void>}
   * @private
   */
  async _syncPersonalFeatureState(featureItem, nextSelectedChoices = null) {
    if (!featureItem || featureItem.type !== 'feature') return;
    const category = this._normalizeFeatureCategory(
      featureItem.system?.category ?? featureItem.system?.peculiarityType
    );
    if (category !== 'personal') return;

    const previousBonuses = this._getAppliedBonuses(featureItem);
    const selectedChoices = nextSelectedChoices ?? (
      Array.isArray(featureItem.system?.selectedChoices) ? featureItem.system.selectedChoices : []
    );
    const selectedOptions = this._getSelectedChoiceOptions(featureItem, selectedChoices);
    const nextBonuses = this._getAppliedBonuses(featureItem, selectedChoices);

    const system = foundry.utils.deepClone(this.actor.system);
    system.stats = system.stats ?? {};
    for (const key of ['charm', 'intrepidity', 'pother', 'sense']) {
      system.stats[key] = system.stats[key] ?? {};
      system.stats[key].peculiarity = Number(system.stats[key].peculiarity) || 0;
    }

    for (const bonus of previousBonuses) {
      const statKey = this._normalizeStatKey(bonus?.stat);
      const value = Number(bonus?.value);
      if (!statKey || !Number.isFinite(value)) continue;
      system.stats[statKey].peculiarity -= value;
    }

    for (const bonus of nextBonuses) {
      const statKey = this._normalizeStatKey(bonus?.stat);
      const value = Number(bonus?.value);
      if (!statKey || !Number.isFinite(value)) continue;
      system.stats[statKey].peculiarity += value;
    }

    await this.actor.update({ system });

    const otherEffects = String(featureItem.system?.otherEffects ?? '').trim();
    const baseName = String(featureItem.name ?? '').replace(/\s+\(.+\)$/, '');
    const updates = {
      'system.selectedChoices': selectedChoices,
    };

    const bonusTag = this._formatBonusTag(nextBonuses);
    updates.name = bonusTag ? `${baseName} ${bonusTag}` : baseName;

    const compactDescription = this._buildPersonalPeculiarityDescription(featureItem, selectedOptions);
    updates['system.description'] = compactDescription || otherEffects || featureItem.system?.description || '';

    await featureItem.update(updates);
  }

  /**
   * Compute all active bonuses on a feature item (base + selected choices).
   * @param {Item} featureItem
   * @returns {Array<object>}
   * @private
   */
  _getAppliedBonuses(featureItem, selectedChoiceLabels = null) {
    const baseBonuses = Array.isArray(featureItem.system?.bonuses)
      ? featureItem.system.bonuses
      : [];
    const selected = new Set(
      Array.isArray(selectedChoiceLabels)
        ? selectedChoiceLabels
        : (Array.isArray(featureItem.system?.selectedChoices) ? featureItem.system.selectedChoices : [])
    );
    const choiceBonuses = Array.isArray(featureItem.system?.choiceBonuses)
      ? featureItem.system.choiceBonuses
      : [];

    const selectedBonuses = [];
    for (const choice of choiceBonuses) {
      const options = Array.isArray(choice?.options) ? choice.options : [];
      for (const option of options) {
        if (!selected.has(option?.label ?? '')) continue;
        if (Array.isArray(option?.bonuses)) selectedBonuses.push(...option.bonuses);
      }
    }

    return [...baseBonuses, ...selectedBonuses];
  }

  /**
   * Build a compact name suffix like "(+1 to Sense, -1 to Pother)".
   * @param {Array<object>} bonuses
   * @returns {string}
   * @private
   */
  _formatBonusTag(bonuses) {
    if (!Array.isArray(bonuses) || bonuses.length === 0) return '';
    const labels = [];
    for (const bonus of bonuses) {
      const statKey = this._normalizeStatKey(bonus?.stat);
      const value = Number(bonus?.value);
      if (!statKey || !Number.isFinite(value) || value === 0) continue;
      const statLabel = statKey.charAt(0).toUpperCase() + statKey.slice(1);
      const sign = value > 0 ? '+' : '';
      labels.push(`${sign}${value} to ${statLabel}`);
    }
    if (labels.length === 0) return '';
    return `(${labels.join(', ')})`;
  }

  /**
   * Build compact on-sheet description text for personal peculiarities.
   * Shows only active bonus details and any secondary effects.
   * @param {object} featureItem
   * @param {Array<object>|null} chosenOptions
   * @returns {string}
   * @private
   */
  _buildPersonalPeculiarityDescription(featureItem, chosenOptions = null) {
    const lines = [];
    const existingDescription = String(featureItem.system?.description ?? '').trim();
    const baseBonuses = Array.isArray(featureItem.system?.bonuses) ? featureItem.system.bonuses : [];
    const resolvedChoices = Array.isArray(chosenOptions)
      ? chosenOptions
      : this._getSelectedChoiceOptions(featureItem);

    for (const bonus of baseBonuses) {
      const line = this._formatBonusDetailLine(bonus);
      if (line) lines.push(line);
    }

    for (const option of resolvedChoices) {
      const optionBonuses = Array.isArray(option?.bonuses) ? option.bonuses : [];
      if (optionBonuses.length === 0) continue;
      for (const bonus of optionBonuses) {
        const line = this._formatBonusDetailLine(bonus, option?.description);
        if (line) lines.push(line);
      }
    }

    const otherEffects = String(featureItem.system?.otherEffects ?? '').trim();
    if (otherEffects) lines.push(otherEffects);

    const built = lines.join('\n\n').trim();
    const hasDetailedBuiltLine = /(?:bonus|penalty)\s+to\s+\w+\s*:/i.test(built);
    const existingHasDetailedLine = /(?:bonus|penalty)\s+to\s+\w+\s*:/i.test(existingDescription);

    if (!hasDetailedBuiltLine && existingHasDetailedLine) return existingDescription;
    if (!built) return existingDescription;
    return built;
  }

  /**
   * Build compact on-sheet description text for pets.
   * Shows description followed by a traits block when present.
   * @param {object} featureItem
   * @returns {string}
   * @private
   */
  _buildPetDescription(featureItem) {
    const traits = String(featureItem.system?.notes ?? '').trim();
    if (!traits) return '';

    const lines = traits
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex === -1) return `<p>${foundry.utils.escapeHTML(line)}</p>`;
        const label = foundry.utils.escapeHTML(line.slice(0, separatorIndex).trim());
        const detail = foundry.utils.escapeHTML(line.slice(separatorIndex + 1).trim());
        return `<p><strong>${label}:</strong> ${detail}</p>`;
      });

    return lines.join('');
  }

  /**
   * Resolve selected choice options for a personal peculiarity item.
   * @param {object} featureItem
   * @returns {Array<object>}
   * @private
   */
  _getSelectedChoiceOptions(featureItem, selectedChoiceLabels = null) {
    const selected = new Set(
      Array.isArray(selectedChoiceLabels)
        ? selectedChoiceLabels
        : (Array.isArray(featureItem.system?.selectedChoices) ? featureItem.system.selectedChoices : [])
    );
    const choiceBonuses = Array.isArray(featureItem.system?.choiceBonuses)
      ? featureItem.system.choiceBonuses
      : [];
    const options = [];

    for (const choice of choiceBonuses) {
      const list = Array.isArray(choice?.options) ? choice.options : [];
      for (const option of list) {
        if (!selected.has(option?.label ?? '')) continue;
        options.push(option);
      }
    }

    return options;
  }

  /**
   * Format one bonus line for compact personal peculiarity display.
   * @param {object} bonus
   * @param {string} optionDescription
   * @returns {string}
   * @private
   */
  _formatBonusDetailLine(bonus, optionDescription = '') {
    const statKey = this._normalizeStatKey(bonus?.stat);
    const value = Number(bonus?.value);
    if (!statKey || !Number.isFinite(value) || value === 0) return '';

    const statLabel = statKey.charAt(0).toUpperCase() + statKey.slice(1);
    const sign = value > 0 ? '+' : '';
    const prefix = `${sign}${value} bonus to ${statLabel}`;
    const selectedText = String(optionDescription ?? '').trim();
    if (selectedText) return `${prefix}: ${selectedText}`;

    const bonusText = String(bonus?.description ?? '').trim();
    if (!bonusText) return prefix;
    if (bonusText.includes(':')) return bonusText;
    if (/bonus to/i.test(bonusText)) return prefix;
    return `${prefix}: ${bonusText}`;
  }

  /**
   * Prompt the user to pick one bonus option from a choice-group.
   * @param {Item} featureItem
   * @param {object} choice
   * @returns {Promise<object|null>}
   * @private
   */
  async _promptChoiceBonus(featureItem, choice) {
    const options = Array.isArray(choice?.options) ? choice.options : [];
    if (options.length === 0) return null;

    return await new Promise((resolve) => {
      const prompt = choice?.prompt ? `${choice.prompt}` : 'Choose one bonus.';
      const contentLines = options
        .map((option, index) => `
          <button type="button" class="rb-choice-dialog__option rb-choice-dialog__option-button" data-choice-index="${index}">
            <span class="rb-choice-option__label">${option.label ?? `Option ${index + 1}`}</span>
            ${option.description ? `<br /><span class="rb-choice-option__description">${option.description}</span>` : ''}
          </button>
        `)
        .join('');

      const dialog = new Dialog({
        title: `${featureItem.name}: Choose Bonus`,
        content: `
          <div class="rb-choice-dialog">
            <div class="rb-choice-dialog__prompt">${prompt}</div>
            <div class="rb-choice-dialog__options">${contentLines}</div>
          </div>
        `,
        buttons: {
          cancel: {
            label: 'Cancel',
            callback: () => resolve(null),
          },
        },
        close: () => resolve(null),
        render: (html) => {
          html.find('.rb-choice-dialog__option-button').on('click', (event) => {
            event.preventDefault();
            const index = Number(event.currentTarget.dataset.choiceIndex);
            const selected = options[index] ?? null;
            resolve(selected);
            dialog.close();
          });
        },
      }, {
        classes: ['riverbank-dialog'],
        width: 520,
      });

      dialog.render(true);
    });
  }

  /**
   * Normalize possible stat labels to actor stat keys.
   * @param {string} raw
   * @returns {string|null}
   * @private
   */
  _normalizeStatKey(raw) {
    const value = String(raw ?? '').trim().toLowerCase();
    if (value === 'charm') return 'charm';
    if (value === 'intrepidity') return 'intrepidity';
    if (value === 'pother') return 'pother';
    if (value === 'sense') return 'sense';
    return null;
  }

  /**
   * Create innate peculiarity items on the actor for a specific sort.
   * @param {string} sortName
   * @private
   */
  async _addInnatePeculiaritiesForSort(sortName) {
    const pack = game.packs.get('riverbank.peculiarities');
    if (!pack) return;

    const docs = await pack.getDocuments();
    const sortKey = String(sortName).toLowerCase();
    const matches = docs.filter((doc) => {
      if (doc.type !== 'feature') return false;
      if (String(doc.system?.sort ?? '').toLowerCase() !== sortKey) return false;
      return this._normalizeFeatureCategory(doc.system?.category) === 'innate'
        || String(doc.system?.peculiarityType ?? '').toLowerCase() === 'innate';
    });
    if (matches.length === 0) return;

    const existing = new Set(
      this.actor.items
        .filter((item) => item.type === 'feature')
        .map((item) => `${item.name.toLowerCase()}::${String(item.system?.sort ?? '').toLowerCase()}`)
    );

    const toCreate = [];
    for (const doc of matches) {
      const key = `${doc.name.toLowerCase()}::${String(doc.system?.sort ?? '').toLowerCase()}`;
      if (existing.has(key)) continue;

      const source = doc.toObject();
      delete source._id;
      delete source.folder;
      source.system = source.system ?? {};
      source.system.category = 'innate';
      source.system.peculiarityType = 'innate';
      toCreate.push(source);
    }

    if (toCreate.length > 0) {
      await this.actor.createEmbeddedDocuments('Item', toCreate);
    }
  }

  /**
   * Replace all actor innate peculiarities with those linked to the chosen sort.
   * This keeps Sort drops rewritable instead of accumulating stale innate items.
   * @param {string} sortName
   * @private
   */
  async _replaceInnatePeculiaritiesForSort(sortName) {
    const existingInnates = this.actor.items.filter((item) => {
      if (item.type !== 'feature') return false;
      const category = this._normalizeFeatureCategory(
        item.system?.category ?? item.system?.peculiarityType
      );
      return category === 'innate';
    });

    if (existingInnates.length > 0) {
      await this.actor.deleteEmbeddedDocuments(
        'Item',
        existingInnates.map((item) => item.id)
      );
    }

    await this._addInnatePeculiaritiesForSort(sortName);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    if (this.isEditable) {
      await this._onSubmit(event, { preventClose: true, preventRender: true });
    }
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollForStat === 'true') {
      const roll = new Roll('1d4');
      await roll.evaluate({ async: true });

      const statMap = {
        1: 'Charm',
        2: 'Intrepedity',
        3: 'Pother',
        4: 'Sense',
      };
      const resultTotal = Number(roll.total) || 0;
      const resultLabel = statMap[resultTotal] ?? 'Unknown';
      const renderedRoll = await roll.render();
      const content = `
        <section class="riverbank-roll-shell">
          <div class="riverbank-roll-shell__ability">Roll for Stat</div>
          <div class="dice-total riverbank-roll-shell__breakdown">${resultTotal}</div>
          <div class="riverbank-roll-shell__stat-result">${resultLabel}</div>
          ${renderedRoll}
        </section>
      `;

      const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: '',
        content,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice,
        rolls: [roll],
      };
      ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
      await ChatMessage.create(messageData);
      return roll;
    }

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `${dataset.label}` : 'Ability';
      let formula = dataset.roll;
      let breakdown = formula;

      const statKey = this._normalizeStatKey(dataset.stat);
      if (statKey) {
        const statData = this.actor.system?.stats?.[statKey] ?? {};
        const baseFinal = Number(statData.computed ?? statData.final) || 0;
        const sliderInput = this.form?.querySelector('[name="system.animalityPoetryRange"]');
        const currentRange = Number(sliderInput?.value ?? this.actor.system?.animalityPoetryRange) || 0;
        const absRange = Math.abs(currentRange);
        const apPenalty = (statKey === 'sense' && absRange >= 4 ? 1 : 0)
          + (statKey === 'charm' && absRange >= 6 ? 1 : 0);
        const tempDelta = Number(this.actor.system?.stats?.[statKey]?.delta) || 0;
        const tempBonus = tempDelta > 0 ? tempDelta : 0;
        const tempPenalty = tempDelta < 0 ? Math.abs(tempDelta) : 0;

        const parts = [`1d6`, `+ ${baseFinal}`];
        if (apPenalty) parts.push(`- ${apPenalty}`);
        if (tempBonus) parts.push(`+ ${tempBonus}`);
        if (tempPenalty) parts.push(`- ${tempPenalty}`);
        breakdown = parts.join(' ');

        formula = breakdown;
        label = dataset.label ? `${dataset.label}` : 'Ability';
      }

      const roll = new Roll(formula, this.actor.getRollData());
      await roll.evaluate({ async: true });

      const actorUuid = this.actor.uuid ?? '';
      const abilityLabel = dataset.label ? `${dataset.label}` : 'Ability';
      const isPother = abilityLabel.trim().toLowerCase() === 'pother';
      const summonPotherButton = isPother
        ? ''
        : `<button type="button" class="riverbank-roll-shell__action" data-action="summon-pother" data-actor-uuid="${actorUuid}" data-ability="${abilityLabel}">
             Summon Pother
           </button>`;
      const renderedRoll = await roll.render();
      const content = `
        <section class="riverbank-roll-shell">
          <div class="riverbank-roll-shell__ability">${abilityLabel}</div>
          <div class="dice-total riverbank-roll-shell__breakdown">${breakdown}</div>
          ${renderedRoll}
          <div class="riverbank-roll-shell__actions">
            <button type="button" class="riverbank-roll-shell__action" data-action="roll-ap-dice" data-actor-uuid="${actorUuid}">
              Roll A/P Dice
            </button>
            ${summonPotherButton}
            <button type="button" class="riverbank-roll-shell__action" data-action="failure-result" data-actor-uuid="${actorUuid}" data-ability="${abilityLabel}" data-stat="${statKey ?? ''}">
              Failure Result
            </button>
          </div>
        </section>
      `;

      const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: '',
        content,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice,
        rolls: [roll],
      };
      ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
      await ChatMessage.create(messageData);
      return roll;
    }
  }

  /**
   * Update knack cycle usage directly from the character sheet list.
   * @param {Event} event
   * @private
   */
  async _onKnackUsedChange(event) {
    const element = event.currentTarget;
    const itemId = element.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;

    await item.update({ 'system.usedThisCycle': element.checked });
  }

  /**
   * Toggle inline feature description visibility on the sheet.
   * @param {Event} event
   * @private
   */
  _onFeatureToggle(event) {
    event.preventDefault();
    const li = event.currentTarget.closest('.rb-feature-item');
    if (!li) return;
    li.classList.toggle('is-expanded');
  }

  /**
   * Update floating Animality/Poetry penalty labels while sliding.
   * @param {Event} event
   * @private
   */
  _onAnimalityPoetrySliderInput(event) {
    this._syncAnimalityPoetryIndicator(event.currentTarget);
  }

  /**
   * Sync slider-positioned penalty labels for the Animality/Poetry control.
   * @param {HTMLInputElement} slider
   * @private
   */
  _syncAnimalityPoetryIndicator(slider) {
    if (!slider) return;
    const value = Number(slider.value) || 0;
    const absolute = Math.abs(value);
    const panel = slider.closest('.rb-ap-main');
    if (!panel) return;

    const min = Number(slider.min);
    const max = Number(slider.max);
    const safeMin = Number.isFinite(min) ? min : -8;
    const safeMax = Number.isFinite(max) ? max : 8;
    const span = Math.max(1, safeMax - safeMin);
    const index = Math.max(0, Math.min(span, Math.round(value - safeMin)));
    const tick = panel.querySelectorAll('.rb-ap-tick')[index];
    let leftPx;
    if (tick) {
      const tickRect = tick.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      leftPx = (tickRect.left - panelRect.left) + (tickRect.width / 2);
    } else {
      const ratio = Math.max(0, Math.min(1, (value - safeMin) / span));
      const thumbPx = 14;
      const trackWidth = slider.clientWidth || 0;
      leftPx = ratio * Math.max(0, trackWidth - thumbPx) + (thumbPx / 2);
    }
    // Browser range-track rendering is slightly asymmetric on the negative side.
    // Apply a tiny nudge so the floating label visually centers on the thumb.
    const visualNudgePx = value < 0 ? 2 : 0;
    panel.style.setProperty('--ap-pos-px', `${leftPx + visualNudgePx}px`);

    const label = panel.querySelector('[data-ap-penalties]');
    if (!label) return;

    if (value === 8) {
      label.innerHTML = 'Call of the<br>Muse';
      label.classList.add('is-active');
      return;
    }
    if (value === -8) {
      label.innerHTML = 'Call of the<br>Wild';
      label.classList.add('is-active');
      return;
    }

    if (absolute >= 6) {
      label.innerHTML = '<span>-1 Charm</span><span>-1 Sense</span>';
      label.classList.add('is-active');
      return;
    }
    if (absolute >= 4) {
      label.textContent = '-1 Sense';
      label.classList.add('is-active');
      return;
    }

    label.textContent = '';
    label.classList.remove('is-active');
  }
}
