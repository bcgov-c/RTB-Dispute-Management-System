import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import template from './ReassignHearingListItem_template.tpl';
import ModalHearingReassignConfirmView from './ModalHearingReassignConfirm';
import { toUserLevelAndNameDisplay } from '../../../user-level/UserLevel';

const userChannel = Radio.channel('users');
const modalChannel = Radio.channel('modals');
const Formatter = Radio.channel('formatter').request('get');
export default Marionette.View.extend({
  template,
  
  className: 'reassignHearing-search-result standard-list-item',

  ui: {
    reassign: '.reassignHearing-search-result-select > div'
  },

  events: {
    'click @ui.reassign': 'clickReassign'
  },

  clickReassign() {
    this.model.trigger('close:modal');
    const confirmationModal = new ModalHearingReassignConfirmView({ model: this.hearingModel, reassignHearingModel: this.model });
    modalChannel.request('add', confirmationModal);
  },

  initialize(options) {
    this.mergeOptions(options, ['hearingModel', 'allAvailableHearings']);
  },

  templateContext() {
    const userModel = userChannel.request('get:user', this.model.get('hearing_owner'));
    const primaryDisputeHearing = this.model.getPrimaryDisputeHearing();
    return {
      Formatter,
      scheduledCount: this.allAvailableHearings.filter((hearing) => hearing.get('hearing_owner') === this.model.get('hearing_owner') && hearing.isAssigned()).length,
      primaryFileNumberDisplay: primaryDisputeHearing ? primaryDisputeHearing.getFileNumber() : null,
      ownerDisplay: toUserLevelAndNameDisplay(userModel, { displaySchedulerType: true, displayUserLevelIcon: true })
    };
  }
});