import Radio from 'backbone.radio';
import AvailableHearingListItemView from '../modal-add-hearing/AvailableHearingsListItem';
import ModalHearingRescheduleConfirmView from './ModalHearingRescheduleConfirm';

const hearingChannel = Radio.channel('hearings');
const modalChannel = Radio.channel('modals');
const loaderChannel = Radio.channel('loader');

export default AvailableHearingListItemView.extend({

  initialize(options) {
    this.mergeOptions(options, ['hearingModel', 'parentModalView', 'deleteAfterReschedule']);

    this.resultsCollection = this.model.collection;
    AvailableHearingListItemView.prototype.initialize.call(this, options);
  },

  clickSelect() {
    loaderChannel.trigger('page:load');
    const dfdHearingModel = $.Deferred();

    let warningModalBeingShown = false;
    const showInvalidHearingStateModal = () => {
      if (this.parentModalView) this.parentModalView.$el.hide();
      hearingChannel.request('show:invalid:modal').finally(() => {
        this.hearingModel.trigger('close:modal');
        this.hearingModel.trigger('hearings:refresh');
      });
    };

    this.hearingModel.withStateCheck(
      dfdHearingModel.resolve,
      () => {
        if (warningModalBeingShown) return;
        warningModalBeingShown = true;
        showInvalidHearingStateModal();
        // Don't resolve in this case, just handle in the warning modal
      },
      dfdHearingModel.reject
    );

    dfdHearingModel.done(() => {
      this.hearingModel.trigger('close:modal');
      const confirmationModal = new ModalHearingRescheduleConfirmView({ model: this.hearingModel, rescheduleHearingModel: this.model, deleteAfterReschedule: this.deleteAfterReschedule });
      modalChannel.request('add', confirmationModal);
      loaderChannel.trigger('page:load:complete');
    })
    .fail(() => this.hearingModel.trigger('hearings:refresh'));
  }

});