/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/riverbank/templates/actor/parts/actor-features.hbs',
    'systems/riverbank/templates/actor/parts/actor-items.hbs',
    'systems/riverbank/templates/actor/parts/actor-spells.hbs',
    'systems/riverbank/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/riverbank/templates/item/parts/item-effects.hbs',
    // HUD templates
    'systems/riverbank/templates/hud/waypoint-label.hbs',
  ]);
};
