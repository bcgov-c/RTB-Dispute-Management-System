import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import UnitRentIncreaseCollectionView from './UnitRentIncreases';
import IntakeAriDataParser from '../../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';
import CustomDataObjModel from '../../../../core/components/custom-data-objs/dispute/CustomDataObj_model';
import template from './IntakeAriPageRentIncrease_template.tpl';

const PAGE_ERROR_MESSAGE_NO_UNITS_SELECETED = 'At least one unit must be selected';

const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');

export default PageView.extend({
  template,

  regions: {
    rentIncreaseUnits: '#ari-rent-increase-units'
  },

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      error: '.error-block',
      selectedUnits: '.ari-rent-increase-selected-units',
      selectedTenants: '.ari-rent-increase-selected-tenants',
      selectAll: '.rent-increase-select-all'
    });
  },

  events() {
    return _.extend({}, PageView.prototype.events, {
      'click @ui.selectAll': 'clickSelectAll'
    });
  },

  clickSelectAll() {
    const rentIncreaseUnits = this.getPageItem('rentIncreaseUnits').subView;
    if (rentIncreaseUnits && rentIncreaseUnits.isRendered()) {
      rentIncreaseUnits.children.forEach(childView => {
        if (childView.isRendered() && _.isFunction(childView.selectUnitCheckbox)) {
          childView.selectUnitCheckbox.bind(childView)();
        }
      });
    }
  },
  

  getRoutingFragment() {
    return 'page/7';
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

    this.createPageItems();
    this.setupListenersBetweenItems();

    applicationChannel.trigger('progress:step', 7);
  },

  createPageItems() {
    this.units = IntakeAriDataParser.toUnitCollection();
    console.log(this.units);

    this.addPageItem('rentIncreaseUnits', new PageItemView({
      stepText: null,
      subView: new UnitRentIncreaseCollectionView({
        collection: this.units,
        childViewOptions: { validatePageFn: this.validatePageAndScrollToFirstError.bind(this) }
      }),
      // Only one page item, so it can always be considered completed
      stepComplete: true,
    }));
    
    this.first_view_id = 'rentIncreaseUnits';
  },

  setupListenersBetweenItems() {
    this.stopListening(this.units, 'update:counts');
    this.listenTo(this.units, 'update:counts', () => {
      this.hidePageErrorMessage();
      this.getUI('selectedUnits').html(this.getSelectedUnits());
      this.getUI('selectedTenants').html(this.getSelectedTenants());
    });


    const renderFn = () => this.render();
    const deleteFn = (unitModel, matchingUnitUpdateFn=null, participantsToDelete=null) => {
      if (!this.validatePageAndScrollToFirstError()) {
        return;
      }

      participantsToDelete = participantsToDelete && participantsToDelete.length ? participantsToDelete : unitModel.getParticipantIds();
      matchingUnitUpdateFn = _.isFunction(matchingUnitUpdateFn) ? matchingUnitUpdateFn : () => {};
      loaderChannel.trigger('page:load');
      
      // Save current page changes
      this.saveInternalUnitDataToModel();
      const matchingUnit = unitModel.get('unit_id') && this.units.findWhere({ unit_id: unitModel.get('unit_id')});
      if (matchingUnit) {
        // Delete participant IDs we have passed in, or all participant IDs if none passed
        matchingUnitUpdateFn(matchingUnit);
        IntakeAriDataParser.setUnitCollection(this.units);
      }

      const jsonDataObj = new CustomDataObjModel({
        custom_data_object_id: IntakeAriDataParser.getLoadedId(),
        object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'),
        jsonData: IntakeAriDataParser.toJSON()
      });

      Promise.all([
        jsonDataObj.save(),
        ...(_.map(participantsToDelete, participantId => {
          const participantModel = participantsChannel.request('get:participant', participantId);
          return participantsChannel.request('delete:participant', participantModel);
        }))
      ]).then(() => {
        this.createPageItems();
        this.setupListenersBetweenItems();
        
        renderFn();
        loaderChannel.trigger('page:load:complete');
      }, err => {
        alert(err);
        loaderChannel.trigger('page:load:complete');
      });
    };

    this.stopListening(this.units, 'delete:full');
    this.listenTo(this.units, 'delete:full', (unitModel) => {
      deleteFn(unitModel, (matchingUnit) => {
        matchingUnit.clearParticipantIds();
        matchingUnit.clearSavedRentIncreaseData();
      });
    });

    this.stopListening(this.units, 'delete:participants');
    this.listenTo(this.units, 'delete:participants', (unitModel, participantsToDelete) => {
      deleteFn(unitModel, (matchingUnit) => {
        // Update the tenant count to reflect what was chosen to make this selection
        matchingUnit.set('selected_tenants', unitModel.get('selected_tenants'));
        matchingUnit.removeParticipantIds(participantsToDelete);
      }, participantsToDelete);
    });
  },


  getSelectedUnits() {
    const rentIncreaseUnits = this.isRendered() ? this.getChildView('rentIncreaseUnits') : null;
    return rentIncreaseUnits && rentIncreaseUnits.subView && _.isFunction(rentIncreaseUnits.subView.getTotalSelectedUnits) ? rentIncreaseUnits.subView.getTotalSelectedUnits() : 0;
  },

  getSelectedTenants() {
    const rentIncreaseUnits = this.isRendered() ? this.getChildView('rentIncreaseUnits') : null;
    return rentIncreaseUnits && rentIncreaseUnits.subView && _.isFunction(rentIncreaseUnits.subView.getTotalSelectedTenants) ? rentIncreaseUnits.subView.getTotalSelectedTenants() : 0;
  },  

  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});

    // Always perform a count update, because the num selected values are driven from UI components which may only have been instantiated in onRender.
    this.units.trigger('update:counts');
  },

  templateContext() {
    return {
      numUnits: this.units.length,
      numSelectedUnits: this.getSelectedUnits(),
      numSelectedTenants: this.getSelectedTenants(),
    };
  },

  previousPage() {
    Backbone.history.navigate('page/6', {trigger: true});
  },

  getPageApiUpdates() {
    return {};
  },

  showPageErrorMessage(errorMessage) {
    this.getUI('error').html(errorMessage).show();
  },

  hidePageErrorMessage() {
    this.getUI('error').html('').hide();
  },

  validatePage() {
    let isValid = PageView.prototype.validatePage.call(this);

    if (isValid && this.getSelectedUnits() === 0) {
      this.showPageErrorMessage(PAGE_ERROR_MESSAGE_NO_UNITS_SELECETED);
      isValid = false;
    }

    return isValid;
  },

  saveInternalUnitDataToModel() {
    const rentIncreaseUnits = this.getPageItem('rentIncreaseUnits');
    if (rentIncreaseUnits.subView && _.isFunction(rentIncreaseUnits.subView.saveInternalDataToModel)) {
      rentIncreaseUnits.subView.saveInternalDataToModel();
    }
    IntakeAriDataParser.setUnitCollection(this.units);
  },

  validatePageAndScrollToFirstError() {
    const isValid = this.validatePage();
    if (!isValid) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
    }
    return isValid;
  },

  nextPage() {
    if (!this.validatePageAndScrollToFirstError()) {
      return;
    }

    this.saveInternalUnitDataToModel();
    const awardedCostCollection = IntakeAriDataParser.toAwardedCostCollection();
    awardedCostCollection.each(awardedCost => {
      awardedCost.getUnitIds().forEach(unitId => {
        if (this.units.findWhere({ unit_id: unitId })) {
          awardedCost.removeUnit(unitId)
        }
      });
    });

    IntakeAriDataParser.setAwardedCostCollection(awardedCostCollection);
    console.log(IntakeAriDataParser.get('_json'));

    const jsonDataObj = new CustomDataObjModel({
      custom_data_object_id: IntakeAriDataParser.getLoadedId(),
      object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'),
      jsonData: IntakeAriDataParser.toJSON()
    });

    loaderChannel.trigger('page:load');
    jsonDataObj.save()
      .done(() => {
        loaderChannel.trigger('page:load:complete');
        applicationChannel.trigger('progress:step:complete', 7);
        Backbone.history.navigate('page/8', { trigger: true});
      }).fail(this.createPageApiErrorHandler(this));
  }

});
