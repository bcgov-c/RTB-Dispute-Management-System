/**
 * @fileoverview - Modal for removing an associated dispute from a hearing
 */
import Marionette from 'backbone.marionette';
import Radio from 'backbone.radio';
import ModalDeleteHearingViewMixin from './ModalBaseDeleteHearingMixin';
import { generalErrorFactory } from '../../../../../core/components/api/ApiLayer';

const hearingChannel = Radio.channel('hearings');
const disputeChannel = Radio.channel('dispute');
const loaderChannel = Radio.channel('loader');

const ModalRemoveHearingDisputesView = Marionette.View.extend({
  id: 'removeHearingDisputes_modal',

  /**
   * @param {HearingModel} model
   */
  initialize() {
    this.isAdjourned = false;
    this.checkAdjourned();
  },

  checkAdjourned() {
    loaderChannel.trigger('page:load');
    hearingChannel.request('check:adjourned', this.model)
    .then(isAdjourned => {
      this.isAdjourned = isAdjourned;
    }).finally(() => {
      loaderChannel.trigger('page:load:complete');
      this.render();
    })
  },

  clickContinue() {
    const onClose = () => {
      // No need to refresh again, we already should have fetched the model by this point
      this.trigger('save:complete');
      this.close();
    };
    const showInvalidHearingStateModal = () => {
      this.$el.hide();
      hearingChannel.request('show:invalid:modal').finally(() => onClose());
    };
    const onStateCheckError = () => {
      // There was an API error, stop loading and close this modal
      this.trigger('save:complete');
      this.close();
      loaderChannel.trigger('page:load:complete');
    };

    this.model.withStateCheck(
      () => {
        if (!this.model.getDisputeHearings().length) {
          this.trigger('save:complete');
          this.close();
        }
        // If not on an active dispute, try to use the primary link's dispute_guid
        // NOTE: If the primary has changed, this may throw a 401 access error due to incorrect DisputeGuid
        const linkedDisputeGuid = disputeChannel.request('get:id') || this.model.getPrimaryDisputeHearing()?.get('dispute_guid');  
        this.model.deleteAllDisputeHearings().done(() => {
          const fileDescription = this.model.getHearingNoticeFileDescription();
          if (fileDescription) {
            fileDescription.markAsDeficient(`Hearing was removed from dispute file that this notice was generated for`);
            $.whenAll(fileDescription.save(fileDescription.getApiChangesOnly(), { headers: { DisputeGuid: linkedDisputeGuid }}), this.model.save({ notification_file_description_id: null }))
              .done(() => {
                this.trigger('save:complete');
                this.close();
              }).fail(err => {
                loaderChannel.trigger('page:load:complete');
                const handler = generalErrorFactory.createHandler('ADMIN.FILEDESCRIPTION.SAVE');
                handler(err);
              })
          } else {
            this.trigger('save:complete');
            this.close();
          }
          
        }).fail(err => {
          loaderChannel.trigger('page:load:complete');
          const handler = generalErrorFactory.createHandler('ADMIN.DISPUTEHEARINGS.DELETE');
          handler(err);
        });
      },
      showInvalidHearingStateModal.bind(this),
      onStateCheckError.bind(this)
    );
  },

  onRender() {
    this.mixin_onRender(this.isAdjourned);
  },

  templateContext() {
    const useSingular = this.model.getDisputeHearings().length === 1;
    return {
      titleText: `Remove Dispute${useSingular ? '' : 's'}`,
      instructionsText: `Are you sure you would like to remove ${useSingular ? 'the associated dispute' : 'all associated disputes'} from this hearing?  This action cannot be undone.`,
      continueButtonText: `Remove${useSingular ? '' : ' All'}`
    };
  }
});

_.extend(ModalRemoveHearingDisputesView.prototype, ModalDeleteHearingViewMixin);
export default ModalRemoveHearingDisputesView;