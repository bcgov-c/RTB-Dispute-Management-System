import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import CheckboxModel from '../../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../../core/components/checkbox/Checkbox';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import EditableComponentView from '../../../../core/components/editable-component/EditableComponent';
import DisputeOutcomeDocFilesView from '../outcome-doc-file/DisputeOutcomeDocFiles';
import ParticipantOutcomeDeliveriesView from '../outcome-doc-delivery/ParticipantOutcomeDeliveries';
import ParticipantOutcomeDeliveryCollection from '../outcome-doc-delivery/ParticipantOutcomeDelivery_collection';
import DisputeOutcomeExternalFilesView from '../outcome-doc-file/DisputeOutcomeExternalFiles';
import FileCollection from '../../../../core/components/files/File_collection';
import ModalAddOutcomeFile from '../outcome-doc-file/modals/ModalAddOutcomeFile';
import ModalAddPublicDoc from '../outcome-doc-file/ModalAddPublicDoc';
import ModalAddOutcomeDelivery from '../outcome-doc-delivery/modals/ModalAddOutcomeDelivery';
import ModalAddFiles from '../../../../core/components/modals/modal-add-files/ModalAddFiles';
import ModalBulkUploadDocument from '../outcome-doc-file/modals/modal-bulk-upload-documents/ModalBulkUploadDocuments';
import RadioIconView from '../../../../core/components/radio/RadioIcon';
import RadioModel from '../../../../core/components/radio/Radio_model';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';
import template from './DisputeOutcomeDocGroup_template.tpl';

let UAT_TOGGLING = {};

const EXTRA_API_ERROR_MSG = `Some of your changes may not have been saved.  Please validate the Outcome Document Group after the page refreshes.  Close this window or press "Continue" to refresh the page.`;

