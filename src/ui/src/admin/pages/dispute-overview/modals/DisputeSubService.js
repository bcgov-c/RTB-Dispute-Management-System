import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalMarkAsDeficientView from '../../../../core/components/claim/ModalMarkAsDeficient';
import DisputeClaimEvidenceView from '../../../components/dispute-claim/DisputeClaimEvidence';
import DisputeEvidenceModel from '../../../../core/components/claim/DisputeEvidence_model';
import EditableComponentView from '../../../../core/components/editable-component/EditableComponent';
import DropdownModel from '../../../../core/components/dropdown/Dropdown_model';
import DropdownView from '../../../../core/components/dropdown/Dropdown';
import TextareaModel from '../../../../core/components/textarea/Textarea_model';
import TextareaView from '../../../../core/components/textarea/Textarea';
import InputModel from '../../../../core/components/input/Input_model';
import InputView from '../../../../core/components/input/Input';
import template from './DisputeSubService_template.tpl';
import { generalErrorFactory } from '../../../../core/components/api/ApiLayer';

const modalChannel = Radio.channel('modals');
const filesChannel = Radio.channel('files');
const sessionChannel = Radio.channel('session');
const configChannel = Radio.channel('config');
const animationChannel = Radio.channel('animations');
const participantsChannel = Radio.channel('participants');
const loaderChannel = Radio.channel('loader');
const Formatter = Radio.channel('formatter').request('get');
const flagsChannel = Radio.channel('flags');
const noticeChannel = Radio.channel('notice');

