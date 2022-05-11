import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../../core/components/page/Page';
import PageItemView from '../../../../core/components/page/PageItem';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import RenovationUnitsCollectionView from './RenovationUnits';
import ModalAriMultiDelete from '../../../components/multi-delete/ModalAriMultiDelete';
import template from './IntakePfrPageRenovationUnits_template.tpl';

import IntakeAriDataParser from '../../../../core/components/custom-data-objs/ari-c/IntakeAriDataParser';
import CustomDataObjModel from '../../../../core/components/custom-data-objs/dispute/CustomDataObj_model';
import ViewMixin from '../../../../core/utilities/ViewMixin';

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

  ui() {
    return _.extend({}, PageView.prototype.ui, {
      unitsContainer: '.pfr-iu-units-container'
    });
  },

  regions: {
    unitCount: '.ari-intake-unitCount',
    units: '#pfr-iu-units'
  },

  getRoutingFragment() {
    return 'page/4';
  },

  initialize() {
    this.isLoading = true;
    PageView.prototype.initialize.call(this, arguments);
    applicationChannel.trigger('progress:step', 4);

    loaderChannel.trigger('page:load');

    const customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'));
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    } else {
      IntakeAriDataParser.createDefaultJson();
    }

    this._claimDescriptionDataLookup = {};
    this.pfrClaimConfig = configChannel.request('get:issue', configChannel.request('get', 'PFR_ISSUE_CODE'));
    this.units = IntakeAriDataParser.toUnitCollection();

    this.checkAndCleanupUnitsWithMissingIssuePromise().finally(() => {
      this.isLoading = false;
      this.createPageItems();
      this.setupListenersBetweenItems();
      this.setupFlows();
      this.render();
    });
  },

  checkAndCleanupUnitsWithMissingIssuePromise() {
    const unitsWithMissingIssue = [];
    (this.units || []).forEach(unitModel => {
      const issueId = unitModel.get('issue_id');
      if (issueId && !claimsChannel.request('get:claim', issueId, { no_removed: true })) {
        unitsWithMissingIssue.push(unitModel);
      }
    });

    return this._deleteMultipleUnits(unitsWithMissingIssue);
  },

  _deleteMultipleUnits(unitModelsToDelete) {
    // Always save any page changes to the model first
    this.saveInProgressPageDataToUnits();

    // Save current unit values to JSON first
    IntakeAriDataParser.setUnitCollection(this.units);
    this.updateLocalClaimDescriptions();

    IntakeAriDataParser.removeUnitsFromJson(unitModelsToDelete);
    const jsonDataObj = new CustomDataObjModel({
      custom_data_object_id: IntakeAriDataParser.getLoadedId(),
      object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'),
      jsonData: IntakeAriDataParser.toJSON()
    });
  


    return Promise.all([
      jsonDataObj.save(),
      ...(_.map(unitModelsToDelete, unitModel => {
        const disputeClaim = claimsChannel.request('get:claim', unitModel.get('issue_id'));
        return this._deleteUnitSupportingData(unitModel, disputeClaim);
      }))
    ]);
  },

  updateLocalClaimDescriptions() {
    this._claimDescriptionDataLookup = {};
    const unitsView = this.getPageItem('units');

    if (unitsView && unitsView.isRendered()) {
      this.units.forEach(unitModel => {
        const claimId = unitModel.get('issue_id');
        if (!claimId) { return; }
        this._claimDescriptionDataLookup[claimId] = unitsView.subView.getUserDescription(claimId);
      });
    }
  },

  updateClaimsFromSavedClaimDescriptions(claimsToUpdate) {
    Object.keys(this._claimDescriptionDataLookup).forEach(key => {
      const matchingClaim = claimsToUpdate.find(disputeClaim => disputeClaim.claim.id === Number(key));
      const description = this._claimDescriptionDataLookup[key];

      if (description && matchingClaim) {
        const claimDetail = matchingClaim.getApplicantsClaimDetail();
        if (claimDetail) {
          claimDetail.set('description', description);
        }
      }
    });
    return claimsToUpdate;
  },

  createPageItems() {
    // Always re-initialize the custom data object when we re-initialize page values
    const customDataObj = customDataObjsChannel.request('get:type', configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'));
    if (customDataObj) {
      IntakeAriDataParser.parseFromCustomDataObj(customDataObj);
    }

    this.units = IntakeAriDataParser.toUnitCollection();

    const claims = this.updateClaimsFromSavedClaimDescriptions(claimsChannel.request('get:full'));

    // Create rental address component
    this.unitCountModel = new InputModel({
      labelText: 'Total units',
      inputType: 'positive_integer',
      errorMessage: 'Please enter one or more units',
      required: true,
      maxLength: 3,
      showValidate: true,
      value: this.units.length || null,

      _previousValue: this.units.length || null
    });
    this.addPageItem('unitCount', new PageItemView({
      stepText: 'Please enter the total number of rental units that require vacant possession to complete the renovations or repairs.',
      subView: new InputView({ model: this.unitCountModel }),
      stepComplete: this.unitCountModel.isValid(),
      helpHtml: null,
    }));

    
    this.addPageItem('units', new PageItemView({
      stepText: null,
      subView: new RenovationUnitsCollectionView({
        pfrClaimCode: (this.pfrClaimConfig || {}).id,
        disputeClaimCollection: claims,
        collection: this.units
      }),
      stepComplete: true
    }));

    this.first_view_id = 'unitCount';
  },

  showMultiUnitDeleteModal(numUnits) {
    let isContinuePressed = false;
    const numSavedUnits = this.units.length;
    const numToRemove = numSavedUnits - numUnits;
    if (numToRemove < 1) {
      return;
    }

    const modalView = new ModalAriMultiDelete({
      title: `Delete Units`,
      bodyHtml: `<p>Information for ${numSavedUnits} unit${numSavedUnits===1?'':'s'} has been added to this application, but you have selected that there are only ${numUnits} unit${numUnits===1?' is':'s are'} in this application.</p>
      <p>Please select <b>${numToRemove} unit${numToRemove===1?'':'s'}</b> to be deleted from this application.</p>`,
      primaryButtonText: `Delete unit${numToRemove===1?'':'s'}`,
      onContinueFn: (_modalView) => {
        isContinuePressed = true;
        const checkedUnitModels = _.map(_modalView.checkboxCollection.getData(), model => model.get('unitModel'));
        _modalView.close();

        loaderChannel.trigger('page:load');
        this._deleteMultipleUnits(checkedUnitModels).then(() => {
          this.createPageItems();
          this.setupListenersBetweenItems();
          this.setupFlows();
          this.render();
        });
      },
      checkboxesOptions: { minSelectsRequired: numToRemove, maxSelectsAllowed: numToRemove },
      checkboxesData: _.filter(this.units.map(unitModel => {
        const unitStreetDisplay = unitModel.getStreetDisplayWithDescriptor();
        const unitDisplay = unitStreetDisplay || unitModel.getUnitNumDisplay();
        return {
          html: unitDisplay,
          unitModel
        };
      }), v => v)
    });

    modalChannel.request('add', modalView);
    this.listenTo(modalView, 'removed:modal', () => {
      if (!isContinuePressed) {
        this.unitCountModel.trigger('update:input', this.unitCountModel.get('_previousValue') || null, { update_saved_value: true });
        this.unitCountModel.trigger('render');
      }
    });
  },


  showConfirmDelete(unitModel, onDeleteFn) {
    // Some units do not have saved data, so show just the unit name in those cases
    const collection = unitModel.collection;
    const displayIndex = collection ? collection.indexOf(unitModel) : null;
    const unitDisplay = unitModel.get('unit_id') ? unitModel.getUnitNumDisplay() : `Unit${displayIndex ? ` ${Formatter.toLeftPad(displayIndex+1, '0', 3)}` : ''}`;

    modalChannel.request('show:standard', {
      title: `Confirm ${unitDisplay} Removal`,
      bodyHtml: `<p><b>Remove ${unitModel.get('unit_id') && unitModel.getStreetDisplayWithDescriptor() ? unitModel.getStreetDisplayWithDescriptor() : unitDisplay} as a renovation unit?</b></p>
        <p>This renovation unit and any entered information, evidence or associated tenants will also be deleted.  This action cannot be undone.</p>
        <p>Press Cancel to keep this unit or Continue to delete the unit.</p>`,
      onContinueFn: (modalView) => {
        modalView.close();
        if (typeof onDeleteFn === 'function') {
          onDeleteFn();
        }
      },
    });
  },


  _deleteUnit(unitModel, disputeClaim) {
    // Always save any page changes to the model first
    this.saveInProgressPageDataToUnits();
    this.updateLocalClaimDescriptions();
    IntakeAriDataParser.setUnitCollection(this.units);
    IntakeAriDataParser.removeUnitFromJson(unitModel);

    const jsonDataObj = new CustomDataObjModel({
      custom_data_object_id: IntakeAriDataParser.getLoadedId(),
      object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'),
      jsonData: IntakeAriDataParser.toJSON()
    });

    // Delete participant IDs we have passed in, or all participant IDs if none passed
    return Promise.all([
      jsonDataObj.save(),
      this._deleteUnitSupportingData(unitModel, disputeClaim)
    ]);
  },

  _deleteUnitSupportingData(unitModel, disputeClaim) {
    return Promise.all([
      ...(_.map(unitModel.getParticipantIds(), participantId => {
        const participantModel = participantsChannel.request('get:participant', participantId);
        return participantsChannel.request('delete:participant', participantModel);
      })),
      ...(disputeClaim ? [claimsChannel.request('delete:full', disputeClaim)] : [])
    ]);
  },


  _deleteParticipants(unitModel, matchingUnitUpdateFn=null, participantsToDelete=null) {
    participantsToDelete = participantsToDelete && participantsToDelete.length ? participantsToDelete : unitModel.getParticipantIds();
    matchingUnitUpdateFn = _.isFunction(matchingUnitUpdateFn) ? matchingUnitUpdateFn : () => {};
    loaderChannel.trigger('page:load');
    
    // Save current page changes
    IntakeAriDataParser.setUnitCollection(this.units);
    
    this.updateLocalClaimDescriptions();

    const matchingUnit = unitModel.get('unit_id') && this.units.findWhere({ unit_id: unitModel.get('unit_id')});
    if (matchingUnit) {
      // Delete participant IDs we have passed in, or all participant IDs if none passed
      matchingUnitUpdateFn(matchingUnit);
      IntakeAriDataParser.setUnitCollection(this.units);
    }

    const jsonDataObj = new CustomDataObjModel({
      custom_data_object_id: IntakeAriDataParser.getLoadedId(),
      object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'),
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
      this.setupFlows();
      this.render();
    }, err => {
      loaderChannel.trigger('page:load:complete');
    });
  },

  setupListenersBetweenItems() {
    this.stopListening(this.units, 'delete:full');
    this.listenTo(this.units, 'delete:full', (unitModel, disputeClaim) => {
      this.showConfirmDelete(unitModel, () => {
        loaderChannel.trigger('page:load');
        this._deleteUnit(unitModel, disputeClaim)
          .then(() => {
            this.createPageItems();
            this.setupListenersBetweenItems();
            this.setupFlows();
            this.render();
          }, err => {
            loaderChannel.trigger('page:load:complete');
          });
        });
    });

    this.stopListening(this.units, 'delete:participants');
    this.listenTo(this.units, 'delete:participants', (unitModel, participantsToDelete) => {
      this._deleteParticipants(unitModel, (matchingUnit) => {
        // Update the tenant count to reflect what was chosen to make this selection
        matchingUnit.set('selected_tenants', unitModel.get('selected_tenants'));
        matchingUnit.removeParticipantIds(participantsToDelete);
      }, participantsToDelete);
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

    const onUnitCountIncrease = (newCount) => {
      this.unitCountModel.set('_previousValue', newCount, { silent: true });
      this.units.setTo(newCount, { city: disputeCity }, { silent: true });

      this.createIssuesForUnitsPromise().then(
        () => {
          const view = this.getChildView('units');
          if (view && view.isRendered()) {
            view.render();
          }
          setTimeout(() => {
            this.showPageItem('units');
            loaderChannel.trigger('page:load:complete');
          }, 200);
          this.showNextButton(_.extend({}, {no_animate: true}));
        },
        this.createPageApiErrorHandler(this)
      );
    };

    this.listenTo(unitCount, 'itemComplete', () => {
      if (!this.unitCountModel.isValid()) {
        return;
      }

      const numUnitsSelected = Number(this.unitCountModel.getData({ parse: true }));
      if (numUnitsSelected < this.units.length) {
        this.showMultiUnitDeleteModal(numUnitsSelected);
      } else {
        onUnitCountIncrease(numUnitsSelected);
        this.unitCountModel.set('_previousValue', numUnitsSelected, { silent: true });
      }
    });
  },

  createIssuesForUnitsPromise() {
    const allXhr = [];
    const disputeClaimCollection = claimsChannel.request('get');
    this.units.forEach(unitModel => {
      const issueId = unitModel.get('issue_id');
      if (!issueId) {
        const disputeClaim = disputeClaimCollection.createClaimWithRemedy({
          claim_title: '',
          claim_code: (this.pfrClaimConfig || {}).id,
        });
        allXhr.push(new Promise((res, rej) => {
          disputeClaim.save().done(() => {
            claimsChannel.request('add:claim', disputeClaim);
            unitModel.set('issue_id', disputeClaim.claim.get('claim_id'));
            res();
          }).fail(rej)
        }));
      }
    });

    if (allXhr.length) {
      loaderChannel.trigger('page:load');
    }

    this.updateLocalClaimDescriptions();

    return Promise.all(allXhr)
      .then(allXhr.length ? () => {
        const unitsView = (this.getPageItem('units') || {}).subView;
        if (unitsView && unitsView.disputeClaimCollection) {
          unitsView.disputeClaimCollection = this.updateClaimsFromSavedClaimDescriptions(claimsChannel.request('get:full'));
        }
        this.units.saveInternalDataToModel();
        IntakeAriDataParser.setUnitCollection(this.units);

        const jsonDataObj = new CustomDataObjModel({
          custom_data_object_id: IntakeAriDataParser.getLoadedId(),
          object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'),
          jsonData: IntakeAriDataParser.toJSON()
        });
        return jsonDataObj.save();
      } : null);
  },

  decrementUnitCount() {
    const unitCount = this.getPageItem('unitCount');
    const unitCountModel = unitCount.getModel();
    unitCountModel.trigger('update:input', unitCountModel.get('value') - 1, { update_saved_value: true });
  },


  onRender() {
    if (this.isLoading) {
      return;
    }

    _.each(this.page_items, function(itemView, regionName) {
      this.showChildView(regionName, itemView);
    }, this);

    // Unhide first page item in order to start user flow
    this.showPageItem(this.first_view_id, {no_animate: true});

    if (!this.units.length) {
      loaderChannel.trigger('page:load:complete');
    }

    ViewMixin.prototype.initializeHelp.call(this, this, (this.pfrClaimConfig || {}).issueHelp, ['#pfr-iu-units']);
  },

  saveInProgressPageDataToUnits() {
    this.units.saveInternalDataToModel();
    
    // Manually set permits here
    const renovationUnitsView = this.getChildView('units');
    if (renovationUnitsView && renovationUnitsView.isRendered()) {
      (renovationUnitsView.callMethodOnSubView('getChildren') || []).forEach(childView => {
        childView.unitModel.set('permits', childView.getUiPermits());
      });
    }
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
    this.saveInProgressPageDataToUnits();

    const isValid = this.validatePage();
    if (!isValid) {
      console.log(`[Info] Page did not pass validation checks`);
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true, scrollOffset: 50});
      }
    }
    return isValid;
  },

  nextPage() {
    if (!this.prepPageValidatePageAndScrollToFirstError()) {
      return;
    }

    IntakeAriDataParser.setUnitCollection(this.units);

    const jsonDataObj = new CustomDataObjModel({
      custom_data_object_id: IntakeAriDataParser.getLoadedId(),
      object_type: configChannel.request('get', 'CUSTOM_DATA_OBJ_TYPE_PFR'),
      jsonData: IntakeAriDataParser.toJSON()
    });



    // Apply changes from page UI and save unit information into claim title:
    const unitClaims = this.units.map(unitModel => {
      const disputeClaim = claimsChannel.request('get:claim', unitModel.get('issue_id'));
      if (disputeClaim) {
        const claimTitle = `${unitModel.getStreetDisplayWithDescriptor()}: ${disputeClaim.claimConfig.issueTitle}`;
        disputeClaim.set('claim_title', claimTitle);
        disputeClaim.claim.set('claim_title', claimTitle);
        if (unitModel.get('_claimDescription')) {
          disputeClaim.updateApplicantClaimDetail({ description: unitModel.get('_claimDescription') });
        }
      }
      return disputeClaim;
    }).filter(claim => claim);
    
    console.log(unitClaims);
    const unitClaimSaveXhr = unitClaims.map(claim => claim.save.bind(claim));
    
    console.log(jsonDataObj);

    loaderChannel.trigger('page:load');
    Promise.all([jsonDataObj.save.bind(jsonDataObj)(), ...unitClaimSaveXhr.map(xhr => xhr()) ])
      .then(() => {
        applicationChannel.trigger('progress:step:complete', 4);
        Backbone.history.navigate('page/5', { trigger: true});
      }, this.createPageApiErrorHandler(this));
  },

  templateContext() {
    const unitCount = this.getPageItem('unitCount');
    return {
      hasUnitsSelected: unitCount && unitCount.isRendered() && unitCount.getModel().getData({ parse: true }) > 0,
      claimTitleToUse: (this.pfrClaimConfig || {}).selectionTitle,
      claimHelpHtml: (this.pfrClaimConfig || {}).issueHelp,
    };
  }
});
