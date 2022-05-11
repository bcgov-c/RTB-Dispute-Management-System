import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import UnitCostAssociationCollectionView from './UnitCostAssociations';
import template from './IntakeAriPageUnitCosts_template.tpl';

import IntakeAriDataParser from '../../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';
import CustomDataObjModel from '../../../../core/components/custom-data-objs/dispute/CustomDataObj_model';

const GENERAL_UNIT_ERROR_MESSAGE = `The units that you entered must all be associated to at least one expenditure. The following units are not associated to any capital expenditure. Please associate these units to their appropriate capital expenditure.`;
const INDIVIDUAL_UNIT_ERROR_MESSAGE = `is not associated to any capital expenditure.`;

const claimsChannel = Radio.channel('claims');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

export default PageView.extend({
  template,

  regions: {
    unitCosts: '#ari-unit-costs'
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      error: '.static-error-warning'
    });
  },

  getRoutingFragment() {
    return 'page/6';
  },

  // If we are moving on, remove front-end respondents we added
  cleanupPageInProgress() {
    
    PageView.prototype.cleanupPageInProgress.call(this);
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    const customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'));
    
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();

      console.log(`[Error] Couldn't load JSON data, showing error modal and redirecting to file list`);
      applicationChannel.request('show:ari:json:error:modal');
    }

    this.disputeClaim = claimsChannel.request('get:by:code', configChannel.request('get', 'ARI_C_ISSUE_CODE'));

    console.log(this.disputeClaim);

    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 6);
  },

  createPageItems() {
    this.remedies = this.disputeClaim.getAllRemedies();

    this.addPageItem('unitCosts', new PageItemView({
      stepText: null,
      subView: new UnitCostAssociationCollectionView({
        collection: this.remedies,
        unitCollection: IntakeAriDataParser.toUnitCollection(),
        capitalCostsData: IntakeAriDataParser.getCapitalCostsData()
      }),
      stepComplete: true, // Only one item on the page, so do not need to validate
    }));
    
    this.first_view_id = 'unitCosts';
  },

  setupListenersBetweenItems() {
    this.listenTo(this.remedies, 'update:counts', this.hideErrorMessage, this);
  },


  setupFlows() {

  },


  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  previousPage() {
    Backbone.history.navigate('page/5', {trigger: true});
  },

  getPageApiUpdates() {
    return {};
  },

  validatePage() {
    const isValid = PageView.prototype.validatePage.call(this);
    const unitCostCollectionView = this.getPageItem('unitCosts').subView;
    const unitCostData = unitCostCollectionView.toIntakeAriData() || [];
    const allUnitIds = unitCostCollectionView.unitCollection.map(unit => unit.get('unit_id'));
    const unitsWithoutCost = _.filter(allUnitIds, unitId => !_.find(unitCostData, data => _.contains(data['local-units'], unitId)));

    let errorMessage = '';
    if (unitsWithoutCost.length) {
      errorMessage += `<p>${GENERAL_UNIT_ERROR_MESSAGE}</p><p><ul>`;
      _.each(unitsWithoutCost, function(unit) {
        const unitModel = unitCostCollectionView.unitCollection.findWhere({ unit_id: unit });
        if (unitModel) {
          errorMessage += `<li>${unitModel.getUnitNumDisplay()} ${INDIVIDUAL_UNIT_ERROR_MESSAGE}</li>`;
        }
      });
      errorMessage += `</p></ul>`;
    }

    if (errorMessage) {
      this.showErrorMessage(errorMessage);
    }

    return errorMessage === '' && isValid;
  },

  showErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).show();
  },

  hideErrorMessage() {
    this.getUI('error').html('').hide();
  },

  nextPage() {
    if (!this.validatePage()) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    const unitCostCollectionView = this.getPageItem('unitCosts').subView;

    const unitCostData = unitCostCollectionView.toIntakeAriData();
    IntakeAriDataParser.setCapitalCostsData(unitCostData);
    
    const costCollection = IntakeAriDataParser.toCostCollection();
    const awardedCostCollection = IntakeAriDataParser.toAwardedCostCollection()
    awardedCostCollection.each(awardedCost => {
      const matchingCost = costCollection.find(cost => cost.getRemedyId() === awardedCost.getRemedyId());
      if (matchingCost) {
        awardedCost.getUnitIds().forEach(unitId => {
          if (!matchingCost.hasUnit(unitId)) {
            awardedCost.removeUnit(unitId);
          }
        });
      }
    });
    IntakeAriDataParser.setAwardedCostCollection(awardedCostCollection);

    console.log(IntakeAriDataParser.get('_json'));

    const jsonDataObj = new CustomDataObjModel({
      custom_data_object_id: IntakeAriDataParser.getLoadedId(),
      object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'),
      jsonData: IntakeAriDataParser.toJSON()
    });
    
    console.log(jsonDataObj);

    loaderChannel.trigger('page:load');
    Promise.all([jsonDataObj.save()])
      .then(() => {
        loaderChannel.trigger('page:load:complete');
        applicationChannel.trigger('progress:step:complete', 6);
        Backbone.history.navigate('page/7', { trigger: true});
      }, this.createPageApiErrorHandler(this));
  }
});
