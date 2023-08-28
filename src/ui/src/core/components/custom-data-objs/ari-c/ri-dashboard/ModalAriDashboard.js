/**
 * @fileoverview - Modal that displays information about a ARI dispute, and includes ability to download a .csv file containing the improvements data.
 */

import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalBaseView from '../../../modals/ModalBase';
import TextareaView from '../../../textarea/Textarea';
import TextareaModel from '../../../textarea/Textarea_model';
import template from './ModalAriDashboard_template.tpl';
import AriDashboardLine from './AriDashboardLine';
import IntakeAriDataParser from '../../../custom-data-objs/ari-c/IntakeAriDataParser';

const ARI_CALC_RENT_INCREASE_DIVISOR = 120;
const calculateCostRentIncreaseFn = (amount, numUnits) => {
  let calculatedAmount = 0;
  try {
    calculatedAmount = amount / ARI_CALC_RENT_INCREASE_DIVISOR / numUnits
  } catch (err) {
    //
  }
  // Round to two decimal places
  return Math.round((calculatedAmount + Number.EPSILON) * 100) / 100;
};

const loaderChannel = Radio.channel('loader');
const claimsChannel = Radio.channel('claims');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');

const TableFooterView = Marionette.View.extend({
  template: _.template(`
<div class="ari-dashboard-table-section ari-dashboard-table-units">
  <div>
    <span>Tenants:&nbsp;<%= numRentIncreaseTenants %></span>
    <span>Units:&nbsp;<%= numRentIncreaseUnits %></span>
  </div>
</div>

<div class="ari-dashboard-table-section ari-dashboard-table-unit-costs">
  <% costCollection.each(function(costModel) { %>
    <div class="ari-dashboard-table-unit-cost">
      <span>Units:&nbsp;<%= costModel.getUnitIds().length %></span>
    </div>
  <% }) %>
</div>

<div class="ari-dashboard-table-section ari-dashboard-table-arb-awards-container">
<% filteredRemedyModels.forEach(function(remedyModel) { %>
  <% var awardedCostModel = awardedCostCollection.find(function(cost) { return cost.getRemedyId() === remedyModel.id; }); %>
    <div class="ari-dashboard-table-arb-award">
      <span>Units:&nbsp;<%= awardedCostModel ? awardedCostModel.getUnitIds().length : 0 %></span>
      <% if (awardedCostModel) { %>
        <span data-cost-id="<%= awardedCostModel.getCostId() %>" class="general-link">Same as app</span>
      <% } %>
    </div>
  <% }) %>
</div>

<div class="ari-dashboard-table-section ari-dashboard-table-ri-container">
  <span>Granted:&nbsp;<%= numGranted %></span>
</div>`),

  className: 'ari-dashboard-table-footer',

  initialize(options) {
    this.mergeOptions(options, ['unitCollection', 'costCollection', 'awardedCostCollection', 'disputeClaim']);
  },

  templateContext() {
    const rentIncreaseUnits = this.unitCollection.filter(unit => unit.hasSavedRentIncreaseData());
    return {
      Formatter,
      awardedCostCollection: this.awardedCostCollection,
      costCollection: this.costCollection,
      filteredRemedyModels: this.disputeClaim.getAllRemedies().filter(remedy => !remedy.hasOutcome() || remedy.isOutcomeAwarded() || remedy.isOutcomeSettled()),
      numGranted: this.unitCollection.filter(unit => unit.get('awarded_amount')).length,
      numRentIncreaseTenants: rentIncreaseUnits.reduce((memo, unit) => memo + (
        Number(unit.get('selected_tenants')) > 0 ? Number(unit.get('selected_tenants')) : 0), 0),
      numRentIncreaseUnits: rentIncreaseUnits.length
    };
  }

});

