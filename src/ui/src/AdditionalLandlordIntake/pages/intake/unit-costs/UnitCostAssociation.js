import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import CheckboxCollectionView from '../../../../core/components/checkbox/Checkboxes';
import CheckboxCollection from '../../../../core/components/checkbox/Checkbox_collection';
import template from './UnitCostAssociation_template.tpl';

const BASE_NAME = 'Capital Expenditure';
const NO_UNITS_ASSOCIATED_ERROR = `At least one unit must be associated to each capital expenditure.`;

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,

  className: 'unit-cost-component',

  regions: {
    unitCheckboxesRegion: '.unit-cost-lines'
  },

  ui: {
    error: '.error-block',
    count: '.unit-cost-selected-count',
    selectAll: '.unit-cost-select-all'
  },

  events: {
    'click @ui.selectAll': 'clickSelectAll'
  },

  clickSelectAll() {
    this.unitCheckboxCollection.forEach(checkbox => {
      if (!checkbox.get('checked')) {
        checkbox.set('checked', true);
        checkbox.trigger('render');
      }
    });
  },

  initialize(options) {
    this.mergeOptions(options, ['capitalCostsData', 'unitCollection', 'childViewIndex']);
    if (!this.unitCollection) {
      console.log("[Error] Need a UnitCollection passed to UnitCostAssociation");
    }

    const matchingCapitalCostData = _.find(this.capitalCostsData, costData => (costData || {})['remedy-remedy_id'] === this.model.id);

    this.unitCheckboxCollection = new CheckboxCollection(this.unitCollection.map(unit => {
      const unit_id = unit.get('unit_id');
      return {
        html: `<span class="unit-cost-unit-display">${unit.getUnitNumDisplay()}:</span>&nbsp;<span>${unit.getStreetDisplayWithDescriptor()}</span>`,
        checked: matchingCapitalCostData && _.contains(matchingCapitalCostData['local-units'], unit_id),
        _unit_id: unit_id
      };
    }));

    this.listenTo(this.unitCheckboxCollection, 'change:checked', () => {
      this.removeErrorStyles();
      this.updateTotals();
    }, this);
  },

  toIntakeAriData() {
    return {
      "local-capital_cost_id": this.childViewIndex,
			"remedy-remedy_id": this.model.id,
			"local-units": this.unitCheckboxCollection.filter(checkbox => checkbox.get('checked')).map(checkboxModel => checkboxModel.get('_unit_id'))
    };
  },

  _getNumCheckedUnits() {
    return this.unitCheckboxCollection.filter(checkbox => checkbox.get('checked')).length;
  },

  updateTotals() {
    this.getUI('count').html(this._getNumCheckedUnits());
    this.model.trigger('update:counts');
  },

  validateAndShowErrors() {
    let isValid = true;
    if (!this._getNumCheckedUnits()) {
      this.showErrorMessage(NO_UNITS_ASSOCIATED_ERROR);
      isValid = false;
    }
    return isValid;
  },

  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).show();
  },

  removeErrorStyles() {
    this.getUI('error').html('').hide();
  },

  onRender() {
    this.showChildView('unitCheckboxesRegion', new CheckboxCollectionView({ collection: this.unitCheckboxCollection }));
  },

  templateContext() {
    const remedyDetails = this.model.getRemedyDetails();
    const remedyDetail = remedyDetails && remedyDetails.length ? remedyDetails.at(0) : null;
    return {
      unitDisplay: `${BASE_NAME} ${Formatter.toLeftPad(this.childViewIndex, '0', 3)}`,
      totalAmount: this.model.getAmount(),
      description: remedyDetail && remedyDetail.get('description'),
      associatedDate: remedyDetail && remedyDetail.get('associated_date'),
      selectedCount: this._getNumCheckedUnits(),
      Formatter,
    };
  }
});