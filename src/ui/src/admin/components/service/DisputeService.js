/**
 * @fileoverview - View used to indicate if and how notice/filepackage service has been provided to participant.
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import React from 'react';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import RadioModel from '../../../core/components/radio/Radio_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import RadioIconView from '../../../core/components/radio/RadioIcon';
import ModalMarkAsDeficientView from '../../../core/components/claim/ModalMarkAsDeficient';
import ModalManageSubServiceView from '../../pages/dispute-overview/modals/ModalManageSubService'
import ModalServiceAuditHistory from './service-audit-history-modal/ModalServiceAuditHistory';
import ArchivedServiceParticipantIcon from '../../static/Icon_ArbOutcomes_PREV.png';
import DeleteIcon from '../../static/Icon_AdminPage_Delete.png';
import MenuConfirmIcon from '../../../core/static/Icon_Notice_MenuConfirm.png';
import MenuRefuteIcon from '../../../core/static/Icon_Notice_MenuRefute.png';
import MenuReplaceIcon from '../../../core/static/Icon_Notice_MenuReplace.png';
import ServiceConfirmIcon from '../../../core/static/Icon_Notice_Confirm.png';
import ServiceNotConfirmed from '../../../core/static/Icon_Notice_NotConfirmed.png';
import isServiceRefuted from '../../../core/static/Icon_Notice_Refute.png';
import ModalAddServiceFiles from '../../../core/components/service/ModalAddServiceFiles';
import ServiceAudit_collection from './ServiceAudit_collection';
import FileDescriptionCollection from '../../../core/components/files/file-description/FileDescription_collection';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import { ViewJSXMixin } from '../../../core/utilities/JsxViewMixin';
import './DisputeService.scss';
import Backbone from 'backbone';

const filesChannel = Radio.channel('files');
const noticeChannel = Radio.channel('notice');
const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');
const participantChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const auditChannel = Radio.channel('audits');
const userChannel = Radio.channel('users');

const DisputeServiceView = Marionette.View.extend({
  className() { return `${this.getOption('mode')} dispute-notice-service-item`; },

  regions: {
    servedIconsRegion: '.dispute-service__delivery-icons',
    serviceTypeRegion: '.dispute-service__type',
    serviceMethodRegion: '.dispute-service__delivery-method',
    deliveryDateRegion: '.dispute-service__delivery-date',
    serviceDateRegion: '.dispute-service__received-date',
    serviceDescriptionRegion: '.dispute-service__service-description',
    serviceCommentRegion: '.dispute-service__service-comment'
  },

  ui: {
    subServiceIcon: '.sub-service-icon-wrapper',
    filename: '.filename-download',
    addFiles: '.dispute-service__add-files',
    serviceHistory: '.dispute-service__history'
  },

  events: {
    'click @ui.subServiceIcon': 'clickSubServiceIcon',
    'click @ui.filename': 'clickFilename',
    'click @ui.addFiles': 'clickAddFiles',
    'click @ui.serviceHistory': 'clickServiceHistory'
  },
  /**
   * @param {String} mode - used to switch between view and edit mode
   * @param {UnitModel} matchingUnit - Used to display unit info for ARI-C/PFR disputes
   * @param {Boolean} showArchived - Displays archived notice service
   */
  initialize(options) {
    this.template = this.template.bind(this);
    this.mergeOptions(options, ['mode', 'matchingUnit', 'showArchived']);

    this.ALL_SERVICE_METHODS_INVERTED = _.invert(configChannel.request('get', 'ALL_SERVICE_METHODS') || {});
    this.SERVICE_METHOD_DEEMED_DAY_OFFSETS = configChannel.request('get', 'SERVICE_METHOD_DEEMED_DAY_OFFSETS') || {};

    this.SERVICE_DATE_USED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_SERVED');
    this.SERVICE_DATE_USED_DEEMED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_DEEMED_SERVED');
    this.SERVICE_DATE_USED_ACKNOWLEDGED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_ACKNOWLEDGED_SERVED');
    
    const currentUser = sessionChannel.request('get:user');
    this.isArbUser = currentUser.isArbitrator();
    this.isEditAllowed = (userChannel.request('get:user', this.model.get('modified_by'))?.isArbitrator() ||  this.model.get('is_served') === null) && this.isArbUser;
    this.isEditValidationStatusMode = this.isArbUser && !this.isEditAllowed && !this.model.get('validation_status');
    this.recordReplaced = false;
    
    this.validateGroup = ['serviceTypeRegion', 'serviceMethodRegion', 'deliveryDateRegion', 'serviceDateRegion', 'serviceDescriptionRegion', 'serviceCommentRegion'];
    this.createSubModels();
    this.setupListeners();
  },

  createSubModels() {
    this.servedIconsModel = new RadioModel({
      optionData: [
        { iconClass: 'service-served-icon', value: true },
        { iconClass: 'service-not-served-icon', value: false }
      ],
      value: this.model.get('is_served'),
      required: true,
      disabled: !this.isEditAllowed,
      apiMapping: 'is_served',
    });

    const serviceTypeOptions = Formatter.getServiceTypeOptions();
    this.serviceTypeModel = new DropdownModel({
      optionData: serviceTypeOptions,
      labelText: 'Service Type',
      required: true,
      defaultBlank: true,
      disabled: !this.isEditAllowed,
      value: this.model.get('service_date_used') ? String(this.model.get('service_date_used')) : null,
      apiMapping: 'service_date_used',
    });

    this.serviceMethodModel = new DropdownModel({
      optionData: this.model.hasServiceByLegacyMethod() ?  Formatter.getClaimDeliveryMethods() : Formatter.getServiceDeliveryMethods(),
      labelText: 'Service Method',
      required: true,
      defaultBlank: true,
      disabled: !this.isEditAllowed,
      value: this.model.get('service_method') ? String(this.model.get('service_method')) : null,
      apiMapping: 'service_method',
    });
    
    this.deliveryDateModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      labelText: 'Delivered',
      errorMessage: 'Enter date',
      disabled: !this.isEditAllowed,
      value: this.model.get('received_date') ? Moment(this.model.get('received_date')).format(InputModel.getDateFormat()) : null,
      apiMapping: 'received_date'
    });

    this.serviceDateModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      labelText: 'Served',
      errorMessage: 'Enter date',
      disabled: !this.isEditAllowed,
      value: this.model.get('service_date') ? Moment(this.model.get('service_date')).format(InputModel.getDateFormat()) : null,
      apiMapping: 'service_date',
      allowMinDates: true,
      minDate: Moment(this.deliveryDateModel.getData()).format(InputModel.getDateFormat()),
      customLinkFn: () => {
        const serviceDateString = this._getServiceDateStringFromRules();
        if (serviceDateString) {
          this.serviceDateModel.set({ value: serviceDateString });
        }
      }
    });

    this.serviceDescriptionModel = new InputModel({
      disabled: !this.isEditAllowed,
      value: this.model.get('service_description'),
      labelText: 'Applicant Service Description',
      minLength: 5,
      maxLength: configChannel.request('get', 'SERVICE_COMMENT_MAX_LENGTH'),
      apiMapping: 'service_description'
    });

    this.serviceCommentModel = new InputModel({
      disabled: false,
      value: this.model.get('service_comment'),
      labelText: 'Staff Service Comment',
      minLength: 5,
      maxLength: configChannel.request('get', 'SERVICE_COMMENT_MAX_LENGTH'),
      apiMapping: 'service_comment'
    });

    this.applyServiceTypeRules();
  },

  clickSubServiceIcon() {

    const participantModel = participantChannel.request('get:participant', this.model.get('participant_id'));
    if (!participantModel) {
      alert(`Unable to find participant model for service record id ${this.model.id}`);
      return;
    }

    const openSubServiceFn = () => {
      loaderChannel.trigger('page:load');
      // Always refresh the subservices on click to open sub services
      noticeChannel.request('load:subservices', disputeChannel.request('get:id'))
        .always(() => {
          loaderChannel.trigger('page:load:complete');
          const modalView = new ModalManageSubServiceView({ model: participantModel });
          this.listenTo(modalView, 'removed:modal', () => {
            loaderChannel.trigger('page:load');
            setTimeout(() => this.model.trigger('subservice:save'), 200);
          });
          modalChannel.request('add', modalView);
        });
    };

    const dispute = disputeChannel.request('get');
    if (!dispute || !_.isFunction(dispute.checkEditInProgressPromise)) {
      openSubServiceFn();
      return;
    }

    dispute.checkEditInProgressPromise().then(
      openSubServiceFn,
      () => {
        dispute.showEditInProgressModalPromise()
      }
    );
  },

  clickFilename(ev) {
    const ele = $(ev.currentTarget);
    const fileId = ele.data('fileId');
    const mainProofFileModel = this.mainProofFileModels.find((model) => model.get('file_id') === fileId);
    const otherProofFileModel = this.otherProofFileModels.find((model) => model.get('file_id') === fileId);
    const fileModelToUse = mainProofFileModel ? mainProofFileModel : otherProofFileModel;

    if (!fileModelToUse) {
      console.log(`[Error] Couldn't find file to download`, ev, fileId, fileModelToUse, this);
    } else {
      filesChannel.request('click:filename:preview', ev, fileModelToUse, { fallback_download: true });
    }
  },

  clickAddFiles() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    // Save notice first, then add files
    loaderChannel.trigger('page:load');
    this.saveViewDataToModel();
    this.model.save(this.model.getApiChangesOnly())
      .done(() => this.showAddFilesModal())
      .fail(generalErrorFactory.createHandler(''))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  async clickServiceHistory(ev) {
    // Stop the click so the hearing tools area does not turn editable
    ev.stopPropagation();
    let searchParams = {
      disputeGuid: disputeChannel.request('get:id'),
      ServiceType: this.model.get('notice_id') ? configChannel.request('get', 'SERVICE_AUDIT_TYPE_NOTICE') : configChannel.request('get', 'SERVICE_AUDIT_TYPE_FILE_PACKAGE'),
      ParticipantId: this.model.get('participant_id'),
    }

    searchParams = { ...searchParams, ...this.model.get('notice_id') ? { NoticeServiceId: this.model.get('notice_service_id') } : { FilePackageServiceId: this.model.get('file_package_service_id') } };

    loaderChannel.trigger('page:load');
    const auditService = await auditChannel.request('load:audit:service', searchParams).catch(generalErrorFactory.createHandler('ADMIN.AUDIT.SERVICE.LOAD'));
    loaderChannel.trigger('page:load:complete');
    
    const participantModel = participantChannel.request('get:participant', this.model.get('participant_id'));
    const modalNoticeHistory = new ModalServiceAuditHistory({ model: this.model, participantModel: participantModel, serviceAuditCollection: new ServiceAudit_collection(auditService?.service_audit_logs) });
    modalChannel.request('add', modalNoticeHistory);
  },

  showAddFilesModal() {
    return this.addFilesFn(this);
  },

  saveViewDataToModel() {
    this.validateGroup.forEach(region => {
      const view = this.getChildView(region);
      if (view) {
        this.model.set( view.model.getPageApiDataAttrs() );
      }
    });

    if (this.isEditAllowed && this.model.getApiChangesOnly() && this.model.get('is_served') !== null) {
      this.model.setToConfirmed();
    }
  },

  getSubServrequestStatusImgClass() {
    const participantModel = participantChannel.request('get:participant', this.model.get('participant_id'));
    if (!participantModel) return;

    const subServiceList = noticeChannel.request('get:subservices');
    const subServiceModel = subServiceList.find(subService => subService.get('service_to_participant_id') === participantModel.id);
    if (!subServiceModel) return;

    return subServiceModel.getRequestStatusImgClass();
  },

  _getServiceDateStringFromRules() {
    const serviceMethodCode = this.ALL_SERVICE_METHODS_INVERTED[this.serviceMethodModel.getData({ parse: true })];
    const daysToAdd = _.has(this.SERVICE_METHOD_DEEMED_DAY_OFFSETS, serviceMethodCode) ? this.SERVICE_METHOD_DEEMED_DAY_OFFSETS[serviceMethodCode] : null;
    const newMomentValue = _.isNumber(daysToAdd) ? Moment(this.deliveryDateModel.getData()).add(daysToAdd, 'days') : null;
    
    return newMomentValue && newMomentValue.isValid() && !newMomentValue.isAfter(Moment(), 'days') ? newMomentValue.format(InputModel.getDateFormat()) : null;
  },

  setupListeners() {
    this.listenTo(this.servedIconsModel, 'change:value', this.onIsServedChange, this);
    this.listenTo(this.serviceTypeModel, 'change:value', this.applyServiceTypeRulesAndRender, this);
    
    this.listenTo(this.serviceMethodModel, 'change:value', this.checkAndApplyRuleDateStateAndRender, this);
    this.listenTo(this.deliveryDateModel, 'change:value', this.checkAndApplyRuleDateStateAndRender, this);
    
    this.listenTo(this.serviceDateModel, 'change:value', (model) => {
      if (model.isValid()) {
        this.model.set(model.getPageApiDataAttrs());
        this.checkAndApplyRuleDateStateAndRender();
      }
    });

    this.listenTo(this.serviceDescriptionModel, 'change:value', (model) => this.model.set(model.getPageApiDataAttrs()) );
    this.listenTo(this.serviceCommentModel, 'change:value', (model) => this.model.set(model.getPageApiDataAttrs()) );
  },

  applyServiceTypeRules() {
    /*
      1: Served - The respondent has indicated they were served on a specific date
      The service method and served date are required - the note is optional
      Delivered date is disabled
      2: Deemed Served - The applicant served the respondent and has proof of service, the notice is considered deemed served based on the service dates
      The service method, delivered date and served date are required - the note is optional
      3: Acknowledged Served - The parties have all agreed they were served
      No information is required. - the note is optional
      Notice service method, delivered date and served date are disabled
     */

    const isServiceTypeServedSelected = this.isServiceTypeServedSelected();
    const isServiceTypeDeemedServedSelected = this.isServiceTypeDeemedServedSelected();

    const enableServiceMethod = isServiceTypeServedSelected || isServiceTypeDeemedServedSelected;
    const enableDeliveryDate = isServiceTypeDeemedServedSelected;
    const enableServiceDate = isServiceTypeServedSelected || isServiceTypeDeemedServedSelected;

    this.serviceMethodModel.set(Object.assign({
      required: enableServiceMethod,
      disabled: !enableServiceMethod || !this.isEditAllowed,
    }, !enableServiceMethod ? { value: null } : {}), { silent: true });

    this.deliveryDateModel.set(Object.assign({
      required: enableDeliveryDate,
      disabled: !enableDeliveryDate || !this.isEditAllowed
    }, !enableDeliveryDate ? { value: null } : {} ), { silent: true });


    this.serviceDateModel.set(Object.assign({
      required: enableServiceDate,
      disabled: !enableServiceDate || !this.isEditAllowed
    }, !enableServiceDate ? { value: null } : {} ), { silent: true });

    this.checkAndApplyRuleDateState();
  },

  applyServiceTypeRulesAndRender() {
    this.applyServiceTypeRules();

    this.renderRegion('serviceMethodRegion');
    this.renderRegion('deliveryDateRegion');
    this.renderRegion('serviceDateRegion');
  },

  renderRegion(region) {
    const view = this.getChildView(region);
    if (view && view.isRendered()) {
      view.render();
    }
  },

  addFilesFn() {
    const modalAddFiles = new ModalAddServiceFiles({ model: this.model });
    this.listenTo(modalAddFiles, 'removed:modal', () => {
      this.render();
      loaderChannel.trigger('page:load:complete');
    });
    modalChannel.request('add', modalAddFiles);
  },

  _isRuleDateEnabled() {
    // Validate that RuleDate will return a real value
    
    // Don't show rule date if rule date is the same as current value
    const serviceDateString = this._getServiceDateStringFromRules();
    const serviceDateValue = this.serviceDateModel.getData() ? Moment(this.serviceDateModel.getData()).format(InputModel.getDateFormat()) : null;
    return this.isServiceTypeDeemedServedSelected() && this.serviceMethodModel.isValid() &&
        this.deliveryDateModel.isValid() && typeof serviceDateString === 'string' &&
        serviceDateString !== serviceDateValue;
  },

  checkAndApplyRuleDateState() {
    this.serviceDateModel.set('customLink', this._isRuleDateEnabled() ? 'Rule Date' : null, { silent: true });
  },

  checkAndApplyRuleDateStateAndRender() {
    this.checkAndApplyRuleDateState();
    this.renderRegion('serviceDateRegion');
  },

  openClearServiceInfoModal() {
    const mainProofFileDescription = this.model.getServiceFileDescription();
    const otherProofFileDescription = this.model.getOtherServiceFileDescription();

    const hideReason = !this.mainProofFileModels.length && !this.otherProofFileModels.length;
    const modalView = new ModalMarkAsDeficientView({
      collection: new FileDescriptionCollection([mainProofFileDescription, otherProofFileDescription]),
      title: 'Clear Service Information?',
      topHtml: `
        <p><b>Warning:</b> This action will cause existing information to be cleared.<p>
        <p>This will delete service information associated to respondent(s) including any service methods or service dates.</p>
        <p>This will move proof of service file(s) associated to the respondent(s) to deficient documents.
          ${hideReason ? '' : 'A reason for this removal is required and will be stored with the removed proof file(s).'}</p>
      `,
      bottomHtml: `
        <p>Are you sure you want to change the service information for the affected respondent(s)?</p>
      `,
      hideReason,
      getRemovalReasonFn: (enteredReason) => `Service record removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} - ${enteredReason}`,
      clickMarkDeficientFn: hideReason ? () => {
        modalView.trigger('save:complete');
        modalView.close();
      }: null
    });

    return modalView;
  },

  onIsServedChange(model, value) {
    // When setting to "not served", show a modal warning if any API data had been previously saved and now needs to be cleared
    let saveOccured = false;
    if (this.recordReplaced) {
      this.recordReplaced = false;
      return;
    }
    if (value || !this.model.hasSavedApiData()) {
      this.model.set({ is_served: value });
      this.render();
      return;
    }

    const modalView = this.openClearServiceInfoModal();

    this.listenTo(modalView, 'save:complete', () => {
      saveOccured = true;
        this.model.saveAsUnserved({ is_served: value }).always(() => {
          this.render();
          loaderChannel.trigger('page:load:complete');
        });
    })

    this.listenTo(modalView, 'removed:modal', () => {
      // Check if save was clicked or not
      if (!saveOccured) {
        this.servedIconsModel.set({ value: true });
        this.render();
        loaderChannel.trigger('page:load:complete');
      }
    });

    modalChannel.request('add', modalView);
  },

  validateAndShowErrors() {
    let isValid = true;
    const validationFields = this.validateGroup.filter(viewName => !this.getChildView(viewName)?.model?.get('disabled'));

    if (this.model.isServed()) {
      validationFields.forEach(region => {
        const view = this.getChildView(region);
        if (view) {
          isValid = view.validateAndShowErrors() && isValid;
        }
      });
    }
    return isValid;
  },

  _isServiceTypeSelected(serviceType) {
    return serviceType && String(serviceType) === String(this.serviceTypeModel.getData());
  },

  isServiceTypeServedSelected() {
    return this._isServiceTypeSelected(this.SERVICE_DATE_USED_SERVED);
  },

  isServiceTypeDeemedServedSelected() {
    return this._isServiceTypeSelected(this.SERVICE_DATE_USED_DEEMED_SERVED);
  },

  isServiceTypeAcknowledgedServedSelected() {
    return this._isServiceTypeSelected(this.SERVICE_DATE_USED_ACKNOWLEDGED_SERVED);
  },

  clickDeficientDocLink() {
    const dispute = disputeChannel.request('get');
    Backbone.history.navigate(routeParse('document_item', dispute.id), { trigger: true });
  },

  clickResetService() {

    const modalView = this.openClearServiceInfoModal();
    modalChannel.request('add', modalView);

    this.listenTo(modalView, 'save:complete', () =>{
      this.model.resetValues();
      const mainProofFileDescription = this.model.getServiceFileDescription();
      const otherProofFileDescription = this.model.getOtherServiceFileDescription();
      const markAsDeficientMsg = 'notice service was reset';
      if (mainProofFileDescription) mainProofFileDescription.markAsDeficient(markAsDeficientMsg);
      if (otherProofFileDescription) otherProofFileDescription.markAsDeficient(markAsDeficientMsg);

      const deficientMainFileDescriptionPromise = () => mainProofFileDescription ? new Promise ((res, rej) => mainProofFileDescription.save( mainProofFileDescription.getApiChangesOnly() ).then(res, generalErrorFactory)) : Promise.resolve();
      const deficientOtherFileDescriptionPromise = () => otherProofFileDescription ? new Promise ((res, rej) => otherProofFileDescription.save( otherProofFileDescription.getApiChangesOnly() ).then(res, generalErrorFactory)) : Promise.resolve();
      const resetModelPromise = () => new Promise ((res, rej) => this.model.save(this.model.getApiChangesOnly()).then(res, generalErrorFactory).fail(generalErrorFactory.createHandler('ADMIN.AUDIT.SERVICE.LOAD')));
      
      loaderChannel.trigger('page:load');
      Promise.all([resetModelPromise(), deficientMainFileDescriptionPromise(), deficientOtherFileDescriptionPromise()]).finally(() => {
        this.resetUserInputs();
        this.render();
        this.collection.trigger('render:viewMode');
        loaderChannel.trigger('page:load:complete');
      });
    });
  },

  clickConfirmServiceRecord() {
    if (!this.validateAndShowErrors()) {
      return;
    }
    loaderChannel.trigger('page:load');
    this.model.setToConfirmed();
    this.saveViewDataToModel();
    const disputeServicePromise = () => new Promise ((res, rej) => this.model.save(this.model.getApiChangesOnly()).then(res, generalErrorFactory).fail(generalErrorFactory.createHandler('ADMIN.AUDIT.SERVICE.LOAD')));
    disputeServicePromise().then(() => {
      this.isEditValidationStatusMode = false;
      this.render();
      loaderChannel.trigger('page:load:complete');
    })
  },

  clickRefuteServiceRecord() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    if (!this.model.isEditAllowed && this.model.get('is_served') && this.model.get('validation_status') === null) {
      const callBackFn = () => {
        this.model.setToConfirmed();
        this.model.set({ is_served: false });
      }
      this.archiveServiceAndDoAction({ actionType: 'refute', callBackFn });
    } else {
      this.archiveServiceAndDoAction({ actionType: 'refute' });
    }
  },

  clickReplaceServiceRecord() {
    if (!this.validateAndShowErrors()) {
      return;
    }
    this.archiveServiceAndDoAction({ actionType: 'replace' });
  },

  clickEditValidation() {
    this.isEditValidationStatusMode = true;
    this.render();
  },

  resetUserInputs() {
    this.isEditValidationStatusMode = false;
    this.servedIconsModel.set({ value: null });
    this.serviceTypeModel.set({ value: null });
    this.serviceMethodModel.set({ value: null });
    this.deliveryDateModel.set({ value: null });
    this.serviceDateModel.set({ value: null });
    this.serviceDescriptionModel.set({ value: null });
    this.serviceCommentModel.set({ value: null });
  },

  archiveServiceAndDoAction(options={}) {
    const archiveService = () => {
      this.recordReplaced = true;
      this.resetUserInputs();
      const fileDescription = this.model.getServiceFileDescription();
      options.actionType === 'refute' ? this.model.setToRefuted() : options.actionType === 'replace' ? this.model.setToReplaced() : null;
      const deficientFileDescriptionPromise = () => fileDescription ? new Promise ((res, rej) => fileDescription.save( fileDescription.getApiChangesOnly() ).then(res, generalErrorFactory)) : Promise.resolve();
      const disputeServicePromise = () => new Promise ((res, rej) => this.model.save(this.model.getApiChangesOnly()).then(res, generalErrorFactory).fail(generalErrorFactory.createHandler('ADMIN.AUDIT.SERVICE.LOAD')));
      options.callBackFn ? options.callBackFn() : null;
      return Promise.all([deficientFileDescriptionPromise(), disputeServicePromise()]).then(() => {
        loaderChannel.trigger('page:load:complete');
        this.isEditValidationStatusMode = false;
        if (options.actionType === 'refute') this.collection.trigger('save:service');
        this.render();
      });
    }

    const modalView = this.openClearServiceInfoModal();
    modalChannel.request('add', modalView);
    this.listenTo(modalView, 'save:complete', () => archiveService());
  },

  onBeforeRender() {
    // Always get an updated version of existing file models on-render
    this.mainProofFileModels = this.model.getProofFileModels();
    this.otherProofFileModels = this.model.getOtherProofFileModels();
  },

  onRender() {
    this.showChildView('servedIconsRegion', new RadioIconView({ deselectEnabled: true, model: this.servedIconsModel }));
   
    if (!this.model.get('is_served')) {
      return;
    }

    if (this.mode === 'service-edit') {
      if (this.model.get('is_served') !== null) this.showChildView('serviceCommentRegion', new InputView({ model: this.serviceCommentModel }));

      this.showChildView('serviceTypeRegion', new DropdownView({ model: this.serviceTypeModel }));
      this.showChildView('serviceMethodRegion', new DropdownView({ model: this.serviceMethodModel }));
      this.showChildView('deliveryDateRegion', new InputView({ model: this.deliveryDateModel }));
      this.showChildView('serviceDateRegion', new InputView({ model: this.serviceDateModel }));
      this.showChildView('serviceDescriptionRegion', new InputView({ model: this.serviceDescriptionModel }));
    }
  },

  template() {
    const participantModel = participantChannel.request('get:participant', this.model.get('participant_id'));
    const name = participantModel ? `${this.matchingUnit ? `${this.matchingUnit.getUnitNumDisplayShort()}: ` : ''}${participantModel.getDisplayName()}` : '-';
    const hasSubService = participantModel && participantModel.hasSubstitutedService();
    const subServiceIconClass = this.getSubServrequestStatusImgClass();
    const modifiedDateText = `Modified ${Formatter.toDateDisplay(this.model.get('modified_date'))}`;
    const modifiedByText = `${Formatter.toUserDisplay(this.model.get('modified_by'))}`;
    const isServed = this.model.get('is_served');

    return (
      <>
      <div className={`dispute-service ${isServed === false ? 'not-served' : ''}`}>
        <div className="dispute-service__service-name">
          <span>
            <div className="dispute-service__meta-data-wrapper">
              <div className="dispute-service__name-wrapper">
                { hasSubService ?  
                  <span className="sub-service-icon-wrapper hidden-print"><b className={subServiceIconClass}></b></span>
                : null }
                  <div className="" tabIndex="-1" data-toggle="popover" data-container="body" data-trigger="focus" title={name} data-content={name}>{name}</div>
              </div>
                <div className="dispute-service__meta-data">
                  <div>{modifiedDateText}</div>
                  <div>{modifiedByText}</div>
                </div>
              <div className="general-link dispute-service__history">Service History</div>
            </div>
            { this.renderJsxValidationStatus() }
            <div className="dispute-service__delivery-icon-display__wrapper">
              <div className={`dispute-service__delivery-icon-display hidden-print
                ${isServed ? 'service-served-icon' : (isServed === null ? 'service-unknown-icon' : 'service-not-served-icon')}
                ${isServed !== null ? 'selected' : ''}
                `}>
              </div>
            </div>
            <div>
            <div className="dispute-service__delivery-icons"></div>
              { this.renderJsxResetUI() }
            </div>
          </span>
        </div>
        
        { isServed === false ?
          <div className="dispute-service__service-description"></div>
        : null }
        
        <div>
          <div className="dispute-service__details">
            <div className="dispute-service__type"></div>
            <div className="dispute-service__delivery-method"></div>
            <div className="dispute-service__delivery-date"></div>
            <div className="dispute-service__received-date"></div>
            <div className={`dispute-service__add-files-container ${isServed && this.isEditAllowed ? '' : 'hidden-item' }`}>
              <div className="dispute-service__add-files"></div>
              <p className="error-block"></p>
            </div>
          </div>

          { this.renderJsxViewUI() }

          <div className="">
            { isServed !== false ?
              <div className="dispute-service__service-description"></div>
            : null }
            <div className={`dispute-service__files-list-display ${this.mainProofFileModels.length ? '' : 'hidden' }`}>
              <span className="dispute-service__proof-text">Main Proof:&nbsp;</span><span className="dispute-issue-evidence-files">
                  { this.mainProofFileModels.map((file, index) => {
                    return (
                      <div className={`dispute-issue-evidence-file ${!file.isAccepted() ? '' : 'not-file-accepted'}`}>
                        <a href="javascript:;" data-file-id={file.get('file_id')} className="filename-download">{file.get('file_name')}</a>&nbsp;
                        { file.get('file_size') ? <span className="dispute-issue-evidence-filesize">({Formatter.toFileSizeDisplay(file.get('file_size'))})</span> : null }
                        { index !== this.mainProofFileModels.length - 1 ? <span className="list-comma">,&nbsp;</span> : null }
                      </div>
                    )})
                  }
                </span>
            </div>
            <div className={`dispute-service__files-list-display ${this.otherProofFileModels.length ? '' : 'hidden' }`}>
              <span className="dispute-service__proof-text">Other Proof:&nbsp;</span><span className="dispute-issue-evidence-files">
                  { this.otherProofFileModels.map((file, index) => {
                    return (
                      <div className={`dispute-issue-evidence-file ${!file.isAccepted() ? '' : 'not-file-accepted'}`}>
                        <a href="javascript:;" data-file-id={file.get('file_id')} className="filename-download">{file.get('file_name')}</a>&nbsp;
                        { file.get('file_size') ? <span className="dispute-issue-evidence-filesize">({Formatter.toFileSizeDisplay(file.get('file_size'))})</span> : null }
                        { index !== this.otherProofFileModels.length - 1 ? <span className="list-comma">,&nbsp;</span> : null }
                      </div>
                    )})
                  }
                </span>
            </div>
            <div className="dispute-service__service-comment"></div>
          </div>
        </div>
      </div>
      { this.renderJsxArchiveUI() }
      </>
    )
  },

  renderJsxValidationStatus() {
    const hasSelectedService = this.model.get('is_served') !== null;

    const renderValidationImg = () => {
      if (this.model.isServiceConfirmed()) return <img src={ServiceConfirmIcon} />
      else if (this.model.isServiceRefuted()) return <img src={isServiceRefuted} />
      else return <img src={ServiceNotConfirmed} />
    }

    if (this.isEditValidationStatusMode  && this.mode === 'service-edit') {
      const showConfirm = hasSelectedService && this.model.get('validation_status') === null;
      const showRefute = this.model.get('is_served') && this.model.get('validation_status') === null;
      const showReplace = hasSelectedService;
  
      return (
        <div className="dispute-service__validation-tools">
          <div className={`dispute-service__validation-tools__tool${showConfirm ? '' : '--disabled'}`}  onClick={() => showConfirm ? this.clickConfirmServiceRecord() : {}}><img src={MenuConfirmIcon}/>&nbsp;Confirm</div>
          <div className={`dispute-service__validation-tools__tool${showRefute ? '' : '--disabled'}`} onClick={() => showRefute ? this.clickRefuteServiceRecord() : {}}><img src={MenuRefuteIcon}/>&nbsp;Refute</div>
          <div className={`dispute-service__validation-tools__tool${showReplace ? '' : '--disabled'}`} onClick={() => showReplace ? this.clickReplaceServiceRecord() : {}}><img src={MenuReplaceIcon}/>&nbsp;Replace</div>
        </div>
      );

    } else {
      const isInitialService = !this.model.get('service_date_used') && this.model.get('validation_status') === null;
      if (isInitialService) return;
      const serviceValidationTypeText = this.model.get('validation_status')  ? this.model.isExternallyValidated() ? 'external' : 'internal' : '-';
      return (
        <div className="dispute-service__validation">
          { hasSelectedService && this.isArbUser && this.mode === 'service-edit' && this.model.get('service_date_used') ? <span className="dispute-service__validation__edit general-link" onClick={() => this.clickEditValidation()}>Edit&nbsp;</span> : null }
          <div className="dispute-service__validation__selection">
            { renderValidationImg() }
            <div className="dispute-service__meta-data">{serviceValidationTypeText}</div>
          </div>
        </div>
      )
    }
  },

  renderJsxViewUI() {
    if (this.mode === 'service-edit') return;
    
    return (
      <>
        { this.model.get('is_served') && this.serviceTypeModel.getData() ? <span className="dispute-service__type__text"><span className="dispute-service__label">Service Type: </span>{this.serviceTypeModel.getSelectedText()}</span> : null }
        { this.model.get('is_served') && this.serviceMethodModel.getData() ? <span className="dispute-service__delivery-method__text"><span className="dispute-service__label">Method: </span>{this.serviceMethodModel.getSelectedText()}</span> : null }
        { this.model.get('is_served') && this.deliveryDateModel.getData() ? <span className="dispute-service__delivery-date__text"><span className="dispute-service__label">Delivered: </span>{Formatter.toDateDisplay(this.deliveryDateModel.getData())}</span> : null }
        { this.model.get('is_served') && this.serviceDateModel.getData() ? <span className="dispute-service__service-date__text"><span className="dispute-service__label">Served: </span>{Formatter.toDateDisplay(this.serviceDateModel.getData())}</span> : null }
        <br/>
        { this.model.get('is_served') !== null && this.serviceDescriptionModel.getData() ? <span className="dispute-service__comment__text"><span className="dispute-service__label">Applicant Service Description: </span>{this.serviceDescriptionModel.getData() ? this.serviceDescriptionModel.getData() : '-'}</span> : null }
        <br/>
        { this.model.get('is_served') !== null && this.serviceCommentModel.getData() ? <span className="dispute-service__comment__text"><span className="dispute-service__label">Staff Service Comment: </span>{this.serviceCommentModel.getData() ? this.serviceCommentModel.getData() : '-'}</span> : null }
      </>
    )
  },

  renderJsxArchiveUI() {
    if (!this.model.get('archived_by') || !this.showArchived || this.mode !== 'service-edit') return;

    const participantModel = participantChannel.request('get:participant', this.model.get('participant_id'));
    const name = participantModel ? `${this.matchingUnit ? `${this.matchingUnit.getUnitNumDisplayShort()}: ` : ''}${participantModel.getDisplayName()}` : '-';
    const archivedServiceType = this.model.get('archive_service_date_used') ? this.model.get('archive_service_date_used') : '-';
    const archivedMethod = this.model.get('archive_service_method');
    const archivedDeliveredDate = this.model.get('archive_service_date') ? Formatter.toDateDisplay(this.model.get('archive_service_date')) : '-';
    const archivedServedDate = this.model.get('archive_received_date') ? Formatter.toDateDisplay(this.model.get('archive_received_date')) : '-';
    const archivedDescription = this.model.get('archive_service_description') ? this.model.get('archive_service_description') : '-';
    const methodOptions = Formatter.getServiceDeliveryMethods();
    const methodText = methodOptions?.find(option => Number(option.value) === archivedMethod)?.text;
    const archivedServiceTypeText = archivedServiceType ? Formatter.getServiceTypeOptions()?.find(serviceType => Number(serviceType.value) === archivedServiceType)?.text : '-';

    return (
      <div className="archived-service">
        
        <div className="archived-service__replaced-participant">
          <img className="archived-service__participant__archived-icon" src={ArchivedServiceParticipantIcon} />
          <div className="archived-service__participant__wrapper">
            <span className="archived-service__participant__header">Replaced participant record</span>
            <span className="archived-service__participant__text">{name}</span>
          </div>
        </div>

        <div>
          <span className="archived-service__archive-data">Replaced Service: <strike>{archivedServiceTypeText}</strike></span>
          <span className="archived-service__archive-data">Method: {methodText}</span>
          <span className="archived-service__archive-data">Delivered: {archivedDeliveredDate}</span>
          <span className="archived-service__archive-data">Served: {archivedServedDate}</span>
          <br/>
          <span className="archived-service__archive-data">Description: {archivedDescription}</span>
          <br/>
          <span className="archived-service__archive-data">*Any proof files that were submitted with this record will be in the <span className="general-link" onClick={() => this.clickDeficientDocLink()}>deficient documents</span></span>
        </div>
      </div>
    )
  },

  renderJsxResetUI() {
    if (this.mode !== 'service-edit' || (!this.model.get('validation_status') && this.model.isServiceUnknown())) return;
    return (
      <div className="dispute-service__reset" onClick={() => this.clickResetService()}>
        <img src={DeleteIcon} alt="" />
        <span className="dispute-service__reset__text">&nbsp;Reset</span>
      </div>
    );
  }
});

_.extend(DisputeServiceView.prototype, ViewJSXMixin);
export default DisputeServiceView;