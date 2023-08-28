import Radio from 'backbone.radio';
import Marionette from 'backbone.marionette';
import ReactDOM from 'react-dom';
import React from 'react';
import { ViewJSXMixin } from '../../../../core/utilities/JsxViewMixin';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import FileBlockDisplayView from '../../common-files/FileBlockDisplay';
import FileCollection from '../../../../core/components/files/File_collection';
import DisputeDocRequestItems from './DisputeDocRequestItems';
import InputView from '../../../../core/components/input/Input';
import InputModel from '../../../../core/components/input/Input_model';
import EditableComponentView from '../../../../core/components/editable-component/EditableComponent';
import DocRequestSelectView from '../../../../core/components/documents/doc-requests/DocRequestSelect';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const CLASS_WITHDRAWN = 'error-red';
const CLASS_COMPLETE = 'success-green';

const loaderChannel = Radio.channel('loader');
const configChannel = Radio.channel('config');
const participantsChannel = Radio.channel('participants');
const documentsChannel = Radio.channel('documents');
const animationChannel = Radio.channel('animations');
const filesChannel = Radio.channel('files');
const Formatter = Radio.channel('formatter').request('get');
const flagsChannel = Radio.channel('flags');

const DisputeDocRequest = Marionette.View.extend({
  /**
   * @param {DocRequestModel} model - The doc request model
   * @param {Boolean} showThumbnails - True if thumbails should be shown
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['showThumbnails',]);

    this.OUTCOME_DOC_REQUEST_STATUS_DISPLAY = configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_DISPLAY');
    this.docStatusComplete = configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_COMPLETE');
    this.docStatusWithdrawn = configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_WITHDRAWN');
    this.affectedDocDisplay = configChannel.request('get', 'OUTCOME_DOC_REQUEST_AFFECTED_DOC_DISPLAY');
    this.outcomeDocGroups = documentsChannel.request('get:all');
    this.createSubModels();
    this.setupListeners();

    // Get flattened list of all valid doc files
    const validDocFiles = [].concat(...this.outcomeDocGroups.map(docGroup => this.getValidDocFilesFromGroup(docGroup)));
    const isDocSelectEditable = validDocFiles.length;
    this.editGroup = ['statusRegion', 'receivedDateRegion', 'requestItemsRegion',
        ...(isDocSelectEditable ? ['docRequestSelectRegion'] : [])];
  },

  createSubModels() {
    this.requestStatusModel = new DropdownModel({
      optionData: this.setRequestStatusAndReturnOptions(),
      labelText: 'Main request status',
      defaultBlank: true,
      required: false,
      value: this.model.get('request_status') ? String(this.model.get('request_status')) : null,
      apiMapping: 'request_status'
    });

    this.receivedDateModel = new InputModel({
      inputType: 'date',
      labelText: 'Date Request Received',
      required: true,
      errorMessage: 'Request date is required',
      minDate: this.model.get('date_documents_received') ? Moment(this.model.get('date_documents_received')) : null,
      value: this.model.get('request_date'),
      apiMapping: 'request_date',
    });
  },

  setupListeners() {
    this.listenTo(this.requestStatusModel, 'change:value', (model, value) => {
      this.setRequestItemStatus(value);
    });
  },

  setRequestStatusAndReturnOptions() {
    const abandonedStatus = configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_ABANDONED');
    const otherStatus = configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_OTHER');
    const statusDisplay = _.omit(this.OUTCOME_DOC_REQUEST_STATUS_DISPLAY, String(otherStatus));

    if (this.model.isClarification() || this.model.isCorrection()) {
      return Object.entries(statusDisplay || {}).filter(([value, text]) => value !== String(abandonedStatus)).map( ([value, text]) => ({ value: String(value), text }) );
    }
    return Object.entries(statusDisplay || {}).map( ([value, text]) => ({ value: String(value), text }) );
  },

  setRequestItemStatus(value) {
    const isStatusWithdrawSelected = this.isStatusWithdraw();
    const isStatusAbandonedSelected = this.isStatusAbandoned();
    const isStatusCancelledOrDeficientSelected = this.isStatusCancelledOrDeficient();

    if(isStatusWithdrawSelected || isStatusAbandonedSelected || isStatusCancelledOrDeficientSelected) {
      this.model.getRequestItems().forEach(reqItem => {
        reqItem.trigger('ui:status:required', false)
        reqItem.trigger('ui:status:set', null);
        reqItem.trigger('ui:disabled:set', true);
      });
    } else {
      const areReqItemsRequired = !!value;
      this.model.getRequestItems().forEach(model => {
        model.trigger('ui:status:required', areReqItemsRequired);
        model.trigger('ui:disabled:set', false);
      });
    }
  },

  getValidDocFilesFromGroup(docGroup) {
    if (this.model.isCorrection()) return docGroup.getDocFilesThatCanRequestCorrection();
    else if (this.model.isClarification()) return docGroup.getDocFilesThatCanRequestClarification();
    else if (this.model.isReview()) return docGroup.getDocFilesThatCanRequestReview();
    else return docGroup.getOutcomeFiles();
  },

  resetModelValues() {
    this.createSubModels();
    this.setupListeners();
  },

  setDocRequestsAndItemsStatus(docRequestStatus, itemStatus) {
    this.requestStatusModel.set('value', docRequestStatus);
    this.requestStatusModel.trigger('render');

    this.model.getRequestItems().forEach(reqItem => {
      reqItem.trigger('ui:status:set', itemStatus);
    });
  },
  

  onMenuMarkGranted() {
    this.setDocRequestsAndItemsStatus(String(this.docStatusComplete), configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_STATUS_GRANTED'));
  },

  onMenuMarkDismissed() {
   this.setDocRequestsAndItemsStatus(String(this.docStatusComplete), configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_STATUS_DISMISSED'));
  },

  onMenuMarkCancelled() {
    this.setDocRequestsAndItemsStatus(String(configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_CANCELLED_OR_DEFICIENT')), configChannel.request('get', 'OUTCOME_DOC_REQUEST_ITEM_STATUS_DISMISSED'));
  },

  onMenuSave() {
    if (!this.validateAndShowErrors()) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length === 0) {
        console.log(`[Warning] Page not valid, but no visible error message found`);
      } else {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', {is_page_item: true});
      }
      return;
    }

    this.saveInternalDataToModel();
    this.saveAndRefresh();
  },

  onMenuEdit() {
    this.editGroup.forEach(regionName => {
      const component = this.getChildView(regionName);
      if (component && component.toEditable) component.toEditable();
    });
  },

  onMenuDownloadAll() {
    const onContinueFn = (modalView) => {
      modalView.close();
      const files = this.model.getAllUploadedFiles();
      filesChannel.request('download:files', files);
    };

    filesChannel.request('show:download:modal', onContinueFn, { title: 'Download All Request Files' });
  },

  saveAndRefresh() {
    const saveRequestPromise = new Promise((res, rej) => this.model.save(this.model.getApiChangesOnly()).then(res, rej));
    const saveRequestItemsPromise = new Promise((res, rej) => this.model.saveRequestItems().then(res, rej));
    
    loaderChannel.trigger('page:load');
    saveRequestPromise
      .catch(generalErrorFactory.createHandler('OUTCOME.DOC.REQUEST.SAVE'))
      .then(saveRequestItemsPromise)
      .catch(generalErrorFactory.createHandler('OUTCOME.DOC.REQUEST.ITEM.SAVE'))
      .then(() => {
        // NOTE: This will always run in the background, even with errors
        this.model.trigger('refresh:page');
      });
  },

  validateAndShowErrors() {
    let isValid = true;
    
    this.editGroup.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view && view.isRendered()) isValid = view.validateAndShowErrors() && isValid;
    });
    
    return isValid;
  },

  saveInternalDataToModel() {
   const isStatusSet = !!this.requestStatusModel.getData();
   let attrsToSet = null;

   if (this.model.get('request_completion_date') && isStatusSet) {
     attrsToSet = {};
   } else if (isStatusSet) {
     attrsToSet = { request_completion_date: Moment().toISOString(), request_processing_time: Moment().diff(Moment(this.model.get('created_date')), 'minutes')  }
   } else {
     attrsToSet = { request_completion_date: null }
   }

    this.editGroup.forEach(regionName => {
      const view = this.getChildView(regionName);
      if (view && view.isRendered()) {
        // Add special handling for non-standard data elements
        if (regionName === 'requestItemsRegion' && view.saveInternalDataToModel) {
          // Save request item data to their own model - they will be saved when the request model is saved
          view.saveInternalDataToModel();
        } else if (regionName === 'docRequestSelectRegion' && view.callMethodOnSubView) {
          const { outcome_doc_group_id, affected_documents, affected_documents_text, request_sub_type } = view.callMethodOnSubView('getPageApiDataAttrs');
          Object.assign(attrsToSet, { outcome_doc_group_id, affected_documents, affected_documents_text, request_sub_type });
        } else if (view.getModel && view.getModel().getPageApiDataAttrs) { // Handle the base case
          Object.assign(attrsToSet, view.getModel().getPageApiDataAttrs());
        }
      }
    });
    
    if (this.isStatusWithdraw() || this.isStatusCompleteSelected() || this.isStatusAbandoned() || this.isStatusCancelledOrDeficient()) {
      flagsChannel.request('close:ccr', this.model.id).catch(generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE'));
    }

    this.model.set(attrsToSet); 
  },

  isStatusCompleteSelected() {
    const status = this.requestStatusModel.getData({ parse: true });
    return status && status === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_COMPLETE');
  },

  isStatusWithdraw() {
    const status = this.requestStatusModel.getData({ parse: true });
    return status && status === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_WITHDRAWN');
  },

  isStatusAbandoned() {
    const status = this.requestStatusModel.getData({ parse: true });
    return status && status === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_ABANDONED');
  },

  isStatusCancelledOrDeficient() {
    const status = this.requestStatusModel.getData({ parse: true });
    return status && status === configChannel.request('get', 'OUTCOME_DOC_REQUEST_STATUS_CANCELLED_OR_DEFICIENT');
  },

  onBeforeRender() {
    if (this.isRendered()) ReactDOM.unmountComponentAtNode(this.el);
  },

  onRender() {
    const outcomeDocGroupModel = this.model.getOutcomeDocGroup();
    this.showChildView('docRequestSelectRegion', new EditableComponentView({
      state: 'view',
      label: 'Associated Outcome Document(s)',
      view_value: outcomeDocGroupModel ? outcomeDocGroupModel.getGroupRequestTitleDisplay() : '-',
      subView: new DocRequestSelectView({
        docGroupCollection: this.outcomeDocGroups,
        getValidDocFilesFromGroupFn: docGroup => this.getValidDocFilesFromGroup(docGroup),
        model: this.model,
        showOptOut: true,
      })
    }));

    const statusDisplay = (this.model.get('request_status') && this.OUTCOME_DOC_REQUEST_STATUS_DISPLAY[this.model.get('request_status')]) || '-';
    const classToUse = this.model.get('request_status') === this.docStatusWithdrawn ? CLASS_WITHDRAWN
      : this.model.get('request_status') === this.docStatusComplete ? CLASS_COMPLETE
      : '';
    const statusDisplayHtml = `<span class=${classToUse}>${statusDisplay}</span>${
      this.model.get('request_completion_date') ? ` - ${Formatter.toDateAndTimeDisplay(this.model.get('request_completion_date'))}` : ''}`;
    
    this.showChildView('statusRegion', new EditableComponentView({
      state: 'view',
      label: `Status`,
      view_value: statusDisplayHtml || '-',
      subView: new DropdownView({ model: this.requestStatusModel })
    }));

    this.showChildView('receivedDateRegion', new EditableComponentView({
      state: 'view',
      label: 'Date Request Received',
      view_value: Formatter.toDateDisplay(this.model.get('request_date')) || '-',
      subView: new InputView({ model: this.receivedDateModel })
    }));

    const uploadedFileModels = this.model.getUploadedFiles() || [];
    if (uploadedFileModels.length) {
      this.showChildView('sourceFilesRegion', new FileBlockDisplayView({
        collection: new FileCollection(uploadedFileModels),
        showThumbnails: this.showThumbnails,
      }));
    }

    this.showChildView('requestItemsRegion', new DisputeDocRequestItems({
      collection: this.model.getRequestItems(),
      showThumbnails: this.showThumbnails,
      statusRequiredInitialVal: this.isStatusCompleteSelected(),
      isDisabledOnLoad: this.isStatusWithdraw() || this.isStatusAbandoned() || this.isStatusCancelledOrDeficient()
    }));
  },

  className: `doc-request`,

  regions: {
    docRequestSelectRegion: '.doc-request__select',
    statusRegion: '.doc-request__status',
    receivedDateRegion: '.doc-request__received-date',
    sourceFilesRegion: '.doc-request__source-files',
    requestItemsRegion: '.doc-request-items-container',
  },

  template() {
    const hasUploadedFiles = (this.model.getUploadedFiles() || []).length;
    const participant = participantsChannel.request('get:participant', this.model.get('submitter_id'));
    return (
      <>
        <div className="doc-request__top">
          <div className="doc-request__topleft">
            <div className="doc-request__labelval">
              <label>Request Type:</label>&nbsp;<span>{this.model.getTitleDisplay()}</span>
            </div>

            <div className="doc-request__labelval">
              <label>Request Source:</label>&nbsp;<span>{this.model.getSourceDisplay() || '-'}</span>
            </div>
            
            <div className="doc-request__labelval">
              <label>Submitter:</label>&nbsp;<span>{!participant ? '-' : `${participant.isLandlord() ? 'Landlord' : 'Tenant'} - ${participant.getDisplayName()}`}</span>
              {this.model.get('submitter_details') ? <span>&nbsp;({this.model.get('submitter_details')})</span> : null}
            </div>

            <div className="doc-request__labelval">
              <label>Created:</label>&nbsp;<span>{Formatter.toUserDisplay(this.model.get('created_by'))}, {Formatter.toDateDisplay(this.model.get('created_date'))}</span>
            </div>
            <div className="doc-request__labelval">
              <label>Modified:</label>&nbsp;<span>{Formatter.toUserDisplay(this.model.get('modified_by'))}, {Formatter.toDateDisplay(this.model.get('modified_date'))}</span>
            </div>

            <div className="doc-request__labelval">
              <label>General Request Information:</label>&nbsp;<span>{this.model.get('request_description') || '-'}</span>
            </div>

          </div>
          <div className="doc-request__topright">
            
            <div className="doc-request__status"></div>

            <div className="doc-request__select"></div>
            
            <div className="doc-request__labelval doc-request__affected-docs-display">
              <label>Affected Documents(s):</label>&nbsp;<span>{this.affectedDocDisplay[this.model.get('affected_documents')]}</span>
            </div>

            <div className="doc-request__labelval doc-request__doc-received-date-display">
              <label>Date Document(s) Received by Requestor:</label>&nbsp;<span>{Formatter.toDateDisplay(this.model.get('date_documents_received'))}</span>
            </div>

            <div className="doc-request__received-date"></div>

          </div>
        </div>
        <div>
          <div className="doc-request__labelval">
            <label className={`${hasUploadedFiles ? 'has-files ' : ''}doc-request__docs-label`}>Source Document(s):</label>&nbsp;{hasUploadedFiles ? <span className="doc-request__source-files"></span> : <span>&nbsp;-</span>}
          </div>
        </div>
        <div className="doc-request__bottom">
          <div className="doc-request-items-container"></div>
        </div>
      </>
    );
  }
  
});

_.extend(DisputeDocRequest.prototype, ViewJSXMixin);
export default DisputeDocRequest;