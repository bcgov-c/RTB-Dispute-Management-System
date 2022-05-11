import Backbone from 'backbone';
import Radio from 'backbone.radio';
import PageView from '../../../core/components/page/Page';
import HearingCollectionView from '../../components/hearing/Hearings';
import CheckboxModel from '../../../core/components/checkbox/Checkbox_model';
import CheckboxView from '../../../core/components/checkbox/Checkbox';
import ModalAddHearingView from '../../components/hearing/modals/modal-add-hearing/ModalAddHearing';
import PrintHeaderTemplate from '../../../core/components/receipt-container/PrintHeaderTemplate.tpl'
import TrialLogic_BIGEvidence from '../../../core/components/trials/BIGEvidence/TrialLogic_BIGEvidence';
import FileBlockDisplay from '../common-files/FileBlockDisplay';
import FileCollection from '../../../core/components/files/File_collection';
import { DisputeFlags } from '../../components/dispute-flags/DisputeFlags';
import { showQuickAccessModalWithEditCheck, isQuickAccessEnabled } from '../../components/quick-access';
import { routeParse } from '../../routers/mainview_router';
import { generalErrorFactory } from '../../../core/components/api/ApiLayer';
import template from './HearingPage_template.tpl';

const participantsChannel = Radio.channel('participants');
const hearingChannel = Radio.channel('hearings');
const loaderChannel = Radio.channel('loader');
const modalChannel = Radio.channel('modals');
const sessionChannel = Radio.channel('session');
const menuChannel = Radio.channel('menu');
const configChannel = Radio.channel('config');
const Formatter = Radio.channel('formatter').request('get');
const disputeChannel = Radio.channel('dispute');
const filesChannel = Radio.channel('files');

let UAT_TOGGLING = {};

