import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './AriDashboardLine_template.tpl';
import CheckboxView from '../../../checkbox/Checkbox';
import CheckboxModel from '../../../checkbox/Checkbox_model';


const Formatter = Radio.channel('formatter').request('get');

const ArbAwardView = Marionette.View.extend({
  template: _.template(`<div class="ari-dashboard-table-arb-award-checkbox"></div>
    <div class="ari-dashboard-table-arb-award-calc"><%= calculatedAmount || '-' %></div>
  `),

  className: 'ari-dashboard-table-arb-award',

  regions: {
    checkboxRegion: '.ari-dashboard-table-arb-award-checkbox'
  },

  initialize(options) {
    this.mergeOptions(options, ['unitModel', 'awardedCostModel', 'costModel', 'calculateCostRentIncreaseFn']);

    if (!this.unitModel || !this.costModel) {
      console.log(`[Error] Must provide a unitModel and costModel`);
      return;
    }

    const unitId = this.unitModel.get('unit_id');
    const hasIntakeAssociations = this.unitModel.hasSavedRentIncreaseData() && this.costModel.hasUnit(unitId);
    const hasOutcome = this.model.hasOutcome();

    this.checkboxModel = new CheckboxModel({
      html: '',
      checked: hasIntakeAssociations && hasOutcome && (this.awardedCostModel && this.awardedCostModel.hasUnit(unitId)),
      disabled: !hasIntakeAssociations || !hasOutcome,
    });

    if (this.awardedCostModel) {
      this.listenTo(this.checkboxModel, 'change:checked', (model, value) => {
        if (value) {
          this.awardedCostModel.addUnit(unitId);
        } else {
          this.awardedCostModel.removeUnit(unitId);
        }
    
        this.unitModel.trigger('refresh:dashboard');
      }, this);
    }
  },

  onRender() {
    this.showChildView('checkboxRegion', new CheckboxView({ model: this.checkboxModel }));
  },

  templateContext() {
    const isChecked = this.checkboxModel.get('checked');
    const numCostUnits = this.costModel && this.costModel.getUnitIds().length;
    return {
      calculatedAmount: !this.model.hasOutcome() ? '<span class="error-red">N/A</span>' :
        (!isChecked || !numCostUnits ? '-' : Formatter.toAmountDisplay(this.calculateCostRentIncreaseFn(this.model.getAwardedAmount(), numCostUnits)))
    };
  }
});

const ArbAwardCollectionView = Marionette.CollectionView.extend({
  template: _.noop,
  className: 'ari-dashboard-table-section ari-dashboard-table-arb-awards',
  filter(remedyModel) { return remedyModel.isOutcomeAwarded() || remedyModel.isOutcomeSettled() || !remedyModel.hasOutcome(); },
  childView: ArbAwardView,
});

export default Marionette.View.extend({
  template,
  className: 'ari-dashboard-line',

  regions: {
    arbAwardsRegion: '.ari-dashboard-table-arb-awards-container',
    riCheckboxRegion: '.ari-dashboard-table-ri-checkbox'
  },

  initialize(options) {
    this.mergeOptions(options, ['disputeClaim', 'costCollection', 'awardedCostCollection', 'calculateTotalUnitRentIncreaseFn', 'calculateCostRentIncreaseFn']);

    if (!this.disputeClaim || !this.costCollection || !this.awardedCostCollection) {
      console.log(`[Error] Must provide a costCollection, disputeClaim, awardedCostCollection`);
      return;
    }
    
    this.calulatedAmount = this.calculateTotalUnitRentIncreaseFn(this.model) || null;

    const hasCalculatedAmount = this.calulatedAmount > 0;

    if (!hasCalculatedAmount) {
      this.model.set('awarded_amount', null, { silent: true });
    }
    this.riCheckboxModel = new CheckboxModel({
      html: '',
      checked: hasCalculatedAmount && this.model.get('awarded_amount'),
      disabled: !hasCalculatedAmount
    });
    this.model.set('_isGranted', this.riCheckboxModel.getData());

    this.listenTo(this.riCheckboxModel, 'change:checked', (model, value) => {
      this.calulatedAmount = null;
      if (value) {
        this.calculatedAmount = this.calculateTotalUnitRentIncreaseFn(this.model);
        if (_.isNaN(this.calculatedAmount) || this.calculatedAmount < 0) {
          this.calculatedAmount = 0;
        }
      } else {
        this.calculatedAmount = null;
      }

      this.model.set('awarded_amount', this.calculatedAmount);
      this.model.set('_isGranted', value);
      this.model.trigger('refresh:dashboard');
    }, this);
  },


  onBeforeRender() {
    this.calulatedAmount = this.calculateTotalUnitRentIncreaseFn(this.model);
  },

  onRender() {
    this.showChildView('arbAwardsRegion', new ArbAwardCollectionView({
      collection: this.disputeClaim.getAllRemedies(),
      childViewOptions: (child) => {
        return {
          awardedCostModel: this.awardedCostCollection.find(awardedCost => awardedCost.getRemedyId() === child.id),
          costModel: this.costCollection.find(cost => cost.getRemedyId() === child.id),
          unitModel: this.model,
          calculateCostRentIncreaseFn: this.calculateCostRentIncreaseFn
        };
      }
    }));

    this.showChildView('riCheckboxRegion', new CheckboxView({ model: this.riCheckboxModel }));
  },

  templateContext() {
    return {
      Formatter,
      unitModel: this.model,
      costCollection: this.costCollection,
      unitAwardedCalculatedAmount: !this.disputeClaim.allOutcomesComplete() ? '<span class="error-red">N/A</span>' :
        this.calulatedAmount <= 0 ? '-' : this.calulatedAmount
    };
  },

});