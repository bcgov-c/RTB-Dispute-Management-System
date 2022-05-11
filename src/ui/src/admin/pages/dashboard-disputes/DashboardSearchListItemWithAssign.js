import Radio from 'backbone.radio';
import SearchResult from '../../components/search/SearchResult';
import ModalAssignUser from '../../components/modals/modal-unassign-dispute/ModalAssignUser';

const modalChannel = Radio.channel('modals');
const configChannel = Radio.channel('config');

const getUnassignButtonHtml =  (fromUnassigned) => (`
<div class="assign-button-container clickable">
  <div class="dispute-assign-title">${fromUnassigned ? 'A' : 'Re-a'}ssign</div>
  <div class="dispute-assign-button"></div>
</div>`);

export default SearchResult.extend({
  ui() {
    return _.extend({}, SearchResult.prototype.ui, {
      unassign: '.assign-button-container',
    });
  },

  events() {
    return _.extend({}, SearchResult.prototype.events, {
      'click @ui.unassign': 'clickAssign'
    });
  },

  clickAssign() {
    let nextStage = null;
    let nextStatus = null;

    // Check if assigning user to this dispute wll move it into a new stage/status combination
    _.each(configChannel.request('get', 'assignment_rules'), function(status_obj) {
      if (Number(status_obj.current_stage) === this.model.get('stage') &&
        Number(status_obj.current_status) === this.model.get('status') &&
        Number(status_obj.current_process) === this.model.get('process')) {
        nextStage = Number(status_obj.nextStage);
        nextStatus = Number(status_obj.nextStatus);
      }
    }, this);

    modalChannel.request('add', new ModalAssignUser({
      model: this.model,
      nextStage: nextStage,
      nextStatus: nextStatus,
      fromUnassigned: this.fromUnassigned
    }));
  },

  initialize() {
    SearchResult.prototype.initialize.call(this, arguments);
    this.fromUnassigned = !this.model.get('owner');
  },

  onRender() {
    this.getUI('fileNumber').after( getUnassignButtonHtml(this.fromUnassigned) );
  }
});
