import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import DropdownView from '../../../core/components/dropdown/Dropdown';
import InputView from '../../../core/components/input/Input';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import ModalAddUnitTypeNoticeView from './modals/ModalAddUnitTypeNotice';
import ModalAddNoticeView from './modals/ModalAddNotice';
import ModalAddAmendmentNoticeView from './modals/ModalAddAmendmentNotice';
import ModalAddOtherNoticeView from './modals/ModalAddOtherNotice';
import NoticeServiceView from '../../components/service/NoticeService';
import HearingToolsServiceView from '../../components/service/HearingToolsService';
import ModalMarkAsDeficientView from '../../../core/components/claim/ModalMarkAsDeficient';
import DisputeAmdendmentsView from '../../components/amendments/DisputeAmendments';
import ModalLinkAmendmentsView from './modals/ModalLinkAmendments';
import AmendmentCollection from '../../components/amendments/Amendment_collection';
import template from './DisputeNotice_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import ModalAddNoticeBase from './modals/ModalAddNoticeBase';

const DROPDOWN_CODE_NO = '1';
const DROPDOWN_CODE_YES = '2';

const filesChannel = Radio.channel('files');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const participantsChannel = Radio.channel('participants');
const configChannel = Radio.channel('config');
const userChannel = Radio.channel('users');
const noticeChannel = Radio.channel('notice');
const sessionChannel = Radio.channel('session');
const hearingChannel = Radio.channel('hearings');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');

