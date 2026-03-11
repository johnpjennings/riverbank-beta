import BoilerplateActorBase from "./base-actor.mjs";

export default class BoilerplateNPC extends BoilerplateActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const blankString = { required: true, blank: true, initial: "" };
    const schema = super.defineSchema();

    schema.npcCategory = new fields.StringField(blankString);
    schema.cr = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    schema.xp = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.description = new fields.StringField(blankString);
    schema.role = new fields.StringField(blankString);
    schema.foeLevel = new fields.StringField(blankString);
    schema.attitude = new fields.StringField(blankString);
    schema.homeLife = new fields.StringField(blankString);
    schema.attitudeTowardAnimals = new fields.StringField(blankString);
    schema.size = new fields.StringField(blankString);
    schema.variety = new fields.StringField(blankString);
    schema.particulars = new fields.StringField(blankString);
    schema.notes = new fields.StringField(blankString);
    
    return schema
  }

  prepareDerivedData() {
    this.xp = this.cr * this.cr * 100;
  }
}