const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'review-information-body outcome-doc-group',

  regions: {
    finalDocFilesRegion: '.dispute-outcome-doc-files-final',
    publicDocFilesRegion: '.dispute-outcome-doc-files-public',
    serviceDateRegion: '.dispute-outcome-doc-group-delivery-date',
    materiallyDifferentRegion: '.dispute-outcome-doc-group-different',
    noteworthyRegion: '.dispute-outcome-doc-group-noteworthy',
    deliveriesRegion: '.dispute-outcome-doc-files-delivery',
    externalFilesRegion: '.dispute-outcome-doc-files-external',
    readyForDeliveryCheckboxRegion: '.dispute-outcome-doc-section-checkbox',
    deliveryPriorityRegion: '.dispute-outcome-doc-section-priority',
    writingTimeRegion: '.dispute-outcome-writing-time',
    decisionComplexityRegion: '.decision-complexity',
    deliveryBulkSelectRegion: '.outcome-doc-delivery-bulk-select'
  },

  ui: {
    addOtherDelivery: '.dispute-outcome-doc-group-add-other-delivery',
    addExternalFile: '.dispute-outcome-doc-section-external .dispute-outcome-doc-section-btn'
  },

  events: {
    'click @ui.addExternalFile': 'clickAddExternalFile',
    'click @ui.addOtherDelivery': 'clickAddOtherDelivery'
  },

  clickAddExternalFile() {
    const files = new FileCollection();
    const modalAddExternal = new ModalAddFiles({
      title: 'Add External Working Document',
      fileType: configChannel.request('get', 'FILE_TYPE_INTERNAL'),
      isOnlyFiles: true,
      isCustom: false,
      autofillRename: true,
      files,
      showDelete: false,
      processing_options: {
        errorModalTitle: 'Adding Working Document',
        checkForDisputeDuplicates: false, 
      }
    });
    
    this.stopListening(modalAddExternal);
    this.listenTo(modalAddExternal, 'save:complete', () => {
      const uploadedFiles = files.getUploaded() || [];
      const allXhr = uploadedFiles.map(uploadedFile => {
        const outcome_doc_file_model = this.model.createOutcomeFile({
          file_id: uploadedFile.id,
          file_type: configChannel.request('get', 'OUTCOME_DOC_FILE_TYPE_EXTERNAL')  
        }, { add: true });
        return _.bind(outcome_doc_file_model.save, outcome_doc_file_model);
      });

      $.whenAll(allXhr.map(xhr => xhr() ))
        .done(() => {
          this._renderExternalFiles();
          loaderChannel.trigger('page:load:complete');
        })
        .fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCFILE.CREATE', () => {
            this._renderExternalFiles();
            loaderChannel.trigger('page:load:complete');
          });
          handler(err);
        });
    });
    modalChannel.request('add', modalAddExternal);
  },

  clickAddOtherDelivery() {
    const modalAddOutcomeDelivery = new ModalAddOutcomeDelivery({ model: this.model });
    this.stopListening(modalAddOutcomeDelivery);
    this.listenTo(modalAddOutcomeDelivery, 'save:complete', function(outcome_doc_file_model, outcome_doc_delivery_model, ) {
      this.participantOutcomeDeliveryCollection.add({
        outcome_doc_file_model,
        outcome_doc_delivery_model,
        outcome_doc_group_model: this.model,
        _isEditMode: true,
      });
      if (outcome_doc_file_model) outcome_doc_file_model.getDeliveries().add(outcome_doc_delivery_model);

      modalChannel.request('remove', modalAddOutcomeDelivery);
      loaderChannel.trigger('page:load:complete');
    }, this);
    modalChannel.request('add', modalAddOutcomeDelivery);
  },

  
  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    this.SHOW_OUTCOME_PUBLIC_DOCS = UAT_TOGGLING.SHOW_OUTCOME_PUBLIC_DOCS;
    this.DELIVERY_PRIORITY_NOT_SET = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_NOT_SET');
    this.DELIVERY_PRIORITY_LOW = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_LOW');
    this.DELIVERY_PRIORITY_NORMAL = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_NORMAL');
    this.DELIVERY_PRIORITY_HIGH = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_HIGH');
    this.OUTCOME_DOC_DELIVERY_PRIORITY_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_DELIVERY_PRIORITY_DISPLAY');
    this.dispute = disputeChannel.request('get');

    this.createSubModels();
    this.setupListeners();

    this.setEditGroup();

    this.getDocumentsWithoutDelivery();
  },

  reinitialize() {
    this.dispute = disputeChannel.request('get');
    if (this.dispute && this.dispute.checkEditInProgressModel(this.model)) {
      this.dispute.stopEditInProgress();
    }
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    const outcomeDocFileDCN = this.model.getOutcomeFileDCN();
    const earliestSendDate = this.model.getEarliestDeliverySendDate();
    
    this.deliveryDateModel = new InputModel({
      labelText: 'Documents Date',
      inputType: 'date',
      required: false,
      customLink: earliestSendDate && Moment(earliestSendDate).isBefore(Moment(), 'day') ? null : 'Today',
      customLinkFn: this._setDateToToday,
      maxDate: earliestSendDate ? Moment(earliestSendDate).format(InputModel.getDateFormat()) : null,
      value: this.model.get('doc_completed_date') ? this.model.get('doc_completed_date') : (
        earliestSendDate && Moment().isAfter(Moment(earliestSendDate), 'day') ? null : Moment()),
      apiMapping: 'doc_completed_date'
    });

    this.materiallyDifferentModel = new CheckboxModel({
      html: 'Materially different',
      checked: outcomeDocFileDCN ? outcomeDocFileDCN.get('materially_different') : false,
      apiMapping: 'materially_different'
    });

    this.noteworthyModel = new CheckboxModel({
      html: 'Noteworthy',
      checked: outcomeDocFileDCN ? outcomeDocFileDCN.get('note_worthy') : false,
      apiMapping: 'note_worthy'
    });

    this.initializeDeliveryCollection();

    const validParticipantDeliveries = this.participantOutcomeDeliveryCollection.map(model => model.getIncludedDeliveries())
        .filter(deliveries => !_.isEmpty(deliveries));
    const allIncludedCheckboxesDelivered = validParticipantDeliveries.length && _.all(validParticipantDeliveries, deliveries => _.all(deliveries, delivery => delivery.get('ready_for_delivery')))

    this.readyForDeliveryModel = new CheckboxModel({
      html: `Documents completed and ready to deliver`,
      disabled: !validParticipantDeliveries.length,
      checked: allIncludedCheckboxesDelivered
    });
    this.model.set('_isReadyForDeliveryChecked', allIncludedCheckboxesDelivered);

    const deliveryPriority = this.model.getHighestDeliveryPriority();
    this.deliveryPriorityModel = new RadioModel({
      optionData: this._getPriorityIcons(),
      disabled: !validParticipantDeliveries.length,
      value: deliveryPriority ? deliveryPriority : this.getDefaultDeliveryPriority()
    });

    const writingTimeRequired = this.model.getOutcomeFiles().find(outcomeFile => outcomeFile.hasUploadedFile() && !outcomeFile.isExternal() && !outcomeFile.isPublic());
    this.writingTimeModel = new InputModel({
      labelText: 'Writing Time (min)',
      errorMessage: 'Please enter a number greater than 0',
      inputType: 'positive_integer',
      required: writingTimeRequired ? true : false,
      maxLength: 4,
      value: this.model.get('doc_writing_time'),
      apiMapping:'doc_writing_time'
    });

    this.decisionComplexityModel = new DropdownModel({
      labelText: 'Decision Complexity',
      optionData: this._getComplexityOptionsData(),
      defaultBlank: true,
      required: true,
      value: this.model.get('doc_complexity') ? String(this.model.get('doc_complexity')) : null,
      apiMapping: 'doc_complexity'
    });

    this.bulkSelectModel = new CheckboxModel({
      html: 'Bulk Select',
      checked: false
    });
  },

  getDefaultDeliveryPriority() {
    return this.model.getOutcomeFiles().filter(doc => doc.isOrderOfPossession()).length ?
      this.DELIVERY_PRIORITY_HIGH : this.DELIVERY_PRIORITY_NOT_SET;
  },

  _getComplexityOptionsData() {
    const OUTCOME_DOC_GROUP_COMPLEXITY_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_GROUP_COMPLEXITY_DISPLAY');
    return ['COMPLEXITY_SIMPLE', 'COMPLEXITY_STANDARD', 'COMPLEXITY_COMPLEX'].map( (configCode) => {
      const configValue = configChannel.request('get', configCode);
      return { value: String(configValue), text: OUTCOME_DOC_GROUP_COMPLEXITY_DISPLAY[configValue] };
    });
  },

  _getPriorityIcons() {
    return [
      { iconClass: 'task-priority-none', value: this.DELIVERY_PRIORITY_NOT_SET },
      { iconClass: 'task-priority-low', value: this.DELIVERY_PRIORITY_LOW },
      { iconClass: 'task-priority-medium', value: this.DELIVERY_PRIORITY_NORMAL },
      { iconClass: 'task-priority-high', value: this.DELIVERY_PRIORITY_HIGH }];
  },

  initializeDeliveryCollection() {
    const all_participants = _.union(
      participantsChannel.request('get:applicants').models,
      participantsChannel.request('get:respondents').models
    );

    
    this.participantOutcomeDeliveryCollection = new ParticipantOutcomeDeliveryCollection(
      all_participants.map(participant_model => {
        return {
          participant_model,
          outcome_doc_group_model: this.model,
        };
      }));
    
    // Now add all "other" deliveries
    _.each(this.model.getDeliverableOutcomeFiles(), function(outcome_doc_file_model) {
      _.each(outcome_doc_file_model.getNonParticipantDeliveries(), function(outcome_doc_delivery_model) {
        this.participantOutcomeDeliveryCollection.add({
          outcome_doc_file_model,
          outcome_doc_delivery_model,
          outcome_doc_group_model: this.model
        }, { silent: true });
      }, this);
    }, this);
  },

  _setDateToToday() {
    this.trigger('update:input', Moment().format(InputModel.getDateFormat()));
  },

  setEditGroup() {
    this.documentsEditGroup = ['finalDocFilesRegion', 'serviceDateRegion', 'materiallyDifferentRegion', 'noteworthyRegion', 'writingTimeRegion', 'decisionComplexityRegion'];
    this.documentsEditModels = [
      this.deliveryDateModel,
      this.materiallyDifferentModel,
      this.noteworthyModel,
      this.writingTimeModel,
      this.decisionComplexityModel
    ];
    
    if (UAT_TOGGLING.SHOW_OUTCOME_PUBLIC_DOCS) this.documentsEditGroup.push('publicDocFilesRegion');
    
    this.deliveriesEditGroup = ['deliveriesRegion'];
  },

  setWritingTime() {
    const writingTimeRequired = this.model.getOutcomeFiles().find(outcomeFile => outcomeFile.hasUploadedFile() && !outcomeFile.isExternal() && !outcomeFile.isPublic());
    this.writingTimeModel.set({ required: writingTimeRequired ? true : false });
    this.writingTimeModel.trigger('render');
  },

  setupListeners() {
    this.listenTo(this.model.getOutcomeFiles(), 'destroy', () => this.trigger('contextRender', {deliveryEdit: true}), this);
    this.listenTo(this.model.getOutcomeFiles(), 'change', this.setWritingTime)

    this.listenTo(this.participantOutcomeDeliveryCollection, 'deliveries:changed', () => {
      const validParticipantDeliveries = this.participantOutcomeDeliveryCollection.map(model => model.getIncludedDeliveries())
        .filter(deliveries => !_.isEmpty(deliveries));
      const noValidDeliveries = !validParticipantDeliveries.length;

      this.readyForDeliveryModel.set(
        Object.assign({
          disabled: noValidDeliveries
        }, noValidDeliveries ? { checked: null } : {})
      );
      this.deliveryPriorityModel.set(
        Object.assign({
          disabled: noValidDeliveries
        }, noValidDeliveries ? { value: this.getDefaultDeliveryPriority() } : {})
      );

      this.readyForDeliveryModel.trigger('render');
      this.deliveryPriorityModel.trigger('render');
    });

    this.listenTo(this.readyForDeliveryModel, 'change:checked',  function(model, value) {
      if (value && this.shouldReadyForDeliveryCheckboxBeDisabled()) {
        this.showModalReadyToDeliverError();
        model.set('checked', false, { silent: true });
        model.trigger('render');
      } else if (!value && !this.canReadyForDeliveryCheckboxBeUnchecked()) {
        this.showModalReadyForDeliveryUncheck();
        model.set('checked', true, { silent: true });
        model.trigger('render');
      } else {
        this.model.set('_isReadyForDeliveryChecked', value);
      }
    }, this);

    this.listenTo(this.bulkSelectModel, 'change:checked', (model, value) => {
      this.participantOutcomeDeliveryCollection.trigger('bulk:select:clicked', value);
    })

    this.listenTo(this.model, 'render:deliveryEdit', (documentData={}) => {
      this.trigger('menu:click', 'edit:documents', {open: true});
      if (documentData && !_.isEmpty(documentData)) this.applyDocumentEditData(documentData);
      this._switchGroupToEditState(this.documentsEditGroup);
    });
  },

  applyDocumentEditData(documentData={}) {
    Object.keys(documentData).forEach(apiMapping => {
      const matchingModel = this.documentsEditModels.find(m => m.get('apiMapping') === apiMapping);
      const value = documentData[apiMapping];
      if (matchingModel) {
        matchingModel.set({
          checked: value,
          value,
        });
      }
    });
  },

  getSelectedDocumentEditData() {
    const returnData = {};
    this.documentsEditModels.forEach(m => { returnData[m.get('apiMapping')] = m.get('value') || m.get('checked') });
    return returnData;
  },

  shouldReadyForDeliveryCheckboxBeDisabled() {
    const undeliveredDocs = this.getUndeliveredDocuments();
    const documentsWithoutDelivery = this.getDocumentsWithoutDelivery();
    return undeliveredDocs.length || documentsWithoutDelivery.length;
  },

  canReadyForDeliveryCheckboxBeUnchecked() {
    // Ready for delivery can be unchecked if no "Sent" checkbox is selected in the UI
    const validParticipantDeliveries = this.participantOutcomeDeliveryCollection.filter(m => m.get('_isSentChecked'))
    return !validParticipantDeliveries.length;
  },

  showModalReadyForDeliveryUncheck() {
    modalChannel.request('show:standard', {
      title: 'Documents Already Sent/Delivered',
      bodyHtml: `<p>You cannot set documents as NOT ready to deliver where there are any document that are already marked as sent (one or more documents has already been delivered).</p>`,
      hideCancelButton: true,
      primaryButtonText: 'Close',
      onContinueFn: (_modalView) => _modalView.close()
    });
  },

  // Check state of outcome group based on the current save options
  getUndeliveredDocuments() {
    return this.model.getOutcomeFiles().filter(doc => !doc.isExternal() && !doc.isPublic() && !doc.hasUploadedFile());
  },

  getDocumentsWithoutDelivery() {
    const validParticipantDeliveries = this.participantOutcomeDeliveryCollection.map(model => model.getIncludedDeliveries())
        .filter(deliveries => !_.isEmpty(deliveries));

    const docsWithoutDelivery = this.model.getOutcomeFiles().filter(doc => !doc.isExternal() && !doc.isPublic() && (
      // Find docs that are not associated to any delivery
      !_.find(validParticipantDeliveries, deliveries => _.find(deliveries, delivery => delivery.get('outcome_doc_file_id') === doc.id))
    ));
    return docsWithoutDelivery;
  },

  _saveDocStatus(doc_status) {
    loaderChannel.trigger('page:load');
    this.model.set({ doc_status });
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        this.trigger('contextRender');
        loaderChannel.trigger('page:load:complete');
      })
      .fail(err => {
        const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUP.SAVE', () => {
          this.trigger('contextRender');
          loaderChannel.trigger('page:load:complete');
        });
        handler(err);
      });
  },

  onMenuSetActive() {
    const deliveriesToUpdate = {};
    this.participantOutcomeDeliveryCollection.each(model => {
      const outcomeDocGroupModel = model.get('outcome_doc_group_model');
      if (outcomeDocGroupModel) {
        outcomeDocGroupModel.trigger('update:ready_for_delivery', false);

        outcomeDocGroupModel.getOutcomeFiles().each(outcomeFile => {
          outcomeFile.getDeliveries().each(delivery => {
            if (!delivery.isNew()) deliveriesToUpdate[delivery.id] = delivery;
          });
        });
      }
    });

    const hasSentDeliveries = Object.values(deliveriesToUpdate).filter(d => d.get('is_delivered')).length;
    const saveDeliveriesAsNotReady = () => {
      loaderChannel.trigger('page:load');
      Promise.all(Object.values(deliveriesToUpdate).map(delivery => delivery.save(delivery.getApiChangesOnly())))
        .then(() => this._saveDocStatus(configChannel.request('get', 'OUTCOME_DOC_GROUP_STATUS_ACTIVE')),
          err => {
            loaderChannel.trigger('page:load:complete');
            generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCDELIVERY.SAVE')(err);
          }
        );
    };

    if (hasSentDeliveries) {
      modalChannel.request('show:standard', {
        title: 'Re-Open Not Available',
        bodyHtml: `<p>You cannot re-open a document set that has any sent items (documents that are already delivered). If you have more documents to be sent you will have to create a new Outcome Document Set.</p>`,
        hideContinueButton: true,
        cancelButtonText: 'Close'
      });
    } else {
      modalChannel.request('show:standard', {
        title: 'Confirm Re-Open of Document Set',
        bodyHtml: `<p>If a document set is marked as "Ready to deliver", even if it does not have any delivered documents right now, may be in the process of being delivered. In order to avoid documents being sent at the same time that you are modifying the document set, this document set will be immediately set as not not ready to deliver.</p>
        <p><b>Important:</b> After you have made your changes make sure to mark this as ready to deliver again.</p>`,
        primaryButtonText: 'Continue and Re-Open',
        cancelButtonText: 'Cancel',
        onContinueFn(modalView) {
          saveDeliveriesAsNotReady();
          modalView.close();
        },
      })
    }
  },

  onMenuDelete() {
    this.dispute.checkEditInProgressPromise().then(
      () => {
        modalChannel.request('show:standard', {
          title: `Delete Outcome Document Group?`,
          bodyHtml: `<p>Are you sure you want to delete this outcome document group?`,
          primaryButtonText: 'Delete',
          onContinueFn: (modalView) => {
            modalView.close();
            loaderChannel.trigger('page:load')
            this.model.destroy()
              .fail(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUP.REMOVE.FULL'))
              .always(() => loaderChannel.trigger('page:load:complete'))
          }
        });
      },
      () => this.dispute.showEditInProgressModalPromise()
    );
  },

  _switchGroupToEditState(editGroup) {
    _.each(editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        if (component.switchToEditState) {
          component.switchToEditState();
        } else if (component.toEditable) {
          component.toEditable();
        }
      }
    }, this);
  },

  onMenuEditDocuments() {
    this._switchGroupToEditState(this.documentsEditGroup);
  },

  onMenuEditDelivery() {
    this.participantOutcomeDeliveryCollection.each(model => {
      model.set('_isEditMode', true).trigger('render');
    });
  },

  onMenuEditSent() {
    this.participantOutcomeDeliveryCollection.each(model => {
      model.set({
        _isEditMode: true,
        _isEditSentMode: true
      }).trigger('render');
    });
  },

  onMenuAddDocFile() {
    const modalAddOutcomeFile = new ModalAddOutcomeFile({ model: this.model });
    this.stopListening(modalAddOutcomeFile);
    this.listenTo(modalAddOutcomeFile, 'save:complete', function() {
      modalChannel.request('remove', modalAddOutcomeFile);
      this.trigger('contextRender', {deliveryEdit: true});
    }, this);
    modalChannel.request('add', modalAddOutcomeFile);
  },

  onMenuBulkUploadDocuments() {
    const modalBulkUploadDocuments = new ModalBulkUploadDocument({ outcomeFiles: this.model.getOutcomeFiles(), model: this.model });
    modalChannel.request('add', modalBulkUploadDocuments);

    this.listenTo(modalBulkUploadDocuments, 'save:complete', () => {
      this.trigger('contextRender', {deliveryEdit: true});
    });
  },

  onMenuAddPublicDoc() {
    const modalAddPublicDocView = new ModalAddPublicDoc({ model: this.model });
    this.stopListening(modalAddPublicDocView);
    this.listenTo(modalAddPublicDocView, 'save:complete', function() {
      modalChannel.request('remove', modalAddPublicDocView);
      this.trigger('contextRender', {deliveryEdit: true});
    }, this);
    modalChannel.request('add', modalAddPublicDocView);
  },  

  validateAndShowErrors(editGroup) {
    let is_valid = true;
    _.each(editGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component) {
        is_valid = is_valid & component.validateAndShowErrors();
      }
    }, this);
    return is_valid;
  },

  saveInternalDataToModel() {
    const modelDataToSet = [
      this.deliveryDateModel,
      this.writingTimeModel,
      this.decisionComplexityModel,
    ].map(m => m.getPageApiDataAttrs());
    modelDataToSet.forEach(data => this.model.set(data));

    const outcomeDocFileDCN = this.model.getOutcomeFileDCN();
    if (outcomeDocFileDCN) {
      outcomeDocFileDCN.set(Object.assign({}, this.materiallyDifferentModel.getPageApiDataAttrs(), this.noteworthyModel.getPageApiDataAttrs()));
    }

    _.each(this.documentsEditGroup, function(component_name) {
      const component = this.getChildView(component_name);
      if (component && component.saveInternalDataToModel) {
        component.saveInternalDataToModel();
      }
    }, this);
  },

  _deleteDeliveryModels() {
    // Get un-checked delivery
    const deliveries_to_delete = [],
      deliveries_to_delete_lookup = {};
    this.participantOutcomeDeliveryCollection.each(function(participantDeliveryModel) {
      if (participantDeliveryModel.isOther()) {
        return;
      } else {
        _.each(participantDeliveryModel.get('inclusionCheckboxCollection').filter(function(m) {
            return !m.getData(); }), function(checkboxModel) {
          const delivery_model = checkboxModel.get('_associated_delivery_model');
          deliveries_to_delete_lookup[delivery_model.id] = delivery_model;
          deliveries_to_delete.push(delivery_model);
        });
      }
    });

    this.model.getOutcomeFiles().each(function(outcome_doc_file_model) {
      if (!outcome_doc_file_model.isActive()) {
        outcome_doc_file_model.getDeliveries().each(function(delivery_model) {
          const delivery_model_id = delivery_model.id;
          if (!_.has(deliveries_to_delete_lookup, delivery_model_id)) {
            deliveries_to_delete_lookup[delivery_model_id] = delivery_model;
            deliveries_to_delete.push(delivery_model);
          }
        });
      }
    });

    const deleteAndUnlinkDelivery = (delivery) => {
      if (delivery.collection) {
        delivery.collection.remove(delivery);
      }
      return delivery.destroy();
    };

    const dfd = $.Deferred();
    Promise.all(_.map(deliveries_to_delete, deleteAndUnlinkDelivery))
      .then(dfd.resolve, err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCDELIVERY.REMOVE', () => {
          dfd.reject(err);
        });
        handler(err);
      });
    return dfd.promise();
  },

  onMenuSaveDocuments() {
    if (!this.validateAndShowErrors(this.documentsEditGroup)) return;

    const refreshPageFn = () => {
      if (this.dispute) this.dispute.stopEditInProgress();
      Backbone.history.loadUrl(Backbone.history.fragment);
    };
    const saveDocumentsFn = (() => {
      loaderChannel.trigger('page:load');
      this.saveInternalDataToModel();

      this._deleteDeliveryModels()
        .done(() => {
          this.model.saveAll()
            .done(() => {
              this.reinitialize();
              this.render();
              loaderChannel.trigger('page:load:complete');
            })
            .fail(err => {
              loaderChannel.trigger('page:load:complete');
              const handler = generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUP.SAVE.ALL', () => refreshPageFn(), EXTRA_API_ERROR_MSG);
              handler(err);
            });
        }).fail(() => {
          // Api error display is handled in _deleteDeliveryModels()
          refreshPageFn();
        });
    }).bind(this);

    this.checkAndShowWarningItems().then(saveDocumentsFn).finally(()=>{});
  },

  onMenuSaveDelivery() {
    if (!this.validateAndShowErrors(this.deliveriesEditGroup)) return;

    const isReadyForDelivery = !!this.readyForDeliveryModel.get('checked');
    const deliveryPriority = this.deliveryPriorityModel.getData({ parse: true });
    const saveDeliveriesFn = () => new Promise((res, rej) => {
      loaderChannel.trigger('page:load');
      _.each(this.deliveriesEditGroup, function(component) {
        const view = this.getChildView(component);
        if (view) view.saveInternalDataToModel();
      }, this);

      // Set all active deliveries to true/false based on checkbox selection
      this.participantOutcomeDeliveryCollection.each(model => {
        const outcomeDocGroupModel = model.get('outcome_doc_group_model');
        if (outcomeDocGroupModel) {
          outcomeDocGroupModel.trigger('update:ready_for_delivery', isReadyForDelivery);
          outcomeDocGroupModel.trigger('update:delivery_priority', deliveryPriority);
        }
      });

      this._deleteDeliveryModels().done(() => {
        // All un-delivered deliveries destroyed.  Move onto saving deliveries
        this.model.saveAll({ deliveries: true })
          .done(() => res())
          .fail(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUP.SAVE.ALL', () => rej(), EXTRA_API_ERROR_MSG))
      }).fail(() => {
        // Api error display is handled in _deleteDeliveryModels()
        rej();
      });
    });

    this.checkAndShowWarningItems()
      .then(saveDeliveriesFn)
      .then(() => isReadyForDelivery ?
        this.model.save({ doc_status: configChannel.request('get', 'OUTCOME_DOC_GROUP_STATUS_COMPLETED') }).fail(generalErrorFactory.createHandler('ADMIN.OUTCOMEDOCGROUP.SAVE'))
        : null
      )
      .then(() => this.updateParticipants())
      .then(()=> {
        this.trigger('contextRender');
        loaderChannel.trigger('page:load:complete');
      })
      .catch(() => {
        if (this.dispute) this.dispute.stopEditInProgress();
        Backbone.history.loadUrl(Backbone.history.fragment);
      });
  },

  updateParticipants() {
    return Promise.all(
      this.participantOutcomeDeliveryCollection
        .map(model => {
          const participantModel = model.get('participant_model');
          return participantModel ? new Promise((res, rej) => {
            participantModel.set(model.get('_participantSaveData'));
            participantModel.save(participantModel.getApiChangesOnly()).done(res).fail(rej);
          }) : null;
        })
    );
  },

  checkAndShowWarningItems() {
    return new Promise(resolve => {
      const markedReadyToDelivery = !!this.readyForDeliveryModel.get('checked');
      const undeliveredDocs = this.getUndeliveredDocuments();
      const documentsWithoutDelivery = this.getDocumentsWithoutDelivery();
      const documentDateProvided = !!$.trim(this.deliveryDateModel.getData({ iso: true }));

      const topText = `This outcome document set contains incomplete items that must be completed before the documents will be ready to be delivered.`;
      const bottomText = `You should correct all of these items if you want the final documents to be delivered.`;
      if (undeliveredDocs.length || documentsWithoutDelivery.length || !markedReadyToDelivery || !documentDateProvided) {
        this.listenTo(this._showModalWarning(topText, bottomText), 'removed:modal', resolve);
      } else {
        resolve();
      }
    });
  },

  showModalReadyToDeliverError() {
    const topText = `You cannot set these documents as ready to deliver until the following steps are completed:`;
    const showReadyForDelivery = false;
    const showDocumentDateMissing = false;
    this._showModalWarning(topText, null, showReadyForDelivery, showDocumentDateMissing);
  },


  _showModalWarning(topText, bottomText, showReadyForDelivery=true, showDocumentDateMissing=true) {
    const markedReadyToDelivery = !!this.readyForDeliveryModel.get('checked');
    const undeliveredDocs = this.getUndeliveredDocuments();
    const documentsWithoutDelivery = this.getDocumentsWithoutDelivery();
    const documentDateProvided = !!$.trim(this.deliveryDateModel.getData({ iso: true }));

    const lineFormatter = (text, value) => {
      return `<li>${text}: ${value ? `<b>${value}</b>` : '-'}</li>`;
    };
    return modalChannel.request('show:standard', {
      title: 'Incomplete Items Warning',
      bodyHtml: `<p>${topText}</p>
      <p>
        <ul>
        ${showDocumentDateMissing && !documentDateProvided ? 
          `${lineFormatter('Documents date provided', `<span style="color:red">No</span>`)}`
          : ''
        }
        ${undeliveredDocs.length ? lineFormatter('Missing final document files (pdf)', undeliveredDocs.length) : ''}
        ${undeliveredDocs.length ? `<li style="margin-left:25px;">${undeliveredDocs.map(doc => doc.get('file_acronym')).join(', ')}</li>` : ''}
        ${documentsWithoutDelivery.length ? lineFormatter('Missing delivery instructions', documentsWithoutDelivery.length) : ''}
        ${documentsWithoutDelivery.length ? `<li style="margin-left:25px;">${documentsWithoutDelivery.map(doc => doc.get('file_acronym')).join(', ')}</li>` : ''}  
        ${showReadyForDelivery && !markedReadyToDelivery ?
          `${lineFormatter('Documents ready to deliver', `<span style="color:red">No</span>`)}`
          : ''
        }
        </ul>
      </p>
      ${bottomText ? `<p>${bottomText}</p>` : ''}
      `,
      modalCssClasses: 'modal-outcome-doc-warning',
      hideCancelButton: true,
      onContinueFn: ((_modalView) => {
        _modalView.close();
      }).bind(this)
    });
  },


  resetModelValues() {
    this.model.resetModel();

    _.each(_.union(this.documentsEditGroup, this.deliveriesEditGroup), function(component_name) {
      const component = this.getChildView(component_name);
      if (component && component.resetModelValues) {
        component.resetModelValues();
      } else if (component.resetValue) {
        component.resetValue();
      }
    }, this);
  },

  onBeforeRender() {
    this.model.trigger('contextRender:menu');
  },

  onRender() {
    const outcomeFiles = this.model.getOutcomeFiles();
    this.showChildView('finalDocFilesRegion', new DisputeOutcomeDocFilesView({
      collection: outcomeFiles,
      // Only show non-public views
      filter(model) { return !model.isExternal() && !model.isPublic(); }
    }));

    if (UAT_TOGGLING.SHOW_OUTCOME_PUBLIC_DOCS) {
      this.showChildView('publicDocFilesRegion', new DisputeOutcomeDocFilesView({
        collection: outcomeFiles,
        emptyMessage: 'No public final documents added',
        // Only show public views
        filter(model) { return model.isPublic(); }
      }));
    }

    this.showChildView('serviceDateRegion', new EditableComponentView({
      label: 'Document Date',
      view_value: this.model.get('doc_completed_date') ? `<b>${Formatter.toDateDisplay(this.model.get('doc_completed_date'))}</b>` : '-',
      subView: new InputView({ model: this.deliveryDateModel })
    }));

    this.showChildView('materiallyDifferentRegion', new EditableComponentView({
      label: '',
      view_value: null,
      subView: new CheckboxView({ model: this.materiallyDifferentModel })
    }));
      
    this.showChildView('noteworthyRegion', new EditableComponentView({
      label: '',
      view_value: null,
      subView: new CheckboxView({ model: this.noteworthyModel })
    }));

    this.showChildView('readyForDeliveryCheckboxRegion', new CheckboxView({ model: this.readyForDeliveryModel }));

    this.showChildView('deliveryPriorityRegion', new RadioIconView({ isSingleViewMode: true, model: this.deliveryPriorityModel }));

    this.showChildView('writingTimeRegion', new EditableComponentView({
      label: 'Writing Time',
      view_value: this.model.get('doc_writing_time') ? `${this.model.get('doc_writing_time')} Min` : '-',
      subView: new InputView({ model: this.writingTimeModel })
    }));

    this.showChildView('decisionComplexityRegion', new EditableComponentView({
      label: 'Decision Complexity',
      view_value: this.model.get('doc_complexity') ? this.decisionComplexityModel.getSelectedText() : '-',
      subView: new DropdownView({ model: this.decisionComplexityModel })
    }));

    this.showChildView('deliveryBulkSelectRegion', new CheckboxView({ model: this.bulkSelectModel }));

    this._renderDeliveries();
    this._renderExternalFiles();
  },

  _renderDeliveries() {
    this.showChildView('deliveriesRegion', new ParticipantOutcomeDeliveriesView({ collection: this.participantOutcomeDeliveryCollection }));
  },

  _renderExternalFiles() {
    this.showChildView('externalFilesRegion', new DisputeOutcomeExternalFilesView({ collection: this.model.getOutcomeFiles() }));
  },

  templateContext() {
    const outcomeFileDCN = this.model.getOutcomeFileDCN();
    const outcomeFiles = this.model.getOutcomeFiles();
    const validParticipantDeliveries = this.participantOutcomeDeliveryCollection.map(model => model.getIncludedDeliveries())
        .filter(deliveries => !_.isEmpty(deliveries));
    const allIncludedCheckboxesDelivered = validParticipantDeliveries.length && _.all(validParticipantDeliveries, deliveries => _.all(deliveries, delivery => delivery.get('ready_for_delivery')))
    const earliestReadyForDeliveryDate = this.model.getEarliestReadyForDeliveryDate();
    
    const highest_undelivered_priority = this.model.getHighestDeliveryPriority() || this.DELIVERY_PRIORITY_NOT_SET;
    const priorityIconClass = highest_undelivered_priority === this.DELIVERY_PRIORITY_HIGH ? 'task-priority-high-small' :
      highest_undelivered_priority === this.DELIVERY_PRIORITY_NORMAL ? 'task-priority-medium-small' :
      highest_undelivered_priority === this.DELIVERY_PRIORITY_LOW ? 'task-priority-low-small' :
      'task-priority-none-small';

    return {
      Formatter,     
      hideDeliveries: this.dispute && this.dispute.isMigrated(),
      hidePublicDocs: !UAT_TOGGLING.SHOW_OUTCOME_PUBLIC_DOCS,
      hasFinalDocs: outcomeFiles && outcomeFiles.any(model => !model.isExternal() && !model.isPublic()),
      hasPublicDocs: outcomeFiles && outcomeFiles.any(model => model.isPublic()),
      allIncludedCheckboxesDelivered,
      earliestReadyForDeliveryDate,
      showNoteworthyDisplay: !!outcomeFileDCN,
      materiallyDifferentDisplay: outcomeFileDCN && outcomeFileDCN.get('materially_different') ? 'Materially different decision' : '',
      noteworthyDisplay: outcomeFileDCN && outcomeFileDCN.get('note_worthy') ? 'Noteworthy decision' : '',
      priorityIconClass,
    };
  }
});