const DisputeNoticeView = Marionette.View.extend({
  template,
  className: 'review-information-body',

  regions: {
    packageProvided: '.package-provided-dropdown',
    noticeDeliveryMethod: '.notice-delivery-method',
    noticeDeliveryTo: '.notice-delivered-to',
    noticeRTBInitiatedRegion: '.notice-rtb-initiated',
    noticeDeliveryDate: '.notice-delivery-date',
    noticeDeliveryTime: '.notice-delivery-time',
    noticeServiceDisplay: '.notice-respondent-service-display',
    noticeOtherDeliveryDescriptionRegion: '.notice-other-delivery-description',
    noticeServiceHearingTools: '.notice-respondent-service-container-hearing-tools',

    linkedAmendmentsRegion: '.notice-linked-amendments'
  },

  ui: {
    'noticeFilename': '.notice-doc .filename-download',
    'noticeOtherDeliveryDescription': '.notice-other-delivery-description'
  },

  events: {
    'click @ui.noticeFilename': 'clickNoticeFilename'
  },

  clickNoticeFilename(ev) {
    const ele = $(ev.currentTarget);
    const fileId = ele.data('fileId');
    const matchingNoticeFileModel = fileId && _.find(this.noticeFileModels, function(fileModel) { return fileModel.get('file_id') === Number(fileId); });

    if (matchingNoticeFileModel) {
      filesChannel.request('click:filename:preview', ev, matchingNoticeFileModel, { fallback_download: true });
    } else {
      console.log(`[Warning] No matching file id found for ${fileId}`, ev, this.noticeFileModels);
    }
  },

  _checkAndShowHearingWarningModal() {
    if (!this.dispute.isHearingRequired()) {
      return true;
    }

    if (!hearingChannel.request('get:active')) {
      noticeChannel.request('show:missingHearing:modal');
      return false;
    }

    return true;
  },

  withDisputeEditCheck(onCompleteFn) {
    if (this.dispute) {
      this.dispute.checkEditInProgressPromise().then(
        onCompleteFn,
        () => this.dispute.showEditInProgressModalPromise()
      );
    } else {
      onCompleteFn();
    }
  },

  onMenuDownloadAll() {
    const onContinueFn = (modalView) => {
      modalView.close();
      filesChannel.request('download:files', this.model.getNoticeFileModels());
    };

    filesChannel.request('show:download:modal', onContinueFn, { title: 'Download All Notices' });
  },

  onMenuAddAmendmentNotice() {
    this.withDisputeEditCheck(() => this.model.trigger('modal:add:amendment', this.model));
  },

  onMenuLinkAmendments() {
    this.withDisputeEditCheck(() => {
      modalChannel.request('add', new ModalLinkAmendmentsView({
        noticeCreationTypeDisplay: this.noticeCreationTypeDisplay,
        noticeFileModels: this.noticeFileModels,
        model: this.model
      }));
    });
  },

  onMenuRegenerateNotice() {
    this.withDisputeEditCheck(() => {
      const isOtherNotice = this.model.isOtherNotice();
      if ((this.model.isDisputeNotice() || isOtherNotice) && !this._checkAndShowHearingWarningModal()) {
        return;
      }
      const modalClassToUse = this.isAmendment ? ModalAddAmendmentNoticeView :
        isOtherNotice ? ModalAddOtherNoticeView : 
        this.dispute.isUnitType() || this.dispute.isCreatedRentIncrease() ? ModalAddUnitTypeNoticeView : ModalAddNoticeView;
      
      modalChannel.request('add', new modalClassToUse({
        model: this.model,
        isRegenerationMode: true
      }), { duration: 0, duration2: 400 });
    });
  },

  _deleteNotice() {
    const noticeCollection = this.model.collection || { trigger: () => {} };
    const noticeFileDescription = this.model.getNoticeFileDescription();

    const onMarkDeficientCompleteFn = () => {
      const onCompleteFn = () => {
        noticeCollection.trigger('refresh:notice:container');
        loaderChannel.trigger('page:load:complete');
      }

      this.model.fullDelete()
        .done(() => {
          noticeChannel.request('update:dispute:notice')
          .done(onCompleteFn)
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.DISPUTE.SAVE', onCompleteFn);
            handler(err);
          });
        })
        .fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.NOTICE.REMOVE', onCompleteFn);
          handler(err);
        });
    };
    
    if (!noticeFileDescription) {
      console.log(`[Info] No file description added which needs to be marked as deficient`);
      onMarkDeficientCompleteFn();
    } else {
      const nounToUse = this.isAmendment ? 'amendment' : 'notice';
      const modalView = new ModalMarkAsDeficientView({
        topHtml: `<p>Warning: This action will delete the ${nounToUse} record and data.  Any associated ${nounToUse} files will be moved to deficient documents.  A reason for this removal is required and will be stored with the removed file(s) for future reference.</p>`,
        bottomHtml: `<p>Are you sure you want to delete this ${nounToUse} record and move the file(s) to deficient documents?<br/>This action cannot be undone.</p>`,
        model: noticeFileDescription,
        getRemovalReasonFn: (enteredReason) => `Notice record removed by ${sessionChannel.request('name')} on ${Formatter.toDateDisplay(Moment())} - ${enteredReason}`,
      });
      this.listenTo(modalView, 'save:complete', onMarkDeficientCompleteFn);
      modalChannel.request('add', modalView);
    }
  },

  // Note: Underlying file descriptions will not be deleted, but will be marked as deficient instead
  onMenuDelete() {
    this.withDisputeEditCheck(() => this._deleteNotice());
  },

  onMenuEdit() {
    // This event will be fired, but will not be handled using editable components
  },

  onMenuSave() {
    if (!this.validateAndShowErrors()) {
      return;
    }

    const apiChanges = this.getPackageProvidedApiChanges();
    this.model.set(apiChanges);
    this.saveNotice();
  },

  onMenuCancel() {
    const wasPackageProvided = this.model.get('notice_delivered_to');
    this.packageProvidedModel.set({ value: wasPackageProvided ? DROPDOWN_CODE_YES : DROPDOWN_CODE_NO });
  },

  resetModelValues() {
    this.resetPackageProvidedUiModels();
  },

  validateAndShowErrors() {
    let isValid = true;
    if (this.packageProvidedModel.getData() === DROPDOWN_CODE_YES) {
      _.each(this.editGroup, function(component_name) {
        const component = this.getChildView(component_name);
        if (component.isActive()) {
          isValid = component.validateAndShowErrors() && isValid;
        }
      }, this);
    }
    return isValid;
  },

  saveNotice() {
    const noticeCollection = this.model.collection || { trigger: () => {} };
    const onSaveCompleteFn = () => {
      this.model.resetModel();
      noticeCollection.trigger('refresh:notice:container');
      loaderChannel.trigger('page:load:complete');
    };

    loaderChannel.trigger('page:load');
    // Now save the notice model
    this.model.save(this.model.getApiChangesOnly())
      .done(() => {
        noticeChannel.request('update:dispute:notice')
          .done(onSaveCompleteFn)
          .fail(err => {
            loaderChannel.trigger('page:load:complete');
            const handler = generalErrorFactory.createHandler('ADMIN.DISPUTE.SAVE', onSaveCompleteFn);
            handler(err);
          });
      })
      .fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.NOTICE.SAVE', onSaveCompleteFn);
        handler(err);
      });
  },


  initialize(options) {
    this.mergeOptions(options, ['amendmentCollection', 'unitCollection']);

    noticeChannel.request('update:notice:service', this.model);
    this.NOTICE_FILES_MAX = configChannel.request('get', 'NOTICE_FILES_MAX');
    this.isAmendment = this.model.isAmendmentNotice();
    this.dispute = disputeChannel.request('get');
    this.reinitialize();
  },

  reinitialize() {
    this.createSubModels();
    this.createEditGroups();
    this.setupListeners();
  },

  createSubModels() {
    const NOTICE_CREATION_TYPES_DISPLAY = configChannel.request('get', 'NOTICE_CREATION_TYPES_DISPLAY');
    this.noticeCreationTypeDisplay = NOTICE_CREATION_TYPES_DISPLAY[this.model.get('notice_type')]

    this.linkedAmendmentModels = this.amendmentCollection.filter( (amendment) => amendment.get('notice_id') === this.model.get('notice_id'), this);

    this.noticeFileModels = this.model.getNoticeFileModels();
    
    this.createPackageProvidedUiModels();
  },

  setupListeners() {
    this.setupPackageProvidedUiModelListeners();
  },

  createEditGroups() {
    this.editGroup = ['noticeDeliveryMethod', 'noticeDeliveryTo', 'noticeDeliveryDate', 'noticeDeliveryTime'];
  },

  onRender() {
    this.showChildView('noticeDeliveryMethod', new DropdownView({ model: this.noticeDeliveryModel }));
    this.showChildView('noticeDeliveryTo', new DropdownView({ model: this.noticeDeliveryTo }));
    this.showChildView('noticeRTBInitiatedRegion', new CheckboxView({ model: this.servedByRTBModel }));
    this.showChildView('noticeDeliveryDate', new InputView({ model: this.deliveryDateModel }));
    this.showChildView('noticeDeliveryTime', new InputView({ model: this.deliveryTimeModel }));
    this.showChildView('packageProvided', new DropdownView({ model: this.packageProvidedModel }));
    this.showChildView('noticeOtherDeliveryDescriptionRegion', new InputView({ model: this.noticeOtherDeliveryDescriptionModel }));

    const linkedAmendments = new AmendmentCollection(this.linkedAmendmentModels)
    this.showChildView('linkedAmendmentsRegion', new DisputeAmdendmentsView({
      titleDisplay: `Associated Amendments <span class="">(${linkedAmendments.length || 0})</span>`, 
      collection: linkedAmendments
    }));
    
    this.renderServiceRegions();
  },

  renderServiceRegions() {
    this.showChildView('noticeServiceDisplay', new Marionette.CollectionView({
      childViewOptions: (child) => {
        const matchingUnit = this.unitCollection && this.unitCollection.find(unit => unit.hasParticipantId( child.get('participant_id')))
        return {
          mode: 'service-view',
          matchingUnit
        };
      },
      childView: NoticeServiceView,
      collection: this.model.getServices()
    }));

    this.showChildView('noticeServiceHearingTools', new HearingToolsServiceView({
      model: this.model,
      unitCollection: this.unitCollection,
      childView: NoticeServiceView,
      resetServicesFn() { noticeChannel.request('update:notice:service', this.model); }
    }));
  },

  templateContext() {
    const NOTICE_METHOD_DISPLAY = configChannel.request('get', 'NOTICE_DELIVERY_TYPES_DISPLAY');
    const hearingModel = hearingChannel.request('get:hearing', this.model.get('hearing_id'));
    const firstUploadedFile = !_.isEmpty(this.noticeFileModels) && this.noticeFileModels[0];
    const isUploaded = !!firstUploadedFile;
    const noticeDeliveredDate = this.model.get('notice_delivered_date');
    const providedByDateToUse = noticeDeliveredDate ? noticeDeliveredDate :
      firstUploadedFile ? (isUploaded ? firstUploadedFile.get('file_date') : firstUploadedFile.get('created_date')) :
      this.model.get('created_date');

    const isMigrated = this.dispute && this.dispute.isMigrated();
    const isOtherNoticeDelivery = this.model.get('notice_delivery_method') === configChannel.request('get', 'NOTICE_DELIVERY_TYPE_OTHER');
    return {
      Formatter,
      isUploaded,
      providedByName: userChannel.request('get:user:name', this.model.get('created_by')),
      isAmendment: this.isAmendment,
      hasLinkedAmendments: this.linkedAmendmentModels.length,
      providedByDateDisplay: isMigrated ? Formatter.toDateDisplay(this.model.get('created_date')) :
        (noticeDeliveredDate || (firstUploadedFile && isUploaded)) ?
        Formatter.toDateDisplay(providedByDateToUse) :
        Formatter.toDateAndTimeDisplay(providedByDateToUse),
      noticeFileModels: this.noticeFileModels,
      
      deliveredToDisplay: this.model.isServedByRTB() ? `All participants by RTB on behalf of ${participantsChannel.request('get:participant:name', this.model.get('notice_delivered_to')) || '-'}` 
        : participantsChannel.request('get:participant:name', this.model.get('notice_delivered_to')) || '-',
      deliveredDate: noticeDeliveredDate,
      noticeMethodDisplay: isOtherNoticeDelivery ? `Other Method - ${this.noticeOtherDeliveryDescriptionModel.getData()}` : NOTICE_METHOD_DISPLAY[this.model.get('notice_delivery_method')],
      hearingDate: hearingModel ? hearingModel.get('local_start_datetime') : null,
      noticeCreationTypeDisplay: this.noticeCreationTypeDisplay,
      showNoticeOtherDelivery: isOtherNoticeDelivery
    };
  }

});

_.extend(DisputeNoticeView.prototype, ModalAddNoticeBase);
export default DisputeNoticeView;
