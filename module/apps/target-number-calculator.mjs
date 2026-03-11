export class RiverbankTargetNumberCalculator extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'riverbank-target-number-calculator',
      classes: ['riverbank', 'target-number-calculator'],
      template: 'systems/riverbank/templates/apps/target-number-calculator.hbs',
      title: 'Calculate Target Number',
      width: 760,
      height: 720,
      resizable: true,
    });
  }

  getData() {
    return {
      leftSections: [
        {
          key: 'difficulty',
          title: 'Difficulty',
          inputType: 'radio',
          options: [
            { label: 'Easy deed', value: 5 },
            { label: 'Middling deed', value: 7 },
            { label: 'Hard deed', value: 9 },
          ],
        },
        {
          key: 'importance',
          title: 'Importance',
          inputType: 'radio',
          options: [
            { label: 'N/A', value: 0 },
            { label: 'Important', value: 1, prefix: '+' },
            { label: 'Very Important', value: 2, prefix: '+' },
          ],
        },
        {
          key: 'urgency',
          title: 'Urgency',
          inputType: 'radio',
          options: [
            { label: 'N/A', value: 0 },
            { label: 'Urgent', value: 1, prefix: '+' },
            { label: 'Very Urgent', value: 2, prefix: '+' },
          ],
        },
        {
          key: 'oddness',
          title: 'Oddness',
          inputType: 'radio',
          options: [
            { label: 'N/A', value: 0 },
            { label: 'Odd deed', value: 1, prefix: '+' },
          ],
        },
      ],
      rightSections: [
        {
          key: 'singleFoe',
          title: 'Foe Level',
          inputType: 'radio',
          options: [
            { label: 'N/A', value: 0 },
            { label: 'Single Commonplace Foe', value: 1, prefix: '+' },
            { label: 'Single Tiresome Foe', value: 2, prefix: '+' },
            { label: 'Single Dire Foe', value: 3, prefix: '+' },
            { label: 'Appalling Relative', value: 4, prefix: '+' },
          ],
        },
        {
          key: 'groupFoe',
          title: 'Foe Group Size',
          inputType: 'radio',
          options: [
            { label: 'N/A', value: 0 },
            { label: 'As many again foes (Up to 2x party size)', value: 3, prefix: '+' },
            { label: 'A lot of foes (2-3x party size)', value: 5, prefix: '+' },
            { label: 'Too many foes (3-5x party size)', value: 8, prefix: '+' },
          ],
        },
        {
          key: 'awfulness',
          title: 'Extreme Awfulness',
          inputType: 'radio',
          options: [
            { label: 'N/A', value: 0 },
            { label: 'A worse than usual group foe', value: 1, prefix: '+' },
          ],
        },
      ],
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on('change', 'input[type="radio"]', () => this.#updateTotal(html));
    html.on('click', '[data-action="reset"]', (event) => {
      event.preventDefault();
      this.#reset(html);
    });
    this.#updateTotal(html);
  }

  #reset(html) {
    html.find('input[type="radio"][value="0"]').prop('checked', true);
    html.find('input[type="radio"][name="difficulty"]').first().prop('checked', true);
    this.#updateTotal(html);
  }

  #updateTotal(html) {
    let total = 0;
    html.find('input[type="radio"]:checked').each((_index, input) => {
      total += Number(input.value) || 0;
    });

    html.find('[data-target-number-total]').text(total);
  }
}
