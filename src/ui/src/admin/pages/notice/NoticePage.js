import Marionette from 'backbone.marionette';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import NoticeContainerView from './NoticeContainer';
import DisputeAmendmentsView from '../../components/amendments/DisputeAmendments';
import AriNoticePreviewView from '../../components/notice/AriNoticePreview';
import PfrNoticePreviewView from '../../components/notice/PfrNoticePreview';
import NoticePreviewView from '../../components/notice/NoticePreview';
import ModalAddNoticeView from './modals/ModalAddNotice';
import ModalAddUnitTypeNoticeView from './modals/ModalAddUnitTypeNotice';
import ModalAddAmendmentNoticeView from './modals/ModalAddAmendmentNotice';
import ModalAddOtherNoticeView from './modals/ModalAddOtherNotice';
import ModalDownloadNoticeView from './modals/ModalDownloadNotice';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import NoticeModel from '../../../core/components/notice/Notice_model';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import AmendmentCollection from '../../components/amendments/Amendment_collection';
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import template from './NoticePage_template.tpl';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import TrialLogic_BIGEvidence from '../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';

import ModalSelectRentIncreaseNotice from './modals/ModalSelectRentIncreaseNotice';
import NoticeAutoActions from '../../../core/components/auto-actions/NoticeAutoActions';
import FileBlockDisplay from '../common-files/FileBlockDisplay';
import File_collection from '../../../core/components/files/File_collection';
import ApplicantRequiredService from '../../../core/components/service/ApplicantRequiredService';

const participantsChannel = Radio.channel('participants');
const filesChannel = Radio.channel('files');
const hearingChannel = Radio.channel('hearings');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');
const menuChannel = Radio.channel('menu');
const noticeChannel = Radio.channel('notice');
const amendmentsChannel = Radio.channel('amendments');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');
const configChannel = Radio.channel('config');
const emailsChannel = Radio.channel('emails');
const statusChannel = Radio.channel('status');
const claimsChannel = Radio.channel('claims');

let UAT_TOGGLING = {};
const HEARING_TOOLS_CLASS = 'hearing-tools-enabled';

