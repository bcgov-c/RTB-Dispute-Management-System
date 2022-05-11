import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownModel from '../../../core/components/dropdown/Dropdown_model';
import RadioModel from '../../../core/components/radio/Radio_model';
import InputView from '../../../core/components/input/Input';
import InputModel from '../../../core/components/input/Input_model';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import RadioIconView from '../../../core/components/radio/RadioIcon';
import FileCollection from '../../../core/components/files/File_collection';
import DisputeEvidenceModel from '../../../core/components/claim/DisputeEvidence_model';
import EditableComponentView from '../../../core/components/editable-component/EditableComponent';
import ModalAddFiles from '../../../core/components/modals/modal-add-files/ModalAddFiles';
import ModalMarkAsDeficientView from '../../../core/components/claim/ModalMarkAsDeficient';
import ModalManageSubServiceView from '../../pages/dispute-overview/modals/ModalManageSubService'
import template from './DisputeService_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';

const filesChannel = Radio.channel('files');
const noticeChannel = Radio.channel('notice');
const disputeChannel = Radio.channel('dispute');
const configChannel = Radio.channel('config');
const sessionChannel = Radio.channel('session');
const participantChannel = Radio.channel('participants');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');

const DisputeServiceView = Marionette.View.extend({
  template,
  className() { return `${this.getOption('mode')} dispute-notice-service-item`; },

  regions: {
    servedIconsRegion: '.respondent-notice-delivery-icons',
    serviceTypeRegion: '.service-type',
    serviceMethodRegion: '.respondent-notice-delivery-method',
    deliveryDateRegion: '.respondent-notice-delivery-date',
    serviceDateRegion: '.respondent-notice-received-date',
    serviceCommentRegion: '.respondent-notice-service-comment'
  },

  ui: {
    subServiceIcon: '.sub-service-icon-wrapper',
    filename: '.filename-download',
    addFiles: '.respondent-notice-add-files',
  },

  events: {
    'click @ui.subServiceIcon': 'clickSubServiceIcon',
    'click @ui.filename': 'clickFilename',
    'click @ui.addFiles': 'clickAddFiles'
  },

  clickSubServiceIcon() {
    // Don't allow sub-service edit when hearing tools is on but in view mode.  Instead bubble the event up
    if (this.getUI('subServiceIcon').closest('.hearing-tools-container').find('.hearing-tools-header.service-view').length) {
      return true;
    }

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
    const fileModel = this.existingFileModels.find((model) => model.get('file_id') === fileId);

    if (!fileModel) {
      console.log(`[Error] Couldn't find file to download`, ev, fileId, fileModel, this);
    } else {
      filesChannel.request('click:filename:preview', ev, fileModel, { fallback_download: true });
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
      .done(() => this._showAddFilesModal())
      .fail(generalErrorFactory.createHandler(''))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  _showAddFilesModal() {
    if (typeof this.addFilesFn !== 'function') {
      return this._defaultAddFilesFn(this);
    } else {
      return this.addFilesFn(this);
    }
  },

  _defaultAddFilesFn() {
    const fileDescription = this.model.getServiceFileDescription();
    
    if (!fileDescription) {
      console.log('No file description exists, cannot use default add files functionality');
      return;
    }

    const modalAddFiles = new ModalAddFiles({
      files: new FileCollection(this.existingFileModels),
      title: `Add Service Files`,
      hideDescription: true,
      isDescriptionRequired: false,
      showDelete: false,
      model: new DisputeEvidenceModel({ file_description: fileDescription }),
      autofillRename: true,
      processing_options: {
        errorModalTitle: 'Adding Service Proof',
        checkForDisputeDuplicates: false,
        maxNumberOfFiles: this.SERVICE_FILES_MAX
      },
    });

    this.stopListening(modalAddFiles);
    this.listenTo(modalAddFiles, 'save:complete', () => {
      modalChannel.request('remove', modalAddFiles);

      this.model.set('proof_file_description_id', fileDescription.id);
      this.model.save(this.model.getApiChangesOnly())
        .done(() => {
          this.render();
          loaderChannel.trigger('page:load:complete');
        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('');
          handler(err);
        });
    });

    modalChannel.request('add', modalAddFiles);
  },

  saveViewDataToModel() {
    this.validateGroup.forEach(region => {
      const view = this.getChildView(region);
      if (view) {
        const viewModel = view.getModel();
        this.model.set( viewModel.getPageApiDataAttrs() );
      }
    });
  },

  getSubServrequestStatusImgClass() {
    const participantModel = participantChannel.request('get:participant', this.model.get('participant_id'));
    if (!participantModel) return;

    const subServiceList = noticeChannel.request('get:subservices');
    const subServiceModel = subServiceList.find(subService => subService.get('service_to_participant_id') === participantModel.id);
    if (!subServiceModel) return;

    return subServiceModel.getRequestStatusImgClass();
  },

  initialize(options) {
    this.mergeOptions(options, ['mode', 'addFilesFn', 'matchingUnit']);

    this.SERVICE_FILES_MAX = configChannel.request('get', 'SERVICE_FILES_MAX');

    this.ALL_SERVICE_METHODS_INVERTED = _.invert(configChannel.request('get', 'ALL_SERVICE_METHODS') || {});
    this.SERVICE_METHOD_DEEMED_DAY_OFFSETS = configChannel.request('get', 'SERVICE_METHOD_DEEMED_DAY_OFFSETS') || {};

    this.SERVICE_DATE_USED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_SERVED');
    this.SERVICE_DATE_USED_DEEMED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_DEEMED_SERVED');
    this.SERVICE_DATE_USED_ACKNOWLEDGED_SERVED = configChannel.request('get', 'SERVICE_DATE_USED_ACKNOWLEDGED_SERVED');
    
    this.validateGroup = ['serviceTypeRegion', 'serviceMethodRegion', 'deliveryDateRegion', 'serviceDateRegion', 'serviceCommentRegion'];
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
      apiMapping: 'is_served'
    });

    const serviceTypeOptions = Formatter.getServiceTypeOptions();
    this.serviceTypeModel = new DropdownModel({
      optionData: serviceTypeOptions,
      labelText: 'Service Type',
      required: true,
      defaultBlank: true,
      value: this.model.get('service_date_used') ? String(this.model.get('service_date_used')) : null,
      apiMapping: 'service_date_used',
    });

    this.serviceMethodModel = new DropdownModel({
      optionData: Formatter.getServiceDeliveryMethods(),
      labelText: 'Service Method',
      required: true,
      defaultBlank: true,
      value: this.model.get('service_method') ? String(this.model.get('service_method')) : null,
      apiMapping: 'service_method',
    });
    
    this.deliveryDateModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      labelText: 'Delivered',
      errorMessage: 'Enter date',
      value: this.model.get('received_date') ? Moment(this.model.get('received_date')).format(InputModel.getDateFormat()) : null,
      apiMapping: 'received_date'
    });

    this.serviceDateModel = new InputModel({
      inputType: 'date',
      showYearDate: true,
      labelText: 'Served',
      errorMessage: 'Enter date',
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

    this.serviceCommentModel = new InputModel({
      value: this.model.get('service_comment'),
      labelText: 'Service Comment',
      minLength: configChannel.request('get', 'SERVICE_COMMENT_MIN_LENGTH'),
      maxLength: configChannel.request('get', 'SERVICE_COMMENT_MAX_LENGTH'),
      apiMapping: 'service_comment'
    });

    this.existingFileModels = this.model.getServiceFileModels();

    this.applyServiceTypeRules();
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
      disabled: !enableServiceMethod,
    }, !enableServiceMethod ? { value: null } : {}), { silent: true });

    this.deliveryDateModel.set(Object.assign({
      required: enableDeliveryDate,
      disabled: !enableDeliveryDate
    }, !enableDeliveryDate ? { value: null } : {} ), { silent: true });


    this.serviceDateModel.set(Object.assign({
      required: enableServiceDate,
      disabled: !enableServiceDate
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

  onIsServedChange(model, value) {
    // When setting to "not served", show a modal warning if any API data had been previously saved and now needs to be cleared
    if (value === true || !this.model.hasSavedApiData()) {
      this.model.set({ is_served: value });
      this.render();
      return;
    }

    const saveAsUnservedFn = () => {
      this.model.saveAsUnserved({ is_served: value }).always(() => {
        this.render();
        loaderChannel.trigger('page:load:complete');
      });
    };


    let saveOccurred = false;
    const fileDescription = this.model.getServiceFileDescription();
    const hideReason = !this.existingFileModels.length;
    const modalView = new ModalMarkAsDeficientView({
      model: fileDescription,
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
      clickMarkDeficientFn: !this.existingFileModels.length ? () => {
        saveOccurred = true;
        modalView.close();
        saveAsUnservedFn();
      }: null
    });

    this.listenTo(modalView, 'removed:modal', () => {
      // Check if save was clicked or not
      if (fileDescription && fileDescription.get('is_deficient')) {
        saveAsUnservedFn();
      } else if (!saveOccurred) {
        this.servedIconsModel.set({ value: true });
        this.render();
        loaderChannel.trigger('page:load:complete');
      }
    });

    modalChannel.request('add', modalView);
  },

  validateAndShowErrors() {
    let isValid = true;

    if (this.model.isServed()) {
      this.validateGroup.forEach(region => {
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

  onBeforeRender() {
    // Always get an updated version of existing file models on-render
    this.existingFileModels = this.model.getServiceFileModels();
  },

  onRender() {
    const state = this.mode === 'service-edit' ? 'edit' : 'view';

    this.showChildView('servedIconsRegion', new RadioIconView({ deselectEnabled: true, model: this.servedIconsModel }));

    if (this.model.get('is_served') !== null) {
      this.showChildView('serviceCommentRegion', new EditableComponentView({
        state,
        label: 'Comment',
        view_value: this.model.get('is_served') === false && !this.model.get('service_comment') ? null :
            (this.model.get('service_comment') || '-'),
        subView: new InputView({
          model: this.serviceCommentModel
        })
      }));
    }
   
    if (!this.model.get('is_served')) {
      return;
    }

    this.showChildView('serviceTypeRegion', new EditableComponentView({
      state,
      label: 'Service Type',
      view_value: this.model.get('service_date_used') ? this.serviceTypeModel.getSelectedText() : '-',
      subView: new DropdownView({
        model: this.serviceTypeModel
      })
    }));
    
    this.showChildView('serviceMethodRegion', new EditableComponentView({
      state,
      label: 'Method',
      view_value: this.model.isServed() ? Formatter.toNoticeMethodDisplay(this.model.get('service_method')) : '-',
      subView: new DropdownView({
        model: this.serviceMethodModel
      })
    }));

    this.showChildView('deliveryDateRegion', new EditableComponentView({
      state,
      label: 'Delivered',
      view_value: this.model.get('received_date') ? Formatter.toDateDisplay(this.model.get('received_date')) : null,
      subView: new InputView({
        model: this.deliveryDateModel
      })
    }));

    this.showChildView('serviceDateRegion', new EditableComponentView({
      state,
      label: 'Served',
      view_value: this.model.get('service_date') ? Formatter.toDateDisplay(this.model.get('service_date')) : null,
      subView: new InputView({
        model: this.serviceDateModel
      })
    }));
  },

  templateContext() {
    const participantModel = participantChannel.request('get:participant', this.model.get('participant_id'));
    return {
      Formatter,
      name: participantModel ? `${this.matchingUnit ? `${this.matchingUnit.getUnitNumDisplayShort()}: ` : ''}${participantModel.getDisplayName()}` : '-',
      hasSubService: participantModel && participantModel.hasSubstitutedService(),
      uploadedFiles: this.existingFileModels,
      subServiceIconClass: this.getSubServrequestStatusImgClass(),
      modifiedDateText: `Modified ${Formatter.toDateDisplay(this.model.get('modified_date'))}`,
      modifiedByText: `${Formatter.toUserDisplay(this.model.get('modified_by'))}`
    };
  }
});

export default DisputeServiceView;