const HEARING_TOOLS_CLASS = 'hearing-tools-enabled';
export default PageView.extend({
  template,
  className: `${PageView.prototype.className} hearing-page`,

  ui: {
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    print: '.header-print-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon',
    hearings: '#hearings-list',
    addHearing: '.add-hearing-btn-container',
    goToNotice: '.goto-notice-btn-container',
    goToScheduleHistory: '.goto-schedule-history-btn-container',
    printHeader: '.print-header'
  },

  regions: {
    disputeFlags: '.dispute-flags',
    hearingsRegion: '@ui.hearings',
    showHearingToolsRegion: '.dispute-overview-claims-hearing-tools',
    unlinkedRecordingsRegion: '.hearing-unlinked-recording-files'
  },

  events: {
    'click @ui.completenessCheck': 'completenessCheck',
    'click @ui.quickAccess': 'clickQuickAccess',
    'click @ui.print': 'clickPrint',
    'click @ui.refresh': 'clickRefresh',
    'click @ui.addHearing': 'clickAddHearing',
    'click @ui.goToNotice': 'clickGoToNotice',
    'click @ui.goToScheduleHistory': 'clickGoToScheduleHistoryDispute',
    'click @ui.close': 'clickClose'
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  clickQuickAccess() {
    showQuickAccessModalWithEditCheck(this.model);
  },

  clickPrint() {
    const dispute = disputeChannel.request('get');
    dispute.checkEditInProgressPromise()
      .then(() => window.print())
      .catch(() => dispute.showEditInProgressModalPromise());
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

  clickGoToNotice() {
    Backbone.history.navigate(routeParse('notice_item', this.model.get('dispute_guid')), { trigger: true });
  },

  clickGoToScheduleHistoryDispute() {
    Backbone.history.navigate(routeParse('scheduled_hearings_history_dispute_param_item', null, this.model.get('file_number')), { trigger: true });
  },

  clickAddHearing() {
    const active_hearing = hearingChannel.request('get:active');
    if (active_hearing) {
      this.showModalHearingAlreadyActive();
      return;
    }

    const modalAddHearing = new ModalAddHearingView({ model: this.model, collection: this.hearings });
    this.stopListening(this.model, 'hearings:refresh');
    this.listenTo(this.model, 'hearings:refresh', function() {
      modalChannel.request('remove', modalAddHearing);
      this.clearEditModeAndRefresh();
    }, this);
    modalChannel.request('add', modalAddHearing, { duration: 350, duration2: 300 });
  },

  clickClose() {
    menuChannel.trigger('close:active');
    Backbone.history.navigate(routeParse('overview_item', this.model.get('dispute_guid')), {trigger: true});
  },


  showModalHearingAlreadyActive() {
    modalChannel.request('show:standard', {
      title: 'Active Hearing Exists',
      bodyHtml: '<p>A dispute can only have one active hearing. To add a new hearing, unassign the current active hearing and then add the new hearing.</p>',
      primaryButtonText: 'Close',
      hideCancelButton: true,
      onContinueFn: _.bind(function(modalView) {
        modalView.close();
      }, this)
    });
  },
  
  setHearingRecordings() {
    const disputeFiles = filesChannel.request('get:files');
    const hearings = hearingChannel.request('get');
    
    disputeFiles.forEach(fileModel => {
      if (fileModel.get('file_type') !== configChannel.request('get', 'FILE_TYPE_RECORDED_HEARING')) return;

      const partialFileName = fileModel.get('file_name')?.substr(0, fileModel.get('file_name')?.indexOf('_')) || '';
      const isLinkedRecording = hearings.findWhere({ hearing_id: Number(partialFileName) });

      if (isLinkedRecording) {
        this.linkedRecordings.add(fileModel);
      } else {
        this.unlinkedRecordings.add(fileModel);
      }
    })
  },

  initialize() {
    UAT_TOGGLING = configChannel.request('get', 'UAT_TOGGLING') || {};
    this.unlinkedRecordings = new FileCollection();
    this.linkedRecordings = new FileCollection();
    this.unitCollection = participantsChannel.request('get:dispute:units');
    this.setHearingRecordings();

    this.hearingToolsModel = new CheckboxModel({
      html: 'Show hearing tools',
      disabled: false,
      checked: this.model.get('sessionSettings')?.hearingToolsEnabled && !this.model.isMigrated()
    });

    this.listenTo(this.hearingToolsModel, 'change:checked', (checkboxModel, value) => {
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
    });

    this.loadPageData();
  },

  loadPageData() {
    this.model.stopEditInProgress();

    this.hearings_loaded = false;
    hearingChannel.request('load:conferencebridges')
      .done(() => {
        this.hearings_loaded = true;
        this.clearListeners();
        this.hearings = hearingChannel.request('get');
        this.setupListeners();
        this.render();
      })
      .fail(generalErrorFactory.createHandler('DISPUTE.LOAD.CORE', () => this.render()))
      .always(() => loaderChannel.trigger('page:load:complete'));
  },

  clearEditModeAndRefresh() {
    this.model.stopEditInProgress();
    this.clickRefresh();
  },

  clearListeners() {
    this.stopListening(this.hearings, 'hearings:refresh', this.clearEditModeAndRefresh);
    this.stopListening(this.hearings, 'collision', this.clearEditModeAndRefresh);
  },

  setupListeners() {
    this.listenTo(this.hearings, 'hearings:refresh', this.clearEditModeAndRefresh, this);
    this.listenTo(this.hearings, 'collision', this.clearEditModeAndRefresh, this);
  },

  showHearingTools() {
    this.getUI('hearings').addClass(HEARING_TOOLS_CLASS);
  },

  hideHearingTools() {
    const hearingsListView = this.getChildView('hearingsRegion');
    if (hearingsListView && hearingsListView.isRendered()) {
      loaderChannel.trigger('page:load');
      hearingsListView.renderHearingToolsRegions();
      this.getUI('hearings').removeClass(HEARING_TOOLS_CLASS);
      loaderChannel.trigger('page:load:complete');
    } else {
      this.getUI('hearings').removeClass(HEARING_TOOLS_CLASS);
    }
  },

  onRender() {
    if (!this.hearings_loaded) {
      return;
    }

    this.getUI('printHeader').html(PrintHeaderTemplate({
      printTitle: `File Number ${this.model.get('file_number')}: Hearing Page`
    }));

    this.showChildView('disputeFlags', new DisputeFlags());
    this.showChildView('showHearingToolsRegion', new CheckboxView({ model: this.hearingToolsModel }));
    this.showChildView('hearingsRegion', new HearingCollectionView({ collection: this.hearings, unitCollection: this.unitCollection, hearingRecordings: this.linkedRecordings }));
    if (this.unlinkedRecordings.length) this.showChildView('unlinkedRecordingsRegion', new FileBlockDisplay({ collection: this.unlinkedRecordings }));

    if (this.model.get('sessionSettings')?.hearingToolsEnabled) {
      this.showHearingTools();
    }
    loaderChannel.trigger('page:load:complete');
  },

  templateContext() {
    const dispute = this.model;
    return {
      Formatter,
      isLoaded: this.hearings_loaded,
      showHearingTools: UAT_TOGGLING.SHOW_ARB_TOOLS && !dispute.isMigrated(),
      isSchedulerUser: sessionChannel.request('is:scheduler'),
      lastRefreshTime: Moment(),
      enableQuickAccess: isQuickAccessEnabled(this.model),
      parentApplicationFileNumber: dispute.get('cross_app_file_number'),
      parentApplicationFileGuid: dispute.get('cross_app_dispute_guid'),
      hasUnlinkedRecordings: this.unlinkedRecordings.length
    };
  }

});