export default PageView.extend({
  template,
  className: `${PageView.prototype.className} notice-page`,

  ui: {
    printHeader: '.print-header',
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
    addNotice: '.add-notice-container',
    addOtherNotice: '.add-other-notice-container',
    downloadNotice: '.download-notice-container',
    noticeList: '#notice-list-container',
  },

  regions: {
    disputeFlags: '.dispute-flags',
    showHearingToolsRegion: '.dispute-overview-claims-hearing-tools',
    hearingNotices: '.notice-page__hearing-notices',
    noticeList: '@ui.noticeList',
    amendmentsList: '#amendment-list-container'
  },

  events: {
    'click @ui.completenessCheck': 'completenessCheck',
    'click @ui.quickAccess': 'clickQuickAccess',
    'click @ui.print': 'clickPrint',
    'click @ui.refresh': 'clickRefresh',
    'click @ui.close': 'clickClose',
    'click @ui.addNotice': 'clickAddDisputeNotice',
    'click @ui.addOtherNotice': 'clickAddOtherNotice',
    'click @ui.downloadNotice': 'clickDownloadNotice',
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  clickPrint() {
    const dispute = disputeChannel.request('get');
    dispute.checkEditInProgressPromise()
      .then(() => window.print())
      .catch(() => dispute.showEditInProgressModalPromise());
  },

  clickQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  clickRefresh() {
    const refreshPageFn = () => {
      this.model.triggerPageRefresh();
    };

    this.model.checkEditInProgressPromise().then(
      refreshPageFn,
      () => {
        this.model.showEditInProgressModalPromise(true).then(isAccepted => {
          if (isAccepted) {
            this.model.stopEditInProgress();
            refreshPageFn();
          }
        });
      });
  },


  async clickAddDisputeNotice() {
    if (this.dispute.isHearingRequired() && !this.activeHearing) {
      noticeChannel.request('show:missingHearing:modal');
      return;
    }

    const showArsConfirmationModalSetDeadlines = () => new Promise(res => {
      let withDeadlines = false;
      const onComplete = () => res(withDeadlines);
      if (ApplicantRequiredService.canGenerateNoticeARS(this.dispute, claimsChannel.request('get'), hearingChannel.request('get:latest'), null, this.notices)) {
        const modalView = modalChannel.request('show:standard', {
          title: `Apply ARS Deadlines?`,
          bodyHtml: `<div>
            <p>This file has Applicant Required Service (ARS) deadlines.</p>
            <p>Select "Continue with Deadlines" to generate ARS deadlines.</p>
            <p>Only select "Remove Deadlines" if you confirmed this file should continue without ARS deadlines.</p>
          </div>`,
          primaryButtonText: `Continue With Deadlines`,
          cancelButtonText: `Remove Deadlines`,
          onContinueFn(_modalView) {
            // Enable ARS deadlines only if the user opts-in
            withDeadlines = true;
            _modalView.close();
          }
        });
        this.listenTo(modalView, 'removed:modal', onComplete);
      } else {
        onComplete();
      }
    });
    const showAutoEmailConfirmationModal = (noticeViewOptions) => new Promise(res => {
      const autoActionTemplate = NoticeAutoActions.getAutoActionEmailTemplateId();
      if (autoActionTemplate) {
        NoticeAutoActions.startAutoSendTemplate(autoActionTemplate, noticeViewOptions).then(didComplete => {
          res(didComplete);
        });
      } else {
        res(false);
      }
    });


    const isArsEnabled = await showArsConfirmationModalSetDeadlines();
    const noticeViewOptions = {
      isArsEnabled,
      isPrelim: false,
    };
    const didAutoEmail = await showAutoEmailConfirmationModal(noticeViewOptions);
    if (didAutoEmail) {
      return Backbone.history.loadUrl(Backbone.history.fragment);
    }

    if (this.isDisputeCreatedAriE || this.isDisputeCreatedPFR) {
      const eventDispatcher = new Backbone.Model();
      const noticeTypeDisplay = this.isDisputeCreatedAriE ? 'ARI-E' : this.isDisputeCreatedPFR ? 'PFR': null;
      this._showModalAddNoticeWithEditCheck(ModalSelectRentIncreaseNotice, { parentModel: eventDispatcher, noticeTypeDisplay });
      this.listenTo(eventDispatcher, 'click:continue', (isPrelim) => {
        noticeViewOptions.isPrelim = isPrelim;
        this._showModalAddNoticeWithEditCheck(ModalAddUnitTypeNoticeView, noticeViewOptions);
      });
    } else {
      this._showModalAddNoticeWithEditCheck(this.isDisputeUnitType ? ModalAddUnitTypeNoticeView : ModalAddNoticeView, noticeViewOptions);
    }
  },

  clickAddOtherNotice() {
    if (this.dispute.isHearingRequired() && !this.activeHearing) {
      noticeChannel.request('show:missingHearing:modal');
      return;
    }
  
    this._showModalAddNoticeWithEditCheck(ModalAddOtherNoticeView);
  },

  clickDownloadNotice() {
    if (this.dispute.isHearingRequired() && !this.activeHearing) {
      noticeChannel.request('show:missingHearing:modal');
      return;
    }

    const respondentModels = participantsChannel.request('get:respondents').models;
    const rentIncreaseUnits = participantsChannel.request('get:dispute:units').filter(unit => this.isDisputeCreatedAriC ? unit.hasSavedRentIncreaseData() : unit.get('selected_tenants'));
    const unitParticipants = {};
    if (rentIncreaseUnits.length) {
      rentIncreaseUnits.forEach(unitModel => {
        unitParticipants[unitModel.get('unit_id')] = _.map(unitModel.getParticipantIds(), participantId => participantsChannel.request('get:participant', participantId));
      });
    }

    const noticePreviewOptions = rentIncreaseUnits.length || this.isDisputeCreatedAriE ? {
      templateData: {
        respondents: this.isDisputeCreatedAriE && respondentModels.length ? [respondentModels[0]] : unitParticipants[rentIncreaseUnits[0].get('unit_id')],
        INTAKE_LOGIN_URL: (configChannel.request('get', 'INTAKE_URL') || '').replace('/Intake', '/AdditionalLandlordIntake')
      },
      matchingUnit: rentIncreaseUnits.length ? rentIncreaseUnits[0] : null
    } : {};

    
    let noticePreviewClass = NoticePreviewView;
    if (this.dispute.isCreatedRentIncrease()) noticePreviewClass = AriNoticePreviewView;
    else if (this.isDisputeCreatedPFR) noticePreviewClass = PfrNoticePreviewView;
    
    this._showModalAddNoticeWithEditCheck(ModalDownloadNoticeView, { noticePreviewClass, noticePreviewOptions });
  },

  _showModalAddNotice(modalViewClass, modalViewOptions, noticeModelAttrs) {
    this.newNoticeModel = new NoticeModel(_.extend({}, {
      hearing_type: this.dispute.getProcess(),
    }, noticeModelAttrs));
    this.listenTo(this.newNoticeModel, 'notice:added', this.onNoticeAdded, this);
    this.listenTo(this.newNoticeModel, 'refresh:notice:page', () => {
      this.model.stopEditInProgress();
      this.render();

      loaderChannel.trigger('page:load:complete');
    }, this);

    modalChannel.request('add', new modalViewClass(_.extend({
      isRegenerationMode: false,
      model: this.newNoticeModel
    }, modalViewOptions)), { duration: 0, duration2: 400 });
  },

  _showModalAddNoticeWithEditCheck(modalViewClass, modalViewOptions, noticeModelAttrs) {
    this.model.checkEditInProgressPromise().then(
      () => this._showModalAddNotice(modalViewClass, modalViewOptions, noticeModelAttrs),
      () => this.model.showEditInProgressModalPromise()
    );
  },


  onNoticeAdded() {
    this.notices.add(this.newNoticeModel);
    this.loadFiles();
  },

  noticeRegenerated() {
    this.loadFiles();
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), {trigger: true});
  },

  setupNoticeListeners() {
    this.listenTo(this.notices, 'modal:add:amendment', (model) => this._showModalAddNoticeWithEditCheck(ModalAddAmendmentNoticeView, null, { parent_notice_id: model.get('notice_id'), notice_associated_to: model.get('notice_associated_to') }), this)
    this.listenTo(this.notices, 'notice:regenerated', this.noticeRegenerated, this);
   
    this.listenTo(this.notices, 'refresh:notice:page', () => {
      this.model.stopEditInProgress();
      this.render();
    }, this);
    this.listenTo(this.notices, 'refresh:notice:container', () => {
      this.model.stopEditInProgress();
      this.renderNoticeContainers();
    }, this);
  },

  loadPageData() {
    this.model.stopEditInProgress();
    
    this.notices_loaded = true;
    this.files_loaded = true;
    this.notices = noticeChannel.request('get:all');
    this.setupNoticeListeners();

    this.amendments_loaded = false;
    
    const dispute_guid = disputeChannel.request('get:id');
    Promise.all([
      amendmentsChannel.request('load', dispute_guid),
      emailsChannel.request('load:templates'),
      statusChannel.request('load:status', dispute_guid)
    ]).then(([amendmentCollection]) => {
      loaderChannel.trigger('page:load:complete');
      this.amendments_loaded = true;
      this.amendments = amendmentCollection;
      this.render();
    }, err => {
      loaderChannel.trigger('page:load:complete');
      const handler = generalErrorFactory.createHandler('ADMIN.AMENDMENTS.LOAD', () => {
        this.amendments_loaded = true;
        this.render();
      });
      handler(err);
    });
  },


  loadFiles() {
    this.model.stopEditInProgress();

    this.files_loaded = false;
    loaderChannel.trigger('page:load');
    filesChannel.request('load', disputeChannel.request('get:id'))
      .done(() => {
        this.files_loaded = true;
        this.render();
        loaderChannel.trigger('page:load:complete');
      }).fail(err => {
        loaderChannel.trigger('page:load:complete');
        const handler = generalErrorFactory.createHandler('ADMIN.AUDITLOGS.LOAD', () => {
          this.files_loaded = true;
          this.render();
        });
        handler(err);
      });
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    
    this.notices = null;
    this.unlinkedAmendments = null;
    this.notices_loaded = false;
    this.amendments_loaded = false;
    this.dispute = disputeChannel.request('get');
    this.activeHearing = hearingChannel.request('get:active');
    this.unitCollection = participantsChannel.request('get:dispute:units');

    this.isDisputeCreatedAriC = this.dispute.isCreatedAriC();
    this.isDisputeCreatedAriE = this.dispute.isCreatedAriE();
    this.isDisputeCreatedPFR = this.dispute.isCreatedPfr();
    this.isDisputeUnitType = this.dispute.isUnitType();
    
    console.log(hearingChannel.request('get'))
    console.log(hearingChannel.request('get').map(h => {
      return h.getHearingNoticeFileDescription()
    }));
    this.hearingNoticeFileDescriptions = hearingChannel.request('get')?.map(h => h.getHearingNoticeFileDescription()).filter(h => h);
    
    // Hide any loaders on init, because there is an internal page loader already
    loaderChannel.trigger('page:load:complete');
    this.createSubModels();
    this.setupListeners();
    this.loadPageData();
  },

  createSubModels() {
    this.hearingToolsModel = new CheckboxModel({
      html: 'Show hearing tools',
      disabled: false,
      checked: this.model.get('sessionSettings')?.hearingToolsEnabled && (!this.model.isMigrated() || this.model.isNonParticipatory())
    });
  },

  setupListeners() {
    this.listenTo(this.hearingToolsModel, 'change:checked', function(checkboxModel, value) {
      this.model.checkEditInProgressPromise().then(
        () => {
          if (value) {
            TrialLogic_BIGEvidence.checkAndShowArbWarning(this.model);

            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), hearingToolsEnabled: true } });
            this.showHearingTools();
          } else {
            this.model.set({ sessionSettings: { ...this.model.get('sessionSettings'), hearingToolsEnabled: false } });
            this.hideHearingTools();
          }
        },
        // Cancel the selection
        () => {
          checkboxModel.set('checked', checkboxModel.previous('checked'), { silent: true });
          checkboxModel.trigger('render');
          this.model.showEditInProgressModalPromise()
        }
      );
    }, this);
  },

  showHearingTools() {
    this.getUI('noticeList').addClass(HEARING_TOOLS_CLASS);
  },

  hideHearingTools() {
    const noticeListView = this.getChildView('noticeList');
    if (noticeListView && noticeListView.isRendered()) {
      loaderChannel.trigger('page:load');
      
      setTimeout(() => {
        // Render the entire notice list again because menu rules might have changed
        noticeListView.render();
        this.getUI('noticeList').removeClass(HEARING_TOOLS_CLASS);
        //noticeListView.renderServiceRegions();

        loaderChannel.trigger('page:load:complete');
      }, 150);
    } else {
      this.getUI('noticeList').removeClass(HEARING_TOOLS_CLASS);
    }
  },

  getPrintParticipantSubServices() {
    const participants = participantsChannel.request('get:all:participants');
    const subServiceList = noticeChannel.request('get:subservices');

    const participantsSubServiceText = participants.map(participant => {
      const participantSubService = subServiceList.findWhere({ service_to_participant_id: participant.id});
      if (!participantSubService) return;
      return `${participant.getDisplayName()}: ${participantSubService.getSubServiceTypeText()}<br/>`;
    }).filter(text => text !== undefined)
    
    return participantsSubServiceText?.join("") || '';
  },

  onBeforeRender() {
    if (!this.notices_loaded || !this.amendments_loaded || !this.files_loaded) {
      return;
    }
    
    // Update this variable every render to make sure it's most up-to-date
    // It is used in templateContext and onRender, so make sure it is set before both
    this.unlinkedAmendments = new AmendmentCollection(this.amendments.filter( (model) => !model.get('notice_id')));
  },

  onRender() {
    if (!this.notices_loaded || !this.amendments_loaded || !this.files_loaded) {
      return;
    }
    
    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${this.dispute.get('file_number')}: Notice Page`
    }));
    
    this.showChildView('disputeFlags', new DisputeFlags());

    if (this.hearingNoticeFileDescriptions.length) {
      const hearingNoticeFiles = this.hearingNoticeFileDescriptions.map(fd => fd.getUploadedFiles())?.flat()
      this.showChildView('hearingNotices', new FileBlockDisplay({ collection: new File_collection(hearingNoticeFiles) }));
    }

    if (!this.isDisputeCreatedAriC && !this.isDisputeCreatedAriE && !this.isDisputeUnitType) {
      this.showChildView('amendmentsList', new DisputeAmendmentsView({
        titleDisplay: `Unlinked Amendments&nbsp;<span class="page-section-subtitle">(${this.unlinkedAmendments.length || 0})</span>`,
        collection: this.unlinkedAmendments
      }));
    }

    this.showChildView('showHearingToolsRegion', new CheckboxView({ model: this.hearingToolsModel }));
    if (this.model.get('sessionSettings')?.hearingToolsEnabled) {
      this.showHearingTools();
    }

    this.renderNoticeContainers();
  },

  renderNoticeContainers() {
    const currentNoticeId = (this.notices.getCurrentNotice() || { get: () => null }).get('notice_id');
    this.showChildView('noticeList', new Marionette.CollectionView({
      collection: this.notices,
      childView: NoticeContainerView,
      emptyView: Marionette.View.extend({
        template: _.template(
          `<div class="amendments-title-container-empty page-section-title-container notice-container-title">
            <span class="page-section-title">Current Notice</span>
          </div>
          <div class="standard-list-empty">There are currently no notices on this dispute file</div>
        `)
      }),
      filter: (child) => child.isDisputeNotice() || child.isOtherNotice(),
      childViewOptions: _.bind( (child) => {
        const isCurrentNotice = currentNoticeId && currentNoticeId === child.get('notice_id');
        return {
          containerTitle: `${isCurrentNotice ? 'Current' : ' Previous'} Notice`,
          noticeCollection: this.notices,
          amendmentCollection: this.amendments,
          unitCollection: this.unitCollection
        };
      }, this)
    }));

    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    const isMigrated = this.model.isMigrated();
    const isCreatedAriE = this.dispute.isCreatedAriE();
    const validProcessesForAddStandard = this.isDisputeUnitType || isCreatedAriE ? [1,4,7] : [1,2,4];
    const validProcessesForAddOther = this.isDisputeUnitType || isCreatedAriE ? [1,4,7] : [1,2,4,6];
    const validProcessesForDownload = this.isDisputeUnitType || isCreatedAriE ? [1,4,7] : [1,2,4,6];

    return {
      Formatter,
      unlinkedAmendmentsLength: this.unlinkedAmendments ? this.unlinkedAmendments.length : 0,
      showAddStandardButton: !isMigrated && this.dispute.checkProcess(validProcessesForAddStandard),
      showAddOtherButton: this.dispute.checkProcess(validProcessesForAddOther),
      showDownloadButton: !isMigrated && this.dispute.checkProcess(validProcessesForDownload),
      showHearingTools: UAT_TOGGLING.SHOW_ARB_TOOLS && (!isMigrated || this.model.isNonParticipatory()),
      isLoaded: this.notices_loaded && this.amendments_loaded && this.files_loaded,
      lastRefreshTime: Moment(),
      enableQuickAccess: isQuickAccessEnabled(this.model),
      printParticipantSubServices: this.getPrintParticipantSubServices(),
      showHearingNotices: this.hearingNoticeFileDescriptions.length
    };
  }

});