export default Marionette.View.extend({
  template,
  className: 'edit-sub-service review-information-body',

  ui: {
    requestedDocOtherDescription: '.sub-service-requested-doc-other-description',
    serviceDocType: '.sub-service-doc-type-wrapper',
    serviceDocOther: '.sub-service-doc-other',
    serviceDocLabel: '.sub-service-requested-doc-list',
    serviceDocTypeLabel: '.sub-service-doc-type-list'
  },
  
  regions: {
    // Application edit regions
    applicationByRegion: '.sub-service-application-by',
    serviceToRegion: '.sub-service-service-to',
    requestSourceRegion: '.sub-service-request-source',
    requestedDocRegion: '.sub-service-requested-doc',
    requestedDocOtherDescriptionRegion: '@ui.requestedDocOtherDescription',
    confirmedMethodsWontWorkRegion: '.sub-service-confirmed-methods-wont-work',
    previousDescriptionRegion: '.sub-service-previous-service-description',
    requestDescriptionRegion: '.sub-service-request-description',
    requestJustificationRegion: '.sub-service-request-justification',

    evidenceDisplayRegion: '.sub-service-request-file-description',

    // Outcome edit regions
    requestStatusRegion: '.sub-service-request-stats',
    methodTitleRegion: '.sub-service-method-title',
    serviceDocTypeRegion: '.sub-service-doc-type',
    serviceDocOtherRegion: '@ui.serviceDocOther',
    internalNoteRegion: '.sub-service-internal-note'
  },

  initialize() {
    this.SERVICE_DOC_TYPE_DISPLAY = configChannel.request('get', 'SERVICE_DOC_TYPE_DISPLAY') || {};
    this.SERVICE_DOC_TYPE_OTHER = configChannel.request('get', 'SERVICE_DOC_TYPE_OTHER');
    this.SUB_SERVICE_REQUEST_STATUS_DISPLAY = configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DISPLAY') || {};
    this.SUB_SERVICE_MIN_LENGTH = 10;
    this.SUB_SERVICE_MAX_LENGTH = 255;

    this.subServices = this.model.collection;
    this.serviceByParticipantModel = participantsChannel.request('get:participant', this.model.get('service_by_participant_id'));
    this.requestFileDescriptionModel = filesChannel.request('get:filedescription', this.model.get('request_method_file_desc_id'));
    this.isEditMode = false;
    this.isEditOutcomeMode = false;

    this.originalRequestStatus = this.model.get('request_status');

    this.createSubModels();
    this.setupListeners();

    this.applicationEditGroup = [
      'applicationByRegion',
      'serviceToRegion',
      'requestedDocRegion',
      'requestedDocOtherDescriptionRegion',
      'confirmedMethodsWontWorkRegion',
      'previousDescriptionRegion',
      'requestDescriptionRegion',
      'requestJustificationRegion'
    ];
    this.outcomeEditGroup = [
      'requestStatusRegion',
      'methodTitleRegion',
      'serviceDocOtherRegion',
      'internalNoteRegion',
      'serviceDocTypeRegion'
    ];
  },

  _isOtherRequestDocTypeSelected() {
    return this.requestDocModel.getData({ parse: true }) === this.SERVICE_DOC_TYPE_OTHER;
  },

  _isOtherServiceDocTypeSelected() {
    return this.serviceDocTypeModel.getData({ parse: true }) === this.SERVICE_DOC_TYPE_OTHER;
  },

  createSubModels() {
    const applicationByOptions = !this.serviceByParticipantModel ? [] : participantsChannel.request(`get:${this.serviceByParticipantModel.isApplicant() ? 'applicants' : 'respondents'}`)
      .map(participant => ({ value: String(participant.id), text: participant.getDisplayName() }));
    
    this.applicationByModel = new DropdownModel({
      optionData: applicationByOptions,
      labelText: 'Request by',
      defaultBlank: true,
      required: true,
      value: this.model.get('service_by_participant_id') ? String(this.model.get('service_by_participant_id')) : null,
      apiMapping: 'service_by_participant_id',
    });


    const serviceToOptions = !this.serviceByParticipantModel ? [] : participantsChannel.request(`get:${this.serviceByParticipantModel.isApplicant() ? 'respondents' : 'applicants'}`)
      .map(participant => ({ value: String(participant.id), text: `${participant.isLandlord() ? 'Landlord' : 'Tenant'} - ${participant.getDisplayName()}` }));
    
    this.serviceToModel = new DropdownModel({
      optionData: serviceToOptions,
      labelText: 'Service to',
      defaultBlank: true,
      required: true,
      value: this.model.get('service_to_participant_id') ? String(this.model.get('service_to_participant_id')) : null,
      apiMapping: 'service_to_participant_id'
    });

    const requestSourceOptions = Object.entries(configChannel.request('get', 'REQUEST_SOURCE_DISPLAY')).map( ([value, text]) => ({ value, text }) );
    this.requestSourceModel = new DropdownModel({
      optionData: requestSourceOptions,
      labelText: 'Request source',
      defaultBlank: true,
      required: true,
      value: this.model.get('request_source') ? String(this.model.get('request_source')) : null,
      apiMapping: 'request_source'
    })

    const requestDocOptions = this.getRequestDocOptions()
    this.requestDocModel = new DropdownModel({
      optionData: requestDocOptions,
      labelText: 'Requested document(s)',
      defaultBlank: true,
      required: true,
      value: this.model.get('request_doc_type') ? String(this.model.get('request_doc_type')) : null,
      apiMapping: 'request_doc_type'
    });

    const isRequestDocTypeOther = this._isOtherRequestDocTypeSelected();
    this.requestDocOtherModel = new InputModel({
      labelText: 'Description of requested documents if "other"',
      required: isRequestDocTypeOther,
      value: this.model.get('request_doc_other_description'),
      apiMapping: 'request_doc_other_description',
      minLength: this.SUB_SERVICE_MIN_LENGTH,
      maxLength: this.SUB_SERVICE_MAX_LENGTH
    });

    this.confirmedMethodsWontWorkModel = new TextareaModel({
      labelText: 'Current methods confirmed will not work',
      required: false,
      value: this.model.get('request_additional_info'),
      apiMapping: 'request_additional_info',
      min: this.SUB_SERVICE_MIN_LENGTH,
      max: this.SUB_SERVICE_MAX_LENGTH,
      displayRows: 3
    });

    this.previousServiceDescriptionModel = new TextareaModel({
      labelText: 'Justification that current methods will not work',
      required: false,
      value: this.model.get('failed_method1_description'),
      apiMapping: 'failed_method1_description',
      min: this.SUB_SERVICE_MIN_LENGTH,
      max: this.SUB_SERVICE_MAX_LENGTH,
      displayRows: 3
    });

    this.requestDescriptionModel = new TextareaModel({
      labelText: 'Description of substituted method requested',
      required: false,
      value: this.model.get('requested_method_description'),
      apiMapping: 'requested_method_description',
      min: this.SUB_SERVICE_MIN_LENGTH,
      max: this.SUB_SERVICE_MAX_LENGTH,
      displayRows: 3
    });

    this.requestJustificationModel = new TextareaModel({
      labelText: 'Description of why this method of service will work',
      required: false,
      value: this.model.get('requested_method_justification'),
      apiMapping: 'requested_method_justification',
      min: this.SUB_SERVICE_MIN_LENGTH,
      max: this.SUB_SERVICE_MAX_LENGTH,
      displayRows: 3
    });

    this.requestStatusModel = new DropdownModel({
      optionData: Object.entries(this.SUB_SERVICE_REQUEST_STATUS_DISPLAY).map( ([value, text]) => ({ value, text })),
      labelText: 'Request status',
      defaultBlank: true,
      required: true,
      value: this.model.get('request_status') ? String(this.model.get('request_status')) : null,
      apiMapping: 'request_status'
    });

    this.methodTitleModel = new InputModel({
      labelText: 'Allowed method title',
      required: false,
      value: this.model.get('sub_service_title'),
      apiMapping: 'sub_service_title',
      minLength: this.SUB_SERVICE_MIN_LENGTH,
      maxLength: this.SUB_SERVICE_MAX_LENGTH
    });

    this.serviceDocTypeModel = new DropdownModel({
      optionData: _.clone(requestDocOptions),
      labelText: 'Allowed documents',
      defaultBlank: true,
      required: true,
      value: this.model.get('sub_service_doc_type') ? String(this.model.get('sub_service_doc_type')) :
        (this.model.get('request_doc_type') ? String(this.model.get('request_doc_type')) : null),
      apiMapping: 'sub_service_doc_type'
    });

    const isServiceDocTypeOther = this._isOtherServiceDocTypeSelected();
    this.serviceDocOtherModel = new InputModel({
      labelText: 'Allowed documents description if "other"',
      required: isServiceDocTypeOther,
      value: this.model.get('sub_service_doc_other_description'),
      apiMapping: 'sub_service_doc_other_description',
      minLength: this.SUB_SERVICE_MIN_LENGTH,
      maxLength: this.SUB_SERVICE_MAX_LENGTH
    });

    
    const sub_service_effective_date = this.model.get('sub_service_effective_date');
    this.methodEffectiveDateModel = new InputModel({
      labelText: 'Method effective date',
      inputType: 'date',
      value: sub_service_effective_date ? Moment(sub_service_effective_date).format(InputModel.getDateFormat()) : '-',
      apiMapping: 'sub_service_effective_date'
    });

    const sub_service_expiry_date = this.model.get('sub_service_expiry_date');
    this.methodExpiryDateModel = new InputModel({
      labelText: 'Method expiry date',
      inputType: 'date',
      value: sub_service_expiry_date ? Moment(sub_service_expiry_date).format(InputModel.getDateFormat()) : '-',
      apiMapping: 'sub_service_expiry_date'
    });

    this.internalNoteModel = new TextareaModel({
      labelText: 'Internal note on request',
      value: this.model.get('request_notes'),
      apiMapping: 'request_notes',
      min: this.SUB_SERVICE_MIN_LENGTH,
      max: this.SUB_SERVICE_MAX_LENGTH,
      displayRows: 3
    });

  },

  setupListeners() {
    this.listenTo(this.requestStatusModel, 'change:value', (model, value) => {
      const showServiceDocOther = this._isOtherServiceDocTypeSelected() && Number(this.requestStatusModel.getData()) !== configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED');
      if (Number(value) === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED')) {
        this.getUI('serviceDocType').addClass('hidden');
        this.getUI('serviceDocOther').addClass('hidden');
      } else {
        if (showServiceDocOther) this.getUI('serviceDocOther').removeClass('hidden')
        this.getUI('serviceDocType').removeClass('hidden');
      }
    })

    this.listenTo(this.requestDocModel, 'change:value', (model, value) => {
      const isOtherRequestDocTypeSelected = this._isOtherRequestDocTypeSelected();
      this.showOrHideUIElement('requestedDocOtherDescription', isOtherRequestDocTypeSelected);
      this.requestDocOtherModel.set('required', isOtherRequestDocTypeSelected);

      if (this.isEditMode) {
        this.getUI('serviceDocLabel').removeClass('hidden');
        const quadrant = noticeChannel.request('get:subservices:quadrant:by:documentId', Number(value));
        this.getUI('serviceDocLabel').text(quadrant ? `${quadrant.displayedDocumentList.join(", ")}` : '');
      } else {
        this.getUI('serviceDocLabel').addClass('hidden');
      }
    });

    this.listenTo(this.serviceDocTypeModel, 'change:value', (model, value) => {
      const showServiceDocOther = this._isOtherServiceDocTypeSelected() && Number(this.requestStatusModel.getData()) !== configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED');
      this.showOrHideUIElement('serviceDocOther', showServiceDocOther);
      this.serviceDocOtherModel.set('required', showServiceDocOther);

      if (this.isEditOutcomeMode) {
        this.getUI('serviceDocTypeLabel').removeClass('hidden');
        const quadrant = noticeChannel.request('get:subservices:quadrant:by:documentId', Number(value));
        this.getUI('serviceDocTypeLabel').text(quadrant ? `${quadrant.displayedDocumentList.join(", ")}` : '');
      } else {
        this.getUI('serviceDocTypeLabel').addClass('hidden');
      }
    });
  },

  getRequestDocOptions() {
    const serviceQuadrants = configChannel.request('get', 'quadrants');
    const requestDocOptions = serviceQuadrants.map((quadrant) => {
      return { text: quadrant.documentsName, value: String(quadrant.documentId) }
    })
    const legacyDocOptions = Object.entries(this.SERVICE_DOC_TYPE_DISPLAY).map( ([value, text]) => ({ value, text }) );
    return [...legacyDocOptions, ...requestDocOptions]
  },

  resetModelValues() {
    // Pass
    this.createSubModels();
    this.setupListeners();
    this.model.trigger('cancel');
  },

  _onMenuEdit(regions) {
    this.model.trigger('edit');
    (regions || []).forEach(region => {
      const view = this.getChildView(region);
      if (view) {
        view.toEditable();
      }
    });
  },

  onMenuCancel() {
    this.isEditMode = false;
    this.isEditOutcomeMode = false;
  },

  onMenuEditApplication() {
    this.isEditMode = true;
    this.render();
    this._onMenuEdit(this.applicationEditGroup);
  },

  onMenuEditOutcome() {
    this.isEditOutcomeMode = true;
    this.render();
    this._onMenuEdit(this.outcomeEditGroup);
  },

  _saveInternalDataToModel(regions) {
    (regions || []).forEach(region => {
      const view = this.getChildView(region);
      if (view && view.getModel()) {
        this.model.set( view.getModel().getPageApiDataAttrs(), { silent: true });
      }
    });

    // Always perform this data validation check for other
    if (!this._isOtherRequestDocTypeSelected()) {
      this.model.set('request_doc_other_description', null);
    }

    if (!this._isOtherServiceDocTypeSelected()) {
      this.model.set('sub_service_doc_other_description', null);
    }

    if (this.model.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_APPROVED') && this.originalRequestStatus !== configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_APPROVED')) {
      this.model.set('sub_service_approved_by', sessionChannel.request('get:user:id'));
    }
  },

  _validateRegionsAndShowErrors(regions) {
    let isValid = true;
    (regions || []).forEach(region => {
      const view = this.getChildView(region);
      if (view) {
        isValid = view.validateAndShowErrors() && isValid;
      }
    });
    return isValid;
  },

  _onMenuSaveRegions(regions) {
    if (!this._validateRegionsAndShowErrors(regions)) {
      const visible_error_eles = this.$('.error-block:visible').filter(function() { return $.trim($(this).html()) !== ""; });
      if (visible_error_eles.length > 0) {
        animationChannel.request('queue', $(visible_error_eles[0]) , 'scrollPageTo', { is_page_item: true });
      }
      return;
    }
    this._saveInternalDataToModel(regions);
    this._saveSubService();
  },

  onMenuSaveApplication() {
    this._onMenuSaveRegions(this.applicationEditGroup);
  },

  onMenuSaveOutcome() {
    const isStatusDenied = Number(this.requestStatusModel.getData()) === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED');
    this.serviceDocTypeModel.set({ required: !isStatusDenied });

    const showServiceDocOther = this._isOtherServiceDocTypeSelected() && Number(this.requestStatusModel.getData()) !== configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED');
    this.serviceDocOtherModel.set({ required: showServiceDocOther });

    this._onMenuSaveRegions(this.outcomeEditGroup);
  },

  createAndCloseFlags() {
    const flagList = flagsChannel.request('get');
    const hasExistingSubServiceApprovedFlag = flagList.some(flag => flag.isSubServiceApproved() && flag.isActive() && flag.get('related_object_id') === this.model.id);

    if (this.model.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_APPROVED') && !hasExistingSubServiceApprovedFlag) {
      const flagAttr = { flag_participant_id: this.model.get('service_to_participant_id'), related_object_id: this.model.id }
      const flag = flagsChannel.request('create:subservice:approved', flagAttr);   
      const closeRequestedFlags = flagsChannel.request('close:subservice:requested', this.model.id);

      return Promise.all([flag.save(), closeRequestedFlags]).catch(generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE'));
    } else if (this.model.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED')) {
      return Promise.all([flagsChannel.request('close:subservice:requested', this.model.id)]).catch(generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE'));
    } if (this.model.get('request_status') === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_WITHDRAWN')) {
      return Promise.all([flagsChannel.request('close:subservice:requested', this.model.id)]).catch(generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE'));
    } else return;
  },

  _saveSubService() {
    loaderChannel.trigger('page:load');
    this.model.save(this.model.getApiChangesOnly())
      .then(() => this.createAndCloseFlags())
      .always(() => {
        this.model.trigger('save:complete');
      });
  },

  onMenuDelete() {
    const deleteSubServiceFn = () => {
      const subServiceCollection = this.model.collection;
      Promise.all([
        this.model.destroy(),
        flagsChannel.request('close:subservice:requested', this.model.id).catch(generalErrorFactory.createHandler('DISPUTE.FLAG.SAVE'))
      ]).finally(() => {
        // Trigger save complete on the model so we will update participant states
        subServiceCollection.trigger('save:complete');
      });
    };

    if (!this.requestFileDescriptionModel || this.requestFileDescriptionModel.isNew()) {
      deleteSubServiceFn();
      return;
    }

    const modal = new ModalMarkAsDeficientView({
      topHtml: `<p>Warning: This will delete the substituted service data that was submitted and will move the associated application and files into the deficient documents.  A reason for this removal is required and will be stored with the removed documents for future reference.</p>`,
      bottomHtml: `<p>Are you sure you want to delete this substituted service record and move the associated application and files to deficient documents?  This action cannot be undone.</p>`,
      model: this.requestFileDescriptionModel,
      getRemovalReasonFn: (enteredReason) => `Sub-service documents removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} - ${enteredReason}`,
    });

    this.listenTo(modal, 'save:complete', deleteSubServiceFn);

    modalChannel.request('add', modal);
  },

  showOrHideUIElement(uiElement, toShow) {
    const ele = this.getUI(uiElement);
    if (toShow) {
      ele.removeClass('hidden');
    } else {
      ele.addClass('hidden');
    }
  },

  getRequestedDocViewValue(docType) {
    const serviceQuadrant = noticeChannel.request('get:subservices:quadrant:by:documentId', Number(docType));

    if (docType <= this.SERVICE_DOC_TYPE_OTHER) return this.serviceDocTypeModel.getSelectedText();
    else return `<b>${serviceQuadrant.quadrantName}</b> - <i>${serviceQuadrant.displayedDocumentList.join(", ")}</i>`;
  },
  
  onRender() {
    if (this.requestFileDescriptionModel) {
      this.showChildView('evidenceDisplayRegion', new DisputeClaimEvidenceView({
        model: new DisputeEvidenceModel({
          file_description: this.requestFileDescriptionModel,
        })
      }));
    }

    this._renderApplicationRegions();
    this._renderOutcomeRegions();
    
    const showServiceDocOther = this._isOtherServiceDocTypeSelected() && Number(this.requestStatusModel.getData()) !== configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED');
    this.showOrHideUIElement('serviceDocOther', showServiceDocOther);
  },

  _renderApplicationRegions() {
    this.showChildView('applicationByRegion', new EditableComponentView({
      state: 'view',
      label: this.applicationByModel.get('labelText'),
      view_value: this.model.get('service_by_participant_id') ? this.applicationByModel.getSelectedText() : '-',
      subView: new DropdownView({
        model: this.applicationByModel
      })
    }));

    this.showChildView('serviceToRegion', new EditableComponentView({
      state: 'view',
      label: this.serviceToModel.get('labelText'),
      view_value: this.model.get('service_to_participant_id') ? this.serviceToModel.getSelectedText() : '-',
      subView: new DropdownView({
        model: this.serviceToModel
      })
    }));

    this.showChildView('requestSourceRegion', new EditableComponentView({
      state: 'view',
      label: this.requestSourceModel.get('labelText'),
      view_value: configChannel.request('get', 'REQUEST_SOURCE_DISPLAY')[this.model.get('request_source')],
      subView: new DropdownView({ model: this.requestSourceModel })
    }));

    this.showChildView('requestedDocRegion', new EditableComponentView({
      state: 'view',
      label: this.requestDocModel.get('labelText'),
      view_value: this.model.get('request_doc_type') ? this.getRequestedDocViewValue(this.model.get('request_doc_type')) : '-',
      subView: new DropdownView({
        model: this.requestDocModel
      })
    }));

    this.showChildView('requestedDocOtherDescriptionRegion', new EditableComponentView({
      state: 'view',
      label: this.requestDocOtherModel.get('labelText'),
      view_value: this.model.get('request_doc_other_description') || '-',
      subView: new InputView({
        model: this.requestDocOtherModel
      })
    }));

    this.showChildView('confirmedMethodsWontWorkRegion', new EditableComponentView({
      state: 'view',
      label: this.confirmedMethodsWontWorkModel.get('labelText'),
      view_value: this.model.get('request_additional_info') || '-',
      subView: new TextareaView({
        model: this.confirmedMethodsWontWorkModel
      })
    }));

    this.showChildView('previousDescriptionRegion', new EditableComponentView({
      state: 'view',
      label: this.previousServiceDescriptionModel.get('labelText'),
      view_value: this.model.get('failed_method1_description') || '-',
      subView: new TextareaView({
        model: this.previousServiceDescriptionModel
      })
    }));

    this.showChildView('requestDescriptionRegion', new EditableComponentView({
      state: 'view',
      label: this.requestDescriptionModel.get('labelText'),
      view_value: this.model.get('requested_method_description') || '-',
      subView: new TextareaView({
        model: this.requestDescriptionModel
      })
    }));

    this.showChildView('requestJustificationRegion', new EditableComponentView({
      state: 'view',
      label: this.requestJustificationModel.get('labelText'),
      view_value: this.model.get('requested_method_justification') || '-',
      subView: new TextareaView({
        model: this.requestJustificationModel
      })
    }));
  },

  _renderOutcomeRegions() {
    this.showChildView('requestStatusRegion', new EditableComponentView({
      state: 'view',
      label: this.requestStatusModel.get('labelText'),
      view_value: this.model.get('request_status') ? this.requestStatusModel.getSelectedText() : '-',
      subView: new DropdownView({
        model: this.requestStatusModel
      })
    }));

    this.showChildView('methodTitleRegion', new EditableComponentView({
      state: 'view',
      label: this.methodTitleModel.get('labelText'),
      view_value: this.model.get('sub_service_title') || '-',
      subView: new InputView({
        model: this.methodTitleModel
      })
    }));

    this.showChildView('serviceDocTypeRegion', new EditableComponentView({
      state: 'view',
      label: this.serviceDocTypeModel.get('labelText'),
      view_value: this.model.get('sub_service_doc_type') ? this.getRequestedDocViewValue(this.model.get('sub_service_doc_type')) : '-',
      subView: new DropdownView({
        model: this.serviceDocTypeModel
      })
    }));

    this.showChildView('serviceDocOtherRegion', new EditableComponentView({
      state: 'view',
      label: this.serviceDocOtherModel.get('labelText'),
      view_value: this.model.get('sub_service_doc_other_description') || '-',
      subView: new InputView({
        model: this.serviceDocOtherModel
      })
    }));

    this.showChildView('internalNoteRegion', new EditableComponentView({
      state: 'view',
      label: this.internalNoteModel.get('labelText'),
      view_value: this.model.get('request_notes') || '-',
      subView: new TextareaView({
        model: this.internalNoteModel
      })
    }));
  },

  templateContext() {
    const requestDocType = noticeChannel.request('get:subservices:quadrant:by:documentId', Number(this.model.get('request_doc_type')));
    const docTypeOutcome = this.serviceDocTypeModel.getData() ? noticeChannel.request('get:subservices:quadrant:by:documentId', Number(this.serviceDocTypeModel.getData())) : null;

    return {
      Formatter,
      isRequestOther: this.model.get('request_doc_type') === this.SERVICE_DOC_TYPE_OTHER,
      isServiceOther: this.model.get('sub_service_doc_type') === this.SERVICE_DOC_TYPE_OTHER,
      showFileDescription: this.requestFileDescriptionModel,
      requestDocType: requestDocType ? requestDocType.displayedDocumentList.join(", ") : null,
      docTypeOutcome: docTypeOutcome ? docTypeOutcome.displayedDocumentList.join(", ") : null,
      isEditMode: this.isEditMode,
      isEditOutcomeMode: this.isEditOutcomeMode,
      isRequestStatusDenied: Number(this.requestStatusModel.getData()) === configChannel.request('get', 'SUB_SERVICE_REQUEST_STATUS_DENIED')
    };
  }

});