import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import UnitsCollectionView from './Units';
import template from './IntakeAriPageImprovementUnits_template.tpl';

import IntakeAriDataParser from '../../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';
import CustomDataObjModel from '../../../../core/components/custom-data-objs/dispute/CustomDataObj_model';

const disputeChannel = Radio.channel('dispute');
const claimsChannel = Radio.channel('claims');
const customDataObjsChannel = Radio.channel('custom-data-objs');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const applicationChannel = Radio.channel('application');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

export default PageView.extend({
  template,

  regions: {
    unitCount: '.ari-intake-unitCount',
    units: '#ari-iu-units'
  },

  getRoutingFragment() {
    return 'page/4';
  },

  initialize() {
    PageView.prototype.initialize.call(this, arguments);

    const customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'));
    
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();
    }

    this.createPageItems();
    this.setupListenersBetweenItems();
    this.setupFlows();

    applicationChannel.trigger('progress:step', 4);
  },

  createPageItems() {
    this.units = IntakeAriDataParser.toUnitCollection();

    // Create rental address component
    const unitCountModel = new InputModel({
      labelText: 'Total units',
      inputType: 'positive_integer',
      errorMessage: 'Please enter one or more units',
      required: true,
      showValidate: true,
      value: this.units.length || null,

      _previousValue: this.units.length || null
    });
    this.addPageItem('unitCount', new PageItemView({
      stepText: `What is the total number of specified dwelling units that are associated to the installation, repair(s) or replacement(s) of a major system or component that you are including in this application? You must enter all specified dwelling units regardless of whether or not they will be included in the rent increase.`,
      subView: new InputView({ model: unitCountModel }),
      stepComplete: unitCountModel.isValid(),
      helpHtml: 'For more information on how specified dwelling units are associated or affected by an installation, repair or replacement of a major system or component, read <a href="javascript:;" class="static-external-link" url="https://www2.gov.bc.ca/assets/gov/housing-and-tenancy/residential-tenancies/policy-guidelines/gl37.pdf">Policy Guideline 37: Rent Increases</a>.',
    }));

    this.addPageItem('units', new PageItemView({
      stepText: null,
      subView: new UnitsCollectionView({ collection: this.units }),
      stepComplete: true
    }));

    this.first_view_id = 'unitCount';
  },

  showConfirmDelete(unitModel, onDeleteFn, bodyHtmlToAppend) {
    // Some units do not have saved data, so show just the unit name in those cases
    const collection = unitModel.collection;
    const displayIndex = collection ? collection.indexOf(unitModel) : null;
    const unitDisplay = unitModel.get('unit_id') ? unitModel.getUnitNumDisplay() : `Unit${displayIndex ? ` ${Formatter.toLeftPad(displayIndex+1, '0', 3)}` : ''}`;

    modalChannel.request('show:standard', {
      title: `Confirm ${unitDisplay} Removal`,
      bodyHtml: `<p><b>Remove ${unitModel.get('unit_id') ? unitModel.getStreetDisplayWithDescriptor() : unitDisplay} as a dwelling unit?</b></p>
        ${bodyHtmlToAppend}
        <p>Press Cancel to keep this unit or Continue to remove the unit.</p>`,
      onContinueFn: (modalView) => {
        modalView.close();

        if (typeof onDeleteFn === 'function') {
          onDeleteFn();
        }
      },
    });
  },

  showConfirmDeleteWithData(unitModel, onDeleteFn) {
    this.showConfirmDelete(unitModel, onDeleteFn, `<p>
      Removing this unit will delete all associated information from your application including capital expenditures and rent increase calculations related to the unit. This action cannot be undone.</p>`);
  },

  showConfirmDeleteNoData(unitModel, onDeleteFn) {
    this.showConfirmDelete(unitModel, onDeleteFn, `<p>
      Are you sure you want to remove your unit from your list of units?  This action cannot be undone</p>`);
  },

  setupListenersBetweenItems() {
    const renderFn = () => this.render();
    const deleteFn = (unitModel) => {
      loaderChannel.trigger('page:load');

      IntakeAriDataParser.setUnitCollection(this.units);
      IntakeAriDataParser.removeUnitFromJson(unitModel);

      const jsonDataObj = new CustomDataObjModel({
        custom_data_object_id: IntakeAriDataParser.getLoadedId(),
        object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'),
        jsonData: IntakeAriDataParser.toJSON()
      });

      // Delete participant IDs we have passed in, or all participant IDs if none passed
      Promise.all([
        jsonDataObj.save(),
        ...(_.map(unitModel.getParticipantIds(), participantId => {
          const participantModel = participantsChannel.request('get:participant', participantId);
          return participantsChannel.request('delete:participant', participantModel);
        }))
      ]).then(() => {
        this.createPageItems();
        this.setupListenersBetweenItems();
        this.setupFlows();
        
        renderFn();
        loaderChannel.trigger('page:load:complete');
      }, err => {
        alert(err);
        loaderChannel.trigger('page:load:complete');
      });
    };

    this.stopListening(this.units, 'delete:full');
    this.listenTo(this.units, 'delete:full', (unitModel) => {
      const associatedCosts = IntakeAriDataParser.toCostCollection().filter(cost => _.contains(cost.getUnitIds(), unitModel.get('unit_id')));
      
      // If the unit has been saved to the JSON, we need to remove it and clean up
      if (unitModel.hasSavedAddressData()) {
        // Perform an extra validation step because delete will cause a current-state page save
        if (!this.prepPageValidatePageAndScrollToFirstError()) {
          return;
        }

        // Only show a warning if the unit had data from future steps
        if (associatedCosts.length || unitModel.hasSavedRentIncreaseData()) {
          this.showConfirmDeleteWithData(unitModel, deleteFn.bind(this, unitModel));
        } else {
          this.showConfirmDeleteNoData(unitModel, deleteFn.bind(this, unitModel));
        }
      } else {
        this.showConfirmDeleteNoData(unitModel, () => {
          // If the unit has not been saved, then it can be filtered locally
          this.units.filter(unit => unit.get('unit_id') > unitModel.get('unit_id')).forEach(unit => {
            unit.set('unit_id', unit.get('unit_id') - 1);
          });
          this.units.remove(unitModel, { silent: true });
          this.decrementUnitCount();

          const units = this.getPageItem('units');
          if (units && units.isRendered()) {
            units.render();
          }
        });
      }
    });
  },

  showUnitRemovalHelp() {
    modalChannel.request('show:standard', {
      title: 'Removing a Unit',
      bodyHtml: 'To remove a unit from your application, please click the red garbage can icon. Press cancel to return to your application.',
      hideContinueButton: true
    });
  },

  setupFlows() {
    const unitCount = this.getPageItem('unitCount');
    const disputeCity = disputeChannel.request('get').get('tenancy_city');

    this.listenTo(unitCount, 'itemComplete', (options) => {
      const unitCountModel = unitCount.getModel();
      const count = unitCountModel.getData();

      if (Number(count) < this.units.filter(unit => unit.hasSavedAddressData()).length) {
        unitCountModel.set('value', unitCountModel.get('_previousValue') || null);
        unitCountModel.trigger('render');
        this.showUnitRemovalHelp();
      } else if (unitCountModel.isValid()) {
        unitCountModel.set('_previousValue', count, { silent: true });
        this.units.setTo(count, { city: disputeCity });
        this.showPageItem('units', options);
        this.showNextButton(_.extend({}, options, {no_animate: true}));
      }
    });
  },

  decrementUnitCount() {
    const unitCount = this.getPageItem('unitCount');
    const unitCountModel = unitCount.getModel();
    unitCountModel.trigger('update:input', unitCountModel.get('value') - 1, { update_saved_value: true });
  },


  onRender() {
    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});
  },

  previousPage() {
    Backbone.history.navigate('page/3', {trigger: true});
  },

  getPageApiUpdates() {
    return {};
  },

  validatePage() {
    const checkAndShowSharedUnitAddressWarning = () => {
      let duplicateUnits = [];
      // Find the first duplicate units and display them
      this.units.filter(unit => !unit.isSharedAddressSelected()).forEach(unit => {
        if (duplicateUnits.length >= 2) {
          return;
        }
        duplicateUnits = [unit, ...(this.units.filter(_unit => _unit.get('unit_id') !== unit.get('unit_id') && _unit.get('address') === unit.get('address')))];
      });

      if (duplicateUnits.length >= 2) {
        const toUnitDisplayFn = (unitCollection) => unitCollection.map(unit => unit.getUnitNumDisplay());
        modalChannel.request('show:standard', {
          title: 'Duplicate Unit Address',
          bodyHtml: `${toUnitDisplayFn(duplicateUnits.slice(0, 1))} has the same address as ${toUnitDisplayFn(duplicateUnits.slice(1)).join(', ')} although you have indicted that they do not share the same address. Each unit must either be shared or unique. You must fix this error before you can continue.`,
          hideCancelButton: true,
          primaryButtonText: 'Close',
          onContinueFn(modalView) { modalView.close(); }
        });
      }

      return duplicateUnits.length < 2;
    };
    const arePageItemsValid = PageView.prototype.validatePage.call(this);
    
    return arePageItemsValid && checkAndShowSharedUnitAddressWarning();
  },

  prepPageValidatePageAndScrollToFirstError() {
    this.units.saveInternalDataToModel();
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
    if (!this.prepPageValidatePageAndScrollToFirstError()) {
      return;
    }

    IntakeAriDataParser.setUnitCollection(this.units);
    console.log(IntakeAriDataParser.get('_json'));

    const jsonDataObj = new CustomDataObjModel({
      custom_data_object_id: IntakeAriDataParser.getLoadedId(),
      object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_ARI_C'),
      jsonData: IntakeAriDataParser.toJSON()
    });

    const ARI_C_ISSUE_CODE = configChannel.request('get', 'ARI_C_ISSUE_CODE');
    
    const claims = claimsChannel.request('get');
    const claimsXHR = claims.setClaimListTo([ARI_C_ISSUE_CODE]);
    
    console.log(jsonDataObj);

    loaderChannel.trigger('page:load');
    Promise.all([jsonDataObj.save.bind(jsonDataObj)(), ..._.map(claimsXHR, xhr => xhr()) ])
      .then(() => {
        loaderChannel.trigger('page:load:complete');
        applicationChannel.trigger('progress:step:complete', 4);
        Backbone.history.navigate('page/5', { trigger: true});
      }, this.createPageApiErrorHandler(this));
  }
});
