// Import document classes.
import { BoilerplateActor } from './documents/actor.mjs';
import { BoilerplateItem } from './documents/item.mjs';
// Import sheet classes.
import { BoilerplateActorSheet } from './sheets/actor-sheet.mjs';
import { RiverbankLedgerActorSheet } from './sheets/actor-ledger-sheet.mjs';
import { BoilerplateItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { RIVERBANK } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.riverbank = {
    BoilerplateActor,
    BoilerplateItem,
    rollItemMacro,
    summonPother,
    rollAPDice,
  };

  // Add custom constants for configuration.
  CONFIG.RIVERBANK = RIVERBANK;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = BoilerplateActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.BoilerplateCharacter,
    npc: models.BoilerplateNPC
  }
  CONFIG.Item.documentClass = BoilerplateItem;
  CONFIG.Item.dataModels = {
    item: models.BoilerplateItem,
    feature: models.BoilerplateFeature,
    spell: models.BoilerplateSpell
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('riverbank', BoilerplateActorSheet, {
    makeDefault: false,
    label: 'RIVERBANK.SheetLabels.ActorClassic',
  });
  Actors.registerSheet('riverbank', RiverbankLedgerActorSheet, {
    makeDefault: true,
    label: 'RIVERBANK.SheetLabels.ActorModern',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('riverbank', BoilerplateItemSheet, {
    makeDefault: true,
    label: 'RIVERBANK.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
  $(document).off('click.riverbank', '.riverbank-roll-shell__action');
  $(document).on('click.riverbank', '.riverbank-roll-shell__action', onRollActionClick);
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.riverbank.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'riverbank.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

async function onRollActionClick(event) {
  event.preventDefault();
  const action = event.currentTarget?.dataset?.action;
  const actorUuid = event.currentTarget?.dataset?.actorUuid;
  const abilityLabel = event.currentTarget?.dataset?.ability ?? '';
  const challengeStat = event.currentTarget?.dataset?.stat ?? '';
  const messageId = $(event.currentTarget).closest('.message').data('messageId');

  if (action === 'summon-pother') {
    return summonPother(actorUuid, messageId, abilityLabel);
  }
  if (action === 'roll-ap-dice') {
    return rollAPDice(actorUuid, messageId);
  }
  if (action === 'failure-result') {
    return failureResult(actorUuid, abilityLabel, challengeStat);
  }
}

async function summonPother(actorUuid, sourceMessageId = null, replacedAbilityLabel = '') {
  const confirmed = await promptSummonPotherConfirm();
  if (!confirmed) return null;

  const actor = actorUuid ? await fromUuid(actorUuid) : null;
  const sourceMessage = sourceMessageId ? game.messages.get(sourceMessageId) : null;
  const sourceRoll = sourceMessage?.rolls?.[0] ?? null;
  const dieResult = getD6ResultFromRoll(sourceRoll);
  if (!Number.isFinite(dieResult)) {
    ui.notifications.warn('Could not determine original d6 result for Summon Pother.');
    return null;
  }

  const potherData = actor?.system?.stats?.pother ?? {};
  const potherBase = Number(potherData.computed ?? potherData.final) || 0;
  const potherDelta = Number(potherData.delta) || 0;
  const potherScore = potherBase + potherDelta;
  const newTotal = dieResult + potherScore;

  const mainFormula = `${dieResult} + ${potherScore}`;
  const mainRoll = new Roll(mainFormula, actor?.getRollData?.() ?? {});
  await mainRoll.evaluate({ async: true });
  const renderedMainRoll = await mainRoll.render();

  const sideEffectRoll = new Roll('1d4');
  await sideEffectRoll.evaluate({ async: true });
  const renderedSideRoll = await sideEffectRoll.render();
  const sideEffectValue = Number(sideEffectRoll.total) || 1;
  const sideEffectText = getSummonPotherSideEffectText(replacedAbilityLabel, sideEffectValue);

  const content = `
    <section class="riverbank-roll-shell">
      <div class="riverbank-roll-shell__ability">Summoning Pother<br>New Total</div>
      <div class="dice-total riverbank-roll-shell__breakdown">${mainFormula}</div>
      ${renderedMainRoll}
      <div class="riverbank-roll-shell__side-effect">
        <div class="riverbank-roll-shell__side-effect-label">Side Effect</div>
        ${renderedSideRoll}
        <div class="riverbank-roll-shell__side-effect-text">${sideEffectText}</div>
      </div>
    </section>
  `;

  const messageData = {
    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
    flavor: '',
    content,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    sound: CONFIG.sounds.dice,
    rolls: [mainRoll, sideEffectRoll],
  };
  ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
  await ChatMessage.create(messageData);
  return { actorUuid, sourceMessageId, replacedAbilityLabel };
}

async function rollAPDice(actorUuid, sourceMessageId = null) {
  const spend = await promptAPDiceSpend();
  if (!spend) return null;

  let newTotal = null;
  if (sourceMessageId) {
    const sourceMessage = game.messages.get(sourceMessageId);
    if (sourceMessage) {
      const wrapper = $(`<div>${sourceMessage.content ?? ''}</div>`);
      const totalNode = wrapper.find('.dice-roll .dice-total').first();
      const currentTotal = Number(totalNode.text().trim());
      if (Number.isFinite(currentTotal)) {
        newTotal = currentTotal + spend;
      }
    }
  }

  const actor = actorUuid ? await fromUuid(actorUuid) : null;
  const rollFormula = `${spend}d4 - ${spend}`;
  const roll = new Roll(rollFormula, actor?.getRollData?.() ?? {});
  await roll.evaluate({ async: true });
  const renderedRoll = await roll.render();

  const content = `
    <section class="riverbank-roll-shell">
      ${Number.isFinite(newTotal) ? `
        <div class="riverbank-roll-shell__ability">New Total</div>
        <div class="dice-total riverbank-roll-shell__new-total-value">${newTotal}</div>
      ` : ''}
      <div class="riverbank-roll-shell__ability">Rolling A/P Dice</div>
      <div class="dice-total riverbank-roll-shell__breakdown">${rollFormula}</div>
      ${renderedRoll}
    </section>
  `;

  const messageData = {
    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
    flavor: '',
    content,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    sound: CONFIG.sounds.dice,
    rolls: [roll],
  };
  ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
  await ChatMessage.create(messageData);
  return { actorUuid, spend };
}

async function failureResult(actorUuid, abilityLabel = '', challengeStat = '') {
  const deed = normalizeFailureAbility(abilityLabel);
  const stat = normalizeFailureStat(challengeStat || abilityLabel);
  const effectText = getFailureResultText(deed, stat);

  if (!effectText) {
    ui.notifications.warn('No Failure Result mapping was found for this roll.');
    return null;
  }

  const actor = actorUuid ? await fromUuid(actorUuid) : null;
  const content = `
    <section class="riverbank-roll-shell">
      <div class="riverbank-roll-shell__ability">Failure Result</div>
      <div class="riverbank-roll-shell__side-effect-text">${effectText}</div>
    </section>
  `;

  const messageData = {
    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
    flavor: '',
    content,
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
  };
  ChatMessage.applyRollMode(messageData, game.settings.get('core', 'rollMode'));
  await ChatMessage.create(messageData);
  return { actorUuid, abilityLabel, challengeStat };
}

async function promptAPDiceSpend() {
  return await new Promise((resolve) => {
    const options = [1, 2, 3, 4]
      .map((value) => `<option value="${value}">${value}</option>`)
      .join('');

    new Dialog(
      {
        title: 'Roll A/P Dice',
        content: `
          <div class="rb-choice-dialog">
            <div class="rb-choice-dialog__prompt">How many A/P Dice would you like to spend?</div>
            <div class="rb-choice-dialog__options">
              <div class="rb-choice-dialog__option">
                <label class="rb-choice-dialog__option-name" for="rb-ap-dice-count">A/P Dice</label>
                <select id="rb-ap-dice-count" name="apDiceCount">${options}</select>
              </div>
            </div>
          </div>
        `,
        buttons: {
          submit: {
            label: 'Submit',
            callback: (html) => {
              const count = Number(html.find('[name="apDiceCount"]').val()) || 1;
              resolve(Math.max(1, Math.min(4, count)));
            },
          },
          cancel: {
            label: 'Cancel',
            callback: () => resolve(null),
          },
        },
        default: 'submit',
        close: () => resolve(null),
      },
      {
        classes: ['riverbank-dialog'],
        width: 460,
      }
    ).render(true);
  });
}

async function promptSummonPotherConfirm() {
  return await new Promise((resolve) => {
    new Dialog(
      {
        title: 'Summon Pother',
        content: `
          <div class="rb-choice-dialog">
            <div class="rb-choice-dialog__prompt">Are you sure you want to summon Pother?</div>
          </div>
        `,
        buttons: {
          yes: {
            label: 'Yes',
            callback: () => resolve(true),
          },
          cancel: {
            label: 'Cancel',
            callback: () => resolve(false),
          },
        },
        default: 'cancel',
        close: () => resolve(false),
      },
      {
        classes: ['riverbank-dialog'],
        width: 460,
      }
    ).render(true);
  });
}

function getD6ResultFromRoll(roll) {
  if (!roll?.terms) return null;
  const d6 = roll.terms.find((t) => Number(t?.faces) === 6 && Array.isArray(t?.results))
    ?? roll.terms.find((t) => Array.isArray(t?.results));
  if (!d6) return null;
  const result = d6.results.find((r) => r?.active !== false)?.result;
  const value = Number(result);
  return Number.isFinite(value) ? value : null;
}

function normalizeSummonPotherAbility(rawLabel) {
  const label = String(rawLabel ?? '').trim().toLowerCase();
  const aliases = {
    attention: 'attention',
    braininess: 'braininess',
    'clever paws': 'clever paws',
    cleverpaws: 'clever paws',
    discretion: 'discretion',
    sway: 'sway',
    valor: 'valor',
    charm: 'sway',
    sense: 'attention',
    intrepidity: 'valor',
  };
  return aliases[label] ?? label;
}

function getSummonPotherSideEffectText(abilityLabel, d4Value) {
  const map = {
    attention: {
      1: 'You cannot perform another Attention deed until the end of the session.',
      2: 'Your Charm score receives a -1 modifier until the end of the Haphazardry cycle.',
      3: 'Draw a Haphazardry card, whether the timer has gone off or not.',
      4: 'You receive a +1 bonus to Attention deeds until the end of the session.',
    },
    braininess: {
      1: 'Your A/P range resets to 0.',
      2: 'You take two points of Poetry on the A/P range.',
      3: 'You take a point of Poetry on the A/P range.',
      4: 'You receive a +1 bonus to Braininess deeds until the end of the session.',
    },
    'clever paws': {
      1: 'You cannot perform another Clever Paws deed until the end of the Haphazardry cycle.',
      2: 'For your next deed, you must summon Pother.',
      3: 'The Haphazardry cycle ends immediately and a new one begins.',
      4: 'You receive a +1 bonus to Clever Paws deeds until the end of the session.',
    },
    discretion: {
      1: 'You cannot perform another deed of Valor until the end of the session.',
      2: 'Your Intrepidity score receives a -1 modifier until the end of the Haphazardry cycle.',
      3: 'You draw notice, not just from the object of your deed, but from entirely unrelated individuals.',
      4: 'You receive a +1 bonus to deeds of Discretion until the end of the session.',
    },
    sway: {
      1: 'Your social interaction was so positive that the object of your deed asks you to do them an immediate favor.',
      2: 'You take two points of Animality on the A/P range.',
      3: 'You take a point of Animality on the A/P range.',
      4: 'You receive a +1 bonus to Sway deeds until the end of the session.',
    },
    valor: {
      1: 'You cannot perform another deed of Valor until the end of the session.',
      2: 'Your Sense score receives a -1 modifier until the end of the Haphazardry cycle.',
      3: 'For your next deed, you must summon Pother.',
      4: 'You receive a +1 bonus to deeds of Valor until the end of the session.',
    },
  };

  const normalized = normalizeSummonPotherAbility(abilityLabel);
  const sideEffects = map[normalized];
  if (!sideEffects) {
    return `No side-effect mapping is defined for "${abilityLabel || 'this ability'}".`;
  }
  return sideEffects[d4Value] ?? sideEffects[1];
}

function normalizeFailureAbility(rawLabel) {
  const value = String(rawLabel ?? '').trim().toLowerCase();
  const aliases = {
    attention: 'attention',
    braininess: 'braininess',
    'clever paws': 'clever paws',
    cleverpaws: 'clever paws',
    discretion: 'discretion',
    sway: 'sway',
    valor: 'valor',
    charm: 'sway',
    sense: 'attention',
    intrepidity: 'valor',
    pother: 'clever paws',
  };
  return aliases[value] ?? value;
}

function normalizeFailureStat(rawStat) {
  const value = String(rawStat ?? '').trim().toLowerCase();
  if (value === 'charm') return 'charm';
  if (value === 'intrepidity') return 'intrepidity';
  if (value === 'pother') return 'pother';
  if (value === 'sense') return 'sense';
  return '';
}

function getFailureResultText(ability, stat) {
  const map = {
    attention: {
      charm: 'No side effect.',
      intrepidity: 'Haste makes waste! You receive a -1 penalty on your 1d6 roll the next time you use Intrepidity as your challenge stat.',
      pother: 'Whatever the Attention deed, you are sure the failure was not your fault, and you overcompensate. You receive a -1 penalty on your 1d6 roll for your next deed of any category.',
      sense: 'You undergo a momentary loss of confidence. Until the Haphazardry timer goes off, you can perform only Braininess deeds.',
    },
    braininess: {
      charm: 'No side effect.',
      intrepidity: 'You acted before you were ready and did not think, or plan enough. Your next deed must be another Braininess deed.',
      pother: 'Immediately after this failure, you decide your approach was entirely wrong and try to achieve a better result using one of the other deed categories.',
      sense: 'You undergo a momentary loss of confidence. You receive a -1 penalty to your 1d6 roll for your next deed, no matter what challenge stat you use.',
    },
    'clever paws': {
      charm: 'If another Animal is nearby, friend or foe, you cannot help but apologize for the failure, distracting you both for a moment or two.',
      intrepidity: 'Your failure makes you cut corners next time. You receive a -1 penalty on your 1d6 roll for your next deed, no matter what challenge stat you use.',
      pother: 'The object you are performing the deed on (or one nearby) breaks, falls, comes apart, or fails in some way - OR - you decide you are injured (though you probably are not actually injured).',
      sense: 'No side effect.',
    },
    discretion: {
      charm: 'No side effect.',
      intrepidity: 'Clearly, discretion was the wrong approach. Shortly after this failure, you plan a deed of Valor that addresses the problem this deed of Discretion was supposed to address.',
      pother: 'Your failure has attracted notice, which may trigger actions from NPCs.',
      sense: 'Your failure involves a personal ineptitude: You trip, drop a held object, etc. Roll 1d4: On a 1, you sustain a minor but inconvenient injury for the rest of the session; the gamemaster determines the details.',
    },
    sway: {
      charm: 'You undergo a momentary loss of confidence. Until the Haphazardry timer goes off, you cannot perform any Sway deeds.',
      intrepidity: 'No side effect.',
      pother: 'Immediately after this failure, as a new Sway deed, you blither and beg at the target(s) of the original deed, but with a -1 penalty to your 1d6 roll. If this is not possible, you become dramatic.',
      sense: 'Perhaps if you explained things again? Immediately after this failure, you retry the same Sway deed, but with a -1 penalty to your 1d6 roll. If this is not possible, you tell your friends why the failure makes no sense.',
    },
    valor: {
      charm: 'Your failure involves a personal ineptitude: You trip, drop a held object, etc. Roll 1d4: On a 1, you sustain a minor but inconvenient injury for the rest of the session; the gamemaster determines the details.',
      intrepidity: 'Your failure involves a personal ineptitude: You trip, drop a held object, etc. Roll 1d4: On a 1, you sustain a minor but inconvenient injury for the rest of the session; the gamemaster determines the details.',
      pother: 'You failed in some odd way: If fighting someone, you trip and get tangled in the draperies; if trying to move a large rock, you manage to trap your paw. Roll 1d4: On a 1, you sustain a minor but inconvenient injury for the rest of the session; the gamemaster determines the details.',
      sense: 'No side effect.',
    },
  };

  return map[ability]?.[stat] ?? null;
}
