import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import { isQuickAccessEnabled } from '../../components/quick-access';
import template from './DisputeOverviewHeader_template.tpl';
import Formatter from '../../../core/components/formatter/Formatter';

const taskChannel = Radio.channel('tasks');
const notesChannel = Radio.channel('notes');
const disputeChannel = Radio.channel('dispute');

export default Marionette.View.extend({
  template,
  tagName: 'div',
  className: 'dispute-overview-header',

  ui: {
    notice: '.dispute-overview-header-notice',
    tasks: '.dispute-overview-header-tasks',
    payments: '.dispute-overview-header-payment',
    communication: '.dispute-overview-header-comms',
    hearing: '.dispute-overview-header-hearing',
    history: '.dispute-overview-header-history',
    documents: '.dispute-overview-header-documents',
    completenessCheck: '.header-completeness-icon',
    quickAccess: '.header-quickaccess-icon',
    refresh: '.header-refresh-icon',
    close: '.header-close-icon-lg',
    print: '.header-print-icon'
  },

  triggers: {
    'click @ui.hearing': 'hearing',
    'click @ui.communication': 'communication',
    'click @ui.tasks': 'tasks',
    'click @ui.history': 'history',
    'click @ui.documents': 'documents',
    'click @ui.notice': 'notice',
    'click @ui.payments' : 'payments',
    'click @ui.quickAccess': 'quickAccess',
    'click @ui.refresh': 'refresh',
    'click @ui.close': 'close'
  },

  events: {
    'click @ui.print': 'print',
    'click @ui.completenessCheck': 'completenessCheck',
  },

  completenessCheck() {
    disputeChannel.request('check:completeness');
  },

  print() {
    const dispute = disputeChannel.request('get');
    dispute.checkEditInProgressPromise()
      .then(() => window.print())
      .catch(() => dispute.showEditInProgressModalPromise());
  },

  templateContext() {
    return {
      Formatter,
      lastRefreshTime: this.model.get('refreshTime') || Moment(),
      enableQuickAccess: isQuickAccessEnabled(this.model),
      numOpenDisputeTasks: taskChannel.request('get:by:dispute')?.filter(t => !t.isComplete())?.length,
      numGeneralNotes: notesChannel.request('get:dispute')?.length,
    };
  }
});
