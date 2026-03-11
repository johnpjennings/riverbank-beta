import BoilerplateActorBase from "./base-actor.mjs";

export default class BoilerplateCharacter extends BoilerplateActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const blankString = { required: true, blank: true, initial: "" };
    const schema = super.defineSchema();

    const statField = () =>
      new fields.SchemaField({
        sort: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        peculiarity: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        elective: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        final: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        computed: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        delta: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      });

    schema.profile = new fields.SchemaField({
      titleOrHonorific: new fields.StringField(blankString),
      sort: new fields.StringField(blankString),
      pronouns: new fields.StringField(blankString),
      size: new fields.StringField(blankString),
      age: new fields.StringField(blankString),
      bestTimeOfDay: new fields.StringField(blankString),
      sociability: new fields.StringField(blankString),
    });

    schema.stats = new fields.SchemaField({
      charm: statField(),
      intrepidity: statField(),
      pother: statField(),
      sense: statField(),
    });
    schema.animalityPoetryRange = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: -8,
      max: 8,
    });

    schema.innatePeculiarities = new fields.StringField(blankString);
    schema.personalPeculiarities = new fields.SchemaField({
      "1": new fields.StringField(blankString),
      "2": new fields.StringField(blankString),
      "3": new fields.StringField(blankString),
    });
    schema.knacks = new fields.SchemaField({
      usedThisCycle: new fields.StringField(blankString),
      "1": new fields.BooleanField({ required: true, initial: false }),
      "2": new fields.BooleanField({ required: true, initial: false }),
      "3": new fields.BooleanField({ required: true, initial: false }),
      "4": new fields.BooleanField({ required: true, initial: false }),
    });
    schema.insufficiency = new fields.StringField(blankString);
    schema.appallingRelative = new fields.SchemaField({
      name: new fields.StringField(blankString),
      titleOrHonorific: new fields.StringField(blankString),
      sort: new fields.StringField(blankString),
      pronouns: new fields.StringField(blankString),
      age: new fields.StringField(blankString),
      relationship: new fields.StringField(blankString),
      whichSide: new fields.StringField(blankString),
      particulars: new fields.SchemaField({
        "1": new fields.StringField(blankString),
        "2": new fields.StringField(blankString),
        "3": new fields.StringField(blankString),
      }),
    });
    schema.greatestWeapon = new fields.StringField(blankString);
    schema.dragYou = new fields.StringField(blankString);
    schema.homeDescription = new fields.StringField(blankString);
    schema.petsCommunityInterests = new fields.StringField(blankString);
    schema.home = new fields.SchemaField({
      name: new fields.StringField(blankString),
      type: new fields.StringField(blankString),
      size: new fields.StringField(blankString),
      location: new fields.StringField(blankString),
      housemates: new fields.StringField(blankString),
      heart: new fields.StringField(blankString),
      description: new fields.StringField(blankString),
    });
    schema.pet = new fields.SchemaField({
      hasPet: new fields.BooleanField({ required: true, initial: false }),
      name: new fields.StringField(blankString),
      species: new fields.StringField(blankString),
      notes: new fields.StringField(blankString),
    });
    schema.vehicle = new fields.SchemaField({
      hasVehicle: new fields.BooleanField({ required: true, initial: false }),
      types: new fields.SchemaField({
        bicycle: new fields.BooleanField({ required: true, initial: false }),
        motorcycle: new fields.BooleanField({ required: true, initial: false }),
        rowingBoat: new fields.BooleanField({ required: true, initial: false }),
        sailboat: new fields.BooleanField({ required: true, initial: false }),
        other: new fields.BooleanField({ required: true, initial: false }),
        otherText: new fields.StringField(blankString),
      }),
      details: new fields.StringField(blankString),
    });
    schema.souvenirs = new fields.SchemaField({
      display: new fields.StringField(blankString),
      items: new fields.StringField(blankString),
      tokens: new fields.StringField(blankString),
    });
    schema.seasonalReckoning = new fields.StringField(blankString);
    schema.otherNotes = new fields.StringField(blankString);
    schema.otherFamilyAndFriends = new fields.StringField(blankString);
    schema.temporaryModifiers = new fields.StringField(blankString);

    return schema;
  }

  prepareDerivedData() {
    this.animalityPoetryRange = Number(this.animalityPoetryRange) || 0;
    this.animalityPoetryRange = Math.max(-8, Math.min(8, this.animalityPoetryRange));
    if (!this.stats) return;

    for (const key of ["charm", "intrepidity", "pother", "sense"]) {
      const stat = this.stats[key];
      if (!stat) continue;

      stat.sort = Number(stat.sort) || 0;
      stat.peculiarity = Number(stat.peculiarity) || 0;
      stat.elective = Number(stat.elective) || 0;
      stat.computed = stat.sort + stat.peculiarity + stat.elective;
      stat.final = stat.computed;
      stat.delta = 0;
      stat.label = game.i18n.localize(CONFIG.RIVERBANK.abilities[key]) ?? key;
    }
  }

  getRollData() {
    const data = {};

    if (this.stats) {
      data.stats = foundry.utils.deepClone(this.stats);
      for (const [key, stat] of Object.entries(this.stats)) {
        data[key] = foundry.utils.deepClone(stat);
      }
    }

    const range = Math.abs(Number(this.animalityPoetryRange) || 0);
    const sensePenalty = range >= 4 ? 1 : 0;
    const charmPenalty = range >= 6 ? 1 : 0;

    if (data.stats?.sense) data.stats.sense.final = (Number(data.stats.sense.final) || 0) - sensePenalty;
    if (data.stats?.charm) data.stats.charm.final = (Number(data.stats.charm.final) || 0) - charmPenalty;
    if (data.sense) data.sense.final = (Number(data.sense.final) || 0) - sensePenalty;
    if (data.charm) data.charm.final = (Number(data.charm.final) || 0) - charmPenalty;

    if (this.profile) data.profile = foundry.utils.deepClone(this.profile);

    return data;
  }
}
