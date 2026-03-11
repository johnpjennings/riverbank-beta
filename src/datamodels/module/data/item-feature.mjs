import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateFeature extends BoilerplateItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    const blankString = { required: true, blank: true, initial: "" };
    const requiredInteger = { required: true, nullable: false, integer: true };
    const bonusField = () =>
      new fields.SchemaField({
        stat: new fields.StringField(blankString),
        value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        description: new fields.StringField(blankString),
      });

    schema.category = new fields.StringField(blankString);
    schema.sort = new fields.StringField(blankString);
    schema.peculiarityType = new fields.StringField(blankString);
    schema.usedThisCycle = new fields.BooleanField({ required: true, initial: false });
    schema.bonuses = new fields.ArrayField(bonusField(), { initial: [] });
    schema.choiceBonuses = new fields.ArrayField(
      new fields.SchemaField({
        prompt: new fields.StringField(blankString),
        options: new fields.ArrayField(
          new fields.SchemaField({
            label: new fields.StringField(blankString),
            description: new fields.StringField(blankString),
            bonuses: new fields.ArrayField(bonusField(), { initial: [] }),
          }),
          { initial: [] }
        ),
      }),
      { initial: [] }
    );
    schema.selectedChoices = new fields.ArrayField(new fields.StringField(blankString), {
      initial: [],
    });
    schema.otherEffects = new fields.StringField(blankString);
    schema.tokenCost = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.size = new fields.StringField(blankString);
    schema.timeOfDay = new fields.StringField(blankString);
    schema.sociability = new fields.StringField(blankString);
    schema.preliminaryStats = new fields.SchemaField({
      charm: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      intrepidity: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      pother: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      sense: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });
    schema.innatePeculiarities = new fields.StringField(blankString);
    schema.riverbankSortDescription = new fields.StringField(blankString);
    schema.ordinarySortDescription = new fields.StringField(blankString);
    schema.notes = new fields.StringField(blankString);

    return schema;
  }
}