export default ModalBaseView.extend({
  template,
  id: 'ariDashboard-modal',

  regions: {
    ariDashboard: '.ari-dashboard-table-lines',
    tableFooterRegion: '.ari-dashboard-table-footer-container',
    noteRegion: '.ari-dashboard-note'
  },

  ui() {
    return _.extend({}, ModalBaseView.prototype.ui, {
      save: '.btn-continue',
      resetCosts: '.ari-dashboard-table-footer .ari-dashboard-table-arb-award .general-link',
      downloadCsvFull: '.ari-dashboard-download-full',
      downloadCsvDecision: '.ari-dashboard-download-decision',
    });
  },

  events() {
    return _.extend({}, ModalBaseView.prototype.events, {
      'click @ui.save': 'clickSave',
      'click @ui.resetCosts': 'clickResetCosts',
      'click @ui.downloadCsvDecision': 'clickDownloadCsvDecision',
      'click @ui.downloadCsvFull': 'clickDownloadCsvFull'
    });
  },

  clickSave() {
    if (!this.validateAndShowErrors()) {
      return;
    }
    loaderChannel.trigger('page:load');
    // Update calculated amounts in all units
    this.units.forEach(unit => {
      let calculatedAmount = this.calculateTotalUnitRentIncreaseFn(unit);
      if (_.isNaN(calculatedAmount) || calculatedAmount < 0) {
        calculatedAmount = 0;
      } else if (!calculatedAmount) {
        calculatedAmount = null;
      }
      if (!unit.get('_isGranted')) {
        calculatedAmount = null;
      }
      unit.set('awarded_amount', calculatedAmount);
    });

    // Save working data back to the data parser
    IntakeAriDataParser.setCostCollection(this.costs);
    IntakeAriDataParser.setAwardedCostCollection(this.awardedCosts);
    IntakeAriDataParser.setUnitCollection(this.units);

    this.customDataObj.set({
      jsonData: IntakeAriDataParser.toJSON(),
      description: this.noteModel.getData()
    });
    this.customDataObj.setStringJson();

    this.customDataObj.save().done(() => {
      this.close();
      loaderChannel.trigger('page:load:complete');
    }).fail(err => {
      alert('[Error] There was an issue saving the custom data');
      loaderChannel.trigger('page:load:complete');
    });
  },

  clickResetCosts(ev) {
    const ele = $(ev.currentTarget);
    const costId = ele.data('costId');
    const awardedCost = this.awardedCosts.find(_awardedCost => _awardedCost.getCostId() === costId);
    if (!awardedCost) {
      return;
    }
    const matchingIntakeCost = this.costs.find(cost => cost.getRemedyId() === awardedCost.getRemedyId());
    const unitsToSet = matchingIntakeCost ? matchingIntakeCost.getUnitIds().filter(unitId => {
      const unitModel = this.units.findWhere({ unit_id: unitId });
      return unitModel && unitModel.hasSavedRentIncreaseData();
    }) : [];
    awardedCost.set('local-units', unitsToSet);
    this.units.trigger('refresh:dashboard');
  },
 
  clickDownloadCsvDecision() {
    // Remove some columns from awarded costs for decision mode
    const lines = this.convertCurrentViewDataToCsv().map(line => {
      const awardsCols = line.slice(4 + this.costs.length, -1);
      const indexesToRemove = this.awardedCosts.map((awardedCost, index) => index * 2 );
      for (let i=indexesToRemove.length -1; i >= 0; i--) {
        awardsCols.splice(indexesToRemove[i], 1);
      }
      return [line[0], ...awardsCols];
    });

    const costInfoLines = [];
    const calculationInfoLines = [];

    this.awardedCosts.map(awardedCost => {
      const remedyModel = awardedCost.getRemedyModel();
      if (!remedyModel) return;
      
      const matchingCostModel = this.costs.find(cost => cost.getRemedyId() === remedyModel.id);
      if (!matchingCostModel) return;

      const awardedAmount = remedyModel.getAwardedAmount();
      const awardedAmountDisplay = Formatter.toAmountDisplay(awardedAmount);

      const calculatedRentIncrease = Formatter.toAmountDisplay(calculateCostRentIncreaseFn(awardedAmount, matchingCostModel.getUnitIds().length));
      costInfoLines.push([`"${awardedAmountDisplay}"`, `"${remedyModel.getFirstDescription()}"`]);

      calculationInfoLines.push([`"RI Amount ${matchingCostModel.getCostId()} Calculation"`,
        `"${awardedAmountDisplay}/${matchingCostModel.getUnitIds().length}/${ARI_CALC_RENT_INCREASE_DIVISOR} = ${calculatedRentIncrease}"`]);
    });

    lines.push(['\r\n']);
    lines.push(['"Awarded Capital Expense Amounts"']);
    costInfoLines.forEach(line => lines.push(line));
    lines.push(['\r\n']);
    calculationInfoLines.forEach(line => lines.push(line));

    this._createAndDownloadCsvFile('Dispute_RI_Dec_', lines);
  },

  clickDownloadCsvFull() {
    const lines = this.convertCurrentViewDataToCsv();
    this._createAndDownloadCsvFile('Dispute_RI_Full_', lines);
  },

  _createAndDownloadCsvFile(filenameStart, csvFileLines) {
    const csvFilename = `${filenameStart}${this.model.get('file_number')}_${Moment().format('MM_DD_YYYY')}.csv`;
    filesChannel.request('download:csv', csvFileLines, csvFilename);
  },

  initialize() {
    this.disputeClaim = claimsChannel.request('get:by:code', configChannel.request('get', 'ARI_C_ISSUE_CODE'));

    this.customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'));    

    if (!this.customDataObj) {
      alert('No Intake ARI-C data could be found for this dispute.');
      this.close();
      return;
    }

    IntakeAriDataParser.parseFromCustomDataObj(this.customDataObj);

    this.units = IntakeAriDataParser.toUnitCollection();
    this.costs = IntakeAriDataParser.toCostCollection();
    this.awardedCosts = IntakeAriDataParser.toAwardedCostCollection();

    const awardedRemedies = this.disputeClaim.getAllRemedies().filter(remedyModel => remedyModel.isOutcomeAwarded() || remedyModel.isOutcomeSettled());
    const costDataToAdd = [];

    // Remove awarded costs that no longer link to an awarded remedy
    const costsNoLongerAwarded = this.awardedCosts.filter(cost => {
      const remedyId = cost.getRemedyId();
      return !awardedRemedies.filter(remedy => remedy.id === remedyId).length
    })
    this.awardedCosts.remove(costsNoLongerAwarded);

    // Add awarded cost model for awarded remedies, if none exist
    awardedRemedies.forEach(remedyModel => {
      if (!this.awardedCosts.find(awardedCost => awardedCost.getRemedyId() === remedyModel.id)) {
        // Get ID to use from the matching cost
        const matchingCost = this.costs.find(cost => cost.getRemedyId() === remedyModel.id);
        costDataToAdd.push({ 'local-awarded_cost_id': matchingCost ? matchingCost.getCostId() : '-', 'remedy-remedy_id': remedyModel.id });
      }
    });
    this.awardedCosts.add(costDataToAdd);

    this.createSubModels();
    this.setupListeners();
  },


  createSubModels() {
    this.noteModel = new TextareaModel({
      labelText: 'RI Dashboard Note',
      inputType: 'text',
      cssClass: 'optional-input',
      required: false,
      displayRows: 2,
      value: this.customDataObj.get('description'),
      apiMapping: 'description'
    });
  },

  setupListeners() {
    this.listenTo(this.units, 'refresh:dashboard', () => {
      ['ariDashboard', 'tableFooterRegion'].forEach(regionName => {
        const view = this.getChildView(regionName);
        if (view && view.isRendered()) {
          view.render();
        }
      });
    }, this);
  },

  calculateTotalUnitRentIncreaseFn(unitModel) {
    let total = 0;
    if (!this.disputeClaim.allOutcomesComplete()) {
      return total;
    }
    this.awardedCosts.forEach(awardedCostModel => {
      if (!awardedCostModel.hasUnit(unitModel.get('unit_id'))) {
        return;
      }

      const remedyModel = awardedCostModel.getRemedyModel();
      if (!remedyModel) {
        return;
      }

      const matchingCostModel = this.costs.find(cost => cost.getRemedyId() === remedyModel.id);
      if (!matchingCostModel) {
        return;
      }

      const calculatedRentIncrease = calculateCostRentIncreaseFn(remedyModel.getAwardedAmount(), matchingCostModel.getUnitIds().length);

      total += calculatedRentIncrease;
    });

    return total;
  },

  convertCurrentViewDataToCsv() {
    const allLines = [];
    const preCostsHeaderLine = ['Unit', 'Current Rent', 'Tenants', 'RI Unit?'];
    const postCostsHeaderLine = ['Total Eligible RI', 'RI Granted?'];

    allLines.push([
      ...preCostsHeaderLine,
      ...this.costs.map(cost => `Cost ${cost.getCostId()}: ${Formatter.toAmountDisplay(cost.getRemedyModel() && cost.getRemedyModel().getAmount())}`),
      ..._.flatten(this.awardedCosts.map(cost => ([
        `Award ${cost.getCostId()}: ${Formatter.toAmountDisplay(cost.getRemedyModel() && cost.getRemedyModel().getAwardedAmount())}`,
        `Eligible RI Amount ${cost.getCostId()}`
      ]))),
      ...postCostsHeaderLine
    ]);
    this.units.each(unitModel => {
      const unitId = unitModel.get('unit_id');
      const line = [
        `${unitModel.getUnitNumDisplayShort()}: ${unitModel.getStreetDisplayWithDescriptor()}`,
        Formatter.toAmountDisplay(unitModel.getRentAmount() || 0),
        unitModel.get('selected_tenants') > 0 ? unitModel.get('selected_tenants') : 0,
        unitModel.hasSavedRentIncreaseData() ? 'Yes' : 'No',
        ...this.costs.map(cost => cost.hasUnit(unitId) ? 'Included' : 'Not Included'),
        ..._.flatten(this.awardedCosts.map(awardedCost => {
          const remedy = awardedCost.getRemedyModel();
          const matchingIntakeCost = this.costs.find(cost => cost.getRemedyId() === awardedCost.getRemedyId());
          const hasUnit = awardedCost.hasUnit(unitId);
          const includeText = hasUnit ? 'Included' : 'Not Included';
          const calculatedAmount = remedy && hasUnit ? calculateCostRentIncreaseFn(remedy.getAwardedAmount(), matchingIntakeCost.getUnitIds().length) : 0;
          return [includeText, Formatter.toAmountDisplay(calculatedAmount > 0 ? calculatedAmount : 0)];
        })),
        Formatter.toAmountDisplay(this.calculateTotalUnitRentIncreaseFn(unitModel) || 0),
        unitModel.get('awarded_amount') > 0 ? 'Yes' : 'No'
      ];
      allLines.push(line);
    });

    // Enclose all items before returning
    return allLines.map(line => line.map(item => `"${item}"`));
  },

  validateAndShowErrors() {
    let isValid = true;
    const view = this.getChildView('noteRegion');

    if (view && view.isRendered()) {
      isValid = view.validateAndShowErrors() && isValid;
    }

    return isValid;
  },
  
  onRender() {
    const AriDashboardLines = Marionette.CollectionView.extend({
      template: _.noop,
      childView: AriDashboardLine,
      childViewOptions: {
        awardedCostCollection: this.awardedCosts,
        costCollection: this.costs,
        disputeClaim: this.disputeClaim,
        calculateCostRentIncreaseFn,
        calculateTotalUnitRentIncreaseFn: this.calculateTotalUnitRentIncreaseFn.bind(this)
      }
    });

    this.showChildView('ariDashboard', new AriDashboardLines({ collection: this.units }));

    this.showChildView('tableFooterRegion', new TableFooterView({
      Formatter,
      awardedCostCollection: this.awardedCosts,
      costCollection: this.costs,
      unitCollection: this.units,
      disputeClaim: this.disputeClaim
    }));

    this.showChildView('noteRegion', new TextareaView({ model: this.noteModel }));
  },

  templateContext() {
    return {
      Formatter,
      awardedCostCollection: this.awardedCosts,
      costCollection: this.costs,
      filteredRemedyModels: this.disputeClaim.getAllRemedies().filter(remedy => !remedy.hasOutcome() || remedy.isOutcomeAwarded() || remedy.isOutcomeSettled())
    };
  }
});
