import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ContextContainer from '../../components/context-container/ContextContainer';
import DisputeStatusModel from '../../../core/components/dispute/DisputeStatus_model';
import DisputeStatusView from '../../components/status/DisputeStatus';
import HistoryListView from './HistoryList';
import template from './ProcessGroup_template.tpl';
import SessionCollapse from '../../components/session-settings/SessionCollapseHandler';

const APP_IN_PROGRESS_STAGE_CODE = 0;
const APP_SCREENING_STAGE_CODE = 2;
const SERVING_DOCUMENTS_STAGE_CODE = 4;
const HEARING_PENDING_STAGE_CODE = 6;
const HEARING_STAGE_CODE = 8;
const DECISION_AND_POST_SUPPORT_STAGE_CODE = 10;

const Formatter = Radio.channel('formatter').request('get');

export default Marionette.View.extend({
  template,
  className: 'process-group-item',

  regions: {
    statusListRegion: '.status-list-container',
    statusEditRegion: '.history-status-edit-container',
    processGroupDetailRegion: '.process-group-detail-container'
  },

  calcAllStagesDuration() {
    return this.statusCollection.reduce((memo, model) => memo + model.get('duration_seconds'), 0);
  },

  calcStageDuration(stage) {
    return this.statusCollection.reduce((memo, model) => memo + (model.get('dispute_stage') === stage ? model.get('duration_seconds') : 0), 0);
  },

  calcTimeSinceLastChange() {
    let latest_stage_date_iso = null;

    if (this.statusCollection.at(0) && this.statusCollection.at(0).get('status_start_date')) {
      latest_stage_date_iso = this.statusCollection.at(0).get('status_start_date');
    }

    const stage_date = new Date(latest_stage_date_iso);
    const today_date = new Date();

    let timeDiff = today_date.getTime() - stage_date.getTime();
    timeDiff /= 1000; // convert miliseconds to seconds
    return Formatter.toDurationFromSecs(timeDiff);
  },

  initialize() {
    this.statusCollection = this.model.get('statusCollection');
    this.currentStatus = this.model.get('disputeModel').get('status');
    this.isCurrentProcess = this.model.get('isCurrentProcess');
    this.statusModel = new DisputeStatusModel(this.currentStatus);
    const DEFAULT_BLANK_VALUE = '-';
    this.timeSinceLastChange = this.calcTimeSinceLastChange() || DEFAULT_BLANK_VALUE;
    this.totalDuration = Formatter.toDurationFromSecs(this.calcAllStagesDuration()) || DEFAULT_BLANK_VALUE;
    this.appInProgressDuration = Formatter.toDurationFromSecs(this.calcStageDuration(APP_IN_PROGRESS_STAGE_CODE)) || DEFAULT_BLANK_VALUE;
    this.appScreeningDuration = Formatter.toDurationFromSecs(this.calcStageDuration(APP_SCREENING_STAGE_CODE)) || DEFAULT_BLANK_VALUE;
    this.servingDocumentsDuration = Formatter.toDurationFromSecs(this.calcStageDuration(SERVING_DOCUMENTS_STAGE_CODE)) || DEFAULT_BLANK_VALUE;
    this.hearingPendingDuration = Formatter.toDurationFromSecs(this.calcStageDuration(HEARING_PENDING_STAGE_CODE)) || DEFAULT_BLANK_VALUE;
    this.hearingDuration = Formatter.toDurationFromSecs(this.calcStageDuration(HEARING_STAGE_CODE)) || DEFAULT_BLANK_VALUE;
    this.decisionAndPostSupportDuration = Formatter.toDurationFromSecs(this.calcStageDuration(DECISION_AND_POST_SUPPORT_STAGE_CODE)) || DEFAULT_BLANK_VALUE;

    this.collapseHandler = SessionCollapse.createHandler(this.model.get('disputeModel'), 'History', 'processGroups', this.statusCollection?.at(0)?.id);
    this.isCollapsed = this.collapseHandler?.get();

    this.listenTo(this.collapseHandler, 'change:isCollapsed', (m, value) => {
      this.isCollapsed = value;
      this.render();
    });
  },

  onRender() {
    this.showChildView('statusEditRegion', ContextContainer.withContextMenu({
      wrappedView: new DisputeStatusView({ model: this.model.get('disputeModel') }),
      titleDisplay: `${this.isCurrentProcess ? 'Current' : 'Previous'} Status`,
      menu_title: this.isCurrentProcess ? `Latest Status ID ${this.statusModel.id}` : ' ',
      menu_model: !_.isEmpty(this.currentStatus) ? this.statusModel : null,
      menu_states: this.isCurrentProcess ? {
        default: [{name: 'Change Status', event: 'edit'}],
        edit: [{name: 'Save', event: 'save'}, {name: 'Cancel', event: 'cancel'}]
      } : null,
      menu_events: {
        edit: {
          view_mode: 'status-edit',
          next: 'edit',
          isEdit: true
        },
        cancel: {
          reset: true
        }
      },
      contextRender: () => this.render(),
      disputeModel: this.model.get('disputeModel'),
      collapseHandler: this.collapseHandler,
    }));

    if (!this.isCollapsed) {
      this.showChildView('statusListRegion', new HistoryListView({ collection: this.statusCollection }));
    }
  },

  templateContext() {

    return {
      totalDuration: this.totalDuration,
      timeSinceLastChange: this.timeSinceLastChange,
      appInProgressDuration: this.appInProgressDuration,
      appScreeningDuration: this.appScreeningDuration,
      servingDocumentsDuration: this.servingDocumentsDuration,
      hearingPendingDuration: this.hearingPendingDuration,
      hearingDuration: this.hearingDuration,
      decisionAndPostSupportDuration: this.decisionAndPostSupportDuration,
      enableCollapse: !!this.collapseHandler,
      isCollapsed: this.isCollapsed,
    };
  }
});